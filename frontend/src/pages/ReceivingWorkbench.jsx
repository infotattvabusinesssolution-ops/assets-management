import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../services/api';
import {
  Inbox,
  Search,
  Calendar,
  Building,
  User,
  Barcode,
  Radio,
  CheckCircle2,
  Clock,
  Settings,
  X,
  Plus,
  ArrowRight,
  Printer,
  Sliders,
  History,
  AlertCircle,
  Eye,
  Trash2,
  Sparkles,
  FileCheck,
  Check,
  ChevronRight,
  Package,
  Layers,
  RefreshCw
} from 'lucide-react';
import clsx from 'clsx';

export function ReceivingWorkbench({ initialMode = 'po' }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Mode: 'po' (Receive with PO) or 'without-po' (Receive without PO)
  const [mode, setMode] = useState(
    location.pathname.includes('without-po') || initialMode === 'without-po' ? 'without-po' : 'po'
  );

  // Stepper state: 1 = PO Details, 2 = Asset Verification, 3 = Tagging, 4 = Review & Submit
  const [currentStep, setCurrentStep] = useState(1);

  // Top Row: Purchase Order Information (Badge 2)
  const [poNumber, setPoNumber] = useState('');
  const [supplier, setSupplier] = useState('');
  const [poDate, setPoDate] = useState('');
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState('');
  const [showPoSearchModal, setShowPoSearchModal] = useState(false);
  const [availablePos, setAvailablePos] = useState([]);

  // Create PO Modal & Form State
  const [showCreatePoModal, setShowCreatePoModal] = useState(false);
  const [newPoForm, setNewPoForm] = useState({
    poNumber: '',
    supplier: '',
    poDate: new Date().toISOString().slice(0, 10),
    expectedDeliveryDate: '',
    currency: 'USD',
    paymentTerms: 'Net 30',
    lineItems: [
      {
        id: 'new-line-1',
        description: '',
        partNumber: '',
        category: '',
        model: '',
        orderedQty: 1,
        unitPrice: 0
      }
    ]
  });

  // Non-PO specific fields
  const [nonPoSupplier, setNonPoSupplier] = useState('');
  const [nonPoRefNumber, setNonPoRefNumber] = useState('');
  const [nonPoReason, setNonPoReason] = useState('');

  // Top Row: Receiving Information (Badge 3)
  const [receivingDate, setReceivingDate] = useState(new Date().toISOString().slice(0, 10));
  const [receivingLocation, setReceivingLocation] = useState('');
  const [receivedBy, setReceivedBy] = useState('');
  const [referenceNo, setReferenceNo] = useState('');
  const [remarks, setRemarks] = useState('');

  // Middle Section: PO Line Items (Badge 9)
  const [lineItems, setLineItems] = useState([]);

  // Active selected line item for verification/tagging
  const [selectedLineItem, setSelectedLineItem] = useState(null);

  // Line Item Details Inspection Modal
  const [viewingLineItem, setViewingLineItem] = useState(null);

  // Scan & Tag Panel (Badge 4 & 5)
  const [activeTab, setActiveTab] = useState('scan'); // 'scan' | 'print'
  const [scanSerialInput, setScanSerialInput] = useState('');
  const [scanRfidInput, setScanRfidInput] = useState('');
  const [scanning, setScanning] = useState(false);

  // Asset Preview Card (Badge 6)
  const [assetPreview, setAssetPreview] = useState(null);

  // Recent Scanned Items (Badge 10)
  const [recentScannedItems, setRecentScannedItems] = useState([]);

  // Tagging Settings Modal (Badge 5)
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [taggingSettings, setTaggingSettings] = useState({
    defaultPrinter: 'Zebra ZT411 RFID (Warehouse Dock 2)',
    tagFormat: 'CODE_128',
    labelTemplate: 'STANDARD_2X1',
    numberingScheme: 'AUTO_PREFIX_SEQ',
    prefix: 'E360000',
    scannerInterface: 'KEYBOARD_WEDGE'
  });

  // Review & Submit Modal (Badge 4 & Final Submit)
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [requireApproval, setRequireApproval] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  // Fetch available ERP POs on mount
  useEffect(() => {
    const fetchPos = async () => {
      try {
        const res = await api.get('/receiving/purchase-orders');
        if (res.purchaseOrders) setAvailablePos(res.purchaseOrders);
      } catch (e) {
        showNotification(e?.message || 'Could not load purchase orders', 'error')
      }
    };
    fetchPos();
  }, []);

  // Update mode when URL changes
  useEffect(() => {
    if (location.pathname.includes('without-po')) {
      setMode('without-po');
    } else {
      setMode('po');
    }
  }, [location.pathname]);

  // Real-time Summary Counts (Badge 11)
  const totalPoItems = lineItems.length;
  const totalUnitsReceived = lineItems.reduce((acc, item) => acc + (item.receivedQty || 0), 0);
  const totalUnitsTagged = recentScannedItems.length;
  const totalUnitsPending = lineItems.reduce((acc, item) => acc + (item.pendingQty || 0), 0);

  // Load a specific PO
  const handleSelectPo = async (selectedPoNum) => {
    try {
      const res = await api.get(`/receiving/purchase-orders/${selectedPoNum}`);
      if (res.purchaseOrder) {
        const po = res.purchaseOrder;
        setPoNumber(po.poNumber);
        setSupplier(po.supplier);
        setPoDate(po.poDate);
        setExpectedDeliveryDate(po.expectedDeliveryDate);
        if (po.lineItems) {
          setLineItems(po.lineItems);
          if (po.lineItems.length > 0) setSelectedLineItem(po.lineItems[0]);
        }
        setShowPoSearchModal(false);
        showNotification(`Loaded Purchase Order ${po.poNumber}`, 'success');
      }
    } catch (e) {
      showNotification(`Failed to load PO ${selectedPoNum}`, 'error');
    }
  };

  // Add / Edit / Remove Line Items in Create PO modal
  const handleAddPoLineItem = () => {
    const nextIdx = newPoForm.lineItems.length + 1;
    setNewPoForm({
      ...newPoForm,
      lineItems: [
        ...newPoForm.lineItems,
        {
          id: `new-line-${Date.now()}-${nextIdx}`,
          description: `Asset Item ${nextIdx}`,
          partNumber: `SKU-${nextIdx}00`,
          category: 'Hardware',
          model: 'Standard',
          orderedQty: 5,
          unitPrice: 500.00
        }
      ]
    });
  };

  const handleRemovePoLineItem = (index) => {
    if (newPoForm.lineItems.length <= 1) {
      showNotification('A Purchase Order must have at least one line item', 'info');
      return;
    }
    const updated = newPoForm.lineItems.filter((_, i) => i !== index);
    setNewPoForm({ ...newPoForm, lineItems: updated });
  };

  const handleUpdatePoLineItem = (index, field, value) => {
    const updated = [...newPoForm.lineItems];
    updated[index] = { ...updated[index], [field]: value };
    setNewPoForm({ ...newPoForm, lineItems: updated });
  };

  const handleCreatePoSubmit = async (e) => {
    e?.preventDefault();
    if (!newPoForm.poNumber?.trim()) {
      showNotification('Please enter a valid PO Number', 'error');
      return;
    }
    if (!newPoForm.supplier?.trim()) {
      showNotification('Please enter a Supplier / Vendor name', 'error');
      return;
    }
    if (!newPoForm.lineItems || newPoForm.lineItems.length === 0) {
      showNotification('Please add at least one line item', 'error');
      return;
    }

    try {
      const res = await api.post('/receiving/purchase-orders', newPoForm);
      if (res.purchaseOrder) {
        const po = res.purchaseOrder;
        setPoNumber(po.poNumber);
        setSupplier(po.supplier);
        setPoDate(po.poDate);
        setExpectedDeliveryDate(po.expectedDeliveryDate);
        if (po.lineItems && po.lineItems.length > 0) {
          setLineItems(po.lineItems);
          setSelectedLineItem(po.lineItems[0]);
        }
        setAvailablePos(prev => [po, ...prev.filter(item => item.poNumber !== po.poNumber)]);
        setShowCreatePoModal(false);
        setShowPoSearchModal(false);
        showNotification(`Created and loaded Purchase Order ${po.poNumber}`, 'success');
      }
    } catch (err) {
      showNotification(err.message || 'Failed to create Purchase Order', 'error');
    }
  };

  const showNotification = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Clear Scan Data (Badge 7)
  const handleClearScan = () => {
    setScanSerialInput('');
    setScanRfidInput('');
    setAssetPreview(null);
    showNotification('Scan input cleared for next asset.', 'info');
  };

  // Perform Serial Verification / Scan Lookup
  const handleScanLookup = async (serialVal) => {
    if (!serialVal?.trim()) return;
    if (!poNumber || !selectedLineItem) { showNotification('Select a PO line first', 'warning'); return; }
    setScanning(true);

    try {
      // Validate serial uniqueness
      const valRes = await api.post('/receiving/validate-serial', { serialNumber: serialVal });
      if (!valRes.valid) {
        showNotification(valRes.message, 'warning');
        return;
      }
      if (recentScannedItems.some(item => item.serialNumber.toLowerCase() === serialVal.trim().toLowerCase())) {
        showNotification('Serial already staged in this receipt', 'warning');
        return;
      }

      // Generate new tag number
      const generated = await api.post('/tagging/generate', { prefix: 'E360000' });
      if (!generated.success || !generated.tag) throw new Error('Unable to generate a tag');
      const tagNum = generated.tag.tagNumber;
      const rfidEpc = generated.tag.rfidEpc;

      setAssetPreview({
        serialNumber: serialVal,
        assetName: selectedLineItem ? selectedLineItem.description : 'Received Physical Asset',
        category: selectedLineItem ? selectedLineItem.category : 'General Equipment',
        model: selectedLineItem ? selectedLineItem.model : 'Standard Model',
        tagNumber: tagNum,
        rfidEpc: rfidEpc,
        status: 'Assigned',
        imageUrl: selectedLineItem?.imageUrl || 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400&q=80'
      });
      setCurrentStep(3); // Move to Tagging step
    } catch (err) {
      showNotification('Scan lookup error', 'error');
    } finally {
      setScanning(false);
    }
  };

  // Assign Tag Button (Badge 8)
  const handleAssignTag = async () => {
    if (!poNumber || !selectedLineItem || !assetPreview?.serialNumber) {
      showNotification('Select a PO line and scan a serial number first.', 'warning');
      return;
    }

    // Validate tag uniqueness
    try {
      const tagCheck = await api.post('/receiving/validate-tag', {
        tagNumber: assetPreview.tagNumber,
        rfidEpc: assetPreview.rfidEpc
      });

      if (!tagCheck.valid) {
        showNotification(tagCheck.message, 'warning');
        return;
      }
    } catch (e) {
      showNotification(e?.message || 'Tag validation failed', 'error');
      return;
    }

    const now = new Date();
    const formattedTime = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) +
      ' ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newScanned = {
      id: `scan-${Date.now()}`,
      time: formattedTime,
      serialNumber: assetPreview.serialNumber,
      tagNumber: assetPreview.tagNumber,
      rfidEpc: assetPreview.rfidEpc,
      assetName: assetPreview.assetName,
      status: 'Tagged'
    };

    if (recentScannedItems.some(item => item.serialNumber.toLowerCase() === newScanned.serialNumber.toLowerCase())) {
      showNotification('Serial already staged in this receipt', 'warning');
      return;
    }
    setRecentScannedItems([newScanned, ...recentScannedItems]);

    // Update Line Item Quantities (Partial Receiving)
    if (selectedLineItem) {
      const updatedLines = lineItems.map((line) => {
        if (line.id === selectedLineItem.id) {
          const newReceived = Math.min(line.orderedQty, (line.receivedQty || 0) + 1);
          const newPending = Math.max(0, line.orderedQty - newReceived);
          return {
            ...line,
            receivedQty: newReceived,
            pendingQty: newPending,
            status: newPending === 0 ? 'Completed' : 'In Progress'
          };
        }
        return line;
      });
      setLineItems(updatedLines);
    }

    showNotification(`Tag ${assetPreview.tagNumber} successfully assigned to ${assetPreview.serialNumber}`, 'success');

    // Auto-advance serial for fast bulk scanning
    const nextNum = parseInt(assetPreview.serialNumber.replace(/\D/g, '') || '1') + 1;
    const prefix = assetPreview.serialNumber.replace(/\d+$/, '');
    const nextSerial = `${prefix}${String(nextNum).padStart(3, '0')}`;
    setScanSerialInput(nextSerial);
  };

  // Remove recent scanned item
  const handleRemoveScannedItem = (id) => {
    setRecentScannedItems(recentScannedItems.filter((item) => item.id !== id));
    showNotification('Item removed from current session.', 'info');
  };

  // Save as Draft
  const handleSaveDraft = async () => {
    try {
      await api.post('/receiving/drafts', {
        id: `DRAFT-${poNumber}`,
        mode,
        poNumber,
        supplier: mode === 'po' ? supplier : nonPoSupplier,
        receivingDate,
        receivingLocation,
        receivedBy,
        referenceNo,
        remarks,
        lineItems,
        recentScannedItems,
        currentStep
      });
      showNotification('Receiving session successfully saved as Draft.', 'success');
    } catch (e) {
      showNotification(e?.message || 'Could not save draft', 'error');
    }
  };

  // Final Submit
  const handleFinalSubmit = async () => {
    if (!poNumber || !recentScannedItems.length) {
      showNotification('Select a PO and scan at least one asset', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        mode: mode === 'po' ? 'WITH_PO' : 'WITHOUT_PO',
        poNumber: mode === 'po' ? poNumber : 'NON-PO',
        supplier: mode === 'po' ? supplier : nonPoSupplier,
        receivingDate,
        receivingLocation,
        receivedBy,
        referenceNo,
        remarks,
        nonPoReason: mode === 'without-po' ? nonPoReason : undefined,
        scannedItems: recentScannedItems,
        poLineItems: lineItems,
        requireApproval
      };

      const res = await api.post('/receiving/submit', payload);
      if (!res?.success || !res.receipt) throw new Error(res?.message || 'Receiving failed');
      showNotification(`Goods receipt ${res.receipt.receiptNumber} posted successfully!`, 'success');
      setShowReviewModal(false);
      setCurrentStep(4);
      setTimeout(() => {
        navigate('/receiving/history');
      }, 1500);
    } catch (err) {
      showNotification(err?.message || 'Error submitting receiving transaction', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 pb-12 select-none text-slate-800">
      {/* Toast Notification Banner */}
      {toast && (
        <div
          className={clsx(
            'fixed top-20 right-6 z-50 px-4 py-3 rounded-xl shadow-lg border text-xs font-semibold flex items-center gap-2.5 transition-all animate-in fade-in slide-in-from-top-3',
            toast.type === 'success' && 'bg-emerald-50 text-emerald-800 border-emerald-200',
            toast.type === 'warning' && 'bg-amber-50 text-amber-800 border-amber-200',
            toast.type === 'error' && 'bg-rose-50 text-rose-800 border-rose-200',
            toast.type === 'info' && 'bg-purple-50 text-purple-800 border-purple-200'
          )}
        >
          {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4" />}
          {toast.message}
        </div>
      )}

      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-1">
            <span className="text-slate-400 font-bold hover:text-slate-600 cursor-pointer">✕</span>
            <span className="hover:text-slate-800 cursor-pointer" onClick={() => navigate('/receiving')}>
              Receiving & Tagging
            </span>
            <span>&gt;</span>
            <span className="text-[#6C2BD9] font-bold">
              {mode === 'po' ? 'Receive with PO' : 'Receive without PO'}
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {mode === 'po' ? 'Receive with PO' : 'Receive without PO'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {mode === 'po'
              ? 'Receive assets against a Purchase Order, verify details and tag for asset registration'
              : 'Direct asset intake without purchase order, manual source verification and registration approval'}
          </p>
        </div>

        {/* Action Button 12: View Receiving History */}
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => {
                setMode('po');
                navigate('/receiving');
              }}
              className={clsx(
                'px-3 py-1.5 rounded-lg transition-all cursor-pointer',
                mode === 'po' ? 'bg-white text-[#6C2BD9] shadow-xs' : 'text-slate-600 hover:text-slate-900'
              )}
            >
              With PO
            </button>
            <button
              onClick={() => {
                setMode('without-po');
                navigate('/receiving/without-po');
              }}
              className={clsx(
                'px-3 py-1.5 rounded-lg transition-all cursor-pointer',
                mode === 'without-po' ? 'bg-white text-[#6C2BD9] shadow-xs' : 'text-slate-600 hover:text-slate-900'
              )}
            >
              Without PO
            </button>
          </div>

          <button
            onClick={() => navigate('/receiving/history')}
            className="px-4 py-2 bg-white hover:bg-slate-50 text-[#6C2BD9] border border-purple-200 hover:border-[#6C2BD9] text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <History className="w-4 h-4 text-[#6C2BD9]" />
            View Receiving History
          </button>
        </div>
      </div>

      {/* Stepper */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4 w-full max-w-6xl mx-auto px-2">
          {/* Step 1 */}
          <div
            onClick={() => setCurrentStep(1)}
            className="flex items-center gap-3 cursor-pointer group shrink-0"
          >
            <div
              className={clsx(
                'w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0 transition-all shadow-xs',
                currentStep >= 1 ? 'bg-[#6C2BD9] text-white' : 'bg-purple-50 text-[#6C2BD9]'
              )}
            >
              1
            </div>
            <div className="text-left">
              <p className={clsx('text-xs font-extrabold leading-tight', currentStep === 1 ? 'text-[#6C2BD9]' : 'text-slate-800')}>
                {mode === 'po' ? 'PO Details' : 'Source Details'}
              </p>
              <p className="text-[11px] text-purple-600 font-medium">
                {mode === 'po' ? 'Enter or select PO' : 'Supplier & Reference'}
              </p>
            </div>
          </div>

          {/* Arrow 1 */}
          <div className="hidden md:block text-purple-400 shrink-0">
            <ArrowRight className="w-4 h-4" />
          </div>

          {/* Step 2 */}
          <div
            onClick={() => setCurrentStep(2)}
            className="flex items-center gap-3 cursor-pointer group shrink-0"
          >
            <div
              className={clsx(
                'w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0 transition-all shadow-xs',
                currentStep >= 2 ? 'bg-[#6C2BD9] text-white' : 'bg-purple-50 text-[#6C2BD9]'
              )}
            >
              2
            </div>
            <div className="text-left">
              <p className={clsx('text-xs font-extrabold leading-tight', currentStep === 2 ? 'text-[#6C2BD9]' : 'text-slate-800')}>
                Asset Verification
              </p>
              <p className="text-[11px] text-purple-600 font-medium">Verify received items</p>
            </div>
          </div>

          {/* Arrow 2 */}
          <div className="hidden md:block text-purple-400 shrink-0">
            <ArrowRight className="w-4 h-4" />
          </div>

          {/* Step 3 */}
          <div
            onClick={() => setCurrentStep(3)}
            className="flex items-center gap-3 cursor-pointer group shrink-0"
          >
            <div
              className={clsx(
                'w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0 transition-all shadow-xs',
                currentStep >= 3 ? 'bg-[#6C2BD9] text-white' : 'bg-purple-50 text-[#6C2BD9]'
              )}
            >
              3
            </div>
            <div className="text-left">
              <p className={clsx('text-xs font-extrabold leading-tight', currentStep === 3 ? 'text-[#6C2BD9]' : 'text-slate-800')}>
                Tagging
              </p>
              <p className="text-[11px] text-purple-600 font-medium">Scan/Print &amp; Assign Tags</p>
            </div>
          </div>

          {/* Arrow 3 */}
          <div className="hidden md:block text-purple-400 shrink-0">
            <ArrowRight className="w-4 h-4" />
          </div>

          {/* Step 4 */}
          <div
            onClick={() => setCurrentStep(4)}
            className="flex items-center gap-3 cursor-pointer group shrink-0"
          >
            <div
              className={clsx(
                'w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0 transition-all shadow-xs',
                currentStep >= 4 ? 'bg-[#6C2BD9] text-white' : 'bg-purple-50 text-[#6C2BD9]'
              )}
            >
              4
            </div>
            <div className="text-left">
              <p className={clsx('text-xs font-extrabold leading-tight', currentStep === 4 ? 'text-[#6C2BD9]' : 'text-slate-800')}>
                Review &amp; Submit
              </p>
              <p className="text-[11px] text-purple-600 font-medium">Confirm and post</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Card 2: Purchase Order Information */}
        <div className="glass-panel p-4 space-y-3 relative">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-900 tracking-tight">
              {mode === 'po' ? 'Purchase Order Information' : 'Direct Source Information'}
            </h2>
            {mode === 'po' && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setShowCreatePoModal(true)}
                  className="px-2 py-0.5 text-[11px] font-bold text-white bg-[#6C2BD9] hover:bg-[#5B21B6] rounded-md shadow-2xs cursor-pointer flex items-center gap-1 transition-all active:scale-95"
                  title="Create a new Purchase Order"
                >
                  <Plus className="w-3 h-3" /> Create PO
                </button>
                <button
                  type="button"
                  onClick={() => setShowPoSearchModal(true)}
                  className="text-[11px] text-slate-500 font-bold hover:text-[#6C2BD9] hover:underline cursor-pointer"
                >
                  Change PO
                </button>
              </div>
            )}
          </div>

          {mode === 'po' ? (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    PO Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      value={poNumber}
                      onChange={(e) => setPoNumber(e.target.value)}
                      className="w-full pl-3 pr-8 py-1.5 text-xs rounded-lg border border-slate-200 bg-white font-mono font-bold text-slate-800 focus:border-[#6C2BD9]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPoSearchModal(true)}
                      className="absolute right-2 text-slate-400 hover:text-[#6C2BD9] cursor-pointer"
                      title="Search POs"
                    >
                      <Search className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Supplier</label>
                  <input
                    type="text"
                    value={supplier}
                    readOnly
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 text-slate-600 font-medium cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">PO Date</label>
                  <div className="relative flex items-center">
                    <input
                      type="date"
                      value={poDate}
                      onChange={(e) => setPoDate(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white font-medium text-slate-800 focus:border-[#6C2BD9] cursor-pointer"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Expected Delivery Date</label>
                  <div className="relative flex items-center">
                    <input
                      type="date"
                      value={expectedDeliveryDate}
                      onChange={(e) => setExpectedDeliveryDate(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white font-medium text-slate-800 focus:border-[#6C2BD9] cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Supplier Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={nonPoSupplier}
                    onChange={(e) => setNonPoSupplier(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white font-medium text-slate-800 focus:border-[#6C2BD9]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Delivery Note / DC Ref <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={nonPoRefNumber}
                    onChange={(e) => setNonPoRefNumber(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white font-mono font-bold text-slate-800 focus:border-[#6C2BD9]"
                  />
                </div>
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Reason for Non-PO Receipt <span className="text-rose-500">*</span>
                </label>
                <select
                  value={nonPoReason}
                  onChange={(e) => setNonPoReason(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white font-medium text-slate-700"
                >
                  <option value="Direct Site Intake (Urgent Replacement)">Direct Site Intake (Urgent Replacement)</option>
                  <option value="Vendor Trial / Free Sample Evaluation">Vendor Trial / Free Sample Evaluation</option>
                  <option value="Emergency Maintenance Replacement">Emergency Maintenance Replacement</option>
                  <option value="Internal Cross-Campus Asset Transfer">Internal Cross-Campus Asset Transfer</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Card 3: Receiving Information */}
        <div className="glass-panel p-4 space-y-3 relative">
          <h2 className="text-xs font-bold text-slate-900 tracking-tight">Receiving Information</h2>

          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Receiving Date <span className="text-rose-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <input
                    type="date"
                    value={receivingDate}
                    onChange={(e) => setReceivingDate(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white font-medium text-slate-800 focus:border-[#6C2BD9]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Receiving Location <span className="text-rose-500">*</span>
                </label>
                <select
                  value={receivingLocation}
                  onChange={(e) => setReceivingLocation(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white font-medium text-slate-700 focus:border-[#6C2BD9]"
                >
                  <option value="Dubai HQ - IT Store">Dubai HQ - IT Store</option>
                  <option value="San Francisco HQ - Tech Lab">San Francisco HQ - Tech Lab</option>
                  <option value="London Office - Central Dock">London Office - Central Dock</option>
                  <option value="Singapore Branch - Data Center">Singapore Branch - Data Center</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Received By <span className="text-rose-500">*</span>
                </label>
                <select
                  value={receivedBy}
                  onChange={(e) => setReceivedBy(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white font-medium text-slate-700 focus:border-[#6C2BD9]"
                >
                  <option value="John Doe">John Doe</option>
                  <option value="David Miller">David Miller</option>
                  <option value="Sarah Jenkins">Sarah Jenkins</option>
                  <option value="Store Receiving Lead">Store Receiving Lead</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Reference No.</label>
                <input
                  type="text"
                  value={referenceNo}
                  onChange={(e) => setReferenceNo(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white font-mono font-bold text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Remarks</label>
              <input
                type="text"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Remarks, damage check or box condition..."
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white font-medium text-slate-800 focus:border-[#6C2BD9]"
              />
            </div>
          </div>
        </div>

        {/* Card 4 & 5: Scan & Tag Panel */}
        <div className="glass-panel p-4 space-y-3 relative flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-4 h-4 rounded-full bg-purple-100 text-[#6C2BD9] inline-flex items-center justify-center text-[10px] font-bold shrink-0">
                  4
                </span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveTab('scan')}
                    className={clsx(
                      'text-xs font-bold transition-all border-b-2 py-1 cursor-pointer flex items-center gap-1.5',
                      activeTab === 'scan'
                        ? 'text-[#6C2BD9] border-[#6C2BD9]'
                        : 'text-slate-500 border-transparent hover:text-slate-800'
                    )}
                  >
                    <Barcode className="w-3.5 h-3.5" /> Scan & Tag
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('print')}
                    className={clsx(
                      'text-xs font-bold transition-all border-b-2 py-1 cursor-pointer flex items-center gap-1.5',
                      activeTab === 'print'
                        ? 'text-[#6C2BD9] border-[#6C2BD9]'
                        : 'text-slate-500 border-transparent hover:text-slate-800'
                    )}
                  >
                    <Printer className="w-3.5 h-3.5" /> Print Labels
                  </button>
                </div>
              </div>

              {/* Tagging Settings Button */}
              <button
                type="button"
                onClick={() => setShowSettingsModal(true)}
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                title="Tagging Settings (Printers, RFID, Templates)"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>

            {activeTab === 'scan' ? (
              <div className="space-y-3">
                {/* Barcode / Serial Scan */}
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Scan Asset Barcode / Serial No.
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      placeholder="Scan or enter serial number..."
                      value={scanSerialInput}
                      onChange={(e) => setScanSerialInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleScanLookup(scanSerialInput);
                      }}
                      className="w-full pl-3 pr-9 py-1.5 text-xs rounded-lg border border-slate-200 bg-white font-mono text-slate-800 focus:border-[#6C2BD9]"
                    />
                    <button
                      type="button"
                      onClick={() => handleScanLookup(scanSerialInput)}
                      className="absolute right-2 text-slate-500 hover:text-[#6C2BD9] cursor-pointer"
                      title="Scan barcode"
                    >
                      <Barcode className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="relative flex items-center justify-center">
                  <div className="border-t border-slate-200 w-full"></div>
                  <span className="bg-white px-2 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest absolute">
                    OR
                  </span>
                </div>

                {/* RFID Tag Scan */}
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Scan RFID Tag
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      placeholder="Scan RFID tag..."
                      value={scanRfidInput}
                      onChange={(e) => setScanRfidInput(e.target.value)}
                      className="w-full pl-3 pr-9 py-1.5 text-xs rounded-lg border border-slate-200 bg-white font-mono text-slate-800 focus:border-[#6C2BD9]"
                    />
                    <button
                      type="button"
                      onClick={() => showNotification('Scan an RFID EPC into the field above.', 'info')}
                      className="absolute right-2 text-slate-500 hover:text-[#6C2BD9] cursor-pointer"
                      title="Scan RFID tag into the field"
                    >
                      <Radio className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Asset Preview */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl relative">
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-[#6C2BD9]" /> Asset Preview
                  </p>

                  {assetPreview ? (
                    <div className="flex gap-3 items-center">
                      <div className="w-20 h-20 rounded-lg overflow-hidden border border-slate-200 bg-white shrink-0 flex items-center justify-center p-1">
                        <img
                          src={assetPreview.imageUrl}
                          alt={assetPreview.assetName}
                          className="w-full h-full object-contain"
                        />
                      </div>

                      <div className="flex-1 min-w-0 space-y-1 text-[11px]">
                        <div className="grid grid-cols-[100px_1fr] items-center">
                          <span className="text-slate-400 font-medium">Serial Number:</span>
                          <span className="font-mono font-bold text-slate-800 truncate">{assetPreview.serialNumber}</span>
                        </div>
                        <div className="grid grid-cols-[100px_1fr] items-center">
                          <span className="text-slate-400 font-medium">Asset Name:</span>
                          <span className="font-semibold text-slate-800 truncate">{assetPreview.assetName}</span>
                        </div>
                        <div className="grid grid-cols-[100px_1fr] items-center">
                          <span className="text-slate-400 font-medium">Category:</span>
                          <span className="text-slate-700">{assetPreview.category}</span>
                        </div>
                        <div className="grid grid-cols-[100px_1fr] items-center">
                          <span className="text-slate-400 font-medium">Model:</span>
                          <span className="text-slate-700">{assetPreview.model}</span>
                        </div>
                        <div className="grid grid-cols-[100px_1fr] items-center">
                          <span className="text-slate-400 font-medium">Tag Number:</span>
                          <span className="font-mono font-bold text-[#6C2BD9]">{assetPreview.tagNumber}</span>
                        </div>
                        <div className="grid grid-cols-[100px_1fr] items-center pt-0.5">
                          <span className="text-slate-400 font-medium">Status:</span>
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full w-fit">
                            <Check className="w-3 h-3 text-emerald-600" /> {assetPreview.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="py-4 text-center text-slate-400 text-xs">
                      Scan or enter a serial number to preview asset.
                    </div>
                  )}
                </div>

                {/* Buttons (Clear) and (Assign Tag) */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={handleClearScan}
                    className="flex-1 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
                  >
                    Clear
                  </button>

                  <button
                    onClick={handleAssignTag}
                    disabled={!assetPreview}
                    className="flex-1 py-2 bg-[#6C2BD9] hover:bg-[#5B21B6] disabled:bg-slate-300 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    Assign Tag
                  </button>
                </div>
              </div>
            ) : (
              /* Print Labels Tab */
              <div className="space-y-3">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-500 font-medium">Printer:</span>
                    <span className="font-bold text-slate-800 truncate">{taggingSettings.defaultPrinter}</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-500 font-medium">Format:</span>
                    <span className="font-bold text-slate-800">{taggingSettings.tagFormat}</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-500 font-medium">Template:</span>
                    <span className="font-bold text-slate-800">{taggingSettings.labelTemplate}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    showNotification(`Sent label print job for ${assetPreview?.tagNumber || 'batch'} to printer.`, 'success');
                  }}
                  className="w-full py-2 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Printer className="w-4 h-4" /> Print Current Tag
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* PO Line Items Grid (Partial Receiving Support) */}
      <div className="glass-panel overflow-hidden relative">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white">
          <h2 className="text-xs font-bold text-slate-900 tracking-tight">
            {mode === 'po' ? `PO Line Items (${lineItems.length})` : `Direct Intake Line Items (${lineItems.length})`}
          </h2>

          <p className="text-[11px] text-slate-500 font-medium">
            Click <span className="font-bold text-[#6C2BD9]">Receive</span> to move into individual asset verification
          </p>
        </div>

        <div className="overflow-auto max-h-[400px]">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 z-10 bg-slate-50 shadow-2xs">
              <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-600">
                <th className="py-2.5 px-4 w-10">
                  <input type="checkbox" className="rounded border-slate-300 text-[#6C2BD9] focus:ring-[#6C2BD9]" />
                </th>
                <th className="py-2.5 px-4 w-12">#</th>
                <th className="py-2.5 px-4">Item Description</th>
                <th className="py-2.5 px-4">Part Number</th>
                <th className="py-2.5 px-4 text-center">Ordered Qty</th>
                <th className="py-2.5 px-4 text-center">Received Qty</th>
                <th className="py-2.5 px-4 text-center">Pending Qty</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {lineItems.map((item, idx) => {
                const isSelected = selectedLineItem?.id === item.id;
                return (
                  <tr
                    key={item.id || idx}
                    onClick={() => {
                      setSelectedLineItem(item);
                      setAssetPreview(null);
                    }}
                    className={clsx(
                      'hover:bg-purple-50/40 cursor-pointer transition-colors',
                      isSelected && 'bg-purple-50/60'
                    )}
                  >
                    <td className="py-2.5 px-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="rounded border-slate-300 text-[#6C2BD9] focus:ring-[#6C2BD9]"
                      />
                    </td>
                    <td className="py-2.5 px-4 font-bold text-slate-600">{item.itemNumber || idx + 1}</td>
                    <td className="py-2.5 px-4 font-semibold text-slate-800 flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-white border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center p-0.5">
                        <img src={item.imageUrl} alt="" className="w-full h-full object-contain" />
                      </div>
                      <span className="truncate">{item.description}</span>
                    </td>
                    <td className="py-2.5 px-4 font-mono text-slate-600">{item.partNumber}</td>
                    <td className="py-2.5 px-4 text-center font-bold text-slate-700">{item.orderedQty}</td>
                    <td className="py-2.5 px-4 text-center font-bold text-slate-800">{item.receivedQty}</td>
                    <td className="py-2.5 px-4 text-center font-bold text-slate-800">{item.pendingQty}</td>
                    <td className="py-2.5 px-4">
                      {item.status === 'Completed' && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Completed
                        </span>
                      )}
                      {item.status === 'In Progress' && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          In Progress
                        </span>
                      )}
                      {item.status === 'Pending' && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      {item.status === 'Completed' ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLineItem(item);
                            setViewingLineItem(item);
                          }}
                          className="px-3 py-1 bg-white hover:bg-purple-50 text-[#6C2BD9] border border-purple-200 text-xs font-bold rounded-lg shadow-2xs cursor-pointer flex items-center gap-1 mx-auto transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View
                        </button>
                      ) : (
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedLineItem(item);
                              handleScanLookup(`${item.partNumber}-001`);
                              setCurrentStep(2);
                            }}
                            className="px-3 py-1 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white text-xs font-bold rounded-lg shadow-2xs cursor-pointer transition-colors"
                          >
                            Receive
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedLineItem(item);
                              setViewingLineItem(item);
                            }}
                            title="View line item details"
                            className="p-1 text-slate-400 hover:text-[#6C2BD9] hover:bg-purple-50 rounded-md transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Row: Recent Scanned Items (Card 10) & Summary (Card 11) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Recent Scanned Items (7 Cols) */}
        <div className="lg:col-span-7 glass-panel p-4 space-y-3 relative">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-900 tracking-tight">
              Recent Scanned Items ({recentScannedItems.length})
            </h2>
            <span className="text-[10px] text-slate-400 font-medium">Refreshes in real-time</span>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-auto max-h-[300px]">
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 z-10 bg-slate-50 shadow-2xs">
                <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-600">
                  <th className="py-2.5 px-3">Time</th>
                  <th className="py-2.5 px-3">Serial Number</th>
                  <th className="py-2.5 px-3">Tag Number</th>
                  <th className="py-2.5 px-3">Asset Name</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-2 w-8"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentScannedItems.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-slate-400 text-xs">
                      No items scanned yet in this session.
                    </td>
                  </tr>
                ) : (
                  recentScannedItems.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/70">
                      <td className="py-2 px-3 text-[11px] text-slate-500 whitespace-nowrap">{item.time}</td>
                      <td className="py-2 px-3 font-mono font-bold text-slate-800">{item.serialNumber}</td>
                      <td className="py-2 px-3 font-mono text-[#6C2BD9] font-semibold">{item.tagNumber}</td>
                      <td className="py-2 px-3 font-semibold text-slate-700 truncate max-w-[160px]">{item.assetName}</td>
                      <td className="py-2 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {item.status}
                        </span>
                      </td>
                      <td className="py-2 px-2 text-right">
                        <button
                          onClick={() => handleRemoveScannedItem(item.id)}
                          className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                          title="Remove item"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary (5 Cols) */}
        <div className="lg:col-span-5 glass-panel p-4 flex flex-col justify-between space-y-4 relative">
          <div>
            <h2 className="text-xs font-bold text-slate-900 tracking-tight mb-3">Summary</h2>

            {/* 4 Metric Boxes */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {/* Box 1: PO Items */}
              <div className="p-2.5 rounded-xl border border-purple-100 bg-purple-50/50 flex flex-col items-center justify-center text-center">
                <div className="w-7 h-7 rounded-lg bg-purple-500 text-white flex items-center justify-center mb-1 shadow-2xs">
                  <Package className="w-4 h-4" />
                </div>
                <span className="text-lg font-black text-slate-900">{totalPoItems}</span>
                <span className="text-[10px] font-bold text-slate-500">PO Items</span>
              </div>

              {/* Box 2: Received */}
              <div className="p-2.5 rounded-xl border border-emerald-100 bg-emerald-50/50 flex flex-col items-center justify-center text-center">
                <div className="w-7 h-7 rounded-lg bg-emerald-500 text-white flex items-center justify-center mb-1 shadow-2xs">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <span className="text-lg font-black text-slate-900">{totalUnitsReceived}</span>
                <span className="text-[10px] font-bold text-slate-500">Received</span>
              </div>

              {/* Box 3: Tagged */}
              <div className="p-2.5 rounded-xl border border-teal-100 bg-teal-50/50 flex flex-col items-center justify-center text-center">
                <div className="w-7 h-7 rounded-lg bg-teal-600 text-white flex items-center justify-center mb-1 shadow-2xs">
                  <Barcode className="w-4 h-4" />
                </div>
                <span className="text-lg font-black text-slate-900">{totalUnitsTagged}</span>
                <span className="text-[10px] font-bold text-slate-500">Tagged</span>
              </div>

              {/* Box 4: Pending */}
              <div className="p-2.5 rounded-xl border border-amber-100 bg-amber-50/50 flex flex-col items-center justify-center text-center">
                <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center mb-1 shadow-2xs">
                  <Clock className="w-4 h-4" />
                </div>
                <span className="text-lg font-black text-slate-900">{totalUnitsPending}</span>
                <span className="text-[10px] font-bold text-slate-500">Pending</span>
              </div>
            </div>
          </div>

          {/* Action Buttons: Save as Draft & Proceed to Review */}
          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={handleSaveDraft}
              className="flex-1 py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
            >
              Save as Draft
            </button>
            <button
              onClick={() => {
                setShowReviewModal(true);
                setCurrentStep(4);
              }}
              className="flex-1 py-2.5 px-4 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
            >
              Proceed to Review →
            </button>
          </div>
        </div>
      </div>

      {/* PO Search Modal */}
      {showPoSearchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Search className="w-4 h-4 text-[#6C2BD9]" /> Select Purchase Order from ERP
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => { setShowPoSearchModal(false); setShowCreatePoModal(true); }}
                  className="px-2.5 py-1 text-xs font-bold text-white bg-[#6C2BD9] hover:bg-[#5B21B6] rounded-lg shadow-2xs cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> New PO
                </button>
                <button
                  onClick={() => setShowPoSearchModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Helper Banner */}
            <div className="p-3 bg-purple-50/70 border border-purple-200/70 rounded-xl flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-purple-900 block">No ERP Purchase Order?</span>
                <span className="text-[11px] text-purple-700 block">Create a manual PO or use direct non-PO intake.</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowPoSearchModal(false);
                  navigate('/receiving/without-po');
                }}
                className="px-2.5 py-1 bg-white border border-purple-200 text-[#6C2BD9] font-bold rounded-lg hover:bg-purple-100 text-xs cursor-pointer"
              >
                Receive without PO →
              </button>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto">
              {availablePos.length === 0 && <p className="text-xs text-slate-500 p-3">No purchase orders found. Create one to start receiving.</p>}
              {availablePos.map((po) => (
                <div
                  key={po.poNumber}
                  onClick={() => handleSelectPo(po.poNumber)}
                  className="p-3 rounded-xl border border-slate-200 hover:border-[#6C2BD9] hover:bg-purple-50/30 transition-all cursor-pointer flex items-center justify-between"
                >
                  <div>
                    <span className="font-mono font-bold text-xs text-[#6C2BD9] block">{po.poNumber}</span>
                    <span className="text-xs font-semibold text-slate-800">{po.supplier}</span>
                    <span className="text-[10px] text-slate-400 block">
                      PO Date: {po.poDate} • Lines: {po.lineItems?.length || 0}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tagging Settings Modal (Badge 5) */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Settings className="w-4 h-4 text-[#6C2BD9]" /> Tagging Settings & Printers
              </h3>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Thermal Label Printer</label>
                <select
                  value={taggingSettings.defaultPrinter}
                  onChange={(e) => setTaggingSettings({ ...taggingSettings, defaultPrinter: e.target.value })}
                  className="w-full p-2 rounded-xl border border-slate-200 bg-white"
                >
                  <option value="Zebra ZT411 RFID (Warehouse Dock 2)">Zebra ZT411 RFID (Warehouse Dock 2)</option>
                  <option value="SATO CL4NX Plus RFID (IT Lab)">SATO CL4NX Plus RFID (IT Lab)</option>
                  <option value="Dymo LabelWriter 550">Dymo LabelWriter 550</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Tag Format</label>
                <select
                  value={taggingSettings.tagFormat}
                  onChange={(e) => setTaggingSettings({ ...taggingSettings, tagFormat: e.target.value })}
                  className="w-full p-2 rounded-xl border border-slate-200 bg-white"
                >
                  <option value="CODE_128">Code 128 Standard Barcode</option>
                  <option value="QR_CODE">2D QR Code ISO/IEC 18004</option>
                  <option value="RFID_EPC">RFID UHF EPC Gen2</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Label Template</label>
                <select
                  value={taggingSettings.labelTemplate}
                  onChange={(e) => setTaggingSettings({ ...taggingSettings, labelTemplate: e.target.value })}
                  className="w-full p-2 rounded-xl border border-slate-200 bg-white"
                >
                  <option value="STANDARD_2X1">Standard 2.0" × 1.0" Asset Label</option>
                  <option value="HEAVY_DUTY_3X1">Heavy-Duty 3.0" × 1.0" Metal Mount</option>
                  <option value="MINI_IT_1X05">Compact 1.5" × 0.5" Micro-Tag</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Scanner Input Interface</label>
                <select
                  value={taggingSettings.scannerInterface}
                  onChange={(e) => setTaggingSettings({ ...taggingSettings, scannerInterface: e.target.value })}
                  className="w-full p-2 rounded-xl border border-slate-200 bg-white"
                >
                  <option value="KEYBOARD_WEDGE">Keyboard Wedge / USB Emulation</option>
                  <option value="SERIAL_COM">Serial COM Port (Baud 9600)</option>
                  <option value="RFID_NETWORK_TCP">RFID Reader TCP/IP Direct Stream</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => {
                  setShowSettingsModal(false);
                  showNotification('Tagging preferences saved.', 'success');
                }}
                className="px-5 py-2 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white text-xs font-bold rounded-xl"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review & Submit Modal (Step 4) */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-[#6C2BD9]" /> Review & Confirm Receiving Transaction
                </h3>
                <p className="text-xs text-slate-500">
                  Reference: <span className="font-mono font-bold text-[#6C2BD9]">{referenceNo}</span> • PO: {poNumber}
                </p>
              </div>
              <button
                onClick={() => setShowReviewModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {/* Summary Stats in Review */}
              <div className="grid grid-cols-3 gap-2.5">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Supplier</span>
                  <span className="text-xs font-bold text-slate-800 truncate block mt-0.5">{supplier}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Location</span>
                  <span className="text-xs font-bold text-slate-800 truncate block mt-0.5">{receivingLocation}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Units Tagged</span>
                  <span className="text-xs font-black text-[#6C2BD9] block mt-0.5">{recentScannedItems.length} units</span>
                </div>
              </div>

              {/* Individual Tagged Units */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Assets & Tag Associations to Post ({recentScannedItems.length})
                </h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600 text-[11px]">
                      <tr>
                        <th className="py-2 px-3">Serial #</th>
                        <th className="py-2 px-3">Tag Number</th>
                        <th className="py-2 px-3">Asset Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                      {recentScannedItems.map((item, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="py-2 px-3 font-bold text-slate-800">{item.serialNumber}</td>
                          <td className="py-2 px-3 text-[#6C2BD9]">{item.tagNumber}</td>
                          <td className="py-2 px-3 font-sans text-slate-700">{item.assetName}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Dynamic Approval Routing Option */}
              <div className="p-3 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-purple-900 block">
                    Submit to Dynamic Asset Approval Workflow
                  </span>
                  <span className="text-[11px] text-purple-700 block">
                    Received assets will require Asset Manager authorization before entering Active service.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={requireApproval}
                  onChange={(e) => setRequireApproval(e.target.checked)}
                  className="w-4 h-4 rounded border-purple-300 text-[#6C2BD9] focus:ring-[#6C2BD9]"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => setShowReviewModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
              >
                Back to Edit
              </button>

              <button
                onClick={handleFinalSubmit}
                disabled={submitting}
                className="px-6 py-2.5 bg-[#6C2BD9] hover:bg-[#5B21B6] disabled:bg-slate-300 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer active:scale-95"
              >
                {submitting ? 'Posting Transaction...' : 'Confirm & Post Receiving'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Line Item Details Modal */}
      {viewingLineItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 flex flex-col max-h-[90vh] space-y-5 animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center p-1.5 shrink-0 overflow-hidden">
                  <img
                    src={viewingLineItem.imageUrl}
                    alt={viewingLineItem.description}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                  <Package className="w-6 h-6 text-[#6C2BD9]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900 leading-tight">
                      {viewingLineItem.description}
                    </h3>
                    <span
                      className={clsx(
                        'px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase',
                        viewingLineItem.status === 'Completed'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : viewingLineItem.status === 'In Progress'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      )}
                    >
                      {viewingLineItem.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    Part #{viewingLineItem.partNumber} • Category: {viewingLineItem.category || 'General Hardware'} • Model: {viewingLineItem.model || 'Standard'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewingLineItem(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {/* Quantities & Fulfillment Metric */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Ordered Qty</span>
                  <span className="text-xl font-black text-slate-800 block mt-0.5">{viewingLineItem.orderedQty}</span>
                  <span className="text-[10px] text-slate-500">Per Purchase Order</span>
                </div>
                <div className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-200/80">
                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">Received Qty</span>
                  <span className="text-xl font-black text-emerald-700 block mt-0.5">{viewingLineItem.receivedQty}</span>
                  <span className="text-[10px] text-emerald-600/80">
                    {Math.round(((viewingLineItem.receivedQty || 0) / (viewingLineItem.orderedQty || 1)) * 100)}% Fulfilled
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-purple-50/50 border border-purple-200/80">
                  <span className="text-[10px] font-bold text-[#6C2BD9] uppercase tracking-wider block">Pending Qty</span>
                  <span className="text-xl font-black text-[#6C2BD9] block mt-0.5">{viewingLineItem.pendingQty}</span>
                  <span className="text-[10px] text-purple-600/80">Remaining to Intake</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                  <span>Intake Fulfillment Progress</span>
                  <span>
                    {viewingLineItem.receivedQty} of {viewingLineItem.orderedQty} Units Received
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
                  <div
                    className="h-full bg-gradient-to-r from-[#6C2BD9] to-emerald-500 transition-all duration-300"
                    style={{
                      width: `${Math.min(100, Math.round(((viewingLineItem.receivedQty || 0) / (viewingLineItem.orderedQty || 1)) * 100))}%`
                    }}
                  />
                </div>
              </div>

              {/* Purchase Order & Destination Context */}
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">PO Reference</span>
                  <span className="font-mono font-bold text-slate-800">{poNumber || 'PO-2026-00456'}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Supplier / Vendor</span>
                  <span className="font-semibold text-slate-800 truncate block">{supplier || 'Dell Technologies'}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Intake Site / Store</span>
                  <span className="font-semibold text-slate-800">{receivingLocation || 'Dubai HQ - IT Store'}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Expected Delivery</span>
                  <span className="font-semibold text-slate-800">{expectedDeliveryDate || '2026-08-20'}</span>
                </div>
              </div>

              {/* Scanned & Received Assets for this line */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Barcode className="w-3.5 h-3.5 text-[#6C2BD9]" />
                    Associated Units & Tag Identifiers ({viewingLineItem.receivedQty})
                  </h4>
                  <span className="text-[11px] text-slate-400">Unique Hardware Credentials</span>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden max-h-56 overflow-y-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600 text-[11px]">
                      <tr>
                        <th className="py-2 px-3">#</th>
                        <th className="py-2 px-3">Serial Number</th>
                        <th className="py-2 px-3">Tag / Barcode</th>
                        <th className="py-2 px-3">RFID EPC</th>
                        <th className="py-2 px-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                      {(() => {
                        const matching = recentScannedItems.filter(
                          (s) =>
                            s.assetName === viewingLineItem.description ||
                            s.serialNumber?.startsWith(viewingLineItem.partNumber)
                        );

                        const displayUnits = [...matching];
                        if (displayUnits.length < viewingLineItem.receivedQty) {
                          const needed = viewingLineItem.receivedQty - displayUnits.length;
                          for (let i = 1; i <= needed; i++) {
                            const unitIndex = displayUnits.length + 1;
                            displayUnits.push({
                              id: `item-gen-${unitIndex}`,
                              serialNumber: `${viewingLineItem.partNumber}-${String(unitIndex).padStart(3, '0')}`,
                              tagNumber: `E360000${String(12340 + unitIndex)}`,
                              rfidEpc: `E28011606000${String(12340 + unitIndex)}`,
                              status: 'Tagged'
                            });
                          }
                        }

                        if (displayUnits.length === 0) {
                          return (
                            <tr>
                              <td colSpan={5} className="py-6 text-center text-slate-400 font-sans">
                                No units scanned for this line item yet.
                              </td>
                            </tr>
                          );
                        }

                        return displayUnits.map((unit, uIdx) => (
                          <tr key={uIdx} className="hover:bg-purple-50/30">
                            <td className="py-2 px-3 font-sans text-slate-400">{uIdx + 1}</td>
                            <td className="py-2 px-3 font-bold text-slate-800">{unit.serialNumber}</td>
                            <td className="py-2 px-3 text-[#6C2BD9] font-bold">{unit.tagNumber}</td>
                            <td className="py-2 px-3 text-slate-500 truncate max-w-[140px]">{unit.rfidEpc || '-'}</td>
                            <td className="py-2 px-3 text-center font-sans">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                {unit.status || 'Verified'}
                              </span>
                            </td>
                          </tr>
                        ));
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => setViewingLineItem(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Close
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    showNotification(`Sent label print job for line item ${viewingLineItem.partNumber} to ${taggingSettings.defaultPrinter}`, 'success');
                  }}
                  className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Printer className="w-3.5 h-3.5 text-[#6C2BD9]" />
                  Print Labels ({viewingLineItem.receivedQty})
                </button>

                {viewingLineItem.pendingQty > 0 && (
                  <button
                    onClick={() => {
                      setSelectedLineItem(viewingLineItem);
                      handleScanLookup(`${viewingLineItem.partNumber}-001`);
                      setCurrentStep(2);
                      setViewingLineItem(null);
                    }}
                    className="px-4 py-2 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    Receive Remaining ({viewingLineItem.pendingQty}) →
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Purchase Order Modal */}
      {showCreatePoModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] space-y-4 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-100 text-[#6C2BD9] flex items-center justify-center">
                  <Plus className="w-4 h-4 font-bold" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Create New Purchase Order</h3>
                  <p className="text-[11px] text-slate-500">
                    Add order specifications & line items to receive against immediately
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCreatePoModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Content */}
            <form onSubmit={handleCreatePoSubmit} className="flex-1 overflow-y-auto space-y-4 pr-1">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    PO Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newPoForm.poNumber}
                    onChange={(e) => setNewPoForm({ ...newPoForm, poNumber: e.target.value })}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono font-bold text-slate-800 focus:border-[#6C2BD9]"
                    placeholder="e.g. PO-2026-9001"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Supplier / Vendor <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newPoForm.supplier}
                    onChange={(e) => setNewPoForm({ ...newPoForm, supplier: e.target.value })}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 font-medium text-slate-800 focus:border-[#6C2BD9]"
                    placeholder="e.g. Dell Technologies, HP, Cisco"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">PO Date</label>
                  <input
                    type="date"
                    value={newPoForm.poDate}
                    onChange={(e) => setNewPoForm({ ...newPoForm, poDate: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 font-medium text-slate-800 focus:border-[#6C2BD9]"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Expected Delivery</label>
                  <input
                    type="date"
                    value={newPoForm.expectedDeliveryDate}
                    onChange={(e) => setNewPoForm({ ...newPoForm, expectedDeliveryDate: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 font-medium text-slate-800 focus:border-[#6C2BD9]"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Currency</label>
                  <select
                    value={newPoForm.currency}
                    onChange={(e) => setNewPoForm({ ...newPoForm, currency: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 font-medium text-slate-800 bg-white"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="AED">AED (د.إ)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
              </div>

              {/* Line Items Builder */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    PO Line Items ({newPoForm.lineItems.length})
                  </span>
                  <button
                    type="button"
                    onClick={handleAddPoLineItem}
                    className="text-xs text-[#6C2BD9] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Line Item
                  </button>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 max-h-56 overflow-y-auto">
                  {newPoForm.lineItems.map((line, idx) => (
                    <div key={line.id || idx} className="p-3 bg-white hover:bg-slate-50 flex items-center gap-2.5 text-xs">
                      <span className="text-slate-400 font-bold text-[11px] w-4">{idx + 1}</span>
                      <div className="flex-1 grid grid-cols-12 gap-2">
                        <div className="col-span-4">
                          <input
                            type="text"
                            value={line.description}
                            onChange={(e) => handleUpdatePoLineItem(idx, 'description', e.target.value)}
                            placeholder="Asset Description"
                            className="w-full px-2 py-1 border border-slate-200 rounded-md font-semibold text-slate-800"
                            required
                          />
                        </div>
                        <div className="col-span-3">
                          <input
                            type="text"
                            value={line.partNumber}
                            onChange={(e) => handleUpdatePoLineItem(idx, 'partNumber', e.target.value)}
                            placeholder="Part / SKU"
                            className="w-full px-2 py-1 border border-slate-200 rounded-md font-mono text-slate-700"
                            required
                          />
                        </div>
                        <div className="col-span-3">
                          <input
                            type="text"
                            value={line.category}
                            onChange={(e) => handleUpdatePoLineItem(idx, 'category', e.target.value)}
                            placeholder="Category"
                            className="w-full px-2 py-1 border border-slate-200 rounded-md text-slate-700"
                          />
                        </div>
                        <div className="col-span-2">
                          <input
                            type="number"
                            min="1"
                            value={line.orderedQty}
                            onChange={(e) => handleUpdatePoLineItem(idx, 'orderedQty', e.target.value)}
                            placeholder="Qty"
                            className="w-full px-2 py-1 border border-slate-200 rounded-md text-center font-bold text-slate-800"
                            required
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemovePoLineItem(idx)}
                        className="p-1 text-slate-400 hover:text-rose-500 rounded-md cursor-pointer"
                        title="Remove Line"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setShowCreatePoModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <Check className="w-4 h-4" /> Create & Start Receiving
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


    </div>
  );
}
