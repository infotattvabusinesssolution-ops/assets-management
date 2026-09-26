import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Search,
  Plus,
  Calendar,
  MoreHorizontal,
  CheckCircle2,
  Clock,
  Play,
  Edit,
  UserPlus,
  FileText,
  Building2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  Filter,
  Check,
  AlertTriangle,
  Users,
  Layers,
  ShieldCheck,
  Paperclip
} from 'lucide-react';
import clsx from 'clsx';

// Pre-seeded 12 Audits matching Screenshot 28 exact records
const SEED_AUDITS = [
  {
    id: 'AUD-2026-0008',
    auditId: 'AUD-2026-0008',
    auditName: 'HQ Annual IT Asset Audit 2026',
    auditType: 'Physical Verification',
    company: 'Dubai HQ',
    location: 'Block B',
    plannedStart: '01 Sep 2026',
    plannedEnd: '15 Sep 2026',
    status: 'In Progress',
    progress: 65,
    description: 'Annual physical verification of all IT assets at Dubai HQ - Block B including laptops, desktops, monitors and peripherals.',
    createdBy: 'John Doe',
    createdOn: '25 Aug 2026 10:30',
    lastUpdated: '10 Sep 2026 14:20',
    totalExpected: 600,
    scopeType: 'By Location',
    assetsIncluded: 'IT Equipment, Office Equipment',
    assetCategories: 'Laptops, Desktops, Monitors, Printers, Peripherals',
    locationScope: ['Dubai HQ > Block B > 1F - IT-101', 'Dubai HQ > Block B > 2F - IT-201'],
    verificationMethod: 'Barcode / RFID / Manual Entry',
    allowUnregistered: 'Yes',
    capturePhotos: 'Yes',
    remarksMandatory: 'For Exceptions',
    autoSync: 'Yes (Online/Offline)',
    auditInstructions: 'Ensure all assets are verified. Capture condition and actual location. Report discrepancies.',
    assignedUsers: [
      { id: 1, name: 'Ahmed Khan', role: 'Auditor', location: 'Block B - 1F', status: 'Active' },
      { id: 2, name: 'Sara Ali', role: 'Auditor', location: 'Block B - 2F', status: 'Active' },
      { id: 3, name: 'Omar Saleh', role: 'Supervisor', location: 'All Locations', status: 'Active' }
    ],
    timeline: [
      { time: '25 Aug 2026 10:30', title: 'Audit Created', author: 'by John Doe', type: 'created' },
      { time: '28 Aug 2026 09:15', title: 'Approved', author: 'by Operations Manager', type: 'approved' },
      { time: '01 Sep 2026 08:00', title: 'Audit Started', author: '', type: 'started' },
      { time: 'Current Status', title: 'In Progress', author: '65% completed', type: 'progress' },
      { time: '15 Sep 2026 17:00', title: 'Planned End Date', author: '', type: 'planned' }
    ],
    approvals: [
      { step: 1, role: 'IT Asset Manager', approver: 'Farhan Zaidi', status: 'Approved', date: '26 Aug 2026' },
      { step: 2, role: 'Operations Director', approver: 'John Doe', status: 'Approved', date: '28 Aug 2026' }
    ],
    exceptions: 12,
    attachments: 3
  },
  {
    id: 'AUD-2026-0007',
    auditId: 'AUD-2026-0007',
    auditName: 'Warehouse Assets Audit',
    auditType: 'Physical Verification',
    company: 'Jebel Ali',
    location: 'Main Warehouse',
    plannedStart: '10 Sep 2026',
    plannedEnd: '20 Sep 2026',
    status: 'Not Started',
    progress: 0,
    description: 'Comprehensive annual inventory physical audit for Jebel Ali central distribution warehouse.',
    createdBy: 'Rashid Mohammed',
    createdOn: '01 Sep 2026 11:00',
    lastUpdated: '05 Sep 2026 09:30',
    totalExpected: 1450,
    scopeType: 'By Location',
    assetsIncluded: 'Warehouse Racks, Forklifts, Pallet Jacks, Scanners',
    assetCategories: 'Heavy Equipment, IT Peripherals, Logistics',
    locationScope: ['Jebel Ali > Main Warehouse > Racks A-Z'],
    verificationMethod: 'Barcode / RFID',
    allowUnregistered: 'Yes',
    capturePhotos: 'Yes',
    remarksMandatory: 'Always',
    autoSync: 'Yes (Online/Offline)',
    auditInstructions: 'Scan barcode tags on all racking units and material handling equipment.',
    assignedUsers: [
      { id: 1, name: 'Rashid Mohammed', role: 'Auditor', location: 'Zone A', status: 'Active' },
      { id: 2, name: 'Layla Hassan', role: 'Auditor', location: 'Zone B', status: 'Active' }
    ],
    timeline: [
      { time: '01 Sep 2026 11:00', title: 'Audit Created', author: 'by Rashid Mohammed', type: 'created' },
      { time: '05 Sep 2026 09:30', title: 'Approved', author: 'by Logistics Manager', type: 'approved' },
      { time: '10 Sep 2026 08:00', title: 'Planned Start Date', author: '', type: 'planned' }
    ],
    approvals: [
      { step: 1, role: 'Logistics Manager', approver: 'Hamad Al Nuaimi', status: 'Approved', date: '05 Sep 2026' }
    ],
    exceptions: 0,
    attachments: 2
  },
  {
    id: 'AUD-2026-0006',
    auditId: 'AUD-2026-0006',
    auditName: 'Office Equipment Audit',
    auditType: 'Physical Verification',
    company: 'Abu Dhabi',
    location: 'Head Office',
    plannedStart: '05 Sep 2026',
    plannedEnd: '12 Sep 2026',
    status: 'In Progress',
    progress: 40,
    description: 'Mid-year verification of office furniture, AV conference room systems, and administrative assets.',
    createdBy: 'Fatima Noor',
    createdOn: '01 Sep 2026 14:00',
    lastUpdated: '08 Sep 2026 16:45',
    totalExpected: 380,
    scopeType: 'By Department',
    assetsIncluded: 'Furniture, AV Systems, Printers',
    assetCategories: 'Chairs, Executive Desks, TVs, Projectors',
    locationScope: ['Abu Dhabi > Head Office > Floors 1-5'],
    verificationMethod: 'Manual / Barcode',
    allowUnregistered: 'No',
    capturePhotos: 'Yes',
    remarksMandatory: 'For Exceptions',
    autoSync: 'Yes',
    auditInstructions: 'Verify serial tag tags on conference tables and display panels.',
    assignedUsers: [
      { id: 1, name: 'Fatima Noor', role: 'Auditor', location: 'Floors 1-3', status: 'Active' }
    ],
    timeline: [
      { time: '01 Sep 2026 14:00', title: 'Audit Created', author: 'by Fatima Noor', type: 'created' },
      { time: '05 Sep 2026 08:00', title: 'Audit Started', author: '', type: 'started' }
    ],
    approvals: [
      { step: 1, role: 'Facilities Manager', approver: 'Khalid Al Mansoori', status: 'Approved', date: '03 Sep 2026' }
    ],
    exceptions: 4,
    attachments: 1
  },
  {
    id: 'AUD-2026-0005',
    auditId: 'AUD-2026-0005',
    auditName: 'Vehicle Assets Audit',
    auditType: 'Cycle Count',
    company: 'Dubai HQ',
    location: 'Fleet',
    plannedStart: '01 Aug 2026',
    plannedEnd: '10 Aug 2026',
    status: 'Completed',
    progress: 100,
    description: 'Quarterly fleet vehicle registration and odometer verification audit.',
    createdBy: 'Omar Saleh',
    createdOn: '25 Jul 2026 09:00',
    lastUpdated: '10 Aug 2026 17:00',
    totalExpected: 45,
    scopeType: 'By Category',
    assetsIncluded: 'Fleet Vehicles, Vans, Trucks',
    assetCategories: 'Commercial Vehicles, Passenger Cars',
    locationScope: ['Dubai HQ > Fleet Parking Lot'],
    verificationMethod: 'Odometer Check & GPS RFID Tag Scan',
    allowUnregistered: 'No',
    capturePhotos: 'Yes',
    remarksMandatory: 'Always',
    autoSync: 'Yes',
    auditInstructions: 'Record exact mileage and check valid vehicle registration cards.',
    assignedUsers: [
      { id: 1, name: 'Omar Saleh', role: 'Auditor', location: 'Fleet Yard', status: 'Active' }
    ],
    timeline: [
      { time: '25 Jul 2026 09:00', title: 'Audit Created', author: 'by Omar Saleh', type: 'created' },
      { time: '01 Aug 2026 08:00', title: 'Audit Started', author: '', type: 'started' },
      { time: '10 Aug 2026 17:00', title: 'Audit Completed', author: '100% reconciled', type: 'completed' }
    ],
    approvals: [
      { step: 1, role: 'Fleet Manager', approver: 'Sari Nader', status: 'Approved', date: '28 Jul 2026' }
    ],
    exceptions: 1,
    attachments: 4
  },
  {
    id: 'AUD-2026-0004',
    auditId: 'AUD-2026-0004',
    auditName: 'IT Accessories Audit',
    auditType: 'Sample Count',
    company: 'Sharjah',
    location: 'Office',
    plannedStart: '15 Aug 2026',
    plannedEnd: '18 Aug 2026',
    status: 'In Progress',
    progress: 80,
    description: 'Random sampling of loose IT accessories, docking stations, and monitors in Sharjah branch.',
    createdBy: 'Sara Ali',
    createdOn: '10 Aug 2026 10:15',
    lastUpdated: '17 Aug 2026 12:00',
    totalExpected: 210,
    scopeType: 'Sample Count',
    assetsIncluded: 'Docking Stations, Keyboards, Monitors',
    assetCategories: 'Peripherals',
    locationScope: ['Sharjah > Branch Office > IT Store'],
    verificationMethod: 'Barcode Scan',
    allowUnregistered: 'Yes',
    capturePhotos: 'No',
    remarksMandatory: 'For Exceptions',
    autoSync: 'Yes',
    auditInstructions: 'Audit 20% random sample across all workstations.',
    assignedUsers: [
      { id: 1, name: 'Sara Ali', role: 'Auditor', location: 'Sharjah IT Store', status: 'Active' }
    ],
    timeline: [
      { time: '10 Aug 2026 10:15', title: 'Audit Created', author: 'by Sara Ali', type: 'created' },
      { time: '15 Aug 2026 09:00', title: 'Audit Started', author: '', type: 'started' }
    ],
    approvals: [],
    exceptions: 2,
    attachments: 1
  },
  {
    id: 'AUD-2026-0003',
    auditId: 'AUD-2026-0003',
    auditName: 'Tools & Equipment Audit',
    auditType: 'Physical Verification',
    company: 'Dubai HQ',
    location: 'Service Center',
    plannedStart: '01 Jul 2026',
    plannedEnd: '07 Jul 2026',
    status: 'Completed',
    progress: 100,
    description: 'Physical audit of specialized maintenance tools, diagnostic instruments, and calibration kits.',
    createdBy: 'Ahmed Khan',
    createdOn: '25 Jun 2026 14:00',
    lastUpdated: '07 Jul 2026 18:00',
    totalExpected: 310,
    scopeType: 'By Location',
    assetsIncluded: 'Diagnostic Tools, Power Tools, Multimeters',
    assetCategories: 'Maintenance Tools',
    locationScope: ['Dubai HQ > Service Center > Tool Room'],
    verificationMethod: 'RFID Handheld Scanner',
    allowUnregistered: 'No',
    capturePhotos: 'Yes',
    remarksMandatory: 'For Exceptions',
    autoSync: 'Yes',
    auditInstructions: 'Check calibration expiry sticker on every instrument.',
    assignedUsers: [
      { id: 1, name: 'Ahmed Khan', role: 'Auditor', location: 'Service Center', status: 'Active' }
    ],
    timeline: [
      { time: '25 Jun 2026 14:00', title: 'Audit Created', author: 'by Ahmed Khan', type: 'created' },
      { time: '01 Jul 2026 08:30', title: 'Audit Started', author: '', type: 'started' },
      { time: '07 Jul 2026 18:00', title: 'Audit Completed', author: '100% verified', type: 'completed' }
    ],
    approvals: [
      { step: 1, role: 'Maintenance Lead', approver: 'Tariq Ziad', status: 'Approved', date: '28 Jun 2026' }
    ],
    exceptions: 0,
    attachments: 2
  },
  {
    id: 'AUD-2026-0002',
    auditId: 'AUD-2026-0002',
    auditName: 'Q2 Cycle Count',
    auditType: 'Cycle Count',
    company: 'All Entities',
    location: 'Multiple',
    plannedStart: '01 Jun 2026',
    plannedEnd: '30 Jun 2026',
    status: 'Completed',
    progress: 100,
    description: 'Quarterly group-wide mandatory cycle count for high probability variance asset categories.',
    createdBy: 'John Doe',
    createdOn: '15 May 2026 08:30',
    lastUpdated: '30 Jun 2026 19:30',
    totalExpected: 2200,
    scopeType: 'Group Wide',
    assetsIncluded: 'Laptops, Smartphones, Tablets',
    assetCategories: 'Mobile Computing',
    locationScope: ['All Entities & Branches'],
    verificationMethod: 'Agent Auto-Discovery & Tag Scan',
    allowUnregistered: 'Yes',
    capturePhotos: 'No',
    remarksMandatory: 'For Exceptions',
    autoSync: 'Yes',
    auditInstructions: 'Ensure mobile assets match current custodian AD login records.',
    assignedUsers: [
      { id: 1, name: 'John Doe', role: 'Supervisor', location: 'All Entities', status: 'Active' },
      { id: 2, name: 'Sara Ali', role: 'Auditor', location: 'Dubai HQ', status: 'Active' }
    ],
    timeline: [
      { time: '15 May 2026 08:30', title: 'Audit Created', author: 'by John Doe', type: 'created' },
      { time: '01 Jun 2026 08:00', title: 'Audit Started', author: '', type: 'started' },
      { time: '30 Jun 2026 19:30', title: 'Audit Completed', author: 'Fully Reconciled', type: 'completed' }
    ],
    approvals: [
      { step: 1, role: 'Internal Audit Manager', approver: 'Salim Al Maktoum', status: 'Approved', date: '25 May 2026' }
    ],
    exceptions: 8,
    attachments: 5
  },
  {
    id: 'AUD-2026-0001',
    auditId: 'AUD-2026-0001',
    auditName: 'High Value Assets Audit',
    auditType: 'Physical Verification',
    company: 'Dubai HQ',
    location: 'Main Building',
    plannedStart: '01 May 2026',
    plannedEnd: '15 May 2026',
    status: 'Completed',
    progress: 100,
    description: 'Annual physical verification of high-value capital assets exceeding $10,000 threshold.',
    createdBy: 'Farhan Zaidi',
    createdOn: '20 Apr 2026 11:00',
    lastUpdated: '15 May 2026 16:00',
    totalExpected: 180,
    scopeType: 'By Financial Value',
    assetsIncluded: 'Datacenter Servers, SAN Storage, Core Switches, Generators',
    assetCategories: 'Datacenter Infrastructure',
    locationScope: ['Dubai HQ > Main Building > Server Room 1 & 2'],
    verificationMethod: 'Dual RFID & Manual Sign-off',
    allowUnregistered: 'No',
    capturePhotos: 'Yes',
    remarksMandatory: 'Always',
    autoSync: 'Yes',
    auditInstructions: 'Verify asset serial number and financial asset tag plate.',
    assignedUsers: [
      { id: 1, name: 'Farhan Zaidi', role: 'Auditor', location: 'Server Rooms', status: 'Active' }
    ],
    timeline: [
      { time: '20 Apr 2026 11:00', title: 'Audit Created', author: 'by Farhan Zaidi', type: 'created' },
      { time: '01 May 2026 08:00', title: 'Audit Started', author: '', type: 'started' },
      { time: '15 May 2026 16:00', title: 'Audit Completed', author: '100% verified', type: 'completed' }
    ],
    approvals: [
      { step: 1, role: 'Chief Financial Officer', approver: 'Adnan Zaid', status: 'Approved', date: '28 Apr 2026' }
    ],
    exceptions: 0,
    attachments: 3
  }
];

export function AuditManagement() {
  const navigate = useNavigate();

  // Selected Audit State
  const [selectedAuditId, setSelectedAuditId] = useState('AUD-2026-0008');
  const [activeTab, setActiveTab] = useState('scope'); // scope | users | expected | schedule | approvals | exceptions | attachments | notes

  // Filter States
  const [filterSearch, setFilterSearch] = useState('');
  const [filterAuditType, setFilterAuditType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterCompany, setFilterCompany] = useState('All');
  const [filterLocation, setFilterLocation] = useState('All');
  const [filterDateRange, setFilterDateRange] = useState('01 Jan 2026 - 31 Dec 2026');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Selected Audit Object
  const selectedAudit = useMemo(() => {
    return SEED_AUDITS.find(a => a.auditId === selectedAuditId) || SEED_AUDITS[0];
  }, [selectedAuditId]);

  // Filtered List
  const filteredAudits = useMemo(() => {
    return SEED_AUDITS.filter(a => {
      const matchSearch =
        !filterSearch ||
        a.auditId.toLowerCase().includes(filterSearch.toLowerCase()) ||
        a.auditName.toLowerCase().includes(filterSearch.toLowerCase());
      const matchType = filterAuditType === 'All' || a.auditType === filterAuditType;
      const matchStatus = filterStatus === 'All' || a.status === filterStatus;
      const matchCompany = filterCompany === 'All' || a.company === filterCompany;
      const matchLoc = filterLocation === 'All' || a.location === filterLocation;

      return matchSearch && matchType && matchStatus && matchCompany && matchLoc;
    });
  }, [filterSearch, filterAuditType, filterStatus, filterCompany, filterLocation]);

  const handleClearFilters = () => {
    setFilterSearch('');
    setFilterAuditType('All');
    setFilterStatus('All');
    setFilterCompany('All');
    setFilterLocation('All');
    setFilterDateRange('01 Jan 2026 - 31 Dec 2026');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-16">
      <div className="max-w-[1580px] mx-auto px-4 sm:px-6 lg:px-8 pt-5 space-y-5">
        
        {/* Top Header matching Screenshot 28 */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <button
                onClick={() => navigate('/stocktakes')}
                className="flex items-center gap-1.5 hover:text-[#6C2BD9] transition-colors font-medium cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Verification &amp; Audit</span>
              </button>
              <span>&gt;</span>
              <span className="text-slate-800 font-semibold">Audit Management</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Audit Management
            </h1>
            <p className="text-xs text-slate-500">
              Plan, schedule and monitor asset verification audits
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/stocktakes/create')}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#6C2BD9] hover:bg-[#5b21b6] rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Create Audit</span>
            </button>
          </div>
        </div>

        {/* 1-Row Filter Bar matching Screenshot 28 */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 text-xs items-end">
            
            {/* Search */}
            <div className="lg:col-span-3">
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Search
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={filterSearch}
                  onChange={(e) => setFilterSearch(e.target.value)}
                  placeholder="Search by audit name or ID"
                  className="w-full pl-3 pr-8 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6C2BD9]/20 focus:border-[#6C2BD9]"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Audit Type */}
            <div className="lg:col-span-2">
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Audit Type
              </label>
              <select
                value={filterAuditType}
                onChange={(e) => setFilterAuditType(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#6C2BD9]/20"
              >
                <option value="All">All</option>
                <option value="Physical Verification">Physical Verification</option>
                <option value="Cycle Count">Cycle Count</option>
                <option value="Sample Count">Sample Count</option>
              </select>
            </div>

            {/* Status */}
            <div className="lg:col-span-1">
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#6C2BD9]/20"
              >
                <option value="All">All</option>
                <option value="In Progress">In Progress</option>
                <option value="Not Started">Not Started</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            {/* Company / Entity */}
            <div className="lg:col-span-2">
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Company / Entity
              </label>
              <select
                value={filterCompany}
                onChange={(e) => setFilterCompany(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#6C2BD9]/20"
              >
                <option value="All">All</option>
                <option value="Dubai HQ">Dubai HQ</option>
                <option value="Jebel Ali">Jebel Ali</option>
                <option value="Abu Dhabi">Abu Dhabi</option>
                <option value="Sharjah">Sharjah</option>
                <option value="All Entities">All Entities</option>
              </select>
            </div>

            {/* Location */}
            <div className="lg:col-span-1">
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Location
              </label>
              <select
                value={filterLocation}
                onChange={(e) => setFilterLocation(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#6C2BD9]/20"
              >
                <option value="All">All</option>
                <option value="Block B">Block B</option>
                <option value="Main Warehouse">Main Warehouse</option>
                <option value="Head Office">Head Office</option>
                <option value="Fleet">Fleet</option>
                <option value="Office">Office</option>
                <option value="Service Center">Service Center</option>
                <option value="Multiple">Multiple</option>
                <option value="Main Building">Main Building</option>
              </select>
            </div>

            {/* Date Range */}
            <div className="lg:col-span-2">
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Date Range
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={filterDateRange}
                  onChange={(e) => setFilterDateRange(e.target.value)}
                  className="w-full pl-3 pr-8 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#6C2BD9]/20 text-xs"
                />
                <Calendar className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Buttons */}
            <div className="lg:col-span-1 flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage(1)}
                className="px-3.5 py-2 bg-[#6C2BD9] hover:bg-[#5b21b6] text-white rounded-lg font-semibold flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Search</span>
              </button>
              <button
                onClick={handleClearFilters}
                className="px-3 py-2 bg-white border border-slate-200 text-[#6C2BD9] hover:bg-purple-50 rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap"
              >
                Clear Filters
              </button>
            </div>

          </div>
        </div>

        {/* Main Grid: Split Layout - Audit List Table (Left 8 Cols) + Audit Details Hero (Right 4 Cols) */}
        <div className="grid grid-cols-12 gap-6 items-start">
          
          {/* Left Table: Audit List (12) matching Screenshot 28 */}
          <div className="col-span-12 lg:col-span-8 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900">
                Audit List ({SEED_AUDITS.length})
              </h2>
            </div>

            {/* Table */}
            <div className="overflow-auto max-h-[540px]">
              <table className="w-full text-left text-xs text-slate-600 border-collapse">
                <thead className="sticky top-0 z-10 bg-slate-50 shadow-2xs text-slate-500 font-semibold text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3 w-8 text-center">
                      <input type="checkbox" className="rounded border-slate-300 text-[#6C2BD9] focus:ring-[#6C2BD9]" />
                    </th>
                    <th className="py-2.5 px-3">Audit ID</th>
                    <th className="py-2.5 px-3">Audit Name</th>
                    <th className="py-2.5 px-3">Audit Type</th>
                    <th className="py-2.5 px-3">Company / Entity</th>
                    <th className="py-2.5 px-3">Location</th>
                    <th className="py-2.5 px-3">Planned Start</th>
                    <th className="py-2.5 px-3">Planned End</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 px-3">Progress</th>
                    <th className="py-2.5 px-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAudits.map((row) => {
                    const isSelected = selectedAuditId === row.auditId;
                    return (
                      <tr
                        key={row.auditId}
                        onClick={() => setSelectedAuditId(row.auditId)}
                        className={clsx(
                          'cursor-pointer transition-colors hover:bg-slate-50/70',
                          isSelected ? 'bg-purple-50/60 font-medium border-l-2 border-l-[#6C2BD9]' : ''
                        )}
                      >
                        <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <input type="checkbox" className="rounded border-slate-300 text-[#6C2BD9] focus:ring-[#6C2BD9]" />
                        </td>
                        <td className="py-3 px-3 font-mono font-semibold text-[#6C2BD9] text-[11px] hover:underline">
                          {row.auditId}
                        </td>
                        <td className="py-3 px-3 font-semibold text-slate-900">
                          {row.auditName}
                        </td>
                        <td className="py-3 px-3 text-slate-600">
                          {row.auditType}
                        </td>
                        <td className="py-3 px-3 text-slate-700">
                          {row.company}
                        </td>
                        <td className="py-3 px-3 text-slate-600 text-[11px]">
                          {row.location}
                        </td>
                        <td className="py-3 px-3 text-slate-500 whitespace-nowrap text-[11px]">
                          {row.plannedStart}
                        </td>
                        <td className="py-3 px-3 text-slate-500 whitespace-nowrap text-[11px]">
                          {row.plannedEnd}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span
                            className={clsx(
                              'inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border',
                              row.status === 'In Progress'
                                ? 'bg-purple-50 text-[#6C2BD9] border-purple-200'
                                : row.status === 'Completed'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-slate-100 text-slate-600 border-slate-200'
                            )}
                          >
                            {row.status}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-bold text-slate-700 min-w-[28px]">
                              {row.progress}%
                            </span>
                            <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[#6C2BD9] rounded-full transition-all duration-300"
                                style={{ width: `${row.progress}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <button className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer">
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Scroll Down Summary */}
            <div className="p-3 bg-white border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="font-medium text-slate-600">Showing {filteredAudits.length} records</span>
              <span className="text-slate-400">Scroll down to view all records</span>
            </div>
          </div>

          {/* Right Card: Audit Details Hero Panel matching Screenshot 28 */}
          <div className="col-span-12 lg:col-span-4 bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Audit Details</h3>
              <button
                onClick={() => navigate('/stocktakes/create')}
                className="flex items-center gap-1 text-xs font-semibold text-[#6C2BD9] hover:bg-purple-50 px-2.5 py-1 rounded border border-purple-200 transition-colors cursor-pointer"
              >
                <Edit className="w-3 h-3" />
                <span>Edit</span>
              </button>
            </div>

            {/* Key Value Details matching Screenshot 28 */}
            <div className="space-y-2.5 text-xs">
              <div className="flex items-start gap-4">
                <span className="text-slate-500 w-28 shrink-0">Audit ID</span>
                <span className="text-slate-900 font-mono font-bold">: {selectedAudit.auditId}</span>
              </div>
              <div className="flex items-start gap-4">
                <span className="text-slate-500 w-28 shrink-0">Audit Name</span>
                <span className="text-slate-900 font-semibold">: {selectedAudit.auditName}</span>
              </div>
              <div className="flex items-start gap-4">
                <span className="text-slate-500 w-28 shrink-0">Audit Type</span>
                <span className="text-slate-800">: {selectedAudit.auditType}</span>
              </div>
              <div className="flex items-start gap-4">
                <span className="text-slate-500 w-28 shrink-0">Description</span>
                <span className="text-slate-700 leading-relaxed">: {selectedAudit.description}</span>
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-2.5">
                <div className="flex items-start gap-4">
                  <span className="text-slate-500 w-28 shrink-0">Company / Entity</span>
                  <span className="text-slate-800 font-medium">: {selectedAudit.company}</span>
                </div>
                <div className="flex items-start gap-4">
                  <span className="text-slate-500 w-28 shrink-0">Location</span>
                  <span className="text-slate-800 font-medium">: {selectedAudit.location}</span>
                </div>
                <div className="flex items-start gap-4">
                  <span className="text-slate-500 w-28 shrink-0">Planned Start</span>
                  <span className="text-slate-800">: {selectedAudit.plannedStart}</span>
                </div>
                <div className="flex items-start gap-4">
                  <span className="text-slate-500 w-28 shrink-0">Planned End</span>
                  <span className="text-slate-800">: {selectedAudit.plannedEnd}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-slate-500 w-28 shrink-0">Status</span>
                  <div className="flex items-center gap-1">
                    <span>: </span>
                    <span
                      className={clsx(
                        'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border',
                        selectedAudit.status === 'In Progress'
                          ? 'bg-purple-50 text-[#6C2BD9] border-purple-200'
                          : selectedAudit.status === 'Completed'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      )}
                    >
                      {selectedAudit.status}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="flex items-center gap-4 pt-1">
                  <span className="text-slate-500 w-28 shrink-0">Progress</span>
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-slate-900 font-bold min-w-[32px]">: {selectedAudit.progress}%</span>
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#6C2BD9] rounded-full transition-all duration-300"
                        style={{ width: `${selectedAudit.progress}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <div className="flex items-start gap-4">
                    <span className="text-slate-500 w-28 shrink-0">Created By</span>
                    <span className="text-slate-800">: {selectedAudit.createdBy}</span>
                  </div>
                  <div className="flex items-start gap-4">
                    <span className="text-slate-500 w-28 shrink-0">Created On</span>
                    <span className="text-slate-700 font-mono text-[11px]">: {selectedAudit.createdOn}</span>
                  </div>
                  <div className="flex items-start gap-4">
                    <span className="text-slate-500 w-28 shrink-0">Last Updated</span>
                    <span className="text-slate-700 font-mono text-[11px]">: {selectedAudit.lastUpdated}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons Toolbar at Bottom matching Screenshot 28 */}
            <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
              <button
                onClick={() => navigate(`/stocktakes/execution/${selectedAudit.auditId}`)}
                className="flex-1 py-2 bg-[#6C2BD9] hover:bg-[#5b21b6] text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Start Audit</span>
              </button>
              <button
                onClick={() => alert(`Audit ${selectedAudit.auditId} closed.`)}
                className="flex-1 py-2 bg-white border border-[#6C2BD9] text-[#6C2BD9] hover:bg-purple-50 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Close Audit</span>
              </button>
              <button
                className="px-3 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>More</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>

          </div>
        </div>

        {/* Bottom Tabbed Section matching Screenshot 28 */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          
          {/* Tab Header Bar */}
          <div className="flex items-center gap-1 border-b border-slate-200 bg-slate-50/50 px-4 pt-2 overflow-x-auto text-xs font-semibold">
            <button
              onClick={() => setActiveTab('scope')}
              className={clsx(
                'px-4 py-2.5 rounded-t-lg transition-colors cursor-pointer border-b-2 font-medium whitespace-nowrap',
                activeTab === 'scope'
                  ? 'border-[#6C2BD9] text-[#6C2BD9] bg-white font-bold shadow-xs'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              )}
            >
              Audit Scope
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={clsx(
                'px-4 py-2.5 rounded-t-lg transition-colors cursor-pointer border-b-2 font-medium whitespace-nowrap',
                activeTab === 'users'
                  ? 'border-[#6C2BD9] text-[#6C2BD9] bg-white font-bold shadow-xs'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              )}
            >
              Assigned Users ({selectedAudit.assignedUsers.length})
            </button>
            <button
              onClick={() => setActiveTab('expected')}
              className={clsx(
                'px-4 py-2.5 rounded-t-lg transition-colors cursor-pointer border-b-2 font-medium whitespace-nowrap',
                activeTab === 'expected'
                  ? 'border-[#6C2BD9] text-[#6C2BD9] bg-white font-bold shadow-xs'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              )}
            >
              Expected Assets ({selectedAudit.totalExpected})
            </button>
            <button
              onClick={() => setActiveTab('schedule')}
              className={clsx(
                'px-4 py-2.5 rounded-t-lg transition-colors cursor-pointer border-b-2 font-medium whitespace-nowrap',
                activeTab === 'schedule'
                  ? 'border-[#6C2BD9] text-[#6C2BD9] bg-white font-bold shadow-xs'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              )}
            >
              Audit Schedule
            </button>
            <button
              onClick={() => setActiveTab('approvals')}
              className={clsx(
                'px-4 py-2.5 rounded-t-lg transition-colors cursor-pointer border-b-2 font-medium whitespace-nowrap',
                activeTab === 'approvals'
                  ? 'border-[#6C2BD9] text-[#6C2BD9] bg-white font-bold shadow-xs'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              )}
            >
              Approvals ({selectedAudit.approvals.length})
            </button>
            <button
              onClick={() => setActiveTab('exceptions')}
              className={clsx(
                'px-4 py-2.5 rounded-t-lg transition-colors cursor-pointer border-b-2 font-medium whitespace-nowrap',
                activeTab === 'exceptions'
                  ? 'border-[#6C2BD9] text-[#6C2BD9] bg-white font-bold shadow-xs'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              )}
            >
              Exceptions ({selectedAudit.exceptions})
            </button>
            <button
              onClick={() => setActiveTab('attachments')}
              className={clsx(
                'px-4 py-2.5 rounded-t-lg transition-colors cursor-pointer border-b-2 font-medium whitespace-nowrap',
                activeTab === 'attachments'
                  ? 'border-[#6C2BD9] text-[#6C2BD9] bg-white font-bold shadow-xs'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              )}
            >
              Attachments ({selectedAudit.attachments})
            </button>
            <button
              onClick={() => setActiveTab('notes')}
              className={clsx(
                'px-4 py-2.5 rounded-t-lg transition-colors cursor-pointer border-b-2 font-medium whitespace-nowrap',
                activeTab === 'notes'
                  ? 'border-[#6C2BD9] text-[#6C2BD9] bg-white font-bold shadow-xs'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              )}
            >
              Notes
            </button>
          </div>

          {/* Tab Body */}
          <div className="p-6">
            
            {/* TAB: AUDIT SCOPE (3 Side-by-Side Columns matching Screenshot 28) */}
            {activeTab === 'scope' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start text-xs">
                
                {/* Column 1: Key-Value Scope Specs (4 Cols) */}
                <div className="lg:col-span-4 space-y-2.5">
                  <div className="flex items-start gap-4">
                    <span className="text-slate-500 w-36 shrink-0">Scope Type</span>
                    <span className="text-slate-900 font-semibold">: {selectedAudit.scopeType}</span>
                  </div>
                  <div className="flex items-start gap-4">
                    <span className="text-slate-500 w-36 shrink-0">Assets Included</span>
                    <span className="text-slate-800">: {selectedAudit.assetsIncluded}</span>
                  </div>
                  <div className="flex items-start gap-4">
                    <span className="text-slate-500 w-36 shrink-0">Asset Categories</span>
                    <span className="text-slate-800">: {selectedAudit.assetCategories}</span>
                  </div>
                  <div className="flex items-start gap-4">
                    <span className="text-slate-500 w-36 shrink-0">Location Scope</span>
                    <div className="text-slate-800 font-medium">
                      : {selectedAudit.locationScope[0]}
                      {selectedAudit.locationScope[1] && (
                        <div className="pl-2 mt-0.5">{selectedAudit.locationScope[1]}</div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-start gap-4 pt-2 border-t border-slate-100">
                    <span className="text-slate-500 w-36 shrink-0">Total Expected Assets</span>
                    <span className="text-slate-900 font-bold text-sm">: {selectedAudit.totalExpected}</span>
                  </div>
                  <div className="flex items-start gap-4">
                    <span className="text-slate-500 w-36 shrink-0">Verification Method</span>
                    <span className="text-slate-800">: {selectedAudit.verificationMethod}</span>
                  </div>
                  <div className="flex items-start gap-4">
                    <span className="text-slate-500 w-36 shrink-0">Allow Unregistered</span>
                    <span className="text-slate-800 font-semibold">: {selectedAudit.allowUnregistered}</span>
                  </div>
                  <div className="flex items-start gap-4">
                    <span className="text-slate-500 w-36 shrink-0">Capture Photos</span>
                    <span className="text-slate-800 font-semibold">: {selectedAudit.capturePhotos}</span>
                  </div>
                  <div className="flex items-start gap-4">
                    <span className="text-slate-500 w-36 shrink-0">Remarks Mandatory</span>
                    <span className="text-slate-800">: {selectedAudit.remarksMandatory}</span>
                  </div>
                  <div className="flex items-start gap-4">
                    <span className="text-slate-500 w-36 shrink-0">Auto Sync</span>
                    <span className="text-slate-800">: {selectedAudit.autoSync}</span>
                  </div>
                  <div className="flex items-start gap-4 pt-2 border-t border-slate-100">
                    <span className="text-slate-500 w-36 shrink-0">Audit Instructions</span>
                    <span className="text-slate-700 italic leading-relaxed">: {selectedAudit.auditInstructions}</span>
                  </div>
                </div>

                {/* Column 2: Assigned Users (3) Table (5 Cols) */}
                <div className="lg:col-span-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 text-sm">Assigned Users ({selectedAudit.assignedUsers.length})</h4>
                    <button
                      onClick={() => alert('Assign Users modal')}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-[#6C2BD9] hover:bg-purple-100 rounded-lg text-xs font-semibold transition-colors cursor-pointer border border-purple-200"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Assign Users</span>
                    </button>
                  </div>

                  <div className="border border-slate-200 rounded-lg overflow-auto max-h-[300px]">
                    <table className="w-full text-left text-xs text-slate-600 border-collapse">
                      <thead className="sticky top-0 z-10 bg-slate-50 shadow-2xs text-slate-500 font-semibold text-[11px] border-b border-slate-200">
                        <tr>
                          <th className="py-2.5 px-3 w-8">#</th>
                          <th className="py-2.5 px-3">User Name</th>
                          <th className="py-2.5 px-3">Role</th>
                          <th className="py-2.5 px-3">Location</th>
                          <th className="py-2.5 px-3 text-center">Status</th>
                          <th className="py-2.5 px-3 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {selectedAudit.assignedUsers.map((u) => (
                          <tr key={u.id} className="hover:bg-slate-50/70">
                            <td className="py-2.5 px-3 text-slate-400 text-center">{u.id}</td>
                            <td className="py-2.5 px-3 font-semibold text-slate-900">{u.name}</td>
                            <td className="py-2.5 px-3 text-slate-700">{u.role}</td>
                            <td className="py-2.5 px-3 text-slate-500 text-[11px]">{u.location}</td>
                            <td className="py-2.5 px-3 text-center">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                {u.status}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <button className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer">
                                <MoreHorizontal className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Column 3: Audit Timeline (3 Cols) matching Screenshot 28 */}
                <div className="lg:col-span-3 space-y-3">
                  <h4 className="font-bold text-slate-900 text-sm">Audit Timeline</h4>

                  <div className="relative pl-6 space-y-5 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 text-xs">
                    {selectedAudit.timeline.map((item, idx) => (
                      <div key={idx} className="relative">
                        {/* Node Icon */}
                        {item.type === 'approved' ? (
                          <div className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center ring-4 ring-white shadow-xs">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        ) : item.type === 'progress' ? (
                          <div className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-[#6C2BD9] text-white flex items-center justify-center ring-4 ring-white shadow-xs">
                            <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                          </div>
                        ) : item.type === 'started' ? (
                          <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-[#6C2BD9] ring-4 ring-white shadow-xs" />
                        ) : item.type === 'completed' ? (
                          <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-white shadow-xs" />
                        ) : (
                          <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-slate-300 ring-4 ring-white shadow-xs" />
                        )}

                        <div className="text-[11px] text-slate-400 font-medium">
                          {item.time}
                        </div>
                        <p className={clsx(
                          'font-semibold text-xs mt-0.5',
                          item.type === 'progress' ? 'text-[#6C2BD9]' : 'text-slate-900'
                        )}>
                          {item.title}
                        </p>
                        {item.author && (
                          <p className="text-[11px] text-slate-500 mt-0.5">{item.author}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* TAB: ASSIGNED USERS */}
            {activeTab === 'users' && (
              <div className="space-y-4 text-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Assigned Auditors &amp; Supervisors</h4>
                    <p className="text-slate-500">Personnel authorized to execute scanning and physical verification in this audit</p>
                  </div>
                  <button
                    onClick={() => alert('Assign Users modal')}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#6C2BD9] text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Assign Users</span>
                  </button>
                </div>

                <div className="border border-slate-200 rounded-lg overflow-auto max-h-[300px]">
                  <table className="w-full text-left text-xs text-slate-600 border-collapse">
                    <thead className="sticky top-0 z-10 bg-slate-50 shadow-2xs text-slate-500 font-semibold text-[11px] border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3 w-8">#</th>
                        <th className="py-2.5 px-3">User Name</th>
                        <th className="py-2.5 px-3">Role</th>
                        <th className="py-2.5 px-3">Assigned Location</th>
                        <th className="py-2.5 px-3">Execution Authorization</th>
                        <th className="py-2.5 px-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedAudit.assignedUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-50/70">
                          <td className="py-3 px-3 text-slate-400 text-center">{u.id}</td>
                          <td className="py-3 px-3 font-semibold text-slate-900">{u.name}</td>
                          <td className="py-3 px-3 text-[#6C2BD9] font-semibold">{u.role}</td>
                          <td className="py-3 px-3 text-slate-700">{u.location}</td>
                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-[#6C2BD9] border border-purple-200">
                              Mobile &amp; Web Authorized
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {u.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB: EXPECTED ASSETS */}
            {activeTab === 'expected' && (
              <div className="space-y-4 text-xs">
                <div className="flex items-center justify-between p-3.5 bg-purple-50 rounded-xl border border-purple-200">
                  <div>
                    <h4 className="font-bold text-[#6C2BD9] text-sm">
                      Frozen Baseline Census ({selectedAudit.totalExpected} Assets)
                    </h4>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Baseline snapshot locked on audit creation. Asset Master edits will not overwrite this original population.
                    </p>
                  </div>
                  <button
                    onClick={() => navigate(`/stocktakes/execution/${selectedAudit.auditId}`)}
                    className="px-4 py-2 bg-[#6C2BD9] hover:bg-[#5b21b6] text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs"
                  >
                    Open Execution Grid
                  </button>
                </div>

                <div className="border border-slate-200 rounded-lg overflow-auto max-h-[300px]">
                  <table className="w-full text-left text-xs text-slate-600 border-collapse">
                    <thead className="sticky top-0 z-10 bg-slate-50 shadow-2xs text-slate-500 font-semibold text-[11px] border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">Asset No.</th>
                        <th className="py-2.5 px-3">Asset Name</th>
                        <th className="py-2.5 px-3">Category</th>
                        <th className="py-2.5 px-3">Expected Location</th>
                        <th className="py-2.5 px-3">Expected Custodian</th>
                        <th className="py-2.5 px-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {[
                        { no: 'AS-000123', name: 'Laptop - Dell 5440', cat: 'Laptops', loc: 'Block B > 1F > IT-101', cust: 'Sara Ali', st: 'Verified' },
                        { no: 'AS-000124', name: 'Monitor - Samsung', cat: 'Monitors', loc: 'Block B > 1F > IT-101', cust: 'Sara Ali', st: 'Moved' },
                        { no: 'AS-000125', name: 'Printer - HP', cat: 'Printers', loc: 'Block B > 2F > IT-201', cust: 'Layla Hassan', st: 'Verified' },
                        { no: 'AS-000126', name: 'Access Point - Cisco', cat: 'Network', loc: 'Block B > 2F > IT-201', cust: 'IT Team', st: 'Pending' }
                      ].map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/70">
                          <td className="py-3 px-3 font-mono font-bold text-[#6C2BD9]">{item.no}</td>
                          <td className="py-3 px-3 font-semibold text-slate-900">{item.name}</td>
                          <td className="py-3 px-3 text-slate-600">{item.cat}</td>
                          <td className="py-3 px-3 text-slate-500 text-[11px]">{item.loc}</td>
                          <td className="py-3 px-3 text-slate-700">{item.cust}</td>
                          <td className="py-3 px-3 text-center">
                            <span className={clsx(
                              'px-2 py-0.5 rounded text-[10px] font-bold border',
                              item.st === 'Verified' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                              item.st === 'Moved' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                              'bg-slate-100 text-slate-600 border-slate-200'
                            )}>
                              {item.st}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB: SCHEDULE */}
            {activeTab === 'schedule' && (
              <div className="space-y-4 text-xs">
                <h4 className="font-bold text-slate-900 text-sm">Campaign Timeline &amp; Schedule Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="space-y-2">
                    <span className="text-slate-500 block">Planned Start Date</span>
                    <span className="font-bold text-slate-900 text-sm">{selectedAudit.plannedStart}</span>
                  </div>
                  <div className="space-y-2">
                    <span className="text-slate-500 block">Planned End Date</span>
                    <span className="font-bold text-slate-900 text-sm">{selectedAudit.plannedEnd}</span>
                  </div>
                  <div className="col-span-2 pt-2 border-t border-slate-200 space-y-1">
                    <span className="text-slate-500 block">Audit Instructions</span>
                    <p className="text-slate-800 leading-relaxed">{selectedAudit.auditInstructions}</p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: APPROVALS */}
            {activeTab === 'approvals' && (
              <div className="space-y-4 text-xs">
                <h4 className="font-bold text-slate-900 text-sm">Approval Workflow Sign-Offs</h4>
                <div className="border border-slate-200 rounded-lg overflow-hidden divide-y divide-slate-100">
                  {selectedAudit.approvals.map((app, idx) => (
                    <div key={idx} className="p-3.5 flex items-center justify-between bg-white hover:bg-slate-50/50">
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-full bg-purple-100 text-[#6C2BD9] font-bold flex items-center justify-center text-xs">
                          {app.step}
                        </span>
                        <div>
                          <span className="font-bold text-slate-900 block">{app.role}</span>
                          <span className="text-slate-500 text-[11px]">{app.approver}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {app.status}
                        </span>
                        <span className="block text-[10px] text-slate-400 mt-1 font-mono">{app.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: EXCEPTIONS */}
            {activeTab === 'exceptions' && (
              <div className="space-y-4 text-xs">
                <div className="p-3.5 bg-rose-50 rounded-xl border border-rose-200 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-rose-900 text-sm">Discrepancies &amp; Exceptions ({selectedAudit.exceptions})</h4>
                    <p className="text-[11px] text-rose-700 mt-0.5">All variances must be reconciled before final campaign sign-off.</p>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs text-slate-600 border-collapse">
                    <thead className="bg-slate-50/80 text-slate-500 font-semibold text-[11px] border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">Asset No.</th>
                        <th className="py-2.5 px-3">Discrepancy Type</th>
                        <th className="py-2.5 px-3">System Location</th>
                        <th className="py-2.5 px-3">Observed Location</th>
                        <th className="py-2.5 px-3 text-center">Resolution Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr className="hover:bg-slate-50/70">
                        <td className="py-3 px-3 font-mono font-bold text-[#6C2BD9]">AS-000124</td>
                        <td className="py-3 px-3 text-amber-700 font-semibold">Location Variance (Moved)</td>
                        <td className="py-3 px-3">Block B &gt; 1F &gt; IT-101</td>
                        <td className="py-3 px-3 font-bold text-slate-900">Block B &gt; 2F &gt; IT-201</td>
                        <td className="py-3 px-3 text-center">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            Pending Reconciliation
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB: ATTACHMENTS */}
            {activeTab === 'attachments' && (
              <div className="space-y-4 text-xs">
                <h4 className="font-bold text-slate-900 text-sm">Supporting Documents ({selectedAudit.attachments})</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { name: 'Audit_Plan_Approval.pdf', size: '420 KB' },
                    { name: 'Location_Scope_Map.pdf', size: '1.2 MB' },
                    { name: 'Sample_Checklist_Template.xlsx', size: '210 KB' }
                  ].map((doc, i) => (
                    <div key={i} className="p-3 border border-slate-200 rounded-xl bg-slate-50/50 flex items-center justify-between">
                      <div className="flex items-center gap-2.5 truncate">
                        <Paperclip className="w-4 h-4 text-[#6C2BD9] shrink-0" />
                        <div className="truncate">
                          <p className="font-semibold text-slate-800 truncate">{doc.name}</p>
                          <p className="text-[10px] text-slate-400">{doc.size}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: NOTES */}
            {activeTab === 'notes' && (
              <div className="space-y-4 text-xs">
                <h4 className="font-bold text-slate-900 text-sm">Audit Campaign Notes</h4>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 leading-relaxed">
                  Annual physical verification of all IT assets at Dubai HQ - Block B including laptops, desktops, monitors and peripherals. Scoped per FSD compliance mandate #AUD-9420.
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}

export default AuditManagement;
