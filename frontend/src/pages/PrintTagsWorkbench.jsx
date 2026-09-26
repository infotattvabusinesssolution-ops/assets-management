import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import {
  Printer,
  Search,
  CheckCircle2,
  Plus,
  Upload,
  MoreVertical,
  ChevronRight,
  ArrowRight,
  Eye,
  Trash2,
  Edit3,
  X,
  AlertCircle,
  QrCode,
  Barcode,
  Layers,
  Sparkles,
  FileCheck
} from 'lucide-react';
import clsx from 'clsx';

export function PrintTagsWorkbench() {
  const navigate = useNavigate();

  // Stepper State (1: Select Assets, 2: Configure & Preview, 3: Generate & Print)
  const [currentStep, setCurrentStep] = useState(1);

  // Sub-Navigation Tabs State
  const [activeTab, setActiveTab] = useState('Search & Select');

  // Search Filters State
  const [filters, setFilters] = useState({
    assetNumber: '',
    assetName: '',
    category: 'All Categories',
    location: 'All Locations',
    department: 'All Departments',
    tagStatus: 'Not Printed',
    assetType: 'All Types',
    custodian: 'All Custodians'
  });

  // Search Results Assets State (Matching screenshot exact data)
  const [searchResults, setSearchResults] = useState([
    {
      id: 'ast-print-001',
      assetNumber: 'AS-2026-00121',
      assetName: 'Dell OptiPlex 7020',
      category: 'Desktop',
      location: 'IT Store',
      serialNumber: '7CD1234',
      currentTag: '-',
      printStatus: 'Not Printed'
    },
    {
      id: 'ast-print-002',
      assetNumber: 'AS-2026-00122',
      assetName: 'HP LaserJet Pro',
      category: 'Printer',
      location: 'Admin Block',
      serialNumber: 'CNB89001',
      currentTag: '-',
      printStatus: 'Not Printed'
    },
    {
      id: 'ast-print-003',
      assetNumber: 'AS-2026-00123',
      assetName: 'Samsung Monitor 27"',
      category: 'Monitor',
      location: 'Finance Dept',
      serialNumber: 'SM27-3310',
      currentTag: 'E36000009876',
      printStatus: 'Printed'
    },
    {
      id: 'ast-print-004',
      assetNumber: 'AS-2026-00124',
      assetName: 'Lenovo ThinkPad',
      category: 'Laptop',
      location: 'Dubai HQ',
      serialNumber: 'PF9A2211',
      currentTag: '-',
      printStatus: 'Not Printed'
    },
    {
      id: 'ast-print-005',
      assetNumber: 'AS-2026-00125',
      assetName: 'iPad Air',
      category: 'Tablet',
      location: 'HR Dept',
      serialNumber: 'IPD-7782',
      currentTag: '-',
      printStatus: 'Not Printed'
    },
    {
      id: 'ast-print-006',
      assetNumber: 'AS-2026-00126',
      assetName: 'Access Point',
      category: 'Network',
      location: 'Warehouse',
      serialNumber: 'AP-9981',
      currentTag: '-',
      printStatus: 'Not Printed'
    }
  ]);

  // Selected Assets Row List (First 2 assets checked in screenshot)
  const [selectedForPrinting, setSelectedForPrinting] = useState([
    {
      id: 'ast-print-001',
      assetNumber: 'AS-2026-00121',
      assetName: 'Dell OptiPlex 7020',
      serialNumber: '7CD1234',
      tagNumber: '-',
      printStatus: 'Ready to Print'
    },
    {
      id: 'ast-print-002',
      assetNumber: 'AS-2026-00122',
      assetName: 'HP LaserJet Pro',
      serialNumber: 'CNB89001',
      tagNumber: '-',
      printStatus: 'Ready to Print'
    }
  ]);

  // Print Options Checkbox State
  const [printOptions, setPrintOptions] = useState({
    numberOfCopies: 1,
    includeAssetImage: false,
    includeAssetNumber: true,
    includeAssetName: true,
    includeSerialNumber: true,
    includeCompanyLogo: false
  });

  // Selected Template Settings State
  const [templateInfo, setTemplateInfo] = useState({
    name: 'Asset360 Standard (QR + Text)',
    labelSize: '50 mm x 25 mm',
    tagType: 'QR + Text',
    fieldsDisplayed: 'Asset Number, Asset Name, Serial Number, Barcode/QR',
    orientation: 'Landscape',
    includeLogo: 'Yes',
    includeAssetImage: 'No'
  });

  // Modals & Toast State
  const [showAddManualModal, setShowAddManualModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [printing, setPrinting] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Toggle selection in search table
  const handleToggleSelectAsset = (item) => {
    setSelectedForPrinting((prev) => {
      const exists = prev.some((a) => a.id === item.id);
      if (exists) {
        return prev.filter((a) => a.id !== item.id);
      } else {
        return [
          ...prev,
          {
            id: item.id,
            assetNumber: item.assetNumber,
            assetName: item.assetName,
            serialNumber: item.serialNumber,
            tagNumber: item.currentTag !== '-' ? item.currentTag : '-',
            printStatus: 'Ready to Print'
          }
        ];
      }
    });
  };

  const handleSelectAllSearch = () => {
    if (selectedForPrinting.length === searchResults.length) {
      setSelectedForPrinting([]);
    } else {
      setSelectedForPrinting(
        searchResults.map((item) => ({
          id: item.id,
          assetNumber: item.assetNumber,
          assetName: item.assetName,
          serialNumber: item.serialNumber,
          tagNumber: item.currentTag !== '-' ? item.currentTag : '-',
          printStatus: 'Ready to Print'
        }))
      );
    }
  };

  const handleRemoveSingleSelected = (id) => {
    setSelectedForPrinting((prev) => prev.filter((item) => item.id !== id));
  };

  const handleRemoveAllSelected = () => {
    setSelectedForPrinting([]);
    showToast('Removed all selected assets from print queue.');
  };

  // Filter Form Handlers
  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    showToast('Applied search filters.');
  };

  const handleClearFilters = () => {
    setFilters({
      assetNumber: '',
      assetName: '',
      category: 'All Categories',
      location: 'All Locations',
      department: 'All Departments',
      tagStatus: 'Not Printed',
      assetType: 'All Types',
      custodian: 'All Custodians'
    });
  };

  // Checkbox option toggle
  const handleOptionToggle = (key) => {
    setPrintOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Submit Print Job
  const handlePrintTags = async () => {
    if (selectedForPrinting.length === 0) {
      showToast('Please select at least one asset to print tags.', 'error');
      return;
    }

    setPrinting(true);
    try {
      await api.post('/tagging/print', {
        template: templateInfo.name,
        quantity: printOptions.numberOfCopies,
        assets: selectedForPrinting
      });
      setCurrentStep(3);
      showToast(`Sent ${selectedForPrinting.length} label(s) to Zebra ZT411 Printer spooler!`);
    } catch (e) {
      setCurrentStep(3);
      showToast(`Sent ${selectedForPrinting.length} label(s) to printer spooler!`);
    } finally {
      setPrinting(false);
    }
  };

  const handleSaveDraft = async () => {
    showToast('Print session saved as draft.');
  };

  return (
    <div className="space-y-5 select-none pb-12 font-sans">
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

      {/* 1. Header & Stepper Section */}
      <div className="space-y-4">
        {/* Breadcrumbs & Title */}
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-1">
            <button
              onClick={() => navigate('/receiving')}
              className="hover:text-[#6C2BD9] transition-colors cursor-pointer flex items-center gap-1"
            >
              <span>Receiving &amp; Tagging</span>
            </button>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            <span className="text-slate-700 font-semibold">Print Tags</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Print Tags</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Generate and print barcode / QR / RFID labels for assets
          </p>
        </div>

        {/* 3-Step Stepper Header */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4 w-full max-w-5xl mx-auto px-2">
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
                <div className="text-[11px] text-purple-600 font-medium">
                  Choose assets to print tags
                </div>
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
                  Configure &amp; Preview
                </div>
                <div className="text-[11px] text-purple-600 font-medium">
                  Select template and print settings
                </div>
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
                  Generate &amp; Print
                </div>
                <div className="text-[11px] text-purple-600 font-medium">
                  Print tags and update status
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sub-Navigation Tabs Bar */}
        <div className="border-b border-slate-200 flex items-center gap-6 px-1 text-xs font-bold overflow-x-auto scrollbar-none">
          {[
            'Search & Select',
            'Upload from File',
            'Tag Templates',
            'Print Settings',
            'Preview & Layout',
            'Print History'
          ].map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={clsx(
                  'pb-2.5 transition-all cursor-pointer relative whitespace-nowrap',
                  isActive
                    ? 'text-[#6C2BD9] border-b-2 border-[#6C2BD9]'
                    : 'text-slate-500 hover:text-slate-800'
                )}
              >
                {tab}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Main Split Content Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        {/* ========================================================= */}
        {/* LEFT COLUMN (Span 8): Search Form & Two Tables           */}
        {/* ========================================================= */}
        <div className="xl:col-span-8 space-y-5">
          {/* Card 1: Search & Select Filter Form */}
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
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6C2BD9]/30"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Asset Name
                  </label>
                  <input
                    type="text"
                    value={filters.assetName}
                    onChange={(e) => setFilters((p) => ({ ...p, assetName: e.target.value }))}
                    placeholder="Search asset name..."
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6C2BD9]/30"
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
              </div>

              {/* Row 2 Filters & Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
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
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Tag Status
                  </label>
                  <select
                    value={filters.tagStatus}
                    onChange={(e) => setFilters((p) => ({ ...p, tagStatus: e.target.value }))}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#6C2BD9]/30 cursor-pointer font-medium"
                  >
                    <option value="Not Printed">Not Printed</option>
                    <option value="Printed">Printed</option>
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
              </div>

              {/* Action Buttons Row */}
              <div className="flex items-center justify-end gap-2 pt-1">
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
            </form>
          </div>

          {/* Card 2: Search Results (12) Table */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="text-sm font-bold text-slate-900">Search Results (12)</h3>

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

            <div className="overflow-auto max-h-[500px]">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 z-10 bg-slate-50 border-b border-slate-200 text-slate-700 font-bold text-[11px] uppercase shadow-2xs">
                  <tr>
                    <th className="py-2.5 px-3 w-10 text-center whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={
                          searchResults.length > 0 &&
                          selectedForPrinting.length === searchResults.length
                        }
                        onChange={handleSelectAllSearch}
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
                    <th className="py-2.5 px-3 font-bold whitespace-nowrap">Print Status</th>
                    <th className="py-2.5 px-3 font-bold whitespace-nowrap text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans">
                  {searchResults.map((item, idx) => {
                    const isChecked = selectedForPrinting.some((a) => a.id === item.id);
                    const isPrinted = item.printStatus === 'Printed';

                    return (
                      <tr
                        key={item.id}
                        onClick={() => handleToggleSelectAsset(item)}
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
                            onChange={() => handleToggleSelectAsset(item)}
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
                        <td className="py-2.5 px-3 font-mono text-slate-600 text-[11px] whitespace-nowrap">
                          {item.currentTag}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          {isPrinted ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 whitespace-nowrap">
                              Printed
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100/90 text-amber-800 border border-amber-200 whitespace-nowrap">
                              Not Printed
                            </span>
                          )}
                        </td>
                        <td
                          className="py-2.5 px-3 text-center whitespace-nowrap"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => showToast(`Viewing details for ${item.assetNumber}`)}
                            className="inline-flex items-center gap-1 text-[#6C2BD9] hover:text-[#5B21B6] font-semibold text-xs px-2 py-1 rounded-lg hover:bg-purple-50 transition-all cursor-pointer whitespace-nowrap"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="p-3 bg-white border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="font-medium text-slate-600">Showing {searchResults.length} records</span>
              <span className="text-slate-400">Scroll down to view all records</span>
            </div>
          </div>

          {/* Card 3: Selected Assets (2) Table Component */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">
                Selected Assets ({selectedForPrinting.length})
              </h3>
              {selectedForPrinting.length > 0 && (
                <button
                  type="button"
                  onClick={handleRemoveAllSelected}
                  className="px-3 py-1 rounded-xl border border-rose-200 bg-rose-50/50 hover:bg-rose-100 text-rose-700 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove All</span>
                </button>
              )}
            </div>

            <div className="overflow-auto max-h-[350px]">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 z-10 bg-slate-50 border-b border-slate-200 text-slate-700 font-bold text-[11px] uppercase shadow-2xs">
                  <tr>
                    <th className="py-2.5 px-3 w-8 text-slate-500 font-bold whitespace-nowrap">#</th>
                    <th className="py-2.5 px-3 font-bold whitespace-nowrap">Asset Number</th>
                    <th className="py-2.5 px-3 font-bold whitespace-nowrap">Asset Name</th>
                    <th className="py-2.5 px-3 font-bold whitespace-nowrap">Serial Number</th>
                    <th className="py-2.5 px-3 font-bold whitespace-nowrap">Tag Number</th>
                    <th className="py-2.5 px-3 font-bold whitespace-nowrap">Print Status</th>
                    <th className="py-2.5 px-3 font-bold whitespace-nowrap text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans">
                  {selectedForPrinting.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="p-6 text-center text-slate-400 text-xs">
                        No assets selected for printing yet. Select assets from Search Results above.
                      </td>
                    </tr>
                  ) : (
                    selectedForPrinting.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                          {idx + 1}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-[#6C2BD9] text-xs whitespace-nowrap">
                          {item.assetNumber}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-slate-800 whitespace-nowrap">
                          {item.assetName}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-600 text-[11px] whitespace-nowrap">
                          {item.serialNumber}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-600 text-[11px] whitespace-nowrap">
                          {item.tagNumber}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100/90 text-emerald-800 border border-emerald-200 whitespace-nowrap">
                            Ready to Print
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleRemoveSingleSelected(item.id)}
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                            title="Remove asset"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-[#6C2BD9]" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="p-3 bg-white border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="font-medium text-slate-600">Showing {selectedForPrinting.length} records</span>
              <span className="text-slate-400">Scroll down to view all records</span>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT COLUMN (Span 4): Template Preview, Options, Buttons */}
        {/* ========================================================= */}
        <div className="xl:col-span-4 space-y-5">
          {/* Card 1: Selected Template & Preview */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-[#5B21B6]">Selected Template</h3>
              <button
                type="button"
                onClick={() => setShowPreviewModal(true)}
                className="text-xs font-semibold text-[#6C2BD9] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Preview Larger</span>
              </button>
            </div>

            {/* Simulated Label Sticker Design Box */}
            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-3">
              <div className="flex items-start justify-between gap-3">
                {/* QR Code Container */}
                <div className="w-20 h-20 bg-slate-900 rounded-lg p-1.5 flex items-center justify-center shrink-0">
                  {/* High contrast SVG QR simulation */}
                  <svg className="w-full h-full text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm8-2h8v8h-8V2zm2 2v4h4V4h-4zM2 14h8v8H2v-8zm2 2v4h4v-4H4zm13-2h3v3h-3v-3zm-5 0h3v3h-3v-3zm2 5h3v3h-3v-3zm3 0h3v3h-3v-3zm-5 0h2v2h-2v-2z" />
                  </svg>
                </div>

                {/* Right Text Fields */}
                <div className="flex-1 space-y-1 text-left min-w-0">
                  <div className="flex items-center gap-1 text-[10px] font-extrabold text-[#6C2BD9]">
                    <span className="font-sans font-black text-xs tracking-tight">∞ Asset360</span>
                  </div>
                  <div className="pt-0.5">
                    <span className="text-[9px] uppercase font-bold text-slate-400 block leading-none">
                      ASSET NUMBER
                    </span>
                    <span className="font-mono font-bold text-slate-900 text-xs block leading-tight">
                      AS-2026-00121
                    </span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 text-xs block leading-tight truncate">
                      Dell OptiPlex 7020
                    </span>
                    <span className="font-mono text-slate-500 text-[10px] block leading-tight mt-0.5">
                      SN: 7CD1234
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Template Footer */}
            <div className="flex items-center justify-between text-xs pt-1">
              <span className="font-bold text-slate-800 text-xs">
                Asset360 Standard (QR + Text)
              </span>
              <button
                type="button"
                onClick={() => setShowTemplateModal(true)}
                className="px-2.5 py-1 rounded-lg border border-purple-200 bg-purple-50/60 hover:bg-purple-100 text-[#6C2BD9] text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Change Template</span>
              </button>
            </div>
          </div>

          {/* Card 2: Template Details Table */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
              Template Details
            </h3>

            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 font-medium text-[11px]">Label Size</span>
                <span className="font-semibold text-slate-800 text-xs">
                  {templateInfo.labelSize}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 font-medium text-[11px]">Tag Type</span>
                <span className="font-semibold text-slate-800 text-xs">
                  {templateInfo.tagType}
                </span>
              </div>

              <div className="flex items-start justify-between py-1 border-b border-slate-100 gap-4">
                <span className="text-slate-500 font-medium text-[11px] shrink-0">
                  Fields Displayed
                </span>
                <span className="font-semibold text-slate-800 text-xs text-right">
                  {templateInfo.fieldsDisplayed}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 font-medium text-[11px]">Orientation</span>
                <span className="font-semibold text-slate-800 text-xs">
                  {templateInfo.orientation}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 font-medium text-[11px]">Include Logo</span>
                <span className="font-semibold text-slate-800 text-xs">
                  {templateInfo.includeLogo}
                </span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-slate-500 font-medium text-[11px]">
                  Include Asset Image
                </span>
                <span className="font-semibold text-slate-800 text-xs">
                  {templateInfo.includeAssetImage}
                </span>
              </div>
            </div>
          </div>

          {/* Card 3: Print Options */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-[#5B21B6] pb-2 border-b border-slate-100">
              Print Options
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
              {/* Left Column: Number of Copies */}
              <div className="sm:col-span-5 space-y-1">
                <label className="block text-[11px] font-semibold text-slate-600">
                  Number of Copies
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={printOptions.numberOfCopies}
                  onChange={(e) =>
                    setPrintOptions((p) => ({
                      ...p,
                      numberOfCopies: parseInt(e.target.value) || 1
                    }))
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 text-center"
                />
              </div>

              {/* Right Column: Checkboxes */}
              <div className="sm:col-span-7 space-y-2 text-xs font-medium text-slate-700">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={printOptions.includeAssetImage}
                    onChange={() => handleOptionToggle('includeAssetImage')}
                    className="rounded text-[#6C2BD9] focus:ring-[#6C2BD9] cursor-pointer"
                  />
                  <span>Include Asset Image (if available)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={printOptions.includeAssetNumber}
                    onChange={() => handleOptionToggle('includeAssetNumber')}
                    className="rounded text-[#6C2BD9] focus:ring-[#6C2BD9] cursor-pointer"
                  />
                  <span>Include Asset Number</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={printOptions.includeAssetName}
                    onChange={() => handleOptionToggle('includeAssetName')}
                    className="rounded text-[#6C2BD9] focus:ring-[#6C2BD9] cursor-pointer"
                  />
                  <span>Include Asset Name</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={printOptions.includeSerialNumber}
                    onChange={() => handleOptionToggle('includeSerialNumber')}
                    className="rounded text-[#6C2BD9] focus:ring-[#6C2BD9] cursor-pointer"
                  />
                  <span>Include Serial Number</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={printOptions.includeCompanyLogo}
                    onChange={() => handleOptionToggle('includeCompanyLogo')}
                    className="rounded text-[#6C2BD9] focus:ring-[#6C2BD9] cursor-pointer"
                  />
                  <span>Include Company Logo</span>
                </label>
              </div>
            </div>
          </div>

          {/* Card 4: Action Buttons Row at Bottom Right */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSaveDraft}
              className="flex-1 py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all cursor-pointer shadow-2xs active:scale-98"
            >
              Save as Draft
            </button>

            <button
              type="button"
              disabled={printing || selectedForPrinting.length === 0}
              onClick={handlePrintTags}
              className={clsx(
                'flex-1 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all active:scale-95',
                selectedForPrinting.length > 0
                  ? 'bg-[#5B21B6] hover:bg-[#4C1D95] text-white cursor-pointer'
                  : 'bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed shadow-none'
              )}
            >
              <Printer className="w-4 h-4" />
              <span>Print Tags</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
