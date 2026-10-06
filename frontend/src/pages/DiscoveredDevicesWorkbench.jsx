import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import {
  Cpu,
  Monitor,
  Server,
  Printer,
  Smartphone,
  HelpCircle,
  Search,
  Filter,
  RefreshCw,
  Sliders,
  ChevronDown,
  Check,
  X,
  ShieldCheck,
  HardDrive,
  Wifi,
  Eye,
  ArrowRight,
  Clock,
  Laptop,
  Radio,
  Download,
  Key,
  Database,
  Layers,
  ChevronLeft,
  ChevronRight,
  Globe,
  Settings,
  MoreVertical,
  ExternalLink,
  Plus,
  AlertTriangle,
  CheckCircle2,
  FileSpreadsheet,
  FileText,
  Play,
  Edit,
  Trash2,
  MapPin,
  Maximize2,
  CheckSquare,
  Square,
  Sparkles,
  RotateCcw,
  Activity,
  AlertCircle,
  Network,
  Tv,
  Barcode,
  Link as LinkIcon,
  CheckCircle,
  FileCheck,
  Calendar,
  Info
} from 'lucide-react';
import clsx from 'clsx';

export function DiscoveredDevicesWorkbench() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Primary Data State
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(false);

  const kpis = useMemo(() => {
    const total = devices.length;
    const matched = devices.filter(d => d.status === 'Matched').length;
    const newCount = devices.filter(d => d.status === 'New').length;
    const review = devices.filter(d => d.status === 'Review').length;
    return {
      total, matched, newCount, review,
      matchedPct: total ? Math.round(matched / total * 100) : 0,
      newPct: total ? Math.round(newCount / total * 100) : 0,
      reviewPct: total ? Math.round(review / total * 100) : 0
    };
  }, [devices]);

  // Selected Device for lower split view
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [detailTab, setDetailTab] = useState('hardware'); // 'hardware' | 'software' | 'network' | 'match' | 'history'

  // Table Selection State
  const [selectedIds, setSelectedIds] = useState(new Set());

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDeviceType, setFilterDeviceType] = useState('All Types');
  const [filterStatus, setFilterStatus] = useState('All Status');
  const [filterLocation, setFilterLocation] = useState('All Locations');
  const [filterJob, setFilterJob] = useState('All Jobs');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Toast State
  const [toastMessage, setToastMessage] = useState(null);
  const showToast = (msg, type = 'success') => {
    setToastMessage({ msg, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    let alive = true;
    setLoading(true);
    api.get('/discovery/devices?limit=2000')
      .then(result => {
        if (!alive) return;
        const list = Array.isArray(result?.devices) ? result.devices : [];
        setDevices(list);
        setSelectedDevice(previous => list.find(d => d.id === previous?.id) || list[0] || null);
      })
      .catch(error => {
        if (!alive) return;
        setDevices([]);
        setSelectedDevice(null);
        showToast(error.message || 'Could not load discovered devices.', 'error');
      })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  // ---------------------------------------------------------------------------
  // 8 MODALS STATES (Prompt Image 8 Modals)
  // ---------------------------------------------------------------------------
  // 1. More Filters (Advanced Filters) Drawer / Modal
  const [isAdvancedFiltersOpen, setIsAdvancedFiltersOpen] = useState(false);
  const [advFilters, setAdvFilters] = useState({
    ipAddress: '',
    hostname: '',
    macAddress: '',
    deviceType: 'All',
    serialNumber: '',
    assetStatus: 'All',
    manufacturer: 'All',
    location: 'All Locations',
    model: 'All',
    discoveryJob: 'All Jobs',
    operatingSystem: 'All',
    lastSeenFrom: '',
    discoverySource: 'All',
    lastSeenTo: '',
    latestOnly: true
  });

  // 2. Action Menu Row Dropdown
  const [activeDropdownRowId, setActiveDropdownRowId] = useState(null);
  const dropdownRef = useRef(null);

  // 3. View Device Details Modal
  const [isViewDetailsModalOpen, setIsViewDetailsModalOpen] = useState(false);
  const [modalDevice, setModalDevice] = useState(null);
  const [modalTab, setModalTab] = useState('Overview');

  // 4. Create Asset (from Discovered Device) Wizard Modal
  const [isCreateAssetWizardOpen, setIsCreateAssetWizardOpen] = useState(false);
  const [createAssetStep, setCreateAssetStep] = useState(1); // 1, 2, 3
  const [createAssetForm, setCreateAssetForm] = useState({
    name: '',
    category: 'IT Equipment',
    type: 'Computer',
    manufacturer: '',
    model: '',
    serialNumber: '',
    location: '',
    owner: '',
    remarks: 'Created from Auto Discovery',
    department: 'Information Technology',
    cost: '1250.00',
    purchaseOrder: 'PO-2026-AUTO'
  });

  // 5. View Discovered Devices (from Job) Modal
  const [isJobDevicesModalOpen, setIsJobDevicesModalOpen] = useState(false);
  const [jobSearchQuery, setJobSearchQuery] = useState('');
  const [jobStatusFilter, setJobStatusFilter] = useState('All Status');
  const [selectedJobData, setSelectedJobData] = useState({
    jobId: 'JOB-2026-0001',
    jobName: 'HQ Network Scan',
    discoveryType: 'IP Range Scan',
    ipRange: '192.168.1.0/24',
    startedOn: '10 Sep 2026 10:24 AM',
    completedOn: '10 Sep 2026 10:38 AM',
    status: 'Completed',
    totalDevices: 245
  });

  // 6. Download / Export Report Modal
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportType, setExportType] = useState('filtered'); // 'filtered' | 'all'
  const [exportFormat, setExportFormat] = useState('xlsx'); // 'xlsx' | 'csv' | 'pdf'
  const [exportColumns, setExportColumns] = useState({
    ipAddress: true,
    hostname: true,
    macAddress: true,
    deviceType: true,
    manufacturer: true,
    model: true,
    serialNumber: true,
    operatingSystem: true
  });
  const [exportFileName, setExportFileName] = useState('Discovered_Devices_20260910_1030');

  // 7. Re-run Discovery Job Modal
  const [isRerunJobModalOpen, setIsRerunJobModalOpen] = useState(false);
  const [rerunJobTarget, setRerunJobTarget] = useState('HQ Network Scan (JOB-2026-0001)');
  const [useSameConfig, setUseSameConfig] = useState(true);

  // 8. Edit Discovery Job Modal
  const [isEditJobModalOpen, setIsEditJobModalOpen] = useState(false);
  const [showAdvancedJobOptions, setShowAdvancedJobOptions] = useState(false);
  const [editJobForm, setEditJobForm] = useState({
    jobName: 'HQ Network Scan',
    discoveryType: 'IP Range Scan',
    ipRange: '192.168.1.0/24',
    profile: 'Default',
    schedule: 'Manual'
  });

  // Additional 9. Match with Existing Asset Modal
  const [isMatchModalOpen, setIsMatchModalOpen] = useState(false);

  // Additional 10. Edit Device Modal
  const [isEditDeviceModalOpen, setIsEditDeviceModalOpen] = useState(false);
  const [editDeviceForm, setEditDeviceForm] = useState({ notes: '', customLocation: '' });

  // Additional 11. Mark as Resolved Modal
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [resolveType, setResolveType] = useState('Verified Duplicate');
  const [resolveRemarks, setResolveRemarks] = useState('');

  // Additional 12. Delete / Suppress Device Modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdownRowId(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter computation
  const filteredDevices = useMemo(() => {
    return devices.filter((dev) => {
      // Primary Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchIp = dev.ipAddress.toLowerCase().includes(q);
        const matchHost = dev.hostname.toLowerCase().includes(q);
        const matchMac = dev.macAddress.toLowerCase().includes(q);
        const matchSn = dev.serialNumber.toLowerCase().includes(q);
        const matchMfr = `${dev.manufacturer} ${dev.model}`.toLowerCase().includes(q);
        if (!matchIp && !matchHost && !matchMac && !matchSn && !matchMfr) return false;
      }
      // Quick Bar Filters
      if (filterDeviceType !== 'All Types' && filterDeviceType !== 'All' && dev.deviceType.toLowerCase() !== filterDeviceType.toLowerCase()) return false;
      if (filterStatus !== 'All Status' && filterStatus !== 'All') {
        if (filterStatus === 'Review' && (dev.status === 'Requires Review' || dev.status === 'Review')) {
          // match
        } else if (dev.status.toLowerCase() !== filterStatus.toLowerCase()) return false;
      }
      if (filterLocation !== 'All Locations' && filterLocation !== 'All' && !dev.location.toLowerCase().includes(filterLocation.toLowerCase())) return false;
      if (filterJob !== 'All Jobs' && filterJob !== 'All' && !dev.discoveryJob.toLowerCase().includes(filterJob.toLowerCase())) return false;

      // Advanced Filters Drawer Criteria (All 14 Fields matching Screenshot #1)
      if (advFilters.ipAddress && !dev.ipAddress.toLowerCase().includes(advFilters.ipAddress.toLowerCase())) return false;
      if (advFilters.hostname && !dev.hostname.toLowerCase().includes(advFilters.hostname.toLowerCase())) return false;
      if (advFilters.macAddress && !dev.macAddress.toLowerCase().includes(advFilters.macAddress.toLowerCase())) return false;
      if (advFilters.deviceType !== 'All' && advFilters.deviceType !== 'All Types' && dev.deviceType.toLowerCase() !== advFilters.deviceType.toLowerCase()) return false;
      if (advFilters.serialNumber && !dev.serialNumber.toLowerCase().includes(advFilters.serialNumber.toLowerCase())) return false;
      if (advFilters.assetStatus !== 'All' && advFilters.assetStatus !== 'All Status') {
        if (advFilters.assetStatus === 'Review' && (dev.status === 'Requires Review' || dev.status === 'Review')) {
          // match
        } else if (dev.status.toLowerCase() !== advFilters.assetStatus.toLowerCase()) return false;
      }
      if (advFilters.manufacturer !== 'All' && dev.manufacturer.toLowerCase() !== advFilters.manufacturer.toLowerCase()) return false;
      if (advFilters.location !== 'All Locations' && advFilters.location !== 'All' && !dev.location.toLowerCase().includes(advFilters.location.toLowerCase())) return false;
      if (advFilters.model !== 'All' && dev.model.toLowerCase() !== advFilters.model.toLowerCase()) return false;
      if (advFilters.discoveryJob !== 'All Jobs' && advFilters.discoveryJob !== 'All' && !dev.discoveryJob.toLowerCase().includes(advFilters.discoveryJob.toLowerCase())) return false;
      if (advFilters.operatingSystem !== 'All' && !dev.operatingSystem.toLowerCase().includes(advFilters.operatingSystem.toLowerCase())) return false;
      if (advFilters.discoverySource !== 'All' && !dev.discoverySource.toLowerCase().includes(advFilters.discoverySource.toLowerCase())) return false;

      return true;
    });
  }, [devices, searchQuery, filterDeviceType, filterStatus, filterLocation, filterJob, advFilters]);

  // Checkbox handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(new Set(filteredDevices.map(d => d.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleToggleSelect = (id, e) => {
    e.stopPropagation();
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setFilterDeviceType('All Types');
    setFilterStatus('All Status');
    setFilterLocation('All Locations');
    setFilterJob('All Jobs');
    setAdvFilters({
      ipAddress: '',
      hostname: '',
      macAddress: '',
      deviceType: 'All',
      serialNumber: '',
      assetStatus: 'All',
      manufacturer: 'All',
      location: 'All Locations',
      model: 'All',
      discoveryJob: 'All Jobs',
      operatingSystem: 'All',
      lastSeenFrom: '',
      discoverySource: 'All',
      lastSeenTo: '',
      latestOnly: true
    });
    setCurrentPage(1);
    showToast('Filters reset to default view');
  };

  // Open Create Asset Wizard pre-populated with device details
  const handleOpenCreateAssetWizard = (device) => {
    const target = device || selectedDevice;
    setCreateAssetForm({
      name: target.hostname,
      category: target.deviceType === 'Computer' ? 'IT Equipment' : target.deviceType === 'Printer' ? 'Office Hardware' : 'Networking',
      type: target.deviceType,
      manufacturer: target.manufacturer,
      model: target.model,
      serialNumber: target.serialNumber,
      location: target.location,
      owner: 'John Doe (IT)',
      remarks: 'Created from Auto Discovery',
      department: 'Information Technology',
      cost: '1250.00',
      purchaseOrder: 'PO-2026-AUTO'
    });
    setCreateAssetStep(1);
    setIsCreateAssetWizardOpen(true);
  };

  // Submit Create Asset
  const handleCreateAssetSubmit = () => {
    const generatedAssetId = `AS-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    setDevices(prev =>
      prev.map(d => (d.id === (modalDevice?.id || selectedDevice?.id) ? { ...d, status: 'Matched', matchedAssetId: generatedAssetId } : d))
    );
    if (selectedDevice) {
      setSelectedDevice(prev => ({ ...prev, status: 'Matched', matchedAssetId: generatedAssetId }));
    }
    showToast(`New Asset created: ${generatedAssetId} linked to ${createAssetForm.name}`);
    setIsCreateAssetWizardOpen(false);
  };

  // Confirm Reconciliation Match
  const handleConfirmMatch = () => {
    const targetAssetId = selectedDevice?.matchedAssetId || `AS-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    setDevices(prev =>
      prev.map(d => (d.id === selectedDevice?.id ? { ...d, status: 'Matched', matchedAssetId: targetAssetId, matchScore: 100 } : d))
    );
    if (selectedDevice) {
      setSelectedDevice(prev => ({ ...prev, status: 'Matched', matchedAssetId: targetAssetId, matchScore: 100 }));
    }
    showToast(`Device ${selectedDevice?.hostname} matched & reconciled with Asset360`);
    setIsMatchModalOpen(false);
  };

  // Status Badge Component matching Screenshot #19 exact colors
  const renderStatusBadge = (status) => {
    const s = String(status || '').toLowerCase();
    if (s === 'matched') {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#E6F4EA] text-[#137333]">
          Matched
        </span>
      );
    }
    if (s === 'new' || s === 'unregistered') {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#E8F0FE] text-[#1A73E8]">
          New
        </span>
      );
    }
    if (s === 'review' || s === 'requires review') {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#FEF7E0] text-[#B06000]">
          Review
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
        {status}
      </span>
    );
  };

  // Render Row Actions matching Screenshot #2 (Actions Menu)
  const renderActionButtons = (device) => {
    const isOpen = activeDropdownRowId === device.id;

    return (
      <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
        {/* Quick icon buttons */}
        <button
          title="View Device Details"
          onClick={() => {
            setSelectedDevice(device);
            setModalDevice(device);
            setIsViewDetailsModalOpen(true);
          }}
          className="p-1.5 rounded-full hover:bg-purple-50 text-[#6C2BD9] transition-colors border border-slate-200 cursor-pointer"
        >
          <Eye className="w-3.5 h-3.5" />
        </button>

        <button
          title={device.matchedAssetId ? `View Asset ${device.matchedAssetId}` : "Match Asset"}
          onClick={() => {
            if (device.matchedAssetId) {
              navigate(`/assets/${device.matchedAssetId}`);
            } else {
              setSelectedDevice(device);
              setIsMatchModalOpen(true);
            }
          }}
          className="p-1.5 rounded-full hover:bg-purple-50 text-[#6C2BD9] transition-colors border border-slate-200 cursor-pointer"
        >
          <LinkIcon className="w-3.5 h-3.5" />
        </button>

        {/* Dynamic Actions Dropdown Trigger (Dot Icon Only) */}
        <div className="relative inline-block text-left">
          <button
            title="More Actions"
            onClick={() => setActiveDropdownRowId(isOpen ? null : device.id)}
            className="p-1.5 rounded-full hover:bg-purple-50 text-[#6C2BD9] transition-colors border border-slate-200 cursor-pointer flex items-center justify-center"
          >
            <MoreVertical className="w-3.5 h-3.5 text-[#6C2BD9]" />
          </button>

          {isOpen && (
            <div
              ref={dropdownRef}
              className="absolute right-0 mt-1.5 w-60 bg-white rounded-2xl shadow-2xl border border-slate-200 py-1.5 z-50 text-xs font-semibold animate-in fade-in zoom-in-95 duration-100"
            >
              {/* Group 1: Details & View */}
              <div className="py-1">
                <button
                  onClick={() => {
                    setSelectedDevice(device);
                    setModalDevice(device);
                    setIsViewDetailsModalOpen(true);
                    setActiveDropdownRowId(null);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-purple-50 flex items-center gap-3 transition-colors cursor-pointer"
                >
                  <Eye className="w-4 h-4 text-[#6C2BD9]" />
                  <span className="font-bold text-slate-900">View Details</span>
                </button>

                <button
                  onClick={() => {
                    if (device.matchedAssetId) {
                      navigate(`/assets/${device.matchedAssetId}`);
                    } else {
                      navigate('/assets');
                    }
                    setActiveDropdownRowId(null);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-purple-50 flex items-center gap-3 transition-colors cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4 text-[#6C2BD9]" />
                  <span className="font-bold text-slate-900">View in Asset 360°</span>
                </button>

                <button
                  onClick={() => {
                    setSelectedDevice(device);
                    handleOpenCreateAssetWizard(device);
                    setActiveDropdownRowId(null);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-purple-50 flex items-center gap-3 transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-[#6C2BD9]" />
                  <span className="font-bold text-slate-900">Create Asset</span>
                </button>

                <button
                  onClick={() => {
                    setSelectedDevice(device);
                    setIsMatchModalOpen(true);
                    setActiveDropdownRowId(null);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-purple-50 flex items-center gap-3 transition-colors cursor-pointer"
                >
                  <LinkIcon className="w-4 h-4 text-[#6C2BD9]" />
                  <span className="font-bold text-slate-900">Match with Existing Asset</span>
                </button>

                <button
                  onClick={() => {
                    setSelectedDevice(device);
                    setIsEditDeviceModalOpen(true);
                    setActiveDropdownRowId(null);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-purple-50 flex items-center gap-3 transition-colors cursor-pointer"
                >
                  <Edit className="w-4 h-4 text-[#6C2BD9]" />
                  <span className="font-bold text-slate-900">Edit Device</span>
                </button>

                <button
                  onClick={() => {
                    setSelectedDevice(device);
                    setDetailTab('history');
                    setActiveDropdownRowId(null);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-purple-50 flex items-center gap-3 transition-colors cursor-pointer"
                >
                  <Clock className="w-4 h-4 text-[#6C2BD9]" />
                  <span className="font-bold text-slate-900">View Discovery History</span>
                </button>
              </div>

              {/* Divider 1 */}
              <div className="border-t border-slate-100 my-1"></div>

              {/* Group 2: Export */}
              <div className="py-1">
                <button
                  onClick={() => {
                    setSelectedDevice(device);
                    setIsExportModalOpen(true);
                    setActiveDropdownRowId(null);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-purple-50 flex items-center gap-3 transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4 text-[#6C2BD9]" />
                  <span className="font-bold text-slate-900">Export Device</span>
                </button>
              </div>

              {/* Divider 2 */}
              <div className="border-t border-slate-100 my-1"></div>

              {/* Group 3: Resolve & Delete */}
              <div className="py-1">
                <button
                  onClick={() => {
                    setSelectedDevice(device);
                    setIsResolveModalOpen(true);
                    setActiveDropdownRowId(null);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-emerald-50 flex items-center gap-3 transition-colors cursor-pointer"
                >
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold text-slate-900">Mark as Resolved</span>
                </button>

                <button
                  onClick={() => {
                    setSelectedDevice(device);
                    setIsDeleteModalOpen(true);
                    setActiveDropdownRowId(null);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-rose-50 flex items-center gap-3 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4 text-rose-600 fill-rose-600" />
                  <span className="font-bold text-rose-600">Delete Device</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 bg-[#F8FAFC] min-h-screen space-y-6 text-slate-800 font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-2.5 bg-slate-900 text-white text-xs font-semibold rounded-xl shadow-xl animate-in fade-in duration-200">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage.msg}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 text-slate-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* TOP KPI CARDS + EXPORT BUTTON (Screenshot #19) */}
      <div className="flex flex-col lg:flex-row items-stretch justify-between gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 flex-1">
          {/* Card 1: Total Devices */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
              <Monitor className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-slate-900">{kpis.total}</p>
              <p className="text-xs font-medium text-slate-500">Total Devices</p>
            </div>
          </div>

          {/* Card 2: Matched with Assets */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-extrabold text-slate-900">{kpis.matched}</p>
                <p className="text-xs font-medium text-slate-500">Matched with Assets</p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
              {kpis.matchedPct}%
            </span>
          </div>

          {/* Card 3: New / Unregistered */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-[#6C2BD9] shrink-0">
                <Plus className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-extrabold text-slate-900">{kpis.newCount}</p>
                <p className="text-xs font-medium text-slate-500">New / Unregistered</p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
              {kpis.newPct}%
            </span>
          </div>

          {/* Card 4: Requires Review */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-extrabold text-slate-900">{kpis.review}</p>
                <p className="text-xs font-medium text-slate-500">Requires Review</p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-100">
              {kpis.reviewPct}%
            </span>
          </div>
        </div>

        {/* Top Export Button */}
        <div className="flex items-start justify-end shrink-0">
          <button
            onClick={() => setIsExportModalOpen(true)}
            className="px-5 py-3 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white rounded-2xl font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
            <ChevronDown className="w-3.5 h-3.5 ml-1" />
          </button>
        </div>
      </div>



      {/* SEARCH AND FILTER BAR (Screenshot #19) */}
      <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-2xs space-y-3">
        {/* Top Control Line: Search Bar + Filter Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by IP, hostname, MAC, serial number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#6C2BD9] focus:bg-white transition-all"
            />
          </div>

          {/* Action Buttons: View Job Devices, Re-run Job, Edit Job, More Filters & Reset */}
          <div className="flex items-center gap-2 justify-end shrink-0">
            <button
              onClick={() => setIsJobDevicesModalOpen(true)}
              className="px-3.5 py-2 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-[#6C2BD9] rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <Eye className="w-3.5 h-3.5 text-[#6C2BD9]" />
              <span>View Job Devices</span>
            </button>
            <button
              onClick={() => setIsRerunJobModalOpen(true)}
              className="px-3.5 py-2 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-[#6C2BD9] rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#6C2BD9]" />
              <span>Re-run Job</span>
            </button>
            <button
              onClick={() => setIsEditJobModalOpen(true)}
              className="px-3.5 py-2 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-[#6C2BD9] rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <Edit className="w-3.5 h-3.5 text-[#6C2BD9]" />
              <span>Edit Job</span>
            </button>
            <button
              onClick={() => setIsAdvancedFiltersOpen(true)}
              className="px-3.5 py-2 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-[#6C2BD9] rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5 text-[#6C2BD9]" />
              <span>More Filters</span>
            </button>
            <button
              onClick={handleResetFilters}
              className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Bottom Control Line: 4 Quick Filter Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs pt-2 border-t border-slate-100">
          {/* Filter 1: Device Type */}
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-semibold shrink-0 text-xs">Device Type</span>
            <select
              value={filterDeviceType}
              onChange={(e) => setFilterDeviceType(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#6C2BD9]"
            >
              <option value="All Types">All Types</option>
              <option value="Computer">Computer</option>
              <option value="Monitor">Monitor</option>
              <option value="Printer">Printer</option>
              <option value="Network Device">Network Device</option>
              <option value="Server">Server</option>
              <option value="Mobile Device">Mobile Device</option>
              <option value="Display">Display</option>
              <option value="POS Device">POS Device</option>
            </select>
          </div>

          {/* Filter 2: Status */}
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-semibold shrink-0 text-xs">Status</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#6C2BD9]"
            >
              <option value="All Status">All Status</option>
              <option value="Matched">Matched</option>
              <option value="New">New</option>
              <option value="Review">Requires Review</option>
            </select>
          </div>

          {/* Filter 3: Location */}
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-semibold shrink-0 text-xs">Location</span>
            <select
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#6C2BD9]"
            >
              <option value="All Locations">All Locations</option>
              <option value="Dubai HQ">Dubai HQ</option>
              <option value="IT Department">IT Department</option>
              <option value="Server Room">Server Room</option>
              <option value="Copy Room">Copy Room</option>
            </select>
          </div>

          {/* Filter 4: Discovery Job */}
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-semibold shrink-0 text-xs">Discovery Job</span>
            <select
              value={filterJob}
              onChange={(e) => setFilterJob(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#6C2BD9]"
            >
              <option value="All Jobs">All Jobs</option>
              <option value="HQ Network Scan">HQ Network Scan</option>
              <option value="Daily Subnet Sweep">Daily Subnet Sweep</option>
            </select>
          </div>
        </div>
      </div>

      {/* DISCOVERED DEVICES TABLE (Screenshot #19) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-auto max-h-[540px]">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 z-10 bg-[#F8FAFC] shadow-2xs text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-3 w-8 text-center">
                  <input
                    type="checkbox"
                    checked={filteredDevices.length > 0 && selectedIds.size === filteredDevices.length}
                    onChange={handleSelectAll}
                    className="rounded border-slate-300 text-[#6C2BD9] focus:ring-[#6C2BD9]"
                  />
                </th>
                <th className="py-3 px-3">IP Address</th>
                <th className="py-3 px-3">Hostname</th>
                <th className="py-3 px-3">MAC Address</th>
                <th className="py-3 px-3">Device Type</th>
                <th className="py-3 px-3">Manufacturer</th>
                <th className="py-3 px-3">Model</th>
                <th className="py-3 px-3">Serial Number</th>
                <th className="py-3 px-3">Last Seen</th>
                <th className="py-3 px-3 text-center">Asset Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDevices.length === 0 ? (
                <tr>
                  <td colSpan="11" className="py-10 text-center text-slate-400 font-medium">
                    No discovered devices found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredDevices.map((dev) => {
                  const isSelected = selectedDevice?.id === dev.id;
                  const isChecked = selectedIds.has(dev.id);

                  return (
                    <tr
                      key={dev.id}
                      onClick={() => setSelectedDevice(dev)}
                      className={clsx(
                        "cursor-pointer transition-colors",
                        isSelected ? "bg-purple-50/50 font-medium" : "hover:bg-slate-50/80"
                      )}
                    >
                      <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => handleToggleSelect(dev.id, e)}
                          className="rounded border-slate-300 text-[#6C2BD9] focus:ring-[#6C2BD9]"
                        />
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-[#6C2BD9]">
                        {dev.ipAddress}
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-900 uppercase">
                        {dev.hostname}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-500 text-[11px]">
                        {dev.macAddress}
                      </td>
                      <td className="py-3 px-3 text-slate-700">
                        {dev.deviceType}
                      </td>
                      <td className="py-3 px-3 text-slate-700">
                        {dev.manufacturer}
                      </td>
                      <td className="py-3 px-3 text-slate-700">
                        {dev.model}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-600 text-[11px]">
                        {dev.serialNumber}
                      </td>
                      <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                        {dev.lastSeen}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {renderStatusBadge(dev.status)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {renderActionButtons(dev)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* TABLE FOOTER / SCROLL INFO */}
        <div className="p-3.5 bg-white border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span className="font-medium text-slate-600">Showing {filteredDevices.length} records</span>
          <span className="text-slate-400">Scroll down to view all records</span>
        </div>
      </div>

      {/* LOWER SPLIT VIEW PANEL (Screenshot #19: 2 Cards Side-by-Side) */}
      {selectedDevice && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT CARD: Device Details - DESKTOP-001 (lg:col-span-5) */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 flex flex-col justify-between">
            <div>
              {/* Header Title & Action */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-[#6C2BD9]">
                    Device Details – {selectedDevice.hostname}
                  </h3>
                  {renderStatusBadge(selectedDevice.status)}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenCreateAssetWizard(selectedDevice)}
                    className="px-3 py-1.5 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create Asset</span>
                  </button>
                  <button
                    onClick={() => navigate(`/assets/${selectedDevice.matchedAssetId || ''}`)}
                    className="px-3 py-1.5 bg-white hover:bg-purple-50 text-[#6C2BD9] border border-purple-200 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>View in Asset 360°</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Image & Key-Value Details */}
              <div className="pt-4 flex flex-col sm:flex-row items-start gap-4">
                {/* Computer Monitor Thumbnail Image Graphic */}
                <div className="w-28 flex flex-col items-center shrink-0">
                  <div className="w-24 h-20 bg-slate-900 rounded-xl p-2 border-2 border-slate-700 shadow-md flex flex-col items-center justify-center relative">
                    <Monitor className="w-10 h-10 text-cyan-400" />
                    <div className="w-10 h-1.5 bg-slate-600 rounded-full mt-1"></div>
                  </div>
                  <div className="w-8 h-2 bg-slate-400 rounded-b-md"></div>
                  <span className="mt-2 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">
                    {selectedDevice.deviceType}
                  </span>
                </div>

                {/* Key-Value Specs Grid */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs flex-1">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Hostname</span>
                    <span className="font-bold text-slate-900">{selectedDevice.hostname}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Operating System</span>
                    <span className="font-medium text-slate-800">{selectedDevice.operatingSystem}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">IP Address</span>
                    <span className="font-mono font-bold text-[#6C2BD9]">{selectedDevice.ipAddress}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Domain</span>
                    <span className="font-medium text-slate-800">{selectedDevice.domain}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">MAC Address</span>
                    <span className="font-mono text-slate-700">{selectedDevice.macAddress}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Last Seen</span>
                    <span className="font-medium text-slate-800">{selectedDevice.lastSeen}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">Device Type</span>
                    <span className="font-medium text-slate-800">{selectedDevice.deviceType}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Location</span>
                    <span className="font-medium text-slate-800">{selectedDevice.location}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">Manufacturer</span>
                    <span className="font-medium text-slate-800">{selectedDevice.manufacturer}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Discovery Job</span>
                    <button
                      onClick={() => {
                        setSelectedJobData({
                          jobId: 'JOB-2026-0001',
                          jobName: selectedDevice.discoveryJob,
                          discoveryType: 'IP Range Scan',
                          ipRange: '192.168.1.0/24',
                          startedOn: '10 Sep 2026 10:24 AM',
                          completedOn: '10 Sep 2026 10:38 AM',
                          status: 'Completed',
                          totalDevices: 245
                        });
                        setIsJobDevicesModalOpen(true);
                      }}
                      className="font-extrabold text-[#6C2BD9] hover:underline cursor-pointer text-left block"
                    >
                      {selectedDevice.discoveryJob}
                    </button>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">Model</span>
                    <span className="font-medium text-slate-800">{selectedDevice.model}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">First Discovered</span>
                    <span className="font-medium text-slate-800">{selectedDevice.firstDiscovered}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">Serial Number</span>
                    <span className="font-mono font-medium text-slate-800">{selectedDevice.serialNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Asset ID</span>
                    <span className="font-mono font-bold text-[#6C2BD9]">{selectedDevice.matchedAssetId || ''}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT CARD: Sub-tabs & Specs + Location Map (lg:col-span-7) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 flex flex-col justify-between">
            <div>
              {/* Header Sub-tabs */}
              <div className="flex items-center gap-6 border-b border-slate-200 pb-3 overflow-x-auto">
                {[
                  { id: 'hardware', label: 'Hardware Details' },
                  { id: 'software', label: 'Installed Software' },
                  { id: 'network', label: 'Network Information' },
                  { id: 'match', label: 'Asset Match' },
                  { id: 'history', label: 'Discovery History' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setDetailTab(tab.id)}
                    className={clsx(
                      "font-bold text-xs whitespace-nowrap pb-2 border-b-2 transition-all cursor-pointer",
                      detailTab === tab.id
                        ? "border-[#6C2BD9] text-[#6C2BD9]"
                        : "border-transparent text-slate-500 hover:text-slate-800"
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Sub-tab Body */}
              <div className="pt-4 grid grid-cols-1 sm:grid-cols-12 gap-4">
                {/* Hardware Spec List (sm:col-span-7) */}
                <div className="sm:col-span-7 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between p-2 bg-slate-50 rounded-xl">
                    <span className="flex items-center gap-2 text-slate-600 font-medium">
                      <Cpu className="w-4 h-4 text-[#6C2BD9]" />
                      CPU
                    </span>
                    <span className="font-bold text-slate-900">{selectedDevice.hardware?.cpu || '-' }</span>
                  </div>

                  <div className="flex items-center justify-between p-2 bg-slate-50 rounded-xl">
                    <span className="flex items-center gap-2 text-slate-600 font-medium">
                      <HardDrive className="w-4 h-4 text-[#6C2BD9]" />
                      RAM
                    </span>
                    <span className="font-bold text-slate-900">{selectedDevice.hardware?.ram || '-' }</span>
                  </div>

                  <div className="flex items-center justify-between p-2 bg-slate-50 rounded-xl">
                    <span className="flex items-center gap-2 text-slate-600 font-medium">
                      <Database className="w-4 h-4 text-[#6C2BD9]" />
                      Storage
                    </span>
                    <span className="font-bold text-slate-900">{selectedDevice.hardware?.storage || '-' }</span>
                  </div>

                  <div className="flex items-center justify-between p-2 bg-slate-50 rounded-xl">
                    <span className="flex items-center gap-2 text-slate-600 font-medium">
                      <FileText className="w-4 h-4 text-[#6C2BD9]" />
                      BIOS Version
                    </span>
                    <span className="font-bold text-slate-900">{selectedDevice.hardware?.bios || '-' }</span>
                  </div>

                  <div className="flex items-center justify-between p-2 bg-slate-50 rounded-xl">
                    <span className="flex items-center gap-2 text-slate-600 font-medium">
                      <Key className="w-4 h-4 text-[#6C2BD9]" />
                      System UUID
                    </span>
                    <span className="font-mono text-[11px] text-slate-700">{selectedDevice.hardware?.systemUuid || '-' }</span>
                  </div>

                  <div className="flex items-center justify-between p-2 bg-slate-50 rounded-xl">
                    <span className="flex items-center gap-2 text-slate-600 font-medium">
                      <Monitor className="w-4 h-4 text-[#6C2BD9]" />
                      Chassis Type
                    </span>
                    <span className="font-bold text-slate-900">{selectedDevice.hardware?.chassis || '-' }</span>
                  </div>

                  <div className="flex items-center justify-between p-2 bg-slate-50 rounded-xl">
                    <span className="flex items-center gap-2 text-slate-600 font-medium">
                      <Barcode className="w-4 h-4 text-slate-400" />
                      Asset Tag (if found)
                    </span>
                    <span className="font-mono text-slate-500">{selectedDevice.hardware?.assetTagEtched || 'N/A'}</span>
                  </div>
                </div>

                {/* Right Card: Location on Map (sm:col-span-5) */}
                <div className="sm:col-span-5 bg-[#F8FAFC] border border-slate-200 rounded-2xl p-3 flex flex-col justify-between space-y-3">
                  <span className="text-xs font-bold text-slate-800">Location on Map</span>

                  {/* Floor Plan Diagram Preview Graphic */}
                  <div className="relative w-full h-32 bg-slate-200 rounded-xl overflow-hidden border border-slate-300 flex items-center justify-center">
                    {/* Architectural Blueprint Lines */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#cbd5e1_1px,transparent_1px),linear-gradient(to_bottom,#cbd5e1_1px,transparent_1px)] bg-[size:1rem_1rem]"></div>
                    <div className="absolute top-2 left-2 w-16 h-12 border-2 border-slate-400 rounded bg-white/60"></div>
                    <div className="absolute top-2 right-2 w-20 h-12 border-2 border-slate-400 rounded bg-white/60"></div>
                    <div className="absolute bottom-2 left-2 w-24 h-12 border-2 border-purple-400 bg-purple-50/60"></div>

                    {/* Pin Location Marker */}
                    <div className="absolute bottom-6 left-14 flex items-center justify-center">
                      <span className="absolute w-6 h-6 rounded-full bg-[#6C2BD9]/30 animate-ping"></span>
                      <div className="w-6 h-6 rounded-full bg-[#6C2BD9] text-white flex items-center justify-center shadow-lg">
                        <MapPin className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-bold text-slate-900">Dubai HQ - Ground Floor</p>
                    <p className="text-[11px] text-slate-500 font-medium">IT Department</p>
                  </div>

                  <button
                    onClick={() => navigate('/rtls/map')}
                    className="w-full py-2 bg-white hover:bg-purple-50 text-[#6C2BD9] border border-purple-200 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>View on Map</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8 INTERACTIVE MODALS IMPLEMENTED EXACTLY AS SPECIFIED IN PROMPT IMAGE      */}
      {/* ========================================================================= */}

      {/* MODAL 1: MORE FILTERS (ADVANCED FILTERS) (Prompt Image #1) */}
      {isAdvancedFiltersOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-[#6C2BD9]">
                  <Sliders className="w-4 h-4 text-[#6C2BD9]" />
                </div>
                <h2 className="text-base font-extrabold text-[#0F172A]">Advanced Filters</h2>
              </div>
              <button
                onClick={() => setIsAdvancedFiltersOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-200 text-slate-400 hover:text-slate-700 cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body - All 14 Grid Fields matching Screenshot #1 */}
            <div className="p-6 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
              {/* Row 1: IP Address | Hostname */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-[#0F172A] block mb-1">IP Address</label>
                  <input
                    type="text"
                    placeholder="e.g. 192.168.1.10"
                    value={advFilters.ipAddress}
                    onChange={(e) => setAdvFilters({ ...advFilters, ipAddress: e.target.value })}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-mono text-xs focus:outline-none focus:border-[#6C2BD9] focus:ring-1 focus:ring-[#6C2BD9]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#0F172A] block mb-1">Hostname</label>
                  <input
                    type="text"
                    placeholder="Enter hostname"
                    value={advFilters.hostname}
                    onChange={(e) => setAdvFilters({ ...advFilters, hostname: e.target.value })}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#6C2BD9] focus:ring-1 focus:ring-[#6C2BD9]"
                  />
                </div>
              </div>

              {/* Row 2: MAC Address | Device Type */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-[#0F172A] block mb-1">MAC Address</label>
                  <input
                    type="text"
                    placeholder="e.g. 00:1A:2B:3C:4D:5E"
                    value={advFilters.macAddress}
                    onChange={(e) => setAdvFilters({ ...advFilters, macAddress: e.target.value })}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-mono text-xs focus:outline-none focus:border-[#6C2BD9] focus:ring-1 focus:ring-[#6C2BD9]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#0F172A] block mb-1">Device Type</label>
                  <select
                    value={advFilters.deviceType}
                    onChange={(e) => setAdvFilters({ ...advFilters, deviceType: e.target.value })}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#6C2BD9]"
                  >
                    <option value="All">All</option>
                    <option value="Computer">Computer</option>
                    <option value="Monitor">Monitor</option>
                    <option value="Printer">Printer</option>
                    <option value="Network Device">Network Device</option>
                    <option value="Server">Server</option>
                    <option value="Mobile Device">Mobile Device</option>
                    <option value="Display">Display</option>
                    <option value="POS Device">POS Device</option>
                  </select>
                </div>
              </div>

              {/* Row 3: Serial Number | Asset Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-[#0F172A] block mb-1">Serial Number</label>
                  <input
                    type="text"
                    placeholder="Enter serial number"
                    value={advFilters.serialNumber}
                    onChange={(e) => setAdvFilters({ ...advFilters, serialNumber: e.target.value })}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-mono text-xs focus:outline-none focus:border-[#6C2BD9] focus:ring-1 focus:ring-[#6C2BD9]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#0F172A] block mb-1">Asset Status</label>
                  <select
                    value={advFilters.assetStatus}
                    onChange={(e) => setAdvFilters({ ...advFilters, assetStatus: e.target.value })}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#6C2BD9]"
                  >
                    <option value="All">All</option>
                    <option value="Matched">Matched</option>
                    <option value="New">New</option>
                    <option value="Review">Requires Review</option>
                  </select>
                </div>
              </div>

              {/* Row 4: Manufacturer | Location */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-[#0F172A] block mb-1">Manufacturer</label>
                  <select
                    value={advFilters.manufacturer}
                    onChange={(e) => setAdvFilters({ ...advFilters, manufacturer: e.target.value })}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#6C2BD9]"
                  >
                    <option value="All">All</option>
                    <option value="Dell">Dell</option>
                    <option value="HP">HP</option>
                    <option value="Cisco">Cisco</option>
                    <option value="Lenovo">Lenovo</option>
                    <option value="Aruba">Aruba</option>
                    <option value="HPE">HPE</option>
                    <option value="Apple">Apple</option>
                    <option value="Samsung">Samsung</option>
                    <option value="Zebra">Zebra</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-[#0F172A] block mb-1">Location</label>
                  <select
                    value={advFilters.location}
                    onChange={(e) => setAdvFilters({ ...advFilters, location: e.target.value })}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#6C2BD9]"
                  >
                    <option value="All Locations">All Locations</option>
                    <option value="Dubai HQ - IT Department">Dubai HQ - IT Department</option>
                    <option value="Dubai HQ - Copy Room">Dubai HQ - Copy Room</option>
                    <option value="Dubai HQ - Server Room">Dubai HQ - Server Room</option>
                    <option value="Dubai HQ - Floor 2">Dubai HQ - Floor 2</option>
                    <option value="Dubai HQ - Floor 1 Hallway">Dubai HQ - Floor 1 Hallway</option>
                    <option value="Dubai HQ - Executive Suite">Dubai HQ - Executive Suite</option>
                    <option value="Dubai HQ - Reception Lobby">Dubai HQ - Reception Lobby</option>
                    <option value="Dubai HQ - Retail Kiosk">Dubai HQ - Retail Kiosk</option>
                  </select>
                </div>
              </div>

              {/* Row 5: Model | Discovery Job */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-[#0F172A] block mb-1">Model</label>
                  <select
                    value={advFilters.model}
                    onChange={(e) => setAdvFilters({ ...advFilters, model: e.target.value })}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#6C2BD9]"
                  >
                    <option value="All">All</option>
                    <option value="OptiPlex 7020">OptiPlex 7020</option>
                    <option value="P2422H">P2422H</option>
                    <option value="LaserJet Pro">LaserJet Pro</option>
                    <option value="C9300">C9300</option>
                    <option value="ThinkPad T14">ThinkPad T14</option>
                    <option value="AP-515">AP-515</option>
                    <option value="ProLiant DL380">ProLiant DL380</option>
                    <option value="iPad Air">iPad Air</option>
                    <option value="QE55Q60">QE55Q60</option>
                    <option value="TC52">TC52</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-[#0F172A] block mb-1">Discovery Job</label>
                  <select
                    value={advFilters.discoveryJob}
                    onChange={(e) => setAdvFilters({ ...advFilters, discoveryJob: e.target.value })}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#6C2BD9]"
                  >
                    <option value="All Jobs">All Jobs</option>
                    <option value="HQ Network Scan">HQ Network Scan</option>
                    <option value="Daily Subnet Sweep">Daily Subnet Sweep</option>
                    <option value="Initial Sweep">Initial Sweep</option>
                  </select>
                </div>
              </div>

              {/* Row 6: Operating System | Last Seen From */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-[#0F172A] block mb-1">Operating System</label>
                  <select
                    value={advFilters.operatingSystem}
                    onChange={(e) => setAdvFilters({ ...advFilters, operatingSystem: e.target.value })}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#6C2BD9]"
                  >
                    <option value="All">All</option>
                    <option value="Windows 11 Pro 23H2">Windows 11 Pro 23H2</option>
                    <option value="Embedded Firmware v1.4">Embedded Firmware v1.4</option>
                    <option value="HP FutureSmart 4.11">HP FutureSmart 4.11</option>
                    <option value="Cisco IOS-XE 17.09.03a">Cisco IOS-XE 17.09.03a</option>
                    <option value="Windows 11 Pro 64-bit">Windows 11 Pro 64-bit</option>
                    <option value="ArubaOS 8.10.0.6">ArubaOS 8.10.0.6</option>
                    <option value="Windows Server 2022 Datacenter">Windows Server 2022 Datacenter</option>
                    <option value="iPadOS 17.5">iPadOS 17.5</option>
                    <option value="Tizen OS 6.5">Tizen OS 6.5</option>
                    <option value="Android 11 Enterprise">Android 11 Enterprise</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-[#0F172A] block mb-1">Last Seen From</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="dd/mm/yyyy"
                      value={advFilters.lastSeenFrom}
                      onChange={(e) => setAdvFilters({ ...advFilters, lastSeenFrom: e.target.value })}
                      className="w-full py-2.5 pl-3 pr-10 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-[#6C2BD9]"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-lg bg-[#6C2BD9] text-white flex items-center justify-center pointer-events-none shadow-xs">
                      <Calendar className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 7: Discovery Source | Last Seen To */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-[#0F172A] block mb-1">Discovery Source</label>
                  <select
                    value={advFilters.discoverySource}
                    onChange={(e) => setAdvFilters({ ...advFilters, discoverySource: e.target.value })}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#6C2BD9]"
                  >
                    <option value="All">All</option>
                    <option value="WMI/WinRM & SNMP">WMI/WinRM & SNMP</option>
                    <option value="DDC/CI & USB Passthrough">DDC/CI & USB Passthrough</option>
                    <option value="SNMP v2c / JetDirect">SNMP v2c / JetDirect</option>
                    <option value="SSH & SNMP v3">SSH & SNMP v3</option>
                    <option value="WMI & ARP Sweep">WMI & ARP Sweep</option>
                    <option value="SNMP v2c / LLDP">SNMP v2c / LLDP</option>
                    <option value="WMI & iLO5 SNMP">WMI & iLO5 SNMP</option>
                    <option value="Bonjour / mDNS & ARP">Bonjour / mDNS & ARP</option>
                    <option value="UPnP / SSDP & ARP">UPnP / SSDP & ARP</option>
                    <option value="WMI & Ping Sweep">WMI & Ping Sweep</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-[#0F172A] block mb-1">Last Seen To</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="dd/mm/yyyy"
                      value={advFilters.lastSeenTo}
                      onChange={(e) => setAdvFilters({ ...advFilters, lastSeenTo: e.target.value })}
                      className="w-full py-2.5 pl-3 pr-10 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-[#6C2BD9]"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-lg bg-[#6C2BD9] text-[#6C2BD9] flex items-center justify-center pointer-events-none shadow-xs">
                      <Calendar className="w-3.5 h-3.5 text-white" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Checkbox: Show only latest records */}
              <label className="flex items-center gap-2 pt-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={advFilters.latestOnly}
                  onChange={(e) => setAdvFilters({ ...advFilters, latestOnly: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-300 text-[#6C2BD9] focus:ring-[#6C2BD9]"
                />
                <span className="font-semibold text-slate-700 text-xs">Show only latest records</span>
              </label>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
              <button
                onClick={handleResetFilters}
                className="px-6 py-2 bg-white hover:bg-purple-50 border border-[#6C2BD9] text-[#6C2BD9] rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs"
              >
                Reset
              </button>
              <button
                onClick={() => {
                  showToast('Advanced filters applied to discovery repository');
                  setIsAdvancedFiltersOpen(false);
                }}
                className="px-6 py-2 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: VIEW DEVICE DETAILS (Prompt Image #3) */}
      {isViewDetailsModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-base font-extrabold text-[#0F172A]">Device Details</h2>
              <button
                onClick={() => setIsViewDetailsModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-200 text-slate-400 hover:text-slate-700 cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 text-xs max-h-[75vh] overflow-y-auto">
              {/* Device Header Info Banner matching Screenshot #3 */}
              <div className="flex items-center gap-4 pb-2 border-b border-slate-100">
                <div className="w-14 h-14 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-[#6C2BD9] shrink-0">
                  <Monitor className="w-8 h-8 text-[#6C2BD9]" />
                </div>
                <div>
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-lg font-extrabold text-slate-900">
                      {modalDevice?.hostname || selectedDevice?.hostname || 'DESKTOP-001'}
                    </h3>
                    {renderStatusBadge(modalDevice?.status || selectedDevice?.status || 'Matched')}
                  </div>
                  <p className="text-xs font-semibold text-slate-500 mt-0.5">
                    {modalDevice?.deviceType || selectedDevice?.deviceType || 'Computer'} &nbsp;|&nbsp; {modalDevice?.manufacturer || selectedDevice?.manufacturer || 'Dell'} &nbsp;|&nbsp; {modalDevice?.model || selectedDevice?.model || 'OptiPlex 7020'}
                  </p>
                </div>
              </div>

              {/* Tab Navigation (5 Tabs matching Screenshot #3) */}
              <div className="flex items-center gap-6 border-b border-slate-200 pb-0">
                {[
                  { id: 'Overview', label: 'Overview' },
                  { id: 'Hardware', label: 'Hardware' },
                  { id: 'Network', label: 'Network' },
                  { id: 'Installed Software', label: 'Installed Software' },
                  { id: 'Discovery History', label: 'Discovery History' }
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setModalTab(t.id)}
                    className={clsx(
                      "font-bold text-xs pb-2.5 border-b-2 transition-all cursor-pointer",
                      modalTab === t.id
                        ? "border-[#6C2BD9] text-[#6C2BD9]"
                        : "border-transparent text-slate-500 hover:text-slate-800"
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              {modalTab === 'Overview' && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-2">
                  {/* Left Column: Key-Value Details (Matching Screenshot #3 exact 14 keys) */}
                  <div className="md:col-span-7 grid grid-cols-2 gap-y-3 gap-x-6 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[11px] font-semibold mb-0.5">Hostname</span>
                      <span className="font-extrabold text-slate-900">{modalDevice?.hostname || selectedDevice?.hostname || 'DESKTOP-001'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px] font-semibold mb-0.5">IP Address</span>
                      <span className="font-mono font-bold text-[#1A73E8]">{modalDevice?.ipAddress || selectedDevice?.ipAddress || '192.168.1.10'}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[11px] font-semibold mb-0.5">MAC Address</span>
                      <span className="font-mono text-slate-700">{modalDevice?.macAddress || selectedDevice?.macAddress || '00:1A:2B:3C:4D:5E'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px] font-semibold mb-0.5">Serial Number</span>
                      <span className="font-mono text-slate-700">{modalDevice?.serialNumber || selectedDevice?.serialNumber || '7CD1234'}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[11px] font-semibold mb-0.5">Device Type</span>
                      <span className="font-semibold text-slate-800">{modalDevice?.deviceType || selectedDevice?.deviceType || 'Computer'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px] font-semibold mb-0.5">Manufacturer</span>
                      <span className="font-semibold text-slate-800">{modalDevice?.manufacturer || selectedDevice?.manufacturer || 'Dell'}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[11px] font-semibold mb-0.5">Model</span>
                      <span className="font-semibold text-slate-800">{modalDevice?.model || selectedDevice?.model || 'OptiPlex 7020'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px] font-semibold mb-0.5">Operating System</span>
                      <span className="font-semibold text-slate-800">{modalDevice?.operatingSystem || selectedDevice?.operatingSystem || 'Windows 11 Pro 23H2'}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[11px] font-semibold mb-0.5">Domain</span>
                      <span className="font-semibold text-slate-800">{modalDevice?.domain || selectedDevice?.domain || 'ASSET360'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px] font-semibold mb-0.5">Last Seen</span>
                      <span className="font-semibold text-slate-800">{modalDevice?.lastSeen || selectedDevice?.lastSeen || '10 Sep 2026 10:24 AM'}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[11px] font-semibold mb-0.5">Location</span>
                      <span className="font-semibold text-slate-800">{modalDevice?.location || selectedDevice?.location || 'Dubai HQ - IT Department'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px] font-semibold mb-0.5">Discovery Job</span>
                      <span className="font-semibold text-slate-800">{modalDevice?.discoveryJob || selectedDevice?.discoveryJob || 'HQ Network Scan'}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[11px] font-semibold mb-0.5">First Discovered</span>
                      <span className="font-semibold text-slate-800">{modalDevice?.firstDiscovered || selectedDevice?.firstDiscovered || '05 Sep 2026 08:15 AM'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px] font-semibold mb-0.5">Asset ID</span>
                      {modalDevice?.matchedAssetId || selectedDevice?.matchedAssetId ? (
                        <button
                          onClick={() => {
                            setIsViewDetailsModalOpen(false);
                            navigate(`/assets/${modalDevice?.matchedAssetId || selectedDevice?.matchedAssetId}`);
                          }}
                          className="font-mono font-bold text-[#6C2BD9] underline hover:text-purple-800 cursor-pointer"
                        >
                          {modalDevice?.matchedAssetId || selectedDevice?.matchedAssetId}
                        </button>
                      ) : (
                        <span className="font-mono text-slate-400">Not Matched</span>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Location on Map Card matching Screenshot #3 */}
                  <div className="md:col-span-5 bg-[#F8FAFC] border border-slate-200 rounded-2xl p-4 flex flex-col justify-between space-y-3">
                    <span className="font-extrabold text-[#6C2BD9] text-xs">Location on Map</span>

                    {/* Architectural Map Preview with Blue Pin Marker */}
                    <div className="relative w-full h-36 bg-slate-200 rounded-xl overflow-hidden border border-slate-300 flex items-center justify-center">
                      <div className="absolute inset-0 bg-[linear-gradient(to_right,#cbd5e1_1px,transparent_1px),linear-gradient(to_bottom,#cbd5e1_1px,transparent_1px)] bg-[size:1rem_1rem]"></div>
                      <div className="absolute top-2 left-2 w-20 h-14 border-2 border-slate-400 rounded bg-white/70"></div>
                      <div className="absolute top-2 right-2 w-24 h-14 border-2 border-slate-400 rounded bg-white/70"></div>
                      <div className="absolute bottom-2 left-4 w-28 h-14 border-2 border-purple-400 bg-purple-50/70"></div>

                      {/* Map Pin Marker matching Screenshot #3 */}
                      <div className="absolute bottom-6 left-16 flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-[#6C2BD9] text-white flex items-center justify-center shadow-lg animate-bounce">
                          <MapPin className="w-5 h-5 fill-white" />
                        </div>
                      </div>
                    </div>

                    <div>
                      <p className="font-extrabold text-slate-900 text-xs">Dubai HQ - Ground Floor</p>
                      <p className="text-slate-500 font-semibold text-[11px]">IT Department</p>
                    </div>

                    <button
                      onClick={() => {
                        setIsViewDetailsModalOpen(false);
                        navigate('/rtls/map');
                      }}
                      className="w-full py-2.5 bg-white hover:bg-purple-50 border border-[#6C2BD9] text-[#6C2BD9] rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-2xs"
                    >
                      <MapPin className="w-4 h-4 text-[#6C2BD9]" />
                      <span>View on Map</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Hardware Tab */}
              {modalTab === 'Hardware' && (
                <div className="space-y-3 pt-2">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-slate-400 block font-semibold">Processor (CPU)</span>
                      <span className="font-extrabold text-slate-900">{(modalDevice || selectedDevice)?.hardware?.cpu || '-' }</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-slate-400 block font-semibold">System Memory (RAM)</span>
                      <span className="font-extrabold text-slate-900">{(modalDevice || selectedDevice)?.hardware?.ram || '16 GB DDR4'}</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-slate-400 block font-semibold">Storage</span>
                      <span className="font-extrabold text-slate-900">{(modalDevice || selectedDevice)?.hardware?.storage || '512 GB NVMe SSD'}</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-slate-400 block font-semibold">BIOS Firmware</span>
                      <span className="font-extrabold text-slate-900">{(modalDevice || selectedDevice)?.hardware?.bios || '-' }</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-slate-400 block font-semibold">System UUID</span>
                      <span className="font-mono text-slate-700">{(modalDevice || selectedDevice)?.hardware?.systemUuid || '-' }</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-slate-400 block font-semibold">Chassis Type</span>
                      <span className="font-extrabold text-slate-900">{(modalDevice || selectedDevice)?.hardware?.chassis || '-' }</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Network Tab */}
              {modalTab === 'Network' && (
                <div className="space-y-3 pt-2">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-slate-400 block font-semibold">IP Subnet</span>
                      <span className="font-mono font-bold text-[#1A73E8]">{(modalDevice || selectedDevice)?.network?.ipSubnet || '192.168.1.10 / 255.255.255.0'}</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-slate-400 block font-semibold">Default Gateway</span>
                      <span className="font-mono text-slate-800">{(modalDevice || selectedDevice)?.network?.gateway || '192.168.1.1'}</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-slate-400 block font-semibold">DNS Servers</span>
                      <span className="font-mono text-slate-800">{(modalDevice || selectedDevice)?.network?.dns || '192.168.1.1, 8.8.8.8'}</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-slate-400 block font-semibold">Switch Port</span>
                      <span className="font-bold text-slate-900">{(modalDevice || selectedDevice)?.network?.switchPort || 'SW-CORE-01 (Gi1/0/10)'}</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-slate-400 block font-semibold">VLAN</span>
                      <span className="font-bold text-slate-900">{(modalDevice || selectedDevice)?.network?.vlan || '10 (IT Network)'}</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-slate-400 block font-semibold">Connection Speed</span>
                      <span className="font-bold text-slate-900">{(modalDevice || selectedDevice)?.network?.speed || '1000 Mbps Full Duplex'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Installed Software Tab */}
              {modalTab === 'Installed Software' && (
                <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white pt-1">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F8FAFC] text-slate-500 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">Software Name</th>
                        <th className="py-2.5 px-3">Version</th>
                        <th className="py-2.5 px-3">Publisher</th>
                        <th className="py-2.5 px-3">Install Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {((modalDevice || selectedDevice)?.software || []).map((sw, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 font-bold text-slate-900">{sw.name}</td>
                          <td className="py-2.5 px-3 font-mono text-slate-600">{sw.version}</td>
                          <td className="py-2.5 px-3">{sw.publisher}</td>
                          <td className="py-2.5 px-3 text-slate-500">{sw.installDate}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Discovery History Tab */}
              {modalTab === 'Discovery History' && (
                <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white pt-1">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F8FAFC] text-slate-500 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">Timestamp</th>
                        <th className="py-2.5 px-3">Job Name</th>
                        <th className="py-2.5 px-3">Event Detail</th>
                        <th className="py-2.5 px-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {((modalDevice || selectedDevice)?.history || []).map((h, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 whitespace-nowrap text-slate-500">{h.timestamp}</td>
                          <td className="py-2.5 px-3 font-bold text-slate-900">{h.job}</td>
                          <td className="py-2.5 px-3">{h.event}</td>
                          <td className="py-2.5 px-3 text-center">{renderStatusBadge(h.status)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Modal Footer matching Screenshot #3 */}
            <div className="p-4 border-t border-slate-100 flex items-center justify-end bg-slate-50/50">
              <button
                onClick={() => setIsViewDetailsModalOpen(false)}
                className="px-6 py-2 bg-white hover:bg-purple-50 border border-[#6C2BD9] text-[#6C2BD9] rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: CREATE ASSET (FROM DISCOVERED DEVICE) (Prompt Image #4) */}
      {isCreateAssetWizardOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-base font-extrabold text-[#0F172A]">Create Asset from Discovered Device</h2>
              <button
                onClick={() => setIsCreateAssetWizardOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-200 text-slate-400 hover:text-slate-700 cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Stepper Progress Indicator matching Screenshot #4 */}
            <div className="px-6 pt-5 pb-3">
              <div className="flex items-center justify-between relative max-w-md mx-auto">
                {/* Step 1 */}
                <div className="flex flex-col items-center z-10">
                  <div className={clsx(
                    "w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-xs transition-colors",
                    createAssetStep >= 1 ? "bg-[#6C2BD9] text-white" : "bg-slate-100 text-slate-500 border border-slate-300"
                  )}>
                    1
                  </div>
                  <span className={clsx(
                    "text-[11px] font-bold mt-1.5 whitespace-nowrap",
                    createAssetStep === 1 ? "text-[#6C2BD9]" : "text-slate-500"
                  )}>
                    Basic Information
                  </span>
                </div>

                {/* Line 1-2 */}
                <div className={clsx(
                  "flex-1 h-0.5 mx-2 -mt-4 transition-colors",
                  createAssetStep >= 2 ? "bg-[#6C2BD9]" : "bg-slate-200"
                )}></div>

                {/* Step 2 */}
                <div className="flex flex-col items-center z-10">
                  <div className={clsx(
                    "w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-xs transition-colors",
                    createAssetStep >= 2 ? "bg-[#6C2BD9] text-white" : "bg-slate-100 text-slate-500 border border-slate-300"
                  )}>
                    2
                  </div>
                  <span className={clsx(
                    "text-[11px] font-bold mt-1.5 whitespace-nowrap",
                    createAssetStep === 2 ? "text-[#6C2BD9]" : "text-slate-500"
                  )}>
                    Additional Details
                  </span>
                </div>

                {/* Line 2-3 */}
                <div className={clsx(
                  "flex-1 h-0.5 mx-2 -mt-4 transition-colors",
                  createAssetStep >= 3 ? "bg-[#6C2BD9]" : "bg-slate-200"
                )}></div>

                {/* Step 3 */}
                <div className="flex flex-col items-center z-10">
                  <div className={clsx(
                    "w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-xs transition-colors",
                    createAssetStep >= 3 ? "bg-[#6C2BD9] text-white" : "bg-slate-100 text-slate-500 border border-slate-300"
                  )}>
                    3
                  </div>
                  <span className={clsx(
                    "text-[11px] font-bold mt-1.5 whitespace-nowrap",
                    createAssetStep === 3 ? "text-[#6C2BD9]" : "text-slate-500"
                  )}>
                    Review & Create
                  </span>
                </div>
              </div>
            </div>

            {/* Form Body */}
            <div className="p-6 text-xs max-h-[65vh] overflow-y-auto">
              {/* STEP 1: Basic Information (Matching Screenshot #4) */}
              {createAssetStep === 1 && (
                <div className="space-y-3.5">
                  {/* Row 1: Asset Name */}
                  <div className="grid grid-cols-12 items-center gap-3">
                    <label className="col-span-4 font-bold text-slate-700">Asset Name *</label>
                    <div className="col-span-8">
                      <input
                        type="text"
                        value={createAssetForm.name}
                        onChange={(e) => setCreateAssetForm({ ...createAssetForm, name: e.target.value })}
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-semibold text-xs focus:outline-none focus:border-[#6C2BD9]"
                      />
                    </div>
                  </div>

                  {/* Row 2: Asset Category */}
                  <div className="grid grid-cols-12 items-center gap-3">
                    <label className="col-span-4 font-bold text-slate-700">Asset Category *</label>
                    <div className="col-span-8">
                      <select
                        value={createAssetForm.category}
                        onChange={(e) => setCreateAssetForm({ ...createAssetForm, category: e.target.value })}
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-semibold text-xs text-slate-700 focus:outline-none focus:border-[#6C2BD9]"
                      >
                        <option value="IT Equipment">IT Equipment</option>
                        <option value="Office Hardware">Office Hardware</option>
                        <option value="Networking">Networking</option>
                        <option value="Mobile & IoT">Mobile & IoT</option>
                      </select>
                    </div>
                  </div>

                  {/* Row 3: Asset Type */}
                  <div className="grid grid-cols-12 items-center gap-3">
                    <label className="col-span-4 font-bold text-slate-700">Asset Type *</label>
                    <div className="col-span-8">
                      <select
                        value={createAssetForm.type}
                        onChange={(e) => setCreateAssetForm({ ...createAssetForm, type: e.target.value })}
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-semibold text-xs text-slate-700 focus:outline-none focus:border-[#6C2BD9]"
                      >
                        <option value="Computer">Computer</option>
                        <option value="Monitor">Monitor</option>
                        <option value="Printer">Printer</option>
                        <option value="Network Device">Network Device</option>
                        <option value="Server">Server</option>
                        <option value="Tablet / Mobile">Tablet / Mobile</option>
                      </select>
                    </div>
                  </div>

                  {/* Row 4: Manufacturer */}
                  <div className="grid grid-cols-12 items-center gap-3">
                    <label className="col-span-4 font-bold text-slate-700">Manufacturer</label>
                    <div className="col-span-8">
                      <input
                        type="text"
                        value={createAssetForm.manufacturer}
                        onChange={(e) => setCreateAssetForm({ ...createAssetForm, manufacturer: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-xs text-slate-700 focus:outline-none focus:border-[#6C2BD9]"
                      />
                    </div>
                  </div>

                  {/* Row 5: Model */}
                  <div className="grid grid-cols-12 items-center gap-3">
                    <label className="col-span-4 font-bold text-slate-700">Model</label>
                    <div className="col-span-8">
                      <input
                        type="text"
                        value={createAssetForm.model}
                        onChange={(e) => setCreateAssetForm({ ...createAssetForm, model: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-xs text-slate-700 focus:outline-none focus:border-[#6C2BD9]"
                      />
                    </div>
                  </div>

                  {/* Row 6: Serial Number */}
                  <div className="grid grid-cols-12 items-center gap-3">
                    <label className="col-span-4 font-bold text-slate-700">Serial Number</label>
                    <div className="col-span-8">
                      <input
                        type="text"
                        value={createAssetForm.serialNumber}
                        onChange={(e) => setCreateAssetForm({ ...createAssetForm, serialNumber: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs text-slate-700 focus:outline-none focus:border-[#6C2BD9]"
                      />
                    </div>
                  </div>

                  {/* Row 7: Location */}
                  <div className="grid grid-cols-12 items-center gap-3">
                    <label className="col-span-4 font-bold text-slate-700">Location *</label>
                    <div className="col-span-8">
                      <select
                        value={createAssetForm.location}
                        onChange={(e) => setCreateAssetForm({ ...createAssetForm, location: e.target.value })}
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-semibold text-xs text-slate-700 focus:outline-none focus:border-[#6C2BD9]"
                      >
                        <option value="Dubai HQ - IT Department">Dubai HQ - IT Department</option>
                        <option value="Dubai HQ - Copy Room">Dubai HQ - Copy Room</option>
                        <option value="Dubai HQ - Server Room">Dubai HQ - Server Room</option>
                        <option value="Dubai HQ - Floor 2">Dubai HQ - Floor 2</option>
                        <option value="Dubai HQ - Floor 1 Hallway">Dubai HQ - Floor 1 Hallway</option>
                        <option value="Dubai HQ - Executive Suite">Dubai HQ - Executive Suite</option>
                        <option value="Dubai HQ - Reception Lobby">Dubai HQ - Reception Lobby</option>
                        <option value="Dubai HQ - Retail Kiosk">Dubai HQ - Retail Kiosk</option>
                      </select>
                    </div>
                  </div>

                  {/* Row 8: Owner with Search Icon Button matching Screenshot #4 */}
                  <div className="grid grid-cols-12 items-center gap-3">
                    <label className="col-span-4 font-bold text-slate-700">Owner</label>
                    <div className="col-span-8 flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Search user..."
                        value={createAssetForm.owner}
                        onChange={(e) => setCreateAssetForm({ ...createAssetForm, owner: e.target.value })}
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-medium text-xs focus:outline-none focus:border-[#6C2BD9]"
                      />
                      <button
                        type="button"
                        className="w-10 h-10 rounded-xl border border-slate-200 bg-white hover:bg-purple-50 text-[#6C2BD9] flex items-center justify-center shrink-0 cursor-pointer shadow-2xs"
                      >
                        <Search className="w-4 h-4 text-[#6C2BD9]" />
                      </button>
                    </div>
                  </div>

                  {/* Row 9: Remarks Multiline Textarea matching Screenshot #4 */}
                  <div className="grid grid-cols-12 items-start gap-3">
                    <label className="col-span-4 font-bold text-slate-700 pt-2">Remarks</label>
                    <div className="col-span-8">
                      <textarea
                        rows="3"
                        value={createAssetForm.remarks}
                        onChange={(e) => setCreateAssetForm({ ...createAssetForm, remarks: e.target.value })}
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-medium text-xs focus:outline-none focus:border-[#6C2BD9] resize-y"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Additional Details */}
              {createAssetStep === 2 && (
                <div className="space-y-3.5">
                  <div className="grid grid-cols-12 items-center gap-3">
                    <label className="col-span-4 font-bold text-slate-700">Department</label>
                    <div className="col-span-8">
                      <input
                        type="text"
                        value={createAssetForm.department}
                        onChange={(e) => setCreateAssetForm({ ...createAssetForm, department: e.target.value })}
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-medium text-xs focus:outline-none focus:border-[#6C2BD9]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-12 items-center gap-3">
                    <label className="col-span-4 font-bold text-slate-700">Purchase Cost ($)</label>
                    <div className="col-span-8">
                      <input
                        type="text"
                        value={createAssetForm.cost}
                        onChange={(e) => setCreateAssetForm({ ...createAssetForm, cost: e.target.value })}
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-mono text-xs focus:outline-none focus:border-[#6C2BD9]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-12 items-center gap-3">
                    <label className="col-span-4 font-bold text-slate-700">Purchase Order</label>
                    <div className="col-span-8">
                      <input
                        type="text"
                        value={createAssetForm.purchaseOrder}
                        onChange={(e) => setCreateAssetForm({ ...createAssetForm, purchaseOrder: e.target.value })}
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-mono text-xs focus:outline-none focus:border-[#6C2BD9]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: Review & Create */}
              {createAssetStep === 3 && (
                <div className="space-y-4">
                  <div className="p-4 bg-purple-50/50 border border-purple-100 rounded-2xl space-y-2">
                    <h4 className="font-extrabold text-[#6C2BD9] text-xs">Summary of Asset to be Created</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div><span className="text-slate-400">Name:</span> <strong className="text-slate-900">{createAssetForm.name}</strong></div>
                      <div><span className="text-slate-400">Category:</span> <strong className="text-slate-900">{createAssetForm.category}</strong></div>
                      <div><span className="text-slate-400">Type:</span> <strong className="text-slate-900">{createAssetForm.type}</strong></div>
                      <div><span className="text-slate-400">Manufacturer:</span> <strong className="text-slate-900">{createAssetForm.manufacturer}</strong></div>
                      <div><span className="text-slate-400">Model:</span> <strong className="text-slate-900">{createAssetForm.model}</strong></div>
                      <div><span className="text-slate-400">Serial No:</span> <strong className="font-mono text-slate-900">{createAssetForm.serialNumber}</strong></div>
                      <div><span className="text-slate-400">Location:</span> <strong className="text-slate-900">{createAssetForm.location}</strong></div>
                      <div><span className="text-slate-400">Assigned ID:</span> <strong className="font-mono text-[#6C2BD9]">AS-2026-00123</strong></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Buttons matching Screenshot #4 */}
            <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
              <button
                onClick={() => {
                  if (createAssetStep > 1) {
                    setCreateAssetStep(s => s - 1);
                  } else {
                    setIsCreateAssetWizardOpen(false);
                  }
                }}
                className="px-6 py-2 bg-white hover:bg-purple-50 border border-[#6C2BD9] text-[#6C2BD9] rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs"
              >
                {createAssetStep > 1 ? 'Back' : 'Cancel'}
              </button>
              <button
                onClick={() => {
                  if (createAssetStep < 3) {
                    setCreateAssetStep(s => s + 1);
                  } else {
                    handleCreateAssetSubmit();
                  }
                }}
                className="px-6 py-2 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md"
              >
                {createAssetStep === 3 ? 'Create Asset' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 6: DOWNLOAD / EXPORT REPORT MODAL (Prompt Image #6) */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-base font-bold text-slate-900">Export Discovered Devices</h2>
              <button
                onClick={() => setIsExportModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-200 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1.5">Export Type</label>
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="exportType"
                      checked={exportType === 'filtered'}
                      onChange={() => setExportType('filtered')}
                      className="text-[#6C2BD9]"
                    />
                    <span className="font-medium text-slate-800">Current View (Filtered Results)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="exportType"
                      checked={exportType === 'all'}
                      onChange={() => setExportType('all')}
                      className="text-[#6C2BD9]"
                    />
                    <span className="font-medium text-slate-800">All Devices (Ignoring Filters)</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1.5">File Format</label>
                <div className="flex items-center gap-3">
                  {['xlsx', 'csv', 'pdf'].map((fmt) => (
                    <button
                      key={fmt}
                      type="button"
                      onClick={() => setExportFormat(fmt)}
                      className={clsx(
                        "px-4 py-2 rounded-xl font-bold border transition-all cursor-pointer flex items-center gap-1.5 uppercase",
                        exportFormat === fmt ? "bg-purple-50 text-[#6C2BD9] border-[#6C2BD9]" : "bg-white border-slate-200 text-slate-700"
                      )}
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                      {fmt}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1.5">Include Columns</label>
                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  {Object.keys(exportColumns).map((col) => (
                    <label key={col} className="flex items-center gap-2 cursor-pointer capitalize">
                      <input
                        type="checkbox"
                        checked={exportColumns[col]}
                        onChange={(e) => setExportColumns({ ...exportColumns, [col]: e.target.checked })}
                        className="rounded text-[#6C2BD9]"
                      />
                      <span className="font-medium text-slate-700">{col.replace(/([A-Z])/g, ' $1')}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">File Name</label>
                <input
                  type="text"
                  value={exportFileName}
                  onChange={(e) => setExportFileName(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs"
                />
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
              <button
                onClick={() => setIsExportModalOpen(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-100 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  showToast(`Exporting ${filteredDevices.length} devices as .${exportFormat.toUpperCase()}...`);
                  setIsExportModalOpen(false);
                }}
                className="px-6 py-2 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: VIEW DISCOVERED DEVICES (FROM JOB) (Prompt Image #5) */}
      {isJobDevicesModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <h2 className="text-base font-extrabold text-[#0F172A]">
                  Devices from Job: {selectedJobData.jobName}
                </h2>
                <button
                  onClick={() => setIsEditJobModalOpen(true)}
                  className="px-2.5 py-1 bg-purple-50 border border-purple-200 text-[#6C2BD9] rounded-lg text-xs font-bold hover:bg-purple-100 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Edit className="w-3 h-3 text-[#6C2BD9]" />
                  <span>Edit Job</span>
                </button>
              </div>
              <button
                onClick={() => setIsJobDevicesModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-200 text-slate-400 hover:text-slate-700 cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
              {/* Job Summary Banner matching Screenshot #5 */}
              <div className="p-4 bg-[#F8FAFC] border border-slate-200 rounded-2xl grid grid-cols-2 sm:grid-cols-4 gap-y-3 gap-x-4 text-slate-700">
                <div>
                  <span className="text-slate-400 block text-[11px] font-semibold">Job ID</span>
                  <span className="font-mono font-extrabold text-slate-900">{selectedJobData.jobId}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px] font-semibold">Discovery Type</span>
                  <span className="font-bold text-slate-900">{selectedJobData.discoveryType}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px] font-semibold">Started On</span>
                  <span className="font-semibold text-slate-800">{selectedJobData.startedOn}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px] font-semibold">Completed On</span>
                  <span className="font-semibold text-slate-800">{selectedJobData.completedOn}</span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px] font-semibold mb-0.5">Status</span>
                  {renderStatusBadge(selectedJobData.status)}
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px] font-semibold">Total Devices</span>
                  <span className="font-extrabold text-[#6C2BD9]">{selectedJobData.totalDevices}</span>
                </div>
              </div>

              {/* Inner Search & Status Filter Bar matching Screenshot #5 */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                {/* Search Devices Input */}
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 text-[#6C2BD9] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search devices..."
                    value={jobSearchQuery}
                    onChange={(e) => setJobSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#6C2BD9]"
                  />
                </div>

                {/* Status Dropdown Selector */}
                <div className="w-full sm:w-48">
                  <select
                    value={jobStatusFilter}
                    onChange={(e) => setJobStatusFilter(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-[#6C2BD9]"
                  >
                    <option value="All Status">All Status</option>
                    <option value="Matched">Matched</option>
                    <option value="New">New</option>
                    <option value="Review">Requires Review</option>
                  </select>
                </div>
              </div>

              {/* Devices Table matching Screenshot #5 */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
                <div className="overflow-auto max-h-[300px]">
                  <table className="w-full text-left text-xs">
                    <thead className="sticky top-0 z-10 bg-[#F8FAFC] shadow-2xs text-slate-500 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3 w-10 text-center">#</th>
                        <th className="py-2.5 px-3">Hostname</th>
                        <th className="py-2.5 px-3">IP Address</th>
                        <th className="py-2.5 px-3">Device Type</th>
                        <th className="py-2.5 px-3 text-center">Asset Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {[
                        { num: 1, host: 'DESKTOP-001', ip: '192.168.1.10', type: 'Computer', status: 'Matched' },
                        { num: 2, host: 'MONITOR-245', ip: '192.168.1.11', type: 'Monitor', status: 'Matched' },
                        { num: 3, host: 'PRN-HQ-01', ip: '192.168.1.20', type: 'Printer', status: 'New' },
                        { num: 4, host: 'SW-CORE-01', ip: '192.168.1.30', type: 'Network Device', status: 'Matched' },
                        { num: 5, host: 'LAPTOP-078', ip: '192.168.1.45', type: 'Computer', status: 'Review' },
                        { num: 6, host: 'AP-01', ip: '192.168.1.50', type: 'Network Device', status: 'Matched' }
                      ]
                      .filter((d) => {
                        if (jobSearchQuery.trim()) {
                          const q = jobSearchQuery.toLowerCase();
                          if (!d.host.toLowerCase().includes(q) && !d.ip.includes(q)) return false;
                        }
                        if (jobStatusFilter !== 'All Status') {
                          if (jobStatusFilter === 'Review' && (d.status === 'Review' || d.status === 'Requires Review')) return true;
                          if (d.status.toLowerCase() !== jobStatusFilter.toLowerCase()) return false;
                        }
                        return true;
                      })
                      .map((d) => (
                        <tr
                          key={d.num}
                          className="hover:bg-purple-50/40 cursor-pointer transition-colors"
                          onClick={() => {
                            const dev = devices.find(x => x.hostname === d.host);
                            if (dev) {
                              setModalDevice(dev);
                              setSelectedDevice(dev);
                              setIsViewDetailsModalOpen(true);
                            }
                          }}
                        >
                          <td className="py-2.5 px-3 text-center font-bold text-slate-400">{d.num}</td>
                          <td className="py-2.5 px-3 font-extrabold text-slate-900">{d.host}</td>
                          <td className="py-2.5 px-3 font-mono font-bold text-[#6C2BD9]">{d.ip}</td>
                          <td className="py-2.5 px-3 text-slate-700">{d.type}</td>
                          <td className="py-2.5 px-3 text-center">{renderStatusBadge(d.status)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Table Summary & Scroll Footer */}
              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                <span className="font-medium text-slate-600">Showing all records</span>
                <span className="text-slate-400">Scroll down to view all records</span>
              </div>
            </div>

            {/* Modal Footer matching Screenshot #5 */}
            <div className="p-4 border-t border-slate-100 flex items-center justify-end bg-slate-50/50">
              <button
                onClick={() => setIsJobDevicesModalOpen(false)}
                className="px-6 py-2 bg-white hover:bg-purple-50 border border-[#6C2BD9] text-[#6C2BD9] rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 7: RE-RUN DISCOVERY JOB MODAL (Prompt Image #7) */}
      {isRerunJobModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header matching Screenshot #7 */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-base font-extrabold text-[#0B192C]">Re-run Discovery Job</h2>
              <button
                onClick={() => setIsRerunJobModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-200 text-slate-400 hover:text-slate-700 cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body matching Screenshot #7 */}
            <div className="p-6 space-y-4 text-xs">
              {/* Top Graphic Banner */}
              <div className="flex items-start gap-4">
                <div className="w-13 h-13 rounded-full bg-purple-50 flex items-center justify-center shrink-0 border border-purple-200">
                  <RefreshCw className="w-6 h-6 text-[#6C2BD9]" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Are you sure you want to re-run this job?</h3>
                  <p className="text-sm font-extrabold text-[#6C2BD9] mt-0.5">{selectedJobData.jobName}</p>
                  <p className="text-[11px] font-mono text-slate-500 mt-0.5">{selectedJobData.jobId}</p>
                </div>
              </div>

              {/* Job Details Card matching Screenshot #7 */}
              <div className="bg-[#F8FAFC] border border-slate-200 rounded-xl p-4 text-xs space-y-2 text-slate-700">
                <div className="grid grid-cols-12 gap-2 items-center">
                  <span className="col-span-5 text-slate-500 font-medium">Discovery Type</span>
                  <span className="col-span-7 font-bold text-slate-900">{selectedJobData.discoveryType}</span>
                </div>
                <div className="grid grid-cols-12 gap-2 items-center">
                  <span className="col-span-5 text-slate-500 font-medium">IP Range</span>
                  <span className="col-span-7 font-mono font-bold text-[#6C2BD9]">{selectedJobData.ipRange}</span>
                </div>
                <div className="grid grid-cols-12 gap-2 items-center">
                  <span className="col-span-5 text-slate-500 font-medium">Profile</span>
                  <span className="col-span-7 font-bold text-slate-900">Default</span>
                </div>
                <div className="grid grid-cols-12 gap-2 items-center">
                  <span className="col-span-5 text-slate-500 font-medium">Schedule</span>
                  <span className="col-span-7 font-bold text-slate-900">Manual</span>
                </div>
              </div>

              {/* Checkbox matching Screenshot #7 */}
              <label className="flex items-center gap-2.5 cursor-pointer select-none pt-0.5">
                <input
                  type="checkbox"
                  checked={useSameConfig}
                  onChange={(e) => setUseSameConfig(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-[#6C2BD9] focus:ring-[#6C2BD9] cursor-pointer"
                />
                <span className="font-semibold text-slate-800 text-xs">Use the same configuration and credentials</span>
              </label>

              {/* Info Alert Box matching Screenshot #7 */}
              <div className="p-3 bg-purple-50 border border-purple-200 text-[#6C2BD9] text-xs font-medium flex items-center gap-2.5 rounded-xl">
                <div className="w-5 h-5 rounded-full bg-[#6C2BD9] text-white flex items-center justify-center text-xs font-black shrink-0">i</div>
                <span className="leading-snug">A new execution will be created. Previous results will be retained.</span>
              </div>
            </div>

            {/* Modal Footer matching Screenshot #7 */}
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
              <button
                onClick={() => setIsRerunJobModalOpen(false)}
                className="px-6 py-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  showToast(`Discovery scan for '${selectedJobData.jobName}' initiated as a background job!`);
                  setIsRerunJobModalOpen(false);
                }}
                className="px-6 py-2 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shadow-md"
              >
                <Play className="w-3.5 h-3.5 fill-white text-white" />
                <span>Run Now</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 8: EDIT DISCOVERY JOB MODAL (Prompt Image #8) */}
      {isEditJobModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header matching Screenshot #8 */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-base font-extrabold text-[#0B192C]">Edit Discovery Job</h2>
              <button
                onClick={() => setIsEditJobModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-200 text-slate-400 hover:text-slate-700 cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body matching Screenshot #8 */}
            <div className="p-6 space-y-4 text-xs">
              {/* Row 1: Job Name */}
              <div className="grid grid-cols-12 items-center gap-3">
                <label className="col-span-4 font-extrabold text-slate-700 text-xs">
                  Job Name <span className="text-red-500 font-bold">*</span>
                </label>
                <div className="col-span-8">
                  <input
                    type="text"
                    value={editJobForm.jobName}
                    onChange={(e) => setEditJobForm({ ...editJobForm, jobName: e.target.value })}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-medium text-xs text-slate-900 focus:outline-none focus:border-[#6C2BD9] shadow-2xs"
                  />
                </div>
              </div>

              {/* Row 2: Discovery Type */}
              <div className="grid grid-cols-12 items-center gap-3">
                <label className="col-span-4 font-extrabold text-slate-700 text-xs">
                  Discovery Type <span className="text-red-500 font-bold">*</span>
                </label>
                <div className="col-span-8">
                  <select
                    value={editJobForm.discoveryType}
                    onChange={(e) => setEditJobForm({ ...editJobForm, discoveryType: e.target.value })}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-semibold text-xs text-slate-800 focus:outline-none focus:border-[#6C2BD9] shadow-2xs cursor-pointer"
                  >
                    <option value="IP Range Scan">IP Range Scan</option>
                    <option value="SNMP Scan">SNMP Scan</option>
                    <option value="WMI Scan">WMI Scan</option>
                    <option value="Agent Based">Agent Based</option>
                  </select>
                </div>
              </div>

              {/* Row 3: IP Range / Target */}
              <div className="grid grid-cols-12 items-center gap-3">
                <label className="col-span-4 font-extrabold text-slate-700 text-xs">
                  IP Range / Target <span className="text-red-500 font-bold">*</span>
                </label>
                <div className="col-span-8">
                  <input
                    type="text"
                    value={editJobForm.ipRange}
                    onChange={(e) => setEditJobForm({ ...editJobForm, ipRange: e.target.value })}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-mono font-bold text-xs text-slate-900 focus:outline-none focus:border-[#6C2BD9] shadow-2xs"
                  />
                </div>
              </div>

              {/* Row 4: Discovery Profile */}
              <div className="grid grid-cols-12 items-center gap-3">
                <label className="col-span-4 font-extrabold text-slate-700 text-xs">
                  Discovery Profile <span className="text-red-500 font-bold">*</span>
                </label>
                <div className="col-span-8">
                  <select
                    value={editJobForm.profile}
                    onChange={(e) => setEditJobForm({ ...editJobForm, profile: e.target.value })}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-semibold text-xs text-slate-800 focus:outline-none focus:border-[#6C2BD9] shadow-2xs cursor-pointer"
                  >
                    <option value="Default">Default</option>
                    <option value="Branch Profile">Branch Profile</option>
                    <option value="DataCenter">DataCenter</option>
                  </select>
                </div>
              </div>

              {/* Row 5: Schedule + Calendar Icon Button */}
              <div className="grid grid-cols-12 items-center gap-3">
                <label className="col-span-4 font-extrabold text-slate-700 text-xs">
                  Schedule <span className="text-red-500 font-bold">*</span>
                </label>
                <div className="col-span-8 flex items-center gap-2">
                  <select
                    value={editJobForm.schedule}
                    onChange={(e) => setEditJobForm({ ...editJobForm, schedule: e.target.value })}
                    className="flex-1 p-2.5 bg-white border border-slate-200 rounded-xl font-semibold text-xs text-slate-800 focus:outline-none focus:border-[#6C2BD9] shadow-2xs cursor-pointer"
                  >
                    <option value="Manual">Manual</option>
                    <option value="Daily (2 AM)">Daily (2 AM)</option>
                    <option value="Weekly (Sun)">Weekly (Sun)</option>
                    <option value="Monthly">Monthly</option>
                  </select>

                  <button
                    type="button"
                    title="Pick Schedule Date & Time"
                    onClick={() => showToast('Calendar schedule selector opened')}
                    className="w-10 h-10 rounded-xl border border-purple-200 bg-purple-50 text-[#6C2BD9] flex items-center justify-center shrink-0 hover:bg-purple-100 transition-colors shadow-2xs cursor-pointer"
                  >
                    <Calendar className="w-4 h-4 text-[#6C2BD9]" />
                  </button>
                </div>
              </div>

              {/* Advanced Options Collapsible Link matching Screenshot #8 */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowAdvancedJobOptions(!showAdvancedJobOptions)}
                  className="font-bold text-[#6C2BD9] hover:underline flex items-center gap-1.5 text-xs transition-colors cursor-pointer"
                >
                  <ChevronDown className={clsx("w-4 h-4 transition-transform duration-200", showAdvancedJobOptions && "rotate-180")} />
                  <span>Advanced Options</span>
                </button>

                {showAdvancedJobOptions && (
                  <div className="mt-3 p-4 bg-[#F8FAFC] border border-slate-200 rounded-2xl space-y-3 animate-in fade-in duration-150">
                    <div className="grid grid-cols-12 items-center gap-3">
                      <label className="col-span-5 text-slate-500 font-semibold text-[11px]">SNMP Credentials</label>
                      <input
                        type="text"
                        defaultValue="v2c (Public Community)"
                        className="col-span-7 p-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
                      />
                    </div>
                    <div className="grid grid-cols-12 items-center gap-3">
                      <label className="col-span-5 text-slate-500 font-semibold text-[11px]">Timeout (Seconds)</label>
                      <input
                        type="number"
                        defaultValue="5"
                        className="col-span-7 p-2 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-900"
                      />
                    </div>
                    <div className="grid grid-cols-12 items-center gap-3">
                      <label className="col-span-5 text-slate-500 font-semibold text-[11px]">Target Ports</label>
                      <input
                        type="text"
                        defaultValue="161, 162, 445, 135"
                        className="col-span-7 p-2 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-900"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer matching Screenshot #8 */}
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
              <button
                onClick={() => setIsEditJobModalOpen(false)}
                className="px-6 py-2 bg-white hover:bg-purple-50 border border-[#6C2BD9] text-[#6C2BD9] rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  showToast(`Discovery job '${editJobForm.jobName}' updated successfully!`);
                  setIsEditJobModalOpen(false);
                }}
                className="px-6 py-2 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 9: RECONCILE / MATCH WITH EXISTING ASSET MODAL */}
      {isMatchModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h2 className="text-base font-bold text-slate-900">Match Device with Existing Asset</h2>
              </div>
              <button onClick={() => setIsMatchModalOpen(false)} className="p-1.5 rounded-xl hover:bg-slate-200 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="font-bold text-emerald-900 block">Suggested Asset360 Match (98% Confidence)</span>
                  <span className="text-emerald-700 text-[11px]">Serial Number SN-DL-784920 matches Dell OptiPlex 7020</span>
                </div>
                <span className="px-2.5 py-1 bg-emerald-600 text-white rounded-full font-bold text-[11px]">AS-2026-00121</span>
              </div>

              <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50 space-y-2">
                <span className="font-bold text-slate-800 block">Discovered Telemetry</span>
                <p>Hostname: <strong className="text-slate-900">{selectedDevice?.hostname}</strong></p>
                <p>MAC: <strong className="font-mono text-slate-900">{selectedDevice?.macAddress}</strong></p>
                <p>Serial: <strong className="font-mono text-slate-900">{selectedDevice?.serialNumber}</strong></p>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
              <button
                onClick={() => setIsMatchModalOpen(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmMatch}
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold cursor-pointer shadow-sm"
              >
                Confirm Match
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 10: EDIT DEVICE MODAL */}
      {isEditDeviceModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h2 className="text-base font-bold text-slate-900">Edit Discovered Device</h2>
              <button onClick={() => setIsEditDeviceModalOpen(false)} className="p-1.5 rounded-xl hover:bg-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Custom Notes / Enrichment</label>
                <input
                  type="text"
                  placeholder="Add administrative notes..."
                  value={editDeviceForm.notes}
                  onChange={(e) => setEditDeviceForm({ ...editDeviceForm, notes: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              <p className="text-[11px] text-slate-500 italic">
                * Discovery-generated technical attributes (IP, MAC, Serial) are source-locked and preserved in audit history.
              </p>
            </div>
            <div className="p-4 border-t border-slate-100 flex justify-end gap-2 bg-slate-50">
              <button onClick={() => setIsEditDeviceModalOpen(false)} className="px-4 py-2 border border-slate-300 rounded-xl font-bold">Cancel</button>
              <button
                onClick={() => {
                  showToast(`Device ${selectedDevice?.hostname} updated`);
                  setIsEditDeviceModalOpen(false);
                }}
                className="px-6 py-2 bg-[#6C2BD9] text-white rounded-xl font-bold"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 11: MARK AS RESOLVED MODAL */}
      {isResolveModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h2 className="text-base font-bold text-slate-900">Mark Exception as Resolved</h2>
              <button onClick={() => setIsResolveModalOpen(false)} className="p-1.5 rounded-xl hover:bg-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Resolution Type</label>
                <select
                  value={resolveType}
                  onChange={(e) => setResolveType(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="Verified Duplicate">Verified Duplicate</option>
                  <option value="Approved Rogue Device">Approved Rogue Device</option>
                  <option value="Decommissioned Hardware">Decommissioned Hardware</option>
                </select>
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Resolution Remarks</label>
                <textarea
                  rows="3"
                  placeholder="Enter remarks..."
                  value={resolveRemarks}
                  onChange={(e) => setResolveRemarks(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                ></textarea>
              </div>
            </div>
            <div className="p-4 border-t border-slate-100 flex justify-end gap-2 bg-slate-50">
              <button onClick={() => setIsResolveModalOpen(false)} className="px-4 py-2 border border-slate-300 rounded-xl font-bold">Cancel</button>
              <button
                onClick={() => {
                  setDevices(prev => prev.map(d => d.id === selectedDevice?.id ? { ...d, status: 'Matched' } : d));
                  showToast(`Device ${selectedDevice?.hostname} marked as Resolved`);
                  setIsResolveModalOpen(false);
                }}
                className="px-6 py-2 bg-emerald-600 text-white rounded-xl font-bold"
              >
                Resolve
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 12: DELETE / SUPPRESS DEVICE MODAL */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-rose-50">
              <h2 className="text-base font-bold text-rose-900">Suppress / Archive Discovered Device</h2>
              <button onClick={() => setIsDeleteModalOpen(false)} className="p-1.5 rounded-xl hover:bg-rose-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-3 text-xs text-slate-700">
              <p>Are you sure you want to suppress discovery record for <strong>{selectedDevice?.hostname}</strong>?</p>
              <p className="text-slate-500 text-[11px]">This action archives the observation telemetry and prevents false alerts without destroying audit logs.</p>
            </div>
            <div className="p-4 border-t border-slate-100 flex justify-end gap-2 bg-slate-50">
              <button onClick={() => setIsDeleteModalOpen(false)} className="px-4 py-2 border border-slate-300 rounded-xl font-bold">Cancel</button>
              <button
                onClick={() => {
                  setDevices(prev => prev.filter(d => d.id !== selectedDevice?.id));
                  showToast(`Device ${selectedDevice?.hostname} suppressed`);
                  setIsDeleteModalOpen(false);
                }}
                className="px-6 py-2 bg-rose-600 text-white rounded-xl font-bold"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DiscoveredDevicesWorkbench;
