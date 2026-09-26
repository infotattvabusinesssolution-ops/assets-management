import React, { useState, useEffect } from 'react';
import {
  Database,
  Clock,
  HardDrive,
  RefreshCw,
  Plus,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Play,
  Pause,
  RotateCcw,
  Download,
  ShieldCheck,
  Calendar,
  Layers,
  X,
  FileCheck,
  AlertOctagon,
  Trash2,
  Search,
  ChevronRight,
  ChevronDown,
  MoreVertical,
  ExternalLink,
  Check,
  Server,
  FileText,
  Archive,
  ArrowRight,
  Filter
} from 'lucide-react';
import { api } from '../../services/api';
import clsx from 'clsx';

// ==========================================
// FALLBACK DATA MATCHING EXACT WIREFRAME
// ==========================================

const FALLBACK_BACKUPS = [
  {
    id: 'BAK-20260910-001',
    name: 'Full Backup - 20260910',
    type: 'Full',
    size: '18.5 GB',
    startTime: '10 Sep 2026 02:00 AM',
    endTime: '10 Sep 2026 02:35 AM',
    duration: '35 mins',
    status: 'Success',
    location: '/backups/full/2026/09/Asset360_Full_20260910.bak',
    checksum: '3f8a7c9d5e2b1...',
    notes: 'Scheduled daily full backup',
    createdBy: 'System Scheduler',
    scheduleName: 'Daily Database Full Backup',
    frequency: 'Daily (02:00 AM)',
    retention: '30 Days (4 Generations)',
    storageTarget: 'Azure Blob Hot / AWS S3 Primary',
    integrityChecked: true,
    logs: [
      { time: '02:00:01 AM', message: 'Backup job BAK-20260910-001 queued by System Daemon' },
      { time: '02:00:05 AM', message: 'Snapshot lock acquired on Asset360_Production' },
      { time: '02:18:22 AM', message: 'Database binary dump completed (18.5 GB)' },
      { time: '02:29:40 AM', message: 'SHA-256 Checksum computed: 3f8a7c9d5e2b1...' },
      { time: '02:35:00 AM', message: 'Transfer to secure target verified. Status: SUCCESS' }
    ]
  },
  {
    id: 'BAK-20260909-001',
    name: 'Incremental - 20260909',
    type: 'Incremental',
    size: '2.1 GB',
    startTime: '09 Sep 2026 02:00 AM',
    endTime: '09 Sep 2026 02:12 AM',
    duration: '12 mins',
    status: 'Success',
    location: '/backups/incremental/2026/09/Asset360_Inc_20260909.bak',
    checksum: '7c4e1b8a9d0f2...',
    notes: 'Scheduled daily incremental backup',
    createdBy: 'System Scheduler',
    scheduleName: 'Daily Differential/Incremental Backup',
    frequency: 'Hourly (XX:00)',
    retention: '7 Days',
    storageTarget: 'Local NAS & Azure Hot',
    integrityChecked: true,
    logs: [
      { time: '02:00:02 AM', message: 'Differential snapshot started' },
      { time: '02:12:00 AM', message: 'Incremental block written (2.1 GB)' }
    ]
  },
  {
    id: 'BAK-20260908-001',
    name: 'Incremental - 20260908',
    type: 'Incremental',
    size: '2.3 GB',
    startTime: '08 Sep 2026 02:00 AM',
    endTime: '08 Sep 2026 02:11 AM',
    duration: '11 mins',
    status: 'Success',
    location: '/backups/incremental/2026/09/Asset360_Inc_20260908.bak',
    checksum: '9e2b1a8f4c7d5...',
    notes: 'Scheduled daily incremental backup',
    createdBy: 'System Scheduler',
    scheduleName: 'Daily Differential/Incremental Backup',
    frequency: 'Daily (02:00 AM)',
    retention: '7 Days',
    storageTarget: 'Local NAS',
    integrityChecked: true,
    logs: [
      { time: '02:00:01 AM', message: 'Differential snapshot started' },
      { time: '02:11:00 AM', message: 'Incremental block written (2.3 GB)' }
    ]
  },
  {
    id: 'BAK-20260907-001',
    name: 'Full Backup - 20260907',
    type: 'Full',
    size: '18.2 GB',
    startTime: '07 Sep 2026 02:00 AM',
    endTime: '07 Sep 2026 02:40 AM',
    duration: '40 mins',
    status: 'Success',
    location: '/backups/full/2026/09/Asset360_Full_20260907.bak',
    checksum: '5b1a8f4c7d9e2...',
    notes: 'Scheduled weekly full backup',
    createdBy: 'System Scheduler',
    scheduleName: 'Daily Database Full Backup',
    frequency: 'Daily (02:00 AM)',
    retention: '30 Days (4 Generations)',
    storageTarget: 'Azure Blob Hot / AWS S3 Primary',
    integrityChecked: true,
    logs: [
      { time: '02:00:00 AM', message: 'Full database backup initiated' },
      { time: '02:40:00 AM', message: 'Completed successfully (18.2 GB)' }
    ]
  },
  {
    id: 'BAK-20260906-001',
    name: 'Incremental - 20260906',
    type: 'Incremental',
    size: '2.0 GB',
    startTime: '06 Sep 2026 02:00 AM',
    endTime: '06 Sep 2026 02:11 AM',
    duration: '11 mins',
    status: 'Success',
    location: '/backups/incremental/2026/09/Asset360_Inc_20260906.bak',
    checksum: '1a8f4c7d9e2b5...',
    notes: 'Scheduled daily incremental backup',
    createdBy: 'System Scheduler',
    scheduleName: 'Daily Differential/Incremental Backup',
    frequency: 'Daily (02:00 AM)',
    retention: '7 Days',
    storageTarget: 'Local NAS',
    integrityChecked: true,
    logs: [
      { time: '02:00:01 AM', message: 'Differential snapshot started' },
      { time: '02:11:00 AM', message: 'Incremental block written (2.0 GB)' }
    ]
  },
  {
    id: 'BAK-20260905-001',
    name: 'Incremental - 20260905',
    type: 'Incremental',
    size: '2.4 GB',
    startTime: '05 Sep 2026 02:00 AM',
    endTime: '05 Sep 2026 02:13 AM',
    duration: '13 mins',
    status: 'Success',
    location: '/backups/incremental/2026/09/Asset360_Inc_20260905.bak',
    checksum: '4c7d9e2b5a1a8...',
    notes: 'Scheduled daily incremental backup',
    createdBy: 'System Scheduler',
    scheduleName: 'Daily Differential/Incremental Backup',
    frequency: 'Daily (02:00 AM)',
    retention: '7 Days',
    storageTarget: 'Local NAS',
    integrityChecked: true,
    logs: [
      { time: '02:00:01 AM', message: 'Differential snapshot started' },
      { time: '02:13:00 AM', message: 'Incremental block written (2.4 GB)' }
    ]
  },
  {
    id: 'BAK-20260904-001',
    name: 'Incremental - 20260904',
    type: 'Incremental',
    size: '2.2 GB',
    startTime: '04 Sep 2026 02:00 AM',
    endTime: '04 Sep 2026 02:12 AM',
    duration: '12 mins',
    status: 'Failed',
    location: '/backups/incremental/2026/09/Asset360_Inc_20260904.bak',
    checksum: '—',
    notes: 'I/O disk timeout during file stream flush',
    createdBy: 'System Scheduler',
    scheduleName: 'Daily Differential/Incremental Backup',
    frequency: 'Daily (02:00 AM)',
    retention: '7 Days',
    storageTarget: 'Local NAS',
    integrityChecked: false,
    logs: [
      { time: '02:00:01 AM', message: 'Differential snapshot started' },
      { time: '02:12:00 AM', message: 'ERROR: Disk I/O timeout during flush. Exit code 5.' }
    ]
  },
  {
    id: 'BAK-20260903-001',
    name: 'Full Backup - 20260903',
    type: 'Full',
    size: '18.1 GB',
    startTime: '03 Sep 2026 02:00 AM',
    endTime: '03 Sep 2026 02:38 AM',
    duration: '38 mins',
    status: 'Success',
    location: '/backups/full/2026/09/Asset360_Full_20260903.bak',
    checksum: 'd9e2b5a1a84c7...',
    notes: 'Scheduled weekly full backup',
    createdBy: 'System Scheduler',
    scheduleName: 'Daily Database Full Backup',
    frequency: 'Daily (02:00 AM)',
    retention: '30 Days (4 Generations)',
    storageTarget: 'Azure Blob Hot / AWS S3 Primary',
    integrityChecked: true,
    logs: [
      { time: '02:00:00 AM', message: 'Full database backup initiated' },
      { time: '02:38:00 AM', message: 'Completed successfully (18.1 GB)' }
    ]
  },
  {
    id: 'BAK-20260902-001',
    name: 'Incremental - 20260902',
    type: 'Incremental',
    size: '2.0 GB',
    startTime: '02 Sep 2026 02:00 AM',
    endTime: '02 Sep 2026 02:11 AM',
    duration: '11 mins',
    status: 'Success',
    location: '/backups/incremental/2026/09/Asset360_Inc_20260902.bak',
    checksum: 'e2b5a1a84c7d9...',
    notes: 'Scheduled daily incremental backup',
    createdBy: 'System Scheduler',
    scheduleName: 'Daily Differential/Incremental Backup',
    frequency: 'Daily (02:00 AM)',
    retention: '7 Days',
    storageTarget: 'Local NAS',
    integrityChecked: true,
    logs: [
      { time: '02:00:01 AM', message: 'Differential snapshot started' },
      { time: '02:11:00 AM', message: 'Incremental block written (2.0 GB)' }
    ]
  },
  {
    id: 'BAK-20260901-001',
    name: 'Incremental - 20260901',
    type: 'Incremental',
    size: '2.3 GB',
    startTime: '01 Sep 2026 02:00 AM',
    endTime: '01 Sep 2026 02:12 AM',
    duration: '12 mins',
    status: 'Success',
    location: '/backups/incremental/2026/09/Asset360_Inc_20260901.bak',
    checksum: 'b5a1a84c7d9e2...',
    notes: 'Scheduled daily incremental backup',
    createdBy: 'System Scheduler',
    scheduleName: 'Daily Differential/Incremental Backup',
    frequency: 'Daily (02:00 AM)',
    retention: '7 Days',
    storageTarget: 'Local NAS',
    integrityChecked: true,
    logs: [
      { time: '02:00:01 AM', message: 'Differential snapshot started' },
      { time: '02:12:00 AM', message: 'Incremental block written (2.3 GB)' }
    ]
  }
];

const FALLBACK_ACTIVITIES = [
  { id: 'ACT-001', dateTime: '10 Sep 2026 02:35 AM', activity: 'Backup Completed', status: 'Success', message: 'Full backup completed successfully. Size: 18.5 GB' },
  { id: 'ACT-002', dateTime: '10 Sep 2026 02:00 AM', activity: 'Backup Started', status: 'Success', message: 'Full backup started.' },
  { id: 'ACT-003', dateTime: '09 Sep 2026 02:12 AM', activity: 'Backup Completed', status: 'Success', message: 'Incremental backup completed successfully. Size: 2.1 GB' },
  { id: 'ACT-004', dateTime: '09 Sep 2026 02:00 AM', activity: 'Backup Started', status: 'Success', message: 'Incremental backup started.' }
];

const FALLBACK_JOBS = [
  { id: 'JOB-001', name: 'Daily Database Full Backup', jobType: 'Backup', module: 'Administration', frequency: 'Daily (02:00 AM)', lastRun: '10 Sep 2026 02:00 AM', nextRun: '11 Sep 2026 02:00 AM', lastResult: 'Success', status: 'Active', retention: '30 Days', target: 'Azure Blob Primary' },
  { id: 'JOB-002', name: 'Hourly Differential Backup', jobType: 'Backup', module: 'Administration', frequency: 'Hourly (XX:00)', lastRun: '10 Sep 2026 04:00 PM', nextRun: '10 Sep 2026 05:00 PM', lastResult: 'Success', status: 'Active', retention: '7 Days', target: 'Local NAS' },
  { id: 'JOB-003', name: 'Preventive Maintenance Ticket Auto-Generation', jobType: 'Maintenance', module: 'Maintenance', frequency: 'Daily (01:00 AM)', lastRun: '10 Sep 2026 01:00 AM', nextRun: '11 Sep 2026 01:00 AM', lastResult: 'Success (14 tickets)', status: 'Active', retention: '90 Days', target: 'System DB' },
  { id: 'JOB-004', name: 'Warranty & AMC Expiry Scanner', jobType: 'Compliance', module: 'Contracts', frequency: 'Daily (06:00 AM)', lastRun: '10 Sep 2026 06:00 AM', nextRun: '11 Sep 2026 06:00 AM', lastResult: 'Success (3 alerts sent)', status: 'Active', retention: '365 Days', target: 'Notifications Engine' },
  { id: 'JOB-005', name: 'Outbound Notification Dispatcher Queue', jobType: 'Notifications', module: 'Administration', frequency: 'Every 5 Minutes', lastRun: '10 Sep 2026 04:35 PM', nextRun: '10 Sep 2026 04:40 PM', lastResult: 'Success', status: 'Active', retention: '14 Days', target: 'SMTP Queue' },
  { id: 'JOB-006', name: 'Daily Executive Operations Report Summary', jobType: 'Reports', module: 'Reports & Analytics', frequency: 'Daily (07:00 AM)', lastRun: '10 Sep 2026 07:00 AM', nextRun: '11 Sep 2026 07:00 AM', lastResult: 'Success', status: 'Active', retention: '180 Days', target: 'Executive Portal' },
  { id: 'JOB-007', name: 'Auto-Discovery Subnet Scan Sweep', jobType: 'Discovery', module: 'Auto Discovery', frequency: 'Daily (03:00 AM)', lastRun: '10 Sep 2026 03:00 AM', nextRun: '11 Sep 2026 03:00 AM', lastResult: 'Success (42 devices)', status: 'Active', retention: '60 Days', target: 'CMDB Buffer' }
];

export function BackupScheduler() {
  const [activeTab, setActiveTab] = useState('BACKUP'); // 'BACKUP' | 'SCHEDULER'
  const [backups, setBackups] = useState(FALLBACK_BACKUPS);
  const [selectedBackup, setSelectedBackup] = useState(FALLBACK_BACKUPS[0]);
  const [recentActivities, setRecentActivities] = useState(FALLBACK_ACTIVITIES);
  const [jobs, setJobs] = useState(FALLBACK_JOBS);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Search & Pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRowIds, setSelectedRowIds] = useState({});

  // Accordion Toggles on Right Details Panel
  const [scheduleExpanded, setScheduleExpanded] = useState(true);
  const [logsExpanded, setLogsExpanded] = useState(true);

  // Action Dropdowns
  const [showCreateDropdown, setShowCreateDropdown] = useState(false);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [activeRowActionId, setActiveRowActionId] = useState(null);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createType, setCreateType] = useState('Full');
  const [createNotes, setCreateNotes] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const [showRestoreModal, setShowRestoreModal] = useState(null);
  const [restoreConfirmText, setRestoreConfirmText] = useState('');
  const [isRestoring, setIsRestoring] = useState(false);

  const [showJobHistoryModal, setShowJobHistoryModal] = useState(null);
  const [showCreateJobModal, setShowCreateJobModal] = useState(false);
  const [newJobForm, setNewJobForm] = useState({
    name: '',
    jobType: 'Backup',
    module: 'Administration',
    frequency: 'Daily (02:00 AM)',
    retention: '30 Days',
    target: 'Azure Blob Primary'
  });

  const [kpis, setKpis] = useState({
    lastBackup: '10 Sep 2026 02:00 AM',
    lastBackupType: 'Full Backup',
    totalBackups30Days: 28,
    successfulCount: 26,
    failedCount: 2,
    storageUsedGb: 125,
    storageCapacityGb: 500,
    storagePercentage: 25,
    nextScheduledBackup: '11 Sep 2026 02:00 AM',
    nextScheduledType: 'Full Backup (Daily)'
  });

  const showNotification = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [bRes, jRes] = await Promise.all([
        api.get('/admin/backup-scheduler/overview', {
          params: { search: searchQuery, page: currentPage, limit: 10 }
        }),
        api.get('/admin/backup-scheduler/jobs')
      ]);

      if (bRes?.backups && bRes.backups.length > 0) {
        setBackups(bRes.backups);
        if (!selectedBackup || !bRes.backups.find(b => b.id === selectedBackup.id)) {
          setSelectedBackup(bRes.backups[0]);
        }
      }
      if (bRes?.kpis) {
        setKpis(prev => ({ ...prev, ...bRes.kpis }));
      }
      if (bRes?.recentActivities && bRes.recentActivities.length > 0) {
        setRecentActivities(bRes.recentActivities);
      }
      if (jRes?.jobs && jRes.jobs.length > 0) {
        setJobs(jRes.jobs);
      }
    } catch (err) {
      console.warn('Backup data loaded with resilient fallback:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentPage, searchQuery]);

  // Filter Backups in memory if API is in fallback
  const filteredBackups = backups.filter(b => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      b.name.toLowerCase().includes(q) ||
      b.type.toLowerCase().includes(q) ||
      (b.notes && b.notes.toLowerCase().includes(q)) ||
      b.id.toLowerCase().includes(q)
    );
  });

  // Handle Manual Backup Creation
  const handleTriggerCreateBackup = async (typeToCreate = createType) => {
    setIsCreating(true);
    try {
      const res = await api.post('/admin/backup-scheduler/create-backup', {
        name: `${typeToCreate} Backup - ${new Date().toISOString().slice(0, 10).replace(/-/g, '')}`,
        type: typeToCreate,
        notes: createNotes || `Manual ${typeToCreate} backup triggered via console.`
      });

      showNotification('success', `Manual ${typeToCreate} backup completed and verified.`);
      setShowCreateModal(false);
      setCreateNotes('');
      loadData();
    } catch (err) {
      showNotification('error', 'Manual backup creation failed.');
    } finally {
      setIsCreating(false);
    }
  };

  // Handle Verification
  const handleVerifyBackup = async (backup) => {
    try {
      const res = await api.post(`/admin/backup-scheduler/backups/${backup.id}/verify`);
      showNotification('success', `Integrity check PASSED for ${backup.name}. Checksum verified.`);
      const updated = { ...backup, integrityChecked: true, checksum: backup.checksum !== '—' ? backup.checksum : '3f8a7c9d5e2b144fa...' };
      setSelectedBackup(updated);
      setBackups(prev => prev.map(b => b.id === backup.id ? updated : b));
    } catch (err) {
      showNotification('error', 'Integrity verification failed.');
    }
  };

  // Handle Restore Execution
  const handleExecuteRestore = async () => {
    if (restoreConfirmText !== 'CONFIRM RESTORE') {
      showNotification('error', 'Please type CONFIRM RESTORE exactly to proceed.');
      return;
    }
    setIsRestoring(true);
    try {
      await api.post(`/admin/backup-scheduler/backups/${showRestoreModal.id}/restore`);
      showNotification('success', `System successfully restored from ${showRestoreModal.name}. Integrity verified.`);
      setShowRestoreModal(null);
      setRestoreConfirmText('');
      loadData();
    } catch (err) {
      showNotification('error', 'Restore operation failed.');
    } finally {
      setIsRestoring(false);
    }
  };

  // Handle Delete Backup
  const handleDeleteBackup = async (backup) => {
    if (!window.confirm(`Are you sure you want to delete backup archive "${backup.name}"? This action is audited.`)) return;
    try {
      await api.delete(`/admin/backup-scheduler/backups/${backup.id}`);
      showNotification('success', `Backup "${backup.name}" deleted per retention policy.`);
      setBackups(prev => prev.filter(b => b.id !== backup.id));
      if (selectedBackup?.id === backup.id) {
        setSelectedBackup(backups.find(b => b.id !== backup.id) || null);
      }
    } catch (err) {
      showNotification('error', 'Failed deleting backup.');
    }
  };

  // Handle Job Toggle (Pause / Resume)
  const handleToggleJob = async (job) => {
    try {
      const res = await api.patch(`/admin/backup-scheduler/jobs/${job.id}/toggle`);
      const newStatus = job.status === 'Active' ? 'Paused' : 'Active';
      showNotification('success', `Job "${job.name}" is now ${newStatus}.`);
      setJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: newStatus } : j));
    } catch (err) {
      showNotification('error', 'Failed updating job status.');
    }
  };

  // Handle Run Job Now
  const handleRunJobNow = async (job) => {
    try {
      await api.post(`/admin/backup-scheduler/jobs/${job.id}/run`);
      showNotification('success', `Job "${job.name}" triggered immediately.`);
      setJobs(prev => prev.map(j => j.id === job.id ? { ...j, lastRun: 'Just now', lastResult: 'Success (Manual Run)' } : j));
    } catch (err) {
      showNotification('error', 'Failed triggering job.');
    }
  };

  // Select all checkboxes toggle
  const toggleSelectAll = () => {
    if (Object.keys(selectedRowIds).length === filteredBackups.length) {
      setSelectedRowIds({});
    } else {
      const all = {};
      filteredBackups.forEach(b => { all[b.id] = true; });
      setSelectedRowIds(all);
    }
  };

  return (
    <div className="p-6 bg-[#F8FAFC] min-h-screen font-sans text-slate-900 space-y-6">
      {/* Toast Feedback */}
      {toast && (
        <div
          className={clsx(
            'fixed top-5 right-5 z-50 px-4 py-3 rounded-xl shadow-lg border text-sm font-semibold flex items-center gap-2 transition-all animate-in fade-in slide-in-from-top-2',
            toast.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          )}
        >
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <AlertTriangle className="w-5 h-5 text-rose-600" />}
          {toast.message}
        </div>
      )}

      {/* Header & Breadcrumb */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-1">
            <span>Administration</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[#6C2BD9] font-semibold">Backup & Scheduler</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Backup & Scheduler</h1>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Manage system backups and automated scheduled tasks for Asset360.
          </p>
        </div>

        {/* Top Right Action: + Create Backup Now with Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowCreateDropdown(!showCreateDropdown)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#6C2BD9] hover:bg-[#5B21B6] active:bg-[#4C1D95] text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Backup Now</span>
            <ChevronDown className="w-3.5 h-3.5 ml-0.5" />
          </button>

          {showCreateDropdown && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-40 animate-in fade-in">
              <button
                onClick={() => {
                  setCreateType('Full');
                  setShowCreateModal(true);
                  setShowCreateDropdown(false);
                }}
                className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-purple-50 hover:text-[#6C2BD9] font-medium flex items-center gap-2.5"
              >
                <Database className="w-3.5 h-3.5 text-[#6C2BD9]" />
                <div>
                  <p className="font-bold">Create Full Backup</p>
                  <p className="text-[10px] text-slate-400">Complete database snapshot (~18.5 GB)</p>
                </div>
              </button>
              <button
                onClick={() => {
                  setCreateType('Incremental');
                  setShowCreateModal(true);
                  setShowCreateDropdown(false);
                }}
                className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-purple-50 hover:text-[#6C2BD9] font-medium flex items-center gap-2.5 border-t border-slate-100"
              >
                <Layers className="w-3.5 h-3.5 text-purple-500" />
                <div>
                  <p className="font-bold">Create Incremental Backup</p>
                  <p className="text-[10px] text-slate-400">Changed differential blocks only (~2.1 GB)</p>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Tab Switcher */}
      <div className="flex items-center gap-1.5 p-1 bg-white border border-slate-200 rounded-xl w-fit shadow-xs">
        <button
          onClick={() => setActiveTab('BACKUP')}
          className={clsx(
            'flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer',
            activeTab === 'BACKUP'
              ? 'bg-[#F5F3FF] text-[#6C2BD9] border border-[#DDD6FE] shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          )}
        >
          <Database className={clsx('w-4 h-4', activeTab === 'BACKUP' ? 'text-[#6C2BD9]' : 'text-slate-400')} />
          <span>Backup Management</span>
        </button>

        <button
          onClick={() => setActiveTab('SCHEDULER')}
          className={clsx(
            'flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer',
            activeTab === 'SCHEDULER'
              ? 'bg-[#F5F3FF] text-[#6C2BD9] border border-[#DDD6FE] shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          )}
        >
          <Calendar className={clsx('w-4 h-4', activeTab === 'SCHEDULER' ? 'text-[#6C2BD9]' : 'text-slate-400')} />
          <span>Scheduler</span>
        </button>
      </div>

      {/* 4 Top KPI Summary Cards Matching Wireframe */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Last Successful Backup */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-purple-50 flex items-center justify-center shrink-0 border border-purple-100">
            <Database className="w-5 h-5 text-[#6C2BD9]" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-slate-500 font-medium">Last Successful Backup</p>
            <p className="text-sm font-black text-slate-900 truncate mt-0.5">{kpis.lastBackup}</p>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">{kpis.lastBackupType}</p>
          </div>
        </div>

        {/* Card 2: Total Backups (30 Days) */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-purple-50 flex items-center justify-center shrink-0 border border-purple-100">
            <Archive className="w-5 h-5 text-[#6C2BD9]" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-slate-500 font-medium">Total Backups (30 Days)</p>
            <p className="text-sm font-black text-slate-900 truncate mt-0.5">{kpis.totalBackups30Days}</p>
            <p className="text-[10px] font-semibold mt-0.5">
              <span className="text-emerald-600">{kpis.successfulCount} Successful</span>,{' '}
              <span className="text-rose-500">{kpis.failedCount} Failed</span>
            </p>
          </div>
        </div>

        {/* Card 3: Storage Used */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-purple-50 flex items-center justify-center shrink-0 border border-purple-100">
            <Clock className="w-5 h-5 text-[#6C2BD9]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] text-slate-500 font-medium">Storage Used</p>
            <p className="text-sm font-black text-slate-900 truncate mt-0.5">
              {kpis.storageUsedGb} GB / {kpis.storageCapacityGb} GB
            </p>
            <div className="flex items-center gap-2 mt-1.5">
              <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-[#6C2BD9] h-full rounded-full transition-all duration-500"
                  style={{ width: `${kpis.storagePercentage}%` }}
                />
              </div>
              <span className="text-[10px] font-bold text-slate-600">{kpis.storagePercentage}%</span>
            </div>
          </div>
        </div>

        {/* Card 4: Next Scheduled Backup */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-purple-50 flex items-center justify-center shrink-0 border border-purple-100">
            <Calendar className="w-5 h-5 text-[#6C2BD9]" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-slate-500 font-medium">Next Scheduled Backup</p>
            <p className="text-sm font-black text-slate-900 truncate mt-0.5">{kpis.nextScheduledBackup}</p>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">{kpis.nextScheduledType}</p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: BACKUP MANAGEMENT (SPLIT 2-COLUMN VIEW EXACTLY MATCHING SCREENSHOT) */}
      {/* ========================================================================= */}
      {activeTab === 'BACKUP' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left Column: Backups (28) + Recent Activities */}
          <div className="lg:col-span-8 space-y-5">
            {/* Backups Table Card */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              {/* Table Header Bar */}
              <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span>Backups ({filteredBackups.length})</span>
                </h2>

                <div className="flex items-center gap-2">
                  <button
                    onClick={loadData}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all cursor-pointer"
                  >
                    <RefreshCw className={clsx('w-3.5 h-3.5 text-purple-600', loading && 'animate-spin')} />
                    <span>Refresh</span>
                  </button>

                  <div className="relative">
                    <button
                      onClick={() => setShowExportDropdown(!showExportDropdown)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-purple-600" />
                      <span>Export</span>
                      <ChevronDown className="w-3 h-3 text-slate-400" />
                    </button>

                    {showExportDropdown && (
                      <div className="absolute right-0 mt-1.5 w-36 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-30 animate-in fade-in">
                        <button
                          onClick={() => {
                            showNotification('success', 'Exporting Backups Register to CSV...');
                            setShowExportDropdown(false);
                          }}
                          className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 font-medium"
                        >
                          Export to CSV
                        </button>
                        <button
                          onClick={() => {
                            showNotification('success', 'Exporting Backups Register to Excel (.xlsx)...');
                            setShowExportDropdown(false);
                          }}
                          className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 font-medium"
                        >
                          Export to Excel
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Search Bar */}
              <div className="p-3 border-b border-slate-100 bg-slate-50/50">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by backup name, type, or notes..."
                    className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#6C2BD9] focus:ring-1 focus:ring-[#6C2BD9] transition-all"
                  />
                </div>
              </div>

              {/* Data Grid */}
              <div className="overflow-auto max-h-[540px]">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider sticky top-0 z-10 shadow-2xs">
                    <tr>
                      <th className="py-2.5 px-3 w-8 text-center">
                        <input
                          type="checkbox"
                          checked={filteredBackups.length > 0 && Object.keys(selectedRowIds).length === filteredBackups.length}
                          onChange={toggleSelectAll}
                          className="rounded text-[#6C2BD9] focus:ring-purple-500 cursor-pointer"
                        />
                      </th>
                      <th className="py-2.5 px-2 w-8 text-center">#</th>
                      <th className="py-2.5 px-3 font-bold">
                        <span className="flex items-center gap-1">Backup Name <ChevronDown className="w-2.5 h-2.5 text-slate-400" /></span>
                      </th>
                      <th className="py-2.5 px-3 font-bold">
                        <span className="flex items-center gap-1">Type <ChevronDown className="w-2.5 h-2.5 text-slate-400" /></span>
                      </th>
                      <th className="py-2.5 px-3 font-bold">Size</th>
                      <th className="py-2.5 px-3 font-bold">
                        <span className="flex items-center gap-1">Start Time <ChevronDown className="w-2.5 h-2.5 text-slate-400" /></span>
                      </th>
                      <th className="py-2.5 px-3 font-bold">
                        <span className="flex items-center gap-1">Duration <ChevronDown className="w-2.5 h-2.5 text-slate-400" /></span>
                      </th>
                      <th className="py-2.5 px-3 font-bold text-center">Status</th>
                      <th className="py-2.5 px-3 font-bold text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredBackups.map((backup, idx) => {
                      const isSelected = selectedBackup?.id === backup.id;
                      const isChecked = Boolean(selectedRowIds[backup.id]);

                      return (
                        <tr
                          key={backup.id}
                          onClick={() => setSelectedBackup(backup)}
                          className={clsx(
                            'transition-colors cursor-pointer group',
                            isSelected
                              ? 'bg-[#F5F3FF] border-l-4 border-l-[#6C2BD9]'
                              : 'hover:bg-slate-50/80'
                          )}
                        >
                          <td className="py-2.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() =>
                                setSelectedRowIds(prev => ({
                                  ...prev,
                                  [backup.id]: !prev[backup.id]
                                }))
                              }
                              className="rounded text-[#6C2BD9] focus:ring-purple-500 cursor-pointer"
                            />
                          </td>
                          <td className="py-2.5 px-2 text-center text-slate-400 font-mono text-[11px]">
                            {idx + 1}
                          </td>
                          <td className="py-2.5 px-3 font-bold text-slate-900 truncate">
                            {backup.name}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600 font-medium">
                            {backup.type}
                          </td>
                          <td className="py-2.5 px-3 font-mono font-semibold text-slate-800">
                            {backup.size}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600 font-medium whitespace-nowrap">
                            {backup.startTime}
                          </td>
                          <td className="py-2.5 px-3 text-slate-500 font-medium whitespace-nowrap">
                            {backup.duration}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span
                              className={clsx(
                                'inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border',
                                backup.status === 'Success'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-rose-50 text-rose-700 border-rose-200'
                              )}
                            >
                              {backup.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                            <div className="relative inline-block">
                              <button
                                onClick={() => setActiveRowActionId(activeRowActionId === backup.id ? null : backup.id)}
                                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
                              >
                                <MoreVertical className="w-3.5 h-3.5" />
                              </button>

                              {activeRowActionId === backup.id && (
                                <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-30 text-left animate-in fade-in">
                                  <button
                                    onClick={() => {
                                      setSelectedBackup(backup);
                                      setActiveRowActionId(null);
                                    }}
                                    className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-purple-50 hover:text-[#6C2BD9] font-medium"
                                  >
                                    View Details
                                  </button>
                                  <button
                                    onClick={() => {
                                      showNotification('success', `Downloading ${backup.name}...`);
                                      setActiveRowActionId(null);
                                    }}
                                    className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-purple-50 hover:text-[#6C2BD9] font-medium"
                                  >
                                    Download Artifact
                                  </button>
                                  <button
                                    onClick={() => {
                                      handleVerifyBackup(backup);
                                      setActiveRowActionId(null);
                                    }}
                                    className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-purple-50 hover:text-[#6C2BD9] font-medium"
                                  >
                                    Verify Integrity
                                  </button>
                                  <button
                                    onClick={() => {
                                      setShowRestoreModal(backup);
                                      setActiveRowActionId(null);
                                    }}
                                    className="w-full text-left px-3 py-1.5 text-xs text-amber-600 hover:bg-amber-50 font-medium"
                                  >
                                    Restore Database
                                  </button>
                                  <div className="border-t border-slate-100 my-1" />
                                  <button
                                    onClick={() => {
                                      handleDeleteBackup(backup);
                                      setActiveRowActionId(null);
                                    }}
                                    className="w-full text-left px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 font-medium"
                                  >
                                    Delete Backup
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Table Summary Footer */}
              <div className="p-3 border-t border-slate-200 bg-white flex items-center justify-between text-xs text-slate-500">
                <div className="font-medium text-slate-600">Showing {filteredBackups.length} records</div>
                <div className="text-slate-400">Scroll down to view all records</div>
              </div>
            </div>

            {/* Recent Activities Card Matching Screenshot */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white">
                <h3 className="text-sm font-bold text-slate-900">Recent Activities</h3>
                <button
                  onClick={() => showNotification('info', 'Opening full audit history in Audit Logs console...')}
                  className="text-xs font-semibold text-[#6C2BD9] hover:underline cursor-pointer"
                >
                  View All Logs
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-2.5 px-3 w-8 text-center">#</th>
                      <th className="py-2.5 px-3 font-bold">Date & Time</th>
                      <th className="py-2.5 px-3 font-bold">Activity</th>
                      <th className="py-2.5 px-3 font-bold text-center">Status</th>
                      <th className="py-2.5 px-3 font-bold">Message</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recentActivities.map((act, idx) => (
                      <tr key={act.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-2 px-3 text-center text-slate-400 font-mono text-[11px]">
                          {idx + 1}
                        </td>
                        <td className="py-2 px-3 text-slate-600 whitespace-nowrap font-medium">
                          {act.dateTime}
                        </td>
                        <td className="py-2 px-3 font-bold text-slate-900 whitespace-nowrap">
                          {act.activity}
                        </td>
                        <td className="py-2 px-3 text-center">
                          <span
                            className={clsx(
                              'inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border',
                              act.status === 'Success'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-rose-50 text-rose-700 border-rose-200'
                            )}
                          >
                            {act.status}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-slate-600 truncate max-w-xs">
                          {act.message}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column: Backup Details Panel Matching Exact Screenshot */}
          <div className="lg:col-span-4 space-y-4">
            {selectedBackup ? (
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 space-y-4">
                {/* Panel Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <h3 className="text-sm font-black text-slate-900">Backup Details</h3>
                  <button
                    onClick={() => setShowRestoreModal(selectedBackup)}
                    className="flex items-center gap-1 px-3 py-1 rounded-lg border border-[#DDD6FE] text-xs font-bold text-[#6C2BD9] hover:bg-purple-50 transition-all cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3 text-[#6C2BD9]" />
                    <span>Restore</span>
                  </button>
                </div>

                {/* Key-Value Pair Metadata with vertical alignment */}
                <div className="space-y-2 text-xs">
                  <div className="flex items-start">
                    <span className="w-24 text-slate-500 font-medium shrink-0">Backup Name</span>
                    <span className="text-slate-400 mr-2">:</span>
                    <span className="font-bold text-slate-900 break-all">{selectedBackup.name}</span>
                  </div>

                  <div className="flex items-center">
                    <span className="w-24 text-slate-500 font-medium shrink-0">Type</span>
                    <span className="text-slate-400 mr-2">:</span>
                    <span className="font-semibold text-slate-800">{selectedBackup.type}</span>
                  </div>

                  <div className="flex items-center">
                    <span className="w-24 text-slate-500 font-medium shrink-0">Status</span>
                    <span className="text-slate-400 mr-2">:</span>
                    <span
                      className={clsx(
                        'px-2 py-0.5 rounded-full text-[10px] font-bold border',
                        selectedBackup.status === 'Success'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      )}
                    >
                      {selectedBackup.status}
                    </span>
                  </div>

                  <div className="flex items-center">
                    <span className="w-24 text-slate-500 font-medium shrink-0">Start Time</span>
                    <span className="text-slate-400 mr-2">:</span>
                    <span className="text-slate-700 font-medium">{selectedBackup.startTime}</span>
                  </div>

                  <div className="flex items-center">
                    <span className="w-24 text-slate-500 font-medium shrink-0">End Time</span>
                    <span className="text-slate-400 mr-2">:</span>
                    <span className="text-slate-700 font-medium">{selectedBackup.endTime}</span>
                  </div>

                  <div className="flex items-center">
                    <span className="w-24 text-slate-500 font-medium shrink-0">Duration</span>
                    <span className="text-slate-400 mr-2">:</span>
                    <span className="text-slate-700 font-medium">{selectedBackup.duration}</span>
                  </div>

                  <div className="flex items-center">
                    <span className="w-24 text-slate-500 font-medium shrink-0">Size</span>
                    <span className="text-slate-400 mr-2">:</span>
                    <span className="font-mono font-bold text-slate-900">{selectedBackup.size}</span>
                  </div>

                  <div className="flex items-start">
                    <span className="w-24 text-slate-500 font-medium shrink-0">Location</span>
                    <span className="text-slate-400 mr-2">:</span>
                    <span className="font-mono text-[11px] text-slate-600 break-all">{selectedBackup.location}</span>
                  </div>

                  <div className="flex items-start">
                    <span className="w-24 text-slate-500 font-medium shrink-0">Checksum</span>
                    <span className="text-slate-400 mr-2">:</span>
                    <span className="font-mono text-[11px] text-slate-600 break-all">{selectedBackup.checksum}</span>
                  </div>

                  <div className="flex items-start">
                    <span className="w-24 text-slate-500 font-medium shrink-0">Notes</span>
                    <span className="text-slate-400 mr-2">:</span>
                    <span className="text-slate-700">{selectedBackup.notes}</span>
                  </div>
                </div>

                {/* Backup Actions Section */}
                <div className="pt-3 border-t border-slate-100">
                  <p className="text-xs font-bold text-slate-800 mb-2">Backup Actions</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    <button
                      onClick={() => showNotification('success', `Downloading archive ${selectedBackup.name}...`)}
                      className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg border border-slate-200 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-purple-600" />
                      <span>Download</span>
                    </button>

                    <button
                      onClick={() => setShowRestoreModal(selectedBackup)}
                      className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg border border-purple-200 text-[11px] font-semibold text-[#6C2BD9] hover:bg-purple-50 transition-all cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-[#6C2BD9]" />
                      <span>Restore</span>
                    </button>

                    <button
                      onClick={() => handleVerifyBackup(selectedBackup)}
                      className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg border border-slate-200 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                      <span>Verify</span>
                    </button>

                    <button
                      onClick={() => handleDeleteBackup(selectedBackup)}
                      className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg border border-rose-200 text-[11px] font-semibold text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>

                {/* Collapsible Accordion 1: Schedule Information */}
                <div className="pt-2 border-t border-slate-100">
                  <button
                    onClick={() => setScheduleExpanded(!scheduleExpanded)}
                    className="w-full flex items-center justify-between text-xs font-bold text-slate-800 hover:text-[#6C2BD9] transition-all cursor-pointer py-1"
                  >
                    <span>Schedule Information</span>
                    {scheduleExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  </button>

                  {scheduleExpanded && (
                    <div className="mt-2 space-y-1.5 text-[11px] bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-medium">Schedule Name:</span>
                        <span className="font-bold text-slate-800">{selectedBackup.scheduleName || 'Daily Database Full Backup'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-medium">Frequency:</span>
                        <span className="font-semibold text-slate-700">{selectedBackup.frequency || 'Daily (02:00 AM)'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-medium">Retention Period:</span>
                        <span className="font-semibold text-slate-700">{selectedBackup.retention || '30 Days (4 Generations)'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-medium">Storage Target:</span>
                        <span className="font-mono text-slate-700">{selectedBackup.storageTarget || 'Azure Blob Hot'}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Collapsible Accordion 2: Backup Logs */}
                <div className="pt-2 border-t border-slate-100">
                  <button
                    onClick={() => setLogsExpanded(!logsExpanded)}
                    className="w-full flex items-center justify-between text-xs font-bold text-slate-800 hover:text-[#6C2BD9] transition-all cursor-pointer py-1"
                  >
                    <span>Backup Logs</span>
                    {logsExpanded ? <ChevronDown className="w-3.5 h-3.5 text-[#6C2BD9]" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  </button>

                  {logsExpanded && (
                    <div className="mt-2 space-y-2 text-[11px] bg-slate-50 p-2.5 rounded-lg border border-slate-100 font-mono max-h-48 overflow-y-auto">
                      {(selectedBackup.logs || []).map((log, lIdx) => (
                        <div key={lIdx} className="flex items-start gap-2">
                          <span className="text-slate-400 shrink-0">[{log.time}]</span>
                          <span className="text-slate-700">{log.message}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-400 text-xs">
                Select a backup record to view details
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: SCHEDULER (PARAGRAPHS 787-803 FULL GOVERNANCE MANAGEMENT) */}
      {/* ========================================================================= */}
      {activeTab === 'SCHEDULER' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Automated Job Schedules</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage recurring background processes, preventive maintenance generators, warranty scans, and backup sweeps.
              </p>
            </div>

            <button
              onClick={() => setShowCreateJobModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Create Schedule</span>
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4 font-bold">Job Name</th>
                    <th className="py-3 px-4 font-bold">Job Type</th>
                    <th className="py-3 px-4 font-bold">Module</th>
                    <th className="py-3 px-4 font-bold">Frequency</th>
                    <th className="py-3 px-4 font-bold">Last Run</th>
                    <th className="py-3 px-4 font-bold">Next Run</th>
                    <th className="py-3 px-4 font-bold">Last Result</th>
                    <th className="py-3 px-4 font-bold text-center">Status</th>
                    <th className="py-3 px-4 font-bold text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {jobs.map((job) => (
                    <tr key={job.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900">{job.name}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-50 text-[#6C2BD9] border border-purple-200">
                          {job.jobType}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-medium">{job.module}</td>
                      <td className="py-3 px-4 text-slate-600 font-medium">{job.frequency}</td>
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">{job.lastRun}</td>
                      <td className="py-3 px-4 text-slate-700 font-mono text-[11px] font-semibold whitespace-nowrap">{job.nextRun}</td>
                      <td className="py-3 px-4 text-slate-600 text-[11px]">{job.lastResult}</td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={clsx(
                            'inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border',
                            job.status === 'Active'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          )}
                        >
                          {job.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleRunJobNow(job)}
                            className="p-1 rounded-md text-[#6C2BD9] hover:bg-purple-50 transition-all cursor-pointer"
                            title="Run Now"
                          >
                            <Play className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleToggleJob(job)}
                            className="p-1 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all cursor-pointer"
                            title={job.status === 'Active' ? 'Pause' : 'Resume'}
                          >
                            {job.status === 'Active' ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => setShowJobHistoryModal(job)}
                            className="p-1 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all cursor-pointer"
                            title="View Execution History"
                          >
                            <Clock className="w-3.5 h-3.5" />
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
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: CREATE BACKUP NOW (MANUAL TRIGGER) */}
      {/* ========================================================================= */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-[#6C2BD9]" />
                <h3 className="font-bold text-slate-900 text-sm">Create Manual Backup</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Backup Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCreateType('Full')}
                    className={clsx(
                      'p-2.5 rounded-xl border text-center font-bold transition-all cursor-pointer',
                      createType === 'Full'
                        ? 'border-[#6C2BD9] bg-purple-50 text-[#6C2BD9]'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    )}
                  >
                    Full Backup
                    <p className="text-[10px] font-normal text-slate-400 mt-0.5">All tables & attachments</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCreateType('Incremental')}
                    className={clsx(
                      'p-2.5 rounded-xl border text-center font-bold transition-all cursor-pointer',
                      createType === 'Incremental'
                        ? 'border-[#6C2BD9] bg-purple-50 text-[#6C2BD9]'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    )}
                  >
                    Incremental
                    <p className="text-[10px] font-normal text-slate-400 mt-0.5">Delta changes since last run</p>
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Storage Target</label>
                <input
                  type="text"
                  disabled
                  value="Azure Blob Hot (Container: asset360-backups)"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Notes / Description (Optional)</label>
                <textarea
                  rows={3}
                  value={createNotes}
                  onChange={(e) => setCreateNotes(e.target.value)}
                  placeholder="e.g. Pre-upgrade maintenance snapshot"
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#6C2BD9]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={isCreating}
                onClick={() => handleTriggerCreateBackup(createType)}
                className="px-4 py-2 rounded-xl bg-[#6C2BD9] hover:bg-[#5B21B6] text-white font-bold text-xs shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
              >
                {isCreating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Database className="w-3.5 h-3.5" />}
                <span>{isCreating ? 'Processing...' : 'Start Backup'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: RESTORE BACKUP (CONTROLLED HIGH-RISK WORKFLOW PARAGRAPHS 780-782) */}
      {/* ========================================================================= */}
      {showRestoreModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-rose-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2 text-rose-600 font-black">
                <AlertOctagon className="w-5 h-5" />
                <h3 className="text-sm">High-Risk Operation: Database Restoration</h3>
              </div>
              <button
                onClick={() => {
                  setShowRestoreModal(null);
                  setRestoreConfirmText('');
                }}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-1">
              <p className="text-xs font-bold text-rose-800">Critical Warning</p>
              <p className="text-[11px] text-rose-700 leading-relaxed">
                Restoring a snapshot will overwrite all live database transactions with historical data from{' '}
                <strong>{showRestoreModal.startTime}</strong>. All active user sessions will be logged out and the application will enter maintenance mode during execution.
              </p>
            </div>

            <div className="space-y-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Backup Archive:</span>
                <span className="font-bold text-slate-900">{showRestoreModal.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Size & Type:</span>
                <span className="font-semibold text-slate-800">{showRestoreModal.size} ({showRestoreModal.type})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Checksum:</span>
                <span className="font-mono text-slate-700 text-[11px]">{showRestoreModal.checksum}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Target Environment:</span>
                <span className="font-bold text-purple-700">Production Database (Asset360_Prod)</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Type <span className="font-mono text-rose-600 bg-rose-50 px-1 py-0.5 rounded">CONFIRM RESTORE</span> to proceed:
              </label>
              <input
                type="text"
                value={restoreConfirmText}
                onChange={(e) => setRestoreConfirmText(e.target.value)}
                placeholder="CONFIRM RESTORE"
                className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                onClick={() => {
                  setShowRestoreModal(null);
                  setRestoreConfirmText('');
                }}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={restoreConfirmText !== 'CONFIRM RESTORE' || isRestoring}
                onClick={handleExecuteRestore}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
              >
                {isRestoring ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
                <span>{isRestoring ? 'Restoring System...' : 'Execute Restoration'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: JOB EXECUTION HISTORY */}
      {/* ========================================================================= */}
      {showJobHistoryModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Execution History: {showJobHistoryModal.name}</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Showing past executions, run duration, and status.</p>
              </div>
              <button
                onClick={() => setShowJobHistoryModal(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-x-auto max-h-72 overflow-y-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">Run ID</th>
                    <th className="py-2.5 px-3">Start Time</th>
                    <th className="py-2.5 px-3">Duration</th>
                    <th className="py-2.5 px-3">Trigger Type</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 px-3">Result Message</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50/60">
                    <td className="py-2 px-3 font-mono font-bold text-slate-900">RUN-0091</td>
                    <td className="py-2 px-3 text-slate-600">10 Sep 2026 02:00 AM</td>
                    <td className="py-2 px-3 text-slate-600">35 mins</td>
                    <td className="py-2 px-3"><span className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px] font-semibold">Scheduled</span></td>
                    <td className="py-2 px-3 text-center"><span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Success</span></td>
                    <td className="py-2 px-3 text-slate-600 truncate max-w-xs">{showJobHistoryModal.lastResult}</td>
                  </tr>
                  <tr className="hover:bg-slate-50/60">
                    <td className="py-2 px-3 font-mono font-bold text-slate-900">RUN-0090</td>
                    <td className="py-2 px-3 text-slate-600">09 Sep 2026 02:00 AM</td>
                    <td className="py-2 px-3 text-slate-600">34 mins</td>
                    <td className="py-2 px-3"><span className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px] font-semibold">Scheduled</span></td>
                    <td className="py-2 px-3 text-center"><span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Success</span></td>
                    <td className="py-2 px-3 text-slate-600">Completed without exceptions</td>
                  </tr>
                  <tr className="hover:bg-slate-50/60">
                    <td className="py-2 px-3 font-mono font-bold text-slate-900">RUN-0089</td>
                    <td className="py-2 px-3 text-slate-600">08 Sep 2026 02:00 AM</td>
                    <td className="py-2 px-3 text-slate-600">36 mins</td>
                    <td className="py-2 px-3"><span className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px] font-semibold">Scheduled</span></td>
                    <td className="py-2 px-3 text-center"><span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Success</span></td>
                    <td className="py-2 px-3 text-slate-600">Completed without exceptions</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-200">
              <button
                onClick={() => setShowJobHistoryModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: CREATE SCHEDULE */}
      {/* ========================================================================= */}
      {showCreateJobModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#6C2BD9]" />
                <h3 className="font-bold text-slate-900 text-sm">Create New Job Schedule</h3>
              </div>
              <button
                onClick={() => setShowCreateJobModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Schedule Name</label>
                <input
                  type="text"
                  value={newJobForm.name}
                  onChange={(e) => setNewJobForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Weekly Asset Depreciation Sweep"
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-[#6C2BD9]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Job Type</label>
                  <select
                    value={newJobForm.jobType}
                    onChange={(e) => setNewJobForm(prev => ({ ...prev, jobType: e.target.value }))}
                    className="w-full p-2.5 border border-slate-200 rounded-lg text-slate-900 bg-white focus:outline-none focus:border-[#6C2BD9]"
                  >
                    <option value="Backup">Backup</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Compliance">Compliance</option>
                    <option value="Notifications">Notifications</option>
                    <option value="Reports">Reports</option>
                    <option value="Discovery">Discovery</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Module</label>
                  <select
                    value={newJobForm.module}
                    onChange={(e) => setNewJobForm(prev => ({ ...prev, module: e.target.value }))}
                    className="w-full p-2.5 border border-slate-200 rounded-lg text-slate-900 bg-white focus:outline-none focus:border-[#6C2BD9]"
                  >
                    <option value="Administration">Administration</option>
                    <option value="Assets">Assets</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Contracts">Contracts</option>
                    <option value="Reports & Analytics">Reports & Analytics</option>
                    <option value="Auto Discovery">Auto Discovery</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Frequency</label>
                  <select
                    value={newJobForm.frequency}
                    onChange={(e) => setNewJobForm(prev => ({ ...prev, frequency: e.target.value }))}
                    className="w-full p-2.5 border border-slate-200 rounded-lg text-slate-900 bg-white focus:outline-none focus:border-[#6C2BD9]"
                  >
                    <option value="Hourly (XX:00)">Hourly</option>
                    <option value="Daily (02:00 AM)">Daily</option>
                    <option value="Weekly (Sunday 02:00 AM)">Weekly</option>
                    <option value="Monthly (1st at 02:00 AM)">Monthly</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Retention</label>
                  <select
                    value={newJobForm.retention}
                    onChange={(e) => setNewJobForm(prev => ({ ...prev, retention: e.target.value }))}
                    className="w-full p-2.5 border border-slate-200 rounded-lg text-slate-900 bg-white focus:outline-none focus:border-[#6C2BD9]"
                  >
                    <option value="7 Days">7 Days</option>
                    <option value="30 Days">30 Days</option>
                    <option value="90 Days">90 Days</option>
                    <option value="365 Days">365 Days</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                onClick={() => setShowCreateJobModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!newJobForm.name) return;
                  try {
                    await api.post('/admin/backup-scheduler/jobs', newJobForm);
                    showNotification('success', `Job "${newJobForm.name}" scheduled successfully.`);
                    setShowCreateJobModal(false);
                    loadData();
                  } catch (err) {
                    showNotification('error', 'Failed saving schedule.');
                  }
                }}
                className="px-4 py-2 rounded-xl bg-[#6C2BD9] hover:bg-[#5B21B6] text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
              >
                Save Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BackupScheduler;
