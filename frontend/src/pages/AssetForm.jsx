import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import {
  Package,
  Save,
  ArrowLeft,
  Barcode,
  Radio,
  Building,
  User,
  DollarSign,
  Cpu,
  FileText,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Plus,
  RefreshCw,
  Search,
  Upload,
  Layers,
  Check,
  Send,
  FileCheck,
  Info,
  QrCode,
  Paperclip,
  CheckSquare,
  Wrench,
  Trash2,
  ChevronRight,
  ChevronLeft,
  X,
  Copy,
  Calendar,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  HelpCircle,
  FolderPlus,
  Sliders,
  Grid,
  ListOrdered
} from 'lucide-react';

export function AssetForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Toggle active view: 'stepper' (Screenshot 1: 8-Callout Stepper Form) vs 'grid' (Screenshot 2: 11-Panel Grid Form)
  const [activeView, setActiveView] = useState('stepper');

  // Shared Form State across both form designs
  const [formData, setFormData] = useState({
    // 1. Basic Information
    idGeneration: 'AUTO', // AUTO or MANUAL
    assetId: 'AST-0001256',
    assetName: 'Dell Latitude 7450',
    assetType: 'IT Equipment',
    category: 'Laptop',
    subcategory: 'Business Laptop',
    manufacturer: 'Dell',
    model: 'Latitude 7450',
    serialNumber: 'DL7450-92118',
    quantity: '1',
    description: 'Dell Latitude 7450 laptop for IT department use.',
    image: '/laptop.png',

    // 2. Classification (Grid View)
    assetGroup: 'IT Assets',
    assetClass: 'IT Equipment',
    criticality: 'Medium',
    status: 'New',
    condition: 'New',

    // 3. Product Details
    brand: 'Dell',
    modelNumber: '7450',
    assetTagBarcode: 'AST-0001256',
    rfidEpc: '',
    tid: '',

    // 4. Location & Ownership
    company: 'Dubai HQ',
    businessUnit: 'Enterprise Solutions',
    department: 'IT',
    costCenter: 'IT-001',
    site: 'Dubai HQ',
    building: 'Building A',
    floor: 'Floor 3',
    room: 'Room 312',
    zoneArea: 'Office Zone',
    storageArea: '',
    custodian: 'John Doe',
    alternateCustodian: '',
    expectedUser: 'John Doe',

    // 5. Financial Information
    acquisitionDate: '2024-01-10',
    acquisitionCost: '4,500.00',
    purchaseDate: '2026-01-15',
    purchaseCost: '5,800.00',
    currency: 'AED',
    supplier: 'Dell Technologies',
    vendorSupplier: 'Dell UAE',
    poInvoiceNo: 'PO-2024-00123',
    assetBook: 'Corporate Book',
    depreciationMethod: 'Straight Line',
    usefulLifeYears: '4',
    residualValue: '580.00',

    // 6. Warranty & Contract
    underWarranty: true,
    provider: 'Dell',
    warrantyType: 'Standard',
    warrantyStartDate: '2024-01-15',
    warrantyEndDate: '2027-01-14',
    coverage: 'Parts & Labour',
    contractReference: 'CNT-2026-001',
    warrantyDoc: 'Warranty.pdf (245 KB)',

    // 7. Maintenance Setup
    enablePm: true,
    maintenanceType: 'Preventive',
    frequency: 'Quarterly',
    intervalDays: '90',
    firstDueDate: '2026-04-15',
    checklist: 'Laptop PM Checklist',
    nextDueDate: '15 Jul 2026',

    // 8. Auto Discovery
    linkToDiscovered: true,
    discoverySource: 'Network Scan',
    hostname: 'WKSTN-00328',
    ipAddress: '10.20.1.84',
    macAddress: '00:1A:2B:3C:4D:5E',
    discoveredSerial: 'DL7450-92118',
    firstSeen: '2026-09-01',
    lastSeen: '2026-09-12',
    matchedDiscovery: true,

    // 9. Additional Information
    project: '',
    reference: '',
    notes: '',

    // Tagging tab selection (Stepper view)
    tagType: 'Barcode', // Barcode | RFID | QR Code
    tagStatus: 'Available',

    // Documents
    documents: [
      { name: 'Purchase Invoice.pdf', size: '320 KB' },
      { name: 'Warranty.pdf', size: '450 KB' },
      { name: 'Specification Sheet.pdf', size: '1.2 MB' },
      { name: 'Other Document.pdf', size: '300 KB' }
    ],

    // Approval Workflow
    approvalRequired: 'Yes',
    approvalStatus: 'Draft',
    nextApprover: 'Asset Manager',
    approvalRemarks: '',

    // Custom Fields
    costAllocation: '',
    businessApplication: '',
    remarks: ''
  });

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const handleRemoveDoc = (docName) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.filter(d => d.name !== docName)
    }));
    showToast('info', `Removed ${docName}`);
  };

  const handleAddDoc = () => {
    const sampleDocs = ['Compliance_Cert.pdf', 'Calibration_Report.pdf', 'Delivery_Receipt.pdf'];
    const chosen = sampleDocs[Math.floor(Math.random() * sampleDocs.length)];
    if (!formData.documents.some(d => d.name === chosen)) {
      setFormData(prev => ({
        ...prev,
        documents: [...prev.documents, { name: chosen, size: '410 KB' }]
      }));
      showToast('success', `Attached document: ${chosen}`);
    }
  };

  const handleSubmit = async (targetStatus) => {
    setLoading(true);
    try {
      showToast('success', targetStatus === 'SUBMITTED' ? `Asset ${formData.assetName} submitted for approval!` : `Saved draft ${formData.assetId}!`);
      setTimeout(() => navigate('/assets'), 1200);
    } catch (err) {
      showToast('error', 'Error submitting asset form.');
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

      {/* Top View Selector Bar (Allows User to Switch Between Both Form Designs) */}
      <div className="bg-purple-900/90 text-white px-5 py-2.5 rounded-xl border border-purple-700 shadow-md flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-300" />
          <span className="text-xs font-extrabold tracking-wide uppercase text-purple-200">Form Layout Mode:</span>
          <span className="text-xs font-medium text-slate-300">Choose between the 8-Callout Stepper View or 11-Panel Grid View</span>
        </div>
        <div className="flex items-center bg-purple-950 p-1 rounded-lg border border-purple-800">
          <button
            onClick={() => setActiveView('stepper')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeView === 'stepper' ? 'bg-[#6C2BD9] text-white shadow-sm' : 'text-purple-300 hover:text-white'
            }`}
          >
            <ListOrdered className="w-3.5 h-3.5" />
            View 1: Stepper &amp; 8-Callouts
          </button>
          <button
            onClick={() => setActiveView('grid')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeView === 'grid' ? 'bg-[#6C2BD9] text-white shadow-sm' : 'text-purple-300 hover:text-white'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            View 2: 11-Panel Grid
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* FORM VIEW 1: STEPPER FORM WITH 8 CALLOUTS (Screenshot 1 Layout 1-to-1) */}
      {/* ========================================================================= */}
      {activeView === 'stepper' && (
        <div className="space-y-4">
          
          {/* Header & Purpose Banner matching Screenshot 1 */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-[#6C2BD9]">
                  <span>New Asset Registration</span>
                </div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">New Asset Registration</h1>
                <p className="text-xs text-slate-500 font-medium">
                  Screen Features, Functionality and Data Requirements (For Development)<br />
                  <span className="text-slate-400">Easily register new assets into the system with complete details, tagging, document upload and approval workflow.</span>
                </p>
              </div>

              {/* Purpose Box */}
              <div className="bg-purple-50/70 border border-purple-100 p-3 rounded-xl max-w-md text-xs">
                <span className="font-bold text-purple-950 block mb-0.5">Purpose</span>
                <p className="text-[11px] text-purple-900 leading-snug">
                  The New Asset Registration screen allows users to capture and register new assets into Asset360 with all relevant details, assign tags and submit for approval as per the organization's asset management policy.
                </p>
              </div>
            </div>

            {/* Stepper Progress Bar (1 to 5) */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-3 border-t border-slate-100">
              <div className="flex items-center gap-2 text-xs font-semibold w-full justify-between">
                
                {/* Step 1 */}
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#6C2BD9] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                    1
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block text-xs">Basic Information</span>
                    <span className="text-[10px] text-slate-400 block">Enter primary asset details</span>
                  </div>
                </div>

                <div className="h-0.5 flex-1 bg-slate-200 mx-2 hidden sm:block" />

                {/* Step 2 */}
                <div className="flex items-center gap-2 text-slate-400">
                  <div className="w-7 h-7 rounded-full border border-slate-300 text-slate-500 flex items-center justify-center font-bold text-xs">
                    2
                  </div>
                  <div>
                    <span className="font-bold text-slate-700 block text-xs">Additional Details</span>
                    <span className="text-[10px] text-slate-400 block">Financial, warranty, etc.</span>
                  </div>
                </div>

                <div className="h-0.5 flex-1 bg-slate-200 mx-2 hidden sm:block" />

                {/* Step 3 */}
                <div className="flex items-center gap-2 text-slate-400">
                  <div className="w-7 h-7 rounded-full border border-slate-300 text-slate-500 flex items-center justify-center font-bold text-xs">
                    3
                  </div>
                  <div>
                    <span className="font-bold text-slate-700 block text-xs">Tagging &amp; Location</span>
                    <span className="text-[10px] text-slate-400 block">Assign barcode/RFID</span>
                  </div>
                </div>

                <div className="h-0.5 flex-1 bg-slate-200 mx-2 hidden sm:block" />

                {/* Step 4 */}
                <div className="flex items-center gap-2 text-slate-400">
                  <div className="w-7 h-7 rounded-full border border-slate-300 text-slate-500 flex items-center justify-center font-bold text-xs">
                    4
                  </div>
                  <div>
                    <span className="font-bold text-slate-700 block text-xs">Documents</span>
                    <span className="text-[10px] text-slate-400 block">Upload supporting files</span>
                  </div>
                </div>

                <div className="h-0.5 flex-1 bg-slate-200 mx-2 hidden sm:block" />

                {/* Step 5 */}
                <div className="flex items-center gap-2 text-slate-400">
                  <div className="w-7 h-7 rounded-full border border-slate-300 text-slate-500 flex items-center justify-center font-bold text-xs">
                    5
                  </div>
                  <div>
                    <span className="font-bold text-slate-700 block text-xs">Review &amp; Submit</span>
                    <span className="text-[10px] text-slate-400 block">Verify and submit</span>
                  </div>
                </div>

              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0">
                <button
                  onClick={() => handleSubmit('DRAFT')}
                  className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs border border-slate-300 shadow-2xs transition-all cursor-pointer"
                >
                  Save as Draft
                </button>
                <button
                  onClick={() => handleSubmit('SUBMITTED')}
                  className="px-5 py-2 bg-[#6C2BD9] hover:bg-[#5b21b6] text-white font-extrabold rounded-xl text-xs shadow-md shadow-[#6C2BD9]/20 transition-all cursor-pointer"
                >
                  Submit for Approval
                </button>
              </div>
            </div>
          </div>

          {/* Two Column Layout (Callouts 1-4 on Left, Panels 5-8 on Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            
            {/* LEFT COLUMN: CALLOUTS 1, 2, 3, 4 (2 Cols Width) */}
            <div className="lg:col-span-2 space-y-4">
              
              {/* Callout 1: Basic Information */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3 relative">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <div className="w-6 h-6 rounded-full bg-[#6C2BD9] text-white font-black text-xs flex items-center justify-center">
                    1
                  </div>
                  <h3 className="font-extrabold text-slate-900 text-sm">Basic Information</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Asset Name *</label>
                    <input
                      type="text"
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
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Sub Category</label>
                    <select
                      value={formData.subcategory}
                      onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold focus:border-[#6C2BD9] outline-none"
                    >
                      <option value="Business Laptop">Business Laptop</option>
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
                    <label className="font-bold text-slate-700 block mb-1">Quantity *</label>
                    <input
                      type="number"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-bold focus:border-[#6C2BD9] outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Callout 2: Location & Ownership */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3 relative">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <div className="w-6 h-6 rounded-full bg-[#6C2BD9] text-white font-black text-xs flex items-center justify-center">
                    2
                  </div>
                  <h3 className="font-extrabold text-slate-900 text-sm">Location &amp; Ownership</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Company *</label>
                    <select
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold focus:border-[#6C2BD9] outline-none"
                    >
                      <option value="Dubai HQ">Dubai HQ</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Site *</label>
                    <select
                      value={formData.site}
                      onChange={(e) => setFormData({ ...formData, site: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold focus:border-[#6C2BD9] outline-none"
                    >
                      <option value="Dubai HQ">Dubai HQ</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Building</label>
                    <select
                      value={formData.building}
                      onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold focus:border-[#6C2BD9] outline-none"
                    >
                      <option value="Building A">Building A</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Floor / Room</label>
                    <select
                      value={`${formData.floor} / ${formData.room}`}
                      onChange={(e) => setFormData({ ...formData, floor: 'Floor 3', room: 'Room 312' })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold focus:border-[#6C2BD9] outline-none"
                    >
                      <option value="Floor 3 / Room 312">Floor 3 / Room 312</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Department *</label>
                    <select
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold focus:border-[#6C2BD9] outline-none"
                    >
                      <option value="IT">IT</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Cost Center</label>
                    <select
                      value={formData.costCenter}
                      onChange={(e) => setFormData({ ...formData, costCenter: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold focus:border-[#6C2BD9] outline-none"
                    >
                      <option value="IT-001">IT-001</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Custodian</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.custodian}
                        onChange={(e) => setFormData({ ...formData, custodian: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-7 pl-2 py-2 text-slate-900 font-semibold focus:border-[#6C2BD9] outline-none"
                      />
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-2.5 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Expected User</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.expectedUser}
                        onChange={(e) => setFormData({ ...formData, expectedUser: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-7 pl-2 py-2 text-slate-900 font-semibold focus:border-[#6C2BD9] outline-none"
                      />
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-2.5 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Callout 3: Financial Information */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3 relative">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <div className="w-6 h-6 rounded-full bg-[#6C2BD9] text-white font-black text-xs flex items-center justify-center">
                    3
                  </div>
                  <h3 className="font-extrabold text-slate-900 text-sm">Financial Information</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Acquisition Date</label>
                    <div className="relative">
                      <input
                        type="date"
                        value={formData.acquisitionDate}
                        onChange={(e) => setFormData({ ...formData, acquisitionDate: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold focus:border-[#6C2BD9] outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Acquisition Cost (AED)</label>
                    <input
                      type="text"
                      value={formData.acquisitionCost}
                      onChange={(e) => setFormData({ ...formData, acquisitionCost: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-mono font-bold focus:border-[#6C2BD9] outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Currency</label>
                    <select
                      value={formData.currency}
                      onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold focus:border-[#6C2BD9] outline-none"
                    >
                      <option value="AED">AED</option>
                      <option value="USD">USD</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Purchase Order No.</label>
                    <input
                      type="text"
                      value={formData.poInvoiceNo}
                      onChange={(e) => setFormData({ ...formData, poInvoiceNo: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-mono focus:border-[#6C2BD9] outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Supplier</label>
                    <input
                      type="text"
                      value={formData.supplier}
                      onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold focus:border-[#6C2BD9] outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Warranty Start Date</label>
                    <input
                      type="date"
                      value={formData.warrantyStartDate}
                      onChange={(e) => setFormData({ ...formData, warrantyStartDate: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold focus:border-[#6C2BD9] outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Warranty End Date</label>
                    <input
                      type="date"
                      value={formData.warrantyEndDate}
                      onChange={(e) => setFormData({ ...formData, warrantyEndDate: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold focus:border-[#6C2BD9] outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Asset Condition</label>
                    <select
                      value={formData.condition}
                      onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold focus:border-[#6C2BD9] outline-none"
                    >
                      <option value="New">New</option>
                      <option value="Good">Good</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Callout 4: Description */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3 relative">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <div className="w-6 h-6 rounded-full bg-[#6C2BD9] text-white font-black text-xs flex items-center justify-center">
                    4
                  </div>
                  <h3 className="font-extrabold text-slate-900 text-sm">Description</h3>
                </div>

                <div className="space-y-1 text-xs">
                  <label className="font-bold text-slate-700 block">Description / Remarks</label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-medium focus:border-[#6C2BD9] outline-none"
                  />
                  <div className="text-right text-[10px] text-slate-400">46/500</div>
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: PANELS 5, 6, 7, 8 (1 Col Width) */}
            <div className="space-y-4">
              
              {/* Panel 5: Tagging Information */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3 relative">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <div className="w-6 h-6 rounded-full bg-[#6C2BD9] text-white font-black text-xs flex items-center justify-center">
                    5
                  </div>
                  <h3 className="font-extrabold text-slate-900 text-sm">Tagging Information</h3>
                </div>

                {/* Tabs: Barcode | RFID | QR Code */}
                <div className="flex border-b border-slate-200">
                  {['Barcode', 'RFID', 'QR Code'].map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setFormData({ ...formData, tagType: tab })}
                      className={`flex-1 py-1.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                        formData.tagType === tab ? 'border-[#6C2BD9] text-[#6C2BD9]' : 'border-transparent text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                <div className="space-y-2 text-xs">
                  <label className="font-bold text-slate-700 block">Barcode / Asset Tag</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={formData.assetTagBarcode}
                      onChange={(e) => setFormData({ ...formData, assetTagBarcode: e.target.value })}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-mono font-bold focus:border-[#6C2BD9] outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => showToast('success', 'Generated new tag AST-0001257')}
                      className="px-3 py-2 bg-[#6C2BD9] hover:bg-[#5b21b6] text-white font-bold rounded-xl text-xs cursor-pointer shadow-2xs"
                    >
                      Generate
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs font-bold text-slate-700">Tag Status</span>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[10px] flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Available
                    </span>
                  </div>

                  {/* Visual Barcode Box */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-col items-center justify-center space-y-1">
                    <div className="font-mono text-2xl tracking-[4px] font-black text-slate-800">
                      |||| | |||| || |||
                    </div>
                    <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-600">
                      <span>{formData.assetTagBarcode}</span>
                      <button
                        type="button"
                        onClick={() => showToast('success', 'Copied tag to clipboard!')}
                        className="text-slate-400 hover:text-[#6C2BD9]"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Panel 6: Asset Image */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3 relative">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <div className="w-6 h-6 rounded-full bg-[#6C2BD9] text-white font-black text-xs flex items-center justify-center">
                    6
                  </div>
                  <h3 className="font-extrabold text-slate-900 text-sm">Asset Image</h3>
                </div>

                <div className="grid grid-cols-2 gap-2 items-center">
                  <div className="h-24 bg-slate-50 border border-slate-200 rounded-xl p-1 flex items-center justify-center">
                    <img src="/laptop.png" alt="Laptop Preview" className="h-full object-contain" />
                  </div>
                  <div
                    onClick={() => showToast('success', 'Uploaded new image!')}
                    className="h-24 bg-slate-50 border-2 border-dashed border-slate-200 hover:border-[#6C2BD9] rounded-xl p-2 flex flex-col items-center justify-center text-center cursor-pointer transition-colors"
                  >
                    <Upload className="w-5 h-5 text-purple-600 mb-1" />
                    <span className="text-[10px] font-bold text-slate-700 leading-tight">Drag &amp; drop image here or click to upload</span>
                    <span className="text-[8px] text-slate-400 mt-1">Supported formats: JPG, PNG (Max 5MB)</span>
                  </div>
                </div>
              </div>

              {/* Panel 7: Documents */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3 relative">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <div className="w-6 h-6 rounded-full bg-[#6C2BD9] text-white font-black text-xs flex items-center justify-center">
                    7
                  </div>
                  <h3 className="font-extrabold text-slate-900 text-sm">Documents</h3>
                </div>

                <div className="space-y-2 text-xs">
                  {formData.documents.map((doc) => (
                    <div key={doc.name} className="flex items-center justify-between p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                      <div className="flex items-center gap-2 truncate">
                        <FileText className="w-4 h-4 text-rose-500 shrink-0" />
                        <span className="font-bold text-slate-800 truncate">{doc.name}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] text-slate-400 font-mono">{doc.size}</span>
                        <button type="button" onClick={() => handleRemoveDoc(doc.name)} className="text-slate-400 hover:text-rose-600 font-bold">✕</button>
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={handleAddDoc}
                    className="w-full py-2 border border-dashed border-purple-300 hover:border-[#6C2BD9] text-[#6C2BD9] font-bold rounded-xl text-xs flex items-center justify-center gap-1 cursor-pointer transition-all"
                  >
                    <Plus className="w-4 h-4" /> Upload Document
                  </button>
                </div>
              </div>

              {/* Panel 8: Approval Workflow */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3 relative">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <div className="w-6 h-6 rounded-full bg-[#6C2BD9] text-white font-black text-xs flex items-center justify-center">
                    8
                  </div>
                  <h3 className="font-extrabold text-slate-900 text-sm">Approval Workflow</h3>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-700">Approval Required</span>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded-full text-[10px]">Yes</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-700">Current Status</span>
                    <span className="font-bold text-slate-900">Draft</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-700">Next Approver</span>
                    <span className="font-bold text-[#6C2BD9]">Asset Manager</span>
                  </div>

                  <div className="space-y-1 pt-1">
                    <label className="font-bold text-slate-700 block">Remarks</label>
                    <input
                      type="text"
                      placeholder="Enter remarks (optional)"
                      value={formData.approvalRemarks}
                      onChange={(e) => setFormData({ ...formData, approvalRemarks: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 outline-none focus:border-[#6C2BD9]"
                    />
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Bottom 8 Explanation Cards matching Screenshot 1 bottom footer */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-3 pt-2">
            
            {/* Card 1 */}
            <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-2xs space-y-1">
              <div className="flex items-center gap-1.5 font-extrabold text-slate-900 text-xs">
                <div className="w-5 h-5 rounded-full bg-[#6C2BD9] text-white text-[10px] font-black flex items-center justify-center">1</div>
                Basic Information
              </div>
              <p className="text-[10px] text-slate-500 leading-tight">
                Capture key asset details. Asset name, type, category, model, serial number, quantity, manufacturer. Mandatory fields with validation.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-2xs space-y-1">
              <div className="flex items-center gap-1.5 font-extrabold text-slate-900 text-xs">
                <div className="w-5 h-5 rounded-full bg-[#6C2BD9] text-white text-[10px] font-black flex items-center justify-center">2</div>
                Location &amp; Ownership
              </div>
              <p className="text-[10px] text-slate-500 leading-tight">
                Assign company, site, building, floor. Specify department, cost center, custodian and expected user. Dropdown values from master data.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-2xs space-y-1">
              <div className="flex items-center gap-1.5 font-extrabold text-slate-900 text-xs">
                <div className="w-5 h-5 rounded-full bg-[#6C2BD9] text-white text-[10px] font-black flex items-center justify-center">3</div>
                Financial Information
              </div>
              <p className="text-[10px] text-slate-500 leading-tight">
                Enter acquisition date, cost, currency. Link purchase order and supplier. Capture warranty start and end date. Store depreciation and useful life (if applicable).
              </p>
            </div>

            {/* Card 4 */}
            <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-2xs space-y-1">
              <div className="flex items-center gap-1.5 font-extrabold text-slate-900 text-xs">
                <div className="w-5 h-5 rounded-full bg-[#6C2BD9] text-white text-[10px] font-black flex items-center justify-center">4</div>
                Description
              </div>
              <p className="text-[10px] text-slate-500 leading-tight">
                Provide asset description, remarks and any additional notes. Support rich text / character limit.
              </p>
            </div>

            {/* Card 5 */}
            <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-2xs space-y-1">
              <div className="flex items-center gap-1.5 font-extrabold text-slate-900 text-xs">
                <div className="w-5 h-5 rounded-full bg-[#6C2BD9] text-white text-[10px] font-black flex items-center justify-center">5</div>
                Tagging Information
              </div>
              <p className="text-[10px] text-slate-500 leading-tight">
                Generate or enter barcode / RFID / QR. Validate uniqueness. Show tag availability status. Print tag label (optional).
              </p>
            </div>

            {/* Card 6 */}
            <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-2xs space-y-1">
              <div className="flex items-center gap-1.5 font-extrabold text-slate-900 text-xs">
                <div className="w-5 h-5 rounded-full bg-[#6C2BD9] text-white text-[10px] font-black flex items-center justify-center">6</div>
                Asset Image
              </div>
              <p className="text-[10px] text-slate-500 leading-tight">
                Upload asset image. Preview before save. Support multiple images (if required).
              </p>
            </div>

            {/* Card 7 */}
            <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-2xs space-y-1">
              <div className="flex items-center gap-1.5 font-extrabold text-slate-900 text-xs">
                <div className="w-5 h-5 rounded-full bg-[#6C2BD9] text-white text-[10px] font-black flex items-center justify-center">7</div>
                Documents
              </div>
              <p className="text-[10px] text-slate-500 leading-tight">
                Upload supporting documents. Link to purchase invoice, warranty, specification, manuals, etc. Multiple file upload with validation.
              </p>
            </div>

            {/* Card 8 */}
            <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-2xs space-y-1">
              <div className="flex items-center gap-1.5 font-extrabold text-slate-900 text-xs">
                <div className="w-5 h-5 rounded-full bg-[#6C2BD9] text-white text-[10px] font-black flex items-center justify-center">8</div>
                Approval Workflow
              </div>
              <p className="text-[10px] text-slate-500 leading-tight">
                Submit for approval based on organization policy. Show current status and next approver. Track approval history.
              </p>
            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* FORM VIEW 2: COMPREHENSIVE 11-PANEL GRID FORM (Screenshot 2 Layout 1-to-1) */}
      {/* ========================================================================= */}
      {activeView === 'grid' && (
        <div className="space-y-4">
          
          {/* Top Header Bar with Breadcrumb & Action Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white px-5 py-4 rounded-xl border border-slate-200 shadow-2xs">
            <div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-0.5">
                <span className="font-bold text-[#6C2BD9]">A Assets</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-bold text-slate-700">New Asset Registration</span>
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">New Asset Registration</h1>
              <p className="text-xs text-slate-500 font-medium">
                Create a complete asset record with identification, location, ownership and lifecycle information.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => navigate('/assets')}
                className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs border border-slate-300 shadow-2xs transition-all cursor-pointer"
              >
                Cancel
              </button>

              <button
                onClick={() => handleSubmit('DRAFT')}
                disabled={loading}
                className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs border border-slate-300 shadow-2xs transition-all cursor-pointer"
              >
                Save as Draft
              </button>

              <button
                onClick={() => handleSubmit('SUBMITTED')}
                disabled={loading}
                className="px-5 py-2 bg-[#6C2BD9] hover:bg-[#5b21b6] text-white font-extrabold rounded-xl text-xs shadow-md shadow-[#6C2BD9]/20 transition-all cursor-pointer flex items-center gap-1.5"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
                Submit for Approval
              </button>
            </div>
          </div>

          {/* ROW 1: Panels 1, 2, 3, 4 (4 Columns Across) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
            
            {/* PANEL 1: 📋 1. Basic Information ⓘ */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-[#6C2BD9]" /> 1. Basic Information <HelpCircle className="w-3.5 h-3.5 text-slate-400 cursor-pointer" />
                  </h3>
                </div>

                {/* Asset ID Radio Selector */}
                <div className="space-y-1 text-xs">
                  <label className="font-bold text-slate-700 block">Asset ID *</label>
                  <div className="flex items-center gap-3 text-slate-700 font-semibold mb-1">
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="radio"
                        name="idGen"
                        checked={formData.idGeneration === 'AUTO'}
                        onChange={() => setFormData({ ...formData, idGeneration: 'AUTO' })}
                        className="text-[#6C2BD9]"
                      />
                      Auto Generate
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="radio"
                        name="idGen"
                        checked={formData.idGeneration === 'MANUAL'}
                        onChange={() => setFormData({ ...formData, idGeneration: 'MANUAL' })}
                        className="text-[#6C2BD9]"
                      />
                      Manual Entry
                    </label>
                  </div>
                  <input
                    type="text"
                    value={formData.assetId}
                    onChange={(e) => setFormData({ ...formData, assetId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-mono font-bold focus:border-[#6C2BD9] outline-none"
                  />
                </div>

                {/* Asset Name */}
                <div className="space-y-1 text-xs">
                  <label className="font-bold text-slate-700 block">Asset Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.assetName}
                    onChange={(e) => setFormData({ ...formData, assetName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold focus:border-[#6C2BD9] outline-none"
                  />
                </div>

                {/* Asset Description */}
                <div className="space-y-1 text-xs">
                  <label className="font-bold text-slate-700 block">Asset Description</label>
                  <textarea
                    rows={2}
                    placeholder="Enter asset description..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 focus:border-[#6C2BD9] outline-none"
                  />
                </div>
              </div>

              {/* Asset Image Box */}
              <div className="space-y-1 text-xs pt-2">
                <label className="font-bold text-slate-700 block">Asset Image</label>
                <div className="grid grid-cols-2 gap-2 items-center">
                  <div className="h-20 bg-slate-50 border border-slate-200 rounded-xl p-1 flex items-center justify-center">
                    <img src="/laptop.png" alt="Laptop" className="h-full object-contain" />
                  </div>
                  <div
                    onClick={() => showToast('success', 'Uploaded asset image!')}
                    className="h-20 bg-slate-50 border-2 border-dashed border-slate-200 hover:border-[#6C2BD9] rounded-xl p-1 flex flex-col items-center justify-center text-center cursor-pointer transition-colors"
                  >
                    <Upload className="w-4 h-4 text-purple-600 mb-0.5" />
                    <span className="text-[9px] font-bold text-slate-700 leading-tight">Upload Image</span>
                    <span className="text-[7px] text-slate-400">JPG, PNG (Max 5MB)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* PANEL 2: 🏷️ 2. Classification ⓘ */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-[#6C2BD9]" /> 2. Classification <HelpCircle className="w-3.5 h-3.5 text-slate-400 cursor-pointer" />
                  </h3>
                </div>

                <div className="space-y-1 text-xs">
                  <label className="font-bold text-slate-700 block">Asset Group *</label>
                  <select
                    value={formData.assetGroup}
                    onChange={(e) => setFormData({ ...formData, assetGroup: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold focus:border-[#6C2BD9] outline-none"
                  >
                    <option value="IT Assets">IT Assets</option>
                    <option value="Facilities">Facilities</option>
                  </select>
                </div>

                <div className="space-y-1 text-xs">
                  <label className="font-bold text-slate-700 block">Asset Class *</label>
                  <select
                    value={formData.assetClass}
                    onChange={(e) => setFormData({ ...formData, assetClass: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold focus:border-[#6C2BD9] outline-none"
                  >
                    <option value="IT Equipment">IT Equipment</option>
                    <option value="Office Equipment">Office Equipment</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Category *</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold focus:border-[#6C2BD9] outline-none"
                    >
                      <option value="Laptop">Laptop</option>
                      <option value="Mobile Device">Mobile Device</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Subcategory</label>
                    <select
                      value={formData.subcategory}
                      onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold focus:border-[#6C2BD9] outline-none"
                    >
                      <option value="Business Laptop">Business Laptop</option>
                      <option value="Executive Laptop">Executive Laptop</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Criticality</label>
                    <select
                      value={formData.criticality}
                      onChange={(e) => setFormData({ ...formData, criticality: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold focus:border-[#6C2BD9] outline-none"
                    >
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Status *</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold focus:border-[#6C2BD9] outline-none"
                    >
                      <option value="New">New</option>
                      <option value="In Use">In Use</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <label className="font-bold text-slate-700 block">Condition *</label>
                  <select
                    value={formData.condition}
                    onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold focus:border-[#6C2BD9] outline-none"
                  >
                    <option value="New">New</option>
                    <option value="Good">Good</option>
                  </select>
                </div>
              </div>
            </div>

            {/* PANEL 3: 🔧 3. Product Details ⓘ */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                    <Wrench className="w-4 h-4 text-[#6C2BD9]" /> 3. Product Details <HelpCircle className="w-3.5 h-3.5 text-slate-400 cursor-pointer" />
                  </h3>
                </div>

                <div className="space-y-1 text-xs">
                  <label className="font-bold text-slate-700 block">Manufacturer *</label>
                  <select
                    value={formData.manufacturer}
                    onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold focus:border-[#6C2BD9] outline-none"
                  >
                    <option value="Dell">Dell</option>
                    <option value="Apple">Apple</option>
                    <option value="HP">HP</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Brand</label>
                    <select
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold focus:border-[#6C2BD9] outline-none"
                    >
                      <option value="Dell">Dell</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Model *</label>
                    <select
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold focus:border-[#6C2BD9] outline-none"
                    >
                      <option value="Latitude 7450">Latitude 7450</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <label className="font-bold text-slate-700 block">Model Number</label>
                  <input
                    type="text"
                    value={formData.modelNumber}
                    onChange={(e) => setFormData({ ...formData, modelNumber: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-mono font-bold focus:border-[#6C2BD9] outline-none"
                  />
                </div>

                <div className="space-y-1 text-xs">
                  <label className="font-bold text-slate-700 block">Serial Number *</label>
                  <input
                    type="text"
                    required
                    value={formData.serialNumber}
                    onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-mono font-bold focus:border-[#6C2BD9] outline-none"
                  />
                </div>

                <div className="space-y-1 text-xs">
                  <label className="font-bold text-slate-700 block">Asset Tag / Barcode</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Scan or enter barcode/QR"
                      value={formData.assetTagBarcode}
                      onChange={(e) => setFormData({ ...formData, assetTagBarcode: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-8 pl-2 py-2 text-slate-900 font-mono focus:border-[#6C2BD9] outline-none"
                    />
                    <Barcode className="w-4 h-4 text-purple-600 absolute right-2.5 top-2.5 cursor-pointer" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">RFID EPC</label>
                    <input
                      type="text"
                      placeholder="Scan RFID Tag"
                      value={formData.rfidEpc}
                      onChange={(e) => setFormData({ ...formData, rfidEpc: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-mono focus:border-[#6C2BD9] outline-none text-[11px]"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">TID</label>
                    <input
                      type="text"
                      value={formData.tid}
                      onChange={(e) => setFormData({ ...formData, tid: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-mono focus:border-[#6C2BD9] outline-none text-[11px]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* PANEL 4: ((o)) 4. Location & Ownership ⓘ */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                    <Radio className="w-4 h-4 text-[#6C2BD9]" /> 4. Location &amp; Ownership <HelpCircle className="w-3.5 h-3.5 text-slate-400 cursor-pointer" />
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Company *</label>
                    <select
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold focus:border-[#6C2BD9] outline-none"
                    >
                      <option value="Dubai HQ">Dubai HQ</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Business Unit</label>
                    <select
                      value={formData.businessUnit}
                      onChange={(e) => setFormData({ ...formData, businessUnit: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold focus:border-[#6C2BD9] outline-none"
                    >
                      <option value="Enterprise Solutions">Enterprise Solutions</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Department</label>
                    <select
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold focus:border-[#6C2BD9] outline-none"
                    >
                      <option value="IT">IT</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Cost Center</label>
                    <select
                      value={formData.costCenter}
                      onChange={(e) => setFormData({ ...formData, costCenter: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold focus:border-[#6C2BD9] outline-none"
                    >
                      <option value="IT-001">IT-001</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Site *</label>
                    <select
                      value={formData.site}
                      onChange={(e) => setFormData({ ...formData, site: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold focus:border-[#6C2BD9] outline-none"
                    >
                      <option value="Dubai HQ">Dubai HQ</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Building</label>
                    <select
                      value={formData.building}
                      onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold focus:border-[#6C2BD9] outline-none"
                    >
                      <option value="Building A">Building A</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Floor</label>
                    <select
                      value={formData.floor}
                      onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold focus:border-[#6C2BD9] outline-none"
                    >
                      <option value="Floor 3">Floor 3</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Room</label>
                    <select
                      value={formData.room}
                      onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold focus:border-[#6C2BD9] outline-none"
                    >
                      <option value="Room 312">Room 312</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Zone / Area</label>
                    <select
                      value={formData.zoneArea}
                      onChange={(e) => setFormData({ ...formData, zoneArea: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold focus:border-[#6C2BD9] outline-none"
                    >
                      <option value="Office Zone">Office Zone</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Storage Area</label>
                    <select
                      value={formData.storageArea}
                      onChange={(e) => setFormData({ ...formData, storageArea: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold focus:border-[#6C2BD9] outline-none"
                    >
                      <option value="">Select</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Custodian / Owner *</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.custodian}
                        onChange={(e) => setFormData({ ...formData, custodian: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-7 pl-2 py-2 text-slate-900 font-semibold focus:border-[#6C2BD9] outline-none"
                      />
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-2.5 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Alternate Custodian</label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Select"
                        value={formData.alternateCustodian}
                        onChange={(e) => setFormData({ ...formData, alternateCustodian: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-7 pl-2 py-2 text-slate-900 font-semibold focus:border-[#6C2BD9] outline-none"
                      />
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-2.5 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* ROW 2: Panels 5, 6, 7, 8 (4 Columns Across) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
            
            {/* PANEL 5: 💵 5. Financial Information */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-[#6C2BD9]" /> 5. Financial Information
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Purchase Date *</label>
                    <input
                      type="date"
                      value={formData.purchaseDate}
                      onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold focus:border-[#6C2BD9] outline-none text-[11px]"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Purchase Cost *</label>
                    <input
                      type="text"
                      value={formData.purchaseCost}
                      onChange={(e) => setFormData({ ...formData, purchaseCost: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-mono font-bold focus:border-[#6C2BD9] outline-none text-[11px]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Currency *</label>
                    <select
                      value={formData.currency}
                      onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold focus:border-[#6C2BD9] outline-none"
                    >
                      <option value="AED">AED</option>
                      <option value="USD">USD</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Vendor / Supplier</label>
                    <input
                      type="text"
                      value={formData.vendorSupplier}
                      onChange={(e) => setFormData({ ...formData, vendorSupplier: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold focus:border-[#6C2BD9] outline-none text-[11px]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">PO / Invoice No.</label>
                    <input
                      type="text"
                      value={formData.poInvoiceNo}
                      onChange={(e) => setFormData({ ...formData, poInvoiceNo: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-mono focus:border-[#6C2BD9] outline-none text-[11px]"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Asset Book</label>
                    <select
                      value={formData.assetBook}
                      onChange={(e) => setFormData({ ...formData, assetBook: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold focus:border-[#6C2BD9] outline-none text-[11px]"
                    >
                      <option value="Corporate Book">Corporate Book</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Depreciation Method</label>
                    <select
                      value={formData.depreciationMethod}
                      onChange={(e) => setFormData({ ...formData, depreciationMethod: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold focus:border-[#6C2BD9] outline-none text-[11px]"
                    >
                      <option value="Straight Line">Straight Line</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Useful Life (Years)</label>
                    <input
                      type="number"
                      value={formData.usefulLifeYears}
                      onChange={(e) => setFormData({ ...formData, usefulLifeYears: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-bold focus:border-[#6C2BD9] outline-none text-[11px]"
                    />
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <label className="font-bold text-slate-700 block">Residual Value</label>
                  <input
                    type="text"
                    value={formData.residualValue}
                    onChange={(e) => setFormData({ ...formData, residualValue: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-mono font-bold focus:border-[#6C2BD9] outline-none text-[11px]"
                  />
                </div>
              </div>
            </div>

            {/* PANEL 6: 🛡️ 6. Warranty & Contract ⓘ */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#6C2BD9]" /> 6. Warranty &amp; Contract <HelpCircle className="w-3.5 h-3.5 text-slate-400 cursor-pointer" />
                  </h3>
                </div>

                {/* Toggle Switch */}
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">Under Warranty</span>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, underWarranty: !formData.underWarranty })}
                    className={`w-10 h-5 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                      formData.underWarranty ? 'bg-[#6C2BD9] justify-end' : 'bg-slate-300 justify-start'
                    }`}
                  >
                    <div className="w-3.5 h-3.5 rounded-full bg-white shadow-md" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Provider</label>
                    <select
                      value={formData.provider}
                      onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold focus:border-[#6C2BD9] outline-none"
                    >
                      <option value="Dell">Dell</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Warranty Type</label>
                    <select
                      value={formData.warrantyType}
                      onChange={(e) => setFormData({ ...formData, warrantyType: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold focus:border-[#6C2BD9] outline-none"
                    >
                      <option value="Standard">Standard</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Start Date</label>
                    <input
                      type="date"
                      value={formData.warrantyStartDate}
                      onChange={(e) => setFormData({ ...formData, warrantyStartDate: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold focus:border-[#6C2BD9] outline-none text-[11px]"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">End Date</label>
                    <input
                      type="date"
                      value={formData.warrantyEndDate}
                      onChange={(e) => setFormData({ ...formData, warrantyEndDate: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold focus:border-[#6C2BD9] outline-none text-[11px]"
                    />
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <label className="font-bold text-slate-700 block">Coverage</label>
                  <select
                    value={formData.coverage}
                    onChange={(e) => setFormData({ ...formData, coverage: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold focus:border-[#6C2BD9] outline-none"
                  >
                    <option value="Parts & Labour">Parts &amp; Labour</option>
                  </select>
                </div>

                <div className="space-y-1 text-xs">
                  <label className="font-bold text-slate-700 block">Contract Reference</label>
                  <input
                    type="text"
                    value={formData.contractReference}
                    onChange={(e) => setFormData({ ...formData, contractReference: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-mono focus:border-[#6C2BD9] outline-none text-[11px]"
                  />
                </div>

                {/* Attached Warranty Doc Preview */}
                <div className="p-2 bg-purple-50/60 border border-purple-100 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 truncate">
                    <FileText className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                    <span className="font-bold text-slate-800 text-[11px] truncate">{formData.warrantyDoc}</span>
                  </div>
                  <button type="button" className="text-rose-500 hover:text-rose-700 text-xs font-bold">✕</button>
                </div>
              </div>
            </div>

            {/* PANEL 7: 🔧 7. Maintenance Setup ⓘ */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                    <Wrench className="w-4 h-4 text-[#6C2BD9]" /> 7. Maintenance Setup <HelpCircle className="w-3.5 h-3.5 text-slate-400 cursor-pointer" />
                  </h3>
                </div>

                {/* Toggle Switch */}
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">Enable Preventive Maintenance</span>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, enablePm: !formData.enablePm })}
                    className={`w-10 h-5 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                      formData.enablePm ? 'bg-[#6C2BD9] justify-end' : 'bg-slate-300 justify-start'
                    }`}
                  >
                    <div className="w-3.5 h-3.5 rounded-full bg-white shadow-md" />
                  </button>
                </div>

                <div className="space-y-1 text-xs">
                  <label className="font-bold text-slate-700 block">Maintenance Type</label>
                  <select
                    value={formData.maintenanceType}
                    onChange={(e) => setFormData({ ...formData, maintenanceType: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold focus:border-[#6C2BD9] outline-none"
                  >
                    <option value="Preventive">Preventive</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Frequency</label>
                    <select
                      value={formData.frequency}
                      onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold focus:border-[#6C2BD9] outline-none"
                    >
                      <option value="Quarterly">Quarterly</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Interval (Days)</label>
                    <input
                      type="number"
                      value={formData.intervalDays}
                      onChange={(e) => setFormData({ ...formData, intervalDays: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-bold focus:border-[#6C2BD9] outline-none text-[11px]"
                    />
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <label className="font-bold text-slate-700 block">First Due Date</label>
                  <input
                    type="date"
                    value={formData.firstDueDate}
                    onChange={(e) => setFormData({ ...formData, firstDueDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold focus:border-[#6C2BD9] outline-none text-[11px]"
                  />
                </div>

                <div className="space-y-1 text-xs">
                  <label className="font-bold text-slate-700 block">Checklist</label>
                  <select
                    value={formData.checklist}
                    onChange={(e) => setFormData({ ...formData, checklist: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold focus:border-[#6C2BD9] outline-none"
                  >
                    <option value="Laptop PM Checklist">Laptop PM Checklist</option>
                  </select>
                </div>

                {/* Next Due Date Box */}
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl flex items-center gap-2.5 text-xs">
                  <Calendar className="w-5 h-5 text-[#6C2BD9]" />
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Next Due Date</span>
                    <span className="font-extrabold text-[#6C2BD9] text-sm">{formData.nextDueDate}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* PANEL 8: ((o)) 8. Auto Discovery ⓘ */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                    <Cpu className="w-4 h-4 text-[#6C2BD9]" /> 8. Auto Discovery <HelpCircle className="w-3.5 h-3.5 text-slate-400 cursor-pointer" />
                  </h3>
                </div>

                {/* Toggle Switch */}
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">Link to Discovered Asset</span>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, linkToDiscovered: !formData.linkToDiscovered })}
                    className={`w-10 h-5 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                      formData.linkToDiscovered ? 'bg-[#6C2BD9] justify-end' : 'bg-slate-300 justify-start'
                    }`}
                  >
                    <div className="w-3.5 h-3.5 rounded-full bg-white shadow-md" />
                  </button>
                </div>

                <div className="space-y-1 text-xs">
                  <label className="font-bold text-slate-700 block">Discovery Source</label>
                  <select
                    value={formData.discoverySource}
                    onChange={(e) => setFormData({ ...formData, discoverySource: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold focus:border-[#6C2BD9] outline-none"
                  >
                    <option value="Network Scan">Network Scan</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Hostname</label>
                    <input
                      type="text"
                      value={formData.hostname}
                      onChange={(e) => setFormData({ ...formData, hostname: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-mono text-[11px] outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">IP Address</label>
                    <input
                      type="text"
                      value={formData.ipAddress}
                      onChange={(e) => setFormData({ ...formData, ipAddress: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-mono text-[11px] outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">MAC Address</label>
                    <input
                      type="text"
                      value={formData.macAddress}
                      onChange={(e) => setFormData({ ...formData, macAddress: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-mono text-[10px] outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Discovered Serial</label>
                    <input
                      type="text"
                      value={formData.discoveredSerial}
                      onChange={(e) => setFormData({ ...formData, discoveredSerial: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-mono text-[10px] outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">First Seen</label>
                    <input
                      type="date"
                      value={formData.firstSeen}
                      onChange={(e) => setFormData({ ...formData, firstSeen: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 text-[10px] outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Last Seen</label>
                    <input
                      type="date"
                      value={formData.lastSeen}
                      onChange={(e) => setFormData({ ...formData, lastSeen: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 text-[10px] outline-none"
                    />
                  </div>
                </div>

                {/* Green Matched Badge Box */}
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-bold text-emerald-800 text-[11px] block leading-tight">Matched with discovery data</span>
                    <span className="text-[9px] text-emerald-700 block leading-tight">Hostname, Serial Number and MAC Address matched</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* ROW 3: Panels 9, 10, 11 (3 Columns Across) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
            
            {/* PANEL 9: 📄 9. Additional Information */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-[#6C2BD9]" /> 9. Additional Information
                  </h3>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Project</label>
                    <select
                      value={formData.project}
                      onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold focus:border-[#6C2BD9] outline-none"
                    >
                      <option value="">Select</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Asset Type</label>
                    <select
                      value={formData.assetType}
                      onChange={(e) => setFormData({ ...formData, assetType: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold focus:border-[#6C2BD9] outline-none"
                    >
                      <option value="Operational">Operational</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Reference</label>
                    <input
                      type="text"
                      placeholder="Enter reference..."
                      value={formData.reference}
                      onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <label className="font-bold text-slate-700 block">Notes</label>
                  <textarea
                    rows={2}
                    placeholder="Enter additional notes..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 outline-none focus:border-[#6C2BD9]"
                  />
                </div>
              </div>
            </div>

            {/* PANEL 10: 📎 10. Documents & Attachments */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                    <Paperclip className="w-4 h-4 text-[#6C2BD9]" /> 10. Documents &amp; Attachments
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs items-center">
                  {/* Drag & drop upload box */}
                  <div
                    onClick={handleAddDoc}
                    className="h-28 bg-slate-50 border-2 border-dashed border-slate-200 hover:border-[#6C2BD9] rounded-xl p-2 flex flex-col items-center justify-center text-center cursor-pointer transition-colors"
                  >
                    <Upload className="w-5 h-5 text-purple-600 mb-1" />
                    <span className="text-[10px] font-bold text-slate-700 leading-tight">Drag &amp; drop files here or <span className="text-[#6C2BD9]">browse</span></span>
                    <span className="text-[8px] text-slate-400 mt-1">PDF, DOC, XLS, JPG, PNG (Max 10MB each)</span>
                  </div>

                  {/* List of files */}
                  <div className="space-y-1.5 text-xs">
                    {formData.documents.map((doc) => (
                      <div key={doc.name} className="flex items-center justify-between p-1.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px]">
                        <div className="flex items-center gap-1.5 truncate">
                          <FileText className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          <span className="font-bold text-slate-800 truncate">{doc.name}</span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <span className="text-[9px] text-slate-400 font-mono">{doc.size}</span>
                          <button type="button" onClick={() => handleRemoveDoc(doc.name)} className="text-slate-400 hover:text-rose-600">✕</button>
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={handleAddDoc}
                      className="text-[10px] font-extrabold text-[#6C2BD9] hover:underline flex items-center gap-1 cursor-pointer pt-1"
                    >
                      + Add Document
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* PANEL 11: ⚙️ 11. Custom Fields */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-[#6C2BD9]" /> 11. Custom Fields
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Cost Allocation</label>
                    <select
                      value={formData.costAllocation}
                      onChange={(e) => setFormData({ ...formData, costAllocation: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold focus:border-[#6C2BD9] outline-none"
                    >
                      <option value="">Select</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Business Application</label>
                    <select
                      value={formData.businessApplication}
                      onChange={(e) => setFormData({ ...formData, businessApplication: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold focus:border-[#6C2BD9] outline-none"
                    >
                      <option value="">Select</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <label className="font-bold text-slate-700 block">Remarks</label>
                  <textarea
                    rows={2}
                    placeholder="Enter remarks..."
                    value={formData.remarks}
                    onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 outline-none focus:border-[#6C2BD9]"
                  />
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}

export default AssetForm;
