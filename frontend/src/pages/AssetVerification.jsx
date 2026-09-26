import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Search,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  RotateCcw,
  XCircle,
  QrCode,
  Scan,
  Radio,
  FileSpreadsheet,
  Download,
  Filter,
  Eye,
  Camera,
  Layers,
  Building2,
  User,
  ShieldCheck,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Upload,
  RefreshCw,
  Clock,
  Sparkles,
  Printer,
  ChevronDown,
  FileText
} from 'lucide-react';
import { api } from '../services/api';
import clsx from 'clsx';

// Pre-seeded campaign metadata matching Screenshot 28
const DEFAULT_CAMPAIGN = {
  auditId: 'AUD-2026-0008',
  auditName: 'HQ Annual IT Asset Audit 2026',
  auditType: 'Physical Verification',
  location: 'Dubai HQ - Block B',
  startDate: '01 Sep 2026',
  endDate: '15 Sep 2026',
  status: 'In Progress',
  progress: 65,
  totalExpected: 600,
  totalVerified: 390,
  totalPending: 198,
  totalNotFound: 12,
  totalExcess: 3,
  totalRelocated: 8,
  totalDamaged: 4,
  totalExceptions: 12
};

// Seeded 10 rows matching Screenshot 28 exactly
const INITIAL_ASSETS = [
  {
    id: 'exp-123',
    assetNo: 'AS-000123',
    assetName: 'Laptop - Dell 5440',
    assetType: 'IT Equipment',
    category: 'Laptops',
    model: 'Laptop - Dell Latitude 5440',
    serialNumber: '75K3D23',
    tagEpc: 'E28011606000002053A1B4B9',
    systemLocation: 'Block B > 1F > IT-101',
    verifiedLocation: 'Block B > 1F > IT-101',
    systemCustodian: 'Sara Ali',
    verifiedCustodian: 'Sara Ali',
    condition: 'Good',
    verificationStatus: 'Verified',
    lastVerified: '10 Sep 2026 10:24',
    verifiedBy: 'John Doe',
    thumbnail: '/laptop.png',
    department: 'IT'
  },
  {
    id: 'exp-124',
    assetNo: 'AS-000124',
    assetName: 'Monitor - Samsung',
    assetType: 'IT Equipment',
    category: 'Laptops',
    model: 'Laptop - Dell Latitude 5440',
    serialNumber: '75K3D24',
    tagEpc: 'E28011606000002053A1B4C0',
    systemLocation: 'Block B > 1F > IT-101',
    verifiedLocation: 'Block B > 2F > IT-201',
    systemCustodian: 'Sara Ali',
    verifiedCustodian: 'Omar Saleh',
    condition: 'Good',
    verificationStatus: 'Moved',
    lastVerified: '10 Sep 2026 11:05',
    verifiedBy: 'John Doe',
    thumbnail: '/laptop.png',
    department: 'IT'
  },
  {
    id: 'exp-125',
    assetNo: 'AS-000125',
    assetName: 'Printer - HP',
    assetType: 'IT Equipment',
    category: 'Printers',
    model: 'HP LaserJet Enterprise M507',
    serialNumber: 'CNB1L78912',
    tagEpc: 'E28011606000002053A1B4C1',
    systemLocation: 'Block B > 2F > IT-201',
    verifiedLocation: 'Block B > 2F > IT-201',
    systemCustodian: 'Layla Hassan',
    verifiedCustodian: 'Layla Hassan',
    condition: 'Good',
    verificationStatus: 'Verified',
    lastVerified: '10 Sep 2026 09:50',
    verifiedBy: 'John Doe',
    thumbnail: '/laptop.png',
    department: 'Finance'
  },
  {
    id: 'exp-126',
    assetNo: 'AS-000126',
    assetName: 'Chair - Office',
    assetType: 'Furniture',
    category: 'Chairs',
    model: 'Herman Miller Aeron',
    serialNumber: 'HM-991204',
    tagEpc: 'E28011606000002053A1B4C2',
    systemLocation: 'Block B > 2F > IT-201',
    verifiedLocation: '-',
    systemCustodian: 'Omar Saleh',
    verifiedCustodian: '-',
    condition: 'Unknown',
    verificationStatus: 'Not Found',
    lastVerified: '-',
    verifiedBy: null,
    thumbnail: '/laptop.png',
    department: 'Human Resources'
  },
  {
    id: 'exp-127',
    assetNo: 'AS-000127',
    assetName: 'Meeting Table',
    assetType: 'Furniture',
    category: 'Conference Furniture',
    model: 'Steelcase Media:scape 8-Person',
    serialNumber: 'SC-441209',
    tagEpc: 'E28011606000002053A1B4C3',
    systemLocation: 'Block B > 2F > IT-201',
    verifiedLocation: 'Block C > GF > CONF-01',
    systemCustodian: 'Omar Saleh',
    verifiedCustodian: 'Omar Saleh',
    condition: 'Good',
    verificationStatus: 'Wrong Location',
    lastVerified: '10 Sep 2026 09:30',
    verifiedBy: 'John Doe',
    thumbnail: '/laptop.png',
    department: 'Administration'
  },
  {
    id: 'exp-128',
    assetNo: 'AS-000128',
    assetName: 'Projector - Epson',
    assetType: 'IT Equipment',
    category: 'AV Equipment',
    model: 'Epson EB-2250U Full HD',
    serialNumber: 'EP-559102',
    tagEpc: 'E28011606000002053A1B4C4',
    systemLocation: 'Block C > 1F > CONF-01',
    verifiedLocation: 'Block C > 1F > CONF-01',
    systemCustodian: 'Ahmed Khan',
    verifiedCustodian: 'Ahmed Khan',
    condition: 'Good',
    verificationStatus: 'Verified',
    lastVerified: '10 Sep 2026 08:45',
    verifiedBy: 'John Doe',
    thumbnail: '/laptop.png',
    department: 'Facilities'
  },
  {
    id: 'exp-129',
    assetNo: 'AS-000129',
    assetName: 'Access Point - Cisco',
    assetType: 'Network Equipment',
    category: 'Wireless AP',
    model: 'Cisco Catalyst 9120AX',
    serialNumber: 'FOC24190AB',
    tagEpc: 'E28011606000002053A1B4C5',
    systemLocation: 'Block B > 3F > IT-301',
    verifiedLocation: 'Block B > 3F > IT-301',
    systemCustodian: 'Sara Ali',
    verifiedCustodian: 'Sara Ali',
    condition: 'Good',
    verificationStatus: 'Verified',
    lastVerified: '10 Sep 2026 11:15',
    verifiedBy: 'John Doe',
    thumbnail: '/laptop.png',
    department: 'Network Operations'
  },
  {
    id: 'exp-130',
    assetNo: 'AS-000130',
    assetName: 'Fire Extinguisher',
    assetType: 'Safety Equipment',
    category: 'Safety',
    model: 'NAFFCO CO2 5KG Portable',
    serialNumber: 'NF-661201',
    tagEpc: 'E28011606000002053A1B4C6',
    systemLocation: 'Block A > GF > Lobby',
    verifiedLocation: 'Block A > GF > Lobby',
    systemCustodian: 'Ahmed Khan',
    verifiedCustodian: 'Ahmed Khan',
    condition: 'Damaged',
    verificationStatus: 'Damaged',
    lastVerified: '10 Sep 2026 10:05',
    verifiedBy: 'John Doe',
    thumbnail: '/laptop.png',
    department: 'HSE'
  },
  {
    id: 'exp-131',
    assetNo: 'AS-000131',
    assetName: 'Switch - Cisco',
    assetType: 'Network Equipment',
    category: 'Switches',
    model: 'Cisco Catalyst 2960-X 48 Port',
    serialNumber: 'FCW2149L01',
    tagEpc: 'E28011606000002053A1B4C7',
    systemLocation: 'Block C > 2F > IT-201',
    verifiedLocation: 'Block C > 2F > IT-201',
    systemCustodian: '-',
    verifiedCustodian: '-',
    condition: 'Good',
    verificationStatus: 'Unregistered',
    lastVerified: '10 Sep 2026 12:20',
    verifiedBy: 'John Doe',
    thumbnail: '/laptop.png',
    department: 'Network Operations'
  },
  {
    id: 'exp-132',
    assetNo: 'AS-000132',
    assetName: 'iPad - Apple',
    assetType: 'IT Equipment',
    category: 'Tablets',
    model: 'Apple iPad Pro 12.9" 256GB',
    serialNumber: 'DMPZK819L',
    tagEpc: 'E28011606000002053A1B4C8',
    systemLocation: 'Block B > 1F > IT-101',
    verifiedLocation: 'Block B > 1F > IT-101',
    systemCustodian: 'Sara Ali',
    verifiedCustodian: 'Sara Ali',
    condition: 'Good',
    verificationStatus: 'Verified',
    lastVerified: '10 Sep 2026 08:10',
    verifiedBy: 'John Doe',
    thumbnail: '/laptop.png',
    department: 'Executive Office'
  }
];

// Initial 12 discrepancies
const INITIAL_DISCREPANCIES = [
  {
    id: 'DISC-001',
    exceptionNo: 'EXC-2026-001',
    assetNo: 'AS-000124',
    assetName: 'Laptop - Dell Latitude 5440',
    serialNumber: '75K3D24',
    exceptionType: 'WRONG_LOCATION',
    typeLabel: 'Wrong Location / Moved',
    severity: 'MEDIUM',
    systemLocation: 'Block B > 1F > IT-101',
    verifiedLocation: 'Block B > 2F > IT-201',
    systemCustodian: 'Sara Ali',
    verifiedCustodian: 'Omar Saleh',
    status: 'PENDING_RECONCILIATION',
    proposedAction: 'RELOCATION_TRANSFER',
    actionLabel: 'Create Relocation Transfer',
    resolved: false
  },
  {
    id: 'DISC-002',
    exceptionNo: 'EXC-2026-002',
    assetNo: 'AS-000126',
    assetName: 'Chair - Office (Herman Miller)',
    serialNumber: 'HM-991204',
    exceptionType: 'NOT_FOUND',
    typeLabel: 'Expected - Not Found',
    severity: 'HIGH',
    systemLocation: 'Block B > 2F > IT-201',
    verifiedLocation: '-',
    systemCustodian: 'Omar Saleh',
    verifiedCustodian: '-',
    status: 'PENDING_RECONCILIATION',
    proposedAction: 'INVESTIGATION',
    actionLabel: 'Initiate Investigation',
    resolved: false
  },
  {
    id: 'DISC-003',
    exceptionNo: 'EXC-2026-003',
    assetNo: 'AS-000127',
    assetName: 'Meeting Table (Steelcase Media:scape)',
    serialNumber: 'SC-441209',
    exceptionType: 'WRONG_LOCATION',
    typeLabel: 'Wrong Location',
    severity: 'MEDIUM',
    systemLocation: 'Block B > 2F > IT-201',
    verifiedLocation: 'Block C > GF > CONF-01',
    systemCustodian: 'Omar Saleh',
    verifiedCustodian: 'Omar Saleh',
    status: 'PENDING_RECONCILIATION',
    proposedAction: 'RELOCATION_TRANSFER',
    actionLabel: 'Create Relocation Transfer',
    resolved: false
  },
  {
    id: 'DISC-004',
    exceptionNo: 'EXC-2026-004',
    assetNo: 'AS-000130',
    assetName: 'Fire Extinguisher (NAFFCO CO2 5KG)',
    serialNumber: 'NF-661201',
    exceptionType: 'DAMAGED',
    typeLabel: 'Damaged / Condition Issue',
    severity: 'CRITICAL',
    systemLocation: 'Block A > GF > Lobby',
    verifiedLocation: 'Block A > GF > Lobby',
    systemCustodian: 'Ahmed Khan',
    verifiedCustodian: 'Ahmed Khan',
    status: 'PENDING_RECONCILIATION',
    proposedAction: 'MAINTENANCE_REQUEST',
    actionLabel: 'Create Maintenance Request',
    resolved: false
  },
  {
    id: 'DISC-005',
    exceptionNo: 'EXC-2026-005',
    assetNo: 'AS-000131',
    assetName: 'Switch - Cisco Catalyst 2960-X',
    serialNumber: 'FCW2149L01',
    exceptionType: 'UNREGISTERED',
    typeLabel: 'Unregistered / Excess Asset',
    severity: 'HIGH',
    systemLocation: '-',
    verifiedLocation: 'Block C > 2F > IT-201',
    systemCustodian: '-',
    verifiedCustodian: 'Network Team',
    status: 'PENDING_RECONCILIATION',
    proposedAction: 'PROVISIONAL_ASSET',
    actionLabel: 'Create Provisional Asset',
    resolved: false
  },
  {
    id: 'DISC-006',
    exceptionNo: 'EXC-2026-006',
    assetNo: 'AS-000138',
    assetName: 'Workstation - Dell Precision 5570',
    serialNumber: '89X4M12',
    exceptionType: 'WRONG_CUSTODIAN',
    typeLabel: 'Wrong Custodian',
    severity: 'LOW',
    systemLocation: 'Block B > 1F > IT-101',
    verifiedLocation: 'Block B > 1F > IT-101',
    systemCustodian: 'Khalid Mansoor',
    verifiedCustodian: 'Fatima Noor',
    status: 'PENDING_RECONCILIATION',
    proposedAction: 'CUSTODIAN_CORRECTION',
    actionLabel: 'Update Custodian Assignment',
    resolved: false
  },
  {
    id: 'DISC-007',
    exceptionNo: 'EXC-2026-007',
    assetNo: 'AS-000142',
    assetName: 'Monitor - Dell UltraSharp 27"',
    serialNumber: 'CN08912P',
    exceptionType: 'DUPLICATE_TAG',
    typeLabel: 'Duplicate Tag / Serial Conflict',
    severity: 'MEDIUM',
    systemLocation: 'Block B > 2F > IT-201',
    verifiedLocation: 'Block B > 2F > IT-201',
    systemCustodian: 'Farhan Zaidi',
    verifiedCustodian: 'Farhan Zaidi',
    status: 'PENDING_RECONCILIATION',
    proposedAction: 'RETAP_RETAG',
    actionLabel: 'Re-issue RFID Tag',
    resolved: false
  },
  {
    id: 'DISC-008',
    exceptionNo: 'EXC-2026-008',
    assetNo: 'AS-000149',
    assetName: 'Projector - BenQ MX535',
    serialNumber: 'BQ-881290',
    exceptionType: 'DAMAGED',
    typeLabel: 'Damaged / Condition Issue',
    severity: 'MEDIUM',
    systemLocation: 'Block C > 1F > CONF-02',
    verifiedLocation: 'Block C > 1F > CONF-02',
    systemCustodian: 'Ahmed Khan',
    verifiedCustodian: 'Ahmed Khan',
    status: 'PENDING_RECONCILIATION',
    proposedAction: 'MAINTENANCE_REQUEST',
    actionLabel: 'Create Maintenance Request',
    resolved: false
  },
  {
    id: 'DISC-009',
    exceptionNo: 'EXC-2026-009',
    assetNo: 'AS-000155',
    assetName: 'Barcode Scanner - Zebra DS2208',
    serialNumber: 'ZB-442109',
    exceptionType: 'NOT_FOUND',
    typeLabel: 'Expected - Not Found',
    severity: 'LOW',
    systemLocation: 'Block B > 1F > IT-101',
    verifiedLocation: '-',
    systemCustodian: 'Sara Ali',
    verifiedCustodian: '-',
    status: 'RESOLVED',
    proposedAction: 'INVESTIGATION',
    actionLabel: 'Found in Dispatch Locker',
    resolved: true
  },
  {
    id: 'DISC-010',
    exceptionNo: 'EXC-2026-010',
    assetNo: 'AS-000162',
    assetName: 'Executive Desk - Oak Finish',
    serialNumber: 'DK-100234',
    exceptionType: 'WRONG_LOCATION',
    typeLabel: 'Wrong Location',
    severity: 'LOW',
    systemLocation: 'Block B > 3F > EXEC-01',
    verifiedLocation: 'Block C > 1F > EXEC-02',
    systemCustodian: 'Rashid Al-Maktoum',
    verifiedCustodian: 'Rashid Al-Maktoum',
    status: 'RESOLVED',
    proposedAction: 'RELOCATION_TRANSFER',
    actionLabel: 'Relocation Approved',
    resolved: true
  },
  {
    id: 'DISC-011',
    exceptionNo: 'EXC-2026-011',
    assetNo: 'AS-000171',
    assetName: 'Tablet - Samsung Galaxy Tab Active4',
    serialNumber: 'SM-T636B01',
    exceptionType: 'UNREGISTERED',
    typeLabel: 'Unregistered / Excess Asset',
    severity: 'MEDIUM',
    systemLocation: '-',
    verifiedLocation: 'Block B > GF > Workshop',
    systemCustodian: '-',
    verifiedCustodian: 'Facilities Tech Team',
    status: 'RESOLVED',
    proposedAction: 'PROVISIONAL_ASSET',
    actionLabel: 'Asset Registered #AST-009941',
    resolved: true
  },
  {
    id: 'DISC-012',
    exceptionNo: 'EXC-2026-012',
    assetNo: 'AS-000180',
    assetName: 'UPS - APC Smart-UPS 1500VA',
    serialNumber: 'AS-9921045',
    exceptionType: 'DAMAGED',
    typeLabel: 'Damaged / Condition Issue',
    severity: 'HIGH',
    systemLocation: 'Block B > GF > DataCenter-01',
    verifiedLocation: 'Block B > GF > DataCenter-01',
    systemCustodian: 'Farhan Zaidi',
    verifiedCustodian: 'Farhan Zaidi',
    status: 'RESOLVED',
    proposedAction: 'MAINTENANCE_REQUEST',
    actionLabel: 'Work Order #WO-4921 Scheduled',
    resolved: true
  }
];

export function AssetVerification() {
  const navigate = useNavigate();

  // Active Main Tab: 'VERIFICATION' | 'DISCREPANCIES' | 'SUMMARY' | 'AUDIT_TRAIL' | 'ATTACHMENTS'
  const [activeTab, setActiveTab] = useState('VERIFICATION');

  // Campaign State
  const [campaign, setCampaign] = useState(DEFAULT_CAMPAIGN);

  // Asset List State
  const [assets, setAssets] = useState(INITIAL_ASSETS);
  const [selectedAsset, setSelectedAsset] = useState(INITIAL_ASSETS[1]); // Default AS-000124 as in Screenshot 28
  const [selectedAssetIds, setSelectedAssetIds] = useState([]);

  // Scan & Verify Panel Subtab: 'SCAN' | 'MANUAL'
  const [scanTab, setScanTab] = useState('SCAN');
  const [scanInput, setScanInput] = useState('');
  const [remarks, setRemarks] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState(null);

  // Filters State
  const [locationFilter, setLocationFilter] = useState('All Locations');
  const [departmentFilter, setDepartmentFilter] = useState('All Departments');
  const [assetTypeFilter, setAssetTypeFilter] = useState('All Types');
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const totalAssetsCount = 600;

  // Discrepancies State
  const [discrepancies, setDiscrepancies] = useState(INITIAL_DISCREPANCIES);
  const [discrepancyFilter, setDiscrepancyFilter] = useState('ALL');

  // Modals
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [showDamageModal, setShowDamageModal] = useState(false);
  const [showNotFoundModal, setShowNotFoundModal] = useState(false);
  const [showUnregisteredModal, setShowUnregisteredModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showBulkActionModal, setShowBulkActionModal] = useState(false);

  // Toast / Feedback
  const [toast, setToast] = useState(null);

  // Move Modal form
  const [moveForm, setMoveForm] = useState({
    verifiedLocation: 'Block B > 2F > IT-201',
    verifiedCustodian: 'Omar Saleh',
    reason: 'Asset physically discovered on 2nd floor desk'
  });

  // Damage Modal form
  const [damageForm, setDamageForm] = useState({
    severity: 'MEDIUM',
    issueDescription: 'Physical casing crack and safety seal worn',
    createWorkOrder: true
  });

  // Load campaign & assets from backend API if available
  useEffect(() => {
    async function loadData() {
      try {
        const campRes = await api.get('/stocktakes/campaigns/AUD-2026-0008');
        if (campRes?.campaign) {
          setCampaign(prev => ({ ...prev, ...campRes.campaign }));
        }
        const assetsRes = await api.get('/stocktakes/campaigns/AUD-2026-0008/assets', {
          params: { page: 1, limit: 10 }
        });
        if (assetsRes?.assets && assetsRes.assets.length > 0) {
          setAssets(assetsRes.assets);
        }
        const discRes = await api.get('/stocktakes/campaigns/AUD-2026-0008/discrepancies');
        if (discRes?.discrepancies) {
          setDiscrepancies(discRes.discrepancies);
        }
      } catch (err) {
        // Resilient fallback to pre-seeded dataset
      }
    }
    loadData();
  }, []);

  const showNotification = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // Filtered Assets
  const filteredAssets = useMemo(() => {
    return assets.filter(item => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          (item.assetNo && item.assetNo.toLowerCase().includes(q)) ||
          (item.assetName && item.assetName.toLowerCase().includes(q)) ||
          (item.serialNumber && item.serialNumber.toLowerCase().includes(q)) ||
          (item.tagEpc && item.tagEpc.toLowerCase().includes(q));
        if (!match) return false;
      }
      if (locationFilter !== 'All Locations') {
        if (!item.systemLocation.includes(locationFilter) && !item.verifiedLocation.includes(locationFilter)) {
          return false;
        }
      }
      if (departmentFilter !== 'All Departments' && item.department !== departmentFilter) {
        return false;
      }
      if (assetTypeFilter !== 'All Types' && item.assetType !== assetTypeFilter) {
        return false;
      }
      if (statusFilter !== 'All' && item.verificationStatus !== statusFilter) {
        return false;
      }
      return true;
    });
  }, [assets, searchQuery, locationFilter, departmentFilter, assetTypeFilter, statusFilter]);

  // Handle Asset Row Selection
  const handleSelectAsset = (asset) => {
    setSelectedAsset(asset);
    setRemarks(asset.remarks || '');
    setScanMessage(null);
  };

  // Handle Search / Scan Execution
  const handleScanOrSearch = async () => {
    if (!scanInput.trim()) return;
    setIsScanning(true);
    setScanMessage(null);

    const term = scanInput.trim().toLowerCase();
    const found = assets.find(
      a =>
        a.assetNo.toLowerCase() === term ||
        a.serialNumber.toLowerCase() === term ||
        a.tagEpc.toLowerCase() === term
    );

    setTimeout(() => {
      setIsScanning(false);
      if (found) {
        setSelectedAsset(found);
        setRemarks(found.remarks || '');
        setScanMessage({ type: 'success', text: `Resolved: ${found.assetNo} - ${found.assetName}` });
        showNotification('success', `Scanned & matched asset ${found.assetNo}`);
      } else {
        setScanMessage({
          type: 'warning',
          text: `Tag/Serial "${scanInput}" not in expected list! Classified as Unregistered/Excess.`
        });
        showNotification('warning', `Tag not found in campaign snapshot. Create provisional record.`);
      }
    }, 450);
  };

  // Action Handlers
  const handleMarkAsVerified = async () => {
    if (!selectedAsset) return;
    const updated = {
      ...selectedAsset,
      verificationStatus: 'Verified',
      verifiedLocation: selectedAsset.systemLocation,
      verifiedCustodian: selectedAsset.systemCustodian,
      lastVerified: '10 Sep 2026 12:45',
      verifiedBy: 'John Doe',
      remarks: remarks || selectedAsset.remarks
    };

    setAssets(prev => prev.map(a => a.id === selectedAsset.id ? updated : a));
    setSelectedAsset(updated);
    showNotification('success', `Asset ${selectedAsset.assetNo} verified at expected location & custodian.`);

    try {
      await api.post('/stocktakes/verify-asset', {
        assetNo: selectedAsset.assetNo,
        outcome: 'Verified',
        verifiedLocation: selectedAsset.systemLocation,
        verifiedCustodian: selectedAsset.systemCustodian,
        remarks
      });
    } catch {
      // Offline fallback
    }
  };

  const handleConfirmMoved = async () => {
    if (!selectedAsset) return;
    const updated = {
      ...selectedAsset,
      verificationStatus: 'Moved',
      verifiedLocation: moveForm.verifiedLocation,
      verifiedCustodian: moveForm.verifiedCustodian,
      lastVerified: '10 Sep 2026 12:45',
      verifiedBy: 'John Doe',
      remarks: remarks || moveForm.reason
    };

    setAssets(prev => prev.map(a => a.id === selectedAsset.id ? updated : a));
    setSelectedAsset(updated);
    setShowMoveModal(false);

    // Create discrepancy
    const newDiscrepancy = {
      id: `DISC-${Date.now().toString().slice(-4)}`,
      exceptionNo: `EXC-2026-${String(discrepancies.length + 1).padStart(3, '0')}`,
      assetNo: selectedAsset.assetNo,
      assetName: selectedAsset.assetName,
      serialNumber: selectedAsset.serialNumber,
      exceptionType: 'WRONG_LOCATION',
      typeLabel: 'Wrong Location / Moved',
      severity: 'MEDIUM',
      systemLocation: selectedAsset.systemLocation,
      verifiedLocation: moveForm.verifiedLocation,
      systemCustodian: selectedAsset.systemCustodian,
      verifiedCustodian: moveForm.verifiedCustodian,
      status: 'PENDING_RECONCILIATION',
      proposedAction: 'RELOCATION_TRANSFER',
      actionLabel: 'Create Relocation Transfer',
      resolved: false
    };
    setDiscrepancies(prev => [newDiscrepancy, ...prev]);

    showNotification('warning', `Asset ${selectedAsset.assetNo} marked as Moved. Discrepancy logged.`);

    try {
      await api.post('/stocktakes/verify-asset', {
        assetNo: selectedAsset.assetNo,
        outcome: 'Moved',
        verifiedLocation: moveForm.verifiedLocation,
        verifiedCustodian: moveForm.verifiedCustodian,
        remarks: remarks || moveForm.reason
      });
    } catch {
      // Offline fallback
    }
  };

  const handleConfirmNotFound = async () => {
    if (!selectedAsset) return;
    const updated = {
      ...selectedAsset,
      verificationStatus: 'Not Found',
      verifiedLocation: '-',
      verifiedCustodian: '-',
      lastVerified: '-',
      verifiedBy: null,
      remarks: remarks || 'Asset missing during physical census count'
    };

    setAssets(prev => prev.map(a => a.id === selectedAsset.id ? updated : a));
    setSelectedAsset(updated);
    setShowNotFoundModal(false);

    const newDiscrepancy = {
      id: `DISC-${Date.now().toString().slice(-4)}`,
      exceptionNo: `EXC-2026-${String(discrepancies.length + 1).padStart(3, '0')}`,
      assetNo: selectedAsset.assetNo,
      assetName: selectedAsset.assetName,
      serialNumber: selectedAsset.serialNumber,
      exceptionType: 'NOT_FOUND',
      typeLabel: 'Expected - Not Found',
      severity: 'HIGH',
      systemLocation: selectedAsset.systemLocation,
      verifiedLocation: '-',
      systemCustodian: selectedAsset.systemCustodian,
      verifiedCustodian: '-',
      status: 'PENDING_RECONCILIATION',
      proposedAction: 'INVESTIGATION',
      actionLabel: 'Initiate Investigation',
      resolved: false
    };
    setDiscrepancies(prev => [newDiscrepancy, ...prev]);

    showNotification('error', `Asset ${selectedAsset.assetNo} recorded as Not Found. Exception logged.`);

    try {
      await api.post('/stocktakes/verify-asset', {
        assetNo: selectedAsset.assetNo,
        outcome: 'Not Found',
        remarks
      });
    } catch {
      // Offline fallback
    }
  };

  const handleConfirmDamaged = async () => {
    if (!selectedAsset) return;
    const updated = {
      ...selectedAsset,
      verificationStatus: 'Damaged',
      condition: 'Damaged',
      lastVerified: '10 Sep 2026 12:45',
      verifiedBy: 'John Doe',
      remarks: remarks || damageForm.issueDescription
    };

    setAssets(prev => prev.map(a => a.id === selectedAsset.id ? updated : a));
    setSelectedAsset(updated);
    setShowDamageModal(false);

    const newDiscrepancy = {
      id: `DISC-${Date.now().toString().slice(-4)}`,
      exceptionNo: `EXC-2026-${String(discrepancies.length + 1).padStart(3, '0')}`,
      assetNo: selectedAsset.assetNo,
      assetName: selectedAsset.assetName,
      serialNumber: selectedAsset.serialNumber,
      exceptionType: 'DAMAGED',
      typeLabel: 'Damaged / Condition Issue',
      severity: damageForm.severity,
      systemLocation: selectedAsset.systemLocation,
      verifiedLocation: selectedAsset.verifiedLocation,
      systemCustodian: selectedAsset.systemCustodian,
      verifiedCustodian: selectedAsset.verifiedCustodian,
      status: 'PENDING_RECONCILIATION',
      proposedAction: 'MAINTENANCE_REQUEST',
      actionLabel: damageForm.createWorkOrder ? 'Initiate Maintenance Request' : 'Review Condition',
      resolved: false
    };
    setDiscrepancies(prev => [newDiscrepancy, ...prev]);

    showNotification('warning', `Asset ${selectedAsset.assetNo} marked as Damaged. Maintenance action created.`);

    try {
      await api.post('/stocktakes/verify-asset', {
        assetNo: selectedAsset.assetNo,
        outcome: 'Damaged',
        condition: 'Damaged',
        remarks: remarks || damageForm.issueDescription
      });
    } catch {
      // Offline fallback
    }
  };

  // Reconcile Discrepancy
  const handleReconcileDiscrepancy = (discId, action) => {
    setDiscrepancies(prev => prev.map(d => {
      if (d.id === discId) {
        return {
          ...d,
          resolved: true,
          status: 'RESOLVED',
          actionLabel: `Resolved (${action})`
        };
      }
      return d;
    }));
    showNotification('success', `Discrepancy ${discId} marked as resolved via ${action}.`);
  };

  // Status Badge Helper
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'Verified':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#D1FAE5] text-[#065F46]">
            Verified
          </span>
        );
      case 'Moved':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#FEF3C7] text-[#92400E]">
            Moved
          </span>
        );
      case 'Wrong Location':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#FEF3C7] text-[#92400E]">
            Wrong Location
          </span>
        );
      case 'Not Found':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#FFE4E6] text-[#9F1239]">
            Not Found
          </span>
        );
      case 'Damaged':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#FFEDD5] text-[#9A3412]">
            Damaged
          </span>
        );
      case 'Unregistered':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#EDE9FE] text-[#5B21B6]">
            Unregistered
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600">
            {status || 'Pending'}
          </span>
        );
    }
  };

  // Count pending discrepancies
  const pendingExceptionsCount = discrepancies.filter(d => !d.resolved).length;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-16">
      {/* Toast alert */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl bg-slate-900 text-white text-xs border border-slate-700 animate-in fade-in slide-in-from-bottom-3 duration-200">
          {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
          {toast.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />}
          {toast.type === 'error' && <XCircle className="w-4 h-4 text-rose-400 shrink-0" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Header & Breadcrumb Bar */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-[1700px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <button
              onClick={() => navigate('/stocktakes')}
              className="hover:text-slate-900 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Verification & Audit</span>
            </button>
            <span className="text-slate-300">&gt;</span>
            <span className="text-slate-800 font-semibold">Asset Verification</span>
          </div>

          <button
            onClick={() => navigate('/stocktakes')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-[#6C2BD9] text-[#6C2BD9] hover:bg-purple-50 text-xs font-semibold transition-all cursor-pointer shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Audit</span>
          </button>
        </div>

        {/* Title & Subtitle */}
        <div className="max-w-[1700px] mx-auto mt-3">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Asset Verification</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Verify assets using barcode, RFID or manual entry and reconcile with system records
          </p>
        </div>
      </div>

      <div className="max-w-[1700px] mx-auto px-6 pt-5 space-y-5">
        {/* Campaign Info Header Banner (Exact match to Screenshot 28) */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 items-center">
            {/* Audit ID */}
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Audit ID</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm font-bold text-slate-900">{campaign.auditId}</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-sky-100 text-sky-700">
                  {campaign.status}
                </span>
              </div>
            </div>

            {/* Audit Name */}
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Audit Name</p>
              <p className="text-sm font-bold text-slate-900 mt-1 truncate" title={campaign.auditName}>
                {campaign.auditName}
              </p>
            </div>

            {/* Audit Type */}
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Audit Type</p>
              <p className="text-sm font-bold text-slate-900 mt-1 truncate">{campaign.auditType}</p>
            </div>

            {/* Location */}
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Location</p>
              <p className="text-sm font-bold text-slate-900 mt-1 truncate">{campaign.location}</p>
            </div>

            {/* Start Date */}
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Start Date</p>
              <p className="text-sm font-bold text-slate-900 mt-1">{campaign.startDate}</p>
            </div>

            {/* End Date */}
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">End Date</p>
              <p className="text-sm font-bold text-slate-900 mt-1">{campaign.endDate}</p>
            </div>

            {/* Audit Progress */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-slate-500">Audit Progress</span>
                <span className="font-bold text-slate-900">{campaign.progress}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#6C2BD9] h-full rounded-full transition-all duration-500"
                  style={{ width: `${campaign.progress}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400 text-right mt-1">
                {campaign.totalVerified} of {campaign.totalExpected} assets verified
              </p>
            </div>
          </div>
        </div>

        {/* Main Navigation Tabs */}
        <div className="border-b border-slate-200">
          <nav className="flex space-x-8 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('VERIFICATION')}
              className={clsx(
                'pb-3 cursor-pointer transition-colors relative',
                activeTab === 'VERIFICATION'
                  ? 'text-[#6C2BD9] font-bold border-b-2 border-[#6C2BD9]'
                  : 'text-slate-500 hover:text-slate-800'
              )}
            >
              Asset Verification
            </button>

            <button
              onClick={() => setActiveTab('DISCREPANCIES')}
              className={clsx(
                'pb-3 cursor-pointer transition-colors relative flex items-center gap-1.5',
                activeTab === 'DISCREPANCIES'
                  ? 'text-[#6C2BD9] font-bold border-b-2 border-[#6C2BD9]'
                  : 'text-slate-500 hover:text-slate-800'
              )}
            >
              <span>Discrepancies ({discrepancies.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('SUMMARY')}
              className={clsx(
                'pb-3 cursor-pointer transition-colors relative',
                activeTab === 'SUMMARY'
                  ? 'text-[#6C2BD9] font-bold border-b-2 border-[#6C2BD9]'
                  : 'text-slate-500 hover:text-slate-800'
              )}
            >
              Summary
            </button>

            <button
              onClick={() => setActiveTab('AUDIT_TRAIL')}
              className={clsx(
                'pb-3 cursor-pointer transition-colors relative',
                activeTab === 'AUDIT_TRAIL'
                  ? 'text-[#6C2BD9] font-bold border-b-2 border-[#6C2BD9]'
                  : 'text-slate-500 hover:text-slate-800'
              )}
            >
              Audit Trail
            </button>

            <button
              onClick={() => setActiveTab('ATTACHMENTS')}
              className={clsx(
                'pb-3 cursor-pointer transition-colors relative',
                activeTab === 'ATTACHMENTS'
                  ? 'text-[#6C2BD9] font-bold border-b-2 border-[#6C2BD9]'
                  : 'text-slate-500 hover:text-slate-800'
              )}
            >
              Attachments
            </button>
          </nav>
        </div>

        {/* TAB 1: ASSET VERIFICATION (Active by default) */}
        {activeTab === 'VERIFICATION' && (
          <div className="space-y-4">
            {/* Filter Bar */}
            <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-2xs">
              <div className="flex flex-wrap items-end gap-3">
                {/* Location Filter */}
                <div className="w-40">
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Location</label>
                  <select
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-[#6C2BD9]"
                  >
                    <option>All Locations</option>
                    <option>Block B &gt; 1F &gt; IT-101</option>
                    <option>Block B &gt; 2F &gt; IT-201</option>
                    <option>Block B &gt; 3F &gt; IT-301</option>
                    <option>Block C &gt; 1F &gt; CONF-01</option>
                    <option>Block C &gt; 2F &gt; IT-201</option>
                    <option>Block A &gt; GF &gt; Lobby</option>
                  </select>
                </div>

                {/* Department Filter */}
                <div className="w-40">
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Department</label>
                  <select
                    value={departmentFilter}
                    onChange={(e) => setDepartmentFilter(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-[#6C2BD9]"
                  >
                    <option>All Departments</option>
                    <option>IT</option>
                    <option>Finance</option>
                    <option>Human Resources</option>
                    <option>Administration</option>
                    <option>Facilities</option>
                    <option>Network Operations</option>
                    <option>HSE</option>
                    <option>Executive Office</option>
                  </select>
                </div>

                {/* Asset Type Filter */}
                <div className="w-36">
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Asset Type</label>
                  <select
                    value={assetTypeFilter}
                    onChange={(e) => setAssetTypeFilter(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-[#6C2BD9]"
                  >
                    <option>All Types</option>
                    <option>IT Equipment</option>
                    <option>Furniture</option>
                    <option>Network Equipment</option>
                    <option>Safety Equipment</option>
                  </select>
                </div>

                {/* Verification Status Filter */}
                <div className="w-32">
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Verification Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-[#6C2BD9]"
                  >
                    <option>All</option>
                    <option>Verified</option>
                    <option>Moved</option>
                    <option>Not Found</option>
                    <option>Wrong Location</option>
                    <option>Damaged</option>
                    <option>Unregistered</option>
                  </select>
                </div>

                {/* Search Input */}
                <div className="flex-1 min-w-[260px]">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by Asset No., Asset Name, Serial No., Tag ID"
                      className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#6C2BD9]"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {}}
                    className="px-4 py-1.5 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors cursor-pointer"
                  >
                    Search
                  </button>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setLocationFilter('All Locations');
                      setDepartmentFilter('All Departments');
                      setAssetTypeFilter('All Types');
                      setStatusFilter('All');
                    }}
                    className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg shadow-2xs transition-colors cursor-pointer"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>

            {/* Main 2-Column Operational Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* Left Section: Asset List Table (lg:col-span-8) */}
              <div className="lg:col-span-8 space-y-3">
                {/* Table Header Bar */}
                <div className="flex items-center justify-between px-1">
                  <h2 className="text-sm font-bold text-slate-900">
                    Asset List ({totalAssetsCount})
                  </h2>

                  <button
                    onClick={() => setShowBulkActionModal(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#6C2BD9] text-[#6C2BD9] bg-white hover:bg-purple-50 text-xs font-semibold transition-all cursor-pointer shadow-2xs"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Bulk Actions</span>
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </div>

                {/* Asset Table */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
                  <div className="overflow-auto max-h-[540px]">
                    <table className="w-full text-left text-xs">
                      <thead className="sticky top-0 z-10 bg-slate-50 shadow-2xs border-b border-slate-200 text-[11px] font-semibold text-slate-500">
                        <tr>
                          <th className="py-2.5 px-3 w-8">
                            <input
                              type="checkbox"
                              checked={selectedAssetIds.length === filteredAssets.length && filteredAssets.length > 0}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedAssetIds(filteredAssets.map(a => a.id));
                                } else {
                                  setSelectedAssetIds([]);
                                }
                              }}
                              className="rounded border-slate-300 text-[#6C2BD9] focus:ring-[#6C2BD9]"
                            />
                          </th>
                          <th className="py-2.5 px-3 font-semibold">Asset No.</th>
                          <th className="py-2.5 px-3 font-semibold">Asset Name</th>
                          <th className="py-2.5 px-3 font-semibold">Asset Type</th>
                          <th className="py-2.5 px-3 font-semibold">System Location</th>
                          <th className="py-2.5 px-3 font-semibold">Verified Location</th>
                          <th className="py-2.5 px-3 font-semibold">System Custodian</th>
                          <th className="py-2.5 px-3 font-semibold">Verified Custodian</th>
                          <th className="py-2.5 px-3 font-semibold text-center">Verification Status</th>
                          <th className="py-2.5 px-3 font-semibold">Last Verified</th>
                          <th className="py-2.5 px-3 text-center font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredAssets.map((asset) => {
                          const isSelected = selectedAsset?.id === asset.id;
                          return (
                            <tr
                              key={asset.id}
                              onClick={() => handleSelectAsset(asset)}
                              className={clsx(
                                'hover:bg-slate-50/80 transition-colors cursor-pointer',
                                isSelected ? 'bg-purple-50/40 font-medium' : ''
                              )}
                            >
                              <td className="py-3 px-3" onClick={(e) => e.stopPropagation()}>
                                <input
                                  type="checkbox"
                                  checked={selectedAssetIds.includes(asset.id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedAssetIds(prev => [...prev, asset.id]);
                                    } else {
                                      setSelectedAssetIds(prev => prev.filter(id => id !== asset.id));
                                    }
                                  }}
                                  className="rounded border-slate-300 text-[#6C2BD9] focus:ring-[#6C2BD9]"
                                />
                              </td>
                              <td className="py-3 px-3 font-semibold text-[#6C2BD9] hover:underline">
                                {asset.assetNo}
                              </td>
                              <td className="py-3 px-3 text-slate-900 font-medium whitespace-nowrap">
                                {asset.assetName}
                              </td>
                              <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                                {asset.assetType}
                              </td>
                              <td className="py-3 px-3 text-slate-600 text-[11px] whitespace-nowrap">
                                {asset.systemLocation}
                              </td>
                              <td className="py-3 px-3 text-slate-800 text-[11px] whitespace-nowrap">
                                {asset.verifiedLocation}
                              </td>
                              <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                                {asset.systemCustodian}
                              </td>
                              <td className="py-3 px-3 text-slate-800 whitespace-nowrap">
                                {asset.verifiedCustodian}
                              </td>
                              <td className="py-3 px-3 text-center whitespace-nowrap">
                                {renderStatusBadge(asset.verificationStatus)}
                              </td>
                              <td className="py-3 px-3 text-slate-500 text-[11px] whitespace-nowrap">
                                {asset.lastVerified}
                              </td>
                              <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                                <button
                                  onClick={() => handleSelectAsset(asset)}
                                  className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700"
                                >
                                  <MoreVertical className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Scroll Footer */}
                  <div className="border-t border-slate-100 px-4 py-3 flex items-center justify-between text-xs text-slate-500">
                    <span className="font-medium text-slate-600">Showing {filteredAssets.length} records</span>
                    <span className="text-slate-400">Scroll down to view all records</span>
                  </div>
                </div>
              </div>

              {/* Right Section: 3 Action & Inspection Cards (lg:col-span-4) */}
              <div className="lg:col-span-4 space-y-4">
                {/* Card 1: Scan / Verify Asset */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
                  <div className="p-3.5 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-900">Scan / Verify Asset</h3>
                  </div>

                  {/* Subtabs: Scan Asset vs Manual Entry */}
                  <div className="grid grid-cols-2 border-b border-slate-100 text-xs font-semibold text-center">
                    <button
                      onClick={() => setScanTab('SCAN')}
                      className={clsx(
                        'py-2 border-b-2 transition-colors cursor-pointer',
                        scanTab === 'SCAN'
                          ? 'border-[#6C2BD9] text-[#6C2BD9]'
                          : 'border-transparent text-slate-500 hover:text-slate-800'
                      )}
                    >
                      Scan Asset
                    </button>
                    <button
                      onClick={() => setScanTab('MANUAL')}
                      className={clsx(
                        'py-2 border-b-2 transition-colors cursor-pointer',
                        scanTab === 'MANUAL'
                          ? 'border-[#6C2BD9] text-[#6C2BD9]'
                          : 'border-transparent text-slate-500 hover:text-slate-800'
                      )}
                    >
                      Manual Entry
                    </button>
                  </div>

                  <div className="p-4 space-y-3.5">
                    {scanTab === 'SCAN' ? (
                      <div className="space-y-3">
                        {/* Barcode Graphic Illustration */}
                        <div className="text-center py-2">
                          <div className="flex justify-center items-center gap-1 text-slate-800 mb-1">
                            <span className="w-0.5 h-6 bg-slate-800 inline-block" />
                            <span className="w-1.5 h-6 bg-slate-800 inline-block" />
                            <span className="w-1 h-6 bg-slate-800 inline-block" />
                            <span className="w-0.5 h-6 bg-slate-800 inline-block" />
                            <span className="w-2 h-6 bg-slate-800 inline-block" />
                            <span className="w-0.5 h-6 bg-slate-800 inline-block" />
                            <span className="w-1.5 h-6 bg-slate-800 inline-block" />
                            <span className="w-1 h-6 bg-slate-800 inline-block" />
                            <span className="w-0.5 h-6 bg-slate-800 inline-block" />
                            <span className="w-2 h-6 bg-slate-800 inline-block" />
                            <span className="w-1 h-6 bg-slate-800 inline-block" />
                          </div>
                          <p className="text-xs font-bold text-slate-800">Scan Barcode / QR / RFID Tag</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Place the cursor in the field or click the scan button
                          </p>
                        </div>

                        {/* Scan Input & Button */}
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              value={scanInput}
                              onChange={(e) => setScanInput(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleScanOrSearch()}
                              placeholder="Enter Asset No. / Tag ID / Serial No."
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#6C2BD9] focus:bg-white"
                            />
                          </div>

                          <button
                            onClick={handleScanOrSearch}
                            disabled={isScanning}
                            className="px-4 py-1.5 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5"
                          >
                            {isScanning ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <span>Scan</span>
                            )}
                          </button>
                        </div>

                        {scanMessage && (
                          <div
                            className={clsx(
                              'p-2.5 rounded-lg text-xs font-medium border flex items-center gap-2',
                              scanMessage.type === 'success'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : 'bg-amber-50 text-amber-800 border-amber-200'
                            )}
                          >
                            {scanMessage.type === 'success' ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            ) : (
                              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                            )}
                            <span className="truncate">{scanMessage.text}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      /* Manual Entry Mode */
                      <div className="space-y-2.5 text-xs">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Asset Number / Tag</label>
                          <input
                            type="text"
                            value={scanInput}
                            onChange={(e) => setScanInput(e.target.value)}
                            placeholder="e.g. AS-000124 or Tag EPC"
                            className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:border-[#6C2BD9] outline-none"
                          />
                        </div>
                        <button
                          onClick={handleScanOrSearch}
                          className="w-full py-1.5 bg-purple-50 text-[#6C2BD9] border border-purple-200 font-semibold rounded-lg hover:bg-purple-100 transition-colors"
                        >
                          Find Asset Record
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card 2: Asset Details (Exact match to Screenshot 28 for AS-000124) */}
                {selectedAsset && (
                  <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
                    <div className="p-3.5 border-b border-slate-100">
                      <h3 className="text-xs font-bold text-slate-900">Asset Details</h3>
                    </div>

                    <div className="p-4 space-y-3">
                      {/* Asset Header with Thumbnail & Name */}
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-slate-900 rounded-lg overflow-hidden flex items-center justify-center p-1 border border-slate-300 shrink-0">
                          <img
                            src={selectedAsset.thumbnail || '/laptop.png'}
                            alt={selectedAsset.assetName}
                            className="w-full h-full object-contain"
                          />
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-900">{selectedAsset.assetNo}</span>
                            {renderStatusBadge(selectedAsset.verificationStatus)}
                          </div>
                          <p className="text-xs font-medium text-slate-700 truncate mt-0.5">
                            {selectedAsset.model || selectedAsset.assetName}
                          </p>
                        </div>
                      </div>

                      {/* Attributes Key-Value List */}
                      <div className="border-t border-slate-100 pt-3 space-y-1.5 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Serial Number</span>
                          <span className="font-medium text-slate-800">{selectedAsset.serialNumber || '-'}</span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-slate-500">Tag / EPC</span>
                          <span className="font-medium text-slate-800 truncate max-w-[190px]" title={selectedAsset.tagEpc}>
                            {selectedAsset.tagEpc || '-'}
                          </span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-slate-500">Asset Type</span>
                          <span className="font-medium text-slate-800">{selectedAsset.assetType || '-'}</span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-slate-500">Category</span>
                          <span className="font-medium text-slate-800">{selectedAsset.category || '-'}</span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-slate-500">System Location</span>
                          <span className="font-medium text-slate-800 text-[11px] truncate max-w-[190px]" title={selectedAsset.systemLocation}>
                            {selectedAsset.systemLocation || '-'}
                          </span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-slate-500">Verified Location</span>
                          <span className="font-medium text-slate-900 text-[11px] truncate max-w-[190px]" title={selectedAsset.verifiedLocation}>
                            {selectedAsset.verifiedLocation || '-'}
                          </span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-slate-500">System Custodian</span>
                          <span className="font-medium text-slate-800">{selectedAsset.systemCustodian || '-'}</span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-slate-500">Verified Custodian</span>
                          <span className="font-medium text-slate-900">{selectedAsset.verifiedCustodian || '-'}</span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-slate-500">Condition</span>
                          <span className={clsx('font-bold', selectedAsset.condition === 'Good' ? 'text-emerald-600' : 'text-amber-600')}>
                            {selectedAsset.condition || 'Good'}
                          </span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-slate-500">Last Verified</span>
                          <div className="text-right">
                            <p className="font-medium text-slate-800 text-[11px]">{selectedAsset.lastVerified || '-'}</p>
                            {selectedAsset.verifiedBy && (
                              <p className="text-[10px] text-slate-400">by {selectedAsset.verifiedBy}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Card 3: Verification Actions (2x2 Buttons + Remarks) */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
                  <div className="p-3.5 border-b border-slate-100">
                    <h3 className="text-xs font-bold text-slate-900">Verification Actions</h3>
                  </div>

                  <div className="p-4 space-y-3">
                    {/* 2x2 Grid of Actions */}
                    <div className="grid grid-cols-2 gap-2.5">
                      {/* Mark as Verified (Solid Green) */}
                      <button
                        onClick={handleMarkAsVerified}
                        className="py-2 px-3 bg-[#059669] hover:bg-[#047857] text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Mark as Verified</span>
                      </button>

                      {/* Mark as Moved (Outline Amber/Orange) */}
                      <button
                        onClick={() => setShowMoveModal(true)}
                        className="py-2 px-3 bg-white border border-[#D97706] text-[#D97706] hover:bg-amber-50 text-xs font-semibold rounded-lg shadow-2xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Mark as Moved</span>
                      </button>

                      {/* Mark as Not Found (Solid Red) */}
                      <button
                        onClick={() => setShowNotFoundModal(true)}
                        className="py-2 px-3 bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <X className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Mark as Not Found</span>
                      </button>

                      {/* Mark as Damaged (Outline Orange) */}
                      <button
                        onClick={() => setShowDamageModal(true)}
                        className="py-2 px-3 bg-white border border-[#EA580C] text-[#EA580C] hover:bg-orange-50 text-xs font-semibold rounded-lg shadow-2xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Mark as Damaged</span>
                      </button>
                    </div>

                    {/* Remarks Input */}
                    <div className="relative">
                      <textarea
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value.slice(0, 500))}
                        placeholder="Enter remarks (optional)..."
                        rows={3}
                        className="w-full bg-slate-50/70 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#6C2BD9] focus:bg-white resize-none"
                      />
                      <span className="absolute right-2.5 bottom-2 text-[10px] text-slate-400">
                        {remarks.length}/500
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: DISCREPANCIES (12 items) */}
        {activeTab === 'DISCREPANCIES' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Audit Discrepancies & Exception Log</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Exceptions do not update the Asset Master directly. Use controlled reconciliation actions to resolve discrepancies.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setDiscrepancyFilter('ALL')}
                  className={clsx(
                    'px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors',
                    discrepancyFilter === 'ALL' ? 'bg-[#6C2BD9] text-white' : 'bg-slate-100 text-slate-700'
                  )}
                >
                  All ({discrepancies.length})
                </button>
                <button
                  onClick={() => setDiscrepancyFilter('PENDING')}
                  className={clsx(
                    'px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors',
                    discrepancyFilter === 'PENDING' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-700'
                  )}
                >
                  Pending ({discrepancies.filter(d => !d.resolved).length})
                </button>
                <button
                  onClick={() => setDiscrepancyFilter('RESOLVED')}
                  className={clsx(
                    'px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors',
                    discrepancyFilter === 'RESOLVED' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'
                  )}
                >
                  Resolved ({discrepancies.filter(d => d.resolved).length})
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
              <div className="overflow-auto max-h-[500px]">
                <table className="w-full text-left text-xs">
                  <thead className="sticky top-0 z-10 bg-slate-50 shadow-2xs border-b border-slate-200 text-[11px] font-semibold text-slate-500">
                    <tr>
                      <th className="py-2.5 px-3">Exception #</th>
                      <th className="py-2.5 px-3">Asset No. / Item</th>
                      <th className="py-2.5 px-3">Exception Type</th>
                      <th className="py-2.5 px-3">System Record</th>
                      <th className="py-2.5 px-3">Observed Finding</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                      <th className="py-2.5 px-3 text-right">Reconciliation Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {discrepancies
                      .filter(d => {
                        if (discrepancyFilter === 'PENDING') return !d.resolved;
                        if (discrepancyFilter === 'RESOLVED') return d.resolved;
                        return true;
                      })
                      .map((disc) => (
                        <tr key={disc.id} className="hover:bg-slate-50/80">
                          <td className="py-3 px-3 font-semibold text-slate-800">{disc.exceptionNo}</td>
                          <td className="py-3 px-3">
                            <p className="font-semibold text-[#6C2BD9]">{disc.assetNo}</p>
                            <p className="text-[11px] text-slate-500 truncate max-w-[180px]">{disc.assetName}</p>
                          </td>
                          <td className="py-3 px-3">
                            <span className={clsx(
                              'px-2 py-0.5 rounded text-[11px] font-semibold',
                              disc.exceptionType === 'DAMAGED' ? 'bg-red-100 text-red-800' :
                              disc.exceptionType === 'NOT_FOUND' ? 'bg-rose-100 text-rose-800' :
                              disc.exceptionType === 'UNREGISTERED' ? 'bg-purple-100 text-purple-800' :
                              'bg-amber-100 text-amber-800'
                            )}>
                              {disc.typeLabel}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-[11px] text-slate-600">
                            <p>Loc: {disc.systemLocation}</p>
                            <p>Cust: {disc.systemCustodian}</p>
                          </td>
                          <td className="py-3 px-3 text-[11px] text-slate-900 font-medium">
                            <p>Loc: {disc.verifiedLocation}</p>
                            <p>Cust: {disc.verifiedCustodian}</p>
                          </td>
                          <td className="py-3 px-3 text-center">
                            {disc.resolved ? (
                              <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded text-[10px] font-semibold">
                                <CheckCircle2 className="w-3 h-3" /> Resolved
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-100 px-2 py-0.5 rounded text-[10px] font-semibold">
                                <Clock className="w-3 h-3" /> Pending Review
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-right">
                            {disc.resolved ? (
                              <span className="text-[11px] text-slate-400 font-medium">{disc.actionLabel}</span>
                            ) : (
                              <button
                                onClick={() => handleReconcileDiscrepancy(disc.id, disc.actionLabel)}
                                className="px-2.5 py-1 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white text-[11px] font-semibold rounded shadow-2xs transition-colors"
                              >
                                {disc.actionLabel}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
              <div className="p-3 bg-white border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="font-medium text-slate-600">Showing {discrepancies.filter(d => {
                  if (discrepancyFilter === 'PENDING') return !d.resolved;
                  if (discrepancyFilter === 'RESOLVED') return d.resolved;
                  return true;
                }).length} records</span>
                <span className="text-slate-400">Scroll down to view all records</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SUMMARY */}
        {activeTab === 'SUMMARY' && (
          <div className="space-y-5">
            {/* KPI Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                <p className="text-[11px] font-semibold text-slate-400 uppercase">Expected</p>
                <p className="text-xl font-bold text-slate-900 mt-1">{campaign.totalExpected}</p>
                <span className="text-[10px] text-slate-400">100% Population</span>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                <p className="text-[11px] font-semibold text-slate-400 uppercase">Verified</p>
                <p className="text-xl font-bold text-emerald-600 mt-1">{campaign.totalVerified}</p>
                <span className="text-[10px] text-emerald-700 font-semibold">{campaign.progress}% Complete</span>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                <p className="text-[11px] font-semibold text-slate-400 uppercase">Pending</p>
                <p className="text-xl font-bold text-slate-700 mt-1">{campaign.totalPending}</p>
                <span className="text-[10px] text-slate-400">33% Remaining</span>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                <p className="text-[11px] font-semibold text-slate-400 uppercase">Not Found</p>
                <p className="text-xl font-bold text-rose-600 mt-1">{campaign.totalNotFound}</p>
                <span className="text-[10px] text-rose-700 font-semibold">2% Missing</span>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                <p className="text-[11px] font-semibold text-slate-400 uppercase">Relocated</p>
                <p className="text-xl font-bold text-amber-600 mt-1">{campaign.totalRelocated}</p>
                <span className="text-[10px] text-amber-700">Wrong Location</span>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                <p className="text-[11px] font-semibold text-slate-400 uppercase">Damaged</p>
                <p className="text-xl font-bold text-orange-600 mt-1">{campaign.totalDamaged}</p>
                <span className="text-[10px] text-orange-700">Condition Issues</span>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                <p className="text-[11px] font-semibold text-slate-400 uppercase">Unregistered</p>
                <p className="text-xl font-bold text-purple-600 mt-1">{campaign.totalExcess}</p>
                <span className="text-[10px] text-purple-700">Excess / Unlisted</span>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                <p className="text-[11px] font-semibold text-slate-400 uppercase">Exceptions</p>
                <p className="text-xl font-bold text-slate-900 mt-1">{discrepancies.length}</p>
                <span className="text-[10px] text-amber-600 font-semibold">{pendingExceptionsCount} Pending</span>
              </div>
            </div>

            {/* Campaign Closure Governance Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Campaign Closure & Sign-Off Rules</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    FSD Rule: Campaign completion requires 100% of configured exceptions to be reconciled or officially approved.
                  </p>
                </div>

                <button
                  onClick={() => setShowCompleteModal(true)}
                  className="px-4 py-2 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors cursor-pointer"
                >
                  Complete Audit & Generate Report
                </button>
              </div>

              {pendingExceptionsCount > 0 ? (
                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3 text-xs text-amber-900">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Campaign Cannot Be Finalized Yet</p>
                    <p className="mt-0.5 text-amber-800">
                      There are currently {pendingExceptionsCount} unresolved discrepancies. Every wrong-location, wrong-custodian, damaged, and missing asset must be reconciled or approved by an audit administrator before completion.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-xs text-emerald-900">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <p className="font-bold">Ready for Audit Closure</p>
                    <p className="mt-0.5 text-emerald-800">
                      All discrepancies have been resolved or approved. You can now complete the campaign to generate an immutable reconciliation audit report.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: AUDIT TRAIL */}
        {activeTab === 'AUDIT_TRAIL' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Immutable Campaign Verification Ledger</h3>
              <button className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50">
                <Download className="w-3.5 h-3.5" />
                <span>Export Audit Ledger</span>
              </button>
            </div>
            <div className="p-4 divide-y divide-slate-100">
              {[
                { time: '10 Sep 2026 12:20', asset: 'AS-000131', name: 'Switch - Cisco', user: 'John Doe', action: 'UNREGISTERED_DETECTED', details: 'Unregistered RFID tag scanned in server rack 4; provisional exception EXC-2026-005 generated.' },
                { time: '10 Sep 2026 11:15', asset: 'AS-000129', name: 'Access Point - Cisco', user: 'John Doe', action: 'VERIFIED_CORRECT', details: 'EPC E28011606000002053A1B4C5 matched in Block B > 3F > IT-301. Custodian Sara Ali confirmed.' },
                { time: '10 Sep 2026 11:05', asset: 'AS-000124', name: 'Laptop - Dell Latitude 5440', user: 'John Doe', action: 'MOVED_DETECTED', details: 'Observed location Block B > 2F > IT-201 vs System Block B > 1F > IT-101. Exception logged.' },
                { time: '10 Sep 2026 10:05', asset: 'AS-000130', name: 'Fire Extinguisher', user: 'John Doe', action: 'DAMAGED_LOGGED', details: 'Condition flagged as Damaged. Pressure gauge low, maintenance request triggered.' },
                { time: '10 Sep 2026 09:50', asset: 'AS-000125', name: 'Printer - HP', user: 'John Doe', action: 'VERIFIED_CORRECT', details: 'Physical printer barcode verified in Block B > 2F > IT-201.' }
              ].map((evt, idx) => (
                <div key={idx} className="py-3 flex items-start gap-4 text-xs">
                  <div className="text-slate-400 font-mono text-[11px] whitespace-nowrap">{evt.time}</div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-800">
                      {evt.asset} • {evt.name}
                      <span className="ml-2 font-normal text-slate-500">by {evt.user}</span>
                    </p>
                    <p className="text-slate-600 mt-0.5">{evt.details}</p>
                  </div>
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-semibold uppercase">
                    {evt.action}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: ATTACHMENTS */}
        {activeTab === 'ATTACHMENTS' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Campaign Evidence & Photographic Attachments</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Store photographic evidence, signed checklists, and condition inspection reports.
                </p>
              </div>
              <button className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#6C2BD9] text-white text-xs font-semibold rounded-lg shadow-2xs hover:bg-[#5B21B6]">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Evidence</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <FileText className="w-4 h-4 text-[#6C2BD9]" />
                  <span>floor_audit_signoff_block_b.pdf</span>
                </div>
                <p className="text-[11px] text-slate-500">Uploaded 10 Sep 2026 by John Doe (1.1 MB)</p>
                <button className="text-xs font-semibold text-[#6C2BD9] hover:underline flex items-center gap-1">
                  <Download className="w-3.5 h-3.5" /> Download
                </button>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <Camera className="w-4 h-4 text-amber-600" />
                  <span>damage_photo_AS-000130.jpg</span>
                </div>
                <p className="text-[11px] text-slate-500">Uploaded 10 Sep 2026 by John Doe (2.4 MB)</p>
                <button className="text-xs font-semibold text-[#6C2BD9] hover:underline flex items-center gap-1">
                  <Download className="w-3.5 h-3.5" /> View Photo
                </button>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <Camera className="w-4 h-4 text-purple-600" />
                  <span>rack4_cisco_unregistered.jpg</span>
                </div>
                <p className="text-[11px] text-slate-500">Uploaded 10 Sep 2026 by John Doe (3.8 MB)</p>
                <button className="text-xs font-semibold text-[#6C2BD9] hover:underline flex items-center gap-1">
                  <Download className="w-3.5 h-3.5" /> View Photo
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL 1: Mark as Moved / Relocated Dialog */}
      {showMoveModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-amber-600" />
                <span>Mark as Moved ({selectedAsset?.assetNo})</span>
              </h3>
              <button onClick={() => setShowMoveModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-600 mb-1">System Location</label>
                <input
                  type="text"
                  disabled
                  value={selectedAsset?.systemLocation || ''}
                  className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Observed Verified Location *</label>
                <select
                  value={moveForm.verifiedLocation}
                  onChange={(e) => setMoveForm(prev => ({ ...prev, verifiedLocation: e.target.value }))}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-slate-800 focus:border-[#6C2BD9]"
                >
                  <option>Block B &gt; 2F &gt; IT-201</option>
                  <option>Block B &gt; 3F &gt; IT-301</option>
                  <option>Block C &gt; 1F &gt; CONF-01</option>
                  <option>Block C &gt; GF &gt; CONF-01</option>
                  <option>Block A &gt; GF &gt; Lobby</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Observed Verified Custodian *</label>
                <input
                  type="text"
                  value={moveForm.verifiedCustodian}
                  onChange={(e) => setMoveForm(prev => ({ ...prev, verifiedCustodian: e.target.value }))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-slate-800 focus:border-[#6C2BD9]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Reason / Movement Remarks</label>
                <textarea
                  rows={2}
                  value={moveForm.reason}
                  onChange={(e) => setMoveForm(prev => ({ ...prev, reason: e.target.value }))}
                  className="w-full border border-slate-200 rounded-lg p-2 text-slate-800 focus:border-[#6C2BD9]"
                />
              </div>

              <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-800">
                Audit Rule: This will log a discrepancy and create a controlled relocation transfer action without modifying the Asset Master directly.
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowMoveModal(false)}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmMoved}
                className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shadow-2xs"
              >
                Confirm Moved Finding
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Mark as Damaged Dialog */}
      {showDamageModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-600" />
                <span>Mark as Damaged ({selectedAsset?.assetNo})</span>
              </h3>
              <button onClick={() => setShowDamageModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Damage Severity *</label>
                <select
                  value={damageForm.severity}
                  onChange={(e) => setDamageForm(prev => ({ ...prev, severity: e.target.value }))}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-slate-800 focus:border-[#6C2BD9]"
                >
                  <option value="LOW">Low - Minor cosmetic scratch / wear</option>
                  <option value="MEDIUM">Medium - Operational impairment / part loose</option>
                  <option value="CRITICAL">Critical - Safety risk / completely broken</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Condition Description *</label>
                <textarea
                  rows={2}
                  value={damageForm.issueDescription}
                  onChange={(e) => setDamageForm(prev => ({ ...prev, issueDescription: e.target.value }))}
                  className="w-full border border-slate-200 rounded-lg p-2 text-slate-800 focus:border-[#6C2BD9]"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="createWorkOrder"
                  checked={damageForm.createWorkOrder}
                  onChange={(e) => setDamageForm(prev => ({ ...prev, createWorkOrder: e.target.checked }))}
                  className="rounded border-slate-300 text-[#6C2BD9] focus:ring-[#6C2BD9]"
                />
                <label htmlFor="createWorkOrder" className="font-semibold text-slate-800 text-xs">
                  Automatically generate Maintenance Work Order
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowDamageModal(false)}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDamaged}
                className="px-4 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-semibold shadow-2xs"
              >
                Record Damaged Asset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Mark as Not Found Confirmation */}
      {showNotFoundModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <XCircle className="w-4 h-4 text-rose-600" />
                <span>Confirm Not Found ({selectedAsset?.assetNo})</span>
              </h3>
              <button onClick={() => setShowNotFoundModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-600 space-y-2">
              <p>
                Are you sure you want to mark <span className="font-bold text-slate-900">{selectedAsset?.assetNo}</span> ({selectedAsset?.assetName}) as <span className="font-bold text-rose-600">Not Found</span>?
              </p>
              <p className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-900">
                This item will be registered in the Discrepancies log as a missing exception for investigation.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowNotFoundModal(false)}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmNotFound}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-2xs"
              >
                Confirm Not Found
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Bulk Actions Modal */}
      {showBulkActionModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Bulk Verification Operations</h3>
              <button onClick={() => setShowBulkActionModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <button
                onClick={() => {
                  setAssets(prev => prev.map(a => selectedAssetIds.includes(a.id) ? { ...a, verificationStatus: 'Verified', verifiedLocation: a.systemLocation, verifiedCustodian: a.systemCustodian, lastVerified: '10 Sep 2026 12:45' } : a));
                  setShowBulkActionModal(false);
                  showNotification('success', `Marked ${selectedAssetIds.length} selected assets as Verified.`);
                }}
                disabled={selectedAssetIds.length === 0}
                className="w-full py-2 px-3 text-left border border-slate-200 rounded-lg hover:bg-emerald-50 hover:border-emerald-300 font-semibold text-slate-800 disabled:opacity-40"
              >
                Mark Selected as Verified ({selectedAssetIds.length})
              </button>

              <button
                onClick={() => {
                  setShowBulkActionModal(false);
                  showNotification('success', 'Simulated bulk RFID scan import completed (32 tags parsed, duplicates suppressed).');
                }}
                className="w-full py-2 px-3 text-left border border-slate-200 rounded-lg hover:bg-purple-50 hover:border-purple-300 font-semibold text-slate-800"
              >
                Bulk Import RFID Sweep / Handheld CSV
              </button>

              <button
                onClick={() => {
                  setShowBulkActionModal(false);
                  showNotification('success', 'Floor checklist exported to CSV / Excel.');
                }}
                className="w-full py-2 px-3 text-left border border-slate-200 rounded-lg hover:bg-slate-50 font-semibold text-slate-800"
              >
                Export Current Verification Sheet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: Complete Audit Modal */}
      {showCompleteModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#6C2BD9]" />
                <span>Complete Verification Campaign</span>
              </h3>
              <button onClick={() => setShowCompleteModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-600 space-y-3">
              {pendingExceptionsCount > 0 ? (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 space-y-1">
                  <p className="font-bold flex items-center gap-1.5">
                    <XCircle className="w-4 h-4 text-rose-600" />
                    Cannot Close: {pendingExceptionsCount} Unresolved Exceptions
                  </p>
                  <p className="text-[11px]">
                    The FSD specifies that campaign closure must require configured exceptions to be resolved or approved. You must resolve these items in the Discrepancies tab first.
                  </p>
                </div>
              ) : (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 space-y-1">
                  <p className="font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    All Exceptions Reconciled
                  </p>
                  <p className="text-[11px]">
                    Completing this campaign will lock the verification snapshot and generate an immutable reconciliation audit report.
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowCompleteModal(false)}
                className="px-3.5 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Close
              </button>
              <button
                disabled={pendingExceptionsCount > 0}
                onClick={() => {
                  setCampaign(prev => ({ ...prev, status: 'Completed' }));
                  setShowCompleteModal(false);
                  showNotification('success', 'Campaign AUD-2026-0008 completed & immutable reconciliation report generated.');
                }}
                className="px-4 py-1.5 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white rounded-lg text-xs font-semibold shadow-2xs disabled:opacity-40"
              >
                Lock Audit & Complete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AssetVerification;
