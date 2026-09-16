import React, { useState, useEffect, useMemo } from 'react';
import {
  Layers,
  Database,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  ChevronRight,
  ChevronDown,
  Building2,
  FolderTree,
  Tag,
  Truck,
  Factory,
  Scale,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Edit2,
  Trash2,
  ShieldAlert,
  ArrowRight,
  FileSpreadsheet,
  RefreshCw,
  X,
  Eye,
  Check
} from 'lucide-react';
import { api } from '../../services/api';
import clsx from 'clsx';

const FALLBACK_HIERARCHY = {
  groups: [
    { id: 'GRP-001', code: 'IT', name: 'Information Technology', description: 'Computing, networking, telephony and IT peripherals', assetType: 'Both', totalAssets: 1420, status: 'Active', createdBy: 'System', createdOn: '10 Jan 2026' },
    { id: 'GRP-002', code: 'FAC', name: 'Buildings & Facilities', description: 'Premises, structural assets, HVAC and plant equipment', assetType: 'Physical', totalAssets: 340, status: 'Active', createdBy: 'System', createdOn: '10 Jan 2026' },
    { id: 'GRP-003', code: 'PLM', name: 'Plant & Machinery', description: 'Manufacturing, warehouse forklifts and heavy processing units', assetType: 'Physical', totalAssets: 185, status: 'Active', createdBy: 'John Doe', createdOn: '12 Jan 2026' },
    { id: 'GRP-004', code: 'VEH', name: 'Vehicles & Fleet', description: 'Commercial delivery vans, trucks and executive corporate cars', assetType: 'Physical', totalAssets: 64, status: 'Active', createdBy: 'John Doe', createdOn: '15 Jan 2026' },
    { id: 'GRP-005', code: 'FUR', name: 'Furniture & Fixtures', description: 'Desks, ergonomic chairs, executive suites and meeting fixtures', assetType: 'Physical', totalAssets: 890, status: 'Active', createdBy: 'Sarah Ahmed', createdOn: '18 Jan 2026' },
    { id: 'GRP-006', code: 'MED', name: 'Medical Equipment', description: 'Clinical analyzers, biometric sensors and diagnostic gear', assetType: 'Physical', totalAssets: 42, status: 'Active', createdBy: 'System', createdOn: '20 Jan 2026' },
    { id: 'GRP-007', code: 'TOOL', name: 'Specialized Tools & Gauges', description: 'Calibration meters, workshop hand tools and maintenance kits', assetType: 'Physical', totalAssets: 110, status: 'Active', createdBy: 'Ramesh Kumar', createdOn: '22 Jan 2026' },
    { id: 'GRP-008', code: 'SFTW', name: 'Software & Digital Licenses', description: 'Enterprise ERP subscriptions, OS licenses and design software', assetType: 'Intangible', totalAssets: 520, status: 'Active', createdBy: 'Ramesh Kumar', createdOn: '25 Jan 2026' }
  ],
  classes: [
    { id: 'CLS-001', groupId: 'GRP-001', groupCode: 'IT', code: 'COMP', name: 'Computing Hardware', description: 'Laptops, desktops, workstations and server towers', totalAssets: 850, status: 'Active' },
    { id: 'CLS-002', groupId: 'GRP-001', groupCode: 'IT', code: 'NET', name: 'Network Infrastructure', description: 'Switches, routers, firewalls, patch panels and racks', totalAssets: 320, status: 'Active' },
    { id: 'CLS-003', groupId: 'GRP-001', groupCode: 'IT', code: 'PERIPH', name: 'Peripherals & Displays', description: 'Monitors, docking stations, printers and scanners', totalAssets: 250, status: 'Active' },
    { id: 'CLS-004', groupId: 'GRP-002', groupCode: 'FAC', code: 'HVAC', name: 'HVAC & Cooling Systems', description: 'Chillers, air handling units and split units', totalAssets: 120, status: 'Active' },
    { id: 'CLS-005', groupId: 'GRP-004', groupCode: 'VEH', code: 'COMM-VEH', name: 'Commercial Logistics Fleet', description: 'Refrigerated trucks and logistics delivery vans', totalAssets: 48, status: 'Active' }
  ],
  categories: [
    { id: 'CAT-001', classId: 'CLS-001', code: 'LAPTOP', name: 'Laptops & Ultrabooks', totalAssets: 480, status: 'Active' },
    { id: 'CAT-002', classId: 'CLS-001', code: 'DESK', name: 'Desktop Workstations', totalAssets: 370, status: 'Active' },
    { id: 'CAT-003', classId: 'CLS-002', code: 'SWT', name: 'Managed Core Switches', totalAssets: 180, status: 'Active' },
    { id: 'CAT-004', classId: 'CLS-003', code: 'MON', name: '4K Display Monitors', totalAssets: 250, status: 'Active' },
    { id: 'CAT-005', classId: 'CLS-004', code: 'CHILL', name: 'Industrial Water Chillers', totalAssets: 120, status: 'Active' },
    { id: 'CAT-006', classId: 'CLS-005', code: 'TRK', name: 'Delivery Trucks', totalAssets: 48, status: 'Active' }
  ],
  subcategories: [
    { id: 'SUB-001', categoryId: 'CAT-001', code: 'EXEC-LAP', name: 'Executive Ultrabooks', totalAssets: 120, status: 'Active' },
    { id: 'SUB-002', categoryId: 'CAT-001', code: 'DEV-LAP', name: 'Engineering Workstation Laptops', totalAssets: 360, status: 'Active' },
    { id: 'SUB-003', categoryId: 'CAT-002', code: 'TWR-DSK', name: 'Tower Workstations', totalAssets: 370, status: 'Active' },
    { id: 'SUB-004', categoryId: 'CAT-003', code: 'L3-SWT', name: 'Layer 3 Enterprise Switches', totalAssets: 180, status: 'Active' }
  ],
  totals: { groupsCount: 8, classesCount: 5, categoriesCount: 6, subcategoriesCount: 4, totalAssets: 3571 }
};

const FALLBACK_SUPPLIERS = [
  { id: 'SUP-001', code: 'SUP-DELL', name: 'Dell Technologies Middle East', contact: 'Ahmed Mansoor', email: 'sales.me@dell.com', phone: '+971 4 391 9000', country: 'UAE', rating: '5 Star', status: 'Active' },
  { id: 'SUP-002', code: 'SUP-CISCO', name: 'Cisco Systems Gulf', contact: 'Kareem Fahmy', email: 'orders@cisco.ae', phone: '+971 4 438 1000', country: 'UAE', rating: '5 Star', status: 'Active' },
  { id: 'SUP-003', code: 'SUP-CARRIER', name: 'Carrier Middle East Air Conditioning', contact: 'George Khalil', email: 'service@carrier.ae', phone: '+971 4 282 3000', country: 'UAE', rating: '4 Star', status: 'Active' },
  { id: 'SUP-004', code: 'SUP-ZEBRA', name: 'Zebra Enterprise Solutions', contact: 'Fatima Al Rais', email: 'middleeast@zebra.com', phone: '+971 4 365 2000', country: 'UAE', rating: '5 Star', status: 'Active' }
];

const FALLBACK_MANUFACTURERS = [
  { id: 'MFG-001', code: 'DELL', name: 'Dell Inc.', country: 'United States', status: 'Active', website: 'https://www.dell.com' },
  { id: 'MFG-002', code: 'HP', name: 'HP Enterprise', country: 'United States', status: 'Active', website: 'https://www.hpe.com' },
  { id: 'MFG-003', code: 'CISCO', name: 'Cisco Systems', country: 'United States', status: 'Active', website: 'https://www.cisco.com' },
  { id: 'MFG-004', code: 'CARRIER', name: 'Carrier Global', country: 'United States', status: 'Active', website: 'https://www.carrier.com' },
  { id: 'MFG-005', code: 'ZEBRA', name: 'Zebra Technologies', country: 'United States', status: 'Active', website: 'https://www.zebra.com' },
  { id: 'MFG-006', code: 'APPLE', name: 'Apple Inc.', country: 'United States', status: 'Active', website: 'https://www.apple.com' }
];

const FALLBACK_UOM = [
  { id: 'UOM-001', code: 'EA', name: 'Each / Unit', isBase: true, precision: 0, status: 'Active' },
  { id: 'UOM-002', code: 'BOX', name: 'Box / Pack', isBase: false, precision: 0, status: 'Active' },
  { id: 'UOM-003', code: 'MTR', name: 'Meter', isBase: true, precision: 2, status: 'Active' },
  { id: 'UOM-004', code: 'SET', name: 'Assembly Set', isBase: true, precision: 0, status: 'Active' },
  { id: 'UOM-005', code: 'LTR', name: 'Liter (Fluids)', isBase: true, precision: 2, status: 'Active' }
];

export function MasterDataSetup() {
  // Main Section Tab: 'CLASSIFICATION' | 'SUPPLIERS' | 'MANUFACTURERS' | 'UOM'
  const [activeTab, setActiveTab] = useState('CLASSIFICATION');

  // Hierarchy Data
  const [hierarchy, setHierarchy] = useState(FALLBACK_HIERARCHY);

  // Supporting Masters
  const [suppliers, setSuppliers] = useState(FALLBACK_SUPPLIERS);
  const [manufacturers, setManufacturers] = useState(FALLBACK_MANUFACTURERS);
  const [uomList, setUomList] = useState(FALLBACK_UOM);

  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedGroups, setExpandedGroups] = useState({ 'GRP-001': true });
  const [expandedClasses, setExpandedClasses] = useState({});
  const [selectedGroup, setSelectedGroup] = useState(FALLBACK_HIERARCHY.groups[0]);

  // Modals
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [showImportWizard, setShowImportWizard] = useState(false);
  const [toast, setToast] = useState(null);

  // Group Form
  const [groupForm, setGroupForm] = useState({
    code: '',
    name: '',
    description: '',
    assetType: 'Physical',
    status: 'Active'
  });

  // Bulk Import 6-Step Wizard State
  const [importStep, setImportStep] = useState(1);
  const [importFile, setImportFile] = useState(null);
  const [importType, setImportType] = useState('ASSET_GROUP');
  const [validationResults, setValidationResults] = useState(null);
  const [importSummary, setImportSummary] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const showNotification = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [hRes, sRes, mRes, uRes] = await Promise.all([
        api.get('/admin/master-data/hierarchy'),
        api.get('/admin/master-data/suppliers'),
        api.get('/admin/master-data/manufacturers'),
        api.get('/admin/master-data/uom')
      ]);

      if (hRes) {
        setHierarchy(hRes);
        if (hRes.groups?.length > 0) {
          setSelectedGroup(hRes.groups[0]);
          // Expand first group by default
          setExpandedGroups({ [hRes.groups[0].id]: true });
        }
      }
      if (sRes?.suppliers) setSuppliers(sRes.suppliers);
      if (mRes?.manufacturers) setManufacturers(mRes.manufacturers);
      if (uRes?.uom) setUomList(uRes.uom);
    } catch (err) {
      console.error('Failed loading master data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const toggleGroupExpand = (groupId) => {
    setExpandedGroups(prev => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const toggleClassExpand = (classId) => {
    setExpandedClasses(prev => ({ ...prev, [classId]: !prev[classId] }));
  };

  // Save / Update Group
  const handleSaveGroup = async (e) => {
    e.preventDefault();
    if (!groupForm.code || !groupForm.name) {
      showNotification('error', 'Group Code and Name are required.');
      return;
    }

    try {
      if (editingGroup) {
        await api.put(`/admin/master-data/groups/${editingGroup.id}`, groupForm);
        showNotification('success', `Asset Group ${groupForm.name} updated successfully.`);
      } else {
        await api.post('/admin/master-data/groups', groupForm);
        showNotification('success', `Asset Group ${groupForm.name} created successfully.`);
      }
      setShowGroupModal(false);
      setEditingGroup(null);
      setGroupForm({ code: '', name: '', description: '', assetType: 'Physical', status: 'Active' });
      loadData();
    } catch (err) {
      showNotification('error', err.message || 'Failed saving asset group.');
    }
  };

  // Delete Group with validation
  const handleDeleteGroup = async (groupId, groupName) => {
    if (!window.confirm(`Are you sure you want to delete Asset Group "${groupName}"?`)) return;

    try {
      const res = await api.delete(`/admin/master-data/groups/${groupId}`);
      if (res?.success) {
        showNotification('success', `Asset Group "${groupName}" deleted.`);
        loadData();
      }
    } catch (err) {
      showNotification('error', err?.message || 'Cannot delete referenced group. Please deactivate instead.');
    }
  };

  // Bulk Import Wizard Actions
  const handleValidateImport = async () => {
    setIsProcessing(true);
    // Mock parsing rows from file
    const sampleRows = [
      { code: 'SEC', name: 'Security & Surveillance', description: 'CCTV, Access Control, Scanners', assetType: 'Physical' },
      { code: 'LAB', name: 'Quality Testing Instruments', description: 'Spectrometers and testers', assetType: 'Physical' },
      { code: '', name: 'Invalid Missing Code', description: 'Row with missing code for test', assetType: 'Physical' }
    ];

    try {
      const res = await api.post('/admin/master-data/import/validate', {
        records: sampleRows,
        entityType: importType
      });
      setValidationResults(res);
      setImportStep(3); // Go to Preview & Errors
    } catch (err) {
      showNotification('error', 'Validation failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCommitImport = async () => {
    setIsProcessing(true);
    try {
      const validRecords = validationResults?.results?.filter(r => r.valid).map(r => r.data) || [];
      const res = await api.post('/admin/master-data/import/commit', {
        validRecords,
        entityType: importType
      });
      setImportSummary({
        totalProcessed: validationResults?.totalRows || 0,
        committedCount: res?.committedCount || 0,
        skippedCount: validationResults?.invalidRows || 0
      });
      setImportStep(5); // Summary
      loadData();
    } catch (err) {
      showNotification('error', 'Batch commit failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-16">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl bg-slate-900 text-white text-xs border border-slate-700 animate-in fade-in slide-in-from-bottom-3 duration-200">
          {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
          {toast.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />}
          {toast.type === 'error' && <XCircle className="w-4 h-4 text-rose-400 shrink-0" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-5">
        <div className="max-w-[1700px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
              <span>Administration</span>
              <span className="text-slate-300">&gt;</span>
              <span className="text-[#6C2BD9]">Master Data Setup</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
              <FolderTree className="w-6 h-6 text-[#6C2BD9]" />
              <span>Master Data Setup</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Configure the foundational 4-tier Asset Classification Hierarchy and supporting business master registries
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                setImportStep(1);
                setValidationResults(null);
                setImportSummary(null);
                setShowImportWizard(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg shadow-2xs transition-colors cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-[#6C2BD9]" />
              <span>Bulk Import Wizard</span>
            </button>

            <button
              onClick={() => {
                setEditingGroup(null);
                setGroupForm({ code: '', name: '', description: '', assetType: 'Physical', status: 'Active' });
                setShowGroupModal(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Asset Group</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1700px] mx-auto px-6 pt-5 space-y-5">
        {/* Metric Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <p className="text-[11px] font-semibold text-slate-400 uppercase">Tier 1: Groups</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{hierarchy.totals?.groupsCount || hierarchy.groups.length}</p>
            <span className="text-[10px] text-slate-400">Top-Level Taxonomies</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <p className="text-[11px] font-semibold text-slate-400 uppercase">Tier 2: Classes</p>
            <p className="text-2xl font-bold text-[#6C2BD9] mt-1">{hierarchy.totals?.classesCount || hierarchy.classes.length}</p>
            <span className="text-[10px] text-slate-400">Hardware & Infra</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <p className="text-[11px] font-semibold text-slate-400 uppercase">Tier 3: Categories</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{hierarchy.totals?.categoriesCount || hierarchy.categories.length}</p>
            <span className="text-[10px] text-slate-400">Depreciation Profiles</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <p className="text-[11px] font-semibold text-slate-400 uppercase">Tier 4: Subcategories</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{hierarchy.totals?.subcategoriesCount || hierarchy.subcategories.length}</p>
            <span className="text-[10px] text-slate-400">Granular Specifications</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <p className="text-[11px] font-semibold text-slate-400 uppercase">Total Linked Assets</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{hierarchy.totals?.totalAssets?.toLocaleString() || '4,705'}</p>
            <span className="text-[10px] text-emerald-700 font-semibold">Active in Register</span>
          </div>
        </div>

        {/* Master Data Navigation Tabs */}
        <div className="border-b border-slate-200">
          <nav className="flex space-x-8 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('CLASSIFICATION')}
              className={clsx(
                'pb-3 cursor-pointer transition-colors relative flex items-center gap-1.5',
                activeTab === 'CLASSIFICATION'
                  ? 'text-[#6C2BD9] font-bold border-b-2 border-[#6C2BD9]'
                  : 'text-slate-500 hover:text-slate-800'
              )}
            >
              <FolderTree className="w-3.5 h-3.5" />
              <span>4-Tier Classification Hierarchy</span>
            </button>

            <button
              onClick={() => setActiveTab('SUPPLIERS')}
              className={clsx(
                'pb-3 cursor-pointer transition-colors relative flex items-center gap-1.5',
                activeTab === 'SUPPLIERS'
                  ? 'text-[#6C2BD9] font-bold border-b-2 border-[#6C2BD9]'
                  : 'text-slate-500 hover:text-slate-800'
              )}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Suppliers ({suppliers.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('MANUFACTURERS')}
              className={clsx(
                'pb-3 cursor-pointer transition-colors relative flex items-center gap-1.5',
                activeTab === 'MANUFACTURERS'
                  ? 'text-[#6C2BD9] font-bold border-b-2 border-[#6C2BD9]'
                  : 'text-slate-500 hover:text-slate-800'
              )}
            >
              <Factory className="w-3.5 h-3.5" />
              <span>Manufacturers ({manufacturers.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('UOM')}
              className={clsx(
                'pb-3 cursor-pointer transition-colors relative flex items-center gap-1.5',
                activeTab === 'UOM'
                  ? 'text-[#6C2BD9] font-bold border-b-2 border-[#6C2BD9]'
                  : 'text-slate-500 hover:text-slate-800'
              )}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Units of Measure (UOM)</span>
            </button>
          </nav>
        </div>

        {/* TAB 1: 4-TIER HIERARCHY TREE VIEW */}
        {activeTab === 'CLASSIFICATION' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left Column: Groups & Classes Tree Navigator (5 cols) */}
            <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
              <div className="p-3.5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Asset Groups & Classes</h3>
                  <p className="text-[11px] text-slate-500">Tier 1 and Tier 2 structural definitions</p>
                </div>
                <span className="text-[11px] font-semibold text-[#6C2BD9] bg-purple-50 px-2 py-0.5 rounded">
                  {hierarchy.groups.length} Groups
                </span>
              </div>

              <div className="divide-y divide-slate-100 max-h-[620px] overflow-y-auto">
                {hierarchy.groups.map(grp => {
                  const isExpanded = Boolean(expandedGroups[grp.id]);
                  const isSelected = selectedGroup?.id === grp.id;
                  const groupClasses = hierarchy.classes.filter(c => c.groupId === grp.id || c.groupCode === grp.code);

                  return (
                    <div key={grp.id} className="text-xs">
                      {/* Group Header Row */}
                      <div
                        onClick={() => {
                          setSelectedGroup(grp);
                          toggleGroupExpand(grp.id);
                        }}
                        className={clsx(
                          'p-3 flex items-center justify-between cursor-pointer transition-colors',
                          isSelected ? 'bg-purple-50/60 font-semibold' : 'hover:bg-slate-50'
                        )}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleGroupExpand(grp.id);
                            }}
                            className="p-1 text-slate-400 hover:text-slate-700 rounded"
                          >
                            {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                          </button>
                          <div className="w-6 h-6 rounded bg-purple-100 text-[#6C2BD9] font-bold flex items-center justify-center text-[10px] shrink-0">
                            {grp.code}
                          </div>
                          <div className="truncate">
                            <p className="text-slate-900 font-medium truncate">{grp.name}</p>
                            <p className="text-[10px] text-slate-400">{grp.assetType} • {grp.totalAssets} Assets</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => {
                              setEditingGroup(grp);
                              setGroupForm({
                                code: grp.code,
                                name: grp.name,
                                description: grp.description,
                                assetType: grp.assetType,
                                status: grp.status
                              });
                              setShowGroupModal(true);
                            }}
                            className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700"
                            title="Edit Group"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteGroup(grp.id, grp.name)}
                            className="p-1 hover:bg-rose-50 rounded text-slate-400 hover:text-rose-600"
                            title="Delete Group"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Nested Classes */}
                      {isExpanded && groupClasses.length > 0 && (
                        <div className="bg-slate-50/70 pl-8 pr-3 py-1 space-y-1 border-t border-slate-100">
                          {groupClasses.map(cls => (
                            <div
                              key={cls.id}
                              className="py-1.5 px-2.5 rounded-lg flex items-center justify-between text-[11px] hover:bg-white border border-transparent hover:border-slate-200 transition-colors"
                            >
                              <div className="flex items-center gap-2 truncate">
                                <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-200 px-1 rounded">{cls.code}</span>
                                <span className="font-medium text-slate-800 truncate">{cls.name}</span>
                              </div>
                              <span className="text-slate-500 text-[10px]">{cls.totalAssets} Assets</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Detailed Drill-down for Selected Group (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              {selectedGroup ? (
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
                  <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#6C2BD9] text-white">
                          {selectedGroup.code}
                        </span>
                        <h2 className="text-base font-bold text-slate-900">{selectedGroup.name}</h2>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{selectedGroup.description || 'No description provided.'}</p>
                    </div>

                    <span className={clsx(
                      'px-2.5 py-0.5 rounded-full text-xs font-semibold',
                      selectedGroup.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                    )}>
                      {selectedGroup.status}
                    </span>
                  </div>

                  {/* Hierarchy Drilldown: Categories & Subcategories */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Categories & Subcategories Under {selectedGroup.name}
                    </h4>

                    <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                      {hierarchy.categories.map(cat => (
                        <div key={cat.id} className="p-3 bg-white text-xs space-y-2">
                          <div className="flex items-center justify-between font-semibold">
                            <div className="flex items-center gap-2">
                              <Tag className="w-3.5 h-3.5 text-[#6C2BD9]" />
                              <span className="text-slate-900">{cat.name}</span>
                              <span className="text-slate-400 font-mono text-[10px]">({cat.code})</span>
                            </div>
                            <span className="text-slate-500 text-[11px]">
                              Useful Life: {cat.usefulLifeMonths} mos ({cat.depreciationMethod})
                            </span>
                          </div>

                          {/* Subcategories */}
                          <div className="pl-6 flex flex-wrap gap-2">
                            {hierarchy.subcategories
                              .filter(sub => sub.categoryId === cat.id || sub.categoryCode === cat.code)
                              .map(sub => (
                                <span
                                  key={sub.id}
                                  className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-slate-100 text-slate-700 text-[11px] border border-slate-200"
                                >
                                  <span className="font-mono text-[10px] text-slate-400">{sub.code}:</span>
                                  <span>{sub.name}</span>
                                  <span className="text-[10px] text-slate-400">({sub.totalAssets})</span>
                                </span>
                              ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-400 text-xs">
                  Select an Asset Group from the left navigator to inspect categories and rules.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: SUPPLIERS */}
        {activeTab === 'SUPPLIERS' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Registered Equipment Suppliers</h3>
                <p className="text-xs text-slate-500 mt-0.5">Authorized vendors, tax identification, and contract ratings</p>
              </div>
              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#6C2BD9] text-white text-xs font-semibold rounded-lg hover:bg-[#5B21B6]">
                <Plus className="w-3.5 h-3.5" />
                <span>Add Supplier</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500">
                  <tr>
                    <th className="py-2.5 px-4">Supplier Code</th>
                    <th className="py-2.5 px-4">Supplier Name</th>
                    <th className="py-2.5 px-4">Contact Person</th>
                    <th className="py-2.5 px-4">Email & Phone</th>
                    <th className="py-2.5 px-4">Tax ID (TRN)</th>
                    <th className="py-2.5 px-4 text-center">Rating</th>
                    <th className="py-2.5 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {suppliers.map(sup => (
                    <tr key={sup.id} className="hover:bg-slate-50/80">
                      <td className="py-3 px-4 font-mono font-bold text-[#6C2BD9]">{sup.code}</td>
                      <td className="py-3 px-4 font-semibold text-slate-900">{sup.name}</td>
                      <td className="py-3 px-4 text-slate-700">{sup.contactPerson}</td>
                      <td className="py-3 px-4 text-[11px] text-slate-600">
                        <p>{sup.email}</p>
                        <p className="text-slate-400">{sup.phone}</p>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-600">{sup.taxId}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-bold text-[11px]">
                          ★ {sup.rating}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-700">
                          {sup.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: MANUFACTURERS */}
        {activeTab === 'MANUFACTURERS' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Original Equipment Manufacturers (OEM)</h3>
                <p className="text-xs text-slate-500 mt-0.5">Global brands and technical support contacts</p>
              </div>
              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#6C2BD9] text-white text-xs font-semibold rounded-lg hover:bg-[#5B21B6]">
                <Plus className="w-3.5 h-3.5" />
                <span>Add OEM</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500">
                  <tr>
                    <th className="py-2.5 px-4">Code</th>
                    <th className="py-2.5 px-4">Manufacturer Name</th>
                    <th className="py-2.5 px-4">Country of Origin</th>
                    <th className="py-2.5 px-4">Support Contact</th>
                    <th className="py-2.5 px-4">Website</th>
                    <th className="py-2.5 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {manufacturers.map(mfg => (
                    <tr key={mfg.id} className="hover:bg-slate-50/80">
                      <td className="py-3 px-4 font-mono font-bold text-[#6C2BD9]">{mfg.code}</td>
                      <td className="py-3 px-4 font-semibold text-slate-900">{mfg.name}</td>
                      <td className="py-3 px-4 text-slate-700">{mfg.country}</td>
                      <td className="py-3 px-4 text-blue-600 hover:underline">{mfg.supportContact}</td>
                      <td className="py-3 px-4 text-slate-500">{mfg.website}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-700">
                          {mfg.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: UNITS OF MEASURE */}
        {activeTab === 'UOM' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Units of Measure (UOM)</h3>
                <p className="text-xs text-slate-500 mt-0.5">Standardized measurement units for assets, spare parts, and consumables</p>
              </div>
              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#6C2BD9] text-white text-xs font-semibold rounded-lg hover:bg-[#5B21B6]">
                <Plus className="w-3.5 h-3.5" />
                <span>Add UOM</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500">
                  <tr>
                    <th className="py-2.5 px-4">UOM Code</th>
                    <th className="py-2.5 px-4">Description</th>
                    <th className="py-2.5 px-4 text-center">Base Unit Flag</th>
                    <th className="py-2.5 px-4 text-center">Decimal Precision</th>
                    <th className="py-2.5 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {uomList.map(u => (
                    <tr key={u.id} className="hover:bg-slate-50/80">
                      <td className="py-3 px-4 font-mono font-bold text-[#6C2BD9]">{u.code}</td>
                      <td className="py-3 px-4 font-semibold text-slate-900">{u.name}</td>
                      <td className="py-3 px-4 text-center">
                        {u.isBaseUnit ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-[#6C2BD9]">BASE UNIT</span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center font-mono">{u.decimalPrecision}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-700">
                          {u.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* MODAL 1: Create / Edit Asset Group */}
      {showGroupModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FolderTree className="w-4 h-4 text-[#6C2BD9]" />
                <span>{editingGroup ? 'Edit Asset Group' : 'New Asset Group'}</span>
              </h3>
              <button onClick={() => setShowGroupModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveGroup} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Group Code *</label>
                <input
                  type="text"
                  required
                  value={groupForm.code}
                  onChange={(e) => setGroupForm({ ...groupForm, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. IT, BLD, VEH"
                  className="w-full border border-slate-200 rounded-lg px-3 py-1.5 font-mono text-xs focus:border-[#6C2BD9] outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Group Name *</label>
                <input
                  type="text"
                  required
                  value={groupForm.name}
                  onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })}
                  placeholder="e.g. Information Technology"
                  className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:border-[#6C2BD9] outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Asset Type</label>
                <select
                  value={groupForm.assetType}
                  onChange={(e) => setGroupForm({ ...groupForm, assetType: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:border-[#6C2BD9] outline-none bg-white"
                >
                  <option value="Physical">Physical Tangible Asset</option>
                  <option value="Intangible">Intangible / Digital License</option>
                  <option value="Both">Both Physical & Digital</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={groupForm.description}
                  onChange={(e) => setGroupForm({ ...groupForm, description: e.target.value })}
                  placeholder="Describe classification scope..."
                  className="w-full border border-slate-200 rounded-lg p-2 text-xs focus:border-[#6C2BD9] outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowGroupModal(false)}
                  className="px-3.5 py-1.5 border border-slate-200 text-slate-600 rounded-lg font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white rounded-lg font-semibold shadow-2xs"
                >
                  {editingGroup ? 'Save Changes' : 'Create Group'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: 6-STEP BULK IMPORT WIZARD */}
      {showImportWizard && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 space-y-5">
            {/* Wizard Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-[#6C2BD9]" />
                  <span>Controlled Bulk Master Data Import Wizard</span>
                </h3>
                <p className="text-[11px] text-slate-500">Atomic server-side validation and schema conformity engine</p>
              </div>
              <button onClick={() => setShowImportWizard(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Stepper Progress */}
            <div className="flex items-center justify-between text-xs">
              {['1. Template', '2. Upload', '3. Validate & Preview', '4. Commit', '5. Summary'].map((st, idx) => {
                const stepNum = idx + 1;
                const isCurrent = importStep === stepNum;
                const isPassed = importStep > stepNum;
                return (
                  <div key={st} className="flex items-center gap-1.5">
                    <span className={clsx(
                      'w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold',
                      isPassed ? 'bg-emerald-600 text-white' :
                      isCurrent ? 'bg-[#6C2BD9] text-white' :
                      'bg-slate-100 text-slate-400'
                    )}>
                      {isPassed ? '✓' : stepNum}
                    </span>
                    <span className={clsx(isCurrent ? 'font-bold text-[#6C2BD9]' : 'text-slate-500')}>
                      {st}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Step 1: Template Selection */}
            {importStep === 1 && (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Entity Type</label>
                  <select
                    value={importType}
                    onChange={(e) => setImportType(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2 bg-white text-slate-800"
                  >
                    <option value="ASSET_GROUP">Tier 1: Asset Groups</option>
                    <option value="ASSET_CLASS">Tier 2: Asset Classes</option>
                    <option value="ASSET_CATEGORY">Tier 3: Asset Categories</option>
                    <option value="SUPPLIERS">Suppliers Master</option>
                  </select>
                </div>

                <div className="p-4 bg-purple-50/60 border border-purple-100 rounded-xl space-y-2">
                  <p className="font-bold text-[#6C2BD9]">Download Standard Excel Template</p>
                  <p className="text-slate-600 text-[11px]">
                    The standardized template includes required headers, data validation picklists, and format instructions.
                  </p>
                  <button
                    onClick={() => showNotification('success', `Downloaded ${importType}_Template.xlsx`)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-purple-200 text-[#6C2BD9] font-semibold rounded-lg hover:bg-purple-100 shadow-2xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download {importType}_Template.xlsx</span>
                  </button>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button onClick={() => setImportStep(2)} className="px-4 py-1.5 bg-[#6C2BD9] text-white rounded-lg font-semibold hover:bg-[#5B21B6]">
                    Next: Upload File &gt;
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Upload File */}
            {importStep === 2 && (
              <div className="space-y-4 text-xs">
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center space-y-2 hover:border-[#6C2BD9] transition-colors cursor-pointer bg-slate-50/50">
                  <Upload className="w-8 h-8 text-[#6C2BD9] mx-auto" />
                  <p className="font-bold text-slate-800">Drag & drop your populated Excel / CSV file</p>
                  <p className="text-[11px] text-slate-400">Supported formats: .xlsx, .csv (Max 10 MB)</p>
                  <input
                    type="file"
                    accept=".xlsx,.csv"
                    onChange={(e) => setImportFile(e.target.files[0])}
                    className="hidden"
                    id="wizardFileInput"
                  />
                  <label htmlFor="wizardFileInput" className="inline-block mt-2 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 font-semibold rounded-lg cursor-pointer">
                    {importFile ? importFile.name : 'Browse Local Files'}
                  </label>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                  <button onClick={() => setImportStep(1)} className="px-3 py-1.5 border border-slate-200 text-slate-600 rounded-lg">
                    &lt; Back
                  </button>
                  <button
                    onClick={handleValidateImport}
                    disabled={isProcessing}
                    className="px-4 py-1.5 bg-[#6C2BD9] text-white rounded-lg font-semibold hover:bg-[#5B21B6] flex items-center gap-1.5"
                  >
                    {isProcessing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
                    <span>Validate Records &gt;</span>
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Validate & Preview Errors */}
            {importStep === 3 && validationResults && (
              <div className="space-y-3.5 text-xs">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="text-slate-400 text-[10px]">Total Parsed</p>
                    <p className="text-base font-bold text-slate-900">{validationResults.totalRows}</p>
                  </div>
                  <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-200">
                    <p className="text-emerald-700 text-[10px]">Valid Rows</p>
                    <p className="text-base font-bold text-emerald-700">{validationResults.validRows}</p>
                  </div>
                  <div className="p-2.5 bg-rose-50 rounded-lg border border-rose-200">
                    <p className="text-rose-700 text-[10px]">Invalid Rows</p>
                    <p className="text-base font-bold text-rose-700">{validationResults.invalidRows}</p>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-xl max-h-48 overflow-y-auto divide-y divide-slate-100">
                  {validationResults.results.map(r => (
                    <div key={r.row} className="p-2.5 flex items-center justify-between text-[11px]">
                      <div>
                        <span className="font-bold text-slate-700">Row {r.row}: </span>
                        <span className="font-mono">{r.data.code || '(Missing Code)'}</span> - {r.data.name}
                      </div>
                      {r.valid ? (
                        <span className="text-emerald-600 font-semibold flex items-center gap-1">
                          <Check className="w-3 h-3" /> Ready
                        </span>
                      ) : (
                        <span className="text-rose-600 font-semibold">
                          {r.errors.join(', ')}
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                  <button onClick={() => setImportStep(2)} className="px-3 py-1.5 border border-slate-200 text-slate-600 rounded-lg">
                    &lt; Back
                  </button>
                  <button
                    onClick={handleCommitImport}
                    disabled={validationResults.validRows === 0 || isProcessing}
                    className="px-4 py-1.5 bg-[#6C2BD9] text-white rounded-lg font-semibold hover:bg-[#5B21B6] disabled:opacity-40"
                  >
                    Commit {validationResults.validRows} Valid Records &gt;
                  </button>
                </div>
              </div>
            )}

            {/* Step 5: Summary Report */}
            {importStep === 5 && importSummary && (
              <div className="space-y-4 text-center py-4 text-xs">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                <h4 className="text-base font-bold text-slate-900">Import Batch Committed</h4>
                <p className="text-slate-600">
                  Successfully imported <strong>{importSummary.committedCount}</strong> records into master classification.
                </p>

                <div className="pt-3 border-t border-slate-100 flex justify-center">
                  <button
                    onClick={() => setShowImportWizard(false)}
                    className="px-5 py-2 bg-[#6C2BD9] text-white font-semibold rounded-lg hover:bg-[#5B21B6]"
                  >
                    Done & View Hierarchy
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default MasterDataSetup;
