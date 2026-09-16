import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import {
  Search,
  Filter,
  Sliders,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  PlusCircle,
  ExternalLink,
  MoreVertical,
  Download,
  Trash2,
  RefreshCw,
  Eye,
  Edit,
  History,
  Check,
  X,
  Laptop,
  Server,
  Monitor,
  Printer,
  Radio,
  Smartphone,
  Tv,
  Barcode,
  Layers,
  Sparkles,
  ChevronDown,
  ArrowUpDown,
  FileSpreadsheet
} from 'lucide-react';

// Seed population for fallback
function generateInitialDevices() {
  const types = ['Computer', 'Monitor', 'Printer', 'Network Device', 'Server', 'Mobile Device', 'Display', 'POS Device'];
  const mfrs = {
    Computer: [{ mfr: 'Dell', model: 'OptiPlex 7020', os: 'Windows 11 Pro 64-bit' }, { mfr: 'Lenovo', model: 'ThinkPad T14', os: 'Windows 11 Pro' }, { mfr: 'HP', model: 'EliteBook 840', os: 'Windows 10 Pro' }, { mfr: 'Apple', model: 'MacBook Pro 14', os: 'macOS Sonoma 14.4' }],
    Monitor: [{ mfr: 'Dell', model: 'UltraSharp U2723QE', os: 'Firmware v1.2' }, { mfr: 'LG', model: 'UltraFine 27', os: 'Firmware v2.0' }, { mfr: 'Samsung', model: 'ViewFinity S8', os: 'Firmware v1.0' }],
    Printer: [{ mfr: 'HP', model: 'LaserJet Pro M404n', os: 'HP FutureSmart 4' }, { mfr: 'Canon', model: 'imageRUNNER ADVANCE', os: 'Canon MeAP' }, { mfr: 'Epson', model: 'WorkForce Pro', os: 'Epson Net' }],
    'Network Device': [{ mfr: 'Cisco', model: 'Catalyst 9300-48P', os: 'Cisco IOS-XE 17.9' }, { mfr: 'Aruba', model: 'AP-515 Wi-Fi 6', os: 'ArubaOS 8.10' }, { mfr: 'Fortinet', model: 'FortiGate 60F', os: 'FortiOS 7.2' }],
    Server: [{ mfr: 'HPE', model: 'ProLiant DL380 Gen10', os: 'Red Hat Enterprise Linux 9' }, { mfr: 'Dell', model: 'PowerEdge R750', os: 'VMware ESXi 8.0' }, { mfr: 'Lenovo', model: 'ThinkSystem SR650', os: 'Windows Server 2022' }],
    'Mobile Device': [{ mfr: 'Apple', model: 'iPad Air 5th Gen', os: 'iPadOS 17.4' }, { mfr: 'Samsung', model: 'Galaxy Tab Active4', os: 'Android 13' }],
    Display: [{ mfr: 'Samsung', model: 'Flip Pro 65', os: 'Tizen OS 6.5' }, { mfr: 'LG', model: 'Commercial TV 55', os: 'webOS Commercial' }],
    'POS Device': [{ mfr: 'Zebra', model: 'TC52x Mobile Computer', os: 'Android 11 BSP' }, { mfr: 'Honeywell', model: 'Dolphin CT60', os: 'Android 11' }]
  };

  const locations = [
    'HQ Floor 1 - IT Lab',
    'HQ Floor 2 - Finance',
    'HQ Floor 3 - Executive Suite',
    'HQ Server Room 101',
    'Branch 1 - Dubai Mall',
    'London Office - Desk Cluster',
    'Warehouse - Receiving Bay'
  ];

  const list = [];
  // 245 devices total: 198 Matched, 32 New, 15 Review
  for (let i = 0; i < 245; i++) {
    let status = 'Matched';
    if (i < 198) status = 'Matched';
    else if (i < 198 + 32) status = 'New';
    else status = 'Requires Review';

    const type = types[i % types.length];
    const mfrObj = mfrs[type][i % mfrs[type].length];
    const hex = i.toString(16).padStart(2, '0').toUpperCase();
    const mac = `00:1A:2B:3C:${hex.slice(0, 1)}A:${hex}`;
    const sn = `SN-${mfrObj.mfr.slice(0, 3).toUpperCase()}-${Math.floor(10000 + i * 13)}`;
    const hostname = `${type.replace(/\s+/g, '').toUpperCase()}-${String(i + 1).padStart(3, '0')}`;
    const ip = `192.168.${Math.floor(i / 250) + 1}.${(i % 240) + 10}`;

    list.push({
      id: `DISC-${String(i + 1).padStart(4, '0')}`,
      ipAddress: ip,
      hostname,
      macAddress: mac,
      deviceType: type,
      manufacturer: mfrObj.mfr,
      model: mfrObj.model,
      serialNumber: sn,
      operatingSystem: mfrObj.os,
      assetStatus: status,
      linkedAssetId: status === 'Matched' ? `AST-2026-${String(100 + i).padStart(5, '0')}` : null,
      lastSeen: `${(i % 24) + 1}h ago`,
      firstSeen: `${(i % 30) + 1} days ago`,
      location: locations[i % locations.length],
      discoveryJob: i % 4 === 0 ? 'Branch Office Scan' : 'HQ Network Scan',
      discoverySource: i % 3 === 0 ? 'SNMP' : i % 2 === 0 ? 'IP_SCANNER' : 'WMI/WinRM',
      hardware: {
        cpu: type === 'Server' ? '2x Intel Xeon Silver (32 Cores)' : 'Intel Core i7 (8 Cores)',
        ram: type === 'Server' ? '64 GB' : '16 GB',
        storage: type === 'Server' ? '2 TB NVMe SSD' : '512 GB SSD'
      },
      software: [
        { name: `${mfrObj.mfr} Client Service`, version: '3.2.0', publisher: mfrObj.mfr },
        { name: 'Asset360 Discovery Probe', version: '2.4.1', publisher: 'Infotatwaa Corp' }
      ],
      history: [
        { date: '10/09/2026, 10:24 AM', job: 'HQ Network Scan', status, notes: 'Automated scan observation' }
      ]
    });
  }
  return list;
}

export function DiscoveredDevices({ activeJobFilter, onClearJobFilter }) {
  const navigate = useNavigate();
  const [devices, setDevices] = useState(generateInitialDevices());
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showLatestOnly, setShowLatestOnly] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  
  // Drawer & Modals
  const [isMoreFiltersOpen, setIsMoreFiltersOpen] = useState(false);
  const [selectedDeviceDetails, setSelectedDeviceDetails] = useState(null);
  const [matchModalDevice, setMatchModalDevice] = useState(null);
  const [createAssetModalDevice, setCreateAssetModalDevice] = useState(null);
  const [editModalDevice, setEditModalDevice] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Advanced Filters
  const [advFilters, setAdvFilters] = useState({
    manufacturer: 'All',
    vlan: 'All',
    discoverySource: 'All',
    subnet: ''
  });

  // Load from API with fallback
  useEffect(() => {
    async function loadDevices() {
      try {
        const res = await api.get('/discovery/devices');
        if (res && res.devices && res.devices.length > 0) {
          setDevices(res.devices);
        }
      } catch (err) {
        console.warn('Using seeded discovered devices:', err);
      }
    }
    loadDevices();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Filtered devices
  const filteredDevices = useMemo(() => {
    return devices.filter((dev) => {
      // Filter by active Job if routed from DiscoveryJobs
      if (activeJobFilter && dev.discoveryJob.toLowerCase() !== activeJobFilter.toLowerCase()) {
        return false;
      }
      // Status Filter
      if (statusFilter !== 'All') {
        if (statusFilter === 'Review' && (dev.assetStatus === 'Requires Review' || dev.assetStatus === 'Review')) {
          // match
        } else if (dev.assetStatus.toLowerCase() !== statusFilter.toLowerCase()) {
          return false;
        }
      }
      // Type Filter
      if (typeFilter !== 'All' && dev.deviceType.toLowerCase() !== typeFilter.toLowerCase()) {
        return false;
      }
      // Advanced Filters
      if (advFilters.manufacturer !== 'All' && dev.manufacturer !== advFilters.manufacturer) {
        return false;
      }
      if (advFilters.discoverySource !== 'All' && dev.discoverySource !== advFilters.discoverySource) {
        return false;
      }
      if (advFilters.subnet.trim() && !dev.ipAddress.startsWith(advFilters.subnet.trim())) {
        return false;
      }
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchIp = dev.ipAddress.toLowerCase().includes(q);
        const matchHost = dev.hostname.toLowerCase().includes(q);
        const matchMac = dev.macAddress.toLowerCase().includes(q);
        const matchSn = dev.serialNumber.toLowerCase().includes(q);
        const matchMfr = `${dev.manufacturer} ${dev.model}`.toLowerCase().includes(q);
        if (!matchIp && !matchHost && !matchMac && !matchSn && !matchMfr) return false;
      }
      return true;
    });
  }, [devices, activeJobFilter, statusFilter, typeFilter, advFilters, searchQuery]);

  // KPIs
  const kpis = useMemo(() => {
    const total = devices.length;
    const matched = devices.filter((d) => d.assetStatus === 'Matched').length;
    const newCount = devices.filter((d) => d.assetStatus === 'New').length;
    const review = devices.filter((d) => d.assetStatus === 'Requires Review' || d.assetStatus === 'Review').length;
    const stale = devices.filter((d) => d.assetStatus === 'Stale').length;
    const conflict = devices.filter((d) => d.assetStatus === 'Conflict').length;
    return {
      total,
      matched,
      matchedPct: Math.round((matched / total) * 100) || 81,
      newCount,
      newPct: Math.round((newCount / total) * 100) || 13,
      review,
      reviewPct: Math.round((review / total) * 100) || 6,
      stale,
      conflict
    };
  }, [devices]);

  // Checkbox handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filteredDevices.map((d) => d.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Device Action Handlers
  const handleConfirmMatch = async (device) => {
    const targetAssetId = device.linkedAssetId || `AST-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    try {
      await api.post(`/discovery/devices/${device.id}/confirm-match`, { assetId: targetAssetId });
    } catch (e) {
      console.warn('Local confirm match fallback');
    }
    setDevices((prev) =>
      prev.map((d) =>
        d.id === device.id
          ? { ...d, assetStatus: 'Matched', linkedAssetId: targetAssetId }
          : d
      )
    );
    showToast(`Device ${device.hostname} matched with asset ${targetAssetId}`);
    setMatchModalDevice(null);
  };

  const handleCreateAssetSubmit = async (device, formData) => {
    const newAssetTag = `AST-2026-${Math.floor(20000 + Math.random() * 80000)}`;
    try {
      await api.post(`/discovery/devices/${device.id}/create-asset`, formData);
    } catch (e) {
      console.warn('Local create asset fallback');
    }
    setDevices((prev) =>
      prev.map((d) =>
        d.id === device.id
          ? { ...d, assetStatus: 'Matched', linkedAssetId: newAssetTag }
          : d
      )
    );
    showToast(`New Asset created: ${newAssetTag} linked to ${device.hostname}`);
    setCreateAssetModalDevice(null);
  };

  const handleResolveException = async (deviceId) => {
    try {
      await api.post(`/discovery/devices/${deviceId}/resolve`, { resolutionType: 'VERIFIED' });
    } catch (e) {
      console.warn('Local resolve fallback');
    }
    setDevices((prev) =>
      prev.map((d) =>
        d.id === deviceId ? { ...d, assetStatus: 'Matched' } : d
      )
    );
    showToast(`Exception on device ${deviceId} resolved.`);
  };

  const handleDeleteDevice = async (deviceId) => {
    if (!window.confirm(`Delete and suppress discovered device ${deviceId}?`)) return;
    try {
      await api.delete(`/discovery/devices/${deviceId}`);
    } catch (e) {
      console.warn('Local delete fallback');
    }
    setDevices((prev) => prev.filter((d) => d.id !== deviceId));
    showToast(`Device ${deviceId} removed from discovery inventory.`);
  };

  const handleExportResults = () => {
    showToast('Exporting discovered devices dataset to Excel (.xlsx)...');
    setTimeout(() => {
      const csvContent =
        "data:text/csv;charset=utf-8," +
        "ID,IP Address,Hostname,MAC,Type,Manufacturer,Model,Serial,Status,Linked Asset,Last Seen\n" +
        filteredDevices
          .map(
            (d) =>
              `"${d.id}","${d.ipAddress}","${d.hostname}","${d.macAddress}","${d.deviceType}","${d.manufacturer}","${d.model}","${d.serialNumber}","${d.assetStatus}","${d.linkedAssetId || ''}","${d.lastSeen}"`
          )
          .join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `Discovered_Devices_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }, 600);
  };

  // Device type icon helper
  const getDeviceIcon = (type) => {
    switch (type) {
      case 'Computer':
        return <Laptop className="w-3.5 h-3.5 text-blue-600" />;
      case 'Server':
        return <Server className="w-3.5 h-3.5 text-purple-600" />;
      case 'Monitor':
        return <Monitor className="w-3.5 h-3.5 text-cyan-600" />;
      case 'Printer':
        return <Printer className="w-3.5 h-3.5 text-amber-600" />;
      case 'Network Device':
        return <Radio className="w-3.5 h-3.5 text-indigo-600" />;
      case 'Mobile Device':
        return <Smartphone className="w-3.5 h-3.5 text-emerald-600" />;
      case 'Display':
        return <Tv className="w-3.5 h-3.5 text-blue-500" />;
      case 'POS Device':
        return <Barcode className="w-3.5 h-3.5 text-rose-600" />;
      default:
        return <Laptop className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Matched':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Matched
          </span>
        );
      case 'New':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <PlusCircle className="w-3 h-3 text-blue-600" />
            New
          </span>
        );
      case 'Requires Review':
      case 'Review':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <AlertCircle className="w-3 h-3 text-amber-600" />
            Review
          </span>
        );
      case 'Conflict':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertTriangle className="w-3 h-3 text-rose-600" />
            Conflict
          </span>
        );
      case 'Stale':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
            Stale
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 bg-slate-900 text-white text-sm rounded-xl shadow-2xl border border-slate-800 animate-in fade-in duration-200">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white ml-2">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header & Quick Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Discovered Devices</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational reconciliation workspace for discovered network endpoints and Asset360 hardware matching.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportResults}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-sm transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Results</span>
          </button>
        </div>
      </div>

      {/* Active Job Filter Banner (if navigating from a Job) */}
      {activeJobFilter && (
        <div className="flex items-center justify-between px-4 py-2.5 bg-blue-50/80 border border-blue-200 rounded-xl text-xs text-blue-900 animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-600" />
            <span>
              Showing discovered devices captured during job: <strong>{activeJobFilter}</strong>
            </span>
          </div>
          <button
            onClick={onClearJobFilter}
            className="flex items-center gap-1 font-semibold text-blue-700 hover:text-blue-900 underline ml-3"
          >
            <X className="w-3.5 h-3.5" />
            <span>Show all jobs</span>
          </button>
        </div>
      )}

      {/* Summary KPIs Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div
          onClick={() => setStatusFilter('All')}
          className={`cursor-pointer rounded-xl p-4 border transition-all bg-white hover:shadow-md ${
            statusFilter === 'All' ? 'border-blue-600 ring-2 ring-blue-100' : 'border-slate-200'
          }`}
        >
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Discovered</div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{kpis.total}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">active in repository</div>
        </div>

        <div
          onClick={() => setStatusFilter('Matched')}
          className={`cursor-pointer rounded-xl p-4 border transition-all bg-white hover:shadow-md ${
            statusFilter === 'Matched' ? 'border-emerald-600 ring-2 ring-emerald-100' : 'border-slate-200'
          }`}
        >
          <div className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Matched ({kpis.matchedPct}%)</div>
          <div className="text-2xl font-bold text-emerald-700 mt-2">{kpis.matched}</div>
          <div className="text-[11px] text-emerald-600 mt-0.5">linked to Asset 360°</div>
        </div>

        <div
          onClick={() => setStatusFilter('New')}
          className={`cursor-pointer rounded-xl p-4 border transition-all bg-white hover:shadow-md ${
            statusFilter === 'New' ? 'border-blue-600 ring-2 ring-blue-100' : 'border-slate-200'
          }`}
        >
          <div className="text-xs font-semibold text-blue-700 uppercase tracking-wider">New Devices ({kpis.newPct}%)</div>
          <div className="text-2xl font-bold text-blue-700 mt-2">{kpis.newCount}</div>
          <div className="text-[11px] text-blue-600 mt-0.5">awaiting asset creation</div>
        </div>

        <div
          onClick={() => setStatusFilter('Review')}
          className={`cursor-pointer rounded-xl p-4 border transition-all bg-white hover:shadow-md ${
            statusFilter === 'Review' ? 'border-amber-600 ring-2 ring-amber-100' : 'border-slate-200'
          }`}
        >
          <div className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Requires Review ({kpis.reviewPct}%)</div>
          <div className="text-2xl font-bold text-amber-700 mt-2">{kpis.review}</div>
          <div className="text-[11px] text-amber-600 mt-0.5">potential match collision</div>
        </div>

        <div
          onClick={() => setStatusFilter('Stale')}
          className={`cursor-pointer rounded-xl p-4 border transition-all bg-white hover:shadow-md ${
            statusFilter === 'Stale' ? 'border-slate-500 ring-2 ring-slate-100' : 'border-slate-200'
          }`}
        >
          <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Stale / Inactive</div>
          <div className="text-2xl font-bold text-slate-700 mt-2">{kpis.stale}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">&gt; 30 days offline</div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
          {/* Search */}
          <div className="relative lg:col-span-4">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by hostname, IP, MAC, serial, manufacturer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
            />
          </div>

          {/* Device Type */}
          <div className="lg:col-span-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-2.5 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50 text-slate-700"
            >
              <option value="All">All Device Types</option>
              <option value="Computer">Computer</option>
              <option value="Server">Server</option>
              <option value="Monitor">Monitor</option>
              <option value="Printer">Printer</option>
              <option value="Network Device">Network Device</option>
              <option value="Mobile Device">Mobile Device</option>
              <option value="Display">Display</option>
              <option value="POS Device">POS Device</option>
            </select>
          </div>

          {/* Asset Status */}
          <div className="lg:col-span-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-2.5 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50 text-slate-700"
            >
              <option value="All">All Statuses</option>
              <option value="Matched">Matched</option>
              <option value="New">New</option>
              <option value="Review">Requires Review</option>
              <option value="Conflict">Conflict</option>
              <option value="Stale">Stale</option>
            </select>
          </div>

          {/* Show Latest Records Only Toggle */}
          <div className="lg:col-span-2 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowLatestOnly(!showLatestOnly)}
              className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                showLatestOnly ? 'bg-blue-600' : 'bg-slate-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  showLatestOnly ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
            <span className="text-xs text-slate-600 select-none">Latest Only</span>
          </div>

          {/* More Filters & Clear */}
          <div className="lg:col-span-2 flex items-center justify-end gap-2">
            <button
              onClick={() => setIsMoreFiltersOpen(!isMoreFiltersOpen)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border transition-colors ${
                isMoreFiltersOpen
                  ? 'bg-blue-50 text-blue-700 border-blue-300'
                  : 'text-slate-700 bg-slate-50 hover:bg-slate-100 border-slate-200'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>More Filters</span>
            </button>
            <button
              onClick={() => {
                setSearchQuery('');
                setTypeFilter('All');
                setStatusFilter('All');
                setAdvFilters({ manufacturer: 'All', vlan: 'All', discoverySource: 'All', subnet: '' });
                if (onClearJobFilter) onClearJobFilter();
              }}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              title="Reset Filters"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* More Filters Drawer / Expansion */}
        {isMoreFiltersOpen && (
          <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3 animate-in fade-in duration-150">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Manufacturer</label>
              <select
                value={advFilters.manufacturer}
                onChange={(e) => setAdvFilters({ ...advFilters, manufacturer: e.target.value })}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
              >
                <option value="All">All Manufacturers</option>
                <option value="Dell">Dell</option>
                <option value="Lenovo">Lenovo</option>
                <option value="HP">HP</option>
                <option value="Apple">Apple</option>
                <option value="Cisco">Cisco</option>
                <option value="HPE">HPE</option>
                <option value="Zebra">Zebra</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Discovery Source</label>
              <select
                value={advFilters.discoverySource}
                onChange={(e) => setAdvFilters({ ...advFilters, discoverySource: e.target.value })}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
              >
                <option value="All">All Discovery Sources</option>
                <option value="IP_SCANNER">IP Range Scanner</option>
                <option value="SNMP">SNMP MIB Walker</option>
                <option value="WMI/WinRM">WMI / Windows Remote</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Subnet Prefix</label>
              <input
                type="text"
                placeholder="e.g. 192.168.1"
                value={advFilters.subnet}
                onChange={(e) => setAdvFilters({ ...advFilters, subnet: e.target.value })}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white font-mono"
              />
            </div>
          </div>
        )}
      </div>

      {/* Bulk Actions Floating Bar */}
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between px-4 py-3 bg-slate-900 text-white rounded-xl shadow-lg animate-in fade-in duration-150">
          <div className="text-xs">
            <strong>{selectedIds.length}</strong> devices selected
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                showToast(`Auto-matching ${selectedIds.length} devices...`);
                setSelectedIds([]);
              }}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-xs font-semibold rounded-lg"
            >
              Bulk Match Selected
            </button>
            <button
              onClick={() => {
                showToast(`Bulk registering ${selectedIds.length} devices in Asset360...`);
                setSelectedIds([]);
              }}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-xs font-semibold rounded-lg"
            >
              Bulk Create Assets
            </button>
            <button
              onClick={() => setSelectedIds([])}
              className="px-2 py-1.5 text-slate-400 hover:text-white text-xs font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Devices Main Grid */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto max-h-[580px]">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider sticky top-0 z-10">
              <tr>
                <th className="py-3 px-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={selectedIds.length > 0 && selectedIds.length === filteredDevices.length}
                    onChange={handleSelectAll}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                  />
                </th>
                <th className="py-3 px-3">IP Address</th>
                <th className="py-3 px-3">Hostname</th>
                <th className="py-3 px-3">MAC Address</th>
                <th className="py-3 px-3">Device Type</th>
                <th className="py-3 px-3">Manufacturer & Model</th>
                <th className="py-3 px-3">Serial Number</th>
                <th className="py-3 px-3">Last Seen</th>
                <th className="py-3 px-3 text-center">Asset Status</th>
                <th className="py-3 px-3">Linked Asset</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDevices.length === 0 ? (
                <tr>
                  <td colSpan="11" className="text-center py-12 text-slate-400">
                    No discovered devices match your criteria.
                  </td>
                </tr>
              ) : (
                filteredDevices.map((device) => {
                  const isChecked = selectedIds.includes(device.id);
                  return (
                    <tr
                      key={device.id}
                      className={`hover:bg-slate-50/80 transition-colors ${isChecked ? 'bg-blue-50/40' : ''}`}
                    >
                      <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleSelect(device.id)}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                        />
                      </td>
                      <td className="py-3 px-3 font-mono font-medium text-slate-900">
                        {device.ipAddress}
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-900">
                        {device.hostname}
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px] text-slate-500">
                        {device.macAddress}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          {getDeviceIcon(device.deviceType)}
                          <span className="text-slate-700">{device.deviceType}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-slate-800">
                        <span>{device.manufacturer}</span>{' '}
                        <span className="text-slate-500">{device.model}</span>
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px] text-slate-600">
                        {device.serialNumber}
                      </td>
                      <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                        {device.lastSeen}
                      </td>
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        {getStatusBadge(device.assetStatus)}
                      </td>
                      <td className="py-3 px-3">
                        {device.linkedAssetId ? (
                          <button
                            onClick={() => navigate(`/assets/${device.linkedAssetId}`)}
                            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium hover:underline"
                          >
                            <span>{device.linkedAssetId}</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        ) : (
                          <span className="text-slate-400 italic">Unlinked</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          {/* Inspect / View Details */}
                          <button
                            title="View Device Details"
                            onClick={() => setSelectedDeviceDetails(device)}
                            className="p-1 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Quick Match / Create Asset button depending on status */}
                          {device.assetStatus === 'New' && (
                            <button
                              title="Create Asset from Device"
                              onClick={() => setCreateAssetModalDevice(device)}
                              className="px-2 py-0.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded text-[11px] font-semibold"
                            >
                              Create Asset
                            </button>
                          )}

                          {(device.assetStatus === 'Requires Review' || device.assetStatus === 'Review') && (
                            <button
                              title="Match with Existing Asset"
                              onClick={() => setMatchModalDevice(device)}
                              className="px-2 py-0.5 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded text-[11px] font-semibold"
                            >
                              Reconcile
                            </button>
                          )}

                          {device.assetStatus === 'Matched' && device.linkedAssetId && (
                            <button
                              title="View in Asset 360°"
                              onClick={() => navigate(`/assets/${device.linkedAssetId}`)}
                              className="p-1 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Delete */}
                          <button
                            title="Delete / Suppress Device"
                            onClick={() => handleDeleteDevice(device.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Device Inspector Modal */}
      {selectedDeviceDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <Laptop className="w-5 h-5 text-blue-600" />
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{selectedDeviceDetails.hostname}</h3>
                  <p className="text-xs text-slate-500">{selectedDeviceDetails.ipAddress} • {selectedDeviceDetails.macAddress}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDeviceDetails(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div>
                  <div className="text-slate-400 font-medium">Device Type</div>
                  <div className="font-semibold text-slate-800 mt-0.5">{selectedDeviceDetails.deviceType}</div>
                </div>
                <div>
                  <div className="text-slate-400 font-medium">Manufacturer</div>
                  <div className="font-semibold text-slate-800 mt-0.5">{selectedDeviceDetails.manufacturer}</div>
                </div>
                <div>
                  <div className="text-slate-400 font-medium">Model</div>
                  <div className="font-semibold text-slate-800 mt-0.5">{selectedDeviceDetails.model}</div>
                </div>
                <div>
                  <div className="text-slate-400 font-medium">Asset Status</div>
                  <div className="mt-0.5">{getStatusBadge(selectedDeviceDetails.assetStatus)}</div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 mb-2">Hardware Specifications</h4>
                <div className="grid grid-cols-2 gap-2 bg-white p-3 rounded-lg border border-slate-200">
                  <div>
                    <span className="text-slate-400">Processor:</span>{' '}
                    <span className="font-semibold text-slate-800">{selectedDeviceDetails.hardware?.cpu || 'Intel Core i7'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Memory:</span>{' '}
                    <span className="font-semibold text-slate-800">{selectedDeviceDetails.hardware?.ram || '16 GB'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Operating System:</span>{' '}
                    <span className="font-semibold text-slate-800">{selectedDeviceDetails.operatingSystem}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Storage:</span>{' '}
                    <span className="font-semibold text-slate-800">{selectedDeviceDetails.hardware?.storage || '512 GB SSD'}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 mb-2">Discovery Context</h4>
                <div className="grid grid-cols-2 gap-2 bg-white p-3 rounded-lg border border-slate-200">
                  <div>
                    <span className="text-slate-400">Scan Job:</span>{' '}
                    <span className="font-semibold text-slate-800">{selectedDeviceDetails.discoveryJob}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Protocol:</span>{' '}
                    <span className="font-semibold text-slate-800">{selectedDeviceDetails.discoverySource}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">First Discovered:</span>{' '}
                    <span className="font-semibold text-slate-800">{selectedDeviceDetails.firstSeen}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Location:</span>{' '}
                    <span className="font-semibold text-slate-800">{selectedDeviceDetails.location}</span>
                  </div>
                </div>
              </div>

              {selectedDeviceDetails.linkedAssetId && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-emerald-900">Linked to Asset in Registry</div>
                    <div className="text-xs text-emerald-700 font-mono mt-0.5">{selectedDeviceDetails.linkedAssetId}</div>
                  </div>
                  <button
                    onClick={() => navigate(`/assets/${selectedDeviceDetails.linkedAssetId}`)}
                    className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
                  >
                    Open Asset 360°
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
              <button
                onClick={() => setSelectedDeviceDetails(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Asset Match Modal */}
      {matchModalDevice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-slate-900 text-base">Reconcile Asset Match</h3>
              </div>
              <button
                onClick={() => setMatchModalDevice(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900">
                Discovered device <strong>{matchModalDevice.hostname}</strong> ({matchModalDevice.serialNumber}) requires manual confirmation to link to an Asset360 record.
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Asset ID</label>
                <input
                  type="text"
                  defaultValue={`AST-2026-${Math.floor(10000 + Math.random() * 90000)}`}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setMatchModalDevice(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleConfirmMatch(matchModalDevice)}
                  className="px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg"
                >
                  Confirm & Link Asset
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Asset Modal */}
      {createAssetModalDevice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <PlusCircle className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-base">Register as New Asset</h3>
              </div>
              <button
                onClick={() => setCreateAssetModalDevice(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleCreateAssetSubmit(createAssetModalDevice, {});
              }}
              className="p-6 space-y-4 text-xs"
            >
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Asset Name / Description</label>
                <input
                  type="text"
                  defaultValue={`${createAssetModalDevice.manufacturer} ${createAssetModalDevice.model} (${createAssetModalDevice.hostname})`}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <input
                    type="text"
                    defaultValue="IT Hardware"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Serial Number</label>
                  <input
                    type="text"
                    readOnly
                    defaultValue={createAssetModalDevice.serialNumber}
                    className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg font-mono text-xs text-slate-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assigned Department / Location</label>
                <input
                  type="text"
                  defaultValue={createAssetModalDevice.location || 'HQ IT Operations'}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCreateAssetModalDevice(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
                >
                  Create & Link Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
