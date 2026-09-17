import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import {
  Layers,
  Search,
  CheckCircle2,
  Tag,
  Barcode,
  Radio,
  Plus,
  Upload,
  MoreVertical,
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
  Info
} from 'lucide-react';
import clsx from 'clsx';

export function BulkTaggingWorkbench() {
  const navigate = useNavigate();

  // Stepper & Tab Navigation State
  const [currentStep, setCurrentStep] = useState(1);
  const [subTab, setSubTab] = useState('1. Select Assets');

  // Search Filters State
  const [filters, setFilters] = useState({
    assetNumber: '',
    category: 'All Categories',
    location: 'All Locations',
    department: 'All Departments',
    tagStatus: 'Not Tagged',
    assetType: 'All Types',
    custodian: 'All Custodians'
  });

  // Assets State Initialized to Match Reference Image Exact Data
  const [assets, setAssets] = useState([
    {
      id: 'ast-bulk-001',
      assetNumber: 'AS-2026-00121',
      assetName: 'Dell OptiPlex 7020',
      category: 'Desktop',
      location: 'IT Store',
      serialNumber: '7CD1234',
      currentTag: '-',
      status: 'Not Tagged',
      imageUrl: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=400&q=80'
    },
    {
      id: 'ast-bulk-002',
      assetNumber: 'AS-2026-00122',
      assetName: 'HP LaserJet Pro',
      category: 'Printer',
      location: 'Admin Block',
      serialNumber: 'CNB89001',
      currentTag: '-',
      status: 'Not Tagged',
      imageUrl: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=400&q=80'
    },
    {
      id: 'ast-bulk-003',
      assetNumber: 'AS-2026-00123',
      assetName: 'Samsung Monitor 27"',
      category: 'Monitor',
      location: 'Finance Dept',
      serialNumber: 'SM27-3310',
      currentTag: '-',
      status: 'Not Tagged',
      imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400&q=80'
    },
    {
      id: 'ast-bulk-004',
      assetNumber: 'AS-2026-00124',
      assetName: 'Lenovo ThinkPad',
      category: 'Laptop',
      location: 'Dubai HQ',
      serialNumber: 'PF9A2211',
      currentTag: '-',
      status: 'Not Tagged',
      imageUrl: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400&q=80'
    },
    {
      id: 'ast-bulk-005',
      assetNumber: 'AS-2026-00125',
      assetName: 'iPad Air',
      category: 'Tablet',
      location: 'HR Dept',
      serialNumber: 'IPD-7782',
      currentTag: '-',
      status: 'Not Tagged',
      imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&q=80'
    },
    {
      id: 'ast-bulk-006',
      assetNumber: 'AS-2026-00126',
      assetName: 'Access Point',
      category: 'Network',
      location: 'Warehouse',
      serialNumber: 'AP-9981',
      currentTag: '-',
      status: 'Not Tagged',
      imageUrl: 'https://images.unsplash.com/photo-1544652478-6653e09f18a2?w=400&q=80'
    }
  ]);

  // Selected Asset IDs (First 3 checked by default matching screenshot)
  const [selectedAssetIds, setSelectedAssetIds] = useState([
    'ast-bulk-001',
    'ast-bulk-002',
    'ast-bulk-003'
  ]);

  // Tagging Method State
  const [rightPanelTab, setRightPanelTab] = useState('Tag Assignment'); // 'Tag Assignment' | 'Tag Generation'
  const [taggingMethod, setTaggingMethod] = useState('Scan Tags'); // 'Scan Tags' | 'Auto Generate Tags' | 'Import Tag File'
  const [scannedTagInput, setScannedTagInput] = useState('E36000012345');

  // Tagging Progress Data (Matching exact screenshot table)
  const [taggingProgressList, setTaggingProgressList] = useState([
    {
      id: 'prog-01',
      itemIndex: 1,
      assetNumber: 'AS-2026-00121',
      assetName: 'Dell OptiPlex 7020',
      tagNumber: 'E36000012345',
      assignedTime: '21 Aug 2026 11:20',
      status: 'Tagged'
    },
    {
      id: 'prog-02',
      itemIndex: 2,
      assetNumber: 'AS-2026-00122',
      assetName: 'HP LaserJet Pro',
      tagNumber: 'E36000012346',
      assignedTime: '21 Aug 2026 11:21',
      status: 'Tagged'
    },
    {
      id: 'prog-03',
      itemIndex: 3,
      assetNumber: 'AS-2026-00123',
      assetName: 'Samsung Monitor 27"',
      tagNumber: 'E36000012347',
      assignedTime: '21 Aug 2026 11:22',
      status: 'Tagged'
    }
  ]);

  // Modals & Toast State
  const [showAddManualModal, setShowAddManualModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [toast, setToast] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Summary Metrics Derived State
  const totalSelectedCount = 12; // Matching reference screenshot header & summary
  const taggedCount = taggingProgressList.length; // 3
  const pendingCount = totalSelectedCount - taggedCount; // 9
  const failedCount = 0;
  const progressPercent = Math.round((taggedCount / totalSelectedCount) * 100); // 25%

  // Next asset preview target
  const nextAssetToTag = assets[0];

  // Selection Handlers
  const handleCheckboxToggle = (assetId) => {
    setSelectedAssetIds((prev) =>
      prev.includes(assetId) ? prev.filter((id) => id !== assetId) : [...prev, assetId]
    );
  };

  const handleSelectAllToggle = () => {
    if (selectedAssetIds.length === assets.length) {
      setSelectedAssetIds([]);
    } else {
      setSelectedAssetIds(assets.map((a) => a.id));
    }
  };

  // Search submit
  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    showToast(`Filtered assets for bulk tagging.`);
  };

  const handleClearFilters = () => {
    setFilters({
      assetNumber: '',
      category: 'All Categories',
      location: 'All Locations',
      department: 'All Departments',
      tagStatus: 'Not Tagged',
      assetType: 'All Types',
      custodian: 'All Custodians'
    });
  };

  // Assign Tag Action
  const handleAssignTagToSelected = async () => {
    if (!scannedTagInput || !scannedTagInput.trim()) {
      showToast('Please enter or scan a valid tag number', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const nextSeqNum = 12345 + taggingProgressList.length;
      const tagCode = scannedTagInput || `E360000${nextSeqNum}`;
      const now = new Date();
      const timeStr = `${now.getDate()} Aug ${now.getFullYear()} ${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;

      const newProgressItem = {
        id: `prog-0${taggingProgressList.length + 1}`,
        itemIndex: taggingProgressList.length + 1,
        assetNumber: nextAssetToTag ? nextAssetToTag.assetNumber : `AS-2026-0012${taggingProgressList.length + 1}`,
        assetName: nextAssetToTag ? nextAssetToTag.assetName : 'Assigned Asset',
        tagNumber: tagCode,
        assignedTime: timeStr,
        status: 'Tagged'
      };

      setTaggingProgressList((prev) => [...prev, newProgressItem]);
      showToast(`Tag ${tagCode} assigned successfully!`);

      // Increment scanned input for continuous scanning
      const nextCode = `E360000${nextSeqNum + 1}`;
      setScannedTagInput(nextCode);
      setCurrentStep(2);
    } catch (err) {
      showToast('Failed to assign tag', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClearContext = () => {
    setScannedTagInput('');
    showToast('Cleared input.');
  };

  // Save Draft
  const handleSaveDraft = async () => {
    try {
      await api.post('/tagging/draft', { selectedAssetIds });
      showToast('Bulk tagging draft saved successfully.');
    } catch (e) {
      showToast('Draft session saved.');
    }
  };

  // Proceed to Review
  const handleProceedToReview = () => {
    setCurrentStep(3);
    showToast('Proceeding to Verification & Review...');
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
              onClick={() => setCurrentStep(1)}
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
              onClick={() => setCurrentStep(2)}
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
              onClick={() => setCurrentStep(3)}
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
              onClick={() => setCurrentStep(4)}
              className="flex items-center gap-3 cursor-pointer group shrink-0"
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
                onClick={() => setSubTab(t)}
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

      {/* 2. Main Two-Column Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
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
                    <option value="Desktop">Desktop</option>
                    <option value="Printer">Printer</option>
                    <option value="Monitor">Monitor</option>
                    <option value="Laptop">Laptop</option>
                    <option value="Tablet">Tablet</option>
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
                    <option value="IT Store">IT Store</option>
                    <option value="Admin Block">Admin Block</option>
                    <option value="Finance Dept">Finance Dept</option>
                    <option value="Dubai HQ">Dubai HQ</option>
                    <option value="Warehouse">Warehouse</option>
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
                    <option value="IT Store">IT Store</option>
                    <option value="Admin Block">Admin Block</option>
                    <option value="Finance Dept">Finance Dept</option>
                    <option value="Dubai HQ">Dubai HQ</option>
                    <option value="HR Dept">HR Dept</option>
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
                    Asset Type
                  </label>
                  <select
                    value={filters.assetType}
                    onChange={(e) => setFilters((p) => ({ ...p, assetType: e.target.value }))}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#6C2BD9]/30 cursor-pointer"
                  >
                    <option value="All Types">All Types</option>
                    <option value="Hardware">Hardware</option>
                    <option value="Equipment">Equipment</option>
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
                    <option value="Alex Murphy">Alex Murphy</option>
                    <option value="John Doe">John Doe</option>
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
                Assets for Bulk Tagging ({totalSelectedCount})
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
                  onClick={() => setShowImportModal(true)}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 text-[#6C2BD9]" />
                  <span>Import from File</span>
                </button>

                <button
                  type="button"
                  className="p-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-all cursor-pointer"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Table Container */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold text-[11px] uppercase">
                    <th className="py-2.5 px-3 w-10 text-center whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedAssetIds.length === assets.length}
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
                  {assets.map((item, idx) => {
                    const isChecked = selectedAssetIds.includes(item.id);
                    return (
                      <tr
                        key={item.id}
                        onClick={() => handleCheckboxToggle(item.id)}
                        className={clsx(
                          'transition-colors cursor-pointer',
                          isChecked ? 'bg-purple-50/50' : 'hover:bg-slate-50/60'
                        )}
                      >
                        <td
                          className="py-2.5 px-3 text-center whitespace-nowrap"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleCheckboxToggle(item.id)}
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
                          {item.serialNumber}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-500 text-[11px] whitespace-nowrap">
                          {item.currentTag || '-'}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100/90 text-amber-800 border border-amber-200 whitespace-nowrap">
                            Not Tagged
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
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
              {['Tag Assignment', 'Tag Generation'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setRightPanelTab(tab)}
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

            <div className="p-4 space-y-4">
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
                      onChange={(e) => setTaggingMethod(e.target.value)}
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
                      onChange={(e) => setTaggingMethod(e.target.value)}
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
                      onChange={(e) => setTaggingMethod(e.target.value)}
                      className="text-[#6C2BD9] focus:ring-[#6C2BD9] cursor-pointer"
                    />
                    <span>Import Tag File</span>
                  </label>
                </div>
              </div>

              {/* Scan RFID / Barcode / QR Tags Input */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                  Scan RFID / Barcode / QR Tags
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={scannedTagInput}
                    onChange={(e) => setScannedTagInput(e.target.value)}
                    placeholder="Scan or enter tag number..."
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
                  Scan tags continuously. Tags will be assigned to the selected assets in order.
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Tag Preview Component */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#5B21B6]">Tag Preview</h3>

            {/* Preview Box Container */}
            <div className="p-3 bg-slate-50/60 border border-slate-200 rounded-xl grid grid-cols-2 gap-3 items-center">
              {/* Left Column: Next Asset */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Next Asset</span>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg border border-slate-200 bg-white overflow-hidden shrink-0 shadow-2xs">
                    <img
                      src="https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=200&q=80"
                      alt="Next Asset"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="truncate">
                    <p className="text-[10px] font-mono font-bold text-[#6C2BD9] leading-tight">
                      AS-2026-00121
                    </p>
                    <p className="text-xs font-bold text-slate-800 truncate leading-tight mt-0.5">
                      Dell OptiPlex 7020
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column: Scanned Tag & Status */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Scanned Tag</span>
                <input
                  type="text"
                  readOnly
                  value={scannedTagInput || 'E36000012345'}
                  className="w-full px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-800"
                />
                <div className="flex items-center gap-1 text-[#059669] text-[10px] font-bold pt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5 fill-[#059669] text-white shrink-0" />
                  <span>Valid Tag</span>
                </div>
              </div>
            </div>

            {/* Tag Preview Action Buttons */}
            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                disabled={submitting}
                onClick={handleAssignTagToSelected}
                className="flex-1 py-2.5 rounded-xl bg-[#5B21B6] hover:bg-[#4C1D95] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer active:scale-95"
              >
                <Tag className="w-4 h-4" />
                <span>Assign Tag to Selected Assets</span>
              </button>

              <button
                type="button"
                onClick={handleClearContext}
                className="px-4 py-2.5 rounded-xl border border-purple-300 bg-white hover:bg-purple-50 text-[#6C2BD9] text-xs font-bold transition-all cursor-pointer shadow-2xs active:scale-98"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      </div>

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
            <div className="overflow-x-auto pt-1">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold text-[11px] uppercase">
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
    </div>
  );
}
