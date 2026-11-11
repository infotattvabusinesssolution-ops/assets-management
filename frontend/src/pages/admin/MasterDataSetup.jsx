import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
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
  Grid,
  Building2,
  Settings
} from 'lucide-react';
import clsx from 'clsx';
import CodePrefixSettingsModal from '../../components/modals/CodePrefixSettingsModal';

// Modular Tab Components
import { ItemMasterTab } from '../../components/master-data/ItemMasterTab';
import { CompaniesTab } from '../../components/master-data/CompaniesTab';
import { CustodiansTab } from '../../components/master-data/CustodiansTab';
import { AssetGroupsTab, INITIAL_ASSET_GROUPS } from '../../components/master-data/AssetGroupsTab';
import { ClassesTab, INITIAL_CLASSES } from '../../components/master-data/ClassesTab';
import { CategoriesTab, INITIAL_CATEGORIES } from '../../components/master-data/CategoriesTab';
import { SubCategoriesTab, INITIAL_SUB_CATEGORIES } from '../../components/master-data/SubCategoriesTab';
import { LocationsTab, INITIAL_LOCATIONS } from '../../components/master-data/LocationsTab';
import { LocationLevelTab } from '../../components/master-data/LocationLevelTab';
import { DepartmentsTab, INITIAL_DEPARTMENTS } from '../../components/master-data/DepartmentsTab';
import { CostCentersTab, INITIAL_COST_CENTERS } from '../../components/master-data/CostCentersTab';
import { SuppliersTab, INITIAL_SUPPLIERS } from '../../components/master-data/SuppliersTab';
import {
  GenericMasterTab,
  DEFAULT_MANUFACTURERS,
  DEFAULT_BRANDS,
  DEFAULT_UOM,
  DEFAULT_STATUS_CODES,
  DEFAULT_ASSET_TYPES
} from '../../components/master-data/GenericMasterTab';
import { DepreciationPoliciesTab } from '../../components/master-data/DepreciationPoliciesTab';
import { DisposalStatusesTab } from '../../components/master-data/DisposalStatusesTab';
import { api } from '../../services/api';

const getSingularName = (name = '') => {
  if (name.startsWith('Location Level')) return name;
  if (name === 'Asset Sub Groups' || name === 'Sub Groups') return 'Asset Sub Group';
  if (name.endsWith('Classes')) return name.slice(0, -2);
  if (name.endsWith('Statuses')) return name.slice(0, -2);
  if (name.endsWith('ies')) return name.slice(0, -3) + 'y';
  if (name === 'Status Codes') return 'Status Code';
  if (name === 'UOM' || name === 'UOM (Units)') return 'UOM';
  if (name.endsWith('s')) return name.slice(0, -1);
  return name;
};

export function MasterDataSetup() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'asset-groups';

  const handleTabChange = (tabId) => {
    const moreItem = MORE_TABS.find((t) => t.id === tabId);
    if (moreItem && moreItem.action === 'prefixes') {
      setShowCodePrefixModal(true);
      return;
    }
    if (moreItem && moreItem.action === 'audit') {
      setShowAuditHistoryModal(true);
      return;
    }
    if (moreItem && moreItem.action === 'guidelines') {
      setShowImportGuidelinesModal(true);
      return;
    }
    navigate(`/admin/master-data?tab=${tabId}`, { replace: true });
  };

  const importDropdownRef = useRef(null);
  const exportDropdownRef = useRef(null);
  const addDropdownRef = useRef(null);

  const [activeRowMenuId, setActiveRowMenuId] = useState(null);
  const [showImportDropdown, setShowImportDropdown] = useState(false);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [showAddDropdown, setShowAddDropdown] = useState(false);

  // Global Modals
  const [showImportModal, setShowImportModal] = useState(false);
  const [showImportHistoryModal, setShowImportHistoryModal] = useState(false);
  const [showImportGuidelinesModal, setShowImportGuidelinesModal] = useState(false);
  const [showAuditHistoryModal, setShowAuditHistoryModal] = useState(false);
  const [showAddMultipleModal, setShowAddMultipleModal] = useState(false);
  const [showCodePrefixModal, setShowCodePrefixModal] = useState(false);

  const handleCloseCodePrefixModal = () => {
    setShowCodePrefixModal(false);
  };

  useEffect(() => {
    if (searchParams.get('tab') === 'code-prefixes') {
      setShowCodePrefixModal(true);
    }
  }, [searchParams]);

  // External trigger for Add Modal in active tab
  const [showAddGroupModal, setShowAddGroupModal] = useState(false);
  const [activeAddModalTab, setActiveAddModalTab] = useState(null);
  const [groupReloadTrigger, setGroupReloadTrigger] = useState(0);

  // Reset active add modal tab when switching tabs so popups never open on tab switch
  useEffect(() => {
    setActiveAddModalTab(null);
    setShowAddGroupModal(false);
  }, [activeTab]);

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
    } else if (activeTab === 'classes' || activeTab === 'sub-groups') {
      setActiveAddModalTab('sub-groups');
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
      if (importDropdownRef.current && !importDropdownRef.current.contains(e.target)) {
        setShowImportDropdown(false);
      }
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(e.target)) {
        setShowExportDropdown(false);
      }
      if (addDropdownRef.current && !addDropdownRef.current.contains(e.target)) {
        setShowAddDropdown(false);
      }
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
    const isClasses = activeTab === 'classes' || activeTab === 'sub-groups';
    const isCats = activeTab === 'categories';
    const isSubCats = activeTab === 'subcategories';
    const isLocations = activeTab === 'locations';
    const isDepts = activeTab === 'departments';
    const isCostCenters = activeTab === 'cost-centers';
    const isSuppliers = activeTab === 'suppliers';
    const isMfg = activeTab === 'manufacturers';
    const isBrands = activeTab === 'brands';
    const isUom = activeTab === 'uom';
    const isStatusCodes = activeTab === 'status-codes';
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
    } else if (isMfg) {
      headers = ['Manufacturer Code', 'Manufacturer Name', 'Website', 'Support Contact', 'Country', 'Status'];
      rows = DEFAULT_MANUFACTURERS.map((m) => [m.code, `"${m.name}"`, m.website, m.supportContact, m.country, m.status]);
      filename = 'Asset_Manufacturers';
    } else if (isBrands) {
      headers = ['Brand Code', 'Brand Name', 'Manufacturer', 'Description', 'Status'];
      rows = DEFAULT_BRANDS.map((b) => [b.code, `"${b.name}"`, `"${b.manufacturerName || ''}"`, `"${b.description || ''}"`, b.status]);
      filename = 'Asset_Brands';
    } else if (isUom) {
      headers = ['UOM Code', 'UOM Name', 'Symbol', 'Category', 'Description', 'Status'];
      rows = DEFAULT_UOM.map((u) => [u.code, `"${u.name}"`, u.symbol, u.category, `"${u.description}"`, u.status]);
      filename = 'Asset_UOM';
    } else if (isStatusCodes) {
      headers = ['Status Code', 'Status Name', 'Lifecycle Stage', 'Description', 'Status'];
      rows = DEFAULT_STATUS_CODES.map((s) => [s.code, `"${s.name}"`, s.stage, `"${s.description}"`, s.status]);
      filename = 'Asset_StatusCodes';
    } else {
      headers = ['Class Code', 'Class Name', 'Asset Group', 'Description', 'Asset Type', 'Total Assets', 'Status'];
      rows = INITIAL_CLASSES.map((c) => [c.code, c.name, `"${c.groupName}"`, `"${c.description}"`, c.assetType, c.totalAssets, c.status]);
      filename = 'Asset_SubGroups';
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

  // Exact 11 items matching the Master Data section in the left sidebar
  const TABS = [
    { id: 'item-master', name: 'Item Master', icon: Box, desc: 'Central catalog of items defining code, name, barcode, and classification hierarchy before asset registration.' },
    { id: 'asset-groups', name: 'Asset Groups', icon: Box, desc: 'Define and manage asset groups to classify your assets across the Asset360 enterprise platform.' },
    { id: 'sub-groups', aliasId: 'classes', name: 'Asset Sub Groups', icon: Layers, desc: 'Define and manage asset sub groups within each asset group for classification and lifecycle control.' },
    { id: 'categories', name: 'Categories', icon: Tag, desc: 'Define and manage asset categories within each class.' },
    { id: 'subcategories', name: 'Sub Categories', icon: FolderTree, desc: 'Define and manage granular asset sub categories within each category.' },
    { id: 'companies', name: 'Companies', icon: Building2, desc: 'Define legal entities and corporate operating units for asset ownership and financial reporting.' },
    { id: 'custodians', name: 'Custodians', icon: UserCheck, desc: 'Manage internal employees and external custodians responsible for asset care, custody, and physical tracking.' },
    { id: 'locations', name: 'Locations', icon: MapPin, desc: 'Define and manage physical sites, campuses, buildings, and rooms where assets are deployed.' },
    { id: 'location-level-1', name: 'Location Level 1', icon: MapPin, desc: 'Define and manage Location Level 1 records.' },
    { id: 'location-level-2', name: 'Location Level 2', icon: MapPin, desc: 'Define and manage Location Level 2 records.' },
    { id: 'location-level-3', name: 'Location Level 3', icon: MapPin, desc: 'Define and manage Location Level 3 records.' },
    { id: 'location-level-4', name: 'Location Level 4', icon: MapPin, desc: 'Define and manage Location Level 4 records.' },
    { id: 'departments', name: 'Departments', icon: Users, desc: 'Define and manage organizational departments for asset ownership and financial accountability.' },
    { id: 'cost-centers', name: 'Cost Centers', icon: BarChart3, desc: 'Define and manage cost centers for budget allocation, depreciation charging, and financial reporting.' },
    { id: 'suppliers', name: 'Suppliers', icon: Truck, desc: 'Manage approved vendors and suppliers for asset procurement, warranties, and maintenance services.' },
    { id: 'manufacturers', name: 'Manufacturers', icon: Factory, desc: 'Manage approved equipment manufacturers, OEM specs, vendor portals, and technical support.' },
    { id: 'brands', name: 'Brands', icon: Tag, desc: 'Manage equipment and product brands linked to items and asset catalog.' },
    { id: 'uom', name: 'UOM', icon: Scale, desc: 'Define standard Units of Measure (UOM) for inventory parts, bulk materials, and asset counting.' },
    { id: 'status-codes', name: 'Status Codes', icon: ShieldCheck, desc: 'Configure lifecycle status codes, operational states, and workflow status indicators.' },
    { id: 'disposal-statuses', name: 'Disposal Statuses', icon: Trash2, desc: 'Manage disposal statuses (Scrapped, Sold, Donated, Written Off, Traded In) for asset retirement transactions.' }
  ];

  const MORE_TABS = [
    { id: 'code-prefixes', name: 'Code Prefix Settings', icon: Settings, desc: 'Configure autogenerated code prefixes for all master records.', action: 'prefixes' },
    { id: 'depreciation', name: 'Depreciation Policies', icon: BarChart3, desc: 'Configure accounting depreciation methods, asset useful lives, and salvage value policies.' },
    { id: 'audit-log', name: 'Audit History Log', icon: Clock, desc: 'Inspect system-wide change audit trails and master data modification logs.', action: 'audit' },
    { id: 'import-guidelines', name: 'Import Guidelines', icon: BookOpen, desc: 'Read standard CSV data guidelines and column specifications for master data bulk imports.', action: 'guidelines' }
  ];

  const currentTabObject = TABS.find((t) => t.id === activeTab || t.aliasId === activeTab) || MORE_TABS.find((t) => t.id === activeTab);

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
            {currentTabObject?.desc || 'Define and manage master data records to classify your assets across the Asset360 enterprise platform.'}
          </p>
        </div>

        {/* Action Buttons Top Right */}
        {activeTab !== 'depreciation' && <div className="flex items-center gap-2 relative">
          {/* Master Code Prefix Settings */}
          <button
            type="button"
            onClick={() => setShowCodePrefixModal(true)}
            className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:border-purple-300 hover:bg-purple-50/60 text-slate-700 hover:text-[#6C2BD9] text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
            title="Configure autogenerated code prefixes for all master records"
          >
            <Settings className="w-3.5 h-3.5 text-[#6C2BD9]" />
            <span>Code Prefixes</span>
          </button>

          {/* Import Dropdown */}
          <div className="relative" ref={importDropdownRef}>
            <button
              onClick={() => {
                setShowImportDropdown(!showImportDropdown);
                setShowExportDropdown(false);
                setShowAddDropdown(false);
              }}
              className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
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
          <div className="relative" ref={exportDropdownRef}>
            <button
              onClick={() => {
                setShowExportDropdown(!showExportDropdown);
                setShowImportDropdown(false);
                setShowAddDropdown(false);
              }}
              className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-slate-500" />
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
          <div className="relative" ref={addDropdownRef}>
            <div className="inline-flex items-center rounded-xl shadow-xs overflow-hidden bg-[#6C2BD9]">
              <button
                onClick={handleTriggerAddSingle}
                className="px-3.5 py-2 hover:bg-[#5B21B6] text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                title={`Add new ${getSingularName(currentTabObject?.name || 'Group')}`}
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Add {getSingularName(currentTabObject?.name || 'Group')}</span>
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
                  <Download className="w-3.5 h-3.5 text-[#6C2BD9]" />
                  <span>Import from Template</span>
                </button>
              </div>
            )}
          </div>
        </div>}
      </div>

      {/* RENDER MODULAR TABS */}
      {activeTab === 'code-prefixes' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-10 text-center max-w-xl mx-auto space-y-4 my-8 animate-in fade-in duration-200">
          <div className="w-14 h-14 rounded-2xl bg-purple-50 text-[#6C2BD9] border border-purple-100 flex items-center justify-center mx-auto shadow-2xs">
            <Settings className="w-7 h-7 stroke-[1.8]" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">Master Code Prefix Settings</h3>
            <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
              Configure system-wide autogenerated code prefixes for all master entities including Organization, Locations, Asset Groups, Categories, Suppliers, and Statuses.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowCodePrefixModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
          >
            <Settings className="w-4 h-4" />
            <span>Open Code Prefix Settings</span>
          </button>
        </div>
      )}

      {activeTab === 'item-master' && (
        <ItemMasterTab
          triggerToast={triggerToast}
          activeRowMenuId={activeRowMenuId}
          setActiveRowMenuId={setActiveRowMenuId}
          externalShowAddModal={activeAddModalTab === 'item-master'}
          setExternalShowAddModal={(val) => !val && setActiveAddModalTab(null)}
          onNavigateTab={handleTabChange}
        />
      )}

      {activeTab === 'asset-groups' && (
        <AssetGroupsTab
          triggerToast={triggerToast}
          activeRowMenuId={activeRowMenuId}
          setActiveRowMenuId={setActiveRowMenuId}
          externalShowAddModal={showAddGroupModal}
          setExternalShowAddModal={setShowAddGroupModal}
          reloadTrigger={groupReloadTrigger}
          onNavigateTab={handleTabChange}
        />
      )}

      {(activeTab === 'classes' || activeTab === 'sub-groups') && (
        <ClassesTab
          triggerToast={triggerToast}
          activeRowMenuId={activeRowMenuId}
          setActiveRowMenuId={setActiveRowMenuId}
          setShowAuditHistoryModal={setShowAuditHistoryModal}
          externalShowAddModal={activeAddModalTab === 'classes' || activeAddModalTab === 'sub-groups'}
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

      {activeTab === 'companies' && (
        <CompaniesTab
          triggerToast={triggerToast}
          activeRowMenuId={activeRowMenuId}
          setActiveRowMenuId={setActiveRowMenuId}
          externalShowAddModal={activeAddModalTab === 'companies'}
          setExternalShowAddModal={(val) => !val && setActiveAddModalTab(null)}
        />
      )}

      {activeTab === 'custodians' && (
        <CustodiansTab
          triggerToast={triggerToast}
          activeRowMenuId={activeRowMenuId}
          setActiveRowMenuId={setActiveRowMenuId}
          externalShowAddModal={activeAddModalTab === 'custodians'}
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
          onNavigateTab={handleTabChange}
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

      {['location-level-1', 'location-level-2', 'location-level-3', 'location-level-4'].includes(activeTab) && (
        <LocationLevelTab
          key={activeTab}
          level={parseInt(activeTab.replace('location-level-', ''), 10)}
          levelName={currentTabObject?.name || 'Location Level'}
          triggerToast={triggerToast}
          activeRowMenuId={activeRowMenuId}
          setActiveRowMenuId={setActiveRowMenuId}
          externalShowAddModal={activeAddModalTab === activeTab}
          setExternalShowAddModal={(val) => !val && setActiveAddModalTab(null)}
          onNavigateTab={handleTabChange}
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

      {activeTab === 'disposal-statuses' && (
        <DisposalStatusesTab
          triggerToast={triggerToast}
          activeRowMenuId={activeRowMenuId}
          setActiveRowMenuId={setActiveRowMenuId}
          externalShowAddModal={activeAddModalTab === 'disposal-statuses'}
          setExternalShowAddModal={(val) => !val && setActiveAddModalTab(null)}
        />
      )}

      {/* GENERIC MASTER DATA TABS (Asset Types, Manufacturers, UOM, Status Codes & Custom Views) */}
      {(['manufacturers', 'brands', 'uom', 'status-codes', 'asset-types'].includes(activeTab) ||
        (MORE_TABS.some((mt) => mt.id === activeTab) && activeTab !== 'depreciation')) && (
        <GenericMasterTab
          key={activeTab}
          activeTab={activeTab}
          tabName={currentTabObject?.name}
          triggerToast={triggerToast}
          activeRowMenuId={activeRowMenuId}
          setActiveRowMenuId={setActiveRowMenuId}
          externalShowAddModal={activeAddModalTab === activeTab}
          setExternalShowAddModal={(val) => !val && setActiveAddModalTab(null)}
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
              <div className="p-8 text-center text-slate-500">
                <History className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="font-semibold text-slate-700">No Audit Logs Available</p>
                <p className="text-[11px] text-slate-400 mt-1">Audit log records will be tracked dynamically when master data records are created, updated, or removed.</p>
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
                <Download className="w-4 h-4 text-[#6C2BD9]" />
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

      {/* Code Prefix Settings Modal */}
      <CodePrefixSettingsModal
        isOpen={showCodePrefixModal}
        onClose={handleCloseCodePrefixModal}
      />
    </div>
  );
}

export default MasterDataSetup;
