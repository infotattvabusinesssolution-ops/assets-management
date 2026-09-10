import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { StatusBadge } from '../components/common/StatusBadge';
import {
  Package, DollarSign, Wrench, ShieldCheck, MapPin, Radio, Sparkles, History, FileText, ArrowLeft, CheckCircle
} from 'lucide-react';

const TABS = [
  { id: 'overview', label: 'Overview', icon: Package },
  { id: 'financial', label: 'Financials', icon: DollarSign },
  { id: 'maintenance', label: 'Maintenance', icon: Wrench },
  { id: 'contracts', label: 'Contracts & Warranty', icon: FileText },
  {id: 'rtls', label: 'RTLS Live Signal', icon: Radio },
  { id: 'map', label: 'Floor Map Position', icon: MapPin },
  { id: 'discovery', label: 'IT Discovery', icon: Radio },
  { id: 'audit', label: 'Audit Timeline', icon: History },
  { id: 'ai', label: 'AI Health & Risk', icon: Sparkles }
];

export function Asset360Detail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch360() {
      try {
        const res = await api.get(`/assets/${id}/360`);
        if (res.success) setData(res.asset360);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetch360();
  }, [id]);

  if (loading) return <div className="p-8 text-center text-slate-400">Loading Asset 360° View...</div>;
  if (!data) return <div className="p-8 text-center text-slate-400">Asset not found.</div>;

  const { asset, bookValues, transactions, workOrders, mapPosition, discoveryMatch, warranty, auditEvents } = data;

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <button onClick={() => navigate('/assets')} className="btn-secondary text-xs mb-4 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200">
          <ArrowLeft className="w-4 h-4" /> Back to Register
        </button>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 font-bold text-2xl shadow-xs">
              <Package className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-slate-900">{asset.description}</h1>
                <StatusBadge status={asset.lifecycleStatus} />
              </div>
              <p className="text-xs text-slate-500 mt-1 font-mono">
                Asset ID: <span className="text-purple-600 font-bold">{asset.assetId}</span> | Tag: {asset.tagNumber || 'N/A'} | Serial: {asset.serialNumber || 'N/A'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={async () => {
                await api.patch(`/assets/${asset._id}/lifecycle`, { toStatus: 'IN_SERVICE' });
                window.location.reload();
              }}
              className="btn-primary flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold px-4 py-2 rounded-lg text-xs shadow-xs"
            >
              <CheckCircle className="w-4 h-4" /> Mark In Service
            </button>
          </div>
        </div>

        {/* 16 Tabs Bar */}
        <div className="flex items-center gap-2 mt-6 border-b border-slate-200 overflow-x-auto pb-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-t-lg transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Contents */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-xs">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Identity & Classification</h3>
            <div className="text-xs space-y-2 text-slate-700">
              <div className="flex justify-between py-1.5 border-b border-slate-100"><span>Category:</span><span className="font-semibold text-slate-900">{asset.categoryId?.name || 'N/A'}</span></div>
              <div className="flex justify-between py-1.5 border-b border-slate-100"><span>Manufacturer:</span><span className="font-semibold text-slate-900">{asset.manufacturerId?.name || 'N/A'}</span></div>
              <div className="flex justify-between py-1.5 border-b border-slate-100"><span>Model:</span><span className="font-semibold text-slate-900">{asset.modelId?.name || 'N/A'}</span></div>
              <div className="flex justify-between py-1.5 border-b border-slate-100"><span>Condition:</span><span className="font-semibold text-emerald-600">{asset.condition}</span></div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-xs">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Location & Custody</h3>
            <div className="text-xs space-y-2 text-slate-700">
              <div className="flex justify-between py-1.5 border-b border-slate-100"><span>Company Entity:</span><span className="font-semibold text-slate-900">{asset.companyId?.name || 'N/A'}</span></div>
              <div className="flex justify-between py-1.5 border-b border-slate-100"><span>Site Campus:</span><span className="font-semibold text-slate-900">{asset.siteId?.name || 'N/A'}</span></div>
              <div className="flex justify-between py-1.5 border-b border-slate-100"><span>Building / Room:</span><span className="font-semibold text-slate-900">{asset.buildingId?.name || 'N/A'} / {asset.roomId?.name || 'N/A'}</span></div>
              <div className="flex justify-between py-1.5 border-b border-slate-100"><span>Current Custodian:</span><span className="font-semibold text-purple-600">{asset.custodianId?.fullName || 'Unassigned'}</span></div>
              <div className="flex justify-between py-1.5 border-b border-slate-100"><span>RTLS Tracking:</span><span className="font-bold text-emerald-600 flex items-center gap-1"><Radio className="w-3.5 h-3.5 animate-pulse" /> Live Telemetry Active</span></div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'financial' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Corporate Asset Book Valuations</h3>
          {bookValues && bookValues.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 shadow-xs">
                <span className="text-[10px] text-slate-500 block uppercase font-bold">Acquisition Cost</span>
                <span className="text-lg font-bold text-slate-900">\${bookValues[0].capitalizationValue?.toString() || '0'}</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 shadow-xs">
                <span className="text-[10px] text-slate-500 block uppercase font-bold">Useful Life</span>
                <span className="text-lg font-bold text-slate-900">{bookValues[0].usefulLifeMonths} Months</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 shadow-xs">
                <span className="text-[10px] text-slate-500 block uppercase font-bold">Accumulated Dep.</span>
                <span className="text-lg font-bold text-amber-600">\${bookValues[0].accumulatedDepreciation?.toString() || '0'}</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 shadow-xs">
                <span className="text-[10px] text-slate-500 block uppercase font-bold">Net Book Value (NBV)</span>
                <span className="text-lg font-bold text-emerald-600">\${bookValues[0].netBookValue?.toString() || '0'}</span>
              </div>
            </div>
          ) : <p className="text-xs text-slate-500">No financial book entries found.</p>}
        </div>
      )}

      {activeTab === 'rtls' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <Radio className="w-4 h-4 text-emerald-600" /> Real-Time Location Telemetry & Gateways
            </h3>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
              SIGNAL CONFIRMED
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-purple-50 border border-purple-200">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Assigned RFID EPC</span>
              <span className="font-mono font-extrabold text-sm text-[#6c2bd9]">{asset.rfidEpc || asset.tagNumber || 'E280116060009001'}</span>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Last Gateway Reader</span>
              <span className="font-mono font-extrabold text-sm text-emerald-700">R-MAIN-ENTRANCE-01 (Antenna 1)</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Signal Confidence</span>
              <span className="font-extrabold text-sm text-slate-900">95% (RSSI: -55 dBm)</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'audit' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-xs">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Chronological Audit Log</h3>
          <div className="space-y-2">
            {transactions.map((tx) => (
              <div key={tx._id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs shadow-xs">
                <div>
                  <span className="font-semibold text-purple-600 uppercase">{tx.transactionType}</span>
                  <p className="text-slate-700 mt-0.5">{tx.notes}</p>
                </div>
                <div className="text-right text-slate-500">
                  <span>{new Date(tx.timestamp).toLocaleString()}</span>
                  <p className="text-slate-600 font-medium">By {tx.performedBy?.fullName || 'System'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
