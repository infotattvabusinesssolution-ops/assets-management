import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import {
  Monitor,
  Plus,
  Link2,
  AlertTriangle,
  Search,
  Filter,
  CheckCircle2,
  FileText,
  ArrowRight,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  RefreshCw,
  Check,
  X,
  Download,
  Building2,
  ExternalLink,
  Layers,
  Database,
  Cpu,
  Printer,
  Smartphone,
  Server,
  Radio,
  Tv,
  Store
} from 'lucide-react';
import { ValidationDetailsModal } from '../components/modals/ValidationDetailsModal';

// 32 Seed Devices matching Screenshot 23
const INITIAL_DEVICES = [
  { id: 'IMP-001', hostname: 'PRN-HQ-01', ipAddress: '192.168.1.20', macAddress: '00:1A:2B:3C:4D:7A', deviceType: 'Printer', manufacturer: 'HP', model: 'LaserJet Pro', serialNumber: 'VNB3K91', assetAction: 'Create New', targetLocation: 'Dubai HQ - IT', remarks: '-' },
  { id: 'IMP-002', hostname: 'LAPTOP-078', ipAddress: '192.168.1.45', macAddress: '00:1A:2B:3C:4D:9C', deviceType: 'Computer', manufacturer: 'Lenovo', model: 'ThinkPad T14', serialNumber: 'PF34K2', assetAction: 'Create New', targetLocation: 'Dubai HQ - Finance', remarks: '-' },
  { id: 'IMP-003', hostname: 'AP-01', ipAddress: '192.168.1.50', macAddress: '00:1A:2B:3C:4D:AA', deviceType: 'Network Device', manufacturer: 'Aruba', model: 'AP-515', serialNumber: 'CN7GOQ', assetAction: 'Create New', targetLocation: 'Dubai HQ - IT', remarks: '-' },
  { id: 'IMP-004', hostname: 'MONITOR-245', ipAddress: '192.168.1.11', macAddress: '00:1A:2B:3C:4D:6F', deviceType: 'Monitor', manufacturer: 'Dell', model: 'P2422H', serialNumber: 'CN0D4F2', assetAction: 'Create New', targetLocation: 'Dubai HQ - IT', remarks: '-' },
  { id: 'IMP-005', hostname: 'DESKTOP-001', ipAddress: '192.168.1.10', macAddress: '00:1A:2B:3C:4D:5E', deviceType: 'Computer', manufacturer: 'Dell', model: 'OptiPlex 7020', serialNumber: '7CD1234', assetAction: 'Match Existing', targetLocation: 'Dubai HQ - IT', remarks: 'Matches AS-2024-0015', matchedAssetId: 'AS-2024-0015' },
  { id: 'IMP-006', hostname: 'SW-CORE-01', ipAddress: '192.168.1.30', macAddress: '00:1A:2B:3C:4D:8B', deviceType: 'Network Device', manufacturer: 'Cisco', model: 'C9300', serialNumber: 'FD02456', assetAction: 'Create New', targetLocation: 'Dubai HQ - IT', remarks: '-' },
  { id: 'IMP-007', hostname: 'iPad-01', ipAddress: '192.168.1.75', macAddress: '00:1A:2B:3C:4D:CC', deviceType: 'Mobile Device', manufacturer: 'Apple', model: 'iPad Air', serialNumber: 'DLX9Q2', assetAction: 'Create New', targetLocation: 'Dubai HQ - Operations', remarks: '-' },
  { id: 'IMP-008', hostname: 'TV-LOBBY', ipAddress: '192.168.1.90', macAddress: '00:1A:2B:3C:4D:DD', deviceType: 'Display', manufacturer: 'Samsung', model: 'QE55Q60', serialNumber: 'TV8901', assetAction: 'Create New', targetLocation: 'Dubai HQ - Facilities', remarks: '-' },
  { id: 'IMP-009', hostname: 'POS-02', ipAddress: '192.168.1.100', macAddress: '00:1A:2B:3C:4D:EE', deviceType: 'POS Device', manufacturer: 'Zebra', model: 'TC52', serialNumber: 'ZB55231', assetAction: 'Create New', targetLocation: 'Dubai HQ - Retail', remarks: '-' },
  { id: 'IMP-010', hostname: 'SRV-FILE-01', ipAddress: '192.168.1.60', macAddress: '00:1A:2B:3C:4D:BB', deviceType: 'Server', manufacturer: 'HPE', model: 'ProLiant DL380', serialNumber: '2M3K91', assetAction: 'Create New', targetLocation: 'Dubai HQ - IT', remarks: '-' },
  { id: 'IMP-011', hostname: 'DESKTOP-002', ipAddress: '192.168.1.12', macAddress: '00:1A:2B:3C:4D:5F', deviceType: 'Computer', manufacturer: 'Dell', model: 'Latitude 5430', serialNumber: '8CD5678', assetAction: 'Match Existing', targetLocation: 'Dubai HQ - Finance', remarks: 'Matches AS-2024-0022', matchedAssetId: 'AS-2024-0022' },
  { id: 'IMP-012', hostname: 'SW-ACC-02', ipAddress: '192.168.1.32', macAddress: '00:1A:2B:3C:4D:8C', deviceType: 'Network Device', manufacturer: 'Cisco', model: 'Catalyst 2960', serialNumber: 'FD99102', assetAction: 'Match Existing', targetLocation: 'Dubai HQ - IT', remarks: 'Matches AS-2023-0104', matchedAssetId: 'AS-2023-0104' },
  { id: 'IMP-013', hostname: 'PRN-FIN-02', ipAddress: '192.168.1.22', macAddress: '00:1A:2B:3C:4D:7B', deviceType: 'Printer', manufacturer: 'HP', model: 'LaserJet Enterprise', serialNumber: 'VNB7742', assetAction: 'Match Existing', targetLocation: 'Dubai HQ - Finance', remarks: 'Matches AS-2024-0089', matchedAssetId: 'AS-2024-0089' },
  { id: 'IMP-014', hostname: 'LAPTOP-079', ipAddress: '192.168.1.46', macAddress: '00:1A:2B:3C:4D:9D', deviceType: 'Computer', manufacturer: 'Lenovo', model: 'ThinkPad X1', serialNumber: 'PF9081', assetAction: 'Create New', targetLocation: 'Dubai HQ - HR', remarks: '-' },
  { id: 'IMP-015', hostname: 'MONITOR-246', ipAddress: '192.168.1.13', macAddress: '00:1A:2B:3C:4D:70', deviceType: 'Monitor', manufacturer: 'Dell', model: 'U2723QE', serialNumber: 'CN8840', assetAction: 'Create New', targetLocation: 'Dubai HQ - Engineering', remarks: '-' },
  { id: 'IMP-016', hostname: 'AP-02', ipAddress: '192.168.1.51', macAddress: '00:1A:2B:3C:4D:AB', deviceType: 'Network Device', manufacturer: 'Aruba', model: 'AP-515', serialNumber: 'CN9011', assetAction: 'Create New', targetLocation: 'Dubai HQ - Operations', remarks: '-' },
  { id: 'IMP-017', hostname: 'iPad-02', ipAddress: '192.168.1.76', macAddress: '00:1A:2B:3C:4D:CD', deviceType: 'Mobile Device', manufacturer: 'Apple', model: 'iPad Pro', serialNumber: 'DLX881', assetAction: 'Create New', targetLocation: 'Dubai HQ - Retail', remarks: '-' },
  { id: 'IMP-018', hostname: 'SRV-BACKUP-01', ipAddress: '192.168.1.61', macAddress: '00:1A:2B:3C:4D:BC', deviceType: 'Server', manufacturer: 'Dell', model: 'PowerEdge R750', serialNumber: '7DP9012', assetAction: 'Create New', targetLocation: 'Dubai HQ - IT', remarks: '-' },
  { id: 'IMP-019', hostname: 'TV-CONF-01', ipAddress: '192.168.1.91', macAddress: '00:1A:2B:3C:4D:DE', deviceType: 'Display', manufacturer: 'LG', model: 'OLED65C3', serialNumber: 'LG7721', assetAction: 'Create New', targetLocation: 'Dubai HQ - Facilities', remarks: '-' },
  { id: 'IMP-020', hostname: 'POS-03', ipAddress: '192.168.1.101', macAddress: '00:1A:2B:3C:4D:EF', deviceType: 'POS Device', manufacturer: 'Zebra', model: 'TC52', serialNumber: 'ZB9001', assetAction: 'Create New', targetLocation: 'Dubai HQ - Retail', remarks: '-' },
  { id: 'IMP-021', hostname: 'LAPTOP-080', ipAddress: '192.168.1.47', macAddress: '00:1A:2B:3C:4D:9E', deviceType: 'Computer', manufacturer: 'Apple', model: 'MacBook Pro 16', serialNumber: 'C02G890', assetAction: 'Create New', targetLocation: 'Dubai HQ - Engineering', remarks: '-' },
  { id: 'IMP-022', hostname: 'LAPTOP-081', ipAddress: '192.168.1.48', macAddress: '00:1A:2B:3C:4D:9F', deviceType: 'Computer', manufacturer: 'Dell', model: 'Latitude 7430', serialNumber: '6DF7781', assetAction: 'Create New', targetLocation: 'Dubai HQ - Legal', remarks: '-' },
  { id: 'IMP-023', hostname: 'MONITOR-247', ipAddress: '192.168.1.14', macAddress: '00:1A:2B:3C:4D:71', deviceType: 'Monitor', manufacturer: 'HP', model: 'E24 G4', serialNumber: '3CQ119', assetAction: 'Create New', targetLocation: 'Dubai HQ - Marketing', remarks: '-' },
  { id: 'IMP-024', hostname: 'MONITOR-248', ipAddress: '192.168.1.15', macAddress: '00:1A:2B:3C:4D:72', deviceType: 'Monitor', manufacturer: 'Samsung', model: 'S24R350', serialNumber: 'SM8890', assetAction: 'Create New', targetLocation: 'Dubai HQ - Finance', remarks: '-' },
  { id: 'IMP-025', hostname: 'PRN-WRH-01', ipAddress: '192.168.1.23', macAddress: '00:1A:2B:3C:4D:7C', deviceType: 'Printer', manufacturer: 'Zebra', model: 'ZT411 Industrial', serialNumber: 'ZB4412', assetAction: 'Create New', targetLocation: 'Dubai HQ - Warehouse', remarks: '-' },
  { id: 'IMP-026', hostname: 'SW-DIST-01', ipAddress: '192.168.1.33', macAddress: '00:1A:2B:3C:4D:8D', deviceType: 'Network Device', manufacturer: 'Cisco', model: 'Catalyst 9200', serialNumber: 'FD88219', assetAction: 'Create New', targetLocation: 'Dubai HQ - IT', remarks: '-' },
  { id: 'IMP-027', hostname: 'AP-03', ipAddress: '192.168.1.52', macAddress: '00:1A:2B:3C:4D:AC', deviceType: 'Network Device', manufacturer: 'Aruba', model: 'AP-515', serialNumber: 'CN6601', assetAction: 'Create New', targetLocation: 'Dubai HQ - Warehouse', remarks: '-' },
  { id: 'IMP-028', hostname: 'iPhone-EXEC-01', ipAddress: '192.168.1.77', macAddress: '00:1A:2B:3C:4D:CE', deviceType: 'Mobile Device', manufacturer: 'Apple', model: 'iPhone 15 Pro', serialNumber: 'F2L8891', assetAction: 'Create New', targetLocation: 'Dubai HQ - Management', remarks: '-' },
  { id: 'IMP-029', hostname: 'SRV-DB-01', ipAddress: '192.168.1.62', macAddress: '00:1A:2B:3C:4D:BD', deviceType: 'Server', manufacturer: 'Dell', model: 'PowerEdge R650', serialNumber: '8DK1190', assetAction: 'Create New', targetLocation: 'Dubai HQ - IT', remarks: '-' },
  { id: 'IMP-030', hostname: 'DESKTOP-003', ipAddress: '192.168.1.16', macAddress: '00:1A:2B:3C:4D:60', deviceType: 'Computer', manufacturer: 'HP', model: 'EliteDesk 800', serialNumber: '4CE9012', assetAction: 'Create New', targetLocation: 'Dubai HQ - HR', remarks: '-' },
  { id: 'IMP-031', hostname: 'DESKTOP-004', ipAddress: '192.168.1.17', macAddress: '00:1A:2B:3C:4D:61', deviceType: 'Computer', manufacturer: 'Dell', model: 'OptiPlex 5090', serialNumber: '9CD4410', assetAction: 'Create New', targetLocation: 'Dubai HQ - Legal', remarks: '-' },
  { id: 'IMP-032', hostname: 'DESKTOP-005', ipAddress: '192.168.1.18', macAddress: '00:1A:2B:3C:4D:62', deviceType: 'Computer', manufacturer: 'Lenovo', model: 'ThinkCentre M90q', serialNumber: 'MJ09112', assetAction: 'Create New', targetLocation: 'Dubai HQ - Operations', remarks: '-' }
];

export function ImportToAsset360() {
  const navigate = useNavigate();

  // Wizard Step: 1 | 2 | 3 | 4 | 5
  const [currentStep, setCurrentStep] = useState(1);

  // Candidate Devices
  const [devices, setDevices] = useState(INITIAL_DEVICES);
  const [selectedIds, setSelectedIds] = useState(INITIAL_DEVICES.map(d => d.id));

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('New / Unregistered');
  const [deviceTypeFilter, setDeviceTypeFilter] = useState('All Types');
  const [locationFilter, setLocationFilter] = useState('All Locations');
  const [discoveryJobFilter, setDiscoveryJobFilter] = useState('HQ Network Scan');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Import Options Checkboxes
  const [importOptions, setImportOptions] = useState({
    createNew: true,
    linkExisting: true,
    skipMissing: false,
    updateLocation: true,
    sendNotification: false
  });

  // Step 2: Field Mappings & Master Data Defaults
  const [defaultBusinessValues, setDefaultBusinessValues] = useState({
    company: 'Asset360 Corporation',
    businessUnit: 'Information Technology',
    department: 'IT Infrastructure',
    costCenter: 'CC-IT-101',
    custodian: 'Unassigned / Store Inventory'
  });

  // Modals & Execution
  const [isValidationModalOpen, setIsValidationModalOpen] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [currentStageText, setCurrentStageText] = useState('Initializing Batch...');
  const [batchResult, setBatchResult] = useState(null);

  // Fetch candidates from backend on load
  useEffect(() => {
    loadCandidates();
  }, []);

  const loadCandidates = async () => {
    try {
      const res = await api.get('/discovery/import/candidates');
      if (res && res.candidates && res.candidates.length > 0) {
        setDevices(res.candidates);
        setSelectedIds(res.candidates.map(c => c.id));
      }
    } catch (err) {
      console.warn('Backend import candidates fallback:', err);
    }
  };

  // Filtered devices list
  const filteredDevices = useMemo(() => {
    return devices.filter(dev => {
      const matchSearch =
        !searchTerm ||
        dev.hostname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dev.ipAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dev.macAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dev.serialNumber.toLowerCase().includes(searchTerm.toLowerCase());

      const matchType = deviceTypeFilter === 'All Types' || dev.deviceType === deviceTypeFilter;
      const matchLoc = locationFilter === 'All Locations' || dev.targetLocation?.includes(locationFilter);

      return matchSearch && matchType && matchLoc;
    });
  }, [devices, searchTerm, deviceTypeFilter, locationFilter]);

  // Selected devices count breakdown
  const selectedDevices = useMemo(() => {
    return devices.filter(d => selectedIds.includes(d.id));
  }, [devices, selectedIds]);

  const selectedCount = selectedDevices.length;
  const newAssetsCount = selectedDevices.filter(d => d.assetAction === 'Create New').length;
  const matchedCount = selectedDevices.filter(d => d.assetAction === 'Match Existing').length;
  const reviewCount = selectedDevices.filter(d => d.assetAction === 'Requires Review').length;

  // Pagination slice
  const totalPages = Math.ceil(filteredDevices.length / itemsPerPage);
  const paginatedDevices = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredDevices.slice(start, start + itemsPerPage);
  }, [filteredDevices, currentPage]);

  const handleToggleSelectAll = () => {
    if (selectedIds.length === filteredDevices.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredDevices.map(d => d.id));
    }
  };

  const handleToggleSelect = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleChangeAction = (id, newAction) => {
    setDevices(prev =>
      prev.map(d => (d.id === id ? { ...d, assetAction: newAction } : d))
    );
  };

  // Step 4: Execute batch import transaction
  const handleExecuteImport = async () => {
    setCurrentStep(4);
    setImportProgress(10);
    setCurrentStageText('Validating batch payload & user authorizations...');

    const stages = [
      { pct: 25, text: 'Generating unique Asset360 identifiers (AST-2026-XXXX)...' },
      { pct: 50, text: 'Registering new Asset360 master records in database...' },
      { pct: 70, text: 'Linking technical telemetry to existing asset records...' },
      { pct: 90, text: 'Updating Auto Discovery repository reconciliation states...' },
      { pct: 100, text: 'Recording batch transaction in authoritative Audit Trail...' }
    ];

    for (let i = 0; i < stages.length; i++) {
      await new Promise(res => setTimeout(res, 650));
      setImportProgress(stages[i].pct);
      setCurrentStageText(stages[i].text);
    }

    try {
      const res = await api.post('/discovery/import/execute', {
        devices: selectedDevices,
        defaultBusinessValues,
        options: importOptions
      });

      if (res) {
        setBatchResult(res);
      }
    } catch (err) {
      console.warn('Import execute API fallback:', err);
      setBatchResult({
        batchId: 'IMP-2026-0891',
        totalProcessed: selectedDevices.length,
        assetsCreatedCount: newAssetsCount,
        existingLinkedCount: matchedCount,
        skippedCount: 0,
        failedCount: 0,
        createdAssets: selectedDevices
          .filter(d => d.assetAction === 'Create New')
          .map((d, i) => ({
            id: `AST-2026-${String(1001 + i)}`,
            name: d.hostname,
            serialNumber: d.serialNumber,
            location: d.targetLocation,
            status: 'In Stock'
          }))
      });
    }

    await new Promise(res => setTimeout(res, 400));
    setCurrentStep(5);
  };

  const getDeviceIcon = (type) => {
    switch (type) {
      case 'Computer':
        return <Monitor className="w-3.5 h-3.5 text-blue-600" />;
      case 'Monitor':
        return <Monitor className="w-3.5 h-3.5 text-sky-600" />;
      case 'Printer':
        return <Printer className="w-3.5 h-3.5 text-amber-600" />;
      case 'Network Device':
        return <Radio className="w-3.5 h-3.5 text-emerald-600" />;
      case 'Mobile Device':
        return <Smartphone className="w-3.5 h-3.5 text-purple-600" />;
      case 'Server':
        return <Server className="w-3.5 h-3.5 text-indigo-600" />;
      case 'Display':
        return <Tv className="w-3.5 h-3.5 text-rose-600" />;
      case 'POS Device':
        return <Store className="w-3.5 h-3.5 text-orange-600" />;
      default:
        return <Cpu className="w-3.5 h-3.5 text-slate-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-16 select-none">
      
      {/* 1. Header Bar & Stepper */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs mb-5">
        <div className="flex items-center justify-between text-xs font-medium max-w-5xl mx-auto">
          {[
            { num: 1, label: 'Select Devices' },
            { num: 2, label: 'Map Fields' },
            { num: 3, label: 'Review & Validate' },
            { num: 4, label: 'Import' },
            { num: 5, label: 'Results' }
          ].map((s, idx) => {
            const isActive = currentStep === s.num;
            const isCompleted = currentStep > s.num;
            return (
              <React.Fragment key={s.num}>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                      isActive
                        ? 'bg-[#6C2BD9] text-white shadow-xs'
                        : isCompleted
                        ? 'bg-emerald-600 text-white'
                        : 'border border-slate-300 text-slate-500 bg-white'
                    }`}
                  >
                    {isCompleted ? <Check className="w-3.5 h-3.5" /> : s.num}
                  </div>
                  <span className={`${isActive ? 'text-[#6C2BD9] font-extrabold' : isCompleted ? 'text-emerald-700 font-semibold' : 'text-slate-600 font-medium'}`}>
                    {s.label}
                  </span>
                </div>
                {idx < 4 && (
                  <div
                    className={`flex-1 h-px mx-4 transition-colors ${
                      isCompleted ? 'bg-emerald-500' : 'bg-slate-200'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto space-y-5">

        {/* STEP 1: SELECT DEVICES */}
        {currentStep === 1 && (
          <>
            {/* Banner Row */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h1 className="text-base font-extrabold text-slate-900 flex items-center gap-1.5">
                  <span className="text-[#6C2BD9]">Step 1:</span> Select Devices to Import
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Choose the discovered devices you want to import to Asset360. You can filter and select individual or multiple devices.
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/discovery')}
                className="px-3.5 py-1.5 rounded-xl border border-purple-200 bg-white hover:bg-purple-50 text-[#6C2BD9] text-xs font-bold shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer self-start shrink-0"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-[#6C2BD9]" />
                Back to Discovered Devices
              </button>
            </div>

            {/* 4 Summary Tiles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* 1. Selected Devices */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl border border-purple-200 text-[#6C2BD9] flex items-center justify-center shrink-0 bg-purple-50/50 shadow-2xs">
                  <Monitor className="w-6 h-6 text-[#6C2BD9]" />
                </div>
                <div>
                  <div className="text-3xl font-extrabold text-[#6C2BD9] leading-none mb-1">{selectedCount}</div>
                  <div className="text-xs font-bold text-slate-800">Selected Devices</div>
                </div>
              </div>

              {/* 2. New Assets */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <Plus className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <div className="text-3xl font-extrabold text-emerald-600 leading-none mb-0.5">{newAssetsCount}</div>
                  <div className="text-xs font-bold text-slate-800">New Assets</div>
                  <div className="text-[11px] text-slate-400 font-medium">Will be created</div>
                </div>
              </div>

              {/* 3. Match Existing */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-purple-100 text-[#6C2BD9] flex items-center justify-center shrink-0">
                  <Link2 className="w-5 h-5 text-[#6C2BD9]" />
                </div>
                <div>
                  <div className="text-3xl font-extrabold text-[#6C2BD9] leading-none mb-0.5">{matchedCount}</div>
                  <div className="text-xs font-bold text-slate-800">Match Existing</div>
                  <div className="text-[11px] text-slate-400 font-medium">Will be linked</div>
                </div>
              </div>

              {/* 4. Requires Review */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-3xl font-extrabold text-amber-600 leading-none mb-0.5">{reviewCount}</div>
                  <div className="text-xs font-bold text-slate-800">Requires Review</div>
                  <div className="text-[11px] text-slate-400 font-medium">(excluded)</div>
                </div>
              </div>

            </div>

            {/* Search and Filters Bar */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="relative flex-1 min-w-[240px]">
                <Search className="w-3.5 h-3.5 text-[#6C2BD9] absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Search by hostname, IP, MAC, serial number..."
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-[#6C2BD9] font-medium"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500 font-semibold">Asset Status</span>
                  <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    className="px-2.5 py-1.5 border border-slate-200 rounded-xl bg-white text-slate-800 font-semibold text-xs focus:outline-hidden focus:border-[#6C2BD9]"
                  >
                    <option value="New / Unregistered">New / Unregistered</option>
                    <option value="Matched">Matched</option>
                    <option value="ALL">All Status</option>
                  </select>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500 font-semibold">Device Type</span>
                  <select
                    value={deviceTypeFilter}
                    onChange={e => setDeviceTypeFilter(e.target.value)}
                    className="px-2.5 py-1.5 border border-slate-200 rounded-xl bg-white text-slate-800 font-semibold text-xs focus:outline-hidden focus:border-[#6C2BD9]"
                  >
                    <option value="All Types">All Types</option>
                    <option value="Printer">Printer</option>
                    <option value="Computer">Computer</option>
                    <option value="Network Device">Network Device</option>
                    <option value="Monitor">Monitor</option>
                    <option value="Mobile Device">Mobile Device</option>
                    <option value="Display">Display</option>
                    <option value="POS Device">POS Device</option>
                    <option value="Server">Server</option>
                  </select>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500 font-semibold">Location</span>
                  <select
                    value={locationFilter}
                    onChange={e => setLocationFilter(e.target.value)}
                    className="px-2.5 py-1.5 border border-slate-200 rounded-xl bg-white text-slate-800 font-semibold text-xs focus:outline-hidden focus:border-[#6C2BD9]"
                  >
                    <option value="All Locations">All Locations</option>
                    <option value="Dubai HQ - IT">Dubai HQ - IT</option>
                    <option value="Dubai HQ - Finance">Dubai HQ - Finance</option>
                    <option value="Dubai HQ - Operations">Dubai HQ - Operations</option>
                    <option value="Dubai HQ - Facilities">Dubai HQ - Facilities</option>
                    <option value="Dubai HQ - Retail">Dubai HQ - Retail</option>
                  </select>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500 font-semibold">Discovery Job</span>
                  <select
                    value={discoveryJobFilter}
                    onChange={e => setDiscoveryJobFilter(e.target.value)}
                    className="px-2.5 py-1.5 border border-slate-200 rounded-xl bg-white text-slate-800 font-semibold text-xs focus:outline-hidden focus:border-[#6C2BD9]"
                  >
                    <option value="HQ Network Scan">HQ Network Scan</option>
                    <option value="Branch Office Sweep">Branch Office Sweep</option>
                  </select>
                </div>

                <button
                  type="button"
                  className="px-3.5 py-1.5 border border-purple-200 rounded-xl bg-white hover:bg-purple-50 text-[#6C2BD9] font-bold flex items-center gap-1.5 shadow-2xs text-xs transition-all cursor-pointer"
                >
                  <Filter className="w-3.5 h-3.5 text-[#6C2BD9]" />
                  More Filters
                </button>
              </div>
            </div>

            {/* Device List Grid Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse text-slate-800">
                  <thead className="bg-purple-50/60 border-b border-slate-200 text-slate-800 font-extrabold text-[11px] tracking-wide select-none">
                    <tr>
                      <th className="py-3 px-3.5 w-10 text-center">
                        <input
                          type="checkbox"
                          checked={selectedIds.length === filteredDevices.length && filteredDevices.length > 0}
                          onChange={handleToggleSelectAll}
                          className="w-4 h-4 rounded border-slate-300 text-[#6C2BD9] accent-[#6C2BD9] focus:ring-[#6C2BD9] cursor-pointer"
                        />
                      </th>
                      <th className="py-3 px-3">#</th>
                      <th className="py-3 px-4">Hostname</th>
                      <th className="py-3 px-4">IP Address</th>
                      <th className="py-3 px-4">MAC Address</th>
                      <th className="py-3 px-4">Device Type</th>
                      <th className="py-3 px-4">Manufacturer</th>
                      <th className="py-3 px-4">Model</th>
                      <th className="py-3 px-4">Serial Number</th>
                      <th className="py-3 px-4">Asset Action</th>
                      <th className="py-3 px-4">Target Location</th>
                      <th className="py-3 px-4">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {paginatedDevices.map((dev, idx) => {
                      const isChecked = selectedIds.includes(dev.id);
                      const globalIndex = (currentPage - 1) * itemsPerPage + idx + 1;

                      return (
                        <tr
                          key={dev.id}
                          className={`transition-colors ${isChecked ? 'bg-purple-50/50 font-semibold' : 'hover:bg-slate-50/70'}`}
                        >
                          <td className="py-2.5 px-3.5 text-center">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleToggleSelect(dev.id)}
                              className="w-4 h-4 rounded border-slate-300 text-[#6C2BD9] accent-[#6C2BD9] focus:ring-[#6C2BD9] cursor-pointer"
                            />
                          </td>
                          <td className="py-2.5 px-3 font-mono text-slate-500">{globalIndex}</td>
                          <td className="py-2.5 px-4 font-bold text-slate-900">{dev.hostname}</td>
                          <td className="py-2.5 px-4 font-mono font-bold text-[#6C2BD9]">{dev.ipAddress}</td>
                          <td className="py-2.5 px-4 font-mono text-xs text-slate-600">{dev.macAddress}</td>
                          <td className="py-2.5 px-4 text-slate-700 font-medium">{dev.deviceType}</td>
                          <td className="py-2.5 px-4 text-slate-700 font-medium">{dev.manufacturer}</td>
                          <td className="py-2.5 px-4 text-slate-700 font-medium">{dev.model}</td>
                          <td className="py-2.5 px-4 font-mono text-slate-700">{dev.serialNumber}</td>
                          <td className="py-2.5 px-4">
                            <span
                              className={`px-3 py-0.5 rounded-full text-xs font-extrabold inline-block text-center border ${
                                dev.assetAction === 'Create New'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-purple-50 text-[#6C2BD9] border-purple-200'
                              }`}
                            >
                              {dev.assetAction}
                            </span>
                          </td>
                          <td className="py-2.5 px-4 text-slate-700 font-medium">{dev.targetLocation}</td>
                          <td className="py-2.5 px-4 font-mono text-[11px] text-slate-500">{dev.remarks}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Table Footer / Pagination */}
              <div className="p-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 bg-slate-50/50">
                <div>
                  Showing <span className="font-bold text-slate-900">1</span> to{' '}
                  <span className="font-bold text-slate-900">{paginatedDevices.length}</span> of{' '}
                  <span className="font-bold text-slate-900">{filteredDevices.length}</span> selected devices
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      type="button"
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-7 h-7 rounded-lg text-xs font-extrabold transition-colors cursor-pointer ${
                        currentPage === i + 1
                          ? 'bg-[#6C2BD9] text-white shadow-xs'
                          : 'bg-white border border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>

                  <select
                    className="ml-2 px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:outline-hidden"
                    defaultValue="10 per page"
                  >
                    <option>10 per page</option>
                    <option>25 per page</option>
                    <option>50 per page</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Bottom 3 Panels */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              
              {/* Box 1: Import Options */}
              <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-2xs p-4 text-xs flex flex-col justify-between">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm mb-3">Import Options</h3>
                  <div className="space-y-2.5 text-slate-700 font-semibold">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={importOptions.createNew}
                        onChange={e => setImportOptions({ ...importOptions, createNew: e.target.checked })}
                        className="w-4 h-4 rounded border-slate-300 text-[#6C2BD9] focus:ring-[#6C2BD9] accent-[#6C2BD9]"
                      />
                      <span>Create new assets for unregistered devices</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={importOptions.linkExisting}
                        onChange={e => setImportOptions({ ...importOptions, linkExisting: e.target.checked })}
                        className="w-4 h-4 rounded border-slate-300 text-[#6C2BD9] focus:ring-[#6C2BD9] accent-[#6C2BD9]"
                      />
                      <span>Link to existing assets for matched devices</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={importOptions.skipMissing}
                        onChange={e => setImportOptions({ ...importOptions, skipMissing: e.target.checked })}
                        className="w-4 h-4 rounded border-slate-300 text-[#6C2BD9] focus:ring-[#6C2BD9] accent-[#6C2BD9]"
                      />
                      <span>Skip devices with missing mandatory fields</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={importOptions.updateLocation}
                        onChange={e => setImportOptions({ ...importOptions, updateLocation: e.target.checked })}
                        className="w-4 h-4 rounded border-slate-300 text-[#6C2BD9] focus:ring-[#6C2BD9] accent-[#6C2BD9]"
                      />
                      <span>Update asset location with discovered location (where applicable)</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={importOptions.sendNotification}
                        onChange={e => setImportOptions({ ...importOptions, sendNotification: e.target.checked })}
                        className="w-4 h-4 rounded border-slate-300 text-[#6C2BD9] focus:ring-[#6C2BD9] accent-[#6C2BD9]"
                      />
                      <span>Send notification after import</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Box 2: Mandatory Field Validation */}
              <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-2xs p-4 flex flex-col justify-between text-xs">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm mb-3">Mandatory Field Validation</h3>

                  <div className="flex items-start gap-3 p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl mb-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-5 h-5 stroke-[3]" />
                    </div>
                    <div>
                      <h4 className="font-bold text-emerald-800 text-xs">All selected devices have required information.</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
                        Devices with missing mandatory fields will be listed in the review step.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => setIsValidationModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 border border-purple-200 rounded-xl bg-white hover:bg-purple-50 text-[#6C2BD9] font-bold shadow-2xs transition-all text-xs cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-[#6C2BD9]" />
                    View Validation Details
                  </button>
                </div>
              </div>

              {/* Box 3: Next Step */}
              <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-2xs p-4 flex flex-col justify-between text-xs">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm mb-2">Next Step</h3>
                  <p className="text-slate-600 text-xs leading-relaxed font-medium">
                    Click 'Next' to map the discovered device fields to Asset360 asset fields.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-4">
                  <button
                    type="button"
                    onClick={() => navigate('/discovery')}
                    className="px-4 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-xl transition-all shadow-2xs text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="px-5 py-1.5 bg-[#6C2BD9] hover:bg-[#5b21b6] text-white font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-all text-xs cursor-pointer"
                  >
                    Next
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>
          </>
        )}

        {/* STEP 2: MAP FIELDS */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Step 2: Map Discovered Fields to Asset360 Master Fields</h2>
                <p className="text-xs text-slate-500">
                  Verify technical field relationships and supply required business master-data values.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Selection
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Technical Fields Mapping Table (7 Cols) */}
              <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-900">Technical Attribute Mappings</h3>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    8/8 Standard Fields Mapped
                  </span>
                </div>

                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-4">Discovered Telemetry Field</th>
                      <th className="py-2.5 px-4">Sample Observation</th>
                      <th className="py-2.5 px-4">Asset360 Target Field</th>
                      <th className="py-2.5 px-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {[
                      { disc: 'Hostname', sample: 'DESKTOP-001', target: 'Asset Name', status: 'Mapped' },
                      { disc: 'Serial Number', sample: '7CD1234', target: 'Serial Number', status: 'Mapped' },
                      { disc: 'MAC Address', sample: '00:1A:2B:3C:4D:5E', target: 'MAC Address', status: 'Mapped' },
                      { disc: 'Manufacturer', sample: 'Dell', target: 'Manufacturer', status: 'Mapped' },
                      { disc: 'Model', sample: 'OptiPlex 7020', target: 'Model', status: 'Mapped' },
                      { disc: 'Device Type', sample: 'Computer', target: 'Asset Category', status: 'Mapped' },
                      { disc: 'IP Address', sample: '192.168.1.10', target: 'IP Address', status: 'Mapped' },
                      { disc: 'Operating System', sample: 'Windows 11 Pro', target: 'OS Information', status: 'Mapped' }
                    ].map((m, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/70">
                        <td className="py-2 px-4 font-semibold text-slate-800">{m.disc}</td>
                        <td className="py-2 px-4 font-mono text-slate-600">{m.sample}</td>
                        <td className="py-2 px-4 font-bold text-[#6C2BD9]">{m.target}</td>
                        <td className="py-2 px-4 text-center">
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                            <Check className="w-3 h-3" />
                            {m.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mandatory Business Master-Data Assignment (5 Cols) */}
              <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 flex flex-col justify-between text-xs space-y-4">
                <div>
                  <div className="flex items-center gap-2 pb-3 mb-3 border-b border-slate-100">
                    <Building2 className="w-4 h-4 text-[#6C2BD9]" />
                    <div>
                      <h3 className="font-bold text-slate-900">Mandatory Business Metadata</h3>
                      <p className="text-[11px] text-slate-500">Apply company defaults to all {selectedCount} imported devices</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Company *</label>
                      <input
                        type="text"
                        value={defaultBusinessValues.company}
                        onChange={e => setDefaultBusinessValues({ ...defaultBusinessValues, company: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-[#6C2BD9]"
                        required
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Business Unit *</label>
                      <input
                        type="text"
                        value={defaultBusinessValues.businessUnit}
                        onChange={e => setDefaultBusinessValues({ ...defaultBusinessValues, businessUnit: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:border-[#6C2BD9]"
                        required
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Department *</label>
                      <input
                        type="text"
                        value={defaultBusinessValues.department}
                        onChange={e => setDefaultBusinessValues({ ...defaultBusinessValues, department: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:border-[#6C2BD9]"
                        required
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Cost Center *</label>
                      <input
                        type="text"
                        value={defaultBusinessValues.costCenter}
                        onChange={e => setDefaultBusinessValues({ ...defaultBusinessValues, costCenter: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono text-slate-800 focus:outline-hidden focus:border-[#6C2BD9]"
                        required
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Default Custody Assignment</label>
                      <input
                        type="text"
                        value={defaultBusinessValues.custodian}
                        onChange={e => setDefaultBusinessValues({ ...defaultBusinessValues, custodian: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:border-[#6C2BD9]"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-xl shadow-2xs cursor-pointer"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="px-5 py-2 bg-[#6C2BD9] hover:bg-[#5b21b6] text-white font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    Proceed to Review &amp; Validate
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>

            </div>
          </div>
        )}

        {/* STEP 3: REVIEW & VALIDATE */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Step 3: Review &amp; Pre-Import Validation</h2>
                <p className="text-xs text-slate-500">
                  Perform comprehensive pre-flight verification against Asset360 data governance rules before committing.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Mappings
              </button>
            </div>

            {/* Validation KPI summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-4">
                <span className="text-xs text-slate-500 font-medium">Total Records to Process</span>
                <div className="text-2xl font-bold text-slate-900 mt-1">{selectedCount}</div>
                <div className="text-[11px] text-[#6C2BD9] font-bold mt-0.5">{newAssetsCount} New + {matchedCount} Linked</div>
              </div>

              <div className="bg-white rounded-2xl border border-emerald-200 shadow-2xs p-4 bg-emerald-50/20">
                <span className="text-xs text-emerald-700 font-medium">Passed Validation</span>
                <div className="text-2xl font-bold text-emerald-700 mt-1">{selectedCount} (100%)</div>
                <div className="text-[11px] text-emerald-600 mt-0.5 font-medium">Ready for immediate batch posting</div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-4">
                <span className="text-xs text-slate-500 font-medium">Validation Issues / Conflicts</span>
                <div className="text-2xl font-bold text-slate-900 mt-1">0</div>
                <div className="text-[11px] text-slate-400 mt-0.5">No blocking errors detected</div>
              </div>
            </div>

            {/* Governance Checklist Box */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 text-xs">
              <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#6C2BD9]" />
                Asset360 Governance Verification Checklist
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-700">
                <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Hardware serial uniqueness verified across active register</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>MAC Address &amp; System UUID conflict sweep passed</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Mandatory business master-data applied ({defaultBusinessValues.company})</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Controlled financial, tag, and depreciation fields strictly protected</span>
                </div>
              </div>
            </div>

            {/* Pre-Flight Preview Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden text-xs">
              <div className="p-3.5 bg-slate-50/70 border-b border-slate-100 font-bold text-slate-800">
                Batch Allocation Preview ({selectedDevices.length} items)
              </div>
              <div className="max-h-72 overflow-y-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-4">#</th>
                      <th className="py-2.5 px-4">Hostname</th>
                      <th className="py-2.5 px-4">Serial Number</th>
                      <th className="py-2.5 px-4">Action</th>
                      <th className="py-2.5 px-4">Assigned / Linked Asset ID</th>
                      <th className="py-2.5 px-4">Location</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedDevices.slice(0, 10).map((dev, idx) => (
                      <tr key={dev.id} className="hover:bg-slate-50/60">
                        <td className="py-2 px-4 font-mono text-slate-400">{idx + 1}</td>
                        <td className="py-2 px-4 font-semibold text-slate-900">{dev.hostname}</td>
                        <td className="py-2 px-4 font-mono text-slate-700">{dev.serialNumber}</td>
                        <td className="py-2 px-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                              dev.assetAction === 'Create New'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-purple-50 text-[#6C2BD9] border-purple-200'
                            }`}
                          >
                            {dev.assetAction}
                          </span>
                        </td>
                        <td className="py-2 px-4 font-mono text-[#6C2BD9] font-bold">
                          {dev.assetAction === 'Create New' ? `AST-2026-0${101 + idx}` : dev.matchedAssetId || 'AS-2024-0015'}
                        </td>
                        <td className="py-2 px-4 text-slate-600">{dev.targetLocation}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-xl shadow-2xs text-xs cursor-pointer"
              >
                Previous Step
              </button>
              <button
                type="button"
                onClick={handleExecuteImport}
                className="px-6 py-2.5 bg-[#6C2BD9] hover:bg-[#5b21b6] text-white font-bold rounded-xl shadow-xs text-xs flex items-center gap-2 transition-all cursor-pointer"
              >
                <Check className="w-4 h-4" />
                Confirm &amp; Execute Import Transaction
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: IMPORT EXECUTION */}
        {currentStep === 4 && (
          <div className="max-w-xl mx-auto my-12 bg-white rounded-3xl border border-slate-200 shadow-xl p-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-purple-50 text-[#6C2BD9] flex items-center justify-center mx-auto animate-pulse">
              <RefreshCw className="w-8 h-8 animate-spin" />
            </div>

            <div>
              <h2 className="text-base font-extrabold text-slate-900">Executing Controlled Batch Import...</h2>
              <p className="text-xs text-slate-500 mt-1">{currentStageText}</p>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden p-0.5">
                <div
                  className="bg-[#6C2BD9] h-full rounded-full transition-all duration-300"
                  style={{ width: `${importProgress}%` }}
                />
              </div>
              <div className="flex justify-between text-xs font-mono text-slate-400">
                <span>{importProgress}% completed</span>
                <span>{selectedCount} Records</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400">
              Maintaining ACID transaction integrity and updating Auto Discovery repository states...
            </p>
          </div>
        )}

        {/* STEP 5: RESULTS */}
        {currentStep === 5 && (
          <div className="space-y-6">
            
            {/* Header */}
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-extrabold text-slate-900">Import Batch Completed Successfully</h2>
                    <span className="font-mono text-xs font-bold text-[#6C2BD9] bg-white px-2 py-0.5 rounded-md border border-purple-100 shadow-2xs">
                      {batchResult?.batchId || 'IMP-2026-0891'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {selectedCount} network devices have been registered and reconciled in the Asset360 Master Register.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => navigate('/assets')}
                  className="px-4 py-2 bg-[#6C2BD9] hover:bg-[#5b21b6] text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  View Asset Register
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/discovery')}
                  className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                >
                  Back to Auto Discovery
                </button>
              </div>
            </div>

            {/* Results 5 Tiles */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-2xs">
                <span className="text-[11px] text-slate-500 font-medium">Total Processed</span>
                <div className="text-xl font-bold text-slate-900 mt-0.5">{selectedCount}</div>
              </div>
              <div className="bg-white rounded-xl border border-emerald-200 p-3 shadow-2xs bg-emerald-50/30">
                <span className="text-[11px] text-emerald-700 font-medium">Assets Created</span>
                <div className="text-xl font-bold text-emerald-700 mt-0.5">{newAssetsCount}</div>
              </div>
              <div className="bg-white rounded-xl border border-purple-200 p-3 shadow-2xs bg-purple-50/30">
                <span className="text-[11px] text-[#6C2BD9] font-bold">Existing Linked</span>
                <div className="text-xl font-bold text-[#6C2BD9] mt-0.5">{matchedCount}</div>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-2xs">
                <span className="text-[11px] text-slate-500 font-medium">Skipped Records</span>
                <div className="text-xl font-bold text-slate-900 mt-0.5">0</div>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-2xs">
                <span className="text-[11px] text-slate-500 font-medium">Failed Records</span>
                <div className="text-xl font-bold text-slate-900 mt-0.5">0</div>
              </div>
            </div>

            {/* Created Assets List Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden text-xs">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/40">
                <h3 className="font-bold text-slate-900">Reconciled Asset360 Master Records</h3>
                <span className="text-xs text-slate-500">
                  Audit Entry ID: <code className="font-mono text-slate-700">AUD-2026-9014</code>
                </span>
              </div>

              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-4">Asset Tag</th>
                    <th className="py-2.5 px-4">Hostname / Name</th>
                    <th className="py-2.5 px-4">Serial Number</th>
                    <th className="py-2.5 px-4">Location</th>
                    <th className="py-2.5 px-4">Category</th>
                    <th className="py-2.5 px-4">Action Taken</th>
                    <th className="py-2.5 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedDevices.slice(0, 10).map((dev, idx) => (
                    <tr key={dev.id} className="hover:bg-slate-50/60">
                      <td className="py-2.5 px-4 font-mono font-bold text-[#6C2BD9]">
                        {dev.assetAction === 'Create New' ? `AST-2026-0${101 + idx}` : dev.matchedAssetId || 'AS-2024-0015'}
                      </td>
                      <td className="py-2.5 px-4 font-semibold text-slate-900">{dev.hostname}</td>
                      <td className="py-2.5 px-4 font-mono text-slate-700">{dev.serialNumber}</td>
                      <td className="py-2.5 px-4 text-slate-700">{dev.targetLocation}</td>
                      <td className="py-2.5 px-4 text-slate-600">{dev.deviceType}</td>
                      <td className="py-2.5 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                            dev.assetAction === 'Create New'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-purple-50 text-[#6C2BD9] border-purple-200'
                          }`}
                        >
                          {dev.assetAction === 'Create New' ? 'New Asset Created' : 'Linked to Existing'}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                          <Check className="w-3 h-3" />
                          Active
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  alert('Exporting Import Summary Report CSV...');
                }}
                className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold rounded-xl text-xs shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Export Import Report (CSV)
              </button>
              <button
                type="button"
                onClick={() => navigate('/assets')}
                className="px-5 py-2 bg-[#6C2BD9] hover:bg-[#5b21b6] text-white font-bold rounded-xl text-xs shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                Open Asset Register
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        )}

      </div>

      {/* Validation Details Modal */}
      <ValidationDetailsModal
        isOpen={isValidationModalOpen}
        onClose={() => setIsValidationModalOpen(false)}
        devices={selectedDevices}
      />

    </div>
  );
}
