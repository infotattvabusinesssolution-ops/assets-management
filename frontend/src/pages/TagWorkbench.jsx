import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import {
  Search,
  Tag,
  Scan,
  Radio,
  Plus,
  Upload,
  CheckCircle2,
  Clock,
  AlertCircle,
  Settings,
  Printer,
  ChevronRight,
  Eye,
  Edit3,
  X,
  FileText,
  Download,
  Layers,
  ArrowRight,
  Check,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Barcode,
  QrCode,
  Sliders,
  Maximize2
} from 'lucide-react';
import clsx from 'clsx';

export function TagWorkbench() {
  const navigate = useNavigate();

  // -------------------------------------------------------------
  // Workflow Stepper State (1: Select Assets, 2: Tagging, 3: Verify & Update, 4: Complete)
  // -------------------------------------------------------------
  const [currentStep, setCurrentStep] = useState(1);

  // -------------------------------------------------------------
  // Data State
  // -------------------------------------------------------------
  const [assets, setAssets] = useState([]);
  const [recentTagged, setRecentTagged] = useState([]);
  const [selectedAssetIds, setSelectedAssetIds] = useState(['ast-tag-002']); // Default row 2 checked like screenshot
  const [activeAsset, setActiveAsset] = useState(null);
  const [summary, setSummary] = useState({
    selected: 6,
    tagged: 1,
    pending: 5,
    failed: 0
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  // -------------------------------------------------------------
  // Search & Filter State (2 rows of filters matching screenshot)
  // -------------------------------------------------------------
  const [filters, setFilters] = useState({
    assetNumber: '',
    assetName: '',
    serialNumber: '',
    category: 'All Categories',
    location: 'All Locations',
    department: 'All Departments',
    tagStatus: 'Not Tagged', // default in screenshot
    custodian: 'All Custodians',
    assetStatus: 'Active'
  });

  // -------------------------------------------------------------
  // Scan & Assign Tag Panel State
  // -------------------------------------------------------------
  const [activeTab, setActiveTab] = useState('scan'); // 'scan' | 'print'
  const [scannedSerialInput, setScannedSerialInput] = useState('');
  const [scannedTagInput, setScannedTagInput] = useState('E36000012345');
  const [tagValidation, setTagValidation] = useState({
    valid: true,
    status: 'Valid Tag / Ready to Assign',
    message: 'Tag ID verified and available for assignment.'
  });

  // -------------------------------------------------------------
  // Print Labels Panel State
  // -------------------------------------------------------------
  const [printConfig, setPrintConfig] = useState({
    template: 'STANDARD_2X1',
    printer: 'Zebra ZT411 RFID (Warehouse Dock 2)',
    scheme: 'AUTO_PREFIX_SEQ',
    prefix: 'E360000',
    quantity: 1
  });
  const [printSuccessModal, setPrintSuccessModal] = useState(null);

  // -------------------------------------------------------------
  // Modals State
  // -------------------------------------------------------------
  const [showAddManualModal, setShowAddManualModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [auditLogs, setAuditLogs] = useState([]);

  // Manual Asset Form
  const [manualForm, setManualForm] = useState({
    assetNumber: '',
    assetName: '',
    category: 'Desktop',
    location: 'Dubai HQ',
    department: 'IT Operations',
    serialNumber: '',
    custodian: 'John Doe'
  });

  // -------------------------------------------------------------
  // Toast Notification Helper
  // -------------------------------------------------------------
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // -------------------------------------------------------------
  // Load Initial Data from Backend
  // -------------------------------------------------------------
  const fetchTaggingData = async (customFilters = filters) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      Object.entries(customFilters).forEach(([key, val]) => {
        if (val && !val.startsWith('All')) {
          queryParams.append(key, val);
        }
      });

      const [assetsRes, recentRes, statsRes] = await Promise.allSettled([
        api.get(`/tagging/assets?${queryParams.toString()}`),
        api.get('/tagging/recent'),
        api.get('/tagging/stats')
      ]);

      if (assetsRes.status === 'fulfilled' && assetsRes.value?.success) {
        const list = assetsRes.value.assets || [];
        setAssets(list);
        if (assetsRes.value.summary) {
          setSummary(assetsRes.value.summary);
        }

        // Set active asset to Dell Latitude 7450 or the first eligible asset to match screenshot preview
        if (!activeAsset && list.length > 0) {
          const matchPreview = list.find(a => a.assetNumber === 'AS-2026-00125') || list[0];
          setActiveAsset(matchPreview);
        }
      }

      if (recentRes.status === 'fulfilled' && recentRes.value?.success) {
        setRecentTagged(recentRes.value.recent || []);
      }

      if (statsRes.status === 'fulfilled' && statsRes.value?.success) {
        setSummary(prev => ({ ...prev, ...statsRes.value.stats }));
      }
    } catch (err) {
      console.error('Error loading tagging data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTaggingData();
  }, []);

  // When active asset changes, auto-validate current tag
  useEffect(() => {
    if (activeAsset) {
      if (activeAsset.currentTag && activeAsset.currentTag !== '-') {
        setScannedTagInput(activeAsset.currentTag);
      }
      validateTagCode(scannedTagInput, activeAsset.id);
    }
  }, [activeAsset]);

  // -------------------------------------------------------------
  // Filter Handlers
  // -------------------------------------------------------------
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    fetchTaggingData(filters);
    setCurrentStep(1);
  };

  const handleClearFilters = () => {
    const reset = {
      assetNumber: '',
      assetName: '',
      serialNumber: '',
      category: 'All Categories',
      location: 'All Locations',
      department: 'All Departments',
      tagStatus: 'All Statuses',
      custodian: 'All Custodians',
      assetStatus: 'Active'
    };
    setFilters(reset);
    fetchTaggingData(reset);
  };

  // -------------------------------------------------------------
  // Tag Validation
  // -------------------------------------------------------------
  const validateTagCode = async (tagCode, assetId = activeAsset?.id) => {
    if (!tagCode || tagCode.trim() === '') {
      setTagValidation({
        valid: false,
        status: 'Awaiting Tag Scan',
        message: 'Please scan or enter a tag number.'
      });
      return;
    }

    try {
      const res = await api.post('/tagging/validate', {
        tagNumber: tagCode,
        currentAssetId: assetId
      });

      if (res && res.valid) {
        setTagValidation({
          valid: true,
          status: 'Valid Tag / Ready to Assign',
          message: res.message || 'Tag ID verified and available for assignment.'
        });
      } else {
        setTagValidation({
          valid: false,
          status: 'Tag Conflict',
          message: res?.message || 'Tag is already associated or invalid.'
        });
      }
    } catch (err) {
      setTagValidation({
        valid: false,
        status: 'Validation Error',
        message: err?.message || 'Error validating tag'
      });
    }
  };

  // -------------------------------------------------------------
  // Generate Tag Action
  // -------------------------------------------------------------
  const handleGenerateTag = async () => {
    try {
      const res = await api.post('/tagging/generate', { prefix: 'E360000' });
      if (res && res.success && res.tag) {
        const newCode = res.tag.tagNumber;
        setScannedTagInput(newCode);
        validateTagCode(newCode, activeAsset?.id);
        setCurrentStep(2);
        showToast(`Generated new Tag ID: ${newCode}`);
      }
    } catch (err) {
      // Fallback generator
      const randomSeq = Math.floor(10000 + Math.random() * 90000);
      const generated = `E360000${randomSeq}`;
      setScannedTagInput(generated);
      validateTagCode(generated, activeAsset?.id);
      setCurrentStep(2);
      showToast(`Generated new Tag ID: ${generated}`);
    }
  };

  // -------------------------------------------------------------
  // Simulated RFID Reader
  // -------------------------------------------------------------
  const handleReadFromRfidReader = () => {
    const randomSeq = Math.floor(10000 + Math.random() * 90000);
    const rfidTag = `E360000${randomSeq}`;
    setScannedTagInput(rfidTag);
    validateTagCode(rfidTag, activeAsset?.id);
    setCurrentStep(2);
    showToast(`RFID Reader captured EPC: E28011606000${randomSeq}`, 'success');
  };

  // -------------------------------------------------------------
  // Serial / Barcode Scanner Input Handler
  // -------------------------------------------------------------
  const handleSerialScanSubmit = (e) => {
    if (e) e.preventDefault();
    if (!scannedSerialInput.trim()) return;

    const term = scannedSerialInput.trim().toLowerCase();
    const matched = assets.find(
      a =>
        a.serialNumber.toLowerCase().includes(term) ||
        a.assetNumber.toLowerCase().includes(term)
    );

    if (matched) {
      setActiveAsset(matched);
      if (!selectedAssetIds.includes(matched.id)) {
        setSelectedAssetIds(prev => [...prev, matched.id]);
      }
      setCurrentStep(2);
      showToast(`Located Asset: ${matched.assetName} (${matched.assetNumber})`);
      setScannedSerialInput('');
    } else {
      showToast(`No asset found matching "${scannedSerialInput}"`, 'error');
    }
  };

  // -------------------------------------------------------------
  // Row Select / Tag Action
  // -------------------------------------------------------------
  const handleSelectAssetRow = (asset) => {
    setActiveAsset(asset);
    if (!selectedAssetIds.includes(asset.id)) {
      setSelectedAssetIds(prev => [...prev, asset.id]);
    }
    setCurrentStep(2);
  };

  const handleCheckboxToggle = (assetId) => {
    setSelectedAssetIds(prev => {
      const next = prev.includes(assetId)
        ? prev.filter(id => id !== assetId)
        : [...prev, assetId];
      return next;
    });
  };

  const handleSelectAllToggle = () => {
    if (selectedAssetIds.length === assets.length) {
      setSelectedAssetIds([]);
    } else {
      setSelectedAssetIds(assets.map(a => a.id));
    }
  };

  // -------------------------------------------------------------
  // Assign Tag Action
  // -------------------------------------------------------------
  const handleAssignTag = async () => {
    if (!activeAsset) {
      showToast('Please select an asset to assign tag', 'error');
      return;
    }

    if (!scannedTagInput || !tagValidation.valid) {
      showToast(tagValidation.message || 'Please provide a valid tag identifier', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/tagging/associate', {
        assetId: activeAsset.id,
        tagNumber: scannedTagInput,
        tagType: 'RFID_GEN2',
        reason: activeAsset.currentTag && activeAsset.currentTag !== '-' ? 'Tag Replacement' : 'Initial Tag Assignment'
      });

      if (res && res.success) {
        showToast(res.message || `Tag ${scannedTagInput} successfully assigned!`);
        setCurrentStep(3);

        // Update local asset list
        setAssets(prev =>
          prev.map(a =>
            a.id === activeAsset.id
              ? { ...a, currentTag: scannedTagInput, status: 'Tagged' }
              : a
          )
        );

        // Update active asset preview
        setActiveAsset(prev => ({
          ...prev,
          currentTag: scannedTagInput,
          status: 'Tagged'
        }));

        // Refresh recent tagged list & summary
        if (res.recentTagged) {
          setRecentTagged(res.recentTagged);
        } else {
          fetchTaggingData();
        }

        if (res.stats) {
          setSummary(res.stats);
        }
      } else {
        showToast(res?.message || 'Failed to assign tag', 'error');
      }
    } catch (err) {
      console.error('Assign error:', err);
      showToast(err?.message || 'Assignment failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // -------------------------------------------------------------
  // Clear Current Scanning Context
  // -------------------------------------------------------------
  const handleClearContext = () => {
    setScannedTagInput('');
    setScannedSerialInput('');
    setTagValidation({
      valid: false,
      status: 'Awaiting Tag Scan',
      message: 'Scanning context cleared.'
    });
    showToast('Scanning context reset.');
  };

  // -------------------------------------------------------------
  // Print Label Action (Isolated from Tag Assignment)
  // -------------------------------------------------------------
  const handlePrintLabel = async () => {
    setSubmitting(true);
    try {
      const res = await api.post('/tagging/print', {
        ...printConfig,
        assetDetails: activeAsset
      });

      if (res && res.success) {
        setPrintSuccessModal(res);
        showToast(`Transmitted ${printConfig.quantity} label(s) to ${printConfig.printer}`);
      }
    } catch (err) {
      showToast('Print request failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // -------------------------------------------------------------
  // Save as Draft
  // -------------------------------------------------------------
  const handleSaveDraft = async () => {
    try {
      const res = await api.post('/tagging/draft', {
        selectedAssetIds,
        notes: `Saved session with ${selectedAssetIds.length} assets`
      });
      if (res && res.success) {
        showToast('Tagging session saved as draft successfully');
      }
    } catch (err) {
      showToast('Failed to save draft', 'error');
    }
  };

  // -------------------------------------------------------------
  // Complete Tagging Action
  // -------------------------------------------------------------
  const handleCompleteTagging = async () => {
    try {
      const res = await api.post('/tagging/complete', { selectedAssetIds });
      if (res && res.success) {
        setCurrentStep(4);
        setShowCompleteModal(true);
        showToast('Tagging session completed successfully!');
      } else {
        showToast(res?.message || 'Validation checks failed before completion', 'error');
      }
    } catch (err) {
      showToast(err?.message || 'Failed to complete session', 'error');
    }
  };

  // -------------------------------------------------------------
  // Add Asset Manually
  // -------------------------------------------------------------
  const handleAddManualAssetSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/tagging/manual', manualForm);
      if (res && res.success) {
        showToast(`Asset "${res.asset.assetName}" added to workspace!`);
        setShowAddManualModal(false);
        setManualForm({
          assetNumber: '',
          assetName: '',
          category: 'Desktop',
          location: 'Dubai HQ',
          department: 'IT Operations',
          serialNumber: '',
          custodian: 'John Doe'
        });
        fetchTaggingData();
      }
    } catch (err) {
      showToast('Failed to add manual asset', 'error');
    }
  };

  // -------------------------------------------------------------
  // Audit Trail View
  // -------------------------------------------------------------
  const handleOpenAuditTrail = async () => {
    try {
      const res = await api.get('/tagging/audit');
      if (res && res.success) {
        setAuditLogs(res.history || []);
        setShowAuditModal(true);
      }
    } catch (err) {
      showToast('Failed to load audit history', 'error');
    }
  };

  return (
    <div className="space-y-5 select-none pb-12">
      {/* Toast Notification Banner */}
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

      {/* Screen Title & Stepper Header Area */}
      <div className="space-y-4">
        {/* Breadcrumb & Screen Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-1">
              <button
                onClick={() => navigate('/receiving')}
                className="hover:text-[#6C2BD9] transition-colors cursor-pointer flex items-center gap-1"
              >
                <span>Receiving & Tagging</span>
              </button>
              <ChevronRight className="w-3 h-3 text-slate-400" />
              <span className="text-slate-700 font-semibold">Tag Assets</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Tag Assets</span>
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Assign RFID / Barcode / QR tags to existing assets
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenAuditTrail}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-2 shadow-2xs transition-all cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#6C2BD9]" />
              <span>Audit History</span>
            </button>
            <button
              onClick={() => setShowSettingsModal(true)}
              className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 shadow-2xs transition-all cursor-pointer"
              title="Tagging Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 4-Step Stepper Component matching exact design */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
            {/* Step 1 */}
            <div
              onClick={() => setCurrentStep(1)}
              className={clsx(
                'flex items-center gap-3.5 p-2 rounded-xl transition-all cursor-pointer',
                currentStep === 1
                  ? 'bg-purple-50/60'
                  : 'hover:bg-slate-50'
              )}
            >
              <div
                className={clsx(
                  'w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 shadow-xs transition-all',
                  currentStep === 1
                    ? 'bg-[#1E1B4B] text-white ring-4 ring-indigo-100'
                    : currentStep > 1
                    ? 'bg-emerald-500 text-white'
                    : 'bg-indigo-50 text-[#6C2BD9] border border-indigo-200'
                )}
              >
                {currentStep > 1 ? <Check className="w-5 h-5" /> : '1'}
              </div>
              <div className="truncate">
                <p
                  className={clsx(
                    'text-xs font-bold leading-tight truncate',
                    currentStep === 1 ? 'text-slate-900' : 'text-slate-700'
                  )}
                >
                  Select Assets
                </p>
                <p className="text-[11px] text-slate-500 truncate">Search and select assets</p>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 ml-auto hidden lg:block" />
            </div>

            {/* Step 2 */}
            <div
              onClick={() => setCurrentStep(2)}
              className={clsx(
                'flex items-center gap-3.5 p-2 rounded-xl transition-all cursor-pointer',
                currentStep === 2
                  ? 'bg-purple-50/60'
                  : 'hover:bg-slate-50'
              )}
            >
              <div
                className={clsx(
                  'w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 shadow-xs transition-all',
                  currentStep === 2
                    ? 'bg-[#1E1B4B] text-white ring-4 ring-indigo-100'
                    : currentStep > 2
                    ? 'bg-emerald-500 text-white'
                    : 'bg-indigo-50 text-[#6C2BD9] border border-indigo-200'
                )}
              >
                {currentStep > 2 ? <Check className="w-5 h-5" /> : '2'}
              </div>
              <div className="truncate">
                <p
                  className={clsx(
                    'text-xs font-bold leading-tight truncate',
                    currentStep === 2 ? 'text-slate-900' : 'text-slate-700'
                  )}
                >
                  Tagging
                </p>
                <p className="text-[11px] text-slate-500 truncate">Scan / Print & Assign Tags</p>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 ml-auto hidden lg:block" />
            </div>

            {/* Step 3 */}
            <div
              onClick={() => setCurrentStep(3)}
              className={clsx(
                'flex items-center gap-3.5 p-2 rounded-xl transition-all cursor-pointer',
                currentStep === 3
                  ? 'bg-purple-50/60'
                  : 'hover:bg-slate-50'
              )}
            >
              <div
                className={clsx(
                  'w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 shadow-xs transition-all',
                  currentStep === 3
                    ? 'bg-[#1E1B4B] text-white ring-4 ring-indigo-100'
                    : currentStep > 3
                    ? 'bg-emerald-500 text-white'
                    : 'bg-indigo-50 text-[#6C2BD9] border border-indigo-200'
                )}
              >
                {currentStep > 3 ? <Check className="w-5 h-5" /> : '3'}
              </div>
              <div className="truncate">
                <p
                  className={clsx(
                    'text-xs font-bold leading-tight truncate',
                    currentStep === 3 ? 'text-slate-900' : 'text-slate-700'
                  )}
                >
                  Verify & Update
                </p>
                <p className="text-[11px] text-slate-500 truncate">Confirm asset details</p>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 ml-auto hidden lg:block" />
            </div>

            {/* Step 4 */}
            <div
              onClick={() => setCurrentStep(4)}
              className={clsx(
                'flex items-center gap-3.5 p-2 rounded-xl transition-all cursor-pointer',
                currentStep === 4
                  ? 'bg-purple-50/60'
                  : 'hover:bg-slate-50'
              )}
            >
              <div
                className={clsx(
                  'w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 shadow-xs transition-all',
                  currentStep === 4
                    ? 'bg-[#1E1B4B] text-white ring-4 ring-indigo-100'
                    : 'bg-indigo-50 text-[#6C2BD9] border border-indigo-200'
                )}
              >
                4
              </div>
              <div className="truncate">
                <p
                  className={clsx(
                    'text-xs font-bold leading-tight truncate',
                    currentStep === 4 ? 'text-slate-900' : 'text-slate-700'
                  )}
                >
                  Complete
                </p>
                <p className="text-[11px] text-slate-500 truncate">Save and finish</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search Assets Card Component matching exact design */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
          <Search className="w-4 h-4 text-[#6C2BD9]" />
          <h2 className="text-sm font-bold text-slate-800">Search Assets</h2>
        </div>

        <form onSubmit={handleSearchSubmit} className="space-y-4">
          {/* Row 1 of Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Asset Number
              </label>
              <input
                type="text"
                value={filters.assetNumber}
                onChange={(e) => handleFilterChange('assetNumber', e.target.value)}
                placeholder="Search asset number..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6C2BD9]/30 focus:border-[#6C2BD9] transition-all"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Asset Name
              </label>
              <input
                type="text"
                value={filters.assetName}
                onChange={(e) => handleFilterChange('assetName', e.target.value)}
                placeholder="Search asset name..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6C2BD9]/30 focus:border-[#6C2BD9] transition-all"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Serial Number
              </label>
              <input
                type="text"
                value={filters.serialNumber}
                onChange={(e) => handleFilterChange('serialNumber', e.target.value)}
                placeholder="Search serial number..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6C2BD9]/30 focus:border-[#6C2BD9] transition-all"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Department
              </label>
              <select
                value={filters.department}
                onChange={(e) => handleFilterChange('department', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#6C2BD9]/30 focus:border-[#6C2BD9] transition-all cursor-pointer"
              >
                <option value="All Departments">All Departments</option>
                <option value="IT Store">IT Store</option>
                <option value="Admin Block">Admin Block</option>
                <option value="Finance Dept">Finance Dept</option>
                <option value="Dubai HQ">Dubai HQ</option>
                <option value="HR Dept">HR Dept</option>
                <option value="Warehouse">Warehouse</option>
              </select>
            </div>
          </div>

          {/* Row 2 of Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#6C2BD9]/30 focus:border-[#6C2BD9] transition-all cursor-pointer"
              >
                <option value="All Categories">All Categories</option>
                <option value="Desktop">Desktop</option>
                <option value="Printer">Printer</option>
                <option value="Monitor">Monitor</option>
                <option value="Laptop">Laptop</option>
                <option value="Tablet">Tablet</option>
                <option value="Network">Network</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Location
              </label>
              <select
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#6C2BD9]/30 focus:border-[#6C2BD9] transition-all cursor-pointer"
              >
                <option value="All Locations">All Locations</option>
                <option value="IT Store">IT Store</option>
                <option value="Admin Block">Admin Block</option>
                <option value="Finance Dept">Finance Dept</option>
                <option value="Dubai HQ">Dubai HQ</option>
                <option value="HR Dept">HR Dept</option>
                <option value="Warehouse">Warehouse</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Tag Status
              </label>
              <select
                value={filters.tagStatus}
                onChange={(e) => handleFilterChange('tagStatus', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#6C2BD9]/30 focus:border-[#6C2BD9] transition-all cursor-pointer font-medium"
              >
                <option value="Not Tagged">Not Tagged</option>
                <option value="Tagged">Tagged</option>
                <option value="All Statuses">All Statuses</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Custodian
              </label>
              <select
                value={filters.custodian}
                onChange={(e) => handleFilterChange('custodian', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#6C2BD9]/30 focus:border-[#6C2BD9] transition-all cursor-pointer"
              >
                <option value="All Custodians">All Custodians</option>
                <option value="Alex Murphy">Alex Murphy</option>
                <option value="Sarah Connor">Sarah Connor</option>
                <option value="Michael Scott">Michael Scott</option>
                <option value="John Doe">John Doe</option>
                <option value="Elena Vance">Elena Vance</option>
                <option value="David Miller">David Miller</option>
              </select>
            </div>
          </div>

          {/* Row 3: Asset Status + Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-1">
            <div className="w-full sm:w-64">
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Asset Status
              </label>
              <select
                value={filters.assetStatus}
                onChange={(e) => handleFilterChange('assetStatus', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#6C2BD9]/30 focus:border-[#6C2BD9] transition-all cursor-pointer"
              >
                <option value="Active">Active</option>
                <option value="In Storage">In Storage</option>
                <option value="All">All</option>
              </select>
            </div>

            <div className="flex items-center gap-2.5 ml-auto self-end">
              <button
                type="button"
                onClick={handleClearFilters}
                className="px-5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-semibold shadow-2xs transition-all cursor-pointer active:scale-[0.98]"
              >
                Clear
              </button>
              <button
                type="submit"
                className="px-6 py-2 rounded-xl bg-[#1E1B4B] hover:bg-[#1E1B4B]/90 text-white text-xs font-semibold flex items-center gap-2 shadow-md shadow-indigo-950/20 transition-all cursor-pointer active:scale-[0.98]"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Search</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Main Split Layout: Left Column (Grids) & Right Column (Panels) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        {/* ========================================================= */}
        {/* LEFT COLUMN: Assets to Tag (6) & Recent Tagged Assets (5) */}
        {/* ========================================================= */}
        <div className="xl:col-span-8 space-y-5">
          {/* Card 1: Assets to Tag Grid */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">
                  Assets to Tag ({assets.length})
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAddManualModal(true)}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-[#6C2BD9]" />
                  <span>Add Manually</span>
                </button>
                <button
                  onClick={() => setShowImportModal(true)}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 text-[#6C2BD9]" />
                  <span>Import from File</span>
                </button>
              </div>
            </div>

            {/* Table Container */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold text-[11px]">
                    <th className="p-3 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={assets.length > 0 && selectedAssetIds.length === assets.length}
                        onChange={handleSelectAllToggle}
                        className="rounded text-[#6C2BD9] focus:ring-[#6C2BD9] cursor-pointer"
                      />
                    </th>
                    <th className="p-3 w-8 text-slate-500 font-semibold">#</th>
                    <th className="p-3 font-semibold">Asset Number</th>
                    <th className="p-3 font-semibold">Asset Name</th>
                    <th className="p-3 font-semibold">Category</th>
                    <th className="p-3 font-semibold">Location</th>
                    <th className="p-3 font-semibold">Serial Number</th>
                    <th className="p-3 font-semibold">Current Tag</th>
                    <th className="p-3 font-semibold">Status</th>
                    <th className="p-3 font-semibold text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {assets.length === 0 ? (
                    <tr>
                      <td colSpan="10" className="p-8 text-center text-slate-400">
                        No eligible assets found matching current criteria.
                      </td>
                    </tr>
                  ) : (
                    assets.map((item, idx) => {
                      const isSelected = selectedAssetIds.includes(item.id);
                      const isActive = activeAsset?.id === item.id;
                      const isTagged = item.status === 'Tagged';

                      return (
                        <tr
                          key={item.id}
                          onClick={() => handleSelectAssetRow(item)}
                          className={clsx(
                            'transition-colors cursor-pointer group',
                            isActive
                              ? 'bg-purple-50/70 border-l-4 border-l-[#6C2BD9]'
                              : isSelected
                              ? 'bg-slate-50/80'
                              : 'hover:bg-slate-50/60'
                          )}
                        >
                          <td
                            className="p-3 text-center"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCheckboxToggle(item.id);
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}}
                              className="rounded text-[#6C2BD9] focus:ring-[#6C2BD9] cursor-pointer"
                            />
                          </td>
                          <td className="p-3 text-slate-400 font-mono text-[11px]">{idx + 1}</td>
                          <td className="p-3 font-semibold text-slate-800 font-mono text-xs">
                            {item.assetNumber}
                          </td>
                          <td className="p-3 font-medium text-slate-800">{item.assetName}</td>
                          <td className="p-3 text-slate-600">{item.category}</td>
                          <td className="p-3 text-slate-600">{item.location}</td>
                          <td className="p-3 text-slate-600 font-mono text-[11px]">
                            {item.serialNumber}
                          </td>
                          <td className="p-3 font-mono text-slate-600 text-[11px]">
                            {item.currentTag || '-'}
                          </td>
                          <td className="p-3">
                            {isTagged ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100/80 text-emerald-800 border border-emerald-200">
                                Tagged
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100/80 text-amber-800 border border-amber-200">
                                Not Tagged
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                            {isTagged ? (
                              <button
                                onClick={() => handleSelectAssetRow(item)}
                                className="inline-flex items-center gap-1 text-[#6C2BD9] hover:text-[#5B21B6] font-semibold text-xs px-2 py-1 rounded-lg hover:bg-purple-50 transition-all cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>View</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => handleSelectAssetRow(item)}
                                className="inline-flex items-center gap-1 text-[#6C2BD9] hover:text-[#5B21B6] font-semibold text-xs px-2.5 py-1 rounded-lg hover:bg-purple-50 transition-all cursor-pointer"
                              >
                                <Tag className="w-3.5 h-3.5" />
                                <span>Tag</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Card 2: Recent Tagged Assets (5) */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">
                Recent Tagged Assets ({recentTagged.length})
              </h3>
              <button
                onClick={handleOpenAuditTrail}
                className="text-xs text-[#6C2BD9] hover:underline font-semibold cursor-pointer"
              >
                View Full Audit History
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold text-[11px]">
                    <th className="p-3 font-semibold">Time</th>
                    <th className="p-3 font-semibold">Asset Number</th>
                    <th className="p-3 font-semibold">Asset Name</th>
                    <th className="p-3 font-semibold">Serial Number</th>
                    <th className="p-3 font-semibold">Tag Number</th>
                    <th className="p-3 font-semibold">Tagged By</th>
                    <th className="p-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentTagged.slice(0, 5).map((entry) => (
                    <tr key={entry.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-3 text-slate-500 text-[11px] whitespace-nowrap">
                        {entry.time}
                      </td>
                      <td className="p-3 font-mono font-semibold text-slate-800 text-xs">
                        {entry.assetNumber}
                      </td>
                      <td className="p-3 font-medium text-slate-800">{entry.assetName}</td>
                      <td className="p-3 font-mono text-slate-600 text-[11px]">
                        {entry.serialNumber}
                      </td>
                      <td className="p-3 font-mono font-bold text-[#6C2BD9] text-xs">
                        {entry.tagNumber}
                      </td>
                      <td className="p-3 text-slate-700">{entry.taggedBy}</td>
                      <td className="p-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100/80 text-emerald-800 border border-emerald-200">
                          Tagged
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT COLUMN: Panels (Scan/Print, Preview, Summary)      */}
        {/* ========================================================= */}
        <div className="xl:col-span-4 space-y-5">
          {/* Card 1: Scan & Assign Tag / Print Labels */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
            {/* Header Tabs & Settings Gear */}
            <div className="flex items-center justify-between border-b border-slate-200 px-4 pt-2">
              <div className="flex items-center gap-6">
                <button
                  onClick={() => setActiveTab('scan')}
                  className={clsx(
                    'py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer',
                    activeTab === 'scan'
                      ? 'border-[#6C2BD9] text-[#6C2BD9]'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  )}
                >
                  Scan & Assign Tag
                </button>
                <button
                  onClick={() => setActiveTab('print')}
                  className={clsx(
                    'py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer',
                    activeTab === 'print'
                      ? 'border-[#6C2BD9] text-[#6C2BD9]'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  )}
                >
                  Print Labels
                </button>
              </div>

              <button
                onClick={() => setShowSettingsModal(true)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
                title="Tagging Settings"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>

            {/* Tab 1 Content: Scan & Assign Tag */}
            {activeTab === 'scan' && (
              <div className="p-4 space-y-4">
                {/* Field 1: Scan Asset Barcode / Serial No. */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                    Scan Asset Barcode / Serial No.
                  </label>
                  <form onSubmit={handleSerialScanSubmit} className="relative">
                    <input
                      type="text"
                      value={scannedSerialInput}
                      onChange={(e) => setScannedSerialInput(e.target.value)}
                      placeholder="Scan or enter serial number..."
                      className="w-full pl-3 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6C2BD9]/30 focus:border-[#6C2BD9] transition-all"
                    />
                    <button
                      type="submit"
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-[#6C2BD9] transition-colors cursor-pointer"
                      title="Search Asset by Serial"
                    >
                      <Barcode className="w-4 h-4 text-[#6C2BD9]" />
                    </button>
                  </form>
                </div>

                {/* OR Divider */}
                <div className="relative flex items-center justify-center my-2">
                  <div className="border-t border-slate-200 w-full"></div>
                  <span className="bg-white px-3 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    OR
                  </span>
                  <div className="border-t border-slate-200 w-full"></div>
                </div>

                {/* Field 2: Scan RFID / Barcode / QR Tag */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                    Scan RFID / Barcode / QR Tag
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={scannedTagInput}
                      onChange={(e) => {
                        setScannedTagInput(e.target.value);
                        validateTagCode(e.target.value, activeAsset?.id);
                      }}
                      placeholder="Scan or enter tag number..."
                      className="w-full pl-3 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6C2BD9]/30 focus:border-[#6C2BD9] transition-all"
                    />
                    <button
                      type="button"
                      onClick={handleReadFromRfidReader}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[#6C2BD9] hover:text-[#5B21B6] transition-colors cursor-pointer"
                      title="Trigger RFID Reader"
                    >
                      <Radio className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Action Buttons Row */}
                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={handleGenerateTag}
                    className="px-3 py-2 rounded-xl border border-indigo-200 bg-indigo-50/50 hover:bg-indigo-50 text-[#6C2BD9] text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs transition-all cursor-pointer active:scale-[0.98]"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Generate Tag Number</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleReadFromRfidReader}
                    className="px-3 py-2 rounded-xl border border-indigo-200 bg-indigo-50/50 hover:bg-indigo-50 text-[#6C2BD9] text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs transition-all cursor-pointer active:scale-[0.98]"
                  >
                    <Radio className="w-3.5 h-3.5" />
                    <span>Read from RFID Reader</span>
                  </button>
                </div>
              </div>
            )}

            {/* Tab 2 Content: Print Labels */}
            {activeTab === 'print' && (
              <div className="p-4 space-y-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Label Template
                  </label>
                  <select
                    value={printConfig.template}
                    onChange={(e) =>
                      setPrintConfig((prev) => ({ ...prev, template: e.target.value }))
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#6C2BD9]/30"
                  >
                    <option value="STANDARD_2X1">Standard 2"x1" Barcode (Code 128)</option>
                    <option value="ZEBRA_4X2">Zebra 4"x2" EPC Gen2 RFID Inlay</option>
                    <option value="QR_HIGH_DENSITY">High-Density QR Code Asset Label</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Target Printer
                  </label>
                  <select
                    value={printConfig.printer}
                    onChange={(e) =>
                      setPrintConfig((prev) => ({ ...prev, printer: e.target.value }))
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#6C2BD9]/30"
                  >
                    <option value="Zebra ZT411 RFID (Warehouse Dock 2)">
                      Zebra ZT411 RFID (Warehouse Dock 2)
                    </option>
                    <option value="TSC TX200 (IT Support Lab)">TSC TX200 (IT Support Lab)</option>
                    <option value="Brother TD-4550DNWB (Admin Floor 3)">
                      Brother TD-4550DNWB (Admin Floor 3)
                    </option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Prefix Scheme
                    </label>
                    <input
                      type="text"
                      value={printConfig.prefix}
                      onChange={(e) =>
                        setPrintConfig((prev) => ({ ...prev, prefix: e.target.value }))
                      }
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Quantity
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={printConfig.quantity}
                      onChange={(e) =>
                        setPrintConfig((prev) => ({
                          ...prev,
                          quantity: parseInt(e.target.value) || 1
                        }))
                      }
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                </div>

                {/* Info Alert: Printing does not assign tag */}
                <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200 text-[11px] text-amber-800 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    Note: Label printing is independent of tag assignment. Tag association is only
                    confirmed when "Assign Tag" is performed.
                  </span>
                </div>

                <button
                  type="button"
                  disabled={submitting}
                  onClick={handlePrintLabel}
                  className="w-full py-2.5 rounded-xl bg-[#6C2BD9] hover:bg-[#5B21B6] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-[#6C2BD9]/20 transition-all cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Label (Send to Spooler)</span>
                </button>
              </div>
            )}
          </div>

          {/* Card 2: Asset Preview Component matching exact design */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
              Asset Preview
            </h3>

            {activeAsset ? (
              <div className="space-y-4">
                {/* Visual Image & Details Row */}
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {/* Hardware Preview Graphic */}
                  <div className="w-32 h-24 sm:w-28 sm:h-24 rounded-xl border border-slate-200 bg-slate-900 overflow-hidden flex items-center justify-center shrink-0 shadow-inner relative group">
                    <img
                      src={
                        activeAsset.imageUrl ||
                        'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&q=80'
                      }
                      alt={activeAsset.assetName}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent"></div>
                    <span className="absolute bottom-1 left-2 text-[9px] font-mono text-white/80">
                      {activeAsset.category}
                    </span>
                  </div>

                  {/* Key-Value Details */}
                  <div className="flex-1 space-y-1 text-xs w-full">
                    <div className="flex justify-between py-0.5 border-b border-slate-100/60">
                      <span className="text-slate-500 font-medium">Asset Number</span>
                      <span className="font-bold text-slate-900 font-mono">
                        {activeAsset.assetNumber}
                      </span>
                    </div>
                    <div className="flex justify-between py-0.5 border-b border-slate-100/60">
                      <span className="text-slate-500 font-medium">Asset Name</span>
                      <span className="font-semibold text-slate-800">{activeAsset.assetName}</span>
                    </div>
                    <div className="flex justify-between py-0.5 border-b border-slate-100/60">
                      <span className="text-slate-500 font-medium">Category</span>
                      <span className="text-slate-700">{activeAsset.category}</span>
                    </div>
                    <div className="flex justify-between py-0.5 border-b border-slate-100/60">
                      <span className="text-slate-500 font-medium">Location</span>
                      <span className="text-slate-700">{activeAsset.location}</span>
                    </div>
                    <div className="flex justify-between py-0.5 border-b border-slate-100/60">
                      <span className="text-slate-500 font-medium">Serial Number</span>
                      <span className="font-mono text-slate-700">{activeAsset.serialNumber}</span>
                    </div>
                    <div className="flex justify-between py-0.5 border-b border-slate-100/60">
                      <span className="text-slate-500 font-medium">Current Tag</span>
                      <span className="font-mono text-slate-600">
                        {activeAsset.currentTag || '-'}
                      </span>
                    </div>
                    <div className="flex justify-between py-0.5 border-b border-slate-100/60">
                      <span className="text-slate-500 font-medium">New Tag</span>
                      <span className="font-mono font-bold text-emerald-600 text-xs">
                        {scannedTagInput || '-'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-slate-500 font-medium">Status</span>
                      <div className="flex items-center gap-1.5">
                        {tagValidation.valid ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              Ready to Assign
                            </span>
                          </>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                            {tagValidation.status}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleClearContext}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-bold transition-all cursor-pointer active:scale-[0.98]"
                  >
                    Clear
                  </button>
                  <button
                    type="button"
                    disabled={submitting || !tagValidation.valid}
                    onClick={handleAssignTag}
                    className={clsx(
                      'flex-2 py-2.5 rounded-xl text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98]',
                      tagValidation.valid
                        ? 'bg-[#1E1B4B] hover:bg-[#1E1B4B]/90 shadow-indigo-950/20 cursor-pointer'
                        : 'bg-slate-300 cursor-not-allowed shadow-none'
                    )}
                  >
                    <Tag className="w-4 h-4" />
                    <span>Assign Tag</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400 space-y-2">
                <Tag className="w-8 h-8 mx-auto text-slate-300" />
                <p className="text-xs">Select an asset from the table to preview details.</p>
              </div>
            )}
          </div>

          {/* Card 3: Tagging Summary Component matching exact design */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
              Tagging Summary
            </h3>

            {/* 4 Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {/* Card 1: Assets Selected */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col items-center justify-center text-center">
                <div className="w-8 h-8 rounded-full bg-[#1E1B4B] text-white flex items-center justify-center mb-1 shadow-2xs">
                  <Layers className="w-4 h-4" />
                </div>
                <p className="text-lg font-black text-slate-900 leading-tight">
                  {summary.selected}
                </p>
                <p className="text-[10px] text-slate-500 font-semibold leading-tight mt-0.5">
                  Assets Selected
                </p>
              </div>

              {/* Card 2: Tagged */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col items-center justify-center text-center">
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center mb-1 shadow-2xs">
                  <Check className="w-4 h-4" />
                </div>
                <p className="text-lg font-black text-slate-900 leading-tight">
                  {summary.tagged}
                </p>
                <p className="text-[10px] text-slate-500 font-semibold leading-tight mt-0.5">
                  Tagged
                </p>
              </div>

              {/* Card 3: Pending */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col items-center justify-center text-center">
                <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center mb-1 shadow-2xs">
                  <Clock className="w-4 h-4" />
                </div>
                <p className="text-lg font-black text-slate-900 leading-tight">
                  {summary.pending}
                </p>
                <p className="text-[10px] text-slate-500 font-semibold leading-tight mt-0.5">
                  Pending
                </p>
              </div>

              {/* Card 4: Failed */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col items-center justify-center text-center">
                <div className="w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center mb-1 shadow-2xs">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <p className="text-lg font-black text-slate-900 leading-tight">
                  {summary.failed}
                </p>
                <p className="text-[10px] text-slate-500 font-semibold leading-tight mt-0.5">
                  Failed
                </p>
              </div>
            </div>

            {/* Bottom Actions: Save as Draft & Complete Tagging */}
            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={handleSaveDraft}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all cursor-pointer active:scale-[0.98]"
              >
                Save as Draft
              </button>
              <button
                type="button"
                onClick={handleCompleteTagging}
                className="flex-1 py-2.5 rounded-xl bg-[#1E1B4B] hover:bg-[#1E1B4B]/90 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-indigo-950/20 transition-all cursor-pointer active:scale-[0.98]"
              >
                <span>Complete Tagging</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Screen Bottom Footer matching screenshot */}
      <footer className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        <p>© 2026 Asset360. All rights reserved.</p>
        <div className="flex items-center gap-4 text-slate-600 font-medium">
          <button
            onClick={() => navigate('/assets')}
            className="hover:text-[#6C2BD9] transition-colors cursor-pointer"
          >
            Assets
          </button>
          <span>|</span>
          <button
            onClick={() => navigate('/rtls')}
            className="hover:text-[#6C2BD9] transition-colors cursor-pointer"
          >
            Tracking
          </button>
          <span>|</span>
          <button
            onClick={() => navigate('/reports')}
            className="hover:text-[#6C2BD9] transition-colors cursor-pointer"
          >
            Reports
          </button>
          <span>|</span>
          <button
            onClick={() => showToast('Support ticket desk contacted')}
            className="hover:text-[#6C2BD9] transition-colors cursor-pointer"
          >
            Support
          </button>
        </div>
      </footer>

      {/* ========================================================= */}
      {/* MODAL 1: Add Manually Modal                                */}
      {/* ========================================================= */}
      {showAddManualModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#6C2BD9]" />
                <span>Add Asset to Tagging Preparation</span>
              </h3>
              <button
                onClick={() => setShowAddManualModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddManualAssetSubmit} className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Asset Number
                  </label>
                  <input
                    type="text"
                    required
                    value={manualForm.assetNumber}
                    onChange={(e) =>
                      setManualForm((p) => ({ ...p, assetNumber: e.target.value }))
                    }
                    placeholder="e.g. AS-2026-00127"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Serial Number
                  </label>
                  <input
                    type="text"
                    required
                    value={manualForm.serialNumber}
                    onChange={(e) =>
                      setManualForm((p) => ({ ...p, serialNumber: e.target.value }))
                    }
                    placeholder="e.g. SN-88992"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Asset Name</label>
                <input
                  type="text"
                  required
                  value={manualForm.assetName}
                  onChange={(e) => setManualForm((p) => ({ ...p, assetName: e.target.value }))}
                  placeholder="e.g. Cisco Meraki MX67 Router"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={manualForm.category}
                    onChange={(e) => setManualForm((p) => ({ ...p, category: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  >
                    <option value="Desktop">Desktop</option>
                    <option value="Laptop">Laptop</option>
                    <option value="Printer">Printer</option>
                    <option value="Monitor">Monitor</option>
                    <option value="Network">Network</option>
                    <option value="Tablet">Tablet</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Location</label>
                  <select
                    value={manualForm.location}
                    onChange={(e) => setManualForm((p) => ({ ...p, location: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  >
                    <option value="Dubai HQ">Dubai HQ</option>
                    <option value="IT Store">IT Store</option>
                    <option value="Admin Block">Admin Block</option>
                    <option value="Warehouse">Warehouse</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddManualModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#6C2BD9] hover:bg-[#5B21B6] text-white text-xs font-semibold shadow-md cursor-pointer"
                >
                  Add to Workspace
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: Import from File Modal                           */}
      {/* ========================================================= */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Upload className="w-4 h-4 text-[#6C2BD9]" />
                <span>Import Assets from File</span>
              </h3>
              <button
                onClick={() => setShowImportModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 pt-4">
              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:border-[#6C2BD9] transition-all bg-slate-50/50 cursor-pointer">
                <Upload className="w-8 h-8 text-[#6C2BD9] mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700">Drag and drop your CSV or Excel file</p>
                <p className="text-[11px] text-slate-400 mt-1">Supports .csv, .xlsx, .xls</p>
                <button
                  type="button"
                  onClick={() => {
                    showToast('Sample CSV batch imported: 2 assets staged.');
                    setShowImportModal(false);
                    fetchTaggingData();
                  }}
                  className="mt-3 px-4 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-semibold shadow-2xs hover:bg-slate-50 cursor-pointer"
                >
                  Select File from Computer
                </button>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                <span>Need formatting reference?</span>
                <button
                  type="button"
                  onClick={() => showToast('Template CSV downloaded')}
                  className="text-[#6C2BD9] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Sample Template</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: Complete Tagging Verification Modal              */}
      {/* ========================================================= */}
      {showCompleteModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <h3 className="text-base font-bold text-slate-900">Tagging Session Completed</h3>
            <p className="text-xs text-slate-600">
              Server-side validations passed. All asset-to-tag relationships, transaction logs, and
              audit trails have been permanently updated.
            </p>

            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 text-left space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Total Assets Processed:</span>
                <span className="font-bold text-slate-900">{summary.selected}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tagged Count:</span>
                <span className="font-bold text-emerald-600">{summary.tagged}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Pending Untagged:</span>
                <span className="font-bold text-amber-600">{summary.pending}</span>
              </div>
            </div>

            <button
              onClick={() => {
                setShowCompleteModal(false);
                fetchTaggingData();
              }}
              className="w-full py-2.5 rounded-xl bg-[#6C2BD9] hover:bg-[#5B21B6] text-white text-xs font-bold shadow-md cursor-pointer"
            >
              Done & Return to Workspace
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 4: Tagging Settings Modal                           */}
      {/* ========================================================= */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Settings className="w-4 h-4 text-[#6C2BD9]" />
                <span>Tagging Workspace Configuration</span>
              </h3>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Default Tag Numbering Prefix
                </label>
                <input
                  type="text"
                  value={printConfig.prefix}
                  onChange={(e) => setPrintConfig(p => ({ ...p, prefix: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  RFID Reader RF Power
                </label>
                <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl">
                  <option value="HIGH_27DBM">High (27 dBm - Long Range)</option>
                  <option value="MED_20DBM">Medium (20 dBm - Standard Workbench)</option>
                  <option value="LOW_14DBM">Low (14 dBm - Near-field Proximity)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Auto-Advance to Next Asset after Assign
                </label>
                <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl">
                  <option value="true">Enabled (Fast continuous tagging)</option>
                  <option value="false">Disabled (Manual confirmation)</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setShowSettingsModal(false)}
                className="px-4 py-2 rounded-xl bg-[#6C2BD9] text-white text-xs font-semibold shadow-md cursor-pointer"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 5: Audit Trail Modal                                */}
      {/* ========================================================= */}
      {showAuditModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#6C2BD9]" />
                <span>Tagging Audit & Compliance Trail</span>
              </h3>
              <button
                onClick={() => setShowAuditModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 text-xs">
              {auditLogs.length === 0 ? (
                <p className="py-6 text-center text-slate-400">No tagging audit events found.</p>
              ) : (
                auditLogs.map((log) => (
                  <div key={log.id} className="py-2.5 flex items-start justify-between gap-4">
                    <div>
                      <p className="font-bold text-slate-900">
                        {log.action} • {log.assetName || log.assetId}
                      </p>
                      <p className="text-[11px] text-slate-500 font-mono">
                        Tag: {log.tagId} {log.previousTag !== 'None' ? `(Replaced: ${log.previousTag})` : ''}
                      </p>
                      <p className="text-[10px] text-slate-400">By {log.user}</p>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono shrink-0">
                      {log.timeFormatted || log.timestamp}
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowAuditModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default TagWorkbench;
