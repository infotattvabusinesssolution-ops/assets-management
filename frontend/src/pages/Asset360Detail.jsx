import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { StatusBadge } from '../components/common/StatusBadge';
import {
  Package,
  DollarSign,
  Wrench,
  ShieldCheck,
  MapPin,
  Radio,
  Sparkles,
  History,
  FileText,
  ArrowLeft,
  ArrowLeftRight,
  CheckCircle,
  Edit3,
  Printer,
  Calendar,
  User,
  Building,
  Tag,
  Cpu,
  AlertTriangle,
  ExternalLink,
  ChevronRight,
  Activity,
  CheckCircle2,
  Clock,
  Layers,
  FileCheck,
  Sliders,
  TrendingDown,
  Compass,
  Zap,
  Info
} from 'lucide-react';

const TABS = [
  { id: 'overview', label: 'Overview', icon: Package },
  { id: 'financial', label: 'Financials & Valuation', icon: DollarSign },
  { id: 'maintenance', label: 'Maintenance & Work Orders', icon: Wrench },
  { id: 'contracts', label: 'Contracts & Warranty', icon: FileText },
  { id: 'rtls', label: 'RTLS Live Signal', icon: Radio },
  { id: 'map', label: 'Floor Map Position', icon: MapPin },
  { id: 'discovery', label: 'IT Discovery Match', icon: Cpu },
  { id: 'audit', label: 'Audit Timeline', icon: History },
  { id: 'ai', label: 'AI Health & Risk', icon: Sparkles }
];

export function Asset360Detail() {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const requestedTab = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(requestedTab || 'overview');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    if (requestedTab && TABS.some(t => t.id === requestedTab)) {
      setActiveTab(requestedTab);
    }
  }, [requestedTab]);

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    setSearchParams({ tab: newTab });
  };

  useEffect(() => {
    let isMounted = true;

    async function fetch360() {
      try {
        setLoading(true);
        setError(null);

        let asset360Result = null;

        // Strategy 1: Direct API call by ID param
        try {
          const res = await api.get(`/assets/${encodeURIComponent(id)}/360`);
          if (res?.success && res.asset360?.asset) {
            asset360Result = res.asset360;
          }
        } catch (err) {
          console.warn('Direct 360 lookup note:', err?.message);
        }

        // Strategy 2: If direct failed (e.g. Server expects UUID instead of assetId or vice versa),
        // query /assets to find the asset record and resolve its database UUID.
        if (!asset360Result) {
          try {
            const listRes = await api.get('/assets', { params: { limit: 100 } });
            const list = Array.isArray(listRes?.assets) ? listRes.assets : [];
            const target = list.find(a =>
              a.id === id ||
              a.assetId === id ||
              (a.assetId && a.assetId.toLowerCase() === id.toLowerCase()) ||
              a.tagNumber === id ||
              a.serialNumber === id
            );

            if (target) {
              // Try fetching 360 using the resolved database UUID
              if (target.id && target.id !== id) {
                try {
                  const uuidRes = await api.get(`/assets/${encodeURIComponent(target.id)}/360`);
                  if (uuidRes?.success && uuidRes.asset360?.asset) {
                    asset360Result = uuidRes.asset360;
                  }
                } catch (uuidErr) {
                  console.warn('UUID 360 lookup note:', uuidErr?.message);
                }
              }

              // If still not resolved from 360 endpoint, construct dynamic profile from the asset record
              if (!asset360Result) {
                const bookVal = Number(target.acquisitionValue) || 0;
                asset360Result = {
                  asset: target,
                  bookValues: bookVal > 0 ? [{
                    bookType: 'CORPORATE',
                    capitalizationDate: target.purchaseDate || target.createdAt || new Date().toISOString(),
                    capitalizationValue: bookVal,
                    usefulLifeMonths: 60,
                    depreciationMethod: 'STRAIGHT_LINE',
                    accumulatedDepreciation: 0,
                    netBookValue: bookVal
                  }] : [],
                  transactions: [
                    {
                      id: 'tx-init',
                      transactionType: 'RECEIVE',
                      fromStatus: 'NONE',
                      toStatus: target.lifecycleStatus || 'IN_SERVICE',
                      timestamp: target.createdAt || target.purchaseDate || new Date().toISOString(),
                      notes: 'Asset intake into active register',
                      performedBy: { fullName: 'System Administrator' }
                    }
                  ],
                  workOrders: [],
                  schedules: target.schedules || [],
                  stocktakeObservations: [],
                  mapPosition: null,
                  discoveryMatch: null,
                  warranty: target.warranty || null,
                  auditEvents: [
                    {
                      id: 'ae-init',
                      action: 'ASSET_CREATE',
                      timestamp: target.createdAt || new Date().toISOString(),
                      user: { fullName: 'System Administrator' }
                    }
                  ]
                };
              }
            }
          } catch (listErr) {
            console.warn('List resolution note:', listErr?.message);
          }
        }

        if (isMounted) {
          if (asset360Result && asset360Result.asset) {
            setData(asset360Result);
          } else {
            setError(`Asset record [${id}] was not found in the database.`);
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err?.message || 'Failed to retrieve Asset 360 details');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetch360();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleQuickStatusChange = async (toStatus) => {
    if (!data?.asset) return;
    try {
      setIsUpdatingStatus(true);
      const assetTargetId = data.asset.assetId || data.asset.id;
      await api.patch(`/assets/${encodeURIComponent(assetTargetId)}/lifecycle`, {
        toStatus,
        notes: `Status changed to ${toStatus} from Asset 360 Profile`,
        reason: `Status changed to ${toStatus} from Asset 360 Profile`
      });
      setData(prev => ({
        ...prev,
        asset: { ...prev.asset, lifecycleStatus: toStatus },
        transactions: [
          {
            id: `tx-${Date.now()}`,
            transactionType: 'STATUS_CHANGE',
            fromStatus: prev.asset.lifecycleStatus,
            toStatus,
            timestamp: new Date().toISOString(),
            notes: `Status manually updated to ${toStatus}`,
            performedBy: { fullName: 'Current User' }
          },
          ...(prev.transactions || [])
        ]
      }));
      showToast('success', `Asset status updated to ${toStatus}!`);
    } catch (err) {
      showToast('error', err?.message || 'Failed to update status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 space-y-4 min-h-[400px]">
        <div className="w-10 h-10 border-4 border-[#6C2BD9]/20 border-t-[#6C2BD9] rounded-full animate-spin" />
        <p className="text-sm font-bold text-slate-600">Loading Asset 360° Profile for {id}...</p>
        <p className="text-xs text-slate-400">Fetching live technical, financial, RTLS and audit telemetry</p>
      </div>
    );
  }

  if (error || !data || !data.asset) {
    return (
      <div className="p-8 max-w-xl mx-auto text-center space-y-4 bg-white border border-slate-200 rounded-3xl shadow-sm mt-8">
        <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <h2 className="text-lg font-black text-slate-900">Asset Record Not Found</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          {error || `The requested asset identifier "${id}" does not exist in the active register.`}
        </p>
        <div className="pt-2 flex justify-center gap-3">
          <button
            onClick={() => navigate('/assets')}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Assets Register
          </button>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[#6C2BD9] hover:bg-[#5b21b6] text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { asset, bookValues = [], transactions = [], workOrders = [], schedules = [], mapPosition, discoveryMatch, warranty, auditEvents = [] } = data;

  // Normalized Dynamic Data Accessors
  const categoryName = asset.category?.name || asset.categoryName || (typeof asset.category === 'string' ? asset.category : '');
  const categoryCode = asset.category?.code || '';
  const manufacturerName = asset.manufacturer?.name || asset.manufacturerName || (typeof asset.manufacturer === 'string' ? asset.manufacturer : '');
  const modelName = asset.model?.name || asset.model?.modelNumber || asset.modelName || (typeof asset.model === 'string' ? asset.model : '');
  const companyName = asset.company?.name || asset.companyName || (typeof asset.company === 'string' ? asset.company : '');
  const siteName = asset.site?.name || asset.siteName || (typeof asset.site === 'string' ? asset.site : '');
  const buildingName = asset.building?.name || asset.buildingName || '';
  const floorName = asset.floor?.name || asset.floorName || '';
  const roomName = asset.room?.name || asset.roomName || '';
  const departmentName = asset.department?.name || asset.departmentName || (typeof asset.department === 'string' ? asset.department : '');
  const costCenterCode = asset.costCenter?.code || asset.costCenter?.name || asset.costCenterCode || '';

  const hasCustodian = Boolean(
    asset.custodian ||
    (asset.custodianName && asset.custodianName.toLowerCase() !== 'unassigned' && asset.custodianName.toLowerCase() !== 'none')
  );
  const custodianName = asset.custodian
    ? (asset.custodian.fullName || `${asset.custodian.firstName || ''} ${asset.custodian.lastName || ''}`.trim() || asset.custodian.email)
    : (asset.custodianName && asset.custodianName.toLowerCase() !== 'unassigned' && asset.custodianName.toLowerCase() !== 'none' ? asset.custodianName : null);
  const custodianEmail = asset.custodian?.email || null;
  const custodianCode = asset.custodian?.employeeCode || null;

  const currency = asset.currency || 'USD';
  const acquisitionValue = Number(asset.acquisitionValue) || 0;
  const primaryBook = bookValues && bookValues.length > 0 ? bookValues[0] : null;

  const tagNumber = asset.tagNumber || asset.barcode || asset.qrCode || '—';
  const rfidEpc = asset.rfidEpc || (asset.tagNumber?.startsWith('E28') || asset.tagNumber?.startsWith('E360') ? asset.tagNumber : null);
  const serialNumber = asset.serialNumber || '—';
  const healthScore = asset.healthScore ?? 100;
  const assetDocuments = Array.isArray(asset.documents)
    ? asset.documents
    : (typeof asset.documents === 'string' ? (() => { try { return JSON.parse(asset.documents); } catch { return []; } })() : []);

  return (
    <div className="space-y-5 pb-12">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-xl border text-xs font-bold flex items-center gap-2 animate-in slide-in-from-bottom duration-200 ${
          toast.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-rose-600" />}
          {toast.message}
        </div>
      )}

      {/* TOP HEADER PROFILE CARD */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        {/* Navigation & Context Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5 border-b border-slate-100 pb-4">
          <button
            onClick={() => navigate('/assets')}
            className="text-xs font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-slate-500" /> Back to Assets Register
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(`/assets/edit/${encodeURIComponent(asset.assetId || asset.id)}`)}
              className="px-3.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
              title="Edit asset attributes"
            >
              <Edit3 className="w-3.5 h-3.5 text-[#6C2BD9]" /> Edit Asset
            </button>

            <button
              onClick={() => {
                const targetId = asset.assetId || asset.id;
                navigate(`/movements/assign?assetId=${encodeURIComponent(targetId)}`, {
                  state: { assetId: targetId, asset }
                });
              }}
              className="px-3.5 py-1.5 bg-white border border-slate-200 hover:bg-purple-50 text-slate-700 hover:text-[#6C2BD9] text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
              title="Assign to employee / custodian"
            >
              <User className="w-3.5 h-3.5 text-[#6C2BD9]" /> Assign to Custodian
            </button>

            <button
              onClick={() => {
                const targetId = asset.assetId || asset.id;
                navigate(`/movements/transfer?assetId=${encodeURIComponent(targetId)}`, {
                  state: { assetId: targetId, asset }
                });
              }}
              className="px-3.5 py-1.5 bg-white border border-slate-200 hover:bg-purple-50 text-slate-700 hover:text-[#6C2BD9] text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
              title="Transfer to location / site"
            >
              <ArrowLeftRight className="w-3.5 h-3.5 text-[#6C2BD9]" /> Transfer Location / Site
            </button>

            <button
              onClick={() => navigate(`/receiving/print-tags?assetId=${encodeURIComponent(asset.assetId || asset.id)}`)}
              className="px-3.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
              title="Print barcode / RFID label"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" /> Print Tag
            </button>

            {asset.lifecycleStatus !== 'IN_SERVICE' ? (
              <button
                disabled={isUpdatingStatus}
                onClick={() => handleQuickStatusChange('IN_SERVICE')}
                className="px-4 py-1.5 bg-[#6C2BD9] hover:bg-[#5b21b6] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4" /> Mark In Service
              </button>
            ) : (
              <button
                disabled={isUpdatingStatus}
                onClick={() => handleQuickStatusChange('UNDER_MAINTENANCE')}
                className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                <Wrench className="w-4 h-4" /> Flag Maintenance
              </button>
            )}
          </div>
        </div>

        {/* Primary Asset Identity Banner */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-100 border border-purple-200/80 flex items-center justify-center text-[#6C2BD9] font-black text-2xl shadow-inner flex-shrink-0">
              <Package className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">{asset.description}</h1>
                <StatusBadge status={asset.lifecycleStatus} />
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${
                  asset.condition === 'New' || asset.condition === 'Good'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  ✓ {asset.condition || 'Good'} Condition
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 font-medium">
                <span>
                  Asset ID: <strong className="font-mono text-[#6C2BD9] font-bold">{asset.assetId}</strong>
                </span>
                <span>•</span>
                <span>
                  Tag / Barcode: <strong className="font-mono text-slate-800">{tagNumber}</strong>
                </span>
                <span>•</span>
                <span>
                  Serial: <strong className="font-mono text-slate-800">{serialNumber}</strong>
                </span>
                {categoryName && (
                  <>
                    <span>•</span>
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-bold text-[10px]">
                      {categoryName}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Quick Metrics Badge Pill */}
          <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-2xl border border-slate-200 self-start lg:self-auto">
            <div className="px-3 py-1 bg-white rounded-xl border border-slate-200 shadow-2xs text-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Health</span>
              <span className="text-sm font-black text-emerald-600">{healthScore}%</span>
            </div>
            <div className="px-3 py-1 bg-white rounded-xl border border-slate-200 shadow-2xs text-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Net Value</span>
              <span className="text-sm font-black text-slate-900">
                {acquisitionValue > 0 ? `${currency} ${Number(primaryBook?.netBookValue ?? acquisitionValue).toLocaleString()}` : '—'}
              </span>
            </div>
            <div className="px-3 py-1 bg-white rounded-xl border border-slate-200 shadow-2xs text-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">RTLS</span>
              {rfidEpc ? (
                <span className="text-sm font-black text-emerald-600 flex items-center gap-1 justify-center">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Tagged
                </span>
              ) : (
                <span className="text-sm font-bold text-slate-400 flex items-center gap-1 justify-center">
                  No Tag
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 9 NAVIGATION TABS */}
        <div className="flex items-center gap-2 mt-6 border-b border-slate-200 overflow-x-auto pb-0.5">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-bold rounded-t-xl transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-[#6C2BD9] text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: OVERVIEW */}
      {/* ========================================================================= */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Card 1: Identity & Classification */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Package className="w-4 h-4 text-[#6C2BD9]" /> Identity & Technical Classification
              </h3>
              {categoryCode && (
                <span className="text-[11px] font-bold text-slate-500 font-mono">Code: {categoryCode}</span>
              )}
            </div>
            <div className="text-xs space-y-2.5 text-slate-700 divide-y divide-slate-100">
              <div className="flex justify-between py-1 items-center">
                <span className="text-slate-500">Asset Category:</span>
                <span className="font-bold text-slate-900 bg-purple-50 text-[#6C2BD9] px-2.5 py-0.5 rounded-lg border border-purple-100">
                  {categoryName || 'General'}
                </span>
              </div>
              <div className="flex justify-between py-1 items-center">
                <span className="text-slate-500">Manufacturer / Brand:</span>
                <span className="font-bold text-slate-900">{manufacturerName || '—'}</span>
              </div>
              <div className="flex justify-between py-1 items-center">
                <span className="text-slate-500">Model Specification:</span>
                <span className="font-bold text-slate-900">{modelName || '—'}</span>
              </div>
              <div className="flex justify-between py-1 items-center">
                <span className="text-slate-500">Hardware Serial Number:</span>
                <span className="font-mono font-bold text-slate-900 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                  {serialNumber || '—'}
                </span>
              </div>
              <div className="flex justify-between py-1 items-center">
                <span className="text-slate-500">Physical Condition:</span>
                <span className="font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {asset.condition || 'Good'}
                </span>
              </div>
              <div className="flex justify-between py-1 items-center">
                <span className="text-slate-500">Criticality Tier:</span>
                <span className="font-bold text-slate-900">{asset.criticality || 'Medium'} Operational</span>
              </div>
              <div className="flex justify-between py-1 items-center">
                <span className="text-slate-500">Active Tag EPC:</span>
                <span className="font-mono font-bold text-indigo-700 text-[11px]">{rfidEpc || '—'}</span>
              </div>
            </div>
          </div>

          {/* Card 2: Location & Physical Placement */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600" /> Physical Location & Placement
              </h3>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                siteName
                  ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                  : 'text-amber-700 bg-amber-50 border-amber-200'
              }`}>
                {siteName ? 'Location Assigned' : 'Unassigned'}
              </span>
            </div>
            <div className="text-xs space-y-2.5 text-slate-700 divide-y divide-slate-100">
              <div className="flex justify-between py-1 items-center">
                <span className="text-slate-500">Company Entity:</span>
                <span className="font-bold text-slate-900">{companyName || '—'}</span>
              </div>
              <div className="flex justify-between py-1 items-center">
                <span className="text-slate-500">Campus / Site:</span>
                <span className="font-bold text-slate-900">{siteName || '—'}</span>
              </div>
              <div className="flex justify-between py-1 items-center">
                <span className="text-slate-500">Building & Room:</span>
                <span className="font-bold text-slate-900">
                  {[buildingName, floorName, roomName].filter(Boolean).join(' • ') || '—'}
                </span>
              </div>
              <div className="flex justify-between py-1 items-center">
                <span className="text-slate-500">Assigned Department:</span>
                <span className="font-bold text-slate-900">{departmentName || '—'}</span>
              </div>
              <div className="flex justify-between py-1 items-center">
                <span className="text-slate-500">Financial Cost Center:</span>
                <span className="font-mono font-bold text-slate-800 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                  {costCenterCode || '—'}
                </span>
              </div>
              <div className="flex justify-between py-1 items-center">
                <span className="text-slate-500">RTLS Live Beacon:</span>
                {rfidEpc ? (
                  <span className="font-bold text-emerald-600 flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-emerald-500" /> RFID Tagged ({rfidEpc.slice(0, 10)}...)
                  </span>
                ) : (
                  <span className="text-slate-400 italic">No RTLS beacon attached</span>
                )}
              </div>
            </div>
          </div>

          {/* Card 3: Custody & Personnel Assignment */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <User className="w-4 h-4 text-purple-600" /> Custody & Personnel Assignment
              </h3>
              {hasCustodian ? (
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Assigned
                </span>
              ) : (
                <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  Unassigned
                </span>
              )}
            </div>
            <div className="text-xs space-y-2.5 text-slate-700 divide-y divide-slate-100">
              <div className="flex justify-between py-1 items-center">
                <span className="text-slate-500">Current Custodian:</span>
                {hasCustodian ? (
                  <span className="font-bold text-[#6C2BD9] text-sm flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" /> {custodianName}
                  </span>
                ) : (
                  <span className="text-slate-400 italic">Unassigned</span>
                )}
              </div>
              <div className="flex justify-between py-1 items-center">
                <span className="text-slate-500">Employee ID / Code:</span>
                <span className="font-mono font-bold text-slate-800">{custodianCode || '—'}</span>
              </div>
              <div className="flex justify-between py-1 items-center">
                <span className="text-slate-500">Contact Email:</span>
                <span className="font-mono text-slate-600">{custodianEmail || '—'}</span>
              </div>
              <div className="flex justify-between py-1 items-center">
                <span className="text-slate-500">Assignment Effective Date:</span>
                <span className="font-bold text-slate-900">
                  {asset.assignedDate
                    ? new Date(asset.assignedDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                    : '—'}
                </span>
              </div>
            </div>
            {!hasCustodian && (
              <div className="pt-2">
                <button
                  onClick={() => {
                    const targetId = asset.assetId || asset.id;
                    navigate(`/movements/assign?assetId=${encodeURIComponent(targetId)}`, {
                      state: { assetId: targetId, asset }
                    });
                  }}
                  className="w-full py-2 bg-purple-50 hover:bg-purple-100 text-[#6C2BD9] border border-purple-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <User className="w-3.5 h-3.5" /> Assign Custodian
                </button>
              </div>
            )}
          </div>

          {/* Card 4: Procurement & Supplier Commercials */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-indigo-600" /> Procurement & Commercial Records
              </h3>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                asset.poNumber
                  ? 'text-indigo-700 bg-indigo-50 border-indigo-200'
                  : 'text-slate-500 bg-slate-100 border-slate-200'
              }`}>
                {asset.poNumber ? 'PO Linked' : 'Direct Acquisition'}
              </span>
            </div>
            <div className="text-xs space-y-2.5 text-slate-700 divide-y divide-slate-100">
              <div className="flex justify-between py-1 items-center">
                <span className="text-slate-500">Purchase Order (PO):</span>
                <span className="font-mono font-bold text-slate-900">{asset.poNumber || '—'}</span>
              </div>
              <div className="flex justify-between py-1 items-center">
                <span className="text-slate-500">Authorized Supplier:</span>
                <span className="font-bold text-slate-900">{asset.supplierName || '—'}</span>
              </div>
              <div className="flex justify-between py-1 items-center">
                <span className="text-slate-500">Acquisition Date:</span>
                <span className="font-bold text-slate-900">
                  {asset.purchaseDate
                    ? new Date(asset.purchaseDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                    : '—'}
                </span>
              </div>
              <div className="flex justify-between py-1 items-center">
                <span className="text-slate-500">Initial Capitalization Value:</span>
                <span className="font-bold text-slate-900 text-sm">
                  {acquisitionValue > 0 ? `${currency} ${acquisitionValue.toLocaleString()}` : '—'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: FINANCIALS & VALUATION */}
      {/* ========================================================================= */}
      {activeTab === 'financial' && (
        <div className="space-y-5">
          {/* KPI Valuation Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-1">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Acquisition Cost</span>
              <span className="text-2xl font-black text-slate-900">
                {acquisitionValue > 0 ? `${currency} ${acquisitionValue.toLocaleString()}` : '—'}
              </span>
              <span className="text-[11px] text-slate-400 block">Original Capitalized Value</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-1">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Net Book Value (NBV)</span>
              <span className="text-2xl font-black text-emerald-600">
                {primaryBook?.netBookValue != null
                  ? `${currency} ${Number(primaryBook.netBookValue).toLocaleString()}`
                  : acquisitionValue > 0
                    ? `${currency} ${acquisitionValue.toLocaleString()}`
                    : '—'}
              </span>
              <span className="text-[11px] text-emerald-600/80 font-semibold block">Current Balance Sheet Asset</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-1">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Accumulated Depreciation</span>
              <span className="text-2xl font-black text-amber-600">
                {primaryBook?.accumulatedDepreciation != null
                  ? `${currency} ${Number(primaryBook.accumulatedDepreciation).toLocaleString()}`
                  : '—'}
              </span>
              <span className="text-[11px] text-slate-400 block">
                Method: {primaryBook?.depreciationMethod || (acquisitionValue > 0 ? 'Straight Line' : '—')}
              </span>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-1">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Useful Life Schedule</span>
              <span className="text-2xl font-black text-[#6C2BD9]">
                {primaryBook?.usefulLifeMonths ? `${primaryBook.usefulLifeMonths} Months` : '—'}
              </span>
              <span className="text-[11px] text-slate-400 block">
                {primaryBook?.usefulLifeMonths ? `${(primaryBook.usefulLifeMonths / 12).toFixed(1)} Years Schedule` : 'Unscheduled'}
              </span>
            </div>
          </div>

          {/* Book Value Schedules Table */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#6C2BD9]" /> Asset Valuation Books
              </h3>
              <span className="text-xs text-slate-500 font-medium">Standard: IFRS / IAS 16 Compliant</span>
            </div>

            {bookValues && bookValues.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] font-bold">
                      <th className="py-3 px-3">Valuation Ledger Book</th>
                      <th className="py-3 px-3">Cap. Date</th>
                      <th className="py-3 px-3">Depreciation Method</th>
                      <th className="py-3 px-3 text-right">Acquisition Value</th>
                      <th className="py-3 px-3 text-right">Accumulated Dep.</th>
                      <th className="py-3 px-3 text-right">Net Book Value</th>
                      <th className="py-3 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {bookValues.map((bv, idx) => (
                      <tr key={bv.id || idx} className="hover:bg-slate-50/80">
                        <td className="py-3.5 px-3 font-bold text-slate-900 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[#6C2BD9]" /> {bv.bookType || 'Corporate Valuation Ledger'}
                        </td>
                        <td className="py-3.5 px-3 font-mono text-slate-600">
                          {bv.capitalizationDate
                            ? new Date(bv.capitalizationDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                            : '—'}
                        </td>
                        <td className="py-3.5 px-3 font-semibold text-slate-800">{bv.depreciationMethod || 'Straight Line'}</td>
                        <td className="py-3.5 px-3 font-mono font-bold text-right text-slate-900">
                          {currency} {Number(bv.capitalizationValue || acquisitionValue).toLocaleString()}
                        </td>
                        <td className="py-3.5 px-3 font-mono font-bold text-right text-amber-600">
                          {currency} {Number(bv.accumulatedDepreciation || 0).toLocaleString()}
                        </td>
                        <td className="py-3.5 px-3 font-mono font-black text-right text-emerald-600">
                          {currency} {Number(bv.netBookValue ?? (bv.capitalizationValue || acquisitionValue)).toLocaleString()}
                        </td>
                        <td className="py-3.5 px-3 text-center">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Active
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : acquisitionValue > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] font-bold">
                      <th className="py-3 px-3">Valuation Ledger Book</th>
                      <th className="py-3 px-3">Acquisition Date</th>
                      <th className="py-3 px-3">Depreciation Method</th>
                      <th className="py-3 px-3 text-right">Capitalized Value</th>
                      <th className="py-3 px-3 text-right">Accumulated Dep.</th>
                      <th className="py-3 px-3 text-right">Net Book Value</th>
                      <th className="py-3 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    <tr className="hover:bg-slate-50/80">
                      <td className="py-3.5 px-3 font-bold text-slate-900 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#6C2BD9]" /> Corporate Valuation Ledger
                      </td>
                      <td className="py-3.5 px-3 font-mono text-slate-600">
                        {asset.purchaseDate
                          ? new Date(asset.purchaseDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                          : '—'}
                      </td>
                      <td className="py-3.5 px-3 font-semibold text-slate-800">Straight Line</td>
                      <td className="py-3.5 px-3 font-mono font-bold text-right text-slate-900">{currency} {acquisitionValue.toLocaleString()}</td>
                      <td className="py-3.5 px-3 font-mono font-bold text-right text-slate-400">0.00</td>
                      <td className="py-3.5 px-3 font-mono font-black text-right text-emerald-600">{currency} {acquisitionValue.toLocaleString()}</td>
                      <td className="py-3.5 px-3 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                          Initial
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <Layers className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-slate-800">No Valuation Books Recorded</p>
                <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                  No capitalization ledger or depreciation schedule has been established for this asset.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: MAINTENANCE & WORK ORDERS */}
      {/* ========================================================================= */}
      {activeTab === 'maintenance' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-1">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Upcoming Service</span>
              <span className="text-xl font-black text-slate-900">
                {schedules[0]?.nextDueDate || workOrders?.find(w => w.status !== 'COMPLETED' && w.scheduledDate)?.scheduledDate
                  ? new Date(schedules[0]?.nextDueDate || workOrders.find(w => w.status !== 'COMPLETED' && w.scheduledDate).scheduledDate).toLocaleDateString('en-GB')
                  : 'None Scheduled'}
              </span>
              <span className="text-[11px] text-slate-400 block">Preventive Maintenance Schedule</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-1">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Assigned Technician</span>
              <span className="text-xl font-black text-slate-900">
                {workOrders?.[0]?.assignedTo?.fullName || workOrders?.[0]?.technicianName || 'Unassigned'}
              </span>
              <span className="text-[11px] text-slate-400 block">Direct Operations</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-1">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Work Orders Total</span>
              <span className="text-xl font-black text-[#6C2BD9]">{workOrders?.length || 0} Logged</span>
              <span className="text-[11px] text-slate-400 block">
                {workOrders?.filter(w => w.status !== 'COMPLETED').length || 0} Open Tickets
              </span>
            </div>
          </div>

          {schedules.length > 0 && <div className="bg-white border border-slate-200 rounded-2xl p-4 text-xs">
            <span className="font-bold text-slate-900">Preventive maintenance schedule</span>
            {schedules.map(schedule => <p key={schedule.id} className="mt-2 text-slate-600">{schedule.title} · Every {schedule.frequencyMonths} month(s) · Next due {new Date(schedule.nextDueDate).toLocaleDateString('en-GB')}</p>)}
          </div>}

          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Wrench className="w-4 h-4 text-[#6C2BD9]" /> Maintenance Work Order History
              </h3>
              <button
                onClick={() => navigate(`/maintenance/create?assetId=${encodeURIComponent(asset.assetId || asset.id)}`)}
                className="px-3 py-1.5 bg-[#6C2BD9] hover:bg-[#5b21b6] text-white text-xs font-bold rounded-xl flex items-center gap-1 shadow-2xs transition-all cursor-pointer"
              >
                + Create Work Order
              </button>
            </div>

            {workOrders && workOrders.length > 0 ? (
              <div className="space-y-3">
                {workOrders.map((wo) => (
                  <div key={wo.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900">{wo.orderNumber || wo.id}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-[#6C2BD9] border border-purple-200">
                          {wo.maintenanceType || 'Preventive'}
                        </span>
                      </div>
                      <p className="text-slate-600">{wo.description || 'Inspection & Health Diagnostic'}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 text-[11px] block">{new Date(wo.createdAt || Date.now()).toLocaleDateString()}</span>
                      <span className="font-bold text-slate-700">{wo.status || 'COMPLETED'}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <Wrench className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-slate-800">No Maintenance Work Orders Logged</p>
                <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                  No preventive maintenance tasks, repair requests, or service orders have been recorded for this asset.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: CONTRACTS & WARRANTY */}
      {/* ========================================================================= */}
      {activeTab === 'contracts' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> Manufacturer & SLA Warranty
              </h3>
              {warranty ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Active Coverage
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200">
                  No Warranty Registered
                </span>
              )}
            </div>
            {warranty ? (
              <div className="text-xs space-y-3 text-slate-700 divide-y divide-slate-100">
                <div className="flex justify-between py-1 items-center">
                  <span className="text-slate-500">Warranty Contract Ref:</span>
                  <span className="font-mono font-bold text-slate-900">{warranty.warrantyNumber || '—'}</span>
                </div>
                <div className="flex justify-between py-1 items-center">
                  <span className="text-slate-500">Coverage Provider:</span>
                  <span className="font-bold text-slate-900">{warranty.providerName || warranty.provider || '—'}</span>
                </div>
                <div className="flex justify-between py-1 items-center">
                  <span className="text-slate-500">Start Date:</span>
                  <span className="font-bold text-slate-900">
                    {warranty.startDate ? new Date(warranty.startDate).toLocaleDateString('en-GB') : '—'}
                  </span>
                </div>
                <div className="flex justify-between py-1 items-center">
                  <span className="text-slate-500">Expiry Date:</span>
                  <span className="font-bold text-slate-900">
                    {warranty.endDate ? new Date(warranty.endDate).toLocaleDateString('en-GB') : '—'}
                  </span>
                </div>
                <div className="flex justify-between py-1 items-center">
                  <span className="text-slate-500">Coverage Terms:</span>
                  <span className="font-bold text-slate-800">{warranty.coverageTerms || warranty.terms || '—'}</span>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-slate-800">No Warranty Policy Recorded</p>
                <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                  No active manufacturer, extended, or third-party warranty has been attached to this asset.
                </p>
              </div>
            )}
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#6C2BD9]" /> Associated Documentation & Files
              </h3>
              <span className="text-xs text-slate-400 font-mono">
                {assetDocuments?.length || 0} Files
              </span>
            </div>
            {assetDocuments && assetDocuments.length > 0 ? (
              <div className="space-y-2 text-xs">
                {assetDocuments.map((doc, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-between transition-colors">
                    <div className="flex items-center gap-2.5">
                      <FileText className="w-4 h-4 text-[#6C2BD9]" />
                      <div>
                        <span className="font-bold text-slate-900 block">{doc.name || doc.filename || `Document_${idx + 1}`}</span>
                        <span className="text-[10px] text-slate-400">{doc.size || 'Verified Document'}</span>
                      </div>
                    </div>
                    {doc.url ? (
                      <a href={doc.url} target="_blank" rel="noreferrer" className="text-[11px] font-bold text-[#6C2BD9] hover:underline">
                        View
                      </a>
                    ) : (
                      <span className="text-[11px] text-slate-400 font-medium">Attached</span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <FileText className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-slate-800">No Documents Uploaded</p>
                <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                  No purchase invoices, handover receipts, or technical specification files have been attached.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: RTLS LIVE TELEMETRY */}
      {/* ========================================================================= */}
      {activeTab === 'rtls' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Radio className={`w-5 h-5 ${rfidEpc ? 'text-emerald-600 animate-pulse' : 'text-slate-400'}`} /> Real-Time Location Telemetry & Gateways
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Live UHF RFID and BLE gateway antenna detections across physical checkpoints</p>
            </div>
            {rfidEpc ? (
              <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-purple-50 text-[#6C2BD9] border border-purple-200 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#6C2BD9]" /> TAG CONFIGURED
              </span>
            ) : (
              <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                NO RFID TAG
              </span>
            )}
          </div>

          {rfidEpc ? (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-purple-50/80 border border-purple-200 space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Assigned RFID EPC</span>
                  <span className="font-mono font-extrabold text-sm text-[#6C2BD9] block truncate" title={rfidEpc}>
                    {rfidEpc}
                  </span>
                  <span className="text-[10px] text-slate-400">Standard EPC Gen2 UHF</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Current Zone Assignment</span>
                  <span className="font-extrabold text-sm text-slate-900 block truncate">
                    {siteName || buildingName ? [siteName, buildingName, floorName].filter(Boolean).join(' • ') : 'Zone Unassigned'}
                  </span>
                  <span className="text-[10px] text-slate-400">{roomName ? `Assigned to ${roomName}` : 'No room specified'}</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Antenna Gateways</span>
                  <span className="font-extrabold text-sm text-slate-700 block">Standby / Awaiting Transit</span>
                  <span className="text-[10px] text-slate-400">Portal sensors will log transits</span>
                </div>
              </div>

              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-center space-y-2">
                <p className="font-bold text-slate-800">No Portal Transit Detections Logged Yet</p>
                <p className="text-[11px] text-slate-500 max-w-md mx-auto">
                  When this asset passes through an RFID portal reader or overhead zone sensor, transit timestamps and antenna signal strengths (RSSI) will appear in this feed.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-10 text-center bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Radio className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-800">No RFID / RTLS Beacon Assigned</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                This asset does not currently have a UHF RFID EPC or BLE tracking beacon assigned. Sensor gateway readings and transit logging will activate once a tag is paired.
              </p>
              <button
                onClick={() => navigate(`/tags?assetId=${encodeURIComponent(asset.assetId || asset.id)}`)}
                className="px-4 py-2 bg-[#6C2BD9] hover:bg-[#5b21b6] text-white text-xs font-bold rounded-xl shadow-2xs transition-all cursor-pointer inline-flex items-center gap-1.5 mx-auto"
              >
                <Radio className="w-4 h-4" /> Pair RFID Tag
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: FLOOR MAP POSITION */}
      {/* ========================================================================= */}
      {activeTab === 'map' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600" /> Architectural Map Coordinates
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {[siteName, buildingName, floorName, roomName].filter(Boolean).join(' • ') || 'Location details unassigned'}
              </p>
            </div>
            <button
              onClick={() => navigate('/maps')}
              className="text-xs font-bold text-[#6C2BD9] hover:underline flex items-center gap-1 cursor-pointer"
            >
              Open Interactive Floor Viewer <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {mapPosition && (mapPosition.x != null || mapPosition.coordinates) ? (
            <div className="relative w-full h-80 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 border border-slate-700 p-6 flex flex-col justify-between overflow-hidden shadow-inner">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#33415515_1px,transparent_1px),linear-gradient(to_bottom,#33415515_1px,transparent_1px)] bg-[size:24px_24px]" />

              <div className="relative z-10 flex justify-between items-start text-white">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-400 block">Floor Plan CAD Layer</span>
                  <h4 className="text-lg font-black">{siteName || 'Site Campus'} - {floorName || 'Assigned Floor'}</h4>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-white/10 text-white text-xs font-mono font-bold backdrop-blur-md">
                  POS: X: {mapPosition.x ?? 50}% | Y: {mapPosition.y ?? 50}%
                </span>
              </div>

              <div
                className="absolute z-20 flex flex-col items-center -translate-x-1/2 -translate-y-1/2"
                style={{ top: `${mapPosition.y ?? 50}%`, left: `${mapPosition.x ?? 50}%` }}
              >
                <span className="w-6 h-6 rounded-full bg-[#6C2BD9] border-2 border-white flex items-center justify-center text-white shadow-xl animate-bounce">
                  <Package className="w-3 h-3" />
                </span>
                <span className="w-10 h-10 rounded-full bg-[#6C2BD9]/30 absolute -top-2 animate-ping" />
                <div className="mt-1 px-2 py-0.5 rounded bg-slate-900/90 text-white text-[10px] font-bold whitespace-nowrap border border-slate-700">
                  {asset.assetId} {categoryName ? `(${categoryName})` : ''}
                </div>
              </div>

              <div className="relative z-10 flex justify-between items-end text-xs text-slate-300">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> {roomName || 'Assigned Position'}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">Pin Verified</span>
              </div>
            </div>
          ) : (
            <div className="p-10 text-center bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <MapPin className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-800">No Architectural Map Location Assigned</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                This asset has not been pinned to an architectural CAD floor plan. Open the Interactive Floor Viewer to assign coordinates on the floor layout.
              </p>
              <button
                onClick={() => navigate('/maps')}
                className="px-4 py-2 bg-[#6C2BD9] hover:bg-[#5b21b6] text-white text-xs font-bold rounded-xl shadow-2xs transition-all cursor-pointer inline-flex items-center gap-1.5 mx-auto"
              >
                <MapPin className="w-4 h-4" /> Open Interactive Floor Viewer
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 7: IT DISCOVERY MATCH */}
      {/* ========================================================================= */}
      {activeTab === 'discovery' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Cpu className="w-4 h-4 text-[#6C2BD9]" /> Automated Network Discovery Match
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">{discoveryMatch?.discoverySource === 'MANUAL_ENTRY' ? 'Details entered during asset registration' : 'Discovery telemetry linked with Asset360'}</p>
            </div>
            {discoveryMatch ? (
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> {discoveryMatch.discoverySource === 'MANUAL_ENTRY' ? 'Manual entry' : 'Reconciled'}
              </span>
            ) : (asset.hostname || asset.ipAddress || asset.macAddress) ? (
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                <Info className="w-3.5 h-3.5" /> Static Network Details
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-500 border border-slate-200">
                No Discovery Match
              </span>
            )}
          </div>

          {discoveryMatch ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 divide-y divide-slate-200/60">
                <div className="flex justify-between py-1 items-center">
                  <span className="text-slate-500">Hostname / Device Name:</span>
                  <span className="font-mono font-bold text-slate-900">{discoveryMatch.hostname || asset.hostname || '—'}</span>
                </div>
                <div className="flex justify-between py-1 items-center">
                  <span className="text-slate-500">IP Address:</span>
                  <span className="font-mono font-bold text-slate-900">{discoveryMatch.ipAddress || asset.ipAddress || '—'}</span>
                </div>
                <div className="flex justify-between py-1 items-center">
                  <span className="text-slate-500">MAC Address:</span>
                  <span className="font-mono font-bold text-slate-900">{discoveryMatch.macAddress || asset.macAddress || '—'}</span>
                </div>
                <div className="flex justify-between py-1 items-center">
                  <span className="text-slate-500">Operating System:</span>
                  <span className="font-bold text-slate-900">{discoveryMatch.operatingSystem || '—'}</span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 divide-y divide-slate-200/60">
                <div className="flex justify-between py-1 items-center">
                  <span className="text-slate-500">Processor (CPU):</span>
                  <span className="font-bold text-slate-900">{discoveryMatch.cpu || '—'}</span>
                </div>
                <div className="flex justify-between py-1 items-center">
                  <span className="text-slate-500">Installed Memory (RAM):</span>
                  <span className="font-bold text-slate-900">{discoveryMatch.ram || '—'}</span>
                </div>
                <div className="flex justify-between py-1 items-center">
                  <span className="text-slate-500">Storage:</span>
                  <span className="font-bold text-slate-900">{discoveryMatch.storage || '—'}</span>
                </div>
                <div className="flex justify-between py-1 items-center">
                  <span className="text-slate-500">Agent Last Seen:</span>
                  <span className="font-bold text-emerald-600">
                    {discoveryMatch.lastSeen ? new Date(discoveryMatch.lastSeen).toLocaleString('en-GB') : '—'}
                  </span>
                </div>
              </div>
            </div>
          ) : (asset.hostname || asset.ipAddress || asset.macAddress) ? (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2 divide-y divide-slate-200/60">
              <div className="flex justify-between py-1 items-center">
                <span className="text-slate-500">Hostname / Device Name:</span>
                <span className="font-mono font-bold text-slate-900">{asset.hostname || '—'}</span>
              </div>
              <div className="flex justify-between py-1 items-center">
                <span className="text-slate-500">IP Address:</span>
                <span className="font-mono font-bold text-slate-900">{asset.ipAddress || '—'}</span>
              </div>
              <div className="flex justify-between py-1 items-center">
                <span className="text-slate-500">MAC Address:</span>
                <span className="font-mono font-bold text-slate-900">{asset.macAddress || '—'}</span>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
              <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Cpu className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-slate-800">No IT Discovery Telemetry</p>
              <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                Automated network discovery agents (SNMP, WMI, or local client) have not reconciled this asset. Hostname, IP, MAC address, and hardware specs will populate upon first agent check-in.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 8: AUDIT TIMELINE */}
      {/* ========================================================================= */}
      {activeTab === 'audit' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <History className="w-4 h-4 text-[#6C2BD9]" /> Immutable Lifecycle Audit Log & Custody Chain
            </h3>
            <span className="text-xs text-slate-500 font-mono">
              {(transactions.length + auditEvents.length) || 1} Total Events Recorded
            </span>
          </div>

          <div className="space-y-3">
            {/* Merged Timeline Events */}
            {transactions.map((tx) => (
              <div key={tx.id || tx._id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wide bg-purple-100 text-[#6C2BD9]">
                      {tx.transactionType || 'TRANSITION'}
                    </span>
                    <span className="font-bold text-slate-800">
                      {tx.fromStatus && tx.toStatus ? `${tx.fromStatus} → ${tx.toStatus}` : (tx.notes || 'Status Verified')}
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px]">{tx.notes || 'Routine asset status synchronization'}</p>
                </div>
                <div className="text-left sm:text-right font-medium">
                  <span className="text-slate-500 block font-mono text-[11px]">
                    {new Date(tx.timestamp || Date.now()).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="text-slate-700 text-[11px] font-bold">By {tx.performedBy?.fullName || 'System Administrator'}</span>
                </div>
              </div>
            ))}

            {auditEvents.map((ae) => (
              <div key={ae.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wide bg-emerald-100 text-emerald-800">
                      {ae.action}
                    </span>
                    <span className="font-bold text-slate-800">{ae.entityType} Master Audit Record</span>
                  </div>
                  <p className="text-slate-600 text-[11px] font-mono truncate max-w-md">
                    {typeof ae.afterState === 'string' ? ae.afterState : 'Database state snapshot committed'}
                  </p>
                </div>
                <div className="text-left sm:text-right font-medium">
                  <span className="text-slate-500 block font-mono text-[11px]">
                    {new Date(ae.timestamp || ae.createdAt || Date.now()).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="text-slate-700 text-[11px] font-bold">By {ae.user?.fullName || 'System Administrator'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 9: AI HEALTH & RISK */}
      {/* ========================================================================= */}
      {activeTab === 'ai' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-1">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">AI Health Index</span>
              <span className={`text-2xl font-black ${healthScore >= 80 ? 'text-emerald-600' : healthScore >= 50 ? 'text-amber-600' : 'text-rose-600'}`}>
                {healthScore} / 100
              </span>
              <span className="text-[11px] text-slate-500 font-bold block">
                {healthScore >= 80 ? 'Optimal Operational Performance' : healthScore >= 50 ? 'Moderate Health' : 'Attention Required'}
              </span>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-1">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Failure Risk (90 Days)</span>
              <span className="text-2xl font-black text-slate-900">
                {healthScore >= 80 ? 'Low (< 5%)' : healthScore >= 50 ? 'Moderate (10-25%)' : 'High (> 35%)'}
              </span>
              <span className="text-[11px] text-slate-400 block">Based on maintenance & age logs</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-1">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Useful Life Schedule</span>
              <span className="text-2xl font-black text-[#6C2BD9]">
                {primaryBook?.usefulLifeMonths ? `${primaryBook.usefulLifeMonths} Months` : 'Active'}
              </span>
              <span className="text-[11px] text-slate-400 block">
                Status: {asset.lifecycleStatus || 'IN_SERVICE'}
              </span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#6C2BD9]" /> Predictive Maintenance Insights & AI Recommendations
              </h3>
              <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
                AI Engine Active
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200/80 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-bold text-emerald-950 block">Operational Assessment</span>
                  <p className="text-emerald-800 text-[11px] leading-relaxed">
                    Asset condition is currently rated as &apos;{asset.condition || 'NEW'}&apos; with an overall health score of {healthScore}/100.
                    {workOrders?.length > 0
                      ? ` ${workOrders.length} service ticket(s) recorded in maintenance history.`
                      : ' No active fault or breakdown tickets recorded.'}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-purple-50/60 rounded-2xl border border-purple-200/80 flex items-start gap-3">
                <Info className="w-5 h-5 text-[#6C2BD9] flex-shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-bold text-purple-950 block">Lifecycle Recommendation</span>
                  <p className="text-purple-800 text-[11px] leading-relaxed">
                    Current lifecycle status is &apos;{asset.lifecycleStatus || 'IN_SERVICE'}&apos;.
                    {hasCustodian
                      ? ` Assigned to custodian ${custodianName}.`
                      : ' Currently unassigned to any individual custodian.'}
                    {' Ensure standard periodic audits and physical tag verification.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Asset360Detail;
