import prisma from '../../config/prisma.js';
import { isSqlServerConnected } from '../../config/db.js';

// Pre-seeded comprehensive 245 Discovered Devices dataset
const SEED_DEVICES = [
  {
    id: 'DISC-001',
    ipAddress: '192.168.1.10',
    hostname: 'DESKTOP-001',
    macAddress: '00:1A:2B:3C:4D:5E',
    deviceType: 'Computer',
    manufacturer: 'Dell',
    model: 'OptiPlex 7020',
    serialNumber: '7CD1234',
    lastSeen: '2026-09-10T10:24:00Z',
    firstSeen: '2026-09-05T08:15:00Z',
    assetStatus: 'Matched',
    linkedAssetId: 'AS-2026-00121',
    discoverySource: 'IP_SCANNER',
    discoveryJob: 'HQ Network Scan',
    location: 'Dubai HQ - IT Department',
    operatingSystem: 'Windows 11 Pro 23H2',
    domain: 'ASSET360',
    dns: '192.168.1.1',
    subnet: '192.168.1.0/24',
    gateway: '192.168.1.1',
    vlan: 'VLAN-10 (IT Operations)',
    switchPort: 'SW-CORE-01:Gi1/0/14',
    cpu: 'Intel Core i5-12500 (3.0 GHz)',
    ram: '16 GB',
    storage: '512 GB SSD',
    biosVersion: 'Dell 1.18.0',
    systemUuid: '4C4C4544-0050-3410-804C-C7C04F323334',
    chassisType: 'Desktop',
    assetTagFound: 'N/A',
    matchConfidence: 96,
    matchRule: 'SERIAL_AND_MAC_EXACT',
    installedSoftware: [
      { name: 'Windows 11 Enterprise', version: '23H2 (Build 22631)', publisher: 'Microsoft Corporation', installDate: '2026-01-15' },
      { name: 'Microsoft 365 Apps', version: '16.0.17328', publisher: 'Microsoft Corporation', installDate: '2026-01-16' },
      { name: 'CrowdStrike Falcon Sensor', version: '7.10.18004', publisher: 'CrowdStrike, Inc.', installDate: '2026-01-15' },
      { name: 'Google Chrome', version: '128.0.6613.85', publisher: 'Google LLC', installDate: '2026-02-01' }
    ],
    history: [
      { timestamp: '2026-09-10T10:24:00Z', job: 'HQ Network Scan', status: 'Matched', ip: '192.168.1.10', change: 'Online • Verified' },
      { timestamp: '2026-09-08T14:30:00Z', job: 'Mid-Week IP Sweep', status: 'Matched', ip: '192.168.1.10', change: 'IP unchanged' },
      { timestamp: '2026-09-05T08:15:00Z', job: 'HQ Network Scan', status: 'Suggested', ip: '192.168.1.10', change: 'First Discovered' }
    ]
  },
  {
    id: 'DISC-002',
    ipAddress: '192.168.1.11',
    hostname: 'MONITOR-245',
    macAddress: '00:1A:2B:3C:4D:6F',
    deviceType: 'Monitor',
    manufacturer: 'Dell',
    model: 'P2422H',
    serialNumber: 'CN0D4F2',
    lastSeen: '2026-09-10T10:23:00Z',
    firstSeen: '2026-09-05T08:15:00Z',
    assetStatus: 'Matched',
    linkedAssetId: 'AS-2026-00122',
    discoverySource: 'SNMP',
    discoveryJob: 'HQ Network Scan',
    location: 'Dubai HQ - IT Department',
    operatingSystem: 'Firmware v1.0.4',
    domain: 'ASSET360',
    dns: '192.168.1.1',
    subnet: '192.168.1.0/24',
    gateway: '192.168.1.1',
    vlan: 'VLAN-10 (IT Operations)',
    switchPort: 'SW-CORE-01:Gi1/0/15',
    cpu: 'Embedded ARM Cortex-M4',
    ram: '512 MB',
    storage: '256 MB Flash',
    biosVersion: 'M3T101',
    systemUuid: 'DELL-P2422H-CN0D4F2-881',
    chassisType: 'Display Monitor',
    assetTagFound: 'TAG-9022',
    matchConfidence: 94,
    matchRule: 'SERIAL_EXACT',
    installedSoftware: [
      { name: 'Dell Display Manager', version: '2.1.0.45', publisher: 'Dell Technologies', installDate: '2026-01-20' }
    ],
    history: [
      { timestamp: '2026-09-10T10:23:00Z', job: 'HQ Network Scan', status: 'Matched', ip: '192.168.1.11', change: 'Online' }
    ]
  },
  {
    id: 'DISC-003',
    ipAddress: '192.168.1.20',
    hostname: 'PRN-HQ-01',
    macAddress: '00:1A:2B:3C:4D:7A',
    deviceType: 'Printer',
    manufacturer: 'HP',
    model: 'LaserJet Pro',
    serialNumber: 'VNB3K91',
    lastSeen: '2026-09-10T10:20:00Z',
    firstSeen: '2026-09-10T09:00:00Z',
    assetStatus: 'New',
    linkedAssetId: null,
    discoverySource: 'SNMP',
    discoveryJob: 'HQ Network Scan',
    location: 'Dubai HQ - Copy Center',
    operatingSystem: 'HP FutureSmart 5.2',
    domain: 'ASSET360',
    dns: '192.168.1.1',
    subnet: '192.168.1.0/24',
    gateway: '192.168.1.1',
    vlan: 'VLAN-20 (Printers)',
    switchPort: 'SW-CORE-01:Gi1/0/22',
    cpu: '1.2 GHz Dual-Core',
    ram: '2 GB',
    storage: '16 GB eMMC',
    biosVersion: 'HPFS-5.2.0',
    systemUuid: 'HP-PRN-VNB3K91-992',
    chassisType: 'Network Printer',
    assetTagFound: 'N/A',
    matchConfidence: 0,
    matchRule: 'UNREGISTERED_DEVICE',
    installedSoftware: [
      { name: 'HP Embedded Web Server', version: '5.2', publisher: 'HP Inc.', installDate: '2026-01-10' },
      { name: 'AirPrint Service', version: '2.0', publisher: 'Apple Inc.', installDate: '2026-01-10' }
    ],
    history: [
      { timestamp: '2026-09-10T10:20:00Z', job: 'HQ Network Scan', status: 'New', ip: '192.168.1.20', change: 'New device detected on network' }
    ]
  },
  {
    id: 'DISC-004',
    ipAddress: '192.168.1.30',
    hostname: 'SW-CORE-01',
    macAddress: '00:1A:2B:3C:4D:8B',
    deviceType: 'Network Device',
    manufacturer: 'Cisco',
    model: 'C9300',
    serialNumber: 'FD02456',
    lastSeen: '2026-09-10T10:18:00Z',
    firstSeen: '2026-08-01T00:00:00Z',
    assetStatus: 'Matched',
    linkedAssetId: 'AS-2026-00045',
    discoverySource: 'SSH',
    discoveryJob: 'HQ Network Scan',
    location: 'Dubai HQ - Server Room 101',
    operatingSystem: 'Cisco IOS-XE 17.9.4',
    domain: 'ASSET360',
    dns: '192.168.1.1',
    subnet: '192.168.1.0/24',
    gateway: '192.168.1.1',
    vlan: 'VLAN-1 (Management)',
    switchPort: 'Uplink Te1/1/1',
    cpu: 'x86 4-Core 1.8 GHz',
    ram: '16 GB DDR4',
    storage: '16 GB Flash',
    biosVersion: 'Cisco ROMMON 17.3',
    systemUuid: 'CISCO-C9300-FD02456-001',
    chassisType: 'Rack Switch 1U',
    assetTagFound: 'TAG-CISCO-01',
    matchConfidence: 98,
    matchRule: 'SERIAL_AND_MAC_EXACT',
    installedSoftware: [
      { name: 'Cisco IOS-XE Universal', version: '17.9.4a', publisher: 'Cisco Systems', installDate: '2025-11-20' }
    ],
    history: [
      { timestamp: '2026-09-10T10:18:00Z', job: 'HQ Network Scan', status: 'Matched', ip: '192.168.1.30', change: 'Core switch healthy' }
    ]
  },
  {
    id: 'DISC-005',
    ipAddress: '192.168.1.45',
    hostname: 'LAPTOP-078',
    macAddress: '00:1A:2B:3C:4D:9C',
    deviceType: 'Computer',
    manufacturer: 'Lenovo',
    model: 'ThinkPad T14',
    serialNumber: 'PF34K2',
    lastSeen: '2026-09-10T10:15:00Z',
    firstSeen: '2026-09-02T11:20:00Z',
    assetStatus: 'Review',
    linkedAssetId: null,
    discoverySource: 'WMI/WinRM',
    discoveryJob: 'HQ Network Scan',
    location: 'Dubai HQ - Finance Floor 2',
    operatingSystem: 'Windows 11 Pro 22H2',
    domain: 'ASSET360',
    dns: '192.168.1.1',
    subnet: '192.168.1.0/24',
    gateway: '192.168.1.1',
    vlan: 'VLAN-30 (Finance)',
    switchPort: 'AP-01 (Wi-Fi 6 SSID: CorpNet)',
    cpu: 'AMD Ryzen 7 PRO 6850U',
    ram: '32 GB LPDDR5',
    storage: '1 TB NVMe SSD',
    biosVersion: 'Lenovo N3MET09W (1.09)',
    systemUuid: 'E803715C-4A51-11ED-BE56-0242AC120002',
    chassisType: 'Notebook',
    assetTagFound: 'N/A',
    matchConfidence: 74,
    matchRule: 'HOSTNAME_FUZZY_MATCH',
    suggestedAsset: {
      assetId: 'AS-2026-00088',
      description: 'Lenovo ThinkPad T14 Gen 3',
      serialNumber: 'PF34K2-GEN3',
      custodian: 'Sarah Jenkins',
      confidence: 74
    },
    installedSoftware: [
      { name: 'SAP GUI for Windows', version: '7.70', publisher: 'SAP SE', installDate: '2026-02-10' },
      { name: 'Microsoft Excel 365', version: '16.0.17328', publisher: 'Microsoft Corporation', installDate: '2026-01-10' }
    ],
    history: [
      { timestamp: '2026-09-10T10:15:00Z', job: 'HQ Network Scan', status: 'Review', ip: '192.168.1.45', change: 'Hostname match with asset AS-2026-00088 requires confirmation' }
    ]
  },
  {
    id: 'DISC-006',
    ipAddress: '192.168.1.50',
    hostname: 'AP-01',
    macAddress: '00:1A:2B:3C:4D:AA',
    deviceType: 'Network Device',
    manufacturer: 'Aruba',
    model: 'AP-515',
    serialNumber: 'CN7G@@',
    lastSeen: '2026-09-10T10:14:00Z',
    firstSeen: '2026-07-15T00:00:00Z',
    assetStatus: 'Matched',
    linkedAssetId: 'AS-2026-00052',
    discoverySource: 'SNMP',
    discoveryJob: 'HQ Network Scan',
    location: 'Dubai HQ - Main Corridor',
    operatingSystem: 'ArubaOS 8.10.0',
    domain: 'ASSET360',
    dns: '192.168.1.1',
    subnet: '192.168.1.0/24',
    gateway: '192.168.1.1',
    vlan: 'VLAN-1 (Management)',
    switchPort: 'SW-CORE-01:Gi1/0/5',
    cpu: 'Qualcomm IPQ8074 4-Core',
    ram: '1 GB',
    storage: '512 MB Flash',
    biosVersion: 'Aruba BootLoader 2.4',
    systemUuid: 'ARUBA-AP515-CN7G00-01',
    chassisType: 'Access Point',
    assetTagFound: 'TAG-WIFI-01',
    matchConfidence: 95,
    matchRule: 'SERIAL_AND_MAC_EXACT',
    installedSoftware: [
      { name: 'Aruba Central Client', version: '2.5.4', publisher: 'HPE Aruba', installDate: '2026-01-01' }
    ],
    history: [
      { timestamp: '2026-09-10T10:14:00Z', job: 'HQ Network Scan', status: 'Matched', ip: '192.168.1.50', change: 'Associated 42 wireless clients' }
    ]
  },
  {
    id: 'DISC-007',
    ipAddress: '192.168.1.60',
    hostname: 'SRV-FILE-01',
    macAddress: '00:1A:2B:3C:4D:BB',
    deviceType: 'Server',
    manufacturer: 'HPE',
    model: 'ProLiant DL380',
    serialNumber: '2M3K91',
    lastSeen: '2026-09-10T10:10:00Z',
    firstSeen: '2026-06-10T00:00:00Z',
    assetStatus: 'Matched',
    linkedAssetId: 'AS-2026-00018',
    discoverySource: 'SSH',
    discoveryJob: 'HQ Network Scan',
    location: 'Dubai HQ - Server Room 101',
    operatingSystem: 'Ubuntu Linux 22.04 LTS',
    domain: 'ASSET360',
    dns: '192.168.1.1',
    subnet: '192.168.1.0/24',
    gateway: '192.168.1.1',
    vlan: 'VLAN-50 (Servers)',
    switchPort: 'SW-CORE-01:Gi1/0/2',
    cpu: '2x Intel Xeon Gold 6330 (56 Cores)',
    ram: '128 GB DDR4 ECC',
    storage: '8x 1.92TB SAS SSD RAID6',
    biosVersion: 'HPE iLO 5 v2.72',
    systemUuid: 'HPE-DL380-2M3K91-G10P',
    chassisType: 'Rackmount 2U',
    assetTagFound: 'TAG-SRV-001',
    matchConfidence: 99,
    matchRule: 'SERIAL_AND_UUID_EXACT',
    installedSoftware: [
      { name: 'Samba File Server', version: '4.15.13', publisher: 'Samba Team', installDate: '2026-01-05' },
      { name: 'Docker Engine', version: '24.0.7', publisher: 'Docker Inc.', installDate: '2026-01-05' },
      { name: 'Prometheus Node Exporter', version: '1.6.1', publisher: 'Prometheus', installDate: '2026-01-05' }
    ],
    history: [
      { timestamp: '2026-09-10T10:10:00Z', job: 'HQ Network Scan', status: 'Matched', ip: '192.168.1.60', change: 'Storage utilization 64%' }
    ]
  },
  {
    id: 'DISC-008',
    ipAddress: '192.168.1.75',
    hostname: 'iPad-01',
    macAddress: '00:1A:2B:3C:4D:CC',
    deviceType: 'Mobile Device',
    manufacturer: 'Apple',
    model: 'iPad Air',
    serialNumber: 'DLX9Q2',
    lastSeen: '2026-09-10T10:08:00Z',
    firstSeen: '2026-09-10T08:00:00Z',
    assetStatus: 'New',
    linkedAssetId: null,
    discoverySource: 'IP_SCANNER',
    discoveryJob: 'HQ Network Scan',
    location: 'Dubai HQ - Reception Lobby',
    operatingSystem: 'iPadOS 17.6.1',
    domain: 'ASSET360',
    dns: '192.168.1.1',
    subnet: '192.168.1.0/24',
    gateway: '192.168.1.1',
    vlan: 'VLAN-100 (Guest/Mobile)',
    switchPort: 'AP-01 (Wi-Fi 6 SSID: CorpGuest)',
    cpu: 'Apple M2 8-Core',
    ram: '8 GB Unified',
    storage: '128 GB',
    biosVersion: 'iBoot-10151.140.4',
    systemUuid: 'APPLE-IPAD-AIR-DLX9Q2',
    chassisType: 'Tablet',
    assetTagFound: 'N/A',
    matchConfidence: 0,
    matchRule: 'UNREGISTERED_DEVICE',
    installedSoftware: [
      { name: 'Visitor Management Kiosk', version: '3.4.1', publisher: 'Sine Technologies', installDate: '2026-09-10' }
    ],
    history: [
      { timestamp: '2026-09-10T10:08:00Z', job: 'HQ Network Scan', status: 'New', ip: '192.168.1.75', change: 'First discovered on guest VLAN' }
    ]
  },
  {
    id: 'DISC-009',
    ipAddress: '192.168.1.90',
    hostname: 'TV-LOBBY',
    macAddress: '00:1A:2B:3C:4D:DD',
    deviceType: 'Display',
    manufacturer: 'Samsung',
    model: 'QE55Q60',
    serialNumber: 'TV8901',
    lastSeen: '2026-09-10T10:05:00Z',
    firstSeen: '2026-08-20T00:00:00Z',
    assetStatus: 'Review',
    linkedAssetId: null,
    discoverySource: 'SNMP',
    discoveryJob: 'HQ Network Scan',
    location: 'Dubai HQ - Ground Floor Lobby',
    operatingSystem: 'Tizen OS 7.0',
    domain: 'ASSET360',
    dns: '192.168.1.1',
    subnet: '192.168.1.0/24',
    gateway: '192.168.1.1',
    vlan: 'VLAN-40 (Signage/AV)',
    switchPort: 'SW-CORE-01:Gi1/0/38',
    cpu: 'Quantum Processor Lite 4K',
    ram: '2.5 GB',
    storage: '8 GB Flash',
    biosVersion: 'T-NKLDEUC-1402.5',
    systemUuid: 'SAMSUNG-QE55-TV8901',
    chassisType: 'Smart Display 55"',
    assetTagFound: 'N/A',
    matchConfidence: 68,
    matchRule: 'MODEL_AND_IP_HEURISTIC',
    suggestedAsset: {
      assetId: 'AS-2026-00095',
      description: 'Samsung 55" 4K Digital Signage Display',
      serialNumber: 'TV8901-SAM',
      custodian: 'Facilities Dept',
      confidence: 68
    },
    installedSoftware: [
      { name: 'Samsung MagicINFO Player', version: '9.0', publisher: 'Samsung Electronics', installDate: '2026-01-10' }
    ],
    history: [
      { timestamp: '2026-09-10T10:05:00Z', job: 'HQ Network Scan', status: 'Review', ip: '192.168.1.90', change: 'Matched against Facilities Asset AS-2026-00095' }
    ]
  },
  {
    id: 'DISC-010',
    ipAddress: '192.168.1.100',
    hostname: 'POS-02',
    macAddress: '00:1A:2B:3C:4D:EE',
    deviceType: 'POS Device',
    manufacturer: 'Zebra',
    model: 'TC52',
    serialNumber: 'ZB55231',
    lastSeen: '2026-09-10T10:01:00Z',
    firstSeen: '2026-09-10T09:40:00Z',
    assetStatus: 'New',
    linkedAssetId: null,
    discoverySource: 'Agent',
    discoveryJob: 'HQ Network Scan',
    location: 'Dubai HQ - Warehouse Store',
    operatingSystem: 'Android 11 Enterprise',
    domain: 'ASSET360',
    dns: '192.168.1.1',
    subnet: '192.168.1.0/24',
    gateway: '192.168.1.1',
    vlan: 'VLAN-60 (Warehouse/RF)',
    switchPort: 'AP-01 (Wi-Fi 6 SSID: WhsScanner)',
    cpu: 'Qualcomm Snapdragon 660 8-Core',
    ram: '4 GB',
    storage: '32 GB eMMC',
    biosVersion: 'Zebra BSP 11-20-18',
    systemUuid: 'ZEBRA-TC52-ZB55231',
    chassisType: 'Handheld Mobile Computer / Barcode Scanner',
    assetTagFound: 'N/A',
    matchConfidence: 0,
    matchRule: 'UNREGISTERED_DEVICE',
    installedSoftware: [
      { name: 'Zebra DataWedge Barcode Service', version: '8.2', publisher: 'Zebra Technologies', installDate: '2026-09-10' },
      { name: 'Asset360 Mobile Scanner Agent', version: '2.4.0', publisher: 'Infotatwaa Corp', installDate: '2026-09-10' }
    ],
    history: [
      { timestamp: '2026-09-10T10:01:00Z', job: 'HQ Network Scan', status: 'New', ip: '192.168.1.100', change: 'New scanner online' }
    ]
  }
];

// Generate additional realistic records to reach 245 total devices as requested
function generateDevicePopulation() {
  const list = [...SEED_DEVICES];
  const types = ['Computer', 'Monitor', 'Printer', 'Network Device', 'Server', 'Mobile Device', 'Display', 'POS Device'];
  const mfrs = {
    Computer: [{ mfr: 'Dell', model: 'OptiPlex 7020' }, { mfr: 'Lenovo', model: 'ThinkPad T14' }, { mfr: 'HP', model: 'EliteBook 840' }, { mfr: 'Apple', model: 'MacBook Pro 14' }],
    Monitor: [{ mfr: 'Dell', model: 'P2422H' }, { mfr: 'LG', model: 'UltraFine 27' }, { mfr: 'Samsung', model: 'ViewFinity S8' }],
    Printer: [{ mfr: 'HP', model: 'LaserJet Pro' }, { mfr: 'Canon', model: 'imageRUNNER' }, { mfr: 'Epson', model: 'WorkForce Pro' }],
    'Network Device': [{ mfr: 'Cisco', model: 'C9300' }, { mfr: 'Aruba', model: 'AP-515' }, { mfr: 'Fortinet', model: 'FortiGate 60F' }],
    Server: [{ mfr: 'HPE', model: 'ProLiant DL380' }, { mfr: 'Dell', model: 'PowerEdge R750' }, { mfr: 'Lenovo', model: 'ThinkSystem SR650' }],
    'Mobile Device': [{ mfr: 'Apple', model: 'iPad Air' }, { mfr: 'Samsung', model: 'Galaxy Tab Active' }],
    Display: [{ mfr: 'Samsung', model: 'QE55Q60' }, { mfr: 'LG', model: 'Commercial Display 65' }],
    'POS Device': [{ mfr: 'Zebra', model: 'TC52' }, { mfr: 'Honeywell', model: 'Dolphin CT60' }]
  };

  const locations = [
    'Dubai HQ - IT Department',
    'Dubai HQ - Server Room 101',
    'Dubai HQ - Finance Floor 2',
    'Dubai HQ - Copy Center',
    'Dubai HQ - Main Corridor',
    'Dubai HQ - Warehouse Store',
    'Dubai HQ - Ground Floor Lobby',
    'San Francisco HQ - Lab 3',
    'London Office - Desk Cluster B'
  ];

  // Distribution: Matched: 198 (81%), New: 32 (13%), Review: 15 (6%) = 245 total
  let idCounter = 11;
  while (list.length < 245) {
    const currentMatched = list.filter((d) => d.assetStatus === 'Matched').length;
    const currentNew = list.filter((d) => d.assetStatus === 'New').length;

    let status = 'Review';
    if (currentMatched < 198) {
      status = 'Matched';
    } else if (currentNew < 32) {
      status = 'New';
    } else {
      status = 'Review';
    }
    const i = list.length;

    const type = types[i % types.length];
    const mfrObj = mfrs[type][i % mfrs[type].length];
    const ip = `192.168.${Math.floor(i / 250) + 1}.${(i % 240) + 10}`;
    const hex = i.toString(16).padStart(2, '0').toUpperCase();
    const mac = `00:1A:2B:3C:${hex.slice(0, 1)}A:${hex}`;
    const sn = `SN-${mfrObj.mfr.slice(0, 3).toUpperCase()}-${Math.floor(10000 + i * 13)}`;
    const hostname = `${type.replace(/\s+/g, '').toUpperCase()}-${String(i + 1).padStart(3, '0')}`;
    const loc = locations[i % locations.length];

    list.push({
      id: `DISC-${String(idCounter++).padStart(3, '0')}`,
      ipAddress: ip,
      hostname,
      macAddress: mac,
      deviceType: type,
      manufacturer: mfrObj.mfr,
      model: mfrObj.model,
      serialNumber: sn,
      lastSeen: new Date(Date.now() - (i % 48) * 3600000).toISOString(),
      firstSeen: new Date(Date.now() - (30 + (i % 60)) * 86400000).toISOString(),
      assetStatus: status,
      linkedAssetId: status === 'Matched' ? `AS-2026-${String(100 + i).padStart(5, '0')}` : null,
      discoverySource: i % 3 === 0 ? 'SNMP' : i % 2 === 0 ? 'IP_SCANNER' : 'WMI/WinRM',
      discoveryJob: i % 4 === 0 ? 'Branch IP Sweep' : 'HQ Network Scan',
      location: loc,
      operatingSystem: type === 'Computer' ? 'Windows 11 Pro 23H2' : type === 'Server' ? 'Red Hat Enterprise Linux 9' : 'Embedded OS',
      domain: 'ASSET360',
      dns: '192.168.1.1',
      subnet: '192.168.1.0/24',
      gateway: '192.168.1.1',
      vlan: `VLAN-${(i % 5) * 10 + 10}`,
      switchPort: `SW-CORE-01:Gi1/0/${(i % 48) + 1}`,
      cpu: type === 'Server' ? '2x Intel Xeon Silver (32 Cores)' : 'Intel Core i5 (6 Cores)',
      ram: type === 'Server' ? '64 GB' : '16 GB',
      storage: type === 'Server' ? '2 TB NVMe' : '512 GB SSD',
      biosVersion: `${mfrObj.mfr} BIOS 2.1.${i % 10}`,
      systemUuid: `UUID-SYS-${mfrObj.mfr}-${sn}`,
      chassisType: type,
      assetTagFound: status === 'Matched' ? `TAG-${String(9000 + i)}` : 'N/A',
      matchConfidence: status === 'Matched' ? 95 : status === 'Review' ? 70 : 0,
      matchRule: status === 'Matched' ? 'SERIAL_AND_MAC_EXACT' : status === 'Review' ? 'HOSTNAME_FUZZY_MATCH' : 'UNREGISTERED_DEVICE',
      suggestedAsset: status === 'Review' ? {
        assetId: `AS-2026-${String(900 + i)}`,
        description: `${mfrObj.mfr} ${mfrObj.model}`,
        serialNumber: sn,
        custodian: 'Unassigned',
        confidence: 70
      } : null,
      installedSoftware: [
        { name: `${mfrObj.mfr} SupportAssistant`, version: '4.1', publisher: mfrObj.mfr, installDate: '2026-01-10' }
      ],
      history: [
        { timestamp: new Date().toISOString(), job: 'HQ Network Scan', status, ip, change: 'Scan record active' }
      ]
    });
  }

  return list;
}

// In-memory master repository for discovery devices and jobs
let discoveryDevicesStore = generateDevicePopulation();

let discoveryJobsStore = [
  {
    id: 'JOB-2026-0001',
    jobName: 'HQ Network Scan',
    discoveryType: 'IP Range Scan',
    ipRange: '192.168.1.0/24',
    profile: 'Default',
    schedule: 'Manual',
    status: 'Completed',
    createdBy: 'John Doe',
    createdOn: '2026-09-08T09:30:00Z',
    startedOn: '2026-09-10T10:24:00Z',
    completedOn: '2026-09-10T10:38:00Z',
    duration: '14m 00s',
    totalDevices: 245,
    matchedCount: 198,
    newCount: 32,
    reviewCount: 15,
    stages: [
      { name: 'Initializing Discovery', status: 'Completed', timestamp: '10:24:02 AM' },
      { name: 'Scanning IP Range', status: 'Completed', timestamp: '10:27:45 AM' },
      { name: 'Identifying Devices', status: 'Completed', timestamp: '10:31:12 AM' },
      { name: 'Collecting Device Details', status: 'Completed', timestamp: '10:34:50 AM' },
      { name: 'Matching with Asset Database', status: 'Completed', timestamp: '10:37:18 AM' },
      { name: 'Generating Report', status: 'Completed', timestamp: '10:38:00 AM' }
    ]
  },
  {
    id: 'JOB-2026-0002',
    jobName: 'Branch Office Scan',
    discoveryType: 'Subnet Ping & SNMP',
    ipRange: '10.0.10.0/24',
    profile: 'Cisco & Server Profile',
    schedule: 'Daily at 02:00 AM',
    status: 'Completed',
    createdBy: 'John Doe',
    createdOn: '2026-09-07T14:10:00Z',
    startedOn: '2026-09-09T02:00:00Z',
    completedOn: '2026-09-09T02:14:00Z',
    duration: '14m 00s',
    totalDevices: 84,
    matchedCount: 78,
    newCount: 4,
    reviewCount: 2,
    stages: [
      { name: 'Initializing Discovery', status: 'Completed', timestamp: '02:00:01 AM' },
      { name: 'Scanning IP Range', status: 'Completed', timestamp: '02:04:12 AM' },
      { name: 'Identifying Devices', status: 'Completed', timestamp: '02:08:33 AM' },
      { name: 'Collecting Device Details', status: 'Completed', timestamp: '02:11:50 AM' },
      { name: 'Matching with Asset Database', status: 'Completed', timestamp: '02:13:20 AM' },
      { name: 'Generating Report', status: 'Completed', timestamp: '02:14:00 AM' }
    ]
  },
  {
    id: 'JOB-2026-0003',
    jobName: 'Data Center Core',
    discoveryType: 'IP Range Scan',
    ipRange: '172.16.0.0/20',
    profile: 'Server Profile',
    schedule: 'Weekly (Sun 01:00 AM)',
    status: 'Completed',
    createdBy: 'Admin User',
    createdOn: '2026-09-01T08:00:00Z',
    startedOn: '2026-09-08T01:00:00Z',
    completedOn: '2026-09-08T01:45:00Z',
    duration: '45m 00s',
    totalDevices: 512,
    matchedCount: 490,
    newCount: 12,
    reviewCount: 10,
    stages: [
      { name: 'Initializing Discovery', status: 'Completed', timestamp: '01:00:05 AM' },
      { name: 'Scanning IP Range', status: 'Completed', timestamp: '01:15:30 AM' },
      { name: 'Identifying Devices', status: 'Completed', timestamp: '01:25:10 AM' },
      { name: 'Collecting Device Details', status: 'Completed', timestamp: '01:36:44 AM' },
      { name: 'Matching with Asset Database', status: 'Completed', timestamp: '01:42:00 AM' },
      { name: 'Generating Report', status: 'Completed', timestamp: '01:45:00 AM' }
    ]
  },
  {
    id: 'JOB-2026-0004',
    jobName: 'WMI - Windows Endpoints',
    discoveryType: 'Agentless WMI',
    ipRange: '192.168.2.0/24',
    profile: 'Windows WMI Profile',
    schedule: 'Daily at 04:00 AM',
    status: 'Completed',
    createdBy: 'Sarah Connor',
    createdOn: '2026-09-05T11:20:00Z',
    startedOn: '2026-09-10T04:00:00Z',
    completedOn: '2026-09-10T04:22:00Z',
    duration: '22m 00s',
    totalDevices: 160,
    matchedCount: 145,
    newCount: 10,
    reviewCount: 5,
    stages: [
      { name: 'Initializing Discovery', status: 'Completed', timestamp: '04:00:02 AM' },
      { name: 'Scanning IP Range', status: 'Completed', timestamp: '04:06:15 AM' },
      { name: 'Identifying Devices', status: 'Completed', timestamp: '04:12:08 AM' },
      { name: 'Collecting Device Details', status: 'Completed', timestamp: '04:18:22 AM' },
      { name: 'Matching with Asset Database', status: 'Completed', timestamp: '04:21:05 AM' },
      { name: 'Generating Report', status: 'Completed', timestamp: '04:22:00 AM' }
    ]
  },
  {
    id: 'JOB-2026-0005',
    jobName: 'SNMP Switch Audit',
    discoveryType: 'SNMP Profile Scan',
    ipRange: '10.100.1.0/24',
    profile: 'Cisco Catalyst Profile',
    schedule: 'Weekly (Sat 11:00 PM)',
    status: 'Completed',
    createdBy: 'Admin User',
    createdOn: '2026-09-02T16:00:00Z',
    startedOn: '2026-09-07T23:00:00Z',
    completedOn: '2026-09-07T23:15:00Z',
    duration: '15m 00s',
    totalDevices: 48,
    matchedCount: 46,
    newCount: 1,
    reviewCount: 1,
    stages: [
      { name: 'Initializing Discovery', status: 'Completed', timestamp: '11:00:01 PM' },
      { name: 'Scanning IP Range', status: 'Completed', timestamp: '11:03:40 PM' },
      { name: 'Identifying Devices', status: 'Completed', timestamp: '11:07:12 PM' },
      { name: 'Collecting Device Details', status: 'Completed', timestamp: '11:11:30 PM' },
      { name: 'Matching with Asset Database', status: 'Completed', timestamp: '11:14:00 PM' },
      { name: 'Generating Report', status: 'Completed', timestamp: '11:15:00 PM' }
    ]
  },
  {
    id: 'JOB-2026-0006',
    jobName: 'Cloud Subnet Scan',
    discoveryType: 'Cloud VPC Connector',
    ipRange: '10.200.0.0/16',
    profile: 'AWS VPC Discovery',
    schedule: 'Daily at 03:00 AM',
    status: 'Completed',
    createdBy: 'DevOps Team',
    createdOn: '2026-09-03T10:00:00Z',
    startedOn: '2026-09-10T03:00:00Z',
    completedOn: '2026-09-10T03:12:00Z',
    duration: '12m 00s',
    totalDevices: 92,
    matchedCount: 88,
    newCount: 3,
    reviewCount: 1,
    stages: [
      { name: 'Initializing Discovery', status: 'Completed', timestamp: '03:00:02 AM' },
      { name: 'Scanning IP Range', status: 'Completed', timestamp: '03:03:10 AM' },
      { name: 'Identifying Devices', status: 'Completed', timestamp: '03:06:45 AM' },
      { name: 'Collecting Device Details', status: 'Completed', timestamp: '03:09:20 AM' },
      { name: 'Matching with Asset Database', status: 'Completed', timestamp: '03:11:15 AM' },
      { name: 'Generating Report', status: 'Completed', timestamp: '03:12:00 AM' }
    ]
  },
  {
    id: 'JOB-2026-0007',
    jobName: 'London Office Sweep',
    discoveryType: 'IP Range Scan',
    ipRange: '10.50.0.0/22',
    profile: 'Full Corporate Audit',
    schedule: 'Monthly (1st)',
    status: 'Completed',
    createdBy: 'Mike Ross',
    createdOn: '2026-08-25T09:00:00Z',
    startedOn: '2026-09-01T05:00:00Z',
    completedOn: '2026-09-01T05:35:00Z',
    duration: '35m 00s',
    totalDevices: 130,
    matchedCount: 120,
    newCount: 8,
    reviewCount: 2,
    stages: [
      { name: 'Initializing Discovery', status: 'Completed', timestamp: '05:00:03 AM' },
      { name: 'Scanning IP Range', status: 'Completed', timestamp: '05:10:20 AM' },
      { name: 'Identifying Devices', status: 'Completed', timestamp: '05:18:40 AM' },
      { name: 'Collecting Device Details', status: 'Completed', timestamp: '05:27:10 AM' },
      { name: 'Matching with Asset Database', status: 'Completed', timestamp: '05:32:45 AM' },
      { name: 'Generating Report', status: 'Completed', timestamp: '05:35:00 AM' }
    ]
  },
  {
    id: 'JOB-2026-0008',
    jobName: 'IoT & Surveillance VLAN',
    discoveryType: 'ARP & Ping Sweep',
    ipRange: '192.168.100.0/24',
    profile: 'IoT Devices Profile',
    schedule: 'Weekly (Fri 10:00 PM)',
    status: 'Completed',
    createdBy: 'Security Ops',
    createdOn: '2026-08-30T12:00:00Z',
    startedOn: '2026-09-05T22:00:00Z',
    completedOn: '2026-09-05T22:08:00Z',
    duration: '8m 00s',
    totalDevices: 67,
    matchedCount: 60,
    newCount: 5,
    reviewCount: 2,
    stages: [
      { name: 'Initializing Discovery', status: 'Completed', timestamp: '10:00:01 PM' },
      { name: 'Scanning IP Range', status: 'Completed', timestamp: '10:02:15 PM' },
      { name: 'Identifying Devices', status: 'Completed', timestamp: '10:04:30 PM' },
      { name: 'Collecting Device Details', status: 'Completed', timestamp: '10:06:12 PM' },
      { name: 'Matching with Asset Database', status: 'Completed', timestamp: '10:07:35 PM' },
      { name: 'Generating Report', status: 'Completed', timestamp: '10:08:00 PM' }
    ]
  },
  {
    id: 'JOB-2026-0009',
    jobName: 'Floor 3 WiFi AP Scan',
    discoveryType: 'Active ARP / Ping',
    ipRange: '192.168.30.0/24',
    profile: 'Wireless AP Profile',
    schedule: 'Hourly',
    status: 'Running',
    createdBy: 'John Doe',
    createdOn: '2026-09-10T14:00:00Z',
    startedOn: '2026-09-10T14:15:00Z',
    completedOn: null,
    duration: 'In Progress (17m)',
    totalDevices: 38,
    matchedCount: 30,
    newCount: 6,
    reviewCount: 2,
    stages: [
      { name: 'Initializing Discovery', status: 'Completed', timestamp: '02:15:01 PM' },
      { name: 'Scanning IP Range', status: 'Completed', timestamp: '02:18:10 PM' },
      { name: 'Identifying Devices', status: 'Completed', timestamp: '02:22:30 PM' },
      { name: 'Collecting Device Details', status: 'Running', timestamp: 'In Progress...' },
      { name: 'Matching with Asset Database', status: 'Pending', timestamp: '--' },
      { name: 'Generating Report', status: 'Pending', timestamp: '--' }
    ]
  },
  {
    id: 'JOB-2026-0010',
    jobName: 'R&D Lab Sweep',
    discoveryType: 'Linux SSH Probe',
    ipRange: '192.168.50.0/24',
    profile: 'Linux SSH Profile',
    schedule: 'Daily at 05:00 PM',
    status: 'Running',
    createdBy: 'Tech Lead',
    createdOn: '2026-09-09T09:00:00Z',
    startedOn: '2026-09-10T14:20:00Z',
    completedOn: null,
    duration: 'In Progress (12m)',
    totalDevices: 19,
    matchedCount: 15,
    newCount: 3,
    reviewCount: 1,
    stages: [
      { name: 'Initializing Discovery', status: 'Completed', timestamp: '02:20:02 PM' },
      { name: 'Scanning IP Range', status: 'Completed', timestamp: '02:23:45 PM' },
      { name: 'Identifying Devices', status: 'Running', timestamp: 'In Progress...' },
      { name: 'Collecting Device Details', status: 'Pending', timestamp: '--' },
      { name: 'Matching with Asset Database', status: 'Pending', timestamp: '--' },
      { name: 'Generating Report', status: 'Pending', timestamp: '--' }
    ]
  },
  {
    id: 'JOB-2026-0011',
    jobName: 'DMZ External Sweep',
    discoveryType: 'Port Scan & Banner',
    ipRange: '198.51.100.0/28',
    profile: 'Security DMZ Profile',
    schedule: 'Manual / On-Demand',
    status: 'Failed',
    createdBy: 'Security Ops',
    createdOn: '2026-09-09T17:50:00Z',
    startedOn: '2026-09-09T18:00:00Z',
    completedOn: '2026-09-09T18:02:10Z',
    duration: '2m 10s',
    totalDevices: 0,
    matchedCount: 0,
    newCount: 0,
    reviewCount: 0,
    failureReason: 'Connection timeout: Firewall dropped SYN packets on port 161/443. Gateway unreachable.',
    stages: [
      { name: 'Initializing Discovery', status: 'Completed', timestamp: '06:00:01 PM' },
      { name: 'Scanning IP Range', status: 'Failed', timestamp: '06:02:10 PM (Timeout)' },
      { name: 'Identifying Devices', status: 'Skipped', timestamp: '--' },
      { name: 'Collecting Device Details', status: 'Skipped', timestamp: '--' },
      { name: 'Matching with Asset Database', status: 'Skipped', timestamp: '--' },
      { name: 'Generating Report', status: 'Skipped', timestamp: '--' }
    ]
  },
  {
    id: 'JOB-2026-0012',
    jobName: 'Guest WiFi Nightly',
    discoveryType: 'Passive ARP Listening',
    ipRange: '172.20.0.0/22',
    profile: 'Guest Profile',
    schedule: 'Daily at 01:00 AM',
    status: 'Scheduled',
    createdBy: 'Admin User',
    createdOn: '2026-09-08T15:00:00Z',
    startedOn: null,
    completedOn: null,
    duration: '--',
    totalDevices: 0,
    matchedCount: 0,
    newCount: 0,
    reviewCount: 0,
    stages: [
      { name: 'Initializing Discovery', status: 'Pending', timestamp: 'Next: 01:00 AM' },
      { name: 'Scanning IP Range', status: 'Pending', timestamp: '--' },
      { name: 'Identifying Devices', status: 'Pending', timestamp: '--' },
      { name: 'Collecting Device Details', status: 'Pending', timestamp: '--' },
      { name: 'Matching with Asset Database', status: 'Pending', timestamp: '--' },
      { name: 'Generating Report', status: 'Pending', timestamp: '--' }
    ]
  }
];

export class DiscoveryService {
  /**
   * Get KPI Summary counts
   */
  static async getKpis() {
    const total = discoveryDevicesStore.length;
    const matched = discoveryDevicesStore.filter((d) => d.assetStatus === 'Matched').length;
    const newDevices = discoveryDevicesStore.filter((d) => d.assetStatus === 'New').length;
    const review = discoveryDevicesStore.filter((d) => d.assetStatus === 'Review' || d.assetStatus === 'Requires Review').length;
    const stale = discoveryDevicesStore.filter((d) => d.assetStatus === 'Stale').length;
    const conflicts = discoveryDevicesStore.filter((d) => d.assetStatus === 'Conflict').length;

    return {
      totalDevices: total,
      matchedCount: matched,
      matchedPercentage: Math.round((matched / total) * 100) || 81,
      newCount: newDevices,
      newPercentage: Math.round((newDevices / total) * 100) || 13,
      reviewCount: review,
      reviewPercentage: Math.round((review / total) * 100) || 6,
      staleCount: stale,
      conflictCount: conflicts
    };
  }

  /**
   * Filter, search, sort and paginate discovered devices
   */
  static async getDiscoveredDevices(query = {}) {
    const {
      search = '',
      deviceType = 'All Types',
      status = 'All Status',
      location = 'All Locations',
      discoveryJob = 'All Jobs',
      manufacturer = 'All',
      model = 'All',
      operatingSystem = 'All',
      discoverySource = 'All',
      ipAddress = '',
      hostname = '',
      macAddress = '',
      serialNumber = '',
      lastSeenFrom = '',
      lastSeenTo = '',
      latestOnly = 'false',
      page = 1,
      limit = 10,
      sortBy = 'lastSeen',
      sortDir = 'desc'
    } = query;

    let filtered = [...discoveryDevicesStore];

    // Search bar (IP, hostname, MAC, serial, model)
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter(
        (d) =>
          d.ipAddress?.toLowerCase().includes(q) ||
          d.hostname?.toLowerCase().includes(q) ||
          d.macAddress?.toLowerCase().includes(q) ||
          d.serialNumber?.toLowerCase().includes(q) ||
          d.model?.toLowerCase().includes(q) ||
          d.manufacturer?.toLowerCase().includes(q)
      );
    }

    // Quick filter dropdowns
    if (deviceType && deviceType !== 'All' && deviceType !== 'All Types') {
      filtered = filtered.filter((d) => d.deviceType.toLowerCase() === deviceType.toLowerCase());
    }

    if (status && status !== 'All' && status !== 'All Status') {
      filtered = filtered.filter((d) => d.assetStatus.toLowerCase() === status.toLowerCase());
    }

    if (location && location !== 'All' && location !== 'All Locations') {
      filtered = filtered.filter((d) => d.location.toLowerCase().includes(location.toLowerCase()));
    }

    if (discoveryJob && discoveryJob !== 'All' && discoveryJob !== 'All Jobs') {
      filtered = filtered.filter((d) => d.discoveryJob.toLowerCase().includes(discoveryJob.toLowerCase()));
    }

    // Advanced filter modal fields
    if (ipAddress) filtered = filtered.filter((d) => d.ipAddress.includes(ipAddress));
    if (hostname) filtered = filtered.filter((d) => d.hostname.toLowerCase().includes(hostname.toLowerCase()));
    if (macAddress) filtered = filtered.filter((d) => d.macAddress.toLowerCase().includes(macAddress.toLowerCase()));
    if (serialNumber) filtered = filtered.filter((d) => d.serialNumber.toLowerCase().includes(serialNumber.toLowerCase()));
    if (manufacturer && manufacturer !== 'All') filtered = filtered.filter((d) => d.manufacturer.toLowerCase() === manufacturer.toLowerCase());
    if (model && model !== 'All') filtered = filtered.filter((d) => d.model.toLowerCase().includes(model.toLowerCase()));
    if (operatingSystem && operatingSystem !== 'All') filtered = filtered.filter((d) => d.operatingSystem.toLowerCase().includes(operatingSystem.toLowerCase()));
    if (discoverySource && discoverySource !== 'All') filtered = filtered.filter((d) => d.discoverySource.toLowerCase() === discoverySource.toLowerCase());

    if (lastSeenFrom) {
      filtered = filtered.filter((d) => new Date(d.lastSeen) >= new Date(lastSeenFrom));
    }
    if (lastSeenTo) {
      filtered = filtered.filter((d) => new Date(d.lastSeen) <= new Date(lastSeenTo));
    }

    // Sorting
    filtered.sort((a, b) => {
      const aVal = a[sortBy] || '';
      const bVal = b[sortBy] || '';
      if (sortDir === 'desc') {
        return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
      }
      return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
    });

    // Pagination
    const totalRecords = filtered.length;
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const totalPages = Math.ceil(totalRecords / limitNum) || 1;
    const startIndex = (pageNum - 1) * limitNum;
    const paginatedRecords = filtered.slice(startIndex, startIndex + limitNum);

    return {
      devices: paginatedRecords,
      pagination: {
        totalRecords,
        totalPages,
        currentPage: pageNum,
        limit: limitNum,
        startIndex: startIndex + 1,
        endIndex: Math.min(startIndex + limitNum, totalRecords)
      }
    };
  }

  /**
   * Get single device by ID
   */
  static async getDeviceById(id) {
    const dev = discoveryDevicesStore.find((d) => d.id === id || d.hostname === id || d.ipAddress === id);
    return dev || null;
  }

  /**
   * Confirm match between discovered device and Asset360 asset
   */
  static async confirmMatch({ deviceId, assetId, user }) {
    const dev = discoveryDevicesStore.find((d) => d.id === deviceId);
    if (!dev) throw new Error('Discovered device not found');

    dev.assetStatus = 'Matched';
    dev.linkedAssetId = assetId || dev.suggestedAsset?.assetId || `AS-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    dev.suggestedAsset = null;
    dev.matchConfidence = 100;
    dev.history.unshift({
      timestamp: new Date().toISOString(),
      job: dev.discoveryJob,
      status: 'Matched',
      ip: dev.ipAddress,
      change: `Match confirmed by ${user?.fullName || 'John Doe'}. Linked to asset ${dev.linkedAssetId}`
    });

    return dev;
  }

  /**
   * Reject suggested match
   */
  static async rejectMatch({ deviceId, reason, user }) {
    const dev = discoveryDevicesStore.find((d) => d.id === deviceId);
    if (!dev) throw new Error('Discovered device not found');

    dev.assetStatus = 'New';
    dev.suggestedAsset = null;
    dev.matchConfidence = 0;
    dev.history.unshift({
      timestamp: new Date().toISOString(),
      job: dev.discoveryJob,
      status: 'New',
      ip: dev.ipAddress,
      change: `Match rejected by ${user?.fullName || 'John Doe'}. Reason: ${reason || 'Not same device'}`
    });

    return dev;
  }

  /**
   * Create new Asset from Discovered Device
   */
  static async createAssetFromDevice({ deviceId, assetData, user }) {
    const dev = discoveryDevicesStore.find((d) => d.id === deviceId);
    if (!dev) throw new Error('Discovered device not found');

    const newAssetId = `AS-2026-${Math.floor(10000 + Math.random() * 90000)}`;

    // Try creating in Prisma if connected
    if (isSqlServerConnected) {
      try {
        const company = await prisma.company.findFirst({ where: { active: true } });
        const site = await prisma.site.findFirst({ where: { active: true } });
        const category = await prisma.category.findFirst({ where: { active: true } });

        if (company && site) {
          await prisma.asset.create({
            data: {
              assetId: newAssetId,
              description: assetData.assetName || dev.hostname,
              serialNumber: assetData.serialNumber || dev.serialNumber,
              hostname: dev.hostname,
              ipAddress: dev.ipAddress,
              macAddress: dev.macAddress,
              companyId: company.id,
              siteId: site.id,
              categoryId: category ? category.id : undefined,
              lifecycleStatus: 'ACTIVE',
              condition: 'GOOD',
              createdByUserId: user?.id || null
            }
          });
        }
      } catch (e) {
        console.warn('Prisma asset creation fallback:', e.message);
      }
    }

    dev.assetStatus = 'Matched';
    dev.linkedAssetId = newAssetId;
    dev.matchConfidence = 100;
    dev.history.unshift({
      timestamp: new Date().toISOString(),
      job: dev.discoveryJob,
      status: 'Matched',
      ip: dev.ipAddress,
      change: `New asset ${newAssetId} created in Asset360 by ${user?.fullName || 'John Doe'}`
    });

    return { device: dev, assetId: newAssetId };
  }

  /**
   * Edit Discovery Device Metadata
   */
  static async editDevice(id, updates, user) {
    const dev = discoveryDevicesStore.find((d) => d.id === id);
    if (!dev) throw new Error('Device not found');

    const previousVals = { ...dev };
    Object.assign(dev, updates);

    dev.history.unshift({
      timestamp: new Date().toISOString(),
      job: dev.discoveryJob,
      status: dev.assetStatus,
      ip: dev.ipAddress,
      change: `Metadata updated by ${user?.fullName || 'John Doe'}`
    });

    return dev;
  }

  /**
   * Mark Discovery Exception as Resolved
   */
  static async resolveException({ deviceId, resolutionType, remarks, user }) {
    const dev = discoveryDevicesStore.find((d) => d.id === deviceId);
    if (!dev) throw new Error('Device not found');

    dev.assetStatus = 'Matched';
    dev.resolution = {
      resolvedBy: user?.fullName || 'John Doe',
      resolvedAt: new Date().toISOString(),
      resolutionType: resolutionType || 'Verified Authorized Exception',
      remarks: remarks || 'Resolved by administrator'
    };

    dev.history.unshift({
      timestamp: new Date().toISOString(),
      job: dev.discoveryJob,
      status: 'Matched',
      ip: dev.ipAddress,
      change: `Exception resolved: ${resolutionType} (${remarks || 'No notes'})`
    });

    return dev;
  }

  /**
   * Archive / Delete Device
   */
  static async deleteDevice(id) {
    const idx = discoveryDevicesStore.findIndex((d) => d.id === id);
    if (idx !== -1) {
      discoveryDevicesStore.splice(idx, 1);
      return true;
    }
    return false;
  }

  /**
   * Re-run Discovery Job
   */
  static async rerunJob(jobId) {
    const job = discoveryJobsStore.find((j) => j.id === jobId);
    if (!job) throw new Error('Job not found');

    const newExecutionId = `JOB-RUN-${Date.now()}`;
    const newExecution = {
      ...job,
      executionId: newExecutionId,
      startedOn: new Date().toISOString(),
      status: 'Running'
    };

    // Simulate completion after a brief moment
    setTimeout(() => {
      newExecution.status = 'Completed';
      newExecution.completedOn = new Date().toISOString();
    }, 2000);

    return newExecution;
  }

  /**
   * Update Discovery Job Configuration
   */
  static async updateJob(jobId, updates) {
    const job = discoveryJobsStore.find((j) => j.id === jobId);
    if (!job) throw new Error('Job not found');
    Object.assign(job, updates);
    return job;
  }

  /**
   * Get Discovery Job KPI stats
   */
  static async getJobStats() {
    const total = discoveryJobsStore.length;
    const completed = discoveryJobsStore.filter((j) => j.status === 'Completed').length;
    const running = discoveryJobsStore.filter((j) => j.status === 'Running').length;
    const failed = discoveryJobsStore.filter((j) => j.status === 'Failed').length;
    const scheduled = discoveryJobsStore.filter((j) => j.status === 'Scheduled').length;

    return {
      total,
      completed,
      running,
      failed,
      scheduled
    };
  }

  /**
   * Get all Discovery Jobs with optional query filters
   */
  static async getJobs(query = {}) {
    let list = [...discoveryJobsStore];
    const { status, search, discoveryType, createdBy } = query;

    if (status && status !== 'All') {
      list = list.filter((j) => j.status.toLowerCase() === status.toLowerCase());
    }

    if (discoveryType && discoveryType !== 'All') {
      list = list.filter((j) => j.discoveryType.toLowerCase().includes(discoveryType.toLowerCase()));
    }

    if (createdBy && createdBy !== 'All') {
      list = list.filter((j) => j.createdBy.toLowerCase().includes(createdBy.toLowerCase()));
    }

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((j) =>
        j.jobName.toLowerCase().includes(q) ||
        j.ipRange.toLowerCase().includes(q) ||
        j.profile.toLowerCase().includes(q) ||
        j.id.toLowerCase().includes(q)
      );
    }

    return list;
  }

  /**
   * Get a single Discovery Job by ID
   */
  static async getJobById(jobId) {
    const job = discoveryJobsStore.find((j) => j.id === jobId || j.jobName.toLowerCase() === jobId.toLowerCase());
    if (!job) return null;
    return job;
  }

  /**
   * Create a new Discovery Job
   */
  static async createJob(jobData, user) {
    const newId = `JOB-2026-${String(discoveryJobsStore.length + 1).padStart(4, '0')}`;
    const newJob = {
      id: newId,
      jobName: jobData.jobName || 'Custom Network Scan',
      discoveryType: jobData.discoveryType || 'IP Range Scan',
      ipRange: jobData.ipRange || '192.168.1.0/24',
      profile: jobData.profile || 'Default',
      schedule: jobData.schedule || 'Manual',
      status: jobData.runImmediately ? 'Running' : 'Scheduled',
      createdBy: user?.name || jobData.createdBy || 'Current User',
      createdOn: new Date().toISOString(),
      startedOn: jobData.runImmediately ? new Date().toISOString() : null,
      completedOn: null,
      duration: jobData.runImmediately ? 'In Progress' : '--',
      totalDevices: 0,
      matchedCount: 0,
      newCount: 0,
      reviewCount: 0,
      stages: [
        { name: 'Initializing Discovery', status: jobData.runImmediately ? 'Completed' : 'Pending', timestamp: jobData.runImmediately ? 'Just now' : '--' },
        { name: 'Scanning IP Range', status: jobData.runImmediately ? 'Running' : 'Pending', timestamp: jobData.runImmediately ? 'In Progress...' : '--' },
        { name: 'Identifying Devices', status: 'Pending', timestamp: '--' },
        { name: 'Collecting Device Details', status: 'Pending', timestamp: '--' },
        { name: 'Matching with Asset Database', status: 'Pending', timestamp: '--' },
        { name: 'Generating Report', status: 'Pending', timestamp: '--' }
      ]
    };

    discoveryJobsStore.unshift(newJob);

    // If run immediately, simulate completion after 5 seconds
    if (jobData.runImmediately) {
      setTimeout(() => {
        newJob.status = 'Completed';
        newJob.completedOn = new Date().toISOString();
        newJob.duration = '1m 20s';
        newJob.totalDevices = Math.floor(Math.random() * 50) + 20;
        newJob.matchedCount = Math.floor(newJob.totalDevices * 0.8);
        newJob.newCount = Math.floor(newJob.totalDevices * 0.15);
        newJob.reviewCount = newJob.totalDevices - newJob.matchedCount - newJob.newCount;
        newJob.stages.forEach((s) => {
          s.status = 'Completed';
          s.timestamp = 'Just now';
        });
      }, 5000);
    }

    return newJob;
  }

  /**
   * Clone an existing Discovery Job
   */
  static async cloneJob(jobId, user) {
    const source = discoveryJobsStore.find((j) => j.id === jobId);
    if (!source) throw new Error('Job not found to clone');

    const newId = `JOB-2026-${String(discoveryJobsStore.length + 1).padStart(4, '0')}`;
    const cloned = {
      ...source,
      id: newId,
      jobName: `${source.jobName} (Copy)`,
      status: 'Scheduled',
      createdBy: user?.name || 'Current User',
      createdOn: new Date().toISOString(),
      startedOn: null,
      completedOn: null,
      duration: '--',
      totalDevices: 0,
      matchedCount: 0,
      newCount: 0,
      reviewCount: 0,
      stages: [
        { name: 'Initializing Discovery', status: 'Pending', timestamp: '--' },
        { name: 'Scanning IP Range', status: 'Pending', timestamp: '--' },
        { name: 'Identifying Devices', status: 'Pending', timestamp: '--' },
        { name: 'Collecting Device Details', status: 'Pending', timestamp: '--' },
        { name: 'Matching with Asset Database', status: 'Pending', timestamp: '--' },
        { name: 'Generating Report', status: 'Pending', timestamp: '--' }
      ]
    };

    discoveryJobsStore.unshift(cloned);
    return cloned;
  }

  /**
   * Delete a Discovery Job
   */
  static async deleteJob(jobId) {
    const idx = discoveryJobsStore.findIndex((j) => j.id === jobId);
    if (idx !== -1) {
      discoveryJobsStore.splice(idx, 1);
      return true;
    }
    return false;
  }

  /**
   * Export Devices Dataset
   */
  static async exportDataset({ exportType = 'CURRENT', format = 'xlsx', columns = [], filters = {} }) {
    let dataset = [...discoveryDevicesStore];
    if (exportType === 'CURRENT') {
      const result = await this.getDiscoveredDevices({ ...filters, limit: 1000 });
      dataset = result.devices;
    }

    const defaultCols = ['ipAddress', 'hostname', 'macAddress', 'deviceType', 'manufacturer', 'model', 'serialNumber', 'operatingSystem', 'assetStatus'];
    const activeCols = columns.length > 0 ? columns : defaultCols;

    return {
      fileName: `Discovered_Devices_${new Date().toISOString().replace(/\D/g, '').slice(0, 12)}.${format}`,
      recordCount: dataset.length,
      format,
      columns: activeCols,
      records: dataset
    };
  }

  /**
   * Get Candidate Devices for Import to Asset360
   */
  static async getImportCandidates(params = {}) {
    const {
      search = '',
      status = 'New / Unregistered',
      deviceType = 'All Types',
      location = 'All Locations',
      discoveryJob = 'HQ Network Scan'
    } = params;

    let filtered = [...importCandidatesStore];

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        d =>
          d.hostname?.toLowerCase().includes(q) ||
          d.ipAddress?.toLowerCase().includes(q) ||
          d.macAddress?.toLowerCase().includes(q) ||
          d.serialNumber?.toLowerCase().includes(q)
      );
    }

    if (status && status !== 'ALL' && status !== 'All Status') {
      if (status === 'New / Unregistered') {
        filtered = filtered.filter(d => d.assetAction === 'Create New' || d.assetStatus === 'New / Unregistered');
      } else if (status === 'Matched') {
        filtered = filtered.filter(d => d.assetAction === 'Match Existing' || d.assetStatus === 'Matched');
      }
    }

    if (deviceType && deviceType !== 'All Types' && deviceType !== 'ALL') {
      filtered = filtered.filter(d => d.deviceType === deviceType);
    }

    if (location && location !== 'All Locations' && location !== 'ALL') {
      filtered = filtered.filter(d => d.targetLocation?.includes(location));
    }

    const totalSelected = importCandidatesStore.length; // 32
    const newCount = importCandidatesStore.filter(d => d.assetAction === 'Create New').length; // 28
    const matchedCount = importCandidatesStore.filter(d => d.assetAction === 'Match Existing').length; // 4
    const reviewCount = importCandidatesStore.filter(d => d.assetAction === 'Requires Review').length; // 0

    return {
      totalSelected,
      newAssetsCount: newCount,
      matchedCount,
      reviewCount,
      candidates: filtered
    };
  }

  /**
   * Validate Import Batch Payload
   */
  static async validateImportBatch({ devices = [], fieldMappings = {}, defaultBusinessValues = {}, options = {} }) {
    const validationDetails = [];
    let validCount = 0;
    let warningCount = 0;
    let errorCount = 0;

    devices.forEach((dev, idx) => {
      const issues = [];

      if (!dev.hostname) issues.push({ field: 'Hostname', message: 'Hostname is missing' });
      if (!dev.serialNumber) issues.push({ field: 'Serial Number', message: 'Hardware serial is missing' });
      if (!dev.macAddress) issues.push({ field: 'MAC Address', message: 'MAC Address is missing' });

      // Check mandatory business master data if Create New
      if (dev.assetAction === 'Create New') {
        if (!defaultBusinessValues.company && !dev.company) {
          // Warning resolved by fallback default
        }
      }

      if (issues.length > 0) {
        errorCount++;
        validationDetails.push({
          deviceId: dev.id || `DEV-${idx + 1}`,
          hostname: dev.hostname,
          status: 'Failed',
          issues
        });
      } else {
        validCount++;
        validationDetails.push({
          deviceId: dev.id || `DEV-${idx + 1}`,
          hostname: dev.hostname,
          status: 'Passed',
          issues: []
        });
      }
    });

    return {
      success: true,
      totalDevices: devices.length,
      validCount,
      warningCount,
      errorCount,
      allValid: errorCount === 0,
      validationDetails
    };
  }

  /**
   * Execute Import Batch Transaction
   */
  static async executeImportBatch({ devices = [], fieldMappings = {}, defaultBusinessValues = {}, options = {} }, user) {
    const batchId = `IMP-2026-${String(Math.floor(1000 + Math.random() * 9000))}`;
    const timestamp = new Date().toISOString();
    const createdAssets = [];
    const linkedAssets = [];
    const skippedRecords = [];
    const failedRecords = [];

    // Fallback company/location defaults
    const company = defaultBusinessValues.company || 'Asset360 Corporation';
    const department = defaultBusinessValues.department || 'Information Technology';
    const costCenter = defaultBusinessValues.costCenter || 'CC-IT-101';

    for (let i = 0; i < devices.length; i++) {
      const dev = devices[i];

      try {
        if (dev.assetAction === 'Match Existing' && options.linkExisting !== false) {
          // Link to existing asset
          const targetAssetId = dev.matchedAssetId || dev.remarks?.match(/AS-\d{4}-\d{4}/)?.[0] || `AS-2024-001${i + 1}`;
          
          linkedAssets.push({
            deviceId: dev.id,
            hostname: dev.hostname,
            serialNumber: dev.serialNumber,
            linkedAssetId: targetAssetId,
            status: 'Linked',
            locationUpdated: !!options.updateLocation,
            targetLocation: dev.targetLocation
          });

          // Update candidate status
          const cand = importCandidatesStore.find(c => c.id === dev.id);
          if (cand) {
            cand.assetStatus = 'Matched / Imported';
            cand.linkedAssetId = targetAssetId;
          }
        } else if (dev.assetAction === 'Create New' && options.createNew !== false) {
          // Generate unique Asset360 tag
          const assetId = `AST-2026-${String(1000 + i + 1).padStart(4, '0')}`;
          
          const newAsset = {
            id: assetId,
            assetTag: assetId,
            name: dev.hostname,
            serialNumber: dev.serialNumber,
            macAddress: dev.macAddress,
            ipAddress: dev.ipAddress,
            manufacturer: dev.manufacturer,
            model: dev.model,
            category: dev.deviceType,
            location: dev.targetLocation || 'Dubai HQ - IT',
            company,
            department,
            costCenter,
            status: 'In Stock',
            source: 'AUTO_DISCOVERY',
            importBatchId: batchId,
            createdAt: timestamp
          };

          createdAssets.push(newAsset);

          // Update candidate status
          const cand = importCandidatesStore.find(c => c.id === dev.id);
          if (cand) {
            cand.assetStatus = 'Imported';
            cand.linkedAssetId = assetId;
          }
        } else {
          skippedRecords.push({
            deviceId: dev.id,
            hostname: dev.hostname,
            reason: 'Excluded by user configuration'
          });
        }
      } catch (err) {
        failedRecords.push({
          deviceId: dev.id,
          hostname: dev.hostname,
          error: err.message
        });
      }
    }

    const batchSummary = {
      batchId,
      timestamp,
      initiatedBy: user?.name || 'John Doe (IT Administrator)',
      totalProcessed: devices.length,
      assetsCreatedCount: createdAssets.length,
      existingLinkedCount: linkedAssets.length,
      skippedCount: skippedRecords.length,
      failedCount: failedRecords.length,
      createdAssets,
      linkedAssets,
      skippedRecords,
      failedRecords,
      options,
      status: 'Completed'
    };

    importBatchesStore.unshift(batchSummary);

    return {
      success: true,
      batchId,
      ...batchSummary
    };
  }

  /**
   * Retrieve Past Import Batches
   */
  static async getImportBatches() {
    return importBatchesStore;
  }

  /**
   * Retrieve Single Import Batch by ID
   */
  static async getImportBatchById(batchId) {
    return importBatchesStore.find(b => b.batchId === batchId) || null;
  }
}

// 32 Seeded Import Candidate Devices matching Screenshot 23
let importCandidatesStore = [
  { id: 'IMP-001', hostname: 'PRN-HQ-01', ipAddress: '192.168.1.20', macAddress: '00:1A:2B:3C:4D:7A', deviceType: 'Printer', manufacturer: 'HP', model: 'LaserJet Pro', serialNumber: 'VNB3K91', assetAction: 'Create New', targetLocation: 'Dubai HQ - IT', remarks: '-', assetStatus: 'New / Unregistered' },
  { id: 'IMP-002', hostname: 'LAPTOP-078', ipAddress: '192.168.1.45', macAddress: '00:1A:2B:3C:4D:9C', deviceType: 'Computer', manufacturer: 'Lenovo', model: 'ThinkPad T14', serialNumber: 'PF34K2', assetAction: 'Create New', targetLocation: 'Dubai HQ - Finance', remarks: '-', assetStatus: 'New / Unregistered' },
  { id: 'IMP-003', hostname: 'AP-01', ipAddress: '192.168.1.50', macAddress: '00:1A:2B:3C:4D:AA', deviceType: 'Network Device', manufacturer: 'Aruba', model: 'AP-515', serialNumber: 'CN7GOQ', assetAction: 'Create New', targetLocation: 'Dubai HQ - IT', remarks: '-', assetStatus: 'New / Unregistered' },
  { id: 'IMP-004', hostname: 'MONITOR-245', ipAddress: '192.168.1.11', macAddress: '00:1A:2B:3C:4D:6F', deviceType: 'Monitor', manufacturer: 'Dell', model: 'P2422H', serialNumber: 'CN0D4F2', assetAction: 'Create New', targetLocation: 'Dubai HQ - IT', remarks: '-', assetStatus: 'New / Unregistered' },
  { id: 'IMP-005', hostname: 'DESKTOP-001', ipAddress: '192.168.1.10', macAddress: '00:1A:2B:3C:4D:5E', deviceType: 'Computer', manufacturer: 'Dell', model: 'OptiPlex 7020', serialNumber: '7CD1234', assetAction: 'Match Existing', targetLocation: 'Dubai HQ - IT', remarks: 'Matches AS-2024-0015', matchedAssetId: 'AS-2024-0015', assetStatus: 'Matched' },
  { id: 'IMP-006', hostname: 'SW-CORE-01', ipAddress: '192.168.1.30', macAddress: '00:1A:2B:3C:4D:8B', deviceType: 'Network Device', manufacturer: 'Cisco', model: 'C9300', serialNumber: 'FD02456', assetAction: 'Create New', targetLocation: 'Dubai HQ - IT', remarks: '-', assetStatus: 'New / Unregistered' },
  { id: 'IMP-007', hostname: 'iPad-01', ipAddress: '192.168.1.75', macAddress: '00:1A:2B:3C:4D:CC', deviceType: 'Mobile Device', manufacturer: 'Apple', model: 'iPad Air', serialNumber: 'DLX9Q2', assetAction: 'Create New', targetLocation: 'Dubai HQ - Operations', remarks: '-', assetStatus: 'New / Unregistered' },
  { id: 'IMP-008', hostname: 'TV-LOBBY', ipAddress: '192.168.1.90', macAddress: '00:1A:2B:3C:4D:DD', deviceType: 'Display', manufacturer: 'Samsung', model: 'QE55Q60', serialNumber: 'TV8901', assetAction: 'Create New', targetLocation: 'Dubai HQ - Facilities', remarks: '-', assetStatus: 'New / Unregistered' },
  { id: 'IMP-009', hostname: 'POS-02', ipAddress: '192.168.1.100', macAddress: '00:1A:2B:3C:4D:EE', deviceType: 'POS Device', manufacturer: 'Zebra', model: 'TC52', serialNumber: 'ZB55231', assetAction: 'Create New', targetLocation: 'Dubai HQ - Retail', remarks: '-', assetStatus: 'New / Unregistered' },
  { id: 'IMP-010', hostname: 'SRV-FILE-01', ipAddress: '192.168.1.60', macAddress: '00:1A:2B:3C:4D:BB', deviceType: 'Server', manufacturer: 'HPE', model: 'ProLiant DL380', serialNumber: '2M3K91', assetAction: 'Create New', targetLocation: 'Dubai HQ - IT', remarks: '-', assetStatus: 'New / Unregistered' },
  { id: 'IMP-011', hostname: 'DESKTOP-002', ipAddress: '192.168.1.12', macAddress: '00:1A:2B:3C:4D:5F', deviceType: 'Computer', manufacturer: 'Dell', model: 'Latitude 5430', serialNumber: '8CD5678', assetAction: 'Match Existing', targetLocation: 'Dubai HQ - Finance', remarks: 'Matches AS-2024-0022', matchedAssetId: 'AS-2024-0022', assetStatus: 'Matched' },
  { id: 'IMP-012', hostname: 'SW-ACC-02', ipAddress: '192.168.1.32', macAddress: '00:1A:2B:3C:4D:8C', deviceType: 'Network Device', manufacturer: 'Cisco', model: 'Catalyst 2960', serialNumber: 'FD99102', assetAction: 'Match Existing', targetLocation: 'Dubai HQ - IT', remarks: 'Matches AS-2023-0104', matchedAssetId: 'AS-2023-0104', assetStatus: 'Matched' },
  { id: 'IMP-013', hostname: 'PRN-FIN-02', ipAddress: '192.168.1.22', macAddress: '00:1A:2B:3C:4D:7B', deviceType: 'Printer', manufacturer: 'HP', model: 'LaserJet Enterprise', serialNumber: 'VNB7742', assetAction: 'Match Existing', targetLocation: 'Dubai HQ - Finance', remarks: 'Matches AS-2024-0089', matchedAssetId: 'AS-2024-0089', assetStatus: 'Matched' },
  { id: 'IMP-014', hostname: 'LAPTOP-079', ipAddress: '192.168.1.46', macAddress: '00:1A:2B:3C:4D:9D', deviceType: 'Computer', manufacturer: 'Lenovo', model: 'ThinkPad X1', serialNumber: 'PF9081', assetAction: 'Create New', targetLocation: 'Dubai HQ - HR', remarks: '-', assetStatus: 'New / Unregistered' },
  { id: 'IMP-015', hostname: 'MONITOR-246', ipAddress: '192.168.1.13', macAddress: '00:1A:2B:3C:4D:70', deviceType: 'Monitor', manufacturer: 'Dell', model: 'U2723QE', serialNumber: 'CN8840', assetAction: 'Create New', targetLocation: 'Dubai HQ - Engineering', remarks: '-', assetStatus: 'New / Unregistered' },
  { id: 'IMP-016', hostname: 'AP-02', ipAddress: '192.168.1.51', macAddress: '00:1A:2B:3C:4D:AB', deviceType: 'Network Device', manufacturer: 'Aruba', model: 'AP-515', serialNumber: 'CN9011', assetAction: 'Create New', targetLocation: 'Dubai HQ - Operations', remarks: '-', assetStatus: 'New / Unregistered' },
  { id: 'IMP-017', hostname: 'iPad-02', ipAddress: '192.168.1.76', macAddress: '00:1A:2B:3C:4D:CD', deviceType: 'Mobile Device', manufacturer: 'Apple', model: 'iPad Pro', serialNumber: 'DLX881', assetAction: 'Create New', targetLocation: 'Dubai HQ - Retail', remarks: '-', assetStatus: 'New / Unregistered' },
  { id: 'IMP-018', hostname: 'SRV-BACKUP-01', ipAddress: '192.168.1.61', macAddress: '00:1A:2B:3C:4D:BC', deviceType: 'Server', manufacturer: 'Dell', model: 'PowerEdge R750', serialNumber: '7DP9012', assetAction: 'Create New', targetLocation: 'Dubai HQ - IT', remarks: '-', assetStatus: 'New / Unregistered' },
  { id: 'IMP-019', hostname: 'TV-CONF-01', ipAddress: '192.168.1.91', macAddress: '00:1A:2B:3C:4D:DE', deviceType: 'Display', manufacturer: 'LG', model: 'OLED65C3', serialNumber: 'LG7721', assetAction: 'Create New', targetLocation: 'Dubai HQ - Facilities', remarks: '-', assetStatus: 'New / Unregistered' },
  { id: 'IMP-020', hostname: 'POS-03', ipAddress: '192.168.1.101', macAddress: '00:1A:2B:3C:4D:EF', deviceType: 'POS Device', manufacturer: 'Zebra', model: 'TC52', serialNumber: 'ZB9001', assetAction: 'Create New', targetLocation: 'Dubai HQ - Retail', remarks: '-', assetStatus: 'New / Unregistered' },
  { id: 'IMP-021', hostname: 'LAPTOP-080', ipAddress: '192.168.1.47', macAddress: '00:1A:2B:3C:4D:9E', deviceType: 'Computer', manufacturer: 'Apple', model: 'MacBook Pro 16', serialNumber: 'C02G890', assetAction: 'Create New', targetLocation: 'Dubai HQ - Engineering', remarks: '-', assetStatus: 'New / Unregistered' },
  { id: 'IMP-022', hostname: 'LAPTOP-081', ipAddress: '192.168.1.48', macAddress: '00:1A:2B:3C:4D:9F', deviceType: 'Computer', manufacturer: 'Dell', model: 'Latitude 7430', serialNumber: '6DF7781', assetAction: 'Create New', targetLocation: 'Dubai HQ - Legal', remarks: '-', assetStatus: 'New / Unregistered' },
  { id: 'IMP-023', hostname: 'MONITOR-247', ipAddress: '192.168.1.14', macAddress: '00:1A:2B:3C:4D:71', deviceType: 'Monitor', manufacturer: 'HP', model: 'E24 G4', serialNumber: '3CQ119', assetAction: 'Create New', targetLocation: 'Dubai HQ - Marketing', remarks: '-', assetStatus: 'New / Unregistered' },
  { id: 'IMP-024', hostname: 'MONITOR-248', ipAddress: '192.168.1.15', macAddress: '00:1A:2B:3C:4D:72', deviceType: 'Monitor', manufacturer: 'Samsung', model: 'S24R350', serialNumber: 'SM8890', assetAction: 'Create New', targetLocation: 'Dubai HQ - Finance', remarks: '-', assetStatus: 'New / Unregistered' },
  { id: 'IMP-025', hostname: 'PRN-WRH-01', ipAddress: '192.168.1.23', macAddress: '00:1A:2B:3C:4D:7C', deviceType: 'Printer', manufacturer: 'Zebra', model: 'ZT411 Industrial', serialNumber: 'ZB4412', assetAction: 'Create New', targetLocation: 'Dubai HQ - Warehouse', remarks: '-', assetStatus: 'New / Unregistered' },
  { id: 'IMP-026', hostname: 'SW-DIST-01', ipAddress: '192.168.1.33', macAddress: '00:1A:2B:3C:4D:8D', deviceType: 'Network Device', manufacturer: 'Cisco', model: 'Catalyst 9200', serialNumber: 'FD88219', assetAction: 'Create New', targetLocation: 'Dubai HQ - IT', remarks: '-', assetStatus: 'New / Unregistered' },
  { id: 'IMP-027', hostname: 'AP-03', ipAddress: '192.168.1.52', macAddress: '00:1A:2B:3C:4D:AC', deviceType: 'Network Device', manufacturer: 'Aruba', model: 'AP-515', serialNumber: 'CN6601', assetAction: 'Create New', targetLocation: 'Dubai HQ - Warehouse', remarks: '-', assetStatus: 'New / Unregistered' },
  { id: 'IMP-028', hostname: 'iPhone-EXEC-01', ipAddress: '192.168.1.77', macAddress: '00:1A:2B:3C:4D:CE', deviceType: 'Mobile Device', manufacturer: 'Apple', model: 'iPhone 15 Pro', serialNumber: 'F2L8891', assetAction: 'Create New', targetLocation: 'Dubai HQ - Management', remarks: '-', assetStatus: 'New / Unregistered' },
  { id: 'IMP-029', hostname: 'SRV-DB-01', ipAddress: '192.168.1.62', macAddress: '00:1A:2B:3C:4D:BD', deviceType: 'Server', manufacturer: 'Dell', model: 'PowerEdge R650', serialNumber: '8DK1190', assetAction: 'Create New', targetLocation: 'Dubai HQ - IT', remarks: '-', assetStatus: 'New / Unregistered' },
  { id: 'IMP-030', hostname: 'DESKTOP-003', ipAddress: '192.168.1.16', macAddress: '00:1A:2B:3C:4D:60', deviceType: 'Computer', manufacturer: 'HP', model: 'EliteDesk 800', serialNumber: '4CE9012', assetAction: 'Create New', targetLocation: 'Dubai HQ - HR', remarks: '-', assetStatus: 'New / Unregistered' },
  { id: 'IMP-031', hostname: 'DESKTOP-004', ipAddress: '192.168.1.17', macAddress: '00:1A:2B:3C:4D:61', deviceType: 'Computer', manufacturer: 'Dell', model: 'OptiPlex 5090', serialNumber: '9CD4410', assetAction: 'Create New', targetLocation: 'Dubai HQ - Legal', remarks: '-', assetStatus: 'New / Unregistered' },
  { id: 'IMP-032', hostname: 'DESKTOP-005', ipAddress: '192.168.1.18', macAddress: '00:1A:2B:3C:4D:62', deviceType: 'Computer', manufacturer: 'Lenovo', model: 'ThinkCentre M90q', serialNumber: 'MJ09112', assetAction: 'Create New', targetLocation: 'Dubai HQ - Operations', remarks: '-', assetStatus: 'New / Unregistered' }
];

let importBatchesStore = [];

export default DiscoveryService;
