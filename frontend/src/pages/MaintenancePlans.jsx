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
  CheckCircle2
} from 'lucide-react';

// EXACT MOCK PLANS DATA FROM SCREENSHOT
const EXACT_MOCK_PLANS = [
  {
    id: 'mp-1',
    planNo: 'MP-2026-0001',
    planName: 'HVAC Quarterly Service',
    category: 'HVAC',
    type: 'Preventive',
    frequency: '3 Months',
    frequencyType: 'Calendar (Months)',
    frequencyValue: 3,
    status: 'Active',
    nextDueDate: '15 Oct 2026',
    startDate: '2026-01-01',
    description: 'Quarterly preventive maintenance for all HVAC units including cleaning, filter replacement, and performance check.',
    applyToRule: 'CATEGORY', // CATEGORY | LOCATION | FILTER | SPECIFIC | CUSTODIAN
    autoCreateWo: true,
    sendNotification: true,
    notificationDays: 7,
    linkAmc: false,
    amcContract: '',
    requireChecklist: true,
    checklistTemplate: 'HVAC Maintenance Checklist'
  },
  {
    id: 'mp-2',
    planNo: 'MP-2026-0002',
    planName: 'Generator Maintenance',
    category: 'Power Equipment',
    type: 'Preventive',
    frequency: '250 Hours',
    frequencyType: 'Usage (Hours)',
    frequencyValue: 250,
    status: 'Active',
    nextDueDate: '20 Sep 2026',
    startDate: '2026-01-01',
    description: 'Operating hours load testing, oil filter replacement and battery voltage check for diesel generators.',
    applyToRule: 'CATEGORY',
    autoCreateWo: true,
    sendNotification: true,
    notificationDays: 7,
    linkAmc: true,
    amcContract: 'Al Futtaim Power AMC',
    requireChecklist: true,
    checklistTemplate: 'Generator PM Checklist'
  },
  {
    id: 'mp-3',
    planNo: 'MP-2026-0003',
    planName: 'Fire System Inspection',
    category: 'Safety Equipment',
    type: 'Inspection',
    frequency: '6 Months',
    frequencyType: 'Calendar (Months)',
    frequencyValue: 6,
    status: 'Active',
    nextDueDate: '01 Nov 2026',
    startDate: '2026-01-01',
    description: 'Biannual statutory fire safety alarm testing, smoke detector audit and nozzle pressure verification.',
    applyToRule: 'LOCATION',
    autoCreateWo: true,
    sendNotification: true,
    notificationDays: 14,
    linkAmc: false,
    requireChecklist: true,
    checklistTemplate: 'General Safety Inspection'
  },
  {
    id: 'mp-4',
    planNo: 'MP-2026-0004',
    planName: 'Elevator Service',
    category: 'Lifts & Elevators',
    type: 'Preventive',
    frequency: '1 Month',
    frequencyType: 'Calendar (Months)',
    frequencyValue: 1,
    status: 'Active',
    nextDueDate: '05 Oct 2026',
    startDate: '2026-01-01',
    description: 'Monthly statutory elevator brake lining check, cable tension test and door sensor calibration.',
    applyToRule: 'SPECIFIC',
    autoCreateWo: true,
    sendNotification: true,
    notificationDays: 3,
    linkAmc: true,
    amcContract: 'Otis Elevator AMC',
    requireChecklist: true,
    checklistTemplate: 'Elevator Safety Checklist'
  },
  {
    id: 'mp-5',
    planNo: 'MP-2026-0005',
    planName: 'IT Equipment Check',
    category: 'IT Equipment',
    type: 'Inspection',
    frequency: '6 Months',
    frequencyType: 'Calendar (Months)',
    frequencyValue: 6,
    status: 'Active',
    nextDueDate: '12 Oct 2026',
    startDate: '2026-01-01',
    description: 'Server rack thermal audit, UPS bypass check and network cable integrity verification.',
    applyToRule: 'CATEGORY',
    autoCreateWo: false,
    sendNotification: true,
    notificationDays: 5,
    linkAmc: false,
    requireChecklist: false,
    checklistTemplate: ''
  },
  {
    id: 'mp-6',
    planNo: 'MP-2026-0006',
    planName: 'UPS Battery Test',
    category: 'IT Equipment',
    type: 'Preventive',
    frequency: '3 Months',
    frequencyType: 'Calendar (Months)',
    frequencyValue: 3,
    status: 'Active',
    nextDueDate: '30 Sep 2026',
    startDate: '2026-01-01',
    description: 'Quarterly UPS battery bank internal impedance check and load transfer test.',
    applyToRule: 'LOCATION',
    autoCreateWo: true,
    sendNotification: true,
    notificationDays: 7,
    linkAmc: false,
    requireChecklist: true,
    checklistTemplate: 'UPS Battery Checklist'
  },
  {
    id: 'mp-7',
    planNo: 'MP-2026-0007',
    planName: 'AC Unit Filter Replacement',
    category: 'HVAC',
    type: 'Preventive',
    frequency: '6 Months',
    frequencyType: 'Calendar (Months)',
    frequencyValue: 6,
    status: 'Inactive',
    nextDueDate: '-',
    startDate: '2026-01-01',
    description: 'Filter replacement plan (superseded by HVAC Quarterly Service MP-2026-0001).',
    applyToRule: 'CATEGORY',
    autoCreateWo: false,
    sendNotification: false,
    notificationDays: 0,
    linkAmc: false,
    requireChecklist: false,
    checklistTemplate: ''
  },
  {
    id: 'mp-8',
    planNo: 'MP-2026-0008',
    planName: 'Water Pump Service',
    category: 'Mechanical',
    type: 'Preventive',
    frequency: '500 Hours',
    frequencyType: 'Usage (Hours)',
    frequencyValue: 500,
    status: 'Active',
    nextDueDate: '18 Sep 2026',
    startDate: '2026-01-01',
    description: 'Chilled water booster pump bearing lubrication and mechanical seal replacement.',
    applyToRule: 'CATEGORY',
    autoCreateWo: true,
    sendNotification: true,
    notificationDays: 7,
    linkAmc: false,
    requireChecklist: true,
    checklistTemplate: 'Pump Maintenance Checklist'
  },
  {
    id: 'mp-9',
    planNo: 'MP-2026-0009',
    planName: 'Lighting System Check',
    category: 'Electrical',
    type: 'Inspection',
    frequency: '1 Year',
    frequencyType: 'Calendar (Months)',
    frequencyValue: 12,
    status: 'Active',
    nextDueDate: '10 Jan 2027',
    startDate: '2026-01-01',
    description: 'Annual emergency exit lighting battery test and lux level audit across facilities.',
    applyToRule: 'LOCATION',
    autoCreateWo: false,
    sendNotification: true,
    notificationDays: 14,
    linkAmc: false,
    requireChecklist: false,
    checklistTemplate: ''
  },
  {
    id: 'mp-10',
    planNo: 'MP-2026-0010',
    planName: 'Forklift Maintenance',
    category: 'Material Handling',
    type: 'Preventive',
    frequency: '250 Hours',
    frequencyType: 'Usage (Hours)',
    frequencyValue: 250,
    status: 'Active',
    nextDueDate: '22 Sep 2026',
    startDate: '2026-01-01',
    description: 'Warehouse electric forklift hydraulic oil check, chain tension test and tire inspection.',
    applyToRule: 'CATEGORY',
    autoCreateWo: true,
    sendNotification: true,
    notificationDays: 5,
    linkAmc: true,
    amcContract: 'Toyota Material Handling AMC',
    requireChecklist: true,
    checklistTemplate: 'Forklift PM Checklist'
  }
];

// APPLICABLE ASSETS EXACT MOCK DATA FROM SCREENSHOT
const EXACT_APPLICABLE_ASSETS = [
  { id: 1, assetNo: 'AS-00087', name: 'AC Unit - Office 1', location: 'Block B > 2F', lastService: '15 Jul 2026', nextDue: '15 Oct 2026', status: 'Active' },
  { id: 2, assetNo: 'AS-00088', name: 'AC Unit - Meeting Room', location: 'Block B > 2F', lastService: '15 Jul 2026', nextDue: '15 Oct 2026', status: 'Active' },
  { id: 3, assetNo: 'AS-00089', name: 'AC Unit - Server Room', location: 'Block B > 3F', lastService: '15 Jul 2026', nextDue: '15 Oct 2026', status: 'Active' },
  { id: 4, assetNo: 'AS-00090', name: 'AC Unit - Reception', location: 'Block A > 1F', lastService: '15 Jul 2026', nextDue: '15 Oct 2026', status: 'Active' },
  { id: 5, assetNo: 'AS-00091', name: 'AC Unit - Cafeteria', location: 'Block C > 1F', lastService: '15 Jul 2026', nextDue: '15 Oct 2026', status: 'Active' }
];

export function MaintenancePlans() {
  const navigate = useNavigate();

  // Primary State
  const [plans, setPlans] = useState(EXACT_MOCK_PLANS);
  const [selectedPlanId, setSelectedPlanId] = useState('mp-1');
  const [activeBottomTab, setActiveBottomTab] = useState('APPLICABLE_ASSETS'); // APPLICABLE_ASSETS | WORK_ORDERS | CHECKLIST | COMMENTS | HISTORY
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [locationFilter, setLocationFilter] = useState('ALL');

  // Pagination State (Main Grid)
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Pagination State (Applicable Assets Sub-table)
  const [assetPage, setAssetPage] = useState(1);

  // Selected Plan Object reference
  const selectedPlan = useMemo(() => {
    return plans.find(p => p.id === selectedPlanId) || plans[0];
  }, [plans, selectedPlanId]);

  // Form State for Right Side Plan Details Panel
  const [detailsForm, setDetailsForm] = useState({
    planName: selectedPlan.planName,
    category: selectedPlan.category,
    type: selectedPlan.type,
    status: selectedPlan.status,
    description: selectedPlan.description,
    frequencyType: selectedPlan.frequencyType,
    frequencyValue: selectedPlan.frequencyValue,
    startDate: selectedPlan.startDate,
    nextDueDate: selectedPlan.nextDueDate,
    applyToRule: selectedPlan.applyToRule,
    autoCreateWo: selectedPlan.autoCreateWo,
    sendNotification: selectedPlan.sendNotification,
    notificationDays: selectedPlan.notificationDays,
    linkAmc: selectedPlan.linkAmc,
    requireChecklist: selectedPlan.requireChecklist,
    checklistTemplate: selectedPlan.checklistTemplate
  });

  // Sync form data when selected plan changes
  useEffect(() => {
    if (selectedPlan) {
      setDetailsForm({
        planName: selectedPlan.planName,
        category: selectedPlan.category,
        type: selectedPlan.type,
        status: selectedPlan.status,
        description: selectedPlan.description,
        frequencyType: selectedPlan.frequencyType || 'Calendar (Months)',
        frequencyValue: selectedPlan.frequencyValue || 3,
        startDate: selectedPlan.startDate || '2026-01-01',
        nextDueDate: selectedPlan.nextDueDate || '15 Oct 2026',
        applyToRule: selectedPlan.applyToRule || 'CATEGORY',
        autoCreateWo: Boolean(selectedPlan.autoCreateWo),
        sendNotification: Boolean(selectedPlan.sendNotification),
        notificationDays: selectedPlan.notificationDays || 7,
        linkAmc: Boolean(selectedPlan.linkAmc),
        requireChecklist: Boolean(selectedPlan.requireChecklist),
        checklistTemplate: selectedPlan.checklistTemplate || 'HVAC Maintenance Checklist'
      });
    }
  }, [selectedPlan]);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // Fetch real plans if backend endpoint available
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await api.get('/maintenance/schedules').catch(() => null);
        if (res?.success && res.schedules?.length > 0) {
          // Backend sync note
        }
      } catch (e) {
        console.warn('Real backend sync note:', e.message);
      }
    };
    fetchPlans();
  }, []);

  // Filtered Main Plans List
  const filteredPlans = useMemo(() => {
    return plans.filter(p => {
      const s = searchQuery.toLowerCase().trim();
      const matchesSearch = !s || (
        p.planNo.toLowerCase().includes(s) ||
        p.planName.toLowerCase().includes(s) ||
        p.category.toLowerCase().includes(s)
      );

      const matchesCat = categoryFilter === 'ALL' || p.category === categoryFilter;
      const matchesType = typeFilter === 'ALL' || p.type === typeFilter;
      const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;

      return matchesSearch && matchesCat && matchesType && matchesStatus;
    });
  }, [plans, searchQuery, categoryFilter, typeFilter, statusFilter]);

  const totalRecords = filteredPlans.length;
  const paginatedPlans = useMemo(() => {
    return filteredPlans;
  }, [filteredPlans]);

  // Handlers
  const handleSavePlan = (e) => {
    e.preventDefault();
    const updatedPlans = plans.map(p => {
      if (p.id === selectedPlanId) {
        return { ...p, ...detailsForm };
      }
      return p;
    });

    setPlans(updatedPlans);
    showToast('success', `Maintenance Plan ${selectedPlan.planNo} saved and activated!`);
  };

  const handleCreateNewPlanMode = () => {
    const newId = `mp-${Date.now()}`;
    const newPlanNo = `MP-2026-00${plans.length + 1}`;
    const newPlan = {
      id: newId,
      planNo: newPlanNo,
      planName: 'New Maintenance Plan',
      category: 'HVAC',
      type: 'Preventive',
      frequency: '3 Months',
      frequencyType: 'Calendar (Months)',
      frequencyValue: 3,
      status: 'Active',
      nextDueDate: '15 Oct 2026',
      startDate: '2026-01-01',
      description: 'Define plan description...',
      applyToRule: 'CATEGORY',
      autoCreateWo: true,
      sendNotification: true,
      notificationDays: 7,
      linkAmc: false,
      requireChecklist: true,
      checklistTemplate: 'HVAC Maintenance Checklist'
    };

    setPlans([newPlan, ...plans]);
    setSelectedPlanId(newId);
    showToast('success', `Created new plan slot ${newPlanNo}. Configure details in the right panel.`);
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
            <span className="text-[#6C2BD9] font-bold">Maintenance Plans</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 mt-1">
            Maintenance Plans
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Define and manage preventive maintenance plans for assets
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCreateNewPlanMode}
            className="px-4 py-2 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white font-bold rounded-lg shadow-xs flex items-center gap-1.5 text-xs transition-all"
          >
            <Plus className="w-4 h-4" /> Create Maintenance Plan
          </button>
          
          <button
            onClick={() => showToast('success', 'Exporting maintenance plans to Excel...')}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5 items-end">
          
          {/* Search Input */}
          <div className="lg:col-span-2 space-y-1">
            <label className="text-[11px] font-bold text-slate-700">Search</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search by Plan No., Name, Asset Type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg pl-3 pr-8 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-[#6C2BD9] font-medium"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Asset Category Dropdown */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700">Asset Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-[#6C2BD9] font-medium"
            >
              <option value="ALL">All</option>
              <option value="HVAC">HVAC</option>
              <option value="Power Equipment">Power Equipment</option>
              <option value="Safety Equipment">Safety Equipment</option>
              <option value="Lifts & Elevators">Lifts &amp; Elevators</option>
              <option value="IT Equipment">IT Equipment</option>
            </select>
          </div>

          {/* Maintenance Type Dropdown */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700">Maintenance Type</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-[#6C2BD9] font-medium"
            >
              <option value="ALL">All</option>
              <option value="Preventive">Preventive</option>
              <option value="Inspection">Inspection</option>
            </select>
          </div>

          {/* Status Dropdown */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-[#6C2BD9] font-medium"
            >
              <option value="ALL">All</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          {/* Location Dropdown */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700">Location</label>
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-[#6C2BD9] font-medium"
            >
              <option value="ALL">All</option>
              <option value="Dubai HQ">Dubai HQ</option>
              <option value="Block B">Block B</option>
            </select>
          </div>

        </div>

        {/* Clear Filters Button */}
        <div className="flex justify-end mt-2 pt-2 border-t border-slate-100">
          <button
            onClick={() => {
              setSearchQuery('');
              setCategoryFilter('ALL');
              setTypeFilter('ALL');
              setStatusFilter('ALL');
              setLocationFilter('ALL');
            }}
            className="bg-white hover:bg-slate-50 border border-[#6C2BD9] text-[#6C2BD9] font-bold py-1.5 px-4 rounded-lg shadow-2xs text-xs"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MAIN WORKSPACE SPLIT LAYOUT: GRID (LEFT 8) & PLAN DETAILS (RIGHT 4) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        
        {/* LEFT COLUMN: MAINTENANCE PLANS TABLE (8 Columns wide) */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 shadow-2xs p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              Maintenance Plans ({totalRecords})
            </h3>
          </div>

          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <div className="overflow-auto max-h-[540px]">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 z-10 bg-[#F8FAFC] shadow-2xs text-slate-700 font-bold text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="p-2.5 text-center w-8">
                      <input type="checkbox" className="rounded border-slate-300" />
                    </th>
                    <th className="p-2.5">Plan No.</th>
                    <th className="p-2.5">Plan Name</th>
                    <th className="p-2.5">Asset Category</th>
                    <th className="p-2.5">Maintenance Type</th>
                    <th className="p-2.5">Frequency</th>
                    <th className="p-2.5 text-center">Status</th>
                    <th className="p-2.5">Next Due Date</th>
                    <th className="p-2.5 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-medium">
                  {paginatedPlans.map((plan) => {
                    const isSelected = selectedPlanId === plan.id;

                    return (
                      <tr 
                        key={plan.id}
                        onClick={() => setSelectedPlanId(plan.id)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'bg-purple-50/60 font-semibold' : 'hover:bg-slate-50'
                        }`}
                      >
                        <td className="p-2.5 text-center" onClick={(e) => e.stopPropagation()}>
                          <input type="checkbox" checked={isSelected} onChange={() => setSelectedPlanId(plan.id)} className="rounded border-slate-300" />
                        </td>
                        <td className="p-2.5 font-mono text-[#6C2BD9] font-bold hover:underline">
                          {plan.planNo}
                        </td>
                        <td className="p-2.5 font-bold text-slate-900">
                          {plan.planName}
                        </td>
                        <td className="p-2.5 text-slate-800">
                          {plan.category}
                        </td>
                        <td className="p-2.5 text-slate-800">
                          {plan.type}
                        </td>
                        <td className="p-2.5 text-slate-900 font-medium">
                          {plan.frequency}
                        </td>
                        <td className="p-2.5 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            plan.status === 'Active' 
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
                              : 'bg-slate-200 text-slate-600 border-slate-300'
                          }`}>
                            {plan.status}
                          </span>
                        </td>
                        <td className="p-2.5 font-mono text-slate-600 whitespace-nowrap">
                          {plan.nextDueDate}
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
            <div className="p-3 bg-white border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="font-medium text-slate-600">Showing {filteredPlans.length} records</span>
              <span className="text-slate-400">Scroll down to view all records</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: PLAN DETAILS PANEL MATCHING SCREENSHOT */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 shadow-2xs p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Plan Details</h3>
            <button 
              onClick={() => showToast('success', `Edit mode enabled for ${selectedPlan.planNo}`)}
              className="px-3 py-1 bg-white border border-[#6C2BD9] text-[#6C2BD9] hover:bg-purple-50 font-bold rounded-md text-xs flex items-center gap-1 shadow-2xs"
            >
              <Edit className="w-3.5 h-3.5 text-[#6C2BD9]" /> Edit
            </button>
          </div>

          <form onSubmit={handleSavePlan} className="space-y-3.5">
            
            {/* Plan No & Status */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700">Plan No.</label>
                <input
                  type="text"
                  readOnly
                  value={selectedPlan.planNo}
                  className="w-full bg-slate-100 border border-slate-200 rounded-lg p-2 text-xs font-mono font-bold text-slate-600 cursor-not-allowed"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700">Status</label>
                <select
                  value={detailsForm.status}
                  onChange={(e) => setDetailsForm({ ...detailsForm, status: e.target.value })}
                  className="w-full bg-emerald-50 border border-emerald-300 text-emerald-800 font-bold rounded-lg p-2 text-xs"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            {/* Plan Name */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700">Plan Name *</label>
              <input
                type="text"
                required
                value={detailsForm.planName}
                onChange={(e) => setDetailsForm({ ...detailsForm, planName: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-bold text-slate-900"
              />
            </div>

            {/* Asset Category & Maintenance Type */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700">Asset Category *</label>
                <select
                  value={detailsForm.category}
                  onChange={(e) => setDetailsForm({ ...detailsForm, category: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-medium text-slate-900"
                >
                  <option value="HVAC">HVAC</option>
                  <option value="Power Equipment">Power Equipment</option>
                  <option value="Safety Equipment">Safety Equipment</option>
                  <option value="Lifts & Elevators">Lifts &amp; Elevators</option>
                  <option value="IT Equipment">IT Equipment</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700">Maintenance Type *</label>
                <select
                  value={detailsForm.type}
                  onChange={(e) => setDetailsForm({ ...detailsForm, type: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-medium text-slate-900"
                >
                  <option value="Preventive">Preventive</option>
                  <option value="Inspection">Inspection</option>
                </select>
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

            {/* SCHEDULING SECTION */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <h4 className="text-xs font-bold text-[#6C2BD9]">Scheduling</h4>
              
              <div className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-7 space-y-1">
                  <label className="text-[10px] font-bold text-slate-700">Frequency Type</label>
                  <select
                    value={detailsForm.frequencyType}
                    onChange={(e) => setDetailsForm({ ...detailsForm, frequencyType: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded p-1.5 text-xs font-medium"
                  >
                    <option value="Calendar (Months)">Calendar (Months)</option>
                    <option value="Usage (Hours)">Usage (Hours)</option>
                  </select>
                </div>

                <div className="col-span-5 space-y-1">
                  <label className="text-[10px] font-bold text-slate-700">Every *</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={detailsForm.frequencyValue}
                      onChange={(e) => setDetailsForm({ ...detailsForm, frequencyValue: Number(e.target.value) })}
                      className="w-16 bg-white border border-slate-300 rounded p-1.5 text-xs font-bold text-center"
                    />
                    <span className="text-[10px] font-bold text-slate-600">Months</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-700">Start Date *</label>
                  <div className="relative">
                    <input
                      type="text"
                      readOnly
                      value="01 Jan 2026"
                      className="w-full bg-slate-50 border border-slate-300 rounded p-1.5 text-xs font-mono font-medium"
                    />
                    <Calendar className="w-3.5 h-3.5 text-slate-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-700">Next Due Date</label>
                  <div className="relative">
                    <input
                      type="text"
                      readOnly
                      value={detailsForm.nextDueDate}
                      className="w-full bg-slate-50 border border-slate-300 rounded p-1.5 text-xs font-mono font-medium"
                    />
                    <Calendar className="w-3.5 h-3.5 text-slate-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* APPLY TO SECTION */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <h4 className="text-xs font-bold text-[#6C2BD9]">Apply To</h4>
              
              <div className="grid grid-cols-2 gap-2 text-xs font-medium text-slate-800">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="applyToRule"
                    checked={detailsForm.applyToRule === 'CATEGORY'}
                    onChange={() => setDetailsForm({ ...detailsForm, applyToRule: 'CATEGORY' })}
                    className="text-[#6C2BD9] focus:ring-[#6C2BD9]"
                  />
                  All assets of selected category
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="applyToRule"
                    checked={detailsForm.applyToRule === 'SPECIFIC'}
                    onChange={() => setDetailsForm({ ...detailsForm, applyToRule: 'SPECIFIC' })}
                    className="text-[#6C2BD9] focus:ring-[#6C2BD9]"
                  />
                  Specific assets
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="applyToRule"
                    checked={detailsForm.applyToRule === 'LOCATION'}
                    onChange={() => setDetailsForm({ ...detailsForm, applyToRule: 'LOCATION' })}
                    className="text-[#6C2BD9] focus:ring-[#6C2BD9]"
                  />
                  Assets by location
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="applyToRule"
                    checked={detailsForm.applyToRule === 'CUSTODIAN'}
                    onChange={() => setDetailsForm({ ...detailsForm, applyToRule: 'CUSTODIAN' })}
                    className="text-[#6C2BD9] focus:ring-[#6C2BD9]"
                  />
                  Assets by user/custodian
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer col-span-2">
                  <input
                    type="radio"
                    name="applyToRule"
                    checked={detailsForm.applyToRule === 'FILTER'}
                    onChange={() => setDetailsForm({ ...detailsForm, applyToRule: 'FILTER' })}
                    className="text-[#6C2BD9] focus:ring-[#6C2BD9]"
                  />
                  Assets from asset filter
                </label>
              </div>
            </div>

            {/* ADDITIONAL SETTINGS SECTION */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <h4 className="text-xs font-bold text-[#6C2BD9]">Additional Settings</h4>

              <div className="space-y-2 text-xs font-medium text-slate-800">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={detailsForm.autoCreateWo}
                    onChange={(e) => setDetailsForm({ ...detailsForm, autoCreateWo: e.target.checked })}
                    className="rounded text-[#6C2BD9] focus:ring-[#6C2BD9]"
                  />
                  Automatically create work order
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
                    checked={detailsForm.linkAmc}
                    onChange={(e) => setDetailsForm({ ...detailsForm, linkAmc: e.target.checked })}
                    className="rounded text-[#6C2BD9] focus:ring-[#6C2BD9]"
                  />
                  Link to service provider/AMC
                </label>

                <div className="space-y-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={detailsForm.requireChecklist}
                      onChange={(e) => setDetailsForm({ ...detailsForm, requireChecklist: e.target.checked })}
                      className="rounded text-[#6C2BD9] focus:ring-[#6C2BD9]"
                    />
                    Require checklist
                  </label>
                  
                  {detailsForm.requireChecklist && (
                    <select
                      value={detailsForm.checklistTemplate}
                      onChange={(e) => setDetailsForm({ ...detailsForm, checklistTemplate: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded p-1.5 text-xs font-medium ml-6 w-[90%]"
                    >
                      <option value="HVAC Maintenance Checklist">HVAC Maintenance Checklist</option>
                      <option value="Generator PM Checklist">Generator PM Checklist</option>
                      <option value="Elevator Safety Checklist">Elevator Safety Checklist</option>
                    </select>
                  )}
                </div>
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
                Save Plan
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
              onClick={() => setActiveBottomTab('APPLICABLE_ASSETS')}
              className={`pb-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                activeBottomTab === 'APPLICABLE_ASSETS' ? 'border-[#6C2BD9] text-[#6C2BD9]' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Applicable Assets (25)
            </button>

            <button
              onClick={() => setActiveBottomTab('WORK_ORDERS')}
              className={`pb-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                activeBottomTab === 'WORK_ORDERS' ? 'border-[#6C2BD9] text-[#6C2BD9]' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Generated Work Orders (8)
            </button>

            <button
              onClick={() => setActiveBottomTab('CHECKLIST')}
              className={`pb-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                activeBottomTab === 'CHECKLIST' ? 'border-[#6C2BD9] text-[#6C2BD9]' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Checklist
            </button>

            <button
              onClick={() => setActiveBottomTab('COMMENTS')}
              className={`pb-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                activeBottomTab === 'COMMENTS' ? 'border-[#6C2BD9] text-[#6C2BD9]' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Comments (2)
            </button>

            <button
              onClick={() => setActiveBottomTab('HISTORY')}
              className={`pb-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                activeBottomTab === 'HISTORY' ? 'border-[#6C2BD9] text-[#6C2BD9]' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              History
            </button>
          </div>

          {/* TAB 1: APPLICABLE ASSETS TABLE MATCHING SCREENSHOT */}
          {activeBottomTab === 'APPLICABLE_ASSETS' && (
            <div className="space-y-2">
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <div className="overflow-auto max-h-[300px]">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="sticky top-0 z-10 bg-[#F8FAFC] shadow-2xs text-slate-700 font-bold border-b border-slate-200 text-[11px]">
                      <tr>
                        <th className="p-2.5 w-8">#</th>
                        <th className="p-2.5">Asset No.</th>
                        <th className="p-2.5">Asset Name</th>
                        <th className="p-2.5">Location</th>
                        <th className="p-2.5">Last Service Date</th>
                        <th className="p-2.5">Next Due Date</th>
                        <th className="p-2.5 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {EXACT_APPLICABLE_ASSETS.map((a) => (
                        <tr key={a.id} className="hover:bg-slate-50">
                          <td className="p-2.5 font-mono text-slate-500">{a.id}</td>
                          <td className="p-2.5 font-mono font-bold text-[#6C2BD9] hover:underline">{a.assetNo}</td>
                          <td className="p-2.5 font-bold text-slate-900">{a.name}</td>
                          <td className="p-2.5 text-slate-800">{a.location}</td>
                          <td className="p-2.5 font-mono text-slate-600">{a.lastService}</td>
                          <td className="p-2.5 font-mono text-slate-600">{a.nextDue}</td>
                          <td className="p-2.5 text-center">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              {a.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="p-2.5 bg-white border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="font-medium text-slate-600">Showing {EXACT_APPLICABLE_ASSETS.length} records</span>
                  <span className="text-slate-400">Scroll down to view all records</span>
                </div>
              </div>
            </div>
          )}

          {/* OTHER TABS */}
          {activeBottomTab === 'WORK_ORDERS' && (
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700 font-medium">
              Showing 8 work orders automatically generated from {selectedPlan.planNo} ({selectedPlan.planName}).
            </div>
          )}

          {activeBottomTab === 'CHECKLIST' && (
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700">
              Template: <span className="font-bold text-slate-900">{selectedPlan.checklistTemplate || 'HVAC Maintenance Checklist'}</span> (4 Checklist tasks)
            </div>
          )}

          {activeBottomTab === 'COMMENTS' && (
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700 space-y-1">
              <p className="font-bold text-slate-900">Admin Comment (10 Jan 2026):</p>
              <p className="italic text-slate-600">Plan configured for all HVAC units across HQ sites. Auto work order trigger set 7 days before due date.</p>
            </div>
          )}

          {activeBottomTab === 'HISTORY' && (
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700 space-y-1">
              <p className="font-bold text-slate-900">Plan Audit Trail:</p>
              <p className="text-slate-600">• Created on 01 Jan 2026 by Maintenance Manager</p>
              <p className="text-slate-600">• Frequency set to 3 Months (Quarterly)</p>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}

export default MaintenancePlans;
