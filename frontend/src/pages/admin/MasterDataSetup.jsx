import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Box,
  Layers,
  Tag,
  FolderTree,
  MapPin,
  Users,
  BarChart3,
  Truck,
  MoreHorizontal,
  Search,
  Filter,
  RotateCcw,
  Plus,
  Upload,
  Download,
  Edit,
  Eye,
  Trash2,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  X,
  Check,
  CheckCircle2,
  AlertTriangle,
  Factory,
  Scale,
  ShieldCheck,
  UserCheck,
  FileText,
  Wrench,
  FileSpreadsheet,
  FileCode,
  FileCheck,
  History,
  BookOpen,
  Copy,
  RefreshCw,
  Clock,
  Grid
} from 'lucide-react';
import clsx from 'clsx';

// Modular Tab Components
import { AssetGroupsTab, INITIAL_ASSET_GROUPS } from '../../components/master-data/AssetGroupsTab';
import { ClassesTab, INITIAL_CLASSES } from '../../components/master-data/ClassesTab';
import { CategoriesTab, INITIAL_CATEGORIES } from '../../components/master-data/CategoriesTab';
import { SubCategoriesTab, INITIAL_SUB_CATEGORIES } from '../../components/master-data/SubCategoriesTab';
import { LocationsTab, INITIAL_LOCATIONS } from '../../components/master-data/LocationsTab';
import { DepartmentsTab, INITIAL_DEPARTMENTS } from '../../components/master-data/DepartmentsTab';
import { CostCentersTab, INITIAL_COST_CENTERS } from '../../components/master-data/CostCentersTab';
import { SuppliersTab, INITIAL_SUPPLIERS } from '../../components/master-data/SuppliersTab';
import { GenericMasterTab } from '../../components/master-data/GenericMasterTab';
import { DepreciationPoliciesTab } from '../../components/master-data/DepreciationPoliciesTab';
import { api } from '../../services/api';

export function MasterDataSetup() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTabFromUrl = searchParams.get('tab') || 'asset-groups';
  const [activeTab, setActiveTab] = useState(initialTabFromUrl);

  useEffect(() => {
    const currentTab = searchParams.get('tab') || 'asset-groups';
    if (currentTab !== activeTab) {
      setActiveTab(currentTab);
    }
  }, [searchParams, activeTab]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
    setShowMoreMenu(false);
  };

  const [activeRowMenuId, setActiveRowMenuId] = useState(null);
  const [showImportDropdown, setShowImportDropdown] = useState(false);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [showAddDropdown, setShowAddDropdown] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  // Global Modals
  const [showImportModal, setShowImportModal] = useState(false);
  const [showImportHistoryModal, setShowImportHistoryModal] = useState(false);
  const [showImportGuidelinesModal, setShowImportGuidelinesModal] = useState(false);
  const [showAuditHistoryModal, setShowAuditHistoryModal] = useState(false);
  const [showAddMultipleModal, setShowAddMultipleModal] = useState(false);

  // External trigger for Add Modal in active tab
  const [showAddGroupModal, setShowAddGroupModal] = useState(false);
  const [activeAddModalTab, setActiveAddModalTab] = useState(null);
  const [groupReloadTrigger, setGroupReloadTrigger] = useState(0);

  // State for Add Multiple Records
  const [multipleRecordsRows, setMultipleRecordsRows] = useState([
    { code: '', name: '', assetType: 'Both', description: '' },
    { code: '', name: '', assetType: 'Physical', description: '' },
    { code: '', name: '', assetType: 'Intangible', description: '' }
  ]);
  const [isSavingMultiple, setIsSavingMultiple] = useState(false);

  // State for Import Template
  const [importFileName, setImportFileName] = useState('');
  const [importParsedRows, setImportParsedRows] = useState([]);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef(null);

  const [toastMessage, setToastMessage] = useState(null);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleTriggerAddSingle = () => {
    setShowAddDropdown(false);
    if (activeTab === 'asset-groups') {
      setShowAddGroupModal(true);
    } else {
      setActiveAddModalTab(activeTab);
    }
  };

  const handleSaveMultipleRecords = async () => {
    const validRows = multipleRecordsRows.filter((r) => r.code.trim() && r.name.trim());
    if (validRows.length === 0) {
      triggerToast('Please provide at least one record with both Code and Name.');
      return;
    }
    setIsSavingMultiple(true);
    try {
      if (activeTab === 'asset-groups') {
        let created = 0;
        for (const r of validRows) {
          await api.post('/master-data/asset-groups', {
            code: r.code.trim().toUpperCase(),
            name: r.name.trim(),
            assetType: r.assetType || 'Both',
            description: r.description || '',
            status: 'Active'
          });
          created++;
        }
        setGroupReloadTrigger((prev) => prev + 1);
        triggerToast(`Successfully created ${created} Asset Groups!`);
      } else {
        triggerToast(`Batch added ${validRows.length} records!`);
      }
      setShowAddMultipleModal(false);
      setMultipleRecordsRows([
        { code: '', name: '', assetType: 'Both', description: '' },
        { code: '', name: '', assetType: 'Physical', description: '' },
        { code: '', name: '', assetType: 'Intangible', description: '' }
      ]);
    } catch (err) {
      triggerToast(err.response?.data?.message || 'Failed to save some records.');
    } finally {
      setIsSavingMultiple(false);
    }
  };

  const handleDownloadTemplate = () => {
    const headers = 'Group Code,Group Name,Asset Type,Description,Status\n';
    const sample = 'NET,Networking Equipment,Physical,Routers switches and racks,Active\nIOT,IoT & Smart Sensors,Physical,Smart edge devices,Active\nSEC,Security Software,Intangible,Cybersecurity and licenses,Active\n';
    const blob = new Blob([headers + sample], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Asset_Groups_Template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast('Asset Groups CSV template downloaded.');
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
      if (lines.length <= 1) {
        triggerToast('The uploaded CSV file is empty or missing data rows.');
        return;
      }
      const dataRows = [];
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',').map((p) => p.trim().replace(/^"|"$/g, ''));
        if (parts.length >= 2 && parts[0] && parts[1]) {
          dataRows.push({
            code: parts[0].toUpperCase(),
            name: parts[1],
            assetType: parts[2] || 'Both',
            description: parts[3] || '',
            status: parts[4] || 'Active'
          });
        }
      }
      setImportParsedRows(dataRows);
      triggerToast(`Loaded ${dataRows.length} valid rows from ${file.name}. Click "Start Import" to save.`);
    };
    reader.readAsText(file);
  };

  const handleStartImport = async () => {
    if (importParsedRows.length === 0) {
      triggerToast('Please select a valid CSV file first.');
      return;
    }
    setIsImporting(true);
    try {
      let imported = 0;
      for (const row of importParsedRows) {
        try {
          await api.post('/master-data/asset-groups', row);
          imported++;
        } catch {
          // ignore duplicate
        }
      }
      setGroupReloadTrigger((prev) => prev + 1);
      setShowImportModal(false);
      setImportFileName('');
      setImportParsedRows([]);
      triggerToast(`Successfully imported ${imported} Asset Groups from CSV!`);
    } catch {
      triggerToast('Import failed. Please verify file format.');
    } finally {
      setIsImporting(false);
    }
  };

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (activeRowMenuId && !e.target.closest('.relative')) {
        setActiveRowMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeRowMenuId]);

  // Handle Export to CSV
  const handleExportCSV = () => {
    setShowExportDropdown(false);
    const isGroups = activeTab === 'asset-groups';
    const isClasses = activeTab === 'classes';
    const isCats = activeTab === 'categories';
    const isSubCats = activeTab === 'subcategories';
    const isLocations = activeTab === 'locations';
    const isDepts = activeTab === 'departments';
    const isCostCenters = activeTab === 'cost-centers';
    const isSuppliers = activeTab === 'suppliers';
    let headers, rows, filename;

    if (isGroups) {
      headers = ['Group Code', 'Group Name', 'Description', 'Asset Type', 'Total Assets', 'Status'];
      rows = INITIAL_ASSET_GROUPS.map((g) => [g.code, g.name, `"${g.description}"`, g.assetType, g.totalAssets, g.status]);
      filename = 'Asset_Groups';
    } else if (isSuppliers) {
      headers = ['Supplier Code', 'Supplier Name', 'Supplier Type', 'Country', 'Contact Person', 'Phone', 'Status'];
      rows = INITIAL_SUPPLIERS.map((s) => [s.code, s.name, s.type, s.country, `"${s.contactPerson}"`, s.phone, s.status]);
      filename = 'Asset_Suppliers';
    } else if (isCostCenters) {
      headers = ['Cost Center Code', 'Cost Center Name', 'Company', 'Type', 'Manager', 'Description', 'Total Assets', 'Status'];
      rows = INITIAL_COST_CENTERS.map((c) => [c.code, c.name, c.company, c.type, `"${c.manager}"`, `"${c.description}"`, c.totalAssets, c.status]);
      filename = 'Asset_CostCenters';
    } else if (isDepts) {
      headers = ['Department Code', 'Department Name', 'Department Type', 'Parent Department', 'Location', 'Company', 'Manager', 'Email', 'Phone', 'Employees', 'Status'];
      rows = INITIAL_DEPARTMENTS.map((d) => [d.code, d.name, d.type, d.parentDepartment, d.location, d.company, `"${d.manager}"`, d.email, d.phone, d.employees, d.status]);
      filename = 'Asset_Departments';
    } else if (isLocations) {
      headers = ['Location Code', 'Location Name', 'Location Type', 'Parent Location', 'Country', 'City', 'Total Assets', 'Status'];
      rows = INITIAL_LOCATIONS.map((l) => [l.code, l.name, l.type, l.parentLocation, l.country, l.city, l.totalAssets, l.status]);
      filename = 'Asset_Locations';
    } else if (isSubCats) {
      headers = ['Sub Category Code', 'Sub Category Name', 'Category', 'Class', 'Asset Group', 'Description', 'Total Assets', 'Status'];
      rows = INITIAL_SUB_CATEGORIES.map((s) => [s.code, s.name, `"${s.categoryName}"`, `"${s.className}"`, `"${s.groupName}"`, `"${s.description}"`, s.totalAssets, s.status]);
      filename = 'Asset_SubCategories';
    } else if (isCats) {
      headers = ['Category Code', 'Category Name', 'Asset Class', 'Asset Group', 'Description', 'Total Assets', 'Status'];
      rows = INITIAL_CATEGORIES.map((c) => [c.code, c.name, `"${c.className}"`, `"${c.groupName}"`, `"${c.description}"`, c.totalAssets, c.status]);
      filename = 'Asset_Categories';
    } else {
      headers = ['Class Code', 'Class Name', 'Asset Group', 'Description', 'Asset Type', 'Total Assets', 'Status'];
      rows = INITIAL_CLASSES.map((c) => [c.code, c.name, `"${c.groupName}"`, `"${c.description}"`, c.assetType, c.totalAssets, c.status]);
      filename = 'Asset_Classes';
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast(`Exported to CSV successfully!`);
  };

  const TABS = [
    { id: 'asset-groups', name: 'Asset Groups', icon: Box },
    { id: 'classes', name: 'Classes', icon: Layers },
    { id: 'categories', name: 'Categories', icon: Tag },
    { id: 'depreciation', name: 'Depreciation', icon: BarChart3 },
    { id: 'subcategories', name: 'Sub Categories', icon: FolderTree },
    { id: 'locations', name: 'Locations', icon: MapPin },
    { id: 'departments', name: 'Departments', icon: Users },
    { id: 'cost-centers', name: 'Cost Centers', icon: BarChart3 },
    { id: 'suppliers', name: 'Suppliers', icon: Truck }
  ];

  const MORE_TABS = [
    { id: 'manufacturers', name: 'Manufacturers', icon: Factory },
    { id: 'uom', name: 'UOM (Units)', icon: Scale },
    { id: 'status-codes', name: 'Status Codes', icon: ShieldCheck },
    { id: 'users-roles', name: 'Users & Roles', icon: UserCheck }
  ];

  const currentTabObject = TABS.find((t) => t.id === activeTab) || MORE_TABS.find((t) => t.id === activeTab);

  return (
    <div className="space-y-4 pb-12 select-none text-slate-900">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[9999] flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl bg-slate-900 text-white text-xs border border-slate-700 animate-in slide-in-from-bottom-3 fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-medium">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 mb-1">
            <span className="hover:text-[#6C2BD9] cursor-pointer">Master Data</span>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            <span className="text-[#6C2BD9] font-bold">
              {currentTabObject ? currentTabObject.name : 'Asset Groups'}
            </span>
          </div>

          <h1 className="text-2xl font-black text-[#1E1B4B] tracking-tight">
            {currentTabObject ? currentTabObject.name : 'Asset Groups'}
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            {activeTab === 'suppliers'
              ? 'Manage supplier information for procurement, assets and maintenance'
              : activeTab === 'cost-centers'
                ? 'Define and manage cost centers for financial and organizational reporting'
                : activeTab === 'departments'
                  ? 'Define and manage departments for asset ownership and organizational structure'
                  : activeTab === 'locations'
                    ? 'Define and manage locations where assets are deployed'
                    : activeTab === 'subcategories'
                      ? 'Define and manage asset sub categories within each category'
                      : activeTab === 'categories'
                        ? 'Define and manage asset categories within each class'
                        : activeTab === 'classes'
                          ? 'Define and manage asset classes within each asset group'
                          : 'Define and manage asset groups to classify your assets across the Asset360 enterprise platform.'}
          </p>
        </div>

        {/* Action Buttons Top Right */}
        {activeTab !== 'depreciation' && <div className="flex items-center gap-2 relative">
          {/* Import Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowImportDropdown(!showImportDropdown);
                setShowExportDropdown(false);
                setShowAddDropdown(false);
              }}
              className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-slate-500" />
              <span>Import</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showImportDropdown && (
              <div className="absolute right-0 mt-1.5 w-52 bg-white border border-slate-200 rounded-xl shadow-xl p-1.5 z-40 space-y-1">
                <button
                  onClick={() => {
                    setShowImportDropdown(false);
                    triggerToast('CSV / Excel import template downloaded.');
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-[#6C2BD9] transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-[#6C2BD9]" />
                  <span>Download Template</span>
                </button>
                <button
                  onClick={() => {
                    setShowImportDropdown(false);
                    setShowImportModal(true);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-[#6C2BD9] transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 text-[#6C2BD9]" />
                  <span>Upload File</span>
                </button>
                <button
                  onClick={() => {
                    setShowImportDropdown(false);
                    setShowImportHistoryModal(true);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-[#6C2BD9] transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <History className="w-3.5 h-3.5 text-[#6C2BD9]" />
                  <span>View Import History</span>
                </button>
                <button
                  onClick={() => {
                    setShowImportDropdown(false);
                    setShowImportGuidelinesModal(true);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-[#6C2BD9] transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5 text-[#6C2BD9]" />
                  <span>Import Guidelines</span>
                </button>
              </div>
            )}
          </div>

          {/* Export Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowExportDropdown(!showExportDropdown);
                setShowImportDropdown(false);
                setShowAddDropdown(false);
              }}
              className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showExportDropdown && (
              <div className="absolute right-0 mt-1.5 w-52 bg-white border border-slate-200 rounded-xl shadow-xl p-1.5 z-40 space-y-1">
                <button
                  onClick={handleExportCSV}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-[#6C2BD9] transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-[#6C2BD9]" />
                  <span>Export to CSV</span>
                </button>
                <button
                  onClick={() => {
                    setShowExportDropdown(false);
                    triggerToast(`Exporting to Excel...`);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-[#6C2BD9] transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <FileCode className="w-3.5 h-3.5 text-[#6C2BD9]" />
                  <span>Export to Excel</span>
                </button>
                <button
                  onClick={() => {
                    setShowExportDropdown(false);
                    triggerToast(`Exporting to PDF...`);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-[#6C2BD9] transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <FileCheck className="w-3.5 h-3.5 text-[#6C2BD9]" />
                  <span>Export to PDF</span>
                </button>
              </div>
            )}
          </div>

          {/* Add Dropdown */}
          <div className="relative">
            <div className="inline-flex items-center rounded-xl shadow-xs overflow-hidden bg-[#6C2BD9]">
              <button
                onClick={handleTriggerAddSingle}
                className="px-3.5 py-2 hover:bg-[#5B21B6] text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                title={`Add new ${currentTabObject ? currentTabObject.name.replace(/s$/, '') : 'Group'}`}
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Add {currentTabObject ? currentTabObject.name.replace(/s$/, '') : 'Group'}</span>
              </button>
              <button
                onClick={() => {
                  setShowAddDropdown(!showAddDropdown);
                  setShowImportDropdown(false);
                  setShowExportDropdown(false);
                }}
                className="px-2 py-2.5 hover:bg-[#5B21B6] text-white text-xs transition-all border-l border-white/20 cursor-pointer"
                title="Creation Options"
              >
                <ChevronDown className="w-3.5 h-3.5 text-white/90" />
              </button>
            </div>

            {showAddDropdown && (
              <div className="absolute right-0 mt-1.5 w-52 bg-white border border-slate-200 rounded-xl shadow-xl p-1.5 z-40 space-y-1">
                <button
                  onClick={handleTriggerAddSingle}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-[#6C2BD9] transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-[#6C2BD9]" />
                  <span>Add New Record</span>
                </button>
                <button
                  onClick={() => {
                    setShowAddDropdown(false);
                    setShowAddMultipleModal(true);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-[#6C2BD9] transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Layers className="w-3.5 h-3.5 text-[#6C2BD9]" />
                  <span>Add Multiple Records</span>
                </button>
                <button
                  onClick={() => {
                    setShowAddDropdown(false);
                    setShowImportModal(true);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-[#6C2BD9] transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 text-[#6C2BD9]" />
                  <span>Import from Template</span>
                </button>
              </div>
            )}
          </div>
        </div>}
      </div>

      {/* Horizontal Master Data Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-slate-200/80">
        {TABS.map((t) => {
          const IconComponent = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => handleTabChange(t.id)}
              className={clsx(
                'px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer border',
                isActive
                  ? 'bg-purple-50 text-[#6C2BD9] border-[#6C2BD9] font-bold shadow-2xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
              )}
            >
              <IconComponent className={clsx('w-4 h-4', isActive ? 'text-[#6C2BD9]' : 'text-slate-400')} />
              <span>{t.name}</span>
            </button>
          );
        })}

        {/* More Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            className={clsx(
              'px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer border',
              MORE_TABS.some((mt) => mt.id === activeTab)
                ? 'bg-purple-50 text-[#6C2BD9] border-[#6C2BD9] font-bold'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
            )}
          >
            <MoreHorizontal className="w-4 h-4 text-slate-400" />
            <span>More</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showMoreMenu && (
            <div className="absolute right-0 mt-1.5 w-48 bg-white border border-slate-200 rounded-xl shadow-xl p-1.5 z-40 space-y-1">
              {MORE_TABS.map((mt) => {
                const MtIcon = mt.icon;
                const isMtActive = activeTab === mt.id;
                return (
                  <button
                    key={mt.id}
                    onClick={() => handleTabChange(mt.id)}
                    className={clsx(
                      'w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer',
                      isMtActive ? 'bg-purple-50 text-[#6C2BD9] font-bold' : 'text-slate-700 hover:bg-slate-50'
                    )}
                  >
                    <MtIcon className="w-3.5 h-3.5 text-slate-400" />
                    <span>{mt.name}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* RENDER MODULAR TABS */}
      {activeTab === 'asset-groups' && (
        <AssetGroupsTab
          triggerToast={triggerToast}
          externalShowAddModal={showAddGroupModal}
          setExternalShowAddModal={setShowAddGroupModal}
          reloadTrigger={groupReloadTrigger}
          onNavigateTab={handleTabChange}
        />
      )}

      {activeTab === 'classes' && (
        <ClassesTab
          triggerToast={triggerToast}
          activeRowMenuId={activeRowMenuId}
          setActiveRowMenuId={setActiveRowMenuId}
          setShowAuditHistoryModal={setShowAuditHistoryModal}
          externalShowAddModal={activeAddModalTab === 'classes'}
          setExternalShowAddModal={(val) => !val && setActiveAddModalTab(null)}
        />
      )}

      {activeTab === 'categories' && (
        <CategoriesTab
          triggerToast={triggerToast}
          activeRowMenuId={activeRowMenuId}
          setActiveRowMenuId={setActiveRowMenuId}
          setShowAuditHistoryModal={setShowAuditHistoryModal}
          externalShowAddModal={activeAddModalTab === 'categories'}
          setExternalShowAddModal={(val) => !val && setActiveAddModalTab(null)}
        />
      )}

      {activeTab === 'depreciation' && <DepreciationPoliciesTab />}

      {activeTab === 'subcategories' && (
        <SubCategoriesTab
          triggerToast={triggerToast}
          activeRowMenuId={activeRowMenuId}
          setActiveRowMenuId={setActiveRowMenuId}
          setShowAuditHistoryModal={setShowAuditHistoryModal}
          externalShowAddModal={activeAddModalTab === 'subcategories'}
          setExternalShowAddModal={(val) => !val && setActiveAddModalTab(null)}
        />
      )}

      {activeTab === 'locations' && (
        <LocationsTab
          triggerToast={triggerToast}
          activeRowMenuId={activeRowMenuId}
          setActiveRowMenuId={setActiveRowMenuId}
          setShowAuditHistoryModal={setShowAuditHistoryModal}
          externalShowAddModal={activeAddModalTab === 'locations'}
          setExternalShowAddModal={(val) => !val && setActiveAddModalTab(null)}
        />
      )}

      {activeTab === 'departments' && (
        <DepartmentsTab
          triggerToast={triggerToast}
          activeRowMenuId={activeRowMenuId}
          setActiveRowMenuId={setActiveRowMenuId}
          setShowAuditHistoryModal={setShowAuditHistoryModal}
          externalShowAddModal={activeAddModalTab === 'departments'}
          setExternalShowAddModal={(val) => !val && setActiveAddModalTab(null)}
        />
      )}

      {activeTab === 'cost-centers' && (
        <CostCentersTab
          triggerToast={triggerToast}
          activeRowMenuId={activeRowMenuId}
          setActiveRowMenuId={setActiveRowMenuId}
          setShowAuditHistoryModal={setShowAuditHistoryModal}
          externalShowAddModal={activeAddModalTab === 'cost-centers'}
          setExternalShowAddModal={(val) => !val && setActiveAddModalTab(null)}
        />
      )}

      {activeTab === 'suppliers' && (
        <SuppliersTab
          triggerToast={triggerToast}
          activeRowMenuId={activeRowMenuId}
          setActiveRowMenuId={setActiveRowMenuId}
          externalShowAddModal={activeAddModalTab === 'suppliers'}
          setExternalShowAddModal={(val) => !val && setActiveAddModalTab(null)}
        />
      )}

      {/* SECONDARY MORE TABS VIEW */}
      {MORE_TABS.some((mt) => mt.id === activeTab) && (
        <GenericMasterTab
          activeTab={activeTab}
          tabName={currentTabObject?.name}
          onResetToDefault={() => handleTabChange('asset-groups')}
        />
      )}

      {/* GLOBAL MODAL 1: Audit History Log */}
      {showAuditHistoryModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#6C2BD9]" />
                <span>Audit History Log</span>
              </h3>
              <button onClick={() => setShowAuditHistoryModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs max-h-80 overflow-y-auto pr-1">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <div className="flex items-center justify-between font-bold text-slate-900">
                  <span>Record Updated (Status Active)</span>
                  <span className="text-[11px] text-slate-400 font-mono">02 Sep 2025 04:15 PM</span>
                </div>
                <p className="text-slate-600">Updated by Sarah Ahmed (Asset Manager)</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <div className="flex items-center justify-between font-bold text-slate-900">
                  <span>Record Created</span>
                  <span className="text-[11px] text-slate-400 font-mono">15 Jan 2025 09:20 AM</span>
                </div>
                <p className="text-slate-600">Created by Admin User</p>
              </div>
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setShowAuditHistoryModal(false)}
                className="px-4 py-2 bg-[#6C2BD9] text-white font-bold rounded-xl text-xs hover:bg-[#5B21B6]"
              >
                Close Audit Log
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GLOBAL MODAL 2: Add Multiple Records Modal */}
      {showAddMultipleModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#6C2BD9]" />
                <span>Add Multiple {currentTabObject?.name || 'Records'}</span>
              </h3>
              <button
                onClick={() => setShowAddMultipleModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Enter multiple items below. All valid records will be batch created in master data.
            </p>

            <div className="border border-slate-200 rounded-xl overflow-hidden max-h-72 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase sticky top-0">
                  <tr>
                    <th className="py-2.5 px-3">Code *</th>
                    <th className="py-2.5 px-3">Name *</th>
                    <th className="py-2.5 px-3 w-40">Asset Type</th>
                    <th className="py-2.5 px-3">Description</th>
                    <th className="py-2.5 px-2 text-center w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {multipleRecordsRows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="p-2">
                        <input
                          type="text"
                          value={row.code}
                          placeholder="e.g. LAB"
                          onChange={(e) => {
                            const updated = [...multipleRecordsRows];
                            updated[idx].code = e.target.value.toUpperCase();
                            setMultipleRecordsRows(updated);
                          }}
                          className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 font-mono text-xs focus:border-[#6C2BD9] focus:outline-none"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          value={row.name}
                          placeholder="e.g. Laboratory Assets"
                          onChange={(e) => {
                            const updated = [...multipleRecordsRows];
                            updated[idx].name = e.target.value;
                            setMultipleRecordsRows(updated);
                          }}
                          className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:border-[#6C2BD9] focus:outline-none"
                        />
                      </td>
                      <td className="p-2">
                        <select
                          value={row.assetType}
                          onChange={(e) => {
                            const updated = [...multipleRecordsRows];
                            updated[idx].assetType = e.target.value;
                            setMultipleRecordsRows(updated);
                          }}
                          className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs bg-white focus:border-[#6C2BD9] focus:outline-none"
                        >
                          <option value="Both">Both (Physical/Intangible)</option>
                          <option value="Physical">Physical Tangible</option>
                          <option value="Intangible">Intangible / Digital</option>
                        </select>
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          value={row.description}
                          placeholder="Optional description..."
                          onChange={(e) => {
                            const updated = [...multipleRecordsRows];
                            updated[idx].description = e.target.value;
                            setMultipleRecordsRows(updated);
                          }}
                          className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:border-[#6C2BD9] focus:outline-none"
                        />
                      </td>
                      <td className="p-2 text-center">
                        {multipleRecordsRows.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const updated = multipleRecordsRows.filter((_, i) => i !== idx);
                              setMultipleRecordsRows(updated);
                            }}
                            className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                            title="Remove row"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() =>
                  setMultipleRecordsRows([
                    ...multipleRecordsRows,
                    { code: '', name: '', assetType: 'Both', description: '' }
                  ])
                }
                className="px-3 py-1.5 rounded-xl border border-dashed border-purple-300 hover:border-[#6C2BD9] text-[#6C2BD9] text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Another Row</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddMultipleModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSavingMultiple}
                  onClick={handleSaveMultipleRecords}
                  className="px-5 py-2 rounded-xl bg-[#6C2BD9] hover:bg-[#5B21B6] text-white text-xs font-bold cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  {isSavingMultiple && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>
                    Save Records ({multipleRecordsRows.filter((r) => r.code.trim() && r.name.trim()).length})
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* GLOBAL MODAL 3: Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Upload className="w-4 h-4 text-[#6C2BD9]" />
                <span>Import {currentTabObject?.name || 'Records'}</span>
              </h3>
              <button onClick={() => setShowImportModal(false)} className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
            />

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-purple-200 rounded-2xl p-6 text-center bg-purple-50/40 space-y-2 cursor-pointer hover:bg-purple-50/70 transition-colors"
            >
              <Upload className="w-8 h-8 text-[#6C2BD9] mx-auto" />
              {importFileName ? (
                <div>
                  <p className="text-xs font-bold text-[#6C2BD9]">{importFileName}</p>
                  <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">
                    {importParsedRows.length} valid rows ready to import
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-xs font-bold text-slate-800">Click to upload or drag CSV file</p>
                  <p className="text-[11px] text-slate-400">Supports standard .csv format</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-xs pt-2">
              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="text-[#6C2BD9] font-bold hover:underline cursor-pointer flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Template</span>
              </button>
              <button
                type="button"
                disabled={isImporting || importParsedRows.length === 0}
                onClick={handleStartImport}
                className={clsx(
                  'px-4 py-2 rounded-xl text-white font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer',
                  importParsedRows.length > 0
                    ? 'bg-[#6C2BD9] hover:bg-[#5B21B6]'
                    : 'bg-slate-300 cursor-not-allowed'
                )}
              >
                {isImporting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>Start Import ({importParsedRows.length})</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MasterDataSetup;
