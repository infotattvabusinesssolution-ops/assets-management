import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../services/api';
import {
  ArrowLeft,
  ArrowRight,
  Search,
  Scan,
  CheckCircle2,
  AlertTriangle,
  X,
  FileText,
  UploadCloud,
  MapPin,
  Calendar,
  Building,
  User,
  ShieldCheck,
  Truck,
  RotateCcw,
  Check,
  ExternalLink,
  ChevronDown,
  Layers,
  Clock,
  Printer,
  FileSpreadsheet,
  AlertCircle,
  ArrowLeftRight
} from 'lucide-react';

export default function TransferMovement({ defaultTab = 'form' }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Active view tab: 'form' | 'approvals' | 'transit' | 'history'
  const getInitialTab = () => {
    const searchParams = new URLSearchParams(location.search);
    const searchTab = searchParams.get('tab');
    const hasTargetAsset = searchParams.get('assetId') || searchParams.get('id') || location.state?.assetId || location.state?.asset;
    if (hasTargetAsset) return 'form';
    if (searchTab === 'transfer' || searchTab === 'form') return 'form';
    if (searchTab === 'approvals') return 'approvals';
    if (searchTab === 'transit') return 'transit';
    if (searchTab === 'history') return 'history';
    return defaultTab || 'form';
  };

  const [activeTab, setActiveTab] = useState(getInitialTab);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const searchTab = searchParams.get('tab');
    const hasTargetAsset = searchParams.get('assetId') || searchParams.get('id') || location.state?.assetId || location.state?.asset;
    if (hasTargetAsset) {
      setActiveTab('form');
    } else if (searchTab) {
      if (searchTab === 'transfer' || searchTab === 'form') setActiveTab('form');
      else if (['approvals', 'transit', 'history'].includes(searchTab)) setActiveTab(searchTab);
    } else if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab, location.search, location.state]);

  // Loading & notification state
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const formatAssetForTransfer = (raw) => {
    if (!raw) return null;
    const locParts = [
      raw.siteName || raw.site?.name,
      raw.buildingName || raw.building?.name,
      raw.floorRoom || raw.floorName || raw.floor?.name,
      raw.roomName || raw.room?.name
    ].filter(Boolean);

    const rawId = raw.id || raw.assetId;
    const assetNum = raw.assetId || raw.assetNumber || raw.tagNumber || rawId;

    return {
      id: rawId,
      assetNumber: assetNum,
      assetName: raw.name || raw.assetName || raw.description || 'Asset',
      type: raw.categoryName || raw.category?.name || raw.type || 'Equipment',
      category: raw.categoryName || raw.category?.name || 'Equipment',
      serialNumber: raw.serialNumber || 'N/A',
      barcode: raw.barcode || raw.tagNumber || 'N/A',
      rfidEpc: raw.rfidEpc || raw.tagNumber || 'N/A',
      currentLocation: raw.locationStr || (locParts.length > 0 ? locParts.join(' > ') : (raw.currentLocationFormatted || 'Unassigned Location')),
      siteId: raw.siteId || raw.site?.id || '',
      siteName: raw.siteName || raw.site?.name || '',
      buildingId: raw.buildingId || raw.building?.id || '',
      buildingName: raw.buildingName || raw.building?.name || '',
      floorId: raw.floorId || raw.floor?.id || '',
      floorName: raw.floorName || raw.floorRoom || raw.floor?.name || '',
      roomId: raw.roomId || raw.room?.id || '',
      roomName: raw.roomName || raw.room?.name || '',
      currentCustodian: raw.custodianName || (raw.custodian ? (raw.custodian.fullName || raw.custodian.firstName) : (raw.currentCustodian || 'Unassigned')),
      department: raw.departmentName || raw.department?.name || '',
      status: raw.lifecycleStatus || raw.status || 'In Service',
      imageUrl: raw.imageUrl || 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=200&auto=format&fit=crop&q=60',
      isEligible: raw.lifecycleStatus !== 'DISPOSED' && raw.lifecycleStatus !== 'Disposed' && raw.status !== 'Disposed',
      reason: (raw.lifecycleStatus === 'DISPOSED' || raw.lifecycleStatus === 'Disposed' || raw.status === 'Disposed') ? 'Asset is disposed' : null
    };
  };

  // ---------------------------------------------------------------------------
  // 1. Master Data & Hierarchy Stores (Loaded dynamically from database)
  // ---------------------------------------------------------------------------
  const [hierarchy, setHierarchy] = useState({
    sites: [],
    buildings: [],
    floors: [],
    rooms: []
  });

  const [departments, setDepartments] = useState([]);
  const [custodians, setCustodians] = useState([]);

  const [assetsList, setAssetsList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAssetIds, setSelectedAssetIds] = useState([]);

  // Handle preselected asset passed from Asset Register or other pages
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const targetAssetId = searchParams.get('assetId') || searchParams.get('id') || location.state?.assetId || location.state?.asset?.assetId || location.state?.asset?.id;
    const passedAsset = location.state?.asset;

    if (passedAsset) {
      const formatted = formatAssetForTransfer(passedAsset);
      if (formatted) {
        setAssetsList(prev => {
          const matchIdx = prev.findIndex(a => a.id === formatted.id || a.assetNumber === formatted.assetNumber);
          if (matchIdx >= 0) {
            const next = [...prev];
            next[matchIdx] = { ...next[matchIdx], ...formatted };
            return next;
          }
          return [formatted, ...prev];
        });
        setSelectedAssetIds([formatted.id, formatted.assetNumber].filter(Boolean));
      }
    } else if (targetAssetId) {
      setSelectedAssetIds([targetAssetId]);
      api.get(`/assets/${encodeURIComponent(targetAssetId)}/360`)
        .then(res => {
          const raw = res?.asset360?.asset || res?.asset;
          if (raw) {
            const formatted = formatAssetForTransfer(raw);
            setAssetsList(prev => {
              const matchIdx = prev.findIndex(a => a.id === formatted.id || a.assetNumber === formatted.assetNumber);
              if (matchIdx >= 0) {
                const next = [...prev];
                next[matchIdx] = { ...next[matchIdx], ...formatted };
                return next;
              }
              return [formatted, ...prev];
            });
            setSelectedAssetIds([formatted.id, formatted.assetNumber].filter(Boolean));
          }
        })
        .catch(err => {
          console.warn('Could not fetch target asset details for transfer:', err);
        });
    }
  }, [location.state, location.search]);

  // Transfers & Movement History from server
  const [transfersList, setTransfersList] = useState([]);
  const [historyList, setHistoryList] = useState([]);

  // Fetch data on mount
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [hRes, rRes, aRes, tRes, histRes] = await Promise.allSettled([
        api.get('/custody-transfers/locations/hierarchy'),
        api.get('/custody-transfers/master-references'),
        api.get('/custody-transfers/assets/eligible'),
        api.get('/custody-transfers/movement-records'),
        api.get('/custody-transfers/movement-history')
      ]);

      if (hRes.status === 'fulfilled' && hRes.value.success) {
        const sites = hRes.value.sites || [];
        const buildings = hRes.value.buildings || [];
        const floors = hRes.value.floors || [];
        const rooms = hRes.value.rooms || [];
        setHierarchy({ sites, buildings, floors, rooms });

        if (sites.length > 0) {
          setDestSiteId(prev => prev || sites[0].id);
          const relB = buildings.filter(b => b.siteId === sites[0].id);
          if (relB.length > 0) {
            setDestBuildingId(prev => prev || relB[0].id);
            const relF = floors.filter(f => f.buildingId === relB[0].id);
            if (relF.length > 0) {
              setDestFloorId(prev => prev || relF[0].id);
              const relR = rooms.filter(r => r.floorId === relF[0].id);
              if (relR.length > 0) setDestRoomId(prev => prev || relR[0].id);
            }
          }
        }
      }

      if (rRes.status === 'fulfilled' && rRes.value.success) {
        if (rRes.value.departments && rRes.value.departments.length > 0) {
          setDepartments(rRes.value.departments);
          setDepartment(prev => prev || rRes.value.departments[0].name || rRes.value.departments[0].id);
        }
        if (rRes.value.custodians && rRes.value.custodians.length > 0) {
          setCustodians(rRes.value.custodians);
          setNewCustodian(prev => prev || rRes.value.custodians[0].name || rRes.value.custodians[0].fullName || '');
        }
      }

      let rawAssets = [];
      if (aRes.status === 'fulfilled' && aRes.value.assets && aRes.value.assets.length > 0) {
        rawAssets = aRes.value.assets;
      } else {
        const fallback = await api.get('/assets', { params: { limit: 100 } }).catch(() => null);
        if (fallback?.assets && fallback.assets.length > 0) {
          rawAssets = fallback.assets;
        }
      }

      if (rawAssets.length > 0) {
        const backendFormatted = rawAssets.map(a => formatAssetForTransfer(a));

        const searchParams = new URLSearchParams(location.search);
        const targetId = searchParams.get('assetId') || searchParams.get('id') || location.state?.assetId || location.state?.asset?.assetId || location.state?.asset?.id;
        const passed = location.state?.asset;

        let targetObj = passed ? formatAssetForTransfer(passed) : null;
        if (!targetObj && targetId) {
          targetObj = backendFormatted.find(a => 
            a.id === targetId || 
            a.assetNumber === targetId ||
            String(a.id).toLowerCase() === String(targetId).toLowerCase() ||
            String(a.assetNumber).toLowerCase() === String(targetId).toLowerCase()
          );

          if (!targetObj) {
            try {
              const res = await api.get(`/assets/${encodeURIComponent(targetId)}/360`);
              const raw = res?.asset360?.asset || res?.asset;
              if (raw) {
                targetObj = formatAssetForTransfer(raw);
              }
            } catch (err) {
              console.warn('Target asset fetch in fetchInitialData note:', err);
            }
          }
        }

        if (targetObj) {
          const matchIdx = backendFormatted.findIndex(a => 
            a.id === targetObj.id || 
            a.assetNumber === targetObj.assetNumber
          );
          let mergedList = [...backendFormatted];
          if (matchIdx >= 0) {
            const existing = mergedList.splice(matchIdx, 1)[0];
            mergedList.unshift({ ...existing, ...targetObj });
          } else {
            mergedList.unshift(targetObj);
          }
          setAssetsList(mergedList);
          setSelectedAssetIds([targetObj.id, targetObj.assetNumber].filter(Boolean));
          if (targetObj.department) setDepartment(targetObj.department);
          if (targetObj.currentCustodian && targetObj.currentCustodian !== 'Unassigned') {
            setNewCustodian(targetObj.currentCustodian);
          }
          if (targetObj.siteId && sites.length > 1) {
            const alternateSite = sites.find(s => s.id !== targetObj.siteId) || sites[0];
            setDestSiteId(alternateSite.id);
            const altB = buildings.filter(b => b.siteId === alternateSite.id);
            if (altB.length > 0) {
              setDestBuildingId(altB[0].id);
              const altF = floors.filter(f => f.buildingId === altB[0].id);
              if (altF.length > 0) {
                setDestFloorId(altF[0].id);
                const altR = rooms.filter(r => r.floorId === altF[0].id);
                if (altR.length > 0) setDestRoomId(altR[0].id);
              }
            }
          }
        } else {
          setAssetsList(backendFormatted);
          if (!targetId) {
            setSelectedAssetIds([]);
          }
        }
      }

      if (tRes.status === 'fulfilled' && tRes.value.transfers) {
        setTransfersList(tRes.value.transfers);
      }

      if (histRes.status === 'fulfilled' && histRes.value.history) {
        setHistoryList(histRes.value.history);
      }
    } catch (err) {
      console.warn('Failed to fetch backend movement data:', err);
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // 2. Form State matching Section 2, 3, 4
  // ---------------------------------------------------------------------------
  const [transferType, setTransferType] = useState('Location Transfer');
  const [transferDate, setTransferDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [effectiveDate, setEffectiveDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Destination Hierarchy (Dependent Dropdowns)
  const [destSiteId, setDestSiteId] = useState('');
  const [destBuildingId, setDestBuildingId] = useState('');
  const [destFloorId, setDestFloorId] = useState('');
  const [destRoomId, setDestRoomId] = useState('');

  // Department, Custodian, Reason
  const [department, setDepartment] = useState('');
  const [newCustodian, setNewCustodian] = useState('');
  const [movementReason, setMovementReason] = useState('Department Restructure');

  // Section 3: Additional Information
  const [conditionAtTransfer, setConditionAtTransfer] = useState('Good');
  const [accessoriesIncluded, setAccessoriesIncluded] = useState('');
  const [remarks, setRemarks] = useState('');
  const [referenceNo, setReferenceNo] = useState(() => `TRF-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);

  // Section 4: Supporting Documents
  const [documents, setDocuments] = useState([]);

  // Modals state
  const [showScanModal, setShowScanModal] = useState(false);
  const [scanCodeInput, setScanCodeInput] = useState('');
  const [scanScanResult, setScanResult] = useState(null);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSlipModal, setShowSlipModal] = useState(false);
  const [activeSlipTransfer, setActiveSlipTransfer] = useState(null);

  // Filtered Dependent Dropdowns
  const filteredBuildings = useMemo(() => {
    if (!destSiteId) return hierarchy.buildings;
    return hierarchy.buildings.filter(b => b.siteId === destSiteId);
  }, [hierarchy.buildings, destSiteId]);

  const filteredFloors = useMemo(() => {
    if (!destBuildingId) return hierarchy.floors;
    return hierarchy.floors.filter(f => f.buildingId === destBuildingId);
  }, [hierarchy.floors, destBuildingId]);

  const filteredRooms = useMemo(() => {
    if (!destFloorId) return hierarchy.rooms;
    return hierarchy.rooms.filter(r => r.floorId === destFloorId);
  }, [hierarchy.rooms, destFloorId]);

  // Resolved Location Names for Display
  const destSiteObj = hierarchy.sites.find(s => s.id === destSiteId);
  const destBuildingObj = hierarchy.buildings.find(b => b.id === destBuildingId);
  const destFloorObj = hierarchy.floors.find(f => f.id === destFloorId);
  const destRoomObj = hierarchy.rooms.find(r => r.id === destRoomId);

  const destLocationFormatted = [
    destSiteObj?.name,
    destBuildingObj?.name,
    destFloorObj?.name,
    destRoomObj?.name
  ].filter(Boolean).join(' > ') || 'Destination location not selected';

  const isAssetSelected = useCallback((asset) => {
    if (!asset || !selectedAssetIds || selectedAssetIds.length === 0) return false;
    return selectedAssetIds.some(id => 
      id === asset.id || 
      id === asset.assetNumber ||
      (asset.id && String(id).toLowerCase() === String(asset.id).toLowerCase()) ||
      (asset.assetNumber && String(id).toLowerCase() === String(asset.assetNumber).toLowerCase())
    );
  }, [selectedAssetIds]);

  // Selected Assets Objects
  const selectedAssets = useMemo(() => {
    return assetsList.filter(a => isAssetSelected(a));
  }, [assetsList, isAssetSelected]);

  // Read-only From Location: derived from the first selected asset
  const fromLocation = useMemo(() => {
    if (selectedAssets.length === 0) {
      return {
        site: 'No asset selected',
        building: '-',
        floor: '-',
        room: '-',
        formatted: 'Select an asset from the list above'
      };
    }
    const first = selectedAssets[0];
    return {
      site: first.siteName || '-',
      building: first.buildingName || '-',
      floor: first.floorName || '-',
      room: first.roomName || '-',
      formatted: first.currentLocation || '-'
    };
  }, [selectedAssets]);

  // ---------------------------------------------------------------------------
  // 3. Selection Handlers
  // ---------------------------------------------------------------------------
  const handleToggleSelectAsset = (asset) => {
    if (!asset.isEligible) {
      showToast(asset.reason || 'This asset cannot be transferred.', 'error');
      return;
    }

    if (isAssetSelected(asset)) {
      setSelectedAssetIds(prev => prev.filter(id => 
        id !== asset.id && 
        id !== asset.assetNumber &&
        String(id).toLowerCase() !== String(asset.id).toLowerCase() &&
        String(id).toLowerCase() !== String(asset.assetNumber).toLowerCase()
      ));
    } else {
      setSelectedAssetIds(prev => [...prev, asset.id || asset.assetNumber]);
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const eligibleIds = assetsList.filter(a => a.isEligible).map(a => a.id || a.assetNumber);
      setSelectedAssetIds(eligibleIds);
    } else {
      setSelectedAssetIds([]);
    }
  };

  const handleRemoveSelectedAsset = (id) => {
    setSelectedAssetIds(prev => prev.filter(item => 
      item !== id && String(item).toLowerCase() !== String(id).toLowerCase()
    ));
  };

  const handleClearAllSelected = () => {
    setSelectedAssetIds([]);
  };

  // ---------------------------------------------------------------------------
  // 4. File Upload Handlers
  // ---------------------------------------------------------------------------
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const newDocs = files.map((file, idx) => ({
      id: `doc-${Date.now()}-${idx}`,
      name: file.name,
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      type: file.type
    }));

    setDocuments([...documents, ...newDocs]);
    showToast(`Attached ${files.length} document(s).`);
  };

  const handleRemoveDocument = (docId) => {
    setDocuments(documents.filter(d => d.id !== docId));
  };

  // ---------------------------------------------------------------------------
  // 5. Scan Simulator / Quick Search
  // ---------------------------------------------------------------------------
  const handlePerformScan = async () => {
    if (!scanCodeInput.trim()) return;

    try {
      const res = await api.post('/custody-transfers/scan', { code: scanCodeInput.trim() });
      if (res.found && res.asset) {
        setScanResult(res);
        if (res.isEligible) {
          if (!selectedAssetIds.includes(res.asset.id)) {
            setSelectedAssetIds([...selectedAssetIds, res.asset.id]);
            showToast(`Asset ${res.asset.assetNumber} verified and added to transfer!`);
          }
        }
      } else {
        setScanResult({ found: false, message: res.message || 'Asset not found' });
      }
    } catch (err) {
      // Fallback local scan
      const matched = assetsList.find(a =>
        a.assetNumber.toLowerCase() === scanCodeInput.toLowerCase() ||
        a.rfidEpc?.toLowerCase() === scanCodeInput.toLowerCase() ||
        a.barcode?.toLowerCase() === scanCodeInput.toLowerCase() ||
        a.serialNumber?.toLowerCase() === scanCodeInput.toLowerCase()
      );
      if (matched) {
        setScanResult({ found: true, asset: matched, isEligible: matched.isEligible });
        if (matched.isEligible && !selectedAssetIds.includes(matched.id)) {
          setSelectedAssetIds([...selectedAssetIds, matched.id]);
          showToast(`Asset ${matched.assetNumber} added to selection!`);
        }
      } else {
        setScanResult({ found: false, message: `No asset found for code: ${scanCodeInput}` });
      }
    }
  };

  // ---------------------------------------------------------------------------
  // 6. Save as Draft & Submit Transfer
  // ---------------------------------------------------------------------------
  const handleSaveDraft = async () => {
    if (selectedAssets.length === 0) {
      showToast('Please select at least one asset to save draft.', 'error');
      return;
    }

    const payload = {
      assetIds: selectedAssets.map(a => a.id),
      transferType,
      transferDate,
      effectiveDate,
      toSiteId: destSiteId,
      toSiteName: destSiteObj?.name || 'Dubai HQ',
      toBuildingId: destBuildingId,
      toBuildingName: destBuildingObj?.name || 'Block B',
      toFloorId: destFloorId,
      toFloorName: destFloorObj?.name || '1st Floor',
      toRoomId: destRoomId,
      toRoomName: destRoomObj?.name || 'IT-201',
      departmentName: department,
      toCustodianName: newCustodian,
      reason: movementReason,
      conditionAtTransfer,
      accessoriesIncluded,
      remarks,
      referenceNo,
      documents,
      isDraft: true
    };

    try {
      setLoading(true);
      const res = await api.post('/custody-transfers/movement-records', payload);
      showToast('Transfer saved as Draft! Asset Master remains unchanged.', 'success');
      fetchInitialData();
    } catch (err) {
      showToast(err.message || 'Failed to save draft.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitTransfer = async () => {
    if (selectedAssets.length === 0) {
      showToast('Please select at least one asset.', 'error');
      return;
    }

    if (!movementReason) {
      showToast('Movement reason is required.', 'error');
      return;
    }

    const payload = {
      assetIds: selectedAssets.map(a => a.id),
      transferType,
      transferDate,
      effectiveDate,
      toSiteId: destSiteId,
      toSiteName: destSiteObj?.name || 'Dubai HQ',
      toBuildingId: destBuildingId,
      toBuildingName: destBuildingObj?.name || 'Block B',
      toFloorId: destFloorId,
      toFloorName: destFloorObj?.name || '1st Floor',
      toRoomId: destRoomId,
      toRoomName: destRoomObj?.name || 'IT-201',
      departmentName: department,
      toCustodianName: newCustodian,
      reason: movementReason,
      conditionAtTransfer,
      accessoriesIncluded,
      remarks,
      referenceNo,
      documents,
      isDraft: false,
      requiresApproval: true
    };

    try {
      setLoading(true);
      const res = await api.post('/custody-transfers/movement-records', payload);
      showToast('Transfer submitted successfully! Workflow routed for approval.', 'success');
      setShowConfirmModal(false);
      fetchInitialData();
      setActiveTab('approvals');
    } catch (err) {
      showToast(err.message || 'Transfer submission failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // 7. Workflow Actions (Approve, Dispatch, Confirm Receipt)
  // ---------------------------------------------------------------------------
  const handleWorkflowAction = async (transferId, action, params = {}) => {
    try {
      setLoading(true);
      await api.put(`/custody-transfers/movement-records/${transferId}/status`, {
        action,
        ...params
      });

      if (action === 'APPROVE') {
        showToast('Transfer approved! Assets ready for physical dispatch.');
      } else if (action === 'DISPATCH') {
        showToast('Transfer marked as Dispatched / In-Transit.');
      } else if (action === 'CONFIRM_RECEIPT') {
        showToast('Receipt confirmed! Asset Master officially updated & Movement History logged.');
      } else if (action === 'REJECT') {
        showToast('Transfer rejected. Asset locks released.');
      }

      fetchInitialData();
    } catch (err) {
      showToast(err.message || 'Workflow transition failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-16">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-xl border flex items-center gap-3 transition-all duration-300 ${
          toast.type === 'error'
            ? 'bg-rose-50 border-rose-200 text-rose-800'
            : 'bg-emerald-50 border-emerald-200 text-emerald-800'
        }`}>
          {toast.type === 'error' ? <AlertCircle className="w-5 h-5 text-rose-500" /> : <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
          <span className="text-sm font-medium">{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-2 text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Header & Breadcrumb */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-gray-500 mb-1">
              <button onClick={() => navigate('/movements')} className="hover:text-[#6C2BD9] flex items-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5" /> Assignment & Movement
              </button>
              <span>›</span>
              <span className="text-gray-800 font-semibold">Transfer & Movement</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Transfer & Movement</h1>
            <p className="text-xs text-gray-500 mt-0.5">Move assets between locations, departments or custodians</p>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg border border-gray-200 text-xs font-medium">
            <button
              onClick={() => setActiveTab('form')}
              className={`px-3.5 py-1.5 rounded-md transition-all ${
                activeTab === 'form'
                  ? 'bg-[#6C2BD9] text-white shadow-sm font-semibold'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Transfer Form
            </button>
            <button
              onClick={() => setActiveTab('approvals')}
              className={`px-3.5 py-1.5 rounded-md flex items-center gap-1.5 transition-all ${
                activeTab === 'approvals'
                  ? 'bg-[#6C2BD9] text-white shadow-sm font-semibold'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Movement Approvals
              {transfersList.filter(t => t.status === 'PENDING_APPROVAL').length > 0 && (
                <span className="bg-amber-400 text-gray-950 px-1.5 py-0.2 rounded-full text-[10px] font-bold">
                  {transfersList.filter(t => t.status === 'PENDING_APPROVAL').length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('transit')}
              className={`px-3.5 py-1.5 rounded-md transition-all ${
                activeTab === 'transit'
                  ? 'bg-[#6C2BD9] text-white shadow-sm font-semibold'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Dispatch & In-Transit
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-3.5 py-1.5 rounded-md transition-all ${
                activeTab === 'history'
                  ? 'bg-[#6C2BD9] text-white shadow-sm font-semibold'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Movement History
            </button>
          </div>
        </div>

        {/* Stepper (Only on Transfer Form) */}
        {activeTab === 'form' && (
          <div className="mt-6 border-t border-gray-100 pt-4 max-w-5xl mx-auto">
            <div className="flex items-center justify-between relative">
              <div className="absolute left-8 right-8 top-1/2 -translate-y-1/2 h-[2px] bg-gray-200 z-0" />

              {/* Step 1: Active */}
              <div className="flex items-center gap-2 bg-white px-3 relative z-10">
                <span className="w-7 h-7 rounded-full bg-[#6C2BD9] text-white text-xs font-bold flex items-center justify-center shadow-sm">
                  1
                </span>
                <span className="text-xs font-bold text-gray-900">Select Asset(s)</span>
              </div>

              {/* Step 2 */}
              <div className="flex items-center gap-2 bg-white px-3 relative z-10">
                <span className="w-7 h-7 rounded-full bg-gray-100 border border-gray-300 text-gray-500 text-xs font-semibold flex items-center justify-center">
                  2
                </span>
                <span className="text-xs font-medium text-gray-500">Transfer Details</span>
              </div>

              {/* Step 3 */}
              <div className="flex items-center gap-2 bg-white px-3 relative z-10">
                <span className="w-7 h-7 rounded-full bg-gray-100 border border-gray-300 text-gray-500 text-xs font-semibold flex items-center justify-center">
                  3
                </span>
                <span className="text-xs font-medium text-gray-500">Additional Information</span>
              </div>

              {/* Step 4 */}
              <div className="flex items-center gap-2 bg-white px-3 relative z-10">
                <span className="w-7 h-7 rounded-full bg-gray-100 border border-gray-300 text-gray-500 text-xs font-semibold flex items-center justify-center">
                  4
                </span>
                <span className="text-xs font-medium text-gray-500">Review & Confirm</span>
              </div>

              {/* Step 5 */}
              <div className="flex items-center gap-2 bg-white px-3 relative z-10">
                <span className="w-7 h-7 rounded-full bg-gray-100 border border-gray-300 text-gray-500 text-xs font-semibold flex items-center justify-center">
                  5
                </span>
                <span className="text-xs font-medium text-gray-500">Completion</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* VIEW TAB 1: TRANSFER FORM (MATCHES SCREENSHOT) */}
      {activeTab === 'form' && (
        <div className="max-w-[1600px] mx-auto px-6 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* LEFT 75% COLUMN (Sections 1, 2, 3, 5, Actions) */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* SECTION 1: SELECT ASSET(S) */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden p-5">
                <div className="mb-4">
                  <h2 className="text-sm font-bold text-gray-900">1. Select Asset(s)</h2>
                  <p className="text-xs text-gray-500">Search and select one or more assets to transfer</p>
                </div>

                {/* Prominent Active Asset Banner when an asset is preselected */}
                {selectedAssets.length > 0 && (
                  <div className="mb-4 bg-purple-50/90 border-2 border-purple-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#6C2BD9] text-white flex items-center justify-center font-bold text-sm shrink-0">
                        <ArrowLeftRight className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono font-bold text-purple-950 text-sm">{selectedAssets[0].assetNumber}</span>
                          <span className="text-xs text-slate-700 font-semibold">• {selectedAssets[0].assetName}</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            {selectedAssets[0].status}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-2">
                          <span>From Origin: <strong className="text-slate-800 font-semibold">{selectedAssets[0].currentLocation}</strong></span>
                          <span>•</span>
                          <span>Current Custodian: <strong className="text-slate-800 font-semibold">{selectedAssets[0].currentCustodian}</strong></span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <span className="text-xs font-bold text-purple-700 bg-white px-3 py-1.5 rounded-lg border border-purple-200 shadow-2xs">
                        ✓ Selected for Transfer
                      </span>
                    </div>
                  </div>
                )}

                {/* Search & Scan Bar */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search by Asset No, Name, Serial No, Tag/EPC..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C2BD9] focus:border-transparent outline-none"
                    />
                  </div>
                  <button
                    onClick={() => {}}
                    className="bg-[#6C2BD9] hover:bg-[#5B21B6] text-white px-4 py-2 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    <Search className="w-3.5 h-3.5" /> Search
                  </button>
                  <button
                    onClick={() => setShowScanModal(true)}
                    className="border border-[#6C2BD9] text-[#6C2BD9] hover:bg-purple-50 px-4 py-2 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
                  >
                    <Scan className="w-3.5 h-3.5" /> Scan
                  </button>
                </div>

                {/* Asset Grid Table */}
                <div className="border border-gray-200 rounded-lg overflow-auto max-h-[500px]">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="sticky top-0 z-10 bg-[#FAF5FF] shadow-2xs">
                      <tr className="border-b border-purple-100 text-gray-700">
                        <th className="p-3 w-10">
                          <input
                            type="checkbox"
                            onChange={handleSelectAll}
                            checked={selectedAssets.length > 0 && selectedAssets.length === assetsList.filter(a => a.isEligible).length}
                            className="rounded text-[#6C2BD9] focus:ring-[#6C2BD9]"
                          />
                        </th>
                        <th className="p-3 font-semibold text-gray-700">Asset No</th>
                        <th className="p-3 font-semibold text-gray-700">Asset Name</th>
                        <th className="p-3 font-semibold text-gray-700">Type</th>
                        <th className="p-3 font-semibold text-gray-700">Current Location</th>
                        <th className="p-3 font-semibold text-gray-700">Current Custodian</th>
                        <th className="p-3 font-semibold text-gray-700">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-gray-600">
                      {assetsList
                        .filter(a =>
                          !searchQuery ||
                          a.assetNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          a.assetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          a.serialNumber?.toLowerCase().includes(searchQuery.toLowerCase())
                        )
                        .map((asset) => {
                          const isSelected = isAssetSelected(asset);
                          return (
                            <tr
                              key={asset.id}
                              onClick={() => handleToggleSelectAsset(asset)}
                              className={`cursor-pointer transition-colors ${
                                isSelected ? 'bg-purple-50/70' : 'hover:bg-gray-50'
                              } ${!asset.isEligible ? 'opacity-60 bg-gray-50 cursor-not-allowed' : ''}`}
                            >
                              <td className="p-3" onClick={(e) => e.stopPropagation()}>
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  disabled={!asset.isEligible}
                                  onChange={() => handleToggleSelectAsset(asset)}
                                  className="rounded text-[#6C2BD9] focus:ring-[#6C2BD9] disabled:opacity-40"
                                />
                              </td>
                              <td className="p-3 font-semibold text-gray-900">{asset.assetNumber}</td>
                              <td className="p-3 font-medium text-gray-800">{asset.assetName}</td>
                              <td className="p-3 text-gray-500">{asset.type}</td>
                              <td className="p-3 text-gray-600">{asset.currentLocation}</td>
                              <td className="p-3 text-gray-700 font-medium">{asset.currentCustodian}</td>
                              <td className="p-3">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
                                  asset.status === 'Assigned'
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : asset.status === 'Unassigned'
                                    ? 'bg-rose-50 text-rose-600'
                                    : 'bg-gray-100 text-gray-600'
                                }`}>
                                  {asset.status}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>

                {/* Table Footer */}
                <div className="flex items-center justify-between p-3 border-t border-gray-100 text-xs text-gray-500">
                  <span className="font-medium text-gray-700">{selectedAssets.length} assets selected ({assetsList.length} total)</span>
                  <span className="text-gray-400">Scroll down to view all records</span>
                </div>
              </div>

              {/* SECTION 2: TRANSFER DETAILS */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
                <div>
                  <h2 className="text-sm font-bold text-gray-900">2. Transfer Details</h2>
                  <p className="text-xs text-gray-500">Define the transfer type and destination</p>
                </div>

                {/* Top Row: Transfer Type, Transfer Date, Effective Date */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Transfer Type <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={transferType}
                      onChange={(e) => setTransferType(e.target.value)}
                      className="w-full text-xs border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-[#6C2BD9] outline-none"
                    >
                      <option>Location Transfer</option>
                      <option>Custodian Transfer</option>
                      <option>Combined Location & Custodian</option>
                      <option>Department Transfer</option>
                      <option>Inter-Site Movement</option>
                      <option>Inter-Company Transfer</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Transfer Date <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={transferDate}
                        onChange={(e) => setTransferDate(e.target.value)}
                        className="w-full text-xs border border-gray-300 rounded-lg p-2 outline-none focus:ring-2 focus:ring-[#6C2BD9]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Effective Date <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={effectiveDate}
                        onChange={(e) => setEffectiveDate(e.target.value)}
                        className="w-full text-xs border border-gray-300 rounded-lg p-2 outline-none focus:ring-2 focus:ring-[#6C2BD9]"
                      />
                    </div>
                  </div>
                </div>

                {/* Location Grid: From Location -> To Location (Dependent Dropdowns) + Dept/Custodian/Reason */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-gray-50/70 p-4 rounded-xl border border-gray-200/80">
                  
                  {/* From Location (Current - Read Only) */}
                  <div className="md:col-span-4 bg-white p-3.5 rounded-lg border border-gray-200 shadow-2xs space-y-2">
                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                      From Location (Current)
                    </span>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between py-0.5 border-b border-gray-100">
                        <span className="text-gray-400">Site</span>
                        <span className="font-semibold text-gray-800">{fromLocation.site}</span>
                      </div>
                      <div className="flex justify-between py-0.5 border-b border-gray-100">
                        <span className="text-gray-400">Building</span>
                        <span className="font-semibold text-gray-800">{fromLocation.building}</span>
                      </div>
                      <div className="flex justify-between py-0.5 border-b border-gray-100">
                        <span className="text-gray-400">Floor</span>
                        <span className="font-semibold text-gray-800">{fromLocation.floor}</span>
                      </div>
                      <div className="flex justify-between py-0.5">
                        <span className="text-gray-400">Room / Zone</span>
                        <span className="font-semibold text-gray-800">{fromLocation.room}</span>
                      </div>
                    </div>
                  </div>

                  {/* Arrow Indicator */}
                  <div className="md:col-span-1 flex justify-center text-gray-400">
                    <div className="w-8 h-8 rounded-full bg-purple-100 text-[#6C2BD9] flex items-center justify-center font-bold">
                      →
                    </div>
                  </div>

                  {/* To Location (Destination - Dependent Dropdowns) */}
                  <div className="md:col-span-4 bg-white p-3.5 rounded-lg border border-gray-200 shadow-2xs space-y-2">
                    <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wider block">
                      To Location (Destination) <span className="text-rose-500">*</span>
                    </span>
                    <div className="space-y-1.5 text-xs">
                      <div>
                        <span className="text-[11px] text-gray-500 block">Site</span>
                        <select
                          value={destSiteId}
                          onChange={(e) => {
                            setDestSiteId(e.target.value);
                            const blds = hierarchy.buildings.filter(b => b.siteId === e.target.value);
                            if (blds.length) setDestBuildingId(blds[0].id);
                          }}
                          className="w-full border border-gray-300 rounded p-1 text-xs outline-none"
                        >
                          {hierarchy.sites.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <span className="text-[11px] text-gray-500 block">Building</span>
                        <select
                          value={destBuildingId}
                          onChange={(e) => {
                            setDestBuildingId(e.target.value);
                            const flrs = hierarchy.floors.filter(f => f.buildingId === e.target.value);
                            if (flrs.length) setDestFloorId(flrs[0].id);
                          }}
                          className="w-full border border-gray-300 rounded p-1 text-xs outline-none"
                        >
                          {filteredBuildings.map(b => (
                            <option key={b.id} value={b.id}>{b.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <span className="text-[11px] text-gray-500 block">Floor</span>
                        <select
                          value={destFloorId}
                          onChange={(e) => {
                            setDestFloorId(e.target.value);
                            const rms = hierarchy.rooms.filter(r => r.floorId === e.target.value);
                            if (rms.length) setDestRoomId(rms[0].id);
                          }}
                          className="w-full border border-gray-300 rounded p-1 text-xs outline-none"
                        >
                          {filteredFloors.map(f => (
                            <option key={f.id} value={f.id}>{f.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <span className="text-[11px] text-gray-500 block">Room / Zone</span>
                        <select
                          value={destRoomId}
                          onChange={(e) => setDestRoomId(e.target.value)}
                          className="w-full border border-gray-300 rounded p-1 text-xs outline-none"
                        >
                          {filteredRooms.map(r => (
                            <option key={r.id} value={r.id}>{r.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Subcolumn: Department, Assign To, Movement Reason */}
                  <div className="md:col-span-3 space-y-2.5">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Department</label>
                      <select
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg p-2 text-xs outline-none"
                      >
                        {departments.map(d => (
                          <option key={d.id} value={d.name}>{d.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Assign To (Custodian)</label>
                      <select
                        value={newCustodian}
                        onChange={(e) => setNewCustodian(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg p-2 text-xs outline-none bg-white"
                      >
                        {custodians.map(c => (
                          <option key={c.id} value={c.name}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Movement Reason <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={movementReason}
                        onChange={(e) => setMovementReason(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg p-2 text-xs outline-none"
                      >
                        <option>Department Restructure</option>
                        <option>Office Relocation</option>
                        <option>Employee Transfer</option>
                        <option>Project Reassignment</option>
                        <option>Break/Fix Maintenance</option>
                        <option>Return to Store</option>
                      </select>
                    </div>
                  </div>

                </div>
              </div>

              {/* SECTION 3: ADDITIONAL INFORMATION */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
                <div>
                  <h2 className="text-sm font-bold text-gray-900">3. Additional Information</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Condition at Transfer <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={conditionAtTransfer}
                      onChange={(e) => setConditionAtTransfer(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-2 text-xs outline-none"
                    >
                      <option>Good</option>
                      <option>Excellent</option>
                      <option>Fair</option>
                      <option>Damaged</option>
                      <option>Requires Inspection</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Accessories Included</label>
                    <input
                      type="text"
                      value={accessoriesIncluded}
                      onChange={(e) => setAccessoriesIncluded(e.target.value)}
                      placeholder="e.g. Charger, Power Cable"
                      className="w-full border border-gray-300 rounded-lg p-2 text-xs outline-none focus:ring-2 focus:ring-[#6C2BD9]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Remarks</label>
                    <input
                      type="text"
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      placeholder="Transfer remarks..."
                      className="w-full border border-gray-300 rounded-lg p-2 text-xs outline-none focus:ring-2 focus:ring-[#6C2BD9]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Reference No. (Optional)</label>
                    <input
                      type="text"
                      value={referenceNo}
                      onChange={(e) => setReferenceNo(e.target.value)}
                      placeholder="e.g. IT-MOVE-2026-001"
                      className="w-full border border-gray-300 rounded-lg p-2 text-xs outline-none focus:ring-2 focus:ring-[#6C2BD9]"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 5: REVIEW & CONFIRM BAR */}
              <div className="bg-white rounded-xl border border-purple-100 shadow-sm p-4">
                <h2 className="text-sm font-bold text-gray-900 mb-1">5. Review & Confirm</h2>
                <p className="text-xs text-gray-500 mb-3">Review the transfer details before submission</p>

                <div className="flex flex-wrap items-center justify-between gap-4 bg-[#FAF5FF] border border-purple-200/70 rounded-xl p-3.5 text-xs">
                  {/* Assets Count */}
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-[#6C2BD9] text-white font-bold flex items-center justify-center text-xs">
                      {selectedAssets.length}
                    </span>
                    <div>
                      <span className="font-bold text-gray-900 block">Assets Selected</span>
                      <button
                        onClick={() => setShowConfirmModal(true)}
                        className="text-[11px] text-[#6C2BD9] font-bold underline hover:text-[#5B21B6]"
                      >
                        View Assets
                      </button>
                    </div>
                  </div>

                  {/* From -> To */}
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#6C2BD9]" />
                    <div>
                      <span className="text-[11px] text-gray-400 block">From</span>
                      <span className="font-semibold text-gray-800">{fromLocation.formatted}</span>
                    </div>
                    <span className="text-[#6C2BD9] font-bold px-1">→</span>
                    <div>
                      <span className="text-[11px] text-gray-400 block">To</span>
                      <span className="font-semibold text-gray-800">{destLocationFormatted}</span>
                    </div>
                  </div>

                  {/* Transfer Date */}
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-amber-600" />
                    <div>
                      <span className="text-[11px] text-gray-400 block">Transfer Date</span>
                      <span className="font-semibold text-gray-800">{transferDate}</span>
                    </div>
                  </div>

                  {/* Reason */}
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-600" />
                    <div>
                      <span className="text-[11px] text-gray-400 block">Reason</span>
                      <span className="font-semibold text-gray-800">{movementReason}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ACTION BUTTONS (BOTTOM) */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => navigate('/movements')}
                  className="px-5 py-2.5 text-xs font-semibold text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    disabled={loading || selectedAssetIds.length === 0}
                    onClick={handleSaveDraft}
                    className="px-5 py-2.5 text-xs font-semibold text-[#6C2BD9] border border-[#6C2BD9] rounded-lg hover:bg-purple-50 transition-colors disabled:opacity-50"
                  >
                    Save as Draft
                  </button>
                  <button
                    type="button"
                    disabled={loading || selectedAssetIds.length === 0}
                    onClick={() => setShowConfirmModal(true)}
                    className="px-6 py-2.5 text-xs font-semibold text-white bg-[#6C2BD9] hover:bg-[#5B21B6] rounded-lg shadow-md transition-colors flex items-center gap-1.5 disabled:opacity-50"
                  >
                    Next: Review & Confirm →
                  </button>
                </div>
              </div>

            </div>

            {/* RIGHT 25% COLUMN (Selected Assets Panel + Supporting Documents) */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* SELECTED ASSETS PANEL */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3">
                  <h3 className="text-xs font-bold text-gray-900">
                    Selected Assets ({selectedAssets.length})
                  </h3>
                  {selectedAssets.length > 0 && (
                    <button
                      onClick={handleClearAllSelected}
                      className="text-xs text-[#6C2BD9] font-bold hover:underline"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                {selectedAssets.length === 0 ? (
                  <div className="py-8 text-center text-gray-400 text-xs">
                    No assets selected yet. Check items on the grid to verify.
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                    {selectedAssets.map((asset) => (
                      <div
                        key={asset.id}
                        className="bg-white border border-gray-200 rounded-lg p-3 hover:border-purple-300 transition-all relative group shadow-2xs"
                      >
                        {/* Remove Cross */}
                        <button
                          onClick={() => handleRemoveSelectedAsset(asset.id)}
                          className="absolute top-2 right-2 text-gray-400 hover:text-rose-500 p-0.5 rounded"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>

                        <div className="flex gap-3">
                          {/* Thumbnail */}
                          <div className="w-14 h-14 rounded-lg bg-gray-100 overflow-hidden shrink-0 border border-gray-200">
                            <img
                              src={asset.imageUrl}
                              alt={asset.assetName}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          <div className="flex-1 min-w-0 pr-3">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <span className="font-bold text-xs text-gray-900">{asset.assetNumber}</span>
                              <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                                {asset.status}
                              </span>
                            </div>
                            <p className="text-xs font-medium text-gray-700 truncate">{asset.assetName}</p>
                          </div>
                        </div>

                        {/* Specs Grid */}
                        <div className="mt-2.5 pt-2 border-t border-gray-100 grid grid-cols-2 gap-y-1 text-[11px]">
                          <div>
                            <span className="text-gray-400 block text-[10px]">Serial Number</span>
                            <span className="font-medium text-gray-800">{asset.serialNumber}</span>
                          </div>
                          <div>
                            <span className="text-gray-400 block text-[10px]">Tag / EPC</span>
                            <span className="font-medium text-gray-800 truncate block font-mono text-[10px]" title={asset.rfidEpc}>
                              {asset.rfidEpc}
                            </span>
                          </div>
                          <div className="col-span-2 mt-0.5">
                            <span className="text-gray-400 block text-[10px]">Current Location</span>
                            <span className="font-medium text-gray-800">{asset.currentLocation}</span>
                          </div>
                          <div className="col-span-2 mt-0.5">
                            <span className="text-gray-400 block text-[10px]">Current Custodian</span>
                            <span className="font-medium text-gray-800">{asset.currentCustodian}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* SECTION 4: SUPPORTING DOCUMENTS */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-3">
                <h3 className="text-xs font-bold text-gray-900">4. Supporting Documents (Optional)</h3>

                {/* Upload Drag & Drop Area */}
                <label className="border-2 border-dashed border-purple-200 hover:border-[#6C2BD9] bg-purple-50/40 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors text-center">
                  <UploadCloud className="w-8 h-8 text-[#6C2BD9] mb-1" />
                  <span className="text-xs text-gray-700 font-medium">
                    Drag and drop files here or <span className="text-[#6C2BD9] underline font-bold">click to browse</span>
                  </span>
                  <span className="text-[10px] text-gray-400 mt-0.5">
                    Supported files: JPG, PNG, PDF (Max 10 MB each)
                  </span>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    accept=".jpg,.jpeg,.png,.pdf"
                  />
                </label>

                {/* Uploaded Documents List */}
                <div className="space-y-2 pt-1">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-2 rounded-lg border border-gray-200 bg-gray-50 text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {doc.name.endsWith('.pdf') ? (
                          <FileText className="w-4 h-4 text-rose-500 shrink-0" />
                        ) : (
                          <FileText className="w-4 h-4 text-emerald-500 shrink-0" />
                        )}
                        <span className="truncate font-medium text-gray-800 text-[11px]">{doc.name}</span>
                        <span className="text-[10px] text-gray-400 shrink-0">{doc.size}</span>
                      </div>
                      <button
                        onClick={() => handleRemoveDocument(doc.id)}
                        className="text-gray-400 hover:text-rose-500 p-1"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* VIEW TAB 2: MOVEMENT APPROVALS */}
      {activeTab === 'approvals' && (
        <div className="max-w-[1600px] mx-auto px-6 py-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-gray-900">Pending Movement Approvals</h2>
                <p className="text-xs text-gray-500">Review transfer requests requiring administrative or departmental authorization</p>
              </div>
            </div>

            <div className="overflow-auto max-h-[500px] border border-gray-200 rounded-lg">
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 z-10 bg-gray-50 shadow-2xs">
                  <tr className="text-gray-700 border-b border-gray-200">
                    <th className="p-3 font-semibold">Transfer No</th>
                    <th className="p-3 font-semibold">Type</th>
                    <th className="p-3 font-semibold">Assets</th>
                    <th className="p-3 font-semibold">From Location</th>
                    <th className="p-3 font-semibold">To Location</th>
                    <th className="p-3 font-semibold">New Custodian</th>
                    <th className="p-3 font-semibold">Reason</th>
                    <th className="p-3 font-semibold">Date</th>
                    <th className="p-3 font-semibold">Status</th>
                    <th className="p-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-600">
                  {transfersList.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-6 text-center text-gray-400">
                        No movement requests currently awaiting approval.
                      </td>
                    </tr>
                  ) : (
                    transfersList.map((t) => (
                      <tr key={t.id} className="hover:bg-gray-50/80">
                        <td className="p-3 font-bold text-[#6C2BD9]">{t.transferNumber}</td>
                        <td className="p-3">{t.transferType}</td>
                        <td className="p-3 font-semibold">{t.assetCount} asset(s)</td>
                        <td className="p-3">{t.fromLocationFormatted}</td>
                        <td className="p-3 font-medium text-gray-900">{t.toLocationFormatted}</td>
                        <td className="p-3">{t.toCustodian || '-'}</td>
                        <td className="p-3 text-gray-500">{t.reason}</td>
                        <td className="p-3 text-gray-900 whitespace-nowrap">{t.transferDate || t.createdAt || '-'}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            t.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                            t.status === 'PENDING_APPROVAL' ? 'bg-amber-100 text-amber-800' :
                            t.status === 'DISPATCHED' ? 'bg-blue-100 text-blue-800' :
                            t.status === 'COMPLETED' ? 'bg-purple-100 text-purple-800' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {t.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          {t.status === 'PENDING_APPROVAL' ? (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => {
                                  setActiveSlipTransfer(t);
                                  setShowSlipModal(true);
                                }}
                                className="px-2.5 py-1 text-[#6C2BD9] hover:bg-purple-50 rounded font-bold text-[11px] border border-purple-200"
                              >
                                View
                              </button>
                              <button
                                onClick={() => handleWorkflowAction(t.id, 'APPROVE')}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-medium text-[11px]"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleWorkflowAction(t.id, 'REJECT', { comments: 'Rejected by manager' })}
                                className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded font-medium text-[11px]"
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setActiveSlipTransfer(t);
                                setShowSlipModal(true);
                              }}
                              className="text-[#6C2BD9] hover:underline font-bold text-[11px]"
                            >
                              View Slip
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW TAB 3: DISPATCH & IN-TRANSIT TRACKING */}
      {activeTab === 'transit' && (
        <div className="max-w-[1600px] mx-auto px-6 py-6 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-base font-bold text-gray-900 mb-1">Physical Dispatch & Destination Receipt</h2>
            <p className="text-xs text-gray-500 mb-4">
              Authorized logistics checkpoints: Dispatch items, track transit between facilities, and confirm destination receipt to update Asset Master.
            </p>

            <div className="overflow-auto max-h-[500px] border border-gray-200 rounded-lg">
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 z-10 bg-gray-50 shadow-2xs">
                  <tr className="text-gray-700 border-b border-gray-200">
                    <th className="p-3 font-semibold">Transfer No</th>
                    <th className="p-3 font-semibold">From Facility</th>
                    <th className="p-3 font-semibold">Destination Facility</th>
                    <th className="p-3 font-semibold">Assets</th>
                    <th className="p-3 font-semibold">Date</th>
                    <th className="p-3 font-semibold">Status</th>
                    <th className="p-3 font-semibold">Dispatcher</th>
                    <th className="p-3 font-semibold">Receiver</th>
                    <th className="p-3 font-semibold text-right">Physical Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-600">
                  {transfersList.map((t) => (
                    <tr key={t.id} className="hover:bg-gray-50/80">
                      <td className="p-3 font-bold text-[#6C2BD9]">{t.transferNumber}</td>
                      <td className="p-3">{t.fromLocationFormatted}</td>
                      <td className="p-3 font-medium text-gray-900">{t.toLocationFormatted}</td>
                      <td className="p-3 font-semibold">{t.assetCount} asset(s)</td>
                      <td className="p-3 text-gray-900 whitespace-nowrap">{t.transferDate || t.createdAt || '-'}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          t.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                          t.status === 'DISPATCHED' ? 'bg-blue-100 text-blue-800' :
                          t.status === 'IN_TRANSIT' ? 'bg-indigo-100 text-indigo-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {t.status}
                        </span>
                      </td>
                      <td className="p-3 text-gray-500">{t.dispatchedBy || '-'}</td>
                      <td className="p-3 text-gray-500">{t.receivedBy || '-'}</td>
                      <td className="p-3 text-right">
                        {t.status === 'APPROVED' && (
                          <button
                            onClick={() => handleWorkflowAction(t.id, 'DISPATCH')}
                            className="px-3 py-1 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white rounded font-medium text-[11px]"
                          >
                            Dispatch Goods
                          </button>
                        )}
                        {['DISPATCHED', 'IN_TRANSIT'].includes(t.status) && (
                          <button
                            onClick={() => handleWorkflowAction(t.id, 'CONFIRM_RECEIPT', { receiverName: 'Omar Saleh', receivedCondition: 'Good' })}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-medium text-[11px] shadow-sm"
                          >
                            Confirm Receipt
                          </button>
                        )}
                        {t.status === 'COMPLETED' && (
                          <button
                            onClick={() => {
                              setActiveSlipTransfer(t);
                              setShowSlipModal(true);
                            }}
                            className="text-[#6C2BD9] font-bold text-[11px] hover:underline"
                          >
                            Print Gate Pass
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW TAB 4: MOVEMENT HISTORY (IMMUTABLE AUDIT TRAIL) */}
      {activeTab === 'history' && (
        <div className="max-w-[1600px] mx-auto px-6 py-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-gray-900">Asset Movement Audit Trail</h2>
                <p className="text-xs text-gray-500">
                  Permanent, immutable history of all asset location, custodian, and department changes with before/after state snapshots.
                </p>
              </div>
            </div>

            <div className="overflow-auto max-h-[500px] border border-gray-200 rounded-lg">
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 z-10 bg-purple-50 shadow-2xs">
                  <tr className="text-gray-800 border-b border-purple-100">
                    <th className="p-3 font-semibold">Movement ID</th>
                    <th className="p-3 font-semibold">Asset No</th>
                    <th className="p-3 font-semibold">Asset Name</th>
                    <th className="p-3 font-semibold">From Location</th>
                    <th className="p-3 font-semibold">To Location</th>
                    <th className="p-3 font-semibold">Previous Custodian</th>
                    <th className="p-3 font-semibold">New Custodian</th>
                    <th className="p-3 font-semibold">Reason</th>
                    <th className="p-3 font-semibold">Condition</th>
                    <th className="p-3 font-semibold">Timestamp</th>
                    <th className="p-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-600">
                  {historyList.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="p-6 text-center text-gray-400">
                        No movement records found.
                      </td>
                    </tr>
                  ) : (
                    historyList.map((h) => (
                      <tr key={h.id} className="hover:bg-gray-50">
                        <td className="p-3 font-mono font-bold text-[#6C2BD9]">{h.movementId}</td>
                        <td className="p-3 font-semibold text-gray-900">{h.assetNumber}</td>
                        <td className="p-3 font-medium text-gray-800">{h.assetName}</td>
                        <td className="p-3">{h.fromLocation}</td>
                        <td className="p-3 font-medium text-gray-900">{h.toLocation}</td>
                        <td className="p-3">{h.previousCustodian || '-'}</td>
                        <td className="p-3 font-semibold text-gray-800">{h.newCustodian || '-'}</td>
                        <td className="p-3 text-gray-500">{h.reason}</td>
                        <td className="p-3">
                          <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-[10px]">
                            {h.condition}
                          </span>
                        </td>
                        <td className="p-3 text-gray-400">{new Date(h.timestamp).toLocaleString()}</td>
                        <td className="p-3">
                          <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full text-[10px]">
                            {h.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SCAN MODAL */}
      {showScanModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Scan className="w-5 h-5 text-[#6C2BD9]" />
                <h3 className="text-sm font-bold text-gray-900">Scan Asset (Barcode / RFID EPC)</h3>
              </div>
              <button onClick={() => setShowScanModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-gray-500">
              Enter or scan barcode, QR code or RFID tag EPC to instantly verify eligibility and add to transfer.
            </p>

            <div className="space-y-2">
              <input
                type="text"
                value={scanCodeInput}
                onChange={(e) => setScanCodeInput(e.target.value)}
                placeholder="Scan or type e.g. AS-000123, 75K3D24, E28011606000002053A1B4C0"
                className="w-full text-xs border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-[#6C2BD9]"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handlePerformScan}
                  className="flex-1 bg-[#6C2BD9] text-white py-2 rounded-lg text-xs font-semibold hover:bg-[#5B21B6]"
                >
                  Verify & Select
                </button>
                <button
                  type="button"
                  onClick={() => setScanCodeInput('E28011606000002053A1B4C0')}
                  className="px-3 py-2 border rounded-lg text-xs text-gray-600 hover:bg-gray-50"
                >
                  Simulate RFID
                </button>
              </div>
            </div>

            {scanScanResult && (
              <div className={`p-3 rounded-lg text-xs border ${
                scanScanResult.found && scanScanResult.isEligible
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}>
                {scanScanResult.found ? (
                  <div>
                    <span className="font-bold block">
                      {scanScanResult.asset.assetNumber} - {scanScanResult.asset.assetName}
                    </span>
                    <span className="text-[11px] block mt-0.5">
                      Location: {scanScanResult.asset.currentLocation}
                    </span>
                    <span className="text-[11px] font-semibold mt-1 block">
                      {scanScanResult.isEligible
                        ? '✓ Eligible for Transfer & Added to Selection'
                        : `✗ Ineligible: ${scanScanResult.reason}`}
                    </span>
                  </div>
                ) : (
                  <span>{scanScanResult.message}</span>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* CONFIRMATION & REVIEW MODAL */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b">
              <div>
                <h3 className="text-base font-bold text-gray-900">Review & Confirm Transfer</h3>
                <p className="text-xs text-gray-500">Confirm movement details before initiating administrative workflow</p>
              </div>
              <button onClick={() => setShowConfirmModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-3 rounded-lg">
                <div>
                  <span className="text-gray-400 block text-[11px]">From Origin Location</span>
                  <span className="font-semibold text-gray-900">{fromLocation.formatted}</span>
                </div>
                <div>
                  <span className="text-purple-700 block text-[11px] font-bold">To Destination Location</span>
                  <span className="font-semibold text-gray-900">{destLocationFormatted}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[11px]">Previous Custodian</span>
                  <span className="font-semibold text-gray-900">{fromLocation.site} ({selectedAssets[0]?.currentCustodian || '-'})</span>
                </div>
                <div>
                  <span className="text-purple-700 block text-[11px] font-bold">New Custodian</span>
                  <span className="font-semibold text-gray-900">{newCustodian}</span>
                </div>
              </div>

              <div>
                <span className="font-bold text-gray-700 block mb-1">
                  Selected Assets for Bulk Movement ({selectedAssets.length})
                </span>
                <div className="max-h-40 overflow-y-auto border rounded divide-y text-xs">
                  {selectedAssets.map(a => (
                    <div key={a.id} className="p-2 flex justify-between items-center bg-white">
                      <div>
                        <span className="font-bold text-gray-900 mr-2">{a.assetNumber}</span>
                        <span className="text-gray-600">{a.assetName}</span>
                      </div>
                      <span className="text-gray-400 font-mono text-[10px]">{a.serialNumber}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-lg text-[11px] flex gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                <span>
                  <strong>Governance Policy:</strong> Asset Master records will remain unchanged until required managerial approval and destination receipt confirmation are completed.
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 border rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-50"
              >
                Back to Edit
              </button>
              <button
                disabled={loading}
                onClick={handleSubmitTransfer}
                className="px-5 py-2 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white rounded-lg text-xs font-semibold shadow-sm flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" /> Confirm & Submit Transfer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GATE PASS / HANDOVER SLIP VIEWER MODAL */}
      {showSlipModal && activeSlipTransfer && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-[#6C2BD9]" />
                <h3 className="text-sm font-bold text-gray-900">
                  Asset Handover & Movement Slip ({activeSlipTransfer.transferNumber})
                </h3>
              </div>
              <button onClick={() => setShowSlipModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 border rounded-xl bg-gray-50/60 space-y-4 text-xs">
              <div className="flex justify-between border-b pb-2">
                <div>
                  <span className="font-bold text-sm text-gray-900">Asset360 Enterprise</span>
                  <p className="text-[11px] text-gray-500">Official Movement Gate Pass</p>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-[#6C2BD9]">{activeSlipTransfer.transferNumber}</span>
                  <p className="text-[10px] text-gray-400">Date: {activeSlipTransfer.transferDate}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-[11px]">
                <div>
                  <span className="text-gray-400 block">Origin:</span>
                  <span className="font-semibold text-gray-800">{activeSlipTransfer.fromLocationFormatted}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Destination:</span>
                  <span className="font-semibold text-gray-800">{activeSlipTransfer.toLocationFormatted}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Requester:</span>
                  <span className="font-semibold text-gray-800">{activeSlipTransfer.requestedBy}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">New Custodian:</span>
                  <span className="font-semibold text-gray-800">{activeSlipTransfer.toCustodian || '-'}</span>
                </div>
              </div>

              <div className="border-t pt-2">
                <span className="font-bold text-gray-700 block mb-1">Assets List</span>
                <table className="w-full text-left text-[11px]">
                  <thead>
                    <tr className="border-b text-gray-400">
                      <th className="py-1">Asset No</th>
                      <th className="py-1">Asset Name</th>
                      <th className="py-1">Serial</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(activeSlipTransfer.assets || []).map((a, i) => (
                      <tr key={i} className="border-b border-gray-100">
                        <td className="py-1 font-semibold">{a.assetNumber}</td>
                        <td className="py-1">{a.assetName}</td>
                        <td className="py-1 font-mono text-gray-500">{a.serialNumber}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="grid grid-cols-2 gap-8 pt-6 border-t text-[11px] text-gray-500 text-center">
                <div className="border-t border-dashed pt-1">
                  <span>Authorized Dispatcher Signature</span>
                </div>
                <div className="border-t border-dashed pt-1">
                  <span>Destination Receiver Signature</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-[#6C2BD9] text-white text-xs font-semibold rounded-lg hover:bg-[#5B21B6] flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" /> Print Gate Pass
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
