import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import {
  Cpu,
  Monitor,
  Server,
  Printer,
  Smartphone,
  HelpCircle,
  Search,
  Filter,
  Play,
  Plus,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  RefreshCw,
  Calendar,
  SlidersHorizontal,
  ChevronDown,
  Check,
  X,
  ShieldCheck,
  HardDrive,
  Wifi,
  Eye,
  ArrowRight,
  Clock,
  Laptop,
  Radio,
  Download,
  Key,
  Database,
  Layers,
  ChevronLeft,
  ChevronRight,
  Globe,
  Settings,
  MoreHorizontal,
  Link as LinkIcon,
  ExternalLink
} from 'lucide-react';
import { ScheduleDiscoveryModal } from '../components/modals/ScheduleDiscoveryModal';
import { DiscoverySettingsModal } from '../components/modals/DiscoverySettingsModal';
import { AssetMatchModal } from '../components/modals/AssetMatchModal';
import { DiscoveryJobs } from './DiscoveryJobs';
import { DiscoveredDevices } from './DiscoveredDevices';
import { DiscoverySettings } from './DiscoverySettings';

const SEED_DEVICES = [];

export function DiscoveryWorkbench({ defaultTab }) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeNavTab = searchParams.get('tab') || defaultTab || 'network';

  // Config State
  const [discoveryType, setDiscoveryType] = useState('IP Range Scan');
  const [ipStart, setIpStart] = useState('192.168.1.1');
  const [ipEnd, setIpEnd] = useState('192.168.1.254');
  const [profile, setProfile] = useState('Default (All Devices)');
  const [credentials, setCredentials] = useState('Use Saved Credentials');
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [credentialForm, setCredentialForm] = useState({
    username: '',
    passwordValue: '',
    domainIpAddress: '',
    snmpCommunity: ''
  });

  // Summary Metrics State matching Screenshot #17
  const [summary] = useState({
    discovered: 245,
    matched: 198,
    newAssets: 32,
    review: 15,
    deviceTypes: [
      { name: 'Computers', count: 120, pct: 49, color: '#4F46E5' },
      { name: 'Monitors', count: 48, pct: 20, color: '#3B82F6' },
      { name: 'Network Devices', count: 22, pct: 9, color: '#10B981' },
      { name: 'Printers', count: 18, pct: 7, color: '#F59E0B' },
      { name: 'Mobile Devices', count: 15, pct: 6, color: '#EC4899' },
      { name: 'Others', count: 22, pct: 9, color: '#8B5CF6' }
    ]
  });

  // Stages Progression matching Screenshot #17
  const [stages, setStages] = useState([
    { id: 1, name: 'Scanning IP Range', status: 'Completed', duration: '2 min 14 sec' },
    { id: 2, name: 'Identifying Devices', status: 'Completed', duration: '1 min 32 sec' },
    { id: 3, name: 'Collecting Device Details', status: 'Completed', duration: '1 min 08 sec' },
    { id: 4, name: 'Matching with Asset Database', status: 'Completed', duration: '45 sec' },
    { id: 5, name: 'Generating Report', status: 'Completed', duration: '30 sec' }
  ]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(100);

  // Table Data State
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [detailTab, setDetailTab] = useState('software'); // software | hardware | network | match

  // Table Filters
  const [searchFilter, setSearchFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [locationFilter, setLocationFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Modals
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMatchModalOpen, setIsMatchModalOpen] = useState(false);
  const [matchModalDevice, setMatchModalDevice] = useState(null);

  // Run live multi-stage discovery scan
  const handleStartDiscovery = async () => {
    if (isScanning) return;
    setIsScanning(true);
    setScanProgress(0);

    const stageNames = [
      'Scanning IP Range',
      'Identifying Devices',
      'Collecting Device Details',
      'Matching with Asset Database',
      'Generating Report'
    ];

    for (let i = 0; i < stageNames.length; i++) {
      setStages(prev =>
        prev.map((s, idx) => {
          if (idx < i) return { ...s, status: 'Completed' };
          if (idx === i) return { ...s, status: 'In Progress', duration: 'Scanning...' };
          return { ...s, status: 'Pending', duration: 'Pending' };
        })
      );
      setScanProgress(Math.round(((i + 1) / stageNames.length) * 100));
      await new Promise(res => setTimeout(res, 600));
    }

    setStages([
      { id: 1, name: 'Scanning IP Range', status: 'Completed', duration: '2 min 14 sec' },
      { id: 2, name: 'Identifying Devices', status: 'Completed', duration: '1 min 32 sec' },
      { id: 3, name: 'Collecting Device Details', status: 'Completed', duration: '1 min 08 sec' },
      { id: 4, name: 'Matching with Asset Database', status: 'Completed', duration: '45 sec' },
      { id: 5, name: 'Generating Report', status: 'Completed', duration: '30 sec' }
    ]);
    setIsScanning(false);
    setScanProgress(100);
  };

  // Filtered devices
  const filteredDevices = useMemo(() => {
    return devices.filter(d => {
      const matchSearch =
        !searchFilter ||
        d.hostname.toLowerCase().includes(searchFilter.toLowerCase()) ||
        d.ipAddress.toLowerCase().includes(searchFilter.toLowerCase()) ||
        d.macAddress.toLowerCase().includes(searchFilter.toLowerCase()) ||
        d.serialNumber.toLowerCase().includes(searchFilter.toLowerCase()) ||
        d.manufacturer.toLowerCase().includes(searchFilter.toLowerCase()) ||
        d.model.toLowerCase().includes(searchFilter.toLowerCase());

      const matchType = typeFilter === 'ALL' || d.deviceType === typeFilter;
      const matchStatus = statusFilter === 'ALL' || d.status === statusFilter;
      const matchLoc = locationFilter === 'ALL' || (d.location && d.location.includes(locationFilter));

      return matchSearch && matchType && matchStatus && matchLoc;
    });
  }, [devices, searchFilter, typeFilter, statusFilter, locationFilter]);

  const handleDeviceReconciled = (deviceId, action) => {
    setDevices(prev =>
      prev.map(d => {
        if (d.id === deviceId) {
          if (action === 'CONFIRM') {
            return { ...d, status: 'Matched', matchScore: 100 };
          }
          if (action === 'REJECT') {
            return { ...d, status: 'Review', matchScore: 40 };
          }
        }
        return d;
      })
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredDevices.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredDevices.map(d => d.id));
    }
  };

  const toggleSelectDevice = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Matched':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-300">
            Matched
          </span>
        );
      case 'New':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-[#6C2BD9] border border-purple-300">
            New
          </span>
        );
      case 'Review':
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
            Review
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-800 font-sans select-none">
      
      {/* Top Header Navigation Bar matching Screenshot #17 */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shrink-0 shadow-2xs">
        
        {/* Sub-tabs: Network Discovery | Discovery Jobs | Discovered Devices */}
        <div className="flex items-center gap-2">
          {[
            { id: 'network', label: 'Network Discovery' },
            { id: 'jobs', label: 'Discovery Jobs' },
            { id: 'devices', label: 'Discovered Devices' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSearchParams({ tab: tab.id })}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeNavTab === tab.id
                  ? 'bg-purple-50 text-[#6C2BD9] border border-purple-200 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Right Header Action Buttons matching Screenshot #17 */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsScheduleOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-[#6C2BD9] text-[#6C2BD9] hover:bg-purple-50 text-xs font-bold transition-all cursor-pointer shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Schedule Discovery</span>
          </button>

          <button
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-[#6C2BD9] text-[#6C2BD9] hover:bg-purple-50 text-xs font-bold transition-all cursor-pointer shadow-2xs"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Discovery Settings</span>
          </button>
        </div>

      </div>

      {/* Main Container */}
      <div className="p-6 space-y-5 flex-1 overflow-y-auto">
        
        {activeNavTab === 'jobs' && (
          <DiscoveryJobs
            onNavigateToDevices={(jobName) => {
              setSearchParams({ tab: 'devices' });
            }}
          />
        )}

        {activeNavTab === 'devices' && (
          <DiscoveredDevices />
        )}

        {activeNavTab === 'network' && (
          <>
            {/* Top Section: Discovery Configuration & Discovery Summary Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
              
              {/* Top-Left Card: Discovery Configuration (4 Cols) */}
              <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <h2 className="text-sm font-bold text-purple-900 mb-4 pb-2 border-b border-slate-100">
                    Discovery Configuration
                  </h2>

                  <div className="space-y-3.5 text-xs font-semibold text-slate-700">
                    {/* Discovery Type */}
                    <div>
                      <label className="block text-slate-500 mb-1">Discovery Type</label>
                      <select
                        value={discoveryType}
                        onChange={(e) => setDiscoveryType(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 rounded-xl px-3 py-2 focus:outline-none focus:border-[#6C2BD9]"
                      >
                        <option value="IP Range Scan">IP Range Scan</option>
                        <option value="SNMP Sweep">SNMP Sweep</option>
                        <option value="Active Directory Sync">Active Directory Sync</option>
                        <option value="WMI/WinRM Agentless">WMI/WinRM Agentless</option>
                      </select>
                    </div>

                    {/* IP Range Inputs */}
                    <div>
                      <label className="block text-slate-500 mb-1">IP Range</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={ipStart}
                          onChange={(e) => setIpStart(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 text-xs font-mono font-bold text-slate-800 rounded-xl px-3 py-2 focus:outline-none focus:border-[#6C2BD9]"
                        />
                        <span className="text-slate-400 font-bold">-</span>
                        <input
                          type="text"
                          value={ipEnd}
                          onChange={(e) => setIpEnd(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 text-xs font-mono font-bold text-slate-800 rounded-xl px-3 py-2 focus:outline-none focus:border-[#6C2BD9]"
                        />
                      </div>
                    </div>

                    {/* Discovery Profile */}
                    <div>
                      <label className="block text-slate-500 mb-1">Discovery Profile</label>
                      <select
                        value={profile}
                        onChange={(e) => setProfile(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 rounded-xl px-3 py-2 focus:outline-none focus:border-[#6C2BD9]"
                      >
                        <option value="Default (All Devices)">Default (All Devices)</option>
                        <option value="Workstations Only">Workstations Only</option>
                        <option value="Network Hardware">Network Hardware</option>
                      </select>
                    </div>

                    {/* Dynamic Credentials Section */}
                    <div className="pt-2 border-t border-slate-100">
                      <h3 className="text-xs font-bold text-slate-700 mb-2">Required Credentials</h3>
                      
                      {discoveryType === 'SNMP Sweep' && (
                        <div>
                          <label className="block text-slate-500 mb-1">SNMP Community String</label>
                          <input
                            type="password"
                            placeholder="e.g. public"
                            value={credentialForm.snmpCommunity}
                            onChange={(e) => setCredentialForm({...credentialForm, snmpCommunity: e.target.value})}
                            className="w-full bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 rounded-xl px-3 py-2 focus:outline-none focus:border-[#6C2BD9]"
                          />
                        </div>
                      )}

                      {discoveryType === 'Active Directory Sync' && (
                        <div className="space-y-2">
                          <div>
                            <label className="block text-slate-500 mb-1">Domain Controller IP</label>
                            <input
                              type="text"
                              placeholder="192.168.1.10"
                              value={credentialForm.domainIpAddress}
                              onChange={(e) => setCredentialForm({...credentialForm, domainIpAddress: e.target.value})}
                              className="w-full bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 rounded-xl px-3 py-2 focus:outline-none focus:border-[#6C2BD9]"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-500 mb-1">Admin Username</label>
                            <input
                              type="text"
                              placeholder="administrator@domain.local"
                              value={credentialForm.username}
                              onChange={(e) => setCredentialForm({...credentialForm, username: e.target.value})}
                              className="w-full bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 rounded-xl px-3 py-2 focus:outline-none focus:border-[#6C2BD9]"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-500 mb-1">Admin Password</label>
                            <input
                              type="password"
                              value={credentialForm.passwordValue}
                              onChange={(e) => setCredentialForm({...credentialForm, passwordValue: e.target.value})}
                              className="w-full bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 rounded-xl px-3 py-2 focus:outline-none focus:border-[#6C2BD9]"
                            />
                          </div>
                        </div>
                      )}

                      {discoveryType === 'WMI/WinRM Agentless' && (
                        <div className="space-y-2">
                          <div>
                            <label className="block text-slate-500 mb-1">Windows Username</label>
                            <input
                              type="text"
                              placeholder="Administrator"
                              value={credentialForm.username}
                              onChange={(e) => setCredentialForm({...credentialForm, username: e.target.value})}
                              className="w-full bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 rounded-xl px-3 py-2 focus:outline-none focus:border-[#6C2BD9]"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-500 mb-1">Windows Password</label>
                            <input
                              type="password"
                              value={credentialForm.passwordValue}
                              onChange={(e) => setCredentialForm({...credentialForm, passwordValue: e.target.value})}
                              className="w-full bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 rounded-xl px-3 py-2 focus:outline-none focus:border-[#6C2BD9]"
                            />
                          </div>
                        </div>
                      )}

                      {discoveryType === 'IP Range Scan' && (
                        <div className="text-xs text-slate-500 italic py-2">
                          No credentials required for standard ping sweeps.
                        </div>
                      )}
                    </div>

                    {/* More Options Accordion */}
                    <div>
                      <button
                        type="button"
                        onClick={() => setShowMoreOptions(!showMoreOptions)}
                        className="text-xs font-bold text-[#6C2BD9] hover:underline flex items-center gap-1 cursor-pointer pt-1"
                      >
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showMoreOptions ? 'rotate-180' : ''}`} />
                        <span>More Options</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Buttons matching Screenshot #17 */}
                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center gap-3">
                  <button
                    onClick={handleStartDiscovery}
                    disabled={isScanning}
                    className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-[#6C2BD9] hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer disabled:opacity-70"
                  >
                    {isScanning ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Scanning ({scanProgress}%)...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 fill-current" />
                        <span>Start Discovery</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => setIsScheduleOpen(true)}
                    className="flex items-center gap-1.5 py-2 px-3 rounded-xl border border-[#6C2BD9] text-[#6C2BD9] hover:bg-purple-50 font-bold text-xs transition-all cursor-pointer whitespace-nowrap"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Save as Job</span>
                  </button>
                </div>
              </div>

              {/* Top-Right Card: Discovery Summary (8 Cols) */}
              <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
                <div>
                  {/* Summary Header */}
                  <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                    <h2 className="text-sm font-bold text-purple-900">Discovery Summary</h2>
                    <div className="flex items-center gap-3 text-xs font-semibold">
                      <span className="text-slate-400">Last Scan: 10 Sep 2026 10:24 AM</span>
                      <button className="text-[#6C2BD9] hover:underline font-bold flex items-center gap-1">
                        <span>View Details</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* 4 Stat Metric Cards matching Screenshot #17 */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                    
                    {/* Card 1: Discovered */}
                    <div className="bg-purple-50/70 border border-purple-200/60 rounded-xl p-3 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-white border border-purple-200 flex items-center justify-center text-[#6C2BD9] shrink-0">
                        <Monitor className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-lg font-black text-slate-900 leading-none">{summary.discovered}</div>
                        <div className="text-[11px] text-slate-500 font-semibold mt-1">Devices Discovered</div>
                      </div>
                    </div>

                    {/* Card 2: Matched */}
                    <div className="bg-emerald-50/70 border border-emerald-200/60 rounded-xl p-3 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-white border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-lg font-black text-emerald-800 leading-none">{summary.matched}</div>
                        <div className="text-[11px] text-slate-500 font-semibold mt-1">Matched with Assets</div>
                      </div>
                    </div>

                    {/* Card 3: New Assets */}
                    <div className="bg-purple-50/70 border border-purple-200/60 rounded-xl p-3 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-white border border-purple-200 flex items-center justify-center text-[#6C2BD9] shrink-0">
                        <Plus className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-lg font-black text-purple-900 leading-none">{summary.newAssets}</div>
                        <div className="text-[11px] text-slate-500 font-semibold mt-1">New Assets Found</div>
                      </div>
                    </div>

                    {/* Card 4: Review */}
                    <div className="bg-amber-50/70 border border-amber-200/60 rounded-xl p-3 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-white border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-lg font-black text-amber-800 leading-none">{summary.review}</div>
                        <div className="text-[11px] text-slate-500 font-semibold mt-1">Requires Review</div>
                      </div>
                    </div>

                  </div>

                  {/* Sub Grid: Device Type Breakdown Donut Chart (Left) + Discovery Status (Right) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
                    
                    {/* Device Type Breakdown */}
                    <div className="bg-slate-50/60 rounded-xl p-3.5 border border-slate-200">
                      <h3 className="text-xs font-bold text-slate-900 mb-3">Device Type Breakdown</h3>
                      <div className="flex items-center gap-4">
                        {/* Donut Chart Graphic */}
                        <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
                          <svg className="w-28 h-28 transform -rotate-90" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="38" fill="transparent" stroke="#4F46E5" strokeWidth="14" strokeDasharray="49 51" strokeDashoffset="0" />
                            <circle cx="50" cy="50" r="38" fill="transparent" stroke="#3B82F6" strokeWidth="14" strokeDasharray="20 80" strokeDashoffset="-49" />
                            <circle cx="50" cy="50" r="38" fill="transparent" stroke="#10B981" strokeWidth="14" strokeDasharray="9 91" strokeDashoffset="-69" />
                            <circle cx="50" cy="50" r="38" fill="transparent" stroke="#F59E0B" strokeWidth="14" strokeDasharray="7 93" strokeDashoffset="-78" />
                            <circle cx="50" cy="50" r="38" fill="transparent" stroke="#EC4899" strokeWidth="14" strokeDasharray="6 94" strokeDashoffset="-85" />
                            <circle cx="50" cy="50" r="38" fill="transparent" stroke="#8B5CF6" strokeWidth="14" strokeDasharray="9 91" strokeDashoffset="-91" />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-sm font-black text-slate-900 leading-none">245</span>
                            <span className="text-[10px] text-slate-500 font-semibold">Devices</span>
                          </div>
                        </div>

                        {/* Legend */}
                        <div className="grid grid-cols-1 gap-1 text-[11px] font-semibold text-slate-700 flex-1">
                          {summary.deviceTypes.map((dt) => (
                            <div key={dt.name} className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5 truncate">
                                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: dt.color }} />
                                <span className="truncate">{dt.name}</span>
                              </div>
                              <span className="text-slate-500 font-mono text-[10px] ml-1">{dt.count} ({dt.pct}%)</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Discovery Status Steps matching Screenshot #17 */}
                    <div className="bg-slate-50/60 rounded-xl p-3.5 border border-slate-200 space-y-2">
                      <h3 className="text-xs font-bold text-slate-900 mb-2">Discovery Status</h3>
                      <div className="space-y-2 text-xs font-semibold">
                        {stages.map((st) => (
                          <div key={st.id} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                              <span className="text-slate-800 text-[11px]">{st.name}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-emerald-700 text-[10px] font-bold bg-emerald-100 px-2 py-0.5 rounded-full">
                                {st.status}
                              </span>
                              <span className="text-slate-400 font-mono text-[10px] min-w-[55px] text-right">
                                {st.duration}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>
              </div>

            </div>

            {/* Middle Section: Discovered Devices (245) Grid Table matching Screenshot #17 */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
              
              {/* Table Header & Search Filter Bar */}
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                <h3 className="text-sm font-bold text-purple-900">
                  Discovered Devices <span className="text-slate-400 font-medium">(245)</span>
                </h3>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Search Bar */}
                  <div className="relative w-64">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search by IP, hostname, MAC, device type..."
                      value={searchFilter}
                      onChange={(e) => setSearchFilter(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:border-[#6C2BD9]"
                    />
                  </div>

                  {/* Filter icon toggle */}
                  <button className="p-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100">
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                  </button>

                  {/* Type Filter */}
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#6C2BD9]"
                  >
                    <option value="ALL">All Device Types</option>
                    <option value="Computer">Computer</option>
                    <option value="Monitor">Monitor</option>
                    <option value="Printer">Printer</option>
                    <option value="Network Device">Network Device</option>
                  </select>

                  {/* Status Filter */}
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#6C2BD9]"
                  >
                    <option value="ALL">All Status</option>
                    <option value="Matched">Matched</option>
                    <option value="New">New</option>
                    <option value="Review">Review</option>
                  </select>

                  {/* Location Filter */}
                  <select
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    className="bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#6C2BD9]"
                  >
                    <option value="ALL">All Locations</option>
                    <option value="Dubai HQ">Dubai HQ</option>
                    <option value="Data Center">Data Center</option>
                  </select>

                  {/* Actions Dropdown Button */}
                  <button className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[#6C2BD9] text-[#6C2BD9] hover:bg-purple-50 text-xs font-bold transition-all cursor-pointer">
                    <span>... Actions</span>
                  </button>
                </div>
              </div>

              {/* Table Data matching Screenshot #17 */}
              <div className="rounded-xl border border-slate-200 overflow-hidden">
                <div className="overflow-auto max-h-[540px]">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="sticky top-0 z-10 bg-slate-50 shadow-2xs border-b border-slate-200 font-bold text-slate-600">
                      <tr>
                        <th className="py-2.5 px-3 w-8 text-center">
                          <input
                            type="checkbox"
                            checked={selectedIds.length === filteredDevices.length}
                            onChange={toggleSelectAll}
                            className="accent-[#6C2BD9]"
                          />
                        </th>
                        <th className="py-2.5 px-3">IP Address</th>
                        <th className="py-2.5 px-3">Hostname</th>
                        <th className="py-2.5 px-3">MAC Address</th>
                        <th className="py-2.5 px-3">Device Type</th>
                        <th className="py-2.5 px-3">Manufacturer</th>
                        <th className="py-2.5 px-3">Model</th>
                        <th className="py-2.5 px-3">Serial Number</th>
                        <th className="py-2.5 px-3">Asset Status</th>
                        <th className="py-2.5 px-3 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {filteredDevices.map((dev) => {
                        const isSelected = selectedDevice.id === dev.id;
                        const isChecked = selectedIds.includes(dev.id);

                        return (
                          <tr
                            key={dev.id}
                            onClick={() => setSelectedDevice(dev)}
                            className={`cursor-pointer transition-colors ${
                              isSelected ? 'bg-purple-50/70 font-semibold' : 'hover:bg-slate-50'
                            }`}
                          >
                            <td className="py-2.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleSelectDevice(dev.id)}
                                className="accent-[#6C2BD9]"
                              />
                            </td>
                            <td className="py-2.5 px-3 font-mono text-[#6C2BD9] font-bold">{dev.ipAddress}</td>
                            <td className="py-2.5 px-3 font-bold text-slate-900">{dev.hostname}</td>
                            <td className="py-2.5 px-3 font-mono text-slate-500">{dev.macAddress}</td>
                            <td className="py-2.5 px-3">{dev.deviceType}</td>
                            <td className="py-2.5 px-3">{dev.manufacturer}</td>
                            <td className="py-2.5 px-3">{dev.model}</td>
                            <td className="py-2.5 px-3 font-mono text-slate-600">{dev.serialNumber}</td>
                            <td className="py-2.5 px-3">{getStatusBadge(dev.status)}</td>
                            <td className="py-2.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  onClick={() => setSelectedDevice(dev)}
                                  className="p-1 text-[#6C2BD9] hover:bg-purple-50 rounded-md"
                                  title="View Details"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => {
                                    setMatchModalDevice(dev);
                                    setIsMatchModalOpen(true);
                                  }}
                                  className="p-1 text-purple-600 hover:bg-purple-50 rounded-md"
                                  title="Reconcile Asset Match"
                                >
                                  <LinkIcon className="w-3.5 h-3.5" />
                                </button>
                                <button className="p-1 text-slate-400 hover:bg-slate-100 rounded-md">
                                  <MoreHorizontal className="w-3.5 h-3.5" />
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
                  <span className="font-medium text-slate-600">Showing {filteredDevices.length} records</span>
                  <span className="text-slate-400">Scroll down to view all records</span>
                </div>
              </div>

            </div>

            {/* Bottom Grid: Selected Device Details (Left) + Sub-tabs Specs (Right) matching Screenshot #17 */}
            {selectedDevice && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                
                {/* Left Card: Selected Device Details (5 Cols) */}
                <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <h3 className="text-xs font-bold text-purple-900">Selected Device Details</h3>
                  </div>

                  {/* Identity Box */}
                  <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-[#6C2BD9] shrink-0">
                        <Monitor className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="font-extrabold text-xs text-slate-900 block">{selectedDevice.hostname}</span>
                        <span className="text-[10px] text-slate-400 font-semibold">M_Address</span>
                      </div>
                    </div>
                    <div>
                      {getStatusBadge(selectedDevice.status)}
                    </div>
                  </div>

                  {/* Metadata Table matching Screenshot #17 */}
                  <div className="space-y-1.5 text-[11px] font-medium text-slate-600 bg-white p-2 rounded-xl border border-slate-100">
                    <div className="flex justify-between py-0.5 border-b border-slate-50">
                      <span className="text-slate-400">IP Address</span>
                      <span className="font-bold text-[#6C2BD9] font-mono">{selectedDevice.ipAddress}</span>
                    </div>
                    <div className="flex justify-between py-0.5 border-b border-slate-50">
                      <span className="text-slate-400">MAC Address</span>
                      <span className="font-mono font-bold text-slate-800">{selectedDevice.macAddress}</span>
                    </div>
                    <div className="flex justify-between py-0.5 border-b border-slate-50">
                      <span className="text-slate-400">Manufacturer</span>
                      <span className="font-bold text-slate-800">{selectedDevice.manufacturer}</span>
                    </div>
                    <div className="flex justify-between py-0.5 border-b border-slate-50">
                      <span className="text-slate-400">Model</span>
                      <span className="font-bold text-slate-800">{selectedDevice.model}</span>
                    </div>
                    <div className="flex justify-between py-0.5 border-b border-slate-50">
                      <span className="text-slate-400">Serial Number</span>
                      <span className="font-mono font-bold text-slate-800">{selectedDevice.serialNumber}</span>
                    </div>
                    <div className="flex justify-between py-0.5 border-b border-slate-50">
                      <span className="text-slate-400">OS</span>
                      <span className="font-bold text-slate-800">{selectedDevice.os}</span>
                    </div>
                    <div className="flex justify-between py-0.5 border-b border-slate-50">
                      <span className="text-slate-400">Domain</span>
                      <span className="font-bold text-slate-800 font-mono">{selectedDevice.domain}</span>
                    </div>
                    <div className="flex justify-between py-0.5 border-b border-slate-50">
                      <span className="text-slate-400">Last Seen</span>
                      <span className="font-bold text-slate-800">{selectedDevice.lastSeen}</span>
                    </div>
                    <div className="flex justify-between py-0.5">
                      <span className="text-slate-400">Location</span>
                      <span className="font-bold text-slate-800 text-right">{selectedDevice.location}</span>
                    </div>
                  </div>
                </div>

                {/* Right Card: Sub-tabs Specs (7 Cols) matching Screenshot #17 */}
                <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
                  
                  {/* Sub-tabs Header */}
                  <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-bold">
                    <button
                      onClick={() => setDetailTab('software')}
                      className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                        detailTab === 'software'
                          ? 'bg-purple-50 text-[#6C2BD9] border border-purple-200'
                          : 'text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      Installed Software ({selectedDevice.software?.length || 12})
                    </button>
                    <button
                      onClick={() => setDetailTab('hardware')}
                      className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                        detailTab === 'hardware'
                          ? 'bg-purple-50 text-[#6C2BD9] border border-purple-200'
                          : 'text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      Hardware Details
                    </button>
                    <button
                      onClick={() => setDetailTab('network')}
                      className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                        detailTab === 'network'
                          ? 'bg-purple-50 text-[#6C2BD9] border border-purple-200'
                          : 'text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      Network Info
                    </button>
                    <button
                      onClick={() => setDetailTab('match')}
                      className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                        detailTab === 'match'
                          ? 'bg-purple-50 text-[#6C2BD9] border border-purple-200'
                          : 'text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      Asset Match
                    </button>
                  </div>

                  {/* Tab Content 1: Installed Software matching Screenshot #17 */}
                  {detailTab === 'software' && (
                    <div className="space-y-3">
                      <div className="rounded-xl border border-slate-200 overflow-hidden">
                        <div className="overflow-auto max-h-[260px]">
                          <table className="w-full text-left border-collapse text-xs">
                            <thead className="sticky top-0 z-10 bg-slate-50 shadow-2xs border-b border-slate-200 font-bold text-slate-600">
                              <tr>
                                <th className="py-2 px-3 w-8 text-center">#</th>
                                <th className="py-2 px-3">Software Name</th>
                                <th className="py-2 px-3">Version</th>
                                <th className="py-2 px-3">Publisher</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                              {(selectedDevice.software || []).map((sw) => (
                                <tr key={sw.id} className="hover:bg-slate-50">
                                  <td className="py-2 px-3 text-center text-slate-400 font-bold">{sw.id}</td>
                                  <td className="py-2 px-3 font-bold text-slate-900">{sw.name}</td>
                                  <td className="py-2 px-3 font-mono text-slate-600">{sw.version}</td>
                                  <td className="py-2 px-3 text-slate-600">{sw.publisher}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <div className="p-2.5 bg-white border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                          <span className="font-medium text-slate-600">Showing {(selectedDevice.software || []).length} items</span>
                          <span className="text-slate-400">Scroll down to view all</span>
                        </div>
                      </div>

                      <div className="flex justify-end pt-1">
                        <button className="text-xs font-bold text-[#6C2BD9] hover:underline flex items-center gap-1 cursor-pointer">
                          <span>View All Installed Software</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Tab Content 2: Hardware Details */}
                  {detailTab === 'hardware' && (
                    <div className="grid grid-cols-2 gap-3 text-xs font-semibold text-slate-700 p-2">
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="text-[10px] text-slate-400 font-bold block">CPU PROCESSOR</span>
                        <span className="text-slate-900 font-bold">{selectedDevice.hardware?.cpu}</span>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="text-[10px] text-slate-400 font-bold block">RAM MEMORY</span>
                        <span className="text-slate-900 font-bold">{selectedDevice.hardware?.ram}</span>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="text-[10px] text-slate-400 font-bold block">STORAGE</span>
                        <span className="text-slate-900 font-bold">{selectedDevice.hardware?.storage}</span>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="text-[10px] text-slate-400 font-bold block">BIOS UUID</span>
                        <span className="text-slate-900 font-mono text-[11px] font-bold">{selectedDevice.hardware?.biosUuid}</span>
                      </div>
                    </div>
                  )}

                  {/* Tab Content 3: Network Info */}
                  {detailTab === 'network' && (
                    <div className="grid grid-cols-2 gap-3 text-xs font-semibold text-slate-700 p-2">
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="text-[10px] text-slate-400 font-bold block">IP SUBNET</span>
                        <span className="text-[#6C2BD9] font-mono font-bold">{selectedDevice.network?.ipSubnet}</span>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="text-[10px] text-slate-400 font-bold block">GATEWAY</span>
                        <span className="text-slate-900 font-mono font-bold">{selectedDevice.network?.gateway}</span>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="text-[10px] text-slate-400 font-bold block">SWITCH PORT</span>
                        <span className="text-slate-900 font-bold">{selectedDevice.network?.switchPort}</span>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="text-[10px] text-slate-400 font-bold block">VLAN</span>
                        <span className="text-purple-700 font-bold">{selectedDevice.network?.vlan}</span>
                      </div>
                    </div>
                  )}

                  {/* Tab Content 4: Asset Match */}
                  {detailTab === 'match' && (
                    <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-200 space-y-2 text-xs font-semibold">
                      <div className="flex items-center justify-between">
                        <span className="text-purple-900 font-bold">Asset Master Candidate</span>
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                          {selectedDevice.matchScore}% Match
                        </span>
                      </div>
                      {selectedDevice.matchedAsset ? (
                        <div className="p-2.5 bg-white rounded-lg border border-slate-200 space-y-1">
                          <p className="font-extrabold text-[#6C2BD9]">{selectedDevice.matchedAsset.assetTag}</p>
                          <p className="font-bold text-slate-800">{selectedDevice.matchedAsset.name}</p>
                          <p className="text-slate-500 text-[11px]">{selectedDevice.matchedAsset.assignedUser} • {selectedDevice.matchedAsset.location}</p>
                        </div>
                      ) : (
                        <p className="text-slate-500 font-medium">No pre-existing asset match found. Click reconcile to register as new asset.</p>
                      )}
                      <button
                        onClick={() => {
                          setMatchModalDevice(selectedDevice);
                          setIsMatchModalOpen(true);
                        }}
                        className="px-4 py-2 bg-[#6C2BD9] text-white font-bold text-xs rounded-xl shadow-xs hover:bg-purple-700"
                      >
                        Reconcile &amp; Link Asset
                      </button>
                    </div>
                  )}

                </div>

              </div>
            )}

          </>
        )}

      </div>

      {/* Modals */}
      <ScheduleDiscoveryModal
        isOpen={isScheduleOpen}
        onClose={() => setIsScheduleOpen(false)}
        onJobScheduled={(job) => {
          console.log('Job scheduled:', job);
        }}
      />

      <DiscoverySettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSettingsUpdated={(settings) => {
          console.log('Settings updated:', settings);
        }}
      />

      <AssetMatchModal
        isOpen={isMatchModalOpen}
        device={matchModalDevice}
        onClose={() => setIsMatchModalOpen(false)}
        onReconciled={handleDeviceReconciled}
      />

    </div>
  );
}

export default DiscoveryWorkbench;
