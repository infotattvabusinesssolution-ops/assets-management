import React, { useState, useEffect } from 'react';
import {
  Layers,
  Cpu,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Activity,
  ArrowLeftRight,
  ShieldCheck,
  Radio,
  ExternalLink,
  Play,
  Settings,
  FileText,
  Clock,
  MoreVertical,
  X,
  Lock,
  Search,
  Database,
  Check
} from 'lucide-react';
import { api } from '../../services/api';
import clsx from 'clsx';

const FALLBACK_INTEGRATIONS = [
  {
    id: 'INT-001',
    name: 'SAP S/4HANA Finance & Fixed Assets',
    externalSystem: 'SAP S/4HANA',
    systemType: 'ERP Systems',
    direction: 'Bi-directional',
    frequency: 'Hourly',
    lastSync: 'Today 04:15 PM',
    status: 'Active',
    lastResult: 'Success',
    recordsProcessed: 1240,
    errorCount: 0,
    endpointUrl: 'https://sap-gateway.asset360.internal/odata/v4/AssetAccounting',
    authType: 'OAuth 2.0 Client Credentials',
    description: 'Synchronizes capitalized asset cost, depreciation postings, and purchase invoice references.'
  },
  {
    id: 'INT-002',
    name: 'Workday Employee & Custodian Sync',
    externalSystem: 'Workday HCM',
    systemType: 'HR Systems',
    direction: 'Inbound',
    frequency: 'Daily',
    lastSync: 'Today 02:00 AM',
    status: 'Active',
    lastResult: 'Success',
    recordsProcessed: 850,
    errorCount: 0,
    endpointUrl: 'https://wd5-impl-services1.workday.com/ccx/service/customreport2/asset360_workers',
    authType: 'OAuth 2.0 Bearer Token',
    description: 'Synchronizes employee master data, designations, business units, and department heads for asset custody.'
  },
  {
    id: 'INT-003',
    name: 'ServiceNow ITSM & CMDB Integration',
    externalSystem: 'ServiceNow',
    systemType: 'ITSM',
    direction: 'Bi-directional',
    frequency: 'Real-time',
    lastSync: 'Just now',
    status: 'Active',
    lastResult: 'Warning',
    recordsProcessed: 4120,
    errorCount: 2,
    endpointUrl: 'https://asset360.service-now.com/api/now/table/cmdb_ci_hardware',
    authType: 'API Key & Mutual TLS',
    description: 'Links Asset360 hardware tags with ServiceNow Configuration Items and incident tickets.'
  },
  {
    id: 'INT-004',
    name: 'Microsoft Entra ID Directory & SSO',
    externalSystem: 'Microsoft Entra ID',
    systemType: 'Identity & Security',
    direction: 'Inbound',
    frequency: 'Real-time',
    lastSync: '10 mins ago',
    status: 'Active',
    lastResult: 'Success',
    recordsProcessed: 48,
    errorCount: 0,
    endpointUrl: 'https://graph.microsoft.com/v1.0/users',
    authType: 'Microsoft Graph Client Secret',
    description: 'Enterprise SSO, SCIM automated user provisioning, and role group synchronization.'
  },
  {
    id: 'INT-005',
    name: 'Impinj RFID Speedway Gateway',
    externalSystem: 'Impinj Speedway',
    systemType: 'IoT & Devices',
    direction: 'Inbound',
    frequency: 'Real-time',
    lastSync: 'Just now',
    status: 'Active',
    lastResult: 'Success',
    recordsProcessed: 14890,
    errorCount: 0,
    endpointUrl: 'mqtt://rfid-broker.asset360.internal:1883/rfid/gateways/#',
    authType: 'TLS Certificate & Token',
    description: 'High-speed fixed portal RFID tag antenna reads for real-time warehouse location tracking.'
  },
  {
    id: 'INT-006',
    name: 'Oracle Fusion Procurement',
    externalSystem: 'Oracle Cloud ERP',
    systemType: 'ERP Systems',
    direction: 'Inbound',
    frequency: 'Daily',
    lastSync: 'Yesterday 11:30 PM',
    status: 'Inactive',
    lastResult: 'Idle',
    recordsProcessed: 0,
    errorCount: 0,
    endpointUrl: 'https://fa-internal.oraclecloud.com/fscmRestApi/resources/11.13.18.05/purchaseOrders',
    authType: 'Basic Auth (Masked)',
    description: 'Automated retrieval of approved purchase orders and supplier delivery schedules.'
  },
  {
    id: 'INT-007',
    name: 'Aruba Meridian RTLS Positioning',
    externalSystem: 'Aruba Meridian',
    systemType: 'IoT & Devices',
    direction: 'Inbound',
    frequency: 'Real-time',
    lastSync: 'Just now',
    status: 'Active',
    lastResult: 'Success',
    recordsProcessed: 8450,
    errorCount: 1,
    endpointUrl: 'wss://meridian.arubanetworks.com/api/v1/tracking/stream',
    authType: 'App Token (Masked)',
    description: 'Live BLE asset positioning on indoor building floor maps with geofence breach triggers.'
  }
];

export function IntegrationsConsole() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [integrations, setIntegrations] = useState(FALLBACK_INTEGRATIONS);
  const [kpis, setKpis] = useState({
    totalConfigured: 7,
    activeInterfaces: 5,
    lastSuccessfulSync: 'Today at 04:45 PM',
    syncErrorsToday: 1
  });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Drawer & Modal States
  const [selectedIntegration, setSelectedIntegration] = useState(null);
  const [activeDrawerTab, setActiveDrawerTab] = useState('OVERVIEW'); // 'OVERVIEW' | 'MAPPING' | 'HISTORY' | 'CONFIG'
  const [testResult, setTestResult] = useState(null);
  const [testingId, setTestingId] = useState(null);
  const [syncingId, setSyncingId] = useState(null);

  const categories = [
    'All Integrations',
    'ERP Systems',
    'HR Systems',
    'ITSM',
    'Identity & Security',
    'IoT & Devices',
    'Other Systems'
  ];

  const showNotification = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const loadIntegrations = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/integrations', {
        params: { category: activeCategory === 'All Integrations' ? 'All' : activeCategory }
      });
      if (res?.integrations && res.integrations.length > 0) {
        setIntegrations(res.integrations);
        if (res.kpis) setKpis(res.kpis);
      }
    } catch (err) {
      console.warn('Integrations loaded with resilient fallback:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIntegrations();
  }, [activeCategory]);

  // Test Connection
  const handleTestConnection = async (integration) => {
    setTestingId(integration.id);
    setTestResult(null);
    try {
      const res = await api.post(`/admin/integrations/${integration.id}/test`);
      setTestResult(res);
      showNotification('success', `Connection to ${integration.name} successful (${res.latency})`);
    } catch (err) {
      showNotification('error', `Connection test failed for ${integration.name}`);
    } finally {
      setTestingId(null);
    }
  };

  // Run Sync Now
  const handleRunSync = async (integration) => {
    setSyncingId(integration.id);
    try {
      const res = await api.post(`/admin/integrations/${integration.id}/sync`);
      showNotification('success', `Synchronization completed for ${integration.name}.`);
      loadIntegrations();
    } catch (err) {
      showNotification('error', 'Sync job failed.');
    } finally {
      setSyncingId(null);
    }
  };

  // Toggle Status
  const handleToggleStatus = async (integration) => {
    try {
      await api.patch(`/admin/integrations/${integration.id}/toggle`);
      showNotification('success', `Status updated for ${integration.name}`);
      loadIntegrations();
    } catch (err) {
      showNotification('error', 'Status toggle failed.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-16">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl bg-slate-900 text-white text-xs border border-slate-700 animate-in fade-in slide-in-from-bottom-3 duration-200">
          {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
          {toast.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />}
          {toast.type === 'error' && <XCircle className="w-4 h-4 text-rose-400 shrink-0" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-5">
        <div className="max-w-[1700px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
              <span>Administration</span>
              <span className="text-slate-300">&gt;</span>
              <span className="text-[#6C2BD9]">Integrations Console</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
              <Cpu className="w-6 h-6 text-[#6C2BD9]" />
              <span>Integrations Console</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Centralized enterprise interfaces management across ERP, HR, ITSM, Identity, and IoT edge hardware
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={loadIntegrations}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 shadow-2xs transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Status</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1700px] mx-auto px-6 pt-5 space-y-5">
        {/* KPI Top Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <p className="text-[11px] font-semibold text-slate-400 uppercase">Total Configured</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{kpis.totalConfigured}</p>
            <span className="text-[10px] text-slate-400">Enterprise Connectors</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <p className="text-[11px] font-semibold text-slate-400 uppercase">Active Interfaces</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{kpis.activeInterfaces}</p>
            <span className="text-[10px] text-emerald-700 font-semibold">Live Real-time / Scheduled</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <p className="text-[11px] font-semibold text-slate-400 uppercase">Last Successful Sync</p>
            <p className="text-sm font-bold text-slate-900 mt-2 truncate">{kpis.lastSuccessfulSync}</p>
            <span className="text-[10px] text-slate-400">Workday & ServiceNow</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <p className="text-[11px] font-semibold text-slate-400 uppercase">Sync Warnings / Errors</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">{kpis.syncErrorsToday}</p>
            <span className="text-[10px] text-amber-700 font-semibold">Aruba RTLS Beacon Jitter</span>
          </div>
        </div>

        {/* Categories Tab Bar */}
        <div className="border-b border-slate-200">
          <nav className="flex space-x-6 text-xs font-semibold overflow-x-auto pb-1">
            {categories.map((cat) => {
              const isActive = (activeCategory === 'All' && cat === 'All Integrations') || activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat === 'All Integrations' ? 'All' : cat)}
                  className={clsx(
                    'pb-3 cursor-pointer whitespace-nowrap transition-colors relative',
                    isActive
                      ? 'text-[#6C2BD9] font-bold border-b-2 border-[#6C2BD9]'
                      : 'text-slate-500 hover:text-slate-800'
                  )}
                >
                  {cat}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Integrations Register Grid */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Configured Interfaces Register</h3>
            <span className="text-xs text-slate-500">Showing {integrations.length} Active Connectors</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500">
                <tr>
                  <th className="py-3 px-4">Integration Name</th>
                  <th className="py-3 px-4">System Category</th>
                  <th className="py-3 px-4">External Platform</th>
                  <th className="py-3 px-4 text-center">Direction</th>
                  <th className="py-3 px-4">Frequency</th>
                  <th className="py-3 px-4">Last Sync</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {integrations.map((intItem) => (
                  <tr key={intItem.id} className="hover:bg-slate-50/80">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded bg-purple-50 text-[#6C2BD9] flex items-center justify-center font-bold text-xs shrink-0">
                          {intItem.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{intItem.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{intItem.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">{intItem.category}</td>
                    <td className="py-3.5 px-4 text-slate-800">{intItem.systemType}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        <ArrowLeftRight className="w-3 h-3 text-slate-500" />
                        <span>{intItem.direction}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 text-[11px]">{intItem.frequency}</td>
                    <td className="py-3.5 px-4 text-[11px]">
                      <p className="text-slate-800 font-medium">{intItem.lastSync}</p>
                      <p className="text-[10px] text-slate-400">{intItem.recordsProcessedToday} records today</p>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={clsx(
                        'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold',
                        intItem.status === 'Active' ? 'bg-emerald-100 text-emerald-800' :
                        intItem.status === 'Warning' ? 'bg-amber-100 text-amber-800' :
                        'bg-slate-100 text-slate-600'
                      )}>
                        <span className={clsx(
                          'w-1.5 h-1.5 rounded-full',
                          intItem.status === 'Active' ? 'bg-emerald-600 animate-pulse' :
                          intItem.status === 'Warning' ? 'bg-amber-600' : 'bg-slate-400'
                        )} />
                        <span>{intItem.status}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleTestConnection(intItem)}
                          disabled={testingId === intItem.id}
                          className="px-2.5 py-1 text-[11px] font-semibold rounded border border-slate-200 hover:bg-slate-100 text-slate-700"
                          title="Test Connection Handshake"
                        >
                          {testingId === intItem.id ? <RefreshCw className="w-3 h-3 animate-spin" /> : 'Test'}
                        </button>
                        <button
                          onClick={() => handleRunSync(intItem)}
                          disabled={syncingId === intItem.id || intItem.status === 'Inactive'}
                          className="px-2.5 py-1 text-[11px] font-semibold rounded bg-[#6C2BD9] hover:bg-[#5B21B6] text-white disabled:opacity-40"
                          title="Trigger Immediate Sync"
                        >
                          {syncingId === intItem.id ? <RefreshCw className="w-3 h-3 animate-spin" /> : 'Sync Now'}
                        </button>
                        <button
                          onClick={() => {
                            setSelectedIntegration(intItem);
                            setActiveDrawerTab('OVERVIEW');
                          }}
                          className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700"
                          title="View Details & Mapping"
                        >
                          <Settings className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* SLIDE-OUT CONFIGURATION & MAPPING DRAWER */}
      {selectedIntegration && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex justify-end">
          <div className="bg-white w-full max-w-xl h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Cpu className="w-5 h-5 text-[#6C2BD9]" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{selectedIntegration.name}</h3>
                  <p className="text-[11px] text-slate-400">{selectedIntegration.systemType} • {selectedIntegration.category}</p>
                </div>
              </div>
              <button onClick={() => setSelectedIntegration(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Nav Tabs */}
            <div className="border-b border-slate-100 px-5 flex space-x-6 text-xs font-semibold">
              <button
                onClick={() => setActiveDrawerTab('OVERVIEW')}
                className={clsx('py-3 border-b-2 transition-colors', activeDrawerTab === 'OVERVIEW' ? 'border-[#6C2BD9] text-[#6C2BD9]' : 'border-transparent text-slate-500')}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveDrawerTab('MAPPING')}
                className={clsx('py-3 border-b-2 transition-colors', activeDrawerTab === 'MAPPING' ? 'border-[#6C2BD9] text-[#6C2BD9]' : 'border-transparent text-slate-500')}
              >
                Field Mapping ({selectedIntegration.dataMappings?.length || 0})
              </button>
              <button
                onClick={() => setActiveDrawerTab('HISTORY')}
                className={clsx('py-3 border-b-2 transition-colors', activeDrawerTab === 'HISTORY' ? 'border-[#6C2BD9] text-[#6C2BD9]' : 'border-transparent text-slate-500')}
              >
                Sync History
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 p-5 overflow-y-auto space-y-4 text-xs">
              {activeDrawerTab === 'OVERVIEW' && (
                <div className="space-y-3.5">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <p className="font-semibold text-slate-800">Connection Endpoint</p>
                    <p className="font-mono text-[11px] text-[#6C2BD9] break-all">{selectedIntegration.baseUrl}</p>
                    <div className="flex items-center gap-2 pt-1">
                      <Lock className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-slate-600 text-[11px]">{selectedIntegration.authType}</span>
                    </div>
                  </div>

                  <div>
                    <p className="font-semibold text-slate-700 mb-1">Description</p>
                    <p className="text-slate-600 text-xs leading-relaxed">{selectedIntegration.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="p-3 rounded-lg border border-slate-200">
                      <p className="text-[10px] text-slate-400 uppercase">Direction</p>
                      <p className="font-bold text-slate-800 mt-0.5">{selectedIntegration.direction}</p>
                    </div>
                    <div className="p-3 rounded-lg border border-slate-200">
                      <p className="text-[10px] text-slate-400 uppercase">Schedule Frequency</p>
                      <p className="font-bold text-slate-800 mt-0.5">{selectedIntegration.frequency}</p>
                    </div>
                  </div>

                  {testResult && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-1">
                      <p className="font-bold text-emerald-800 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Handshake Verified
                      </p>
                      <p className="text-emerald-700 text-[11px]">{testResult.message}</p>
                      <p className="text-emerald-600 text-[10px] font-mono">Cipher: {testResult.handshake}</p>
                    </div>
                  )}
                </div>
              )}

              {activeDrawerTab === 'MAPPING' && (
                <div className="space-y-3">
                  <p className="text-slate-500 text-[11px]">
                    Transformation rules mapping external schema payload attributes into Asset360 target entity fields.
                  </p>
                  <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                    {selectedIntegration.dataMappings?.map((map, idx) => (
                      <div key={idx} className="p-3 bg-white space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-slate-800">{map.sourceField}</span>
                          <span className="text-slate-400">→</span>
                          <span className="font-mono font-bold text-[#6C2BD9]">{map.targetField}</span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                          <span>Rule: {map.transformation}</span>
                          {map.mandatory && <span className="text-rose-500 font-semibold">Mandatory</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeDrawerTab === 'HISTORY' && (
                <div className="space-y-2.5">
                  {selectedIntegration.syncHistory?.map(run => (
                    <div key={run.runId} className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-slate-800">{run.runId} • {run.trigger}</p>
                        <p className="text-[11px] text-slate-400">{run.timestamp} (Duration: {run.duration})</p>
                      </div>
                      <div className="text-right">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700">{run.status}</span>
                        <p className="text-[10px] text-slate-500 mt-1">{run.recordsIn} In / {run.recordsOut} Out</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <button
                onClick={() => handleToggleStatus(selectedIntegration)}
                className={clsx(
                  'px-3.5 py-1.5 text-xs font-semibold rounded-lg border transition-colors',
                  selectedIntegration.status === 'Active' ? 'border-rose-200 text-rose-600 hover:bg-rose-50' : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                )}
              >
                {selectedIntegration.status === 'Active' ? 'Deactivate' : 'Activate'}
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => handleTestConnection(selectedIntegration)}
                  className="px-3.5 py-1.5 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-100 shadow-2xs"
                >
                  Test Handshake
                </button>
                <button
                  onClick={() => handleRunSync(selectedIntegration)}
                  className="px-4 py-1.5 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white text-xs font-semibold rounded-lg shadow-2xs"
                >
                  Sync Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default IntegrationsConsole;
