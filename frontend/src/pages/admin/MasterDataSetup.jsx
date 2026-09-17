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

export function MasterDataSetup() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTabFromUrl = searchParams.get('tab') || 'asset-groups';
  const [activeTab, setActiveTab] = useState(initialTabFromUrl);

  useEffect(() => {
    const currentTab = searchParams.get('tab');
    if (currentTab && currentTab !== activeTab) {
      setActiveTab(currentTab);
    }
  }, [searchParams]);

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

  const [toastMessage, setToastMessage] = useState(null);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
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
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl bg-slate-900 text-white text-xs border border-slate-700 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
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
        <div className="flex items-center gap-2 relative">
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
            <button
              onClick={() => {
                setShowAddDropdown(!showAddDropdown);
                setShowImportDropdown(false);
                setShowExportDropdown(false);
              }}
              className="px-4 py-2 rounded-xl bg-[#6C2BD9] hover:bg-[#5B21B6] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm active:scale-[0.98] cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add {currentTabObject ? currentTabObject.name.replace(/s$/, '') : 'Group'}</span>
              <ChevronDown className="w-3 h-3 text-white/80" />
            </button>

            {showAddDropdown && (
              <div className="absolute right-0 mt-1.5 w-52 bg-white border border-slate-200 rounded-xl shadow-xl p-1.5 z-40 space-y-1">
                <button
                  onClick={() => {
                    setShowAddDropdown(false);
                    triggerToast(`Use the "+ Add" action inside the ${currentTabObject?.name || 'Master'} panel.`);
                  }}
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
        </div>
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
        <AssetGroupsTab triggerToast={triggerToast} />
      )}

      {activeTab === 'classes' && (
        <ClassesTab
          triggerToast={triggerToast}
          activeRowMenuId={activeRowMenuId}
          setActiveRowMenuId={setActiveRowMenuId}
          setShowAuditHistoryModal={setShowAuditHistoryModal}
        />
      )}

      {activeTab === 'categories' && (
        <CategoriesTab
          triggerToast={triggerToast}
          activeRowMenuId={activeRowMenuId}
          setActiveRowMenuId={setActiveRowMenuId}
          setShowAuditHistoryModal={setShowAuditHistoryModal}
        />
      )}

      {activeTab === 'subcategories' && (
        <SubCategoriesTab
          triggerToast={triggerToast}
          activeRowMenuId={activeRowMenuId}
          setActiveRowMenuId={setActiveRowMenuId}
          setShowAuditHistoryModal={setShowAuditHistoryModal}
        />
      )}

      {activeTab === 'locations' && (
        <LocationsTab
          triggerToast={triggerToast}
          activeRowMenuId={activeRowMenuId}
          setActiveRowMenuId={setActiveRowMenuId}
          setShowAuditHistoryModal={setShowAuditHistoryModal}
        />
      )}

      {activeTab === 'departments' && (
        <DepartmentsTab
          triggerToast={triggerToast}
          activeRowMenuId={activeRowMenuId}
          setActiveRowMenuId={setActiveRowMenuId}
          setShowAuditHistoryModal={setShowAuditHistoryModal}
        />
      )}

      {activeTab === 'cost-centers' && (
        <CostCentersTab
          triggerToast={triggerToast}
          activeRowMenuId={activeRowMenuId}
          setActiveRowMenuId={setActiveRowMenuId}
          setShowAuditHistoryModal={setShowAuditHistoryModal}
        />
      )}

      {activeTab === 'suppliers' && (
        <SuppliersTab
          triggerToast={triggerToast}
          activeRowMenuId={activeRowMenuId}
          setActiveRowMenuId={setActiveRowMenuId}
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

      {/* GLOBAL MODAL 2: Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Upload className="w-4 h-4 text-[#6C2BD9]" />
                <span>Import {currentTabObject?.name || 'Records'}</span>
              </h3>
              <button onClick={() => setShowImportModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="border-2 border-dashed border-purple-200 rounded-2xl p-6 text-center bg-purple-50/40 space-y-2 cursor-pointer hover:bg-purple-50/70 transition-colors">
              <Upload className="w-8 h-8 text-[#6C2BD9] mx-auto" />
              <p className="text-xs font-bold text-slate-800">Click to upload or drag CSV / Excel file</p>
              <p className="text-[11px] text-slate-400">Supports .csv, .xlsx up to 10MB</p>
            </div>

            <div className="flex items-center justify-between text-xs pt-2">
              <button onClick={() => triggerToast('Sample CSV template downloaded.')} className="text-[#6C2BD9] font-bold hover:underline">
                Download Template
              </button>
              <button
                onClick={() => {
                  setShowImportModal(false);
                  triggerToast(`Records imported successfully!`);
                }}
                className="px-4 py-2 rounded-xl bg-[#6C2BD9] text-white font-bold hover:bg-[#5B21B6]"
              >
                Start Import
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MasterDataSetup;
