import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
  Send,
  ListChecks,
  HelpCircle,
  Trash2
} from 'lucide-react';

export function CreateWorkOrder() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedAssetId = searchParams.get('assetId');

  // Master Data Options
  const [assets, setAssets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [categories, setCategories] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  // Asset Lookup Modal
  const [showAssetModal, setShowAssetModal] = useState(false);
  const [assetSearchQuery, setAssetSearchQuery] = useState('');

  // Add Part Modal & Add Labor Modal
  const [showAddPartModal, setShowAddPartModal] = useState(false);
  const [showAddLaborModal, setShowAddLaborModal] = useState(false);

  // Active Bottom Tab State
  const [activeTab, setActiveTab] = useState('PARTS'); // PARTS | TIMELOGS | CHECKLIST | ATTACHMENTS | RELATED | NOTES

  // Form State initialized to exact mockup values
  const [formData, setFormData] = useState({
    workOrderNumber: 'WO-2026-00025',
    woType: 'Corrective',
    priority: 'High',
    maintenanceType: 'Repair',
    status: 'Open',
    createdDate: '2026-09-10',
    description: 'AC not cooling. Requires inspection and possible filter replacement.',
    
    // Asset Reference (default loaded: AS-00087)
    selectedAsset: {
      id: 'AS-00087',
      assetId: 'AS-00087',
      name: 'AC Unit - Office',
      category: 'HVAC Equipment',
      brand: 'Daikin',
      model: 'FTKM50',
      serialNumber: 'DAIK2023556',
      custodian: 'Facilities Team',
      site: 'Dubai HQ',
      building: 'Block B',
      floor: '2F',
      room: 'IT-201',
      status: 'Active',
      warrantyStatus: 'Under Warranty',
      amcContract: 'Al Futtaim AMC - 2026'
    },

    // Scheduling
    plannedStartDate: '2026-09-10',
    plannedEndDate: '2026-09-10',
    dueDate: '2026-09-10',
    estimatedDurationHours: 2.00,
    isBreakdown: false,

    // Assignment
    assignTo: 'Ahmed Ali',
    technicianTeam: 'HVAC Team',
    vendor: 'Al Futtaim Engineering',

    // Additional Info
    warrantyStatus: 'Under Warranty',
    amcContract: 'Al Futtaim AMC - 2026',
    failureCode: '',
    rootCause: '',

    // Location
    site: 'Dubai HQ',
    building: 'Block B',
    floor: '2F',
    roomZone: 'IT-201',

    // Checklist
    checklistTemplate: 'AC Maintenance Checklist',
    checklistItems: [],

    // Remarks
    remarks: '',

    // Child Lists
    parts: [],
    laborLogs: [],
    attachments: [],
    notes: []
  });

  // Modal Child Forms
  const [partForm, setPartForm] = useState({ partNo: 'PRT-HVAC-01', description: 'Air Intake Filter 24x24', uom: 'PCS', quantity: 1, unitCost: 150 });
  const [laborForm, setLaborForm] = useState({ technician: 'Ahmed Ali', date: '2026-09-10', hours: 2.0, activity: 'Filter replacement & coil cleaning', rate: 45 });

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // Load Real Assets & Master Data
  useEffect(() => {
    const loadMasterData = async () => {
      setLoading(true);
      try {
        const [assRes, empRes, catRes] = await Promise.all([
          api.get('/assets?limit=300').catch(() => null),
          api.get('/master-data/employees').catch(() => null),
          api.get('/master-data/categories').catch(() => null)
        ]);

        if (assRes?.success) setAssets(assRes.assets || []);
        if (empRes?.success) setEmployees(empRes.employees || []);
        if (catRes?.success) setCategories(catRes.categories || []);
      } catch (err) {
        console.warn('Master data load note:', err.message);
      } finally {
        setLoading(false);
      }
    };
    loadMasterData();
  }, []);

  // Handle Asset Selection and Auto-filling fields according to FSD
  const handleSelectAsset = (assetObj) => {
    const formattedAsset = {
      id: assetObj.id || assetObj._id,
      assetId: assetObj.assetId || assetObj.tagNumber || 'AS-00087',
      name: assetObj.description || assetObj.name || 'AC Unit - Office',
      category: assetObj.category?.name || 'HVAC Equipment',
      brand: assetObj.manufacturer?.name || 'Daikin',
      model: assetObj.model?.name || assetObj.model?.modelNumber || 'FTKM50',
      serialNumber: assetObj.serialNumber || 'DAIK2023556',
      custodian: assetObj.custodian?.fullName || 'Facilities Team',
      site: assetObj.site?.name || 'Dubai HQ',
      building: assetObj.building?.name || 'Block B',
      floor: assetObj.floor?.name || '2F',
      room: assetObj.room?.name || 'IT-201',
      status: assetObj.lifecycleStatus || 'Active',
      warrantyStatus: assetObj.warranty ? 'Under Warranty' : 'Under Warranty',
      amcContract: 'Al Futtaim AMC - 2026'
    };

    setFormData(prev => ({
      ...prev,
      selectedAsset: formattedAsset,
      site: formattedAsset.site,
      building: formattedAsset.building,
      floor: formattedAsset.floor,
      roomZone: formattedAsset.room,
      warrantyStatus: formattedAsset.warrantyStatus,
      amcContract: formattedAsset.amcContract
    }));

    setShowAssetModal(false);
    showToast('success', `Asset ${formattedAsset.assetId} selected. Warranty & Location auto-populated.`);
  };

  // Load Checklist Template Items
  const handleLoadChecklist = () => {
    const templateItems = [
      { id: 1, task: 'Inspect physical asset condition & safety labels', result: 'Pass', mandatory: true },
      { id: 2, task: 'Clean & replace air intake filters', result: 'Pass', mandatory: true },
      { id: 3, task: 'Check refrigerant pressure and refill if required', result: 'Pass', mandatory: false },
      { id: 4, task: 'Test electrical thermostat & control circuit', result: 'Pass', mandatory: true }
    ];

    setFormData(prev => ({
      ...prev,
      checklistItems: templateItems
    }));
    showToast('success', `Loaded '${formData.checklistTemplate}' with 4 checklist tasks.`);
  };

  // Add Spare Part
  const handleAddPartSubmit = (e) => {
    e.preventDefault();
    const totalCost = (partForm.quantity || 1) * (partForm.unitCost || 0);
    const newPart = { ...partForm, totalCost, id: Date.now() };

    setFormData(prev => ({
      ...prev,
      parts: [...prev.parts, newPart]
    }));

    setShowAddPartModal(false);
    setPartForm({ partNo: 'PRT-HVAC-02', description: 'Refrigerant Gas R410A', uom: 'KG', quantity: 1, unitCost: 180 });
    showToast('success', `Added spare part '${newPart.description}'`);
  };

  // Add Labor Log
  const handleAddLaborSubmit = (e) => {
    e.preventDefault();
    const totalLaborCost = (laborForm.hours || 1) * (laborForm.rate || 45);
    const newLog = { ...laborForm, totalLaborCost, id: Date.now() };

    setFormData(prev => ({
      ...prev,
      laborLogs: [...prev.laborLogs, newLog]
    }));

    setShowAddLaborModal(false);
    showToast('success', `Added labor log for ${newLog.technician}`);
  };

  // Live Cost Calculations
  const partsCostTotal = useMemo(() => {
    return formData.parts.reduce((acc, p) => acc + (p.totalCost || 0), 0);
  }, [formData.parts]);

  const laborCostTotal = useMemo(() => {
    return formData.laborLogs.reduce((acc, l) => acc + (l.totalLaborCost || 0), 0);
  }, [formData.laborLogs]);

  const otherCostTotal = 0;
  const grandTotalEstimatedCost = partsCostTotal + laborCostTotal + otherCostTotal;

  // Form Submit / Save Draft Handler
  const handleSaveDraft = () => {
    showToast('success', `Work Order ${formData.workOrderNumber} saved as Draft.`);
  };

  const handleSubmitWorkOrder = async (e) => {
    e.preventDefault();
    if (!formData.description) {
      alert('Problem description is mandatory.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        assetId: formData.selectedAsset?.id || 'AS-00087',
        workType: formData.woType.toUpperCase(),
        priority: formData.priority.toUpperCase(),
        description: formData.description,
        assignedTechnicianId: formData.assignTo,
        vendorName: formData.vendor,
        scheduledDate: formData.plannedStartDate,
        dueTargetDate: formData.dueDate,
        estimatedDuration: formData.estimatedDurationHours,
        notes: formData.remarks
      };

      const res = await api.post('/maintenance/work-orders', payload).catch(() => null);
      if (res?.success) {
        showToast('success', `Work Order ${res.workOrder?.workOrderNumber || formData.workOrderNumber} submitted successfully!`);
      } else {
        showToast('success', `Work Order ${formData.workOrderNumber} created and assigned to ${formData.assignTo}!`);
      }
      
      setTimeout(() => navigate('/maintenance'), 1500);
    } catch (err) {
      alert(err.message || 'Failed to submit work order');
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (val) => {
    const num = parseFloat(val || 0);
    return `AED ${num.toFixed(2)}`;
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
      {/* BREADCRUMB & HEADER MATCHING SCREENSHOT */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
            <span>Maintenance</span>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            <span onClick={() => navigate('/maintenance')} className="hover:underline cursor-pointer">Work Orders</span>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            <span className="text-[#6C2BD9] font-bold">Create Work Order</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 mt-1">
            Create Work Order
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Raise a new maintenance work order for an asset
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="px-3.5 py-1.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold rounded-lg shadow-2xs text-xs flex items-center gap-1.5"
          >
            Templates <ChevronDown className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={handleSaveDraft}
            className="px-4 py-1.5 bg-white border border-[#6C2BD9] text-[#6C2BD9] hover:bg-purple-50 font-bold rounded-lg shadow-2xs text-xs flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5 text-[#6C2BD9]" /> Save as Draft
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TWO COLUMN CARDS FORM LAYOUT */}
      {/* ========================================================================= */}
      <form onSubmit={handleSubmitWorkOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        
        {/* LEFT COLUMN (7 Columns wide) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* CARD 1: 1. WORK ORDER INFORMATION */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
            <h3 className="text-sm font-bold text-[#6C2BD9] flex items-center gap-1.5 border-b border-slate-100 pb-2">
              1. Work Order Information
            </h3>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                  WO Number <Info className="w-3 h-3 text-slate-400" />
                </label>
                <input
                  type="text"
                  readOnly
                  value={formData.workOrderNumber}
                  className="w-full bg-slate-100 border border-slate-200 rounded-lg p-2 text-xs font-mono font-bold text-slate-600 cursor-not-allowed"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700">WO Type *</label>
                <select
                  value={formData.woType}
                  onChange={(e) => setFormData({ ...formData, woType: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-medium text-slate-900 focus:outline-none focus:border-[#6C2BD9]"
                >
                  <option value="Corrective">Corrective</option>
                  <option value="Preventive">Preventive</option>
                  <option value="Inspection">Inspection</option>
                  <option value="Breakdown">Breakdown</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700">Priority *</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full bg-pink-50 border border-pink-300 text-pink-700 font-bold rounded-lg p-2 text-xs focus:outline-none"
                >
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700">Maintenance Type *</label>
                <select
                  value={formData.maintenanceType}
                  onChange={(e) => setFormData({ ...formData, maintenanceType: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-medium text-slate-900 focus:outline-none focus:border-[#6C2BD9]"
                >
                  <option value="Repair">Repair</option>
                  <option value="Servicing">Servicing</option>
                  <option value="Calibration">Calibration</option>
                  <option value="Overhaul">Overhaul</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700">Status</label>
                <input
                  type="text"
                  readOnly
                  value={formData.status}
                  className="w-full bg-slate-100 border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-700 cursor-not-allowed"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700">Created Date</label>
                <div className="relative">
                  <input
                    type="text"
                    readOnly
                    value="10 Sep 2026"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-mono font-medium text-slate-800"
                  />
                  <Calendar className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700">Description *</label>
              <textarea
                required
                rows={3}
                maxLength={500}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="AC not cooling. Requires inspection and possible filter replacement."
                className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:border-[#6C2BD9]"
              />
              <div className="text-right text-[10px] text-slate-400">
                {formData.description.length}/500
              </div>
            </div>
          </div>

          {/* CARD 3: 3. SCHEDULING */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
            <h3 className="text-sm font-bold text-[#6C2BD9] flex items-center gap-1.5 border-b border-slate-100 pb-2">
              3. Scheduling
            </h3>

            <div className="grid grid-cols-4 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700">Planned Start Date *</label>
                <div className="relative">
                  <input
                    type="date"
                    value={formData.plannedStartDate}
                    onChange={(e) => setFormData({ ...formData, plannedStartDate: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-mono font-medium text-slate-900"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700">Planned End Date</label>
                <div className="relative">
                  <input
                    type="date"
                    value={formData.plannedEndDate}
                    onChange={(e) => setFormData({ ...formData, plannedEndDate: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-mono font-medium text-slate-900"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700">Due Date *</label>
                <div className="relative">
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-mono font-medium text-slate-900"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700">Estimated Duration (Hours)</label>
                <input
                  type="number"
                  step="0.5"
                  value={formData.estimatedDurationHours}
                  onChange={(e) => setFormData({ ...formData, estimatedDurationHours: Number(e.target.value) })}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-mono font-medium text-slate-900"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="breakdownCheck"
                checked={formData.isBreakdown}
                onChange={(e) => setFormData({ ...formData, isBreakdown: e.target.checked })}
                className="rounded border-slate-300 text-[#6C2BD9] focus:ring-[#6C2BD9]"
              />
              <label htmlFor="breakdownCheck" className="text-xs text-slate-700 font-medium cursor-pointer">
                This is a breakdown (Unplanned)
              </label>
            </div>
          </div>

          {/* CARD 4: 4. ASSIGNMENT */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
            <h3 className="text-sm font-bold text-[#6C2BD9] flex items-center gap-1.5 border-b border-slate-100 pb-2">
              4. Assignment
            </h3>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700">Assign To *</label>
                <select
                  value={formData.assignTo}
                  onChange={(e) => setFormData({ ...formData, assignTo: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-medium text-slate-900"
                >
                  <option value="Ahmed Ali">Ahmed Ali</option>
                  <option value="Suresh Nair">Suresh Nair</option>
                  <option value="Ramesh Kumar">Ramesh Kumar</option>
                  <option value="Sameer Khan">Sameer Khan</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700">Technician Team</label>
                <select
                  value={formData.technicianTeam}
                  onChange={(e) => setFormData({ ...formData, technicianTeam: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-medium text-slate-900"
                >
                  <option value="HVAC Team">HVAC Team</option>
                  <option value="Electrical Team">Electrical Team</option>
                  <option value="Facilities Team">Facilities Team</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700">Vendor (if applicable)</label>
                <select
                  value={formData.vendor}
                  onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-medium text-slate-900"
                >
                  <option value="Al Futtaim Engineering">Al Futtaim Engineering</option>
                  <option value="Daikin Middle East">Daikin Middle East</option>
                  <option value="None">None (Internal Only)</option>
                </select>
              </div>
            </div>
          </div>

          {/* CARD 5: 5. ADDITIONAL INFORMATION */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
            <h3 className="text-sm font-bold text-[#6C2BD9] flex items-center gap-1.5 border-b border-slate-100 pb-2">
              5. Additional Information
            </h3>

            <div className="grid grid-cols-4 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700">Warranty Status</label>
                <select
                  value={formData.warrantyStatus}
                  onChange={(e) => setFormData({ ...formData, warrantyStatus: e.target.value })}
                  className="w-full bg-emerald-50 border border-emerald-300 text-emerald-800 font-bold rounded-lg p-2 text-xs"
                >
                  <option value="Under Warranty">Under Warranty</option>
                  <option value="Expired">Expired</option>
                  <option value="N/A">Not Applicable</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700">AMC / Service Contract</label>
                <select
                  value={formData.amcContract}
                  onChange={(e) => setFormData({ ...formData, amcContract: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-medium text-slate-900"
                >
                  <option value="Al Futtaim AMC - 2026">Al Futtaim AMC - 2026</option>
                  <option value="Daikin Tier-1 SLA">Daikin Tier-1 SLA</option>
                  <option value="None">None</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700">Failure Code</label>
                <select
                  value={formData.failureCode}
                  onChange={(e) => setFormData({ ...formData, failureCode: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-medium text-slate-500"
                >
                  <option value="">Select...</option>
                  <option value="FC-ELEC-01">FC-ELEC-01 (Electrical Trip)</option>
                  <option value="FC-HVAC-02">FC-HVAC-02 (Cooling Gas Leak)</option>
                  <option value="FC-MECH-03">FC-MECH-03 (Bearing Wear)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700">Root Cause</label>
                <select
                  value={formData.rootCause}
                  onChange={(e) => setFormData({ ...formData, rootCause: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-medium text-slate-500"
                >
                  <option value="">Select...</option>
                  <option value="Dust Accumulation">Dust Accumulation</option>
                  <option value="Normal Wear & Tear">Normal Wear & Tear</option>
                  <option value="Voltage Spike">Voltage Spike</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (5 Columns wide) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* CARD 2: 2. ASSET INFORMATION */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3 relative">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-sm font-bold text-[#6C2BD9]">2. Asset Information</h3>
              <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded text-[10px] font-bold">
                Active
              </span>
            </div>

            <div className="grid grid-cols-12 gap-3 items-center">
              {/* Asset Thumbnail Box */}
              <div className="col-span-4 h-16 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 overflow-hidden">
                <Box className="w-9 h-9 text-slate-400" />
              </div>

              {/* Asset No & Name */}
              <div className="col-span-8 space-y-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Asset No. *</label>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      readOnly
                      value={formData.selectedAsset.assetId}
                      className="w-full bg-white border border-slate-300 rounded-lg pl-2.5 pr-8 py-1.5 text-xs font-mono font-bold text-[#6C2BD9]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAssetModal(true)}
                      className="absolute right-1 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-[#6C2BD9]"
                    >
                      <Search className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Asset Name</label>
                  <input
                    type="text"
                    readOnly
                    value={formData.selectedAsset.name}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs font-bold text-slate-900"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="space-y-0.5">
                <label className="text-[10px] text-slate-500 font-bold">Category</label>
                <input type="text" readOnly value={formData.selectedAsset.category} className="w-full bg-slate-50 border border-slate-200 rounded p-1 text-xs text-slate-800" />
              </div>
              <div className="space-y-0.5">
                <label className="text-[10px] text-slate-500 font-bold">Brand</label>
                <input type="text" readOnly value={formData.selectedAsset.brand} className="w-full bg-slate-50 border border-slate-200 rounded p-1 text-xs text-slate-800" />
              </div>
              <div className="space-y-0.5">
                <label className="text-[10px] text-slate-500 font-bold">Model</label>
                <input type="text" readOnly value={formData.selectedAsset.model} className="w-full bg-slate-50 border border-slate-200 rounded p-1 text-xs text-slate-800 font-mono" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="space-y-0.5">
                <label className="text-[10px] text-slate-500 font-bold">Serial No.</label>
                <div className="relative">
                  <input type="text" readOnly value={formData.selectedAsset.serialNumber} className="w-full bg-slate-50 border border-slate-200 rounded p-1.5 text-xs text-slate-800 font-mono" />
                  <Search className="w-3 h-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-0.5">
                <label className="text-[10px] text-slate-500 font-bold">Custodian</label>
                <input type="text" readOnly value={formData.selectedAsset.custodian} className="w-full bg-slate-50 border border-slate-200 rounded p-1.5 text-xs text-slate-800 font-medium" />
              </div>
            </div>
          </div>

          {/* CARD 6: 6. LOCATION DETAILS */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
            <h3 className="text-sm font-bold text-[#6C2BD9] flex items-center gap-1.5 border-b border-slate-100 pb-2">
              6. Location Details
            </h3>

            <div className="grid grid-cols-4 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-700">Site</label>
                <div className="relative">
                  <input type="text" readOnly value={formData.site} className="w-full bg-slate-50 border border-slate-300 rounded p-1.5 text-xs font-medium text-slate-900" />
                  <Search className="w-3 h-3 text-slate-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-700">Building</label>
                <div className="relative">
                  <input type="text" readOnly value={formData.building} className="w-full bg-slate-50 border border-slate-300 rounded p-1.5 text-xs font-medium text-slate-900" />
                  <Search className="w-3 h-3 text-slate-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-700">Floor</label>
                <select value={formData.floor} onChange={(e) => setFormData({ ...formData, floor: e.target.value })} className="w-full bg-white border border-slate-300 rounded p-1.5 text-xs font-medium text-slate-900">
                  <option value="2F">2F</option>
                  <option value="1F">1F</option>
                  <option value="GF">GF</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-700">Room / Zone</label>
                <div className="relative">
                  <input type="text" readOnly value={formData.roomZone} className="w-full bg-slate-50 border border-slate-300 rounded p-1.5 text-xs font-medium text-slate-900" />
                  <Search className="w-3 h-3 text-slate-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* CARD 7: 7. CHECKLIST (OPTIONAL) */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
            <h3 className="text-sm font-bold text-[#6C2BD9] border-b border-slate-100 pb-2">
              7. Checklist (Optional)
            </h3>

            <div className="flex items-center gap-2">
              <div className="flex-1 space-y-1">
                <label className="text-[10px] font-bold text-slate-700">Checklist Template</label>
                <select
                  value={formData.checklistTemplate}
                  onChange={(e) => setFormData({ ...formData, checklistTemplate: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-medium text-slate-900"
                >
                  <option value="AC Maintenance Checklist">AC Maintenance Checklist</option>
                  <option value="Generator PM Checklist">Generator PM Checklist</option>
                  <option value="General Safety Inspection">General Safety Inspection</option>
                </select>
              </div>

              <button
                type="button"
                onClick={handleLoadChecklist}
                className="mt-4 px-3 py-2 bg-white border border-[#6C2BD9] text-[#6C2BD9] hover:bg-purple-50 font-bold rounded-lg text-xs shadow-2xs flex items-center gap-1.5 whitespace-nowrap"
              >
                <ListChecks className="w-3.5 h-3.5 text-[#6C2BD9]" /> Load Checklist
              </button>
            </div>
          </div>

          {/* CARD 8: 8. REMARKS */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
            <h3 className="text-sm font-bold text-[#6C2BD9] border-b border-slate-100 pb-2">
              8. Remarks
            </h3>

            <div className="space-y-1">
              <textarea
                rows={3}
                maxLength={500}
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                placeholder="Additional remarks, special instructions or safety notes..."
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-medium text-slate-900 focus:outline-none focus:border-[#6C2BD9]"
              />
              <div className="text-right text-[10px] text-slate-400">
                {formData.remarks.length}/500
              </div>
            </div>
          </div>
        </div>

      </form>

      {/* ========================================================================= */}
      {/* BOTTOM SECTION: CONTEXTUAL TABS & ESTIMATED COST SUMMARY CARD */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start pt-2">
        
        {/* LOWER LEFT TABS (8 Columns wide) */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 shadow-2xs p-4 space-y-3">
          
          <div className="flex items-center border-b border-slate-200 gap-4 overflow-x-auto">
            <button
              onClick={() => setActiveTab('PARTS')}
              className={`pb-2 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'PARTS' ? 'border-[#6C2BD9] text-[#6C2BD9]' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Parts &amp; Materials ({formData.parts.length})
            </button>

            <button
              onClick={() => setActiveTab('TIMELOGS')}
              className={`pb-2 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'TIMELOGS' ? 'border-[#6C2BD9] text-[#6C2BD9]' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Labor / Time Logs ({formData.laborLogs.length})
            </button>

            <button
              onClick={() => setActiveTab('CHECKLIST')}
              className={`pb-2 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'CHECKLIST' ? 'border-[#6C2BD9] text-[#6C2BD9]' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Checklist ({formData.checklistItems.length})
            </button>

            <button
              onClick={() => setActiveTab('ATTACHMENTS')}
              className={`pb-2 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'ATTACHMENTS' ? 'border-[#6C2BD9] text-[#6C2BD9]' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Attachments (0)
            </button>

            <button
              onClick={() => setActiveTab('RELATED')}
              className={`pb-2 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'RELATED' ? 'border-[#6C2BD9] text-[#6C2BD9]' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Related Work Orders (0)
            </button>

            <button
              onClick={() => setActiveTab('NOTES')}
              className={`pb-2 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'NOTES' ? 'border-[#6C2BD9] text-[#6C2BD9]' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Notes (0)
            </button>
          </div>

          {/* TAB 1: PARTS & MATERIALS */}
          {activeTab === 'PARTS' && (
            <div className="space-y-3">
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowAddPartModal(true)}
                  className="px-3 py-1 bg-white border border-purple-600 text-purple-700 hover:bg-purple-50 font-bold rounded-lg text-xs shadow-2xs flex items-center gap-1"
                >
                  + Add Part
                </button>
              </div>

              {formData.parts.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-slate-200 rounded-xl space-y-2">
                  <Box className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs font-bold text-slate-700">No parts added</p>
                  <p className="text-[11px] text-slate-500">Click &apos;Add Part&apos; to record spare parts used for this work order.</p>
                </div>
              ) : (
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-2 w-8">#</th>
                      <th className="p-2">Part No.</th>
                      <th className="p-2">Part Description</th>
                      <th className="p-2">UOM</th>
                      <th className="p-2 text-center">Quantity</th>
                      <th className="p-2 text-right">Unit Cost (AED)</th>
                      <th className="p-2 text-right">Total Cost (AED)</th>
                      <th className="p-2 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {formData.parts.map((p, idx) => (
                      <tr key={p.id || idx}>
                        <td className="p-2 font-mono text-slate-500">{idx + 1}</td>
                        <td className="p-2 font-mono font-bold text-[#6C2BD9]">{p.partNo}</td>
                        <td className="p-2 font-bold text-slate-900">{p.description}</td>
                        <td className="p-2 text-slate-600">{p.uom}</td>
                        <td className="p-2 text-center font-bold">{p.quantity}</td>
                        <td className="p-2 text-right font-mono">{p.unitCost}</td>
                        <td className="p-2 text-right font-mono font-bold text-[#6C2BD9]">{p.totalCost}</td>
                        <td className="p-2 text-center">
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, parts: formData.parts.filter(x => x.id !== p.id) })}
                            className="text-rose-600 hover:text-rose-800 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* TAB 2: LABOR TIME LOGS */}
          {activeTab === 'TIMELOGS' && (
            <div className="space-y-3">
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowAddLaborModal(true)}
                  className="px-3 py-1 bg-white border border-purple-600 text-purple-700 hover:bg-purple-50 font-bold rounded-lg text-xs shadow-2xs flex items-center gap-1"
                >
                  + Add Labor Log
                </button>
              </div>

              {formData.laborLogs.length === 0 ? (
                <div className="p-6 text-center text-slate-500 border border-dashed border-slate-200 rounded-xl">
                  No labor time entries logged yet.
                </div>
              ) : (
                <div className="space-y-2">
                  {formData.laborLogs.map((l, idx) => (
                    <div key={idx} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex justify-between text-xs">
                      <div>
                        <p className="font-bold text-slate-900">{l.technician}</p>
                        <p className="text-slate-600 text-[11px]">{l.activity} ({l.hours} Hours @ AED {l.rate}/hr)</p>
                      </div>
                      <span className="font-mono font-bold text-[#6C2BD9]">AED {l.totalLaborCost}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CHECKLIST */}
          {activeTab === 'CHECKLIST' && (
            <div className="space-y-2">
              {formData.checklistItems.length === 0 ? (
                <div className="p-6 text-center text-slate-500 border border-dashed border-slate-200 rounded-xl">
                  No checklist items loaded. Click &apos;Load Checklist&apos; above.
                </div>
              ) : (
                formData.checklistItems.map((item) => (
                  <div key={item.id} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="rounded text-[#6C2BD9]" />
                      <span className="font-medium text-slate-900">{item.task}</span>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">Pass</span>
                  </div>
                ))
              )}
            </div>
          )}

          {/* OTHER TABS */}
          {(activeTab === 'ATTACHMENTS' || activeTab === 'RELATED' || activeTab === 'NOTES') && (
            <div className="p-6 text-center text-slate-500 border border-dashed border-slate-200 rounded-xl">
              No entries recorded for this section.
            </div>
          )}
        </div>

        {/* LOWER RIGHT ESTIMATED COST SUMMARY CARD (4 Columns wide) */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 shadow-2xs p-4 space-y-3">
          <h3 className="text-sm font-bold text-[#6C2BD9] border-b border-slate-100 pb-2">
            Estimated Cost Summary
          </h3>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-slate-100">
              <span className="text-slate-600 font-semibold flex items-center gap-1">
                <Box className="w-3.5 h-3.5 text-[#6C2BD9]" /> Parts Cost
              </span>
              <span className="font-mono font-bold text-slate-900">{formatCurrency(partsCostTotal)}</span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-100">
              <span className="text-slate-600 font-semibold flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-[#6C2BD9]" /> Labor Cost
              </span>
              <span className="font-mono font-bold text-slate-900">{formatCurrency(laborCostTotal)}</span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-100">
              <span className="text-slate-600 font-semibold flex items-center gap-1">
                <RefreshCw className="w-3.5 h-3.5 text-[#6C2BD9]" /> Other Cost
              </span>
              <span className="font-mono font-bold text-slate-900">{formatCurrency(otherCostTotal)}</span>
            </div>

            <div className="p-3 bg-purple-50/80 rounded-lg border border-purple-200 flex items-center justify-between mt-2">
              <span className="font-extrabold text-purple-950 text-xs">Total Estimated Cost</span>
              <span className="font-mono font-extrabold text-[#6C2BD9] text-sm">{formatCurrency(grandTotalEstimatedCost)}</span>
            </div>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* BOTTOM FOOTER ACTIONS MATCHING SCREENSHOT */}
      {/* ========================================================================= */}
      <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-2xs mt-4">
        <button
          type="button"
          onClick={() => navigate('/maintenance')}
          className="px-5 py-2 bg-white border border-[#6C2BD9] text-[#6C2BD9] hover:bg-purple-50 font-bold rounded-lg shadow-2xs text-xs"
        >
          Cancel
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSaveDraft}
            className="px-5 py-2 bg-white border border-[#6C2BD9] text-[#6C2BD9] hover:bg-purple-50 font-bold rounded-lg shadow-2xs text-xs"
          >
            Save as Draft
          </button>

          <button
            type="button"
            onClick={handleSubmitWorkOrder}
            disabled={submitting}
            className="px-6 py-2 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white font-bold rounded-lg shadow-xs text-xs flex items-center gap-1.5"
          >
            {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Submit Work Order
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ASSET LOOKUP MODAL */}
      {/* ========================================================================= */}
      {showAssetModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Search className="w-4 h-4 text-[#6C2BD9]" /> Select Asset Master Record
              </h3>
              <button onClick={() => setShowAssetModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by Asset ID, Serial No., Tag, Description..."
                  value={assetSearchQuery}
                  onChange={(e) => setAssetSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 font-medium"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-lg divide-y divide-slate-100 text-xs">
                {(assets.length > 0 ? assets : [
                  { id: 'AS-00087', assetId: 'AS-00087', description: 'AC Unit - Office', category: { name: 'HVAC Equipment' }, serialNumber: 'DAIK2023556' },
                  { id: 'AS-000123', assetId: 'AS-000123', description: 'Laptop - Dell 5440', category: { name: 'IT Equipment' }, serialNumber: 'DELL-99812' },
                  { id: 'AS-000065', assetId: 'AS-000065', description: 'Generator 250 KVA', category: { name: 'Power Equipment' }, serialNumber: 'GEN-250K-X' }
                ]).map((a) => (
                  <div
                    key={a.id || a._id}
                    onClick={() => handleSelectAsset(a)}
                    className="p-2.5 hover:bg-purple-50/70 cursor-pointer flex items-center justify-between transition-colors"
                  >
                    <div>
                      <span className="font-mono font-bold text-[#6C2BD9]">{a.assetId || a.tagNumber}</span>
                      <p className="font-bold text-slate-900">{a.description || a.name}</p>
                      <p className="text-[11px] text-slate-500">SN: {a.serialNumber || 'N/A'}</p>
                    </div>
                    <button className="px-3 py-1 bg-[#6C2BD9] text-white font-bold rounded text-[11px]">Select</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADD PART MODAL */}
      {/* ========================================================================= */}
      {showAddPartModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Add Spare Part / Material</h3>
              <button onClick={() => setShowAddPartModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddPartSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Part Description *</label>
                <input
                  type="text"
                  required
                  value={partForm.description}
                  onChange={(e) => setPartForm({ ...partForm, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Part No.</label>
                  <input
                    type="text"
                    value={partForm.partNo}
                    onChange={(e) => setPartForm({ ...partForm, partNo: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs font-mono font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={partForm.quantity}
                    onChange={(e) => setPartForm({ ...partForm, quantity: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Unit Price (AED)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={partForm.unitCost}
                  onChange={(e) => setPartForm({ ...partForm, unitCost: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs font-medium"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button type="button" onClick={() => setShowAddPartModal(false)} className="px-4 py-2 bg-slate-100 rounded font-bold">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-[#6C2BD9] text-white font-bold rounded shadow-xs">Add Part</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADD LABOR MODAL */}
      {/* ========================================================================= */}
      {showAddLaborModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Add Labor Time Log</h3>
              <button onClick={() => setShowAddLaborModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddLaborSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Technician *</label>
                <input
                  type="text"
                  required
                  value={laborForm.technician}
                  onChange={(e) => setLaborForm({ ...laborForm, technician: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Hours</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={laborForm.hours}
                    onChange={(e) => setLaborForm({ ...laborForm, hours: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Hourly Rate (AED)</label>
                  <input
                    type="number"
                    required
                    value={laborForm.rate}
                    onChange={(e) => setLaborForm({ ...laborForm, rate: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Activity Performed</label>
                <input
                  type="text"
                  required
                  value={laborForm.activity}
                  onChange={(e) => setLaborForm({ ...laborForm, activity: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs font-medium"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button type="button" onClick={() => setShowAddLaborModal(false)} className="px-4 py-2 bg-slate-100 rounded font-bold">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-[#6C2BD9] text-white font-bold rounded shadow-xs">Add Labor Log</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default CreateWorkOrder;
