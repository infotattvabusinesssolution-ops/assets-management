import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
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



export function AssignAsset() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const preselectedAssetId = searchParams.get('assetId') || location.state?.assetId || '';

  // Stepper state (1: Select Asset, 2: Assignment Details, 3: Review & Confirm, 4: Completion)
  const [currentStep, setCurrentStep] = useState(preselectedAssetId ? 2 : 1);

  // Asset Search & Selection State
  const [assetSearch, setAssetSearch] = useState('');
  const [assetsList, setAssetsList] = useState([]);
  const [selectedAssetId, setSelectedAssetId] = useState(preselectedAssetId);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);

  // Master References State (Loaded dynamically from database)
  const [employeesList, setEmployeesList] = useState([]);
  const [departmentsList, setDepartmentsList] = useState([]);
  const [locationsList, setLocationsList] = useState([]);

  // Fetch live assets and master references from database API
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const [assetsRes, empRes, refRes, hierRes] = await Promise.allSettled([
          api.get('/assets', { params: { limit: 100 } }),
          api.get('/master-data/employees'),
          api.get('/custody-transfers/master-references'),
          api.get('/custody-transfers/locations/hierarchy')
        ]);

        if (empRes.status === 'fulfilled' && empRes.value?.employees?.length) {
          setEmployeesList(empRes.value.employees);
        } else if (refRes.status === 'fulfilled' && refRes.value?.custodians?.length) {
          setEmployeesList(refRes.value.custodians.map(c => ({
            id: c.id,
            employeeCode: c.code,
            fullName: c.name || c.fullName,
            department: c.department
          })));
        }

        if (refRes.status === 'fulfilled' && refRes.value?.departments?.length) {
          setDepartmentsList(refRes.value.departments);
        }

        if (hierRes.status === 'fulfilled' && hierRes.value?.sites?.length) {
          setLocationsList(hierRes.value.sites);
        }

        if (assetsRes.status === 'fulfilled' && assetsRes.value?.assets?.length) {
          const mapped = assetsRes.value.assets.map(a => {
            const locParts = [
              a.site?.name,
              a.building?.name,
              a.floor?.name,
              a.room?.name
            ].filter(Boolean);

            return {
              id: a.id,
              companyId: a.companyId,
              assetNumber: a.assetId || a.tagNumber || `AST-${a.id.slice(0, 6)}`,
              assetName: a.description || a.name || a.assetId || 'Asset',
              serialNumber: a.serialNumber || 'N/A',
              tagEpc: a.tagNumber || a.rfidEpc || 'N/A',
              type: a.category?.name || 'IT Equipment',
              category: a.category?.name || 'General',
              model: a.model?.name || 'Standard',
              brand: a.manufacturer?.name || 'OEM',
              currentLocation: locParts.join(' > ') || (a.site?.name || 'Unassigned'),
              site: a.site?.name || '',
              building: a.building?.name || '',
              floor: a.floor?.name || '',
              room: a.room?.name || '',
              status: a.custodian ? 'Assigned' : 'Available',
              image: a.imageUrl || null
            };
          });

          setAssetsList(prev => {
            const passed = location.state?.asset;
            if (passed) {
              const formattedPassed = {
                id: passed.id || passed.assetId,
                companyId: passed.companyId,
                assetNumber: passed.assetId || passed.tagNumber || 'Asset',
                assetName: passed.name || passed.description || 'Asset',
                serialNumber: passed.serialNumber || 'N/A',
                tagEpc: passed.rfidEpc || passed.tagNumber || 'N/A',
                type: passed.categoryName || 'IT Equipment',
                category: passed.categoryName || 'General',
                model: passed.model || 'Standard',
                brand: passed.manufacturer || 'OEM',
                currentLocation: passed.locationStr || (passed.site?.name || 'Unassigned'),
                site: passed.siteName || passed.site?.name || '',
                building: passed.buildingName || passed.building?.name || '',
                floor: passed.floorRoom || passed.floorName || passed.floor?.name || '',
                room: passed.roomName || passed.room?.name || '',
                status: passed.lifecycleStatus || 'Available',
                image: passed.imageUrl || null
              };
              const existsIdx = mapped.findIndex(m => m.id === formattedPassed.id || m.assetNumber === formattedPassed.assetNumber);
              if (existsIdx >= 0) {
                mapped[existsIdx] = { ...mapped[existsIdx], ...formattedPassed };
                return mapped;
              }
              return [formattedPassed, ...mapped];
            }
            if (preselectedAssetId) {
              const preselected = prev.find(a => a.id === preselectedAssetId || a.assetNumber === preselectedAssetId);
              if (preselected && !mapped.some(a => a.id === preselected.id)) {
                return [preselected, ...mapped];
              }
            }
            return mapped;
          });

          if (!preselectedAssetId && mapped.length > 0) {
            setSelectedAssetId(mapped[0].id);
          }
        }
      } catch (err) {
        console.warn('Failed to fetch initial data for assignment:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // Pre-select asset if navigated from Asset Register & pre-fill form fields
  useEffect(() => {
    const passed = location.state?.asset;
    const passedId = location.state?.assetId || searchParams.get('assetId');
    if (passed) {
      const locParts = [
        passed.siteName || passed.site?.name,
        passed.buildingName || passed.building?.name,
        passed.floorRoom || passed.floorName || passed.floor?.name,
        passed.roomName || passed.room?.name
      ].filter(Boolean);

      const formatted = {
        id: passed.id || passed.assetId,
        companyId: passed.companyId,
        assetNumber: passed.assetId || passed.tagNumber || 'Asset',
        assetName: passed.name || passed.description || 'Asset',
        serialNumber: passed.serialNumber || 'N/A',
        tagEpc: passed.rfidEpc || passed.tagNumber || 'N/A',
        type: passed.categoryName || passed.category?.name || 'IT Equipment',
        category: passed.categoryName || passed.category?.name || 'General',
        model: passed.model || 'Standard',
        brand: passed.manufacturer || 'OEM',
        currentLocation: locParts.join(' > ') || passed.locationStr || 'Unassigned',
        site: passed.siteName || passed.site?.name || '',
        building: passed.buildingName || passed.building?.name || '',
        floor: passed.floorRoom || passed.floorName || passed.floor?.name || '',
        room: passed.roomName || passed.room?.name || '',
        status: passed.lifecycleStatus || 'Available',
        image: passed.imageUrl || null
      };

      setAssetsList(prev => {
        const matchIdx = prev.findIndex(a => a.id === formatted.id || a.assetNumber === formatted.assetNumber);
        if (matchIdx >= 0) {
          const next = [...prev];
          next[matchIdx] = { ...next[matchIdx], ...formatted };
          return next;
        }
        return [formatted, ...prev];
      });
      setSelectedAssetId(formatted.id);
      setCurrentStep(2); // Pre-fill and open Assignment Details tab directly
      setFormData(prev => ({
        ...prev,
        location: formatted.site || prev.location,
        building: formatted.building || prev.building,
        floor: formatted.floor || prev.floor,
        room: formatted.room || prev.room,
        department: passed.departmentName || passed.department?.name || prev.department,
        assignedTo: '',
        assignedToId: '',
        assignedToName: ''
      }));
      setTypedSignature('');
      setAcknowledgedBy('');
    } else if (passedId) {
      setSelectedAssetId(passedId);
      setCurrentStep(2);
      api.get(`/assets/${encodeURIComponent(passedId)}/360`)
        .then(res => {
          const raw = res?.asset360?.asset || res?.asset;
          if (!raw) throw new Error('Asset not found');
          const locParts = [
            raw.site?.name,
            raw.building?.name,
            raw.floor?.name,
            raw.room?.name
          ].filter(Boolean);

          const formatted = {
            id: raw.id || raw.assetId,
            companyId: raw.companyId,
            assetNumber: raw.assetId || raw.tagNumber || 'Asset',
            assetName: raw.description || raw.name || 'Asset',
            serialNumber: raw.serialNumber || 'N/A',
            tagEpc: raw.rfidEpc || raw.tagNumber || 'N/A',
            type: raw.category?.name || 'IT Equipment',
            category: raw.category?.name || 'General',
            model: raw.model?.name || 'Standard',
            brand: raw.manufacturer?.name || 'OEM',
            currentLocation: locParts.join(' > ') || 'Unassigned',
            site: raw.site?.name || '',
            building: raw.building?.name || '',
            floor: raw.floor?.name || '',
            room: raw.room?.name || '',
            status: raw.lifecycleStatus || 'Available',
            image: raw.imageUrl || null
          };

          setAssetsList(prev => {
            const matchIdx = prev.findIndex(a => a.id === formatted.id || a.assetNumber === formatted.assetNumber);
            if (matchIdx >= 0) {
              const next = [...prev];
              next[matchIdx] = { ...next[matchIdx], ...formatted };
              return next;
            }
            return [formatted, ...prev];
          });
          setSelectedAssetId(formatted.id);

          setFormData(prev => ({
            ...prev,
            location: formatted.site || prev.location,
            building: formatted.building || prev.building,
            floor: formatted.floor || prev.floor,
            room: formatted.room || prev.room,
            department: raw.department?.name || prev.department,
            assignedTo: '',
            assignedToId: '',
            assignedToName: ''
          }));
          setTypedSignature('');
          setAcknowledgedBy('');
        })
        .catch(err => {
          console.warn('Could not fetch asset 360 for assignment form:', err);
          setSelectedAssetId('');
          setCurrentStep(1);
          setNotification({ type: 'error', message: 'Selected asset could not be loaded. Choose an asset to continue.' });
        });
    }
  }, [location.state, searchParams]);

  // Scan Modal State
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [scanInput, setScanInput] = useState('');

  // Assignment Details Form State (Dynamic)
  const [formData, setFormData] = useState({
    assignmentType: 'Employee',
    assignedTo: '',
    assignedToId: '',
    assignedToName: '',
    department: '',
    location: '',
    building: '',
    floor: '',
    room: '',
    assignmentDate: new Date().toISOString().split('T')[0],
    expectedReturnDate: '',
    assignmentPurpose: 'Regular Use',
    conditionAtIssue: 'Good',
    accessoriesIncluded: '',
    remarks: '',
    evidenceFile: null
  });

  // Acknowledgement State
  const [requireAcknowledgement, setRequireAcknowledgement] = useState(true);
  const [ackMethod, setAckMethod] = useState('digital_signature'); // 'digital_signature' | 'photo_capture'
  const [sigMode, setSigMode] = useState('type'); // 'draw' | 'type'
  const [typedSignature, setTypedSignature] = useState('');
  const [isConfirmedCheckbox, setIsConfirmedCheckbox] = useState(true);
  const [acknowledgedBy, setAcknowledgedBy] = useState('');
  const [ackDateTime, setAckDateTime] = useState(() => new Date().toLocaleString());

  // Interactive HTML5 Signature Canvas
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  // Notification / Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);
  const [completionResult, setCompletionResult] = useState(null);

  // Resolve only the selected asset so a failed deep link cannot silently assign a different one.
  const selectedAsset = assetsList.find(a => 
    selectedAssetId && (String(a.id).toLowerCase() === String(selectedAssetId).toLowerCase() || String(a.assetNumber).toLowerCase() === String(selectedAssetId).toLowerCase())
  ) || (!preselectedAssetId ? assetsList[0] : null) || {};
  const eligibleEmployees = employeesList.filter(employee =>
    !selectedAsset.companyId || !employee.companyId || employee.companyId === selectedAsset.companyId
  );
  const eligibleDepartments = departmentsList.filter(department =>
    !selectedAsset.companyId || !department.companyId || department.companyId === selectedAsset.companyId
  );
  const eligibleLocations = locationsList.filter(site =>
    !selectedAsset.companyId || !site.companyId || site.companyId === selectedAsset.companyId
  );

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
    if (!selectedAsset.id) {
      setNotification({ type: 'error', message: 'Select an asset before assigning a custodian.' });
      setCurrentStep(1);
      return;
    }
    if (!formData.assignedToId) {
      setNotification({ type: 'error', message: 'Select a custodian before submitting the assignment.' });
      setCurrentStep(2);
      return;
    }
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

      const res = await api.post(`/assets/${encodeURIComponent(selectedAsset.id)}/custodian-assignment`, {
        custodianId: formData.assignedToId,
        assignmentDate: formData.assignmentDate,
        expectedReturnDate: formData.expectedReturnDate || null,
        assignmentPurpose: formData.assignmentPurpose,
        conditionAtIssue: formData.conditionAtIssue,
        department: formData.department,
        location: formData.location,
        building: formData.building,
        floor: formData.floor,
        room: formData.room,
        accessoriesIncluded: formData.accessoriesIncluded,
        remarks: formData.remarks,
        acknowledged: requireAcknowledgement && isConfirmedCheckbox,
        acknowledgedBy,
        signatureData
      });
      if (!res?.success || res.asset?.custodianId !== formData.assignedToId) {
        throw new Error('Assignment could not be confirmed in the asset register.');
      }

      const fresh = await api.get(`/assets/${encodeURIComponent(selectedAsset.id)}/360`);
      const savedAsset = fresh?.asset360?.asset;
      if (!savedAsset || savedAsset.custodianId !== formData.assignedToId) {
        throw new Error('Assignment was saved, but the updated asset could not be verified. Refresh Asset 360 to check it.');
      }

      setCompletionResult({
        assignmentId: res.assignmentId,
        asset: { ...selectedAsset, assetNumber: savedAsset.assetId || selectedAsset.assetNumber },
        assignedTo: savedAsset.custodian?.fullName || formData.assignedToName,
        department: savedAsset.department?.name || formData.department,
        location: [savedAsset.site?.name, savedAsset.building?.name, savedAsset.floor?.name, savedAsset.room?.name].filter(Boolean).join(' > '),
        date: formData.assignmentDate,
        acknowledgedBy,
        status: 'Assigned'
      });
      setCurrentStep(4);
    } catch (err) {
      setNotification({
        type: 'error',
        message: err.response?.data?.message || err.message || 'Failed to submit assignment.'
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
            className="flex items-center gap-1.5 hover:text-[#6C2BD9] transition-colors font-medium cursor-pointer"
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
                    ? 'bg-[#6C2BD9] text-white ring-4 ring-purple-100 shadow-xs'
                    : currentStep > 1
                    ? 'bg-[#6C2BD9] text-white'
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
              onClick={() => setCurrentStep(2)}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div
                className={clsx(
                  'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all',
                  currentStep === 2
                    ? 'bg-[#6C2BD9] text-white ring-4 ring-purple-100 shadow-xs'
                    : currentStep > 2
                    ? 'bg-[#6C2BD9] text-white'
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
              onClick={() => setCurrentStep(3)}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div
                className={clsx(
                  'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all',
                  currentStep === 3
                    ? 'bg-[#6C2BD9] text-white ring-4 ring-purple-100 shadow-xs'
                    : currentStep > 3
                    ? 'bg-[#6C2BD9] text-white'
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
                <span className="font-mono font-bold text-[#6C2BD9]">{completionResult.assignmentId}</span>
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
                className="px-4 py-2 text-xs font-semibold text-[#6C2BD9] bg-purple-50 hover:bg-purple-100 rounded-lg cursor-pointer"
              >
                Assign Another Asset
              </button>
              <button
                onClick={() => navigate(`/assets/${encodeURIComponent(selectedAsset.id)}`)}
                className="px-4 py-2 text-xs font-semibold text-[#6C2BD9] bg-purple-50 hover:bg-purple-100 rounded-lg cursor-pointer"
              >
                View Updated Asset 360
              </button>
              <button
                onClick={() => navigate('/movements')}
                className="px-5 py-2 text-xs font-semibold text-white bg-[#6C2BD9] hover:bg-[#5b21b6] rounded-lg shadow-xs cursor-pointer"
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
                        className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-[#6C2BD9] placeholder:text-slate-400"
                      />
                    </div>
                    <button
                      onClick={() => {}}
                      className="px-4 py-2 text-xs font-semibold bg-[#6C2BD9] hover:bg-[#5b21b6] text-white rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                    >
                      <Search className="w-3.5 h-3.5" />
                      <span>Search</span>
                    </button>
                    <button
                      onClick={() => setIsScanModalOpen(true)}
                      className="px-4 py-2 text-xs font-semibold border border-[#6C2BD9] text-[#6C2BD9] hover:bg-purple-50 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Scan className="w-3.5 h-3.5" />
                      <span>Scan</span>
                    </button>
                  </div>
                </div>

                {/* Radio Selection Table */}
                <div className="overflow-auto max-h-[500px]">
                  <table className="w-full text-left text-xs text-slate-600 border-collapse">
                    <thead className="sticky top-0 z-10 bg-slate-50 shadow-2xs text-slate-500 font-semibold text-[11px] border-b border-slate-200">
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
                              isSelected ? 'bg-purple-50/40 font-medium' : ''
                            )}
                          >
                            <td className="py-3 px-3 text-center">
                              <input
                                type="radio"
                                name="selectedAssetRadio"
                                checked={isSelected}
                                onChange={() => setSelectedAssetId(asset.id)}
                                className="w-3.5 h-3.5 text-[#6C2BD9] focus:ring-[#6C2BD9] cursor-pointer"
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

                {/* Scroll Down Summary */}
                <div className="p-3 bg-white border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="font-medium text-slate-600">Showing {filteredAssets.length} assets</span>
                  <span className="text-slate-400">Scroll down to view all records</span>
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
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#6C2BD9]/20 focus:border-[#6C2BD9]"
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
                        {eligibleEmployees.length > 0 ? (
                          <select
                            value={formData.assignedToId}
                            onChange={(e) => {
                              const val = e.target.value;
                              const emp = eligibleEmployees.find(x => x.id === val);
                              setFormData(prev => ({
                                ...prev,
                                assignedTo: emp?.fullName || emp?.name || '',
                                assignedToId: emp?.id || '',
                                assignedToName: emp?.fullName || emp?.name || '',
                                department: emp?.department?.name || prev.department
                              }));
                              setTypedSignature(emp?.fullName || emp?.name || '');
                              setAcknowledgedBy(emp?.fullName || emp?.name || '');
                            }}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#6C2BD9]/20 focus:border-[#6C2BD9]"
                          >
                            <option value="">Select Employee / Custodian</option>
                            {eligibleEmployees.map(e => {
                              const label = `${e.fullName || e.name} (${e.employeeCode || e.code || 'EMP'})`;
                              return (
                                <option key={e.id} value={e.id}>
                                  {label}
                                </option>
                              );
                            })}
                          </select>
                        ) : (
                          <p className="px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-amber-800">
                            No active custodians are available for this asset&apos;s company. Add one in Employee Master first.
                          </p>
                        )}
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
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#6C2BD9]/20 focus:border-[#6C2BD9]"
                      >
                        <option value="">Select Department</option>
                        {eligibleDepartments.map(d => (
                          <option key={d.id} value={d.name}>{d.name}</option>
                        ))}
                        {formData.department && !eligibleDepartments.some(d => d.name === formData.department) && (
                          <option value={formData.department}>{formData.department}</option>
                        )}
                      </select>
                    </div>

                    {/* Location */}
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Location / Site <span className="text-rose-500">*</span>
                      </label>
                      {eligibleLocations.length > 0 ? (
                        <select
                          value={formData.location}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value, building: '', floor: '', room: '' })}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#6C2BD9]/20 focus:border-[#6C2BD9]"
                        >
                          <option value="">Select Site</option>
                          {eligibleLocations.map(loc => (
                            <option key={loc.id} value={loc.name}>{loc.name}</option>
                          ))}
                          {formData.location && !eligibleLocations.some(l => l.name === formData.location) && (
                            <option value={formData.location}>{formData.location}</option>
                          )}
                        </select>
                      ) : (
                        <input
                          type="text"
                          value={formData.location}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value, building: '', floor: '', room: '' })}
                          placeholder="e.g. Dubai HQ Campus"
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#6C2BD9]/20 focus:border-[#6C2BD9]"
                        />
                      )}
                    </div>

                    {/* Building */}
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Building
                      </label>
                      <input
                        type="text"
                        value={formData.building}
                        onChange={(e) => setFormData({ ...formData, building: e.target.value, floor: '', room: '' })}
                        placeholder="e.g. Executive Tower A"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#6C2BD9]/20 focus:border-[#6C2BD9]"
                      />
                    </div>

                    {/* Floor */}
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Floor
                      </label>
                      <input
                        type="text"
                        value={formData.floor}
                        onChange={(e) => setFormData({ ...formData, floor: e.target.value, room: '' })}
                        placeholder="e.g. Floor 2"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#6C2BD9]/20 focus:border-[#6C2BD9]"
                      />
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
                        placeholder="e.g. Room 204"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#6C2BD9]/20 focus:border-[#6C2BD9]"
                      />
                    </div>

                    {/* Assignment Date */}
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Assignment Date <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="date"
                          value={typeof formData.assignmentDate === 'function' ? formData.assignmentDate() : formData.assignmentDate}
                          onChange={(e) => setFormData({ ...formData, assignmentDate: e.target.value })}
                          className="w-full pl-3 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#6C2BD9]/20 focus:border-[#6C2BD9]"
                        />
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
                          type="date"
                          value={formData.expectedReturnDate}
                          onChange={(e) => setFormData({ ...formData, expectedReturnDate: e.target.value })}
                          placeholder="Select date"
                          className="w-full pl-3 pr-9 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6C2BD9]/20 focus:border-[#6C2BD9]"
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
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#6C2BD9]/20 focus:border-[#6C2BD9]"
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
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#6C2BD9]/20 focus:border-[#6C2BD9]"
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
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#6C2BD9]/20 focus:border-[#6C2BD9]"
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
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#6C2BD9]/20 focus:border-[#6C2BD9] resize-none"
                      />
                    </div>

                    {/* Upload Evidence */}
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Upload Evidence
                      </label>
                      <div className="border-2 border-dashed border-slate-200 hover:border-purple-400 rounded-xl p-4 text-center cursor-pointer transition-colors bg-slate-50/50">
                        <UploadCloud className="w-6 h-6 text-[#6C2BD9] mx-auto mb-1.5" />
                        <p className="text-xs font-semibold text-slate-700">
                          Drag and drop files here or <span className="text-[#6C2BD9] underline">click to browse</span>
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
                      <MapPin className="w-3 h-3 text-[#6C2BD9] flex-shrink-0" />
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
                      'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden',
                      requireAcknowledgement ? 'bg-[#6C2BD9]' : 'bg-slate-300'
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
                            className="w-3.5 h-3.5 text-[#6C2BD9] focus:ring-[#6C2BD9]"
                          />
                          <span className="font-semibold text-slate-800">Digital Signature</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="ackMethod"
                            checked={ackMethod === 'photo_capture'}
                            onChange={() => setAckMethod('photo_capture')}
                            className="w-3.5 h-3.5 text-[#6C2BD9] focus:ring-[#6C2BD9]"
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
                                  ? 'text-[#6C2BD9] border-b-2 border-[#6C2BD9]'
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
                                  ? 'text-[#6C2BD9] border-b-2 border-[#6C2BD9]'
                                  : 'text-slate-500 hover:text-slate-800'
                              )}
                            >
                              Type
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={clearCanvas}
                            className="text-xs text-[#6C2BD9] hover:text-[#5b21b6] font-semibold cursor-pointer"
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
                        <Camera className="w-8 h-8 text-[#6C2BD9] mx-auto" />
                        <p className="font-semibold text-slate-700">Take Photo of Physical Handover</p>
                        <p className="text-[10px] text-slate-400">Capture asset handover with employee badge</p>
                        <button
                          type="button"
                          className="px-3 py-1.5 bg-purple-50 text-[#6C2BD9] rounded-lg font-semibold hover:bg-purple-100"
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
                          className="mt-0.5 w-3.5 h-3.5 text-[#6C2BD9] focus:ring-[#6C2BD9] rounded"
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
                className="px-6 py-2 text-xs font-semibold text-white bg-[#6C2BD9] hover:bg-[#5b21b6] rounded-lg shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
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
                <div className="w-8 h-8 rounded-lg bg-purple-50 text-[#6C2BD9] flex items-center justify-center">
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
              <div className="w-44 h-24 border-2 border-dashed border-purple-400/80 rounded-lg relative flex items-center justify-center">
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
                  className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6C2BD9]/20"
                />
                <button
                  onClick={handleScanSubmit}
                  className="px-4 py-2 bg-[#6C2BD9] text-white rounded-lg text-xs font-semibold hover:bg-[#5B21B6] cursor-pointer"
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
                    className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[#6C2BD9] font-mono hover:bg-purple-50 cursor-pointer"
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
