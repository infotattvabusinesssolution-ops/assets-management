import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../services/api';
import { ScheduleDiscoveryModal } from '../components/modals/ScheduleDiscoveryModal';
import {
  Search,
  Filter,
  RefreshCw,
  Plus,
  Play,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Calendar,
  ExternalLink,
  Download,
  Copy,
  Edit,
  Trash2,
  Check,
  ChevronRight,
  ChevronLeft,
  Server,
  Network,
  Cpu,
  Layers,
  FileText,
  SlidersHorizontal,
  X,
  Info,
  ArrowUpRight,
  Sparkles,
  RotateCcw,
  Eye,
  Crosshair,
  MoreHorizontal,
  Wifi
} from 'lucide-react';

export function DiscoveryJobs({ onNavigateToDevices }) {
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(null);

  // Filter Bar States matching Screenshot #18
  const [searchQuery, setSearchQuery] = useState('');
  const [discoveryTypeFilter, setDiscoveryTypeFilter] = useState('All Types');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [createdByFilter, setCreatedByFilter] = useState('All Users');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Toast / Modals
  const [toastMessage, setToastMessage] = useState(null);
  const [isNewJobOpen, setIsNewJobOpen] = useState(false);
  const [isJobDevicesModalOpen, setIsJobDevicesModalOpen] = useState(false);
  const [jobDevices, setJobDevices] = useState([]);
  const [jobBusy, setJobBusy] = useState(false);
  const [isRerunJobModalOpen, setIsRerunJobModalOpen] = useState(false);
  const [isEditJobModalOpen, setIsEditJobModalOpen] = useState(false);
  const [useSameConfig, setUseSameConfig] = useState(true);
  const [editJobForm, setEditJobForm] = useState({
    jobName: '',
    discoveryType: 'IP Range Scan',
    ipRange: '',
    profile: 'Default',
    schedule: 'Manual'
  });

  // New Discovery Job Form State
  const [newJobForm, setNewJobForm] = useState({
    jobName: '',
    discoveryType: 'IP Range Scan',
    ipStart: '192.168.1.1',
    ipEnd: '192.168.1.254',
    profile: 'Local ICMP/TCP',
    schedule: 'Manual',
    credentials: 'Use Saved Credentials',
    runImmediately: false
  });
  const [creatingJob, setCreatingJob] = useState(false);
  const [newJobError, setNewJobError] = useState('');
  const [localSubnets, setLocalSubnets] = useState([]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchJobs = async () => {
    try {
      const result = await api.get('/discovery/jobs');
      const list = Array.isArray(result?.jobs) ? result.jobs : [];
      setJobs(list);
      setSelectedJobId(previous => list.some(job => job.id === previous) ? previous : list[0]?.id || null);
    } catch (error) {
      setJobs([]);
      showToast(error.message || 'Could not load discovery jobs.');
    }
  };

  useEffect(() => {
    fetchJobs();
    api.get('/discovery/local-networks')
      .then(res => {
        const nets = Array.isArray(res?.networks) ? res.networks : [];
        setLocalSubnets(nets);
        if (nets.length > 0 && nets[0].ipStart && nets[0].ipEnd) {
          setNewJobForm(prev => ({
            ...prev,
            ipStart: prev.ipStart === '192.168.1.1' ? nets[0].ipStart : prev.ipStart,
            ipEnd: prev.ipEnd === '192.168.1.254' ? nets[0].ipEnd : prev.ipEnd
          }));
        }
      })
      .catch(() => {});
  }, []);

  const handleCreateJobSubmit = async (e) => {
    e?.preventDefault();
    if (!newJobForm.jobName.trim()) {
      setNewJobError('Job Name is required.');
      return;
    }
    if (!newJobForm.ipStart.trim() || !newJobForm.ipEnd.trim()) {
      setNewJobError('Start IP and End IP are required.');
      return;
    }

    setCreatingJob(true);
    setNewJobError('');

    try {
      const res = await api.post('/discovery/jobs', {
        jobName: newJobForm.jobName.trim(),
        discoveryType: newJobForm.discoveryType,
        ipStart: newJobForm.ipStart.trim(),
        ipEnd: newJobForm.ipEnd.trim(),
        profile: newJobForm.profile,
        schedule: newJobForm.schedule,
        runImmediately: newJobForm.runImmediately
      });

      if (!res?.success || !res?.job) {
        throw new Error(res?.message || 'Failed to create discovery job.');
      }

      showToast(`Discovery job "${res.job.jobName}" created successfully!`);
      setIsNewJobOpen(false);
      setNewJobForm({
        jobName: '',
        discoveryType: 'IP Range Scan',
        ipStart: localSubnets[0]?.ipStart || '192.168.1.1',
        ipEnd: localSubnets[0]?.ipEnd || '192.168.1.254',
        profile: 'Local ICMP/TCP',
        schedule: 'Manual',
        credentials: 'Use Saved Credentials',
        runImmediately: false
      });

      await fetchJobs();
      if (res.job?.id) {
        setSelectedJobId(res.job.id);
      }
    } catch (err) {
      setNewJobError(err?.response?.data?.message || err?.message || 'Could not create discovery job.');
    } finally {
      setCreatingJob(false);
    }
  };

  const handleRerunJob = async () => {
    if (!selectedJob) return;
    try {
      setJobBusy(true);
      showToast(`Initiating discovery scan for "${selectedJob.jobName}"...`);
      setIsRerunJobModalOpen(false);
      const res = await api.post(`/discovery/jobs/${encodeURIComponent(selectedJob.id)}/rerun`);
      showToast(res?.message || `Discovery scan finished! Found ${res?.execution?.devicesFound || 0} devices.`);
      await fetchJobs();
    } catch (err) {
      showToast(err?.response?.data?.message || err?.message || 'Discovery run failed.');
    } finally {
      setJobBusy(false);
    }
  };

  const handleDeleteJob = async (jobId) => {
    const id = jobId || selectedJob?.id;
    if (!id) return;
    if (!window.confirm(`Are you sure you want to delete discovery job "${selectedJob?.jobName || id}"?`)) return;
    try {
      const res = await api.delete(`/discovery/jobs/${encodeURIComponent(id)}`);
      showToast(res?.message || 'Discovery job deleted.');
      await fetchJobs();
    } catch (err) {
      showToast(err?.response?.data?.message || err?.message || 'Failed to delete job.');
    }
  };

  const handleCloneJob = async (jobId) => {
    const id = jobId || selectedJob?.id;
    if (!id) return;
    try {
      const res = await api.post(`/discovery/jobs/${encodeURIComponent(id)}/clone`);
      showToast(res?.message || 'Discovery job cloned successfully.');
      await fetchJobs();
      if (res?.job?.id) setSelectedJobId(res.job.id);
    } catch (err) {
      showToast(err?.response?.data?.message || err?.message || 'Failed to clone job.');
    }
  };

  const handleEditJobSave = async () => {
    if (!selectedJob) return;
    try {
      const [ipStart, ipEnd] = (editJobForm.ipRange || '').split(/\s*-\s*/);
      const res = await api.put(`/discovery/jobs/${encodeURIComponent(selectedJob.id)}`, {
        jobName: editJobForm.jobName,
        discoveryType: editJobForm.discoveryType,
        ipRange: editJobForm.ipRange,
        ipStart,
        ipEnd,
        profile: editJobForm.profile,
        schedule: editJobForm.schedule
      });
      showToast(res?.message || 'Job configuration updated successfully!');
      setIsEditJobModalOpen(false);
      await fetchJobs();
    } catch (err) {
      showToast(err?.response?.data?.message || err?.message || 'Failed to update job.');
    }
  };

  useEffect(() => {
    if (!isJobDevicesModalOpen || !selectedJobId) return;
    api.get(`/discovery/jobs/${encodeURIComponent(selectedJobId)}/devices`, { params: { limit: 2000 } })
      .then(res => setJobDevices(res?.devices || []))
      .catch(error => { setJobDevices([]); showToast(error?.message || 'Could not load job devices.'); });
  }, [isJobDevicesModalOpen, selectedJobId]);

  const stats = useMemo(() => ({
    total: jobs.length,
    completed: jobs.filter(job => job.status === 'Completed').length,
    running: jobs.filter(job => job.status === 'Running').length,
    failed: jobs.filter(job => job.status === 'Failed').length,
    scheduled: jobs.filter(job => ['Scheduled', 'Ready'].includes(job.status)).length
  }), [jobs]);

  // Filter logic
  const filteredJobs = useMemo(() => {
    return jobs.filter(j => {
      const q = searchQuery.toLowerCase();
      const matchQuery = !q || (
        j.jobName.toLowerCase().includes(q) ||
        j.ipRange.toLowerCase().includes(q) ||
        j.status.toLowerCase().includes(q) ||
        j.createdBy.toLowerCase().includes(q)
      );

      const matchType = discoveryTypeFilter === 'All Types' || j.discoveryType === discoveryTypeFilter;
      const matchStatus = statusFilter === 'All Status' || j.status === statusFilter;
      const matchCreator = createdByFilter === 'All Users' || j.createdBy === createdByFilter;

      return matchQuery && matchType && matchStatus && matchCreator;
    });
  }, [jobs, searchQuery, discoveryTypeFilter, statusFilter, createdByFilter]);

  const selectedJob = jobs.find(j => j.id === selectedJobId) || jobs[0];

  // Status badge renderer helper
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Completed':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-300">Completed</span>;
      case 'Running':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-[#6C2BD9] border border-purple-300">Running</span>;
      case 'Failed':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700 border border-rose-300">Failed</span>;
      case 'Scheduled':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">Scheduled</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-200 text-slate-700">{status || 'Unknown'}</span>;
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setDiscoveryTypeFilter('All Types');
    setStatusFilter('All Status');
    setCreatedByFilter('All Users');
    setFromDate('');
    setToDate('');
  };

  return (
    <div className="space-y-5">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-[#6C2BD9] text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 text-xs font-semibold animate-bounce border border-purple-400">
          <Sparkles className="w-4 h-4 text-purple-200" />
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 hover:bg-purple-700 p-1 rounded-lg">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Header & + New Discovery Job Action Button matching Screenshot #18 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Discovery Jobs</h1>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">Save and run local IP range discovery jobs</p>
        </div>

        <button
          onClick={() => setIsNewJobOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#6C2BD9] text-white text-xs font-bold hover:bg-purple-700 transition-all cursor-pointer shadow-2xs"
        >
          <Plus className="w-4 h-4" />
          <span>New Discovery Job</span>
        </button>
      </div>

      {/* 5 KPI Stat Cards Row matching Screenshot #18 */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        
        {/* Card 1: Total Jobs */}
        <div className="bg-purple-50/70 border border-purple-200/60 rounded-2xl p-3.5 flex items-center gap-3 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-white border border-purple-200 flex items-center justify-center text-[#6C2BD9] shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-black text-slate-900 leading-none">{stats.total}</div>
            <div className="text-[11px] text-slate-500 font-bold mt-1">Total Jobs</div>
          </div>
        </div>

        {/* Card 2: Completed */}
        <div className="bg-emerald-50/70 border border-emerald-200/60 rounded-2xl p-3.5 flex items-center gap-3 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-white border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-black text-emerald-800 leading-none">{stats.completed}</div>
            <div className="text-[11px] text-slate-500 font-bold mt-1">Completed</div>
          </div>
        </div>

        {/* Card 3: Running */}
        <div className="bg-purple-50/70 border border-purple-200/60 rounded-2xl p-3.5 flex items-center gap-3 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-white border border-purple-200 flex items-center justify-center text-[#6C2BD9] shrink-0">
            <RefreshCw className="w-5 h-5 animate-spin" />
          </div>
          <div>
            <div className="text-xl font-black text-purple-900 leading-none">{stats.running}</div>
            <div className="text-[11px] text-slate-500 font-bold mt-1">Running</div>
          </div>
        </div>

        {/* Card 4: Failed */}
        <div className="bg-amber-50/70 border border-amber-200/60 rounded-2xl p-3.5 flex items-center gap-3 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-white border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-black text-amber-800 leading-none">{stats.failed}</div>
            <div className="text-[11px] text-slate-500 font-bold mt-1">Failed</div>
          </div>
        </div>

        {/* Card 5: Scheduled */}
        <div className="bg-indigo-50/70 border border-indigo-200/60 rounded-2xl p-3.5 flex items-center gap-3 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-white border border-indigo-200 flex items-center justify-center text-indigo-600 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-black text-indigo-800 leading-none">{stats.scheduled}</div>
            <div className="text-[11px] text-slate-500 font-bold mt-1">Scheduled</div>
          </div>
        </div>

      </div>

      {/* Multi-Field Search & Filter Controls Bar matching Screenshot #18 */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-2.5 items-center">
          
          {/* Search Box */}
          <div className="relative lg:col-span-2">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search job name, IP range, status..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:border-[#6C2BD9]"
            />
          </div>

          {/* Discovery Type Filter */}
          <div>
            <span className="block text-[10px] font-bold text-slate-400 mb-0.5">Discovery Type</span>
            <select
              value={discoveryTypeFilter}
              onChange={(e) => setDiscoveryTypeFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-[#6C2BD9]"
            >
              <option value="All Types">All Types</option>
              <option value="IP Range Scan">IP Range Scan</option>
              <option value="SNMP Scan">SNMP Scan</option>
              <option value="WMI Scan">WMI Scan</option>
              <option value="Agent Based">Agent Based</option>
              <option value="MDM Integration">MDM Integration</option>
              <option value="SSH Scan">SSH Scan</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <span className="block text-[10px] font-bold text-slate-400 mb-0.5">Status</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-[#6C2BD9]"
            >
              <option value="All Status">All Status</option>
              <option value="Completed">Completed</option>
              <option value="Running">Running</option>
              <option value="Failed">Failed</option>
              <option value="Scheduled">Scheduled</option>
            </select>
          </div>

          {/* Created By Filter */}
          <div>
            <span className="block text-[10px] font-bold text-slate-400 mb-0.5">Created By</span>
            <select
              value={createdByFilter}
              onChange={(e) => setCreatedByFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-[#6C2BD9]"
            >
              <option value="All Users">All Users</option>
              <option value="John Doe">John Doe</option>
              <option value="System">System</option>
              <option value="Ahmed">Ahmed</option>
              <option value="Riyaz">Riyaz</option>
            </select>
          </div>

          {/* From Date */}
          <div>
            <span className="block text-[10px] font-bold text-slate-400 mb-0.5">From Date</span>
            <div className="relative">
              <input
                type="text"
                placeholder="dd/mm/yyyy"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 rounded-xl pl-2.5 pr-7 py-1.5 focus:outline-none focus:border-[#6C2BD9]"
              />
              <Calendar className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* To Date & Reset Button */}
          <div className="flex items-center gap-1.5 pt-4">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="dd/mm/yyyy"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 rounded-xl pl-2.5 pr-7 py-1.5 focus:outline-none focus:border-[#6C2BD9]"
              />
              <Calendar className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2" />
            </div>

            <button
              onClick={handleResetFilters}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[#6C2BD9] text-[#6C2BD9] hover:bg-purple-50 text-xs font-bold transition-all cursor-pointer shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>

        </div>
      </div>

      {/* Discovery Jobs Data Table matching Screenshot #18 */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="overflow-hidden rounded-xl border border-slate-200">
          <div className="overflow-auto max-h-[540px]">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="sticky top-0 z-10 bg-slate-50 shadow-2xs border-b border-slate-200 font-bold text-slate-600">
                <tr>
                  <th className="py-2.5 px-3 w-8 text-center">#</th>
                  <th className="py-2.5 px-3">Job Name</th>
                  <th className="py-2.5 px-3">Discovery Type</th>
                  <th className="py-2.5 px-3">IP Range / Target</th>
                  <th className="py-2.5 px-3">Profile</th>
                  <th className="py-2.5 px-3">Schedule</th>
                  <th className="py-2.5 px-3">Started On</th>
                  <th className="py-2.5 px-3">Completed On</th>
                  <th className="py-2.5 px-3 text-center">Devices Found</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Created By</th>
                  <th className="py-2.5 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredJobs.map((job) => {
                  const isSelected = selectedJob?.id === job.id;
                  return (
                    <tr
                      key={job.id}
                      onClick={() => setSelectedJobId(job.id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-purple-50/70 font-semibold' : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="py-2.5 px-3 text-center font-bold text-slate-400">{job.jobNum}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">{job.jobName}</td>
                      <td className="py-2.5 px-3">{job.discoveryType}</td>
                      <td className="py-2.5 px-3 font-mono text-[#6C2BD9] font-bold">{job.ipRange}</td>
                      <td className="py-2.5 px-3">{job.profile}</td>
                      <td className="py-2.5 px-3 text-slate-600">{job.schedule}</td>
                      <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">{job.startedOn}</td>
                      <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">{job.completedOn}</td>
                      <td className="py-2.5 px-3 text-center font-bold text-slate-800">{job.devicesFound}</td>
                      <td className="py-2.5 px-3">{getStatusBadge(job.status)}</td>
                      <td className="py-2.5 px-3 text-slate-800">{job.createdBy}</td>
                      <td className="py-2.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => {
                              setSelectedJobId(job.id);
                              if (onNavigateToDevices) onNavigateToDevices(job.jobName);
                            }}
                            className="p-1 text-[#6C2BD9] hover:bg-purple-50 rounded-md"
                            title="View Discovered Devices"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => showToast(`Ping RTLS target for ${job.jobName}`)}
                            className="p-1 text-purple-600 hover:bg-purple-50 rounded-md"
                            title="Target Details"
                          >
                            <Crosshair className="w-3.5 h-3.5" />
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
        </div>

        {/* Table Footer / Scroll Down */}
        <div className="p-3 bg-white border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span className="font-medium text-slate-600">Showing {filteredJobs.length} records</span>
          <span className="text-slate-400">Scroll down to view all records</span>
        </div>
      </div>

      {/* Bottom 3-Column Split View for Selected Job matching Screenshot #18 */}
      {selectedJob && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          
          {/* Column 1: Job Details (5 Cols) */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold text-purple-900">Job Details - {selectedJob.jobName}</h3>
                {getStatusBadge(selectedJob.status)}
              </div>
            </div>

            {/* Metadata 4-Column Grid matching User Screenshot */}
            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-2xs">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-y-3 gap-x-3 text-xs items-center">
                {/* Row 1 */}
                <span className="text-[#0F172A] font-medium">Job ID</span>
                <span className="font-mono font-semibold text-[#1B2559]">{selectedJob.id}</span>
                <span className="text-[#0F172A] font-medium">Job Name</span>
                <span className="font-semibold text-[#1B2559] truncate">{selectedJob.jobName}</span>

                {/* Row 2 */}
                <span className="text-[#0F172A] font-medium">Discovery Type</span>
                <span className="font-semibold text-[#1B2559]">{selectedJob.discoveryType}</span>
                <span className="text-[#0F172A] font-medium">IP Range</span>
                <span className="font-mono font-semibold text-[#1A73E8]">{selectedJob.ipRange}</span>

                {/* Row 3 */}
                <span className="text-[#0F172A] font-medium">Profile</span>
                <span className="font-semibold text-[#1B2559]">{selectedJob.profile}</span>
                <span className="text-[#0F172A] font-medium">Schedule</span>
                <span className="font-semibold text-[#1B2559]">{selectedJob.schedule}</span>

                {/* Row 4 */}
                <span className="text-[#0F172A] font-medium">Created By</span>
                <span className="font-semibold text-[#1B2559]">{selectedJob.createdBy}</span>
                <span className="text-[#0F172A] font-medium">Created On</span>
                <span className="font-semibold text-[#1B2559]">{selectedJob.createdOn}</span>

                {/* Row 5 */}
                <span className="text-[#0F172A] font-medium">Started On</span>
                <span className="font-semibold text-[#1B2559]">{selectedJob.startedOn}</span>
                <span className="text-[#0F172A] font-medium">Completed On</span>
                <span className="font-semibold text-[#1B2559]">{selectedJob.completedOn}</span>

                {/* Row 6 */}
                <span className="text-[#0F172A] font-medium">Duration</span>
                <span className="font-semibold text-[#1B2559]">{selectedJob.duration}</span>
                <span className="text-[#0F172A] font-medium">Status</span>
                <div>{getStatusBadge(selectedJob.status)}</div>

                {/* Row 7 */}
                <span className="text-[#0F172A] font-medium">Devices Found</span>
                <span className="font-bold text-slate-900">{selectedJob.devicesFound}</span>
                <span className="text-[#0F172A] font-medium">New Assets</span>
                <span className="font-bold text-[#1A73E8]">{selectedJob.newAssets}</span>

                {/* Row 8 */}
                <span className="text-[#0F172A] font-medium">Matched Assets</span>
                <span className="font-bold text-emerald-700">{selectedJob.matchedAssets}</span>
                <span className="text-[#0F172A] font-medium">Requires Review</span>
                <span className="font-bold text-amber-700">{selectedJob.requiresReview}</span>
              </div>
            </div>
          </div>

          {/* Column 2: Discovery Progress Timestamps (4 Cols) */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-900">Discovery Progress</h3>
            </div>

            <div className="space-y-2 text-xs font-semibold">
              {selectedJob.stages?.map((st, idx) => (
                <div key={idx} className="flex items-center justify-between py-1 border-b border-slate-50">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="text-slate-800 text-[11px]">{st.name}</span>
                  </div>
                  <span className="font-mono text-[10px] text-slate-500 font-bold">{st.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Column 3: Job Actions List (3 Cols) matching Screenshot #18 */}
          <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-900">Job Actions</h3>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => setIsJobDevicesModalOpen(true)}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-[#6C2BD9] text-[#6C2BD9] hover:bg-purple-50 text-xs font-bold transition-all cursor-pointer shadow-2xs"
              >
                <Eye className="w-4 h-4" />
                <span>View Discovered Devices</span>
              </button>

              <button
                onClick={() => showToast(`Report for ${selectedJob.id} downloading...`)}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-[#6C2BD9] text-[#6C2BD9] hover:bg-purple-50 text-xs font-bold transition-all cursor-pointer shadow-2xs"
              >
                <Download className="w-4 h-4" />
                <span>Download Report</span>
              </button>

              <button
                onClick={() => setIsRerunJobModalOpen(true)}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-[#6C2BD9] text-[#6C2BD9] hover:bg-purple-50 text-xs font-bold transition-all cursor-pointer shadow-2xs"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Re-run Job</span>
              </button>

              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => {
                    if (selectedJob) {
                      setEditJobForm({
                        jobName: selectedJob.jobName || '',
                        discoveryType: selectedJob.discoveryType || 'IP Range Scan',
                        ipRange: selectedJob.ipRange || '',
                        profile: selectedJob.profile || 'Default',
                        schedule: selectedJob.schedule || 'Manual'
                      });
                    }
                    setIsEditJobModalOpen(true);
                  }}
                  className="flex-1 flex items-center justify-center gap-1 py-2 px-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Edit Job</span>
                </button>

                <button
                  onClick={() => handleCloneJob(selectedJob?.id)}
                  className="flex-1 flex items-center justify-center gap-1 py-2 px-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Clone Job</span>
                </button>
              </div>

              <button
                onClick={() => handleDeleteJob(selectedJob?.id)}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-rose-300 text-rose-600 hover:bg-rose-50 text-xs font-bold transition-all cursor-pointer shadow-2xs mt-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Job</span>
              </button>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* MODALS 5, 7 & 8 MATCHING PROMPT SCREENSHOT                                  */}
      {/* ========================================================================= */}

      {/* MODAL 5: VIEW DISCOVERED DEVICES (FROM JOB) (Prompt Image #5) */}
      {isJobDevicesModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-base font-bold text-slate-900">Devices from Job: {selectedJob.jobName}</h2>
              <button onClick={() => setIsJobDevicesModalOpen(false)} className="p-1.5 rounded-xl hover:bg-slate-200 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              {/* Job Metadata Banner */}
              <div className="p-4 bg-[#F8FAFC] border border-slate-200 rounded-2xl grid grid-cols-2 sm:grid-cols-4 gap-3 text-slate-700">
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold">Job ID</span>
                  <span className="font-mono font-bold text-slate-900">{selectedJob.id}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold">Discovery Type</span>
                  <span className="font-bold text-slate-900">{selectedJob.discoveryType}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold">IP Range Scan</span>
                  <span className="font-mono font-bold text-[#6C2BD9]">{selectedJob.ipRange}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold">Total Devices</span>
                  <span className="font-bold text-slate-900">{selectedJob.devicesFound}</span>
                </div>
              </div>

              {/* Devices Table */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
                <div className="overflow-auto max-h-[300px]">
                  <table className="w-full text-left text-xs">
                    <thead className="sticky top-0 z-10 bg-[#F8FAFC] shadow-2xs text-slate-500 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3 w-8">#</th>
                        <th className="py-2.5 px-3">Hostname</th>
                        <th className="py-2.5 px-3">IP Address</th>
                        <th className="py-2.5 px-3">Device Type</th>
                        <th className="py-2.5 px-3 text-center">Asset Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {[
                        { num: 1, host: 'DESKTOP-001', ip: '192.168.1.10', type: 'Computer', status: 'Matched' },
                        { num: 2, host: 'MONITOR-245', ip: '192.168.1.11', type: 'Monitor', status: 'Matched' },
                        { num: 3, host: 'PRN-HQ-01', ip: '192.168.1.20', type: 'Printer', status: 'New' },
                        { num: 4, host: 'SW-CORE-01', ip: '192.168.1.30', type: 'Network Device', status: 'Matched' },
                        { num: 5, host: 'LAPTOP-078', ip: '192.168.1.45', type: 'Computer', status: 'Review' },
                        { num: 6, host: 'AP-01', ip: '192.168.1.50', type: 'Network Device', status: 'Matched' }
                      ].map((d) => (
                        <tr key={d.num} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 font-bold text-slate-400">{d.num}</td>
                          <td className="py-2.5 px-3 font-bold text-slate-900">{d.host}</td>
                          <td className="py-2.5 px-3 font-mono text-[#6C2BD9]">{d.ip}</td>
                          <td className="py-2.5 px-3">{d.type}</td>
                          <td className="py-2.5 px-3 text-center">{getStatusBadge(d.status)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
              <span className="text-xs text-slate-500">Scroll down to view all records</span>
              <button
                onClick={() => setIsJobDevicesModalOpen(false)}
                className="px-6 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 7: RE-RUN DISCOVERY JOB MODAL (Prompt Image #7) */}
      {isRerunJobModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-base font-bold text-slate-900">Re-run Discovery Job</h2>
              <button onClick={() => setIsRerunJobModalOpen(false)} className="p-1.5 rounded-xl hover:bg-slate-200 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs text-center">
              <div className="w-14 h-14 bg-purple-50 text-[#6C2BD9] border border-purple-200 rounded-2xl flex items-center justify-center mx-auto">
                <RefreshCw className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Are you sure you want to re-run this job?</h3>
                <p className="text-xs font-semibold text-[#6C2BD9] mt-0.5">{selectedJob.jobName} ({selectedJob.id})</p>
              </div>

              <div className="bg-[#F8FAFC] border border-slate-200 rounded-2xl p-3 text-left space-y-1">
                <p><span className="text-slate-500">Discovery Type:</span> <strong className="text-slate-800">{selectedJob.discoveryType}</strong></p>
                <p><span className="text-slate-500">IP Range:</span> <strong className="font-mono text-[#6C2BD9]">{selectedJob.ipRange}</strong></p>
                <p><span className="text-slate-500">Profile:</span> <strong className="text-slate-800">{selectedJob.profile}</strong></p>
                <p><span className="text-slate-500">Schedule:</span> <strong className="text-slate-800">{selectedJob.schedule}</strong></p>
              </div>

              <label className="flex items-center gap-2 justify-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={useSameConfig}
                  onChange={(e) => setUseSameConfig(e.target.checked)}
                  className="rounded text-[#6C2BD9]"
                />
                <span className="font-semibold text-slate-700">Use the same configuration and credentials</span>
              </label>

              <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-purple-900 text-left flex items-center gap-2">
                <Info className="w-4 h-4 text-[#6C2BD9] shrink-0" />
                <span>A new execution will be created. Previous results will be retained.</span>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
              <button
                onClick={() => setIsRerunJobModalOpen(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold cursor-pointer hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRerunJob}
                disabled={jobBusy}
                className="px-6 py-2 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1.5 shadow-sm disabled:opacity-50 transition-all"
              >
                {jobBusy ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-white" />}
                <span>{jobBusy ? 'Running...' : 'Run Now'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 8: EDIT DISCOVERY JOB MODAL (Prompt Image #8) */}
      {isEditJobModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-base font-bold text-slate-900">Edit Discovery Job</h2>
              <button onClick={() => setIsEditJobModalOpen(false)} className="p-1.5 rounded-xl hover:bg-slate-200 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Job Name *</label>
                <input
                  type="text"
                  value={editJobForm.jobName}
                  onChange={(e) => setEditJobForm({ ...editJobForm, jobName: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Discovery Type *</label>
                <select
                  value={editJobForm.discoveryType}
                  onChange={(e) => setEditJobForm({ ...editJobForm, discoveryType: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                >
                  <option value="IP Range Scan">IP Range Scan</option>
                  <option value="SNMP Scan">SNMP Scan</option>
                  <option value="WMI Scan">WMI Scan</option>
                  <option value="Agent Based">Agent Based</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">IP Range / Target *</label>
                <input
                  type="text"
                  value={editJobForm.ipRange}
                  onChange={(e) => setEditJobForm({ ...editJobForm, ipRange: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Discovery Profile *</label>
                <select
                  value={editJobForm.profile}
                  onChange={(e) => setEditJobForm({ ...editJobForm, profile: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                >
                  <option value="Default">Default</option>
                  <option value="Branch Profile">Branch Profile</option>
                  <option value="DataCenter">DataCenter</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Schedule *</label>
                <select
                  value={editJobForm.schedule}
                  onChange={(e) => setEditJobForm({ ...editJobForm, schedule: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                >
                  <option value="Manual">Manual</option>
                  <option value="Daily (2 AM)">Daily (2 AM)</option>
                  <option value="Weekly (Sun)">Weekly (Sun)</option>
                  <option value="Monthly">Monthly</option>
                </select>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
              <button
                onClick={() => setIsEditJobModalOpen(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleEditJobSave}
                className="px-6 py-2 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white rounded-xl text-xs font-bold cursor-pointer shadow-sm"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NEW DISCOVERY JOB MODAL */}
      {isNewJobOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-[#6C2BD9] flex items-center justify-center shadow-xs">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">New Discovery Job</h2>
                  <p className="text-xs text-slate-500 font-medium">Configure network range discovery scan</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => { setIsNewJobOpen(false); setNewJobError(''); }}
                className="p-1.5 rounded-xl hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateJobSubmit}>
              <div className="p-6 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
                {newJobError && (
                  <div role="alert" className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-center gap-2 font-medium">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>{newJobError}</span>
                  </div>
                )}

                {/* Job Name */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Job Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newJobForm.jobName}
                    onChange={(e) => setNewJobForm({ ...newJobForm, jobName: e.target.value })}
                    placeholder="e.g. Branch Office Scan, HQ Core Subnet"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-xs text-slate-800 focus:outline-none focus:border-[#6C2BD9] focus:bg-white"
                    required
                  />
                </div>

                {/* Discovery Type & Profile Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Discovery Type <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={newJobForm.discoveryType}
                      onChange={(e) => setNewJobForm({ ...newJobForm, discoveryType: e.target.value })}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#6C2BD9]"
                    >
                      <option value="IP Range Scan">IP Range Scan</option>
                      <option value="SNMP Scan">SNMP Scan</option>
                      <option value="WMI Scan">WMI Scan</option>
                      <option value="Agent Based">Agent Based</option>
                      <option value="SSH Scan">SSH Scan</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Discovery Profile <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={newJobForm.profile}
                      onChange={(e) => setNewJobForm({ ...newJobForm, profile: e.target.value })}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#6C2BD9]"
                    >
                      <option value="Local ICMP/TCP">Local ICMP/TCP</option>
                      <option value="Default (All Devices)">Default (All Devices)</option>
                      <option value="DataCenter">DataCenter</option>
                      <option value="Branch Profile">Branch Profile</option>
                    </select>
                  </div>
                </div>

                {/* IP Range Start & End */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-700">
                      IP Range / Target Scope <span className="text-rose-500">*</span>
                    </label>
                    {localSubnets.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          const net = localSubnets[0];
                          if (net) {
                            setNewJobForm(prev => ({ ...prev, ipStart: net.ipStart, ipEnd: net.ipEnd }));
                          }
                        }}
                        className="text-[11px] text-[#6C2BD9] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Wifi className="w-3 h-3" /> Auto-fill Local Subnet ({localSubnets[0]?.ipStart?.split('.').slice(0,3).join('.')}.x)
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="block text-[10px] text-slate-400 font-semibold mb-0.5">Start IP Address</span>
                      <input
                        type="text"
                        value={newJobForm.ipStart}
                        onChange={(e) => setNewJobForm({ ...newJobForm, ipStart: e.target.value.trim() })}
                        placeholder="192.168.1.1"
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs font-bold text-[#6C2BD9] focus:outline-none focus:border-[#6C2BD9] focus:bg-white"
                        required
                      />
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-400 font-semibold mb-0.5">End IP Address</span>
                      <input
                        type="text"
                        value={newJobForm.ipEnd}
                        onChange={(e) => setNewJobForm({ ...newJobForm, ipEnd: e.target.value.trim() })}
                        placeholder="192.168.1.254"
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs font-bold text-[#6C2BD9] focus:outline-none focus:border-[#6C2BD9] focus:bg-white"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Schedule & Credentials Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Schedule</label>
                    <select
                      value={newJobForm.schedule}
                      onChange={(e) => setNewJobForm({ ...newJobForm, schedule: e.target.value })}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#6C2BD9]"
                    >
                      <option value="Manual">Manual (Run on Demand)</option>
                      <option value="Daily (2 AM)">Daily (2 AM)</option>
                      <option value="Weekly (Sun)">Weekly (Sun)</option>
                      <option value="Monthly">Monthly</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Credentials</label>
                    <select
                      value={newJobForm.credentials}
                      onChange={(e) => setNewJobForm({ ...newJobForm, credentials: e.target.value })}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#6C2BD9]"
                    >
                      <option value="Use Saved Credentials">Use Saved Credentials</option>
                      <option value="Public (ICMP only)">Public (ICMP only)</option>
                      <option value="SNMP v2c Community">SNMP v2c Community</option>
                    </select>
                  </div>
                </div>

                {/* Run immediately checkbox */}
                <div className="p-3 bg-purple-50/70 border border-purple-200/80 rounded-2xl">
                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={newJobForm.runImmediately}
                      onChange={(e) => setNewJobForm({ ...newJobForm, runImmediately: e.target.checked })}
                      className="mt-0.5 rounded text-[#6C2BD9] focus:ring-[#6C2BD9]"
                    />
                    <div>
                      <span className="font-bold text-slate-900 block text-xs">Run scan immediately upon creation</span>
                      <span className="text-[11px] text-slate-500 font-medium">The scanner will ping targets and detect active hardware as soon as you save.</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
                <button
                  type="button"
                  onClick={() => { setIsNewJobOpen(false); setNewJobError(''); }}
                  className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold cursor-pointer transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingJob}
                  className="px-6 py-2 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white rounded-xl text-xs font-bold cursor-pointer shadow-sm flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  {creatingJob ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  <span>{creatingJob ? 'Creating Job...' : 'Create Discovery Job'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default DiscoveryJobs;

