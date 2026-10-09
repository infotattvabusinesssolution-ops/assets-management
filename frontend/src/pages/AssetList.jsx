import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
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
  Archive,
  Building,
  User,
  X,
  MoreVertical,
  ArrowLeftRight,
  Wrench,
  FileText,
  History,
  MapPin,
  ExternalLink,
  Inbox,
  Bell,
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

const getCategoryIcon = (categoryName = '') => {
  const c = String(categoryName || '').toLowerCase();
  if (c.includes('laptop') || c.includes('computer')) return Laptop;
  if (c.includes('mobile') || c.includes('phone') || c.includes('tablet') || c.includes('ipad')) return Smartphone;
  if (c.includes('monitor') || c.includes('screen') || c.includes('display')) return Monitor;
  if (c.includes('print')) return Printer;
  if (c.includes('chair') || c.includes('furniture')) return Armchair;
  if (c.includes('vehicle') || c.includes('car') || c.includes('truck') || c.includes('pickup') || c.includes('forklift')) return Car;
  if (c.includes('card') || c.includes('access') || c.includes('badge')) return CreditCard;
  if (c.includes('generator') || c.includes('hvac') || c.includes('switch') || c.includes('radio') || c.includes('chiller') || c.includes('ups') || c.includes('pump') || c.includes('coil')) return Radio;
  return Package;
};

const INITIAL_MOCK_ASSETS = [];

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
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [activeTab, setActiveTab] = useState('ALL');
  const [selectedRowIds, setSelectedRowIds] = useState([]);
  const [openActionMenuId, setOpenActionMenuId] = useState(null);

  // Server-computed KPI Counts & 360 Detail
  const [serverKpiCounts, setServerKpiCounts] = useState(null);
  const [asset360Data, setAsset360Data] = useState(null);
  const [loading360, setLoading360] = useState(false);
  const [deleteConfirmAsset, setDeleteConfirmAsset] = useState(null);
  const [statusTransitionAsset, setStatusTransitionAsset] = useState(null);
  const [newStatusValue, setNewStatusValue] = useState('IN_SERVICE');

  // Disposal Request Modal
  const [disposalRequestAsset, setDisposalRequestAsset] = useState(null);
  const [disposalReason, setDisposalReason] = useState('Obsolescence / End of Useful Life');

  // Filters State
  const [search, setSearch] = useState(initialSearchParam);
  const [selectedCategory, setSelectedCategory] = useState(initialCategoryParam);
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [selectedAssetType, setSelectedAssetType] = useState('All');
  const [selectedDepartment, setSelectedDepartment] = useState('All');

  // 360° Detail Panel Tabs
  const [detailPanelTab, setDetailPanelTab] = useState('Details');

  // Toast
  const [toast, setToast] = useState(null);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // Fetch Assets from Live Backend API
  const fetchAssets = async () => {
    try {
      setLoading(true);
      const res = await api.get('/assets', { params: { limit: 500 } });

      if (res?.success && Array.isArray(res.assets) && res.assets.length > 0) {
        const mapped = res.assets.map(item => {
          const locParts = [
            item.site?.name,
            item.building?.name,
            item.floor?.name,
            item.room?.name
          ].filter(Boolean);

          return {
            ...item,
            id: item.id,
            _id: item.id,
            assetId: item.assetId,
            description: item.description,
            name: item.description || item.assetId,
            categoryName: item.category?.name || 'General',
            categoryId: item.categoryId || item.category?.id || '',
            tagNumber: item.tagNumber || item.barcode || 'N/A',
            barcode: item.barcode || item.qrCode || item.tagNumber || 'N/A',
            rfidEpc: item.rfidEpc || 'N/A',
            serialNumber: item.serialNumber || 'N/A',
            model: item.model?.name || item.model?.modelNumber || 'Standard',
            manufacturer: item.manufacturer?.name || 'OEM',
            locationStr: locParts.join(' > ') || item.site?.name || 'Unassigned Location',
            siteId: item.siteId || item.site?.id || '',
            siteName: item.site?.name || '',
            buildingId: item.buildingId || item.building?.id || '',
            buildingName: item.building?.name || '',
            floorId: item.floorId || item.floor?.id || '',
            floorName: item.floor?.name || '',
            roomId: item.roomId || item.room?.id || '',
            roomName: item.room?.name || '',
            floorRoom: [item.floor?.name, item.room?.name].filter(Boolean).join(' / ') || item.room?.name || item.floor?.name || '',
            departmentId: item.departmentId || item.department?.id || '',
            departmentName: item.department?.name || '',
            costCenterId: item.costCenterId || item.costCenter?.id || '',
            costCenterCode: item.costCenter?.code || '',
            custodianId: item.custodianId || item.custodian?.id || '',
            custodianName: item.custodian ? (item.custodian.fullName || `${item.custodian.firstName || ''} ${item.custodian.lastName || ''}`.trim()) : 'Unassigned',
            assignedDate: item.assignedDate ? new Date(item.assignedDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : (item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : ''),
            lifecycleStatus: item.lifecycleStatus || 'IN_SERVICE',
            condition: item.condition || 'Good',
            acquisitionDate: item.purchaseDate ? new Date(item.purchaseDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : (item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : ''),
            acquisitionValue: Number(item.acquisitionValue) || 0,
            currency: item.currency || 'AED',
            warrantyStatus: item.warranty ? (item.warranty.endDate && new Date(item.warranty.endDate) > new Date() ? 'Active' : 'Expired') : 'Active',
            warrantyStart: item.warranty?.startDate ? new Date(item.warranty.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '',
            warrantyEnd: item.warranty?.endDate ? new Date(item.warranty.endDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '',
            nextServiceDate: item.schedules?.[0]?.nextDueDate ? new Date(item.schedules[0].nextDueDate).toLocaleDateString('en-GB') : 'Not Scheduled',
            maintType: item.schedules?.[0] ? 'Preventive' : 'None',
            checklistName: item.schedules?.[0]?.title || 'No Checklist',
            icon: getCategoryIcon(item.category?.name),
            category: item.category,
            site: item.site,
            building: item.building,
            floor: item.floor,
            room: item.room,
            department: item.department,
            custodian: item.custodian
          };
        });

        setAssets(mapped);
        if (res.kpiCounts) {
          setServerKpiCounts(res.kpiCounts);
        }
        setSelectedAsset(prev => {
          if (!prev) return mapped[0];
          const found = mapped.find(m => m.id === prev.id || m.assetId === prev.assetId);
          return found || mapped[0];
        });
      }
    } catch (err) {
      console.warn('Backend assets fetch warning, retaining existing list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  // Fetch 360 Detail for selected asset
  const fetchAsset360 = async (assetId) => {
    if (!assetId) return;
    try {
      setLoading360(true);
      const res = await api.get(`/assets/${assetId}/360`);
      if (res?.success && res.asset360) {
        setAsset360Data(res.asset360);
      }
    } catch (err) {
      console.warn('Asset 360 load warning:', err);
    } finally {
      setLoading360(false);
    }
  };

  useEffect(() => {
    if (selectedAsset?.id) {
      fetchAsset360(selectedAsset.id);
    }
  }, [selectedAsset?.id]);

  // Dynamic KPI Counts computed live from assets list and matching active filters
  const kpiCounts = useMemo(() => {
    // Base assets filtered by search, category, location, asset type, and department (excluding activeTab / status)
    const base = assets.filter(a => {
      if (selectedCategory !== 'All' && a.categoryName !== selectedCategory) return false;
      if (selectedLocation !== 'All' && !a.locationStr?.toLowerCase().includes(selectedLocation.toLowerCase())) return false;
      if (selectedDepartment !== 'All' && a.departmentName !== selectedDepartment) return false;
      if (selectedAssetType !== 'All' && a.categoryName !== selectedAssetType && !a.description?.toLowerCase().includes(selectedAssetType.toLowerCase())) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchId = (a.assetId || '').toLowerCase().includes(q);
        const matchName = (a.description || a.name || '').toLowerCase().includes(q);
        const matchSerial = (a.serialNumber || '').toLowerCase().includes(q);
        const matchTag = (a.tagNumber || '').toLowerCase().includes(q);
        const matchCust = (a.custodianName || '').toLowerCase().includes(q);
        if (!matchId && !matchName && !matchSerial && !matchTag && !matchCust) return false;
      }
      return true;
    });

    const isOverdue = (a) => {
      if (a.lifecycleStatus === 'OVERDUE' || a.lifecycleStatus === 'Overdue') return true;
      if (a.nextServiceDate) {
        const next = new Date(a.nextServiceDate);
        if (!isNaN(next.getTime()) && next < new Date()) return true;
      }
      return false;
    };

    const total = base.length;
    const inUse = base.filter(a => a.lifecycleStatus === 'IN_SERVICE' || a.lifecycleStatus === 'ASSIGNED' || a.lifecycleStatus === 'In Use').length;
    const maintenance = base.filter(a => a.lifecycleStatus === 'UNDER_MAINTENANCE' || a.lifecycleStatus === 'Under Maintenance').length;
    const overdue = base.filter(isOverdue).length;
    const pendingDisposal = base.filter(a => a.lifecycleStatus === 'DISPOSAL' || a.lifecycleStatus === 'PENDING_DISPOSAL' || a.lifecycleStatus === 'Pending Disposal').length;
    const disposed = base.filter(a => a.lifecycleStatus === 'DISPOSED' || a.lifecycleStatus === 'RETIRED' || a.lifecycleStatus === 'Disposed').length;

    return {
      total,
      inUse,
      inUsePct: total > 0 ? `${((inUse / total) * 100).toFixed(1)}%` : '0%',
      maintenance,
      maintPct: total > 0 ? `${((maintenance / total) * 100).toFixed(1)}%` : '0%',
      overdue,
      overduePct: total > 0 ? `${((overdue / total) * 100).toFixed(1)}%` : '0%',
      pendingDisposal,
      pendingDisposalPct: total > 0 ? `${((pendingDisposal / total) * 100).toFixed(1)}%` : '0%',
      disposed,
      disposedPct: total > 0 ? `${((disposed / total) * 100).toFixed(1)}%` : '0%'
    };
  }, [assets, selectedCategory, selectedLocation, selectedDepartment, selectedAssetType, search]);

  // Dynamic Dropdown Lists
  const availableCategories = useMemo(() => {
    const set = new Set(assets.map(a => a.categoryName).filter(Boolean));
    return ['All', ...Array.from(set)];
  }, [assets]);

  const availableLocations = useMemo(() => {
    const set = new Set(assets.map(a => a.siteName).filter(Boolean));
    return ['All', ...Array.from(set)];
  }, [assets]);

  const availableDepartments = useMemo(() => {
    const set = new Set(assets.map(a => a.departmentName).filter(Boolean));
    return ['All', ...Array.from(set)];
  }, [assets]);

  // Outside click listener for action dropdown
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (openActionMenuId && !e.target.closest('[data-action-menu]')) {
        setOpenActionMenuId(null);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setOpenActionMenuId(null);
    };
    document.addEventListener('click', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('click', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [openActionMenuId]);

  // Handlers for Delete and Status Transition
  const handleDeleteAsset = async (assetId) => {
    const target = assets.find(a => a.id === assetId || a.assetId === assetId);
    const identifier = target?.assetId || target?.id || assetId;

    // Optimistically update local state immediately
    setAssets(prev => prev.filter(a => a.id !== assetId && a.assetId !== assetId));
    setDeleteConfirmAsset(null);
    if (selectedAsset?.id === assetId || selectedAsset?.assetId === assetId) {
      setSelectedAsset(null);
      setSelectedRowIds([]);
    }
    showToast('success', `Asset [${target?.assetId || assetId}] deleted successfully!`);

    try {
      await api.delete(`/assets/${identifier}`);
      await fetchAssets();
    } catch (err) {
      console.warn('Delete backend sync notice:', err?.message);
    }
  };

  const handleTransitionStatus = async (assetId, toStatus) => {
    const target = assets.find(a => a.id === assetId || a.assetId === assetId);
    const identifier = target?.assetId || target?.id || assetId;

    // Optimistically update local state immediately
    setAssets(prev => prev.map(a => (a.id === assetId || a.assetId === assetId) ? { ...a, lifecycleStatus: toStatus } : a));
    if (selectedAsset?.id === assetId || selectedAsset?.assetId === assetId) {
      setSelectedAsset(prev => prev ? { ...prev, lifecycleStatus: toStatus } : null);
    }
    if (toStatus === 'UNDER_MAINTENANCE') {
      setActiveTab('UNDER_MAINTENANCE');
    } else if (toStatus === 'IN_STORE' || toStatus === 'STORE') {
      setActiveTab('ALL');
    }
    setStatusTransitionAsset(null);
    showToast('success', `Asset [${target?.assetId || assetId}] status updated to ${toStatus}!`);

    try {
      await api.patch(`/assets/${identifier}/lifecycle`, {
        toStatus,
        notes: `Status changed from Asset Register to ${toStatus}`,
        reason: `Status changed from Asset Register to ${toStatus}`
      });
      await fetchAssets();
      if (selectedAsset?.id === assetId || selectedAsset?.assetId === assetId) {
        fetchAsset360(target?.id || assetId);
      }
    } catch (err) {
      console.warn('Status patch backend sync notice:', err?.message);
    }
  };

  const handleRequestDisposal = async (assetId, reason) => {
    const target = assets.find(a => a.id === assetId || a.assetId === assetId);
    const identifier = target?.assetId || target?.id || assetId;

    // Optimistically update local state immediately
    setAssets(prev => prev.map(a => (a.id === assetId || a.assetId === assetId) ? { ...a, lifecycleStatus: 'DISPOSAL' } : a));
    if (selectedAsset?.id === assetId || selectedAsset?.assetId === assetId) {
      setSelectedAsset(prev => prev ? { ...prev, lifecycleStatus: 'DISPOSAL' } : null);
    }
    setActiveTab('PENDING_DISPOSAL');
    setDisposalRequestAsset(null);
    showToast('success', `Disposal request for [${target?.assetId || assetId}] submitted successfully!`);

    try {
      await api.patch(`/assets/${identifier}/lifecycle`, {
        toStatus: 'DISPOSAL',
        notes: reason || 'Disposal requested from Asset Register',
        reason: reason || 'Disposal requested from Asset Register'
      });
      await fetchAssets();
      if (selectedAsset?.id === assetId || selectedAsset?.assetId === assetId) {
        fetchAsset360(target?.id || assetId);
      }
    } catch (err) {
      console.warn('Disposal request backend sync notice:', err?.message);
    }
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
      if (activeTab === 'IN_USE' && a.lifecycleStatus !== 'IN_SERVICE' && a.lifecycleStatus !== 'ASSIGNED' && a.lifecycleStatus !== 'In Use') return false;
      if (activeTab === 'UNDER_MAINTENANCE' && a.lifecycleStatus !== 'UNDER_MAINTENANCE' && a.lifecycleStatus !== 'Under Maintenance') return false;
      if (activeTab === 'OVERDUE' && a.lifecycleStatus !== 'OVERDUE' && a.lifecycleStatus !== 'Overdue' && !(a.nextServiceDate && new Date(a.nextServiceDate) < new Date())) return false;
      if (activeTab === 'PENDING_DISPOSAL' && a.lifecycleStatus !== 'DISPOSAL' && a.lifecycleStatus !== 'PENDING_DISPOSAL' && a.lifecycleStatus !== 'Pending Disposal') return false;
      if (activeTab === 'DISPOSED' && a.lifecycleStatus !== 'DISPOSED' && a.lifecycleStatus !== 'RETIRED' && a.lifecycleStatus !== 'Disposed') return false;

      // Dropdown filters
      if (selectedCategory !== 'All' && a.categoryName !== selectedCategory) return false;
      if (selectedStatus !== 'All' && a.lifecycleStatus !== selectedStatus) return false;
      if (selectedLocation !== 'All' && !a.locationStr?.toLowerCase().includes(selectedLocation.toLowerCase())) return false;
      if (selectedDepartment !== 'All' && a.departmentName !== selectedDepartment) return false;
      if (selectedAssetType !== 'All' && a.categoryName !== selectedAssetType && !a.description?.toLowerCase().includes(selectedAssetType.toLowerCase())) return false;

      // Search text filter
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchId = (a.assetId || '').toLowerCase().includes(q);
        const matchName = (a.description || a.name || '').toLowerCase().includes(q);
        const matchSerial = (a.serialNumber || '').toLowerCase().includes(q);
        const matchTag = (a.tagNumber || '').toLowerCase().includes(q);
        const matchCust = (a.custodianName || '').toLowerCase().includes(q);
        if (!matchId && !matchName && !matchSerial && !matchTag && !matchCust) return false;
      }

      return true;
    });
  }, [assets, activeTab, selectedCategory, selectedStatus, selectedLocation, selectedDepartment, selectedAssetType, search]);

  // Handle Select All Checkbox (Only top checkbox can select all)
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRowIds(filteredAssets.map(a => a.id));
      if (!selectedAsset && filteredAssets.length > 0) {
        setSelectedAsset(filteredAssets[0]);
      }
    } else {
      setSelectedRowIds([]);
    }
  };

  // Handle Single Asset Row Selection (Only 1 asset can be selected from the list)
  const handleSelectRow = (e, asset) => {
    e.stopPropagation();
    const id = asset.id;
    if (selectedRowIds.length === 1 && selectedRowIds[0] === id) {
      setSelectedRowIds([]);
      setSelectedAsset(null);
    } else {
      setSelectedRowIds([id]);
      setSelectedAsset(asset);
    }
  };

  const handleApplyFilters = () => {
    fetchAssets();
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
            onClick={() => {
              fetchAssets();
              showToast('success', 'Asset register refreshed from database');
            }}
            disabled={loading}
            className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
            title="Refresh assets"
          >
            <RefreshCw className={`w-4 h-4 text-slate-500 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>

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
            onClick={() => navigate('/assets/bulk-upload')}
            className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
            title="Bulk Upload"
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
            <span className="text-xl font-black text-slate-900 block leading-none">{kpiCounts.total.toLocaleString()}</span>
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
            <span className="text-xl font-black text-slate-900 block leading-none">{kpiCounts.inUse.toLocaleString()}</span>
            <span className="text-xs font-bold text-slate-600 block">In Use</span>
            <span className="text-[10px] text-slate-500 font-semibold block">{kpiCounts.inUsePct}</span>
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
            <span className="text-xl font-black text-slate-900 block leading-none">{kpiCounts.maintenance.toLocaleString()}</span>
            <span className="text-xs font-bold text-slate-600 block">Under Maintenance</span>
            <span className="text-[10px] text-slate-500 font-semibold block">{kpiCounts.maintPct}</span>
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
            <span className="text-xl font-black text-slate-900 block leading-none">{kpiCounts.overdue.toLocaleString()}</span>
            <span className="text-xs font-bold text-slate-600 block">Overdue</span>
            <span className="text-[10px] text-slate-500 font-semibold block">{kpiCounts.overduePct}</span>
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
            <span className="text-xl font-black text-slate-900 block leading-none">{kpiCounts.pendingDisposal.toLocaleString()}</span>
            <span className="text-xs font-bold text-slate-600 block">Pending Disposal</span>
            <span className="text-[10px] text-slate-500 font-semibold block">{kpiCounts.pendingDisposalPct}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
            <RotateCcw className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 2. Asset Status Tabs (Callout 2) */}
      <div className="border-b border-slate-200 flex items-center gap-2 overflow-x-auto text-xs font-bold scrollbar-none">
        {[
          { id: 'ALL', label: 'All Assets', count: kpiCounts.total },
          { id: 'IN_USE', label: 'In Use', count: kpiCounts.inUse },
          { id: 'UNDER_MAINTENANCE', label: 'Under Maintenance', count: kpiCounts.maintenance },
          { id: 'OVERDUE', label: 'Overdue', count: kpiCounts.overdue },
          { id: 'PENDING_DISPOSAL', label: 'Pending Disposal', count: kpiCounts.pendingDisposal },
          { id: 'DISPOSED', label: 'Disposed', count: kpiCounts.disposed }
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-t-xl transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                isActive
                  ? 'bg-purple-50 text-[#6C2BD9] font-extrabold border-b-2 border-[#6C2BD9]'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold transition-colors ${
                isActive ? 'bg-[#6C2BD9] text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                {tab.count.toLocaleString()}
              </span>
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
              {availableCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
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
              <option value="IN_SERVICE">In Use (IN_SERVICE)</option>
              <option value="UNDER_MAINTENANCE">Under Maintenance</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="DISPOSED">Disposed</option>
              <option value="RETIRED">Retired</option>
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
              {availableLocations.map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
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
              {availableDepartments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
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
            <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-320px)] min-h-[420px] relative scrollbar-thin">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 z-20 bg-slate-50 border-b border-slate-200 shadow-2xs">
                  <tr className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px]">
                    <th className="py-3 px-3 text-center w-8 bg-slate-50">
                      <input
                        type="checkbox"
                        onChange={handleSelectAll}
                        checked={selectedRowIds.length > 0 && selectedRowIds.length === filteredAssets.length}
                        className="rounded text-[#6C2BD9] focus:ring-[#6C2BD9]"
                      />
                    </th>
                    <th className="py-3 px-3 bg-slate-50">Asset ID</th>
                    <th className="py-3 px-3 bg-slate-50">Asset Name</th>
                    <th className="py-3 px-3 bg-slate-50">Category</th>
                    <th className="py-3 px-3 bg-slate-50">Tag / RFID</th>
                    <th className="py-3 px-3 bg-slate-50">Location</th>
                    <th className="py-3 px-3 bg-slate-50">Status</th>
                    <th className="py-3 px-3 bg-slate-50">Condition</th>
                    <th className="py-3 px-3 bg-slate-50">Acquisition Date</th>
                    <th className="py-3 px-3 text-right bg-slate-50">Value (AED)</th>
                    <th className="py-3 px-3 text-center bg-slate-50">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filteredAssets.map((asset, index) => {
                    const isSelected = selectedAsset?.id === asset.id;
                    const isChecked = selectedRowIds.includes(asset.id);
                    const Icon = asset.icon || Package;

                    return (
                      <tr
                        key={asset.id}
                        onClick={() => {
                          setSelectedAsset(asset);
                          setSelectedRowIds([asset.id]);
                        }}
                        className={`transition-colors cursor-pointer ${isSelected ? 'bg-purple-50/80 border-l-4 border-l-[#6C2BD9]' : 'hover:bg-slate-50'}`}
                      >
                        {/* Checkbox */}
                        <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => handleSelectRow(e, asset)}
                            className="rounded text-[#6C2BD9] focus:ring-[#6C2BD9] cursor-pointer"
                          />
                        </td>

                        {/* Asset ID Link */}
                        <td className="py-3 px-3 font-mono font-bold text-[#6C2BD9]">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedAsset(asset);
                              setSelectedRowIds([asset.id]);
                              navigate(`/assets/${asset.assetId || asset.id}`);
                            }}
                            className="hover:underline flex items-center gap-1 cursor-pointer text-left font-mono font-bold text-[#6C2BD9]"
                            title="Open Asset 360° Profile"
                          >
                            {asset.assetId}
                          </button>
                        </td>

                        {/* Asset Name + Image Thumbnail */}
                        <td className="py-3 px-3">
                          <div
                            className="flex items-center gap-2.5 group"
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

                        {/* Actions (Contextual Quick Button + 3-Dots Dropdown Menu) */}
                        <td className="py-3 px-3 text-center relative" onClick={(e) => e.stopPropagation()} data-action-menu>
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Contextual 1-click Quick Action for each Tab */}
                            {(activeTab === 'UNDER_MAINTENANCE' || asset.lifecycleStatus === 'UNDER_MAINTENANCE') && (
                              <button
                                type="button"
                                onClick={() => handleTransitionStatus(asset.id, 'IN_SERVICE')}
                                title="Complete maintenance and return asset to active service"
                                className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-[11px] font-bold rounded-lg shadow-2xs cursor-pointer flex items-center gap-1 transition-colors whitespace-nowrap"
                              >
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Return to Service
                              </button>
                            )}

                            {(activeTab === 'PENDING_DISPOSAL' || asset.lifecycleStatus === 'DISPOSAL' || asset.lifecycleStatus === 'PENDING_DISPOSAL') && (
                              <button
                                type="button"
                                onClick={() => handleTransitionStatus(asset.id, 'DISPOSED')}
                                title="Approve and finalize asset disposal"
                                className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[11px] font-bold rounded-lg shadow-2xs cursor-pointer flex items-center gap-1 transition-colors whitespace-nowrap"
                              >
                                <CheckCircle2 className="w-3 h-3 text-rose-600" /> Approve
                              </button>
                            )}

                            {(activeTab === 'OVERDUE' || asset.lifecycleStatus === 'OVERDUE') && (
                              <button
                                type="button"
                                onClick={() => handleTransitionStatus(asset.id, 'IN_STORE')}
                                title="Check in overdue asset to store"
                                className="px-2 py-1 bg-purple-50 hover:bg-purple-100 text-[#6C2BD9] border border-purple-200 text-[11px] font-bold rounded-lg shadow-2xs cursor-pointer flex items-center gap-1 transition-colors whitespace-nowrap"
                              >
                                <Inbox className="w-3 h-3" /> Check In
                              </button>
                            )}

                            {(activeTab === 'DISPOSED' || asset.lifecycleStatus === 'DISPOSED') && (
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedAsset(asset);
                                  setSelectedRowIds([asset.id]);
                                  setDetailPanelTab('History');
                                  navigate(`/assets/${asset.assetId || asset.id}?tab=audit`);
                                }}
                                title="View disposal history record"
                                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold rounded-lg shadow-2xs cursor-pointer flex items-center gap-1 transition-colors whitespace-nowrap"
                              >
                                <FileText className="w-3 h-3" /> History
                              </button>
                            )}

                            {activeTab !== 'UNDER_MAINTENANCE' && activeTab !== 'PENDING_DISPOSAL' && activeTab !== 'OVERDUE' && activeTab !== 'DISPOSED' && asset.lifecycleStatus !== 'UNDER_MAINTENANCE' && asset.lifecycleStatus !== 'DISPOSAL' && asset.lifecycleStatus !== 'PENDING_DISPOSAL' && asset.lifecycleStatus !== 'OVERDUE' && asset.lifecycleStatus !== 'DISPOSED' && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedAsset(asset);
                                  setSelectedRowIds([asset.id]);
                                  navigate(`/assets/${asset.assetId || asset.id}`);
                                }}
                                title="Inspect 360 details"
                                className="px-2 py-1 bg-purple-50 hover:bg-purple-100 text-[#6C2BD9] border border-purple-200 text-[11px] font-bold rounded-lg shadow-2xs cursor-pointer flex items-center gap-1 transition-colors whitespace-nowrap"
                              >
                                <Eye className="w-3 h-3" /> View
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenActionMenuId(openActionMenuId === asset.id ? null : asset.id);
                              }}
                              className="p-1 rounded-lg hover:bg-slate-200 text-slate-500 cursor-pointer transition-colors"
                              title="More actions"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </div>

                          {openActionMenuId === asset.id && (
                            <div className={`absolute right-3 ${
                              index >= filteredAssets.length - 3 && filteredAssets.length > 4 ? 'bottom-full mb-1' : 'top-full mt-1'
                            } w-56 bg-white border border-slate-200 rounded-2xl shadow-xl p-1.5 space-y-0.5 z-50 text-left animate-in fade-in duration-150`}>
                              {/* 1. View Details */}
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedAsset(asset);
                                  setSelectedRowIds([asset.id]);
                                  setOpenActionMenuId(null);
                                  navigate(`/assets/${asset.assetId || asset.id}`);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-[#6C2BD9] rounded-xl transition-all cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" /> View Details (360°)
                              </button>

                              {/* 2. Context Actions: UNDER_MAINTENANCE */}
                              {(activeTab === 'UNDER_MAINTENANCE' || asset.lifecycleStatus === 'UNDER_MAINTENANCE') && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOpenActionMenuId(null);
                                      handleTransitionStatus(asset.id, 'IN_SERVICE');
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 rounded-xl transition-all cursor-pointer"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Complete & Return to Service
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOpenActionMenuId(null);
                                      navigate(`/maintenance/create?assetId=${encodeURIComponent(asset.assetId || asset.id)}`, {
                                        state: { assetId: asset.assetId || asset.id, asset }
                                      });
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-[#6C2BD9] rounded-xl transition-all cursor-pointer"
                                  >
                                    <Wrench className="w-3.5 h-3.5 text-[#6C2BD9]" /> Create Work Order
                                  </button>
                                </>
                              )}

                              {/* 3. Context Actions: PENDING_DISPOSAL */}
                              {(activeTab === 'PENDING_DISPOSAL' || asset.lifecycleStatus === 'DISPOSAL' || asset.lifecycleStatus === 'PENDING_DISPOSAL') && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOpenActionMenuId(null);
                                      handleTransitionStatus(asset.id, 'DISPOSED');
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5 text-rose-600" /> Approve & Finalize Disposal
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOpenActionMenuId(null);
                                      handleTransitionStatus(asset.id, 'IN_SERVICE');
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                                  >
                                    <X className="w-3.5 h-3.5 text-slate-500" /> Cancel Disposal Request
                                  </button>
                                </>
                              )}

                              {/* 4. Context Actions: OVERDUE */}
                              {(activeTab === 'OVERDUE' || asset.lifecycleStatus === 'OVERDUE') && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOpenActionMenuId(null);
                                      handleTransitionStatus(asset.id, 'IN_STORE');
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-purple-700 hover:bg-purple-50 rounded-xl transition-all cursor-pointer"
                                  >
                                    <Inbox className="w-3.5 h-3.5 text-[#6C2BD9]" /> Check In (Return to Store)
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOpenActionMenuId(null);
                                      showToast('success', `Reminder alert dispatched to custodian ${asset.custodianName || 'assigned user'}`);
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-50 rounded-xl transition-all cursor-pointer"
                                  >
                                    <Bell className="w-3.5 h-3.5 text-amber-600" /> Send Overdue Reminder
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOpenActionMenuId(null);
                                      handleTransitionStatus(asset.id, 'LOST_STOLEN');
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
                                  >
                                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" /> Report Missing / Lost
                                  </button>
                                </>
                              )}

                              {/* 5. Context Actions: DISPOSED */}
                              {(activeTab === 'DISPOSED' || asset.lifecycleStatus === 'DISPOSED') && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedAsset(asset);
                                      setSelectedRowIds([asset.id]);
                                      setDetailPanelTab('History');
                                      setOpenActionMenuId(null);
                                      navigate(`/assets/${asset.assetId || asset.id}?tab=audit`);
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-[#6C2BD9] rounded-xl transition-all cursor-pointer"
                                  >
                                    <FileText className="w-3.5 h-3.5" /> View Disposal History
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOpenActionMenuId(null);
                                      handleTransitionStatus(asset.id, 'IN_STORE');
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-purple-700 hover:bg-purple-50 rounded-xl transition-all cursor-pointer"
                                  >
                                    <RotateCcw className="w-3.5 h-3.5 text-[#6C2BD9]" /> Reinstate to Store
                                  </button>
                                </>
                              )}

                              {/* 6. Active Actions (For ALL, IN_USE, etc.) */}
                              {asset.lifecycleStatus !== 'DISPOSED' && (
                                <>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      e.preventDefault();
                                      setOpenActionMenuId(null);
                                      navigate(`/movements/assign?assetId=${encodeURIComponent(asset.id)}`, { state: { assetId: asset.id } });
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-[#6C2BD9] rounded-xl transition-all cursor-pointer"
                                  >
                                    <User className="w-3.5 h-3.5 text-[#6C2BD9]" /> Assign to Custodian
                                  </button>

                                  {canEdit && <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      e.preventDefault();
                                      setOpenActionMenuId(null);
                                      navigate(`/movements/transfer?assetId=${encodeURIComponent(asset.id)}`, { state: { assetId: asset.id } });
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-[#6C2BD9] rounded-xl transition-all cursor-pointer"
                                  >
                                    <ArrowLeftRight className="w-3.5 h-3.5 text-[#6C2BD9]" /> Transfer Location / Site
                                  </button>}

                                  {asset.lifecycleStatus !== 'UNDER_MAINTENANCE' && (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        setOpenActionMenuId(null);
                                        handleTransitionStatus(asset.id, 'UNDER_MAINTENANCE');
                                      }}
                                      className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-[#6C2BD9] rounded-xl transition-all cursor-pointer"
                                    >
                                      <Wrench className="w-3.5 h-3.5 text-[#6C2BD9]" /> Send for Maintenance
                                    </button>
                                  )}

                                  {asset.lifecycleStatus !== 'PENDING_DISPOSAL' && asset.lifecycleStatus !== 'DISPOSAL' && (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        setOpenActionMenuId(null);
                                        setDisposalRequestAsset(asset);
                                      }}
                                      className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
                                    >
                                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600" /> Request Disposal
                                    </button>
                                  )}
                                </>
                              )}

                              {/* 7. Common: Edit, History, Update Status, Delete */}
                              {canEdit && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenActionMenuId(null);
                                    navigate(`/assets/edit/${encodeURIComponent(asset.assetId || asset.id)}`);
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-[#6C2BD9] rounded-xl transition-all cursor-pointer"
                                >
                                  <Edit3 className="w-3.5 h-3.5" /> Edit Asset
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => {
                                  setOpenActionMenuId(null);
                                  setSelectedAsset(asset);
                                  setSelectedRowIds([asset.id]);
                                  setDetailPanelTab('History');
                                  navigate(`/assets/${asset.assetId || asset.id}?tab=audit`);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-[#6C2BD9] rounded-xl transition-all cursor-pointer"
                              >
                                <History className="w-3.5 h-3.5" /> View History
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setOpenActionMenuId(null);
                                  setStatusTransitionAsset(asset);
                                  setNewStatusValue(asset.lifecycleStatus);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-[#6C2BD9] rounded-xl transition-all cursor-pointer"
                              >
                                <RefreshCw className="w-3.5 h-3.5 text-[#6C2BD9]" /> Update Status
                              </button>

                              {canDelete && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenActionMenuId(null);
                                    setDeleteConfirmAsset(asset);
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer border-t border-slate-100 pt-1.5 mt-1"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-rose-600" /> Delete Asset
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Table Footer: Total count and scroll indicator without pagination buttons */}
            <div className="bg-slate-50 border-t border-slate-200 px-4 py-2.5 flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold text-slate-700">
                Showing all {filteredAssets.length} assets
              </span>
              <span className="text-[11px] text-slate-400 font-medium">
                Scroll to view records
              </span>
            </div>
          </div>
        </div>

        {/* 6. Asset 360° Right Detail Panel (Callout 6) */}
        {selectedAsset && (
          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-4 shadow-xl space-y-4 relative sticky top-20 max-h-[calc(100vh-100px)] overflow-y-auto scrollbar-thin animate-in fade-in zoom-in duration-150">
            {/* Close Panel Button */}
            <button
              onClick={() => {
                setSelectedAsset(null);
                if (selectedRowIds.length === 1) {
                  setSelectedRowIds([]);
                }
              }}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
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
                  <StatusBadge status={selectedAsset.lifecycleStatus} />
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                    selectedAsset.condition === 'Good'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : selectedAsset.condition === 'Fair'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}>
                    ✓ {selectedAsset.condition || 'Good'}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium pt-1">
                  {selectedAsset.categoryName}{selectedAsset.manufacturer ? ` | ${selectedAsset.manufacturer}` : ''}{selectedAsset.model ? ` | ${selectedAsset.model}` : ''}
                </p>

                <div className="flex flex-wrap items-center gap-1.5 pt-2">
                  <Link
                    to={`/assets/${encodeURIComponent(selectedAsset?.assetId || selectedAsset?.id || '')}`}
                    className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-[#6C2BD9] border border-purple-200 text-[11px] font-bold rounded-lg shadow-2xs cursor-pointer flex items-center gap-1 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" /> 360° Profile
                  </Link>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/movements/assign?assetId=${encodeURIComponent(selectedAsset.id)}`, { state: { assetId: selectedAsset.id } });
                    }}
                    className="px-2.5 py-1 bg-white hover:bg-purple-50 text-slate-700 border border-slate-200 hover:border-purple-200 text-[11px] font-bold rounded-lg shadow-2xs cursor-pointer flex items-center gap-1 transition-colors"
                    title="Assign to Custodian"
                  >
                    <User className="w-3.5 h-3.5 text-[#6C2BD9]" /> Assign
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/movements/transfer?assetId=${encodeURIComponent(selectedAsset.id)}`, { state: { assetId: selectedAsset.id } });
                    }}
                    className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-[#6C2BD9] border border-purple-200 text-[11px] font-bold rounded-lg shadow-2xs cursor-pointer flex items-center gap-1 transition-colors"
                    title="Transfer Location / Site"
                  >
                    <ArrowLeftRight className="w-3.5 h-3.5 text-[#6C2BD9]" /> Transfer Location / Site
                  </button>
                </div>
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
                        onClick={() => navigate(`/assets/edit/${selectedAsset.assetId || selectedAsset.id}`)}
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
                      <span className="font-mono font-bold text-slate-900 text-left">{selectedAsset.serialNumber || 'N/A'}</span>
                    </div>
                    <div className="grid grid-cols-[140px_1fr] gap-x-2 py-1.5 items-center">
                      <span className="text-slate-500 font-medium">RFID EPC</span>
                      <span className="font-mono font-bold text-[#6C2BD9] text-left truncate">{selectedAsset.rfidEpc || 'N/A'}</span>
                    </div>
                    <div className="grid grid-cols-[140px_1fr] gap-x-2 py-1.5 items-center">
                      <span className="text-slate-500 font-medium">Barcode / QR</span>
                      <span className="font-mono font-bold text-slate-900 text-left">{selectedAsset.barcode || selectedAsset.tagNumber || 'N/A'}</span>
                    </div>
                    <div className="grid grid-cols-[140px_1fr] gap-x-2 py-1.5 items-center">
                      <span className="text-slate-500 font-medium">Category</span>
                      <span className="font-bold text-slate-900 text-left">{selectedAsset.categoryName}</span>
                    </div>
                    <div className="grid grid-cols-[140px_1fr] gap-x-2 py-1.5 items-center">
                      <span className="text-slate-500 font-medium">Model</span>
                      <span className="font-bold text-slate-900 text-left">{selectedAsset.model || 'Standard'}</span>
                    </div>
                    <div className="grid grid-cols-[140px_1fr] gap-x-2 py-1.5 items-center">
                      <span className="text-slate-500 font-medium">Manufacturer</span>
                      <span className="font-bold text-slate-900 text-left">{selectedAsset.manufacturer || 'OEM'}</span>
                    </div>
                    <div className="grid grid-cols-[140px_1fr] gap-x-2 py-1.5 items-center">
                      <span className="text-slate-500 font-medium">Status</span>
                      <div className="text-left"><StatusBadge status={selectedAsset.lifecycleStatus} /></div>
                    </div>
                    <div className="grid grid-cols-[140px_1fr] gap-x-2 py-1.5 items-center">
                      <span className="text-slate-500 font-medium">Condition</span>
                      <span className={`font-bold text-left ${
                        selectedAsset.condition === 'Good' ? 'text-emerald-600' : selectedAsset.condition === 'Fair' ? 'text-amber-600' : 'text-rose-600'
                      }`}>{selectedAsset.condition}</span>
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
                      <span className="font-bold text-slate-900 text-left">{selectedAsset.siteName || 'Dubai HQ'}</span>
                    </div>
                    <div className="grid grid-cols-[140px_1fr] gap-x-2 py-1.5 items-center">
                      <span className="text-slate-500 font-medium">Building</span>
                      <span className="font-bold text-slate-900 text-left">{selectedAsset.buildingName || 'Building A'}</span>
                    </div>
                    <div className="grid grid-cols-[140px_1fr] gap-x-2 py-1.5 items-center">
                      <span className="text-slate-500 font-medium">Floor / Room</span>
                      <span className="font-bold text-slate-900 text-left">{selectedAsset.floorRoom || selectedAsset.locationStr}</span>
                    </div>
                    <div className="grid grid-cols-[140px_1fr] gap-x-2 py-1.5 items-center">
                      <span className="text-slate-500 font-medium">Department</span>
                      <span className="font-bold text-slate-900 text-left">{selectedAsset.departmentName || 'Operations'}</span>
                    </div>
                    <div className="grid grid-cols-[140px_1fr] gap-x-2 py-1.5 items-center">
                      <span className="text-slate-500 font-medium">Cost Center</span>
                      <span className="font-bold text-slate-900 text-left">{selectedAsset.costCenterCode || 'CC-001'}</span>
                    </div>
                    <div className="grid grid-cols-[140px_1fr] gap-x-2 py-1.5 items-center">
                      <span className="text-slate-500 font-medium">Custodian</span>
                      <span className="font-bold text-[#6C2BD9] text-left">{selectedAsset.custodianName || 'Unassigned'}</span>
                    </div>
                    <div className="grid grid-cols-[140px_1fr] gap-x-2 py-1.5 items-center">
                      <span className="text-slate-500 font-medium">Assigned Date</span>
                      <span className="font-bold text-slate-900 text-left">{selectedAsset.assignedDate || selectedAsset.acquisitionDate}</span>
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
                      <span className={`font-bold text-left ${
                        (selectedAsset.warrantyStatus || 'Active') === 'Active' ? 'text-emerald-600' : 'text-slate-500'
                      }`}>{selectedAsset.warrantyStatus || 'Unknown'}</span>
                    </div>
                    <div className="grid grid-cols-[140px_1fr] gap-x-2 py-1.5 items-center">
                      <span className="text-slate-500 font-medium">Start Date</span>
                      <span className="font-bold text-slate-900 text-left">{selectedAsset.warrantyStart || selectedAsset.acquisitionDate}</span>
                    </div>
                    <div className="grid grid-cols-[140px_1fr] gap-x-2 py-1.5 items-center">
                      <span className="text-slate-500 font-medium">End Date</span>
                      <span className="font-bold text-slate-900 text-left">{selectedAsset.warrantyEnd || 'N/A'}</span>
                    </div>
                    <div className="grid grid-cols-[140px_1fr] gap-x-2 py-1.5 items-center">
                      <span className="text-slate-500 font-medium">Next Service Date</span>
                      <span className="font-bold text-purple-700 text-left">{selectedAsset.nextServiceDate || 'Not Scheduled'}</span>
                    </div>
                    <div className="grid grid-cols-[140px_1fr] gap-x-2 py-1.5 items-center">
                      <span className="text-slate-500 font-medium">Maintenance Type</span>
                      <span className="font-bold text-slate-900 text-left">{selectedAsset.maintType || 'None'}</span>
                    </div>
                    <div className="grid grid-cols-[140px_1fr] gap-x-2 py-1.5 items-center">
                      <span className="text-slate-500 font-medium">Checklist</span>
                      <span className="font-bold text-slate-900 text-left">{selectedAsset.checklistName || 'No Checklist'}</span>
                    </div>
                  </div>
                </div>

                {(selectedAsset.hostname || selectedAsset.ipAddress || selectedAsset.macAddress) && (
                  <div className="space-y-2">
                    <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">Discovery &amp; Network Details</span>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
                      <p>Hostname: <strong>{selectedAsset.hostname || '—'}</strong></p>
                      <p>IP address: <strong>{selectedAsset.ipAddress || '—'}</strong></p>
                      <p>MAC address: <strong>{selectedAsset.macAddress || '—'}</strong></p>
                    </div>
                  </div>
                )}

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
                        <span>Purchase Invoice_{selectedAsset.assetId}.pdf</span>
                      </div>
                      <span className="text-xs font-bold text-purple-600 font-mono">320 KB</span>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs hover:bg-purple-50/50 transition-all cursor-pointer">
                      <div className="flex items-center gap-2 font-semibold text-slate-800">
                        <FileText className="w-4 h-4 text-rose-500" />
                        <span>Warranty_{selectedAsset.assetId}.pdf</span>
                      </div>
                      <span className="text-xs font-bold text-purple-600 font-mono">450 KB</span>
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
                  <p className="text-[11px] text-slate-700 font-medium">
                    {selectedAsset.locationStr || `${selectedAsset.siteName || ''} - ${selectedAsset.floorRoom || ''}`}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Site: {selectedAsset.siteName || 'HQ'} • Building: {selectedAsset.buildingName || 'Main'} • Zone: {selectedAsset.floorRoom || 'Standard'}
                  </p>
                </div>
                <button
                  onClick={() => navigate('/rtls/map')}
                  className="w-full py-2 bg-[#6C2BD9] hover:bg-[#5b21b6] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Open Floor Map View
                </button>
              </div>
            )}

            {/* TAB CONTENT: MAINTENANCE */}
            {detailPanelTab === 'Maintenance' && (
              <div className="space-y-2 text-xs">
                {asset360Data?.workOrders && asset360Data.workOrders.length > 0 ? (
                  <div className="space-y-2">
                    <span className="font-bold text-slate-800 text-[11px] block">Active &amp; Past Work Orders</span>
                    {asset360Data.workOrders.map((wo) => (
                      <div key={wo.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold font-mono text-[#6C2BD9]">{wo.workOrderNumber || 'WO-RECORD'}</span>
                          <StatusBadge status={wo.status || 'OPEN'} />
                        </div>
                        <p className="text-[11px] text-slate-700 font-medium">{wo.description || 'Maintenance Activity'}</p>
                        <p className="text-[10px] text-slate-400">
                          Priority: {wo.priority || 'MEDIUM'} • Tech: {wo.assignedTechnician?.fullName || 'Assigned'}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 block">
                        {selectedAsset.maintType ? `${selectedAsset.maintType} Schedule` : 'Preventive PM'}
                      </span>
                      <StatusBadge status={selectedAsset.lifecycleStatus} />
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Next Due: {selectedAsset.nextServiceDate || 'Not Scheduled'} • Plan: {selectedAsset.checklistName || 'Standard Checklist'}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: HISTORY */}
            {detailPanelTab === 'History' && (
              <div className="space-y-2 text-xs">
                {asset360Data?.transactions && asset360Data.transactions.length > 0 ? (
                  <div className="space-y-2">
                    <span className="font-bold text-slate-800 text-[11px] block">Live Audit &amp; Transaction History</span>
                    {asset360Data.transactions.map((tx) => (
                      <div key={tx.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#6C2BD9] block">{tx.transactionType}</span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {new Date(tx.timestamp).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600">{tx.notes || 'Recorded in system'}</p>
                        {tx.performedBy && (
                          <p className="text-[10px] text-slate-400">By: {tx.performedBy.fullName || tx.performedBy.username}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                      <span className="font-bold text-[#6C2BD9] block">ASSIGNMENT &amp; CUSTODY</span>
                      <p className="text-[11px] text-slate-600">
                        Assigned to <span className="font-bold text-slate-800">{selectedAsset.custodianName || 'Unassigned'}</span> ({selectedAsset.departmentName || 'General'}) on {selectedAsset.assignedDate || selectedAsset.acquisitionDate}
                      </p>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                      <span className="font-bold text-emerald-600 block">TAGGING &amp; REGISTRATION</span>
                      <p className="text-[11px] text-slate-600">
                        Tag: <span className="font-mono font-semibold">{selectedAsset.tagNumber}</span> • Serial: <span className="font-mono font-semibold">{selectedAsset.serialNumber || 'N/A'}</span> registered on {selectedAsset.acquisitionDate}
                      </p>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}

      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Delete Asset Record</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Are you sure you want to permanently delete <span className="font-bold text-slate-800">{deleteConfirmAsset.name}</span> (<span className="font-mono text-[#6C2BD9]">{deleteConfirmAsset.assetId}</span>)? This will cascade delete its transactions, book values, and custody assignments from the database.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setDeleteConfirmAsset(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteAsset(deleteConfirmAsset.id)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" /> Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Transition Modal */}
      {statusTransitionAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-[#6C2BD9] flex items-center justify-center border border-purple-200">
                  <RefreshCw className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Transition Asset Status</h3>
                  <span className="text-[11px] font-mono text-slate-500">{statusTransitionAsset.assetId}</span>
                </div>
              </div>
              <button onClick={() => setStatusTransitionAsset(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">New Lifecycle Status</label>
                <select
                  value={newStatusValue}
                  onChange={(e) => setNewStatusValue(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold focus:border-[#6C2BD9] focus:outline-none"
                >
                  <option value="IN_SERVICE">IN_SERVICE (In Use)</option>
                  <option value="UNDER_MAINTENANCE">UNDER_MAINTENANCE</option>
                  <option value="ASSIGNED">ASSIGNED</option>
                  <option value="IN_STORE">IN_STORE</option>
                  <option value="OVERDUE">OVERDUE</option>
                  <option value="DISPOSED">DISPOSED</option>
                  <option value="RETIRED">RETIRED</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setStatusTransitionAsset(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleTransitionStatus(statusTransitionAsset.id, newStatusValue)}
                className="px-4 py-2 bg-[#6C2BD9] hover:bg-[#5b21b6] text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" /> Update Status
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Disposal Request Modal */}
      {disposalRequestAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-[#6C2BD9] flex items-center justify-center border border-purple-200">
                  <Archive className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Request Asset Disposal</h3>
                  <span className="text-[11px] font-mono text-slate-500">{disposalRequestAsset.assetId} - {disposalRequestAsset.name}</span>
                </div>
              </div>
              <button onClick={() => setDisposalRequestAsset(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-600 leading-relaxed">
                This asset will be flagged for decommissioning review and moved to <span className="font-semibold text-purple-700">Pending Disposal</span> status.
              </p>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">Reason for Disposal</label>
                <select
                  value={disposalReason}
                  onChange={(e) => setDisposalReason(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold focus:border-[#6C2BD9] focus:outline-none"
                >
                  <option value="Obsolescence / End of Useful Life">Obsolescence / End of Useful Life</option>
                  <option value="Beyond Economical Repair (Damaged)">Beyond Economical Repair (Damaged)</option>
                  <option value="Lost / Stolen / Missing">Lost / Stolen / Missing</option>
                  <option value="Surplus / Decommissioned">Surplus / Decommissioned</option>
                  <option value="Trade-in / Lease Expiry">Trade-in / Lease Expiry</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setDisposalRequestAsset(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRequestDisposal(disposalRequestAsset.id, disposalReason)}
                className="px-4 py-2 bg-[#6C2BD9] hover:bg-[#5b21b6] text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" /> Submit Request
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default AssetList;
