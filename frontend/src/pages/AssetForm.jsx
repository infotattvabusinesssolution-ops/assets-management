import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { 
  Save, 
  ArrowLeft, 
  Package, 
  Plus, 
  Layers, 
  X, 
  CheckCircle2, 
  AlertCircle,
  Barcode,
  Radio,
  Building,
  User,
  DollarSign,
  Server,
  ShieldAlert,
  Sparkles,
  Calendar,
  FileText,
  Clock,
  Laptop,
  Cpu,
  RefreshCw,
  Tag
} from 'lucide-react';
import { AddCustomCategoryModal } from '../components/modals/AddCategoryModal';
import { AddCompanyModal } from '../components/modals/AddCompanyModal';
import { AddSiteModal } from '../components/modals/AddSiteModal';

const DEFAULT_CATEGORIES = [
  { _id: 'cat-01', code: 'CAT-IT', name: 'IT Infrastructure & Compute' },
  { _id: 'cat-02', code: 'CAT-FAC', name: 'Facilities & Heavy Machinery' },
  { _id: 'cat-03', code: 'CAT-VEH', name: 'Fleet Vehicles & Logistics' },
  { _id: 'cat-04', code: 'CAT-FURN', name: 'Office Furniture & Fixtures' },
  { _id: 'cat-05', code: 'CAT-TOOL', name: 'Tooling & Testing Equipment' }
];

const DEFAULT_DEPARTMENTS = [
  { id: 'dept-it', code: 'IT-OPS', name: 'IT Infrastructure & Operations' },
  { id: 'dept-fin', code: 'FIN-ACC', name: 'Finance & Accounting' },
  { id: 'dept-fac', code: 'FAC-ENG', name: 'Facilities & Engineering' },
  { id: 'dept-hr', code: 'HR-OPS', name: 'Human Resources' },
  { id: 'dept-log', code: 'LOG-WH', name: 'Supply Chain & Logistics' }
];

const DEFAULT_COST_CENTERS = [
  { id: 'cc-101', code: 'CC-1001', name: 'Global Tech & Compute Ops' },
  { id: 'cc-102', code: 'CC-1002', name: 'HQ Administration' },
  { id: 'cc-103', code: 'CC-2001', name: 'Field Manufacturing' },
  { id: 'cc-104', code: 'CC-3001', name: 'Logistics Fleet' }
];

const DEFAULT_EMPLOYEES = [
  { id: 'emp-01', name: 'David Miller', email: 'd.miller@infotatwaa.com', title: 'Senior Infrastructure Lead' },
  { id: 'emp-02', name: 'Sarah Jenkins', email: 's.jenkins@infotatwaa.com', title: 'Facilities Manager' },
  { id: 'emp-03', name: 'Alex Rivera', email: 'a.rivera@infotatwaa.com', title: 'IT Systems Admin' },
  { id: 'emp-04', name: 'Elena Rostova', email: 'e.rostova@infotatwaa.com', title: 'Asset Custodian Officer' }
];

const LIFECYCLE_STATUSES = [
  { value: 'REQUESTED', label: 'Requested (Pending PO)' },
  { value: 'ORDERED', label: 'Ordered / In Procurement' },
  { value: 'RECEIVED', label: 'Received & Staging' },
  { value: 'TAGGED', label: 'Barcoded & Tagged' },
  { value: 'IN_STORE', label: 'In Inventory Store' },
  { value: 'IN_SERVICE', label: 'Active In Service' },
  { value: 'ASSIGNED', label: 'Assigned to Custodian' },
  { value: 'UNDER_MAINTENANCE', label: 'Under Maintenance' },
  { value: 'RETIRED', label: 'Retired' }
];

const CONDITIONS = [
  { value: 'NEW', label: 'Brand New (Factory Sealed)' },
  { value: 'EXCELLENT', label: 'Excellent / Like New' },
  { value: 'GOOD', label: 'Good (Normal Operational Wear)' },
  { value: 'FAIR', label: 'Fair (Functional / Minor Wear)' },
  { value: 'POOR', label: 'Poor (Requires Servicing)' },
  { value: 'CRITICAL', label: 'Critical / Failing' }
];

const CRITICALITIES = [
  { value: 'LOW', label: 'Low (Non-essential fixture/tool)' },
  { value: 'MEDIUM', label: 'Medium (Standard Workstation)' },
  { value: 'HIGH', label: 'High (Core Business Asset)' },
  { value: 'CRITICAL', label: 'Critical (Mission Critical Infrastructure)' }
];

export function AssetForm() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [sites, setSites] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [costCenters, setCostCenters] = useState([]);
  const [employees, setEmployees] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  // Modal States
  const [showCatModal, setShowCatModal] = useState(false);
  const [showCmpModal, setShowCmpModal] = useState(false);
  const [showSiteModal, setShowSiteModal] = useState(false);
  const [successToast, setSuccessToast] = useState('');

  const [formData, setFormData] = useState({
    assetId: '',
    description: '',
    serialNumber: '',
    tagNumber: '',
    barcode: '',
    rfidEpc: '',
    categoryId: '',
    companyId: '',
    siteId: '',
    buildingId: '',
    floorId: '',
    roomId: '',
    departmentId: '',
    costCenterId: '',
    custodianId: '',
    acquisitionValue: 0,
    currency: 'USD',
    poNumber: '',
    supplierName: '',
    purchaseDate: '',
    inServiceDate: new Date().toISOString().split('T')[0],
    usefulLifeMonths: 60,
    condition: 'NEW',
    lifecycleStatus: 'RECEIVED',
    criticality: 'MEDIUM',
    hostname: '',
    ipAddress: '',
    macAddress: ''
  });

  useEffect(() => {
    async function loadMaster() {
      try {
        const [catsRes, compsRes, sitesRes, deptsRes, ccRes, empRes] = await Promise.allSettled([
          api.get('/master-data/categories'),
          api.get('/master-data/companies'),
          api.get('/master-data/sites'),
          api.get('/master-data/departments'),
          api.get('/master-data/cost-centers'),
          api.get('/master-data/employees')
        ]);
        
        // Categories
        if (catsRes.status === 'fulfilled' && catsRes.value?.success && catsRes.value.categories.length > 0) {
          setCategories(catsRes.value.categories);
        } else {
          setCategories(DEFAULT_CATEGORIES);
        }

        // Companies
        if (compsRes.status === 'fulfilled' && compsRes.value?.success && compsRes.value.companies.length > 0) {
          setCompanies(compsRes.value.companies);
        } else {
          setCompanies([{ id: 'cmp-01', _id: 'cmp-01', name: 'Infotatwaa Enterprise Corp', code: 'CMP-GLOBAL' }]);
        }

        // Sites
        if (sitesRes.status === 'fulfilled' && sitesRes.value?.success && sitesRes.value.sites.length > 0) {
          setSites(sitesRes.value.sites);
        } else {
          setSites([{ id: 'site-01', _id: 'site-01', name: 'Global HQ Campus', code: 'SITE-HQ' }]);
        }

        // Departments
        if (deptsRes.status === 'fulfilled' && deptsRes.value?.success && deptsRes.value.departments?.length > 0) {
          setDepartments(deptsRes.value.departments);
        } else {
          setDepartments(DEFAULT_DEPARTMENTS);
        }

        // Cost Centers
        if (ccRes.status === 'fulfilled' && ccRes.value?.success && ccRes.value.costCenters?.length > 0) {
          setCostCenters(ccRes.value.costCenters);
        } else {
          setCostCenters(DEFAULT_COST_CENTERS);
        }

        // Employees / Custodians
        if (empRes.status === 'fulfilled' && empRes.value?.success && empRes.value.employees?.length > 0) {
          setEmployees(empRes.value.employees);
        } else {
          setEmployees(DEFAULT_EMPLOYEES);
        }

      } catch (err) {
        console.warn('Asset form master data fallback:', err);
        setCategories(DEFAULT_CATEGORIES);
        setCompanies([{ id: 'cmp-01', _id: 'cmp-01', name: 'Infotatwaa Enterprise Corp', code: 'CMP-GLOBAL' }]);
        setSites([{ id: 'site-01', _id: 'site-01', name: 'Global HQ Campus', code: 'SITE-HQ' }]);
        setDepartments(DEFAULT_DEPARTMENTS);
        setCostCenters(DEFAULT_COST_CENTERS);
        setEmployees(DEFAULT_EMPLOYEES);
      }
    }
    loadMaster();
  }, []);

  const handleCategoryAdded = (newCat) => {
    const updated = [...categories, newCat];
    setCategories(updated);
    setFormData(prev => ({ ...prev, categoryId: newCat.id || newCat._id || newCat.code }));
    setSuccessToast(`Category "${newCat.name}" created and selected!`);
    setTimeout(() => setSuccessToast(''), 4000);
  };

  const handleCompanyAdded = (newCmp) => {
    const updated = [...companies, newCmp];
    setCompanies(updated);
    setFormData(prev => ({ ...prev, companyId: newCmp.id || newCmp._id || newCmp.code }));
    setSuccessToast(`Company Entity "${newCmp.name}" created and selected!`);
    setTimeout(() => setSuccessToast(''), 4000);
  };

  const handleSiteAdded = (newSite) => {
    const updated = [...sites, newSite];
    setSites(updated);
    setFormData(prev => ({ ...prev, siteId: newSite.id || newSite._id || newSite.code }));
    setSuccessToast(`Site Campus "${newSite.name}" created and selected!`);
    setTimeout(() => setSuccessToast(''), 4000);
  };

  // Quick Preset Handlers
  const handleApplyPreset = (type) => {
    const randomId = Math.floor(Math.random() * 8999 + 1000);
    const catObj = categories[0] || DEFAULT_CATEGORIES[0];
    const cmpObj = companies[0];
    const siteObj = sites[0];

    if (type === 'SERVER') {
      setFormData({
        assetId: `AST-2026-${randomId}`,
        description: 'Dell PowerEdge R760 2U Rack Server (2x Xeon Platinum, 512GB RAM)',
        serialNumber: `SN-DELL-${randomId}`,
        tagNumber: `TAG-${randomId}`,
        barcode: `BAR-${randomId}`,
        rfidEpc: `E2806894000050123456${randomId}`,
        categoryId: catObj?.id || catObj?._id || catObj?.code || '',
        companyId: cmpObj?.id || cmpObj?._id || cmpObj?.code || '',
        siteId: siteObj?.id || siteObj?._id || siteObj?.code || '',
        buildingId: 'Main Tech Center',
        floorId: 'Level 3 - Server Hall',
        roomId: 'Rack R-04',
        departmentId: departments[0]?.id || '',
        costCenterId: costCenters[0]?.id || '',
        custodianId: employees[0]?.id || '',
        acquisitionValue: 12850.00,
        currency: 'USD',
        poNumber: `PO-2026-${randomId}`,
        supplierName: 'Dell Enterprise Direct',
        purchaseDate: new Date().toISOString().split('T')[0],
        inServiceDate: new Date().toISOString().split('T')[0],
        usefulLifeMonths: 60,
        condition: 'NEW',
        lifecycleStatus: 'IN_SERVICE',
        criticality: 'CRITICAL',
        hostname: `srv-db-prod${randomId.toString().slice(0, 2)}.corp.internal`,
        ipAddress: `10.200.4.${Math.floor(Math.random() * 200 + 10)}`,
        macAddress: `00:1A:2B:3C:${randomId.toString().slice(0, 2)}:88`
      });
      setSuccessToast('Preset applied: Enterprise Compute Server');
    } else if (type === 'LAPTOP') {
      setFormData({
        assetId: `AST-2026-${randomId}`,
        description: 'Apple MacBook Pro 16" M3 Max (36GB RAM, 1TB SSD)',
        serialNumber: `C02FV0${randomId}MD6R`,
        tagNumber: `TAG-${randomId}`,
        barcode: `BAR-${randomId}`,
        rfidEpc: `E2806894000050123999${randomId}`,
        categoryId: catObj?.id || catObj?._id || catObj?.code || '',
        companyId: cmpObj?.id || cmpObj?._id || cmpObj?.code || '',
        siteId: siteObj?.id || siteObj?._id || siteObj?.code || '',
        buildingId: 'Innovation Tower',
        floorId: 'Floor 5',
        roomId: 'Desk 502-B',
        departmentId: departments[1]?.id || '',
        costCenterId: costCenters[1]?.id || '',
        custodianId: employees[1]?.id || '',
        acquisitionValue: 3499.00,
        currency: 'USD',
        poNumber: `PO-2026-${randomId}`,
        supplierName: 'Apple Business Store',
        purchaseDate: new Date().toISOString().split('T')[0],
        inServiceDate: new Date().toISOString().split('T')[0],
        usefulLifeMonths: 36,
        condition: 'NEW',
        lifecycleStatus: 'ASSIGNED',
        criticality: 'MEDIUM',
        hostname: `mac-exec-${randomId.toString().slice(0, 2)}`,
        ipAddress: `192.168.12.${Math.floor(Math.random() * 200 + 10)}`,
        macAddress: `A4:83:E7:${randomId.toString().slice(0, 2)}:11:90`
      });
      setSuccessToast('Preset applied: Executive Workstation');
    }
    setTimeout(() => setSuccessToast(''), 4000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/assets', formData);
      if (res && res.success) {
        const newAssetId = res.asset?.id || res.asset?._id;
        if (newAssetId) {
          navigate(`/assets/${newAssetId}`);
        } else {
          navigate('/assets');
        }
      } else {
        alert(res?.message || 'Failed to register asset.');
      }
    } catch (err) {
      console.error('Asset submission error:', err);
      alert(err?.message || err?.error || 'Failed to register asset.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 bg-purple-100 text-purple-700 rounded-xl">
              <Package className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900">Register Enterprise Fixed Asset</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 uppercase tracking-wide">
              Full FAMS Spec
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Capture comprehensive asset identity, serial, hardware telemetry, location custody, and financial valuation parameters.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Presets for Speed */}
          <button
            type="button"
            onClick={() => handleApplyPreset('SERVER')}
            className="px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Server className="w-3.5 h-3.5" /> Preset Server
          </button>

          <button
            type="button"
            onClick={() => handleApplyPreset('LAPTOP')}
            className="px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Laptop className="w-3.5 h-3.5" /> Preset Laptop
          </button>

          <button 
            type="button"
            onClick={() => navigate('/assets')} 
            className="btn-secondary text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 font-medium"
          >
            <ArrowLeft className="w-4 h-4" /> Cancel
          </button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {successToast && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5 shadow-xs animate-fade-in">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
          <span className="font-semibold">{successToast}</span>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex border-b border-slate-200 bg-white rounded-xl p-1.5 gap-1 border">
        <button
          type="button"
          onClick={() => setActiveTab('general')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'general'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Package className="w-4 h-4" /> 1. Identity & Organization
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('tracking')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'tracking'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Barcode className="w-4 h-4" /> 2. Barcode & Smart RFID
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('financial')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'financial'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <DollarSign className="w-4 h-4" /> 3. Finance & Purchase
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('location')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'location'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Building className="w-4 h-4" /> 4. Location & Custody
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('telemetry')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'telemetry'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Server className="w-4 h-4" /> 5. IT Network Telemetry
        </button>
      </div>

      {/* Main Registration Form */}
      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-xs">
        
        {/* TAB 1: GENERAL IDENTITY & CLASSIFICATION */}
        {activeTab === 'general' && (
          <div className="space-y-6 animate-fade-in">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Package className="w-4 h-4 text-purple-600" /> Primary Fixed Asset Identity & Classification
                </h3>
                <p className="text-xs text-slate-500">Define code identification, category structure, entity owner, and operational criticality.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Asset ID Code (Auto-generated if blank)</label>
                <input
                  type="text"
                  placeholder="e.g. AST-2026-9050"
                  value={formData.assetId}
                  onChange={(e) => setFormData({ ...formData, assetId: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Asset Description <span className="text-red-500 font-bold ml-0.5">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dell PowerEdge R760 2U Enterprise Server"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Asset Category Select */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Asset Category <span className="text-red-500 font-bold ml-0.5">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowCatModal(true)}
                    className="text-[11px] text-purple-600 hover:text-purple-800 hover:underline font-semibold flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-3 h-3" /> Add Category
                  </button>
                </div>
                <select
                  required
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:border-purple-500"
                >
                  <option value="">Select Asset Category</option>
                  {categories.map((c) => {
                    const idVal = c.id || c._id || c.code;
                    return (
                      <option key={idVal} value={idVal}>
                        {c.name} ({c.code || idVal})
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Company Entity Select */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Company Entity <span className="text-red-500 font-bold ml-0.5">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowCmpModal(true)}
                    className="text-[11px] text-purple-600 hover:text-purple-800 hover:underline font-semibold flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-3 h-3" /> Add Company
                  </button>
                </div>
                <select
                  required
                  value={formData.companyId}
                  onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:border-purple-500"
                >
                  <option value="">Select Company Entity</option>
                  {companies.map((c) => {
                    const idVal = c.id || c._id || c.code;
                    return (
                      <option key={idVal} value={idVal}>{c.name}</option>
                    );
                  })}
                </select>
              </div>

              {/* Site Campus Select */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Site Campus <span className="text-red-500 font-bold ml-0.5">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowSiteModal(true)}
                    className="text-[11px] text-purple-600 hover:text-purple-800 hover:underline font-semibold flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-3 h-3" /> Add Site
                  </button>
                </div>
                <select
                  required
                  value={formData.siteId}
                  onChange={(e) => setFormData({ ...formData, siteId: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:border-purple-500"
                >
                  <option value="">Select Site Campus</option>
                  {sites.map((s) => {
                    const idVal = s.id || s._id || s.code;
                    return (
                      <option key={idVal} value={idVal}>{s.name}</option>
                    );
                  })}
                </select>
              </div>

              {/* Operational Criticality Level */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Business Criticality Level</label>
                <select
                  value={formData.criticality}
                  onChange={(e) => setFormData({ ...formData, criticality: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:border-purple-500 font-semibold"
                >
                  {CRITICALITIES.map(crit => (
                    <option key={crit.value} value={crit.value}>{crit.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Lifecycle Status & Condition Status */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Initial Lifecycle Status</label>
                <select
                  value={formData.lifecycleStatus}
                  onChange={(e) => setFormData({ ...formData, lifecycleStatus: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:border-purple-500"
                >
                  {LIFECYCLE_STATUSES.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Physical Asset Condition</label>
                <select
                  value={formData.condition}
                  onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:border-purple-500"
                >
                  {CONDITIONS.map(cond => (
                    <option key={cond.value} value={cond.value}>{cond.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: BARCODE, SERIAL & SMART RFID TAGGING */}
        {activeTab === 'tracking' && (
          <div className="space-y-6 animate-fade-in">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Barcode className="w-4 h-4 text-purple-600" /> Serial Numbers, Barcodes & Real-Time RFID EPC Tags
                </h3>
                <p className="text-xs text-slate-500">Configure physical barcode labels, manufacturer serial keys, and RTLS automated tracking tags.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Manufacturer Serial Number</label>
                <input
                  type="text"
                  placeholder="e.g. SN-DELL-9001-A"
                  value={formData.serialNumber}
                  onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Asset Tag Number (Print Tag Label)</label>
                <input
                  type="text"
                  placeholder="e.g. TAG-9050"
                  value={formData.tagNumber}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData({ ...formData, tagNumber: val, barcode: formData.barcode ? formData.barcode : val });
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Barcode Value / Code128</label>
                <input
                  type="text"
                  placeholder="e.g. BAR-9050-128"
                  value={formData.barcode}
                  onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>

              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <Radio className="w-3.5 h-3.5 text-purple-600" />
                  <label className="text-xs font-semibold text-slate-700">RFID Tag EPC (UHF Gen2 / RTLS)</label>
                </div>
                <input
                  type="text"
                  placeholder="e.g. E28068940000501234567890"
                  value={formData.rfidEpc}
                  onChange={(e) => setFormData({ ...formData, rfidEpc: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>
            </div>

            <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl flex items-start gap-3 text-xs text-purple-900">
              <Radio className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block mb-0.5">Automated Real-Time Location System (RTLS) Integration</span>
                Registering an RFID EPC tag binds this fixed asset to automated overhead scanners, mobile hand-readers, and gate sensors across registered site campuses.
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: FINANCIAL & PROCUREMENT */}
        {activeTab === 'financial' && (
          <div className="space-y-6 animate-fade-in">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-purple-600" /> Financial Valuation, Procurement & Depreciation
                </h3>
                <p className="text-xs text-slate-500">Record purchase cost, currency, vendor info, PO reference, capitalization date, and depreciation schedule.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Acquisition Value <span className="text-red-500 font-bold ml-0.5">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.acquisitionValue}
                  onChange={(e) => setFormData({ ...formData, acquisitionValue: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:border-purple-500 font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Currency</label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:border-purple-500"
                >
                  <option value="USD">USD ($ - US Dollar)</option>
                  <option value="EUR">EUR (€ - Euro)</option>
                  <option value="GBP">GBP (£ - British Pound)</option>
                  <option value="INR">INR (₹ - Indian Rupee)</option>
                  <option value="CAD">CAD ($ - Canadian Dollar)</option>
                  <option value="AUD">AUD ($ - Australian Dollar)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Purchase Order (PO) Number</label>
                <input
                  type="text"
                  placeholder="e.g. PO-2026-8812"
                  value={formData.poNumber}
                  onChange={(e) => setFormData({ ...formData, poNumber: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Supplier / Vendor Name</label>
                <input
                  type="text"
                  placeholder="e.g. Dell Enterprise Direct / CDW"
                  value={formData.supplierName}
                  onChange={(e) => setFormData({ ...formData, supplierName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Purchase Date</label>
                <input
                  type="date"
                  value={formData.purchaseDate}
                  onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">In-Service Date (Capitalization)</label>
                <input
                  type="date"
                  value={formData.inServiceDate}
                  onChange={(e) => setFormData({ ...formData, inServiceDate: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Useful Life (Months for Depreciation)</label>
                <input
                  type="number"
                  min="1"
                  max="360"
                  value={formData.usefulLifeMonths}
                  onChange={(e) => setFormData({ ...formData, usefulLifeMonths: parseInt(e.target.value, 10) || 60 })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: LOCATION & CUSTODY */}
        {activeTab === 'location' && (
          <div className="space-y-6 animate-fade-in">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Building className="w-4 h-4 text-purple-600" /> Physical Location Hierarchy & Custodian Assignment
                </h3>
                <p className="text-xs text-slate-500">Specify precise building placement, cost center allocation, and primary employee owner.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Building Name / Tower</label>
                <input
                  type="text"
                  placeholder="e.g. Main Tech Building A"
                  value={formData.buildingId}
                  onChange={(e) => setFormData({ ...formData, buildingId: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Floor Level</label>
                <input
                  type="text"
                  placeholder="e.g. Floor 3"
                  value={formData.floorId}
                  onChange={(e) => setFormData({ ...formData, floorId: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Room / Server Rack</label>
                <input
                  type="text"
                  placeholder="e.g. Server Room 304 - Rack 04"
                  value={formData.roomId}
                  onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Department</label>
                <select
                  value={formData.departmentId}
                  onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:border-purple-500"
                >
                  <option value="">Select Department</option>
                  {departments.map((d) => (
                    <option key={d.id || d.code} value={d.id || d.code}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Cost Center Code</label>
                <select
                  value={formData.costCenterId}
                  onChange={(e) => setFormData({ ...formData, costCenterId: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:border-purple-500"
                >
                  <option value="">Select Cost Center</option>
                  {costCenters.map((cc) => (
                    <option key={cc.id || cc.code} value={cc.id || cc.code}>
                      {cc.name} ({cc.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Asset Custodian / Employee</label>
                <select
                  value={formData.custodianId}
                  onChange={(e) => setFormData({ ...formData, custodianId: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:border-purple-500"
                >
                  <option value="">Select Custodian</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.title || emp.email})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: IT NETWORK TELEMETRY */}
        {activeTab === 'telemetry' && (
          <div className="space-y-6 animate-fade-in">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Server className="w-4 h-4 text-purple-600" /> IT Auto-Discovery & Network Telemetry
                </h3>
                <p className="text-xs text-slate-500">Configure hostnames, IP allocations, and MAC addresses for IT infrastructure and hardware compute assets.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Hostname / FQDN</label>
                <input
                  type="text"
                  placeholder="e.g. srv-db-prod01.corp.internal"
                  value={formData.hostname}
                  onChange={(e) => setFormData({ ...formData, hostname: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">IP Address (IPv4/IPv6)</label>
                <input
                  type="text"
                  placeholder="e.g. 10.200.4.150"
                  value={formData.ipAddress}
                  onChange={(e) => setFormData({ ...formData, ipAddress: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Hardware MAC Address</label>
                <input
                  type="text"
                  placeholder="e.g. 00:1A:2B:3C:4D:5E"
                  value={formData.macAddress}
                  onChange={(e) => setFormData({ ...formData, macAddress: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* Submit Actions Bar */}
        <div className="flex items-center justify-between pt-5 border-t border-slate-200">
          <div className="text-xs text-slate-500">
            Fields marked with <span className="text-red-500 font-bold text-sm">*</span> are required for registration.
          </div>

          <div className="flex items-center gap-3">
            {activeTab !== 'general' && (
              <button
                type="button"
                onClick={() => {
                  const tabs = ['general', 'tracking', 'financial', 'location', 'telemetry'];
                  const idx = tabs.indexOf(activeTab);
                  if (idx > 0) setActiveTab(tabs[idx - 1]);
                }}
                className="px-3.5 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-semibold"
              >
                Previous Step
              </button>
            )}

            {activeTab !== 'telemetry' ? (
              <button
                type="button"
                onClick={() => {
                  const tabs = ['general', 'tracking', 'financial', 'location', 'telemetry'];
                  const idx = tabs.indexOf(activeTab);
                  if (idx < tabs.length - 1) setActiveTab(tabs[idx + 1]);
                }}
                className="px-4 py-2 rounded-xl bg-purple-100 text-purple-700 hover:bg-purple-200 text-xs font-bold flex items-center gap-1.5"
              >
                Next Step &rarr;
              </button>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary bg-purple-600 hover:bg-purple-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-md transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Registering Record...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" /> Save & Register Asset
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Modular Master Data Modals */}
      <AddCustomCategoryModal
        isOpen={showCatModal}
        onClose={() => setShowCatModal(false)}
        onSuccess={handleCategoryAdded}
      />

      <AddCompanyModal
        isOpen={showCmpModal}
        onClose={() => setShowCmpModal(false)}
        onSuccess={handleCompanyAdded}
      />

      <AddSiteModal
        isOpen={showSiteModal}
        onClose={() => setShowSiteModal(false)}
        onSuccess={handleSiteAdded}
        companies={companies}
      />
    </div>
  );
}
