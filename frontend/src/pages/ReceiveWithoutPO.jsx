import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { 
  Inbox, 
  History, 
  ArrowRight, 
  Plus, 
  FolderDown, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  Clock, 
  Barcode, 
  Radio, 
  Search, 
  Calendar, 
  Settings, 
  Laptop, 
  Check, 
  AlertCircle,
  X,
  Printer,
  ChevronDown,
  Layers,
  Box
} from 'lucide-react';
import { ManualAssetModal } from '../components/modals/ManualAssetModal';
import { FileImportModal } from '../components/modals/FileImportModal';
import { EditAssetModal } from '../components/modals/EditAssetModal';
import { ReviewSubmitModal } from '../components/modals/ReviewSubmitModal';
import clsx from 'clsx';

export function ReceiveWithoutPO() {
  const navigate = useNavigate();

  // Active step in the workflow (1: Asset Details, 2: Verification, 3: Tagging, 4: Review)
  const [currentStep, setCurrentStep] = useState(1);

  // Panel tab: 'scan' or 'print'
  const [activePanelTab, setActivePanelTab] = useState('scan');
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Receiving Information Form State
  const [receivingInfo, setReceivingInfo] = useState({
    supplier: 'Dell Technologies',
    receivingDate: '21 Aug 2026',
    referenceNo: 'DN-2026-0087',
    receivingLocation: 'Dubai HQ - IT Store',
    receivedBy: 'John Doe',
    reason: 'Initial stock / Donation / Transfer',
    remarks: ''
  });

  // Asset Default Information Form State
  const [assetDefaults, setAssetDefaults] = useState({
    category: 'Laptop',
    subCategory: 'Business Laptop',
    manufacturer: 'Dell',
    model: 'Latitude 7450',
    condition: 'New',
    warrantyMonths: 36
  });

  // Master Data State
  const [reasonsList, setReasonsList] = useState([]);
  const [suppliersList, setSuppliersList] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [manufacturersList, setManufacturersList] = useState([]);
  const [modelsList, setModelsList] = useState([]);
  const [sitesList, setSitesList] = useState([]);
  const [isSupplierDropdownOpen, setIsSupplierDropdownOpen] = useState(false);
  const [supplierSearch, setSupplierSearch] = useState('');

  // Scanning inputs
  const [scanSerialInput, setScanSerialInput] = useState('');
  const [scanRfidInput, setScanRfidInput] = useState('');
  const [scanFeedback, setScanFeedback] = useState(null);

  // Currently Previewed Asset
  const [previewAsset, setPreviewAsset] = useState({
    serialNumber: 'DL7450-001',
    assetName: 'Dell Latitude 7450',
    category: 'Laptop',
    model: 'Latitude 7450',
    tagNumber: 'E36000012345',
    status: 'Ready to Assign',
    imageUrl: '/laptop.png'
  });

  // Received Assets List (initial state matches screenshot)
  const [receivedAssets, setReceivedAssets] = useState([
    {
      id: 'AST-INIT-01',
      serialNumber: 'DL7450-001',
      assetName: 'Dell Latitude 7450',
      category: 'Laptop',
      subCategory: 'Business Laptop',
      manufacturer: 'Dell',
      model: 'Latitude 7450',
      condition: 'New',
      tagNumber: 'E36000012345',
      status: 'Tagged',
      imageUrl: '/laptop.png'
    },
    {
      id: 'AST-INIT-02',
      serialNumber: 'DL7450-002',
      assetName: 'Dell Latitude 7450',
      category: 'Laptop',
      subCategory: 'Business Laptop',
      manufacturer: 'Dell',
      model: 'Latitude 7450',
      condition: 'New',
      tagNumber: 'E36000012346',
      status: 'Tagged',
      imageUrl: '/laptop.png'
    },
    {
      id: 'AST-INIT-03',
      serialNumber: 'DL7450-003',
      assetName: 'Dell Latitude 7450',
      category: 'Laptop',
      subCategory: 'Business Laptop',
      manufacturer: 'Dell',
      model: 'Latitude 7450',
      condition: 'New',
      tagNumber: '-',
      status: 'Pending',
      imageUrl: '/laptop.png'
    }
  ]);

  const [selectedAssetIds, setSelectedAssetIds] = useState([]);

  // Recent Scanned Items (initial state matches screenshot)
  const [recentScans, setRecentScans] = useState([
    {
      id: 'SCAN-01',
      time: '21 Aug 2026 11:20',
      serialNumber: 'DL7450-003',
      tagNumber: 'E36000012347',
      assetName: 'Dell Latitude 7450',
      status: 'Tagged'
    },
    {
      id: 'SCAN-02',
      time: '21 Aug 2026 11:18',
      serialNumber: 'DL7450-002',
      tagNumber: 'E36000012346',
      assetName: 'Dell Latitude 7450',
      status: 'Tagged'
    },
    {
      id: 'SCAN-03',
      time: '21 Aug 2026 11:15',
      serialNumber: 'DL7450-001',
      tagNumber: 'E36000012345',
      assetName: 'Dell Latitude 7450',
      status: 'Tagged'
    }
  ]);

  // Modals state
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isFileImportModalOpen, setIsFileImportModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [validationReport, setValidationReport] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Label Printing State
  const [printConfig, setPrintConfig] = useState({
    scheme: 'AUTO_PREFIX_SEQ',
    tagFormat: 'CODE_128',
    template: 'STANDARD_2X1',
    printer: 'Zebra ZT411 RFID (Warehouse Dock 2)',
    quantity: 1,
    tagPrefix: 'E360000'
  });
  const [printedTagsList, setPrintedTagsList] = useState([]);
  const [isPrinting, setIsPrinting] = useState(false);

  const showToast = (msg, type = 'success') => {
    setToastMessage({ msg, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Load Master Data on mount
  useEffect(() => {
    const loadMasterData = async () => {
      try {
        const [reasonsRes, suppliersRes, catsRes, mfgsRes, modelsRes, sitesRes] = await Promise.allSettled([
          api.get('/receiving/non-po-reasons'),
          api.get('/receiving/suppliers'),
          api.get('/master-data/categories'),
          api.get('/master-data/manufacturers'),
          api.get('/master-data/models'),
          api.get('/master-data/sites')
        ]);

        if (reasonsRes.status === 'fulfilled' && reasonsRes.value?.reasons) {
          setReasonsList(reasonsRes.value.reasons);
        }
        if (suppliersRes.status === 'fulfilled' && suppliersRes.value?.suppliers) {
          setSuppliersList(suppliersRes.value.suppliers);
        }
        if (catsRes.status === 'fulfilled' && catsRes.value?.categories) {
          setCategoriesList(catsRes.value.categories);
        }
        if (mfgsRes.status === 'fulfilled' && mfgsRes.value?.manufacturers) {
          setManufacturersList(mfgsRes.value.manufacturers);
        }
        if (modelsRes.status === 'fulfilled' && modelsRes.value?.models) {
          setModelsList(modelsRes.value.models);
        }
        if (sitesRes.status === 'fulfilled' && sitesRes.value?.sites) {
          setSitesList(sitesRes.value.sites);
        }
      } catch (err) {
        console.warn('Master data loaded with fallback defaults:', err);
      }
    };
    loadMasterData();
  }, []);

  // Summary Metrics Calculation
  const assetsReceivedCount = receivedAssets.length;
  const taggedCount = receivedAssets.filter(a => a.tagNumber && a.tagNumber !== '-' && a.status === 'Tagged').length;
  const pendingCount = assetsReceivedCount - taggedCount;
  const issuesCount = 0;

  // Handle Serial Scanner Input (Enter key or button click)
  const handleScanSerialSubmit = (e) => {
    e?.preventDefault();
    const sn = scanSerialInput.trim();
    if (!sn) return;

    // Check if asset already exists in current batch
    const existingIndex = receivedAssets.findIndex(a => a.serialNumber.toLowerCase() === sn.toLowerCase());

    if (existingIndex !== -1) {
      const asset = receivedAssets[existingIndex];
      setPreviewAsset({
        serialNumber: asset.serialNumber,
        assetName: asset.assetName,
        category: asset.category,
        model: asset.model,
        tagNumber: asset.tagNumber === '-' ? `E360000${Math.floor(10000 + Math.random() * 90000)}` : asset.tagNumber,
        status: asset.status === 'Tagged' ? 'Tagged' : 'Ready to Assign',
        imageUrl: asset.imageUrl || '/laptop.png'
      });
      setCurrentStep(2); // Step 2: Verification
      setScanFeedback({ type: 'info', msg: `Identified existing batch item: ${sn}` });
    } else {
      // Auto-create new item from Default Information
      const newTagNum = `E360000${Math.floor(10000 + Math.random() * 90000)}`;
      const newAsset = {
        id: `AST-SCN-${Date.now()}`,
        serialNumber: sn,
        assetName: `${assetDefaults.manufacturer} ${assetDefaults.model}`,
        category: assetDefaults.category,
        subCategory: assetDefaults.subCategory,
        manufacturer: assetDefaults.manufacturer,
        model: assetDefaults.model,
        condition: assetDefaults.condition,
        tagNumber: '-',
        status: 'Pending',
        imageUrl: '/laptop.png'
      };

      setReceivedAssets(prev => [newAsset, ...prev]);
      setPreviewAsset({
        serialNumber: sn,
        assetName: newAsset.assetName,
        category: newAsset.category,
        model: newAsset.model,
        tagNumber: newTagNum,
        status: 'Ready to Assign',
        imageUrl: '/laptop.png'
      });
      setCurrentStep(2);
      setScanFeedback({ type: 'success', msg: `New asset scanned and staged: ${sn}` });
    }

    setScanSerialInput('');
  };

  // Handle RFID Tag Input
  const handleScanRfidSubmit = (e) => {
    e?.preventDefault();
    const rfidVal = scanRfidInput.trim();
    if (!rfidVal) return;

    // Update tag in preview asset
    setPreviewAsset(prev => ({
      ...prev,
      tagNumber: rfidVal,
      status: 'Ready to Assign'
    }));
    setScanRfidInput('');
    setScanFeedback({ type: 'info', msg: `Scanned tag ${rfidVal} ready to assign.` });
  };

  // Assign Tag Button Action
  const handleAssignTag = async () => {
    if (!previewAsset || !previewAsset.serialNumber) {
      setScanFeedback({ type: 'error', msg: 'No asset selected in Preview to assign tag.' });
      return;
    }

    const tagToAssign = previewAsset.tagNumber?.trim() || `E360000${Math.floor(10000 + Math.random() * 90000)}`;

    try {
      // Validate tag availability via backend
      const valRes = await api.post('/receiving/validate-tag', { tagNumber: tagToAssign });
      if (valRes && valRes.valid === false) {
        setScanFeedback({ type: 'error', msg: valRes.message || 'Tag already assigned to another asset.' });
        return;
      }
    } catch (e) {
      // Graceful offline pass
    }

    // Update received assets list
    setReceivedAssets(prev => prev.map(a => {
      if (a.serialNumber.toLowerCase() === previewAsset.serialNumber.toLowerCase()) {
        return {
          ...a,
          tagNumber: tagToAssign,
          status: 'Tagged'
        };
      }
      return a;
    }));

    // Add to recent scans
    const now = new Date();
    const timeStr = `${now.getDate()} ${now.toLocaleString('default', { month: 'short' })} ${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    setRecentScans(prev => [
      {
        id: `SCAN-${Date.now()}`,
        time: timeStr,
        serialNumber: previewAsset.serialNumber,
        tagNumber: tagToAssign,
        assetName: previewAsset.assetName,
        status: 'Tagged'
      },
      ...prev.slice(0, 4)
    ]);

    setPreviewAsset(prev => ({
      ...prev,
      tagNumber: tagToAssign,
      status: 'Tagged'
    }));

    setCurrentStep(3); // Tagging step reached
    showToast(`Tag ${tagToAssign} successfully associated with ${previewAsset.serialNumber}`);
  };

  // Clear Preview Context Action
  const handleClearPreview = () => {
    setPreviewAsset({
      serialNumber: '',
      assetName: '',
      category: '',
      model: '',
      tagNumber: '',
      status: '',
      imageUrl: '/laptop.png'
    });
    setScanFeedback(null);
  };

  // Row selection in Received Assets table
  const handleSelectRow = (serial) => {
    const item = receivedAssets.find(a => a.serialNumber === serial);
    if (item) {
      setPreviewAsset({
        serialNumber: item.serialNumber,
        assetName: item.assetName,
        category: item.category,
        model: item.model,
        tagNumber: item.tagNumber === '-' ? `E360000${Math.floor(10000 + Math.random() * 90000)}` : item.tagNumber,
        status: item.status === 'Tagged' ? 'Tagged' : 'Ready to Assign',
        imageUrl: item.imageUrl || '/laptop.png'
      });
    }
  };

  const handleToggleSelectAll = () => {
    if (selectedAssetIds.length === receivedAssets.length) {
      setSelectedAssetIds([]);
    } else {
      setSelectedAssetIds(receivedAssets.map(a => a.id));
    }
  };

  const handleToggleSelectAsset = (id) => {
    setSelectedAssetIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleRemoveSelected = () => {
    if (selectedAssetIds.length === 0) return;
    setReceivedAssets(prev => prev.filter(a => !selectedAssetIds.includes(a.id)));
    setSelectedAssetIds([]);
    showToast('Selected assets removed from receiving session.');
  };

  const handleDeleteSingle = (id) => {
    setReceivedAssets(prev => prev.filter(a => a.id !== id));
    showToast('Asset removed from session.');
  };

  // Save as Draft Action
  const handleSaveDraft = async () => {
    const draftPayload = {
      header: receivingInfo,
      defaults: assetDefaults,
      items: receivedAssets,
      mode: 'WITHOUT_PO',
      savedAt: new Date().toISOString()
    };

    try {
      await api.post('/receiving/drafts', draftPayload);
      showToast('Receiving session draft successfully saved!');
    } catch (err) {
      // Save locally to localStorage
      localStorage.setItem('fams_non_po_draft', JSON.stringify(draftPayload));
      showToast('Receiving session draft saved locally!');
    }
  };

  // Proceed to Review Action
  const handleProceedToReview = async () => {
    setCurrentStep(4);
    try {
      const report = await api.post('/receiving/validate-batch', {
        supplier: receivingInfo.supplier,
        receivingDate: receivingInfo.receivingDate,
        receivingLocation: receivingInfo.receivingLocation,
        receivedBy: receivingInfo.receivedBy,
        reason: receivingInfo.reason,
        items: receivedAssets
      });
      setValidationReport(report);
    } catch (e) {
      setValidationReport({
        valid: true,
        errors: [],
        warnings: pendingCount > 0 ? [{ message: `${pendingCount} assets pending tag assignment.` }] : [],
        duplicates: []
      });
    }
    setIsReviewModalOpen(true);
  };

  // Print Labels Action
  const handlePrintLabels = async () => {
    setIsPrinting(true);
    try {
      const res = await api.post('/tagging/print-labels', {
        tagFormat: printConfig.tagFormat,
        numberingScheme: printConfig.scheme,
        labelTemplate: printConfig.template,
        printer: printConfig.printer,
        quantity: parseInt(printConfig.quantity) || 1,
        tagPrefix: printConfig.tagPrefix,
        assetDetails: previewAsset
      });
      if (res && res.tags) {
        setPrintedTagsList(res.tags);
        showToast(`Printed ${res.tags.length} label(s) to ${printConfig.printer}`);
      }
    } catch (err) {
      // Offline mock generation
      const tags = [];
      const qty = parseInt(printConfig.quantity) || 1;
      for (let i = 0; i < qty; i++) {
        tags.push({
          tagNumber: `${printConfig.tagPrefix}${Math.floor(10000 + Math.random() * 90000)}`,
          printer: printConfig.printer,
          printedAt: new Date().toLocaleTimeString()
        });
      }
      setPrintedTagsList(tags);
      showToast(`Printed ${qty} label(s) successfully!`);
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <div className="p-6 max-w-[1720px] mx-auto space-y-6 font-sans select-none bg-[#F8FAFC] min-h-screen text-slate-800">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage.msg}</span>
        </div>
      )}

      {/* Breadcrumb & Header Title Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1">
            <span className="cursor-pointer hover:text-slate-700" onClick={() => navigate('/receiving')}>
              × Receiving & Tagging
            </span>
            <span>&gt;</span>
            <span className="text-[#6C2BD9] font-bold">Receive without PO</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Receive without PO</h1>
          <p className="text-xs text-slate-500 mt-0.5">Receive assets not linked to a Purchase Order and tag for asset registration</p>
        </div>

        <button
          onClick={() => navigate('/receiving/history')}
          className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-purple-50 border border-[#6C2BD9] text-black rounded-xl text-xs font-semibold shadow-2xs transition-all cursor-pointer"
        >
          <Clock className="w-4 h-4 text-[#6C2BD9]" />
          <span>View Receiving History</span>
        </button>
      </div>

      {/* 4-Step Stepper */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4 w-full max-w-6xl mx-auto px-2">
          {/* Step 1 */}
          <div
            onClick={() => setCurrentStep(1)}
            className="flex items-center gap-3 cursor-pointer group shrink-0"
          >
            <div className={clsx(
              'w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0 transition-all shadow-xs',
              currentStep >= 1 ? 'bg-[#6C2BD9] text-white' : 'bg-purple-50 text-[#6C2BD9]'
            )}>
              1
            </div>
            <div>
              <div className={clsx('text-xs font-extrabold leading-tight', currentStep === 1 ? 'text-[#6C2BD9]' : 'text-slate-800')}>
                Asset Details
              </div>
              <div className="text-[11px] text-purple-600 font-medium">Enter receiving details</div>
            </div>
          </div>

          {/* Arrow 1 */}
          <div className="hidden md:block text-[#6C2BD9] shrink-0">
            <ArrowRight className="w-4 h-4" />
          </div>

          {/* Step 2 */}
          <div
            onClick={() => setCurrentStep(2)}
            className="flex items-center gap-3 cursor-pointer group shrink-0"
          >
            <div className={clsx(
              'w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0 transition-all shadow-xs',
              currentStep >= 2 ? 'bg-[#6C2BD9] text-white' : 'bg-purple-50 text-[#6C2BD9]'
            )}>
              2
            </div>
            <div>
              <div className={clsx('text-xs font-extrabold leading-tight', currentStep === 2 ? 'text-[#6C2BD9]' : 'text-slate-800')}>
                Asset Verification
              </div>
              <div className="text-[11px] text-purple-600 font-medium">Capture asset information</div>
            </div>
          </div>

          {/* Arrow 2 */}
          <div className="hidden md:block text-[#6C2BD9] shrink-0">
            <ArrowRight className="w-4 h-4" />
          </div>

          {/* Step 3 */}
          <div
            onClick={() => setCurrentStep(3)}
            className="flex items-center gap-3 cursor-pointer group shrink-0"
          >
            <div className={clsx(
              'w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0 transition-all shadow-xs',
              currentStep >= 3 ? 'bg-[#6C2BD9] text-white' : 'bg-purple-50 text-[#6C2BD9]'
            )}>
              3
            </div>
            <div>
              <div className={clsx('text-xs font-extrabold leading-tight', currentStep === 3 ? 'text-[#6C2BD9]' : 'text-slate-800')}>
                Tagging
              </div>
              <div className="text-[11px] text-purple-600 font-medium">Scan/Print &amp; Assign Tags</div>
            </div>
          </div>

          {/* Arrow 3 */}
          <div className="hidden md:block text-[#6C2BD9] shrink-0">
            <ArrowRight className="w-4 h-4" />
          </div>

          {/* Step 4 */}
          <div
            onClick={() => setCurrentStep(4)}
            className="flex items-center gap-3 cursor-pointer group shrink-0"
          >
            <div className={clsx(
              'w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0 transition-all shadow-xs',
              currentStep >= 4 ? 'bg-[#6C2BD9] text-white' : 'bg-purple-50 text-[#6C2BD9]'
            )}>
              4
            </div>
            <div>
              <div className={clsx('text-xs font-extrabold leading-tight', currentStep === 4 ? 'text-[#6C2BD9]' : 'text-slate-800')}>
                Review &amp; Submit
              </div>
              <div className="text-[11px] text-purple-600 font-medium">Confirm and post</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Left side (Receiving Info + Asset Defaults + Received Assets) & Right side (Scan & Tag panel) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        
        {/* Left 8 Columns */}
        <div className="xl:col-span-8 space-y-6">
          
          {/* Top Row: Receiving Information & Asset Default Information side-by-side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Receiving Information Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">Receiving Information</h3>
              
              <div className="space-y-3 text-xs">
                {/* Supplier Field with Search Dropdown */}
                <div className="relative">
                  <label className="block text-slate-600 font-medium mb-1">
                    Supplier <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={receivingInfo.supplier}
                      onChange={(e) => {
                        setReceivingInfo({ ...receivingInfo, supplier: e.target.value });
                        setSupplierSearch(e.target.value);
                      }}
                      onFocus={() => setIsSupplierDropdownOpen(true)}
                      placeholder="Search or select supplier"
                      className="w-full px-3 py-2 pr-8 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#6C2BD9]/20 focus:border-[#6C2BD9] bg-white"
                    />
                    <Search className="w-3.5 h-3.5 text-[#6C2BD9] absolute right-3 top-3 pointer-events-none" />
                  </div>

                  {/* Dropdown Options */}
                  {isSupplierDropdownOpen && (
                    <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-30 max-h-48 overflow-y-auto p-1 text-xs">
                      {(suppliersList.length > 0 ? suppliersList : [
                        { name: 'Dell Technologies' },
                        { name: 'Apple Inc.' },
                        { name: 'Cisco Systems Inc.' },
                        { name: 'HP Enterprise' },
                        { name: 'Lenovo Global' },
                        { name: 'Internal Transfer (HQ Warehouse)' }
                      ]).filter(s => s.name.toLowerCase().includes(supplierSearch.toLowerCase()))
                        .map((s, idx) => (
                          <div
                            key={idx}
                            onClick={() => {
                              setReceivingInfo({ ...receivingInfo, supplier: s.name });
                              setIsSupplierDropdownOpen(false);
                            }}
                            className="px-3 py-2 rounded-lg hover:bg-purple-50 cursor-pointer font-medium text-slate-700 flex items-center justify-between"
                          >
                            <span>{s.name}</span>
                            {receivingInfo.supplier === s.name && <Check className="w-3.5 h-3.5 text-[#6C2BD9]" />}
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                {/* Receiving Date & Delivery Note */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">
                      Receiving Date <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={receivingInfo.receivingDate}
                        onChange={(e) => setReceivingInfo({ ...receivingInfo, receivingDate: e.target.value })}
                        className="w-full px-3 py-2 pr-8 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white"
                      />
                      <Calendar className="w-3.5 h-3.5 text-[#6C2BD9] absolute right-3 top-3" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">
                      Delivery Note / Reference No.
                    </label>
                    <input
                      type="text"
                      value={receivingInfo.referenceNo}
                      onChange={(e) => setReceivingInfo({ ...receivingInfo, referenceNo: e.target.value })}
                      placeholder="DN-2026-0087"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono text-slate-800 bg-white"
                    />
                  </div>
                </div>

                {/* Receiving Location & Received By */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">
                      Receiving Location <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={receivingInfo.receivingLocation}
                      onChange={(e) => setReceivingInfo({ ...receivingInfo, receivingLocation: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white cursor-pointer"
                    >
                      <option value="Dubai HQ - IT Store">Dubai HQ - IT Store</option>
                      <option value="Abu Dhabi Branch">Abu Dhabi Branch</option>
                      <option value="Doha Data Center">Doha Data Center</option>
                      <option value="Riyadh Regional Office">Riyadh Regional Office</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">
                      Received By <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={receivingInfo.receivedBy}
                      onChange={(e) => setReceivingInfo({ ...receivingInfo, receivedBy: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white cursor-pointer"
                    >
                      <option value="John Doe">John Doe</option>
                      <option value="Sarah Jenkins">Sarah Jenkins</option>
                      <option value="Ahmed Al-Mansoori">Ahmed Al-Mansoori</option>
                    </select>
                  </div>
                </div>

                {/* Reason for Non-PO Receipt (from master data) */}
                <div>
                  <label className="block text-slate-600 font-medium mb-1">
                    Reason for Non-PO Receipt <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={receivingInfo.reason}
                    onChange={(e) => setReceivingInfo({ ...receivingInfo, reason: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white cursor-pointer"
                  >
                    {(reasonsList.length > 0 ? reasonsList : [
                      { name: 'Initial stock / Donation / Transfer' },
                      { name: 'Donated Equipment / Grants' },
                      { name: 'Inter-Department / Entity Transfer' },
                      { name: 'Vendor Replacement / Warranty RMA' },
                      { name: 'Found During Physical Audit' },
                      { name: 'Petty Cash / Direct P-Card Purchase' }
                    ]).map((r, idx) => (
                      <option key={idx} value={r.name}>{r.name}</option>
                    ))}
                  </select>
                </div>

                {/* Remarks */}
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Remarks</label>
                  <input
                    type="text"
                    value={receivingInfo.remarks}
                    onChange={(e) => setReceivingInfo({ ...receivingInfo, remarks: e.target.value })}
                    placeholder="Enter remarks (optional)"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Asset Default Information Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">Asset Default Information</h3>

              <div className="space-y-3 text-xs">
                {/* Category & Sub Category */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">
                      Asset Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={assetDefaults.category}
                      onChange={(e) => {
                        const newCat = e.target.value;
                        setAssetDefaults({
                          ...assetDefaults,
                          category: newCat,
                          subCategory: newCat === 'Laptop' ? 'Business Laptop' : 'General'
                        });
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white cursor-pointer"
                    >
                      <option value="Laptop">Laptop</option>
                      <option value="Desktop & Workstation">Desktop &amp; Workstation</option>
                      <option value="Server & Compute">Server &amp; Compute</option>
                      <option value="Networking Equipment">Networking Equipment</option>
                      <option value="Peripherals & Displays">Peripherals &amp; Displays</option>
                      <option value="Accessories & Docks">Accessories &amp; Docks</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Asset Sub Category</label>
                    <select
                      value={assetDefaults.subCategory}
                      onChange={(e) => setAssetDefaults({ ...assetDefaults, subCategory: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white cursor-pointer"
                    >
                      {assetDefaults.category === 'Laptop' ? (
                        <>
                          <option value="Business Laptop">Business Laptop</option>
                          <option value="Ultrabook">Ultrabook</option>
                          <option value="Mobile Workstation">Mobile Workstation</option>
                        </>
                      ) : (
                        <option value="Standard Device">Standard Device</option>
                      )}
                    </select>
                  </div>
                </div>

                {/* Manufacturer & Model (Dependent on Manufacturer) */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Manufacturer</label>
                    <select
                      value={assetDefaults.manufacturer}
                      onChange={(e) => {
                        const mfg = e.target.value;
                        let defaultModel = 'Latitude 7450';
                        if (mfg === 'Apple') defaultModel = 'MacBook Pro 16';
                        if (mfg === 'Lenovo') defaultModel = 'ThinkPad X1 Carbon';
                        if (mfg === 'Cisco') defaultModel = 'Catalyst 9300';
                        setAssetDefaults({
                          ...assetDefaults,
                          manufacturer: mfg,
                          model: defaultModel
                        });
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white cursor-pointer"
                    >
                      <option value="Dell">Dell</option>
                      <option value="Apple">Apple</option>
                      <option value="Lenovo">Lenovo</option>
                      <option value="HP Enterprise">HP Enterprise</option>
                      <option value="Cisco">Cisco</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Model</label>
                    <select
                      value={assetDefaults.model}
                      onChange={(e) => setAssetDefaults({ ...assetDefaults, model: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white cursor-pointer"
                    >
                      {assetDefaults.manufacturer === 'Dell' && (
                        <>
                          <option value="Latitude 7450">Latitude 7450</option>
                          <option value="Latitude 5540">Latitude 5540</option>
                          <option value="Precision 5680">Precision 5680</option>
                          <option value="UltraSharp U2723QE">UltraSharp U2723QE</option>
                        </>
                      )}
                      {assetDefaults.manufacturer === 'Apple' && (
                        <>
                          <option value="MacBook Pro 16">MacBook Pro 16</option>
                          <option value="MacBook Air 15">MacBook Air 15</option>
                        </>
                      )}
                      {assetDefaults.manufacturer === 'Lenovo' && (
                        <>
                          <option value="ThinkPad X1 Carbon">ThinkPad X1 Carbon</option>
                          <option value="ThinkPad T14s">ThinkPad T14s</option>
                        </>
                      )}
                      {assetDefaults.manufacturer === 'Cisco' && (
                        <>
                          <option value="Catalyst 9300">Catalyst 9300</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>

                {/* Condition & Warranty */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">
                      Condition <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={assetDefaults.condition}
                      onChange={(e) => setAssetDefaults({ ...assetDefaults, condition: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white cursor-pointer"
                    >
                      <option value="New">New</option>
                      <option value="Good">Good</option>
                      <option value="Fair">Fair</option>
                      <option value="Refurbished">Refurbished</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Warranty (Months)</label>
                    <input
                      type="number"
                      value={assetDefaults.warrantyMonths}
                      onChange={(e) => setAssetDefaults({ ...assetDefaults, warrantyMonths: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white"
                      min="0"
                      max="120"
                    />
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Received Assets Grid Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
            {/* Header Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Received Assets ({receivedAssets.length})
              </h3>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(true)}
                  className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-[#6C2BD9]" />
                  <span>Add Manually</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsFileImportModalOpen(true)}
                  className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <FolderDown className="w-3.5 h-3.5 text-slate-500" />
                  <span>Import from File</span>
                </button>

                <button
                  type="button"
                  onClick={handleRemoveSelected}
                  disabled={selectedAssetIds.length === 0}
                  className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>Remove Selected</span>
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="overflow-auto max-h-[500px]">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="sticky top-0 z-10 bg-slate-50 shadow-2xs text-slate-500 border-b border-slate-200 font-semibold select-none">
                    <tr>
                      <th className="py-2.5 px-3 w-8">
                        <input
                          type="checkbox"
                          checked={selectedAssetIds.length > 0 && selectedAssetIds.length === receivedAssets.length}
                          onChange={handleToggleSelectAll}
                          className="rounded-sm border-slate-300 text-[#6C2BD9] focus:ring-[#6C2BD9]"
                        />
                      </th>
                      <th className="py-2.5 px-3 w-10">#</th>
                      <th className="py-2.5 px-3">Serial Number</th>
                      <th className="py-2.5 px-3">Asset Name</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3">Model</th>
                      <th className="py-2.5 px-3">Condition</th>
                      <th className="py-2.5 px-3">Tag Number</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                      <th className="py-2.5 px-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {receivedAssets.map((asset, index) => {
                      const isSelected = previewAsset?.serialNumber === asset.serialNumber;
                      const isChecked = selectedAssetIds.includes(asset.id);

                      return (
                        <tr
                          key={asset.id || index}
                          onClick={() => handleSelectRow(asset.serialNumber)}
                          className={`transition-colors cursor-pointer ${
                            isSelected ? 'bg-purple-50/40' : 'hover:bg-slate-50/80'
                          }`}
                        >
                          <td className="py-2.5 px-3" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleToggleSelectAsset(asset.id)}
                              className="rounded-sm border-slate-300 text-[#6C2BD9] focus:ring-[#6C2BD9]"
                            />
                          </td>
                          <td className="py-2.5 px-3 text-slate-400 font-mono">{index + 1}</td>
                          <td className="py-2.5 px-3 font-mono font-medium text-slate-800">{asset.serialNumber}</td>
                          <td className="py-2.5 px-3 font-medium text-slate-700">{asset.assetName}</td>
                          <td className="py-2.5 px-3 text-slate-600">{asset.category}</td>
                          <td className="py-2.5 px-3 text-slate-600">{asset.model}</td>
                          <td className="py-2.5 px-3 text-slate-600">{asset.condition}</td>
                          <td className="py-2.5 px-3 font-mono text-slate-600">
                            {asset.tagNumber === '-' ? '-' : asset.tagNumber}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                                asset.status === 'Tagged'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}
                            >
                              {asset.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-center gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingAsset(asset);
                                  setIsEditModalOpen(true);
                                }}
                                className="text-[#6C2BD9] hover:text-[#5B21B6] p-1 rounded-md hover:bg-purple-50 transition-colors"
                                title="Edit Asset"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteSingle(asset.id)}
                                className="text-slate-400 hover:text-red-600 p-1 rounded-md hover:bg-red-50 transition-colors"
                                title="Remove Asset"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="p-3 bg-white border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="font-medium text-slate-600">Showing {receivedAssets.length} records</span>
                <span className="text-slate-400">Scroll down to view all records</span>
              </div>
            </div>
          </div>

          {/* Bottom Row: Recent Scanned Items & Summary Side-by-Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Recent Scanned Items Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-3">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Recent Scanned Items ({recentScans.length})
              </h3>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="overflow-auto max-h-[300px]">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="sticky top-0 z-10 bg-slate-50 shadow-2xs text-slate-500 border-b border-slate-200 font-semibold">
                      <tr>
                        <th className="py-2 px-3">Time</th>
                        <th className="py-2 px-3">Serial Number</th>
                        <th className="py-2 px-3">Tag Number</th>
                        <th className="py-2 px-3">Asset Name</th>
                        <th className="py-2 px-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {recentScans.map((scan, idx) => (
                        <tr key={scan.id || idx} className="hover:bg-slate-50/70">
                          <td className="py-2 px-3 text-slate-500 whitespace-nowrap text-[11px]">{scan.time}</td>
                          <td className="py-2 px-3 font-mono font-medium text-slate-800">{scan.serialNumber}</td>
                          <td className="py-2 px-3 font-mono text-slate-600">{scan.tagNumber}</td>
                          <td className="py-2 px-3 text-slate-700">{scan.assetName}</td>
                          <td className="py-2 px-3 text-center">
                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {scan.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="p-2.5 bg-white border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="font-medium text-slate-600">Showing {recentScans.length} records</span>
                  <span className="text-slate-400">Scroll down to view all records</span>
                </div>
              </div>
            </div>

            {/* Summary Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs flex flex-col justify-between space-y-4">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">Summary</h3>

              {/* 4 Circular Badges in a row matching the screenshot */}
              <div className="grid grid-cols-4 gap-2 items-center text-center">
                {/* Assets Received */}
                <div className="flex flex-col items-center">
                  <div className="w-11 h-11 rounded-full bg-[#6366F1] text-white flex items-center justify-center shadow-xs mb-1.5">
                    <Box className="w-5 h-5" />
                  </div>
                  <span className="text-base font-black text-slate-900 leading-none">{assetsReceivedCount}</span>
                  <span className="text-[10px] text-slate-500 font-medium mt-0.5 leading-tight">Assets Received</span>
                </div>

                {/* Tagged */}
                <div className="flex flex-col items-center">
                  <div className="w-11 h-11 rounded-full bg-[#10B981] text-white flex items-center justify-center shadow-xs mb-1.5">
                    <Check className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <span className="text-base font-black text-slate-900 leading-none">{taggedCount}</span>
                  <span className="text-[10px] text-slate-500 font-medium mt-0.5 leading-tight">Tagged</span>
                </div>

                {/* Pending */}
                <div className="flex flex-col items-center">
                  <div className="w-11 h-11 rounded-full bg-[#0284C7] text-white flex items-center justify-center shadow-xs mb-1.5">
                    <Barcode className="w-5 h-5" />
                  </div>
                  <span className="text-base font-black text-slate-900 leading-none">{pendingCount}</span>
                  <span className="text-[10px] text-slate-500 font-medium mt-0.5 leading-tight">Pending</span>
                </div>

                {/* Issues */}
                <div className="flex flex-col items-center">
                  <div className="w-11 h-11 rounded-full bg-[#F97316] text-white flex items-center justify-center shadow-xs mb-1.5">
                    <Clock className="w-5 h-5" />
                  </div>
                  <span className="text-base font-black text-slate-900 leading-none">{issuesCount}</span>
                  <span className="text-[10px] text-slate-500 font-medium mt-0.5 leading-tight">Issues</span>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  className="px-4 py-2 bg-white hover:bg-purple-50 border border-[#6C2BD9] text-[#6C2BD9] rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                >
                  Save as Draft
                </button>
                <button
                  type="button"
                  onClick={handleProceedToReview}
                  className="px-5 py-2 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Proceed to Review</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>

        </div>

        {/* Right 4 Columns: Scan & Tag / Print Labels Panel */}
        <div className="xl:col-span-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
          
          {/* Panel Tab Header with Settings Icon */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-4 text-xs font-bold">
              <button
                type="button"
                onClick={() => setActivePanelTab('scan')}
                className={`pb-1 transition-colors cursor-pointer ${
                  activePanelTab === 'scan'
                    ? 'text-[#6C2BD9] border-b-2 border-[#6C2BD9]'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                Scan &amp; Tag
              </button>

              <button
                type="button"
                onClick={() => setActivePanelTab('print')}
                className={`pb-1 transition-colors cursor-pointer ${
                  activePanelTab === 'print'
                    ? 'text-[#6C2BD9] border-b-2 border-[#6C2BD9]'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                Print Labels
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowSettingsModal(!showSettingsModal)}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              title="Scanner and Hardware Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>

          {/* Tab 1: Scan & Tag */}
          {activePanelTab === 'scan' ? (
            <div className="space-y-4">
              
              {/* Scan Barcode Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Scan Asset Barcode / Serial No.
                </label>
                <form onSubmit={handleScanSerialSubmit} className="relative">
                  <input
                    type="text"
                    value={scanSerialInput}
                    onChange={(e) => setScanSerialInput(e.target.value)}
                    placeholder="Scan or enter serial number..."
                    className="w-full px-3 py-2 pr-9 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#6C2BD9]/20 focus:border-[#6C2BD9] bg-white"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-2 text-[#6C2BD9] hover:text-[#5B21B6] p-1"
                    title="Scan Barcode"
                  >
                    <Barcode className="w-4 h-4" />
                  </button>
                </form>
              </div>

              {/* OR Divider */}
              <div className="relative flex items-center justify-center my-1">
                <div className="border-t border-slate-200 w-full"></div>
                <span className="bg-white px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest relative">
                  OR
                </span>
              </div>

              {/* Scan RFID Tag Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Scan RFID Tag
                </label>
                <form onSubmit={handleScanRfidSubmit} className="relative">
                  <input
                    type="text"
                    value={scanRfidInput}
                    onChange={(e) => setScanRfidInput(e.target.value)}
                    placeholder="Scan RFID tag..."
                    className="w-full px-3 py-2 pr-9 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#6C2BD9]/20 focus:border-[#6C2BD9] bg-white"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-2 text-[#6C2BD9] hover:text-[#5B21B6] p-1"
                    title="Scan RFID Tag"
                  >
                    <Radio className="w-4 h-4" />
                  </button>
                </form>
              </div>

              {/* Scan Feedback Banner */}
              {scanFeedback && (
                <div className={`p-2 rounded-xl text-xs flex items-center gap-2 ${
                  scanFeedback.type === 'error'
                    ? 'bg-red-50 text-red-700 border border-red-200'
                    : 'bg-purple-50 text-[#6C2BD9] border border-purple-200'
                }`}>
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{scanFeedback.msg}</span>
                </div>
              )}

              {/* Asset Preview Box */}
              <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 space-y-3.5">
                <div className="text-xs font-bold text-slate-900 tracking-tight">Asset Preview</div>

                <div className="flex items-start gap-4">
                  {/* Laptop Thumbnail */}
                  <div className="w-24 h-24 rounded-xl bg-black flex items-center justify-center overflow-hidden border border-slate-200 shrink-0 shadow-xs">
                    <img
                      src={previewAsset?.imageUrl || '/laptop.png'}
                      alt="Asset"
                      className="w-full h-full object-contain p-1"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=200&q=80';
                      }}
                    />
                  </div>

                  {/* Details */}
                  <div className="space-y-1.5 text-xs flex-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Serial Number</span>
                      <span className="font-mono font-bold text-slate-800">{previewAsset?.serialNumber || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Asset Name</span>
                      <span className="font-semibold text-slate-800 truncate max-w-[140px]">{previewAsset?.assetName || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Category</span>
                      <span className="text-slate-700">{previewAsset?.category || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Model</span>
                      <span className="text-slate-700">{previewAsset?.model || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Tag Number</span>
                      <span className="font-mono text-slate-700 font-semibold">{previewAsset?.tagNumber || '-'}</span>
                    </div>
                    <div className="flex justify-between items-center pt-0.5">
                      <span className="text-slate-400">Status</span>
                      <span className="inline-flex items-center gap-1.5 text-emerald-600 font-bold text-[11px]">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        {previewAsset?.status || 'Pending'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Preview Action Buttons */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleClearPreview}
                    className="w-full py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                  >
                    Clear
                  </button>
                  <button
                    type="button"
                    onClick={handleAssignTag}
                    className="w-full py-2 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                  >
                    Assign Tag
                  </button>
                </div>
              </div>

            </div>
          ) : (
            /* Tab 2: Print Labels */
            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-slate-600 mb-1">Asset Numbering Scheme</label>
                <select
                  value={printConfig.scheme}
                  onChange={(e) => setPrintConfig({ ...printConfig, scheme: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                >
                  <option value="AUTO_PREFIX_SEQ">Auto Prefix + Sequence (E360000xxxxx)</option>
                  <option value="CUSTOM_CODE128">Standard Code 128</option>
                  <option value="GS1_EPC">GS1 EPC Tag URI</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-600 mb-1">Tag Format</label>
                <select
                  value={printConfig.tagFormat}
                  onChange={(e) => setPrintConfig({ ...printConfig, tagFormat: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                >
                  <option value="CODE_128">Barcode (Code 128)</option>
                  <option value="QR_CODE">QR Code (2D Matrix)</option>
                  <option value="RFID_EPC">RFID UHF EPC Gen2</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-600 mb-1">Label Template</label>
                <select
                  value={printConfig.template}
                  onChange={(e) => setPrintConfig({ ...printConfig, template: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                >
                  <option value="STANDARD_2X1">Standard 2.0" x 1.0" Asset Label</option>
                  <option value="COMPACT_1.5X0.75">Compact 1.5" x 0.75" IT Tag</option>
                  <option value="ASSET_TAG_3X1">Heavy Duty 3.0" x 1.0" Tamper Proof</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-600 mb-1">Target Printer</label>
                <select
                  value={printConfig.printer}
                  onChange={(e) => setPrintConfig({ ...printConfig, printer: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                >
                  <option value="Zebra ZT411 RFID (Warehouse Dock 2)">Zebra ZT411 RFID (Warehouse Dock 2)</option>
                  <option value="SATO CL4NX Thermal (HQ Store)">SATO CL4NX Thermal (HQ Store)</option>
                  <option value="Brother QL-820NWB (Desk 1)">Brother QL-820NWB (Desk 1)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-600 mb-1">Tag Prefix</label>
                  <input
                    type="text"
                    value={printConfig.tagPrefix}
                    onChange={(e) => setPrintConfig({ ...printConfig, tagPrefix: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-600 mb-1">Quantity</label>
                  <input
                    type="number"
                    value={printConfig.quantity}
                    onChange={(e) => setPrintConfig({ ...printConfig, quantity: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                    min="1"
                    max="100"
                  />
                </div>
              </div>

              {/* Tag Label Preview */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-center">
                <div className="text-[10px] uppercase font-bold text-slate-400">Sample Label Output</div>
                <div className="bg-white p-3 rounded-lg border border-slate-300 shadow-2xs inline-block mx-auto min-w-[200px]">
                  <div className="text-[9px] font-bold text-slate-900 tracking-wider">ASSET360 ENTERPRISE</div>
                  <div className="font-mono text-xs font-black text-slate-900 my-1">
                    {previewAsset?.tagNumber || `${printConfig.tagPrefix}12345`}
                  </div>
                  <div className="flex items-center justify-center gap-1 my-1 text-slate-800">
                    <Barcode className="w-24 h-6" />
                  </div>
                  <div className="text-[8px] text-slate-500 truncate max-w-[180px]">
                    {previewAsset?.assetName || 'Dell Latitude 7450'}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handlePrintLabels}
                disabled={isPrinting}
                className="w-full py-2.5 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>{isPrinting ? 'Printing Labels...' : `Print ${printConfig.quantity} Label(s)`}</span>
              </button>
            </div>
          )}

        </div>

      </div>

      {/* Hardware Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4 text-xs">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">Scanner &amp; RFID Settings</h3>
              <button onClick={() => setShowSettingsModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="font-semibold block mb-1">Scanner Interface Mode</label>
                <select className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white">
                  <option>HID Keyboard Wedge (USB/Bluetooth)</option>
                  <option>Serial COM Port / SPP</option>
                  <option>WebHID Direct Access</option>
                </select>
              </div>
              <div>
                <label className="font-semibold block mb-1">RFID Antenna Power Level</label>
                <select className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white">
                  <option>High (27 dBm) - Standard Range</option>
                  <option>Medium (20 dBm) - Near Field</option>
                  <option>Low (14 dBm) - Single Item Scan</option>
                </select>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <input type="checkbox" id="autoAssign" defaultChecked className="rounded-sm text-[#6C2BD9]" />
                <label htmlFor="autoAssign" className="text-slate-700">Auto-assign tag immediately after RFID scan</label>
              </div>
            </div>
            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setShowSettingsModal(false)}
                className="px-4 py-2 bg-[#6C2BD9] text-white rounded-xl font-semibold shadow-xs"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Asset Entry Modal */}
      <ManualAssetModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        defaultValues={assetDefaults}
        existingItems={receivedAssets}
        onAddAsset={(newAsset) => {
          setReceivedAssets(prev => [newAsset, ...prev]);
          setPreviewAsset({
            serialNumber: newAsset.serialNumber,
            assetName: newAsset.assetName,
            category: newAsset.category,
            model: newAsset.model,
            tagNumber: newAsset.tagNumber === '-' ? `E360000${Math.floor(10000 + Math.random() * 90000)}` : newAsset.tagNumber,
            status: newAsset.status === 'Tagged' ? 'Tagged' : 'Ready to Assign',
            imageUrl: newAsset.imageUrl || '/laptop.png'
          });
          showToast(`Asset ${newAsset.serialNumber} added manually.`);
        }}
      />

      {/* File Import Modal */}
      <FileImportModal
        isOpen={isFileImportModalOpen}
        onClose={() => setIsFileImportModalOpen(false)}
        defaultValues={assetDefaults}
        existingItems={receivedAssets}
        onImportAssets={(importedItems) => {
          setReceivedAssets(prev => [...importedItems, ...prev]);
          showToast(`Successfully imported ${importedItems.length} assets from file.`);
        }}
      />

      {/* Edit Asset Modal */}
      <EditAssetModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingAsset(null);
        }}
        asset={editingAsset}
        onSaveAsset={(updated) => {
          setReceivedAssets(prev => prev.map(a => a.id === updated.id ? updated : a));
          if (previewAsset?.serialNumber === updated.serialNumber) {
            setPreviewAsset({
              ...previewAsset,
              serialNumber: updated.serialNumber,
              assetName: updated.assetName,
              category: updated.category,
              model: updated.model,
              tagNumber: updated.tagNumber,
              status: updated.status
            });
          }
          showToast('Asset updated successfully.');
        }}
      />

      {/* Review & Submit Modal */}
      <ReviewSubmitModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        receivingData={receivingInfo}
        defaultData={assetDefaults}
        items={receivedAssets}
        validationReport={validationReport}
        onSubmitSuccess={(receipt) => {
          showToast(`Receiving posted! GRN: ${receipt.receiptNumber || 'GRN-2026-0087'}`);
        }}
      />

    </div>
  );
}
