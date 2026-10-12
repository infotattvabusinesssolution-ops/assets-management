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
  const [createdAssets, setCreatedAssets] = useState([]);

  // Cloudinary upload state & refs
  const docInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Master Data Options loaded dynamically from backend
  const [categories, setCategories] = useState([]);
  const [assetClasses, setAssetClasses] = useState([]);
  const [sites, setSites] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [floors, setFloors] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [costCenters, setCostCenters] = useState([]);
  const [manufacturers, setManufacturers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [discoveredDevices, setDiscoveredDevices] = useState([]);
  const [loadingDevices, setLoadingDevices] = useState(false);

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

  // Load live master data options. Asset IDs are assigned by the database on save.
  useEffect(() => {
    async function loadMasterData() {
      try {
        const [catRes, classRes, siteRes, deptRes, ccRes, mfrRes, empRes, companyRes, buildingRes, floorRes, roomRes] = await Promise.all([
          api.get('/master-data/categories').catch(() => null),
          api.get('/master-data/asset-classes').catch(() => null),
          api.get('/master-data/sites').catch(() => null),
          api.get('/master-data/departments').catch(() => null),
          api.get('/master-data/cost-centers').catch(() => null),
          api.get('/master-data/manufacturers').catch(() => null),
          api.get('/master-data/employees').catch(() => null),
          api.get('/master-data/companies').catch(() => null),
          api.get('/master-data/buildings').catch(() => null),
          api.get('/master-data/floors').catch(() => null),
          api.get('/master-data/rooms').catch(() => null)
        ]);
        if (catRes?.categories) setCategories(catRes.categories);
        if (classRes?.assetClasses) setAssetClasses(classRes.assetClasses);
        if (siteRes?.sites) setSites(siteRes.sites);
        if (companyRes?.companies) setCompanies(companyRes.companies);
        if (buildingRes?.buildings) setBuildings(buildingRes.buildings);
        if (floorRes?.floors) setFloors(floorRes.floors);
        if (roomRes?.rooms) setRooms(roomRes.rooms);
        if (deptRes?.departments) setDepartments(deptRes.departments);
        if (ccRes?.costCenters) setCostCenters(ccRes.costCenters);
        if (mfrRes?.manufacturers) setManufacturers(mfrRes.manufacturers);
        if (empRes?.employees) setEmployees(empRes.employees);
      } catch (err) {
        console.warn('Master data load skipped:', err);
      }
    }
    loadMasterData();

  }, []);

  useEffect(() => {
    let active = true;
    setLoadingDevices(true);
    api.get('/discovery/devices', { params: { limit: 2000 } })
      .then(res => { if (active) setDiscoveredDevices((res?.devices || []).filter(device => !device.linkedAssetId)); })
      .catch(() => { if (active) setDiscoveredDevices([]); })
      .finally(() => { if (active) setLoadingDevices(false); });
    return () => { active = false; };
  }, []);

  // Shared Form State across both form designs
  const [formData, setFormData] = useState({
    // 1. Basic Information
    assetName: '',
    assetType: 'IT Equipment',
    category: '',
    categoryId: '',
    subcategory: '',
    assetClassId: '',
    manufacturer: '',
    model: '',
    serialNumber: '',
    quantity: '1',
    description: '',
    image: '',

    // 2. Classification (Grid View)
    assetGroup: '',
    assetClass: '',
    criticality: 'Medium',
    status: 'New',
    condition: 'New',

    // 3. Product Details
    brand: '',
    modelNumber: '',
    assetTagBarcode: '',
    rfidEpc: '',
    tid: '',

    // 4. Location & Ownership
    company: '',
    businessUnit: '',
    department: '',
    costCenter: '',
    site: '',
    building: '',
    floor: '',
    room: '',
    zoneArea: '',
    storageArea: '',
    custodian: '',
    alternateCustodian: '',
    expectedUser: '',

    // 5. Financial Information
    acquisitionDate: '',
    acquisitionCost: '',
    purchaseDate: '',
    purchaseCost: '',
    currency: 'AED',
    supplier: '',
    vendorSupplier: '',
    poInvoiceNo: '',
    assetBook: 'Corporate Book',
    depreciationMethod: 'Straight Line',
    usefulLifeYears: '5',
    residualValue: '',

    // 6. Warranty & Contract
    underWarranty: false,
    provider: '',
    warrantyType: '',
    warrantyStartDate: '',
    warrantyYears: '',
    warrantyEndDate: '',
    coverage: '',
    contractReference: '',
    warrantyDoc: '',

    // 7. Maintenance Setup
    enablePm: false,
    pmTitle: '',
    pmDescription: '',
    pmWorkType: 'PREVENTIVE',
    pmFrequencyMonths: 3,
    pmNextDueDate: '',
    pmChecklistText: '',
    pmActive: true,
    pmAutoGenerateWorkOrders: false,
    pmAdvanceDays: 7,

    // 8. Auto Discovery
    linkToDiscovered: false,
    discoveryId: '',
    discoverySource: '',
    hostname: '',
    ipAddress: '',
    macAddress: '',
    discoveredSerial: '',
    firstSeen: '',
    lastSeen: '',
    matchedDiscovery: false,

    // 9. Additional Information
    project: '',
    reference: '',
    notes: '',

    // Tagging tab selection (Stepper view)
    tagType: 'Barcode', // Barcode | RFID | QR Code
    tagStatus: 'Available',

    // Documents
    documents: [],

    // Approval Workflow
    approvalRequired: 'No',
    approvalStatus: 'Draft',
    nextApprover: '',
    approvalRemarks: '',

    // Custom Fields
    costAllocation: '',
    businessApplication: '',
    remarks: ''
  });
  const [serialNumbers, setSerialNumbers] = useState(['']);
  const [discoveryItems, setDiscoveryItems] = useState([{}]);
  const [assetItems, setAssetItems] = useState([{}]);
  const [selectedItemIndex, setSelectedItemIndex] = useState(0);
  const quantityCount = Number(formData.quantity) || 1;
  const previewPrefix = value => {
    const words = String(value || '').toUpperCase().match(/[A-Z0-9]+/g) || [];
    return (words.length > 1 ? (words[0].length <= 2 ? words[0] : words.map(word => word[0]).join('')) : words[0] || 'GEN').slice(0, 5);
  };
  const categoryCode = categories.find(category => category.id === formData.categoryId)?.code?.replace(/^CAT[-_ ]?/i, '') || formData.category;
  const subcategoryCode = assetClasses.find(assetClass => assetClass.id === formData.assetClassId)?.code?.replace(/^CLS[-_ ]?/i, '') || formData.subcategory;
  const assetIdPreview = `${previewPrefix(formData.assetType)}-${previewPrefix(categoryCode)}-${previewPrefix(subcategoryCode)}-${new Date().getFullYear()}-…`;
  const availableAssetClasses = assetClasses.filter(assetClass => assetClass.categoryId === formData.categoryId);
  const updateQuantity = value => {
    setFormData(previous => ({ ...previous, quantity: value, serialNumber: serialNumbers[0] || '' }));
    const count = Number(value);
    if (Number.isInteger(count) && count >= 1 && count <= 50) {
      setSerialNumbers(previous => Array.from({ length: count }, (_, index) => previous[index] || ''));
      setDiscoveryItems(previous => Array.from({ length: count }, (_, index) => previous[index] || {}));
      setAssetItems(previous => Array.from({ length: count }, (_, index) => previous[index] || {}));
      setSelectedItemIndex(0);
    }
  };
  const updateSerialNumber = value => {
    setSerialNumbers(previous => previous.map((serial, index) => index === selectedItemIndex ? value : serial));
    setFormData(previous => ({ ...previous, serialNumber: value }));
  };
  const updateDiscoveryItem = changes => {
    setDiscoveryItems(previous => previous.map((item, index) => index === selectedItemIndex ? { ...item, ...changes } : item));
  };
  const updateAssetItem = changes => setAssetItems(previous => previous.map((item, index) => index === selectedItemIndex ? { ...item, ...changes } : item));
  const warrantyEndFor = (start, years) => {
    if (!start || !Number.isInteger(Number(years)) || Number(years) < 1 || Number(years) > 50) return '';
    const date = new Date(`${start}T00:00:00Z`);
    if (Number.isNaN(date.getTime())) return '';
    date.setUTCFullYear(date.getUTCFullYear() + Number(years));
    date.setUTCDate(date.getUTCDate() - 1);
    return date.toISOString().slice(0, 10);
  };
  const updateWarranty = (changes, perItem = false) => {
    const previous = perItem ? { ...formData, ...assetItems[selectedItemIndex] } : formData;
    const next = { ...previous, ...changes };
    next.warrantyEndDate = warrantyEndFor(next.warrantyStartDate, next.warrantyYears);
    if (perItem) updateAssetItem({ ...changes, warrantyEndDate: next.warrantyEndDate });
    else setFormData(next);
  };
  const renderItemSelector = label => <label className="block space-y-1 text-xs font-bold text-slate-700">{label}
    <select value={selectedItemIndex} onChange={event => setSelectedItemIndex(Number(event.target.value))} className="w-full rounded-lg border border-purple-200 bg-white p-2">
      {assetItems.map((_, index) => <option key={index} value={index}>{index + 1} / {assetItems.length} — {serialNumbers[index] || 'No serial number'}</option>)}
    </select>
  </label>;

  const selectedDepreciationCategory = categories.find(category => category.id === formData.categoryId)
    || categories.find(category => category.name === formData.category);
  const categoryDepreciationRate = Number(selectedDepreciationCategory?.annualDepreciationRatePercent || 0);
  const categoryUsefulLifeMonths = categoryDepreciationRate > 0
    ? Math.round(1200 / categoryDepreciationRate)
    : Number(selectedDepreciationCategory?.defaultUsefulLifeMonths || 60);
  const categoryResidualPercent = Number(selectedDepreciationCategory?.defaultResidualValuePercent || 0);
  const enteredAcquisitionCost = Number.parseFloat(String(formData.acquisitionCost || formData.purchaseCost || '0').replace(/[^0-9.-]/g, '')) || 0;
  const residualAmount = enteredAcquisitionCost * categoryResidualPercent / 100;
  const firstYearDepreciation = enteredAcquisitionCost > 0 && selectedDepreciationCategory
    ? Math.min(enteredAcquisitionCost - residualAmount, Number((categoryDepreciationRate > 0
      ? enteredAcquisitionCost * categoryDepreciationRate / 100
      : (enteredAcquisitionCost - residualAmount) * 12 / categoryUsefulLifeMonths).toFixed(2)))
    : 0;
  const depreciationStartDate = new Date(`${formData.inServiceDate || formData.purchaseDate || formData.acquisitionDate || new Date().toISOString().slice(0, 10)}T00:00:00Z`);
  const firstDepreciationDate = new Date(depreciationStartDate);
  firstDepreciationDate.setUTCFullYear(firstDepreciationDate.getUTCFullYear() + 1);
  const formatDepreciationAmount = (amount) => new Intl.NumberFormat('en-US', {
    style: 'currency', currency: formData.currency || 'AED', maximumFractionDigits: 2
  }).format(amount);

  const renderCategoryDepreciation = () => (
    <div className="rounded-xl border border-purple-200 bg-purple-50 p-3 space-y-3 text-xs">
      <div className="flex items-center justify-between gap-2">
        <strong className="text-slate-900">Category depreciation configuration</strong>
        <button type="button" onClick={() => navigate('/admin/master-data?tab=depreciation')} className="font-bold text-[#6C2BD9] hover:underline">Edit in Administration</button>
      </div>
      {selectedDepreciationCategory ? (
        <>
          <p className="text-slate-700">Category: <strong>{selectedDepreciationCategory.name}</strong> ({selectedDepreciationCategory.code}) · {categoryDepreciationRate > 0 ? `${categoryDepreciationRate}% per year` : 'Rate not configured'} · Straight line · {categoryUsefulLifeMonths} months useful life · {categoryResidualPercent}% residual value.</p>
          {enteredAcquisitionCost > 0 ? (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <div className="rounded-lg bg-white p-2"><span className="block text-slate-500">Before first anniversary</span><strong>{formatDepreciationAmount(0)}</strong></div>
              <div className="rounded-lg bg-white p-2"><span className="block text-slate-500">First annual depreciation</span><strong>{formatDepreciationAmount(firstYearDepreciation)}</strong></div>
              <div className="rounded-lg bg-white p-2"><span className="block text-slate-500">Value after first anniversary</span><strong>{formatDepreciationAmount(enteredAcquisitionCost - firstYearDepreciation)}</strong></div>
              <div className="rounded-lg bg-white p-2"><span className="block text-slate-500">Residual floor</span><strong>{formatDepreciationAmount(residualAmount)}</strong></div>
            </div>
          ) : <p className="text-slate-600">Enter the acquisition cost to preview the depreciated value.</p>}
          <p className="text-slate-500">No depreciation is due until {firstDepreciationDate.toLocaleDateString('en-GB', { timeZone: 'UTC' })}, one full year after the start date. Finance runs post completed years only.</p>
        </>
      ) : <p className="text-slate-600">Select a category to see its saved depreciation policy.</p>}
    </div>
  );

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
        generatedTag = `QR-${year}-${randSeq}`;

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
    if (createdAssets.length) {
      showToast('success', 'These assets are already saved. Open Asset Register to view them.');
      return;
    }
    setLoading(true);
    try {
      const quantity = Number(formData.quantity);
      if (!Number.isInteger(quantity) || quantity < 1 || quantity > 50 || serialNumbers.length !== quantity) {
        showToast('error', 'Enter a quantity from 1 to 50.');
        return;
      }
      if (!formData.categoryId || !categories.some(category => category.id === formData.categoryId)) {
        showToast('error', 'Select a registered category so its depreciation policy can be applied.');
        return;
      }
      const itemSerialNumbers = serialNumbers.map(serial => serial.trim());
      if (quantity > 1 && selectedDepreciationCategory?.isSerialized && itemSerialNumbers.some(serial => !serial)) {
        showToast('error', 'Enter a serial number for every item before saving.');
        return;
      }
      if (new Set(itemSerialNumbers.filter(Boolean).map(serial => serial.toUpperCase())).size !== itemSerialNumbers.filter(Boolean).length) {
        showToast('error', 'Each item needs a different serial number.');
        return;
      }
      if (quantity > 1) {
        if (assetItems.length !== quantity) {
          showToast('error', 'Set up the details for each asset in this batch.');
          return;
        }
        const linked = discoveryItems.map(item => item.discoveryId).filter(Boolean);
        if (discoveryItems.length !== quantity || discoveryItems.some(item => item.linkToDiscovered && !item.discoveryId)) {
          showToast('error', 'Select a discovered device for each item marked as linked.');
          return;
        }
        if (new Set(linked).size !== linked.length) {
          showToast('error', 'Each item must use a different discovered device.');
          return;
        }
        const tags = assetItems.map(item => item.tagNumber?.trim().toUpperCase()).filter(Boolean);
        const epcs = assetItems.map(item => item.rfidEpc?.trim().toUpperCase()).filter(Boolean);
        if (new Set(tags).size !== tags.length || new Set(epcs).size !== epcs.length) {
          showToast('error', 'Each item needs a different tag number and RFID EPC.');
          return;
        }
      }
      const warrantyEntries = quantity > 1 ? assetItems.map(item => ({ ...formData, ...item })) : [formData];
      if (warrantyEntries.some(item => (item.warrantyStartDate || item.warrantyYears) && !warrantyEndFor(item.warrantyStartDate, item.warrantyYears))) {
        showToast('error', 'Enter a valid warranty start date and a whole number of years from 1 to 50.');
        return;
      }
      const pmTasks = formData.pmChecklistText.split('\n').map(task => task.trim()).filter(Boolean);
      if (formData.enablePm && (!formData.pmTitle.trim() || !formData.pmNextDueDate ||
          !Number.isInteger(Number(formData.pmFrequencyMonths)) || Number(formData.pmFrequencyMonths) < 1 || Number(formData.pmFrequencyMonths) > 120 ||
          !Number.isInteger(Number(formData.pmAdvanceDays)) || Number(formData.pmAdvanceDays) < 0 || Number(formData.pmAdvanceDays) > 90 ||
          formData.pmDescription.length > 500 || pmTasks.length > 30 || pmTasks.some(task => task.length > 200))) {
        showToast('error', 'Complete the preventive schedule: title, due date, 1–120 month interval, 0–90 advance days, and up to 30 checklist tasks.');
        return;
      }
      if (quantity === 1 && formData.linkToDiscovered && !formData.discoveryId) {
        showToast('error', 'Choose a discovered device or switch to manual discovery details.');
        return;
      }
      const payload = {
        autoGenerateId: true,
        quantity,
        serialNumbers: itemSerialNumbers,
        discoveryItems: quantity > 1 ? discoveryItems : undefined,
        assetItems: quantity > 1 ? assetItems : undefined,
        assetType: formData.assetType,
        subcategory: formData.subcategory,
        assetClassId: formData.assetClassId || undefined,
        assetName: formData.assetName?.trim() || undefined,
        description: formData.description?.trim() || formData.assetName?.trim() || undefined,
        category: formData.category || undefined,
        categoryId: formData.categoryId || undefined,
        manufacturer: formData.manufacturer?.trim() || formData.brand?.trim() || undefined,
        model: formData.model?.trim() || formData.modelNumber?.trim() || undefined,
        serialNumber: quantity === 1 ? itemSerialNumbers[0] || formData.discoveredSerial?.trim() || undefined : undefined,
        tagNumber: quantity === 1 ? formData.assetTagBarcode?.trim() || undefined : undefined,
        barcode: quantity === 1 ? formData.assetTagBarcode?.trim() || undefined : undefined,
        rfidEpc: quantity === 1 ? formData.rfidEpc?.trim() || undefined : undefined,
        company: formData.company || undefined,
        site: formData.site || undefined,
        building: formData.building || undefined,
        floor: formData.floor || undefined,
        room: formData.room || undefined,
        department: formData.department || undefined,
        costCenter: formData.costCenter || undefined,
        custodian: formData.custodian?.trim() || undefined,
        acquisitionCost: formData.acquisitionCost || formData.purchaseCost || undefined,
        currency: formData.currency || 'USD',
        condition: formData.condition || 'NEW',
        criticality: formData.criticality || 'MEDIUM',
        lifecycleStatus: targetStatus === 'SUBMITTED' ? 'IN_SERVICE' : 'RECEIVED',
        poInvoiceNo: formData.poInvoiceNo?.trim() || undefined,
        supplier: formData.supplier?.trim() || formData.vendorSupplier?.trim() || undefined,
        purchaseDate: formData.purchaseDate || formData.acquisitionDate || undefined,
        inServiceDate: formData.inServiceDate || formData.purchaseDate || formData.acquisitionDate || undefined,
        underWarranty: Boolean(formData.warrantyStartDate && formData.warrantyEndDate),
        warrantyStartDate: formData.warrantyStartDate || undefined,
        warrantyEndDate: formData.warrantyEndDate || undefined,
        coverage: formData.coverage || undefined,
        provider: formData.provider?.trim() || formData.manufacturer?.trim() || undefined,
        notes: formData.notes?.trim() || formData.remarks?.trim() || undefined,
        documents: formData.documents && formData.documents.length > 0 ? formData.documents : undefined,
        imageUrl: formData.assetImage || formData.imageUrl || undefined,
        hostname: quantity === 1 ? formData.hostname?.trim() || undefined : undefined,
        ipAddress: quantity === 1 ? formData.ipAddress?.trim() || undefined : undefined,
        macAddress: quantity === 1 ? formData.macAddress?.trim() || undefined : undefined,
        discoveredSerial: quantity === 1 ? formData.discoveredSerial?.trim() || undefined : undefined,
        discoveryId: quantity === 1 && formData.linkToDiscovered ? formData.discoveryId : undefined,
        manualDiscovery: quantity === 1 && !formData.linkToDiscovered,
        discoverySource: quantity === 1 ? formData.linkToDiscovered ? formData.discoverySource : 'MANUAL_ENTRY' : undefined,
        firstSeen: quantity === 1 && !formData.linkToDiscovered ? formData.firstSeen || undefined : undefined,
        lastSeen: quantity === 1 && !formData.linkToDiscovered ? formData.lastSeen || undefined : undefined,
        maintenance: formData.enablePm ? {
          enabled: true,
          title: formData.pmTitle.trim(),
          description: formData.pmDescription.trim(),
          workType: formData.pmWorkType,
          frequencyMonths: Number(formData.pmFrequencyMonths),
          nextDueDate: formData.pmNextDueDate,
          checklist: pmTasks,
          active: formData.pmActive,
          autoGenerateWorkOrders: formData.pmAutoGenerateWorkOrders,
          advanceDays: Number(formData.pmAdvanceDays)
        } : undefined
      };

      const res = await api.post('/assets', payload);
      if (res?.success) {
        if (quantity > 1) setCreatedAssets(res.assets || []);
        showToast('success', quantity > 1
          ? `${res.createdCount || quantity} assets created with separate IDs and serial numbers.`
          : targetStatus === 'SUBMITTED'
            ? `Asset ${res.asset?.assetId} registered in ${res.category?.name || formData.category}.`
            : `Asset draft ${res.asset?.assetId} saved in ${res.category?.name || formData.category}.`);
        if (quantity === 1) setTimeout(() => navigate(res.asset?.id ? `/assets/${encodeURIComponent(res.asset.id)}?tab=financial` : '/assets'), 1200);
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

  const selectDiscoveredDevice = (id) => {
    const device = discoveredDevices.find(item => item.id === id);
    if (quantityCount > 1) {
      updateDiscoveryItem({
        discoveryId: id,
        hostname: device?.hostname || '', ipAddress: device?.ipAddress || '',
        macAddress: device?.macAddress || '', discoveredSerial: device?.serialNumber || '',
        firstSeen: device?.firstSeen?.slice(0, 10) || '', lastSeen: device?.lastSeen?.slice(0, 10) || ''
      });
      if (device?.serialNumber) setSerialNumbers(previous => previous.map((serial, index) => index === selectedItemIndex ? device.serialNumber : serial));
      return;
    }
    if (quantityCount === 1) setSerialNumbers([device?.serialNumber || serialNumbers[0] || '']);
    setFormData(prev => ({
      ...prev,
      discoveryId: id,
      matchedDiscovery: Boolean(device),
      discoverySource: device?.discoverySource || '',
      hostname: device?.hostname || prev.hostname,
      ipAddress: device?.ipAddress || prev.ipAddress,
      macAddress: device?.macAddress || prev.macAddress,
      discoveredSerial: device?.serialNumber || prev.discoveredSerial,
      serialNumber: prev.serialNumber || device?.serialNumber || '',
      manufacturer: prev.manufacturer || device?.manufacturer || '',
      model: prev.model || device?.model || '',
      firstSeen: device?.firstSeen?.slice(0, 10) || '',
      lastSeen: device?.lastSeen?.slice(0, 10) || ''
    }));
  };

  const renderPreventiveMaintenanceFields = (compact = false) => (
    <div className={`grid gap-3 text-xs ${compact ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'}`}>
      <label className="space-y-1 font-semibold">Schedule No.
        <input readOnly value="Assigned on save" className="w-full rounded-lg border bg-slate-100 p-2" />
      </label>
      <label className="space-y-1 font-semibold">Asset / Category
        <input readOnly value={[assetIdPreview, formData.category].filter(Boolean).join(' · ')} className="w-full rounded-lg border bg-slate-100 p-2" />
      </label>
      <label className="space-y-1 font-semibold">Location
        <input readOnly value={[formData.site, formData.building, formData.floor, formData.room].filter(Boolean).join(' · ')} className="w-full rounded-lg border bg-slate-100 p-2" />
      </label>
      <label className="space-y-1 font-semibold">Last Service Date
        <input readOnly value="Not serviced yet" className="w-full rounded-lg border bg-slate-100 p-2" />
      </label>
      <label className="space-y-1 font-semibold">Schedule Title *
        <input value={formData.pmTitle} maxLength={200} onChange={e => setFormData(prev => ({ ...prev, pmTitle: e.target.value }))} className="w-full rounded-lg border p-2" placeholder="e.g. Laptop quarterly inspection" />
      </label>
      <label className="space-y-1 font-semibold">Schedule Type
        <select value={formData.pmWorkType} onChange={e => setFormData(prev => ({ ...prev, pmWorkType: e.target.value }))} className="w-full rounded-lg border p-2"><option value="PREVENTIVE">Preventive</option><option value="INSPECTION">Inspection</option></select>
      </label>
      <label className="space-y-1 font-semibold">Repeat Every (Months) *
        <input type="number" min="1" max="120" value={formData.pmFrequencyMonths} onChange={e => setFormData(prev => ({ ...prev, pmFrequencyMonths: e.target.value }))} className="w-full rounded-lg border p-2" />
      </label>
      <label className="space-y-1 font-semibold">Next Due Date *
        <input type="date" value={formData.pmNextDueDate} onChange={e => setFormData(prev => ({ ...prev, pmNextDueDate: e.target.value }))} className="w-full rounded-lg border p-2" />
      </label>
      <label className={`space-y-1 font-semibold ${compact ? '' : 'sm:col-span-2'}`}>Description
        <textarea rows={2} maxLength={500} value={formData.pmDescription} onChange={e => setFormData(prev => ({ ...prev, pmDescription: e.target.value }))} className="w-full rounded-lg border p-2" />
      </label>
      <label className={`space-y-1 font-semibold ${compact ? '' : 'sm:col-span-2'}`}>Checklist (one task per line)
        <textarea rows={3} value={formData.pmChecklistText} onChange={e => setFormData(prev => ({ ...prev, pmChecklistText: e.target.value }))} className="w-full rounded-lg border p-2" placeholder="Inspect condition&#10;Check battery" />
      </label>
      <label className="flex items-center gap-2 font-semibold"><input type="checkbox" checked={formData.pmActive} onChange={e => setFormData(prev => ({ ...prev, pmActive: e.target.checked }))} /> Schedule active</label>
      <label className="flex items-center gap-2 font-semibold"><input type="checkbox" checked={formData.pmAutoGenerateWorkOrders} onChange={e => setFormData(prev => ({ ...prev, pmAutoGenerateWorkOrders: e.target.checked }))} /> Automatically generate work order when due</label>
      <label className="space-y-1 font-semibold">Generate this many days before due date
        <input type="number" min="0" max="90" value={formData.pmAdvanceDays} onChange={e => setFormData(prev => ({ ...prev, pmAdvanceDays: e.target.value }))} className="w-full rounded-lg border p-2" />
      </label>
      <p className="self-end text-slate-500">The schedule will appear under Preventive Maintenance after this asset is saved.</p>
    </div>
  );

  const renderBatchDiscovery = () => {
    const item = discoveryItems[selectedItemIndex] || {};
    const selectedIds = discoveryItems.map(entry => entry.discoveryId).filter(Boolean);
    return <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-4 text-xs">
      <div className="border-b border-slate-100 pb-2">
        <h3 className="font-extrabold text-slate-900 flex items-center gap-2"><Cpu className="w-4 h-4 text-[#6C2BD9]" /> Auto Discovery for each asset</h3>
        <p className="mt-1 text-slate-500">Choose a different discovered device for each item, or enter its network details manually.</p>
      </div>
      <label className="block space-y-1 font-bold text-slate-700">Asset item
        <select value={selectedItemIndex} onChange={event => setSelectedItemIndex(Number(event.target.value))} className="w-full rounded-lg border border-slate-300 bg-white p-2">
          {discoveryItems.map((entry, index) => <option key={index} value={index}>{index + 1} / {discoveryItems.length} — {serialNumbers[index] || 'No serial'} — {entry.discoveryId ? 'Device selected' : ['hostname', 'ipAddress', 'macAddress'].some(key => entry[key]) ? 'Manual details' : 'No discovery details'}</option>)}
        </select>
      </label>
      <label className="flex items-center gap-2 font-semibold"><input type="checkbox" checked={Boolean(item.linkToDiscovered)} onChange={event => updateDiscoveryItem({ linkToDiscovered: event.target.checked, discoveryId: '' })} /> Link an existing discovered device for this item</label>
      {item.linkToDiscovered && <label className="block space-y-1 font-semibold">Discovered device
        <select value={item.discoveryId || ''} onChange={event => selectDiscoveredDevice(event.target.value)} className="w-full rounded-lg border border-slate-300 bg-white p-2">
          <option value="">{loadingDevices ? 'Loading devices…' : 'Select device'}</option>
          {discoveredDevices.filter(device => !selectedIds.includes(device.id) || device.id === item.discoveryId).map(device => <option key={device.id} value={device.id}>{[device.hostname, device.ipAddress, device.serialNumber].filter(Boolean).join(' · ') || device.id}</option>)}
        </select>
      </label>}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[['hostname', 'Hostname'], ['ipAddress', 'IP address'], ['macAddress', 'MAC address'], ['discoveredSerial', 'Device serial']].map(([key, label]) => <label key={key} className="space-y-1 font-semibold">{label}
          <input value={item[key] || ''} readOnly={Boolean(item.linkToDiscovered)} onChange={event => updateDiscoveryItem({ [key]: event.target.value })} className={`w-full rounded-lg border p-2 ${item.linkToDiscovered ? 'bg-slate-100' : 'bg-white'}`} />
        </label>)}
        {!item.linkToDiscovered && [['firstSeen', 'First seen'], ['lastSeen', 'Last seen']].map(([key, label]) => <label key={key} className="space-y-1 font-semibold">{label}
          <input type="date" value={item[key] || ''} onChange={event => updateDiscoveryItem({ [key]: event.target.value })} className="w-full rounded-lg border bg-white p-2" />
        </label>)}
      </div>
      <p className="text-slate-500">{discoveryItems.filter(entry => entry.discoveryId).length} of {discoveryItems.length} items linked to discovered devices. Items without discovery details can still be registered.</p>
    </div>;
  };

  const renderMaintenanceDiscovery = () => (
    <div className="space-y-4">
      <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 text-xs">
        <h3 className="font-extrabold text-slate-900 flex items-center gap-2"><Wrench className="w-4 h-4 text-[#6C2BD9]" /> Preventive Maintenance</h3>
        <label className="flex items-center gap-2 font-semibold"><input type="checkbox" checked={formData.enablePm} onChange={e => setFormData(prev => ({ ...prev, enablePm: e.target.checked }))} /> Enable maintenance schedule</label>
        {formData.enablePm && renderPreventiveMaintenanceFields()}
      </div>
      {quantityCount > 1 ? renderBatchDiscovery() : <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 text-xs">
        <h3 className="font-extrabold text-slate-900 flex items-center gap-2"><Cpu className="w-4 h-4 text-[#6C2BD9]" /> Auto Discovery</h3>
        <label className="flex items-center gap-2 font-semibold"><input type="checkbox" checked={formData.linkToDiscovered} onChange={e => setFormData(prev => ({ ...prev, linkToDiscovered: e.target.checked, discoveryId: e.target.checked ? prev.discoveryId : '', matchedDiscovery: false }))} /> Link an existing discovered device</label>
        {formData.linkToDiscovered && <label className="block space-y-1">Discovered device<select className="w-full border rounded-lg p-2" value={formData.discoveryId} onChange={e => selectDiscoveredDevice(e.target.value)}><option value="">{loadingDevices ? 'Loading devices…' : 'Select device'}</option>{discoveredDevices.map(device => <option key={device.id} value={device.id}>{[device.hostname, device.ipAddress, device.serialNumber].filter(Boolean).join(' · ') || device.id}</option>)}</select></label>}
        {!formData.linkToDiscovered && <p className="text-slate-500">Enter network details manually if this device has not been discovered yet.</p>}
        <div className="grid grid-cols-2 gap-3">
          {[['hostname', 'Hostname'], ['ipAddress', 'IP address'], ['macAddress', 'MAC address'], ['discoveredSerial', 'Device serial']].map(([key, label]) => <label key={key} className="space-y-1">{label}<input className="w-full border rounded-lg p-2" value={formData[key]} onChange={e => setFormData(prev => ({ ...prev, [key]: e.target.value }))} /></label>)}
          {!formData.linkToDiscovered && [['firstSeen', 'First seen'], ['lastSeen', 'Last seen']].map(([key, label]) => <label key={key} className="space-y-1">{label}<input type="date" className="w-full border rounded-lg p-2" value={formData[key]} onChange={e => setFormData(prev => ({ ...prev, [key]: e.target.value }))} /></label>)}
        </div>
        {formData.discoveryId && <p className="text-emerald-700 font-semibold">Selected discovery record will be linked when this asset is saved.</p>}
      </div>}
    </div>
  );

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

      <div className="p-3 bg-purple-50/50 border border-purple-100 rounded-xl text-xs">
        <label className="font-bold text-slate-700 block mb-1">Asset ID</label>
        <input readOnly value={assetIdPreview} className="w-full bg-white border border-slate-200 rounded-xl p-2 text-slate-900 font-mono font-bold" />
        <p className="mt-1 text-[11px] text-slate-500">Each item receives a unique ID using the asset type, category, and subcategory prefixes when saved.</p>
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
            onChange={(e) => {
              const selectedCat = categories.find(c => c.name === e.target.value);
              setFormData({
                ...formData,
                category: e.target.value,
                categoryId: selectedCat?.id || '',
                subcategory: '', assetClassId: ''
              });
            }}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold focus:border-[#6C2BD9] outline-none"
          >
            <option value="">Select Category</option>
            {categories.map(c => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="font-bold text-slate-700 block mb-1">Sub Category</label>
          <select
            value={formData.assetClassId}
            onChange={(e) => { const assetClass = availableAssetClasses.find(item => item.id === e.target.value); setFormData({ ...formData, subcategory: assetClass?.name || '', assetClassId: assetClass?.id || '' }); }}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold focus:border-[#6C2BD9] outline-none"
          >
            <option value="">Select Subcategory (Optional)</option>
            {availableAssetClasses.map(assetClass => <option key={assetClass.id} value={assetClass.id}>{assetClass.name}</option>)}
          </select>
        </div>

        <div>
          <label className="font-bold text-slate-700 block mb-1">Manufacturer</label>
          <input
            type="text"
            value={formData.manufacturer}
            onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
            placeholder="e.g. Dell, HP, Apple (optional)"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold focus:border-[#6C2BD9] outline-none"
          />
        </div>

        <div>
          <label className="font-bold text-slate-700 block mb-1">Model</label>
          <input
            type="text"
            value={formData.model}
            onChange={(e) => setFormData({ ...formData, model: e.target.value })}
            placeholder="e.g. Latitude 5420 (optional)"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold focus:border-[#6C2BD9] outline-none"
          />
        </div>

        <div>
          <label className="font-bold text-slate-700 block mb-1">Serial Number</label>
          <input
            type="text"
            value={serialNumbers[selectedItemIndex] || ''}
            onChange={(e) => updateSerialNumber(e.target.value)}
            placeholder="e.g. SN-892118 (optional)"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-mono font-bold focus:border-[#6C2BD9] outline-none"
          />
        </div>

        <div>
          <label className="font-bold text-slate-700 block mb-1">Quantity *</label>
          <input
            type="number"
            min="1"
            max="50"
            value={formData.quantity}
            onChange={(e) => updateQuantity(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-bold focus:border-[#6C2BD9] outline-none"
          />
        </div>
      </div>
      {quantityCount > 1 && <div className="rounded-xl border border-purple-200 bg-purple-50/40 p-3 text-xs space-y-2">
        <label className="block font-bold text-slate-700">Select item to edit its details</label>
        <select value={selectedItemIndex} onChange={event => { const index = Number(event.target.value); setSelectedItemIndex(index); setFormData(previous => ({ ...previous, serialNumber: serialNumbers[index] || '' })); }} className="w-full rounded-lg border border-slate-300 bg-white p-2 font-semibold">
          {serialNumbers.map((serial, index) => <option key={index} value={index}>{index + 1} / {serialNumbers.length}{serial ? ` — ${serial}` : ' — serial needed'}</option>)}
        </select>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="space-y-1 font-bold text-slate-700">Asset name for this item
            <input value={assetItems[selectedItemIndex]?.assetName ?? formData.assetName} onChange={event => updateAssetItem({ assetName: event.target.value, description: event.target.value })} className="w-full rounded-lg border border-slate-300 bg-white p-2" />
          </label>
          <label className="space-y-1 font-bold text-slate-700">Description for this item
            <input value={assetItems[selectedItemIndex]?.description ?? formData.description} onChange={event => updateAssetItem({ description: event.target.value })} className="w-full rounded-lg border border-slate-300 bg-white p-2" />
          </label>
        </div>
        <p className="text-slate-500">Type, category and model start as shared details. Serial number, name, description and later steps can differ for this item.</p>
      </div>}
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
        <div className="h-40 bg-slate-50 border border-slate-200 rounded-xl p-2 flex items-center justify-center overflow-hidden">
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
          className="h-40 bg-slate-50 border-2 border-dashed border-slate-200 hover:border-[#6C2BD9] rounded-xl p-2 flex flex-col items-center justify-center text-center cursor-pointer transition-colors"
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
            onChange={(e) => updateWarranty({ warrantyStartDate: e.target.value })}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold focus:border-[#6C2BD9] outline-none"
          />
        </div>

        <div>
          <label className="font-bold text-slate-700 block mb-1">Warranty (years)</label>
          <input type="number" min="1" max="50" step="1" value={formData.warrantyYears} onChange={(e) => updateWarranty({ warrantyYears: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold" />
        </div>

        <div>
          <label className="font-bold text-slate-700 block mb-1">Warranty End Date</label>
          <input
            type="date"
            value={formData.warrantyEndDate}
            readOnly
            className="w-full bg-slate-100 border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold"
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
      {renderCategoryDepreciation()}
    </div>
  );

  const renderBatchFinancial = () => {
    const item = assetItems[selectedItemIndex] || {};
    const value = key => item[key] ?? formData[key] ?? '';
    const input = (label, key, type = 'text') => <label key={key} className="space-y-1 text-xs font-bold text-slate-700">{label}
      <input type={type} value={value(key)} onChange={event => updateAssetItem({ [key]: event.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2" />
    </label>;
    return <section className="rounded-xl border border-slate-200 bg-white p-4 space-y-4">
      <h3 className="text-sm font-extrabold text-slate-900">Financial Information &amp; Warranty by Asset</h3>
      {renderItemSelector('Select asset to edit financial details')}
      <p className="text-xs text-slate-500">Fields start with the shared values. Changes here apply only to the selected asset.</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {input('Acquisition date', 'acquisitionDate', 'date')}{input('Acquisition cost', 'acquisitionCost')}
        <label className="space-y-1 text-xs font-bold text-slate-700">Currency<select value={value('currency')} onChange={event => updateAssetItem({ currency: event.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2">{['AED', 'USD', 'EUR', 'GBP', 'INR'].map(code => <option key={code} value={code}>{code}</option>)}</select></label>
        {input('Purchase order / invoice', 'poInvoiceNo')}{input('Supplier', 'supplier')}
        <label className="space-y-1 text-xs font-bold text-slate-700">Warranty start date<input type="date" value={value('warrantyStartDate')} onChange={event => updateWarranty({ warrantyStartDate: event.target.value }, true)} className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2" /></label>
        <label className="space-y-1 text-xs font-bold text-slate-700">Warranty in years<input type="number" min="1" max="50" step="1" value={value('warrantyYears')} onChange={event => updateWarranty({ warrantyYears: event.target.value }, true)} className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2" /></label>
        <label className="space-y-1 text-xs font-bold text-slate-700">Warranty end date<input type="date" readOnly value={item.warrantyEndDate ?? formData.warrantyEndDate} className="w-full rounded-xl border border-slate-200 bg-slate-100 p-2" /></label>
        {input('Warranty provider', 'provider')}{input('Warranty type', 'warrantyType')}
        {input('Coverage', 'coverage')}{input('Contract reference', 'contractReference')}
        <label className="space-y-1 text-xs font-bold text-slate-700">Condition<select value={value('condition')} onChange={event => updateAssetItem({ condition: event.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2">{['New', 'Good', 'Fair', 'Damaged', 'Refurbished'].map(condition => <option key={condition} value={condition}>{condition}</option>)}</select></label>
      </div>
      {renderCategoryDepreciation()}
    </section>;
  };

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
  const renderBatchLocation = () => {
    const item = assetItems[selectedItemIndex] || {};
    const effectiveCompanyId = item.companyId || sites.find(site => site.id === item.siteId)?.companyId || '';
    const availableSites = sites.filter(site => !item.companyId || site.companyId === item.companyId);
    const availableBuildings = buildings.filter(building => item.siteId && building.siteId === item.siteId);
    const availableFloors = floors.filter(floor => item.buildingId && floor.buildingId === item.buildingId);
    const availableRooms = rooms.filter(room => item.floorId && room.floorId === item.floorId);
    const availableDepartments = departments.filter(department => !effectiveCompanyId || department.companyId === effectiveCompanyId);
    const availableCostCenters = costCenters.filter(center => !effectiveCompanyId || center.companyId === effectiveCompanyId);
    const availableEmployees = employees.filter(employee => !effectiveCompanyId || employee.companyId === effectiveCompanyId);
    const select = (label, key, options, next = {}) => <label key={key} className="space-y-1 text-xs font-bold text-slate-700">{label}
      <select value={item[key] || ''} onChange={event => updateAssetItem({ [key]: event.target.value, ...next })} className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2">
        <option value="">Select {label.toLowerCase()} (optional)</option>
        {options.map(option => <option key={option.id} value={option.id}>{option.fullName || option.name || option.code}</option>)}
      </select>
    </label>;
    return <section className="rounded-xl border border-slate-200 bg-white p-4 space-y-4">
      <h3 className="text-sm font-extrabold text-slate-900">Location &amp; Ownership by Asset</h3>
      {renderItemSelector('Select asset to assign its location and custodian')}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {select('Company', 'companyId', companies, { siteId: '', buildingId: '', floorId: '', roomId: '', departmentId: '', costCenterId: '', custodianId: '' })}
        {select('Site', 'siteId', availableSites, { buildingId: '', floorId: '', roomId: '', departmentId: '', costCenterId: '', custodianId: '' })}
        {select('Building', 'buildingId', availableBuildings, { floorId: '', roomId: '' })}
        {select('Floor', 'floorId', availableFloors, { roomId: '' })}
        {select('Room', 'roomId', availableRooms)}
        {select('Department', 'departmentId', availableDepartments)}
        {select('Cost center', 'costCenterId', availableCostCenters)}
        {select('Custodian', 'custodianId', availableEmployees)}
      </div>
      <p className="text-xs text-slate-500">Each item can have a separate company, site, room, department and custodian. Empty company, site, department and cost center use registration defaults; an empty custodian leaves the item unassigned.</p>
    </section>;
  };
  const renderLocationOwnership = () => quantityCount > 1 ? renderBatchLocation() : (
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
          <label className="font-bold text-slate-700 block mb-1">Company</label>
          <select
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold focus:border-[#6C2BD9] outline-none"
          >
            <option value="">Select Company (Optional)</option>
            <option value="Dubai HQ">Dubai HQ</option>
            <option value="Abu Dhabi Branch">Abu Dhabi Branch</option>
            <option value="Sharjah Hub">Sharjah Hub</option>
          </select>
        </div>

        <div>
          <label className="font-bold text-slate-700 block mb-1">Site</label>
          <select
            value={formData.site}
            onChange={(e) => setFormData({ ...formData, site: e.target.value })}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold focus:border-[#6C2BD9] outline-none"
          >
            <option value="">Select Site (Optional)</option>
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
            <option value="">Select Building (Optional)</option>
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
            placeholder="Floor 3, Room 312 (optional)"
            onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold focus:border-[#6C2BD9] outline-none"
          />
        </div>

        <div>
          <label className="font-bold text-slate-700 block mb-1">Department</label>
          <select
            value={formData.department}
            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold focus:border-[#6C2BD9] outline-none"
          >
            <option value="">Select Department (Optional)</option>
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
            <option value="">Select Cost Center (Optional)</option>
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
              placeholder="e.g. EMP-1002 or Full Name (optional)"
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
              placeholder="e.g. EMP-1002 (optional)"
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
    if (quantityCount > 1) {
      const item = assetItems[selectedItemIndex] || {};
      return <section className="rounded-xl border border-slate-200 bg-white p-4 text-xs space-y-4">
        <h3 className="font-extrabold text-slate-900 flex items-center gap-2"><QrCode className="w-4 h-4 text-[#6C2BD9]" /> Tagging by Asset</h3>
        {renderItemSelector('Select asset to assign its tag')}
        <p className="text-slate-500">Leave the tag blank to generate a unique barcode when the asset is saved. A physical RFID tag needs its own EPC.</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="space-y-1 font-bold text-slate-700">Barcode / tag number<input value={item.tagNumber || ''} onChange={event => updateAssetItem({ tagNumber: event.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 font-mono" placeholder="Generated on save if blank" /></label>
          <label className="space-y-1 font-bold text-slate-700">RFID EPC<input value={item.rfidEpc || ''} onChange={event => updateAssetItem({ rfidEpc: event.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 font-mono" placeholder="Optional unique EPC" /></label>
        </div>
        {item.tagNumber && <div className="rounded-lg border border-slate-100 bg-slate-50 p-3"><BarcodePreview value={item.tagNumber} /></div>}
      </section>;
    }
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
  const reviewValue = value => {
    if (value === null || value === undefined || value === '') return <span className="italic text-slate-400">Not provided</span>;
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    return String(value);
  };
  const reviewField = (label, value) => (
    <div key={label} className="min-w-0 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
      <dt className="text-[11px] font-semibold text-slate-500">{label}</dt>
      <dd className="mt-0.5 break-words text-xs font-bold text-slate-900">{reviewValue(value)}</dd>
    </div>
  );
  const reviewSection = (title, step, fields, extra) => (
    <section key={title} className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
        <h4 className="text-sm font-extrabold text-slate-900">{title}</h4>
        <button type="button" onClick={() => { setStepMode('wizard'); setCurrentStep(step); }} className="rounded-lg border border-purple-200 bg-purple-50 px-3 py-1.5 text-xs font-bold text-[#6C2BD9] hover:bg-purple-100" aria-label={`Edit ${title} in step ${step}`}>Edit step {step}</button>
      </div>
      <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">{fields.map(([label, value]) => reviewField(label, value))}</dl>
      {extra}
    </section>
  );
  const reviewItemDetails = (kind) => quantityCount > 1 && <div className="space-y-2">
    <p className="text-xs font-bold text-slate-700">Values for each asset</p>
    {assetItems.map((item, index) => {
      const data = { ...formData, ...item };
      const labelFor = (list, id) => list.find(entry => entry.id === id)?.fullName || list.find(entry => entry.id === id)?.name || '';
      const detail = kind === 'financial'
        ? [`Acquired: ${data.acquisitionDate || 'Not provided'}`, `Cost: ${data.acquisitionCost ? `${data.currency} ${data.acquisitionCost}` : 'Not provided'}`, `PO / invoice: ${data.poInvoiceNo || 'Not provided'}`, `Supplier: ${data.supplier || 'Not provided'}`, `Condition: ${data.condition || 'Not provided'}`, `Warranty: ${data.warrantyStartDate || 'Not provided'} to ${data.warrantyEndDate || 'Not provided'}`].join(' · ')
        : [`Company: ${labelFor(companies, item.companyId) || data.company || 'Default'}`, `Site: ${labelFor(sites, item.siteId) || data.site || 'Default'}`, `Building: ${labelFor(buildings, item.buildingId) || 'Not provided'}`, `Floor: ${labelFor(floors, item.floorId) || 'Not provided'}`, `Room: ${labelFor(rooms, item.roomId) || 'Not provided'}`, `Department: ${labelFor(departments, item.departmentId) || data.department || 'Not provided'}`, `Cost center: ${labelFor(costCenters, item.costCenterId) || data.costCenter || 'Not provided'}`, `Custodian: ${labelFor(employees, item.custodianId) || 'Unassigned'}`, `Tag: ${item.tagNumber || 'Generated on save'}`, `RFID: ${item.rfidEpc || 'Not provided'}`].join(' · ');
      return <div key={index} className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-xs">
        <p className="font-bold text-slate-900">{index + 1} / {assetItems.length} — {serialNumbers[index] || 'No serial number'}</p>
        <p className="mt-1 break-words text-slate-600">{detail}</p>
      </div>;
    })}
  </div>;
  const renderDetailedReview = () => (
    <div className="space-y-4">
      <div className="rounded-xl border border-purple-200 bg-purple-50 p-4">
        <h3 className="flex items-center gap-2 text-base font-extrabold text-purple-950"><FileCheck className="h-5 w-5" /> Review &amp; Final Verification</h3>
        <p className="mt-1 text-xs text-purple-800">This is a preview of your entries. Empty fields are marked “Not provided.” Use Edit step to correct details before saving.</p>
        <p className="mt-2 text-xs font-semibold text-purple-900">{quantityCount} asset{quantityCount === 1 ? '' : 's'} will be created. Unique asset IDs are assigned when saved.</p>
      </div>
      {reviewSection('Basic information', 1, [
        ['Asset ID format', assetIdPreview], ['Asset name', formData.assetName], ['Asset type', formData.assetType],
        ['Category', formData.category], ['Subcategory', formData.subcategory], ['Manufacturer', formData.manufacturer],
        ['Brand', formData.brand], ['Model', formData.model], ['Model number', formData.modelNumber],
        ['Quantity', formData.quantity], ['Criticality', formData.criticality]
      ], <div className="space-y-2">
        {quantityCount > 1 && <div className="space-y-2">
          <p className="text-xs font-bold text-slate-700">Name and description by item</p>
          {assetItems.map((item, index) => <p key={index} className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-xs text-slate-700"><strong>{index + 1} / {assetItems.length}: {item.assetName || formData.assetName || 'Not provided'}</strong> — {item.description || formData.description || 'No description'}</p>)}
        </div>}
        <p className="text-xs font-bold text-slate-700">Serial numbers by item</p>
        <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
          {serialNumbers.map((serial, index) => reviewField(`${index + 1} / ${serialNumbers.length}`, serial))}
        </dl>
        <div className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 p-2">
          {formData.assetImage || formData.imageUrl ? <img src={formData.assetImage || formData.imageUrl} alt="Selected asset" className="h-16 w-20 rounded object-contain bg-white" /> : <Package className="h-8 w-8 text-slate-300" />}
          <span className="text-xs font-semibold text-slate-700">Asset image: {formData.assetImage || formData.imageUrl ? 'Uploaded' : 'Not provided'}</span>
        </div>
      </div>)}
      {reviewSection('Financial details and warranty', 2, [
        ['Acquisition date', formData.acquisitionDate], ['Acquisition cost', formData.acquisitionCost ? `${formData.currency} ${formData.acquisitionCost}` : ''],
        ['Currency', formData.currency], ['PO / invoice', formData.poInvoiceNo], ['Supplier', formData.supplier],
        ['Warranty start', formData.warrantyStartDate], ['Warranty in years', formData.warrantyYears], ['Warranty end', formData.warrantyEndDate], ['Condition', formData.condition],
        ['Warranty provider', formData.provider], ['Warranty type', formData.warrantyType], ['Coverage', formData.coverage],
        ['Contract reference', formData.contractReference], ['Description / remarks', formData.description],
        ['Additional notes', formData.notes], ['Project', formData.project], ['Reference', formData.reference]
      ], reviewItemDetails('financial'))}
      {reviewSection('Preventive maintenance and discovery', 2, [
        ['Maintenance enabled', formData.enablePm], ['Schedule title', formData.enablePm ? formData.pmTitle : ''],
        ['Work type', formData.enablePm ? formData.pmWorkType : ''], ['Frequency in months', formData.enablePm ? formData.pmFrequencyMonths : ''],
        ['Next due date', formData.enablePm ? formData.pmNextDueDate : ''], ['Advance days', formData.enablePm ? formData.pmAdvanceDays : ''],
        ['Automatic work orders', formData.enablePm ? formData.pmAutoGenerateWorkOrders : ''], ['Schedule active', formData.enablePm ? formData.pmActive : ''],
        ['Schedule description', formData.enablePm ? formData.pmDescription : ''], ['Checklist', formData.enablePm ? formData.pmChecklistText : ''],
        ...(quantityCount === 1 ? [
          ['Linked to discovery', formData.linkToDiscovered], ['Discovered device', formData.discoveryId],
          ['Hostname', formData.hostname], ['IP address', formData.ipAddress], ['MAC address', formData.macAddress],
          ['Device serial', formData.discoveredSerial], ['First seen', formData.firstSeen], ['Last seen', formData.lastSeen]
        ] : [['Linked devices', discoveryItems.filter(item => item.discoveryId).length]])
      ], quantityCount > 1 && <div className="space-y-2">
        <p className="text-xs font-bold text-slate-700">Discovery details by item</p>
        {discoveryItems.map((item, index) => <div key={index} className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-xs">
          <p className="font-bold text-slate-900">{index + 1} / {discoveryItems.length} — {serialNumbers[index] || 'No serial number'}</p>
          <p className="mt-1 break-words text-slate-600">{item.discoveryId ? `Linked device: ${item.hostname || item.discoveryId}` : item.hostname || item.ipAddress || item.macAddress ? 'Manual details' : 'No discovery details'} · IP: {item.ipAddress || 'Not provided'} · MAC: {item.macAddress || 'Not provided'}</p>
        </div>)}
      </div>)}
      {reviewSection('Location, ownership and tagging', 3, [
        ['Company', formData.company], ['Business unit', formData.businessUnit], ['Site', formData.site],
        ['Building', formData.building], ['Floor', formData.floor], ['Room', formData.room],
        ['Zone / area', formData.zoneArea], ['Storage area', formData.storageArea], ['Department', formData.department],
        ['Cost center', formData.costCenter], ['Custodian', formData.custodian],
        ['Alternate custodian', formData.alternateCustodian], ['Expected user', formData.expectedUser],
        ['Tag type', quantityCount === 1 ? formData.tagType : 'Individual barcodes assigned on save'],
        ['Barcode / tag', quantityCount === 1 ? formData.assetTagBarcode || 'Generated on save' : 'Generated per asset on save'],
        ['RFID EPC', quantityCount === 1 ? formData.rfidEpc : ''], ['TID', formData.tid]
      ], reviewItemDetails('location'))}
      {reviewSection('Documents', 4, [['Attached documents', formData.documents.length]],
        <ul className="space-y-1 text-xs text-slate-700">{formData.documents.length ? formData.documents.map((doc, index) => <li key={`${doc.name}-${index}`} className="break-all rounded-lg bg-slate-50 px-3 py-2">{doc.name || 'Unnamed document'}</li>) : <li className="italic text-slate-400">Not provided</li>}</ul>)}
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

      {createdAssets.length > 0 && <section className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm space-y-3" aria-label="Created assets">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-bold text-emerald-900">Created {createdAssets.length} assets</h2>
          <button type="button" onClick={() => navigate('/assets')} className="rounded-lg bg-emerald-700 px-3 py-2 text-xs font-bold text-white">Open Asset Register</button>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {createdAssets.map((asset, index) => <button key={asset.id} type="button" onClick={() => navigate(`/assets/${encodeURIComponent(asset.id)}`)} className="rounded-lg border border-emerald-200 bg-white p-3 text-left hover:border-emerald-500">
            <span className="block text-xs text-slate-500">{index + 1} / {createdAssets.length} · {asset.serialNumber || 'No serial number'}</span>
            <span className="block font-mono font-bold text-slate-900 break-all">{asset.assetId}</span>
          </button>)}
        </div>
      </section>}


      {/* ========================================================================= */}
      {/* FORM VIEW 1: STEPPER FORM WITH 8 CALLOUTS (Screenshot 1 Layout 1-to-1) */}
      {/* ========================================================================= */}
      {(activeView === 'stepper' || quantityCount > 1) && (
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

              {/* Step 1: Full-width basic information followed by the asset image */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  {renderBasicInfo()}
                  {renderAssetImage()}
                </div>
              )}

              {/* Step 2: Additional Details (Financials + Remarks) */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  {quantityCount > 1 ? renderBatchFinancial() : renderFinancialInfo()}
                  {renderDescription()}
                  {renderMaintenanceDiscovery()}
                </div>
              )}

              {/* Step 3: Tagging & Location */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  {renderLocationOwnership()}
                  {renderTagging()}
                </div>
              )}

              {/* Step 4: Documents (Cloudinary) */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  {renderDocuments()}
                </div>
              )}

              {/* Step 5: Review & Submit */}
              {currentStep === 5 && (
                <div className="space-y-4">
                  {renderDetailedReview()}
                  {renderApprovalWorkflow()}
                </div>
              )}
            </div>
          ) : (
            /* View All Mode (All 8 Callouts in Two Columns) */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
              <div className="lg:col-span-2 space-y-4">
                {renderBasicInfo()}
                {renderLocationOwnership()}
                {quantityCount > 1 ? renderBatchFinancial() : renderFinancialInfo()}
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
      {activeView === 'grid' && quantityCount === 1 && (
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

                <div className="space-y-1 text-xs">
                  <label className="font-bold text-slate-700 block">Asset ID</label>
                  <input readOnly value={assetIdPreview} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-mono font-bold" />
                  <p className="text-[10px] text-slate-500">Unique ID assigned on save.</p>
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
                      onChange={(e) => {
                        const selectedCat = categories.find(category => category.name === e.target.value);
                        setFormData({ ...formData, category: e.target.value, categoryId: selectedCat?.id || '', subcategory: '', assetClassId: '' });
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold focus:border-[#6C2BD9] outline-none"
                    >
                      <option value="">Select Category</option>
                      {categories.map(category => <option key={category.id} value={category.name}>{category.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Subcategory</label>
                    <select
                      value={formData.assetClassId}
                      onChange={(e) => { const assetClass = availableAssetClasses.find(item => item.id === e.target.value); setFormData({ ...formData, subcategory: assetClass?.name || '', assetClassId: assetClass?.id || '' }); }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold focus:border-[#6C2BD9] outline-none"
                    >
                      <option value="">Select Subcategory (Optional)</option>
                      {availableAssetClasses.map(assetClass => <option key={assetClass.id} value={assetClass.id}>{assetClass.name}</option>)}
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
                  <label className="font-bold text-slate-700 block">Quantity *</label>
                  <input type="number" min="1" max="50" value={formData.quantity} onChange={(e) => updateQuantity(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-bold focus:border-[#6C2BD9] outline-none" />
                </div>

                {quantityCount > 1 && <div className="space-y-1 text-xs">
                  <label className="font-bold text-slate-700 block">Item serial number</label>
                  <select value={selectedItemIndex} onChange={event => { const index = Number(event.target.value); setSelectedItemIndex(index); setFormData(previous => ({ ...previous, serialNumber: serialNumbers[index] || '' })); }} className="w-full bg-white border border-purple-200 rounded-xl p-2 text-slate-900 font-semibold">
                    {serialNumbers.map((serial, index) => <option key={index} value={index}>{index + 1} / {serialNumbers.length}{serial ? ` — ${serial}` : ' — serial needed'}</option>)}
                  </select>
                </div>}

                <div className="space-y-1 text-xs">
                  <label className="font-bold text-slate-700 block">Serial Number *</label>
                  <input
                    type="text"
                    required
                    value={serialNumbers[selectedItemIndex] || ''}
                    onChange={(e) => updateSerialNumber(e.target.value)}
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
                    <label className="font-bold text-slate-700 block mb-1">Company</label>
                    <select
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold focus:border-[#6C2BD9] outline-none"
                    >
                      <option value="">Select Company (Optional)</option>
                      <option value="Dubai HQ">Dubai HQ</option>
                      <option value="Abu Dhabi Branch">Abu Dhabi Branch</option>
                      <option value="Sharjah Hub">Sharjah Hub</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Business Unit</label>
                    <select
                      value={formData.businessUnit}
                      onChange={(e) => setFormData({ ...formData, businessUnit: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold focus:border-[#6C2BD9] outline-none"
                    >
                      <option value="">Select Business Unit (Optional)</option>
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
                      <option value="">Select Department (Optional)</option>
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
                      <option value="">Select Cost Center (Optional)</option>
                      {costCenters.map(cc => (
                        <option key={cc.id} value={cc.code || cc.name}>{cc.code} - {cc.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Site</label>
                    <select
                      value={formData.site}
                      onChange={(e) => setFormData({ ...formData, site: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold focus:border-[#6C2BD9] outline-none"
                    >
                      <option value="">Select Site (Optional)</option>
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
                      <option value="">Select Building (Optional)</option>
                      <option value="Building A">Building A</option>
                      <option value="Building B">Building B</option>
                      <option value="Headquarters Tower">Headquarters Tower</option>
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
                      <option value="">Select Floor (Optional)</option>
                      <option value="Floor 1">Floor 1</option>
                      <option value="Floor 2">Floor 2</option>
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
                      <option value="">Select Room (Optional)</option>
                      <option value="Room 101">Room 101</option>
                      <option value="Room 205">Room 205</option>
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
                      <option value="">Select Zone (Optional)</option>
                      <option value="Office Zone">Office Zone</option>
                      <option value="Warehouse Zone">Warehouse Zone</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Storage Area</label>
                    <select
                      value={formData.storageArea}
                      onChange={(e) => setFormData({ ...formData, storageArea: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold focus:border-[#6C2BD9] outline-none"
                    >
                      <option value="">Select Storage Area (Optional)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Custodian / Owner</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.custodian}
                        placeholder="e.g. EMP-1002 or Full Name (optional)"
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
                      <p className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold text-[11px]">Straight Line (Category Policy)</p>
                    </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Useful Life (Years)</label>
                      <p className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-bold text-[11px]">{(categoryUsefulLifeMonths / 12).toFixed(1)}</p>
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <label className="font-bold text-slate-700 block">Residual Value</label>
                  <p className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-mono font-bold text-[11px]">{categoryResidualPercent}% of acquisition value</p>
                </div>
                {renderCategoryDepreciation()}
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
                      onChange={(e) => updateWarranty({ warrantyStartDate: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold focus:border-[#6C2BD9] outline-none text-[11px]"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Warranty (years)</label>
                    <input type="number" min="1" max="50" step="1" value={formData.warrantyYears} onChange={(e) => updateWarranty({ warrantyYears: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold" />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">End Date</label>
                    <input
                      type="date"
                      value={formData.warrantyEndDate}
                      readOnly
                      className="w-full bg-slate-100 border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold text-[11px]"
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

                {formData.enablePm && renderPreventiveMaintenanceFields(true)}
              </div>
            </div>

            {/* PANEL 8: ((o)) 8. Auto Discovery ⓘ */}
            {quantityCount > 1 ? <div className="lg:col-span-4">{renderBatchDiscovery()}</div> : <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3 flex flex-col justify-between">
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
                    onClick={() => setFormData(prev => ({ ...prev, linkToDiscovered: !prev.linkToDiscovered, discoveryId: !prev.linkToDiscovered ? prev.discoveryId : '', matchedDiscovery: false }))}
                    className={`w-10 h-5 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                      formData.linkToDiscovered ? 'bg-[#6C2BD9] justify-end' : 'bg-slate-300 justify-start'
                    }`}
                  >
                    <div className="w-3.5 h-3.5 rounded-full bg-white shadow-md" />
                  </button>
                </div>

                <div className="space-y-1 text-xs">
                  {formData.linkToDiscovered && <label className="font-bold text-slate-700 block">Discovered Device
                    <select value={formData.discoveryId} onChange={e => selectDiscoveredDevice(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900">
                      <option value="">{loadingDevices ? 'Loading devices…' : 'Select device'}</option>
                      {discoveredDevices.map(device => <option key={device.id} value={device.id}>{[device.hostname, device.ipAddress, device.serialNumber].filter(Boolean).join(' · ') || device.id}</option>)}
                    </select>
                  </label>}
                  <label className="font-bold text-slate-700 block">Discovery Source</label>
                  <select
                    value={formData.discoverySource}
                    onChange={(e) => setFormData({ ...formData, discoverySource: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold focus:border-[#6C2BD9] outline-none"
                  >
                    <option value="">Manual entry</option><option value="Network Scan">Network Scan</option><option value="MANUAL_ENTRY">Manual entry</option>
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
                {formData.discoveryId && <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-bold text-emerald-800 text-[11px] block leading-tight">Discovered device selected</span>
                    <span className="text-[9px] text-emerald-700 block leading-tight">It will be linked after saving the asset.</span>
                  </div>
                </div>}
              </div>
            </div>}

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
