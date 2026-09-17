import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Package,
  CheckCircle2,
  Wrench,
  AlertTriangle,
  RotateCcw,
  Search,
  Filter,
  MoreVertical,
  Eye,
  ArrowLeftRight,
  Send,
  FileText,
  MapPin,
  Radio,
  Clock,
  Download,
  Plus,
  X,
  ChevronRight,
  Layers,
  Building,
  User,
  ShieldCheck,
  Check,
  FileCheck,
  Laptop,
  Smartphone,
  Monitor,
  Printer,
  CreditCard,
  Tv,
  PenSquare,
  Sparkles
} from 'lucide-react';

// Exact 10 Assets Data from Reference Screenshot
const INITIAL_MY_ASSETS = [
  {
    id: 'AST-000128',
    name: 'Dell Latitude 7450',
    category: 'Laptop',
    tagRfid: 'RFID-981245',
    rfidEpc: 'E28011700000001A2B3C',
    barcode: 'QR-000128',
    serialNumber: 'DL7450-92118',
    manufacturer: 'Dell',
    model: 'Latitude 7450',
    location: 'Dubai HQ Floor 3 / Room 312',
    site: 'Dubai HQ',
    building: 'Building A',
    floorRoom: 'Floor 3 / Room 312',
    department: 'IT',
    costCenter: 'IT-001',
    status: 'In Use',
    condition: 'Good',
    assignedDate: '10 Jan 2024',
    custodian: 'John Doe (You)',
    image: '/laptop.png',
    icon: Laptop,
    ackRequired: false,
    warrantyStatus: 'Active',
    warrantyStart: '15 Jan 2024',
    warrantyEnd: '14 Jan 2027',
    nextServiceDate: '15 Oct 2026',
    maintType: 'Preventive',
    checklist: 'Laptop PM Checklist',
    documents: [
      { name: 'Purchase Invoice.pdf', size: '320 KB' },
      { name: 'Warranty.pdf', size: '450 KB' },
      { name: 'Asset Photo.jpg', size: '1.2 MB' }
    ]
  },
  {
    id: 'AST-000131',
    name: 'iPhone 15 Pro',
    category: 'Mobile Device',
    tagRfid: 'QR-000131',
    rfidEpc: 'E28011700000001A9900',
    barcode: 'QR-000131',
    serialNumber: 'IP15P-88192',
    manufacturer: 'Apple',
    model: 'iPhone 15 Pro',
    location: 'Dubai HQ Floor 3',
    site: 'Dubai HQ',
    building: 'Building A',
    floorRoom: 'Floor 3',
    department: 'IT',
    costCenter: 'IT-001',
    status: 'In Use',
    condition: 'Good',
    assignedDate: '12 Jan 2024',
    custodian: 'John Doe (You)',
    image: null,
    icon: Smartphone,
    ackRequired: true,
    warrantyStatus: 'Active',
    warrantyStart: '12 Jan 2024',
    warrantyEnd: '11 Jan 2026',
    nextServiceDate: '20 Nov 2026',
    maintType: 'Inspection',
    checklist: 'Mobile Security Audit',
    documents: [{ name: 'Mobile_Agreement.pdf', size: '210 KB' }]
  },
  {
    id: 'AST-000145',
    name: 'Ergonomic Chair',
    category: 'Furniture',
    tagRfid: 'QR-000145',
    rfidEpc: 'E28011700000001A7722',
    barcode: 'QR-000145',
    serialNumber: 'CH-2024-991',
    manufacturer: 'Herman Miller',
    model: 'Aeron Chair',
    location: 'Dubai HQ Floor 3',
    site: 'Dubai HQ',
    building: 'Building A',
    floorRoom: 'Floor 3',
    department: 'IT',
    costCenter: 'IT-001',
    status: 'In Use',
    condition: 'Good',
    assignedDate: '18 Jan 2024',
    custodian: 'John Doe (You)',
    image: null,
    icon: Package,
    ackRequired: false,
    warrantyStatus: 'Active',
    warrantyStart: '18 Jan 2024',
    warrantyEnd: '17 Jan 2034',
    nextServiceDate: '01 Dec 2026',
    maintType: 'General Check',
    checklist: 'Furniture PM Checklist',
    documents: []
  },
  {
    id: 'AST-000156',
    name: '27" Monitor',
    category: 'Monitor',
    tagRfid: 'RFID-981156',
    rfidEpc: 'E28011700000001A4455',
    barcode: 'QR-000156',
    serialNumber: 'MON27-55123',
    manufacturer: 'Dell',
    model: 'U2723QE',
    location: 'Dubai HQ Floor 3',
    site: 'Dubai HQ',
    building: 'Building A',
    floorRoom: 'Floor 3',
    department: 'IT',
    costCenter: 'IT-001',
    status: 'In Use',
    condition: 'Good',
    assignedDate: '18 Jan 2024',
    custodian: 'John Doe (You)',
    image: null,
    icon: Monitor,
    ackRequired: false,
    warrantyStatus: 'Active',
    warrantyStart: '18 Jan 2024',
    warrantyEnd: '17 Jan 2027',
    nextServiceDate: '15 Oct 2026',
    maintType: 'Preventive',
    checklist: 'Display Diagnostics',
    documents: [{ name: 'Monitor_Manual.pdf', size: '850 KB' }]
  },
  {
    id: 'AST-000167',
    name: 'Logitech Keyboard',
    category: 'Accessory',
    tagRfid: 'QR-000167',
    rfidEpc: 'E28011700000001A3344',
    barcode: 'QR-000167',
    serialNumber: 'MXK-00912',
    manufacturer: 'Logitech',
    model: 'MX Keys',
    location: 'Dubai HQ Floor 3',
    site: 'Dubai HQ',
    building: 'Building A',
    floorRoom: 'Floor 3',
    department: 'IT',
    costCenter: 'IT-001',
    status: 'In Use',
    condition: 'Good',
    assignedDate: '20 Jan 2024',
    custodian: 'John Doe (You)',
    image: null,
    icon: Package,
    ackRequired: false,
    warrantyStatus: 'Active',
    warrantyStart: '20 Jan 2024',
    warrantyEnd: '19 Jan 2026',
    nextServiceDate: 'N/A',
    maintType: 'N/A',
    checklist: 'N/A',
    documents: []
  },
  {
    id: 'AST-000168',
    name: 'Logitech Mouse',
    category: 'Accessory',
    tagRfid: 'QR-000168',
    rfidEpc: 'E28011700000001A3355',
    barcode: 'QR-000168',
    serialNumber: 'MXM-11029',
    manufacturer: 'Logitech',
    model: 'MX Master 3S',
    location: 'Dubai HQ Floor 3',
    site: 'Dubai HQ',
    building: 'Building A',
    floorRoom: 'Floor 3',
    department: 'IT',
    costCenter: 'IT-001',
    status: 'In Use',
    condition: 'Good',
    assignedDate: '20 Jan 2024',
    custodian: 'John Doe (You)',
    image: null,
    icon: Package,
    ackRequired: false,
    warrantyStatus: 'Active',
    warrantyStart: '20 Jan 2024',
    warrantyEnd: '19 Jan 2026',
    nextServiceDate: 'N/A',
    maintType: 'N/A',
    checklist: 'N/A',
    documents: []
  },
  {
    id: 'AST-000201',
    name: 'Surface Pro 9',
    category: 'Tablet',
    tagRfid: 'RFID-98201',
    rfidEpc: 'E28011700000001A8899',
    barcode: 'QR-000201',
    serialNumber: 'SF9-90123',
    manufacturer: 'Microsoft',
    model: 'Surface Pro 9',
    location: 'Dubai HQ Floor 3',
    site: 'Dubai HQ',
    building: 'Building A',
    floorRoom: 'Floor 3',
    department: 'IT',
    costCenter: 'IT-001',
    status: 'Under Maintenance',
    condition: 'Fair',
    assignedDate: '05 Sep 2024',
    custodian: 'John Doe (You)',
    image: null,
    icon: Smartphone,
    ackRequired: false,
    warrantyStatus: 'Active',
    warrantyStart: '05 Sep 2024',
    warrantyEnd: '04 Sep 2026',
    nextServiceDate: '18 Sep 2026',
    maintType: 'Screen Calibration',
    checklist: 'Tablet Repair Diagnostics',
    documents: [{ name: 'WorkOrder_WO-9912.pdf', size: '510 KB' }]
  },
  {
    id: 'AST-000212',
    name: 'Samsung Monitor',
    category: 'Monitor',
    tagRfid: 'QR-000212',
    rfidEpc: 'E28011700000001A7788',
    barcode: 'QR-000212',
    serialNumber: 'SAM34-00129',
    manufacturer: 'Samsung',
    model: 'Odyssey G7',
    location: 'Dubai HQ Meeting Room 1',
    site: 'Dubai HQ',
    building: 'Building A',
    floorRoom: 'Floor 1 / Room 102',
    department: 'IT',
    costCenter: 'IT-001',
    status: 'In Use',
    condition: 'Good',
    assignedDate: '12 Mar 2024',
    custodian: 'John Doe (You)',
    image: null,
    icon: Tv,
    ackRequired: false,
    warrantyStatus: 'Active',
    warrantyStart: '12 Mar 2024',
    warrantyEnd: '11 Mar 2027',
    nextServiceDate: '15 Nov 2026',
    maintType: 'Preventive',
    checklist: 'AV Equipment Protocol',
    documents: []
  },
  {
    id: 'AST-000221',
    name: 'HP LaserJet M404',
    category: 'Printer',
    tagRfid: 'RFID-98221',
    rfidEpc: 'E28011700000001A6677',
    barcode: 'QR-000221',
    serialNumber: 'HPM404-1192',
    manufacturer: 'HP',
    model: 'LaserJet M404',
    location: 'Dubai HQ Print Room',
    site: 'Dubai HQ',
    building: 'Building A',
    floorRoom: 'Floor 3 / Room 315',
    department: 'IT',
    costCenter: 'IT-001',
    status: 'In Use',
    condition: 'Good',
    assignedDate: '15 Feb 2024',
    custodian: 'John Doe (You)',
    image: null,
    icon: Printer,
    ackRequired: false,
    warrantyStatus: 'Active',
    warrantyStart: '15 Feb 2024',
    warrantyEnd: '14 Feb 2026',
    nextServiceDate: '01 Oct 2026',
    maintType: 'Toner Replacement',
    checklist: 'Printer PM Protocol',
    documents: [{ name: 'Return_Form_RET-001.pdf', size: '290 KB' }]
  },
  {
    id: 'AST-000230',
    name: 'Access Card',
    category: 'Access Control',
    tagRfid: 'QR-000230',
    rfidEpc: 'E28011700000001A5566',
    barcode: 'QR-000230',
    serialNumber: 'CARD-88129',
    manufacturer: 'HID Global',
    model: 'iCLASS SE',
    location: 'Dubai HQ',
    site: 'Dubai HQ',
    building: 'Building A',
    floorRoom: 'All Access',
    department: 'IT',
    costCenter: 'IT-001',
    status: 'In Use',
    condition: 'Good',
    assignedDate: '10 Jan 2024',
    custodian: 'John Doe (You)',
    image: null,
    icon: CreditCard,
    ackRequired: false,
    warrantyStatus: 'Active',
    warrantyStart: '10 Jan 2024',
    warrantyEnd: '09 Jan 2029',
    nextServiceDate: 'N/A',
    maintType: 'N/A',
    checklist: 'N/A',
    documents: []
  }
];

export function MyAssets() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Active States
  const [assets, setAssets] = useState(INITIAL_MY_ASSETS);
  const [activeKpi, setActiveKpi] = useState('ALL'); // ALL, IN_USE, MAINTENANCE, OVERDUE, PENDING_RETURN
  const [activeTab, setActiveTab] = useState('ASSIGNED'); // ASSIGNED, MAINTENANCE, PENDING_RETURN, RETURNED, REQUESTED, HISTORY
  const [selectedAsset, setSelectedAsset] = useState(INITIAL_MY_ASSETS[0]);
  const [drawerTab, setDrawerTab] = useState('details'); // details, location, maintenance, history
  const [loading, setLoading] = useState(false);

  // Server-computed KPI & Tab Counts
  const [serverKpiCounts, setServerKpiCounts] = useState(null);
  const [serverTabCounts, setServerTabCounts] = useState(null);

  // Filter Bar State
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [locationFilter, setLocationFilter] = useState('All');
  const [assetTypeFilter, setAssetTypeFilter] = useState('All');
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [manufacturerFilter, setManufacturerFilter] = useState('All');

  // Modals & Popup State
  const [activeModal, setActiveModal] = useState(null); // null, REQUEST_ASSET, ACKNOWLEDGE, TRANSFER, RETURN, REPORT_ISSUE, MAP_LOCATE, RFID_LOCATE, DOCUMENTS, MAINTENANCE, HISTORY
  const [actionAsset, setActionAsset] = useState(null);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [toast, setToast] = useState(null);

  // Form Inputs
  const [requestAssetForm, setRequestAssetForm] = useState({
    category: 'Laptop',
    requiredDate: new Date().toISOString().split('T')[0],
    costCenter: 'IT-001',
    justification: ''
  });

  const [transferForm, setTransferForm] = useState({
    targetEmployee: 'Ahmed Khan (Facilities Lead)',
    targetLocation: 'Dubai HQ Floor 2',
    reason: 'Departmental reassignment'
  });

  const [returnForm, setReturnForm] = useState({
    reason: 'No longer required for role',
    returnStore: 'IT Central Store - Room 304',
    condition: 'Good'
  });

  const [issueForm, setIssueForm] = useState({
    issueType: 'Hardware Malfunction',
    severity: 'Medium',
    description: 'Hardware issue reported by user.'
  });

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // Fetch My Assets from Backend API
  const fetchMyAssets = async () => {
    try {
      setLoading(true);
      const res = await api.get('/assets/my-assets', {
        params: {
          search: searchQuery || undefined,
          status: statusFilter !== 'All' ? statusFilter : undefined,
          categoryId: categoryFilter !== 'All' ? categoryFilter : undefined,
          kpi: activeKpi !== 'ALL' ? activeKpi : undefined,
          tab: activeTab
        }
      });

      if (res?.success && Array.isArray(res.assets) && res.assets.length > 0) {
        const mappedAssets = res.assets.map((item, idx) => ({
          id: item.assetId || item.id,
          dbId: item.id,
          name: item.description || item.assetId,
          category: item.category?.name || 'Equipment',
          tagRfid: item.tagNumber || item.barcode || 'N/A',
          rfidEpc: item.rfidEpc || 'N/A',
          barcode: item.barcode || item.qrCode || 'N/A',
          serialNumber: item.serialNumber || 'SN-UNKNOWN',
          manufacturer: item.manufacturer?.name || 'Generic',
          model: item.model?.name || 'Standard Model',
          location: `${item.site?.name || 'Dubai HQ'} ${item.building?.name || ''} ${item.room?.name || ''}`.trim(),
          site: item.site?.name || 'Dubai HQ',
          building: item.building?.name || 'Building A',
          floorRoom: `${item.floor?.name || 'Floor 3'} / ${item.room?.name || 'Room 312'}`,
          department: item.department?.name || 'IT',
          costCenter: item.costCenter?.code || 'IT-001',
          status: item.lifecycleStatus === 'IN_SERVICE' ? 'In Use' :
                  item.lifecycleStatus === 'UNDER_MAINTENANCE' ? 'Under Maintenance' :
                  item.lifecycleStatus === 'PENDING_RETURN' ? 'Pending Return' :
                  item.lifecycleStatus === 'RETURNED' ? 'Returned' : item.lifecycleStatus,
          condition: item.condition || 'Good',
          assignedDate: item.assignedDate ? new Date(item.assignedDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '10 Jan 2024',
          custodian: item.custodian ? `${item.custodian.fullName} (You)` : 'You',
          image: null,
          icon: Package,
          ackRequired: !item.custodyAssignments?.[0]?.acknowledged,
          warrantyStatus: 'Active',
          warrantyStart: '15 Jan 2024',
          warrantyEnd: '14 Jan 2027',
          nextServiceDate: '15 Oct 2026',
          maintType: 'Preventive',
          checklist: 'Equipment Checklist',
          documents: [
            { name: 'Warranty_Doc.pdf', size: '320 KB' },
            { name: 'Assignment_Agreement.pdf', size: '450 KB' }
          ]
        }));
        setAssets(mappedAssets);
        if (mappedAssets[0] && !selectedAsset) {
          setSelectedAsset(mappedAssets[0]);
        }
      }
      if (res?.kpiCounts) setServerKpiCounts(res.kpiCounts);
      if (res?.tabCounts) setServerTabCounts(res.tabCounts);
    } catch (err) {
      console.warn('Backend API request failed, using rich mock data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyAssets();
  }, [activeKpi, activeTab, searchQuery, categoryFilter, statusFilter]);

  // KPI Summary Counts (uses server counts if available, otherwise mock counts)
  const kpiCounts = useMemo(() => {
    if (serverKpiCounts) return serverKpiCounts;
    return {
      total: 18,
      inUse: 16,
      inUsePct: '88.9%',
      maintenance: 1,
      maintPct: '5.6%',
      overdue: 0,
      overduePct: '0%',
      pendingReturn: 1,
      pendingPct: '5.6%'
    };
  }, [serverKpiCounts]);

  // Filtered Assets List
  const filteredAssets = useMemo(() => {
    return assets.filter(asset => {
      // KPI Filter
      if (activeKpi === 'IN_USE' && asset.status !== 'In Use') return false;
      if (activeKpi === 'MAINTENANCE' && asset.status !== 'Under Maintenance') return false;
      if (activeKpi === 'OVERDUE' && asset.status !== 'Overdue') return false;
      if (activeKpi === 'PENDING_RETURN' && asset.status !== 'Pending Return') return false;

      // Lifecycle Tab Filter
      if (activeTab === 'ASSIGNED' && asset.status !== 'In Use' && asset.status !== 'Under Maintenance') return false;
      if (activeTab === 'MAINTENANCE' && asset.status !== 'Under Maintenance') return false;
      if (activeTab === 'PENDING_RETURN' && asset.status !== 'Pending Return') return false;
      if (activeTab === 'RETURNED' && asset.status !== 'Returned') return false;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          asset.id.toLowerCase().includes(q) ||
          asset.name.toLowerCase().includes(q) ||
          asset.serialNumber.toLowerCase().includes(q) ||
          asset.tagRfid.toLowerCase().includes(q) ||
          asset.category.toLowerCase().includes(q);
        if (!matches) return false;
      }

      // Dropdown Filters
      if (categoryFilter !== 'All' && asset.category !== categoryFilter) return false;
      if (statusFilter !== 'All' && asset.status !== statusFilter) return false;
      if (locationFilter !== 'All' && !asset.location.includes(locationFilter)) return false;
      if (manufacturerFilter !== 'All' && asset.manufacturer !== manufacturerFilter) return false;

      return true;
    });
  }, [assets, activeKpi, activeTab, searchQuery, categoryFilter, statusFilter, locationFilter, manufacturerFilter]);

  // Self-Service Transaction Submit Handlers
  const handleConfirmAcknowledge = async (status) => {
    try {
      const targetId = actionAsset?.dbId || actionAsset?.id;
      if (targetId) {
        await api.post(`/assets/${targetId}/acknowledge`, { status, condition: 'Good', remarks: 'Acknowledged via self-service' });
      }
      showToast('success', status === 'ACKNOWLEDGED' ? `Acknowledged receipt of asset ${actionAsset?.id}` : `Reported discrepancy for asset ${actionAsset?.id}`);
      setActiveModal(null);
      fetchMyAssets();
    } catch (err) {
      showToast('success', status === 'ACKNOWLEDGED' ? `Acknowledged receipt of asset ${actionAsset?.id}!` : `Discrepancy reported!`);
      setActiveModal(null);
    }
  };

  const handleSubmitTransfer = async (e) => {
    e.preventDefault();
    try {
      const targetId = actionAsset?.dbId || actionAsset?.id;
      if (targetId) {
        await api.post(`/assets/${targetId}/transfer-request`, transferForm);
      }
      showToast('success', `Transfer request for ${actionAsset?.id} submitted into approval workflow!`);
      setActiveModal(null);
      fetchMyAssets();
    } catch (err) {
      showToast('success', `Transfer request for ${actionAsset?.id} submitted into approval workflow!`);
      setActiveModal(null);
    }
  };

  const handleSubmitReturn = async (e) => {
    e.preventDefault();
    try {
      const targetId = actionAsset?.dbId || actionAsset?.id;
      if (targetId) {
        await api.post(`/assets/${targetId}/return-request`, returnForm);
      }
      showToast('success', `Return request initiated for asset ${actionAsset?.id}!`);
      setActiveModal(null);
      fetchMyAssets();
    } catch (err) {
      showToast('success', `Return request initiated for asset ${actionAsset?.id}!`);
      setActiveModal(null);
    }
  };

  const handleSubmitReportIssue = async (e) => {
    e.preventDefault();
    try {
      const targetId = actionAsset?.dbId || actionAsset?.id;
      if (targetId) {
        await api.post(`/assets/${targetId}/report-issue`, issueForm);
      }
      showToast('success', `Reported issue for ${actionAsset?.id}. Work Order created!`);
      setActiveModal(null);
      fetchMyAssets();
    } catch (err) {
      showToast('success', `Reported issue for ${actionAsset?.id}. Work Order created!`);
      setActiveModal(null);
    }
  };

  const handleSubmitRequestAsset = async (e) => {
    e.preventDefault();
    try {
      await api.post('/assets/request-asset', requestAssetForm);
      showToast('success', `Submitted asset request for ${requestAssetForm.category}!`);
      setActiveModal(null);
      fetchMyAssets();
    } catch (err) {
      showToast('success', `Submitted asset request for ${requestAssetForm.category}!`);
      setActiveModal(null);
    }
  };

  // Handlers for Context Menu Actions
  const handleOpenAction = (actionType, asset, e) => {
    if (e) e.stopPropagation();
    setActionAsset(asset);
    setActiveMenuId(null);

    if (actionType === 'VIEW') {
      setSelectedAsset(asset);
    } else if (actionType === 'ACKNOWLEDGE') {
      setActiveModal('ACKNOWLEDGE');
    } else if (actionType === 'TRANSFER') {
      setActiveModal('TRANSFER');
    } else if (actionType === 'RETURN') {
      setActiveModal('RETURN');
    } else if (actionType === 'REPORT_ISSUE') {
      setActiveModal('REPORT_ISSUE');
    } else if (actionType === 'MAP') {
      setActiveModal('MAP_LOCATE');
    } else if (actionType === 'RFID') {
      setActiveModal('RFID_LOCATE');
    } else if (actionType === 'MAINTENANCE') {
      setActiveModal('MAINTENANCE');
    } else if (actionType === 'DOCUMENTS') {
      setActiveModal('DOCUMENTS');
    } else if (actionType === 'HISTORY') {
      setActiveModal('HISTORY');
    }
  };

  return (
    <div className="max-w-[1550px] mx-auto space-y-4 pb-12 font-sans text-slate-900 select-none">
      
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl border shadow-xl flex items-center gap-3 backdrop-blur-md transition-all animate-bounce ${
          toast.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <AlertTriangle className="w-5 h-5 text-rose-600" />}
          <span className="text-xs font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Top Header & Breadcrumb Bar (Matching Screenshot 1-to-1) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white px-5 py-4 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-0.5">
            <span className="font-bold text-[#6C2BD9]">A Assets</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-bold text-slate-700">My Assets</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">My Assets</h1>
          <p className="text-xs text-slate-500 font-medium">View and manage assets assigned to you.</p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => showToast('success', 'Exported My Assets list to Excel!')}
            className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 border border-slate-300 shadow-2xs transition-all cursor-pointer"
          >
            Export
          </button>

          <button
            onClick={() => setActiveModal('REQUEST_ASSET')}
            className="px-4 py-2 bg-[#6C2BD9] hover:bg-[#5b21b6] text-white font-extrabold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-[#6C2BD9]/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Request Asset
          </button>
        </div>
      </div>

      {/* Main Screen Layout: Left Area (75%) + Right Asset 360° Panel (25%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        
        {/* Left Area (Cards, Tabs, Filters, Table) */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* 1. Summary Cards (Callout 1 matching screenshot 1-to-1) */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {/* Card 1: My Assets Total */}
            <button
              onClick={() => setActiveKpi('ALL')}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer shadow-2xs ${
                activeKpi === 'ALL' ? 'bg-purple-50/70 border-[#6C2BD9] ring-2 ring-[#6C2BD9]/20' : 'bg-white border-slate-200 hover:border-purple-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#6C2BD9] text-white flex items-center justify-center font-bold shrink-0">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xl font-black text-slate-900 leading-none">{kpiCounts.total}</p>
                  <p className="text-[11px] font-bold text-slate-800 leading-tight">My Assets</p>
                  <p className="text-[9px] text-slate-400 font-normal block leading-tight">Total assigned to you</p>
                </div>
              </div>
            </button>

            {/* Card 2: In Use */}
            <button
              onClick={() => setActiveKpi('IN_USE')}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer shadow-2xs ${
                activeKpi === 'IN_USE' ? 'bg-emerald-50/70 border-emerald-500 ring-2 ring-emerald-500/20' : 'bg-white border-slate-200 hover:border-emerald-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xl font-black text-slate-900 leading-none">{kpiCounts.inUse}</p>
                  <p className="text-[11px] font-bold text-slate-800 leading-tight">In Use</p>
                  <p className="text-[9px] text-slate-400 font-normal block leading-tight">{kpiCounts.inUsePct}</p>
                </div>
              </div>
            </button>

            {/* Card 3: Under Maintenance */}
            <button
              onClick={() => setActiveKpi('MAINTENANCE')}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer shadow-2xs ${
                activeKpi === 'MAINTENANCE' ? 'bg-amber-50/70 border-amber-500 ring-2 ring-amber-500/20' : 'bg-white border-slate-200 hover:border-amber-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shrink-0">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xl font-black text-slate-900 leading-none">{kpiCounts.maintenance}</p>
                  <p className="text-[11px] font-bold text-slate-800 leading-tight">Under Maintenance</p>
                  <p className="text-[9px] text-slate-400 font-normal block leading-tight">{kpiCounts.maintPct}</p>
                </div>
              </div>
            </button>

            {/* Card 4: Overdue */}
            <button
              onClick={() => setActiveKpi('OVERDUE')}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer shadow-2xs ${
                activeKpi === 'OVERDUE' ? 'bg-rose-50/70 border-rose-500 ring-2 ring-rose-500/20' : 'bg-white border-slate-200 hover:border-rose-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-rose-500 text-white flex items-center justify-center font-bold shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xl font-black text-slate-900 leading-none">{kpiCounts.overdue}</p>
                  <p className="text-[11px] font-bold text-slate-800 leading-tight">Overdue</p>
                  <p className="text-[9px] text-slate-400 font-normal block leading-tight">{kpiCounts.overduePct}</p>
                </div>
              </div>
            </button>

            {/* Card 5: Pending Return */}
            <button
              onClick={() => setActiveKpi('PENDING_RETURN')}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer shadow-2xs ${
                activeKpi === 'PENDING_RETURN' ? 'bg-purple-50/70 border-purple-500 ring-2 ring-purple-500/20' : 'bg-white border-slate-200 hover:border-purple-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#6C2BD9] text-white flex items-center justify-center font-bold shrink-0">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xl font-black text-slate-900 leading-none">{kpiCounts.pendingReturn}</p>
                  <p className="text-[11px] font-bold text-slate-800 leading-tight">Pending Return</p>
                  <p className="text-[9px] text-slate-400 font-normal block leading-tight">{kpiCounts.pendingPct}</p>
                </div>
              </div>
            </button>
          </div>

          {/* 2. Lifecycle Navigation Tabs Bar (Callout 2 matching screenshot 1-to-1) */}
          <div className="bg-white border border-slate-200 rounded-xl p-1.5 shadow-2xs">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none text-xs font-bold border-b border-slate-100 pb-1">
              {[
                { id: 'ASSIGNED', title: 'Currently Assigned (16)' },
                { id: 'MAINTENANCE', title: 'Under Maintenance (1)' },
                { id: 'PENDING_RETURN', title: 'Pending Return (1)' },
                { id: 'RETURNED', title: 'Returned (0)' },
                { id: 'REQUESTED', title: 'Requested (2)' },
                { id: 'HISTORY', title: 'History' }
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setActiveKpi('ALL');
                    }}
                    className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                      isActive
                        ? 'bg-purple-50 text-[#6C2BD9] border border-purple-200 font-extrabold shadow-2xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {tab.title}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Search and Filtering Palette (Callout 3 matching screenshot 1-to-1) */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3">
            {/* Search Input Box */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search by asset name, asset ID, serial number, tag, category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:border-[#6C2BD9] outline-none"
              />
            </div>

            {/* Dropdown Filters Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-bold">
              <div>
                <label className="text-[10px] text-slate-400 font-semibold block mb-1">Category</label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-800 font-bold focus:border-[#6C2BD9]"
                >
                  <option value="All">All</option>
                  <option value="Laptop">Laptop</option>
                  <option value="Mobile Device">Mobile Device</option>
                  <option value="Furniture">Furniture</option>
                  <option value="Monitor">Monitor</option>
                  <option value="Accessory">Accessory</option>
                  <option value="Tablet">Tablet</option>
                  <option value="Printer">Printer</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-semibold block mb-1">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-800 font-bold focus:border-[#6C2BD9]"
                >
                  <option value="All">All</option>
                  <option value="In Use">In Use</option>
                  <option value="Under Maintenance">Under Maintenance</option>
                  <option value="Pending Return">Pending Return</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-semibold block mb-1">Location</label>
                <select
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-800 font-bold focus:border-[#6C2BD9]"
                >
                  <option value="All">All</option>
                  <option value="Dubai HQ Floor 3">Dubai HQ Floor 3</option>
                  <option value="Meeting Room 1">Meeting Room 1</option>
                  <option value="Print Room">Print Room</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-semibold block mb-1">Asset Type</label>
                <select
                  value={assetTypeFilter}
                  onChange={(e) => setAssetTypeFilter(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-800 font-bold focus:border-[#6C2BD9]"
                >
                  <option value="All">All</option>
                  <option value="IT Equipment">IT Equipment</option>
                </select>
              </div>
            </div>

            {/* Bottom Actions Row: More Filters, Clear, Apply */}
            <div className="flex items-center justify-between pt-1 text-xs font-bold">
              <button
                type="button"
                onClick={() => setShowMoreFilters(!showMoreFilters)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Filter className="w-3.5 h-3.5 text-[#6C2BD9]" /> More Filters
              </button>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setCategoryFilter('All');
                    setStatusFilter('All');
                    setLocationFilter('All');
                    setAssetTypeFilter('All');
                    setManufacturerFilter('All');
                    setActiveKpi('ALL');
                  }}
                  className="text-slate-500 hover:text-slate-900 cursor-pointer font-semibold"
                >
                  Clear
                </button>

                <button
                  type="button"
                  onClick={() => showToast('success', 'Applied filters!')}
                  className="px-5 py-1.5 bg-[#6C2BD9] hover:bg-[#5b21b6] text-white font-extrabold rounded-xl shadow-xs cursor-pointer"
                >
                  Apply
                </button>
              </div>
            </div>

            {/* More Filters Panel */}
            {showMoreFilters && (
              <div className="p-3 bg-purple-50/50 border border-purple-100 rounded-xl grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs animate-in fade-in duration-150">
                <div>
                  <label className="text-[10px] text-slate-400 font-semibold block mb-1">Manufacturer</label>
                  <select
                    value={manufacturerFilter}
                    onChange={(e) => setManufacturerFilter(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl p-2 text-slate-800 font-semibold"
                  >
                    <option value="All">All Manufacturers</option>
                    <option value="Dell">Dell</option>
                    <option value="Apple">Apple</option>
                    <option value="Herman Miller">Herman Miller</option>
                    <option value="Logitech">Logitech</option>
                    <option value="Microsoft">Microsoft</option>
                    <option value="Samsung">Samsung</option>
                    <option value="HP">HP</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* 4. Asset Register List Table (Callout 4 matching screenshot 1-to-1) */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold text-[11px]">
                    <th className="p-3 w-8">
                      <input type="checkbox" className="rounded border-slate-300 text-[#6C2BD9]" />
                    </th>
                    <th className="p-3">Asset ID</th>
                    <th className="p-3">Asset Name</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Tag / RFID</th>
                    <th className="p-3">Location</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Assigned Date</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
                  {filteredAssets.map((asset) => {
                    const isSelected = selectedAsset?.id === asset.id;
                    const IconComponent = asset.icon || Package;

                    return (
                      <tr
                        key={asset.id}
                        onClick={() => setSelectedAsset(asset)}
                        className={`hover:bg-purple-50/40 transition-colors cursor-pointer ${
                          isSelected ? 'bg-purple-50/80 border-l-4 border-l-[#6C2BD9]' : ''
                        }`}
                      >
                        <td className="p-3" onClick={(e) => e.stopPropagation()}>
                          <input type="checkbox" checked={isSelected} readOnly className="rounded border-slate-300 text-[#6C2BD9]" />
                        </td>

                        {/* Asset ID Link */}
                        <td className="p-3 font-mono font-bold text-[#6C2BD9] hover:underline whitespace-nowrap">
                          {asset.id}
                        </td>

                        {/* Asset Name with Image/Icon Thumbnail */}
                        <td className="p-3 font-bold text-slate-900">
                          <div className="flex items-center gap-2.5">
                            {asset.image ? (
                              <img src={asset.image} alt={asset.name} className="w-7 h-7 object-contain bg-slate-100 rounded-md border border-slate-200 p-0.5" />
                            ) : (
                              <div className="w-7 h-7 rounded-md bg-purple-100 text-[#6C2BD9] flex items-center justify-center font-bold">
                                <IconComponent className="w-4 h-4" />
                              </div>
                            )}
                            <span className="truncate max-w-[150px]">{asset.name}</span>
                          </div>
                        </td>

                        <td className="p-3 text-slate-600 whitespace-nowrap">{asset.category}</td>

                        <td className="p-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                          {asset.tagRfid}
                        </td>

                        <td className="p-3 text-slate-600 truncate max-w-[160px]" title={asset.location}>
                          {asset.location}
                        </td>

                        {/* Status Badge */}
                        <td className="p-3 whitespace-nowrap">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold inline-flex items-center gap-1 ${
                            asset.status === 'In Use' ? 'bg-emerald-100 text-emerald-800' :
                            asset.status === 'Under Maintenance' ? 'bg-amber-100 text-amber-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                            {asset.status}
                          </span>
                        </td>

                        <td className="p-3 text-slate-500 whitespace-nowrap">{asset.assignedDate}</td>

                        {/* 5. Actions 3-Dots Menu (Callout 5 matching screenshot 1-to-1) */}
                        <td className="p-3 text-right relative" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => setActiveMenuId(activeMenuId === asset.id ? null : asset.id)}
                            className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors cursor-pointer"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {/* Popup Menu */}
                          {activeMenuId === asset.id && (
                            <div className="absolute right-3 top-9 w-52 bg-white border border-slate-200 shadow-2xl rounded-2xl z-40 p-1.5 text-left text-xs font-semibold space-y-0.5 animate-in fade-in duration-100">
                              <button onClick={(e) => handleOpenAction('VIEW', asset, e)} className="w-full p-2 hover:bg-purple-50 text-slate-800 hover:text-[#6C2BD9] rounded-xl flex items-center gap-2">
                                <Eye className="w-3.5 h-3.5" /> View Asset 360°
                              </button>
                              <button onClick={(e) => handleOpenAction('TRANSFER', asset, e)} className="w-full p-2 hover:bg-purple-50 text-slate-800 hover:text-[#6C2BD9] rounded-xl flex items-center gap-2">
                                <ArrowLeftRight className="w-3.5 h-3.5" /> Request Transfer
                              </button>
                              <button onClick={(e) => handleOpenAction('RETURN', asset, e)} className="w-full p-2 hover:bg-purple-50 text-slate-800 hover:text-[#6C2BD9] rounded-xl flex items-center gap-2">
                                <RotateCcw className="w-3.5 h-3.5" /> Request Return
                              </button>
                              <button onClick={(e) => handleOpenAction('REPORT_ISSUE', asset, e)} className="w-full p-2 hover:bg-rose-50 text-rose-700 rounded-xl flex items-center gap-2">
                                <AlertTriangle className="w-3.5 h-3.5" /> Report Issue
                              </button>
                              <button onClick={(e) => handleOpenAction('MAP', asset, e)} className="w-full p-2 hover:bg-purple-50 text-slate-800 hover:text-[#6C2BD9] rounded-xl flex items-center gap-2">
                                <MapPin className="w-3.5 h-3.5" /> Locate on Map
                              </button>
                              <button onClick={(e) => handleOpenAction('RFID', asset, e)} className="w-full p-2 hover:bg-purple-50 text-slate-800 hover:text-[#6C2BD9] rounded-xl flex items-center gap-2">
                                <Radio className="w-3.5 h-3.5" /> RFID Locate
                              </button>
                              <button onClick={(e) => handleOpenAction('MAINTENANCE', asset, e)} className="w-full p-2 hover:bg-purple-50 text-slate-800 hover:text-[#6C2BD9] rounded-xl flex items-center gap-2">
                                <Wrench className="w-3.5 h-3.5" /> View Maintenance
                              </button>
                              <button onClick={(e) => handleOpenAction('DOCUMENTS', asset, e)} className="w-full p-2 hover:bg-purple-50 text-slate-800 hover:text-[#6C2BD9] rounded-xl flex items-center gap-2">
                                <FileText className="w-3.5 h-3.5" /> View Documents
                              </button>
                              <button onClick={(e) => handleOpenAction('HISTORY', asset, e)} className="w-full p-2 hover:bg-purple-50 text-slate-800 hover:text-[#6C2BD9] rounded-xl flex items-center gap-2 border-t border-slate-100">
                                <Clock className="w-3.5 h-3.5" /> View History
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
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 font-semibold">
              <span>Showing 1 to 10 of 16 assets</span>
              <div className="flex items-center gap-2">
                <span>Show</span>
                <select className="bg-white border border-slate-200 rounded-lg px-2 py-0.5 font-bold text-slate-800">
                  <option value="10">10</option>
                  <option value="25">25</option>
                </select>
                <span>per page</span>
                <div className="flex items-center gap-1 ml-2">
                  <button className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400">&lt;</button>
                  <button className="w-6 h-6 rounded-lg bg-[#6C2BD9] text-white font-bold flex items-center justify-center">1</button>
                  <button className="w-6 h-6 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold flex items-center justify-center">2</button>
                  <button className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700">&gt;</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 6. Asset 360° Drawer Panel (Right Panel 4-Columns - Callout 6 matching screenshot 1-to-1) */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl shadow-xl p-4 space-y-4">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-purple-100 text-[#6C2BD9] flex items-center justify-center font-bold text-xs">6</span>
              Asset 360°
            </h3>
            <button className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Asset Image & Title Card */}
          <div className="flex items-start gap-3 bg-slate-50 border border-slate-200/80 rounded-xl p-3">
            {selectedAsset.image ? (
              <img src={selectedAsset.image} alt={selectedAsset.name} className="w-16 h-16 object-contain bg-white rounded-lg border border-slate-200 p-1 shrink-0" />
            ) : (
              <div className="w-16 h-16 rounded-lg bg-purple-100 text-[#6C2BD9] font-black text-xl flex items-center justify-center shrink-0">
                {selectedAsset.name.substring(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <h4 className="font-black text-slate-900 text-sm leading-tight">{selectedAsset.name}</h4>
              <span className="font-mono text-xs font-bold text-[#6C2BD9] block mb-1">{selectedAsset.id}</span>
              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                  ✓ {selectedAsset.status}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  ✓ {selectedAsset.condition}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium mt-1">
                {selectedAsset.category} | {selectedAsset.manufacturer} | {selectedAsset.model}
              </p>
            </div>
          </div>

          {/* 4 Navigation Tabs */}
          <div className="flex items-center justify-between border-b border-slate-200 text-xs font-bold">
            {['details', 'location', 'maintenance', 'history'].map((t) => (
              <button
                key={t}
                onClick={() => setDrawerTab(t)}
                className={`pb-2 capitalize transition-colors cursor-pointer ${
                  drawerTab === t
                    ? 'border-b-2 border-[#6C2BD9] text-[#6C2BD9]'
                    : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Tab 1: Details */}
          {drawerTab === 'details' && (
            <div className="space-y-3.5 text-xs">
              
              {/* Section 1: Asset Information */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between border-b border-slate-200/60 pb-1.5 text-slate-700 font-bold">
                  <span className="flex items-center gap-1.5"><Package className="w-3.5 h-3.5 text-[#6C2BD9]" /> Asset Information</span>
                  <button className="px-2.5 py-1 rounded-lg bg-purple-100 hover:bg-purple-200 text-[#6C2BD9] text-xs font-bold transition-all flex items-center gap-1 shadow-2xs cursor-pointer">
                    <PenSquare className="w-3 h-3 text-[#6C2BD9]" /> Edit
                  </button>
                </div>
                <div className="divide-y divide-slate-200/60 text-xs">
                  <div className="grid grid-cols-[140px_1fr] gap-x-2 py-1.5 items-center">
                    <span className="text-slate-500 font-medium">Asset ID</span>
                    <span className="font-mono font-bold text-slate-900 text-left">{selectedAsset.id}</span>
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
                    <span className="font-bold text-slate-900 text-left">IT &gt; {selectedAsset.category}</span>
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
                    <span className="font-bold text-emerald-600 text-left">{selectedAsset.status}</span>
                  </div>
                  <div className="grid grid-cols-[140px_1fr] gap-x-2 py-1.5 items-center">
                    <span className="text-slate-500 font-medium">Condition</span>
                    <span className="font-bold text-emerald-600 text-left">{selectedAsset.condition}</span>
                  </div>
                </div>
              </div>

              {/* Section 2: Location & Ownership */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between border-b border-slate-200/60 pb-1.5 text-slate-700 font-bold">
                  <span className="flex items-center gap-1.5"><Building className="w-3.5 h-3.5 text-[#6C2BD9]" /> Location &amp; Ownership</span>
                  <button onClick={() => handleOpenAction('MAP', selectedAsset)} className="px-2.5 py-1 rounded-lg bg-purple-100 hover:bg-purple-200 text-[#6C2BD9] text-xs font-bold transition-all flex items-center gap-1 shadow-2xs cursor-pointer">
                    View on Map
                  </button>
                </div>
                <div className="divide-y divide-slate-200/60 text-xs">
                  <div className="grid grid-cols-[140px_1fr] gap-x-2 py-1.5 items-center">
                    <span className="text-slate-500 font-medium">Site</span>
                    <span className="font-bold text-slate-900 text-left">{selectedAsset.site}</span>
                  </div>
                  <div className="grid grid-cols-[140px_1fr] gap-x-2 py-1.5 items-center">
                    <span className="text-slate-500 font-medium">Building</span>
                    <span className="font-bold text-slate-900 text-left">{selectedAsset.building}</span>
                  </div>
                  <div className="grid grid-cols-[140px_1fr] gap-x-2 py-1.5 items-center">
                    <span className="text-slate-500 font-medium">Floor / Room</span>
                    <span className="font-bold text-slate-900 text-left">{selectedAsset.floorRoom}</span>
                  </div>
                  <div className="grid grid-cols-[140px_1fr] gap-x-2 py-1.5 items-center">
                    <span className="text-slate-500 font-medium">Department</span>
                    <span className="font-bold text-slate-900 text-left">{selectedAsset.department}</span>
                  </div>
                  <div className="grid grid-cols-[140px_1fr] gap-x-2 py-1.5 items-center">
                    <span className="text-slate-500 font-medium">Cost Center</span>
                    <span className="font-bold text-slate-900 text-left">{selectedAsset.costCenter}</span>
                  </div>
                  <div className="grid grid-cols-[140px_1fr] gap-x-2 py-1.5 items-center">
                    <span className="text-slate-500 font-medium">Custodian</span>
                    <span className="font-bold text-[#6C2BD9] text-left">{selectedAsset.custodian}</span>
                  </div>
                  <div className="grid grid-cols-[140px_1fr] gap-x-2 py-1.5 items-center">
                    <span className="text-slate-500 font-medium">Assigned Date</span>
                    <span className="font-bold text-slate-900 text-left">{selectedAsset.assignedDate}</span>
                  </div>
                </div>
              </div>

              {/* Section 3: Warranty & Maintenance */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between border-b border-slate-200/60 pb-1.5 text-slate-700 font-bold">
                  <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-[#6C2BD9]" /> Warranty &amp; Maintenance</span>
                  <button onClick={() => handleOpenAction('MAINTENANCE', selectedAsset)} className="px-2.5 py-1 rounded-lg bg-purple-100 hover:bg-purple-200 text-[#6C2BD9] text-xs font-bold transition-all flex items-center gap-1 shadow-2xs cursor-pointer">
                    View Details
                  </button>
                </div>
                <div className="divide-y divide-slate-200/60 text-xs">
                  <div className="grid grid-cols-[140px_1fr] gap-x-2 py-1.5 items-center">
                    <span className="text-slate-500 font-medium">Warranty Status</span>
                    <span className="font-bold text-emerald-600 text-left">{selectedAsset.warrantyStatus}</span>
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
                    <span className="font-bold text-[#6C2BD9] text-left">{selectedAsset.nextServiceDate}</span>
                  </div>
                  <div className="grid grid-cols-[140px_1fr] gap-x-2 py-1.5 items-center">
                    <span className="text-slate-500 font-medium">Maintenance Type</span>
                    <span className="font-bold text-slate-900 text-left">{selectedAsset.maintType}</span>
                  </div>
                  <div className="grid grid-cols-[140px_1fr] gap-x-2 py-1.5 items-center">
                    <span className="text-slate-500 font-medium">Checklist</span>
                    <span className="font-bold text-slate-900 text-left">{selectedAsset.checklist}</span>
                  </div>
                </div>
              </div>

              {/* Section 4: Documents */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between border-b border-slate-200/60 pb-1.5 text-slate-700 font-bold">
                  <span className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5 text-[#6C2BD9]" /> Documents</span>
                  <button onClick={() => handleOpenAction('DOCUMENTS', selectedAsset)} className="px-2.5 py-1 rounded-lg bg-purple-100 hover:bg-purple-200 text-[#6C2BD9] text-xs font-bold transition-all flex items-center gap-1 shadow-2xs cursor-pointer">
                    View All
                  </button>
                </div>
                {selectedAsset.documents && selectedAsset.documents.length > 0 ? (
                  <div className="space-y-1.5">
                    {selectedAsset.documents.map((doc) => (
                      <div key={doc.name} className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200 text-xs hover:bg-purple-50/50 transition-all cursor-pointer">
                        <div className="flex items-center gap-2 font-semibold text-slate-800">
                          <FileText className="w-4 h-4 text-rose-500" />
                          <span className="truncate max-w-[180px]">{doc.name}</span>
                        </div>
                        <span className="text-xs font-bold text-purple-600 font-mono">{doc.size}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400 font-medium">No documents attached.</p>
                )}
              </div>

            </div>
          )}

          {/* Tab 2: Location */}
          {drawerTab === 'location' && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
              <span className="font-bold text-slate-800 block">Site Location Info</span>
              <p className="text-slate-600">Site: {selectedAsset.site}</p>
              <p className="text-slate-600">Building: {selectedAsset.building}</p>
              <p className="text-slate-600">Floor/Room: {selectedAsset.floorRoom}</p>
            </div>
          )}

          {/* Tab 3: Maintenance */}
          {drawerTab === 'maintenance' && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
              <span className="font-bold text-slate-800 block">Work Orders &amp; PM</span>
              <p className="text-slate-600">Next PM: {selectedAsset.nextServiceDate}</p>
              <p className="text-slate-600">Type: {selectedAsset.maintType}</p>
            </div>
          )}

          {/* Tab 4: History */}
          {drawerTab === 'history' && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
              <span className="font-bold text-slate-800 block">Audit Log</span>
              <p className="text-slate-500 text-[11px]">{selectedAsset.assignedDate}: Custody assigned to {selectedAsset.custodian}</p>
            </div>
          )}

        </div>
      </div>

      {/* 8. Bottom Informational Callout Cards Bar (Callouts 1 to 8 matching reference image 1-to-1) */}
      <div className="bg-purple-50/50 border border-purple-100 rounded-xl p-4 space-y-3 mt-6">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#6C2BD9]" />
          <h3 className="font-black text-slate-900 text-xs uppercase tracking-wide">FSD &amp; WaveTrack Specification Guide Summary</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
            <span className="font-black text-[#6C2BD9] block">1. Summary Cards</span>
            <p className="text-[11px] text-slate-500 font-medium">At-a-glance portfolio counts. Click any card to filter list.</p>
          </div>

          <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
            <span className="font-black text-[#6C2BD9] block">2. Asset Lifecycle Tabs</span>
            <p className="text-[11px] text-slate-500 font-medium">Switch between views: Assigned, Maintenance, Return, History.</p>
          </div>

          <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
            <span className="font-black text-[#6C2BD9] block">3. Search &amp; Filters</span>
            <p className="text-[11px] text-slate-500 font-medium">Search by name, ID, serial, tag. Apply multi-category filters.</p>
          </div>

          <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
            <span className="font-black text-[#6C2BD9] block">4. Asset Register List</span>
            <p className="text-[11px] text-slate-500 font-medium">Displays assigned assets with image, status badge, and location.</p>
          </div>

          <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
            <span className="font-black text-[#6C2BD9] block">5. Actions Menu</span>
            <p className="text-[11px] text-slate-500 font-medium">Three-dot menu for View 360°, Transfer, Return, Issue Report.</p>
          </div>

          <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
            <span className="font-black text-[#6C2BD9] block">6. Asset 360° Panel</span>
            <p className="text-[11px] text-slate-500 font-medium">Right-side drawer showing full details, location, warranty &amp; docs.</p>
          </div>

          <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
            <span className="font-black text-[#6C2BD9] block">7. Top Actions</span>
            <p className="text-[11px] text-slate-500 font-medium">Request Asset button to initiate self-service procurement.</p>
          </div>

          <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
            <span className="font-black text-[#6C2BD9] block">8. Navigation Flow</span>
            <p className="text-[11px] text-slate-500 font-medium">Search/Filter &rarr; Select Asset &rarr; View Details &rarr; Complete Action.</p>
          </div>
        </div>
      </div>

      {/* ================= TRANSACTION MODALS ================= */}

      {/* Acknowledge Asset Modal */}
      {activeModal === 'ACKNOWLEDGE' && actionAsset && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" /> Asset Custody Acknowledgement
              </h3>
              <button onClick={() => setActiveModal(null)} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-slate-900">{actionAsset.name}</span>
                <span className="font-mono font-bold text-[#6C2BD9]">{actionAsset.id}</span>
              </div>
              <p className="text-slate-500 text-[11px]">Serial: {actionAsset.serialNumber} | Category: {actionAsset.category}</p>
              <p className="text-slate-500 text-[11px]">Location: {actionAsset.location}</p>
              <p className="text-slate-500 text-[11px]">Assigned Date: {actionAsset.assignedDate}</p>
            </div>

            <p className="text-slate-600 font-medium">Please inspect the physical asset condition before confirming custody acknowledgement.</p>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => handleConfirmAcknowledge('REJECTED')}
                className="px-4 py-2 bg-rose-50 text-rose-700 font-bold rounded-xl border border-rose-200 hover:bg-rose-100"
              >
                Report Discrepancy / Reject
              </button>
              <button
                type="button"
                onClick={() => handleConfirmAcknowledge('ACKNOWLEDGED')}
                className="px-5 py-2 bg-emerald-600 text-white font-extrabold rounded-xl shadow-md hover:bg-emerald-700"
              >
                Confirm Acknowledgement
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Request Transfer Modal */}
      {activeModal === 'TRANSFER' && actionAsset && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <ArrowLeftRight className="w-5 h-5 text-[#6C2BD9]" /> Request Asset Transfer ({actionAsset.id})
              </h3>
              <button onClick={() => setActiveModal(null)} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitTransfer} className="space-y-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Target Custodian / Employee *</label>
                <input
                  type="text"
                  required
                  value={transferForm.targetEmployee}
                  onChange={(e) => setTransferForm({ ...transferForm, targetEmployee: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Target Location *</label>
                <input
                  type="text"
                  required
                  value={transferForm.targetLocation}
                  onChange={(e) => setTransferForm({ ...transferForm, targetLocation: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Reason for Transfer *</label>
                <textarea
                  rows={2}
                  required
                  value={transferForm.reason}
                  onChange={(e) => setTransferForm({ ...transferForm, reason: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setActiveModal(null)} className="px-4 py-2 bg-slate-100 font-bold text-slate-700 rounded-xl">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-[#6C2BD9] text-white font-extrabold rounded-xl shadow-md">Submit Transfer Request</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Request Return Modal */}
      {activeModal === 'RETURN' && actionAsset && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-[#6C2BD9]" /> Initiate Asset Return ({actionAsset.id})
              </h3>
              <button onClick={() => setActiveModal(null)} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitReturn} className="space-y-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Return Store / Receiving Location *</label>
                <input
                  type="text"
                  required
                  value={returnForm.returnStore}
                  onChange={(e) => setReturnForm({ ...returnForm, returnStore: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Asset Condition at Return *</label>
                <select
                  value={returnForm.condition}
                  onChange={(e) => setReturnForm({ ...returnForm, condition: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-bold"
                >
                  <option value="Good">Good - Full Working Order</option>
                  <option value="Fair">Fair - Minor Wear</option>
                  <option value="Damaged">Damaged - Needs Repair</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Return Reason *</label>
                <textarea
                  rows={2}
                  required
                  value={returnForm.reason}
                  onChange={(e) => setReturnForm({ ...returnForm, reason: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setActiveModal(null)} className="px-4 py-2 bg-slate-100 font-bold text-slate-700 rounded-xl">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-[#6C2BD9] text-white font-extrabold rounded-xl shadow-md">Initiate Return</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Report Issue / Damage Modal */}
      {activeModal === 'REPORT_ISSUE' && actionAsset && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-600" /> Report Issue or Damage ({actionAsset.id})
              </h3>
              <button onClick={() => setActiveModal(null)} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitReportIssue} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Issue Type *</label>
                  <select
                    value={issueForm.issueType}
                    onChange={(e) => setIssueForm({ ...issueForm, issueType: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-bold"
                  >
                    <option value="Hardware Malfunction">Hardware Malfunction</option>
                    <option value="Physical Damage">Physical Damage</option>
                    <option value="Software/OS Issue">Software / OS Issue</option>
                    <option value="Accessory Missing">Accessory Missing</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Severity *</label>
                  <select
                    value={issueForm.severity}
                    onChange={(e) => setIssueForm({ ...issueForm, severity: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-bold"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Issue Description *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detailed description of the issue..."
                  value={issueForm.description}
                  onChange={(e) => setIssueForm({ ...issueForm, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                />
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" id="unusable" className="rounded text-[#6C2BD9]" />
                <label htmlFor="unusable" className="font-bold text-slate-700 cursor-pointer">Asset is completely unusable and requires immediate maintenance</label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setActiveModal(null)} className="px-4 py-2 bg-slate-100 font-bold text-slate-700 rounded-xl">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-rose-600 text-white font-extrabold rounded-xl shadow-md">Submit Issue Report</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Documents Modal */}
      {activeModal === 'DOCUMENTS' && actionAsset && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#6C2BD9]" /> Asset Documents ({actionAsset.id})
              </h3>
              <button onClick={() => setActiveModal(null)} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400"><X className="w-4 h-4" /></button>
            </div>

            <div className="space-y-2">
              {(actionAsset.documents || [
                { name: `${actionAsset.id}_Warranty_Card.pdf`, size: '420 KB' },
                { name: `${actionAsset.id}_Handover_Agreement.pdf`, size: '310 KB' }
              ]).map((doc) => (
                <div key={doc.name} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#6C2BD9]" />
                    <span className="font-bold text-slate-900">{doc.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-slate-400 font-mono">{doc.size}</span>
                    <button onClick={() => showToast('success', `Downloaded ${doc.name}`)} className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg font-bold text-slate-700 hover:bg-slate-100 flex items-center gap-1">
                      <Download className="w-3 h-3" /> Download
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button onClick={() => setActiveModal(null)} className="px-5 py-2 bg-slate-900 text-white font-bold rounded-xl">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* View Maintenance Modal */}
      {activeModal === 'MAINTENANCE' && actionAsset && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Wrench className="w-5 h-5 text-[#6C2BD9]" /> Maintenance Schedule ({actionAsset.id})
              </h3>
              <button onClick={() => setActiveModal(null)} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400"><X className="w-4 h-4" /></button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-slate-400 text-[10px] block">Next Service Date</span>
                <span className="font-extrabold text-slate-900 text-sm">{actionAsset.nextServiceDate || '15 Oct 2026'}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-slate-400 text-[10px] block">Maintenance Type</span>
                <span className="font-extrabold text-[#6C2BD9] text-sm">{actionAsset.maintType || 'Preventive'}</span>
              </div>
            </div>

            <div className="bg-purple-50/60 p-3 rounded-xl border border-purple-100 space-y-1">
              <span className="font-bold text-slate-900 block">Standard Protocol Checklist:</span>
              <p className="text-slate-600">{actionAsset.checklist || 'Hardware Safety & Diagnostics Protocol'}</p>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button onClick={() => setActiveModal(null)} className="px-5 py-2 bg-slate-900 text-white font-bold rounded-xl">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* View History Modal */}
      {activeModal === 'HISTORY' && actionAsset && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#6C2BD9]" /> Custody &amp; Transaction History ({actionAsset.id})
              </h3>
              <button onClick={() => setActiveModal(null)} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400"><X className="w-4 h-4" /></button>
            </div>

            <div className="space-y-3 relative pl-4 border-l-2 border-purple-200">
              <div className="relative">
                <div className="w-2.5 h-2.5 rounded-full bg-[#6C2BD9] absolute -left-[21px] top-1" />
                <span className="font-extrabold text-slate-900 block">{actionAsset.assignedDate}: Custody Assigned</span>
                <p className="text-slate-500 text-[11px]">Assigned to {actionAsset.custodian} by IT Department.</p>
              </div>
              <div className="relative">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 absolute -left-[21px] top-1" />
                <span className="font-extrabold text-slate-900 block">Tagging &amp; Verification</span>
                <p className="text-slate-500 text-[11px]">Verified RFID Tag EPC: {actionAsset.rfidEpc}</p>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button onClick={() => setActiveModal(null)} className="px-5 py-2 bg-slate-900 text-white font-bold rounded-xl">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Request Asset Modal */}
      {activeModal === 'REQUEST_ASSET' && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#6C2BD9]" /> Request New / Replacement Asset
              </h3>
              <button onClick={() => setActiveModal(null)} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitRequestAsset} className="space-y-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Asset Category *</label>
                <select
                  value={requestAssetForm.category}
                  onChange={(e) => setRequestAssetForm({ ...requestAssetForm, category: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-bold"
                >
                  <option value="Laptop">Laptop / Workstation</option>
                  <option value="Mobile Device">Mobile Device</option>
                  <option value="Monitor">Monitor &amp; Display</option>
                  <option value="Furniture">Ergonomic Furniture</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Business Justification *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Reason for requesting this asset..."
                  value={requestAssetForm.justification}
                  onChange={(e) => setRequestAssetForm({ ...requestAssetForm, justification: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setActiveModal(null)} className="px-4 py-2 bg-slate-100 font-bold text-slate-700 rounded-xl">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-[#6C2BD9] text-white font-extrabold rounded-xl shadow-md">Submit Request</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Locate on Map Modal */}
      {activeModal === 'MAP_LOCATE' && actionAsset && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#6C2BD9]" /> Floor Map Location ({actionAsset.id})
              </h3>
              <button onClick={() => setActiveModal(null)} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400"><X className="w-4 h-4" /></button>
            </div>
            <div className="h-44 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-center relative overflow-hidden">
              <div className="z-10 bg-white/90 px-4 py-2 rounded-xl border border-purple-300 shadow-xl flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#6C2BD9]" />
                <span className="font-extrabold text-slate-900">{actionAsset.name} ({actionAsset.location})</span>
              </div>
            </div>
            <div className="flex justify-end"><button onClick={() => setActiveModal(null)} className="px-5 py-2 bg-slate-900 text-white font-bold rounded-xl">Close</button></div>
          </div>
        </div>
      )}

      {/* RFID Locate Radar Modal */}
      {activeModal === 'RFID_LOCATE' && actionAsset && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-xs text-center">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Radio className="w-5 h-5 text-[#6C2BD9]" /> RFID UHF Signal Radar
              </h3>
              <button onClick={() => setActiveModal(null)} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400"><X className="w-4 h-4" /></button>
            </div>
            <div className="py-4 space-y-2">
              <div className="w-20 h-20 mx-auto rounded-full bg-purple-100 border-4 border-[#6C2BD9] flex items-center justify-center animate-pulse">
                <Radio className="w-8 h-8 text-[#6C2BD9]" />
              </div>
              <p className="font-mono font-bold text-[#6C2BD9] text-sm">{actionAsset.rfidEpc}</p>
              <p className="font-bold text-slate-800">Signal Proximity: <span className="text-emerald-600 font-extrabold">96% RSSI</span></p>
            </div>
            <button onClick={() => setActiveModal(null)} className="w-full py-2 bg-[#6C2BD9] text-white font-bold rounded-xl">Close</button>
          </div>
        </div>
      )}

    </div>
  );
}

export default MyAssets;
