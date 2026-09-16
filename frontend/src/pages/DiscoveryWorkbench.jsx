import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
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
  Play,
  Plus,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  RefreshCw,
  Calendar,
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
  Settings
} from 'lucide-react';
import { ScheduleDiscoveryModal } from '../components/modals/ScheduleDiscoveryModal';
import { DiscoverySettingsModal } from '../components/modals/DiscoverySettingsModal';
import { AssetMatchModal } from '../components/modals/AssetMatchModal';
import { DiscoveryJobs } from './DiscoveryJobs';
import { DiscoveredDevices } from './DiscoveredDevices';
import { DiscoverySettings } from './DiscoverySettings';

// Seeded Discovered Devices matching screenshot
const SEED_DEVICES = [
  {
    id: 'DEV-001',
    ipAddress: '192.168.1.101',
    hostname: 'DESKTOP-001',
    macAddress: '00:1B:44:11:3A:B7',
    deviceType: 'Computer',
    manufacturer: 'Dell',
    model: 'OptiPlex 7090',
    serialNumber: 'SN-DL-784920',
    status: 'Matched',
    matchScore: 98,
    os: 'Windows 11 Pro 64-bit',
    domain: 'ASSET360.CORP',
    lastSeen: 'Today, 10:45 AM',
    location: 'HQ Floor 2 - Workstation 14',
    matchedAsset: {
      assetTag: 'AST-2024-8890',
      name: 'DESKTOP-001',
      serialNumber: 'SN-DL-784920',
      macAddress: '00:1B:44:11:3A:B7',
      manufacturer: 'Dell',
      model: 'OptiPlex 7090',
      assignedUser: 'John Doe (Finance)',
      location: 'HQ Floor 2',
      status: 'Active'
    },
    hardware: {
      cpu: 'Intel Core i7-11700 @ 2.50GHz (8 Cores, 16 Threads)',
      ram: '32 GB DDR4 3200MHz (2x 16GB)',
      storage: '512 GB NVMe SSD (Samsung PM981a) + 1 TB HDD',
      biosUuid: '4C4C4544-004B-4810-8054-C3C04F4D3232',
      arch: 'x64-based PC'
    },
    network: {
      ipSubnet: '192.168.1.101 / 255.255.255.0',
      gateway: '192.168.1.1',
      dns: '192.168.1.10, 8.8.8.8',
      switchPort: 'SW-CORE-01 (Port Gi1/0/14)',
      vlan: '10 (Corporate Data)',
      dhcpServer: '192.168.1.5'
    },
    software: [
      { name: 'Google Chrome', version: '120.0.6099.130', publisher: 'Google LLC' },
      { name: 'Microsoft 365 Apps for Enterprise', version: '16.0.17126.20132', publisher: 'Microsoft Corporation' },
      { name: 'Slack', version: '4.36.136', publisher: 'Slack Technologies LLC' },
      { name: 'Zoom Workplace', version: '5.17.2 (30948)', publisher: 'Zoom Video Communications' },
      { name: 'Visual Studio Code', version: '1.85.1', publisher: 'Microsoft Corporation' },
      { name: 'CrowdStrike Falcon Sensor', version: '7.08.18005.0', publisher: 'CrowdStrike, Inc.' }
    ]
  },
  {
    id: 'DEV-002',
    ipAddress: '192.168.1.102',
    hostname: 'MONITOR-245',
    macAddress: '00:1B:44:11:3A:C8',
    deviceType: 'Monitor',
    manufacturer: 'Dell',
    model: 'UltraSharp U2720Q',
    serialNumber: 'SN-DL-994821',
    status: 'Matched',
    matchScore: 96,
    os: 'Embedded Firmware v2.1',
    domain: 'N/A (Peripherals)',
    lastSeen: 'Today, 10:44 AM',
    location: 'HQ Floor 2 - Workstation 14',
    matchedAsset: {
      assetTag: 'AST-2024-5510',
      name: 'MONITOR-245',
      serialNumber: 'SN-DL-994821',
      macAddress: '00:1B:44:11:3A:C8',
      manufacturer: 'Dell',
      model: 'UltraSharp U2720Q',
      assignedUser: 'John Doe (Finance)',
      location: 'HQ Floor 2',
      status: 'Active'
    },
    hardware: {
      cpu: 'ARM Cortex M4 Controller',
      ram: '512 MB Flash',
      storage: 'Internal ROM',
      biosUuid: 'N/A',
      arch: 'Embedded'
    },
    network: {
      ipSubnet: '192.168.1.102 / 255.255.255.0',
      gateway: '192.168.1.1',
      dns: '192.168.1.10',
      switchPort: 'SW-CORE-01 (Port Gi1/0/15)',
      vlan: '10 (Corporate Data)',
      dhcpServer: '192.168.1.5'
    },
    software: [
      { name: 'Dell Display Manager', version: '2.1.0.0044', publisher: 'Dell Inc.' },
      { name: 'DisplayPort MST Driver', version: '1.2.0', publisher: 'Dell Inc.' }
    ]
  },
  {
    id: 'DEV-003',
    ipAddress: '192.168.1.150',
    hostname: 'PRN-HQ-01',
    macAddress: '00:1E:68:55:2A:41',
    deviceType: 'Printer',
    manufacturer: 'HP',
    model: 'LaserJet Pro M404n',
    serialNumber: 'SN-HP-332910',
    status: 'Review',
    matchScore: 74,
    os: 'FutureSmart 5 Firmware',
    domain: 'ASSET360.CORP',
    lastSeen: 'Today, 10:42 AM',
    location: 'HQ Floor 1 - Print Room',
    matchedAsset: {
      assetTag: 'AST-2023-1120',
      name: 'PRINTER-OLD-M402',
      serialNumber: 'SN-HP-332910',
      macAddress: '00:1E:68:55:2A:41',
      manufacturer: 'HP',
      model: 'LaserJet Pro M402n',
      assignedUser: 'Shared Office Resource',
      location: 'HQ Floor 1',
      status: 'Active'
    },
    hardware: {
      cpu: 'HP Custom 1200MHz RISC',
      ram: '256 MB',
      storage: '512 MB eMMC Flash',
      biosUuid: 'N/A',
      arch: 'ARM'
    },
    network: {
      ipSubnet: '192.168.1.150 / 255.255.255.0',
      gateway: '192.168.1.1',
      dns: '192.168.1.10',
      switchPort: 'SW-CORE-01 (Port Gi1/0/28)',
      vlan: '20 (Printers)',
      dhcpServer: '192.168.1.5'
    },
    software: [
      { name: 'HP Web Jetadmin Agent', version: '10.5.105', publisher: 'HP Inc.' },
      { name: 'Embedded Web Server', version: '2.4.1', publisher: 'HP Inc.' }
    ]
  },
  {
    id: 'DEV-004',
    ipAddress: '192.168.1.2',
    hostname: 'SW-CORE-01',
    macAddress: '00:0C:29:4F:8E:12',
    deviceType: 'Network Device',
    manufacturer: 'Cisco',
    model: 'Catalyst 9300',
    serialNumber: 'SN-CS-109283',
    status: 'Matched',
    matchScore: 99,
    os: 'Cisco IOS-XE 17.6.3a',
    domain: 'INFRA.ASSET360.CORP',
    lastSeen: 'Today, 10:45 AM',
    location: 'Data Center Rack 04',
    matchedAsset: {
      assetTag: 'AST-2022-0044',
      name: 'SW-CORE-01',
      serialNumber: 'SN-CS-109283',
      macAddress: '00:0C:29:4F:8E:12',
      manufacturer: 'Cisco',
      model: 'Catalyst 9300-48U',
      assignedUser: 'Network Infrastructure Team',
      location: 'Data Center Rack 04',
      status: 'In Production'
    },
    hardware: {
      cpu: 'x86 4-Core 1.8GHz',
      ram: '16 GB DDR4',
      storage: '16 GB Internal eUSB + 120 GB SSD',
      biosUuid: 'CS-CAT9300-48U-001',
      arch: 'x86_64'
    },
    network: {
      ipSubnet: '192.168.1.2 / 255.255.255.0',
      gateway: '192.168.1.1',
      dns: '192.168.1.10',
      switchPort: 'Core Uplink Te1/1/1',
      vlan: '1 (Management)',
      dhcpServer: 'Static'
    },
    software: [
      { name: 'Cisco DNA Center Agent', version: '2.3.5', publisher: 'Cisco Systems' },
      { name: 'SNMPv3 Engine', version: 'v3-USM', publisher: 'Cisco Systems' }
    ]
  },
  {
    id: 'DEV-005',
    ipAddress: '192.168.1.115',
    hostname: 'LAPTOP-078',
    macAddress: '00:28:F8:7A:91:04',
    deviceType: 'Computer',
    manufacturer: 'Lenovo',
    model: 'ThinkPad X1 Carbon Gen 9',
    serialNumber: 'SN-LN-552194',
    status: 'New',
    matchScore: 0,
    os: 'Windows 11 Pro 64-bit',
    domain: 'ASSET360.CORP',
    lastSeen: 'Today, 10:40 AM',
    location: 'HQ Floor 3 - Engineering',
    matchedAsset: null,
    hardware: {
      cpu: 'Intel Core i7-1165G7 @ 2.80GHz (4 Cores, 8 Threads)',
      ram: '16 GB LPDDR4x 4266MHz',
      storage: '1 TB PCIe NVMe SSD',
      biosUuid: 'N3AET75W (1.51 )',
      arch: 'x64-based PC'
    },
    network: {
      ipSubnet: '192.168.1.115 / 255.255.255.0',
      gateway: '192.168.1.1',
      dns: '192.168.1.10',
      switchPort: 'AP-01 (SSID: CorpSecure)',
      vlan: '10 (Corporate Data)',
      dhcpServer: '192.168.1.5'
    },
    software: [
      { name: 'Google Chrome', version: '120.0.6099.130', publisher: 'Google LLC' },
      { name: 'Slack', version: '4.36.136', publisher: 'Slack Technologies LLC' },
      { name: 'Lenovo Commercial Vantage', version: '10.2310.24.0', publisher: 'Lenovo Group Ltd.' },
      { name: 'Microsoft 365 Apps', version: '16.0.17126', publisher: 'Microsoft Corporation' }
    ]
  },
  {
    id: 'DEV-006',
    ipAddress: '192.168.1.5',
    hostname: 'AP-01',
    macAddress: '00:11:22:33:44:55',
    deviceType: 'Network Device',
    manufacturer: 'Cisco',
    model: 'Aironet 2800',
    serialNumber: 'SN-CS-998812',
    status: 'Matched',
    matchScore: 97,
    os: 'Cisco AP-OS 8.10.151.0',
    domain: 'INFRA.ASSET360.CORP',
    lastSeen: 'Today, 10:45 AM',
    location: 'HQ Floor 2 - Hallway Ceiling',
    matchedAsset: {
      assetTag: 'AST-2022-0098',
      name: 'AP-01',
      serialNumber: 'SN-CS-998812',
      macAddress: '00:11:22:33:44:55',
      manufacturer: 'Cisco',
      model: 'Aironet 2800e Series',
      assignedUser: 'Network Infrastructure Team',
      location: 'HQ Floor 2',
      status: 'Active'
    },
    hardware: {
      cpu: 'Qualcomm Atheros IPQ8065 1.4GHz',
      ram: '1 GB DDR3L',
      storage: '256 MB NAND Flash',
      biosUuid: 'AP2800-001-998812',
      arch: 'ARM'
    },
    network: {
      ipSubnet: '192.168.1.5 / 255.255.255.0',
      gateway: '192.168.1.1',
      dns: '192.168.1.10',
      switchPort: 'SW-CORE-01 (Port Gi1/0/3)',
      vlan: '1 (Management)',
      dhcpServer: 'Static'
    },
    software: [
      { name: 'Cisco CleanAir Engine', version: '3.1.2', publisher: 'Cisco Systems' },
      { name: 'CAPWAP Controller Tunnel', version: '8.10', publisher: 'Cisco Systems' }
    ]
  }
];

export function DiscoveryWorkbench({ defaultTab }) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeNavTab = searchParams.get('tab') || defaultTab || 'jobs';
  const [selectedJobFilter, setSelectedJobFilter] = useState(null);

  // Config State
  const [discoveryType, setDiscoveryType] = useState('IP Range Scan');
  const [ipStart, setIpStart] = useState('192.168.1.1');
  const [ipEnd, setIpEnd] = useState('192.168.1.254');
  const [profile, setProfile] = useState('Default (All Devices)');
  const [credentials, setCredentials] = useState('Use Saved Credentials');
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [portScanRange, setPortScanRange] = useState('22, 80, 135, 139, 443, 445, 161, 3389, 5985');
  const [scanTimeout, setScanTimeout] = useState('3000');

  // Summary Metrics State
  const [summary, setSummary] = useState({
    discovered: 245,
    matched: 198,
    newAssets: 32,
    review: 15,
    deviceTypes: [
      { name: 'Computers', count: 120, pct: 49, color: '#4F46E5' },
      { name: 'Monitors', count: 48, pct: 20, color: '#3B82F6' },
      { name: 'Network Devices', count: 22, pct: 9, color: '#10B981' },
      { name: 'Printers', count: 18, pct: 7, color: '#F59E0B' },
      { name: 'Mobile Devices', count: 15, pct: 6, color: '#EC4899' },
      { name: 'Others', count: 22, pct: 9, color: '#8B5CF6' }
    ]
  });

  // Stages Progression
  const [stages, setStages] = useState([
    { id: 1, name: 'Scanning IP Range', status: 'Completed', duration: '2 min 14 sec' },
    { id: 2, name: 'Identifying Devices', status: 'Completed', duration: '1 min 32 sec' },
    { id: 3, name: 'Collecting Device Details', status: 'Completed', duration: '1 min 08 sec' },
    { id: 4, name: 'Matching with Asset Database', status: 'Completed', duration: '45 sec' },
    { id: 5, name: 'Generating Report', status: 'Completed', duration: '30 sec' }
  ]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(100);

  // Table Data State
  const [devices, setDevices] = useState(SEED_DEVICES);
  const [selectedDevice, setSelectedDevice] = useState(SEED_DEVICES[0]);
  const [selectedIds, setSelectedIds] = useState(['DEV-001']);
  const [detailTab, setDetailTab] = useState('software'); // software | hardware | network | match

  // Table Filters
  const [searchFilter, setSearchFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [locationFilter, setLocationFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Modals
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMatchModalOpen, setIsMatchModalOpen] = useState(false);
  const [matchModalDevice, setMatchModalDevice] = useState(null);

  // Load from backend on mount
  useEffect(() => {
    loadDiscoveryData();
  }, []);

  const loadDiscoveryData = async () => {
    try {
      const [sumRes, devRes] = await Promise.all([
        api.get('/discovery/summary').catch(() => null),
        api.get('/discovery/devices').catch(() => null)
      ]);

      if (sumRes && sumRes.summary) {
        setSummary(prev => ({
          ...prev,
          discovered: sumRes.summary.totalDiscovered ?? prev.discovered,
          matched: sumRes.summary.matchedCount ?? prev.matched,
          newAssets: sumRes.summary.newCount ?? prev.newAssets,
          review: sumRes.summary.reviewCount ?? prev.review
        }));
      }

      if (devRes && Array.isArray(devRes.devices) && devRes.devices.length > 0) {
        setDevices(devRes.devices);
        setSelectedDevice(devRes.devices[0]);
      }
    } catch (err) {
      console.warn('Discovery API fallback to initial seed state:', err);
    }
  };

  // Run live multi-stage discovery scan
  const handleStartDiscovery = async () => {
    if (isScanning) return;
    setIsScanning(true);
    setScanProgress(0);

    // Progressive stage simulation
    const stageNames = [
      { id: 1, name: 'Scanning IP Range' },
      { id: 2, name: 'Identifying Devices' },
      { id: 3, name: 'Collecting Device Details' },
      { id: 4, name: 'Matching with Asset Database' },
      { id: 5, name: 'Generating Report' }
    ];

    for (let i = 0; i < stageNames.length; i++) {
      setStages(prev =>
        prev.map((s, idx) => {
          if (idx < i) return { ...s, status: 'Completed', duration: s.duration || '45 sec' };
          if (idx === i) return { ...s, status: 'In Progress', duration: 'Scanning...' };
          return { ...s, status: 'Pending', duration: 'Pending' };
        })
      );
      setScanProgress(Math.round(((i + 1) / stageNames.length) * 100));
      // Short delay for live animation feedback
      await new Promise(res => setTimeout(res, 850));
    }

    // Call backend scan endpoint
    try {
      await api.post('/discovery/scan', {
        scope: `${ipStart} - ${ipEnd}`,
        discoveryType,
        profile
      });
      await loadDiscoveryData();
    } catch (err) {
      console.warn('Backend scan triggered:', err);
    }

    setStages([
      { id: 1, name: 'Scanning IP Range', status: 'Completed', duration: '2 min 14 sec' },
      { id: 2, name: 'Identifying Devices', status: 'Completed', duration: '1 min 32 sec' },
      { id: 3, name: 'Collecting Device Details', status: 'Completed', duration: '1 min 08 sec' },
      { id: 4, name: 'Matching with Asset Database', status: 'Completed', duration: '45 sec' },
      { id: 5, name: 'Generating Report', status: 'Completed', duration: '30 sec' }
    ]);
    setIsScanning(false);
    setScanProgress(100);
  };

  // Filtered devices
  const filteredDevices = useMemo(() => {
    return devices.filter(d => {
      const matchSearch =
        !searchFilter ||
        d.hostname.toLowerCase().includes(searchFilter.toLowerCase()) ||
        d.ipAddress.toLowerCase().includes(searchFilter.toLowerCase()) ||
        d.macAddress.toLowerCase().includes(searchFilter.toLowerCase()) ||
        d.serialNumber.toLowerCase().includes(searchFilter.toLowerCase());

      const matchType = typeFilter === 'ALL' || d.deviceType === typeFilter;
      const matchStatus = statusFilter === 'ALL' || d.status === statusFilter;
      const matchLoc = locationFilter === 'ALL' || (d.location && d.location.includes(locationFilter));

      return matchSearch && matchType && matchStatus && matchLoc;
    });
  }, [devices, searchFilter, typeFilter, statusFilter, locationFilter]);

  const handleDeviceReconciled = (deviceId, action) => {
    setDevices(prev =>
      prev.map(d => {
        if ((d.id || d.deviceId) === deviceId) {
          if (action === 'CONFIRM') {
            return { ...d, status: 'Matched', matchScore: 100 };
          }
          if (action === 'REJECT') {
            return { ...d, status: 'Review', matchScore: 40 };
          }
          if (action === 'REGISTER_NEW') {
            return { ...d, status: 'Matched', matchScore: 100 };
          }
        }
        return d;
      })
    );
    if (selectedDevice && (selectedDevice.id || selectedDevice.deviceId) === deviceId) {
      setSelectedDevice(prev => ({
        ...prev,
        status: action === 'REJECT' ? 'Review' : 'Matched',
        matchScore: action === 'REJECT' ? 40 : 100
      }));
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredDevices.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredDevices.map(d => d.id || d.deviceId));
    }
  };

  const toggleSelectDevice = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const getDeviceIcon = (type) => {
    switch (type) {
      case 'Computer':
        return <Monitor className="w-4 h-4 text-blue-600" />;
      case 'Monitor':
        return <Monitor className="w-4 h-4 text-sky-600" />;
      case 'Printer':
        return <Printer className="w-4 h-4 text-amber-600" />;
      case 'Network Device':
        return <Radio className="w-4 h-4 text-emerald-600" />;
      case 'Mobile':
        return <Smartphone className="w-4 h-4 text-purple-600" />;
      default:
        return <Cpu className="w-4 h-4 text-slate-600" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Matched':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <Check className="w-3 h-3 text-emerald-600" />
            Matched
          </span>
        );
      case 'New':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            <Plus className="w-3 h-3 text-blue-600" />
            New
          </span>
        );
      case 'Review':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            Review
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-12 select-none">
      
      {/* 1. Header & Top Navigation */}
      <div className="bg-white border-b border-slate-200 px-6 py-3.5 sticky top-0 z-30 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          
          {/* Title & Subtitle */}
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Cpu className="w-5 h-5" />
              </div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Auto Discovery</h1>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Discover, identify and import assets from your network
            </p>
          </div>

          {/* Center/Right Nav Tabs & Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Top Navigation Tabs */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setSearchParams({ tab: 'network' })}
                className={`px-3.5 py-1.5 rounded-lg transition-all ${
                  activeNavTab === 'network'
                    ? 'bg-white text-blue-600 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Network Discovery
              </button>
              <button
                onClick={() => setSearchParams({ tab: 'jobs' })}
                className={`px-3.5 py-1.5 rounded-lg transition-all ${
                  activeNavTab === 'jobs'
                    ? 'bg-white text-blue-600 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Discovery Jobs
              </button>
              <button
                onClick={() => setSearchParams({ tab: 'devices' })}
                className={`px-3.5 py-1.5 rounded-lg transition-all ${
                  activeNavTab === 'devices'
                    ? 'bg-white text-blue-600 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Discovered Devices
              </button>
              <button
                onClick={() => setSearchParams({ tab: 'settings' })}
                className={`px-3.5 py-1.5 rounded-lg transition-all ${
                  activeNavTab === 'settings'
                    ? 'bg-white text-blue-600 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Discovery Settings
              </button>
            </div>

            {/* Quick Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchFilter}
                onChange={e => setSearchFilter(e.target.value)}
                placeholder="Search assets, devices, users..."
                className="pl-8 pr-3 py-1.5 bg-slate-100/80 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 w-52 focus:w-64 focus:bg-white focus:outline-hidden focus:border-blue-500 transition-all"
              />
            </div>

            {/* Header Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/discovery/import')}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-2xs flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Import to Asset360
              </button>
              <button
                onClick={() => setIsScheduleOpen(true)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 rounded-xl shadow-2xs flex items-center gap-1.5 transition-colors"
              >
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                Schedule Discovery
              </button>
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 rounded-xl shadow-2xs flex items-center gap-1.5 transition-colors"
              >
                <Sliders className="w-3.5 h-3.5 text-slate-500" />
                Discovery Settings
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">

        {activeNavTab === 'jobs' && (
          <DiscoveryJobs
            onNavigateToDevices={(jobName) => {
              setSelectedJobFilter(jobName);
              setSearchParams({ tab: 'devices' });
            }}
          />
        )}

        {activeNavTab === 'devices' && (
          <DiscoveredDevices
            activeJobFilter={selectedJobFilter}
            onClearJobFilter={() => setSelectedJobFilter(null)}
          />
        )}

        {activeNavTab === 'settings' && (
          <DiscoverySettings />
        )}

        {activeNavTab === 'network' && (
          <>
            {/* 2. Top Section: Discovery Configuration & Discovery Summary/Status Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Top Left: Discovery Configuration Card (5 Cols) */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Discovery Configuration</h2>
                  <p className="text-[11px] text-slate-500">Define IP subnets, credentials &amp; discovery protocols</p>
                </div>
              </div>

              <div className="space-y-3.5 text-xs">
                {/* Discovery Type */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Discovery Type</label>
                  <select
                    value={discoveryType}
                    onChange={e => setDiscoveryType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-hidden focus:border-blue-500 font-medium"
                  >
                    <option value="IP Range Scan">IP Range Scan</option>
                    <option value="SNMP Polling">SNMP Polling</option>
                    <option value="WMI/WinRM Agentless">WMI/WinRM Agentless</option>
                    <option value="SSH Linux Discovery">SSH Linux Discovery</option>
                    <option value="MDM / Active Directory Sync">MDM / Active Directory Sync</option>
                  </select>
                </div>

                {/* IP Range Inputs */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">IP Range / Subnet</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={ipStart}
                      onChange={e => setIpStart(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono text-xs text-slate-800 focus:outline-hidden focus:border-blue-500"
                      placeholder="192.168.1.1"
                    />
                    <span className="text-slate-400 font-bold">-</span>
                    <input
                      type="text"
                      value={ipEnd}
                      onChange={e => setIpEnd(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono text-xs text-slate-800 focus:outline-hidden focus:border-blue-500"
                      placeholder="192.168.1.254"
                    />
                  </div>
                </div>

                {/* Discovery Profile */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Discovery Profile</label>
                  <select
                    value={profile}
                    onChange={e => setProfile(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-hidden focus:border-blue-500 font-medium"
                  >
                    <option value="Default (All Devices)">Default (All Devices)</option>
                    <option value="Workstations Only">Workstations Only</option>
                    <option value="Network Infrastructure">Network Infrastructure</option>
                    <option value="Printers & Scanners">Printers &amp; Scanners</option>
                  </select>
                </div>

                {/* Credentials */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Credentials</label>
                  <div className="flex items-center gap-2">
                    <select
                      value={credentials}
                      onChange={e => setCredentials(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-hidden focus:border-blue-500 font-medium"
                    >
                      <option value="Use Saved Credentials">Use Saved Credentials</option>
                      <option value="Windows Domain Admin (ASSET360)">Windows Domain Admin (ASSET360)</option>
                      <option value="SNMP v3 AuthPriv Set">SNMP v3 AuthPriv Set</option>
                      <option value="Linux SSH Root Key">Linux SSH Root Key</option>
                      <option value="No Auth (Ping Sweep Only)">No Auth (Ping Sweep Only)</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => setIsSettingsOpen(true)}
                      className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-500 transition-colors"
                      title="Manage Secure Credentials"
                    >
                      <Key className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* More Options Accordion */}
                <div className="border border-slate-100 rounded-xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setShowMoreOptions(!showMoreOptions)}
                    className="w-full px-3 py-2 bg-slate-50 hover:bg-slate-100 flex items-center justify-between text-[11px] font-semibold text-slate-600 transition-colors"
                  >
                    <span className="flex items-center gap-1.5">
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showMoreOptions ? 'rotate-180' : ''}`} />
                      More Options
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal">Ports &amp; Timeout</span>
                  </button>

                  {showMoreOptions && (
                    <div className="p-3 bg-white space-y-2.5 border-t border-slate-100 text-[11px]">
                      <div>
                        <label className="block text-slate-600 font-medium mb-1">Target Ports</label>
                        <input
                          type="text"
                          value={portScanRange}
                          onChange={e => setPortScanRange(e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg font-mono text-[11px]"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 font-medium mb-1">Socket Timeout (ms)</label>
                        <input
                          type="text"
                          value={scanTimeout}
                          onChange={e => setScanTimeout(e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg font-mono text-[11px]"
                        />
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center gap-3">
              <button
                type="button"
                onClick={handleStartDiscovery}
                disabled={isScanning}
                className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs hover:shadow flex items-center justify-center gap-2 transition-all disabled:opacity-75"
              >
                {isScanning ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Scanning ({scanProgress}%)...
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    Start Discovery
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setIsScheduleOpen(true)}
                className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs shadow-2xs transition-colors"
              >
                Save as Job
              </button>
            </div>

          </div>

          {/* Top Right: Discovery Summary & Status Card (8 Cols) */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 flex flex-col justify-between">
            
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                    <Database className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">Discovery Summary</h2>
                    <p className="text-[11px] text-slate-500">Real-time breakdown of discovered network devices &amp; reconciliation status</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-[11px] text-slate-500 font-medium">Last scan completed today at 10:45 AM</span>
                </div>
              </div>

              {/* 4 Metric Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                
                {/* 1. Discovered */}
                <div className="bg-purple-50/60 border border-purple-100 rounded-xl p-3 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                    <Monitor className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-slate-900 leading-none">{summary.discovered}</div>
                    <div className="text-[11px] text-slate-500 font-medium mt-1">Devices Discovered</div>
                  </div>
                </div>

                {/* 2. Matched with Assets */}
                <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-3 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-emerald-900 leading-none">{summary.matched}</div>
                    <div className="text-[11px] text-slate-500 font-medium mt-1">Matched with Assets</div>
                  </div>
                </div>

                {/* 3. New Assets Found */}
                <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-3 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-blue-900 leading-none">{summary.newAssets}</div>
                    <div className="text-[11px] text-slate-500 font-medium mt-1">New Assets Found</div>
                  </div>
                </div>

                {/* 4. Requires Review */}
                <div className="bg-amber-50/60 border border-amber-100 rounded-xl p-3 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-amber-900 leading-none">{summary.review}</div>
                    <div className="text-[11px] text-slate-500 font-medium mt-1">Requires Review</div>
                  </div>
                </div>

              </div>

              {/* Sub-grid: Device Type Breakdown Donut Chart (Left) + 5 Discovery Status Stages (Right) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
                
                {/* Left: Device Type Breakdown with Donut Chart */}
                <div className="bg-slate-50/60 rounded-xl p-4 border border-slate-100 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-bold text-slate-800">Device Type Breakdown</h3>
                    <span className="text-[10px] text-slate-400 font-medium">Auto-Categorized</span>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* SVG Donut Chart with center label */}
                    <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
                      <svg className="w-28 h-28 transform -rotate-90" viewBox="0 0 100 100">
                        {/* Computers: 49% -> strokeDasharray="49 51" */}
                        <circle cx="50" cy="50" r="38" fill="transparent" stroke="#4F46E5" strokeWidth="14" strokeDasharray="49 51" strokeDashoffset="0" />
                        {/* Monitors: 20% -> offset -49 */}
                        <circle cx="50" cy="50" r="38" fill="transparent" stroke="#3B82F6" strokeWidth="14" strokeDasharray="20 80" strokeDashoffset="-49" />
                        {/* Network: 9% -> offset -69 */}
                        <circle cx="50" cy="50" r="38" fill="transparent" stroke="#10B981" strokeWidth="14" strokeDasharray="9 91" strokeDashoffset="-69" />
                        {/* Printers: 7% -> offset -78 */}
                        <circle cx="50" cy="50" r="38" fill="transparent" stroke="#F59E0B" strokeWidth="14" strokeDasharray="7 93" strokeDashoffset="-78" />
                        {/* Mobile: 6% -> offset -85 */}
                        <circle cx="50" cy="50" r="38" fill="transparent" stroke="#EC4899" strokeWidth="14" strokeDasharray="6 94" strokeDashoffset="-85" />
                        {/* Others: 9% -> offset -91 */}
                        <circle cx="50" cy="50" r="38" fill="transparent" stroke="#94A3B8" strokeWidth="14" strokeDasharray="9 91" strokeDashoffset="-91" />
                      </svg>
                      {/* Center label */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-sm font-bold text-slate-900 leading-none">245</span>
                        <span className="text-[10px] text-slate-400 font-medium mt-0.5">Devices</span>
                      </div>
                    </div>

                    {/* Chart Legend List */}
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11px] flex-1">
                      {summary.deviceTypes.map((dt, idx) => (
                        <div key={idx} className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: dt.color }}></span>
                          <span className="text-slate-600 truncate">{dt.name}</span>
                          <span className="font-semibold text-slate-900 ml-auto">{dt.count}</span>
                          <span className="text-[10px] text-slate-400">({dt.pct}%)</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right: Discovery Status Stages */}
                <div className="bg-slate-50/60 rounded-xl p-4 border border-slate-100 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-bold text-slate-800">Discovery Status</h3>
                    <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                      Completed in 6m 09s
                    </span>
                  </div>

                  {/* 5 Stages List */}
                  <div className="space-y-2 text-xs">
                    {stages.map((stage) => {
                      const isCompleted = stage.status === 'Completed';
                      const inProgress = stage.status === 'In Progress';
                      return (
                        <div key={stage.id} className="flex items-center justify-between py-0.5">
                          <div className="flex items-center gap-2">
                            {isCompleted ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            ) : inProgress ? (
                              <RefreshCw className="w-3.5 h-3.5 text-blue-600 animate-spin shrink-0" />
                            ) : (
                              <div className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0"></div>
                            )}
                            <span className={`text-[11px] ${inProgress ? 'font-bold text-blue-700' : 'text-slate-700'}`}>
                              {stage.name}
                            </span>
                          </div>
                          <span className="text-[11px] font-mono text-slate-500">
                            {stage.duration}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            </div>

          </div>

        </div>

        {/* 3. Middle Section: Discovered Devices (245) Grid Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          
          {/* Table Header Controls */}
          <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-slate-50/40">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900">
                Discovered Devices <span className="text-blue-600 font-semibold">({filteredDevices.length})</span>
              </h2>
              {selectedIds.length > 0 && (
                <span className="text-xs bg-blue-100 text-blue-800 font-medium px-2 py-0.5 rounded-full">
                  {selectedIds.length} selected
                </span>
              )}
            </div>

            {/* Filter Bar */}
            <div className="flex flex-wrap items-center gap-2.5 text-xs">
              {/* Device Type Filter */}
              <select
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-medium focus:outline-hidden"
              >
                <option value="ALL">All Device Types</option>
                <option value="Computer">Computers</option>
                <option value="Monitor">Monitors</option>
                <option value="Network Device">Network Devices</option>
                <option value="Printer">Printers</option>
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-medium focus:outline-hidden"
              >
                <option value="ALL">All Status</option>
                <option value="Matched">Matched</option>
                <option value="New">New</option>
                <option value="Review">Requires Review</option>
              </select>

              {/* Location Filter */}
              <select
                value={locationFilter}
                onChange={e => setLocationFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-medium focus:outline-hidden"
              >
                <option value="ALL">All Locations</option>
                <option value="Floor 1">HQ Floor 1</option>
                <option value="Floor 2">HQ Floor 2</option>
                <option value="Floor 3">HQ Floor 3</option>
                <option value="Data Center">Data Center</option>
              </select>

              {/* Actions Button */}
              <button
                type="button"
                onClick={() => {
                  if (selectedDevice) {
                    setMatchModalDevice(selectedDevice);
                    setIsMatchModalOpen(true);
                  }
                }}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <span>... Actions</span>
              </button>
            </div>
          </div>

          {/* Table Element */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === filteredDevices.length && filteredDevices.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="py-3 px-4 font-bold text-slate-700">IP Address</th>
                  <th className="py-3 px-4 font-bold text-slate-700">Hostname</th>
                  <th className="py-3 px-4 font-bold text-slate-700">MAC Address</th>
                  <th className="py-3 px-4 font-bold text-slate-700">Device Type</th>
                  <th className="py-3 px-4 font-bold text-slate-700">Manufacturer</th>
                  <th className="py-3 px-4 font-bold text-slate-700">Model</th>
                  <th className="py-3 px-4 font-bold text-slate-700">Serial Number</th>
                  <th className="py-3 px-4 font-bold text-slate-700">Asset Status</th>
                  <th className="py-3 px-4 font-bold text-slate-700 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDevices.map((dev) => {
                  const isSelected = (selectedDevice?.id || selectedDevice?.deviceId) === (dev.id || dev.deviceId);
                  const isChecked = selectedIds.includes(dev.id || dev.deviceId);

                  return (
                    <tr
                      key={dev.id || dev.deviceId}
                      onClick={() => setSelectedDevice(dev)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-blue-50/70'
                          : 'hover:bg-slate-50/80'
                      }`}
                    >
                      <td className="py-3 px-4 text-center" onClick={e => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelectDevice(dev.id || dev.deviceId)}
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="py-3 px-4 font-mono font-medium text-slate-900">
                        {dev.ipAddress}
                      </td>
                      <td className="py-3 px-4 font-semibold text-blue-600 hover:underline">
                        {dev.hostname}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600 text-[11px]">
                        {dev.macAddress}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 text-slate-700">
                          {getDeviceIcon(dev.deviceType)}
                          <span>{dev.deviceType}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-800 font-medium">
                        {dev.manufacturer}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {dev.model}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600 text-[11px]">
                        {dev.serialNumber}
                      </td>
                      <td className="py-3 px-4">
                        {getStatusBadge(dev.status)}
                      </td>
                      <td className="py-3 px-4 text-right" onClick={e => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => {
                            setMatchModalDevice(dev);
                            setIsMatchModalOpen(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all"
                          title="Inspect Match &amp; Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Footer / Pagination */}
          <div className="p-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 bg-slate-50/50">
            <div>
              Showing <span className="font-semibold text-slate-800">1</span> to{' '}
              <span className="font-semibold text-slate-800">{filteredDevices.length}</span> of{' '}
              <span className="font-semibold text-slate-800">245</span> devices
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-medium disabled:opacity-50"
                disabled
              >
                Previous
              </button>
              <button
                type="button"
                className="px-2.5 py-1 rounded-lg border border-blue-600 bg-blue-600 text-white font-bold"
              >
                1
              </button>
              <button
                type="button"
                className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-medium"
              >
                2
              </button>
              <button
                type="button"
                className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-medium"
              >
                3
              </button>
              <span className="px-1 text-slate-400">...</span>
              <button
                type="button"
                className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-medium"
              >
                Next
              </button>
            </div>
          </div>

        </div>

        {/* 4. Bottom Section: Selected Device Details (Left: Overview, Right: Tabs) */}
        {selectedDevice && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">
                  Selected Device Details: <span className="text-blue-600 font-mono">{selectedDevice.hostname}</span>
                </h3>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(selectedDevice.status)}
                <button
                  type="button"
                  onClick={() => {
                    setMatchModalDevice(selectedDevice);
                    setIsMatchModalOpen(true);
                  }}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-2xs flex items-center gap-1 transition-colors"
                >
                  <ArrowRight className="w-3 h-3" />
                  Reconcile Match
                </button>
              </div>
            </div>

            <div className="p-5 grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Device Identity Card (4 Cols) */}
              <div className="lg:col-span-4 bg-slate-50/60 rounded-xl p-4 border border-slate-200/80 space-y-3 text-xs">
                <div className="flex items-center gap-3 pb-3 border-b border-slate-200/70">
                  <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center justify-center text-blue-600">
                    <Monitor className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900 leading-tight">{selectedDevice.hostname}</h4>
                    <p className="text-xs text-slate-500">{selectedDevice.manufacturer} • {selectedDevice.model}</p>
                  </div>
                </div>

                <div className="space-y-2 divide-y divide-slate-100 text-[11px]">
                  <div className="flex justify-between pt-1">
                    <span className="text-slate-500 font-medium">IP Address</span>
                    <span className="font-mono font-bold text-slate-800">{selectedDevice.ipAddress}</span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="text-slate-500 font-medium">MAC Address</span>
                    <span className="font-mono text-slate-700">{selectedDevice.macAddress}</span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="text-slate-500 font-medium">Manufacturer</span>
                    <span className="font-medium text-slate-800">{selectedDevice.manufacturer}</span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="text-slate-500 font-medium">Model</span>
                    <span className="font-medium text-slate-800">{selectedDevice.model}</span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="text-slate-500 font-medium">Serial Number</span>
                    <span className="font-mono text-slate-700">{selectedDevice.serialNumber}</span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="text-slate-500 font-medium">Operating System</span>
                    <span className="font-medium text-slate-800">{selectedDevice.os}</span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="text-slate-500 font-medium">Domain / Workgroup</span>
                    <span className="font-mono text-slate-700">{selectedDevice.domain}</span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="text-slate-500 font-medium">Last Seen</span>
                    <span className="font-medium text-slate-800">{selectedDevice.lastSeen}</span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="text-slate-500 font-medium">Location</span>
                    <span className="font-medium text-slate-800">{selectedDevice.location}</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Tabbed Details Container (8 Cols) */}
              <div className="lg:col-span-8 flex flex-col justify-between">
                <div>
                  {/* Tabs Header */}
                  <div className="flex items-center gap-2 border-b border-slate-200 pb-2 mb-4 text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => setDetailTab('software')}
                      className={`px-3 py-1.5 rounded-lg transition-colors ${
                        detailTab === 'software'
                          ? 'bg-blue-50 text-blue-600 font-bold border border-blue-200'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Installed Software ({selectedDevice.software ? selectedDevice.software.length : 12})
                    </button>
                    <button
                      type="button"
                      onClick={() => setDetailTab('hardware')}
                      className={`px-3 py-1.5 rounded-lg transition-colors ${
                        detailTab === 'hardware'
                          ? 'bg-blue-50 text-blue-600 font-bold border border-blue-200'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Hardware Details
                    </button>
                    <button
                      type="button"
                      onClick={() => setDetailTab('network')}
                      className={`px-3 py-1.5 rounded-lg transition-colors ${
                        detailTab === 'network'
                          ? 'bg-blue-50 text-blue-600 font-bold border border-blue-200'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Network Info
                    </button>
                    <button
                      type="button"
                      onClick={() => setDetailTab('match')}
                      className={`px-3 py-1.5 rounded-lg transition-colors ${
                        detailTab === 'match'
                          ? 'bg-blue-50 text-blue-600 font-bold border border-blue-200'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Asset Match
                    </button>
                  </div>

                  {/* Tab 1: Installed Software */}
                  {detailTab === 'software' && (
                    <div className="space-y-3">
                      <div className="border border-slate-200 rounded-xl overflow-hidden">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                            <tr>
                              <th className="py-2.5 px-3.5">Software Name</th>
                              <th className="py-2.5 px-3.5">Version</th>
                              <th className="py-2.5 px-3.5">Publisher</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {(selectedDevice.software || []).map((sw, idx) => (
                              <tr key={idx} className="hover:bg-slate-50/60">
                                <td className="py-2 px-3.5 font-medium text-slate-900">{sw.name}</td>
                                <td className="py-2 px-3.5 font-mono text-[11px] text-slate-600">{sw.version}</td>
                                <td className="py-2 px-3.5 text-slate-600">{sw.publisher}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="text-right">
                        <button
                          type="button"
                          className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1 ml-auto"
                        >
                          View All Installed Software &rarr;
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Tab 2: Hardware Details */}
                  {detailTab === 'hardware' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="text-[11px] font-bold uppercase text-slate-400">Processor (CPU)</span>
                        <p className="font-semibold text-slate-800 mt-1">{selectedDevice.hardware?.cpu || 'Intel Core i7'}</p>
                      </div>
                      <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="text-[11px] font-bold uppercase text-slate-400">System Memory (RAM)</span>
                        <p className="font-semibold text-slate-800 mt-1">{selectedDevice.hardware?.ram || '32 GB DDR4'}</p>
                      </div>
                      <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="text-[11px] font-bold uppercase text-slate-400">Local Storage</span>
                        <p className="font-semibold text-slate-800 mt-1">{selectedDevice.hardware?.storage || '512 GB NVMe SSD'}</p>
                      </div>
                      <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="text-[11px] font-bold uppercase text-slate-400">Motherboard / BIOS UUID</span>
                        <p className="font-mono text-[11px] text-slate-800 mt-1">{selectedDevice.hardware?.biosUuid || 'N/A'}</p>
                      </div>
                    </div>
                  )}

                  {/* Tab 3: Network Info */}
                  {detailTab === 'network' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="text-[11px] font-bold uppercase text-slate-400">IP Subnet Mask</span>
                        <p className="font-mono font-semibold text-slate-800 mt-1">{selectedDevice.network?.ipSubnet || selectedDevice.ipAddress}</p>
                      </div>
                      <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="text-[11px] font-bold uppercase text-slate-400">Default Gateway</span>
                        <p className="font-mono font-semibold text-slate-800 mt-1">{selectedDevice.network?.gateway || '192.168.1.1'}</p>
                      </div>
                      <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="text-[11px] font-bold uppercase text-slate-400">Switch &amp; Port Link</span>
                        <p className="font-semibold text-slate-800 mt-1">{selectedDevice.network?.switchPort || 'SW-CORE-01'}</p>
                      </div>
                      <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="text-[11px] font-bold uppercase text-slate-400">VLAN Assignment</span>
                        <p className="font-semibold text-slate-800 mt-1">{selectedDevice.network?.vlan || 'VLAN 10 (Corporate)'}</p>
                      </div>
                    </div>
                  )}

                  {/* Tab 4: Asset Match */}
                  {detailTab === 'match' && (
                    <div className="space-y-3 text-xs">
                      <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-100 flex items-center justify-between">
                        <div>
                          <span className="text-[11px] font-bold uppercase text-blue-700">Reconciliation Match Candidate</span>
                          <h4 className="text-sm font-bold text-slate-900 mt-0.5">
                            {selectedDevice.matchedAsset ? selectedDevice.matchedAsset.assetTag : 'No Pre-Existing Match Found'}
                          </h4>
                          <p className="text-[11px] text-slate-500">
                            {selectedDevice.matchedAsset
                              ? `Assigned to: ${selectedDevice.matchedAsset.assignedUser} • Status: ${selectedDevice.matchedAsset.status}`
                              : 'This device appears to be uncataloged. You can register it into the Asset Master.'}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                            {selectedDevice.matchScore || 0}% Match
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setMatchModalDevice(selectedDevice);
                            setIsMatchModalOpen(true);
                          }}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-xs shadow-xs transition-colors flex items-center gap-1.5"
                        >
                          <ShieldCheck className="w-4 h-4" />
                          Open Side-by-Side Comparison
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              </div>

            </div>
          </div>
        )}
          </>
        )}

      </div>

      {/* Modals */}
      <ScheduleDiscoveryModal
        isOpen={isScheduleOpen}
        onClose={() => setIsScheduleOpen(false)}
        onJobScheduled={(job) => {
          console.log('Job scheduled:', job);
        }}
      />

      <DiscoverySettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSettingsUpdated={(settings) => {
          console.log('Settings updated:', settings);
        }}
      />

      <AssetMatchModal
        isOpen={isMatchModalOpen}
        device={matchModalDevice}
        onClose={() => setIsMatchModalOpen(false)}
        onReconciled={handleDeviceReconciled}
      />

    </div>
  );
}
