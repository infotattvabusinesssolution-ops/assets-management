import React, { useState, useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';
import { QRCodeSVG } from 'qrcode.react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { uploadToCloudinary } from '../services/cloudinary';
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
  ToggleLeft,
  ToggleRight,
  HelpCircle,
  FolderPlus,
  Sliders,
  ExternalLink,
  Cloud
} from 'lucide-react';

function BarcodePreview({ value }) {
  const barcodeRef = useRef(null);
  const [invalid, setInvalid] = useState(false);

  useEffect(() => {
    if (!value || !barcodeRef.current) return;
    try {
      JsBarcode(barcodeRef.current, value, {
        format: 'CODE128',
        width: 2,
        height: 56,
        margin: 12,
        displayValue: false,
        background: '#ffffff',
        lineColor: '#0f172a'
      });
      setInvalid(false);
    } catch {
      setInvalid(true);
    }
  }, [value]);

  if (!value) return <p className="text-xs text-slate-500">Enter or generate an identifier to see its barcode.</p>;

  return (
    <div className="w-full text-center">
      {invalid && <p className="text-xs text-rose-600">Code 128 supports printable characters only.</p>}
      <svg
        ref={barcodeRef}
        role="img"
        aria-label={`Code 128 barcode for ${value}`}
        className={`${invalid ? 'hidden' : 'block'} h-auto max-w-full mx-auto`}
      />
    </div>
  );
}

export function AssetForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Cloudinary upload state & refs
  const docInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Master Data Options loaded dynamically from backend
  const [categories, setCategories] = useState([]);
  const [sites, setSites] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [costCenters, setCostCenters] = useState([]);
  const [manufacturers, setManufacturers] = useState([]);
  const [employees, setEmployees] = useState([]);

  // Dynamic Tag Generation & Real-time Validation State
  const [generatingTag, setGeneratingTag] = useState(false);
  const [tagValidationStatus, setTagValidationStatus] = useState('AVAILABLE'); // 'IDLE' | 'VALIDATING' | 'AVAILABLE' | 'CONFLICT'
  const [tagValidationMessage, setTagValidationMessage] = useState('Available & Ready to Assign');

  // Stepper Flow State
  const [currentStep, setCurrentStep] = useState(1);
  const [stepMode, setStepMode] = useState('wizard'); // 'wizard' | 'all'

  const FORM_STEPS = [
    { id: 1, name: 'Basic Information', desc: 'Primary asset details & photo', icon: FileText },
    { id: 2, name: 'Additional Details', desc: 'Financial, warranty & contracts', icon: DollarSign },
    { id: 3, name: 'Tagging & Location', desc: 'Assign barcode/RFID & location', icon: QrCode },
    { id: 4, name: 'Documents', desc: 'Upload files via Cloudinary', icon: Paperclip },
    { id: 5, name: 'Review & Submit', desc: 'Verify and submit for approval', icon: CheckCircle2 }
  ];

  // Default form layout: Stepper & 8-Callouts View
  const activeView = searchParams.get('view') || 'stepper';

  // Load live master data options and auto-generate Asset ID
  useEffect(() => {
    async function loadMasterData() {
      try {
        const [catRes, siteRes, deptRes, ccRes, mfrRes, empRes] = await Promise.all([
          api.get('/master-data/categories').catch(() => null),
          api.get('/master-data/sites').catch(() => null),
          api.get('/master-data/departments').catch(() => null),
          api.get('/master-data/cost-centers').catch(() => null),
          api.get('/master-data/manufacturers').catch(() => null),
          api.get('/master-data/employees').catch(() => null)
        ]);
        if (catRes?.categories) setCategories(catRes.categories);
        if (siteRes?.sites) setSites(siteRes.sites);
        if (deptRes?.departments) setDepartments(deptRes.departments);
        if (ccRes?.costCenters) setCostCenters(ccRes.costCenters);
        if (mfrRes?.manufacturers) setManufacturers(mfrRes.manufacturers);
        if (empRes?.employees) setEmployees(empRes.employees);
      } catch (err) {
        console.warn('Master data load skipped:', err);
      }
    }
    loadMasterData();

    // Auto-generate fresh Asset ID
    const randomSeq = Math.floor(Math.random() * 89999 + 10000);
    const generatedId = `AST-${new Date().getFullYear()}-${randomSeq}`;
    setFormData(prev => ({
      ...prev,
      assetId: generatedId,
      assetTagBarcode: generatedId
    }));
  }, []);

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

  const handleRemoveDoc = (docIdentifier) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.filter(d => d.name !== docIdentifier && d.url !== docIdentifier)
    }));
    showToast('info', `Removed ${docIdentifier}`);
  };

  const handleUploadDocument = async (e) => {
    const files = e.target?.files;
    if (!files || files.length === 0) return;

    setUploadingDoc(true);
    showToast('info', `Uploading ${files.length} document(s) to Cloudinary...`);

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const result = await uploadToCloudinary(file, { folder: 'fams_documents' });
        return {
          name: result.name || file.name,
          size: result.formattedSize || `${(file.size / 1024).toFixed(1)} KB`,
          url: result.secure_url || result.url,
          publicId: result.public_id,
          format: result.format,
          type: file.type || 'application/pdf',
          uploadedAt: new Date().toISOString()
        };
      });

      const uploadedDocs = await Promise.all(uploadPromises);

      setFormData(prev => ({
        ...prev,
        documents: [...prev.documents, ...uploadedDocs]
      }));

      showToast('success', `${uploadedDocs.length} document(s) uploaded to Cloudinary successfully!`);
    } catch (err) {
      console.error('Cloudinary document upload error:', err);
      showToast('error', err.message || 'Failed to upload document to Cloudinary');
    } finally {
      setUploadingDoc(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleUploadImage = async (e) => {
    const file = e.target?.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    showToast('info', 'Uploading asset photo to Cloudinary...');

    try {
      const result = await uploadToCloudinary(file, { folder: 'fams_assets' });
      setFormData(prev => ({
        ...prev,
        assetImage: result.secure_url || result.url,
        imageUrl: result.secure_url || result.url
      }));
      showToast('success', 'Asset photo uploaded to Cloudinary successfully!');
    } catch (err) {
      console.error('Cloudinary image upload error:', err);
      showToast('error', err.message || 'Failed to upload photo to Cloudinary');
    } finally {
      setUploadingImage(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleAddDoc = () => {
    if (docInputRef.current) {
      docInputRef.current.click();
    }
  };

  // Dynamic Tag Generation Function
  const handleGenerateDynamicTag = async (overrideType) => {
    const targetType = overrideType || formData.tagType || 'Barcode';
    setGeneratingTag(true);
    setTagValidationStatus('VALIDATING');
    setTagValidationMessage('Generating & validating...');

    try {
      let generatedTag = '';
      let generatedEpc = '';

      if (targetType === 'RFID') {
        try {
          const res = await api.post('/tagging/generate', { prefix: 'E2801170', tagType: 'RFID_GEN2', count: 1 });
          if (res?.success && res.tag) {
            generatedTag = res.tag.rfidEpc || res.tag.tagNumber;
            generatedEpc = res.tag.rfidEpc || res.tag.tagNumber;
          }
        } catch (e) {
          console.warn('Backend RFID generate fallback:', e);
        }

        if (!generatedTag) {
          // Authentic 24-character hexadecimal EPC-96 standard
          const p1 = 'E2801170';
          const p2 = Math.floor(0x10000000 + Math.random() * 0xefffffff).toString(16).toUpperCase();
          const p3 = Math.floor(0x10000000 + Math.random() * 0xefffffff).toString(16).toUpperCase();
          generatedTag = `${p1}${p2}${p3}`.slice(0, 24);
          generatedEpc = generatedTag;
        }

        setFormData(prev => ({
          ...prev,
          tagType: 'RFID',
          assetTagBarcode: generatedTag,
          rfidEpc: generatedEpc,
          barcode: generatedTag
        }));
      } else if (targetType === 'QR Code') {
        const year = new Date().getFullYear();
        const randSeq = Math.floor(10000 + Math.random() * 90000);
        generatedTag = `QR-${formData.assetId || `AST-${year}-${randSeq}`}`;

        setFormData(prev => ({
          ...prev,
          tagType: 'QR Code',
          assetTagBarcode: generatedTag,
          barcode: generatedTag
        }));
      } else {
        // Barcode
        try {
          const res = await api.post('/tagging/generate', { prefix: 'BC-', tagType: 'BARCODE', count: 1 });
          if (res?.success && res.tag) {
            generatedTag = res.tag.tagNumber;
          }
        } catch (e) {
          console.warn('Backend Barcode generate fallback:', e);
        }

        if (!generatedTag) {
          const catCode = (formData.category || 'AST').slice(0, 3).toUpperCase().replace(/[^A-Z]/g, 'AST');
          const randSeq = Math.floor(100000 + Math.random() * 900000);
          generatedTag = `BC-${catCode}-${randSeq}`;
        }

        setFormData(prev => ({
          ...prev,
          tagType: 'Barcode',
          assetTagBarcode: generatedTag,
          barcode: generatedTag
        }));
      }

      // Verify availability against backend
      try {
        const valRes = await api.post('/tagging/validate', {
          tagNumber: generatedTag,
          tagType: targetType,
          rfidEpc: generatedEpc || undefined
        });

        if (valRes?.valid !== false) {
          setTagValidationStatus('AVAILABLE');
          setTagValidationMessage('Available & Verified');
        } else {
          setTagValidationStatus('CONFLICT');
          setTagValidationMessage(valRes?.message || 'Conflict: Tag already assigned');
        }
      } catch (valErr) {
        setTagValidationStatus('AVAILABLE');
        setTagValidationMessage('Available & Ready to Assign');
      }

      showToast('success', `Generated dynamic ${targetType}: ${generatedTag}`);
    } catch (err) {
      console.error('Dynamic tag generation error:', err);
      showToast('error', 'Error generating dynamic tag');
    } finally {
      setGeneratingTag(false);
    }
  };

  const handleSelectTagTab = (tab) => {
    setFormData(prev => ({ ...prev, tagType: tab }));

    const current = formData.assetTagBarcode || '';
    if (tab === 'RFID') {
      const isHexEpc = /^[0-9A-Fa-f]{20,24}$/.test(current) || current.startsWith('E280') || current.startsWith('E360');
      if (!isHexEpc) {
        handleGenerateDynamicTag('RFID');
      }
    } else if (tab === 'QR Code') {
      if (!current.startsWith('QR-')) {
        handleGenerateDynamicTag('QR Code');
      }
    } else if (tab === 'Barcode') {
      if (current.startsWith('QR-') || /^[0-9A-Fa-f]{20,24}$/.test(current)) {
        handleGenerateDynamicTag('Barcode');
      }
    }
  };

  const handleTagInputChange = async (value) => {
    setFormData(prev => ({
      ...prev,
      assetTagBarcode: value,
      rfidEpc: prev.tagType === 'RFID' ? value : prev.rfidEpc,
      barcode: value
    }));

    if (!value || value.trim().length < 3) {
      setTagValidationStatus('IDLE');
      setTagValidationMessage('Enter a valid tag identifier');
      return;
    }

    try {
      const valRes = await api.post('/tagging/validate', {
        tagNumber: value.trim(),
        tagType: formData.tagType,
        rfidEpc: formData.tagType === 'RFID' ? value.trim() : undefined
      });

      if (valRes?.valid !== false) {
        setTagValidationStatus('AVAILABLE');
        setTagValidationMessage('Available & Ready to Assign');
      } else {
        setTagValidationStatus('CONFLICT');
        setTagValidationMessage(valRes?.message || 'Tag already registered to an asset');
      }
    } catch (e) {
      setTagValidationStatus('AVAILABLE');
      setTagValidationMessage('Available & Ready to Assign');
    }
  };

  const handleSubmit = async (targetStatus) => {
    setLoading(true);
    try {
      const payload = {
        assetId: formData.assetId,
        assetName: formData.assetName,
        description: formData.description || formData.assetName,
        category: formData.category,
        categoryId: formData.categoryId,
        manufacturer: formData.manufacturer || formData.brand,
        model: formData.model || formData.modelNumber,
        serialNumber: formData.serialNumber,
        tagNumber: formData.assetTagBarcode || formData.assetId,
        barcode: formData.assetTagBarcode || formData.assetId,
        rfidEpc: formData.rfidEpc || undefined,
        company: formData.company,
        site: formData.site,
        building: formData.building,
        floor: formData.floor,
        room: formData.room,
        department: formData.department,
        costCenter: formData.costCenter,
        custodian: formData.custodian,
        acquisitionCost: formData.acquisitionCost || formData.purchaseCost,
        currency: formData.currency || 'USD',
        condition: formData.condition || 'NEW',
        criticality: formData.criticality || 'MEDIUM',
        lifecycleStatus: targetStatus === 'SUBMITTED' ? 'IN_SERVICE' : 'RECEIVED',
        poInvoiceNo: formData.poInvoiceNo,
        supplier: formData.supplier || formData.vendorSupplier,
        purchaseDate: formData.purchaseDate || formData.acquisitionDate,
        inServiceDate: formData.inServiceDate || formData.purchaseDate || formData.acquisitionDate,
        underWarranty: formData.underWarranty,
        warrantyStartDate: formData.warrantyStartDate,
        warrantyEndDate: formData.warrantyEndDate,
        coverage: formData.coverage,
        provider: formData.provider || formData.manufacturer,
        notes: formData.notes || formData.remarks,
        documents: formData.documents,
        imageUrl: formData.assetImage || formData.imageUrl
      };

      const res = await api.post('/assets', payload);
      if (res?.success) {
        showToast('success', targetStatus === 'SUBMITTED'
          ? `Asset ${formData.assetName} (${res.asset?.assetId || formData.assetId}) registered successfully!`
          : `Asset draft ${formData.assetId} saved successfully!`);
        setTimeout(() => navigate('/assets'), 1200);
      } else {
        showToast('error', res?.message || 'Error submitting asset form.');
      }
    } catch (err) {
      console.error('Asset creation error:', err);
      showToast('error', err?.message || 'Error connecting to database to save asset.');
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // MODULAR SECTION RENDER FUNCTIONS
  // ==========================================

  // Step 1: Basic Information
  const renderBasicInfo = () => (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3 relative">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
          <FileText className="w-4 h-4 text-[#6C2BD9]" /> Basic Information
        </h3>
        <span className="px-2 py-0.5 bg-purple-50 text-[#6C2BD9] text-[10px] font-bold rounded-full border border-purple-200">
          Step 1
        </span>
      </div>

      {/* Asset ID Generation Mode */}
      <div className="p-3 bg-purple-50/50 border border-purple-100 rounded-xl grid grid-cols-1 md:grid-cols-3 gap-3 items-center text-xs">
        <div>
          <label className="font-bold text-slate-700 block mb-1">Asset ID *</label>
          <div className="flex items-center gap-3 text-slate-700 font-semibold">
            <label className="flex items-center gap-1 cursor-pointer">
              <input
                type="radio"
                name="idGenMode"
                checked={formData.idGeneration === 'AUTO'}
                onChange={() => setFormData({ ...formData, idGeneration: 'AUTO' })}
                className="text-[#6C2BD9]"
              />
              Auto Generate
            </label>
            <label className="flex items-center gap-1 cursor-pointer">
              <input
                type="radio"
                name="idGenMode"
                checked={formData.idGeneration === 'MANUAL'}
                onChange={() => setFormData({ ...formData, idGeneration: 'MANUAL' })}
                className="text-[#6C2BD9]"
              />
              Manual Entry
            </label>
          </div>
        </div>
        <div className="md:col-span-2">
          <input
            type="text"
            value={formData.assetId}
            disabled={formData.idGeneration === 'AUTO'}
            onChange={(e) => setFormData({ ...formData, assetId: e.target.value })}
            className="w-full bg-white border border-slate-200 rounded-xl p-2 text-slate-900 font-mono font-bold focus:border-[#6C2BD9] outline-none disabled:bg-slate-100/70"
            placeholder="AST-2026-XXXXX"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
        <div>
          <label className="font-bold text-slate-700 block mb-1">Asset Name *</label>
          <input
            type="text"
            value={formData.assetName}
            onChange={(e) => setFormData({ ...formData, assetName: e.target.value })}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold focus:border-[#6C2BD9] outline-none"
            placeholder="e.g. Dell Latitude 5420"
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
            <option value="Office Equipment">Office Equipment</option>
            <option value="Machinery">Machinery</option>
            <option value="Vehicle">Vehicle</option>
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
            {categories.map(c => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
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
            <option value="Workstation">Workstation</option>
            <option value="Standard Ultrabook">Standard Ultrabook</option>
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
            min="1"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-bold focus:border-[#6C2BD9] outline-none"
          />
        </div>
      </div>
    </div>
  );

  // Step 1: Asset Image with Cloudinary
  const renderAssetImage = () => (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3 relative">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
          <Package className="w-4 h-4 text-[#6C2BD9]" /> Asset Image
        </h3>
        <span className="px-2 py-0.5 bg-purple-50 text-[#6C2BD9] text-[10px] font-bold rounded-full border border-purple-200 flex items-center gap-1">
          <Cloud className="w-3 h-3" /> Cloudinary
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 items-center">
        <div className="h-28 bg-slate-50 border border-slate-200 rounded-xl p-1 flex items-center justify-center overflow-hidden">
          <img
            src={formData.assetImage || formData.imageUrl || '/laptop.png'}
            alt="Asset Preview"
            className="h-full object-contain"
          />
        </div>
        <input
          type="file"
          ref={imageInputRef}
          onChange={handleUploadImage}
          className="hidden"
          accept="image/*"
        />
        <div
          onClick={() => imageInputRef.current?.click()}
          className="h-28 bg-slate-50 border-2 border-dashed border-slate-200 hover:border-[#6C2BD9] rounded-xl p-2 flex flex-col items-center justify-center text-center cursor-pointer transition-colors"
        >
          {uploadingImage ? (
            <>
              <RefreshCw className="w-5 h-5 text-purple-600 mb-1 animate-spin" />
              <span className="text-[10px] font-bold text-[#6C2BD9] leading-tight">Uploading...</span>
            </>
          ) : (
            <>
              <Upload className="w-5 h-5 text-purple-600 mb-1" />
              <span className="text-[10px] font-bold text-slate-700 leading-tight">Click to upload photo</span>
              <span className="text-[8px] text-slate-400 mt-1">Cloudinary CDN (JPG, PNG)</span>
            </>
          )}
        </div>
      </div>
    </div>
  );

  // Step 2: Financial Information
  const renderFinancialInfo = () => (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3 relative">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
          <DollarSign className="w-4 h-4 text-[#6C2BD9]" /> Financial Information
        </h3>
        <span className="px-2 py-0.5 bg-purple-50 text-[#6C2BD9] text-[10px] font-bold rounded-full border border-purple-200">
          Step 2
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
        <div>
          <label className="font-bold text-slate-700 block mb-1">Acquisition Date</label>
          <input
            type="date"
            value={formData.acquisitionDate}
            onChange={(e) => setFormData({ ...formData, acquisitionDate: e.target.value })}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold focus:border-[#6C2BD9] outline-none"
          />
        </div>

        <div>
          <label className="font-bold text-slate-700 block mb-1">Acquisition Cost ({formData.currency || 'AED'})</label>
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
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
            <option value="INR">INR</option>
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
            <option value="Fair">Fair</option>
            <option value="Refurbished">Refurbished</option>
          </select>
        </div>
      </div>
    </div>
  );

  // Step 2: Description
  const renderDescription = () => (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3 relative">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <h3 className="font-extrabold text-slate-900 text-sm">Description &amp; Remarks</h3>
      </div>

      <div className="space-y-1 text-xs">
        <label className="font-bold text-slate-700 block">Description / Notes</label>
        <textarea
          rows={3}
          value={formData.description}
          placeholder="Enter asset specs, remarks, or notes..."
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-medium focus:border-[#6C2BD9] outline-none"
        />
        <div className="text-right text-[10px] text-slate-400 font-mono">
          {formData.description?.length || 0} / 500
        </div>
      </div>
    </div>
  );

  // Step 3: Location & Ownership
  const renderLocationOwnership = () => (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3 relative">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
          <Building className="w-4 h-4 text-[#6C2BD9]" /> Location &amp; Ownership
        </h3>
        <span className="px-2 py-0.5 bg-purple-50 text-[#6C2BD9] text-[10px] font-bold rounded-full border border-purple-200">
          Step 3
        </span>
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
            <option value="Abu Dhabi Branch">Abu Dhabi Branch</option>
            <option value="Sharjah Hub">Sharjah Hub</option>
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
            {sites.map(s => (
              <option key={s.id} value={s.name}>{s.name}</option>
            ))}
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
            <option value="Building B">Building B</option>
            <option value="Headquarters Tower">Headquarters Tower</option>
          </select>
        </div>

        <div>
          <label className="font-bold text-slate-700 block mb-1">Floor / Room</label>
          <input
            type="text"
            value={formData.floor}
            placeholder="Floor 3, Room 312"
            onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold focus:border-[#6C2BD9] outline-none"
          />
        </div>

        <div>
          <label className="font-bold text-slate-700 block mb-1">Department *</label>
          <select
            value={formData.department}
            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold focus:border-[#6C2BD9] outline-none"
          >
            <option value="IT">IT</option>
            {departments.map(d => (
              <option key={d.id} value={d.name}>{d.name}</option>
            ))}
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
            {costCenters.map(cc => (
              <option key={cc.id} value={cc.code || cc.name}>{cc.code} - {cc.name}</option>
            ))}
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
  );

  // Step 3: Tagging Information
  const renderTagging = () => {
    const tagValue = formData.assetTagBarcode?.trim() || '';
    const isRfid = formData.tagType === 'RFID';
    const isQr = formData.tagType === 'QR Code';
    const tagLabel = isRfid ? 'RFID EPC' : isQr ? 'QR payload' : 'Barcode number';

    return (
      <section className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-4 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <QrCode className="w-4 h-4 text-[#6C2BD9] shrink-0" /> Tagging Information
            </h3>
            <p className="text-[11px] text-slate-500 mt-1">Assign an identifier and preview the tag.</p>
          </div>
          <span className="px-2 py-0.5 bg-purple-50 text-[#6C2BD9] text-[10px] font-bold rounded-full shrink-0">Step 3</span>
        </div>

        <div className="grid grid-cols-3 gap-1 rounded-xl bg-slate-100 p-1" role="group" aria-label="Tag type">
          {['Barcode', 'RFID', 'QR Code'].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => handleSelectTagTab(tab)}
              aria-pressed={formData.tagType === tab}
              className={`rounded-lg px-2 py-2 text-xs font-bold transition-colors cursor-pointer ${
                formData.tagType === tab
                  ? 'bg-white text-[#6C2BD9] shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          <label htmlFor="asset-tag-identifier" className="block text-xs font-bold text-slate-700">{tagLabel}</label>
          <div className="flex items-stretch gap-2 min-w-0">
            <input
              id="asset-tag-identifier"
              type="text"
              value={formData.assetTagBarcode}
              onChange={(e) => handleTagInputChange(e.target.value)}
              placeholder={isRfid ? '24-character hexadecimal EPC' : isQr ? 'QR-AST-...' : 'BC-AST-...'}
              className="min-w-0 flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-mono font-semibold focus:border-[#6C2BD9] outline-none text-xs"
            />
            <button
              type="button"
              disabled={generatingTag}
              onClick={() => handleGenerateDynamicTag()}
              className="px-3 py-2 bg-[#6C2BD9] hover:bg-[#5b21b6] text-white font-bold rounded-lg text-xs cursor-pointer whitespace-nowrap flex items-center justify-center gap-1.5 disabled:opacity-60 transition-colors"
              title={`Generate ${tagLabel.toLowerCase()}`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${generatingTag ? 'animate-spin' : ''}`} />
              {generatingTag ? 'Generating' : 'Generate'}
            </button>
          </div>
          <div className="flex items-center justify-between gap-2 min-w-0" aria-live="polite">
            <span className="text-[11px] text-slate-500 truncate">{isRfid ? 'EPC Gen2 · 96-bit hex' : isQr ? 'Scannable QR code' : 'Scannable Code 128'}</span>
            <span className={`shrink-0 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
              tagValidationStatus === 'AVAILABLE' ? 'bg-emerald-50 text-emerald-700' :
              tagValidationStatus === 'CONFLICT' ? 'bg-rose-50 text-rose-700' :
              tagValidationStatus === 'VALIDATING' ? 'bg-purple-50 text-[#6C2BD9]' :
              'bg-slate-100 text-slate-600'
            }`} title={tagValidationMessage}>
              {tagValidationStatus === 'AVAILABLE' ? <CheckCircle2 className="w-3 h-3" /> :
                tagValidationStatus === 'CONFLICT' ? <AlertTriangle className="w-3 h-3" /> :
                tagValidationStatus === 'VALIDATING' ? <RefreshCw className="w-3 h-3 animate-spin" /> : null}
              {tagValidationStatus === 'AVAILABLE' ? 'Available' :
                tagValidationStatus === 'CONFLICT' ? 'In use' :
                tagValidationStatus === 'VALIDATING' ? 'Checking' : 'Ready'}
            </span>
          </div>
        </div>

        <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 space-y-3 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-bold tracking-wide uppercase text-slate-500">Live preview</span>
            <span className="text-[10px] font-medium text-slate-400">{isRfid ? 'EPC value' : isQr ? 'QR code' : 'Code 128'}</span>
          </div>

          <div className="min-h-[112px] flex items-center justify-center overflow-hidden">
            {isRfid ? (
              tagValue ? (
                <div className="w-full rounded-lg bg-white p-4 text-center">
                  <Radio className="w-5 h-5 text-[#6C2BD9] mx-auto mb-2" />
                  <span className="block font-mono text-xs font-bold text-slate-900 break-all leading-relaxed tracking-wide">
                    {tagValue.match(/.{1,4}/g)?.join(' ')}
                  </span>
                </div>
              ) : <p className="text-xs text-slate-500 text-center">Enter or generate an EPC to preview it.</p>
            ) : isQr ? (
              tagValue ? (
                <QRCodeSVG
                  value={tagValue}
                  size={136}
                  level="M"
                  marginSize={4}
                  className="h-[136px] w-[136px]"
                  title={`QR code for ${tagValue}`}
                />
              ) : <p className="text-xs text-slate-500 text-center">Enter or generate a payload to see its QR code.</p>
            ) : (
              <BarcodePreview value={tagValue} />
            )}
          </div>

          <div className="flex items-center justify-between gap-2 min-w-0 border-t border-slate-200 pt-2">
            <span className="min-w-0 truncate font-mono text-[11px] font-semibold text-slate-700" title={tagValue}>
              {tagValue || 'No identifier yet'}
            </span>
            <button
              type="button"
              disabled={!tagValue}
              onClick={() => {
                navigator.clipboard?.writeText(tagValue);
                showToast('success', `Copied ${tagLabel.toLowerCase()} to clipboard!`);
              }}
              className="shrink-0 flex items-center gap-1 rounded-md px-1.5 py-1 text-[11px] font-bold text-[#6C2BD9] hover:bg-purple-100 disabled:opacity-40 disabled:cursor-not-allowed"
              title={`Copy ${tagLabel.toLowerCase()}`}
            >
              <Copy className="w-3.5 h-3.5" /> Copy
            </button>
          </div>
        </div>
        {isRfid && <p className="text-[11px] text-slate-500">Write this EPC to a physical RFID tag with an encoder.</p>}
      </section>
    );
  };

  // Step 4: Documents (Cloudinary)
  const renderDocuments = () => (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3 relative">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <div className="flex items-center gap-2">
          <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
            <Paperclip className="w-4 h-4 text-[#6C2BD9]" /> Documents &amp; Attachments
          </h3>
          <span className="px-2 py-0.5 bg-purple-50 text-[#6C2BD9] text-[10px] font-bold rounded-full border border-purple-200 flex items-center gap-1">
            <Cloud className="w-3 h-3" /> Cloudinary CDN
          </span>
        </div>
        <span className="text-[11px] font-mono text-slate-400">{formData.documents.length} attached</span>
      </div>

      <div className="space-y-2 text-xs">
        {formData.documents.length === 0 ? (
          <div className="p-6 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center text-slate-400 text-xs">
            No documents attached yet. Click below to upload invoices, spec sheets, or contracts.
          </div>
        ) : (
          formData.documents.map((doc, idx) => (
            <div
              key={(doc.name || 'doc') + idx}
              className="flex items-center justify-between p-2.5 bg-slate-50 hover:bg-purple-50/30 border border-slate-200 hover:border-purple-200 rounded-xl text-xs transition-colors"
            >
              <div className="flex items-center gap-2 truncate">
                <FileText className="w-4 h-4 text-rose-500 shrink-0" />
                <div className="truncate flex flex-col">
                  {doc.url ? (
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-slate-800 hover:text-[#6C2BD9] truncate flex items-center gap-1 group"
                      title={doc.name}
                    >
                      <span className="truncate">{doc.name}</span>
                      <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-[#6C2BD9] shrink-0" />
                    </a>
                  ) : (
                    <span className="font-bold text-slate-800 truncate">{doc.name}</span>
                  )}
                  {doc.url && (
                    <span className="text-[9px] text-emerald-600 font-semibold flex items-center gap-0.5">
                      <Check className="w-2.5 h-2.5" /> Stored in Cloudinary
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] text-slate-400 font-mono">{doc.size}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveDoc(doc.name)}
                  className="w-5 h-5 rounded-md hover:bg-rose-50 text-slate-400 hover:text-rose-600 font-bold flex items-center justify-center cursor-pointer transition-colors"
                  title="Remove document"
                >
                  ✕
                </button>
              </div>
            </div>
          ))
        )}

        <input
          type="file"
          ref={docInputRef}
          onChange={handleUploadDocument}
          multiple
          className="hidden"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.png,.jpg,.jpeg"
        />

        <button
          type="button"
          disabled={uploadingDoc}
          onClick={() => docInputRef.current?.click()}
          className="w-full py-3 border-2 border-dashed border-purple-300 hover:border-[#6C2BD9] bg-purple-50/30 hover:bg-purple-50 text-[#6C2BD9] font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
        >
          {uploadingDoc ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-[#6C2BD9]" />
              <span>Uploading to Cloudinary...</span>
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              <span>Upload Document (Cloudinary)</span>
            </>
          )}
        </button>
      </div>
    </div>
  );

  // Step 5: Approval Workflow
  const renderApprovalWorkflow = () => (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3 relative">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-[#6C2BD9]" /> Approval Workflow
        </h3>
        <span className="px-2 py-0.5 bg-purple-50 text-[#6C2BD9] text-[10px] font-bold rounded-full border border-purple-200">
          Step 5
        </span>
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
  );

  // Step 5: Review & Final Verification Summary Card
  const renderReviewSummary = () => (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-100 text-[#6C2BD9] flex items-center justify-center font-bold">
            <FileCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm">Review &amp; Final Verification</h3>
            <p className="text-[11px] text-slate-500">Please review all asset details before submitting for approval.</p>
          </div>
        </div>
        <span className="px-2.5 py-1 bg-purple-50 text-[#6C2BD9] text-xs font-black rounded-lg border border-purple-200">
          Step 5 of 5
        </span>
      </div>

      {/* 4 Summary Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        {/* Box 1: Asset Core */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
          <div className="flex items-center justify-between border-b border-slate-200/60 pb-1.5">
            <span className="font-extrabold text-slate-800 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-[#6C2BD9]" /> 1. Asset Identification
            </span>
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="text-[11px] font-bold text-[#6C2BD9] hover:underline"
            >
              Edit
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div>
              <span className="text-slate-400 block">Asset ID:</span>
              <span className="font-mono font-bold text-slate-800">{formData.assetId || 'Pending'}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Asset Name:</span>
              <span className="font-bold text-slate-800 truncate block">{formData.assetName || '—'}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Category:</span>
              <span className="font-semibold text-slate-700">{formData.category} ({formData.subcategory})</span>
            </div>
            <div>
              <span className="text-slate-400 block">Serial No:</span>
              <span className="font-mono font-bold text-slate-800">{formData.serialNumber || '—'}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Make &amp; Model:</span>
              <span className="font-semibold text-slate-700">{formData.manufacturer} {formData.model}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Quantity:</span>
              <span className="font-bold text-slate-800">{formData.quantity}</span>
            </div>
          </div>
        </div>

        {/* Box 2: Location & Tagging */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
          <div className="flex items-center justify-between border-b border-slate-200/60 pb-1.5">
            <span className="font-extrabold text-slate-800 flex items-center gap-1.5">
              <QrCode className="w-3.5 h-3.5 text-[#6C2BD9]" /> 3. Location &amp; Tagging
            </span>
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="text-[11px] font-bold text-[#6C2BD9] hover:underline"
            >
              Edit
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div>
              <span className="text-slate-400 block">Site / Facility:</span>
              <span className="font-semibold text-slate-800">{formData.site || '—'}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Department:</span>
              <span className="font-semibold text-slate-800">{formData.department || '—'}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Location:</span>
              <span className="font-semibold text-slate-700">{formData.building}, {formData.floor}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Custodian:</span>
              <span className="font-bold text-slate-800">{formData.custodian || 'Unassigned'}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Tag Type:</span>
              <span className="font-bold text-purple-700">{formData.tagType}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Barcode / Tag:</span>
              <span className="font-mono font-bold text-slate-800">{formData.assetTagBarcode || '—'}</span>
            </div>
          </div>
        </div>

        {/* Box 3: Financial Details */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
          <div className="flex items-center justify-between border-b border-slate-200/60 pb-1.5">
            <span className="font-extrabold text-slate-800 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-[#6C2BD9]" /> 2. Financial &amp; Warranty
            </span>
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="text-[11px] font-bold text-[#6C2BD9] hover:underline"
            >
              Edit
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div>
              <span className="text-slate-400 block">Acquisition Cost:</span>
              <span className="font-mono font-bold text-slate-900">{formData.currency} {Number(formData.acquisitionCost || 0).toLocaleString()}</span>
            </div>
            <div>
              <span className="text-slate-400 block">PO / Invoice:</span>
              <span className="font-mono font-semibold text-slate-800">{formData.poInvoiceNo || '—'}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Supplier:</span>
              <span className="font-semibold text-slate-800">{formData.supplier || '—'}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Warranty Period:</span>
              <span className="font-semibold text-slate-700">{formData.warrantyStartDate} to {formData.warrantyEndDate}</span>
            </div>
          </div>
        </div>

        {/* Box 4: Media & Documents */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
          <div className="flex items-center justify-between border-b border-slate-200/60 pb-1.5">
            <span className="font-extrabold text-slate-800 flex items-center gap-1.5">
              <Paperclip className="w-3.5 h-3.5 text-[#6C2BD9]" /> 4. Attachments ({formData.documents.length})
            </span>
            <button
              type="button"
              onClick={() => setCurrentStep(4)}
              className="text-[11px] font-bold text-[#6C2BD9] hover:underline"
            >
              Manage
            </button>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-lg bg-white border border-slate-200 p-1 flex items-center justify-center shrink-0 overflow-hidden">
              <img
                src={formData.assetImage || formData.imageUrl || '/laptop.png'}
                alt="Asset Thumbnail"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="space-y-1 text-[11px]">
              <div className="font-bold text-slate-800">
                {formData.documents.length} Document(s) Attached
              </div>
              <div className="text-[10px] text-slate-500">
                {formData.documents.slice(0, 2).map(d => d.name).join(', ') || 'No documents attached'}
                {formData.documents.length > 2 && ` +${formData.documents.length - 2} more`}
              </div>
              <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                <Check className="w-2.5 h-2.5" /> Stored in Cloudinary
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

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


      {/* ========================================================================= */}
      {/* FORM VIEW 1: STEPPER FORM WITH 8 CALLOUTS (Screenshot 1 Layout 1-to-1) */}
      {/* ========================================================================= */}
      {activeView === 'stepper' && (
        <div className="space-y-4">

          {/* Header & Purpose Banner matching Screenshot 1 */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
            {/* Top Row: Title & Action Buttons */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-[#6C2BD9]">
                  <span className="px-2 py-0.5 rounded-full bg-purple-50 text-[#6C2BD9] border border-purple-200">
                    Asset Onboarding
                  </span>
                </div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">New Asset Registration</h1>
                <p className="text-xs text-slate-500 font-medium">
                  Screen Features, Functionality and Data Requirements • <span className="text-slate-400">Easily register new assets with complete details, tagging and approval workflow.</span>
                </p>
              </div>

              {/* Action Buttons - Responsive Header Placement */}
              <div className="flex items-center gap-2.5 flex-wrap shrink-0">
                <button
                  type="button"
                  onClick={() => navigate('/assets')}
                  className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-600 font-bold rounded-xl text-xs border border-slate-300 shadow-2xs transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleSubmit('DRAFT')}
                  disabled={loading}
                  className="px-4 py-2 bg-white hover:bg-purple-50 text-[#6C2BD9] hover:text-[#5b21b6] font-bold rounded-xl text-xs border border-purple-200 hover:border-purple-300 shadow-2xs transition-all cursor-pointer whitespace-nowrap"
                >
                  Save as Draft
                </button>
                <button
                  type="button"
                  onClick={() => handleSubmit('SUBMITTED')}
                  disabled={loading}
                  className="px-5 py-2 bg-[#6C2BD9] hover:bg-[#5b21b6] text-white font-extrabold rounded-xl text-xs shadow-md shadow-[#6C2BD9]/20 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
                >
                  {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  Submit for Approval
                </button>
              </div>
            </div>

            {/* Purpose Banner */}
            <div className="bg-purple-50/70 border border-purple-100 p-3 rounded-xl flex items-start gap-2.5 text-xs text-purple-900">
              <div className="w-5 h-5 rounded-lg bg-purple-200/60 text-[#6C2BD9] flex items-center justify-center shrink-0 mt-0.5 text-[11px] font-bold">
                ⓘ
              </div>
              <div className="leading-relaxed">
                <span className="font-bold text-purple-950 mr-1.5">Purpose:</span>
                <span>The New Asset Registration screen allows users to capture and register new assets into Asset360 with all relevant details, assign tags and submit for approval as per the organization's asset management policy.</span>
              </div>
            </div>

            {/* Stepper Progress Bar - Full Width & Responsive */}
            <div className="pt-3 border-t border-slate-100 overflow-x-auto pb-1 scrollbar-none">
              <div className="flex items-center justify-between gap-2 min-w-[760px] xl:min-w-0 w-full text-xs font-semibold">
                {FORM_STEPS.map((step, idx) => {
                  const Icon = step.icon;
                  const isCurrent = currentStep === step.id;
                  const isCompleted = currentStep > step.id;

                  return (
                    <React.Fragment key={step.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setCurrentStep(step.id);
                          setStepMode('wizard');
                        }}
                        className={`flex items-center gap-2.5 shrink-0 p-1.5 rounded-xl transition-all cursor-pointer text-left ${
                          isCurrent
                            ? 'bg-purple-50/80 ring-2 ring-[#6C2BD9]/30'
                            : 'hover:bg-slate-50 opacity-80 hover:opacity-100'
                        }`}
                      >
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shadow-xs shrink-0 transition-all ${
                            isCurrent
                              ? 'bg-[#6C2BD9] text-white ring-2 ring-purple-300'
                              : isCompleted
                              ? 'bg-emerald-600 text-white'
                              : 'border border-slate-300 text-slate-500 bg-white'
                          }`}
                        >
                          {isCompleted ? <Check className="w-3.5 h-3.5 stroke-[2.5]" /> : <Icon className="w-3.5 h-3.5" />}
                        </div>
                        <div>
                          <span
                            className={`block text-xs whitespace-nowrap transition-colors ${
                              isCurrent
                                ? 'font-black text-[#6C2BD9]'
                                : isCompleted
                                ? 'font-bold text-slate-900'
                                : 'font-semibold text-slate-600'
                            }`}
                          >
                            Step {step.id}: {step.name}
                          </span>
                          <span className="text-[10px] text-slate-400 block whitespace-nowrap">
                            {step.desc}
                          </span>
                        </div>
                      </button>

                      {idx < FORM_STEPS.length - 1 && (
                        <div
                          className={`h-0.5 flex-1 mx-2 min-w-[16px] hidden sm:block rounded-full transition-colors ${
                            currentStep > step.id ? 'bg-emerald-500' : 'bg-slate-200'
                          }`}
                        />
                      )}
                    </React.Fragment>
                  );
                })}

                {/* View Mode Toggle Pill */}
                <div className="ml-2 pl-3 border-l border-slate-200 flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => setStepMode(stepMode === 'wizard' ? 'all' : 'wizard')}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-white text-[11px] font-bold text-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    title={stepMode === 'wizard' ? 'Switch to All-in-one view' : 'Switch to Step-by-Step Wizard'}
                  >
                    <Sliders className="w-3.5 h-3.5 text-[#6C2BD9]" />
                    <span>{stepMode === 'wizard' ? 'View All' : 'Step Wizard'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic Content: Step-by-Step Wizard vs. View All */}
          {stepMode === 'wizard' ? (
            <div className="space-y-4">
              {/* Step Navigation Subheader */}
              <div className="bg-white border border-slate-200 rounded-xl px-5 py-3 flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-purple-100 text-[#6C2BD9] flex items-center justify-center font-black text-sm">
                    {currentStep}
                  </div>
                  <div>
                    <h2 className="text-sm font-extrabold text-slate-900">
                      Step {currentStep}: {FORM_STEPS[currentStep - 1]?.name}
                    </h2>
                    <p className="text-xs text-slate-500 font-medium">
                      {FORM_STEPS[currentStep - 1]?.desc}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-purple-50 text-[#6C2BD9] font-bold text-xs border border-purple-200">
                    Step {currentStep} of 5
                  </span>
                </div>
              </div>

              {/* Step 1: Basic Information + Photo */}
              {currentStep === 1 && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
                  <div className="lg:col-span-2 space-y-4">
                    {renderBasicInfo()}
                  </div>
                  <div className="space-y-4">
                    {renderAssetImage()}
                  </div>
                </div>
              )}

              {/* Step 2: Additional Details (Financials + Remarks) */}
              {currentStep === 2 && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
                  <div className="lg:col-span-2 space-y-4">
                    {renderFinancialInfo()}
                  </div>
                  <div className="space-y-4">
                    {renderDescription()}
                  </div>
                </div>
              )}

              {/* Step 3: Tagging & Location */}
              {currentStep === 3 && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
                  <div className="lg:col-span-2 space-y-4">
                    {renderLocationOwnership()}
                  </div>
                  <div className="space-y-4">
                    {renderTagging()}
                  </div>
                </div>
              )}

              {/* Step 4: Documents (Cloudinary) */}
              {currentStep === 4 && (
                <div className="max-w-4xl mx-auto w-full space-y-4">
                  {renderDocuments()}
                </div>
              )}

              {/* Step 5: Review & Submit */}
              {currentStep === 5 && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
                  <div className="lg:col-span-2 space-y-4">
                    {renderReviewSummary()}
                  </div>
                  <div className="space-y-4">
                    {renderApprovalWorkflow()}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* View All Mode (All 8 Callouts in Two Columns) */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
              <div className="lg:col-span-2 space-y-4">
                {renderBasicInfo()}
                {renderLocationOwnership()}
                {renderFinancialInfo()}
                {renderDescription()}
              </div>
              <div className="space-y-4">
                {renderTagging()}
                {renderAssetImage()}
                {renderDocuments()}
                {renderApprovalWorkflow()}
              </div>
            </div>
          )}

          {/* Bottom Action Footer Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="text-xs text-slate-500">
              {stepMode === 'wizard' ? (
                <span>
                  <strong className="text-[#6C2BD9]">Step {currentStep} of 5:</strong>{' '}
                  <span className="font-bold text-slate-800">{FORM_STEPS[currentStep - 1]?.name}</span> — Fill in details and click Next to advance.
                </span>
              ) : (
                <span>
                  <span className="font-bold text-slate-700">Need to finish later?</span> Save as draft to retain your inputs, or submit directly for approval workflow verification.
                </span>
              )}
            </div>
            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end shrink-0">
              {stepMode === 'wizard' && currentStep > 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
                  className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs border border-slate-300 shadow-2xs transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> Back
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => navigate('/assets')}
                  className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs border border-slate-300 shadow-2xs transition-all cursor-pointer"
                >
                  Cancel
                </button>
              )}

              <button
                type="button"
                onClick={() => handleSubmit('DRAFT')}
                disabled={loading}
                className="px-4 py-2 bg-white hover:bg-purple-50 text-[#6C2BD9] hover:text-[#5b21b6] font-bold rounded-xl text-xs border border-purple-200 hover:border-purple-300 shadow-2xs transition-all cursor-pointer whitespace-nowrap"
              >
                Save as Draft
              </button>

              {stepMode === 'wizard' && currentStep < 5 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep(prev => Math.min(5, prev + 1))}
                  className="px-5 py-2 bg-[#6C2BD9] hover:bg-[#5b21b6] text-white font-extrabold rounded-xl text-xs shadow-md shadow-[#6C2BD9]/20 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
                >
                  Next Step ({FORM_STEPS[currentStep]?.name}) <ChevronRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSubmit('SUBMITTED')}
                  disabled={loading}
                  className="px-5 py-2 bg-[#6C2BD9] hover:bg-[#5b21b6] text-white font-extrabold rounded-xl text-xs shadow-md shadow-[#6C2BD9]/20 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
                  Submit for Approval
                </button>
              )}
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
                    <FileText className="w-4 h-4 text-[#6C2BD9]" /> Basic Information <HelpCircle className="w-3.5 h-3.5 text-slate-400 cursor-pointer" />
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
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700 block">Asset Image</label>
                  <span className="text-[9px] font-bold text-[#6C2BD9]">Cloudinary</span>
                </div>
                <div className="grid grid-cols-2 gap-2 items-center">
                  <div className="h-20 bg-slate-50 border border-slate-200 rounded-xl p-1 flex items-center justify-center overflow-hidden">
                    <img src={formData.assetImage || formData.imageUrl || '/laptop.png'} alt="Laptop" className="h-full object-contain" />
                  </div>
                  <div
                    onClick={() => imageInputRef.current?.click()}
                    className="h-20 bg-slate-50 border-2 border-dashed border-slate-200 hover:border-[#6C2BD9] rounded-xl p-1 flex flex-col items-center justify-center text-center cursor-pointer transition-colors"
                  >
                    {uploadingImage ? (
                      <>
                        <RefreshCw className="w-4 h-4 text-purple-600 mb-0.5 animate-spin" />
                        <span className="text-[9px] font-bold text-[#6C2BD9]">Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 text-purple-600 mb-0.5" />
                        <span className="text-[9px] font-bold text-slate-700 leading-tight">Upload Image</span>
                        <span className="text-[7px] text-slate-400">Cloudinary (JPG, PNG)</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* PANEL 2: 🏷️ 2. Classification ⓘ */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-[#6C2BD9]" /> Classification <HelpCircle className="w-3.5 h-3.5 text-slate-400 cursor-pointer" />
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
                    <Wrench className="w-4 h-4 text-[#6C2BD9]" /> Product Details <HelpCircle className="w-3.5 h-3.5 text-slate-400 cursor-pointer" />
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
                    <Radio className="w-4 h-4 text-[#6C2BD9]" /> Location &amp; Ownership <HelpCircle className="w-3.5 h-3.5 text-slate-400 cursor-pointer" />
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
                    <DollarSign className="w-4 h-4 text-[#6C2BD9]" /> Financial Information
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
                    <ShieldCheck className="w-4 h-4 text-[#6C2BD9]" /> Warranty &amp; Contract <HelpCircle className="w-3.5 h-3.5 text-slate-400 cursor-pointer" />
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
                    <Wrench className="w-4 h-4 text-[#6C2BD9]" /> Maintenance Setup <HelpCircle className="w-3.5 h-3.5 text-slate-400 cursor-pointer" />
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
                    <Cpu className="w-4 h-4 text-[#6C2BD9]" /> Auto Discovery <HelpCircle className="w-3.5 h-3.5 text-slate-400 cursor-pointer" />
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
                    <FileText className="w-4 h-4 text-[#6C2BD9]" /> Additional Information
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
                    <Paperclip className="w-4 h-4 text-[#6C2BD9]" /> Documents &amp; Attachments
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
                    <Sliders className="w-4 h-4 text-[#6C2BD9]" /> Custom Fields
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
