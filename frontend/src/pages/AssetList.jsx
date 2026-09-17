import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { StatusBadge } from '../components/common/StatusBadge';
import {
  Package,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Eye,
  Edit3,
  Trash2,
  RefreshCw,
  RotateCcw,
  DollarSign,
  CheckCircle2,
  AlertTriangle,
  Building,
  User,
  X,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  ArrowLeftRight,
  Wrench,
  FileText,
  History,
  MapPin,
  ExternalLink,
  ShieldCheck,
  Check,
  Laptop,
  Smartphone,
  Armchair,
  Monitor,
  Radio,
  Car,
  Printer,
  CreditCard,
  Lock
} from 'lucide-react';

// Mock initial assets matching reference screenshot exactly
const INITIAL_MOCK_ASSETS = [
  {
    id: 'ast-001',
    _id: 'ast-001',
    assetId: 'AST-000128',
    description: 'Dell Latitude 7450',
    name: 'Dell Latitude 7450',
    categoryName: 'Laptop',
    tagNumber: 'RFID-981245',
    barcode: 'QR-000128',
    rfidEpc: 'E28011700000001A2B3C',
    serialNumber: 'DL7450-92118',
    model: 'Latitude 7450',
    manufacturer: 'Dell',
    locationStr: 'Dubai HQ Floor 3 / Room 312',
    siteName: 'Dubai HQ',
    buildingName: 'Building A',
    floorRoom: 'Floor 3 / Room 312',
    departmentName: 'IT',
    costCenterCode: 'IT-001',
    custodianName: 'John Doe',
    assignedDate: '10 Jan 2024',
    lifecycleStatus: 'IN_SERVICE',
    condition: 'Good',
    acquisitionDate: '10 Jan 2024',
    acquisitionValue: 4500,
    currency: 'AED',
    warrantyStatus: 'Active',
    warrantyStart: '15 Jan 2024',
    warrantyEnd: '14 Jan 2027',
    nextServiceDate: '15 Oct 2026',
    maintType: 'Preventive',
    checklistName: 'Laptop PM Checklist',
    icon: Laptop
  },
  {
    id: 'ast-002',
    _id: 'ast-002',
    assetId: 'AST-000131',
    description: 'iPhone 15 Pro',
    name: 'iPhone 15 Pro',
    categoryName: 'Mobile Device',
    tagNumber: 'QR-000131',
    barcode: 'QR-000131',
    rfidEpc: 'E28011700000001A999C',
    serialNumber: 'IP15P-88201',
    model: '15 Pro 256GB',
    manufacturer: 'Apple',
    locationStr: 'Dubai HQ Floor 3',
    siteName: 'Dubai HQ',
    buildingName: 'Building B',
    floorRoom: 'Floor 3',
    departmentName: 'Executive',
    costCenterCode: 'EXEC-001',
    custodianName: 'Ahmed Khan',
    assignedDate: '12 Jan 2024',
    lifecycleStatus: 'IN_SERVICE',
    condition: 'Good',
    acquisitionDate: '12 Jan 2024',
    acquisitionValue: 4000,
    currency: 'AED',
    warrantyStatus: 'Active',
    warrantyStart: '12 Jan 2024',
    warrantyEnd: '11 Jan 2026',
    nextServiceDate: '20 Nov 2026',
    maintType: 'Inspection',
    checklistName: 'Mobile Security Audit',
    icon: Smartphone
  },
  {
    id: 'ast-003',
    _id: 'ast-003',
    assetId: 'AST-000145',
    description: 'Ergonomic Chair',
    name: 'Ergonomic Chair',
    categoryName: 'Furniture',
    tagNumber: 'QR-000145',
    barcode: 'QR-000145',
    rfidEpc: 'E28011700000001A888C',
    serialNumber: 'HM-AER-4401',
    model: 'Aeron Size B',
    manufacturer: 'Herman Miller',
    locationStr: 'Dubai HQ Floor 3',
    siteName: 'Dubai HQ',
    buildingName: 'Building A',
    floorRoom: 'Floor 3 / Zone B',
    departmentName: 'HR',
    costCenterCode: 'HR-002',
    custodianName: 'Sarah Ali',
    assignedDate: '18 Jan 2024',
    lifecycleStatus: 'IN_SERVICE',
    condition: 'Good',
    acquisitionDate: '18 Jan 2024',
    acquisitionValue: 1200,
    currency: 'AED',
    warrantyStatus: 'Active',
    warrantyStart: '18 Jan 2024',
    warrantyEnd: '17 Jan 2034',
    nextServiceDate: '01 Dec 2026',
    maintType: 'Inspection',
    checklistName: 'Furniture Safety Check',
    icon: Armchair
  },
  {
    id: 'ast-004',
    _id: 'ast-004',
    assetId: 'AST-000156',
    description: '27" Monitor',
    name: '27" Monitor',
    categoryName: 'Monitor',
    tagNumber: 'RFID-981156',
    barcode: 'QR-000156',
    rfidEpc: 'E28011700000001A777C',
    serialNumber: 'DELL-U2723-990',
    model: 'UltraSharp U2723QE',
    manufacturer: 'Dell',
    locationStr: 'Dubai HQ Floor 3',
    siteName: 'Dubai HQ',
    buildingName: 'Building A',
    floorRoom: 'Floor 3 / Desk 312',
    departmentName: 'IT',
    costCenterCode: 'IT-001',
    custodianName: 'John Doe',
    assignedDate: '18 Jan 2024',
    lifecycleStatus: 'IN_SERVICE',
    condition: 'Good',
    acquisitionDate: '18 Jan 2024',
    acquisitionValue: 1800,
    currency: 'AED',
    warrantyStatus: 'Active',
    warrantyStart: '18 Jan 2024',
    warrantyEnd: '17 Jan 2027',
    nextServiceDate: '15 Oct 2026',
    maintType: 'Preventive',
    checklistName: 'Monitor Display Diagnostic',
    icon: Monitor
  },
  {
    id: 'ast-005',
    _id: 'ast-005',
    assetId: 'AST-000201',
    description: 'Generator 100 KVA',
    name: 'Generator 100 KVA',
    categoryName: 'Generator',
    tagNumber: 'RFID-98201',
    barcode: 'QR-000201',
    rfidEpc: 'E28011700000001A666C',
    serialNumber: 'CAT-100KVA-551',
    model: 'C4.4 DE110E',
    manufacturer: 'Caterpillar',
    locationStr: 'Warehouse',
    siteName: 'Dubai HQ',
    buildingName: 'Utility Yard',
    floorRoom: 'Ground / Bay 01',
    departmentName: 'Facilities',
    costCenterCode: 'FAC-001',
    custodianName: 'Robert Chen',
    assignedDate: '05 Sep 2024',
    lifecycleStatus: 'UNDER_MAINTENANCE',
    condition: 'Fair',
    acquisitionDate: '05 Sep 2024',
    acquisitionValue: 85000,
    currency: 'AED',
    warrantyStatus: 'Active',
    warrantyStart: '05 Sep 2024',
    warrantyEnd: '04 Sep 2027',
    nextServiceDate: '18 Sep 2026',
    maintType: 'Overhaul',
    checklistName: 'Diesel Engine Overhaul',
    icon: Radio
  },
  {
    id: 'ast-006',
    _id: 'ast-006',
    assetId: 'AST-000212',
    description: 'Forklift - Toyota',
    name: 'Forklift - Toyota',
    categoryName: 'Vehicle',
    tagNumber: 'RFID-00212',
    barcode: 'QR-000212',
    rfidEpc: 'E28011700000001A555C',
    serialNumber: 'TOY-FL8-22091',
    model: '8FBE20 2-Ton',
    manufacturer: 'Toyota',
    locationStr: 'Yard - Jebel Ali',
    siteName: 'Jebel Ali Site',
    buildingName: 'Logistics Hub',
    floorRoom: 'Outdoor Staging Yard',
    departmentName: 'Logistics',
    costCenterCode: 'LOG-003',
    custodianName: 'David Miller',
    assignedDate: '12 Mar 2024',
    lifecycleStatus: 'IN_SERVICE',
    condition: 'Good',
    acquisitionDate: '12 Mar 2024',
    acquisitionValue: 120000,
    currency: 'AED',
    warrantyStatus: 'Active',
    warrantyStart: '12 Mar 2024',
    warrantyEnd: '11 Mar 2027',
    nextServiceDate: '30 Oct 2026',
    maintType: 'Preventive',
    checklistName: 'Heavy Vehicle Safety PM',
    icon: Car
  },
  {
    id: 'ast-007',
    _id: 'ast-007',
    assetId: 'AST-000221',
    description: 'HP LaserJet M404',
    name: 'HP LaserJet M404',
    categoryName: 'Printer',
    tagNumber: 'QR-00221',
    barcode: 'QR-000221',
    rfidEpc: 'E28011700000001A444C',
    serialNumber: 'VNB3B09912',
    model: 'LaserJet Pro M404dn',
    manufacturer: 'HP',
    locationStr: 'Print Room',
    siteName: 'Dubai HQ',
    buildingName: 'Building A',
    floorRoom: 'Floor 3 / Room 301',
    departmentName: 'Administration',
    costCenterCode: 'ADMIN-001',
    custodianName: 'Elena Rostova',
    assignedDate: '15 Feb 2024',
    lifecycleStatus: 'IN_SERVICE',
    condition: 'Good',
    acquisitionDate: '15 Feb 2024',
    acquisitionValue: 1500,
    currency: 'AED',
    warrantyStatus: 'Active',
    warrantyStart: '15 Feb 2024',
    warrantyEnd: '14 Feb 2026',
    nextServiceDate: '12 Nov 2026',
    maintType: 'Preventive',
    checklistName: 'Print Head & Roller Cleaning',
    icon: Printer
  },
  {
    id: 'ast-008',
    _id: 'ast-008',
    assetId: 'AST-000230',
    description: 'Access Card',
    name: 'Access Card',
    categoryName: 'Access Control',
    tagNumber: 'QR-002230',
    barcode: 'QR-002230',
    rfidEpc: 'E28011700000001A333C',
    serialNumber: 'HID-iCLASS-900',
    model: 'iCLASS Seos 8K',
    manufacturer: 'HID Global',
    locationStr: 'Dubai HQ',
    siteName: 'Dubai HQ',
    buildingName: 'Building A',
    floorRoom: 'Security Reception',
    departmentName: 'Security',
    costCenterCode: 'SEC-001',
    custodianName: 'John Doe',
    assignedDate: '10 Jan 2024',
    lifecycleStatus: 'IN_SERVICE',
    condition: 'Good',
    acquisitionDate: '10 Jan 2024',
    acquisitionValue: 150,
    currency: 'AED',
    warrantyStatus: 'Active',
    warrantyStart: '10 Jan 2024',
    warrantyEnd: '09 Jan 2029',
    nextServiceDate: '01 Jan 2027',
    maintType: 'Audit',
    checklistName: 'Badge Certificate Renewal',
    icon: CreditCard
  }
];

export function AssetList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  const userRoleCode = user?.role?.code || 'SYS_ADMIN';
  const canCreate = ['SYS_ADMIN', 'ASSET_ADMIN', 'RECEIVING'].includes(userRoleCode);
  const canEdit = ['SYS_ADMIN', 'ASSET_ADMIN', 'TECHNICIAN', 'RECEIVING'].includes(userRoleCode);
  const canDelete = ['SYS_ADMIN', 'ASSET_ADMIN'].includes(userRoleCode);

  // Parse initial filter params from URL
  const initialStatusParam = searchParams.get('status') || 'ALL';
  const initialCategoryParam = searchParams.get('category') || 'All';
  const initialSearchParam = searchParams.get('search') || (searchParams.get('filter') === 'my' ? 'assigned' : '');

  // Core Assets & Pagination State
  const [assets, setAssets] = useState(INITIAL_MOCK_ASSETS);
  const [loading, setLoading] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(INITIAL_MOCK_ASSETS[0]);
  const [activeTab, setActiveTab] = useState('ALL');
  const [selectedRowIds, setSelectedRowIds] = useState([]);
  const [openActionMenuId, setOpenActionMenuId] = useState(null);

  // Filters State
  const [search, setSearch] = useState(initialSearchParam);
  const [selectedCategory, setSelectedCategory] = useState(initialCategoryParam);
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [selectedAssetType, setSelectedAssetType] = useState('All');
  const [selectedDepartment, setSelectedDepartment] = useState('All');

  // Pagination State
  const [perPage, setPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // 360° Detail Panel Tabs
  const [detailPanelTab, setDetailPanelTab] = useState('Details');

  // Toast
  const [toast, setToast] = useState(null);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // Sync active status tab with state
  useEffect(() => {
    if (initialStatusParam !== 'ALL') {
      setActiveTab(initialStatusParam);
    }
  }, [initialStatusParam]);

  // Filtered Assets Computation
  const filteredAssets = useMemo(() => {
    return assets.filter(a => {
      // Tab filter
      if (activeTab === 'IN_USE' && a.lifecycleStatus !== 'IN_SERVICE') return false;
      if (activeTab === 'UNDER_MAINTENANCE' && a.lifecycleStatus !== 'UNDER_MAINTENANCE') return false;
      if (activeTab === 'OVERDUE' && a.lifecycleStatus !== 'OVERDUE') return false;
      if (activeTab === 'PENDING_DISPOSAL' && a.lifecycleStatus !== 'DISPOSAL') return false;
      if (activeTab === 'DISPOSED' && a.lifecycleStatus !== 'DISPOSED') return false;

      // Dropdown filters
      if (selectedCategory !== 'All' && a.categoryName !== selectedCategory) return false;
      if (selectedStatus !== 'All' && a.lifecycleStatus !== selectedStatus) return false;
      if (selectedLocation !== 'All' && !a.locationStr.toLowerCase().includes(selectedLocation.toLowerCase())) return false;
      if (selectedDepartment !== 'All' && a.departmentName !== selectedDepartment) return false;

      // Search text filter
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchId = a.assetId.toLowerCase().includes(q);
        const matchName = a.description.toLowerCase().includes(q);
        const matchSerial = (a.serialNumber || '').toLowerCase().includes(q);
        const matchTag = (a.tagNumber || '').toLowerCase().includes(q);
        const matchCust = (a.custodianName || '').toLowerCase().includes(q);
        if (!matchId && !matchName && !matchSerial && !matchTag && !matchCust) return false;
      }

      return true;
    });
  }, [assets, activeTab, selectedCategory, selectedStatus, selectedLocation, selectedDepartment, search]);

  // Handle Select All Checkbox
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRowIds(filteredAssets.map(a => a.id));
    } else {
      setSelectedRowIds([]);
    }
  };

  const handleSelectRow = (id) => {
    if (selectedRowIds.includes(id)) {
      setSelectedRowIds(selectedRowIds.filter(i => i !== id));
    } else {
      setSelectedRowIds([...selectedRowIds, id]);
    }
  };

  const handleApplyFilters = () => {
    setCurrentPage(1);
    showToast('success', 'Filters applied successfully!');
  };

  const handleClearFilters = () => {
    setSearch('');
    setSelectedCategory('All');
    setSelectedStatus('All');
    setSelectedLocation('All');
    setSelectedAssetType('All');
    setSelectedDepartment('All');
    setActiveTab('ALL');
  };

  const handleExport = () => {
    const headers = ['Asset ID', 'Asset Name', 'Category', 'Tag/RFID', 'Location', 'Status', 'Condition', 'Acquisition Date', 'Value (AED)'];
    const rows = filteredAssets.map(a => [
      a.assetId,
      a.name,
      a.categoryName,
      a.tagNumber,
      a.locationStr,
      a.lifecycleStatus,
      a.condition,
      a.acquisitionDate,
      a.acquisitionValue
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Asset360_Register_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4 pb-12 font-sans text-slate-900 select-none">
      
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl border shadow-xl flex items-center gap-3 backdrop-blur-md transition-all animate-bounce ${
          toast.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <AlertTriangle className="w-5 h-5 text-rose-600" />}
          <span className="text-xs font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Top Header Bar & Top Action Buttons (Callout 7) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Asset Register</h1>
          <p className="text-xs text-slate-500 font-medium">View, manage and track all organizational assets.</p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExport}
            className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-500" /> Export
          </button>

          <button
            onClick={() => canCreate ? navigate('/assets/new') : null}
            disabled={!canCreate}
            className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md transition-all ${
              canCreate
                ? 'bg-[#6C2BD9] hover:bg-[#5b21b6] text-white cursor-pointer'
                : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-80'
            }`}
            title={canCreate ? 'Register a new asset' : 'Role permission restricted'}
          >
            {canCreate ? <Plus className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            + New Asset
          </button>

          <button
            onClick={() => navigate('/receiving')}
            className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
          >
            <Upload className="w-4 h-4 text-slate-500" /> Import
          </button>
        </div>
      </div>

      {/* 1. Summary Cards (Callout 1) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Card 1: Total Assets */}
        <div
          onClick={() => setActiveTab('ALL')}
          className={`bg-white border p-3.5 rounded-2xl shadow-2xs hover:shadow-md transition-all cursor-pointer flex items-center justify-between group ${activeTab === 'ALL' ? 'border-[#6C2BD9] ring-2 ring-[#6C2BD9]/15' : 'border-slate-200'}`}
        >
          <div className="space-y-1">
            <span className="text-xl font-black text-slate-900 block leading-none">12,458</span>
            <span className="text-xs font-bold text-slate-600 block">Total Assets</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#6C2BD9] text-white flex items-center justify-center flex-shrink-0 shadow-sm">
            <Package className="w-5 h-5" />
          </div>
        </div>

        {/* Card 2: In Use */}
        <div
          onClick={() => setActiveTab('IN_USE')}
          className={`bg-white border p-3.5 rounded-2xl shadow-2xs hover:shadow-md transition-all cursor-pointer flex items-center justify-between group ${activeTab === 'IN_USE' ? 'border-emerald-500 ring-2 ring-emerald-500/15' : 'border-slate-200'}`}
        >
          <div className="space-y-1">
            <span className="text-xl font-black text-slate-900 block leading-none">11,230</span>
            <span className="text-xs font-bold text-slate-600 block">In Use</span>
            <span className="text-[10px] text-slate-500 font-semibold block">90.1%</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3: Under Maintenance */}
        <div
          onClick={() => setActiveTab('UNDER_MAINTENANCE')}
          className={`bg-white border p-3.5 rounded-2xl shadow-2xs hover:shadow-md transition-all cursor-pointer flex items-center justify-between group ${activeTab === 'UNDER_MAINTENANCE' ? 'border-amber-500 ring-2 ring-amber-500/15' : 'border-slate-200'}`}
        >
          <div className="space-y-1">
            <span className="text-xl font-black text-slate-900 block leading-none">652</span>
            <span className="text-xs font-bold text-slate-600 block">Under Maintenance</span>
            <span className="text-[10px] text-slate-500 font-semibold block">5.2%</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
            <Wrench className="w-5 h-5" />
          </div>
        </div>

        {/* Card 4: Overdue */}
        <div
          onClick={() => setActiveTab('OVERDUE')}
          className={`bg-white border p-3.5 rounded-2xl shadow-2xs hover:shadow-md transition-all cursor-pointer flex items-center justify-between group ${activeTab === 'OVERDUE' ? 'border-rose-500 ring-2 ring-rose-500/15' : 'border-slate-200'}`}
        >
          <div className="space-y-1">
            <span className="text-xl font-black text-slate-900 block leading-none">276</span>
            <span className="text-xs font-bold text-slate-600 block">Overdue</span>
            <span className="text-[10px] text-slate-500 font-semibold block">2.2%</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        {/* Card 5: Pending Disposal */}
        <div
          onClick={() => setActiveTab('PENDING_DISPOSAL')}
          className={`bg-white border p-3.5 rounded-2xl shadow-2xs hover:shadow-md transition-all cursor-pointer flex items-center justify-between group ${activeTab === 'PENDING_DISPOSAL' ? 'border-blue-500 ring-2 ring-blue-500/15' : 'border-slate-200'}`}
        >
          <div className="space-y-1">
            <span className="text-xl font-black text-slate-900 block leading-none">180</span>
            <span className="text-xs font-bold text-slate-600 block">Pending Disposal</span>
            <span className="text-[10px] text-slate-500 font-semibold block">1.4%</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
            <RotateCcw className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 2. Asset Status Tabs (Callout 2) */}
      <div className="border-b border-slate-200 flex items-center gap-2 overflow-x-auto text-xs font-bold scrollbar-none">
        {[
          { id: 'ALL', label: 'All Assets (12,458)' },
          { id: 'IN_USE', label: 'In Use (11,230)' },
          { id: 'UNDER_MAINTENANCE', label: 'Under Maintenance (652)' },
          { id: 'OVERDUE', label: 'Overdue (276)' },
          { id: 'PENDING_DISPOSAL', label: 'Pending Disposal (180)' },
          { id: 'DISPOSED', label: 'Disposed (120)' }
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-t-xl transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-purple-50 text-[#6C2BD9] font-extrabold border-b-2 border-[#6C2BD9]'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 3. Search and Filters Palette (Callout 3) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by asset name, asset ID, serial number, tag, category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#6C2BD9] transition-all"
          />
        </div>

        {/* Dropdowns Palette Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 items-center text-xs">
          {/* Category */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-800 font-semibold focus:border-[#6C2BD9]"
            >
              <option value="All">All</option>
              <option value="Laptop">Laptop</option>
              <option value="Mobile Device">Mobile Device</option>
              <option value="Furniture">Furniture</option>
              <option value="Monitor">Monitor</option>
              <option value="Generator">Generator</option>
              <option value="Vehicle">Vehicle</option>
              <option value="Printer">Printer</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-800 font-semibold focus:border-[#6C2BD9]"
            >
              <option value="All">All</option>
              <option value="IN_SERVICE">In Use</option>
              <option value="UNDER_MAINTENANCE">Under Maintenance</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="DISPOSAL">Pending Disposal</option>
            </select>
          </div>

          {/* Location */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Location</label>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-800 font-semibold focus:border-[#6C2BD9]"
            >
              <option value="All">All</option>
              <option value="Dubai HQ">Dubai HQ</option>
              <option value="Warehouse">Warehouse</option>
              <option value="Jebel Ali">Yard - Jebel Ali</option>
            </select>
          </div>

          {/* Asset Type */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Asset Type</label>
            <select
              value={selectedAssetType}
              onChange={(e) => setSelectedAssetType(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-800 font-semibold focus:border-[#6C2BD9]"
            >
              <option value="All">All</option>
              <option value="IT Equipment">IT Equipment</option>
              <option value="Heavy Machinery">Heavy Machinery</option>
              <option value="Facilities">Facilities</option>
            </select>
          </div>

          {/* Department */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Department</label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-800 font-semibold focus:border-[#6C2BD9]"
            >
              <option value="All">All</option>
              <option value="IT">IT</option>
              <option value="HR">HR</option>
              <option value="Logistics">Logistics</option>
              <option value="Facilities">Facilities</option>
            </select>
          </div>

          {/* Filter Action Buttons */}
          <div className="flex items-center gap-2 pt-4">
            <button
              onClick={handleClearFilters}
              className="text-xs text-slate-500 hover:text-slate-800 underline font-semibold cursor-pointer"
            >
              Clear
            </button>
            <button
              onClick={handleApplyFilters}
              className="px-4 py-1.5 bg-[#6C2BD9] hover:bg-[#5b21b6] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
            >
              Apply
            </button>
          </div>
        </div>
      </div>

      {/* Main Split Content: Table Left (8 cols), Right Panel (4 cols) if selected */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* 4. Asset Register List Table (Callout 4) */}
        <div className={`transition-all ${selectedAsset ? 'lg:col-span-8' : 'lg:col-span-12'}`}>
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[10px]">
                    <th className="py-3 px-3 text-center w-8">
                      <input
                        type="checkbox"
                        onChange={handleSelectAll}
                        checked={selectedRowIds.length > 0 && selectedRowIds.length === filteredAssets.length}
                        className="rounded text-[#6C2BD9] focus:ring-[#6C2BD9]"
                      />
                    </th>
                    <th className="py-3 px-3">Asset ID</th>
                    <th className="py-3 px-3">Asset Name</th>
                    <th className="py-3 px-3">Category</th>
                    <th className="py-3 px-3">Tag / RFID</th>
                    <th className="py-3 px-3">Location</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Condition</th>
                    <th className="py-3 px-3">Acquisition Date</th>
                    <th className="py-3 px-3 text-right">Value (AED)</th>
                    <th className="py-3 px-3 text-center">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filteredAssets.map((asset) => {
                    const isSelected = selectedAsset?.id === asset.id;
                    const isChecked = selectedRowIds.includes(asset.id);
                    const Icon = asset.icon || Package;

                    return (
                      <tr
                        key={asset.id}
                        className={`transition-colors ${isSelected ? 'bg-purple-50/70 border-l-4 border-l-[#6C2BD9]' : 'hover:bg-slate-50'}`}
                      >
                        {/* Checkbox */}
                        <td className="py-3 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleSelectRow(asset.id)}
                            className="rounded text-[#6C2BD9] focus:ring-[#6C2BD9]"
                          />
                        </td>

                        {/* Asset ID Link */}
                        <td className="py-3 px-3 font-mono font-bold text-[#6C2BD9]">
                          <span
                            onClick={() => setSelectedAsset(asset)}
                            className="hover:underline cursor-pointer flex items-center gap-1"
                          >
                            {asset.assetId}
                          </span>
                        </td>

                        {/* Asset Name + Image Thumbnail */}
                        <td className="py-3 px-3">
                          <div
                            onClick={() => setSelectedAsset(asset)}
                            className="flex items-center gap-2.5 cursor-pointer group"
                          >
                            <div className="w-8 h-8 rounded-lg bg-purple-100 text-[#6C2BD9] flex items-center justify-center flex-shrink-0 border border-purple-200">
                              <Icon className="w-4 h-4" />
                            </div>
                            <span className="font-bold text-slate-900 group-hover:text-[#6C2BD9] truncate">
                              {asset.name}
                            </span>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-3 px-3 text-slate-600 font-semibold">{asset.categoryName}</td>

                        {/* Tag / RFID */}
                        <td className="py-3 px-3 font-mono text-slate-600 text-[11px]">{asset.tagNumber}</td>

                        {/* Location */}
                        <td className="py-3 px-3 text-slate-600 max-w-[150px] truncate">{asset.locationStr}</td>

                        {/* Status */}
                        <td className="py-3 px-3">
                          <StatusBadge status={asset.lifecycleStatus} />
                        </td>

                        {/* Condition */}
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {asset.condition}
                          </span>
                        </td>

                        {/* Acquisition Date */}
                        <td className="py-3 px-3 text-slate-500 text-[11px]">{asset.acquisitionDate}</td>

                        {/* Value AED */}
                        <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                          {asset.acquisitionValue.toLocaleString()}
                        </td>

                        {/* Actions (3-Dots Dropdown Menu Callout 5) */}
                        <td className="py-3 px-3 text-center relative">
                          <button
                            onClick={() => setOpenActionMenuId(openActionMenuId === asset.id ? null : asset.id)}
                            className="p-1 rounded-lg hover:bg-slate-200 text-slate-500 cursor-pointer transition-colors"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {openActionMenuId === asset.id && (
                            <div className="absolute right-3 top-full mt-1 w-44 bg-white border border-slate-200 rounded-2xl shadow-xl p-1.5 space-y-0.5 z-50 text-left">
                              <button
                                onClick={() => {
                                  setSelectedAsset(asset);
                                  setOpenActionMenuId(null);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-[#6C2BD9] rounded-xl transition-all"
                              >
                                <Eye className="w-3.5 h-3.5" /> View Details
                              </button>

                              {canEdit && (
                                <button
                                  onClick={() => {
                                    setOpenActionMenuId(null);
                                    navigate(`/assets/edit/${asset.assetId || asset.id}`);
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-[#6C2BD9] rounded-xl transition-all"
                                >
                                  <Edit3 className="w-3.5 h-3.5" /> Edit Asset
                                </button>
                              )}

                              <button
                                onClick={() => {
                                  setOpenActionMenuId(null);
                                  navigate('/movements');
                                }}
                                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-[#6C2BD9] rounded-xl transition-all"
                              >
                                <ArrowLeftRight className="w-3.5 h-3.5" /> Assign / Transfer
                              </button>

                              <button
                                onClick={() => {
                                  setOpenActionMenuId(null);
                                  navigate('/maintenance');
                                }}
                                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-[#6C2BD9] rounded-xl transition-all"
                              >
                                <Wrench className="w-3.5 h-3.5" /> Send for Maintenance
                              </button>

                              <button
                                onClick={() => {
                                  setOpenActionMenuId(null);
                                  navigate('/disposals');
                                }}
                                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-rose-50 hover:text-rose-700 rounded-xl transition-all"
                              >
                                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" /> Request Disposal
                              </button>

                              <button
                                onClick={() => {
                                  setOpenActionMenuId(null);
                                  setSelectedAsset(asset);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-[#6C2BD9] rounded-xl transition-all"
                              >
                                <FileText className="w-3.5 h-3.5" /> View Documents
                              </button>

                              <button
                                onClick={() => {
                                  setOpenActionMenuId(null);
                                  setSelectedAsset(asset);
                                  setDetailPanelTab('History');
                                }}
                                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-[#6C2BD9] rounded-xl transition-all"
                              >
                                <History className="w-3.5 h-3.5" /> View History
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="bg-slate-50 border-t border-slate-200 px-4 py-3 flex items-center justify-between text-xs text-slate-500">
              <span>Showing 1 to {filteredAssets.length} of 12,458 assets</span>
              <div className="flex items-center gap-2">
                <span>Show</span>
                <select
                  value={perPage}
                  onChange={(e) => setPerPage(Number(e.target.value))}
                  className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-700 font-semibold"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
                <span>per page</span>

                <div className="flex items-center gap-1 pl-2">
                  <button className="p-1 rounded bg-white border border-slate-200 text-slate-600"><ChevronLeft className="w-3.5 h-3.5" /></button>
                  <span className="px-2 font-bold text-[#6C2BD9]">1</span>
                  <span className="px-1 text-slate-400">2</span>
                  <span className="px-1 text-slate-400">3</span>
                  <span className="px-1 text-slate-400">4</span>
                  <span className="px-1 text-slate-400">... 1,246</span>
                  <button className="p-1 rounded bg-white border border-slate-200 text-slate-600"><ChevronRight className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 6. Asset 360° Right Detail Panel (Callout 6) */}
        {selectedAsset && (
          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-4 shadow-xl space-y-4 relative sticky top-20 animate-in fade-in zoom-in duration-150">
            {/* Close Panel Button */}
            <button
              onClick={() => setSelectedAsset(null)}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Asset Header Info Card */}
            <div className="flex items-start gap-3 border-b border-slate-100 pb-3">
              <div className="w-14 h-14 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-[#6C2BD9] flex-shrink-0 shadow-2xs">
                {React.createElement(selectedAsset.icon || Package, { className: "w-7 h-7" })}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-black text-slate-900">{selectedAsset.name}</h3>
                </div>
                <span className="text-xs font-mono font-bold text-[#6C2BD9] block">{selectedAsset.assetId}</span>

                <div className="flex items-center gap-1.5 pt-1">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    ✓ In Use
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    ✓ Good
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium pt-1">
                  {selectedAsset.categoryName} | {selectedAsset.manufacturer} | {selectedAsset.model}
                </p>
              </div>
            </div>

            {/* Panel Tabs (Details, Location, Maintenance, History) */}
            <div className="flex items-center gap-2 border-b border-slate-200 text-xs font-bold">
              {['Details', 'Location', 'Maintenance', 'History'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setDetailPanelTab(tab)}
                  className={`pb-2 transition-all cursor-pointer ${
                    detailPanelTab === tab
                      ? 'text-[#6C2BD9] border-b-2 border-[#6C2BD9] font-black'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* TAB CONTENT: DETAILS */}
            {detailPanelTab === 'Details' && (
              <div className="space-y-4 text-xs">
                {/* Section 1: Asset Information */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5 text-[#6C2BD9]" /> Asset Information
                    </span>
                    {canEdit && (
                      <button
                        onClick={() => navigate(`/assets/${selectedAsset.id}`)}
                        className="px-2.5 py-1 rounded-lg bg-purple-100 hover:bg-purple-200 text-[#6C2BD9] text-xs font-bold transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
                      >
                        <Edit3 className="w-3 h-3 text-[#6C2BD9]" /> Edit
                      </button>
                    )}
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-slate-700 divide-y divide-slate-200/60">
                    <div className="grid grid-cols-[140px_1fr] gap-x-2 py-1.5 items-center">
                      <span className="text-slate-500 font-medium">Asset ID</span>
                      <span className="font-mono font-bold text-slate-900 text-left">{selectedAsset.assetId}</span>
                    </div>
                    <div className="grid grid-cols-[140px_1fr] gap-x-2 py-1.5 items-center">
                      <span className="text-slate-500 font-medium">Serial Number</span>
                      <span className="font-mono font-bold text-slate-900 text-left">{selectedAsset.serialNumber}</span>
                    </div>
                    <div className="grid grid-cols-[140px_1fr] gap-x-2 py-1.5 items-center">
                      <span className="text-slate-500 font-medium">RFID EPC</span>
                      <span className="font-mono font-bold text-[#6C2BD9] text-left truncate">{selectedAsset.rfidEpc}</span>
                    </div>
                    <div className="grid grid-cols-[140px_1fr] gap-x-2 py-1.5 items-center">
                      <span className="text-slate-500 font-medium">Barcode / QR</span>
                      <span className="font-mono font-bold text-slate-900 text-left">{selectedAsset.barcode}</span>
                    </div>
                    <div className="grid grid-cols-[140px_1fr] gap-x-2 py-1.5 items-center">
                      <span className="text-slate-500 font-medium">Category</span>
                      <span className="font-bold text-slate-900 text-left">IT &gt; {selectedAsset.categoryName}</span>
                    </div>
                    <div className="grid grid-cols-[140px_1fr] gap-x-2 py-1.5 items-center">
                      <span className="text-slate-500 font-medium">Model</span>
                      <span className="font-bold text-slate-900 text-left">{selectedAsset.model}</span>
                    </div>
                    <div className="grid grid-cols-[140px_1fr] gap-x-2 py-1.5 items-center">
                      <span className="text-slate-500 font-medium">Manufacturer</span>
                      <span className="font-bold text-slate-900 text-left">{selectedAsset.manufacturer}</span>
                    </div>
                    <div className="grid grid-cols-[140px_1fr] gap-x-2 py-1.5 items-center">
                      <span className="text-slate-500 font-medium">Status</span>
                      <span className="font-bold text-emerald-600 text-left">{selectedAsset.lifecycleStatus}</span>
                    </div>
                    <div className="grid grid-cols-[140px_1fr] gap-x-2 py-1.5 items-center">
                      <span className="text-slate-500 font-medium">Condition</span>
                      <span className="font-bold text-emerald-600 text-left">{selectedAsset.condition}</span>
                    </div>
                  </div>
                </div>

                {/* Section 2: Location & Ownership */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#6C2BD9]" /> Location &amp; Ownership
                    </span>
                    <button
                      onClick={() => navigate('/rtls/map')}
                      className="px-2.5 py-1 rounded-lg bg-purple-100 hover:bg-purple-200 text-[#6C2BD9] text-xs font-bold transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
                    >
                      View on Map
                    </button>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-slate-700 divide-y divide-slate-200/60">
                    <div className="grid grid-cols-[140px_1fr] gap-x-2 py-1.5 items-center">
                      <span className="text-slate-500 font-medium">Site</span>
                      <span className="font-bold text-slate-900 text-left">{selectedAsset.siteName}</span>
                    </div>
                    <div className="grid grid-cols-[140px_1fr] gap-x-2 py-1.5 items-center">
                      <span className="text-slate-500 font-medium">Building</span>
                      <span className="font-bold text-slate-900 text-left">{selectedAsset.buildingName}</span>
                    </div>
                    <div className="grid grid-cols-[140px_1fr] gap-x-2 py-1.5 items-center">
                      <span className="text-slate-500 font-medium">Floor / Room</span>
                      <span className="font-bold text-slate-900 text-left">{selectedAsset.floorRoom}</span>
                    </div>
                    <div className="grid grid-cols-[140px_1fr] gap-x-2 py-1.5 items-center">
                      <span className="text-slate-500 font-medium">Department</span>
                      <span className="font-bold text-slate-900 text-left">{selectedAsset.departmentName}</span>
                    </div>
                    <div className="grid grid-cols-[140px_1fr] gap-x-2 py-1.5 items-center">
                      <span className="text-slate-500 font-medium">Cost Center</span>
                      <span className="font-bold text-slate-900 text-left">{selectedAsset.costCenterCode}</span>
                    </div>
                    <div className="grid grid-cols-[140px_1fr] gap-x-2 py-1.5 items-center">
                      <span className="text-slate-500 font-medium">Custodian</span>
                      <span className="font-bold text-[#6C2BD9] text-left">{selectedAsset.custodianName}</span>
                    </div>
                    <div className="grid grid-cols-[140px_1fr] gap-x-2 py-1.5 items-center">
                      <span className="text-slate-500 font-medium">Assigned Date</span>
                      <span className="font-bold text-slate-900 text-left">{selectedAsset.assignedDate}</span>
                    </div>
                  </div>
                </div>

                {/* Section 3: Warranty & Maintenance */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <Wrench className="w-3.5 h-3.5 text-[#6C2BD9]" /> Warranty &amp; Maintenance
                    </span>
                    <button
                      onClick={() => navigate('/maintenance')}
                      className="px-2.5 py-1 rounded-lg bg-purple-100 hover:bg-purple-200 text-[#6C2BD9] text-xs font-bold transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
                    >
                      View Details
                    </button>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-slate-700 divide-y divide-slate-200/60">
                    <div className="grid grid-cols-[140px_1fr] gap-x-2 py-1.5 items-center">
                      <span className="text-slate-500 font-medium">Warranty Status</span>
                      <span className="font-bold text-emerald-600 text-left">Active</span>
                    </div>
                    <div className="grid grid-cols-[140px_1fr] gap-x-2 py-1.5 items-center">
                      <span className="text-slate-500 font-medium">Start Date</span>
                      <span className="font-bold text-slate-900 text-left">{selectedAsset.warrantyStart}</span>
                    </div>
                    <div className="grid grid-cols-[140px_1fr] gap-x-2 py-1.5 items-center">
                      <span className="text-slate-500 font-medium">End Date</span>
                      <span className="font-bold text-slate-900 text-left">{selectedAsset.warrantyEnd}</span>
                    </div>
                    <div className="grid grid-cols-[140px_1fr] gap-x-2 py-1.5 items-center">
                      <span className="text-slate-500 font-medium">Next Service Date</span>
                      <span className="font-bold text-purple-700 text-left">{selectedAsset.nextServiceDate}</span>
                    </div>
                    <div className="grid grid-cols-[140px_1fr] gap-x-2 py-1.5 items-center">
                      <span className="text-slate-500 font-medium">Maintenance Type</span>
                      <span className="font-bold text-slate-900 text-left">{selectedAsset.maintType}</span>
                    </div>
                    <div className="grid grid-cols-[140px_1fr] gap-x-2 py-1.5 items-center">
                      <span className="text-slate-500 font-medium">Checklist</span>
                      <span className="font-bold text-slate-900 text-left">{selectedAsset.checklistName}</span>
                    </div>
                  </div>
                </div>

                {/* Section 4: Documents */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-[#6C2BD9]" /> Documents
                    </span>
                    <button className="px-2.5 py-1 rounded-lg bg-purple-100 hover:bg-purple-200 text-[#6C2BD9] text-xs font-bold transition-all flex items-center gap-1 shadow-2xs cursor-pointer">
                      View All
                    </button>
                  </div>
                  <div className="space-y-1.5">
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs hover:bg-purple-50/50 transition-all cursor-pointer">
                      <div className="flex items-center gap-2 font-semibold text-slate-800">
                        <FileText className="w-4 h-4 text-rose-500" />
                        <span>Purchase Invoice.pdf</span>
                      </div>
                      <span className="text-xs font-bold text-purple-600 font-mono">320 KB</span>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs hover:bg-purple-50/50 transition-all cursor-pointer">
                      <div className="flex items-center gap-2 font-semibold text-slate-800">
                        <FileText className="w-4 h-4 text-rose-500" />
                        <span>Warranty.pdf</span>
                      </div>
                      <span className="text-xs font-bold text-purple-600 font-mono">450 KB</span>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs hover:bg-purple-50/50 transition-all cursor-pointer">
                      <div className="flex items-center gap-2 font-semibold text-slate-800">
                        <FileText className="w-4 h-4 text-amber-500" />
                        <span>Asset Photo.jpg</span>
                      </div>
                      <span className="text-xs font-bold text-purple-600 font-mono">1.2 MB</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: LOCATION */}
            {detailPanelTab === 'Location' && (
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 space-y-1">
                  <span className="font-bold text-[#6C2BD9] block">RTLS Map Positioning</span>
                  <p className="text-[11px] text-slate-600">Physical coordinates: X: 142.5m, Y: 88.2m (Building A, Floor 3, Room 312).</p>
                </div>
                <button
                  onClick={() => navigate('/rtls/map')}
                  className="w-full py-2 bg-[#6C2BD9] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Open Floor Map View
                </button>
              </div>
            )}

            {/* TAB CONTENT: MAINTENANCE */}
            {detailPanelTab === 'Maintenance' && (
              <div className="space-y-2 text-xs">
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="font-bold text-slate-900 block">WO-2026-901 (Preventive PM)</span>
                  <p className="text-[11px] text-slate-500">Scheduled for 15 Oct 2026 • Lead Technician: Robert Chen</p>
                </div>
              </div>
            )}

            {/* TAB CONTENT: HISTORY */}
            {detailPanelTab === 'History' && (
              <div className="space-y-2 text-xs">
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="font-bold text-[#6C2BD9] block">ASSIGNMENT</span>
                  <p className="text-[11px] text-slate-600">Assigned to John Doe (IT Dept) on 10 Jan 2024</p>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="font-bold text-emerald-600 block">TAGGING</span>
                  <p className="text-[11px] text-slate-600">Barcoded &amp; RFID EPC registered on 10 Jan 2024</p>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

export default AssetList;
