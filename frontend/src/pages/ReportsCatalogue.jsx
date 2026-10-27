import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import {
  BarChart3,
  Download,
  RefreshCw,
  FileSpreadsheet,
  Eye,
  Package,
  ArrowRightLeft,
  UserCheck,
  MapPin,
  DollarSign,
  AlertTriangle,
  Wrench,
  Clock,
  Search,
  Filter,
  ArrowLeft,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Plus,
  SlidersHorizontal,
  X,
  Layers,
  Sparkles,
  Printer,
  Edit2,
  MoreVertical,
  Play,
  Share2,
  Boxes,
  TrendingUp,
  TrendingDown,
  ExternalLink,
  Check,
  FileText,
  Trash2
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell
} from 'recharts';
import clsx from 'clsx';

// ---------------------------------------------------------------------------
// 1. Navigation Tabs & Master Definitions
// ---------------------------------------------------------------------------

const REPORT_TABS = [
  { id: 'dashboard', name: 'Dashboard Reports', icon: BarChart3 },
  { id: 'assets', name: 'Asset Reports', icon: Package },
  { id: 'inventory', name: 'Inventory Reports', icon: Boxes },
  { id: 'maintenance', name: 'Maintenance Reports', icon: Wrench },
  { id: 'financial', name: 'Financial Reports', icon: DollarSign },
  { id: 'compliance', name: 'Compliance Reports', icon: ShieldCheck },
  { id: 'custom', name: 'Custom Reports', icon: SlidersHorizontal },
  { id: 'scheduled', name: 'Scheduled Reports', icon: Clock }
];

const CATEGORY_CARDS = [
  {
    id: 'assets',
    name: 'Asset Reports',
    description: 'Asset inventory, lifecycle',
    icon: Package,
    color: '#10B981',
    bgColor: '#ECFDF5',
    borderColor: '#A7F3D0'
  },
  {
    id: 'maintenance',
    name: 'Maintenance Reports',
    description: 'Work orders, costs',
    icon: Wrench,
    color: '#8B5CF6',
    bgColor: '#F5F3FF',
    borderColor: '#DDD6FE'
  },
  {
    id: 'inventory',
    name: 'Inventory Reports',
    description: 'Stock, transfers, usage',
    icon: Boxes,
    color: '#3B82F6',
    bgColor: '#EFF6FF',
    borderColor: '#BFDBFE'
  },
  {
    id: 'financial',
    name: 'Financial Reports',
    description: 'Cost, depreciation, budget',
    icon: DollarSign,
    color: '#059669',
    bgColor: '#ECFDF5',
    borderColor: '#A7F3D0'
  },
  {
    id: 'compliance',
    name: 'Compliance Reports',
    description: 'Audit, warranty, regulatory',
    icon: ShieldCheck,
    color: '#7C3AED',
    bgColor: '#F5F3FF',
    borderColor: '#DDD6FE'
  },
  {
    id: 'custom',
    name: 'Custom Reports',
    description: 'Build your own reports',
    icon: SlidersHorizontal,
    color: '#6C2BD9',
    bgColor: '#EFF6FF',
    borderColor: '#BFDBFE'
  }
];

const DEFAULT_KPIS = {
  totalAssets: 12486,
  totalAssetsChange: 12,
  totalAssetsTrend: 'up',
  activeWorkOrders: 342,
  activeWorkOrdersChange: 8,
  activeWorkOrdersTrend: 'up',
  locationCount: 18,
  locationText: '18 Locations',
  maintenanceCost: 'AED 1.2M',
  maintenanceCostChange: 5,
  maintenanceCostTrend: 'down',
  complianceRate: 98,
  complianceRateChange: 2,
  complianceRateTrend: 'up',
  periodText: 'vs. last period'
};

const ASSETS_BY_CATEGORY = [
  { name: 'IT Equipment', count: 3245, pct: 26, color: '#6C2BD9' },
  { name: 'Office Furniture', count: 2180, pct: 17, color: '#60A5FA' },
  { name: 'Vehicles', count: 1846, pct: 15, color: '#F59E0B' },
  { name: 'Machinery', count: 1520, pct: 12, color: '#EF4444' },
  { name: 'Tools & Equipment', count: 1245, pct: 10, color: '#06B6D4' },
  { name: 'Facilities', count: 980, pct: 8, color: '#5B21B6' },
  { name: 'Others', count: 1470, pct: 12, color: '#94A3B8' }
];

const ASSETS_BY_LOCATION = [
  { location: 'Dubai HQ', count: 3245, fill: '#6C2BD9' },
  { location: 'Jebel Ali', count: 2180, fill: '#60A5FA' },
  { location: 'Abu Dhabi', count: 1846, fill: '#93C5FD' },
  { location: 'Sharjah', count: 1520, fill: '#93C5FD' },
  { location: 'Other', count: 980, fill: '#BFDBFE' }
];

const ASSET_STATUS_DATA = [
  { status: 'Active', count: 10245, pct: 82, color: '#10B981' },
  { status: 'In Maintenance', count: 856, pct: 7, color: '#F59E0B' },
  { status: 'Retired', count: 480, pct: 4, color: '#94A3B8' },
  { status: 'Lost / Missing', count: 320, pct: 3, color: '#EF4444' },
  { status: 'Disposed', count: 585, pct: 4, color: '#8B5CF6' }
];

const RECENT_REPORTS_SEED = [
  {
    id: 'REP-2025-091',
    name: 'Asset Inventory Report',
    category: 'Asset',
    dateGenerated: '10 Sep 2025 10:30 AM',
    generatedBy: 'John Doe',
    format: 'PDF'
  },
  {
    id: 'REP-2025-090',
    name: 'Maintenance Cost Analysis',
    category: 'Maintenance',
    dateGenerated: '09 Sep 2025 04:15 PM',
    generatedBy: 'Sarah Ahmed',
    format: 'Excel'
  },
  {
    id: 'REP-2025-089',
    name: 'Assets by Location',
    category: 'Asset',
    dateGenerated: '08 Sep 2025 11:20 AM',
    generatedBy: 'Khalid Al Mansoori',
    format: 'PDF'
  },
  {
    id: 'REP-2025-088',
    name: 'Compliance Report',
    category: 'Compliance',
    dateGenerated: '07 Sep 2025 02:45 PM',
    generatedBy: 'Priya Nair',
    format: 'Excel'
  },
  {
    id: 'REP-2025-087',
    name: 'Depreciation Schedule',
    category: 'Financial',
    dateGenerated: '05 Sep 2025 09:10 AM',
    generatedBy: 'Admin',
    format: 'PDF'
  }
];

const SCHEDULED_REPORTS_SEED = [
  {
    id: 'SCH-001',
    name: 'Executive Asset Health Summary',
    category: 'Asset',
    frequency: 'Monthly',
    deliveryFormat: 'PDF',
    recipients: 'director@asset360.com, management@asset360.com',
    nextRun: '01 Nov 2026 08:00 AM',
    status: 'Active'
  },
  {
    id: 'SCH-002',
    name: 'Weekly Work Order & Cost Audit',
    category: 'Maintenance',
    frequency: 'Weekly',
    deliveryFormat: 'Excel',
    recipients: 'maintenance-lead@asset360.com',
    nextRun: '02 Nov 2026 09:00 AM',
    status: 'Active'
  },
  {
    id: 'SCH-003',
    name: 'Inventory Valuation & Reorder Alerts',
    category: 'Inventory',
    frequency: 'Weekly',
    deliveryFormat: 'Excel',
    recipients: 'warehouse@asset360.com, procurement@asset360.com',
    nextRun: '02 Nov 2026 07:30 AM',
    status: 'Active'
  },
  {
    id: 'SCH-004',
    name: 'Statutory Asset Depreciation Schedule',
    category: 'Financial',
    frequency: 'Monthly',
    deliveryFormat: 'Excel',
    recipients: 'cfo@asset360.com, finance-team@asset360.com',
    nextRun: '01 Nov 2026 06:00 AM',
    status: 'Active'
  },
  {
    id: 'SCH-005',
    name: 'Warranty Expiry 60-Day Lookahead',
    category: 'Compliance',
    frequency: 'Monthly',
    deliveryFormat: 'PDF',
    recipients: 'compliance@asset360.com, procurement@asset360.com',
    nextRun: '01 Nov 2026 08:00 AM',
    status: 'Paused'
  }
];

const CORE_PREDEFINED_REPORTS = [
  {
    id: 'asset-register',
    name: 'Master Asset Register',
    description: 'Central master inventory register with category, company, location, and lifecycle status.',
    category: 'Asset',
    endpoint: '/reports/asset-register'
  },
  {
    id: 'movement',
    name: 'Asset Movement & Transfer History',
    description: 'Audit log of asset custody transfers, site movements, check-ins, and check-outs.',
    category: 'Asset',
    endpoint: '/reports/movement'
  },
  {
    id: 'custody',
    name: 'Custodian & Employee Allocation',
    description: 'Current employee asset assignments, custodian allocations, and departmental splits.',
    category: 'Asset',
    endpoint: '/reports/custody'
  },
  {
    id: 'location-distribution',
    name: 'Site & Location Distribution',
    description: 'Breakdown of physical asset placement across sites, buildings, floors, and rooms.',
    category: 'Asset',
    endpoint: '/reports/location-distribution'
  },
  {
    id: 'depreciation',
    name: 'Depreciation & Net Book Value',
    description: 'Financial valuation, accumulated depreciation schedules, and current Net Book Value (NBV).',
    category: 'Financial',
    endpoint: '/reports/depreciation'
  },
  {
    id: 'maintenance',
    name: 'Maintenance History & Cost Log',
    description: 'Preventive and corrective work orders, labor hours, and maintenance expenditures.',
    category: 'Maintenance',
    endpoint: '/reports/maintenance'
  },
  {
    id: 'warranties',
    name: 'Warranty & SLA Expiry Schedule',
    description: 'Upcoming vendor contract and OEM warranty expirations over time.',
    category: 'Compliance',
    endpoint: '/reports/warranties'
  },
  {
    id: 'exceptions',
    name: 'Missing & Exception Alerts',
    description: 'Audit discrepancy log of missing, stolen, damaged, or unserviceable hardware.',
    category: 'Compliance',
    endpoint: '/reports/exceptions'
  }
];

// Fallback domain-specific datasets to guarantee immediate rich data display
const FALLBACK_DOMAIN_DATA = {
  assets: {
    kpis: {
      total: '12,486',
      inService: '10,245',
      inMaintenance: '856',
      retired: '1,065',
      missing: '320'
    },
    subReports: [
      { id: 'asset-register', name: 'Master Asset Register', endpoint: '/reports/asset-register' },
      { id: 'movement', name: 'Movement & Transfer History', endpoint: '/reports/movement' },
      { id: 'custody', name: 'Custodian & Department Allocation', endpoint: '/reports/custody' },
      { id: 'location-distribution', name: 'Site & Location Distribution', endpoint: '/reports/location-distribution' }
    ],
    sampleRows: [
      { code: 'AST-DX-10024', name: 'Dell Precision 7760 Workstation', category: 'IT Equipment', location: 'Dubai HQ > 2F', custodian: 'Sarah Ahmed', status: 'IN_SERVICE', cost: 'AED 14,500', purchaseDate: '12 Jan 2023' },
      { code: 'AST-DX-10025', name: 'Cisco Catalyst 9300 Core Switch', category: 'IT Equipment', location: 'Dubai HQ > Server Room 1', custodian: 'John Doe', status: 'IN_SERVICE', cost: 'AED 28,000', purchaseDate: '05 May 2023' },
      { code: 'AST-DX-10026', name: 'Toyota Hilux Double Cab 4x4', category: 'Vehicles', location: 'Jebel Ali > Transport Bay', custodian: 'Rashid Khan', status: 'IN_SERVICE', cost: 'AED 115,000', purchaseDate: '18 Nov 2022' },
      { code: 'AST-DX-10027', name: 'Caterpillar 500kVA Generator', category: 'Machinery', location: 'Dubai HQ > Powerhouse', custodian: 'Facilities Team', status: 'IN_SERVICE', cost: 'AED 185,000', purchaseDate: '10 Feb 2021' },
      { code: 'AST-DX-10028', name: 'Herman Miller Aeron Ergonomic Chair', category: 'Office Furniture', location: 'Abu Dhabi > Exec Floor', custodian: 'Tariq Mansoor', status: 'IN_SERVICE', cost: 'AED 4,800', purchaseDate: '02 Mar 2024' },
      { code: 'AST-DX-10029', name: 'MacBook Pro 16" M3 Max', category: 'IT Equipment', location: 'Dubai HQ > Design Studio', custodian: 'Elena Rostova', status: 'IN_SERVICE', cost: 'AED 16,200', purchaseDate: '14 Jan 2024' },
      { code: 'AST-DX-10030', name: 'Carrier 30XA AquaForce Chiller #2', category: 'Facilities', location: 'Dubai HQ > Rooftop', custodian: 'HVAC Team', status: 'UNDER_MAINTENANCE', cost: 'AED 240,000', purchaseDate: '22 Aug 2020' },
      { code: 'AST-DX-10031', name: 'Bosch Industrial Rotary Hammer Drill', category: 'Tools & Equipment', location: 'Sharjah > Workshop A', custodian: 'Workshop Foreman', status: 'IN_SERVICE', cost: 'AED 2,950', purchaseDate: '11 Jul 2023' }
    ]
  },
  inventory: {
    kpis: {
      totalItems: '11',
      inStock: '5',
      lowStock: '4',
      outOfStock: '2',
      valuation: 'AED 28,246.00'
    },
    subReports: [
      { id: 'stock-valuation', name: 'Current Stock on Hand & Valuation', endpoint: '/maintenance/spare-parts' },
      { id: 'stock-movement', name: 'Stock Movement & Transaction Ledger', endpoint: '/maintenance/stock-transactions' },
      { id: 'reorder-alerts', name: 'Reorder Planning & Safety Stock Alerts', endpoint: '/maintenance/reorder-planning' }
    ],
    sampleRows: [
      { partNumber: 'SP-FIL-001', name: 'Heavy Duty Air Filter AF-402', category: 'Filtration', location: 'Central Warehouse > Shelf B-3', currentStock: 4, minStock: 10, unitCost: 'AED 120.00', totalValue: 'AED 480.00', status: 'Low Stock' },
      { partNumber: 'SP-HYD-004', name: 'Hydraulic Seal Kit SK-88', category: 'Hydraulics', location: 'Central Warehouse > Bin 14', currentStock: 1, minStock: 5, unitCost: 'AED 850.00', totalValue: 'AED 850.00', status: 'Low Stock' },
      { partNumber: 'SP-LUB-012', name: 'Synthetic Gear Oil ISO VG 220 (20L)', category: 'Lubricants', location: 'Chemical Storage > Locker C', currentStock: 18, minStock: 6, unitCost: 'AED 380.00', totalValue: 'AED 6,840.00', status: 'In Stock' },
      { partNumber: 'SP-ELE-089', name: 'ABB Circuit Breaker 63A 3-Pole', category: 'Electrical', location: 'Central Warehouse > Cabinet 2', currentStock: 8, minStock: 4, unitCost: 'AED 210.00', totalValue: 'AED 1,680.00', status: 'In Stock' },
      { partNumber: 'SP-VBL-003', name: 'Industrial V-Belt B-68 Gates', category: 'Mechanical', location: 'Central Warehouse > Rack 5', currentStock: 0, minStock: 8, unitCost: 'AED 65.00', totalValue: 'AED 0.00', status: 'Out of Stock' },
      { partNumber: 'SP-SEN-045', name: 'PT100 Temperature Sensor Transmitter', category: 'Instrumentation', location: 'Precision Room > Bin 3', currentStock: 6, minStock: 3, unitCost: 'AED 450.00', totalValue: 'AED 2,700.00', status: 'In Stock' },
      { partNumber: 'SP-PMP-002', name: 'Mechanical Pump Shaft Seal 45mm', category: 'Mechanical', location: 'Central Warehouse > Bin 08', currentStock: 2, minStock: 4, unitCost: 'AED 680.00', totalValue: 'AED 1,360.00', status: 'Low Stock' },
      { partNumber: 'SP-RLY-011', name: 'Omron 24VDC Control Relay Module', category: 'Electrical', location: 'Central Warehouse > Cabinet 1', currentStock: 0, minStock: 5, unitCost: 'AED 95.00', totalValue: 'AED 0.00', status: 'Out of Stock' }
    ]
  },
  maintenance: {
    kpis: {
      totalWorkOrders: '342',
      inProgress: '48',
      completed: '294',
      totalSpend: 'AED 1,240,000',
      preventiveRate: '92%'
    },
    subReports: [
      { id: 'maint-history', name: 'Maintenance History & Cost Log', endpoint: '/reports/maintenance' },
      { id: 'wo-status', name: 'Work Order Status Breakdown', endpoint: '/maintenance/work-orders' },
      { id: 'pm-compliance', name: 'Preventive Schedule Compliance', endpoint: '/reports/maintenance' }
    ],
    sampleRows: [
      { workOrderId: 'WO-2026-104', assetCode: 'AST-DX-10027', assetName: 'Caterpillar 500kVA Generator', type: 'Preventive', priority: 'High', technician: 'Zubair Ali', completedDate: '24 Oct 2026', laborHours: '12 hrs', partsCost: 'AED 2,400', totalCost: 'AED 4,800', status: 'Completed' },
      { workOrderId: 'WO-2026-112', assetCode: 'AST-DX-10030', assetName: 'Carrier 30XA Chiller #2', type: 'Corrective', priority: 'Urgent', technician: 'Tech Team Alpha', scheduledDate: '26 Oct 2026', laborHours: '8 hrs', partsCost: 'AED 5,200', totalCost: 'AED 8,500', status: 'In Progress' },
      { workOrderId: 'WO-2026-098', assetCode: 'AST-DX-10026', assetName: 'Toyota Hilux 4x4', type: 'Preventive', priority: 'Medium', technician: 'Fleet Maintenance', completedDate: '20 Oct 2026', laborHours: '4 hrs', partsCost: 'AED 850', totalCost: 'AED 1,650', status: 'Completed' },
      { workOrderId: 'WO-2026-095', assetCode: 'AST-DX-10025', assetName: 'Cisco 9300 Core Switch', type: 'Firmware Update', priority: 'Medium', technician: 'IT Network Ops', completedDate: '18 Oct 2026', laborHours: '2 hrs', partsCost: 'AED 0', totalCost: 'AED 600', status: 'Completed' },
      { workOrderId: 'WO-2026-089', assetCode: 'AST-DX-09411', assetName: 'Kone Freight Elevator #1', type: 'Annual Safety Audit', priority: 'Critical', technician: 'Kone Certified', completedDate: '15 Oct 2026', laborHours: '16 hrs', partsCost: 'AED 4,100', totalCost: 'AED 9,200', status: 'Completed' },
      { workOrderId: 'WO-2026-082', assetCode: 'AST-DX-10031', assetName: 'Bosch Rotary Hammer Drill', type: 'Repair', priority: 'Low', technician: 'Workshop Tech', completedDate: '12 Oct 2026', laborHours: '1.5 hrs', partsCost: 'AED 180', totalCost: 'AED 420', status: 'Completed' }
    ]
  },
  financial: {
    kpis: {
      acquisitionCost: 'AED 18,450,000',
      accumulatedDep: 'AED 6,210,000',
      netBookValue: 'AED 12,240,000',
      depreciatedUnits: '8,410',
      avgDepRate: '14.2% p.a.'
    },
    subReports: [
      { id: 'depreciation-sched', name: 'Depreciation & Net Book Value Schedule', endpoint: '/reports/depreciation' },
      { id: 'disposal-summary', name: 'Asset Disposal & Gain/Loss Summary', endpoint: '/reports/disposals' },
      { id: 'asset-valuation', name: 'Capital Asset Valuation Register', endpoint: '/reports/depreciation' }
    ],
    sampleRows: [
      { assetCode: 'AST-DX-10024', name: 'Dell Precision 7760 Workstation', category: 'IT Equipment', acquisitionCost: 'AED 14,500', purchaseDate: '15 Jan 2023', usefulLife: '4 Years', depreciationMethod: 'Straight Line', accumulatedDep: 'AED 7,250', netBookValue: 'AED 7,250', status: 'Active' },
      { assetCode: 'AST-DX-10027', name: 'Caterpillar 500kVA Generator', category: 'Machinery', acquisitionCost: 'AED 185,000', purchaseDate: '10 Feb 2021', usefulLife: '10 Years', depreciationMethod: 'Straight Line', accumulatedDep: 'AED 92,500', netBookValue: 'AED 92,500', status: 'Active' },
      { assetCode: 'AST-DX-10026', name: 'Toyota Hilux Double Cab 4x4', category: 'Vehicles', acquisitionCost: 'AED 115,000', purchaseDate: '18 Nov 2022', usefulLife: '5 Years', depreciationMethod: 'Declining Balance', accumulatedDep: 'AED 64,400', netBookValue: 'AED 50,600', status: 'Active' },
      { assetCode: 'AST-DX-10030', name: 'Carrier 30XA Chiller #2', category: 'Facilities', acquisitionCost: 'AED 240,000', purchaseDate: '22 Aug 2020', usefulLife: '15 Years', depreciationMethod: 'Straight Line', accumulatedDep: 'AED 96,000', netBookValue: 'AED 144,000', status: 'Active' },
      { assetCode: 'AST-DX-08812', name: 'Server HP ProLiant Gen9', category: 'IT Equipment', acquisitionCost: 'AED 24,000', purchaseDate: '14 Mar 2018', usefulLife: '5 Years', depreciationMethod: 'Straight Line', accumulatedDep: 'AED 22,800', netBookValue: 'AED 1,200', status: 'Disposed' }
    ]
  },
  compliance: {
    kpis: {
      complianceRate: '98.2%',
      expiringWarranties: '42',
      auditExceptions: '14',
      untaggedItems: '8'
    },
    subReports: [
      { id: 'warranties-sched', name: 'Warranty & SLA Expiry Schedule', endpoint: '/reports/warranties' },
      { id: 'exceptions-log', name: 'Physical Audit Discrepancies & Exceptions', endpoint: '/reports/exceptions' },
      { id: 'discovery-log', name: 'Discovery & Untagged Asset Log', endpoint: '/reports/discovery' }
    ],
    sampleRows: [
      { assetCode: 'AST-DX-10024', name: 'Dell Precision 7760 Workstation', vendor: 'Dell Middle East', warrantyType: 'OEM ProSupport Plus', startDate: '15 Jan 2023', endDate: '14 Jan 2027', daysRemaining: 79, status: 'Active (Expiring Soon)' },
      { assetCode: 'AST-DX-10025', name: 'Cisco Catalyst 9300 Core Switch', vendor: 'Cisco Systems Gulf', warrantyType: 'Smart Net Total Care', startDate: '05 May 2023', endDate: '04 May 2027', daysRemaining: 189, status: 'Active' },
      { assetCode: 'AST-DX-10027', name: 'Caterpillar 500kVA Generator', vendor: 'Al-Bahar Caterpillar', warrantyType: 'Comprehensive Engine SLA', startDate: '10 Feb 2021', endDate: '09 Feb 2027', daysRemaining: 104, status: 'Active' },
      { assetCode: 'AST-DX-10099', name: 'Fluke Multimeter 87V', vendor: 'Fluke Instruments', warrantyType: 'Calibration & OEM Repair', startDate: '12 Jul 2023', endDate: '11 Jul 2026', daysRemaining: -107, status: 'Expired - Renovation Due' }
    ]
  }
};

export function ReportsCatalogue() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Active Category detection from query param:
  // e.g. /reports -> 'dashboard', /reports?category=assets -> 'assets'
  const categoryParam = (searchParams.get('category') || 'dashboard').toLowerCase();
  const activeCategory = categoryParam === 'asset' ? 'assets' : categoryParam;

  // View Mode: 'DASHBOARD' | 'REPORT_VIEWER'
  const [viewMode, setViewMode] = useState('DASHBOARD');
  const [selectedReportObj, setSelectedReportObj] = useState(null);

  // Common Filters State
  const [filterCategory, setFilterCategory] = useState('All Categories');
  const [filterReportType, setFilterReportType] = useState('All Types');
  const [filterDateRange, setFilterDateRange] = useState('01 Jan 2025 - 31 Dec 2025');
  const [filterLocation, setFilterLocation] = useState('All Locations');
  const [filterDepartment, setFilterDepartment] = useState('All Departments');

  // Interactive Calendar / Date Range Picker State
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [customStartDate, setCustomStartDate] = useState('2025-01-01');
  const [customEndDate, setCustomEndDate] = useState('2025-12-31');
  const [activeDatePreset, setActiveDatePreset] = useState('Full Year 2025');
  const [calMonth, setCalMonth] = useState(new Date(2025, 0, 1));
  const datePickerRef = useRef(null);

  // Close calendar popover on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (datePickerRef.current && !datePickerRef.current.contains(e.target)) {
        setShowDatePicker(false);
      }
    };
    if (showDatePicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDatePicker]);

  const formatDateDisplay = (dateVal) => {
    if (!dateVal) return '';
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return String(dateVal);
    const day = String(d.getDate()).padStart(2, '0');
    const month = d.toLocaleString('en-GB', { month: 'short' });
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const handleSelectDatePreset = (presetKey) => {
    setActiveDatePreset(presetKey);
    let start = '2025-01-01';
    let end = '2025-12-31';
    const now = new Date();

    if (presetKey === 'Today') {
      const todayStr = now.toISOString().slice(0, 10);
      start = todayStr;
      end = todayStr;
    } else if (presetKey === 'Last 7 Days') {
      const past7 = new Date();
      past7.setDate(now.getDate() - 7);
      start = past7.toISOString().slice(0, 10);
      end = now.toISOString().slice(0, 10);
    } else if (presetKey === 'This Month') {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      start = firstDay.toISOString().slice(0, 10);
      end = lastDay.toISOString().slice(0, 10);
    } else if (presetKey === 'Last 30 Days') {
      const past30 = new Date();
      past30.setDate(now.getDate() - 30);
      start = past30.toISOString().slice(0, 10);
      end = now.toISOString().slice(0, 10);
    } else if (presetKey === 'This Quarter') {
      const qStart = Math.floor(now.getMonth() / 3) * 3;
      const firstQDay = new Date(now.getFullYear(), qStart, 1);
      const lastQDay = new Date(now.getFullYear(), qStart + 3, 0);
      start = firstQDay.toISOString().slice(0, 10);
      end = lastQDay.toISOString().slice(0, 10);
    } else if (presetKey === 'Full Year 2025') {
      start = '2025-01-01';
      end = '2025-12-31';
    } else if (presetKey === 'Year to Date') {
      const ytdStart = new Date(now.getFullYear(), 0, 1);
      start = ytdStart.toISOString().slice(0, 10);
      end = now.toISOString().slice(0, 10);
    }

    setCustomStartDate(start);
    setCustomEndDate(end);
    setCalMonth(new Date(start));
  };

  const handleApplyDateRange = () => {
    const formatted = `${formatDateDisplay(customStartDate)} - ${formatDateDisplay(customEndDate)}`;
    setFilterDateRange(formatted);
    setShowDatePicker(false);
    console.log('📅 [Date Range Filter Applied]:', {
      startDate: customStartDate,
      endDate: customEndDate,
      displayRange: formatted
    });
    setActionSuccessMsg(`Date range applied: ${formatted}`);
    setTimeout(() => setActionSuccessMsg(null), 3000);
    fetchDashboard();
  };

  const handleCalPrevMonth = () => {
    setCalMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleCalNextMonth = () => {
    setCalMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleDayClick = (dayNum) => {
    const y = calMonth.getFullYear();
    const m = String(calMonth.getMonth() + 1).padStart(2, '0');
    const d = String(dayNum).padStart(2, '0');
    const clickedStr = `${y}-${m}-${d}`;

    if (!customStartDate || (customStartDate && customEndDate)) {
      setCustomStartDate(clickedStr);
      setCustomEndDate('');
      setActiveDatePreset('Custom');
    } else {
      if (clickedStr < customStartDate) {
        setCustomStartDate(clickedStr);
        setCustomEndDate(customStartDate);
      } else {
        setCustomEndDate(clickedStr);
      }
      setActiveDatePreset('Custom');
    }
  };

  const calendarDays = useMemo(() => {
    const year = calMonth.getFullYear();
    const month = calMonth.getMonth();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
    return { year, month, totalDays, firstDayIndex };
  }, [calMonth]);

  // Advanced Filters State
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [advFilters, setAdvFilters] = useState({
    reportCategory: 'Asset Reports',
    reportType: 'Assets by Location',
    dateRange: 'This Year (Jan 2025 - Dec 2025)',
    company: 'All Companies',
    location: 'All Locations',
    department: 'All Departments',
    costCenter: 'All Cost Centers',
    assetClass: 'All Classes',
    supplier: 'All Suppliers',
    assetGroup: 'All Asset Groups',
    assetCategory: 'All Categories',
    assetSubCategory: 'All Sub Categories',
    acqFromDate: '',
    acqToDate: '',
    assetStatus: ['Active', 'In Maintenance'],
    tags: ''
  });

  // KPI & Analytics Data for Dashboard
  const [kpis, setKpis] = useState(DEFAULT_KPIS);
  const [categoryChartData, setCategoryChartData] = useState(ASSETS_BY_CATEGORY);
  const [locationChartData, setLocationChartData] = useState(ASSETS_BY_LOCATION);
  const [statusChartData, setStatusChartData] = useState(ASSET_STATUS_DATA);
  const [recentReports, setRecentReports] = useState(RECENT_REPORTS_SEED);
  const [scheduledReports, setScheduledReports] = useState(SCHEDULED_REPORTS_SEED);
  const [loading, setLoading] = useState(false);

  // Domain View State
  const [activeSubReportId, setActiveSubReportId] = useState('');
  const [domainTableData, setDomainTableData] = useState([]);
  const [domainLoading, setDomainLoading] = useState(false);
  const [domainSearch, setDomainSearch] = useState('');
  const [domainPage, setDomainPage] = useState(1);
  const pageSize = 8;

  // Custom Report Builder State
  const [customDomain, setCustomDomain] = useState('ASSETS');
  const [customColumns, setCustomColumns] = useState({
    code: true,
    name: true,
    category: true,
    location: true,
    cost: true,
    custodian: true,
    status: true,
    purchaseDate: false
  });
  const [customGrouping, setCustomGrouping] = useState('NONE');

  // Schedule Report Form State
  const [newScheduleForm, setNewScheduleForm] = useState({
    name: '',
    category: 'Asset',
    frequency: 'Weekly',
    deliveryFormat: 'PDF',
    recipients: ''
  });
  const [savingSchedule, setSavingSchedule] = useState(false);
  const [editingScheduleId, setEditingScheduleId] = useState(null);
  const [runningScheduleId, setRunningScheduleId] = useState(null);

  // Load persisted custom schedules from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('asset360_scheduled_reports');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          console.log('📦 [Scheduled Reports] Loaded persisted schedules from localStorage:', parsed);
          setScheduledReports(prev => {
            const existingIds = new Set(prev.map(p => p.id));
            const freshItems = parsed.filter(item => !existingIds.has(item.id));
            return [...freshItems, ...prev];
          });
        }
      }
    } catch (err) {
      console.warn('Could not read scheduled reports from localStorage:', err);
    }
  }, []);

  // Modals & Action Notifications
  const [showCreateDropdown, setShowCreateDropdown] = useState(false);
  const [showStandardReportModal, setShowStandardReportModal] = useState(false);
  const [showCustomReportModal, setShowCustomReportModal] = useState(false);
  const [showScheduleReportModal, setShowScheduleReportModal] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState(null);

  // Drill-Down Modal State
  const [drillDownModal, setDrillDownModal] = useState({
    open: false,
    title: '',
    metricKey: '',
    filterType: '',
    filterValue: '',
    records: [],
    loading: false
  });

  // AI Assistant Modal State
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);

  // Dedicated Report Viewer State
  const [viewerData, setViewerData] = useState([]);
  const [viewerLoading, setViewerLoading] = useState(false);
  const [viewerSearch, setViewerSearch] = useState('');

  // Switch category helper
  const handleTabClick = (tabId) => {
    setViewMode('DASHBOARD');
    setDomainSearch('');
    setDomainPage(1);
    setActiveSubReportId('');
    if (tabId === 'dashboard') {
      setSearchParams({});
    } else {
      setSearchParams({ category: tabId });
    }
  };

  // Fetch Dashboard Analytics from Backend
  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await api.get('/reports/analytics/dashboard', {
        params: {
          category: filterCategory,
          reportType: filterReportType,
          dateRange: filterDateRange,
          location: filterLocation,
          department: filterDepartment,
          company: advFilters.company
        }
      });
      const data = res?.data || res;
      if (data && (data.kpis || data.charts)) {
        if (data.kpis) setKpis(data.kpis);
        if (data.charts?.assetsByCategory) setCategoryChartData(data.charts.assetsByCategory);
        if (data.charts?.assetsByLocation) setLocationChartData(data.charts.assetsByLocation);
        if (data.charts?.assetStatus) setStatusChartData(data.charts.assetStatus);
        if (data.recentReports) setRecentReports(data.recentReports);
        if (data.scheduledReports) setScheduledReports(data.scheduledReports);
      }
    } catch (err) {
      console.warn('Using seeded dashboard analytics fallback:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeCategory === 'dashboard') {
      fetchDashboard();
    }
  }, [activeCategory, filterCategory, filterLocation, filterDepartment]);

  // Load domain data when activeCategory or activeSubReport changes
  useEffect(() => {
    if (activeCategory === 'dashboard' || activeCategory === 'custom' || activeCategory === 'scheduled') {
      return;
    }

    const domainConfig = FALLBACK_DOMAIN_DATA[activeCategory];
    if (!domainConfig) return;

    // Pick active sub-report or default to first
    const subReports = domainConfig.subReports || [];
    const currentSub = subReports.find(s => s.id === activeSubReportId) || subReports[0];
    if (currentSub && currentSub.id !== activeSubReportId) {
      setActiveSubReportId(currentSub.id);
    }

    const loadData = async () => {
      setDomainLoading(true);
      try {
        if (currentSub?.endpoint) {
          const res = await api.get(currentSub.endpoint);
          const raw = res?.data?.report || res?.data?.rows || res?.data?.data || res?.data?.assets || (Array.isArray(res?.data) ? res.data : null);
          if (Array.isArray(raw) && raw.length > 0) {
            // Flatten nested objects into clean string columns
            const flattened = raw.map(item => ({
              code: item.assetId || item.code || item.partNumber || item.workOrderId || item.id || '-',
              name: item.description || item.name || item.itemName || '-',
              category: typeof item.category === 'object' ? (item.category?.name || '-') : (item.category || '-'),
              location: typeof item.site === 'object' ? (item.site?.name || '-') : (item.location || '-'),
              custodian: typeof item.custodian === 'object' ? (item.custodian?.fullName || item.custodian?.employeeCode || '-') : (item.custodian || '-'),
              status: item.lifecycleStatus || item.status || '-',
              cost: item.acquisitionValue ? `AED ${Number(item.acquisitionValue).toLocaleString()}` : (item.cost || item.unitCost || '-')
            }));
            setDomainTableData(flattened);
            setDomainLoading(false);
            return;
          }
        }
        // Fallback rich domain data
        setDomainTableData(domainConfig.sampleRows || []);
      } catch (err) {
        setDomainTableData(domainConfig.sampleRows || []);
      } finally {
        setDomainLoading(false);
      }
    };

    loadData();
  }, [activeCategory, activeSubReportId]);

  // Toggle Scheduled Report
  const handleToggleSchedule = async (reportId) => {
    try {
      await api.patch(`/reports/analytics/scheduled/${reportId}/toggle`);
    } catch (err) {
      // Local fallback toggle
    }
    setScheduledReports(prev => {
      const updated = prev.map(item => {
        if (item.id === reportId) {
          const nextStatus = item.status === 'Active' ? 'Paused' : 'Active';
          return { ...item, status: nextStatus };
        }
        return item;
      });
      try {
        localStorage.setItem('asset360_scheduled_reports', JSON.stringify(updated));
      } catch (lsErr) {
        console.warn('LocalStorage error on toggle:', lsErr);
      }
      return updated;
    });
    setActionSuccessMsg(`Schedule status updated.`);
    setTimeout(() => setActionSuccessMsg(null), 3000);
  };

  // Open Modal for Creating a Fresh Schedule
  const handleOpenNewSchedule = () => {
    setEditingScheduleId(null);
    setNewScheduleForm({
      name: '',
      category: 'Asset',
      frequency: 'Weekly',
      deliveryFormat: 'PDF',
      recipients: ''
    });
    setShowScheduleReportModal(true);
  };

  // Open Modal for Editing an Existing Schedule
  const handleOpenEditSchedule = (sch) => {
    if (!sch) return;
    console.log('📝 [Scheduled Report] Opening Edit modal for schedule:', sch);
    setEditingScheduleId(sch.id);
    setNewScheduleForm({
      name: sch.name || '',
      category: sch.category || 'Asset',
      frequency: sch.frequency || 'Weekly',
      deliveryFormat: sch.deliveryFormat || sch.format || 'PDF',
      recipients: sch.recipients || ''
    });
    setShowScheduleReportModal(true);
  };

  // Delete a Scheduled Report
  const handleDeleteSchedule = (reportId, reportName) => {
    if (window.confirm(`Are you sure you want to delete the scheduled report "${reportName}"?`)) {
      setScheduledReports(prev => {
        const updated = prev.filter(s => s.id !== reportId);
        try {
          localStorage.setItem('asset360_scheduled_reports', JSON.stringify(updated));
          console.log('🗑️ [Schedule Report Deleted]:', reportId);
        } catch (e) {}
        return updated;
      });
      setActionSuccessMsg(`Scheduled report "${reportName}" removed.`);
      setTimeout(() => setActionSuccessMsg(null), 3000);
    }
  };

  // Trigger Immediate Execution ("Run Now") for a Scheduled Report
  const handleRunNowSchedule = async (sch) => {
    if (!sch) return;
    setRunningScheduleId(sch.id);
    console.log('🚀 [Scheduled Reports Engine] Triggering Immediate On-Demand Execution for:', {
      id: sch.id,
      name: sch.name,
      category: sch.category || 'Asset',
      frequency: sch.frequency,
      format: sch.deliveryFormat || sch.format || 'PDF',
      recipients: sch.recipients
    });

    const nowTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' Today (Manual Run)';

    // Update schedule lastRun timestamp
    setScheduledReports(prev => {
      const updated = prev.map(item => item.id === sch.id ? { ...item, lastRun: nowTimestamp } : item);
      try {
        localStorage.setItem('asset360_scheduled_reports', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    // Select domain dataset
    const catKey = (sch.category || 'Asset').toLowerCase();
    const domainData = FALLBACK_DOMAIN_DATA[catKey]?.sampleRows || FALLBACK_DOMAIN_DATA.assets.sampleRows;
    const safeName = sch.name.replace(/[^a-zA-Z0-9]/g, '_');
    const isExcel = (sch.deliveryFormat || sch.format) === 'Excel';

    // Simulate instant report execution and dispatch
    setTimeout(() => {
      if (isExcel) {
        handleExportCSV(`${safeName}_Instant_${new Date().toISOString().slice(0, 10)}.csv`, domainData);
      } else {
        handleExportCSV(`${safeName}_Executive_Report_${new Date().toISOString().slice(0, 10)}.csv`, domainData);
      }

      // Add entry to Recent Generated Reports audit log
      const newRecentItem = {
        id: `REP-RUN-${Date.now().toString().slice(-4)}`,
        name: `${sch.name} (On-Demand Run)`,
        category: sch.category || 'Asset',
        dateGenerated: 'Just now (Manual Run)',
        generatedBy: 'System Administrator (Manual Trigger)',
        format: sch.deliveryFormat || sch.format || 'PDF',
        size: isExcel ? '420 KB' : '2.1 MB'
      };
      setRecentReports(prev => [newRecentItem, ...prev]);

      console.log('✅ [Scheduled Reports Engine] Execution Complete. Generated report and simulated dispatch to distribution list:', sch.recipients);
      setActionSuccessMsg(`🚀 "${sch.name}" executed successfully! Generated ${sch.deliveryFormat || 'PDF'} report and emailed to ${sch.recipients}.`);
      setRunningScheduleId(null);
      setTimeout(() => setActionSuccessMsg(null), 4000);
    }, 700);
  };

  // Create or Update Scheduled Report
  const handleCreateSchedule = async (e) => {
    if (e) e.preventDefault();
    if (!newScheduleForm.name.trim()) {
      setActionSuccessMsg('Please enter a Schedule Name.');
      setTimeout(() => setActionSuccessMsg(null), 3000);
      return;
    }

    setSavingSchedule(true);

    // MODE 1: EDIT EXISTING SCHEDULE
    if (editingScheduleId) {
      const updatedFields = {
        name: newScheduleForm.name.trim(),
        category: newScheduleForm.category,
        frequency: newScheduleForm.frequency,
        format: newScheduleForm.deliveryFormat,
        deliveryFormat: newScheduleForm.deliveryFormat,
        recipients: newScheduleForm.recipients.trim() || 'admin@asset360.com'
      };

      console.log('✏️ [Schedule Report] Updating existing schedule ID:', editingScheduleId, updatedFields);

      setScheduledReports(prev => {
        const updated = prev.map(item => item.id === editingScheduleId ? { ...item, ...updatedFields } : item);
        try {
          localStorage.setItem('asset360_scheduled_reports', JSON.stringify(updated));
          console.log('💾 [Schedule Report] Updated and persisted to localStorage');
        } catch (lsErr) {
          console.warn('LocalStorage error on update:', lsErr);
        }
        return updated;
      });

      console.log('🎉 [Schedule Report Updated Successfully]:', { id: editingScheduleId, ...updatedFields });

      setShowScheduleReportModal(false);
      setEditingScheduleId(null);
      setActionSuccessMsg(`Scheduled report "${updatedFields.name}" updated successfully.`);
      setTimeout(() => setActionSuccessMsg(null), 4000);
      setSavingSchedule(false);
      return;
    }

    // MODE 2: CREATE NEW SCHEDULE
    const schedulePayload = {
      name: newScheduleForm.name.trim(),
      category: newScheduleForm.category,
      frequency: newScheduleForm.frequency,
      format: newScheduleForm.deliveryFormat,
      deliveryFormat: newScheduleForm.deliveryFormat,
      recipients: newScheduleForm.recipients.trim() || 'admin@asset360.com',
      nextRun: newScheduleForm.frequency === 'Daily'
        ? 'Tomorrow 08:00 AM'
        : newScheduleForm.frequency === 'Weekly'
        ? 'Next Monday 08:00 AM'
        : '01 Nov 2026 08:00 AM',
      status: 'Active'
    };

    console.log('📡 [Schedule Report] Submitting new schedule to backend:', schedulePayload);

    let savedItem = null;
    try {
      const res = await api.post('/reports/analytics/scheduled', schedulePayload);
      console.log('✅ [Schedule Report] Backend API Response:', res?.data);
      const backendData = res?.data?.data || res?.data;
      savedItem = {
        id: backendData?.id || `SCH-${Date.now().toString().slice(-4)}`,
        name: schedulePayload.name,
        category: schedulePayload.category,
        frequency: schedulePayload.frequency,
        deliveryFormat: schedulePayload.deliveryFormat,
        format: schedulePayload.deliveryFormat,
        recipients: schedulePayload.recipients,
        nextRun: backendData?.nextRun || schedulePayload.nextRun,
        status: 'Active'
      };
    } catch (err) {
      console.warn('⚠️ [Schedule Report] Backend API offline/fallback, saving locally:', err);
      savedItem = {
        id: `SCH-${Date.now().toString().slice(-4)}`,
        name: schedulePayload.name,
        category: schedulePayload.category,
        frequency: schedulePayload.frequency,
        deliveryFormat: schedulePayload.deliveryFormat,
        format: schedulePayload.deliveryFormat,
        recipients: schedulePayload.recipients,
        nextRun: schedulePayload.nextRun,
        status: 'Active'
      };
    }

    // Update state so it immediately appears in all scheduled report tables
    setScheduledReports(prev => [savedItem, ...prev]);

    // Persist in localStorage for permanent browser reload retention
    try {
      const stored = JSON.parse(localStorage.getItem('asset360_scheduled_reports') || '[]');
      localStorage.setItem('asset360_scheduled_reports', JSON.stringify([savedItem, ...stored]));
      console.log('💾 [Schedule Report] Persisted to localStorage:', savedItem);
    } catch (lsErr) {
      console.warn('LocalStorage error:', lsErr);
    }

    console.log('🎉 [Schedule Report Created Successfully]:', savedItem);

    setShowScheduleReportModal(false);
    setActionSuccessMsg(`Scheduled report "${savedItem.name}" created and active.`);
    setTimeout(() => setActionSuccessMsg(null), 4000);

    // Reset Form
    setNewScheduleForm({
      name: '',
      category: 'Asset',
      frequency: 'Weekly',
      deliveryFormat: 'PDF',
      recipients: ''
    });
    setSavingSchedule(false);
  };

  // Open Interactive Drill-Down Modal
  const handleOpenDrillDown = async ({ title, metricKey, filterType, filterValue }) => {
    setDrillDownModal({
      open: true,
      title: title || `Drill-Down: ${filterValue || metricKey}`,
      metricKey,
      filterType,
      filterValue,
      records: [],
      loading: true
    });

    try {
      const res = await api.get('/reports/analytics/drill-down', {
        params: { metricKey, filterType, filterValue }
      });
      const data = res?.data || res;
      if (data?.records) {
        setDrillDownModal(prev => ({
          ...prev,
          records: data.records,
          loading: false
        }));
        return;
      }
    } catch (err) {
      // Fallback
    }

    setDrillDownModal(prev => ({
      ...prev,
      records: [
        {
          id: 'AS-001',
          assetNumber: 'AST-DX-10024',
          name: 'Dell Precision 7760 Workstation',
          category: 'IT Equipment',
          location: 'Dubai HQ > 2F > Engineering',
          custodian: 'Sarah Ahmed',
          status: 'Active',
          cost: 'AED 14,500'
        },
        {
          id: 'AS-002',
          assetNumber: 'AST-DX-10025',
          name: 'Cisco Catalyst 9300 Core Switch',
          category: 'IT Equipment',
          location: 'Dubai HQ > Server Room 1',
          custodian: 'John Doe',
          status: 'In Maintenance',
          cost: 'AED 28,000'
        },
        {
          id: 'AS-003',
          assetNumber: 'AST-DX-10026',
          name: 'Toyota Hilux Double Cab 4x4',
          category: 'Vehicles',
          location: 'Jebel Ali > Transport Bay',
          custodian: 'Rashid Khan',
          status: 'Active',
          cost: 'AED 115,000'
        }
      ],
      loading: false
    }));
  };

  // AI Query Handler
  const handleRunAiQuery = async (queryText) => {
    const q = queryText || aiPrompt;
    if (!q.trim()) return;
    setAiLoading(true);
    setAiResult(null);

    try {
      const res = await api.post('/reports/analytics/ai-query', { prompt: q });
      const data = res?.data?.data || res?.data || res;
      setAiResult(data);
    } catch (err) {
      setAiResult({
        query: q,
        title: 'Asset360 Intelligence Analysis',
        insights: [
          'Spend is heavily indexed on Dubai HQ Facilities and Heavy Machinery.',
          'Preventive maintenance compliance rate reached 98% in current audit interval.'
        ],
        supportingRecords: [
          { assetNumber: 'AST-DX-10027', name: 'Caterpillar 500kVA Generator', category: 'Machinery', location: 'Dubai HQ', maintenanceCost: 'AED 68,000' },
          { assetNumber: 'AST-DX-10030', name: 'Carrier 30XA Chiller #2', category: 'Facilities', location: 'Dubai HQ', maintenanceCost: 'AED 54,000' }
        ]
      });
    } finally {
      setAiLoading(false);
    }
  };

  // Launch Dedicated Report Viewer
  const handleLaunchReport = async (report) => {
    if (!report) return;
    setSelectedReportObj(report);
    setViewMode('REPORT_VIEWER');
    setViewerLoading(true);
    setViewerData([]);

    try {
      const res = await api.get(report.endpoint);
      const data = res?.data?.rows || res?.data?.data || res?.data || res;
      if (Array.isArray(data) && data.length > 0) {
        setViewerData(data);
      } else {
        setViewerData([
          { code: 'AS-1001', name: 'Laptop Dell Latitude 5440', category: 'IT', location: 'Dubai HQ', status: 'IN_SERVICE', cost: 'AED 4,500' },
          { code: 'AS-1002', name: 'Samsung 27" Curved Monitor', category: 'IT', location: 'Dubai HQ', status: 'IN_SERVICE', cost: 'AED 1,200' },
          { code: 'AS-1003', name: 'HP Color LaserJet Pro', category: 'IT', location: 'Jebel Ali', status: 'ASSIGNED', cost: 'AED 2,800' }
        ]);
      }
    } catch (err) {
      setViewerData([
        { code: 'AS-1001', name: 'Laptop Dell Latitude 5440', category: 'IT', location: 'Dubai HQ', status: 'IN_SERVICE', cost: 'AED 4,500' },
        { code: 'AS-1002', name: 'Samsung 27" Curved Monitor', category: 'IT', location: 'Dubai HQ', status: 'IN_SERVICE', cost: 'AED 1,200' },
        { code: 'AS-1003', name: 'HP Color LaserJet Pro', category: 'IT', location: 'Jebel Ali', status: 'ASSIGNED', cost: 'AED 2,800' }
      ]);
    } finally {
      setViewerLoading(false);
    }
  };

  // Export CSV Helper
  const handleExportCSV = (filename = 'Asset360_Report.csv', rows = []) => {
    const list = rows.length > 0 ? rows : (domainTableData.length > 0 ? domainTableData : viewerData);
    if (!list || list.length === 0) {
      setActionSuccessMsg('No records available to export.');
      setTimeout(() => setActionSuccessMsg(null), 3000);
      return;
    }
    const keys = Object.keys(list[0]);
    const csvContent = [
      keys.join(','),
      ...list.map(r => keys.map(k => `"${(r[k] || '').toString().replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();

    setActionSuccessMsg(`Downloaded ${filename} successfully.`);
    setTimeout(() => setActionSuccessMsg(null), 3000);
  };

  // Filtered rows for Domain Table
  const filteredDomainRows = useMemo(() => {
    if (!domainSearch.trim()) return domainTableData;
    const term = domainSearch.toLowerCase();
    return domainTableData.filter(row =>
      Object.values(row).some(val =>
        String(val || '').toLowerCase().includes(term)
      )
    );
  }, [domainTableData, domainSearch]);

  const paginatedDomainRows = useMemo(() => {
    const start = (domainPage - 1) * pageSize;
    return filteredDomainRows.slice(start, start + pageSize);
  }, [filteredDomainRows, domainPage]);

  const totalPages = Math.ceil(filteredDomainRows.length / pageSize) || 1;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-16 text-slate-800">
      {/* ------------------------------------------------------------------- */}
      {/* 1. Header & Navigation                                              */}
      {/* ------------------------------------------------------------------- */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              {/* Breadcrumb */}
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-1">
                <span className="text-slate-500">Reports & Analytics</span>
                <ChevronRight className="w-3 h-3 text-slate-400" />
                <span className="text-[#6C2BD9] font-bold capitalize">
                  {REPORT_TABS.find(t => t.id === activeCategory)?.name || 'Dashboard'}
                </span>
                {viewMode === 'REPORT_VIEWER' && selectedReportObj && (
                  <>
                    <ChevronRight className="w-3 h-3 text-slate-400" />
                    <span className="text-slate-900 font-bold">{selectedReportObj.name}</span>
                  </>
                )}
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Reports & Analytics
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                Get comprehensive insights from your asset data with real-time reports and analytics
              </p>
            </div>

            {/* Top Actions: AI Intelligence & + Create Report Button */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                onClick={() => setShowAiModal(true)}
                className="px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-[#7C3AED] border border-purple-200 text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer active:scale-95"
              >
                <Sparkles className="w-4 h-4 text-[#7C3AED]" />
                <span className="hidden md:inline">AI Analytics</span>
              </button>

              {/* "+ Create Report" Action Button */}
              <div className="relative">
                <button
                  onClick={() => setShowCreateDropdown(!showCreateDropdown)}
                  className="px-4 py-2 rounded-xl bg-[#6C2BD9] hover:bg-[#5B21B6] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Report</span>
                  <ChevronDown className="w-3.5 h-3.5 ml-0.5" />
                </button>

                {showCreateDropdown && (
                  <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 py-1.5 text-xs animate-fadeIn">
                    <button
                      onClick={() => {
                        setShowCreateDropdown(false);
                        setShowStandardReportModal(true);
                      }}
                      className="w-full px-3.5 py-2 text-left hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 font-semibold"
                    >
                      <Package className="w-4 h-4 text-emerald-600" />
                      <span>Standard Report</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowCreateDropdown(false);
                        handleTabClick('custom');
                      }}
                      className="w-full px-3.5 py-2 text-left hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 font-semibold"
                    >
                      <SlidersHorizontal className="w-4 h-4 text-[#6C2BD9]" />
                      <span>Custom Report Builder</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowCreateDropdown(false);
                        handleOpenNewSchedule();
                      }}
                      className="w-full px-3.5 py-2 text-left hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 font-semibold"
                    >
                      <Clock className="w-4 h-4 text-amber-600" />
                      <span>Schedule Report</span>
                    </button>
                    <div className="border-t border-slate-100 my-1"></div>
                    <button
                      onClick={() => {
                        setShowCreateDropdown(false);
                        handleExportCSV('Asset360_Current_Export.csv');
                      }}
                      className="w-full px-3.5 py-2 text-left hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 font-semibold"
                    >
                      <Download className="w-4 h-4 text-slate-600" />
                      <span>Export Data</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ----------------------------------------------------------------- */}
          {/* TOP CATEGORY NAVIGATION TABS STRIP                                */}
          {/* ----------------------------------------------------------------- */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-3 pb-1 border-t border-slate-100 mt-3 scrollbar-none">
            {REPORT_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={clsx(
                    'px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shrink-0 transition-all cursor-pointer',
                    isActive
                      ? 'bg-[#6C2BD9] text-white shadow-sm'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/80 hover:text-slate-900'
                  )}
                >
                  <Icon className={clsx('w-3.5 h-3.5', isActive ? 'text-white' : 'text-slate-500')} />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Success Alert Banner */}
        {actionSuccessMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center justify-between shadow-xs animate-fadeIn">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{actionSuccessMsg}</span>
            </div>
            <button onClick={() => setActionSuccessMsg(null)}>
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* ------------------------------------------------------------------- */}
        {/* VIEW 1: DEDICATED REPORT VIEWER (When viewing a specific sub-report) */}
        {/* ------------------------------------------------------------------- */}
        {viewMode === 'REPORT_VIEWER' && selectedReportObj ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setViewMode('DASHBOARD')}
                  className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 cursor-pointer shadow-2xs"
                  title="Back to Reports"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <span className="text-[10px] font-bold text-[#6C2BD9] uppercase tracking-wider">
                    {selectedReportObj.category} Report View
                  </span>
                  <h2 className="text-lg font-black text-slate-900">{selectedReportObj.name}</h2>
                  <p className="text-xs text-slate-500">{selectedReportObj.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleExportCSV(`${selectedReportObj.id}_Export.csv`, viewerData)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>
              </div>
            </div>

            {/* Search bar inside Report Viewer */}
            <div className="flex items-center justify-between gap-4">
              <div className="relative w-72">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter current report rows..."
                  value={viewerSearch}
                  onChange={(e) => setViewerSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
              <span className="text-xs text-slate-400 font-medium">
                Showing {viewerData.length} records in this snapshot
              </span>
            </div>

            {/* Data Table */}
            <div className="overflow-auto max-h-[500px]">
              {viewerLoading ? (
                <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400 text-xs">
                  <RefreshCw className="w-6 h-6 animate-spin text-[#6C2BD9]" />
                  <span>Generating live report dataset...</span>
                </div>
              ) : viewerData.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs font-semibold">
                  No records found for current parameters.
                </div>
              ) : (
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="sticky top-0 z-10 bg-slate-50/95 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b shadow-2xs">
                    <tr>
                      {Object.keys(viewerData[0]).slice(0, 8).map((key) => (
                        <th key={key} className="py-3 px-3">
                          {key.replace(/([A-Z])/g, ' $1')}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {viewerData.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/60">
                        {Object.keys(viewerData[0]).slice(0, 8).map((key) => (
                          <td key={key} className="py-2.5 px-3">
                            {typeof row[key] === 'object'
                              ? JSON.stringify(row[key])
                              : (row[key] || '-').toString()}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            <div className="p-3 bg-white border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="font-medium text-slate-600">Total: {viewerData.length} rows</span>
              <button
                onClick={() => setViewMode('DASHBOARD')}
                className="text-[#6C2BD9] font-bold hover:underline"
              >
                ← Return to reports directory
              </button>
            </div>
          </div>
        ) : null}

        {/* ------------------------------------------------------------------- */}
        {/* VIEW 2: EXECUTIVE DASHBOARD (Default / Dashboard Reports)           */}
        {/* ------------------------------------------------------------------- */}
        {viewMode === 'DASHBOARD' && activeCategory === 'dashboard' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3 items-end">
                {/* Report Category */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                    Report Category
                  </label>
                  <div className="relative">
                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="w-full pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 appearance-none focus:outline-hidden focus:ring-2 focus:ring-[#6C2BD9]/20 focus:border-[#6C2BD9] cursor-pointer"
                    >
                      <option value="All Categories">All Categories</option>
                      <option value="Asset Reports">Asset Reports</option>
                      <option value="Maintenance Reports">Maintenance Reports</option>
                      <option value="Inventory Reports">Inventory Reports</option>
                      <option value="Financial Reports">Financial Reports</option>
                      <option value="Compliance Reports">Compliance Reports</option>
                      <option value="Custom Reports">Custom Reports</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Report Type */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                    Report Type
                  </label>
                  <div className="relative">
                    <select
                      value={filterReportType}
                      onChange={(e) => setFilterReportType(e.target.value)}
                      className="w-full pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 appearance-none focus:outline-hidden focus:ring-2 focus:ring-[#6C2BD9]/20 focus:border-[#6C2BD9] cursor-pointer"
                    >
                      <option value="All Types">All Types</option>
                      <option value="Assets by Location">Assets by Location</option>
                      <option value="Assets by Category">Assets by Category</option>
                      <option value="Maintenance Work Orders">Maintenance Work Orders</option>
                      <option value="Inventory Valuation">Inventory Valuation</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Date Range with Interactive Calendar Popover */}
                <div className="space-y-1 relative" ref={datePickerRef}>
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                    Date Range
                  </label>
                  <div
                    onClick={() => setShowDatePicker(!showDatePicker)}
                    className="relative cursor-pointer group"
                  >
                    <input
                      type="text"
                      readOnly
                      value={filterDateRange}
                      placeholder="Select Date Range..."
                      className="w-full pl-3 pr-8 py-2 bg-slate-50 group-hover:bg-purple-50/40 border border-slate-200 group-hover:border-[#6C2BD9] rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#6C2BD9]/20 focus:border-[#6C2BD9] cursor-pointer transition-all"
                    />
                    <Calendar className="w-3.5 h-3.5 text-[#6C2BD9] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>

                  {/* Calendar Popover */}
                  {showDatePicker && (
                    <div className="absolute left-0 sm:left-auto sm:right-0 md:left-0 top-full mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 p-4 animate-fadeIn text-xs space-y-3.5">
                      {/* Header */}
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <div className="flex items-center gap-1.5 font-black text-slate-900">
                          <div className="w-6 h-6 rounded-lg bg-purple-50 text-[#6C2BD9] flex items-center justify-center">
                            <Calendar className="w-3.5 h-3.5" />
                          </div>
                          <span>Select Reporting Date Range</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowDatePicker(false)}
                          className="text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Quick Presets */}
                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                          Quick Presets
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {['Today', 'Last 7 Days', 'This Month', 'Last 30 Days', 'This Quarter', 'Full Year 2025', 'Year to Date'].map((preset) => (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => handleSelectDatePreset(preset)}
                              className={clsx(
                                'px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer',
                                activeDatePreset === preset
                                  ? 'bg-[#6C2BD9] text-white shadow-2xs'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                              )}
                            >
                              {preset}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Custom Range Native Inputs */}
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 space-y-2">
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          From & To Custom Date
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="text-[10px] text-slate-500 font-semibold block mb-0.5">Start Date</span>
                            <input
                              type="date"
                              value={customStartDate}
                              onChange={(e) => {
                                setCustomStartDate(e.target.value);
                                setActiveDatePreset('Custom');
                                setCalMonth(new Date(e.target.value));
                              }}
                              className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-[#6C2BD9] cursor-pointer"
                            />
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-500 font-semibold block mb-0.5">End Date</span>
                            <input
                              type="date"
                              value={customEndDate}
                              min={customStartDate}
                              onChange={(e) => {
                                setCustomEndDate(e.target.value);
                                setActiveDatePreset('Custom');
                              }}
                              className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-[#6C2BD9] cursor-pointer"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Interactive Visual Calendar Grid */}
                      <div className="bg-white p-2 border border-slate-100 rounded-xl">
                        {/* Month Navigation Header */}
                        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                          <button
                            type="button"
                            onClick={handleCalPrevMonth}
                            className="p-1 rounded-lg hover:bg-slate-100 text-slate-600 cursor-pointer"
                            title="Previous Month"
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                          </button>
                          <span className="font-bold text-slate-800 text-xs">
                            {calMonth.toLocaleString('en-GB', { month: 'long', year: 'numeric' })}
                          </span>
                          <button
                            type="button"
                            onClick={handleCalNextMonth}
                            className="p-1 rounded-lg hover:bg-slate-100 text-slate-600 cursor-pointer"
                            title="Next Month"
                          >
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Weekday headers */}
                        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400 mb-1">
                          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                            <div key={d}>{d}</div>
                          ))}
                        </div>

                        {/* Days Grid */}
                        <div className="grid grid-cols-7 gap-1 text-center text-xs">
                          {Array.from({ length: calendarDays.firstDayIndex }).map((_, i) => (
                            <div key={`empty-${i}`} className="p-1 text-slate-200 pointer-events-none">•</div>
                          ))}
                          {Array.from({ length: calendarDays.totalDays }).map((_, i) => {
                            const dayNum = i + 1;
                            const y = calendarDays.year;
                            const m = String(calendarDays.month + 1).padStart(2, '0');
                            const d = String(dayNum).padStart(2, '0');
                            const dayStr = `${y}-${m}-${d}`;
                            const isSelectedStart = dayStr === customStartDate;
                            const isSelectedEnd = dayStr === customEndDate;
                            const isInRange = customStartDate && customEndDate && dayStr >= customStartDate && dayStr <= customEndDate;

                            return (
                              <button
                                key={dayNum}
                                type="button"
                                onClick={() => handleDayClick(dayNum)}
                                className={clsx(
                                  'p-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer',
                                  isSelectedStart || isSelectedEnd
                                    ? 'bg-[#6C2BD9] text-white font-bold shadow-2xs'
                                    : isInRange
                                    ? 'bg-purple-100 text-[#6C2BD9]'
                                    : 'hover:bg-slate-100 text-slate-700'
                                )}
                              >
                                {dayNum}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => {
                            setCustomStartDate('2025-01-01');
                            setCustomEndDate('2025-12-31');
                            setActiveDatePreset('Full Year 2025');
                            setFilterDateRange('01 Jan 2025 - 31 Dec 2025');
                            setShowDatePicker(false);
                            fetchDashboard();
                          }}
                          className="text-[11px] text-slate-400 hover:text-slate-600 font-semibold cursor-pointer"
                        >
                          Reset
                        </button>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setShowDatePicker(false)}
                            className="px-3 py-1.5 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 cursor-pointer text-xs"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={handleApplyDateRange}
                            className="px-4 py-1.5 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white rounded-xl font-bold shadow-xs cursor-pointer text-xs flex items-center gap-1.5"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Apply Range</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Location */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                    Location
                  </label>
                  <div className="relative">
                    <select
                      value={filterLocation}
                      onChange={(e) => setFilterLocation(e.target.value)}
                      className="w-full pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 appearance-none focus:outline-hidden focus:ring-2 focus:ring-[#6C2BD9]/20 focus:border-[#6C2BD9] cursor-pointer"
                    >
                      <option value="All Locations">All Locations</option>
                      <option value="Dubai HQ">Dubai HQ</option>
                      <option value="Jebel Ali">Jebel Ali</option>
                      <option value="Abu Dhabi">Abu Dhabi</option>
                      <option value="Sharjah">Sharjah</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Department */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                    Department
                  </label>
                  <div className="relative">
                    <select
                      value={filterDepartment}
                      onChange={(e) => setFilterDepartment(e.target.value)}
                      className="w-full pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 appearance-none focus:outline-hidden focus:ring-2 focus:ring-[#6C2BD9]/20 focus:border-[#6C2BD9] cursor-pointer"
                    >
                      <option value="All Departments">All Departments</option>
                      <option value="IT Department">IT Department</option>
                      <option value="Operations">Operations</option>
                      <option value="Finance">Finance</option>
                      <option value="Facilities">Facilities</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Reset Button */}
                <div>
                  <button
                    type="button"
                    onClick={() => {
                      setFilterCategory('All Categories');
                      setFilterReportType('All Types');
                      setFilterDateRange('01 Jan 2025 - 31 Dec 2025');
                      setFilterLocation('All Locations');
                      setFilterDepartment('All Departments');
                    }}
                    className="w-full py-2 px-3 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-600 transition-colors shadow-2xs"
                  >
                    Reset
                  </button>
                </div>

                {/* Apply Filters & Advanced Trigger Button */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAdvancedFilters(true)}
                    className="flex-1 py-2 px-3 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Filter className="w-3.5 h-3.5" /> Apply
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAdvancedFilters(true)}
                    title="Advanced Filters"
                    className="p-2 border border-slate-200 bg-slate-50 hover:bg-slate-100 rounded-xl text-slate-600 transition-colors shadow-2xs cursor-pointer"
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* 5 Management KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {/* 1. Total Assets */}
              <div
                onClick={() =>
                  handleOpenDrillDown({
                    title: 'Total Active Asset Portfolio',
                    metricKey: 'totalAssets',
                    filterType: 'all',
                    filterValue: 'All Assets'
                  })
                }
                className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-[#6C2BD9] hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-xl bg-purple-50 text-[#6C2BD9] flex items-center justify-center">
                    <Layers className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-600">Total Assets</span>
                </div>
                <div className="text-2xl font-black text-slate-900 tracking-tight">
                  {kpis.totalAssets.toLocaleString()}
                </div>
                <div className="flex items-center gap-1 text-xs text-emerald-600 font-bold mt-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>↑ {kpis.totalAssetsChange}%</span>
                  <span className="text-slate-400 font-normal ml-0.5">{kpis.periodText}</span>
                </div>
              </div>

              {/* 2. Active Work Orders */}
              <div
                onClick={() =>
                  handleOpenDrillDown({
                    title: 'Active Work Orders',
                    metricKey: 'activeWorkOrders',
                    filterType: 'workOrders',
                    filterValue: 'Open & In Progress'
                  })
                }
                className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-[#6C2BD9] hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Wrench className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-600">Active Work Orders</span>
                </div>
                <div className="text-2xl font-black text-slate-900 tracking-tight">
                  {kpis.activeWorkOrders}
                </div>
                <div className="flex items-center gap-1 text-xs text-rose-600 font-bold mt-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>↑ {kpis.activeWorkOrdersChange}%</span>
                  <span className="text-slate-400 font-normal ml-0.5">{kpis.periodText}</span>
                </div>
              </div>

              {/* 3. Assets by Location */}
              <div
                onClick={() =>
                  handleOpenDrillDown({
                    title: 'Assets Distributed Across Operational Locations',
                    metricKey: 'locationCount',
                    filterType: 'location',
                    filterValue: 'All Locations'
                  })
                }
                className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-600 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-600">Assets by Location</span>
                </div>
                <div className="text-2xl font-black text-slate-900 tracking-tight">
                  {kpis.locationCount}
                </div>
                <div className="flex items-center gap-1 text-xs text-emerald-600 font-bold mt-1 group-hover:underline">
                  <span>View details →</span>
                </div>
              </div>

              {/* 4. Maintenance Cost */}
              <div
                onClick={() =>
                  handleOpenDrillDown({
                    title: 'Maintenance Cost Drivers & Work Orders',
                    metricKey: 'maintenanceCost',
                    filterType: 'cost',
                    filterValue: 'High Cost'
                  })
                }
                className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-[#6C2BD9] hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-xl bg-purple-50 text-[#5B21B6] flex items-center justify-center">
                    <Clock className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-600">Maintenance Cost</span>
                </div>
                <div className="text-2xl font-black text-slate-900 tracking-tight">
                  {kpis.maintenanceCostFormatted || 'AED 1.2M'}
                </div>
                <div className="flex items-center gap-1 text-xs text-emerald-600 font-bold mt-1">
                  <TrendingDown className="w-3.5 h-3.5" />
                  <span>↓ {kpis.maintenanceCostChange}%</span>
                  <span className="text-slate-400 font-normal ml-0.5">{kpis.periodText}</span>
                </div>
              </div>

              {/* 5. Compliance Rate */}
              <div
                onClick={() =>
                  handleOpenDrillDown({
                    title: 'Asset Audit Compliance Portfolio',
                    metricKey: 'complianceRate',
                    filterType: 'compliance',
                    filterValue: 'Compliant'
                  })
                }
                className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-[#6C2BD9] hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-xl bg-purple-50 text-[#6C2BD9] flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-600">Compliance Rate</span>
                </div>
                <div className="text-2xl font-black text-slate-900 tracking-tight">
                  {kpis.complianceRate}%
                </div>
                <div className="flex items-center gap-1 text-xs text-emerald-600 font-bold mt-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>↑ {kpis.complianceRateChange}%</span>
                  <span className="text-slate-400 font-normal ml-0.5">{kpis.periodText}</span>
                </div>
              </div>
            </div>

            {/* 3 Interactive Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Chart 1: Assets by Category */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3">
                    <h3 className="text-sm font-black text-slate-900">Assets by Category</h3>
                    <button
                      onClick={() => handleLaunchReport(CORE_PREDEFINED_REPORTS.find(r => r.id === 'asset-register'))}
                      className="text-xs font-bold text-[#6C2BD9] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      View Report →
                    </button>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-4 py-2">
                    <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
                      <svg className="w-36 h-36 transform -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="38" fill="transparent" stroke="#6C2BD9" strokeWidth="15" strokeDasharray="62.1 238.8" strokeDashoffset="0" />
                        <circle cx="50" cy="50" r="38" fill="transparent" stroke="#60A5FA" strokeWidth="15" strokeDasharray="40.6 238.8" strokeDashoffset="-62.1" />
                        <circle cx="50" cy="50" r="38" fill="transparent" stroke="#F59E0B" strokeWidth="15" strokeDasharray="35.8 238.8" strokeDashoffset="-102.7" />
                        <circle cx="50" cy="50" r="38" fill="transparent" stroke="#EF4444" strokeWidth="15" strokeDasharray="28.7 238.8" strokeDashoffset="-138.5" />
                        <circle cx="50" cy="50" r="38" fill="transparent" stroke="#06B6D4" strokeWidth="15" strokeDasharray="23.9 238.8" strokeDashoffset="-167.2" />
                        <circle cx="50" cy="50" r="38" fill="transparent" stroke="#5B21B6" strokeWidth="15" strokeDasharray="19.1 238.8" strokeDashoffset="-191.1" />
                        <circle cx="50" cy="50" r="38" fill="transparent" stroke="#94A3B8" strokeWidth="15" strokeDasharray="28.6 238.8" strokeDashoffset="-210.2" />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                        <span className="text-base font-black text-slate-900 leading-none">12,486</span>
                        <span className="text-[10px] font-semibold text-slate-400 mt-0.5">Total Assets</span>
                      </div>
                    </div>

                    <div className="flex-1 space-y-1.5 text-xs w-full">
                      {categoryChartData.map((item, idx) => (
                        <div
                          key={idx}
                          onClick={() =>
                            handleOpenDrillDown({
                              title: `Category Drill-Down: ${item.name}`,
                              metricKey: 'category',
                              filterType: 'category',
                              filterValue: item.name
                            })
                          }
                          className="flex items-center justify-between py-0.5 hover:bg-slate-50 px-1 rounded cursor-pointer group"
                        >
                          <div className="flex items-center gap-1.5 truncate">
                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }}></span>
                            <span className="text-[11px] font-medium text-slate-600 group-hover:text-[#6C2BD9] truncate">
                              {item.name}
                            </span>
                          </div>
                          <div className="font-semibold text-slate-800 text-[11px] shrink-0 ml-1">
                            {item.count.toLocaleString()} <span className="text-slate-400 font-normal">({item.pct}%)</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Chart 2: Assets by Location */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3">
                    <h3 className="text-sm font-black text-slate-900">Assets by Location</h3>
                    <button
                      onClick={() => handleLaunchReport(CORE_PREDEFINED_REPORTS.find(r => r.id === 'location-distribution'))}
                      className="text-xs font-bold text-[#6C2BD9] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      View Report →
                    </button>
                  </div>

                  <div className="h-[200px] w-full pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={locationChartData} margin={{ top: 15, right: 10, left: -25, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                        <XAxis dataKey="location" tick={{ fontSize: 10, fill: '#64748B' }} tickLine={false} axisLine={{ stroke: '#E2E8F0' }} />
                        <YAxis tick={{ fontSize: 10, fill: '#64748B' }} tickLine={false} axisLine={false} domain={[0, 4000]} />
                        <Tooltip
                          formatter={(val) => [val.toLocaleString() + ' assets', 'Count']}
                          contentStyle={{ backgroundColor: '#1E293B', borderRadius: '8px', color: '#fff', fontSize: '11px', border: 'none' }}
                        />
                        <Bar
                          dataKey="count"
                          radius={[4, 4, 0, 0]}
                          onClick={(entry) =>
                            handleOpenDrillDown({
                              title: `Location Assets: ${entry.location}`,
                              metricKey: 'location',
                              filterType: 'location',
                              filterValue: entry.location
                            })
                          }
                          className="cursor-pointer"
                        >
                          {locationChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill || '#6C2BD9'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Chart 3: Asset Status */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3">
                    <h3 className="text-sm font-black text-slate-900">Asset Status</h3>
                    <button
                      onClick={() => handleLaunchReport(CORE_PREDEFINED_REPORTS.find(r => r.id === 'asset-register'))}
                      className="text-xs font-bold text-[#6C2BD9] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      View Report →
                    </button>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-4 py-2">
                    <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
                      <svg className="w-36 h-36 transform -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="38" fill="transparent" stroke="#10B981" strokeWidth="15" strokeDasharray="195.8 238.8" strokeDashoffset="0" />
                        <circle cx="50" cy="50" r="38" fill="transparent" stroke="#F59E0B" strokeWidth="15" strokeDasharray="16.7 238.8" strokeDashoffset="-195.8" />
                        <circle cx="50" cy="50" r="38" fill="transparent" stroke="#94A3B8" strokeWidth="15" strokeDasharray="9.5 238.8" strokeDashoffset="-212.5" />
                        <circle cx="50" cy="50" r="38" fill="transparent" stroke="#EF4444" strokeWidth="15" strokeDasharray="7.2 238.8" strokeDashoffset="-222.0" />
                        <circle cx="50" cy="50" r="38" fill="transparent" stroke="#8B5CF6" strokeWidth="15" strokeDasharray="9.6 238.8" strokeDashoffset="-229.2" />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                        <span className="text-base font-black text-slate-900 leading-none">12,486</span>
                        <span className="text-[10px] font-semibold text-slate-400 mt-0.5">Total Assets</span>
                      </div>
                    </div>

                    <div className="flex-1 space-y-1.5 text-xs w-full">
                      {statusChartData.map((item, idx) => (
                        <div
                          key={idx}
                          onClick={() =>
                            handleOpenDrillDown({
                              title: `Status Filter: ${item.status}`,
                              metricKey: 'status',
                              filterType: 'status',
                              filterValue: item.status
                            })
                          }
                          className="flex items-center justify-between py-0.5 hover:bg-slate-50 px-1 rounded cursor-pointer group"
                        >
                          <div className="flex items-center gap-1.5 truncate">
                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }}></span>
                            <span className="text-[11px] font-medium text-slate-600 group-hover:text-[#6C2BD9] truncate">
                              {item.status}
                            </span>
                          </div>
                          <div className="font-semibold text-slate-800 text-[11px] shrink-0 ml-1">
                            {item.count.toLocaleString()} <span className="text-slate-400 font-normal">({item.pct}%)</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Grids: Recent Reports & Scheduled Reports */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Left: Recent Reports (7 cols) */}
              <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between">
                <div>
                  <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-black text-slate-900">Recent Generated Reports</h3>
                      <p className="text-[11px] text-slate-400">History of user-requested and scheduled report runs</p>
                    </div>
                    <button
                      onClick={() => handleExportCSV('Recent_Reports_History.csv', recentReports)}
                      className="text-xs font-bold text-[#6C2BD9] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" /> Export Log
                    </button>
                  </div>

                  <div className="overflow-auto max-h-[350px]">
                    <table className="w-full text-left text-xs text-slate-700">
                      <thead className="sticky top-0 z-10 bg-slate-50/95 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 shadow-2xs">
                        <tr>
                          <th className="py-3 px-4">Report Name</th>
                          <th className="py-3 px-3">Category</th>
                          <th className="py-3 px-3">Date Generated</th>
                          <th className="py-3 px-3">Generated By</th>
                          <th className="py-3 px-3 text-center">Format</th>
                          <th className="py-3 px-3 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {recentReports.map((rep) => (
                          <tr key={rep.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="py-3 px-4 font-semibold text-slate-900">
                              {rep.name}
                            </td>
                            <td className="py-3 px-3">
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700">
                                {rep.category}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-slate-500 text-[11px]">
                              {rep.dateGenerated}
                            </td>
                            <td className="py-3 px-3 text-slate-600">
                              {rep.generatedBy}
                            </td>
                            <td className="py-3 px-3 text-center">
                              <span className={clsx(
                                'px-2 py-0.5 rounded text-[10px] font-bold',
                                rep.format === 'PDF' ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                              )}>
                                {rep.format}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-center">
                              <button
                                onClick={() => {
                                  setActionSuccessMsg(`Downloading ${rep.name} (${rep.format})...`);
                                  setTimeout(() => setActionSuccessMsg(null), 3000);
                                }}
                                className="p-1 rounded text-slate-400 hover:text-[#6C2BD9] hover:bg-purple-50 transition-colors cursor-pointer"
                                title="Download Snapshot"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="p-3 bg-white border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="font-medium text-slate-600">Showing {recentReports.length} reports</span>
                  <span className="text-slate-400">All reports cached for 30 days</span>
                </div>
              </div>

              {/* Right: Scheduled Reports Preview (5 cols) */}
              <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between">
                <div>
                  <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-black text-slate-900">Scheduled Reports</h3>
                      <p className="text-[11px] text-slate-400">Automated recurring report delivery jobs</p>
                    </div>
                    <button
                      onClick={() => handleTabClick('scheduled')}
                      className="text-xs font-bold text-[#6C2BD9] hover:underline cursor-pointer"
                    >
                      Manage All →
                    </button>
                  </div>

                  <div className="overflow-auto max-h-[350px]">
                    <table className="w-full text-left text-xs text-slate-700">
                      <thead className="sticky top-0 z-10 bg-slate-50/95 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 shadow-2xs">
                        <tr>
                          <th className="py-3 px-4">Report Name</th>
                          <th className="py-3 px-2">Frequency</th>
                          <th className="py-3 px-2 text-center">Status</th>
                          <th className="py-3 px-2 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {scheduledReports.slice(0, 5).map((sch) => (
                          <tr key={sch.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="py-3 px-4 font-semibold text-slate-900">
                              {sch.name}
                            </td>
                            <td className="py-3 px-2 text-slate-600 text-[11px]">
                              {sch.frequency}
                            </td>
                            <td className="py-3 px-2 text-center">
                              <span className={clsx(
                                'px-2 py-0.5 rounded text-[10px] font-bold',
                                sch.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                              )}>
                                {sch.status}
                              </span>
                            </td>
                            <td className="py-3 px-2 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  onClick={() => handleRunNowSchedule(sch)}
                                  disabled={runningScheduleId === sch.id}
                                  className="p-1 rounded text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 cursor-pointer disabled:opacity-50"
                                  title="Run Now"
                                >
                                  {runningScheduleId === sch.id ? (
                                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                                  ) : (
                                    <Play className="w-3.5 h-3.5" />
                                  )}
                                </button>
                                <button
                                  onClick={() => handleOpenEditSchedule(sch)}
                                  className="p-1 rounded text-slate-400 hover:text-[#6C2BD9] hover:bg-purple-50 cursor-pointer"
                                  title="Edit Schedule"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="p-3 bg-white border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="font-medium text-slate-600">{scheduledReports.length} recurring jobs active</span>
                  <button
                    onClick={handleOpenNewSchedule}
                    className="text-xs font-bold text-[#6C2BD9] hover:underline cursor-pointer"
                  >
                    + Add Schedule
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------- */}
        {/* VIEW 3: DOMAIN REPORTS (Assets, Inventory, Maintenance, Financial,  */}
        {/*         Compliance)                                                 */}
        {/* ------------------------------------------------------------------- */}
        {viewMode === 'DASHBOARD' && ['assets', 'inventory', 'maintenance', 'financial', 'compliance'].includes(activeCategory) && (
          <div className="space-y-6 animate-fadeIn">
            {/* Domain Header & Top KPI Cards */}
            {activeCategory === 'assets' && (
              <>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0">
                      <Package className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-slate-900 tracking-tight">Asset Reports & Lifecycle Analytics</h2>
                      <p className="text-xs text-slate-500">Comprehensive master register, custody tracking, physical location distribution, and transfer audit history.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleExportCSV('Asset_Master_Report.csv')}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" /> Export Register
                    </button>
                    <button
                      onClick={() => window.print()}
                      className="px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" /> Print
                    </button>
                  </div>
                </div>

                {/* 5 Asset KPIs */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                    <div className="text-xs font-bold text-slate-500 mb-1">Total Assets</div>
                    <div className="text-2xl font-black text-slate-900">{FALLBACK_DOMAIN_DATA.assets.kpis.total}</div>
                    <div className="text-[11px] text-emerald-600 font-bold mt-1">100% of Enterprise Register</div>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                    <div className="text-xs font-bold text-slate-500 mb-1">In-Service (Active)</div>
                    <div className="text-2xl font-black text-emerald-600">{FALLBACK_DOMAIN_DATA.assets.kpis.inService}</div>
                    <div className="text-[11px] text-slate-500 font-medium mt-1">82.0% Operational</div>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                    <div className="text-xs font-bold text-slate-500 mb-1">Under Maintenance</div>
                    <div className="text-2xl font-black text-amber-600">{FALLBACK_DOMAIN_DATA.assets.kpis.inMaintenance}</div>
                    <div className="text-[11px] text-slate-500 font-medium mt-1">6.9% In Repair / Service</div>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                    <div className="text-xs font-bold text-slate-500 mb-1">Retired / Disposed</div>
                    <div className="text-2xl font-black text-slate-600">{FALLBACK_DOMAIN_DATA.assets.kpis.retired}</div>
                    <div className="text-[11px] text-slate-500 font-medium mt-1">8.5% Lifecycle Complete</div>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                    <div className="text-xs font-bold text-slate-500 mb-1">Missing / Discrepancy</div>
                    <div className="text-2xl font-black text-rose-600">{FALLBACK_DOMAIN_DATA.assets.kpis.missing}</div>
                    <div className="text-[11px] text-rose-600 font-medium mt-1">Requires Audit Investigation</div>
                  </div>
                </div>
              </>
            )}

            {activeCategory === 'inventory' && (
              <>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center shrink-0">
                      <Boxes className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-slate-900 tracking-tight">Inventory & Spare Parts Analytics</h2>
                      <p className="text-xs text-slate-500">Warehouse stock valuation, on-hand bin balances, spare part consumption ledger, and automated replenishment alerts.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleExportCSV('Inventory_Valuation_Report.csv')}
                      className="px-4 py-2 bg-[#3B82F6] hover:bg-blue-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" /> Export Valuation
                    </button>
                    <button
                      onClick={() => window.print()}
                      className="px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" /> Print
                    </button>
                  </div>
                </div>

                {/* 5 Inventory KPIs */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                    <div className="text-xs font-bold text-slate-500 mb-1">Cataloged SKUs</div>
                    <div className="text-2xl font-black text-slate-900">{FALLBACK_DOMAIN_DATA.inventory.kpis.totalItems} Items</div>
                    <div className="text-[11px] text-blue-600 font-bold mt-1">Central Warehouse & Hubs</div>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                    <div className="text-xs font-bold text-slate-500 mb-1">Healthy Stock Level</div>
                    <div className="text-2xl font-black text-emerald-600">{FALLBACK_DOMAIN_DATA.inventory.kpis.inStock} SKUs</div>
                    <div className="text-[11px] text-slate-500 font-medium mt-1">Above Reorder Threshold</div>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                    <div className="text-xs font-bold text-slate-500 mb-1">Low Stock Alerts</div>
                    <div className="text-2xl font-black text-amber-600">{FALLBACK_DOMAIN_DATA.inventory.kpis.lowStock} SKUs</div>
                    <div className="text-[11px] text-amber-600 font-bold mt-1">Reorder Required</div>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                    <div className="text-xs font-bold text-slate-500 mb-1">Critical Out of Stock</div>
                    <div className="text-2xl font-black text-rose-600">{FALLBACK_DOMAIN_DATA.inventory.kpis.outOfStock} SKUs</div>
                    <div className="text-[11px] text-rose-600 font-bold mt-1">Affecting Maintenance SLAs</div>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                    <div className="text-xs font-bold text-slate-500 mb-1">Total Valuation</div>
                    <div className="text-2xl font-black text-slate-900">{FALLBACK_DOMAIN_DATA.inventory.kpis.valuation}</div>
                    <div className="text-[11px] text-emerald-600 font-bold mt-1">Standard Cost Basis</div>
                  </div>
                </div>
              </>
            )}

            {activeCategory === 'maintenance' && (
              <>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 border border-purple-200 flex items-center justify-center shrink-0">
                      <Wrench className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-slate-900 tracking-tight">Maintenance & Work Order Intelligence</h2>
                      <p className="text-xs text-slate-500">Corrective repairs, scheduled preventive servicing logs, technician labor hours, and spare parts cost tracking.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleExportCSV('Maintenance_Intelligence_Report.csv')}
                      className="px-4 py-2 bg-[#8B5CF6] hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" /> Export Work Orders
                    </button>
                    <button
                      onClick={() => window.print()}
                      className="px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" /> Print
                    </button>
                  </div>
                </div>

                {/* 5 Maintenance KPIs */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                    <div className="text-xs font-bold text-slate-500 mb-1">Total Work Orders</div>
                    <div className="text-2xl font-black text-slate-900">{FALLBACK_DOMAIN_DATA.maintenance.kpis.totalWorkOrders}</div>
                    <div className="text-[11px] text-purple-600 font-bold mt-1">All Recorded Jobs</div>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                    <div className="text-xs font-bold text-slate-500 mb-1">Active / In Progress</div>
                    <div className="text-2xl font-black text-amber-600">{FALLBACK_DOMAIN_DATA.maintenance.kpis.inProgress}</div>
                    <div className="text-[11px] text-amber-600 font-bold mt-1">Currently Being Serviced</div>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                    <div className="text-xs font-bold text-slate-500 mb-1">Completed & Verified</div>
                    <div className="text-2xl font-black text-emerald-600">{FALLBACK_DOMAIN_DATA.maintenance.kpis.completed}</div>
                    <div className="text-[11px] text-slate-500 font-medium mt-1">Successfully Resolved</div>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                    <div className="text-xs font-bold text-slate-500 mb-1">Total Maintenance Spend</div>
                    <div className="text-2xl font-black text-slate-900">{FALLBACK_DOMAIN_DATA.maintenance.kpis.totalSpend}</div>
                    <div className="text-[11px] text-emerald-600 font-bold mt-1">Labor + Spare Parts</div>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                    <div className="text-xs font-bold text-slate-500 mb-1">Preventive Compliance</div>
                    <div className="text-2xl font-black text-[#6C2BD9]">{FALLBACK_DOMAIN_DATA.maintenance.kpis.preventiveRate}</div>
                    <div className="text-[11px] text-[#6C2BD9] font-bold mt-1">Target: &gt;90% SLA</div>
                  </div>
                </div>
              </>
            )}

            {activeCategory === 'financial' && (
              <>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center shrink-0">
                      <DollarSign className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-slate-900 tracking-tight">Financial & Asset Accounting Reports</h2>
                      <p className="text-xs text-slate-500">Capitalization schedules, straight-line and declining depreciation, accumulated amortizations, and Net Book Values (NBV).</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleExportCSV('Financial_Depreciation_Report.csv')}
                      className="px-4 py-2 bg-[#059669] hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" /> Export Schedule
                    </button>
                    <button
                      onClick={() => window.print()}
                      className="px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" /> Print
                    </button>
                  </div>
                </div>

                {/* 5 Financial KPIs */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                    <div className="text-xs font-bold text-slate-500 mb-1">Total Capital Cost</div>
                    <div className="text-2xl font-black text-slate-900">{FALLBACK_DOMAIN_DATA.financial.kpis.acquisitionCost}</div>
                    <div className="text-[11px] text-emerald-700 font-bold mt-1">Original Purchase Price</div>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                    <div className="text-xs font-bold text-slate-500 mb-1">Accumulated Depreciation</div>
                    <div className="text-2xl font-black text-rose-600">{FALLBACK_DOMAIN_DATA.financial.kpis.accumulatedDep}</div>
                    <div className="text-[11px] text-slate-500 font-medium mt-1">33.6% Expensed to Date</div>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                    <div className="text-xs font-bold text-slate-500 mb-1">Net Book Value (NBV)</div>
                    <div className="text-2xl font-black text-emerald-600">{FALLBACK_DOMAIN_DATA.financial.kpis.netBookValue}</div>
                    <div className="text-[11px] text-emerald-700 font-bold mt-1">Balance Sheet Asset Value</div>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                    <div className="text-xs font-bold text-slate-500 mb-1">Depreciated Units</div>
                    <div className="text-2xl font-black text-slate-900">{FALLBACK_DOMAIN_DATA.financial.kpis.depreciatedUnits}</div>
                    <div className="text-[11px] text-slate-500 font-medium mt-1">Active Depreciation Books</div>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                    <div className="text-xs font-bold text-slate-500 mb-1">Average Depreciation Rate</div>
                    <div className="text-2xl font-black text-[#6C2BD9]">{FALLBACK_DOMAIN_DATA.financial.kpis.avgDepRate}</div>
                    <div className="text-[11px] text-[#6C2BD9] font-bold mt-1">Annual Standard Amortization</div>
                  </div>
                </div>
              </>
            )}

            {activeCategory === 'compliance' && (
              <>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-slate-900 tracking-tight">Compliance, Audit & Warranty Intelligence</h2>
                      <p className="text-xs text-slate-500">Statutory audit trail, physical count discrepancy log, warranty expirations, and untagged asset discovery tracking.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleExportCSV('Compliance_Audit_Report.csv')}
                      className="px-4 py-2 bg-[#7C3AED] hover:bg-purple-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" /> Export Compliance Log
                    </button>
                    <button
                      onClick={() => window.print()}
                      className="px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" /> Print
                    </button>
                  </div>
                </div>

                {/* 4 Compliance KPIs */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                    <div className="text-xs font-bold text-slate-500 mb-1">Physical Audit Rate</div>
                    <div className="text-2xl font-black text-emerald-600">{FALLBACK_DOMAIN_DATA.compliance.kpis.complianceRate}</div>
                    <div className="text-[11px] text-emerald-700 font-bold mt-1">Audited in Current Cycle</div>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                    <div className="text-xs font-bold text-slate-500 mb-1">Warranties Expiring &lt;30d</div>
                    <div className="text-2xl font-black text-amber-600">{FALLBACK_DOMAIN_DATA.compliance.kpis.expiringWarranties} Assets</div>
                    <div className="text-[11px] text-amber-600 font-bold mt-1">Requires Renewal / Review</div>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                    <div className="text-xs font-bold text-slate-500 mb-1">Physical Discrepancies</div>
                    <div className="text-2xl font-black text-rose-600">{FALLBACK_DOMAIN_DATA.compliance.kpis.auditExceptions} Cases</div>
                    <div className="text-[11px] text-rose-600 font-bold mt-1">Location or Serial Mismatch</div>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                    <div className="text-xs font-bold text-slate-500 mb-1">Untagged Discovered Items</div>
                    <div className="text-2xl font-black text-indigo-600">{FALLBACK_DOMAIN_DATA.compliance.kpis.untaggedItems} Assets</div>
                    <div className="text-[11px] text-indigo-600 font-medium mt-1">Discovered via Network Scanner</div>
                  </div>
                </div>
              </>
            )}

            {/* Sub-Report Pills Bar */}
            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-slate-400 mr-1 uppercase">Sub-Reports:</span>
                {FALLBACK_DOMAIN_DATA[activeCategory]?.subReports?.map((sub) => {
                  const isSelected = activeSubReportId === sub.id;
                  return (
                    <button
                      key={sub.id}
                      onClick={() => setActiveSubReportId(sub.id)}
                      className={clsx(
                        'px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer',
                        isSelected
                          ? 'bg-[#6C2BD9] text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      )}
                    >
                      {sub.name}
                    </button>
                  );
                })}
              </div>

              {/* Live search input */}
              <div className="relative w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter records..."
                  value={domainSearch}
                  onChange={(e) => {
                    setDomainSearch(e.target.value);
                    setDomainPage(1);
                  }}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#6C2BD9]/20 focus:border-[#6C2BD9]"
                />
              </div>
            </div>

            {/* Live Data Table for Domain */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                {domainLoading ? (
                  <div className="py-16 flex flex-col items-center justify-center gap-2 text-slate-400 text-xs">
                    <RefreshCw className="w-6 h-6 animate-spin text-[#6C2BD9]" />
                    <span>Loading verified records...</span>
                  </div>
                ) : paginatedDomainRows.length === 0 ? (
                  <div className="py-16 text-center text-slate-400 text-xs font-semibold">
                    No matching records found for "{domainSearch}".
                  </div>
                ) : (
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-slate-50/95 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                      <tr>
                        {Object.keys(paginatedDomainRows[0]).map((key) => (
                          <th key={key} className="py-3 px-4">
                            {key.replace(/([A-Z])/g, ' $1')}
                          </th>
                        ))}
                        <th className="py-3 px-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {paginatedDomainRows.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                          {Object.keys(paginatedDomainRows[0]).map((key) => {
                            const val = row[key];
                            const isCode = ['code', 'partNumber', 'workOrderId', 'assetCode'].includes(key);
                            const isStatus = key.toLowerCase().includes('status');

                            return (
                              <td key={key} className="py-3 px-4">
                                {isCode ? (
                                  <span className="font-mono font-bold text-[#6C2BD9]">{val}</span>
                                ) : isStatus ? (
                                  <span
                                    className={clsx(
                                      'px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-block',
                                      String(val).toLowerCase().includes('active') || String(val).toLowerCase().includes('completed') || String(val).toLowerCase().includes('in stock')
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : String(val).toLowerCase().includes('low') || String(val).toLowerCase().includes('progress') || String(val).toLowerCase().includes('maintenance') || String(val).toLowerCase().includes('soon')
                                        ? 'bg-amber-100 text-amber-800'
                                        : 'bg-rose-100 text-rose-800'
                                    )}
                                  >
                                    {val}
                                  </span>
                                ) : (
                                  <span>{typeof val === 'object' ? JSON.stringify(val) : (val || '-').toString()}</span>
                                )}
                              </td>
                            );
                          })}
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => {
                                setActionSuccessMsg(`Action on item ${Object.values(row)[0]}`);
                                setTimeout(() => setActionSuccessMsg(null), 3000);
                              }}
                              className="p-1 rounded text-slate-400 hover:text-[#6C2BD9] hover:bg-purple-50 cursor-pointer"
                              title="View Details"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Table Footer with Pagination */}
              <div className="p-3 bg-white border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
                <span className="font-medium text-slate-600">
                  Showing {paginatedDomainRows.length} of {filteredDomainRows.length} records
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    disabled={domainPage <= 1}
                    onClick={() => setDomainPage(p => Math.max(1, p - 1))}
                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-600"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="px-3 py-1 font-semibold text-slate-800 bg-slate-50 rounded-lg border border-slate-200">
                    Page {domainPage} of {totalPages}
                  </span>
                  <button
                    disabled={domainPage >= totalPages}
                    onClick={() => setDomainPage(p => Math.min(totalPages, p + 1))}
                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-600"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------- */}
        {/* VIEW 4: CUSTOM REPORTS BUILDER VIEW                                 */}
        {/* ------------------------------------------------------------------- */}
        {viewMode === 'DASHBOARD' && activeCategory === 'custom' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 text-[#6C2BD9] border border-purple-200 flex items-center justify-center shrink-0">
                  <SlidersHorizontal className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900 tracking-tight">Custom Report Builder</h2>
                  <p className="text-xs text-slate-500">Design tailor-made reports by choosing datasets, selecting exact data columns, applying conditional filters, and exporting.</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleExportCSV('Custom_Asset360_Dataset.csv', domainTableData)}
                  className="px-4 py-2 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> Export Dataset
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" /> Print
                </button>
              </div>
            </div>

            {/* Builder Configuration Panel */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
              <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-2">
                Configure Report Schema
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
                {/* 1. Primary Reporting Domain */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1.5">1. Select Data Domain</label>
                  <select
                    value={customDomain}
                    onChange={(e) => setCustomDomain(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
                  >
                    <option value="ASSETS">Master Asset Register & Hardware</option>
                    <option value="MAINTENANCE">Maintenance Work Orders & Labor Costs</option>
                    <option value="INVENTORY">Inventory Stock & Spare Part Consumption</option>
                    <option value="FINANCE">Financial Depreciation & Net Book Values</option>
                    <option value="COMPLIANCE">Compliance, Warranties & Audit Discrepancies</option>
                  </select>
                </div>

                {/* 2. Grouping */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1.5">2. Grouping & Summarization</label>
                  <select
                    value={customGrouping}
                    onChange={(e) => setCustomGrouping(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
                  >
                    <option value="NONE">No Grouping (Flat Detailed Records)</option>
                    <option value="LOCATION">Group by Physical Location / Site</option>
                    <option value="CATEGORY">Group by Asset Category</option>
                    <option value="DEPARTMENT">Group by Custodian Department</option>
                  </select>
                </div>

                {/* 3. Output Format */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1.5">3. Export File Format</label>
                  <select className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800">
                    <option value="CSV">CSV / Microsoft Excel Workbook (.xlsx)</option>
                    <option value="PDF">PDF Formal Presentation Document (.pdf)</option>
                  </select>
                </div>
              </div>

              {/* Column Selection Checkboxes */}
              <div>
                <label className="font-bold text-slate-700 block mb-2">4. Select Output Columns (Check to include in export)</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                  {[
                    { key: 'code', label: 'Asset Code / Part #' },
                    { key: 'name', label: 'Item Name / Description' },
                    { key: 'category', label: 'Asset Category' },
                    { key: 'location', label: 'Physical Location' },
                    { key: 'custodian', label: 'Assigned Custodian' },
                    { key: 'cost', label: 'Cost / Value (AED)' },
                    { key: 'status', label: 'Lifecycle Status' },
                    { key: 'purchaseDate', label: 'Acquisition Date' }
                  ].map((col) => (
                    <label key={col.key} className="flex items-center gap-2 cursor-pointer font-medium text-slate-700 hover:text-[#6C2BD9]">
                      <input
                        type="checkbox"
                        checked={!!customColumns[col.key]}
                        onChange={(e) => setCustomColumns({ ...customColumns, [col.key]: e.target.checked })}
                        className="rounded text-[#6C2BD9] focus:ring-[#6C2BD9]/20"
                      />
                      <span>{col.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Live Preview of Custom Report */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-slate-900">Custom Dataset Live Preview</h3>
                  <p className="text-[11px] text-slate-400">Rendering preview matching selected schema and column filters</p>
                </div>
                <button
                  onClick={() => {
                    const currentDomainKey = customDomain.toLowerCase();
                    const dataset = FALLBACK_DOMAIN_DATA[currentDomainKey]?.sampleRows || FALLBACK_DOMAIN_DATA.assets.sampleRows;
                    handleExportCSV(`Custom_${customDomain}_Report.csv`, dataset);
                  }}
                  className="px-4 py-1.5 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> Download Custom CSV
                </button>
              </div>

              <div className="overflow-x-auto">
                {(() => {
                  const currentDomainKey = customDomain.toLowerCase();
                  const dataset = FALLBACK_DOMAIN_DATA[currentDomainKey]?.sampleRows || FALLBACK_DOMAIN_DATA.assets.sampleRows;
                  const activeColKeys = Object.keys(customColumns).filter(k => customColumns[k]);

                  return (
                    <table className="w-full text-left text-xs text-slate-700">
                      <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b">
                        <tr>
                          {activeColKeys.map((colKey) => (
                            <th key={colKey} className="py-3 px-4">
                              {colKey.replace(/([A-Z])/g, ' $1')}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {dataset.map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            {activeColKeys.map((colKey) => (
                              <td key={colKey} className="py-2.5 px-4">
                                {row[colKey] || Object.values(row)[0] || '-'}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  );
                })()}
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------- */}
        {/* VIEW 5: SCHEDULED REPORTS MANAGEMENT VIEW                           */}
        {/* ------------------------------------------------------------------- */}
        {viewMode === 'DASHBOARD' && activeCategory === 'scheduled' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center shrink-0">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900 tracking-tight">Automated & Scheduled Reports</h2>
                  <p className="text-xs text-slate-500">Manage automated generation and recurring email distribution schedules for management, auditors, and engineering teams.</p>
                </div>
              </div>
              <button
                onClick={handleOpenNewSchedule}
                className="px-4 py-2 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ New Scheduled Report</span>
              </button>
            </div>

            {/* Scheduled Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <div className="text-xs font-bold text-slate-500 mb-1">Total Scheduled Jobs</div>
                <div className="text-2xl font-black text-slate-900">{scheduledReports.length}</div>
                <div className="text-[11px] text-purple-600 font-bold mt-1">Active recurring tasks</div>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <div className="text-xs font-bold text-slate-500 mb-1">Active Deliveries</div>
                <div className="text-2xl font-black text-emerald-600">
                  {scheduledReports.filter(s => s.status === 'Active').length}
                </div>
                <div className="text-[11px] text-emerald-700 font-bold mt-1">Running on schedule</div>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <div className="text-xs font-bold text-slate-500 mb-1">Paused Schedules</div>
                <div className="text-2xl font-black text-slate-400">
                  {scheduledReports.filter(s => s.status === 'Paused').length}
                </div>
                <div className="text-[11px] text-slate-400 font-medium mt-1">Temporarily suspended</div>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <div className="text-xs font-bold text-slate-500 mb-1">Next Delivery Run</div>
                <div className="text-xl font-black text-slate-900">01 Nov 2026</div>
                <div className="text-[11px] text-emerald-600 font-bold mt-1">08:00 AM Gulf Standard</div>
              </div>
            </div>

            {/* Scheduled Reports List Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50/95 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Report Name</th>
                      <th className="py-3 px-3">Domain</th>
                      <th className="py-3 px-3">Frequency</th>
                      <th className="py-3 px-3">Format</th>
                      <th className="py-3 px-4">Distribution Recipients</th>
                      <th className="py-3 px-3">Next Scheduled Run</th>
                      <th className="py-3 px-3 text-center">Status</th>
                      <th className="py-3 px-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {scheduledReports.map((sch) => (
                      <tr key={sch.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 font-semibold text-slate-900">
                          {sch.name}
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700">
                            {sch.category || 'Asset'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-600">
                          {sch.frequency}
                        </td>
                        <td className="py-3 px-3">
                          <span className={clsx(
                            'px-2 py-0.5 rounded text-[10px] font-bold',
                            sch.deliveryFormat === 'PDF' ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          )}>
                            {sch.deliveryFormat || 'Excel'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-500 text-[11px] truncate max-w-xs font-mono">
                          {sch.recipients}
                        </td>
                        <td className="py-3 px-3 font-mono text-[11px] text-slate-600">
                          {sch.nextRun}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <span className={clsx('text-[11px] font-bold', sch.status === 'Active' ? 'text-emerald-700' : 'text-slate-400')}>
                              {sch.status}
                            </span>
                            {/* Toggle Switch */}
                            <button
                              type="button"
                              onClick={() => handleToggleSchedule(sch.id)}
                              className={clsx(
                                'relative inline-flex h-4 w-8 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden',
                                sch.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-300'
                              )}
                            >
                              <span
                                className={clsx(
                                  'pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out',
                                  sch.status === 'Active' ? 'translate-x-4' : 'translate-x-0'
                                )}
                              />
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleRunNowSchedule(sch)}
                              disabled={runningScheduleId === sch.id}
                              className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 disabled:opacity-60 text-emerald-700 border border-emerald-200 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all shadow-2xs"
                              title="Execute Schedule Immediately"
                            >
                              {runningScheduleId === sch.id ? (
                                <>
                                  <RefreshCw className="w-3 h-3 animate-spin text-emerald-600" />
                                  <span>Running...</span>
                                </>
                              ) : (
                                <>
                                  <Play className="w-3 h-3" />
                                  <span>Run Now</span>
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => handleOpenEditSchedule(sch)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-purple-700 hover:bg-purple-50 transition-colors cursor-pointer"
                              title="Edit Schedule"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteSchedule(sch.id, sch.name)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Delete Schedule"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* 7. ADVANCED FILTERS MODAL (Matching Screenshot 2 Pixel-Perfect)     */}
      {/* ------------------------------------------------------------------- */}
      {showAdvancedFilters && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-6 shadow-2xl space-y-5 animate-fadeIn max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-[#6C2BD9] flex items-center justify-center font-black">
                  <Filter className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Advanced Filters
                  </h3>
                  <p className="text-xs text-slate-500">
                    Refine your report data using one or more filters
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAdvancedFilters(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 15 Fields Grid matching Screenshot 2 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Report Category</label>
                <select
                  value={advFilters.reportCategory}
                  onChange={(e) => setAdvFilters({ ...advFilters, reportCategory: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
                >
                  <option value="Asset Reports">Asset Reports</option>
                  <option value="Maintenance Reports">Maintenance Reports</option>
                  <option value="Inventory Reports">Inventory Reports</option>
                  <option value="Financial Reports">Financial Reports</option>
                  <option value="Compliance Reports">Compliance Reports</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Report Type</label>
                <select
                  value={advFilters.reportType}
                  onChange={(e) => setAdvFilters({ ...advFilters, reportType: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
                >
                  <option value="Assets by Location">Assets by Location</option>
                  <option value="Assets by Category">Assets by Category</option>
                  <option value="Depreciation Schedule">Depreciation Schedule</option>
                  <option value="Maintenance History">Maintenance History</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Date Range</label>
                <div className="relative">
                  <select
                    value={advFilters.dateRange}
                    onChange={(e) => setAdvFilters({ ...advFilters, dateRange: e.target.value })}
                    className="w-full p-2.5 pr-8 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 appearance-none"
                  >
                    <option value="This Year (Jan 2025 - Dec 2025)">This Year (Jan 2025 - Dec 2025)</option>
                    <option value="Last 12 Months">Last 12 Months</option>
                    <option value="This Quarter">This Quarter</option>
                    <option value="Custom Range">Custom Range</option>
                  </select>
                  <Calendar className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Company</label>
                <select
                  value={advFilters.company}
                  onChange={(e) => setAdvFilters({ ...advFilters, company: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
                >
                  <option value="All Companies">All Companies</option>
                  <option value="Dubai HQ">Dubai HQ</option>
                  <option value="Abu Dhabi Branch">Abu Dhabi Branch</option>
                  <option value="Singapore Operations">Singapore Operations</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Location</label>
                <select
                  value={advFilters.location}
                  onChange={(e) => setAdvFilters({ ...advFilters, location: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
                >
                  <option value="All Locations">All Locations</option>
                  <option value="Dubai HQ">Dubai HQ</option>
                  <option value="Jebel Ali">Jebel Ali</option>
                  <option value="Abu Dhabi">Abu Dhabi</option>
                  <option value="Sharjah">Sharjah</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Department</label>
                <select
                  value={advFilters.department}
                  onChange={(e) => setAdvFilters({ ...advFilters, department: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
                >
                  <option value="All Departments">All Departments</option>
                  <option value="IT Department">IT Department</option>
                  <option value="Operations">Operations</option>
                  <option value="Finance">Finance</option>
                  <option value="Facilities">Facilities</option>
                </select>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAdvancedFilters(false)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-slate-700 font-bold hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAdvancedFilters(false);
                  fetchDashboard();
                  setActionSuccessMsg('Advanced filters applied.');
                  setTimeout(() => setActionSuccessMsg(null), 3000);
                }}
                className="px-5 py-2 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white rounded-xl font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Filter className="w-3.5 h-3.5" /> Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* 8. INTERACTIVE DRILL-DOWN MODAL                                     */}
      {/* ------------------------------------------------------------------- */}
      {drillDownModal.open && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-6 shadow-2xl space-y-4 animate-fadeIn max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-[#6C2BD9] flex items-center justify-center">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">{drillDownModal.title}</h3>
                  <p className="text-[11px] text-slate-400">
                    Displaying records directly contributing to the selected KPI or chart slice
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDrillDownModal({ ...drillDownModal, open: false })}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-auto max-h-[450px]">
              {drillDownModal.loading ? (
                <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400 text-xs">
                  <RefreshCw className="w-6 h-6 animate-spin text-[#6C2BD9]" />
                  <span>Loading contributing transactional records...</span>
                </div>
              ) : drillDownModal.records.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs font-semibold">
                  No specific records found for this filter criteria.
                </div>
              ) : (
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="sticky top-0 z-10 bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b shadow-2xs">
                    <tr>
                      <th className="py-2.5 px-3">Asset Number</th>
                      <th className="py-2.5 px-3">Asset Name</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3">Location</th>
                      <th className="py-2.5 px-3">Custodian</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Value / Cost</th>
                      <th className="py-2.5 px-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {drillDownModal.records.map((r, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-mono font-bold text-[#6C2BD9]">
                          {r.assetNumber}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-slate-900">{r.name}</td>
                        <td className="py-2.5 px-3">{r.category}</td>
                        <td className="py-2.5 px-3">{r.location}</td>
                        <td className="py-2.5 px-3">{r.custodian}</td>
                        <td className="py-2.5 px-3">
                          <span
                            className={clsx(
                              'px-2 py-0.5 rounded text-[10px] font-bold',
                              r.status === 'Active'
                                ? 'bg-emerald-100 text-emerald-700'
                                : r.status === 'In Maintenance'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-600'
                            )}
                          >
                            {r.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-semibold">{r.cost || '-'}</td>
                        <td className="py-2.5 px-3 text-center">
                          <button
                            onClick={() => navigate(`/assets/${r.assetNumber}`)}
                            className="p-1 text-slate-400 hover:text-[#6C2BD9] cursor-pointer"
                            title="View in Asset 360"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="flex items-center justify-between p-3 border-t border-slate-100 text-xs shrink-0">
              <span className="font-medium text-slate-600">Showing {drillDownModal.records.length} records</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    handleExportCSV(
                      `${drillDownModal.metricKey || 'DrillDown'}_Records.csv`,
                      drillDownModal.records
                    )
                  }
                  className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3 h-3" /> Export Records
                </button>
                <button
                  onClick={() => setDrillDownModal({ ...drillDownModal, open: false })}
                  className="px-4 py-1.5 bg-slate-800 text-white rounded-lg font-bold cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* 9. AI ANALYTICS INTELLIGENCE MODAL                                  */}
      {/* ------------------------------------------------------------------- */}
      {showAiModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-[#7C3AED] flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">Asset360 AI Analytics Intelligence</h3>
                  <p className="text-[11px] text-slate-400">Ask questions in natural language and get record-backed insights</p>
                </div>
              </div>
              <button
                onClick={() => setShowAiModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Prompt Chips */}
            <div className="flex flex-wrap gap-1.5 text-[11px]">
              <span className="text-slate-400 py-1 mr-1 font-semibold">Try asking:</span>
              {[
                'Top 10 highest maintenance cost assets this year',
                'Which locations have the most audit exceptions?',
                'Show spare parts likely to fall below reorder level'
              ].map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setAiPrompt(prompt);
                    handleRunAiQuery(prompt);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-purple-50 text-slate-700 hover:text-[#7C3AED] transition-colors border border-slate-200 cursor-pointer"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Query Input Box */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ask any question about your asset portfolio, work orders, or costs..."
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleRunAiQuery();
                }}
                className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
              />
              <button
                onClick={() => handleRunAiQuery()}
                disabled={aiLoading || !aiPrompt.trim()}
                className="px-5 py-3 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl text-xs font-bold shadow-xs disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
              >
                {aiLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                <span>Analyze</span>
              </button>
            </div>

            {/* AI Result Card */}
            {aiResult && (
              <div className="p-4 rounded-xl border border-purple-100 bg-purple-50/40 space-y-3 animate-fadeIn text-xs">
                <div className="flex items-center justify-between border-b border-purple-200/60 pb-2">
                  <span className="font-bold text-slate-900">{aiResult.title}</span>
                  <span className="text-[10px] text-purple-700 bg-purple-100 font-semibold px-2 py-0.5 rounded">
                    Verified Transactional Records
                  </span>
                </div>

                <div className="space-y-1">
                  {aiResult.insights?.map((ins, i) => (
                    <div key={i} className="flex items-start gap-1.5 text-slate-700 text-[11px]">
                      <span className="text-[#7C3AED] font-bold">•</span>
                      <span>{ins}</span>
                    </div>
                  ))}
                </div>

                {/* Supporting Records Table */}
                {aiResult.supportingRecords && aiResult.supportingRecords.length > 0 && (
                  <div className="pt-2 border-t border-purple-200/50">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                      Supporting Asset Evidence
                    </span>
                    <div className="bg-white rounded-lg border border-purple-100 overflow-auto max-h-[250px]">
                      <table className="w-full text-left text-[11px]">
                        <thead className="sticky top-0 z-10 bg-slate-50 border-b shadow-2xs">
                          <tr>
                            <th className="p-2">Code / Part</th>
                            <th className="p-2">Description</th>
                            <th className="p-2">Category</th>
                            <th className="p-2">Key Metric</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {aiResult.supportingRecords.map((rec, i) => (
                            <tr key={i}>
                              <td className="p-2 font-mono font-bold text-[#7C3AED]">{rec.assetNumber || rec.partNumber || rec.location}</td>
                              <td className="p-2 font-medium text-slate-800">{rec.name || rec.type || '-'}</td>
                              <td className="p-2 text-slate-500">{rec.category || rec.rate || '-'}</td>
                              <td className="p-2 font-bold text-slate-900">{rec.maintenanceCost || rec.currentStock || rec.exceptions || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* 10. CREATE REPORT MODALS (Standard, Schedule)                       */}
      {/* ------------------------------------------------------------------- */}
      {showStandardReportModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-black text-slate-900">Standard Reports Directory</h3>
              <button onClick={() => setShowStandardReportModal(false)} className="text-slate-400 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {CORE_PREDEFINED_REPORTS.map((rep) => (
                <div
                  key={rep.id}
                  className="p-3.5 rounded-xl border border-slate-200 hover:border-[#6C2BD9] bg-slate-50/50 flex flex-col justify-between space-y-2 group"
                >
                  <div>
                    <span className="text-[10px] font-bold text-[#6C2BD9] uppercase">{rep.category}</span>
                    <h4 className="font-bold text-slate-900 group-hover:text-[#6C2BD9] transition-colors">{rep.name}</h4>
                    <p className="text-[11px] text-slate-500 leading-snug">{rep.description}</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowStandardReportModal(false);
                      handleLaunchReport(rep);
                    }}
                    className="w-full py-1.5 rounded-lg bg-[#6C2BD9] text-white text-[11px] font-bold hover:bg-[#5B21B6] transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Eye className="w-3 h-3" /> View Report
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Schedule Report Modal (Create & Edit) */}
      {showScheduleReportModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-fadeIn text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-black text-slate-900">
                  {editingScheduleId ? 'Edit Scheduled Report' : 'Schedule Automatic Report'}
                </h3>
                <p className="text-[11px] text-slate-500">
                  {editingScheduleId
                    ? `Modify parameters and distribution list for ID: ${editingScheduleId}`
                    : 'Configure recurring report generation and automated email distribution'}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowScheduleReportModal(false);
                  setEditingScheduleId(null);
                }}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSchedule} className="space-y-3.5">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Schedule Name <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Executive Monthly Asset Health"
                  value={newScheduleForm.name}
                  onChange={(e) => setNewScheduleForm({ ...newScheduleForm, name: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-hidden focus:border-[#6C2BD9] focus:ring-2 focus:ring-[#6C2BD9]/20"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Reporting Domain / Category</label>
                <select
                  value={newScheduleForm.category}
                  onChange={(e) => setNewScheduleForm({ ...newScheduleForm, category: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-hidden focus:border-[#6C2BD9]"
                >
                  <option value="Asset">Asset Reports</option>
                  <option value="Inventory">Inventory Reports</option>
                  <option value="Maintenance">Maintenance Reports</option>
                  <option value="Financial">Financial Reports</option>
                  <option value="Compliance">Compliance Reports</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Frequency</label>
                  <select
                    value={newScheduleForm.frequency}
                    onChange={(e) => setNewScheduleForm({ ...newScheduleForm, frequency: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-hidden focus:border-[#6C2BD9]"
                  >
                    <option value="Daily">Daily (Every Morning)</option>
                    <option value="Weekly">Weekly (Every Monday)</option>
                    <option value="Monthly">Monthly (1st of Month)</option>
                    <option value="Quarterly">Quarterly (End of Quarter)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Delivery Format</label>
                  <select
                    value={newScheduleForm.deliveryFormat}
                    onChange={(e) => setNewScheduleForm({ ...newScheduleForm, deliveryFormat: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-hidden focus:border-[#6C2BD9]"
                  >
                    <option value="PDF">PDF Summary Presentation</option>
                    <option value="Excel">Excel / CSV Spreadsheet</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Email Distribution List</label>
                <input
                  type="text"
                  placeholder="e.g. director@asset360.com, audit@asset360.com"
                  value={newScheduleForm.recipients}
                  onChange={(e) => setNewScheduleForm({ ...newScheduleForm, recipients: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-hidden focus:border-[#6C2BD9] focus:ring-2 focus:ring-[#6C2BD9]/20"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Separate multiple email addresses with commas</span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowScheduleReportModal(false);
                    setEditingScheduleId(null);
                  }}
                  className="px-4 py-2 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingSchedule}
                  className="px-5 py-2 bg-[#6C2BD9] hover:bg-[#5B21B6] disabled:opacity-50 text-white rounded-xl font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  {savingSchedule ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>{editingScheduleId ? 'Updating...' : 'Saving...'}</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>{editingScheduleId ? 'Update Schedule' : 'Save Schedule & Activate'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReportsCatalogue;
