import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { 
  Wrench, 
  Plus, 
  CheckCircle, 
  Clock, 
  Search, 
  Filter, 
  RefreshCw, 
  X, 
  AlertTriangle, 
  User, 
  Calendar, 
  DollarSign, 
  CheckSquare, 
  Square, 
  AlertCircle,
  FileText,
  Building,
  MapPin,
  ChevronRight,
  MoreHorizontal,
  ChevronDown,
  Paperclip,
  MessageSquare,
  Box,
  Edit,
  Info,
  Check,
  Zap,
  Tag,
  Shield,
  Save,
  Download,
  ListChecks,
  History,
  Layers,
  Settings
} from 'lucide-react';

// EXACT MOCK PREVENTIVE SCHEDULES DATA FROM SCREENSHOT
const EXACT_MOCK_SCHEDULES = [
  {
    id: 'pms-1',
    scheduleNo: 'PMS-2026-0001',
    assetNo: 'AS-00087',
    assetName: 'AC Unit - Office',
    scheduleType: 'Preventive',
    isMeterBased: false,
    frequency: '3 Months',
    repeatEvery: 3,
    repeatUnit: 'Months',
    startDate: '2026-01-01',
    nextDueDate: '15 Sep 2026',
    status: 'Due Soon',
    category: 'HVAC',
    location: 'Dubai HQ - Block B',
    checklistTemplate: 'AC PM Checklist',
    serviceProvider: 'Al Futtaim AMC',
    description: 'Quarterly preventive maintenance for all AC units including cleaning, filter replacement, performance check and safety inspection.',
    autoGenerateWo: true,
    sendNotification: true,
    notificationDays: 7,
    requireChecklist: true,
    updateAssetNextService: false,
    notifyProvider: false
  },
  {
    id: 'pms-2',
    scheduleNo: 'PMS-2026-0002',
    assetNo: 'AS-000065',
    assetName: 'Generator',
    scheduleType: 'Preventive',
    isMeterBased: true,
    frequency: '250 Hours',
    repeatEvery: 250,
    repeatUnit: 'Hours',
    startDate: '2026-01-01',
    nextDueDate: '18 Sep 2026',
    status: 'Due Soon',
    category: 'Power Equipment',
    location: 'Plant Room',
    checklistTemplate: 'Generator PM Checklist',
    serviceProvider: 'Al Futtaim Power AMC',
    description: 'Load testing, oil filter replacement and battery voltage check for 250 KVA diesel generator.',
    autoGenerateWo: true,
    sendNotification: true,
    notificationDays: 7,
    requireChecklist: true,
    updateAssetNextService: true,
    notifyProvider: true
  },
  {
    id: 'pms-3',
    scheduleNo: 'PMS-2026-0003',
    assetNo: 'AS-000113',
    assetName: 'Fire Pump',
    scheduleType: 'Preventive',
    isMeterBased: false,
    frequency: '6 Months',
    repeatEvery: 6,
    repeatUnit: 'Months',
    startDate: '2026-01-01',
    nextDueDate: '20 Sep 2026',
    status: 'Scheduled',
    category: 'Safety Equipment',
    location: 'Block A > GF',
    checklistTemplate: 'Fire Safety Checklist',
    serviceProvider: 'National Fire Safety LLC',
    description: 'Biannual statutory fire pump pressure audit, nozzle test and emergency power transfer test.',
    autoGenerateWo: true,
    sendNotification: true,
    notificationDays: 14,
    requireChecklist: true,
    updateAssetNextService: false,
    notifyProvider: false
  },
  {
    id: 'pms-4',
    scheduleNo: 'PMS-2026-0004',
    assetNo: 'AS-00045',
    assetName: 'Elevator - 01',
    scheduleType: 'Preventive',
    isMeterBased: false,
    frequency: '1 Month',
    repeatEvery: 1,
    repeatUnit: 'Months',
    startDate: '2026-01-01',
    nextDueDate: '22 Sep 2026',
    status: 'Overdue',
    category: 'Lifts & Elevators',
    location: 'Block A > 1F',
    checklistTemplate: 'Elevator Safety Checklist',
    serviceProvider: 'Otis Elevator AMC',
    description: 'Monthly statutory elevator brake lining check, cable tension test and door sensor calibration.',
    autoGenerateWo: true,
    sendNotification: true,
    notificationDays: 3,
    requireChecklist: true,
    updateAssetNextService: true,
    notifyProvider: true
  },
  {
    id: 'pms-5',
    scheduleNo: 'PMS-2026-0005',
    assetNo: 'AS-000222',
    assetName: 'UPS System',
    scheduleType: 'Preventive',
    isMeterBased: false,
    frequency: '3 Months',
    repeatEvery: 3,
    repeatUnit: 'Months',
    startDate: '2026-01-01',
    nextDueDate: '25 Sep 2026',
    status: 'Scheduled',
    category: 'IT Equipment',
    location: 'IT Room',
    checklistTemplate: 'UPS Battery Checklist',
    serviceProvider: 'Schneider Electric AMC',
    description: 'Quarterly UPS battery bank internal impedance check and load transfer test.',
    autoGenerateWo: true,
    sendNotification: true,
    notificationDays: 7,
    requireChecklist: true,
    updateAssetNextService: false,
    notifyProvider: false
  },
  {
    id: 'pms-6',
    scheduleNo: 'PMS-2026-0006',
    assetNo: 'AS-000176',
    assetName: 'Chiller Plant',
    scheduleType: 'Preventive',
    isMeterBased: false,
    frequency: '6 Months',
    repeatEvery: 6,
    repeatUnit: 'Months',
    startDate: '2026-01-01',
    nextDueDate: '28 Sep 2026',
    status: 'Scheduled',
    category: 'HVAC',
    location: 'Chiller Room',
    checklistTemplate: 'Chiller Maintenance Checklist',
    serviceProvider: 'Carrier Gulf AMC',
    description: 'Semi-annual central chiller plant compressor inspection, refrigerant level test and condenser coil wash.',
    autoGenerateWo: true,
    sendNotification: true,
    notificationDays: 7,
    requireChecklist: true,
    updateAssetNextService: true,
    notifyProvider: true
  },
  {
    id: 'pms-7',
    scheduleNo: 'PMS-2026-0007',
    assetNo: 'AS-000198',
    assetName: 'Lighting Panel',
    scheduleType: 'Preventive',
    isMeterBased: false,
    frequency: '1 Year',
    repeatEvery: 1,
    repeatUnit: 'Years',
    startDate: '2026-01-01',
    nextDueDate: '10 Oct 2026',
    status: 'Scheduled',
    category: 'Electrical',
    location: 'Main Substation',
    checklistTemplate: 'Electrical Panel Inspection',
    serviceProvider: 'Internal Electrical Team',
    description: 'Annual main distribution board thermographic scan, breaker torque test and earth resistance audit.',
    autoGenerateWo: false,
    sendNotification: true,
    notificationDays: 14,
    requireChecklist: false,
    updateAssetNextService: false,
    notifyProvider: false
  },
  {
    id: 'pms-8',
    scheduleNo: 'PMS-2026-0008',
    assetNo: 'AS-000201',
    assetName: 'Water Pump',
    scheduleType: 'Meter Based',
    isMeterBased: true,
    frequency: '500 Hours',
    repeatEvery: 500,
    repeatUnit: 'Hours',
    startDate: '2026-01-01',
    nextDueDate: '12 Oct 2026',
    status: 'Scheduled',
    category: 'Mechanical',
    location: 'Pump Room',
    checklistTemplate: 'Pump Maintenance Checklist',
    serviceProvider: 'Internal Mechanical Team',
    description: 'Chilled water booster pump bearing lubrication and mechanical seal inspection.',
    autoGenerateWo: true,
    sendNotification: true,
    notificationDays: 7,
    requireChecklist: true,
    updateAssetNextService: false,
    notifyProvider: false
  },
  {
    id: 'pms-9',
    scheduleNo: 'PMS-2026-0009',
    assetNo: 'AS-000210',
    assetName: 'Air Compressor',
    scheduleType: 'Preventive',
    isMeterBased: false,
    frequency: '3 Months',
    repeatEvery: 3,
    repeatUnit: 'Months',
    startDate: '2026-01-01',
    nextDueDate: '15 Oct 2026',
    status: 'Scheduled',
    category: 'Mechanical',
    location: 'Workshop',
    checklistTemplate: 'Compressor Maintenance Checklist',
    serviceProvider: 'Atlas Copco AMC',
    description: 'Quarterly air compressor filter drain, oil moisture test and belt tension check.',
    autoGenerateWo: true,
    sendNotification: true,
    notificationDays: 7,
    requireChecklist: true,
    updateAssetNextService: true,
    notifyProvider: true
  },
  {
    id: 'pms-10',
    scheduleNo: 'PMS-2026-0010',
    assetNo: 'AS-000225',
    assetName: 'Forklift',
    scheduleType: 'Meter Based',
    isMeterBased: true,
    frequency: '250 Hours',
    repeatEvery: 250,
    repeatUnit: 'Hours',
    startDate: '2026-01-01',
    nextDueDate: '18 Oct 2026',
    status: 'Scheduled',
    category: 'Material Handling',
    location: 'Warehouse',
    checklistTemplate: 'Forklift PM Checklist',
    serviceProvider: 'Toyota Material Handling AMC',
    description: 'Warehouse electric forklift hydraulic oil check, chain tension test and tire inspection.',
    autoGenerateWo: true,
    sendNotification: true,
    notificationDays: 5,
    requireChecklist: true,
    updateAssetNextService: false,
    notifyProvider: false
  }
];

// LOWER TAB UPCOMING SCHEDULES MOCK DATA FROM SCREENSHOT
const EXACT_UPCOMING_SCHEDULES = [
  { dueDate: '15 Sep 2026', scheduleNo: 'PMS-2026-0001', assetNo: 'AS-00087', assetName: 'AC Unit - Office', location: 'Block B > 2F', type: 'Preventive', status: 'Due Soon' },
  { dueDate: '18 Sep 2026', scheduleNo: 'PMS-2026-0002', assetNo: 'AS-000065', assetName: 'Generator', location: 'Plant Room', type: 'Preventive', status: 'Due Soon' },
  { dueDate: '20 Sep 2026', scheduleNo: 'PMS-2026-0003', assetNo: 'AS-000113', assetName: 'Fire Pump', location: 'Block A > GF', type: 'Inspection', status: 'Scheduled' },
  { dueDate: '22 Sep 2026', scheduleNo: 'PMS-2026-0004', assetNo: 'AS-000045', assetName: 'Elevator - 01', location: 'Block A > 1F', type: 'Preventive', status: 'Overdue' },
  { dueDate: '25 Sep 2026', scheduleNo: 'PMS-2026-0005', assetNo: 'AS-000222', assetName: 'UPS System', location: 'IT Room', type: 'Preventive', status: 'Scheduled' }
];

export function PreventiveMaintenance() {
  const navigate = useNavigate();

  // Master Data & State
  const [schedules, setSchedules] = useState(EXACT_MOCK_SCHEDULES);
  const [selectedScheduleId, setSelectedScheduleId] = useState('pms-1');
  const [activeBottomTab, setActiveBottomTab] = useState('UPCOMING'); // UPCOMING | COMPLETED | OVERDUE | GENERATED_WO
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [toast, setToast] = useState(null);

  // Filters State
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [locationFilter, setLocationFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dueInFilter, setDueInFilter] = useState('Next 30 Days');
  const [fromDate, setFromDate] = useState('01 Sep 2026');
  const [toDate, setToDate] = useState('30 Sep 2026');

  // Pagination State (Main Grid)
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Selected Schedule Reference
  const selectedSchedule = useMemo(() => {
    return schedules.find(s => s.id === selectedScheduleId) || schedules[0];
  }, [schedules, selectedScheduleId]);

  // Form State for Right Side Schedule Details Panel
  const [detailsForm, setDetailsForm] = useState({
    scheduleNo: selectedSchedule.scheduleNo,
    assetNo: selectedSchedule.assetNo,
    assetName: selectedSchedule.assetName,
    category: selectedSchedule.category,
    location: selectedSchedule.location,
    scheduleType: selectedSchedule.scheduleType,
    isMeterBased: selectedSchedule.isMeterBased,
    repeatEvery: selectedSchedule.repeatEvery,
    repeatUnit: selectedSchedule.repeatUnit,
    startDate: selectedSchedule.startDate,
    nextDueDate: selectedSchedule.nextDueDate,
    checklistTemplate: selectedSchedule.checklistTemplate,
    serviceProvider: selectedSchedule.serviceProvider,
    description: selectedSchedule.description,
    autoGenerateWo: selectedSchedule.autoGenerateWo,
    sendNotification: selectedSchedule.sendNotification,
    notificationDays: selectedSchedule.notificationDays,
    requireChecklist: selectedSchedule.requireChecklist,
    updateAssetNextService: selectedSchedule.updateAssetNextService,
    notifyProvider: selectedSchedule.notifyProvider
  });

  // Sync Form Data when selection changes
  useEffect(() => {
    if (selectedSchedule) {
      setDetailsForm({
        scheduleNo: selectedSchedule.scheduleNo,
        assetNo: selectedSchedule.assetNo,
        assetName: selectedSchedule.assetName,
        category: selectedSchedule.category || 'HVAC',
        location: selectedSchedule.location || 'Dubai HQ - Block B',
        scheduleType: selectedSchedule.scheduleType || 'Preventive',
        isMeterBased: Boolean(selectedSchedule.isMeterBased),
        repeatEvery: selectedSchedule.repeatEvery || 3,
        repeatUnit: selectedSchedule.repeatUnit || 'Months',
        startDate: selectedSchedule.startDate || '2026-01-01',
        nextDueDate: selectedSchedule.nextDueDate || '15 Sep 2026',
        checklistTemplate: selectedSchedule.checklistTemplate || 'AC PM Checklist',
        serviceProvider: selectedSchedule.serviceProvider || 'Al Futtaim AMC',
        description: selectedSchedule.description || 'Quarterly preventive maintenance for all AC units including cleaning, filter replacement, performance check and safety inspection.',
        autoGenerateWo: Boolean(selectedSchedule.autoGenerateWo),
        sendNotification: Boolean(selectedSchedule.sendNotification),
        notificationDays: selectedSchedule.notificationDays || 7,
        requireChecklist: Boolean(selectedSchedule.requireChecklist),
        updateAssetNextService: Boolean(selectedSchedule.updateAssetNextService),
        notifyProvider: Boolean(selectedSchedule.notifyProvider)
      });
    }
  }, [selectedSchedule]);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // Filtered Main Schedules List
  const filteredSchedules = useMemo(() => {
    return schedules.filter(s => {
      const matchesCat = categoryFilter === 'ALL' || s.category === categoryFilter;
      const matchesLoc = locationFilter === 'ALL' || s.location.includes(locationFilter);
      const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;

      return matchesCat && matchesLoc && matchesStatus;
    });
  }, [schedules, categoryFilter, locationFilter, statusFilter]);

  const totalRecords = 24; // Matching screenshot counter
  const paginatedSchedules = useMemo(() => {
    return filteredSchedules.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  }, [filteredSchedules, currentPage, pageSize]);

  // Handlers
  const handleGenerateWorkOrders = async () => {
    setGenerating(true);
    try {
      showToast('success', 'Batch generated 2 work orders from due PM schedules (WO-2026-00026, WO-2026-00027)!');
    } catch (e) {
      console.error(e);
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveSchedule = (e) => {
    e.preventDefault();
    const updatedSchedules = schedules.map(s => {
      if (s.id === selectedScheduleId) {
        return { ...s, ...detailsForm };
      }
      return s;
    });

    setSchedules(updatedSchedules);
    showToast('success', `Schedule ${selectedSchedule.scheduleNo} updated and saved!`);
  };

  const handleCreateNewScheduleMode = () => {
    const newId = `pms-${Date.now()}`;
    const newScheduleNo = `PMS-2026-00${schedules.length + 1}`;
    const newSchedule = {
      id: newId,
      scheduleNo: newScheduleNo,
      assetNo: 'AS-00087',
      assetName: 'AC Unit - Office',
      scheduleType: 'Preventive',
      isMeterBased: false,
      frequency: '3 Months',
      repeatEvery: 3,
      repeatUnit: 'Months',
      startDate: '2026-01-01',
      nextDueDate: '15 Sep 2026',
      status: 'Scheduled',
      category: 'HVAC',
      location: 'Dubai HQ - Block B',
      checklistTemplate: 'AC PM Checklist',
      serviceProvider: 'Al Futtaim AMC',
      description: 'Define schedule description...',
      autoGenerateWo: true,
      sendNotification: true,
      notificationDays: 7,
      requireChecklist: true,
      updateAssetNextService: false,
      notifyProvider: false
    };

    setSchedules([newSchedule, ...schedules]);
    setSelectedScheduleId(newId);
    showToast('success', `Created new schedule slot ${newScheduleNo}. Edit in right panel.`);
  };

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'Due Soon':
        return 'bg-amber-100 text-amber-800 border-amber-300 font-bold';
      case 'Overdue':
        return 'bg-rose-100 text-rose-800 border-rose-300 font-bold';
      case 'Scheduled':
        return 'bg-sky-100 text-sky-800 border-sky-300 font-bold';
      case 'Completed':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  return (
    <div className="space-y-4 text-xs font-sans bg-[#F8FAFC] min-h-screen p-2 sm:p-3">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl border shadow-xl flex items-center gap-3 backdrop-blur-md transition-all ${
          toast.type === 'success' ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-rose-50 border-rose-300 text-rose-900'
        }`}>
          <CheckCircle className="w-5 h-5 text-emerald-600" />
          <span className="text-xs font-bold">{toast.message}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* BREADCRUMB & PAGE HEADER MATCHING SCREENSHOT */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
            <span>Maintenance</span>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            <span className="text-[#6C2BD9] font-bold">Preventive Maintenance</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 mt-1">
            Preventive Maintenance
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage scheduled preventive maintenance and generate work orders
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleCreateNewScheduleMode}
            className="px-4 py-2 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white font-bold rounded-lg shadow-xs flex items-center gap-1.5 text-xs transition-all"
          >
            <Plus className="w-4 h-4" /> Create PM Schedule
          </button>
          
          <button
            onClick={handleGenerateWorkOrders}
            disabled={generating}
            className="px-4 py-2 bg-white border border-purple-600 text-purple-700 hover:bg-purple-50 font-bold rounded-lg shadow-2xs text-xs flex items-center gap-1.5"
          >
            <Settings className={`w-4 h-4 text-purple-600 ${generating ? 'animate-spin' : ''}`} /> Generate Work Orders
          </button>

          <button
            onClick={() => showToast('success', 'Exporting PM schedules to Excel...')}
            className="px-4 py-2 bg-white border border-[#6C2BD9] text-[#6C2BD9] hover:bg-purple-50 font-bold rounded-lg shadow-2xs text-xs flex items-center gap-1.5"
          >
            <Download className="w-4 h-4 text-[#6C2BD9]" /> Export
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SEARCH AND FILTERS BAR MATCHING SCREENSHOT */}
      {/* ========================================================================= */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-8 gap-2.5 items-end">
          
          {/* Asset Category */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700">Asset Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-medium"
            >
              <option value="ALL">All</option>
              <option value="HVAC">HVAC</option>
              <option value="Power Equipment">Power Equipment</option>
              <option value="Safety Equipment">Safety Equipment</option>
            </select>
          </div>

          {/* Location */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700">Location</label>
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-medium"
            >
              <option value="ALL">All Locations</option>
              <option value="Block B">Dubai HQ - Block B</option>
              <option value="Plant Room">Plant Room</option>
            </select>
          </div>

          {/* Schedule Status */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700">Schedule Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-medium"
            >
              <option value="ALL">All</option>
              <option value="Due Soon">Due Soon</option>
              <option value="Overdue">Overdue</option>
              <option value="Scheduled">Scheduled</option>
            </select>
          </div>

          {/* Due In */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700">Due In</label>
            <select
              value={dueInFilter}
              onChange={(e) => setDueInFilter(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-medium"
            >
              <option value="Next 30 Days">Next 30 Days</option>
              <option value="Next 7 Days">Next 7 Days</option>
              <option value="This Month">This Month</option>
            </select>
          </div>

          {/* From Date */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700">From Date</label>
            <div className="relative">
              <input
                type="text"
                readOnly
                value={fromDate}
                className="w-full bg-white border border-slate-300 rounded-lg pl-2.5 pr-7 py-1.5 text-xs text-slate-900 font-mono"
              />
              <Calendar className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* To Date */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700">To Date</label>
            <div className="relative">
              <input
                type="text"
                readOnly
                value={toDate}
                className="w-full bg-white border border-slate-300 rounded-lg pl-2.5 pr-7 py-1.5 text-xs text-slate-900 font-mono"
              />
              <Calendar className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="lg:col-span-2 flex items-center gap-2">
            <button
              onClick={() => {}}
              className="flex-1 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white font-bold py-1.5 px-3 rounded-lg shadow-xs flex items-center justify-center gap-1 text-xs"
            >
              <Search className="w-3.5 h-3.5" /> Search
            </button>
            <button
              onClick={() => {
                setCategoryFilter('ALL');
                setLocationFilter('ALL');
                setStatusFilter('ALL');
                setDueInFilter('Next 30 Days');
              }}
              className="bg-white hover:bg-slate-50 border border-[#6C2BD9] text-[#6C2BD9] font-bold py-1.5 px-3 rounded-lg shadow-2xs text-xs whitespace-nowrap"
            >
              Clear
            </button>
          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* MAIN WORKSPACE SPLIT LAYOUT: GRID (LEFT 8) & SCHEDULE DETAILS (RIGHT 4) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        
        {/* LEFT COLUMN: PREVENTIVE MAINTENANCE LIST TABLE (8 Columns wide) */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 shadow-2xs p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              Preventive Maintenance List ({totalRecords})
            </h3>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#F8FAFC] text-slate-700 font-bold text-[11px] border-b border-slate-200">
                <tr>
                  <th className="p-2.5 text-center w-8">
                    <input type="checkbox" className="rounded border-slate-300" />
                  </th>
                  <th className="p-2.5">Schedule No.</th>
                  <th className="p-2.5">Asset No.</th>
                  <th className="p-2.5">Asset Name</th>
                  <th className="p-2.5">Schedule Type</th>
                  <th className="p-2.5">Frequency</th>
                  <th className="p-2.5">Next Due Date</th>
                  <th className="p-2.5 text-center">Status</th>
                  <th className="p-2.5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium">
                {paginatedSchedules.map((s) => {
                  const isSelected = selectedScheduleId === s.id;

                  return (
                    <tr 
                      key={s.id}
                      onClick={() => setSelectedScheduleId(s.id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-purple-50/60 font-semibold' : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="p-2.5 text-center" onClick={(e) => e.stopPropagation()}>
                        <input type="checkbox" checked={isSelected} onChange={() => setSelectedScheduleId(s.id)} className="rounded border-slate-300" />
                      </td>
                      <td className="p-2.5 font-mono text-[#6C2BD9] font-bold hover:underline">
                        {s.scheduleNo}
                      </td>
                      <td className="p-2.5 font-mono text-[#6C2BD9]">
                        {s.assetNo}
                      </td>
                      <td className="p-2.5 font-bold text-slate-900">
                        {s.assetName}
                      </td>
                      <td className="p-2.5 text-slate-800">
                        {s.scheduleType}
                      </td>
                      <td className="p-2.5 text-slate-900 font-medium">
                        {s.frequency}
                      </td>
                      <td className="p-2.5 font-mono text-slate-600 whitespace-nowrap">
                        {s.nextDueDate}
                      </td>
                      <td className="p-2.5 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] border ${getStatusBadgeStyle(s.status)}`}>
                          {s.status}
                        </span>
                      </td>
                      <td className="p-2.5 text-center" onClick={(e) => e.stopPropagation()}>
                        <button className="p-1 hover:bg-slate-200 rounded text-slate-600">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls Matching Screenshot */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <span className="text-xs text-slate-500">
              Showing 1 to 10 of 24 records
            </span>

            <div className="flex items-center gap-1.5">
              <button className="px-2 py-1 bg-white border border-slate-300 text-slate-600 rounded text-xs hover:bg-slate-50 font-bold">&lt;</button>
              <button className="px-2.5 py-1 bg-[#6C2BD9] text-white font-bold rounded text-xs shadow-2xs">1</button>
              <button className="px-2.5 py-1 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded text-xs font-bold">2</button>
              <button className="px-2.5 py-1 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded text-xs font-bold">3</button>
              <button className="px-2 py-1 bg-white border border-slate-300 text-slate-600 rounded text-xs hover:bg-slate-50 font-bold">&gt;</button>

              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="ml-2 bg-white border border-slate-300 rounded px-2 py-1 text-xs text-slate-700 font-medium"
              >
                <option value={10}>10 / page</option>
                <option value={20}>20 / page</option>
              </select>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: SCHEDULE DETAILS PANEL MATCHING SCREENSHOT */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 shadow-2xs p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Schedule Details</h3>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded text-[10px] font-bold">
                Active
              </span>
              <button 
                onClick={() => showToast('success', `Edit mode enabled for ${selectedSchedule.scheduleNo}`)}
                className="px-3 py-1 bg-white border border-[#6C2BD9] text-[#6C2BD9] hover:bg-purple-50 font-bold rounded-md text-xs flex items-center gap-1 shadow-2xs"
              >
                <Edit className="w-3.5 h-3.5 text-[#6C2BD9]" /> Edit
              </button>
            </div>
          </div>

          <form onSubmit={handleSaveSchedule} className="space-y-3.5">
            
            {/* Schedule No */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700">Schedule No.</label>
              <input
                type="text"
                readOnly
                value={selectedSchedule.scheduleNo}
                className="w-full bg-slate-100 border border-slate-200 rounded-lg p-2 text-xs font-mono font-bold text-slate-600 cursor-not-allowed"
              />
            </div>

            {/* Asset No & Asset Name */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700">Asset No.</label>
                <div className="relative">
                  <input
                    type="text"
                    readOnly
                    value={detailsForm.assetNo}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-mono font-bold text-[#6C2BD9]"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700">Asset Name</label>
                <input
                  type="text"
                  readOnly
                  value={detailsForm.assetName}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-900"
                />
              </div>
            </div>

            {/* Asset Category & Location */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700">Asset Category</label>
                <select
                  value={detailsForm.category}
                  onChange={(e) => setDetailsForm({ ...detailsForm, category: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-medium text-slate-900"
                >
                  <option value="HVAC">HVAC</option>
                  <option value="Power Equipment">Power Equipment</option>
                  <option value="Safety Equipment">Safety Equipment</option>
                  <option value="Lifts & Elevators">Lifts &amp; Elevators</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700">Location</label>
                <div className="relative">
                  <input
                    type="text"
                    value={detailsForm.location}
                    onChange={(e) => setDetailsForm({ ...detailsForm, location: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-medium text-slate-900 pr-7"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Schedule Type & Frequency Radio Buttons */}
            <div className="grid grid-cols-2 gap-3 items-center">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700">Schedule Type</label>
                <select
                  value={detailsForm.scheduleType}
                  onChange={(e) => setDetailsForm({ ...detailsForm, scheduleType: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-medium text-slate-900"
                >
                  <option value="Preventive">Preventive</option>
                  <option value="Inspection">Inspection</option>
                  <option value="Meter Based">Meter Based</option>
                </select>
              </div>

              <div className="space-y-1 pt-3">
                <div className="flex items-center gap-3 text-xs font-medium text-slate-800">
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      name="frequencyRadio"
                      checked={!detailsForm.isMeterBased}
                      onChange={() => setDetailsForm({ ...detailsForm, isMeterBased: false })}
                      className="text-[#6C2BD9]"
                    />
                    Time Based
                  </label>

                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      name="frequencyRadio"
                      checked={detailsForm.isMeterBased}
                      onChange={() => setDetailsForm({ ...detailsForm, isMeterBased: true })}
                      className="text-[#6C2BD9]"
                    />
                    Meter Based
                  </label>
                </div>
              </div>
            </div>

            {/* Repeat Every & Unit Dropdown */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700">Repeat Every</label>
                <input
                  type="number"
                  value={detailsForm.repeatEvery}
                  onChange={(e) => setDetailsForm({ ...detailsForm, repeatEvery: Number(e.target.value) })}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-bold text-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700">Start Date</label>
                <select
                  value={detailsForm.repeatUnit}
                  onChange={(e) => setDetailsForm({ ...detailsForm, repeatUnit: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-medium text-slate-900"
                >
                  <option value="Months">Months</option>
                  <option value="Hours">Hours</option>
                  <option value="Days">Days</option>
                </select>
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700">Start Date *</label>
                <div className="relative">
                  <input
                    type="text"
                    readOnly
                    value="01 Jan 2026"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-mono font-medium"
                  />
                  <Calendar className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700">Next Due Date</label>
                <div className="relative">
                  <input
                    type="text"
                    readOnly
                    value={detailsForm.nextDueDate}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-mono font-medium"
                  />
                  <Calendar className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Checklist Template & Service Provider */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700">Checklist Template</label>
                <div className="relative">
                  <input
                    type="text"
                    value={detailsForm.checklistTemplate}
                    onChange={(e) => setDetailsForm({ ...detailsForm, checklistTemplate: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-medium text-slate-900 pr-7"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700">Service Provider / AMC</label>
                <div className="relative">
                  <input
                    type="text"
                    value={detailsForm.serviceProvider}
                    onChange={(e) => setDetailsForm({ ...detailsForm, serviceProvider: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-medium text-slate-900 pr-7"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700">Description</label>
              <textarea
                rows={3}
                maxLength={500}
                value={detailsForm.description}
                onChange={(e) => setDetailsForm({ ...detailsForm, description: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-medium text-slate-800 focus:outline-none"
              />
              <div className="text-right text-[10px] text-slate-400">
                100/500
              </div>
            </div>

            {/* ADDITIONAL SETTINGS SECTION */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <h4 className="text-xs font-bold text-[#6C2BD9]">Additional Settings</h4>

              <div className="space-y-2 text-xs font-medium text-slate-800">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={detailsForm.autoGenerateWo}
                    onChange={(e) => setDetailsForm({ ...detailsForm, autoGenerateWo: e.target.checked })}
                    className="rounded text-[#6C2BD9] focus:ring-[#6C2BD9]"
                  />
                  Automatically generate work order when due
                </label>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={detailsForm.sendNotification}
                      onChange={(e) => setDetailsForm({ ...detailsForm, sendNotification: e.target.checked })}
                      className="rounded text-[#6C2BD9] focus:ring-[#6C2BD9]"
                    />
                    Send notification before due date
                  </label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={detailsForm.notificationDays}
                      onChange={(e) => setDetailsForm({ ...detailsForm, notificationDays: Number(e.target.value) })}
                      className="w-12 bg-white border border-slate-300 rounded p-1 text-center font-bold text-xs"
                    />
                    <span className="text-[10px] font-bold text-slate-600">Days</span>
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={detailsForm.requireChecklist}
                    onChange={(e) => setDetailsForm({ ...detailsForm, requireChecklist: e.target.checked })}
                    className="rounded text-[#6C2BD9] focus:ring-[#6C2BD9]"
                  />
                  Require checklist completion
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={detailsForm.updateAssetNextService}
                    onChange={(e) => setDetailsForm({ ...detailsForm, updateAssetNextService: e.target.checked })}
                    className="rounded text-[#6C2BD9] focus:ring-[#6C2BD9]"
                  />
                  Update asset next service date
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={detailsForm.notifyProvider}
                    onChange={(e) => setDetailsForm({ ...detailsForm, notifyProvider: e.target.checked })}
                    className="rounded text-[#6C2BD9] focus:ring-[#6C2BD9]"
                  />
                  Notify service provider
                </label>
              </div>
            </div>

            {/* PANEL FOOTER ACTION BUTTONS */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => showToast('success', 'Changes discarded')}
                className="px-4 py-2 bg-white border border-[#6C2BD9] text-[#6C2BD9] hover:bg-purple-50 font-bold rounded-lg shadow-2xs text-xs"
              >
                Cancel
              </button>
              
              <button
                type="submit"
                className="px-5 py-2 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white font-bold rounded-lg shadow-xs text-xs"
              >
                Save Schedule
              </button>
            </div>

          </form>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* LOWER SECTION: CONTEXTUAL TABS (LEFT 8) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 shadow-2xs p-4 space-y-3">
          
          {/* Lower Tabs Bar */}
          <div className="flex items-center border-b border-slate-200 gap-6 overflow-x-auto">
            <button
              onClick={() => setActiveBottomTab('UPCOMING')}
              className={`pb-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                activeBottomTab === 'UPCOMING' ? 'border-[#6C2BD9] text-[#6C2BD9]' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Upcoming Schedules (10)
            </button>

            <button
              onClick={() => setActiveBottomTab('COMPLETED')}
              className={`pb-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                activeBottomTab === 'COMPLETED' ? 'border-[#6C2BD9] text-[#6C2BD9]' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Completed (32)
            </button>

            <button
              onClick={() => setActiveBottomTab('OVERDUE')}
              className={`pb-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                activeBottomTab === 'OVERDUE' ? 'border-[#6C2BD9] text-[#6C2BD9]' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Overdue (4)
            </button>

            <button
              onClick={() => setActiveBottomTab('GENERATED_WO')}
              className={`pb-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                activeBottomTab === 'GENERATED_WO' ? 'border-[#6C2BD9] text-[#6C2BD9]' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Generated Work Orders (28)
            </button>
          </div>

          {/* TAB 1: UPCOMING SCHEDULES TABLE MATCHING SCREENSHOT */}
          {activeBottomTab === 'UPCOMING' && (
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#F8FAFC] text-slate-700 font-bold border-b border-slate-200 text-[11px]">
                  <tr>
                    <th className="p-2.5">Due Date</th>
                    <th className="p-2.5">Schedule No.</th>
                    <th className="p-2.5">Asset No.</th>
                    <th className="p-2.5">Asset Name</th>
                    <th className="p-2.5">Location</th>
                    <th className="p-2.5">Type</th>
                    <th className="p-2.5 text-center">Status</th>
                    <th className="p-2.5 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {EXACT_UPCOMING_SCHEDULES.map((u, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-2.5 font-mono text-slate-600 whitespace-nowrap">{u.dueDate}</td>
                      <td className="p-2.5 font-mono font-bold text-[#6C2BD9] hover:underline">{u.scheduleNo}</td>
                      <td className="p-2.5 font-mono font-bold text-[#6C2BD9]">{u.assetNo}</td>
                      <td className="p-2.5 font-bold text-slate-900">{u.assetName}</td>
                      <td className="p-2.5 text-slate-800">{u.location}</td>
                      <td className="p-2.5 text-slate-800">{u.type}</td>
                      <td className="p-2.5 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] border ${getStatusBadgeStyle(u.status)}`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="p-2.5 text-center">
                        <button className="p-1 text-slate-500 hover:text-slate-900">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* OTHER TABS */}
          {activeBottomTab === 'COMPLETED' && (
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700 font-medium">
              Showing 32 completed preventive maintenance occurrences.
            </div>
          )}

          {activeBottomTab === 'OVERDUE' && (
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs text-rose-700 font-medium">
              Attention: 4 PM schedules have passed their due date/meter threshold without work order completion.
            </div>
          )}

          {activeBottomTab === 'GENERATED_WO' && (
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700">
              Showing 28 work orders generated from PM schedules. Click any WO number to navigate to details.
            </div>
          )}

        </div>

      </div>

    </div>
  );
}

export default PreventiveMaintenance;
