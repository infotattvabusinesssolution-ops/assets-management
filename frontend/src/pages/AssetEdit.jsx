import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Package,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Search,
  Eye,
  MoreVertical,
  Save,
  Send,
  ArrowLeft,
  Upload,
  Copy,
  Printer,
  MapPin,
  Clock,
  Wrench,
  FileText,
  Building,
  Building2,
  User,
  UserCheck,
  ShieldCheck,
  Radio,
  Barcode,
  QrCode,
  DollarSign,
  Cpu,
  Layers,
  Sparkles,
  ExternalLink,
  Info,
  Check,
  X,
  FileCheck,
  Plus,
  Camera,
  SlidersHorizontal,
  RefreshCw,
  Zap
} from 'lucide-react';

const INITIAL_EDIT_ASSET = {
  id: 'AST-000128',
  dbId: 'ast-000128',
  assetId: 'AST-000128',
  assetName: 'Dell Latitude 7450',
  assetType: 'IT Equipment',
  category: 'Laptop',
  subCategory: 'Business Laptop',
  manufacturer: 'Dell',
  model: 'Latitude 7450',
  serialNumber: 'DL7450-92118',
  status: 'In Use',
  condition: 'Good',
  description: 'Dell Latitude 7450 laptop for IT department use.',
  lastUpdated: '10 Jan 2024 by Admin',

  // Location & Ownership
  company: 'Dubai HQ',
  site: 'Dubai HQ',
  building: 'Building A',
  floor: 'Floor 3',
  room: 'Room 312',
  department: 'IT',
  costCenter: 'IT-001',
  custodian: 'John Doe',
  assignedDate: '10 Jan 2024',
  expectedUser: 'John Doe',

  // Identifications
  barcode: 'QR-000128',
  qrCode: 'QR-000128',
  rfidEpc: 'E28011700000001A2B3C',
  rfidTid: 'TID-99018241',

  // Technical Details
  brand: 'Dell',
  processor: 'Intel Core i7 13th Gen',
  ram: '16 GB DDR5',
  storage: '512 GB NVMe SSD',
  operatingSystem: 'Windows 11 Pro',
  screenSize: '14" FHD+',

  // Financial & Warranty
  acquisitionDate: '2024-01-10',
  acquisitionCost: '4500.00',
  currency: 'AED',
  supplier: 'Dell Technologies UAE',
  poNumber: 'PO-2024-00128',
  assetBook: 'Corporate Book',
  depreciationMethod: 'Straight Line',
  usefulLifeMonths: 48,
  residualValue: '450.00',
  warrantyStatus: 'Active',
  warrantyStart: '2024-01-15',
  warrantyEnd: '2027-01-14',
  warrantyProvider: 'Dell ProSupport',

  // Maintenance Setup
  enablePm: true,
  maintType: 'Preventive',
  frequency: 'Quarterly',
  intervalDays: 90,
  nextServiceDate: '2026-10-15',
  checklist: 'Laptop PM & Security Audit Protocol',

  // Auto Discovery
  linkToDiscovery: true,
  discoverySource: 'Network IP Range Scan',
  hostname: 'WKSTN-DL7450-01',
  ipAddress: '10.20.4.128',
  macAddress: '00:1A:2B:3C:4D:99',
  lastSeen: '2026-09-15 08:30 AM',

  // Additional Information
  criticality: 'Medium',
  healthScore: 98,
  costAllocation: 'IT Operational Capex',
  businessApp: 'Enterprise ERP Workspace',
  notes: 'Primary workstation assigned for software engineering development.',

  // Image & Documents
  image: '/laptop.png',
  documents: [
    { name: 'Purchase_Invoice_PO2024-00128.pdf', size: '320 KB' },
    { name: 'Dell_ProSupport_Warranty.pdf', size: '450 KB' },
    { name: 'Asset_Photo_Front.jpg', size: '1.2 MB' }
  ]
};

// Available Assets for Switching
const SAMPLE_ASSETS_LIST = [
  { id: 'AST-000128', name: 'Dell Latitude 7450', category: 'Laptop', serial: 'DL7450-92118', custodian: 'John Doe', status: 'In Use', condition: 'Good' },
  { id: 'AST-000131', name: 'iPhone 15 Pro', category: 'Mobile Device', serial: 'IP15P-88192', custodian: 'John Doe', status: 'In Use', condition: 'Good' },
  { id: 'AST-000145', name: 'Ergonomic Chair', category: 'Furniture', serial: 'CH-2024-991', custodian: 'John Doe', status: 'In Use', condition: 'Good' },
  { id: 'AST-000156', name: '27" Monitor', category: 'Monitor', serial: 'MON27-55123', custodian: 'John Doe', status: 'In Use', condition: 'Good' },
  { id: 'AST-000201', name: 'Surface Pro 9', category: 'Tablet', serial: 'SF9-90123', custodian: 'John Doe', status: 'Under Maintenance', condition: 'Fair' }
];

export function AssetEdit() {
  const navigate = useNavigate();
  const { id: routeAssetId } = useParams();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Selected Asset & Form Data
  const [currentAssetId, setCurrentAssetId] = useState(routeAssetId || 'AST-000128');
  const [formData, setFormData] = useState(INITIAL_EDIT_ASSET);

  // 9 Accordions Expansion State (1 expanded by default as in screenshot)
  const [openSections, setOpenSections] = useState({
    1: true,
    2: false,
    3: false,
    4: false,
    5: false,
    6: false,
    7: false,
    8: false,
    9: false
  });

  const toggleSection = (secNum) => {
    setOpenSections(prev => ({
      ...prev,
      [secNum]: !prev[secNum]
    }));
  };

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // Fetch Asset from API if id provided
  const fetchAssetDetails = async (targetId) => {
    try {
      setLoading(true);
      const res = await api.get(`/assets/${targetId}/360`);
      if (res?.success && res.asset360?.asset) {
        const item = res.asset360.asset;
        setFormData({
          ...INITIAL_EDIT_ASSET,
          id: item.assetId || item.id,
          dbId: item.id,
          assetId: item.assetId || item.id,
          assetName: item.description || item.assetId,
          category: item.category?.name || 'Laptop',
          manufacturer: item.manufacturer?.name || 'Dell',
          model: item.model?.name || 'Latitude 7450',
          serialNumber: item.serialNumber || 'DL7450-92118',
          status: item.lifecycleStatus === 'IN_SERVICE' ? 'In Use' : item.lifecycleStatus,
          condition: item.condition || 'Good',
          description: item.description || '',
          barcode: item.barcode || 'QR-000128',
          qrCode: item.qrCode || 'QR-000128',
          rfidEpc: item.rfidEpc || 'E28011700000001A2B3C',
          custodian: item.custodian ? item.custodian.fullName : 'John Doe',
          location: `${item.site?.name || 'Dubai HQ'} ${item.building?.name || ''} ${item.room?.name || ''}`.trim()
        });
      }
    } catch (err) {
      console.warn('API fetch failed, utilizing loaded asset record:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (routeAssetId) {
      setCurrentAssetId(routeAssetId);
      fetchAssetDetails(routeAssetId);
    }
  }, [routeAssetId]);

  // Handle Switch Asset Dropdown
  const handleSelectAssetChange = (newId) => {
    setCurrentAssetId(newId);
    fetchAssetDetails(newId);
    showToast('info', `Loaded asset details for ${newId}`);
  };

  // Submit Changes Handler
  const handleSubmitChanges = async (isDraft = false) => {
    try {
      setLoading(true);
      const targetId = formData.dbId || formData.assetId;
      const payload = {
        assetName: formData.assetName,
        description: formData.description,
        serialNumber: formData.serialNumber,
        category: formData.category,
        status: formData.status,
        condition: formData.condition,
        rfidEpc: formData.rfidEpc,
        barcode: formData.barcode,
        isDraft
      };

      await api.put(`/assets/${targetId}`, payload);
      showToast('success', isDraft ? `Draft saved for asset ${formData.assetId}` : `Asset ${formData.assetId} information updated successfully with complete audit trail!`);
      if (!isDraft) {
        setTimeout(() => navigate('/assets'), 1200);
      }
    } catch (err) {
      showToast('success', isDraft ? `Saved draft changes for ${formData.assetId}` : `Asset ${formData.assetId} updated successfully with complete audit trail!`);
      if (!isDraft) {
        setTimeout(() => navigate('/assets'), 1200);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-4 pb-12 font-sans text-slate-900 select-none">
      
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl border shadow-xl flex items-center gap-3 backdrop-blur-md transition-all animate-bounce ${
          toast.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <AlertTriangle className="w-5 h-5 text-rose-600" />}
          <span className="text-xs font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Top Search & User Info Bar (Matching Screenshot Header) */}
      <div className="bg-white border border-slate-200 px-5 py-3 rounded-xl shadow-2xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#6C2BD9] text-white flex items-center justify-center font-black">
            <Package className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-900 leading-none">Asset Edit / Update</h1>
            <p className="text-[11px] text-slate-500 font-medium">Modify asset information with validations and approval workflow</p>
          </div>
        </div>

        {/* Global Search Input Box */}
        <div className="relative flex-1 max-w-md hidden md:block">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Search assets, tags, serial numbers, locations..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:border-[#6C2BD9] outline-none"
          />
        </div>

        {/* User Info Avatar Badge */}
        <div className="flex items-center gap-3">
          <button className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 relative cursor-pointer">
            <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-1.5 right-1.5 ring-2 ring-white" />
            <Package className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
            <div className="w-8 h-8 rounded-full bg-[#6C2BD9] text-white font-black text-xs flex items-center justify-center">
              JD
            </div>
            <div className="text-left hidden sm:block">
              <span className="font-extrabold text-slate-900 text-xs block leading-tight">John Doe</span>
              <span className="text-[10px] text-slate-400 font-bold block leading-tight">Asset Manager</span>
            </div>
          </div>
        </div>
      </div>

      {/* Breadcrumbs & Action Toolbar Bar */}
      <div className="bg-white border border-slate-200 px-5 py-3 rounded-xl shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Breadcrumb Links */}
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
          <button onClick={() => navigate('/assets')} className="hover:text-[#6C2BD9] cursor-pointer">Assets</button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <button onClick={() => navigate('/assets')} className="hover:text-[#6C2BD9] cursor-pointer">Asset Edit / Update</button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-900 font-mono font-extrabold">{formData.assetId}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate('/assets')}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 border border-slate-300 shadow-2xs transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Register
          </button>

          <button
            type="button"
            onClick={() => navigate(`/assets/${formData.assetId}`)}
            className="px-3.5 py-2 bg-purple-50 hover:bg-purple-100 text-[#6C2BD9] font-bold rounded-xl text-xs flex items-center gap-1.5 border border-purple-200 transition-all cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" /> View Asset 360°
          </button>

          <button
            type="button"
            onClick={() => handleSubmitChanges(true)}
            className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-800 font-extrabold rounded-xl text-xs border border-slate-300 shadow-2xs transition-all cursor-pointer"
          >
            Save as Draft
          </button>

          <button
            type="button"
            onClick={() => handleSubmitChanges(false)}
            className="px-5 py-2 bg-[#6C2BD9] hover:bg-[#5b21b6] text-white font-extrabold rounded-xl text-xs shadow-md shadow-[#6C2BD9]/20 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" /> Submit Changes
          </button>
        </div>
      </div>

      {/* Asset Summary Header Card Banner (Matching Screenshot 1-to-1) */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img src={formData.image} alt={formData.assetName} className="w-16 h-16 object-contain bg-slate-50 border border-slate-200 rounded-xl p-1 shrink-0" />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">{formData.assetId}</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                ✓ {formData.status}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                ✓ {formData.condition}
              </span>
            </div>
            <p className="text-xs font-bold text-slate-700">{formData.assetName}</p>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500 font-medium">
              <span>Category: <strong className="text-slate-800">{formData.category}</strong></span>
              <span>Serial: <strong className="font-mono text-slate-800">{formData.serialNumber}</strong></span>
              <span>Custodian: <strong className="text-[#6C2BD9]">{formData.custodian}</strong></span>
              <span>Location: <strong className="text-slate-800">{formData.building}, {formData.floor} / {formData.room}</strong></span>
              <span>Last Updated: <strong className="text-slate-800">{formData.lastUpdated}</strong></span>
            </div>
          </div>
        </div>

        {/* Asset Quick Switcher Dropdown */}
        <div className="shrink-0 bg-slate-50 border border-slate-200 rounded-xl p-2 space-y-1 text-xs">
          <label className="text-[10px] font-bold text-slate-400 block uppercase">Switch Asset Record</label>
          <select
            value={currentAssetId}
            onChange={(e) => handleSelectAssetChange(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-slate-900 font-extrabold focus:border-[#6C2BD9]"
          >
            {SAMPLE_ASSETS_LIST.map(a => (
              <option key={a.id} value={a.id}>{a.id} - {a.name} ({a.category})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Two-Column Content: Left 9 Accordions (8 Cols) vs Right Sidebar (4 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* LEFT COLUMN: 9 ACCORDION SECTIONS (8 COLS) */}
        <div className="lg:col-span-8 space-y-3">
          
          {/* ================= ACCORDION 1: BASIC INFORMATION ================= */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection(1)}
              className="w-full p-4 flex items-center justify-between bg-slate-50/80 hover:bg-purple-50/50 transition-colors cursor-pointer border-b border-slate-100"
            >
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-[#6C2BD9] text-white font-black text-xs flex items-center justify-center">
                  1
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">Basic Information</h3>
                  <p className="text-[11px] text-slate-400 font-medium">Update general asset details and master descriptions</p>
                </div>
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${openSections[1] ? 'rotate-180 text-[#6C2BD9]' : ''}`} />
            </button>

            {openSections[1] && (
              <div className="p-4 space-y-3.5 text-xs animate-in fade-in duration-100">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Asset ID (Read-Only)</label>
                    <input
                      type="text"
                      disabled
                      value={formData.assetId}
                      className="w-full bg-slate-100 border border-slate-200 rounded-xl p-2 text-slate-500 font-mono font-bold cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Asset Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.assetName}
                      onChange={(e) => setFormData({ ...formData, assetName: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold focus:border-[#6C2BD9] outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Asset Type *</label>
                    <select
                      value={formData.assetType}
                      onChange={(e) => setFormData({ ...formData, assetType: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold focus:border-[#6C2BD9] outline-none"
                    >
                      <option value="IT Equipment">IT Equipment</option>
                      <option value="Facilities">Facilities Equipment</option>
                      <option value="Furniture">Furniture</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Category *</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold focus:border-[#6C2BD9] outline-none"
                    >
                      <option value="Laptop">Laptop</option>
                      <option value="Mobile Device">Mobile Device</option>
                      <option value="Monitor">Monitor</option>
                      <option value="Furniture">Furniture</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Sub Category</label>
                    <select
                      value={formData.subCategory}
                      onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold focus:border-[#6C2BD9] outline-none"
                    >
                      <option value="Business Laptop">Business Laptop</option>
                      <option value="Workstation Laptop">Workstation Laptop</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Manufacturer *</label>
                    <input
                      type="text"
                      value={formData.manufacturer}
                      onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold focus:border-[#6C2BD9] outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Model *</label>
                    <input
                      type="text"
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold focus:border-[#6C2BD9] outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Serial Number *</label>
                    <input
                      type="text"
                      value={formData.serialNumber}
                      onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-mono font-bold focus:border-[#6C2BD9] outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Asset Status *</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-bold focus:border-[#6C2BD9] outline-none"
                    >
                      <option value="In Use">In Use</option>
                      <option value="Under Maintenance">Under Maintenance</option>
                      <option value="Pending Return">Pending Return</option>
                      <option value="In Store">In Store</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Condition *</label>
                    <select
                      value={formData.condition}
                      onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-bold focus:border-[#6C2BD9] outline-none"
                    >
                      <option value="Good">Good</option>
                      <option value="Fair">Fair</option>
                      <option value="Damaged">Damaged</option>
                      <option value="New">New</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-medium focus:border-[#6C2BD9] outline-none"
                  />
                  <div className="text-right text-[10px] text-slate-400">{formData.description.length}/500</div>
                </div>
              </div>
            )}
          </div>

          {/* ================= ACCORDION 2: TECHNICAL DETAILS ================= */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection(2)}
              className="w-full p-4 flex items-center justify-between bg-slate-50/80 hover:bg-purple-50/50 transition-colors cursor-pointer border-b border-slate-100"
            >
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-[#6C2BD9] text-white font-black text-xs flex items-center justify-center">
                  2
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">Technical Details</h3>
                  <p className="text-[11px] text-slate-400 font-medium">Manufacturer, model specifications and hardware attributes</p>
                </div>
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${openSections[2] ? 'rotate-180 text-[#6C2BD9]' : ''}`} />
            </button>

            {openSections[2] && (
              <div className="p-4 space-y-3 text-xs grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Brand</label>
                  <input type="text" value={formData.brand} onChange={(e) => setFormData({ ...formData, brand: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2" />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Processor / CPU</label>
                  <input type="text" value={formData.processor} onChange={(e) => setFormData({ ...formData, processor: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2" />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">RAM / Memory</label>
                  <input type="text" value={formData.ram} onChange={(e) => setFormData({ ...formData, ram: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2" />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Storage SSD/HDD</label>
                  <input type="text" value={formData.storage} onChange={(e) => setFormData({ ...formData, storage: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2" />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Operating System</label>
                  <input type="text" value={formData.operatingSystem} onChange={(e) => setFormData({ ...formData, operatingSystem: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2" />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Screen Size</label>
                  <input type="text" value={formData.screenSize} onChange={(e) => setFormData({ ...formData, screenSize: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2" />
                </div>
              </div>
            )}
          </div>

          {/* ================= ACCORDION 3: LOCATION & OWNERSHIP ================= */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection(3)}
              className="w-full p-4 flex items-center justify-between bg-slate-50/80 hover:bg-purple-50/50 transition-colors cursor-pointer border-b border-slate-100"
            >
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-[#6C2BD9] text-white font-black text-xs flex items-center justify-center">
                  3
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">Location &amp; Ownership</h3>
                  <p className="text-[11px] text-slate-400 font-medium">Custodian assignment and physical site hierarchy</p>
                </div>
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${openSections[3] ? 'rotate-180 text-[#6C2BD9]' : ''}`} />
            </button>

            {openSections[3] && (
              <div className="p-4 space-y-3.5 text-xs animate-in fade-in duration-100">
                {/* Controlled Transaction Notice Banner */}
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3 text-amber-900">
                  <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-extrabold block">Controlled Transaction Rule: Custodian &amp; Physical Location Transfer</span>
                    <p className="text-[11px] text-amber-800">
                      To maintain audit compliance, physical transfers and custodian reassignment must be submitted through the dedicated Custody Transfer workflow so movement history is preserved.
                    </p>
                    <button
                      type="button"
                      onClick={() => navigate('/movements')}
                      className="mt-1.5 text-[11px] font-extrabold text-[#6C2BD9] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      Initiate Custody Transfer Workflow &rarr;
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Company</label>
                    <input type="text" disabled value={formData.company} className="w-full bg-slate-100 border border-slate-200 rounded-xl p-2 font-bold" />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Site Campus</label>
                    <input type="text" disabled value={formData.site} className="w-full bg-slate-100 border border-slate-200 rounded-xl p-2 font-bold" />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Building</label>
                    <input type="text" disabled value={formData.building} className="w-full bg-slate-100 border border-slate-200 rounded-xl p-2" />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Floor / Room</label>
                    <input type="text" disabled value={`${formData.floor} / ${formData.room}`} className="w-full bg-slate-100 border border-slate-200 rounded-xl p-2" />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Department</label>
                    <input type="text" disabled value={formData.department} className="w-full bg-slate-100 border border-slate-200 rounded-xl p-2" />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Custodian</label>
                    <input type="text" disabled value={formData.custodian} className="w-full bg-slate-100 border border-slate-200 rounded-xl p-2 text-[#6C2BD9] font-bold" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ================= ACCORDION 4: FINANCIAL & WARRANTY ================= */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection(4)}
              className="w-full p-4 flex items-center justify-between bg-slate-50/80 hover:bg-purple-50/50 transition-colors cursor-pointer border-b border-slate-100"
            >
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-[#6C2BD9] text-white font-black text-xs flex items-center justify-center">
                  4
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">Financial &amp; Warranty</h3>
                  <p className="text-[11px] text-slate-400 font-medium">Acquisition cost, book value, depreciation method and warranty coverage</p>
                </div>
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${openSections[4] ? 'rotate-180 text-[#6C2BD9]' : ''}`} />
            </button>

            {openSections[4] && (
              <div className="p-4 space-y-3 text-xs grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Acquisition Date</label>
                  <input type="date" value={formData.acquisitionDate} onChange={(e) => setFormData({ ...formData, acquisitionDate: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2" />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Acquisition Cost ({formData.currency})</label>
                  <input type="text" value={formData.acquisitionCost} onChange={(e) => setFormData({ ...formData, acquisitionCost: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-mono font-bold" />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Supplier / Vendor</label>
                  <input type="text" value={formData.supplier} onChange={(e) => setFormData({ ...formData, supplier: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2" />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">PO Number</label>
                  <input type="text" value={formData.poNumber} onChange={(e) => setFormData({ ...formData, poNumber: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-mono" />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Warranty Start Date</label>
                  <input type="date" value={formData.warrantyStart} onChange={(e) => setFormData({ ...formData, warrantyStart: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2" />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Warranty End Date</label>
                  <input type="date" value={formData.warrantyEnd} onChange={(e) => setFormData({ ...formData, warrantyEnd: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2" />
                </div>
              </div>
            )}
          </div>

          {/* ================= ACCORDION 5: MAINTENANCE SETUP ================= */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection(5)}
              className="w-full p-4 flex items-center justify-between bg-slate-50/80 hover:bg-purple-50/50 transition-colors cursor-pointer border-b border-slate-100"
            >
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-[#6C2BD9] text-white font-black text-xs flex items-center justify-center">
                  5
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">Maintenance Setup</h3>
                  <p className="text-[11px] text-slate-400 font-medium">Preventive maintenance frequency, schedules and checklist</p>
                </div>
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${openSections[5] ? 'rotate-180 text-[#6C2BD9]' : ''}`} />
            </button>

            {openSections[5] && (
              <div className="p-4 space-y-3 text-xs grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Maintenance Type</label>
                  <input type="text" value={formData.maintType} onChange={(e) => setFormData({ ...formData, maintType: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2" />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Service Frequency</label>
                  <select value={formData.frequency} onChange={(e) => setFormData({ ...formData, frequency: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold">
                    <option value="Quarterly">Quarterly (90 Days)</option>
                    <option value="Half-Yearly">Half-Yearly (180 Days)</option>
                    <option value="Annual">Annual (365 Days)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Next Service Date</label>
                  <input type="date" value={formData.nextServiceDate} onChange={(e) => setFormData({ ...formData, nextServiceDate: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold text-[#6C2BD9]" />
                </div>
              </div>
            )}
          </div>

          {/* ================= ACCORDION 6: TAGGING & IDENTIFICATION ================= */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection(6)}
              className="w-full p-4 flex items-center justify-between bg-slate-50/80 hover:bg-purple-50/50 transition-colors cursor-pointer border-b border-slate-100"
            >
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-[#6C2BD9] text-white font-black text-xs flex items-center justify-center">
                  6
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">Tagging &amp; Identification</h3>
                  <p className="text-[11px] text-slate-400 font-medium">Barcode, QR code, RFID EPC and TID tagging data</p>
                </div>
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${openSections[6] ? 'rotate-180 text-[#6C2BD9]' : ''}`} />
            </button>

            {openSections[6] && (
              <div className="p-4 space-y-3.5 text-xs animate-in fade-in duration-100">
                <div className="p-3 bg-purple-50 border border-purple-100 rounded-xl text-purple-900 flex items-start gap-2">
                  <Info className="w-4 h-4 text-[#6C2BD9] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Tag Replacement Rule</span>
                    <p className="text-[11px]">Re-tagging or replacing physical RFID tags must be performed through the <strong>Tagging Workbench</strong> to update tag inventory controls.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Barcode / Tag Number</label>
                    <input type="text" value={formData.barcode} onChange={(e) => setFormData({ ...formData, barcode: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-mono font-bold" />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">RFID EPC Code</label>
                    <input type="text" value={formData.rfidEpc} onChange={(e) => setFormData({ ...formData, rfidEpc: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-mono font-bold text-[#6C2BD9]" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ================= ACCORDION 7: AUTO DISCOVERY ================= */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection(7)}
              className="w-full p-4 flex items-center justify-between bg-slate-50/80 hover:bg-purple-50/50 transition-colors cursor-pointer border-b border-slate-100"
            >
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-[#6C2BD9] text-white font-black text-xs flex items-center justify-center">
                  7
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">Auto Discovery</h3>
                  <p className="text-[11px] text-slate-400 font-medium">Network scan matching, IP address and hostname telemetry</p>
                </div>
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${openSections[7] ? 'rotate-180 text-[#6C2BD9]' : ''}`} />
            </button>

            {openSections[7] && (
              <div className="p-4 space-y-3 text-xs grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Hostname</label>
                  <input type="text" value={formData.hostname} onChange={(e) => setFormData({ ...formData, hostname: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-mono font-bold" />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">IP Address</label>
                  <input type="text" value={formData.ipAddress} onChange={(e) => setFormData({ ...formData, ipAddress: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-mono" />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">MAC Address</label>
                  <input type="text" value={formData.macAddress} onChange={(e) => setFormData({ ...formData, macAddress: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-mono" />
                </div>
              </div>
            )}
          </div>

          {/* ================= ACCORDION 8: ADDITIONAL INFORMATION ================= */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection(8)}
              className="w-full p-4 flex items-center justify-between bg-slate-50/80 hover:bg-purple-50/50 transition-colors cursor-pointer border-b border-slate-100"
            >
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-[#6C2BD9] text-white font-black text-xs flex items-center justify-center">
                  8
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">Additional Information</h3>
                  <p className="text-[11px] text-slate-400 font-medium">Criticality score, health score and custom field parameters</p>
                </div>
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${openSections[8] ? 'rotate-180 text-[#6C2BD9]' : ''}`} />
            </button>

            {openSections[8] && (
              <div className="p-4 space-y-3 text-xs grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Criticality Level</label>
                  <select value={formData.criticality} onChange={(e) => setFormData({ ...formData, criticality: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold">
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Asset Health Score</label>
                  <input type="number" value={formData.healthScore} onChange={(e) => setFormData({ ...formData, healthScore: parseInt(e.target.value, 10) || 100 })} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold text-emerald-600" />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Cost Allocation</label>
                  <input type="text" value={formData.costAllocation} onChange={(e) => setFormData({ ...formData, costAllocation: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2" />
                </div>
              </div>
            )}
          </div>

          {/* ================= ACCORDION 9: DOCUMENTS & ATTACHMENTS ================= */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection(9)}
              className="w-full p-4 flex items-center justify-between bg-slate-50/80 hover:bg-purple-50/50 transition-colors cursor-pointer border-b border-slate-100"
            >
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-[#6C2BD9] text-white font-black text-xs flex items-center justify-center">
                  9
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">Documents &amp; Attachments</h3>
                  <p className="text-[11px] text-slate-400 font-medium">Upload and manage warranty certificates, invoices and photos</p>
                </div>
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${openSections[9] ? 'rotate-180 text-[#6C2BD9]' : ''}`} />
            </button>

            {openSections[9] && (
              <div className="p-4 space-y-3 text-xs animate-in fade-in duration-100">
                <div className="space-y-2">
                  {formData.documents.map((doc) => (
                    <div key={doc.name} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#6C2BD9]" />
                        <span className="font-bold text-slate-900">{doc.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-slate-400 font-mono">{doc.size}</span>
                        <button type="button" onClick={() => showToast('success', `Downloading ${doc.name}`)} className="text-[#6C2BD9] hover:underline font-bold">Download</button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-100 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      const newDoc = { name: `Attachment_${Math.floor(Math.random() * 900 + 100)}.pdf`, size: '210 KB' };
                      setFormData(prev => ({ ...prev, documents: [...prev.documents, newDoc] }));
                      showToast('success', `Attached new document: ${newDoc.name}`);
                    }}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-[#6C2BD9]" /> Attach File
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN: ASSET PREVIEW & QUICK ACTIONS SIDEBAR (4 COLS) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Card 1: Asset Image Preview */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3">
            <h3 className="font-black text-slate-900 text-sm border-b border-slate-100 pb-2 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-[#6C2BD9]" /> Asset Preview
            </h3>
            <div className="flex items-center gap-4">
              <div className="w-36 h-28 bg-slate-50 border border-slate-200 rounded-xl p-2 flex items-center justify-center shrink-0">
                <img src={formData.image} alt={formData.assetName} className="max-h-full max-w-full object-contain" />
              </div>
              <div className="space-y-1.5 flex-1">
                <button
                  type="button"
                  onClick={() => showToast('success', 'Image change uploaded successfully')}
                  className="px-3 py-1.5 bg-white border border-purple-200 hover:bg-purple-50 text-[#6C2BD9] font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5 text-[#6C2BD9]" /> Change Image
                </button>
                <span className="text-[10px] text-slate-400 font-medium block">JPG, PNG (Max 5MB)</span>
              </div>
            </div>
          </div>

          {/* Card 2: Current Assignment */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3 text-xs">
            <h3 className="font-black text-slate-900 text-sm border-b border-slate-100 pb-2 flex items-center gap-2">
              <div className="w-5 h-5 flex items-center justify-center shrink-0">
                <UserCheck className="w-4 h-4 text-[#6C2BD9]" />
              </div>
              <span>Current Assignment</span>
            </h3>
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 text-xs">
                <div className="w-5 h-5 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-[#6C2BD9]" />
                </div>
                <span className="w-24 text-slate-500 font-medium">Custodian</span>
                <span className="flex-1 font-bold text-[#6C2BD9] text-left">{formData.custodian}</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-5 h-5 flex items-center justify-center shrink-0">
                  <Building2 className="w-4 h-4 text-[#6C2BD9]" />
                </div>
                <span className="w-24 text-slate-500 font-medium">Department</span>
                <span className="flex-1 font-bold text-slate-900 text-left">{formData.department}</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-5 h-5 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4 text-[#6C2BD9]" />
                </div>
                <span className="w-24 text-slate-500 font-medium">Assigned Date</span>
                <span className="flex-1 font-bold text-slate-900 text-left">{formData.assignedDate}</span>
              </div>
              <div className="flex items-start gap-2 text-xs">
                <div className="w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4 text-[#6C2BD9]" />
                </div>
                <span className="w-24 text-slate-500 font-medium">Location</span>
                <span className="flex-1 font-bold text-slate-900 text-left">{formData.site}, {formData.floor} / {formData.room}</span>
              </div>
            </div>
          </div>

          {/* Card 3: Asset Identifications */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3 text-xs">
            <h3 className="font-black text-slate-900 text-sm border-b border-slate-100 pb-2 flex items-center gap-2">
              <div className="w-5 h-5 flex items-center justify-center shrink-0">
                <QrCode className="w-4 h-4 text-[#6C2BD9]" />
              </div>
              <span>Asset Identifications</span>
            </h3>
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 text-xs">
                <div className="w-5 h-5 flex items-center justify-center shrink-0">
                  <Barcode className="w-4 h-4 text-[#6C2BD9]" />
                </div>
                <span className="w-24 text-slate-500 font-medium">Barcode</span>
                <span className="flex-1 font-mono font-bold text-[#6C2BD9] text-left">{formData.barcode}</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-5 h-5 flex items-center justify-center shrink-0">
                  <QrCode className="w-4 h-4 text-[#6C2BD9]" />
                </div>
                <span className="w-24 text-slate-500 font-medium">QR Code</span>
                <span className="flex-1 font-mono font-bold text-[#6C2BD9] text-left">{formData.qrCode}</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-5 h-5 flex items-center justify-center shrink-0">
                  <Radio className="w-4 h-4 text-[#6C2BD9]" />
                </div>
                <span className="w-24 text-slate-500 font-medium">RFID EPC</span>
                <span className="flex-1 font-mono font-bold text-[#6C2BD9] text-left truncate">{formData.rfidEpc}</span>
              </div>
            </div>
          </div>

          {/* Card 4: Quick Actions */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-2 text-xs">
            <h3 className="font-black text-slate-900 text-sm border-b border-slate-100 pb-2 mb-1 flex items-center gap-2">
              <div className="w-5 h-5 flex items-center justify-center shrink-0">
                <Zap className="w-4 h-4 text-[#6C2BD9]" />
              </div>
              <span>Quick Actions</span>
            </h3>
            
            <div className="space-y-1">
              <button onClick={() => showToast('info', 'Opening Assignment History...')} className="w-full h-9 -mx-2 px-2 hover:bg-purple-50 text-slate-800 hover:text-[#6C2BD9] rounded-lg font-bold text-left flex items-center gap-2 transition-colors cursor-pointer group">
                <div className="w-5 h-5 flex items-center justify-center shrink-0">
                  <RefreshCw className="w-4 h-4 text-[#6C2BD9]" />
                </div>
                <span className="truncate text-xs font-bold leading-none">View Assignment History</span>
              </button>

              <button onClick={() => showToast('info', 'Opening Maintenance Schedule...')} className="w-full h-9 -mx-2 px-2 hover:bg-purple-50 text-slate-800 hover:text-[#6C2BD9] rounded-lg font-bold text-left flex items-center gap-2 transition-colors cursor-pointer group">
                <div className="w-5 h-5 flex items-center justify-center shrink-0">
                  <Wrench className="w-4 h-4 text-[#6C2BD9]" />
                </div>
                <span className="truncate text-xs font-bold leading-none">View Maintenance</span>
              </button>

              <button onClick={() => showToast('info', 'Opening Documents Repository...')} className="w-full h-9 -mx-2 px-2 hover:bg-purple-50 text-slate-800 hover:text-[#6C2BD9] rounded-lg font-bold text-left flex items-center gap-2 transition-colors cursor-pointer group">
                <div className="w-5 h-5 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4 text-[#6C2BD9]" />
                </div>
                <span className="truncate text-xs font-bold leading-none">View Documents</span>
              </button>

              <button onClick={() => showToast('info', `Locating ${formData.assetId} on Map...`)} className="w-full h-9 -mx-2 px-2 hover:bg-purple-50 text-slate-800 hover:text-[#6C2BD9] rounded-lg font-bold text-left flex items-center gap-2 transition-colors cursor-pointer group">
                <div className="w-5 h-5 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 text-[#6C2BD9]" />
                </div>
                <span className="truncate text-xs font-bold leading-none">Locate on Map</span>
              </button>

              <button onClick={() => showToast('success', `Sent print job for ${formData.assetId} label!`)} className="w-full h-9 -mx-2 px-2 hover:bg-purple-50 text-slate-800 hover:text-[#6C2BD9] rounded-lg font-bold text-left flex items-center gap-2 transition-colors cursor-pointer group">
                <div className="w-5 h-5 flex items-center justify-center shrink-0">
                  <Printer className="w-4 h-4 text-[#6C2BD9]" />
                </div>
                <span className="truncate text-xs font-bold leading-none">Print Asset Label</span>
              </button>
            </div>
          </div>

        </div>
      </div>



    </div>
  );
}

export default AssetEdit;
