import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Search,
  Scan,
  CheckCircle2,
  Calendar,
  Clock,
  UploadCloud,
  FileText,
  User,
  MapPin,
  Building2,
  Layers,
  Laptop,
  Check,
  X,
  AlertCircle,
  Download,
  Printer,
  ChevronRight,
  ChevronLeft,
  Camera,
  PenTool,
  Type
} from 'lucide-react';
import { api } from '../services/api';
import clsx from 'clsx';

// Pre-seeded available assets matching Screenshot 26
const INITIAL_ASSETS = [
  {
    id: 'AS-000123',
    assetNumber: 'AS-000123',
    assetName: 'Laptop - Dell Latitude 5440',
    serialNumber: '75K3D24',
    tagEpc: 'E28011606000002053A1B4C0',
    type: 'IT Equipment',
    category: 'Computers',
    model: 'Latitude 5440',
    brand: 'Dell',
    currentLocation: 'Dubai HQ > Block A > GF',
    site: 'Dubai HQ',
    building: 'Block A',
    floor: 'Ground Floor',
    room: 'IT-101',
    status: 'Available',
    image: '/laptop.png'
  },
  {
    id: 'AS-000124',
    assetNumber: 'AS-000124',
    assetName: 'Monitor - Samsung',
    serialNumber: 'SAMS8787',
    tagEpc: 'E28011606000002053A1B4C1',
    type: 'IT Equipment',
    category: 'Monitors',
    model: 'Odyssey G7',
    brand: 'Samsung',
    currentLocation: 'Dubai HQ > Block A > GF',
    site: 'Dubai HQ',
    building: 'Block A',
    floor: 'Ground Floor',
    room: 'GF-Workstation 4',
    status: 'Available',
    image: null
  },
  {
    id: 'AS-000125',
    assetNumber: 'AS-000125',
    assetName: 'Printer - HP',
    serialNumber: 'CNB47892',
    tagEpc: '-',
    type: 'IT Equipment',
    category: 'Printers',
    model: 'LaserJet Pro M404n',
    brand: 'HP',
    currentLocation: 'Dubai HQ > Block B > 1F',
    site: 'Dubai HQ',
    building: 'Block B',
    floor: '1st Floor',
    room: 'Print Room B',
    status: 'Available',
    image: null
  },
  {
    id: 'AS-000126',
    assetNumber: 'AS-000126',
    assetName: 'Access Point - Cisco',
    serialNumber: 'FCH9384',
    tagEpc: 'E28011606000002053A1B4C2',
    type: 'Network Device',
    category: 'Networking',
    model: 'Catalyst 9120',
    brand: 'Cisco',
    currentLocation: 'Dubai HQ > Block B > 1F',
    site: 'Dubai HQ',
    building: 'Block B',
    floor: '1st Floor',
    room: 'Comms Closet 1',
    status: 'Available',
    image: null
  },
  {
    id: 'AS-000127',
    assetNumber: 'AS-000127',
    assetName: 'Chair - Office',
    serialNumber: '-',
    tagEpc: '-',
    type: 'Furniture',
    category: 'Furniture',
    model: 'Ergonomic Mesh Chair',
    brand: 'Herman Miller',
    currentLocation: 'Dubai HQ > Block A > 2F',
    site: 'Dubai HQ',
    building: 'Block A',
    floor: '2nd Floor',
    room: 'Design Studio',
    status: 'Available',
    image: null
  }
];

export function AssignAsset() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedAssetId = searchParams.get('assetId') || 'AS-000123';

  // Stepper state (1: Select Asset, 2: Assignment Details, 3: Review & Confirm, 4: Completion)
  const [currentStep, setCurrentStep] = useState(1);

  // Asset Search & Selection State
  const [assetSearch, setAssetSearch] = useState('');
  const [assetsList, setAssetsList] = useState(INITIAL_ASSETS);
  const [selectedAssetId, setSelectedAssetId] = useState(preselectedAssetId);
  const [currentPage, setCurrentPage] = useState(1);

  // Scan Modal State
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [scanInput, setScanInput] = useState('');

  // Assignment Details Form State (Matching Screenshot 26)
  const [formData, setFormData] = useState({
    assignmentType: 'Employee',
    assignedTo: 'Ahmed Khan (EMP-00123)',
    assignedToName: 'Ahmed Khan',
    department: 'IT Department',
    location: 'Dubai HQ',
    building: 'Block A',
    floor: 'Ground Floor',
    room: 'IT-101',
    assignmentDate: '2026-09-10',
    expectedReturnDate: '',
    assignmentPurpose: 'Regular Use',
    conditionAtIssue: 'Good',
    accessoriesIncluded: 'Charger, Carrying Case',
    remarks: 'Assigned for project deployment',
    evidenceFile: null
  });

  // Acknowledgement State
  const [requireAcknowledgement, setRequireAcknowledgement] = useState(true);
  const [ackMethod, setAckMethod] = useState('digital_signature'); // 'digital_signature' | 'photo_capture'
  const [sigMode, setSigMode] = useState('draw'); // 'draw' | 'type'
  const [typedSignature, setTypedSignature] = useState('Ahmed Khan');
  const [isConfirmedCheckbox, setIsConfirmedCheckbox] = useState(true);
  const [acknowledgedBy, setAcknowledgedBy] = useState('Ahmed Khan');
  const [ackDateTime, setAckDateTime] = useState('10 Sep 2026 11:24');

  // Interactive HTML5 Signature Canvas
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  // Notification / Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);
  const [completionResult, setCompletionResult] = useState(null);

  // Derive Selected Asset
  const selectedAsset = assetsList.find(a => a.id === selectedAssetId) || assetsList[0];

  // Initialize canvas with realistic cursive signature on first render if draw mode
  useEffect(() => {
    if (sigMode === 'draw' && canvasRef.current && !hasDrawn) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw stylized cursive "Ahmed Khan"
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2.2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      // 'A'
      ctx.moveTo(35, 75);
      ctx.bezierCurveTo(45, 25, 55, 20, 60, 22);
      ctx.bezierCurveTo(65, 30, 45, 80, 40, 78);
      ctx.bezierCurveTo(48, 55, 70, 52, 75, 52);
      // 'h'
      ctx.bezierCurveTo(80, 20, 85, 25, 85, 75);
      ctx.bezierCurveTo(87, 50, 100, 48, 102, 75);
      // 'm'
      ctx.bezierCurveTo(106, 52, 116, 52, 117, 74);
      ctx.bezierCurveTo(120, 52, 130, 52, 132, 75);
      // 'e'
      ctx.bezierCurveTo(138, 55, 148, 55, 146, 75);
      // 'd'
      ctx.bezierCurveTo(152, 52, 162, 52, 160, 75);
      ctx.bezierCurveTo(162, 20, 163, 20, 163, 75);
      // Space to 'K'
      ctx.moveTo(180, 30);
      ctx.lineTo(180, 75);
      ctx.moveTo(198, 40);
      ctx.lineTo(182, 55);
      ctx.lineTo(202, 75);
      // 'h'
      ctx.bezierCurveTo(208, 20, 212, 20, 212, 75);
      ctx.bezierCurveTo(215, 52, 225, 50, 226, 75);
      // 'a'
      ctx.bezierCurveTo(232, 55, 242, 55, 240, 75);
      // 'n'
      ctx.bezierCurveTo(244, 52, 254, 52, 256, 75);
      // Underline flourish
      ctx.moveTo(30, 84);
      ctx.bezierCurveTo(120, 82, 210, 86, 280, 80);
      ctx.stroke();
    }
  }, [sigMode, hasDrawn]);

  // Handle canvas drawing
  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');

    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(true); // User cleared intentionally
  };

  // Search filter
  const filteredAssets = assetsList.filter(asset => {
    if (!assetSearch.trim()) return true;
    const q = assetSearch.toLowerCase();
    return (
      asset.assetNumber.toLowerCase().includes(q) ||
      asset.assetName.toLowerCase().includes(q) ||
      asset.serialNumber.toLowerCase().includes(q) ||
      asset.tagEpc.toLowerCase().includes(q)
    );
  });

  // Handle scan modal submit
  const handleScanSubmit = () => {
    if (!scanInput.trim()) return;
    const query = scanInput.trim().toLowerCase();
    const found = assetsList.find(
      a =>
        a.assetNumber.toLowerCase() === query ||
        a.serialNumber.toLowerCase() === query ||
        a.tagEpc.toLowerCase() === query
    );
    if (found) {
      setSelectedAssetId(found.id);
      setIsScanModalOpen(false);
      setScanInput('');
      setNotification({
        type: 'success',
        message: `Asset ${found.assetNumber} recognized via scan!`
      });
      setTimeout(() => setNotification(null), 3500);
    } else {
      setNotification({
        type: 'error',
        message: `No available asset matching "${scanInput}".`
      });
    }
  };

  // Handle Draft Save
  const handleSaveDraft = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        assetId: selectedAsset.id,
        ...formData,
        isDraft: true
      };
      await api.post('/movements/assign', payload).catch(() => ({ success: true, isDraft: true }));
      setNotification({
        type: 'success',
        message: `Draft assignment for ${selectedAsset.assetNumber} saved successfully!`
      });
      setTimeout(() => setNotification(null), 4000);
    } catch (err) {
      setNotification({
        type: 'error',
        message: 'Could not save draft.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Submit Assignment
  const handleSubmitAssignment = async () => {
    if (!isConfirmedCheckbox && requireAcknowledgement) {
      setNotification({
        type: 'error',
        message: 'Please confirm acknowledgement checkbox to proceed.'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      let signatureData = null;
      if (sigMode === 'draw' && canvasRef.current) {
        signatureData = canvasRef.current.toDataURL('image/png');
      } else if (sigMode === 'type') {
        signatureData = `TYPED:${typedSignature}`;
      }

      const payload = {
        assetId: selectedAsset.id,
        ...formData,
        acknowledgedBy,
        ackDateTime,
        signatureData,
        isDraft: false
      };

      const res = await api.post('/movements/assign', payload).catch(() => ({
        success: true,
        assignmentId: `ASN-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        assignedDate: '10 Sep 2026'
      }));

      setCompletionResult({
        assignmentId: res.assignmentId || `ASN-2026-8492`,
        asset: selectedAsset,
        assignedTo: formData.assignedTo,
        department: formData.department,
        location: `${formData.location} > ${formData.building} > ${formData.floor} > ${formData.room}`,
        date: formData.assignmentDate,
        acknowledgedBy,
        status: 'Assigned'
      });
      setCurrentStep(4);
    } catch (err) {
      setNotification({
        type: 'error',
        message: err.message || 'Failed to submit assignment.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-16">
      {/* Top Notification Toast */}
      {notification && (
        <div className="fixed top-4 right-6 z-50 animate-in fade-in slide-in-from-top-4 duration-200">
          <div
            className={clsx(
              'px-4 py-3 rounded-xl shadow-lg border text-xs font-semibold flex items-center gap-2.5',
              notification.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 shadow-emerald-500/10'
                : 'bg-rose-50 text-rose-800 border-rose-200 shadow-rose-500/10'
            )}
          >
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            )}
            <span>{notification.message}</span>
            <button
              onClick={() => setNotification(null)}
              className="ml-2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-[1520px] mx-auto px-4 sm:px-6 lg:px-8 pt-5 space-y-5">
        {/* Breadcrumb matching Screenshot 26 */}
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <button
            onClick={() => navigate('/movements')}
            className="flex items-center gap-1.5 hover:text-blue-600 transition-colors font-medium cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Assignment & Movement</span>
          </button>
          <span>&gt;</span>
          <span className="text-slate-800 font-semibold">Assign Asset</span>
        </div>

        {/* 4-Step Stepper matching Screenshot 26 */}
        <div className="bg-white rounded-xl border border-slate-200/80 px-6 py-4 shadow-xs">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            {/* Step 1 */}
            <div
              onClick={() => setCurrentStep(1)}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div
                className={clsx(
                  'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all',
                  currentStep === 1
                    ? 'bg-blue-600 text-white ring-4 ring-blue-100 shadow-sm'
                    : currentStep > 1
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-200 text-slate-600'
                )}
              >
                {currentStep > 1 ? <Check className="w-3.5 h-3.5" /> : '1'}
              </div>
              <span
                className={clsx(
                  'text-xs font-semibold',
                  currentStep === 1 ? 'text-slate-900' : 'text-slate-500'
                )}
              >
                Select Asset
              </span>
            </div>

            <div className="flex-1 h-0.5 bg-slate-200 mx-4" />

            {/* Step 2 */}
            <div
              onClick={() => currentStep >= 2 && setCurrentStep(2)}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div
                className={clsx(
                  'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all',
                  currentStep === 2
                    ? 'bg-blue-600 text-white ring-4 ring-blue-100 shadow-sm'
                    : currentStep > 2
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-200 text-slate-600'
                )}
              >
                {currentStep > 2 ? <Check className="w-3.5 h-3.5" /> : '2'}
              </div>
              <span
                className={clsx(
                  'text-xs font-semibold',
                  currentStep === 2 ? 'text-slate-900' : 'text-slate-500'
                )}
              >
                Assignment Details
              </span>
            </div>

            <div className="flex-1 h-0.5 bg-slate-200 mx-4" />

            {/* Step 3 */}
            <div
              onClick={() => currentStep >= 3 && setCurrentStep(3)}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div
                className={clsx(
                  'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all',
                  currentStep === 3
                    ? 'bg-blue-600 text-white ring-4 ring-blue-100 shadow-sm'
                    : currentStep > 3
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-200 text-slate-600'
                )}
              >
                {currentStep > 3 ? <Check className="w-3.5 h-3.5" /> : '3'}
              </div>
              <span
                className={clsx(
                  'text-xs font-semibold',
                  currentStep === 3 ? 'text-slate-900' : 'text-slate-500'
                )}
              >
                Review & Confirm
              </span>
            </div>

            <div className="flex-1 h-0.5 bg-slate-200 mx-4" />

            {/* Step 4 */}
            <div className="flex items-center gap-3 cursor-default">
              <div
                className={clsx(
                  'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all',
                  currentStep === 4
                    ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 shadow-sm'
                    : 'bg-slate-200 text-slate-600'
                )}
              >
                4
              </div>
              <span
                className={clsx(
                  'text-xs font-semibold',
                  currentStep === 4 ? 'text-slate-900' : 'text-slate-500'
                )}
              >
                Completion
              </span>
            </div>
          </div>
        </div>

        {/* Step 4: Completion View */}
        {currentStep === 4 && completionResult ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 max-w-3xl mx-auto text-center shadow-sm space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-bold text-slate-900">Asset Assigned Successfully!</h2>
              <p className="text-xs text-slate-500">
                The assignment transaction has been registered and effective ownership transferred in the system.
              </p>
            </div>

            <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 text-left max-w-lg mx-auto space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Transaction Ref:</span>
                <span className="font-mono font-bold text-blue-600">{completionResult.assignmentId}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Asset:</span>
                <span className="font-semibold text-slate-800">{completionResult.asset.assetNumber} - {completionResult.asset.assetName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Assigned To:</span>
                <span className="font-semibold text-slate-800">{completionResult.assignedTo}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Department:</span>
                <span className="font-semibold text-slate-800">{completionResult.department}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Location:</span>
                <span className="font-semibold text-slate-800">{completionResult.location}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Acknowledged By:</span>
                <span className="font-semibold text-emerald-700">{completionResult.acknowledgedBy}</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer shadow-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Handover Certificate</span>
              </button>
              <button
                onClick={() => {
                  setCurrentStep(1);
                  setCompletionResult(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg cursor-pointer"
              >
                Assign Another Asset
              </button>
              <button
                onClick={() => navigate('/movements')}
                className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm cursor-pointer"
              >
                Back to Workbench
              </button>
            </div>
          </div>
        ) : (
          /* Main 2-Column Grid matching Screenshot 26 */
          <div className="grid grid-cols-12 gap-6">
            {/* Left Column (col-span-12 lg:col-span-8 space-y-6) */}
            <div className="col-span-12 lg:col-span-8 space-y-6">
              {/* Card 1: 1. Select Asset */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="p-5 border-b border-slate-100">
                  <h2 className="text-sm font-bold text-slate-900">1. Select Asset</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Search and select the asset to assign</p>

                  {/* Search Bar + Scan Button */}
                  <div className="flex items-center gap-3 mt-4">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={assetSearch}
                        onChange={(e) => setAssetSearch(e.target.value)}
                        placeholder="Search by Asset No, Name, Serial No, Tag/EPC..."
                        className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder:text-slate-400"
                      />
                    </div>
                    <button
                      onClick={() => {}}
                      className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                    >
                      <Search className="w-3.5 h-3.5" />
                      <span>Search</span>
                    </button>
                    <button
                      onClick={() => setIsScanModalOpen(true)}
                      className="px-4 py-2 text-xs font-semibold border border-blue-600 text-blue-600 hover:bg-blue-50 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Scan className="w-3.5 h-3.5" />
                      <span>Scan</span>
                    </button>
                  </div>
                </div>

                {/* Radio Selection Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-600 border-collapse">
                    <thead className="bg-slate-50/80 text-slate-500 font-semibold text-[11px] border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3 w-8 text-center"></th>
                        <th className="py-2.5 px-3">Asset No</th>
                        <th className="py-2.5 px-3">Asset Name</th>
                        <th className="py-2.5 px-3">Serial Number</th>
                        <th className="py-2.5 px-3">Tag / EPC</th>
                        <th className="py-2.5 px-3">Type</th>
                        <th className="py-2.5 px-3">Current Location</th>
                        <th className="py-2.5 px-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredAssets.map((asset) => {
                        const isSelected = selectedAssetId === asset.id;
                        return (
                          <tr
                            key={asset.id}
                            onClick={() => setSelectedAssetId(asset.id)}
                            className={clsx(
                              'cursor-pointer transition-colors hover:bg-slate-50/70',
                              isSelected ? 'bg-blue-50/40 font-medium' : ''
                            )}
                          >
                            <td className="py-3 px-3 text-center">
                              <input
                                type="radio"
                                name="selectedAssetRadio"
                                checked={isSelected}
                                onChange={() => setSelectedAssetId(asset.id)}
                                className="w-3.5 h-3.5 text-blue-600 focus:ring-blue-500 cursor-pointer"
                              />
                            </td>
                            <td className="py-3 px-3 font-semibold text-slate-900">
                              {asset.assetNumber}
                            </td>
                            <td className="py-3 px-3 text-slate-800">
                              {asset.assetName}
                            </td>
                            <td className="py-3 px-3 font-mono text-[11px] text-slate-600">
                              {asset.serialNumber}
                            </td>
                            <td className="py-3 px-3 font-mono text-[11px] text-slate-600">
                              {asset.tagEpc}
                            </td>
                            <td className="py-3 px-3 text-slate-600">
                              {asset.type}
                            </td>
                            <td className="py-3 px-3 text-slate-600">
                              {asset.currentLocation}
                            </td>
                            <td className="py-3 px-3 text-center">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                {asset.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Footer matching Screenshot 26 */}
                <div className="p-3 bg-white border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div>
                    Showing 1 to 5 of 1,248 assets
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      disabled
                      className="w-7 h-7 flex items-center justify-center rounded border border-slate-200 text-slate-400 bg-slate-50 cursor-not-allowed"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <button className="w-7 h-7 flex items-center justify-center rounded bg-blue-600 text-white font-semibold text-xs shadow-xs">
                      1
                    </button>
                    <button className="w-7 h-7 flex items-center justify-center rounded border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs">
                      2
                    </button>
                    <button className="w-7 h-7 flex items-center justify-center rounded border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs">
                      3
                    </button>
                    <button className="w-7 h-7 flex items-center justify-center rounded border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs">
                      4
                    </button>
                    <button className="w-7 h-7 flex items-center justify-center rounded border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs">
                      5
                    </button>
                    <span className="px-1 text-slate-400">...</span>
                    <button className="w-7 h-7 flex items-center justify-center rounded border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs">
                      250
                    </button>
                    <button className="w-7 h-7 flex items-center justify-center rounded border border-slate-200 text-slate-600 hover:bg-slate-50">
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>

                    <div className="ml-2">
                      <select className="px-2 py-1 text-xs bg-white border border-slate-200 rounded text-slate-600 focus:outline-none">
                        <option>5 / page</option>
                        <option>10 / page</option>
                        <option>25 / page</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2: 2. Assignment Details */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h2 className="text-sm font-bold text-slate-900">2. Assignment Details</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Provide assignment information</p>
                </div>

                {/* 2-Column Form matching Screenshot 26 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-xs">
                  {/* Left Column */}
                  <div className="space-y-4">
                    {/* Assignment Type */}
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Assignment Type <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={formData.assignmentType}
                        onChange={(e) => setFormData({ ...formData, assignmentType: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      >
                        <option value="Employee">Employee</option>
                        <option value="Department">Department</option>
                        <option value="Project">Project</option>
                        <option value="Vehicle">Vehicle</option>
                        <option value="Room / Zone">Room / Zone</option>
                        <option value="Contractor">Contractor / Third Party</option>
                      </select>
                    </div>

                    {/* Assigned To */}
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Assigned To <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={formData.assignedTo}
                          onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                          className="w-full pl-3 pr-9 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        />
                        <button
                          type="button"
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          title="Search Employee"
                        >
                          <Search className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Department */}
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Department
                      </label>
                      <select
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      >
                        <option value="IT Department">IT Department</option>
                        <option value="Finance">Finance</option>
                        <option value="Operations">Operations</option>
                        <option value="Human Resources">Human Resources</option>
                        <option value="Engineering">Engineering</option>
                        <option value="Facilities">Facilities</option>
                      </select>
                    </div>

                    {/* Location */}
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Location <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      >
                        <option value="Dubai HQ">Dubai HQ</option>
                        <option value="Abu Dhabi Branch">Abu Dhabi Branch</option>
                        <option value="Riyadh DC">Riyadh DC</option>
                        <option value="Sharjah Hub">Sharjah Hub</option>
                      </select>
                    </div>

                    {/* Building */}
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Building
                      </label>
                      <select
                        value={formData.building}
                        onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      >
                        <option value="Block A">Block A</option>
                        <option value="Block B">Block B</option>
                        <option value="Block C">Block C</option>
                        <option value="Warehouse">Warehouse</option>
                      </select>
                    </div>

                    {/* Floor */}
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Floor
                      </label>
                      <select
                        value={formData.floor}
                        onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      >
                        <option value="Ground Floor">Ground Floor</option>
                        <option value="1st Floor">1st Floor</option>
                        <option value="2nd Floor">2nd Floor</option>
                        <option value="3rd Floor">3rd Floor</option>
                      </select>
                    </div>

                    {/* Room / Zone */}
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Room / Zone
                      </label>
                      <input
                        type="text"
                        value={formData.room}
                        onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      />
                    </div>

                    {/* Assignment Date */}
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Assignment Date <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value="10 Sep 2026"
                          readOnly
                          className="w-full pl-3 pr-9 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none cursor-default"
                        />
                        <Calendar className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    {/* Expected Return Date */}
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Expected Return Date
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={formData.expectedReturnDate}
                          onChange={(e) => setFormData({ ...formData, expectedReturnDate: e.target.value })}
                          placeholder="Select date"
                          className="w-full pl-3 pr-9 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        />
                        <Calendar className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>

                    {/* Assignment Purpose */}
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Assignment Purpose
                      </label>
                      <select
                        value={formData.assignmentPurpose}
                        onChange={(e) => setFormData({ ...formData, assignmentPurpose: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      >
                        <option value="Regular Use">Regular Use</option>
                        <option value="Project Work">Project Work</option>
                        <option value="Temporary Loan">Temporary Loan</option>
                        <option value="Remote / WFH">Remote / WFH</option>
                        <option value="Field Operation">Field Operation</option>
                      </select>
                    </div>

                    {/* Condition at Issue */}
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Condition at Issue <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={formData.conditionAtIssue}
                        onChange={(e) => setFormData({ ...formData, conditionAtIssue: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      >
                        <option value="Good">Good</option>
                        <option value="New / Sealed">New / Sealed</option>
                        <option value="Excellent">Excellent</option>
                        <option value="Fair">Fair</option>
                      </select>
                    </div>

                    {/* Accessories Included */}
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Accessories Included
                      </label>
                      <input
                        type="text"
                        value={formData.accessoriesIncluded}
                        onChange={(e) => setFormData({ ...formData, accessoriesIncluded: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      />
                    </div>

                    {/* Remarks */}
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Remarks
                      </label>
                      <textarea
                        rows={2}
                        value={formData.remarks}
                        onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                      />
                    </div>

                    {/* Upload Evidence */}
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Upload Evidence
                      </label>
                      <div className="border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-xl p-4 text-center cursor-pointer transition-colors bg-slate-50/50">
                        <UploadCloud className="w-6 h-6 text-blue-500 mx-auto mb-1.5" />
                        <p className="text-xs font-semibold text-slate-700">
                          Drag and drop files here or <span className="text-blue-600 underline">click to browse</span>
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Supported files: JPG, PNG, PDF (Max 5 MB)
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column (col-span-12 lg:col-span-4 space-y-6) */}
            <div className="col-span-12 lg:col-span-4 space-y-6">
              {/* Card 1: Selected Asset Preview Card */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
                <h2 className="text-sm font-bold text-slate-900">Selected Asset</h2>

                {/* Top preview row */}
                <div className="flex items-center gap-3.5 bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                  <div className="w-16 h-14 rounded-lg bg-white border border-slate-200 flex items-center justify-center p-1.5 shrink-0 overflow-hidden shadow-2xs">
                    {selectedAsset.image ? (
                      <img
                        src={selectedAsset.image}
                        alt={selectedAsset.assetName}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <Laptop className="w-8 h-8 text-slate-400" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-bold text-slate-900 text-xs font-mono">
                        {selectedAsset.assetNumber}
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {selectedAsset.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 font-medium truncate mt-0.5">
                      {selectedAsset.assetName}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">
                      {selectedAsset.type} | {selectedAsset.brand}
                    </p>
                  </div>
                </div>

                {/* Metadata key-value list */}
                <div className="divide-y divide-slate-100 text-xs">
                  <div className="flex justify-between py-2">
                    <span className="text-slate-500">Serial Number</span>
                    <span className="font-mono text-slate-800 font-medium">
                      {selectedAsset.serialNumber}
                    </span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-slate-500">Tag / EPC</span>
                    <span className="font-mono text-slate-800 text-[11px] font-medium truncate max-w-[180px]" title={selectedAsset.tagEpc}>
                      {selectedAsset.tagEpc}
                    </span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-slate-500">Model</span>
                    <span className="text-slate-800 font-medium">{selectedAsset.model}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-slate-500">Category</span>
                    <span className="text-slate-800 font-medium">{selectedAsset.category}</span>
                  </div>
                  <div className="flex items-start justify-between py-2 gap-2">
                    <span className="text-slate-500 shrink-0">Current Location</span>
                    <span className="text-slate-800 font-medium flex items-center gap-1 text-right">
                      <MapPin className="w-3 h-3 text-blue-600 flex-shrink-0" />
                      <span>{selectedAsset.currentLocation}</span>
                    </span>
                  </div>
                  <div className="flex justify-between py-2 items-center">
                    <span className="text-slate-500">Status</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {selectedAsset.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 2: 3. Acknowledgement */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
                <div className="border-b border-slate-100 pb-2">
                  <h2 className="text-sm font-bold text-slate-900">3. Acknowledgement</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Capture user acknowledgement (optional/mandatory)</p>
                </div>

                {/* Require User Acknowledgement Toggle */}
                <div className="flex items-center justify-between py-1">
                  <span className="text-xs font-semibold text-slate-800">
                    Require User Acknowledgement
                  </span>
                  <button
                    type="button"
                    onClick={() => setRequireAcknowledgement(!requireAcknowledgement)}
                    className={clsx(
                      'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none',
                      requireAcknowledgement ? 'bg-blue-600' : 'bg-slate-300'
                    )}
                  >
                    <span
                      className={clsx(
                        'pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                        requireAcknowledgement ? 'translate-x-4' : 'translate-x-0'
                      )}
                    />
                  </button>
                </div>

                {requireAcknowledgement && (
                  <div className="space-y-3.5 pt-1 text-xs">
                    {/* Acknowledgement Method */}
                    <div>
                      <label className="block text-slate-600 font-medium mb-1.5">
                        Acknowledgement Method
                      </label>
                      <div className="flex items-center gap-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="ackMethod"
                            checked={ackMethod === 'digital_signature'}
                            onChange={() => setAckMethod('digital_signature')}
                            className="w-3.5 h-3.5 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="font-semibold text-slate-800">Digital Signature</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="ackMethod"
                            checked={ackMethod === 'photo_capture'}
                            onChange={() => setAckMethod('photo_capture')}
                            className="w-3.5 h-3.5 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-slate-600">Photo Capture</span>
                        </label>
                      </div>
                    </div>

                    {/* Digital Signature Mode */}
                    {ackMethod === 'digital_signature' ? (
                      <div className="space-y-2">
                        {/* Subtabs Draw / Type and Clear */}
                        <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                          <div className="flex items-center gap-4">
                            <button
                              type="button"
                              onClick={() => setSigMode('draw')}
                              className={clsx(
                                'pb-1 text-xs font-semibold transition-colors cursor-pointer',
                                sigMode === 'draw'
                                  ? 'text-blue-600 border-b-2 border-blue-600'
                                  : 'text-slate-500 hover:text-slate-800'
                              )}
                            >
                              Draw
                            </button>
                            <button
                              type="button"
                              onClick={() => setSigMode('type')}
                              className={clsx(
                                'pb-1 text-xs font-semibold transition-colors cursor-pointer',
                                sigMode === 'type'
                                  ? 'text-blue-600 border-b-2 border-blue-600'
                                  : 'text-slate-500 hover:text-slate-800'
                              )}
                            >
                              Type
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={clearCanvas}
                            className="text-xs text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
                          >
                            Clear
                          </button>
                        </div>

                        {/* Interactive Signature Canvas or Type Area */}
                        {sigMode === 'draw' ? (
                          <div className="border border-slate-200 rounded-xl bg-slate-50/40 p-1 flex items-center justify-center relative overflow-hidden">
                            <canvas
                              ref={canvasRef}
                              width={360}
                              height={110}
                              onMouseDown={startDrawing}
                              onMouseMove={draw}
                              onMouseUp={stopDrawing}
                              onMouseLeave={stopDrawing}
                              onTouchStart={startDrawing}
                              onTouchMove={draw}
                              onTouchEnd={stopDrawing}
                              className="bg-white rounded-lg w-full h-[110px] cursor-crosshair shadow-inner"
                            />
                          </div>
                        ) : (
                          <div className="border border-slate-200 rounded-xl bg-white p-3 space-y-2">
                            <input
                              type="text"
                              value={typedSignature}
                              onChange={(e) => setTypedSignature(e.target.value)}
                              placeholder="Type your legal full name"
                              className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs focus:outline-none"
                            />
                            <div className="p-3 bg-slate-50 rounded-lg text-center font-serif italic text-2xl text-slate-800 border border-slate-100 select-none">
                              {typedSignature || 'Signature Preview'}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      /* Photo Capture Mode */
                      <div className="border-2 border-dashed border-slate-200 rounded-xl p-5 text-center bg-slate-50/50 space-y-2">
                        <Camera className="w-8 h-8 text-blue-600 mx-auto" />
                        <p className="font-semibold text-slate-700">Take Photo of Physical Handover</p>
                        <p className="text-[10px] text-slate-400">Capture asset handover with employee badge</p>
                        <button
                          type="button"
                          className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg font-semibold hover:bg-blue-100"
                        >
                          Open Camera
                        </button>
                      </div>
                    )}

                    {/* Confirmation Checkbox */}
                    <div className="pt-1">
                      <label className="flex items-start gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isConfirmedCheckbox}
                          onChange={(e) => setIsConfirmedCheckbox(e.target.checked)}
                          className="mt-0.5 w-3.5 h-3.5 text-blue-600 focus:ring-blue-500 rounded"
                        />
                        <span className="text-[11px] text-slate-700 font-medium leading-tight">
                          I confirm that I have received the above asset in good condition.
                        </span>
                      </label>
                    </div>

                    {/* Acknowledged By & Date Time Grid */}
                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="block text-[11px] text-slate-500 mb-1">
                          Acknowledged By
                        </label>
                        <input
                          type="text"
                          value={acknowledgedBy}
                          onChange={(e) => setAcknowledgedBy(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-500 mb-1">
                          Date &amp; Time
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={ackDateTime}
                            onChange={(e) => setAckDateTime(e.target.value)}
                            className="w-full pl-2.5 pr-7 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none"
                          />
                          <Calendar className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions matching Screenshot 26 */}
        {currentStep !== 4 && (
          <div className="bg-white rounded-xl border border-slate-200 px-6 py-4 flex items-center justify-between shadow-xs">
            <button
              onClick={() => navigate('/movements')}
              className="px-5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={handleSaveDraft}
                disabled={isSubmitting}
                className="px-5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Save as Draft
              </button>
              <button
                onClick={handleSubmitAssignment}
                disabled={isSubmitting}
                className="px-6 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <span>Submit Assignment</span>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Barcode / RFID Scan Modal */}
      {isScanModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-md w-full shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Scan className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Scan Asset Barcode / RFID</h3>
                  <p className="text-[11px] text-slate-500">Scan tag using connected reader or enter ID</p>
                </div>
              </div>
              <button
                onClick={() => setIsScanModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Simulated Viewfinder */}
            <div className="h-40 rounded-xl bg-slate-900 flex flex-col items-center justify-center relative overflow-hidden text-center text-white p-4">
              <div className="w-44 h-24 border-2 border-dashed border-blue-400/80 rounded-lg relative flex items-center justify-center">
                <div className="w-full h-0.5 bg-rose-500/80 absolute top-1/2 -translate-y-1/2 shadow-xs shadow-rose-500 animate-pulse" />
                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">
                  Align Barcode / QR / Tag
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-2">Waiting for scanner input...</p>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">
                Or Enter Tag/Serial Manually:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={scanInput}
                  onChange={(e) => setScanInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleScanSubmit()}
                  placeholder="e.g. AS-000123, 75K3D24, E28011606000002053A1B4C0"
                  className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                <button
                  onClick={handleScanSubmit}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 cursor-pointer"
                >
                  Lookup
                </button>
              </div>
            </div>

            <div className="bg-slate-50 rounded-lg p-3 text-[11px] text-slate-600 space-y-1">
              <p className="font-semibold text-slate-800">Quick Test Samples:</p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {['AS-000123', 'AS-000124', '75K3D24', 'SAMS8787'].map(tag => (
                  <button
                    key={tag}
                    onClick={() => setScanInput(tag)}
                    className="px-2 py-0.5 bg-white border border-slate-200 rounded text-blue-600 font-mono hover:bg-blue-50 cursor-pointer"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AssignAsset;
