import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Search,
  Download,
  Calendar,
  Eye,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Truck,
  Hourglass,
  XCircle,
  Laptop,
  MapPin,
  User,
  ShieldCheck,
  Building2,
  ChevronLeft,
  ChevronRight,
  Printer,
  ExternalLink,
  Layers,
  ArrowRight,
  Filter,
  X
} from 'lucide-react';
import { api } from '../services/api';
import clsx from 'clsx';

// Pre-seeded 24 Movement History records with exact top 10 matching Screenshot 27
const SEED_MOVEMENTS = [
  {
    movementId: 'MOV-2026-0012',
    assetNumber: 'AS-000123',
    assetName: 'Laptop - Dell 5440',
    serialNumber: '75K3D24',
    tagEpc: 'E28011606000002053A1B4C0',
    movementType: 'Location Transfer',
    fromLocation: 'Block A > GF / IT-101',
    toLocation: 'Block B > 1F / IT-201',
    fromCustodian: 'Ahmed Khan',
    toCustodian: 'Sara Ali',
    movementDate: '10 Sep 2026',
    movementTime: '10:24',
    status: 'Completed',
    requestedBy: 'Sara Ali',
    approvedBy: 'John Doe (System Admin)',
    dispatchedBy: 'Logistics Team',
    receivedBy: 'Sara Ali',
    reason: 'Department transfer from IT Operations to Finance Systems',
    condition: 'Good',
    accessories: '65W USB-C Charger, Targus Carrying Bag',
    site: 'Dubai HQ',
    department: 'Finance',
    sourceHierarchy: { site: 'Dubai HQ', building: 'Block A', floor: 'Ground Floor', room: 'IT-101' },
    destHierarchy: { site: 'Dubai HQ', building: 'Block B', floor: '1st Floor', room: 'IT-201' },
    timeline: [
      { stage: 'Requested', time: '10 Sep 2026 08:30', user: 'Sara Ali', status: 'Completed', note: 'Transfer request submitted via portal' },
      { stage: 'Approved', time: '10 Sep 2026 09:10', user: 'John Doe (System Admin)', status: 'Completed', note: 'Standard approval granted' },
      { stage: 'Dispatched', time: '10 Sep 2026 09:45', user: 'Internal Courier', status: 'Completed', note: 'Handed over with gate pass #GP-9421' },
      { stage: 'In Transit', time: '10 Sep 2026 10:00', user: 'Courier Transit', status: 'Completed', note: 'En route between Block A and Block B' },
      { stage: 'Received', time: '10 Sep 2026 10:20', user: 'Sara Ali', status: 'Completed', note: 'Inspected and accepted in good order' },
      { stage: 'Completed', time: '10 Sep 2026 10:24', user: 'Asset360 Automated Workflow', status: 'Completed', note: 'Master Asset Register effective location updated' }
    ],
    workflow: [
      { level: 'Level 1: Department Manager', approver: 'Farhan Zaidi', decision: 'Approved', timestamp: '10 Sep 2026 08:45', comments: 'Budget and headcount transfer approved' },
      { level: 'Level 2: Asset Administrator', approver: 'John Doe', decision: 'Approved', timestamp: '10 Sep 2026 09:10', comments: 'Serial #75K3D24 verified in Asset Master' }
    ],
    documents: [
      { name: 'movement_cancel_form.pdf', size: '320 KB', type: 'PDF Document', date: '10 Sep 2026' },
      { name: 'handover_ack_signed.pdf', size: '480 KB', type: 'Signed Receipt', date: '10 Sep 2026' }
    ],
    bulkAssets: []
  },
  {
    movementId: 'MOV-2026-0011',
    assetNumber: 'AS-000123',
    assetName: 'Laptop - Dell 5440',
    serialNumber: '75K3D24',
    tagEpc: 'E28011606000002053A1B4C0',
    movementType: 'Custodian Transfer',
    fromLocation: '-',
    toLocation: '-',
    fromCustodian: 'Sara Ali',
    toCustodian: 'Omar Saleh',
    movementDate: '15 Aug 2026',
    movementTime: '14:10',
    status: 'Completed',
    requestedBy: 'Omar Saleh',
    approvedBy: 'IT Manager',
    receivedBy: 'Omar Saleh',
    reason: 'Temporary custody handover for project auditing',
    condition: 'Good',
    accessories: 'Charger',
    site: 'Dubai HQ',
    department: 'IT Department',
    sourceHierarchy: { site: 'Dubai HQ', building: 'Block A', floor: 'Ground Floor', room: 'IT-101' },
    destHierarchy: { site: 'Dubai HQ', building: 'Block A', floor: 'Ground Floor', room: 'IT-101' },
    timeline: [
      { stage: 'Requested', time: '15 Aug 2026 13:00', user: 'Omar Saleh', status: 'Completed', note: 'Custody reassignment requested' },
      { stage: 'Approved', time: '15 Aug 2026 13:35', user: 'IT Manager', status: 'Completed', note: 'Approved for audit task' },
      { stage: 'Completed', time: '15 Aug 2026 14:10', user: 'Omar Saleh', status: 'Completed', note: 'Digital signature verified' }
    ],
    workflow: [
      { level: 'Line Manager Approval', approver: 'Tariq Mansoor', decision: 'Approved', timestamp: '15 Aug 2026 13:35', comments: 'Temporary assignment approved' }
    ],
    documents: [
      { name: 'custodian_handover_form.pdf', size: '185 KB', type: 'PDF Document', date: '15 Aug 2026' }
    ],
    bulkAssets: []
  },
  {
    movementId: 'MOV-2026-0010',
    assetNumber: 'AS-000123',
    assetName: 'Laptop - Dell 5440',
    serialNumber: '75K3D24',
    tagEpc: 'E28011606000002053A1B4C0',
    movementType: 'Location Transfer',
    fromLocation: 'Block C > 2F / IT-301',
    toLocation: 'Block A > GF / IT-101',
    fromCustodian: 'Omar Saleh',
    toCustodian: 'Omar Saleh',
    movementDate: '01 Jul 2026',
    movementTime: '09:30',
    status: 'Completed',
    requestedBy: 'Omar Saleh',
    approvedBy: 'Facilities Manager',
    receivedBy: 'Omar Saleh',
    reason: 'Desk relocation to Ground Floor Helpdesk Area',
    condition: 'Good',
    accessories: 'Charger, Bag',
    site: 'Dubai HQ',
    department: 'IT Department',
    sourceHierarchy: { site: 'Dubai HQ', building: 'Block C', floor: '2nd Floor', room: 'IT-301' },
    destHierarchy: { site: 'Dubai HQ', building: 'Block A', floor: 'Ground Floor', room: 'IT-101' },
    timeline: [
      { stage: 'Requested', time: '01 Jul 2026 08:45', user: 'Omar Saleh', status: 'Completed', note: 'Desk shift requested' },
      { stage: 'Approved', time: '01 Jul 2026 09:00', user: 'Facilities Manager', status: 'Completed', note: 'Approved' },
      { stage: 'Completed', time: '01 Jul 2026 09:30', user: 'Omar Saleh', status: 'Completed', note: 'Relocated to Workstation GF-12' }
    ],
    workflow: [
      { level: 'Facilities Approval', approver: 'Hamad Sultan', decision: 'Approved', timestamp: '01 Jul 2026 09:00', comments: 'Space allocated' }
    ],
    documents: [
      { name: 'internal_relocation_pass.pdf', size: '210 KB', type: 'PDF Document', date: '01 Jul 2026' }
    ],
    bulkAssets: []
  },
  {
    movementId: 'MOV-2026-0009',
    assetNumber: 'AS-000123',
    assetName: 'Laptop - Dell 5440',
    serialNumber: '75K3D24',
    tagEpc: 'E28011606000002053A1B4C0',
    movementType: 'Assignment',
    fromLocation: '-',
    toLocation: '-',
    fromCustodian: '-',
    toCustodian: 'Omar Saleh',
    movementDate: '15 Jun 2026',
    movementTime: '11:15',
    status: 'Completed',
    requestedBy: 'HR Operations',
    approvedBy: 'IT Manager',
    receivedBy: 'Omar Saleh',
    reason: 'Employee onboard asset issuance',
    condition: 'Good',
    accessories: 'Charger, Mouse, Backpack',
    site: 'Dubai HQ',
    department: 'IT Department',
    sourceHierarchy: { site: 'Dubai HQ', building: 'Block C', floor: '2nd Floor', room: 'IT-301' },
    destHierarchy: { site: 'Dubai HQ', building: 'Block C', floor: '2nd Floor', room: 'IT-301' },
    timeline: [
      { stage: 'Requested', time: '15 Jun 2026 09:30', user: 'HR Team', status: 'Completed', note: 'New hire equipment allocation' },
      { stage: 'Approved', time: '15 Jun 2026 10:15', user: 'IT Manager', status: 'Completed', note: 'Approved' },
      { stage: 'Completed', time: '15 Jun 2026 11:15', user: 'Omar Saleh', status: 'Completed', note: 'Handover form signed' }
    ],
    workflow: [
      { level: 'HR & IT Approval', approver: 'Amina Al-Nuaimi', decision: 'Approved', timestamp: '15 Jun 2026 10:15', comments: 'Standard employee issue' }
    ],
    documents: [
      { name: 'employee_handover_signed.pdf', size: '390 KB', type: 'PDF Document', date: '15 Jun 2026' }
    ],
    bulkAssets: []
  },
  {
    movementId: 'MOV-2026-0008',
    assetNumber: 'AS-000123',
    assetName: 'Laptop - Dell 5440',
    serialNumber: '75K3D24',
    tagEpc: 'E28011606000002053A1B4C0',
    movementType: 'Location Transfer',
    fromLocation: 'Store - Main',
    toLocation: 'Block C > 2F / IT-301',
    fromCustodian: '-',
    toCustodian: 'Omar Saleh',
    movementDate: '12 May 2026',
    movementTime: '16:40',
    status: 'Completed',
    requestedBy: 'IT Asset Team',
    approvedBy: 'Store Supervisor',
    receivedBy: 'Omar Saleh',
    reason: 'Transferred from warehouse staging to operational department pool',
    condition: 'Good',
    accessories: 'Charger',
    site: 'Dubai HQ',
    department: 'IT Department',
    sourceHierarchy: { site: 'Dubai HQ', building: 'Warehouse', floor: 'Ground Floor', room: 'Store - Main' },
    destHierarchy: { site: 'Dubai HQ', building: 'Block C', floor: '2nd Floor', room: 'IT-301' },
    timeline: [
      { stage: 'Requested', time: '12 May 2026 14:00', user: 'Store Keeper', status: 'Completed', note: 'Release from storage' },
      { stage: 'Approved', time: '12 May 2026 15:10', user: 'Store Supervisor', status: 'Completed', note: 'Approved' },
      { stage: 'Completed', time: '12 May 2026 16:40', user: 'Omar Saleh', status: 'Completed', note: 'Staging complete' }
    ],
    workflow: [
      { level: 'Warehouse Dispatch', approver: 'Bilal Qureshi', decision: 'Approved', timestamp: '12 May 2026 15:10', comments: 'Issued from buffer stock' }
    ],
    documents: [
      { name: 'warehouse_issue_slip.pdf', size: '175 KB', type: 'PDF Document', date: '12 May 2026' }
    ],
    bulkAssets: []
  },
  {
    movementId: 'MOV-2026-0007',
    assetNumber: 'AS-000123',
    assetName: 'Laptop - Dell 5440',
    serialNumber: '75K3D24',
    tagEpc: 'E28011606000002053A1B4C0',
    movementType: 'Maintenance Return',
    fromLocation: 'Service Center',
    toLocation: 'Block C > 2F / IT-301',
    fromCustodian: '-',
    toCustodian: 'Omar Saleh',
    movementDate: '25 Apr 2026',
    movementTime: '11:00',
    status: 'Completed',
    requestedBy: 'Dell Authorized Service',
    approvedBy: 'IT Support Lead',
    receivedBy: 'Omar Saleh',
    reason: 'Returned from keyboard replacement and diagnostic under warranty',
    condition: 'Excellent',
    accessories: 'Charger',
    site: 'Dubai HQ',
    department: 'IT Department',
    sourceHierarchy: { site: 'External', building: 'Dell Service Center', floor: 'GF', room: 'Service Lab' },
    destHierarchy: { site: 'Dubai HQ', building: 'Block C', floor: '2nd Floor', room: 'IT-301' },
    timeline: [
      { stage: 'Service Complete', time: '25 Apr 2026 09:30', user: 'Dell Technician', status: 'Completed', note: 'Repaired and QA passed' },
      { stage: 'Dispatched', time: '25 Apr 2026 10:15', user: 'Courier', status: 'Completed', note: 'Delivered to HQ' },
      { stage: 'Completed', time: '25 Apr 2026 11:00', user: 'Omar Saleh', status: 'Completed', note: 'Reintegrated into active pool' }
    ],
    workflow: [
      { level: 'Service Acceptance', approver: 'Rashid Mohammed', decision: 'Approved', timestamp: '25 Apr 2026 10:45', comments: 'Diagnostic report verified' }
    ],
    documents: [
      { name: 'service_job_card_signed.pdf', size: '410 KB', type: 'PDF Document', date: '25 Apr 2026' }
    ],
    bulkAssets: []
  },
  {
    movementId: 'MOV-2026-0006',
    assetNumber: 'AS-000123',
    assetName: 'Laptop - Dell 5440',
    serialNumber: '75K3D24',
    tagEpc: 'E28011606000002053A1B4C0',
    movementType: 'Sent for Maintenance',
    fromLocation: 'Block C > 2F / IT-301',
    toLocation: 'Service Center',
    fromCustodian: 'Omar Saleh',
    toCustodian: '-',
    movementDate: '10 Apr 2026',
    movementTime: '09:20',
    status: 'Completed',
    requestedBy: 'IT Helpdesk',
    approvedBy: 'Facilities / IT Manager',
    receivedBy: 'Dell Authorized Service',
    reason: 'Warranty repair: keyboard key stickiness diagnostic',
    condition: 'Fair',
    accessories: 'Laptop only (no charger)',
    site: 'Dubai HQ',
    department: 'IT Department',
    sourceHierarchy: { site: 'Dubai HQ', building: 'Block C', floor: '2nd Floor', room: 'IT-301' },
    destHierarchy: { site: 'External', building: 'Dell Service Center', floor: 'GF', room: 'Service Lab' },
    timeline: [
      { stage: 'Incident Raised', time: '10 Apr 2026 08:30', user: 'Omar Saleh', status: 'Completed', note: 'Ticket #INC-4920 opened' },
      { stage: 'Approved for RMA', time: '10 Apr 2026 08:55', user: 'IT Lead', status: 'Completed', note: 'Dell dispatch generated' },
      { stage: 'Completed', time: '10 Apr 2026 09:20', user: 'Logistics Courier', status: 'Completed', note: 'Dispatched to vendor' }
    ],
    workflow: [
      { level: 'RMA Approval', approver: 'Rashid Mohammed', decision: 'Approved', timestamp: '10 Apr 2026 08:55', comments: 'Covered under ProSupport' }
    ],
    documents: [
      { name: 'rma_dispatch_order.pdf', size: '280 KB', type: 'PDF Document', date: '10 Apr 2026' }
    ],
    bulkAssets: []
  },
  {
    movementId: 'MOV-2026-0005',
    assetNumber: 'AS-000123',
    assetName: 'Laptop - Dell 5440',
    serialNumber: '75K3D24',
    tagEpc: 'E28011606000002053A1B4C0',
    movementType: 'Custodian Transfer',
    fromLocation: '-',
    toLocation: '-',
    fromCustodian: 'Ahmed Khan',
    toCustodian: 'Omar Saleh',
    movementDate: '05 Mar 2026',
    movementTime: '15:45',
    status: 'Completed',
    requestedBy: 'Ahmed Khan',
    approvedBy: 'IT Team Lead',
    receivedBy: 'Omar Saleh',
    reason: 'Inter-team duty rotation custody handover',
    condition: 'Good',
    accessories: 'Charger, Bag',
    site: 'Dubai HQ',
    department: 'IT Department',
    sourceHierarchy: { site: 'Dubai HQ', building: 'Block B', floor: '1st Floor', room: 'IT-201' },
    destHierarchy: { site: 'Dubai HQ', building: 'Block C', floor: '2nd Floor', room: 'IT-301' },
    timeline: [
      { stage: 'Handover Initiated', time: '05 Mar 2026 15:00', user: 'Ahmed Khan', status: 'Completed', note: 'Duty rotation transfer' },
      { stage: 'Completed', time: '05 Mar 2026 15:45', user: 'Omar Saleh', status: 'Completed', note: 'Custody accepted' }
    ],
    workflow: [
      { level: 'Team Lead Approval', approver: 'Farhan Zaidi', decision: 'Approved', timestamp: '05 Mar 2026 15:20', comments: 'Approved' }
    ],
    documents: [
      { name: 'custody_shift_slip.pdf', size: '190 KB', type: 'PDF Document', date: '05 Mar 2026' }
    ],
    bulkAssets: []
  },
  {
    movementId: 'MOV-2026-0004',
    assetNumber: 'AS-000123',
    assetName: 'Laptop - Dell 5440',
    serialNumber: '75K3D24',
    tagEpc: 'E28011606000002053A1B4C0',
    movementType: 'Location Transfer',
    fromLocation: 'Block B > 1F / IT-201',
    toLocation: 'Block C > 2F / IT-301',
    fromCustodian: 'Ahmed Khan',
    toCustodian: 'Ahmed Khan',
    movementDate: '12 Jan 2026',
    movementTime: '10:15',
    status: 'Completed',
    requestedBy: 'Ahmed Khan',
    approvedBy: 'Facilities Manager',
    receivedBy: 'Ahmed Khan',
    reason: 'Department team seat shifting to Block C expansion',
    condition: 'Good',
    accessories: 'Charger, Bag',
    site: 'Dubai HQ',
    department: 'IT Department',
    sourceHierarchy: { site: 'Dubai HQ', building: 'Block B', floor: '1st Floor', room: 'IT-201' },
    destHierarchy: { site: 'Dubai HQ', building: 'Block C', floor: '2nd Floor', room: 'IT-301' },
    timeline: [
      { stage: 'Requested', time: '12 Jan 2026 09:00', user: 'Ahmed Khan', status: 'Completed', note: 'Floor seat move' },
      { stage: 'Completed', time: '12 Jan 2026 10:15', user: 'Ahmed Khan', status: 'Completed', note: 'Relocated' }
    ],
    workflow: [
      { level: 'Facilities Approval', approver: 'Hamad Sultan', decision: 'Approved', timestamp: '12 Jan 2026 09:30', comments: 'Seat updated' }
    ],
    documents: [
      { name: 'internal_movement_record.pdf', size: '160 KB', type: 'PDF Document', date: '12 Jan 2026' }
    ],
    bulkAssets: []
  },
  {
    movementId: 'MOV-2026-0003',
    assetNumber: 'AS-000123',
    assetName: 'Laptop - Dell 5440',
    serialNumber: '75K3D24',
    tagEpc: 'E28011606000002053A1B4C0',
    movementType: 'Assignment',
    fromLocation: '-',
    toLocation: '-',
    fromCustodian: '-',
    toCustodian: 'Ahmed Khan',
    movementDate: '05 Jan 2026',
    movementTime: '08:30',
    status: 'Completed',
    requestedBy: 'HR Onboarding',
    approvedBy: 'System Administrator',
    receivedBy: 'Ahmed Khan',
    reason: 'Initial assignment to developer on joining date',
    condition: 'New',
    accessories: 'Charger, Backpack, Mouse, Headset',
    site: 'Dubai HQ',
    department: 'IT Department',
    sourceHierarchy: { site: 'Dubai HQ', building: 'Block A', floor: 'Ground Floor', room: 'Store - Main' },
    destHierarchy: { site: 'Dubai HQ', building: 'Block B', floor: '1st Floor', room: 'IT-201' },
    timeline: [
      { stage: 'Requested', time: '05 Jan 2026 08:00', user: 'HR Onboarding', status: 'Completed', note: 'Issued on joining' },
      { stage: 'Completed', time: '05 Jan 2026 08:30', user: 'Ahmed Khan', status: 'Completed', note: 'Handover form signed' }
    ],
    workflow: [
      { level: 'Administrator Approval', approver: 'John Doe', decision: 'Approved', timestamp: '05 Jan 2026 08:15', comments: 'Asset released' }
    ],
    documents: [
      { name: 'initial_issue_slip.pdf', size: '295 KB', type: 'PDF Document', date: '05 Jan 2026' }
    ],
    bulkAssets: []
  }
];

export function MovementHistory() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Selected Movement & Drawer Tab
  const [selectedMovementId, setSelectedMovementId] = useState('MOV-2026-0012');
  const [drawerTab, setDrawerTab] = useState('overview'); // overview | details | assets | workflow | documents

  // Filter States
  const [filterSearch, setFilterSearch] = useState(searchParams.get('search') || 'AS-000123');
  const [filterAssetType, setFilterAssetType] = useState('All');
  const [filterMovementType, setFilterMovementType] = useState('All');
  const [filterFromDate, setFilterFromDate] = useState('01 Jan 2025');
  const [filterToDate, setFilterToDate] = useState('10 Sep 2026');
  const [filterSite, setFilterSite] = useState('All Sites');
  const [filterDepartment, setFilterDepartment] = useState('All Departments');
  const [filterCustodian, setFilterCustodian] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  // Server Data & Pagination State
  const [movements, setMovements] = useState(SEED_MOVEMENTS);
  const [totalRecords, setTotalRecords] = useState(24);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [kpis, setKpis] = useState({
    totalMovements: 24,
    completed: 20,
    inTransit: 2,
    pendingReceipt: 1,
    cancelledRejected: 1
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isFullTimelineModalOpen, setIsFullTimelineModalOpen] = useState(false);

  // Fetch Movement History from API
  useEffect(() => {
    fetchHistory();
  }, [currentPage, pageSize]);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const params = {
        search: filterSearch,
        movementType: filterMovementType,
        site: filterSite,
        department: filterDepartment,
        custodian: filterCustodian,
        status: filterStatus,
        fromDate: filterFromDate,
        toDate: filterToDate,
        page: currentPage,
        limit: pageSize
      };
      const res = await api.get('/movements/history', { params }).catch(() => null);
      if (res && res.history) {
        setMovements(res.history);
        setTotalRecords(res.total || 24);
        if (res.kpis) setKpis(res.kpis);
      }
    } catch (e) {
      // Graceful fallback to seeded data
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchClick = () => {
    setCurrentPage(1);
    fetchHistory();
  };

  const handleClearFilters = () => {
    setFilterSearch('');
    setFilterAssetType('All');
    setFilterMovementType('All');
    setFilterFromDate('');
    setFilterToDate('');
    setFilterSite('All Sites');
    setFilterDepartment('All Departments');
    setFilterCustodian('All');
    setFilterStatus('All');
    setCurrentPage(1);
    fetchHistory();
  };

  // Find currently selected movement
  const selectedMovement = useMemo(() => {
    return movements.find(m => m.movementId === selectedMovementId) || movements[0] || SEED_MOVEMENTS[0];
  }, [movements, selectedMovementId]);

  // Handle Export CSV
  const handleExport = () => {
    const csvRows = [
      ['Movement ID', 'Asset No', 'Asset Name', 'Movement Type', 'From Location', 'To Location', 'From Custodian', 'To Custodian', 'Movement Date', 'Status'],
      ...movements.map(m => [
        m.movementId,
        m.assetNumber,
        m.assetName,
        m.movementType,
        m.fromLocation,
        m.toLocation,
        m.fromCustodian,
        m.toCustodian,
        m.movementDate,
        m.status
      ])
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `movement_history_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-16">
      {/* Container */}
      <div className="max-w-[1580px] mx-auto px-4 sm:px-6 lg:px-8 pt-5 space-y-5">
        {/* Top Header & Breadcrumb matching Screenshot 27 */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <button
                onClick={() => navigate('/movements')}
                className="flex items-center gap-1.5 hover:text-[#6C2BD9] transition-colors font-medium cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Assignment &amp; Movement</span>
              </button>
              <span>&gt;</span>
              <span className="text-slate-800 font-semibold">Movement History</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Movement History
            </h1>
            <p className="text-xs text-slate-500">
              View complete movement history and lifecycle of assets
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* 5 KPI Summary Cards (per FSD specifications) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          <div
            onClick={() => setFilterStatus('All')}
            className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs cursor-pointer hover:border-[#6C2BD9] transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Total Movements</span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-[#6C2BD9] border border-purple-200">
                100%
              </span>
            </div>
            <p className="text-2xl font-bold text-slate-900 mt-2">{kpis.totalMovements}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">All historic records</p>
          </div>

          <div
            onClick={() => setFilterStatus('Completed')}
            className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs cursor-pointer hover:border-emerald-400 transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Completed</span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                83%
              </span>
            </div>
            <p className="text-2xl font-bold text-emerald-700 mt-2">{kpis.completed}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Effective in Master</p>
          </div>

          <div
            onClick={() => setFilterStatus('In Transit')}
            className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs cursor-pointer hover:border-[#6C2BD9] transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">In Transit</span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-[#6C2BD9] border border-purple-200">
                8%
              </span>
            </div>
            <p className="text-2xl font-bold text-[#6C2BD9] mt-2">{kpis.inTransit}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Dispatched &amp; en-route</p>
          </div>

          <div
            onClick={() => setFilterStatus('Pending Receipt')}
            className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs cursor-pointer hover:border-amber-400 transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Pending Receipt</span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                4%
              </span>
            </div>
            <p className="text-2xl font-bold text-amber-600 mt-2">{kpis.pendingReceipt}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Awaiting destination sign-off</p>
          </div>

          <div
            onClick={() => setFilterStatus('Cancelled')}
            className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs cursor-pointer hover:border-rose-400 transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Cancelled / Rejected</span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                4%
              </span>
            </div>
            <p className="text-2xl font-bold text-rose-700 mt-2">{kpis.cancelledRejected}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Voided movement logs</p>
          </div>
        </div>

        {/* 2-Row Filter Panel matching Screenshot 27 */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          {/* Row 1 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 text-xs">
            {/* Search */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Search
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={filterSearch}
                  onChange={(e) => setFilterSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchClick()}
                  placeholder="AS-000123"
                  className="w-full pl-3 pr-8 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Asset Type */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Asset Type
              </label>
              <select
                value={filterAssetType}
                onChange={(e) => setFilterAssetType(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="All">All</option>
                <option value="IT Equipment">IT Equipment</option>
                <option value="Network Device">Network Device</option>
                <option value="Furniture">Furniture</option>
                <option value="Safety Equipment">Safety Equipment</option>
              </select>
            </div>

            {/* Movement Type */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Movement Type
              </label>
              <select
                value={filterMovementType}
                onChange={(e) => setFilterMovementType(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="All">All</option>
                <option value="Location Transfer">Location Transfer</option>
                <option value="Custodian Transfer">Custodian Transfer</option>
                <option value="Assignment">Assignment</option>
                <option value="Maintenance Return">Maintenance Return</option>
                <option value="Sent for Maintenance">Sent for Maintenance</option>
                <option value="Site Transfer">Site Transfer</option>
                <option value="Inter-company Transfer">Inter-company Transfer</option>
                <option value="Bulk Transfer">Bulk Transfer</option>
              </select>
            </div>

            {/* From Date */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                From Date
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={filterFromDate}
                  onChange={(e) => setFilterFromDate(e.target.value)}
                  placeholder="01 Jan 2025"
                  className="w-full pl-3 pr-8 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                <Calendar className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* To Date */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                To Date
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={filterToDate}
                  onChange={(e) => setFilterToDate(e.target.value)}
                  placeholder="10 Sep 2026"
                  className="w-full pl-3 pr-8 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                <Calendar className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3.5 text-xs items-end">
            {/* Site */}
            <div className="lg:col-span-3">
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Site
              </label>
              <select
                value={filterSite}
                onChange={(e) => setFilterSite(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="All Sites">All Sites</option>
                <option value="Dubai HQ">Dubai HQ</option>
                <option value="Abu Dhabi Branch">Abu Dhabi Branch</option>
                <option value="Riyadh DC">Riyadh DC</option>
                <option value="Sharjah Hub">Sharjah Hub</option>
              </select>
            </div>

            {/* Department */}
            <div className="lg:col-span-3">
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Department
              </label>
              <select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="All Departments">All Departments</option>
                <option value="IT Department">IT Department</option>
                <option value="Finance">Finance</option>
                <option value="Operations">Operations</option>
                <option value="HR">HR</option>
                <option value="Facilities">Facilities</option>
                <option value="Management">Management</option>
                <option value="Marketing">Marketing</option>
                <option value="Warehouse">Warehouse</option>
              </select>
            </div>

            {/* Custodian */}
            <div className="lg:col-span-2">
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Custodian
              </label>
              <select
                value={filterCustodian}
                onChange={(e) => setFilterCustodian(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="All">All</option>
                <option value="Ahmed Khan">Ahmed Khan</option>
                <option value="Sara Ali">Sara Ali</option>
                <option value="Omar Saleh">Omar Saleh</option>
                <option value="Fatima Noor">Fatima Noor</option>
                <option value="Rashid Mohammed">Rashid Mohammed</option>
                <option value="Layla Hassan">Layla Hassan</option>
              </select>
            </div>

            {/* Status */}
            <div className="lg:col-span-2">
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="All">All</option>
                <option value="Completed">Completed</option>
                <option value="In Transit">In Transit</option>
                <option value="Pending Receipt">Pending Receipt</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            {/* Action Buttons */}
            <div className="lg:col-span-2 flex items-center gap-2">
              <button
                onClick={handleSearchClick}
                className="flex-1 px-4 py-2 bg-[#6C2BD9] hover:bg-[#5b21b6] text-white rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Search</span>
              </button>
              <button
                onClick={handleClearFilters}
                className="px-3.5 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg font-semibold transition-colors cursor-pointer"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Main Grid & Right Details Panel Grid */}
        <div className="grid grid-cols-12 gap-6">
          {/* Left Table: Movement History (24) */}
          <div className="col-span-12 lg:col-span-8 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900">
                Movement History ({totalRecords})
              </h2>
              <span className="text-[11px] text-slate-400">
                Permanent read-only auditable log
              </span>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600 border-collapse">
                <thead className="bg-slate-50/80 text-slate-500 font-semibold text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3 w-8">#</th>
                    <th className="py-2.5 px-3">Movement ID</th>
                    <th className="py-2.5 px-3">Asset No.</th>
                    <th className="py-2.5 px-3">Asset Name</th>
                    <th className="py-2.5 px-3">Movement Type</th>
                    <th className="py-2.5 px-3">From Location</th>
                    <th className="py-2.5 px-3">To Location</th>
                    <th className="py-2.5 px-3">From Custodian</th>
                    <th className="py-2.5 px-3">To Custodian</th>
                    <th className="py-2.5 px-3">Movement Date</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 px-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {movements.map((row, idx) => {
                    const isSelected = selectedMovementId === row.movementId;
                    return (
                      <tr
                        key={row.movementId}
                        onClick={() => setSelectedMovementId(row.movementId)}
                        className={clsx(
                          'cursor-pointer transition-colors hover:bg-slate-50/70',
                          isSelected ? 'bg-purple-50/60 font-medium border-l-2 border-l-[#6C2BD9]' : ''
                        )}
                      >
                        <td className="py-3 px-3 text-slate-400 text-center text-[11px]">
                          {(currentPage - 1) * pageSize + idx + 1}
                        </td>
                        <td className="py-3 px-3 font-mono font-semibold text-slate-900 text-[11px]">
                          {row.movementId}
                        </td>
                        <td className="py-3 px-3 font-mono text-[11px] text-slate-800">
                          {row.assetNumber}
                        </td>
                        <td className="py-3 px-3 text-slate-800">
                          {row.assetName}
                        </td>
                        <td className="py-3 px-3 text-slate-600">
                          {row.movementType}
                        </td>
                        <td className="py-3 px-3 text-slate-500 text-[11px]">
                          {row.fromLocation}
                        </td>
                        <td className="py-3 px-3 text-slate-500 text-[11px]">
                          {row.toLocation}
                        </td>
                        <td className="py-3 px-3 text-slate-700">
                          {row.fromCustodian}
                        </td>
                        <td className="py-3 px-3 text-slate-700">
                          {row.toCustodian}
                        </td>
                        <td className="py-3 px-3 text-slate-600 whitespace-nowrap text-[11px]">
                          {row.movementDate}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span
                            className={clsx(
                              'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border',
                              row.status === 'Completed'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : row.status === 'In Transit'
                                ? 'bg-purple-50 text-[#6C2BD9] border-purple-200'
                                : row.status === 'Pending Receipt'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-rose-50 text-rose-700 border-rose-200'
                            )}
                          >
                            {row.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedMovementId(row.movementId);
                            }}
                            className="p-1 rounded text-[#6C2BD9] hover:bg-purple-50 transition-colors cursor-pointer"
                            title="View Movement Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Table Pagination matching Screenshot 27 */}
            <div className="p-3 bg-white border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <div>
                Showing 1 to {Math.min(pageSize, movements.length)} of {totalRecords} records
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className="w-7 h-7 flex items-center justify-center rounded border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setCurrentPage(1)}
                  className={clsx(
                    'w-7 h-7 flex items-center justify-center rounded text-xs font-semibold',
                    currentPage === 1 ? 'bg-[#6C2BD9] text-white shadow-xs' : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                  )}
                >
                  1
                </button>
                <button
                  onClick={() => setCurrentPage(2)}
                  className={clsx(
                    'w-7 h-7 flex items-center justify-center rounded text-xs font-semibold',
                    currentPage === 2 ? 'bg-[#6C2BD9] text-white shadow-xs' : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                  )}
                >
                  2
                </button>
                <button
                  onClick={() => setCurrentPage(3)}
                  className={clsx(
                    'w-7 h-7 flex items-center justify-center rounded text-xs font-semibold',
                    currentPage === 3 ? 'bg-[#6C2BD9] text-white shadow-xs' : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                  )}
                >
                  3
                </button>
                <button
                  disabled={currentPage === 3}
                  onClick={() => setCurrentPage(p => p + 1)}
                  className="w-7 h-7 flex items-center justify-center rounded border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>

                <div className="ml-2">
                  <select
                    value={pageSize}
                    onChange={(e) => setPageSize(Number(e.target.value))}
                    className="px-2 py-1 text-xs bg-white border border-slate-200 rounded text-slate-600 focus:outline-none"
                  >
                    <option value={5}>5 / page</option>
                    <option value={10}>10 / page</option>
                    <option value={20}>20 / page</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side Panel: Asset Information & Timeline & Supporting Documents */}
          <div className="col-span-12 lg:col-span-4 space-y-5">
            {/* Subtabs for Detail View */}
            <div className="bg-white rounded-xl border border-slate-200 p-1 flex items-center gap-1 text-xs font-semibold shadow-xs">
              <button
                onClick={() => setDrawerTab('overview')}
                className={clsx(
                  'flex-1 py-1.5 rounded-lg text-center transition-colors cursor-pointer',
                  drawerTab === 'overview'
                    ? 'bg-[#6C2BD9] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                )}
              >
                Overview
              </button>
              <button
                onClick={() => setDrawerTab('details')}
                className={clsx(
                  'flex-1 py-1.5 rounded-lg text-center transition-colors cursor-pointer',
                  drawerTab === 'details'
                    ? 'bg-[#6C2BD9] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                )}
              >
                Details
              </button>
              <button
                onClick={() => setDrawerTab('workflow')}
                className={clsx(
                  'flex-1 py-1.5 rounded-lg text-center transition-colors cursor-pointer',
                  drawerTab === 'workflow'
                    ? 'bg-[#6C2BD9] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                )}
              >
                Workflow
              </button>
              <button
                onClick={() => setDrawerTab('documents')}
                className={clsx(
                  'flex-1 py-1.5 rounded-lg text-center transition-colors cursor-pointer',
                  drawerTab === 'documents'
                    ? 'bg-[#6C2BD9] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                )}
              >
                Documents
              </button>
            </div>

            {/* TAB: OVERVIEW (Matching Screenshot 27) */}
            {drawerTab === 'overview' && (
              <>
                {/* Card 1: Asset Information */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
                  <h3 className="text-sm font-bold text-slate-900">Asset Information</h3>

                  <div className="flex items-center gap-3.5 bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                    <div className="w-16 h-14 rounded-lg bg-white border border-slate-200 flex items-center justify-center p-1.5 shrink-0 overflow-hidden shadow-2xs">
                      <img
                        src="/laptop.png"
                        alt={selectedMovement.assetName}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                      <Laptop className="w-8 h-8 text-slate-400 hidden only:block" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-slate-900 text-xs font-mono">
                          {selectedMovement.assetNumber}
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Active
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 font-medium truncate mt-0.5">
                        Laptop - Dell Latitude 5440
                      </p>
                    </div>
                  </div>

                  <div className="divide-y divide-slate-100 text-xs">
                    <div className="flex justify-between py-2">
                      <span className="text-slate-500">Serial Number</span>
                      <span className="font-mono text-slate-800 font-medium">
                        {selectedMovement.serialNumber || '75K3D24'}
                      </span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-slate-500">Tag / EPC</span>
                      <span className="font-mono text-slate-800 text-[11px] font-medium truncate max-w-[180px]" title={selectedMovement.tagEpc}>
                        {selectedMovement.tagEpc || 'E28011606000002053A1B4C0'}
                      </span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-slate-500">Asset Type</span>
                      <span className="text-slate-800 font-medium">IT Equipment</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-slate-500">Asset Category</span>
                      <span className="text-slate-800 font-medium">Laptops</span>
                    </div>
                    <div className="flex items-start justify-between py-2 gap-2">
                      <span className="text-slate-500 shrink-0">Current Location</span>
                      <span className="text-slate-800 font-medium text-right">
                        Dubai HQ &gt; Block B &gt; 1F &gt; IT-201
                      </span>
                    </div>
                    <div className="flex justify-between py-2 items-center">
                      <span className="text-slate-500">Current Custodian</span>
                      <span className="text-slate-800 font-semibold">Sara Ali</span>
                    </div>
                  </div>
                </div>

                {/* Card 2: Movement Timeline matching Screenshot 27 */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
                  <h3 className="text-sm font-bold text-slate-900">Movement Timeline</h3>

                  {/* Vertical Timeline */}
                  <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                    {/* Event 1 */}
                    <div className="relative">
                      <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-white shadow-xs" />
                      <div className="flex items-baseline justify-between text-xs mb-1">
                        <span className="text-[11px] text-slate-400 font-medium">10 Sep 2026 10:24</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-50 text-[#6C2BD9]">
                          Location Transfer
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 font-medium">
                        Block A &gt; GF &gt; IT-101 <span className="text-[#6C2BD9]">➔</span> Block B &gt; 1F &gt; IT-201
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">By: Sara Ali</p>
                    </div>

                    {/* Event 2 */}
                    <div className="relative">
                      <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-white shadow-xs" />
                      <div className="flex items-baseline justify-between text-xs mb-1">
                        <span className="text-[11px] text-slate-400 font-medium">15 Aug 2026 14:10</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-50 text-[#6C2BD9]">
                          Custodian Transfer
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 font-medium">
                        Sara Ali <span className="text-[#6C2BD9]">➔</span> Omar Saleh
                      </p>
                    </div>

                    {/* Event 3 */}
                    <div className="relative">
                      <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-white shadow-xs" />
                      <div className="flex items-baseline justify-between text-xs mb-1">
                        <span className="text-[11px] text-slate-400 font-medium">01 Jul 2026 09:30</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-50 text-[#6C2BD9]">
                          Location Transfer
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 font-medium">
                        Block C &gt; 2F &gt; IT-301 <span className="text-[#6C2BD9]">➔</span> Block A &gt; GF &gt; IT-101
                      </p>
                    </div>

                    {/* Event 4 */}
                    <div className="relative">
                      <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-white shadow-xs" />
                      <div className="flex items-baseline justify-between text-xs mb-1">
                        <span className="text-[11px] text-slate-400 font-medium">15 Jun 2026 11:15</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-50 text-[#6C2BD9]">
                          Assignment
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 font-medium">
                        Assigned to Omar Saleh
                      </p>
                    </div>

                    {/* Event 5 */}
                    <div className="relative">
                      <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-white shadow-xs" />
                      <div className="flex items-baseline justify-between text-xs mb-1">
                        <span className="text-[11px] text-slate-400 font-medium">12 May 2026 16:40</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-50 text-[#6C2BD9]">
                          Location Transfer
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 font-medium">
                        Store - Main <span className="text-[#6C2BD9]">➔</span> Block C &gt; 2F &gt; IT-301
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 text-right">
                    <button
                      onClick={() => setIsFullTimelineModalOpen(true)}
                      className="text-xs text-[#6C2BD9] hover:text-[#5b21b6] font-semibold cursor-pointer inline-flex items-center gap-1"
                    >
                      <span>View Full History</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Card 3: Supporting Documents matching Screenshot 27 */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-3">
                  <h3 className="text-sm font-bold text-slate-900">Supporting Documents</h3>

                  <div className="space-y-2">
                    {selectedMovement.documents && selectedMovement.documents.length > 0 ? (
                      selectedMovement.documents.map((doc, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <div className="w-8 h-8 rounded bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                              <FileText className="w-4 h-4" />
                            </div>
                            <div className="truncate">
                              <p className="text-xs font-semibold text-slate-800 truncate">{doc.name}</p>
                              <p className="text-[10px] text-slate-400">{doc.size}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => window.open('#', '_blank')}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-[#6C2BD9] hover:bg-purple-50 transition-colors cursor-pointer"
                            title="Download Document"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400">No documents attached.</p>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* TAB: DETAILS */}
            {drawerTab === 'details' && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4 text-xs">
                <h3 className="text-sm font-bold text-slate-900">Transaction Details</h3>
                <div className="divide-y divide-slate-100">
                  <div className="flex justify-between py-2">
                    <span className="text-slate-500">Movement ID</span>
                    <span className="font-mono font-bold text-[#6C2BD9]">{selectedMovement.movementId}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-slate-500">Transaction Type</span>
                    <span className="font-semibold text-slate-800">{selectedMovement.movementType}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-slate-500">Movement Date</span>
                    <span className="text-slate-800">{selectedMovement.movementDate} {selectedMovement.movementTime}</span>
                  </div>
                  <div className="py-2 space-y-1">
                    <span className="text-slate-500">Source Location</span>
                    <p className="text-slate-800 font-medium pl-2">{selectedMovement.fromLocation}</p>
                  </div>
                  <div className="py-2 space-y-1">
                    <span className="text-slate-500">Destination Location</span>
                    <p className="text-slate-800 font-medium pl-2">{selectedMovement.toLocation}</p>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-slate-500">Previous Custodian</span>
                    <span className="text-slate-800">{selectedMovement.fromCustodian}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-slate-500">New Custodian</span>
                    <span className="text-slate-800 font-semibold">{selectedMovement.toCustodian}</span>
                  </div>
                  <div className="py-2 space-y-1">
                    <span className="text-slate-500">Reason for Movement</span>
                    <p className="text-slate-700 italic bg-slate-50 p-2 rounded">{selectedMovement.reason}</p>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-slate-500">Condition at Transfer</span>
                    <span className="font-semibold text-emerald-700">{selectedMovement.condition}</span>
                  </div>
                  <div className="py-2 space-y-1">
                    <span className="text-slate-500">Accessories Included</span>
                    <p className="text-slate-700">{selectedMovement.accessories || 'None'}</p>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-slate-500">Requested By</span>
                    <span className="text-slate-800">{selectedMovement.requestedBy}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-slate-500">Approved By</span>
                    <span className="text-slate-800 font-medium">{selectedMovement.approvedBy}</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: WORKFLOW / APPROVALS */}
            {drawerTab === 'workflow' && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4 text-xs">
                <h3 className="text-sm font-bold text-slate-900">Workflow &amp; Approvals</h3>
                <div className="space-y-3">
                  {selectedMovement.workflow && selectedMovement.workflow.length > 0 ? (
                    selectedMovement.workflow.map((wf, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">{wf.level}</span>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {wf.decision}
                          </span>
                        </div>
                        <p className="text-slate-600">Approver: <span className="font-semibold text-slate-800">{wf.approver}</span></p>
                        <p className="text-[10px] text-slate-400">{wf.timestamp}</p>
                        {wf.comments && (
                          <p className="text-slate-700 bg-white p-2 rounded border border-slate-100 italic mt-1">
                            "{wf.comments}"
                          </p>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-400">Standard operational movement (automatic authorization).</p>
                  )}
                </div>
              </div>
            )}

            {/* TAB: DOCUMENTS */}
            {drawerTab === 'documents' && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4 text-xs">
                <h3 className="text-sm font-bold text-slate-900">Transaction Evidence &amp; Documents</h3>
                <div className="space-y-2.5">
                  {selectedMovement.documents && selectedMovement.documents.map((doc, idx) => (
                    <div key={idx} className="p-3 border border-slate-200 rounded-xl flex items-center justify-between bg-slate-50/50">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded bg-rose-50 text-rose-600 flex items-center justify-center">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{doc.name}</p>
                          <p className="text-[11px] text-slate-400">{doc.type} • {doc.size}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => window.open('#', '_blank')}
                        className="px-3 py-1.5 bg-purple-50 text-[#6C2BD9] hover:bg-purple-100 rounded-lg font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons Toolbar at Bottom of Drawer */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex items-center justify-between gap-2">
              <button
                onClick={() => navigate(`/assets/${selectedMovement.assetNumber}`)}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-purple-50 hover:bg-purple-100 text-[#6C2BD9] rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>View Asset 360°</span>
              </button>
              <button
                onClick={() => window.print()}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Report</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Full Timeline Modal */}
      {isFullTimelineModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-2xl w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Complete Movement Audit Timeline</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Chronological lifecycle trace for {selectedMovement.assetNumber} ({selectedMovement.assetName})
                </p>
              </div>
              <button
                onClick={() => setIsFullTimelineModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 text-xs">
              {SEED_MOVEMENTS.map((ev, i) => (
                <div key={i} className="relative">
                  <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-white shadow-xs" />
                  <div className="flex items-baseline justify-between text-xs mb-1">
                    <span className="text-[11px] text-slate-400 font-semibold">{ev.movementDate} {ev.movementTime}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-50 text-[#6C2BD9]">
                      {ev.movementType}
                    </span>
                  </div>
                  <p className="font-semibold text-slate-900">{ev.movementId}</p>
                  <p className="text-slate-700 mt-0.5">
                    {ev.fromLocation !== '-' ? `${ev.fromLocation} ➔ ${ev.toLocation}` : `Custodian Handover: ${ev.fromCustodian} ➔ ${ev.toCustodian}`}
                  </p>
                  <p className="text-[11px] text-slate-500 italic mt-0.5">{ev.reason}</p>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-100 pt-3 text-right">
              <button
                onClick={() => setIsFullTimelineModalOpen(false)}
                className="px-5 py-2 text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg cursor-pointer"
              >
                Close Timeline
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MovementHistory;
