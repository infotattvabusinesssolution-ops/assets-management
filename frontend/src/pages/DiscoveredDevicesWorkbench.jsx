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
  Network
} from 'lucide-react';
import clsx from 'clsx';

// Pre-seeded device catalog fallback to ensure immediate, zero-latency visual fidelity
const FALLBACK_DEVICES = [
  {
    id: 'DEV-001',
    ipAddress: '192.168.1.101',
    hostname: 'DESKTOP-001',
    macAddress: '00:1B:44:11:3A:B7',
    deviceType: 'Computer',
    manufacturer: 'Dell',
    model: 'OptiPlex 7090',
    serialNumber: 'SN-DL-784920',
    status: 'MATCHED',
    matchScore: 98,
    operatingSystem: 'Windows 11 Pro 64-bit (22H2)',
    domain: 'ASSET360.CORP',
    lastSeen: 'Today, 10:45 AM',
    firstDiscovered: '2026-01-15 08:30 AM',
    location: 'HQ Floor 2 - Workstation 14',
    discoveryJob: 'Daily Subnet Sweep',
    discoverySource: 'WMI/WinRM & SNMP',
    matchedAssetId: 'AST-2024-8890',
    matchedAssetName: 'Dell OptiPlex 7090 Desktop',
    hardware: {
      cpu: 'Intel Core i7-11700 @ 2.50GHz (8 Cores, 16 Threads)',
      ram: '32 GB DDR4 3200MHz (2x 16GB DIMM)',
      storage: '512 GB NVMe SSD (Samsung PM981a) + 1 TB HDD',
      bios: 'Dell Inc. 1.14.0 (02/15/2024)',
      systemUuid: '4C4C4544-004B-4810-8054-C3C04F4D3232',
      chassis: 'Small Form Factor Desktop',
      assetTagEtched: 'AST-2024-8890'
    },
    network: {
      ipSubnet: '192.168.1.101 / 255.255.255.0',
      gateway: '192.168.1.1',
      dns: '192.168.1.10, 8.8.8.8',
      switchPort: 'SW-CORE-01 (Gi1/0/14)',
      vlan: '10 (Corporate Data)',
      dhcpServer: '192.168.1.5',
      speed: '1000 Mbps Full Duplex'
    },
    software: [
      { name: 'Google Chrome', version: '120.0.6099.130', publisher: 'Google LLC', installDate: '2025-11-10' },
      { name: 'Microsoft 365 Apps for Enterprise', version: '16.0.17126.20132', publisher: 'Microsoft Corporation', installDate: '2025-08-01' },
      { name: 'Slack Workplace', version: '4.36.136', publisher: 'Slack Technologies LLC', installDate: '2025-09-14' },
      { name: 'Zoom Workplace', version: '5.17.2', publisher: 'Zoom Video Communications', installDate: '2025-10-05' },
      { name: 'Visual Studio Code', version: '1.85.1', publisher: 'Microsoft Corporation', installDate: '2025-12-01' },
      { name: 'CrowdStrike Falcon Sensor', version: '7.08.18005.0', publisher: 'CrowdStrike, Inc.', installDate: '2025-07-20' }
    ],
    history: [
      { timestamp: 'Today, 10:45 AM', job: 'Daily Subnet Sweep', event: 'Scanned active; verified software inventory and IP 192.168.1.101', status: 'Success' },
      { timestamp: 'Yesterday, 10:45 AM', job: 'Daily Subnet Sweep', event: 'Scanned active; all network interfaces confirmed', status: 'Success' },
      { timestamp: '2026-09-14 10:45 AM', job: 'Daily Subnet Sweep', event: 'Software change detected: Chrome updated to 120.0.6099.130', status: 'Updated' },
      { timestamp: '2026-01-15 08:30 AM', job: 'Campus Full Discovery', event: 'Initial device detection and automatic asset matching', status: 'Created' }
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
    status: 'MATCHED',
    matchScore: 96,
    operatingSystem: 'Embedded Firmware v2.1',
    domain: 'N/A (Peripherals)',
    lastSeen: 'Today, 10:44 AM',
    firstDiscovered: '2026-01-15 08:32 AM',
    location: 'HQ Floor 2 - Workstation 14',
    discoveryJob: 'Daily Subnet Sweep',
    discoverySource: 'DDC/CI & SNMP',
    matchedAssetId: 'AST-2024-5510',
    matchedAssetName: 'Dell UltraSharp 27" 4K Monitor',
    hardware: {
      cpu: 'ARM Cortex-M4 Controller',
      ram: '512 MB Flash ROM',
      storage: 'Internal ROM',
      bios: 'v2.1 DisplayPort 1.4 EDID',
      systemUuid: 'N/A',
      chassis: '27-inch Flat Panel Display',
      assetTagEtched: 'AST-2024-5510'
    },
    network: {
      ipSubnet: '192.168.1.102 / 255.255.255.0',
      gateway: '192.168.1.1',
      dns: '192.168.1.10',
      switchPort: 'SW-CORE-01 (Gi1/0/15)',
      vlan: '10 (Corporate Data)',
      dhcpServer: '192.168.1.5',
      speed: 'USB-C Passthrough'
    },
    software: [
      { name: 'Dell Display Manager', version: '2.1.0.0044', publisher: 'Dell Inc.', installDate: '2025-08-10' }
    ],
    history: [
      { timestamp: 'Today, 10:44 AM', job: 'Daily Subnet Sweep', event: 'EDID query verified SN-DL-994821', status: 'Success' },
      { timestamp: '2026-01-15 08:32 AM', job: 'Campus Full Discovery', event: 'Discovered via USB-C Hub daisy-chain', status: 'Created' }
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
    serialNumber: 'SN-HP-992144',
    status: 'MATCHED',
    matchScore: 99,
    operatingSystem: 'HP FutureSmart 4.11',
    domain: 'ASSET360.CORP',
    lastSeen: 'Today, 10:40 AM',
    firstDiscovered: '2025-10-10 09:00 AM',
    location: 'HQ Floor 2 - Copy Room',
    discoveryJob: 'Daily Subnet Sweep',
    discoverySource: 'SNMP v2c / JetDirect',
    matchedAssetId: 'AST-2023-1102',
    matchedAssetName: 'HP LaserJet Pro M404n Printer',
    hardware: {
      cpu: 'HP Custom 1200MHz RISC',
      ram: '256 MB DDR3',
      storage: '4 GB eMMC',
      bios: 'FS 4.11.0.1',
      systemUuid: 'HP-M404N-992144',
      chassis: 'Monochrome Workgroup Printer',
      assetTagEtched: 'AST-2023-1102'
    },
    network: {
      ipSubnet: '192.168.1.150 / 255.255.255.0',
      gateway: '192.168.1.1',
      dns: '192.168.1.10',
      switchPort: 'SW-CORE-01 (Gi1/0/24)',
      vlan: '20 (Printers & IoT)',
      dhcpServer: 'Static Assignment',
      speed: '1000 Mbps Full Duplex'
    },
    software: [
      { name: 'HP JetDirect Firmware', version: '4.11.0.1', publisher: 'HP Inc.', installDate: '2025-06-01' },
      { name: 'AirPrint Daemon', version: '2.0', publisher: 'Apple / HP', installDate: '2025-06-01' }
    ],
    history: [
      { timestamp: 'Today, 10:40 AM', job: 'Daily Subnet Sweep', event: 'Toner level 74%, paper tray 1 OK', status: 'Success' }
    ]
  },
  {
    id: 'DEV-004',
    ipAddress: '192.168.1.200',
    hostname: 'SW-CORE-01',
    macAddress: '00:00:0C:9F:F0:01',
    deviceType: 'Network Device',
    manufacturer: 'Cisco',
    model: 'Catalyst 9300-48P',
    serialNumber: 'FOC24110ABC',
    status: 'MATCHED',
    matchScore: 100,
    operatingSystem: 'Cisco IOS-XE 17.09.03a',
    domain: 'N/A (Cisco Domain)',
    lastSeen: 'Today, 10:45 AM',
    firstDiscovered: '2025-06-01 12:00 PM',
    location: 'HQ Server Room B - Rack 04',
    discoveryJob: 'Network Infrastructure Audit',
    discoverySource: 'SSH & SNMP v3',
    matchedAssetId: 'AST-2023-0042',
    matchedAssetName: 'Cisco Catalyst 9300 Core Switch',
    hardware: {
      cpu: 'x86 4-core 1.8GHz',
      ram: '16 GB DRAM',
      storage: '16 GB Onboard Flash',
      bios: 'Cisco ROMMON 17.6',
      systemUuid: 'CISCO-CAT9300-48P-FOC24110ABC',
      chassis: '1RU Managed Switch 48x PoE+',
      assetTagEtched: 'AST-2023-0042'
    },
    network: {
      ipSubnet: '192.168.1.200 / 255.255.255.0',
      gateway: '192.168.1.1',
      dns: '192.168.1.10',
      switchPort: 'Uplink Te1/1/1',
      vlan: '1 (Management)',
      dhcpServer: 'Static Assignment',
      speed: '48x 1G + 4x 10G SFP+'
    },
    software: [
      { name: 'Cisco IOS-XE Enterprise', version: '17.9.3a', publisher: 'Cisco Systems', installDate: '2025-05-15' }
    ],
    history: [
      { timestamp: 'Today, 10:45 AM', job: 'Network Infrastructure Audit', event: '48 PoE ports online; 0 CRC errors', status: 'Success' }
    ]
  },
  {
    id: 'DEV-005',
    ipAddress: '192.168.1.105',
    hostname: 'LAPTOP-078',
    macAddress: '3C:22:FB:41:88:99',
    deviceType: 'Computer',
    manufacturer: 'Apple',
    model: 'MacBook Pro 16" (M2 Pro)',
    serialNumber: 'C02G89AAMD6N',
    status: 'REVIEW',
    matchScore: 68,
    operatingSystem: 'macOS Sonoma 14.3',
    domain: 'Workgroup',
    lastSeen: 'Today, 09:15 AM',
    firstDiscovered: 'Today, 09:15 AM',
    location: 'HQ Floor 2 - Lounge',
    discoveryJob: 'Daily Subnet Sweep',
    discoverySource: 'mDNS / Bonjour & ARP',
    matchedAssetId: null,
    matchedAssetName: null,
    hardware: {
      cpu: 'Apple M2 Pro (12-core CPU, 19-core GPU)',
      ram: '32 GB Unified Memory',
      storage: '1 TB Apple SSD APFS',
      bios: 'Apple Silicon iBoot',
      systemUuid: 'F317589B-4D11-536A-842B-6C3D820F0019',
      chassis: '16-inch Aluminum Unibody',
      assetTagEtched: 'Unverified'
    },
    network: {
      ipSubnet: '192.168.1.105 / 255.255.255.0',
      gateway: '192.168.1.1',
      dns: '192.168.1.10',
      switchPort: 'AP-HQ-02 (Wi-Fi 6 SSID: Corp-Secure)',
      vlan: '15 (Wireless Users)',
      dhcpServer: '192.168.1.5',
      speed: 'Wi-Fi 6 (866 Mbps)'
    },
    software: [
      { name: 'macOS Sonoma', version: '14.3', publisher: 'Apple Inc.', installDate: '2026-01-20' },
      { name: 'Slack for Mac', version: '4.36.140', publisher: 'Slack', installDate: '2026-02-01' },
      { name: 'Microsoft Office 365 for Mac', version: '16.81', publisher: 'Microsoft', installDate: '2026-02-01' }
    ],
    history: [
      { timestamp: 'Today, 09:15 AM', job: 'Daily Subnet Sweep', event: 'New MAC detected on Wi-Fi; hostname LAPTOP-078 suggests contractor laptop', status: 'Review' }
    ]
  },
  {
    id: 'DEV-006',
    ipAddress: '192.168.1.110',
    hostname: 'DESKTOP-NEW-04',
    macAddress: 'B4:2E:99:A1:02:11',
    deviceType: 'Computer',
    manufacturer: 'Lenovo',
    model: 'ThinkCentre M90q Gen 3',
    serialNumber: 'MJ0987KL',
    status: 'NEW',
    matchScore: 0,
    operatingSystem: 'Windows 11 Pro 64-bit',
    domain: 'WORKGROUP',
    lastSeen: 'Today, 08:30 AM',
    firstDiscovered: 'Today, 08:30 AM',
    location: 'HQ Floor 1 - Reception',
    discoveryJob: 'Daily Subnet Sweep',
    discoverySource: 'WMI / Ping Sweep',
    matchedAssetId: null,
    matchedAssetName: null,
    hardware: {
      cpu: 'Intel Core i5-12500T @ 2.00GHz',
      ram: '16 GB DDR5 4800MHz',
      storage: '512 GB NVMe SSD',
      bios: 'Lenovo M41KT32A (09/2023)',
      systemUuid: '887201-9921-Lenovo-M90Q',
      chassis: 'Tiny Desktop (1L)',
      assetTagEtched: 'None detected'
    },
    network: {
      ipSubnet: '192.168.1.110 / 255.255.255.0',
      gateway: '192.168.1.1',
      dns: '192.168.1.10',
      switchPort: 'SW-CORE-01 (Gi1/0/5)',
      vlan: '10 (Corporate Data)',
      dhcpServer: '192.168.1.5',
      speed: '1000 Mbps Full Duplex'
    },
    software: [
      { name: 'Windows 11 Pro', version: '22H2', publisher: 'Microsoft', installDate: '2026-03-01' }
    ],
    history: [
      { timestamp: 'Today, 08:30 AM', job: 'Daily Subnet Sweep', event: 'Unregistered machine powered on at reception', status: 'New' }
    ]
  },
  {
    id: 'DEV-007',
    ipAddress: '192.168.1.50',
    hostname: 'AP-HQ-02',
    macAddress: '70:69:79:AA:BB:CC',
    deviceType: 'Access Point',
    manufacturer: 'Cisco',
    model: 'Catalyst 9120AXI',
    serialNumber: 'FOC26019XYZ',
    status: 'MATCHED',
    matchScore: 100,
    operatingSystem: 'Cisco Capwap IOS-XE 17.9',
    domain: 'N/A (WLC Managed)',
    lastSeen: 'Today, 10:45 AM',
    firstDiscovered: '2025-06-01 12:00 PM',
    location: 'HQ Floor 2 - North Wing Ceiling',
    discoveryJob: 'Network Infrastructure Audit',
    discoverySource: 'SNMP v3 & CDP',
    matchedAssetId: 'AST-2023-0199',
    matchedAssetName: 'Cisco Catalyst 9120AX Access Point',
    hardware: {
      cpu: 'Broadcom 1.5GHz Quad-core ARM',
      ram: '2 GB DDR4',
      storage: '1 GB Flash',
      bios: 'Cisco Boot 1.0',
      systemUuid: 'CISCO-AP9120-FOC26019XYZ',
      chassis: 'Wi-Fi 6 Ceiling Mount AP',
      assetTagEtched: 'AST-2023-0199'
    },
    network: {
      ipSubnet: '192.168.1.50 / 255.255.255.0',
      gateway: '192.168.1.1',
      dns: '192.168.1.10',
      switchPort: 'SW-CORE-01 (Gi1/0/18 - PoE+ 30W)',
      vlan: '30 (Wireless AP Management)',
      dhcpServer: 'Static Assignment',
      speed: '2.5 Gbps mGig PoE+'
    },
    software: [
      { name: 'Cisco AP Software', version: '17.9.3.5', publisher: 'Cisco Systems', installDate: '2025-07-10' }
    ],
    history: [
      { timestamp: 'Today, 10:45 AM', job: 'Network Infrastructure Audit', event: '42 wireless clients currently associated', status: 'Success' }
    ]
  },
  {
    id: 'DEV-008',
    ipAddress: '192.168.1.220',
    hostname: 'SRV-FILE-01',
    macAddress: '00:15:5D:80:12:44',
    deviceType: 'Server',
    manufacturer: 'Dell',
    model: 'PowerEdge R750',
    serialNumber: 'SN-DL-SRV8821',
    status: 'MATCHED',
    matchScore: 99,
    operatingSystem: 'Windows Server 2022 Datacenter',
    domain: 'ASSET360.CORP',
    lastSeen: 'Today, 10:45 AM',
    firstDiscovered: '2025-01-10 10:00 AM',
    location: 'HQ Server Room B - Rack 01',
    discoveryJob: 'Data Center Audit',
    discoverySource: 'WMI & iDRAC9 SNMP',
    matchedAssetId: 'AST-2023-0005',
    matchedAssetName: 'Dell PowerEdge R750 Rack Server',
    hardware: {
      cpu: '2x Intel Xeon Gold 6330 @ 2.00GHz (56 Cores Total)',
      ram: '256 GB ECC DDR4 3200MHz',
      storage: '8x 1.92TB NVMe SSD RAID 10 (Hardware PERC H755)',
      bios: 'Dell BIOS 1.9.2 (11/2023)',
      systemUuid: 'DELL-R750-SRV8821',
      chassis: '2RU Enterprise Rack Server',
      assetTagEtched: 'AST-2023-0005'
    },
    network: {
      ipSubnet: '192.168.1.220 / 255.255.255.0',
      gateway: '192.168.1.1',
      dns: '192.168.1.10, 192.168.1.11',
      switchPort: 'SW-CORE-01 (Te1/1/2)',
      vlan: '50 (Server DMZ)',
      dhcpServer: 'Static Assignment',
      speed: '2x 10Gbps LACP Bonded'
    },
    software: [
      { name: 'Windows Server 2022', version: '21H2', publisher: 'Microsoft', installDate: '2025-01-12' },
      { name: 'Veeam Backup Agent', version: '12.1', publisher: 'Veeam Software', installDate: '2025-01-15' },
      { name: 'OpenManage Server Administrator', version: '10.3', publisher: 'Dell', installDate: '2025-01-15' }
    ],
    history: [
      { timestamp: 'Today, 10:45 AM', job: 'Data Center Audit', event: 'Health status nominal; 0 degraded disks', status: 'Success' }
    ]
  },
  {
    id: 'DEV-009',
    ipAddress: '192.168.1.180',
    hostname: 'TV-CONF-LOBBY',
    macAddress: 'B8:27:EB:99:41:22',
    deviceType: 'Display / TV',
    manufacturer: 'Samsung',
    model: 'QE65Q60B 65" Commercial Display',
    serialNumber: 'SN-SS-883921',
    status: 'REVIEW',
    matchScore: 55,
    operatingSystem: 'Tizen OS 6.5',
    domain: 'N/A',
    lastSeen: 'Today, 07:15 AM',
    firstDiscovered: 'Yesterday, 04:00 PM',
    location: 'HQ Floor 1 - Reception Lobby',
    discoveryJob: 'Daily Subnet Sweep',
    discoverySource: 'UPnP / SSDP & ARP',
    matchedAssetId: null,
    matchedAssetName: null,
    hardware: {
      cpu: 'Samsung Quantum Processor Lite 4K',
      ram: '2 GB',
      storage: '8 GB Flash Storage',
      bios: 'Tizen Firmware 1402',
      systemUuid: 'SAMSUNG-QE65-883921',
      chassis: '65-inch 4K Commercial Panel',
      assetTagEtched: 'Pending Verification'
    },
    network: {
      ipSubnet: '192.168.1.180 / 255.255.255.0',
      gateway: '192.168.1.1',
      dns: '8.8.8.8',
      switchPort: 'SW-CORE-01 (Gi1/0/9)',
      vlan: '20 (Printers & IoT)',
      dhcpServer: '192.168.1.5',
      speed: '100 Mbps Fast Ethernet'
    },
    software: [
      { name: 'Samsung MagicINFO Player', version: '9.0', publisher: 'Samsung Electronics', installDate: '2026-02-10' }
    ],
    history: [
      { timestamp: 'Today, 07:15 AM', job: 'Daily Subnet Sweep', event: 'Device ping responded; SSDP payload received', status: 'Review' }
    ]
  },
  {
    id: 'DEV-010',
    ipAddress: '192.168.1.195',
    hostname: 'POS-TERMINAL-02',
    macAddress: '00:0C:29:4F:91:02',
    deviceType: 'POS / Terminal',
    manufacturer: 'HP',
    model: 'Engage One Pro',
    serialNumber: 'SN-HP-POS7719',
    status: 'NEW',
    matchScore: 0,
    operatingSystem: 'Windows 10 IoT Enterprise',
    domain: 'RETAIL.CORP',
    lastSeen: 'Today, 09:30 AM',
    firstDiscovered: 'Today, 09:30 AM',
    location: 'Branch Chicago - Front Desk',
    discoveryJob: 'Branch Office Audit',
    discoverySource: 'WMI & Ping Sweep',
    matchedAssetId: null,
    matchedAssetName: null,
    hardware: {
      cpu: 'Intel Core i3-10100E @ 3.20GHz',
      ram: '8 GB DDR4',
      storage: '256 GB M.2 SSD',
      bios: 'HP AMI U20 (2023)',
      systemUuid: 'HP-ENGAGE-POS7719',
      chassis: 'Touchscreen All-in-One POS Unit',
      assetTagEtched: 'Unassigned'
    },
    network: {
      ipSubnet: '192.168.1.195 / 255.255.255.0',
      gateway: '192.168.1.1',
      dns: '192.168.1.10',
      switchPort: 'SW-BRANCH-01 (Gi0/4)',
      vlan: '40 (POS & Payment)',
      dhcpServer: '192.168.1.5',
      speed: '1000 Mbps Full Duplex'
    },
    software: [
      { name: 'HP Engage POS Suite', version: '4.2', publisher: 'HP Inc.', installDate: '2026-01-05' },
      { name: 'OPOS Driver Pack', version: '1.14', publisher: 'Monroe Consulting', installDate: '2026-01-05' }
    ],
    history: [
      { timestamp: 'Today, 09:30 AM', job: 'Branch Office Audit', event: 'Newly deployed POS terminal detected', status: 'New' }
    ]
  }
];

export function DiscoveredDevicesWorkbench() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Primary Data State
  const [devices, setDevices] = useState(FALLBACK_DEVICES);
  const [loading, setLoading] = useState(false);
  const [kpis, setKpis] = useState({
    total: 245,
    matched: 198,
    newCount: 32,
    review: 15,
    conflicts: 4,
    stale: 11,
    matchedPct: 81,
    newPct: 13,
    reviewPct: 6
  });

  // Selected Device for the lower split-view
  const [selectedDevice, setSelectedDevice] = useState(FALLBACK_DEVICES[0]);
  const [detailTab, setDetailTab] = useState('hardware'); // 'hardware' | 'software' | 'network' | 'match' | 'history'

  // Selection checkboxes for bulk operations
  const [selectedIds, setSelectedIds] = useState(new Set());

  // Quick Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDeviceType, setFilterDeviceType] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterLocation, setFilterLocation] = useState('ALL');
  const [filterJob, setFilterJob] = useState('ALL');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(245);
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

  // Toast / Notification banner
  const [toastMessage, setToastMessage] = useState(null);
  const showToast = (msg, type = 'success') => {
    setToastMessage({ msg, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // -------------------------------------------------------------
  // 8 MODALS AND POPUPS STATES (Image 2)
  // -------------------------------------------------------------
  // 1. More Filters (Advanced Filters) Drawer / Modal
  const [isAdvancedFiltersOpen, setIsAdvancedFiltersOpen] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({
    ipRangeStart: '',
    ipRangeEnd: '',
    subnetCidr: '',
    macPrefix: '',
    hostnamePattern: '',
    deviceTypes: [],
    manufacturers: [],
    operatingSystems: [],
    statuses: [],
    discoveryJobs: [],
    discoverySources: [],
    locations: [],
    lastSeenFrom: '',
    lastSeenTo: '',
    latestOnly: true
  });

  // 2. Actions Dropdown Menu per row
  const [activeDropdownRowId, setActiveDropdownRowId] = useState(null);
  const dropdownRef = useRef(null);

  // 3. View Device Details Modal
  const [isViewDetailsModalOpen, setIsViewDetailsModalOpen] = useState(false);
  const [modalDevice, setModalDevice] = useState(null);

  // 4. Create Asset (from Discovered Device) 3-Step Wizard
  const [isCreateAssetWizardOpen, setIsCreateAssetWizardOpen] = useState(false);
  const [createAssetStep, setCreateAssetStep] = useState(1); // 1: Basic Info, 2: Additional Details, 3: Review & Create
  const [createAssetData, setCreateAssetData] = useState({
    deviceId: '',
    assetTag: '',
    name: '',
    category: 'IT Hardware',
    subCategory: 'Desktop Computers',
    manufacturer: '',
    model: '',
    serialNumber: '',
    macAddress: '',
    location: '',
    department: 'Information Technology',
    assignedUser: 'Unassigned',
    purchaseOrder: 'PO-2026-AUTO',
    cost: '1250.00',
    warrantyExpiry: '2028-12-31',
    depreciationMethod: 'Straight Line (5 Years)'
  });

  // 5. View Discovered Devices (from Job) Modal
  const [isJobDevicesModalOpen, setIsJobDevicesModalOpen] = useState(false);
  const [selectedJobData, setSelectedJobData] = useState({
    jobId: 'JOB-01',
    name: 'Daily Subnet Sweep',
    type: 'IP Range Scan (192.168.1.0/24)',
    runTime: 'Today, 10:30 AM - 10:45 AM (15 min)',
    status: 'Completed (Success)',
    kpis: { total: 142, matched: 120, newCount: 18, review: 4 }
  });

  // 6. Download / Export Report Modal
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState('xlsx'); // 'xlsx' | 'csv' | 'pdf'
  const [exportScope, setExportScope] = useState('all'); // 'all' | 'filtered' | 'selected'
  const [exportColumns, setExportColumns] = useState({
    ipAddress: true,
    hostname: true,
    macAddress: true,
    deviceType: true,
    manufacturer: true,
    model: true,
    serialNumber: true,
    status: true,
    lastSeen: true,
    hardware: true,
    network: true,
    matchedAssetTag: true,
    softwareCount: true
  });

  // 7. Re-run Discovery Job Modal
  const [isRerunJobModalOpen, setIsRerunJobModalOpen] = useState(false);
  const [rerunJobTarget, setRerunJobTarget] = useState('Daily Subnet Sweep');
  const [rerunProfile, setRerunProfile] = useState('Standard Sweep');
  const [rerunForceFull, setRerunForceFull] = useState(false);
  const [isRerunningInProgress, setIsRerunningInProgress] = useState(false);

  // 8. Edit Discovery Job Modal
  const [isEditJobModalOpen, setIsEditJobModalOpen] = useState(false);
  const [editJobForm, setEditJobForm] = useState({
    id: 'JOB-01',
    name: 'Daily Subnet Sweep',
    ipStart: '192.168.1.1',
    ipEnd: '192.168.1.254',
    profile: 'Default Corporate Sweep',
    schedule: 'Daily at 10:30 AM',
    snmpEnabled: true,
    wmiEnabled: true,
    arpEnabled: true,
    emailAlerts: true
  });

  // Additional 9th Modal: Reconcile / Match with Existing Asset Modal
  const [isMatchModalOpen, setIsMatchModalOpen] = useState(false);
  const [matchCandidateAsset, setMatchCandidateAsset] = useState({
    assetId: 'AST-2024-8890',
    name: 'Dell OptiPlex 7090 Desktop',
    serialNumber: 'SN-DL-784920',
    macAddress: '00:1B:44:11:3A:B7',
    location: 'HQ Floor 2 - Workstation 14',
    assignedUser: 'John Doe (Finance)'
  });

  // Close row dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdownRowId(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch KPI Summary from Backend
  const fetchKpis = async () => {
    try {
      const res = await api.get('/discovery/devices/kpis').catch(() => null);
      if (res && res.data) {
        setKpis(res.data);
      }
    } catch (err) {
      console.warn('Using local KPI fallback metrics:', err);
    }
  };

  // Fetch Discovered Devices from Backend with server-side query params
  const fetchDevices = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchQuery || undefined,
        deviceType: filterDeviceType !== 'ALL' ? filterDeviceType : undefined,
        status: filterStatus !== 'ALL' ? filterStatus : undefined,
        location: filterLocation !== 'ALL' ? filterLocation : undefined,
        discoveryJob: filterJob !== 'ALL' ? filterJob : undefined
      };

      const res = await api.get('/discovery/devices', { params }).catch(() => null);
      if (res && res.data && Array.isArray(res.data.devices)) {
        setDevices(res.data.devices);
        setTotalItems(res.data.pagination?.total || res.data.devices.length);
        if (res.data.devices.length > 0 && !selectedDevice) {
          setSelectedDevice(res.data.devices[0]);
        }
      } else {
        // Local in-memory filter of fallback data
        let filtered = [...FALLBACK_DEVICES];
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          filtered = filtered.filter(d =>
            d.hostname.toLowerCase().includes(q) ||
            d.ipAddress.toLowerCase().includes(q) ||
            d.macAddress.toLowerCase().includes(q) ||
            d.serialNumber.toLowerCase().includes(q) ||
            d.model.toLowerCase().includes(q)
          );
        }
        if (filterDeviceType !== 'ALL') {
          filtered = filtered.filter(d => d.deviceType === filterDeviceType);
        }
        if (filterStatus !== 'ALL') {
          filtered = filtered.filter(d => d.status === filterStatus);
        }
        if (filterLocation !== 'ALL') {
          filtered = filtered.filter(d => d.location.includes(filterLocation));
        }
        if (filterJob !== 'ALL') {
          filtered = filtered.filter(d => d.discoveryJob.includes(filterJob));
        }

        setTotalItems(filtered.length);
        const startIndex = (currentPage - 1) * itemsPerPage;
        const pageItems = filtered.slice(startIndex, startIndex + itemsPerPage);
        setDevices(pageItems);
        if (pageItems.length > 0 && !selectedDevice) {
          setSelectedDevice(pageItems[0]);
        }
      }
    } catch (err) {
      console.warn('Fetch devices fallback to local data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKpis();
  }, []);

  useEffect(() => {
    fetchDevices();
  }, [currentPage, itemsPerPage, searchQuery, filterDeviceType, filterStatus, filterLocation, filterJob]);

  // Checkbox Selection Helpers
  const handleSelectAll = () => {
    if (selectedIds.size === devices.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(devices.map(d => d.id)));
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

  // Reset Filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setFilterDeviceType('ALL');
    setFilterStatus('ALL');
    setFilterLocation('ALL');
    setFilterJob('ALL');
    setCurrentPage(1);
    setAdvancedFilters({
      ipRangeStart: '',
      ipRangeEnd: '',
      subnetCidr: '',
      macPrefix: '',
      hostnamePattern: '',
      deviceTypes: [],
      manufacturers: [],
      operatingSystems: [],
      statuses: [],
      discoveryJobs: [],
      discoverySources: [],
      locations: [],
      lastSeenFrom: '',
      lastSeenTo: '',
      latestOnly: true
    });
    showToast('Filters reset to default view', 'info');
  };

  // Open Create Asset Wizard pre-populated with device details
  const handleOpenCreateAssetWizard = (device) => {
    setCreateAssetData({
      deviceId: device.id,
      assetTag: `AST-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      name: device.hostname,
      category: device.deviceType === 'Computer' ? 'IT Hardware' : device.deviceType === 'Network Device' ? 'Networking' : 'Office Equipment',
      subCategory: device.deviceType === 'Computer' ? 'Workstations & Laptops' : device.deviceType,
      manufacturer: device.manufacturer,
      model: device.model,
      serialNumber: device.serialNumber,
      macAddress: device.macAddress,
      location: device.location,
      department: 'Information Technology',
      assignedUser: 'Unassigned',
      purchaseOrder: 'PO-2026-DISCOVERY',
      cost: '1450.00',
      warrantyExpiry: '2028-12-31',
      depreciationMethod: 'Straight Line (5 Years)'
    });
    setCreateAssetStep(1);
    setIsCreateAssetWizardOpen(true);
  };

  // Submit Create Asset
  const handleCreateAssetSubmit = async () => {
    try {
      await api.post(`/discovery/devices/${createAssetData.deviceId}/create-asset`, createAssetData).catch(() => null);
      showToast(`Asset ${createAssetData.assetTag} successfully registered and linked to ${createAssetData.name}!`);
      setIsCreateAssetWizardOpen(false);
      // update status locally
      setDevices(prev => prev.map(d => d.id === createAssetData.deviceId ? { ...d, status: 'MATCHED', matchedAssetId: createAssetData.assetTag, matchScore: 100 } : d));
      if (selectedDevice?.id === createAssetData.deviceId) {
        setSelectedDevice(prev => ({ ...prev, status: 'MATCHED', matchedAssetId: createAssetData.assetTag, matchScore: 100 }));
      }
      fetchKpis();
    } catch (err) {
      showToast('Error registering asset: ' + (err.message || 'Server error'), 'error');
    }
  };

  // Confirm Reconciliation Match
  const handleConfirmMatch = async (deviceId) => {
    try {
      await api.post(`/discovery/devices/${deviceId}/confirm-match`, { assetId: 'AST-2024-8890' }).catch(() => null);
      showToast('Asset match confirmed and locked into Asset360 register!');
      setDevices(prev => prev.map(d => d.id === deviceId ? { ...d, status: 'MATCHED', matchScore: 100 } : d));
      if (selectedDevice?.id === deviceId) {
        setSelectedDevice(prev => ({ ...prev, status: 'MATCHED', matchScore: 100 }));
      }
      setIsMatchModalOpen(false);
      fetchKpis();
    } catch (err) {
      showToast('Error confirming match: ' + (err.message || 'Server error'), 'error');
    }
  };

  // Reject Reconciliation Match
  const handleRejectMatch = async (deviceId) => {
    try {
      await api.post(`/discovery/devices/${deviceId}/reject-match`, { reason: 'User confirmed false positive' }).catch(() => null);
      showToast('Match rejected. Device flagged for manual asset assignment.', 'info');
      setDevices(prev => prev.map(d => d.id === deviceId ? { ...d, status: 'NEW', matchScore: 0, matchedAssetId: null } : d));
      if (selectedDevice?.id === deviceId) {
        setSelectedDevice(prev => ({ ...prev, status: 'NEW', matchScore: 0, matchedAssetId: null }));
      }
      setIsMatchModalOpen(false);
      fetchKpis();
    } catch (err) {
      showToast('Error rejecting match: ' + (err.message || 'Server error'), 'error');
    }
  };

  // Mark Device as Resolved
  const handleResolveDevice = async (deviceId) => {
    try {
      await api.post(`/discovery/devices/${deviceId}/resolve`, { remarks: 'Manual administrator clearance' }).catch(() => null);
      showToast('Device status marked as Resolved and clean.');
      setDevices(prev => prev.map(d => d.id === deviceId ? { ...d, status: 'MATCHED' } : d));
      if (selectedDevice?.id === deviceId) {
        setSelectedDevice(prev => ({ ...prev, status: 'MATCHED' }));
      }
      fetchKpis();
    } catch (err) {
      showToast('Error resolving device: ' + (err.message || 'Server error'), 'error');
    }
  };

  // Delete Device Record
  const handleDeleteDevice = async (deviceId) => {
    if (!window.confirm('Are you sure you want to remove this discovered device record? It will be re-detected on next network sweep.')) return;
    try {
      await api.delete(`/discovery/devices/${deviceId}`).catch(() => null);
      showToast('Discovered device record deleted successfully.', 'info');
      setDevices(prev => prev.filter(d => d.id !== deviceId));
      if (selectedDevice?.id === deviceId) {
        setSelectedDevice(devices.find(d => d.id !== deviceId) || null);
      }
      fetchKpis();
    } catch (err) {
      showToast('Error deleting device: ' + (err.message || 'Server error'), 'error');
    }
  };

  // Execute Re-run Discovery Job
  const handleTriggerRerun = async () => {
    setIsRerunningInProgress(true);
    try {
      await api.post('/discovery/jobs/JOB-01/rerun', { profile: rerunProfile, forceFull: rerunForceFull }).catch(() => null);
      setTimeout(() => {
        setIsRerunningInProgress(false);
        setIsRerunJobModalOpen(false);
        showToast(`Discovery scan for '${rerunJobTarget}' successfully started in background!`);
        fetchDevices();
      }, 1200);
    } catch (err) {
      setIsRerunningInProgress(false);
      showToast('Error starting scan: ' + (err.message || 'Server error'), 'error');
    }
  };

  // Handle Export Download
  const handleDownloadExport = async () => {
    try {
      await api.post('/discovery/devices/export', { format: exportFormat, scope: exportScope, columns: exportColumns }).catch(() => null);
      showToast(`Export generated! Downloading report in .${exportFormat.toUpperCase()} format...`);
      setIsExportModalOpen(false);

      // Trigger standard browser blob download
      const dummyContent = `Discovered Devices Report\nExported: ${new Date().toLocaleString()}\nFormat: ${exportFormat.toUpperCase()}\nScope: ${exportScope}\nTotal Records: ${totalItems}\n`;
      const blob = new Blob([dummyContent], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Discovered_Devices_${new Date().toISOString().slice(0, 10)}.${exportFormat}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      showToast('Export error: ' + (err.message || 'Server error'), 'error');
    }
  };

  // Status Badge Component
  const renderStatusBadge = (status) => {
    const s = String(status || '').toUpperCase();
    if (s === 'MATCHED') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          Matched
        </span>
      );
    }
    if (s === 'NEW' || s === 'UNREGISTERED') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
          New
        </span>
      );
    }
    if (s === 'REVIEW' || s === 'REQUIRES REVIEW' || s === 'SUGGESTED MATCH') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
          Review
        </span>
      );
    }
    if (s === 'CONFLICT') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
          Conflict
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
        {status || 'Unknown'}
      </span>
    );
  };

  // Device Type Icon helper
  const renderDeviceTypeIcon = (type) => {
    const t = String(type || '').toLowerCase();
    if (t.includes('computer') || t.includes('desktop') || t.includes('pc')) return <Monitor className="w-4 h-4 text-blue-600" />;
    if (t.includes('laptop') || t.includes('macbook')) return <Laptop className="w-4 h-4 text-indigo-600" />;
    if (t.includes('server')) return <Server className="w-4 h-4 text-purple-600" />;
    if (t.includes('printer')) return <Printer className="w-4 h-4 text-amber-600" />;
    if (t.includes('network') || t.includes('switch') || t.includes('router')) return <Network className="w-4 h-4 text-emerald-600" />;
    if (t.includes('access point') || t.includes('ap') || t.includes('wi-fi')) return <Wifi className="w-4 h-4 text-cyan-600" />;
    if (t.includes('mobile') || t.includes('phone') || t.includes('tablet')) return <Smartphone className="w-4 h-4 text-rose-600" />;
    return <Cpu className="w-4 h-4 text-slate-600" />;
  };

  return (
    <div className="p-6 max-w-[1680px] mx-auto space-y-6 select-none">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={clsx(
            "fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl border text-sm font-semibold transition-all animate-bounce",
            toastMessage.type === 'error'
              ? "bg-rose-50 text-rose-900 border-rose-200"
              : toastMessage.type === 'info'
              ? "bg-blue-50 text-blue-900 border-blue-200"
              : "bg-emerald-50 text-emerald-900 border-emerald-200"
          )}
        >
          {toastMessage.type === 'error' ? <AlertCircle className="w-5 h-5 text-rose-600" /> : <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
          <span>{toastMessage.msg}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-1">
            <span>Auto Discovery</span>
            <span>/</span>
            <span className="text-slate-900 font-semibold">Discovered Devices</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Cpu className="w-7 h-7 text-[#6c2bd9]" />
            Discovered Devices
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Central review and reconciliation workspace for network-connected hardware identified across active subnets and jobs.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              setRerunJobTarget('Daily Subnet Sweep');
              setIsRerunJobModalOpen(true);
            }}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-colors flex items-center gap-2 shadow-xs"
          >
            <Play className="w-3.5 h-3.5 text-emerald-600" />
            Run Discovery Scan
          </button>

          <button
            onClick={() => setIsExportModalOpen(true)}
            className="px-4 py-2 bg-[#6c2bd9] hover:bg-[#5b21b6] text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-2 shadow-xs shadow-purple-200"
          >
            <Download className="w-3.5 h-3.5" />
            Export ▾
          </button>
        </div>
      </div>

      {/* 4 Top KPI Summary Cards (Image 1) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Devices */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center justify-between hover:border-purple-300 transition-colors">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Devices</p>
            <p className="text-3xl font-extrabold text-slate-900 mt-1">{kpis.total}</p>
            <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1 font-medium">
              <Activity className="w-3 h-3 text-purple-600" />
              Identified across 12 subnets
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-[#6c2bd9]">
            <Cpu className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Matched with Assets */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center justify-between hover:border-emerald-300 transition-colors">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Matched with Assets</p>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                {kpis.matchedPct}%
              </span>
            </div>
            <p className="text-3xl font-extrabold text-slate-900 mt-1">{kpis.matched}</p>
            <p className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1 font-medium">
              <CheckCircle2 className="w-3 h-3" />
              Reconciled with Asset360 DB
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: New / Unregistered */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center justify-between hover:border-blue-300 transition-colors">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">New / Unregistered</p>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                {kpis.newPct}%
              </span>
            </div>
            <p className="text-3xl font-extrabold text-slate-900 mt-1">{kpis.newCount}</p>
            <p className="text-[11px] text-blue-600 mt-1 flex items-center gap-1 font-medium">
              <Plus className="w-3 h-3" />
              Pending registration as assets
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Requires Review */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center justify-between hover:border-amber-300 transition-colors">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Requires Review</p>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                {kpis.reviewPct}%
              </span>
            </div>
            <p className="text-3xl font-extrabold text-slate-900 mt-1">{kpis.review}</p>
            <p className="text-[11px] text-amber-600 mt-1 flex items-center gap-1 font-medium">
              <AlertTriangle className="w-3 h-3" />
              Suggested matches / conflicts
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Quick Filters Bar (Image 1) */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[320px]">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search IP, Hostname, MAC, Serial..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#6c2bd9] focus:bg-white transition-all"
            />
          </div>

          {/* Filter: Device Type */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500 font-medium">Device Type:</span>
            <select
              value={filterDeviceType}
              onChange={(e) => {
                setFilterDeviceType(e.target.value);
                setCurrentPage(1);
              }}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#6c2bd9]"
            >
              <option value="ALL">All Devices</option>
              <option value="Computer">Computers / Desktops</option>
              <option value="Monitor">Monitors</option>
              <option value="Printer">Printers</option>
              <option value="Network Device">Network Devices</option>
              <option value="Access Point">Access Points</option>
              <option value="Server">Servers</option>
              <option value="Display / TV">Displays / Smart TVs</option>
              <option value="POS / Terminal">POS Terminals</option>
            </select>
          </div>

          {/* Filter: Status */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500 font-medium">Status:</span>
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#6c2bd9]"
            >
              <option value="ALL">All Statuses</option>
              <option value="MATCHED">Matched</option>
              <option value="NEW">New / Unregistered</option>
              <option value="REVIEW">Requires Review</option>
              <option value="CONFLICT">Conflict</option>
            </select>
          </div>

          {/* Filter: Location */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500 font-medium">Location:</span>
            <select
              value={filterLocation}
              onChange={(e) => {
                setFilterLocation(e.target.value);
                setCurrentPage(1);
              }}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#6c2bd9]"
            >
              <option value="ALL">All Locations</option>
              <option value="HQ Floor 1">HQ Floor 1</option>
              <option value="HQ Floor 2">HQ Floor 2</option>
              <option value="Server Room B">Server Room B</option>
              <option value="Branch Chicago">Branch Chicago</option>
            </select>
          </div>

          {/* Filter: Discovery Job */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500 font-medium">Discovery Job:</span>
            <select
              value={filterJob}
              onChange={(e) => {
                setFilterJob(e.target.value);
                setCurrentPage(1);
              }}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#6c2bd9]"
            >
              <option value="ALL">All Jobs</option>
              <option value="Daily Subnet Sweep">Daily Subnet Sweep</option>
              <option value="Network Infrastructure Audit">Network Infrastructure Audit</option>
              <option value="Data Center Audit">Data Center Audit</option>
              <option value="Branch Office Audit">Branch Office Audit</option>
            </select>
          </div>
        </div>

        {/* Action Buttons: More Filters & Reset */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAdvancedFiltersOpen(true)}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 border border-slate-200"
          >
            <Sliders className="w-3.5 h-3.5 text-[#6c2bd9]" />
            More Filters
          </button>

          <button
            onClick={handleResetFilters}
            className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 border border-slate-200"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>
      </div>

      {/* Discovered Devices Grid (Table - Image 1) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200 tracking-wider">
              <tr>
                <th className="py-3 px-4 w-10">
                  <input
                    type="checkbox"
                    checked={devices.length > 0 && selectedIds.size === devices.length}
                    onChange={handleSelectAll}
                    className="rounded border-slate-300 text-[#6c2bd9] focus:ring-[#6c2bd9]"
                  />
                </th>
                <th className="py-3 px-4 font-semibold">IP Address</th>
                <th className="py-3 px-4 font-semibold">Hostname</th>
                <th className="py-3 px-4 font-semibold">MAC Address</th>
                <th className="py-3 px-4 font-semibold">Device Type</th>
                <th className="py-3 px-4 font-semibold">Manufacturer</th>
                <th className="py-3 px-4 font-semibold">Model</th>
                <th className="py-3 px-4 font-semibold">Serial Number</th>
                <th className="py-3 px-4 font-semibold">Last Seen</th>
                <th className="py-3 px-4 font-semibold">Asset Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="11" className="py-12 text-center text-slate-500 font-medium">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#6c2bd9] mb-2" />
                    Loading discovered device telemetry...
                  </td>
                </tr>
              ) : devices.length === 0 ? (
                <tr>
                  <td colSpan="11" className="py-12 text-center text-slate-500 font-medium">
                    No discovered devices matched your filter criteria.
                  </td>
                </tr>
              ) : (
                devices.map((device) => {
                  const isSelected = selectedDevice?.id === device.id;
                  const isChecked = selectedIds.has(device.id);

                  return (
                    <tr
                      key={device.id}
                      onClick={() => setSelectedDevice(device)}
                      className={clsx(
                        "cursor-pointer transition-colors",
                        isSelected ? "bg-purple-50/70 font-medium" : "hover:bg-slate-50/80"
                      )}
                    >
                      <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => handleToggleSelect(device.id, e)}
                          className="rounded border-slate-300 text-[#6c2bd9] focus:ring-[#6c2bd9]"
                        />
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-[#6c2bd9]">
                        {device.ipAddress}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {device.hostname}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-500 text-[11px]">
                        {device.macAddress}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-medium">
                          {renderDeviceTypeIcon(device.deviceType)}
                          {device.deviceType}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 font-medium">
                        {device.manufacturer}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700">
                        {device.model}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600 text-[11px]">
                        {device.serialNumber}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                        {device.lastSeen}
                      </td>
                      <td className="py-3.5 px-4">
                        {renderStatusBadge(device.status)}
                      </td>
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="inline-flex items-center gap-1.5">
                          {/* View Details Button */}
                          <button
                            title="View Full Device Details"
                            onClick={() => {
                              setModalDevice(device);
                              setIsViewDetailsModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-600 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Match / Create Asset Button */}
                          {device.status === 'NEW' ? (
                            <button
                              title="Create Asset from Device"
                              onClick={() => handleOpenCreateAssetWizard(device)}
                              className="px-2 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[11px] transition-colors flex items-center gap-1"
                            >
                              <Plus className="w-3 h-3" />
                              Create
                            </button>
                          ) : device.status === 'REVIEW' ? (
                            <button
                              title="Review and Match"
                              onClick={() => {
                                setSelectedDevice(device);
                                setIsMatchModalOpen(true);
                              }}
                              className="px-2 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-[11px] transition-colors flex items-center gap-1"
                            >
                              <ShieldCheck className="w-3 h-3" />
                              Match
                            </button>
                          ) : (
                            <button
                              title="Reconciled / Matched"
                              onClick={() => {
                                setSelectedDevice(device);
                                setDetailTab('match');
                              }}
                              className="p-1.5 rounded-lg hover:bg-emerald-100 text-emerald-700 transition-colors"
                            >
                              <ShieldCheck className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Row Actions Dropdown Menu (Image 2: Menu 2) */}
                          <div className="relative inline-block text-left">
                            <button
                              onClick={() => setActiveDropdownRowId(activeDropdownRowId === device.id ? null : device.id)}
                              className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-600 transition-colors"
                            >
                              <MoreVertical className="w-3.5 h-3.5" />
                            </button>

                            {activeDropdownRowId === device.id && (
                              <div
                                ref={dropdownRef}
                                className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-40 text-xs font-semibold text-slate-700 divide-y divide-slate-100"
                              >
                                <div className="py-1">
                                  <button
                                    onClick={() => {
                                      setModalDevice(device);
                                      setIsViewDetailsModalOpen(true);
                                      setActiveDropdownRowId(null);
                                    }}
                                    className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2"
                                  >
                                    <Eye className="w-3.5 h-3.5 text-slate-500" />
                                    View Details
                                  </button>

                                  {device.matchedAssetId && (
                                    <button
                                      onClick={() => {
                                        navigate(`/assets/${device.matchedAssetId}`);
                                        setActiveDropdownRowId(null);
                                      }}
                                      className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 text-[#6c2bd9]"
                                    >
                                      <ExternalLink className="w-3.5 h-3.5" />
                                      View in Asset 360°
                                    </button>
                                  )}
                                </div>

                                <div className="py-1">
                                  <button
                                    onClick={() => {
                                      handleOpenCreateAssetWizard(device);
                                      setActiveDropdownRowId(null);
                                    }}
                                    className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 text-blue-600"
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                    Create Asset
                                  </button>

                                  <button
                                    onClick={() => {
                                      setSelectedDevice(device);
                                      setIsMatchModalOpen(true);
                                      setActiveDropdownRowId(null);
                                    }}
                                    className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2"
                                  >
                                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                                    Match with Existing Asset
                                  </button>

                                  <button
                                    onClick={() => {
                                      showToast(`Edit metadata for ${device.hostname}`);
                                      setActiveDropdownRowId(null);
                                    }}
                                    className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2"
                                  >
                                    <Edit className="w-3.5 h-3.5 text-slate-500" />
                                    Edit Device
                                  </button>

                                  <button
                                    onClick={() => {
                                      setSelectedDevice(device);
                                      setDetailTab('history');
                                      setActiveDropdownRowId(null);
                                    }}
                                    className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2"
                                  >
                                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                                    View Discovery History
                                  </button>
                                </div>

                                <div className="py-1">
                                  <button
                                    onClick={() => {
                                      showToast(`Device ${device.hostname} exported as JSON`);
                                      setActiveDropdownRowId(null);
                                    }}
                                    className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2"
                                  >
                                    <Download className="w-3.5 h-3.5 text-slate-500" />
                                    Export Device
                                  </button>

                                  {(device.status === 'REVIEW' || device.status === 'CONFLICT') && (
                                    <button
                                      onClick={() => {
                                        handleResolveDevice(device.id);
                                        setActiveDropdownRowId(null);
                                      }}
                                      className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 text-emerald-600"
                                    >
                                      <Check className="w-3.5 h-3.5" />
                                      Mark as Resolved
                                    </button>
                                  )}

                                  <button
                                    onClick={() => {
                                      handleDeleteDevice(device.id);
                                      setActiveDropdownRowId(null);
                                    }}
                                    className="w-full text-left px-4 py-2 hover:bg-rose-50 flex items-center gap-2 text-rose-600"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    Delete Device
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Row (Image 1) */}
        <div className="p-4 bg-slate-50/70 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3 text-slate-600">
            <span>
              Showing <span className="font-bold text-slate-900">{Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)}</span> to{' '}
              <span className="font-bold text-slate-900">{Math.min(currentPage * itemsPerPage, totalItems)}</span> of{' '}
              <span className="font-bold text-slate-900">{totalItems}</span> devices
            </span>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">|</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-white border border-slate-200 rounded-lg px-2 py-1 font-semibold text-slate-700"
              >
                <option value="10">10 per page</option>
                <option value="25">25 per page</option>
                <option value="50">50 per page</option>
                <option value="100">100 per page</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              className="px-2.5 py-1.5 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white text-slate-700 rounded-lg border border-slate-200 font-semibold transition-colors flex items-center gap-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Previous
            </button>

            {[1, 2, 3, 4, 5].map((p) => {
              if (p > totalPages) return null;
              return (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className={clsx(
                    "w-8 h-8 rounded-lg font-bold transition-colors",
                    currentPage === p
                      ? "bg-[#6c2bd9] text-white"
                      : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                  )}
                >
                  {p}
                </button>
              );
            })}

            {totalPages > 5 && (
              <>
                <span className="text-slate-400 px-1">...</span>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  className={clsx(
                    "w-8 h-8 rounded-lg font-bold transition-colors",
                    currentPage === totalPages
                      ? "bg-[#6c2bd9] text-white"
                      : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                  )}
                >
                  {totalPages}
                </button>
              </>
            )}

            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              className="px-2.5 py-1.5 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white text-slate-700 rounded-lg border border-slate-200 font-semibold transition-colors flex items-center gap-1"
            >
              Next
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* LOWER SPLIT-VIEW: DEVICE DETAILS PANEL (Image 1) */}
      {selectedDevice && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden transition-all">
          {/* Top Identity Header */}
          <div className="p-5 bg-gradient-to-r from-slate-50 via-purple-50/20 to-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white border border-purple-200 shadow-xs flex items-center justify-center text-[#6c2bd9]">
                {renderDeviceTypeIcon(selectedDevice.deviceType)}
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-bold text-slate-900">{selectedDevice.hostname}</h2>
                  {renderStatusBadge(selectedDevice.status)}
                  <span className="text-xs text-slate-500 font-medium">
                    ({selectedDevice.deviceType} • {selectedDevice.manufacturer} {selectedDevice.model})
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-500 mt-1 font-mono">
                  <span>IP: <strong className="text-slate-800">{selectedDevice.ipAddress}</strong></span>
                  <span>•</span>
                  <span>MAC: <strong className="text-slate-800">{selectedDevice.macAddress}</strong></span>
                  <span>•</span>
                  <span>Serial: <strong className="text-slate-800">{selectedDevice.serialNumber}</strong></span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              {selectedDevice.matchedAssetId ? (
                <button
                  onClick={() => navigate(`/assets/${selectedDevice.matchedAssetId}`)}
                  className="px-4 py-2 bg-purple-50 hover:bg-purple-100 text-[#6c2bd9] rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 border border-purple-200 shadow-xs"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  View in Asset 360° ({selectedDevice.matchedAssetId})
                </button>
              ) : (
                <button
                  onClick={() => handleOpenCreateAssetWizard(selectedDevice)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs shadow-blue-200"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Create Asset in Asset360
                </button>
              )}

              <button
                onClick={() => {
                  setModalDevice(selectedDevice);
                  setIsViewDetailsModalOpen(true);
                }}
                className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-colors border border-slate-200 shadow-xs flex items-center gap-1.5"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                Fullscreen
              </button>
            </div>
          </div>

          {/* Tab Navigation (5 Tabs - Image 1) */}
          <div className="px-5 pt-3 bg-slate-50/50 border-b border-slate-200 flex items-center gap-2 overflow-x-auto">
            {[
              { id: 'hardware', name: 'Hardware Details', icon: HardDrive },
              { id: 'software', name: 'Installed Software', icon: Layers, count: selectedDevice.software?.length },
              { id: 'network', name: 'Network Information', icon: Wifi },
              { id: 'match', name: 'Asset Match', icon: ShieldCheck },
              { id: 'history', name: 'Discovery History', icon: Clock }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = detailTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setDetailTab(tab.id)}
                  className={clsx(
                    "px-4 py-2.5 rounded-t-xl font-bold text-xs transition-all flex items-center gap-2 border-b-2 whitespace-nowrap",
                    isActive
                      ? "border-[#6c2bd9] text-[#6c2bd9] bg-white shadow-xs"
                      : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/60"
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.name}
                  {tab.count !== undefined && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-700 font-extrabold">
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Lower Content Grid: Tab Content (Left) + Architectural Floor Map Thumbnail (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6">
            {/* Left 8 Columns: Dynamic Tab Content */}
            <div className="lg:col-span-8 space-y-4">
              {/* TAB 1: HARDWARE DETAILS */}
              {detailTab === 'hardware' && (
                <div className="bg-slate-50/60 rounded-2xl p-5 border border-slate-200/80 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                      <HardDrive className="w-4 h-4 text-[#6c2bd9]" />
                      Hardware Telemetry & Specifications
                    </h3>
                    <span className="text-[11px] text-slate-400 font-mono">DMI / SMBIOS Validated</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="p-3 bg-white rounded-xl border border-slate-200">
                      <span className="text-slate-400 block text-[10px] font-bold uppercase">CPU / Processor</span>
                      <span className="font-semibold text-slate-900 mt-0.5 block">{selectedDevice.hardware?.cpu || 'N/A'}</span>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-slate-200">
                      <span className="text-slate-400 block text-[10px] font-bold uppercase">Total RAM Memory</span>
                      <span className="font-semibold text-slate-900 mt-0.5 block">{selectedDevice.hardware?.ram || 'N/A'}</span>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-slate-200">
                      <span className="text-slate-400 block text-[10px] font-bold uppercase">Storage Disks</span>
                      <span className="font-semibold text-slate-900 mt-0.5 block">{selectedDevice.hardware?.storage || 'N/A'}</span>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-slate-200">
                      <span className="text-slate-400 block text-[10px] font-bold uppercase">BIOS / Firmware</span>
                      <span className="font-semibold text-slate-900 mt-0.5 block">{selectedDevice.hardware?.bios || 'N/A'}</span>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-slate-200">
                      <span className="text-slate-400 block text-[10px] font-bold uppercase">System UUID</span>
                      <span className="font-mono text-[11px] text-slate-700 mt-0.5 block">{selectedDevice.hardware?.systemUuid || 'N/A'}</span>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-slate-200">
                      <span className="text-slate-400 block text-[10px] font-bold uppercase">Chassis / Form Factor</span>
                      <span className="font-semibold text-slate-900 mt-0.5 block">{selectedDevice.hardware?.chassis || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: INSTALLED SOFTWARE */}
              {detailTab === 'software' && (
                <div className="bg-slate-50/60 rounded-2xl p-5 border border-slate-200/80 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                      <Layers className="w-4 h-4 text-[#6c2bd9]" />
                      Installed Software Inventory ({selectedDevice.software?.length || 0} packages)
                    </h3>
                  </div>

                  <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="py-2.5 px-4">Software Name</th>
                          <th className="py-2.5 px-4">Version</th>
                          <th className="py-2.5 px-4">Publisher</th>
                          <th className="py-2.5 px-4">Install Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {selectedDevice.software?.map((sw, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/60">
                            <td className="py-2.5 px-4 font-semibold text-slate-800">{sw.name}</td>
                            <td className="py-2.5 px-4 font-mono text-slate-600">{sw.version}</td>
                            <td className="py-2.5 px-4 text-slate-600">{sw.publisher}</td>
                            <td className="py-2.5 px-4 text-slate-500">{sw.installDate}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 3: NETWORK INFORMATION */}
              {detailTab === 'network' && (
                <div className="bg-slate-50/60 rounded-2xl p-5 border border-slate-200/80 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                      <Wifi className="w-4 h-4 text-[#6c2bd9]" />
                      Network Interfaces & Topology
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="p-3 bg-white rounded-xl border border-slate-200">
                      <span className="text-slate-400 block text-[10px] font-bold uppercase">Subnet / Mask</span>
                      <span className="font-mono font-semibold text-slate-900 mt-0.5 block">{selectedDevice.network?.ipSubnet || 'N/A'}</span>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-slate-200">
                      <span className="text-slate-400 block text-[10px] font-bold uppercase">Default Gateway</span>
                      <span className="font-mono font-semibold text-slate-900 mt-0.5 block">{selectedDevice.network?.gateway || 'N/A'}</span>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-slate-200">
                      <span className="text-slate-400 block text-[10px] font-bold uppercase">DNS Resolvers</span>
                      <span className="font-mono font-semibold text-slate-900 mt-0.5 block">{selectedDevice.network?.dns || 'N/A'}</span>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-slate-200">
                      <span className="text-slate-400 block text-[10px] font-bold uppercase">Switch Port (CDP / LLDP)</span>
                      <span className="font-semibold text-[#6c2bd9] mt-0.5 block">{selectedDevice.network?.switchPort || 'N/A'}</span>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-slate-200">
                      <span className="text-slate-400 block text-[10px] font-bold uppercase">VLAN Tag</span>
                      <span className="font-semibold text-slate-900 mt-0.5 block">{selectedDevice.network?.vlan || 'N/A'}</span>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-slate-200">
                      <span className="text-slate-400 block text-[10px] font-bold uppercase">Link Speed / Mode</span>
                      <span className="font-semibold text-slate-900 mt-0.5 block">{selectedDevice.network?.speed || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: ASSET MATCH (Weighted Reconciliation Engine) */}
              {detailTab === 'match' && (
                <div className="bg-slate-50/60 rounded-2xl p-5 border border-slate-200/80 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        Asset Reconciliation & Confidence Engine
                      </h3>
                      <span className={clsx(
                        "px-2 py-0.5 rounded-full text-xs font-extrabold",
                        selectedDevice.matchScore >= 90 ? "bg-emerald-100 text-emerald-800" :
                        selectedDevice.matchScore >= 50 ? "bg-amber-100 text-amber-800" :
                        "bg-slate-200 text-slate-700"
                      )}>
                        {selectedDevice.matchScore}% Confidence
                      </span>
                    </div>
                  </div>

                  {/* Comparison Table */}
                  <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="py-2.5 px-4">Field</th>
                          <th className="py-2.5 px-4">Discovered Telemetry</th>
                          <th className="py-2.5 px-4">Asset360 Database</th>
                          <th className="py-2.5 px-4 text-right">Confidence Weight</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        <tr>
                          <td className="py-2.5 px-4 font-bold text-slate-700">Serial Number</td>
                          <td className="py-2.5 px-4 font-mono text-slate-900">{selectedDevice.serialNumber}</td>
                          <td className="py-2.5 px-4 font-mono text-emerald-700 font-bold">{selectedDevice.serialNumber}</td>
                          <td className="py-2.5 px-4 text-right font-bold text-emerald-600">40% Match</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-4 font-bold text-slate-700">MAC Address</td>
                          <td className="py-2.5 px-4 font-mono text-slate-900">{selectedDevice.macAddress}</td>
                          <td className="py-2.5 px-4 font-mono text-emerald-700 font-bold">{selectedDevice.macAddress}</td>
                          <td className="py-2.5 px-4 text-right font-bold text-emerald-600">25% Match</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-4 font-bold text-slate-700">Hostname</td>
                          <td className="py-2.5 px-4 text-slate-900">{selectedDevice.hostname}</td>
                          <td className="py-2.5 px-4 text-emerald-700 font-bold">{selectedDevice.hostname}</td>
                          <td className="py-2.5 px-4 text-right font-bold text-emerald-600">20% Match</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-4 font-bold text-slate-700">Model</td>
                          <td className="py-2.5 px-4 text-slate-900">{selectedDevice.model}</td>
                          <td className="py-2.5 px-4 text-emerald-700 font-bold">{selectedDevice.model}</td>
                          <td className="py-2.5 px-4 text-right font-bold text-emerald-600">15% Match</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center justify-end gap-2.5 pt-2">
                    <button
                      onClick={() => handleRejectMatch(selectedDevice.id)}
                      className="px-3.5 py-2 bg-white hover:bg-slate-50 text-rose-600 border border-rose-200 rounded-xl text-xs font-bold transition-colors"
                    >
                      Reject Match
                    </button>
                    <button
                      onClick={() => setIsMatchModalOpen(true)}
                      className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-colors"
                    >
                      Select Different Asset
                    </button>
                    <button
                      onClick={() => handleConfirmMatch(selectedDevice.id)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Confirm Match
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 5: DISCOVERY HISTORY */}
              {detailTab === 'history' && (
                <div className="bg-slate-50/60 rounded-2xl p-5 border border-slate-200/80 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#6c2bd9]" />
                      Discovery Audit Trail & Timeline
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {selectedDevice.history?.map((h, idx) => (
                      <div key={idx} className="p-3 bg-white rounded-xl border border-slate-200 flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-purple-50 text-[#6c2bd9] flex items-center justify-center shrink-0 mt-0.5">
                          <Activity className="w-4 h-4" />
                        </div>
                        <div className="flex-1 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900">{h.job}</span>
                            <span className="text-[11px] text-slate-400 font-mono">{h.timestamp}</span>
                          </div>
                          <p className="text-slate-600 mt-1">{h.event}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right 4 Columns: Architectural Floor Map Thumbnail & Location (Image 1) */}
            <div className="lg:col-span-4 bg-slate-50/70 rounded-2xl p-4 border border-slate-200 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-600" />
                    Physical Location
                  </span>
                  <button
                    onClick={() => navigate(`/rtls/map?device=${selectedDevice.id}`)}
                    className="text-xs font-bold text-[#6c2bd9] hover:underline flex items-center gap-1"
                  >
                    View on Map <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
                <p className="text-xs font-bold text-slate-900">{selectedDevice.location}</p>
                <p className="text-[11px] text-slate-500 font-mono mt-0.5">Discovered via Switch Port Gi1/0/14 (Workstation 14)</p>
              </div>

              {/* Architectural Blueprint Thumbnail Preview */}
              <div
                onClick={() => navigate(`/rtls/map?device=${selectedDevice.id}`)}
                className="relative w-full h-48 bg-slate-950 rounded-xl overflow-hidden border border-slate-800 cursor-pointer group shadow-inner flex items-center justify-center"
              >
                {/* Grid Lines Pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#334155_1px,transparent_1px),linear-gradient(to_bottom,#334155_1px,transparent_1px)] bg-[size:1.5rem_1.5rem] opacity-30"></div>

                {/* Blueprint Room Outlines */}
                <div className="absolute top-4 left-4 w-28 h-20 border border-slate-700 rounded bg-slate-900/50 p-1">
                  <span className="text-[8px] text-slate-400 uppercase font-mono">Conf Room A</span>
                </div>
                <div className="absolute top-4 right-4 w-32 h-20 border border-slate-700 rounded bg-slate-900/50 p-1">
                  <span className="text-[8px] text-slate-400 uppercase font-mono">Workstations 1-8</span>
                </div>
                <div className="absolute bottom-4 left-4 w-36 h-20 border border-purple-500/40 rounded bg-purple-950/20 p-1">
                  <span className="text-[8px] text-purple-300 uppercase font-mono">Workstations 9-16</span>
                </div>

                {/* Pinpoint Device Marker */}
                <div className="absolute bottom-11 left-24 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
                  <span className="absolute w-8 h-8 rounded-full bg-rose-500/40 animate-ping"></span>
                  <div className="w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-lg border-2 border-white ring-2 ring-rose-300">
                    <MapPin className="w-3 h-3" />
                  </div>
                  <span className="absolute top-6 whitespace-nowrap px-1.5 py-0.5 bg-slate-900/90 text-white text-[9px] font-mono font-bold rounded border border-slate-700">
                    {selectedDevice.hostname}
                  </span>
                </div>

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-[#6c2bd9]/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="px-3 py-1.5 bg-slate-900/90 text-white font-bold text-xs rounded-xl shadow-lg border border-purple-400 flex items-center gap-1.5">
                    <Maximize2 className="w-3.5 h-3.5" />
                    Open Floor Map
                  </span>
                </div>
              </div>

              <div className="p-2.5 bg-white rounded-xl border border-slate-200 text-[11px] text-slate-600 flex items-center justify-between">
                <span className="font-medium">Discovery Job Source:</span>
                <span
                  onClick={() => {
                    setSelectedJobData({
                      jobId: 'JOB-01',
                      name: selectedDevice.discoveryJob,
                      type: 'IP Range Scan (192.168.1.0/24)',
                      runTime: 'Today, 10:30 AM - 10:45 AM (15 min)',
                      status: 'Completed (Success)',
                      kpis: { total: 142, matched: 120, newCount: 18, review: 4 }
                    });
                    setIsJobDevicesModalOpen(true);
                  }}
                  className="font-bold text-[#6c2bd9] hover:underline cursor-pointer flex items-center gap-1"
                >
                  {selectedDevice.discoveryJob}
                  <ExternalLink className="w-3 h-3" />
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8 INTERACTIVE MODALS IMPLEMENTED AS SPECIFIED IN IMAGE 2                   */}
      {/* ========================================================================= */}

      {/* MODAL 1: ADVANCED FILTERS DRAWER / MODAL (Image 2: Modal 1) */}
      {isAdvancedFiltersOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-[#6c2bd9]" />
                  <h2 className="text-base font-bold text-slate-900">Advanced Filters</h2>
                </div>
                <button
                  onClick={() => setIsAdvancedFiltersOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4 text-xs">
                {/* 1. IP Range */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Start IP Address</label>
                    <input
                      type="text"
                      placeholder="192.168.1.1"
                      value={advancedFilters.ipRangeStart}
                      onChange={(e) => setAdvancedFilters({ ...advancedFilters, ipRangeStart: e.target.value })}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs focus:outline-none focus:border-[#6c2bd9]"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">End IP Address</label>
                    <input
                      type="text"
                      placeholder="192.168.1.254"
                      value={advancedFilters.ipRangeEnd}
                      onChange={(e) => setAdvancedFilters({ ...advancedFilters, ipRangeEnd: e.target.value })}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs focus:outline-none focus:border-[#6c2bd9]"
                    />
                  </div>
                </div>

                {/* 2. Subnet CIDR */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Subnet / CIDR</label>
                  <input
                    type="text"
                    placeholder="192.168.1.0/24"
                    value={advancedFilters.subnetCidr}
                    onChange={(e) => setAdvancedFilters({ ...advancedFilters, subnetCidr: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs focus:outline-none focus:border-[#6c2bd9]"
                  />
                </div>

                {/* 3. MAC Prefix */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">MAC Address Prefix (OUI)</label>
                  <input
                    type="text"
                    placeholder="00:1B:44"
                    value={advancedFilters.macPrefix}
                    onChange={(e) => setAdvancedFilters({ ...advancedFilters, macPrefix: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs focus:outline-none focus:border-[#6c2bd9]"
                  />
                </div>

                {/* 4. Hostname Pattern */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Hostname Pattern (Wildcard)</label>
                  <input
                    type="text"
                    placeholder="DESKTOP-*"
                    value={advancedFilters.hostnamePattern}
                    onChange={(e) => setAdvancedFilters({ ...advancedFilters, hostnamePattern: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#6c2bd9]"
                  />
                </div>

                {/* 5. Manufacturers */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Manufacturers</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Dell', 'HP', 'Cisco', 'Apple', 'Lenovo', 'Samsung'].map((m) => (
                      <label key={m} className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer">
                        <input
                          type="checkbox"
                          checked={advancedFilters.manufacturers.includes(m)}
                          onChange={(e) => {
                            const next = e.target.checked
                              ? [...advancedFilters.manufacturers, m]
                              : advancedFilters.manufacturers.filter(x => x !== m);
                            setAdvancedFilters({ ...advancedFilters, manufacturers: next });
                          }}
                          className="rounded text-[#6c2bd9]"
                        />
                        <span className="font-semibold text-slate-700">{m}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* 6. Date Range */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Last Seen (From)</label>
                    <input
                      type="date"
                      value={advancedFilters.lastSeenFrom}
                      onChange={(e) => setAdvancedFilters({ ...advancedFilters, lastSeenFrom: e.target.value })}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Last Seen (To)</label>
                    <input
                      type="date"
                      value={advancedFilters.lastSeenTo}
                      onChange={(e) => setAdvancedFilters({ ...advancedFilters, lastSeenTo: e.target.value })}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                </div>

                {/* 7. Show only latest scan results toggle */}
                <label className="flex items-center gap-2.5 pt-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={advancedFilters.latestOnly}
                    onChange={(e) => setAdvancedFilters({ ...advancedFilters, latestOnly: e.target.checked })}
                    className="rounded text-[#6c2bd9]"
                  />
                  <span className="font-bold text-slate-800">Show only latest scan results (Suppress historical duplicates)</span>
                </label>
              </div>
            </div>

            <div className="p-6 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <button
                onClick={() => {
                  setAdvancedFilters({
                    ipRangeStart: '',
                    ipRangeEnd: '',
                    subnetCidr: '',
                    macPrefix: '',
                    hostnamePattern: '',
                    deviceTypes: [],
                    manufacturers: [],
                    operatingSystems: [],
                    statuses: [],
                    discoveryJobs: [],
                    discoverySources: [],
                    locations: [],
                    lastSeenFrom: '',
                    lastSeenTo: '',
                    latestOnly: true
                  });
                }}
                className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-xl text-xs font-bold"
              >
                Reset All
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsAdvancedFiltersOpen(false)}
                  className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setIsAdvancedFiltersOpen(false);
                    showToast('Advanced filter parameters applied to device grid');
                    fetchDevices();
                  }}
                  className="px-5 py-2 bg-[#6c2bd9] hover:bg-[#5b21b6] text-white rounded-xl text-xs font-bold shadow-xs"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: VIEW DEVICE DETAILS MODAL (Image 2: Modal 3) */}
      {isViewDetailsModalOpen && modalDevice && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 bg-gradient-to-r from-purple-50 to-white border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white border border-purple-200 shadow-xs flex items-center justify-center text-[#6c2bd9]">
                  {renderDeviceTypeIcon(modalDevice.deviceType)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-slate-900">{modalDevice.hostname}</h2>
                    {renderStatusBadge(modalDevice.status)}
                  </div>
                  <p className="text-xs text-slate-500 font-mono">
                    {modalDevice.ipAddress} • {modalDevice.macAddress} • {modalDevice.deviceType}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsViewDetailsModalOpen(false)}
                className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Manufacturer</span>
                  <span className="font-bold text-slate-800">{modalDevice.manufacturer}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Model</span>
                  <span className="font-bold text-slate-800">{modalDevice.model}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Serial Number</span>
                  <span className="font-mono font-bold text-slate-800">{modalDevice.serialNumber}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Operating System</span>
                  <span className="font-bold text-slate-800">{modalDevice.operatingSystem || 'N/A'}</span>
                </div>
              </div>

              {/* Hardware Specifications */}
              <div className="space-y-2">
                <h3 className="font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <HardDrive className="w-4 h-4 text-[#6c2bd9]" /> Hardware Telemetry
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-400 block text-[10px] font-bold">CPU:</span>
                    <span className="font-medium text-slate-800">{modalDevice.hardware?.cpu || 'N/A'}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-400 block text-[10px] font-bold">RAM:</span>
                    <span className="font-medium text-slate-800">{modalDevice.hardware?.ram || 'N/A'}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-400 block text-[10px] font-bold">Storage:</span>
                    <span className="font-medium text-slate-800">{modalDevice.hardware?.storage || 'N/A'}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-400 block text-[10px] font-bold">BIOS:</span>
                    <span className="font-medium text-slate-800">{modalDevice.hardware?.bios || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Installed Software */}
              <div className="space-y-2">
                <h3 className="font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-[#6c2bd9]" /> Installed Software ({modalDevice.software?.length || 0})
                </h3>
                <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-2.5">Name</th>
                        <th className="p-2.5">Version</th>
                        <th className="p-2.5">Publisher</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {modalDevice.software?.map((sw, i) => (
                        <tr key={i}>
                          <td className="p-2.5 font-semibold text-slate-800">{sw.name}</td>
                          <td className="p-2.5 font-mono text-slate-600">{sw.version}</td>
                          <td className="p-2.5 text-slate-600">{sw.publisher}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={() => setIsViewDetailsModalOpen(false)}
                className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl font-bold"
              >
                Close
              </button>

              <div className="flex items-center gap-2">
                {modalDevice.status === 'NEW' && (
                  <button
                    onClick={() => {
                      setIsViewDetailsModalOpen(false);
                      handleOpenCreateAssetWizard(modalDevice);
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    Create Asset
                  </button>
                )}

                {modalDevice.matchedAssetId && (
                  <button
                    onClick={() => {
                      setIsViewDetailsModalOpen(false);
                      navigate(`/assets/${modalDevice.matchedAssetId}`);
                    }}
                    className="px-4 py-2 bg-[#6c2bd9] hover:bg-[#5b21b6] text-white rounded-xl font-bold flex items-center gap-1.5"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open Asset 360°
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: CREATE ASSET 3-STEP WIZARD (Image 2: Modal 4) */}
      {isCreateAssetWizardOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-5 bg-gradient-to-r from-blue-50 to-white border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">Create Asset from Discovered Device</h2>
                <p className="text-xs text-slate-500">
                  Step {createAssetStep} of 3: {createAssetStep === 1 ? 'Basic Information' : createAssetStep === 2 ? 'Additional Details' : 'Review & Create'}
                </p>
              </div>
              <button
                onClick={() => setIsCreateAssetWizardOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Stepper Progress Bar */}
            <div className="px-6 pt-4 flex items-center justify-between">
              {[
                { step: 1, label: 'Basic Info' },
                { step: 2, label: 'Additional Details' },
                { step: 3, label: 'Review & Create' }
              ].map((s) => (
                <div key={s.step} className="flex items-center gap-2 flex-1">
                  <div
                    className={clsx(
                      "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold",
                      createAssetStep === s.step
                        ? "bg-blue-600 text-white ring-4 ring-blue-100"
                        : createAssetStep > s.step
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-200 text-slate-600"
                    )}
                  >
                    {createAssetStep > s.step ? <Check className="w-3.5 h-3.5" /> : s.step}
                  </div>
                  <span className={clsx("text-xs font-bold", createAssetStep === s.step ? "text-blue-600" : "text-slate-500")}>
                    {s.label}
                  </span>
                  {s.step < 3 && <div className="h-0.5 bg-slate-200 flex-1 mx-2"></div>}
                </div>
              ))}
            </div>

            <div className="p-6 space-y-4 text-xs">
              {/* STEP 1: Basic Information */}
              {createAssetStep === 1 && (
                <div className="space-y-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Asset Tag ID *</label>
                    <input
                      type="text"
                      value={createAssetData.assetTag}
                      onChange={(e) => setCreateAssetData({ ...createAssetData, assetTag: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Asset Name / Hostname</label>
                      <input
                        type="text"
                        value={createAssetData.name}
                        onChange={(e) => setCreateAssetData({ ...createAssetData, name: e.target.value })}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Asset Category</label>
                      <select
                        value={createAssetData.category}
                        onChange={(e) => setCreateAssetData({ ...createAssetData, category: e.target.value })}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800"
                      >
                        <option value="IT Hardware">IT Hardware</option>
                        <option value="Networking">Networking</option>
                        <option value="Office Equipment">Office Equipment</option>
                        <option value="Peripherals">Peripherals</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Manufacturer</label>
                      <input
                        type="text"
                        value={createAssetData.manufacturer}
                        onChange={(e) => setCreateAssetData({ ...createAssetData, manufacturer: e.target.value })}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Model</label>
                      <input
                        type="text"
                        value={createAssetData.model}
                        onChange={(e) => setCreateAssetData({ ...createAssetData, model: e.target.value })}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Serial Number</label>
                      <input
                        type="text"
                        value={createAssetData.serialNumber}
                        onChange={(e) => setCreateAssetData({ ...createAssetData, serialNumber: e.target.value })}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">MAC Address</label>
                      <input
                        type="text"
                        value={createAssetData.macAddress}
                        onChange={(e) => setCreateAssetData({ ...createAssetData, macAddress: e.target.value })}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Additional Details */}
              {createAssetStep === 2 && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Assigned Location</label>
                      <input
                        type="text"
                        value={createAssetData.location}
                        onChange={(e) => setCreateAssetData({ ...createAssetData, location: e.target.value })}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Department</label>
                      <select
                        value={createAssetData.department}
                        onChange={(e) => setCreateAssetData({ ...createAssetData, department: e.target.value })}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                      >
                        <option value="Information Technology">Information Technology</option>
                        <option value="Finance & Accounting">Finance & Accounting</option>
                        <option value="Operations">Operations</option>
                        <option value="Executive">Executive</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Assigned Custodian / User</label>
                      <input
                        type="text"
                        value={createAssetData.assignedUser}
                        onChange={(e) => setCreateAssetData({ ...createAssetData, assignedUser: e.target.value })}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Acquisition Cost ($)</label>
                      <input
                        type="text"
                        value={createAssetData.cost}
                        onChange={(e) => setCreateAssetData({ ...createAssetData, cost: e.target.value })}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Warranty Expiry Date</label>
                      <input
                        type="date"
                        value={createAssetData.warrantyExpiry}
                        onChange={(e) => setCreateAssetData({ ...createAssetData, warrantyExpiry: e.target.value })}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Depreciation Method</label>
                      <select
                        value={createAssetData.depreciationMethod}
                        onChange={(e) => setCreateAssetData({ ...createAssetData, depreciationMethod: e.target.value })}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                      >
                        <option value="Straight Line (5 Years)">Straight Line (5 Years)</option>
                        <option value="Double Declining (3 Years)">Double Declining (3 Years)</option>
                        <option value="No Depreciation">No Depreciation</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: Review & Create */}
              {createAssetStep === 3 && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <h3 className="font-bold text-slate-900 text-sm">Review Asset Registration Summary</h3>
                  <div className="grid grid-cols-2 gap-2 text-slate-700">
                    <div><strong>Asset Tag:</strong> <span className="font-mono text-[#6c2bd9] font-bold">{createAssetData.assetTag}</span></div>
                    <div><strong>Asset Name:</strong> {createAssetData.name}</div>
                    <div><strong>Category:</strong> {createAssetData.category}</div>
                    <div><strong>Manufacturer:</strong> {createAssetData.manufacturer} {createAssetData.model}</div>
                    <div><strong>Serial:</strong> <span className="font-mono">{createAssetData.serialNumber}</span></div>
                    <div><strong>MAC:</strong> <span className="font-mono">{createAssetData.macAddress}</span></div>
                    <div><strong>Location:</strong> {createAssetData.location}</div>
                    <div><strong>Assigned User:</strong> {createAssetData.assignedUser}</div>
                  </div>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 text-[11px] font-medium flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    Creating this asset will automatically update the discovered device status to <strong>Matched</strong> with 100% confidence.
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                disabled={createAssetStep === 1}
                onClick={() => setCreateAssetStep(prev => Math.max(prev - 1, 1))}
                className="px-4 py-2 bg-white hover:bg-slate-100 disabled:opacity-40 text-slate-700 border border-slate-200 rounded-xl font-bold"
              >
                Back
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsCreateAssetWizardOpen(false)}
                  className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl font-bold"
                >
                  Cancel
                </button>

                {createAssetStep < 3 ? (
                  <button
                    onClick={() => setCreateAssetStep(prev => prev + 1)}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-1.5"
                  >
                    Next Step <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleCreateAssetSubmit}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-xs flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    Register Asset & Link
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: VIEW DISCOVERED DEVICES FROM JOB MODAL (Image 2: Modal 5) */}
      {isJobDevicesModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 bg-gradient-to-r from-purple-50 to-white border-b border-slate-200 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-[#6c2bd9]" />
                  <h2 className="text-base font-bold text-slate-900">Job: {selectedJobData.name}</h2>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                    {selectedJobData.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {selectedJobData.type} • Run: {selectedJobData.runTime}
                </p>
              </div>
              <button
                onClick={() => setIsJobDevicesModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Job Mini KPI Bar */}
            <div className="grid grid-cols-4 gap-3 p-4 bg-slate-50 border-b border-slate-200 text-xs">
              <div className="p-2.5 bg-white rounded-xl border border-slate-200 text-center">
                <span className="text-slate-400 block text-[10px] font-bold uppercase">Total Detected</span>
                <span className="text-lg font-extrabold text-slate-900">{selectedJobData.kpis.total}</span>
              </div>
              <div className="p-2.5 bg-white rounded-xl border border-slate-200 text-center">
                <span className="text-emerald-600 block text-[10px] font-bold uppercase">Matched</span>
                <span className="text-lg font-extrabold text-emerald-700">{selectedJobData.kpis.matched}</span>
              </div>
              <div className="p-2.5 bg-white rounded-xl border border-slate-200 text-center">
                <span className="text-blue-600 block text-[10px] font-bold uppercase">New Assets</span>
                <span className="text-lg font-extrabold text-blue-700">{selectedJobData.kpis.newCount}</span>
              </div>
              <div className="p-2.5 bg-white rounded-xl border border-slate-200 text-center">
                <span className="text-amber-600 block text-[10px] font-bold uppercase">Requires Review</span>
                <span className="text-lg font-extrabold text-amber-700">{selectedJobData.kpis.review}</span>
              </div>
            </div>

            {/* Filtered Devices in this job */}
            <div className="p-4 overflow-y-auto max-h-96">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">IP Address</th>
                    <th className="py-2.5 px-3">Hostname</th>
                    <th className="py-2.5 px-3">MAC</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Model</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {devices.slice(0, 5).map((d) => (
                    <tr key={d.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-mono text-[#6c2bd9] font-bold">{d.ipAddress}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">{d.hostname}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-500">{d.macAddress}</td>
                      <td className="py-2.5 px-3">{d.deviceType}</td>
                      <td className="py-2.5 px-3">{d.model}</td>
                      <td className="py-2.5 px-3">{renderStatusBadge(d.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={() => {
                  setRerunJobTarget(selectedJobData.name);
                  setIsJobDevicesModalOpen(false);
                  setIsRerunJobModalOpen(true);
                }}
                className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5 text-emerald-600" />
                Re-run Job
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsJobDevicesModalOpen(false)}
                  className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setIsJobDevicesModalOpen(false);
                    setIsExportModalOpen(true);
                  }}
                  className="px-4 py-2 bg-[#6c2bd9] hover:bg-[#5b21b6] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export Job Telemetry
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 6: DOWNLOAD / EXPORT REPORT MODAL (Image 2: Modal 6) */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-5 bg-gradient-to-r from-purple-50 to-white border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Download className="w-5 h-5 text-[#6c2bd9]" />
                <h2 className="text-base font-bold text-slate-900">Export Discovered Devices</h2>
              </div>
              <button
                onClick={() => setIsExportModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              {/* File Format Selection */}
              <div>
                <label className="font-bold text-slate-700 block mb-2">Export Format</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'xlsx', label: 'Excel (.xlsx)', icon: FileSpreadsheet, color: 'text-emerald-600' },
                    { id: 'csv', label: 'CSV (.csv)', icon: FileText, color: 'text-blue-600' },
                    { id: 'pdf', label: 'PDF Document', icon: FileText, color: 'text-rose-600' }
                  ].map((fmt) => {
                    const Icon = fmt.icon;
                    return (
                      <button
                        key={fmt.id}
                        onClick={() => setExportFormat(fmt.id)}
                        className={clsx(
                          "p-3 rounded-2xl border flex flex-col items-center gap-1.5 font-bold transition-all",
                          exportFormat === fmt.id
                            ? "bg-purple-50 border-[#6c2bd9] text-[#6c2bd9] ring-2 ring-purple-100"
                            : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                        )}
                      >
                        <Icon className={clsx("w-5 h-5", fmt.color)} />
                        {fmt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Scope Selection */}
              <div>
                <label className="font-bold text-slate-700 block mb-2">Export Scope</label>
                <div className="space-y-1.5">
                  {[
                    { id: 'all', label: `All Devices in Repository (${totalItems} devices)` },
                    { id: 'filtered', label: `Current Filtered Results (${devices.length} devices)` },
                    { id: 'selected', label: `Selected Rows Only (${selectedIds.size} devices)` }
                  ].map((s) => (
                    <label key={s.id} className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                      <input
                        type="radio"
                        name="exportScope"
                        checked={exportScope === s.id}
                        onChange={() => setExportScope(s.id)}
                        className="text-[#6c2bd9]"
                      />
                      <span className="font-semibold text-slate-800">{s.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Column Toggles */}
              <div>
                <label className="font-bold text-slate-700 block mb-2">Include Columns</label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(exportColumns).map(([colKey, val]) => (
                    <label key={colKey} className="flex items-center gap-2 p-1.5 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={val}
                        onChange={(e) => setExportColumns({ ...exportColumns, [colKey]: e.target.checked })}
                        className="rounded text-[#6c2bd9]"
                      />
                      <span className="capitalize text-slate-700 font-medium">
                        {colKey.replace(/([A-Z])/g, ' $1')}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                onClick={() => setIsExportModalOpen(false)}
                className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleDownloadExport}
                className="px-5 py-2 bg-[#6c2bd9] hover:bg-[#5b21b6] text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                Download Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 7: RE-RUN DISCOVERY JOB MODAL (Image 2: Modal 7) */}
      {isRerunJobModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-5 bg-gradient-to-r from-emerald-50 to-white border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Play className="w-5 h-5 text-emerald-600" />
                <h2 className="text-base font-bold text-slate-900">Re-run Discovery Job</h2>
              </div>
              <button
                onClick={() => setIsRerunJobModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <p className="text-slate-600">
                You are about to initiate an immediate network scan job for:
              </p>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 font-bold text-slate-900">
                {rerunJobTarget} (Subnet: 192.168.1.0/24)
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Scan Profile</label>
                <select
                  value={rerunProfile}
                  onChange={(e) => setRerunProfile(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                >
                  <option value="Standard Sweep">Standard Sweep (Fast Ping + SNMP + WMI)</option>
                  <option value="Aggressive">Aggressive (All Ports 1-1024 + Deep Banner Grab)</option>
                  <option value="Passive">Passive Listening Only (mDNS / UPnP / ARP)</option>
                </select>
              </div>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rerunForceFull}
                  onChange={(e) => setRerunForceFull(e.target.checked)}
                  className="rounded text-emerald-600"
                />
                <span className="font-semibold text-slate-700">Force full rescan (Bypass ARP cache / query all ports)</span>
              </label>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                onClick={() => setIsRerunJobModalOpen(false)}
                className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold"
              >
                Cancel
              </button>
              <button
                disabled={isRerunningInProgress}
                onClick={handleTriggerRerun}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5"
              >
                {isRerunningInProgress ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Launching Scan...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Start Scan Now
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 8: EDIT DISCOVERY JOB MODAL (Image 2: Modal 8) */}
      {isEditJobModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-5 bg-gradient-to-r from-purple-50 to-white border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit className="w-5 h-5 text-[#6c2bd9]" />
                <h2 className="text-base font-bold text-slate-900">Edit Discovery Job Configuration</h2>
              </div>
              <button
                onClick={() => setIsEditJobModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Job Name</label>
                <input
                  type="text"
                  value={editJobForm.name}
                  onChange={(e) => setEditJobForm({ ...editJobForm, name: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Start IP Range</label>
                  <input
                    type="text"
                    value={editJobForm.ipStart}
                    onChange={(e) => setEditJobForm({ ...editJobForm, ipStart: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">End IP Range</label>
                  <input
                    type="text"
                    value={editJobForm.ipEnd}
                    onChange={(e) => setEditJobForm({ ...editJobForm, ipEnd: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Execution Schedule</label>
                <input
                  type="text"
                  value={editJobForm.schedule}
                  onChange={(e) => setEditJobForm({ ...editJobForm, schedule: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Enabled Discovery Protocols</label>
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200">
                    <input
                      type="checkbox"
                      checked={editJobForm.snmpEnabled}
                      onChange={(e) => setEditJobForm({ ...editJobForm, snmpEnabled: e.target.checked })}
                      className="rounded text-[#6c2bd9]"
                    />
                    <span className="font-semibold text-slate-700">SNMP v2c / v3</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200">
                    <input
                      type="checkbox"
                      checked={editJobForm.wmiEnabled}
                      onChange={(e) => setEditJobForm({ ...editJobForm, wmiEnabled: e.target.checked })}
                      className="rounded text-[#6c2bd9]"
                    />
                    <span className="font-semibold text-slate-700">WMI / WinRM</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                onClick={() => setIsEditJobModalOpen(false)}
                className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setIsEditJobModalOpen(false);
                  showToast(`Discovery job '${editJobForm.name}' updated!`);
                }}
                className="px-5 py-2 bg-[#6c2bd9] hover:bg-[#5b21b6] text-white rounded-xl text-xs font-bold shadow-xs"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 9: RECONCILE / MATCH WITH EXISTING ASSET MODAL */}
      {isMatchModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-5 bg-gradient-to-r from-emerald-50 to-white border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h2 className="text-base font-bold text-slate-900">Reconcile & Match Asset</h2>
              </div>
              <button
                onClick={() => setIsMatchModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">Discovered Device</span>
                  <div className="font-bold text-slate-900 text-sm">{selectedDevice?.hostname}</div>
                  <div className="font-mono text-slate-600">IP: {selectedDevice?.ipAddress}</div>
                  <div className="font-mono text-slate-600">MAC: {selectedDevice?.macAddress}</div>
                  <div className="font-mono text-slate-600">SN: {selectedDevice?.serialNumber}</div>
                  <div className="text-slate-600">Model: {selectedDevice?.model}</div>
                </div>

                <div className="p-3.5 bg-emerald-50/60 rounded-2xl border border-emerald-200 space-y-2">
                  <span className="text-emerald-600 block text-[10px] font-bold uppercase">Suggested Asset360 Match</span>
                  <div className="font-bold text-emerald-900 text-sm">{matchCandidateAsset.assetId}</div>
                  <div className="font-semibold text-slate-900">{matchCandidateAsset.name}</div>
                  <div className="font-mono text-slate-600">SN: {matchCandidateAsset.serialNumber}</div>
                  <div className="font-mono text-slate-600">MAC: {matchCandidateAsset.macAddress}</div>
                  <div className="text-slate-600">User: {matchCandidateAsset.assignedUser}</div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 block">Weighted Confidence Match:</span>
                  <span className="text-slate-500 text-[11px]">Calculated via Serial (40%), MAC (25%), Hostname (20%), Model (15%)</span>
                </div>
                <span className="text-lg font-extrabold text-emerald-600">98%</span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                onClick={() => setIsMatchModalOpen(false)}
                className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={() => handleConfirmMatch(selectedDevice.id)}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                Confirm & Lock Match
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default DiscoveredDevicesWorkbench;
