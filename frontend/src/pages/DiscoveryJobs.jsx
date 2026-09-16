import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../services/api';
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
  Server,
  Network,
  Cpu,
  Layers,
  FileText,
  Sliders,
  X,
  Info,
  ArrowUpRight,
  Sparkles
} from 'lucide-react';

const SEED_JOBS = [
  {
    id: 'JOB-2026-0001',
    jobName: 'HQ Network Scan',
    discoveryType: 'IP Range Scan',
    ipRange: '192.168.1.0/24',
    profile: 'Default',
    schedule: 'Manual',
    status: 'Completed',
    createdBy: 'John Doe',
    createdOn: '08/09/2026, 09:30 AM',
    startedOn: '10/09/2026, 10:24 AM',
    completedOn: '10/09/2026, 10:38 AM',
    duration: '14m 00s',
    totalDevices: 245,
    matchedCount: 198,
    newCount: 32,
    reviewCount: 15,
    stages: [
      { name: 'Initializing Discovery', status: 'Completed', timestamp: '10:24:02 AM' },
      { name: 'Scanning IP Range', status: 'Completed', timestamp: '10:27:45 AM' },
      { name: 'Identifying Devices', status: 'Completed', timestamp: '10:31:12 AM' },
      { name: 'Collecting Device Details', status: 'Completed', timestamp: '10:34:50 AM' },
      { name: 'Matching with Asset Database', status: 'Completed', timestamp: '10:37:18 AM' },
      { name: 'Generating Report', status: 'Completed', timestamp: '10:38:00 AM' }
    ]
  },
  {
    id: 'JOB-2026-0002',
    jobName: 'Branch Office Scan',
    discoveryType: 'Subnet Ping & SNMP',
    ipRange: '10.0.10.0/24',
    profile: 'Cisco & Server Profile',
    schedule: 'Daily at 02:00 AM',
    status: 'Completed',
    createdBy: 'John Doe',
    createdOn: '07/09/2026, 02:10 PM',
    startedOn: '09/09/2026, 02:00 AM',
    completedOn: '09/09/2026, 02:14 AM',
    duration: '14m 00s',
    totalDevices: 84,
    matchedCount: 78,
    newCount: 4,
    reviewCount: 2,
    stages: [
      { name: 'Initializing Discovery', status: 'Completed', timestamp: '02:00:01 AM' },
      { name: 'Scanning IP Range', status: 'Completed', timestamp: '02:04:12 AM' },
      { name: 'Identifying Devices', status: 'Completed', timestamp: '02:08:33 AM' },
      { name: 'Collecting Device Details', status: 'Completed', timestamp: '02:11:50 AM' },
      { name: 'Matching with Asset Database', status: 'Completed', timestamp: '02:13:20 AM' },
      { name: 'Generating Report', status: 'Completed', timestamp: '02:14:00 AM' }
    ]
  },
  {
    id: 'JOB-2026-0003',
    jobName: 'Data Center Core',
    discoveryType: 'IP Range Scan',
    ipRange: '172.16.0.0/20',
    profile: 'Server Profile',
    schedule: 'Weekly (Sun 01:00 AM)',
    status: 'Completed',
    createdBy: 'Admin User',
    createdOn: '01/09/2026, 08:00 AM',
    startedOn: '08/09/2026, 01:00 AM',
    completedOn: '08/09/2026, 01:45 AM',
    duration: '45m 00s',
    totalDevices: 512,
    matchedCount: 490,
    newCount: 12,
    reviewCount: 10,
    stages: [
      { name: 'Initializing Discovery', status: 'Completed', timestamp: '01:00:05 AM' },
      { name: 'Scanning IP Range', status: 'Completed', timestamp: '01:15:30 AM' },
      { name: 'Identifying Devices', status: 'Completed', timestamp: '01:25:10 AM' },
      { name: 'Collecting Device Details', status: 'Completed', timestamp: '01:36:44 AM' },
      { name: 'Matching with Asset Database', status: 'Completed', timestamp: '01:42:00 AM' },
      { name: 'Generating Report', status: 'Completed', timestamp: '01:45:00 AM' }
    ]
  },
  {
    id: 'JOB-2026-0004',
    jobName: 'WMI - Windows Endpoints',
    discoveryType: 'Agentless WMI',
    ipRange: '192.168.2.0/24',
    profile: 'Windows WMI Profile',
    schedule: 'Daily at 04:00 AM',
    status: 'Completed',
    createdBy: 'Sarah Connor',
    createdOn: '05/09/2026, 11:20 AM',
    startedOn: '10/09/2026, 04:00 AM',
    completedOn: '10/09/2026, 04:22 AM',
    duration: '22m 00s',
    totalDevices: 160,
    matchedCount: 145,
    newCount: 10,
    reviewCount: 5,
    stages: [
      { name: 'Initializing Discovery', status: 'Completed', timestamp: '04:00:02 AM' },
      { name: 'Scanning IP Range', status: 'Completed', timestamp: '04:06:15 AM' },
      { name: 'Identifying Devices', status: 'Completed', timestamp: '04:12:08 AM' },
      { name: 'Collecting Device Details', status: 'Completed', timestamp: '04:18:22 AM' },
      { name: 'Matching with Asset Database', status: 'Completed', timestamp: '04:21:05 AM' },
      { name: 'Generating Report', status: 'Completed', timestamp: '04:22:00 AM' }
    ]
  },
  {
    id: 'JOB-2026-0005',
    jobName: 'SNMP Switch Audit',
    discoveryType: 'SNMP Profile Scan',
    ipRange: '10.100.1.0/24',
    profile: 'Cisco Catalyst Profile',
    schedule: 'Weekly (Sat 11:00 PM)',
    status: 'Completed',
    createdBy: 'Admin User',
    createdOn: '02/09/2026, 04:00 PM',
    startedOn: '07/09/2026, 11:00 PM',
    completedOn: '07/09/2026, 11:15 PM',
    duration: '15m 00s',
    totalDevices: 48,
    matchedCount: 46,
    newCount: 1,
    reviewCount: 1,
    stages: [
      { name: 'Initializing Discovery', status: 'Completed', timestamp: '11:00:01 PM' },
      { name: 'Scanning IP Range', status: 'Completed', timestamp: '11:03:40 PM' },
      { name: 'Identifying Devices', status: 'Completed', timestamp: '11:07:12 PM' },
      { name: 'Collecting Device Details', status: 'Completed', timestamp: '11:11:30 PM' },
      { name: 'Matching with Asset Database', status: 'Completed', timestamp: '11:14:00 PM' },
      { name: 'Generating Report', status: 'Completed', timestamp: '11:15:00 PM' }
    ]
  },
  {
    id: 'JOB-2026-0006',
    jobName: 'Cloud Subnet Scan',
    discoveryType: 'Cloud VPC Connector',
    ipRange: '10.200.0.0/16',
    profile: 'AWS VPC Discovery',
    schedule: 'Daily at 03:00 AM',
    status: 'Completed',
    createdBy: 'DevOps Team',
    createdOn: '03/09/2026, 10:00 AM',
    startedOn: '10/09/2026, 03:00 AM',
    completedOn: '10/09/2026, 03:12 AM',
    duration: '12m 00s',
    totalDevices: 92,
    matchedCount: 88,
    newCount: 3,
    reviewCount: 1,
    stages: [
      { name: 'Initializing Discovery', status: 'Completed', timestamp: '03:00:02 AM' },
      { name: 'Scanning IP Range', status: 'Completed', timestamp: '03:03:10 AM' },
      { name: 'Identifying Devices', status: 'Completed', timestamp: '03:06:45 AM' },
      { name: 'Collecting Device Details', status: 'Completed', timestamp: '03:09:20 AM' },
      { name: 'Matching with Asset Database', status: 'Completed', timestamp: '03:11:15 AM' },
      { name: 'Generating Report', status: 'Completed', timestamp: '03:12:00 AM' }
    ]
  },
  {
    id: 'JOB-2026-0007',
    jobName: 'London Office Sweep',
    discoveryType: 'IP Range Scan',
    ipRange: '10.50.0.0/22',
    profile: 'Full Corporate Audit',
    schedule: 'Monthly (1st)',
    status: 'Completed',
    createdBy: 'Mike Ross',
    createdOn: '25/08/2026, 09:00 AM',
    startedOn: '01/09/2026, 05:00 AM',
    completedOn: '01/09/2026, 05:35 AM',
    duration: '35m 00s',
    totalDevices: 130,
    matchedCount: 120,
    newCount: 8,
    reviewCount: 2,
    stages: [
      { name: 'Initializing Discovery', status: 'Completed', timestamp: '05:00:03 AM' },
      { name: 'Scanning IP Range', status: 'Completed', timestamp: '05:10:20 AM' },
      { name: 'Identifying Devices', status: 'Completed', timestamp: '05:18:40 AM' },
      { name: 'Collecting Device Details', status: 'Completed', timestamp: '05:27:10 AM' },
      { name: 'Matching with Asset Database', status: 'Completed', timestamp: '05:32:45 AM' },
      { name: 'Generating Report', status: 'Completed', timestamp: '05:35:00 AM' }
    ]
  },
  {
    id: 'JOB-2026-0008',
    jobName: 'IoT & Surveillance VLAN',
    discoveryType: 'ARP & Ping Sweep',
    ipRange: '192.168.100.0/24',
    profile: 'IoT Devices Profile',
    schedule: 'Weekly (Fri 10:00 PM)',
    status: 'Completed',
    createdBy: 'Security Ops',
    createdOn: '30/08/2026, 12:00 PM',
    startedOn: '05/09/2026, 10:00 PM',
    completedOn: '05/09/2026, 10:08 PM',
    duration: '8m 00s',
    totalDevices: 67,
    matchedCount: 60,
    newCount: 5,
    reviewCount: 2,
    stages: [
      { name: 'Initializing Discovery', status: 'Completed', timestamp: '10:00:01 PM' },
      { name: 'Scanning IP Range', status: 'Completed', timestamp: '10:02:15 PM' },
      { name: 'Identifying Devices', status: 'Completed', timestamp: '10:04:30 PM' },
      { name: 'Collecting Device Details', status: 'Completed', timestamp: '10:06:12 PM' },
      { name: 'Matching with Asset Database', status: 'Completed', timestamp: '10:07:35 PM' },
      { name: 'Generating Report', status: 'Completed', timestamp: '10:08:00 PM' }
    ]
  },
  {
    id: 'JOB-2026-0009',
    jobName: 'Floor 3 WiFi AP Scan',
    discoveryType: 'Active ARP / Ping',
    ipRange: '192.168.30.0/24',
    profile: 'Wireless AP Profile',
    schedule: 'Hourly',
    status: 'Running',
    createdBy: 'John Doe',
    createdOn: '10/09/2026, 02:00 PM',
    startedOn: '10/09/2026, 02:15 PM',
    completedOn: '--',
    duration: 'In Progress (17m)',
    totalDevices: 38,
    matchedCount: 30,
    newCount: 6,
    reviewCount: 2,
    stages: [
      { name: 'Initializing Discovery', status: 'Completed', timestamp: '02:15:01 PM' },
      { name: 'Scanning IP Range', status: 'Completed', timestamp: '02:18:10 PM' },
      { name: 'Identifying Devices', status: 'Completed', timestamp: '02:22:30 PM' },
      { name: 'Collecting Device Details', status: 'Running', timestamp: 'In Progress...' },
      { name: 'Matching with Asset Database', status: 'Pending', timestamp: '--' },
      { name: 'Generating Report', status: 'Pending', timestamp: '--' }
    ]
  },
  {
    id: 'JOB-2026-0010',
    jobName: 'R&D Lab Sweep',
    discoveryType: 'Linux SSH Probe',
    ipRange: '192.168.50.0/24',
    profile: 'Linux SSH Profile',
    schedule: 'Daily at 05:00 PM',
    status: 'Running',
    createdBy: 'Tech Lead',
    createdOn: '09/09/2026, 09:00 AM',
    startedOn: '10/09/2026, 02:20 PM',
    completedOn: '--',
    duration: 'In Progress (12m)',
    totalDevices: 19,
    matchedCount: 15,
    newCount: 3,
    reviewCount: 1,
    stages: [
      { name: 'Initializing Discovery', status: 'Completed', timestamp: '02:20:02 PM' },
      { name: 'Scanning IP Range', status: 'Completed', timestamp: '02:23:45 PM' },
      { name: 'Identifying Devices', status: 'Running', timestamp: 'In Progress...' },
      { name: 'Collecting Device Details', status: 'Pending', timestamp: '--' },
      { name: 'Matching with Asset Database', status: 'Pending', timestamp: '--' },
      { name: 'Generating Report', status: 'Pending', timestamp: '--' }
    ]
  },
  {
    id: 'JOB-2026-0011',
    jobName: 'DMZ External Sweep',
    discoveryType: 'Port Scan & Banner',
    ipRange: '198.51.100.0/28',
    profile: 'Security DMZ Profile',
    schedule: 'Manual / On-Demand',
    status: 'Failed',
    createdBy: 'Security Ops',
    createdOn: '09/09/2026, 05:50 PM',
    startedOn: '09/09/2026, 06:00 PM',
    completedOn: '09/09/2026, 06:02 PM',
    duration: '2m 10s',
    totalDevices: 0,
    matchedCount: 0,
    newCount: 0,
    reviewCount: 0,
    failureReason: 'Connection timeout: Gateway 198.51.100.1 dropped SYN probes. Port 161/443 unreachable.',
    stages: [
      { name: 'Initializing Discovery', status: 'Completed', timestamp: '06:00:01 PM' },
      { name: 'Scanning IP Range', status: 'Failed', timestamp: '06:02:10 PM (Timeout)' },
      { name: 'Identifying Devices', status: 'Skipped', timestamp: '--' },
      { name: 'Collecting Device Details', status: 'Skipped', timestamp: '--' },
      { name: 'Matching with Asset Database', status: 'Skipped', timestamp: '--' },
      { name: 'Generating Report', status: 'Skipped', timestamp: '--' }
    ]
  },
  {
    id: 'JOB-2026-0012',
    jobName: 'Guest WiFi Nightly',
    discoveryType: 'Passive ARP Listening',
    ipRange: '172.20.0.0/22',
    profile: 'Guest Profile',
    schedule: 'Daily at 01:00 AM',
    status: 'Scheduled',
    createdBy: 'Admin User',
    createdOn: '08/09/2026, 03:00 PM',
    startedOn: '--',
    completedOn: '--',
    duration: '--',
    totalDevices: 0,
    matchedCount: 0,
    newCount: 0,
    reviewCount: 0,
    stages: [
      { name: 'Initializing Discovery', status: 'Pending', timestamp: 'Next: 01:00 AM' },
      { name: 'Scanning IP Range', status: 'Pending', timestamp: '--' },
      { name: 'Identifying Devices', status: 'Pending', timestamp: '--' },
      { name: 'Collecting Device Details', status: 'Pending', timestamp: '--' },
      { name: 'Matching with Asset Database', status: 'Pending', timestamp: '--' },
      { name: 'Generating Report', status: 'Pending', timestamp: '--' }
    ]
  }
];

export function DiscoveryJobs({ onNavigateToDevices }) {
  const [jobs, setJobs] = useState(SEED_JOBS);
  const [selectedJobId, setSelectedJobId] = useState('JOB-2026-0001');
  const [activeFilterStatus, setActiveFilterStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [creatorFilter, setCreatorFilter] = useState('All');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  
  // Modals & Action States
  const [isNewJobModalOpen, setIsNewJobModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDiagnosticsOpen, setIsDiagnosticsOpen] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);
  const [isRerunning, setIsRerunning] = useState(false);

  // New Job Form State
  const [newJobForm, setNewJobForm] = useState({
    jobName: '',
    discoveryType: 'IP Range Scan',
    ipRange: '192.168.1.0/24',
    profile: 'Default',
    schedule: 'Manual',
    runImmediately: true
  });

  // Load jobs from API with fallback
  const fetchJobs = async () => {
    try {
      const res = await api.get('/discovery/jobs');
      if (res && res.jobs && res.jobs.length > 0) {
        setJobs(res.jobs);
      }
    } catch (e) {
      console.warn('Using seeded discovery jobs:', e);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  // Filtered Jobs
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      // Status Filter
      if (activeFilterStatus !== 'All' && job.status.toLowerCase() !== activeFilterStatus.toLowerCase()) {
        return false;
      }
      // Type Filter
      if (typeFilter !== 'All' && !job.discoveryType.toLowerCase().includes(typeFilter.toLowerCase())) {
        return false;
      }
      // Creator Filter
      if (creatorFilter !== 'All' && !job.createdBy.toLowerCase().includes(creatorFilter.toLowerCase())) {
        return false;
      }
      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = job.jobName.toLowerCase().includes(q);
        const matchType = job.discoveryType.toLowerCase().includes(q);
        const matchIp = job.ipRange.toLowerCase().includes(q);
        const matchId = job.id.toLowerCase().includes(q);
        if (!matchName && !matchType && !matchIp && !matchId) return false;
      }
      return true;
    });
  }, [jobs, activeFilterStatus, typeFilter, creatorFilter, searchQuery]);

  // Selected Job for bottom panels
  const selectedJob = useMemo(() => {
    const found = jobs.find((j) => j.id === selectedJobId);
    return found || filteredJobs[0] || jobs[0];
  }, [jobs, selectedJobId, filteredJobs]);

  // Stats calculation
  const stats = useMemo(() => {
    const total = jobs.length;
    const completed = jobs.filter((j) => j.status === 'Completed').length;
    const running = jobs.filter((j) => j.status === 'Running').length;
    const failed = jobs.filter((j) => j.status === 'Failed').length;
    const scheduled = jobs.filter((j) => j.status === 'Scheduled').length;
    return { total, completed, running, failed, scheduled };
  }, [jobs]);

  const showNotification = (msg) => {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(null), 4000);
  };

  // Re-run Job
  const handleRerunJob = async (jobId) => {
    setIsRerunning(true);
    showNotification(`Initiating scan execution for job ${jobId}...`);
    try {
      await api.post(`/discovery/jobs/${jobId}/rerun`);
    } catch (err) {
      console.warn('Using local rerun simulation:', err);
    }
    setTimeout(() => {
      setJobs((prev) =>
        prev.map((j) =>
          j.id === jobId
            ? {
                ...j,
                status: 'Running',
                startedOn: 'Just now',
                completedOn: '--',
                duration: 'In Progress',
                stages: [
                  { name: 'Initializing Discovery', status: 'Completed', timestamp: 'Just now' },
                  { name: 'Scanning IP Range', status: 'Running', timestamp: 'In Progress...' },
                  { name: 'Identifying Devices', status: 'Pending', timestamp: '--' },
                  { name: 'Collecting Device Details', status: 'Pending', timestamp: '--' },
                  { name: 'Matching with Asset Database', status: 'Pending', timestamp: '--' },
                  { name: 'Generating Report', status: 'Pending', timestamp: '--' }
                ]
              }
            : j
        )
      );
      setIsRerunning(false);
      showNotification(`Discovery job ${jobId} is now actively running.`);
    }, 1000);
  };

  // Clone Job
  const handleCloneJob = async (jobId) => {
    const source = jobs.find((j) => j.id === jobId);
    if (!source) return;
    const newId = `JOB-2026-${String(jobs.length + 1).padStart(4, '0')}`;
    const cloned = {
      ...source,
      id: newId,
      jobName: `${source.jobName} (Copy)`,
      status: 'Scheduled',
      createdOn: 'Just now',
      startedOn: '--',
      completedOn: '--',
      duration: '--',
      totalDevices: 0,
      matchedCount: 0,
      newCount: 0,
      reviewCount: 0,
      stages: [
        { name: 'Initializing Discovery', status: 'Pending', timestamp: '--' },
        { name: 'Scanning IP Range', status: 'Pending', timestamp: '--' },
        { name: 'Identifying Devices', status: 'Pending', timestamp: '--' },
        { name: 'Collecting Device Details', status: 'Pending', timestamp: '--' },
        { name: 'Matching with Asset Database', status: 'Pending', timestamp: '--' },
        { name: 'Generating Report', status: 'Pending', timestamp: '--' }
      ]
    };
    try {
      await api.post(`/discovery/jobs/${jobId}/clone`);
    } catch (e) {
      console.warn('Using local clone simulation');
    }
    setJobs((prev) => [cloned, ...prev]);
    setSelectedJobId(cloned.id);
    showNotification(`Job cloned successfully as ${cloned.jobName}`);
  };

  // Delete Job
  const handleDeleteJob = async (jobId) => {
    if (!window.confirm(`Are you sure you want to delete discovery job ${jobId}?`)) return;
    try {
      await api.delete(`/discovery/jobs/${jobId}`);
    } catch (e) {
      console.warn('Using local delete simulation');
    }
    setJobs((prev) => prev.filter((j) => j.id !== jobId));
    if (selectedJobId === jobId) {
      const remaining = jobs.filter((j) => j.id !== jobId);
      if (remaining.length > 0) setSelectedJobId(remaining[0].id);
    }
    showNotification(`Discovery job ${jobId} deleted.`);
  };

  // Create New Job Submit
  const handleCreateJobSubmit = async (e) => {
    e.preventDefault();
    if (!newJobForm.jobName.trim()) return;

    const newId = `JOB-2026-${String(jobs.length + 1).padStart(4, '0')}`;
    const created = {
      id: newId,
      jobName: newJobForm.jobName,
      discoveryType: newJobForm.discoveryType,
      ipRange: newJobForm.ipRange,
      profile: newJobForm.profile,
      schedule: newJobForm.schedule,
      status: newJobForm.runImmediately ? 'Running' : 'Scheduled',
      createdBy: 'Current User',
      createdOn: 'Just now',
      startedOn: newJobForm.runImmediately ? 'Just now' : '--',
      completedOn: '--',
      duration: newJobForm.runImmediately ? 'In Progress' : '--',
      totalDevices: 0,
      matchedCount: 0,
      newCount: 0,
      reviewCount: 0,
      stages: [
        { name: 'Initializing Discovery', status: newJobForm.runImmediately ? 'Completed' : 'Pending', timestamp: newJobForm.runImmediately ? 'Just now' : '--' },
        { name: 'Scanning IP Range', status: newJobForm.runImmediately ? 'Running' : 'Pending', timestamp: newJobForm.runImmediately ? 'In Progress...' : '--' },
        { name: 'Identifying Devices', status: 'Pending', timestamp: '--' },
        { name: 'Collecting Device Details', status: 'Pending', timestamp: '--' },
        { name: 'Matching with Asset Database', status: 'Pending', timestamp: '--' },
        { name: 'Generating Report', status: 'Pending', timestamp: '--' }
      ]
    };

    try {
      await api.post('/discovery/jobs', newJobForm);
    } catch (err) {
      console.warn('Local creation fallback');
    }

    setJobs((prev) => [created, ...prev]);
    setSelectedJobId(created.id);
    setIsNewJobModalOpen(false);
    showNotification(`New discovery job "${created.jobName}" created!`);

    // Reset form
    setNewJobForm({
      jobName: '',
      discoveryType: 'IP Range Scan',
      ipRange: '192.168.1.0/24',
      profile: 'Default',
      schedule: 'Manual',
      runImmediately: true
    });
  };

  // Download Report
  const handleDownloadReport = (job) => {
    showNotification(`Generating Discovery Execution Report for ${job.jobName}...`);
    setTimeout(() => {
      const csvContent =
        "data:text/csv;charset=utf-8," +
        `Discovery Job Execution Report\n` +
        `Job ID,${job.id}\n` +
        `Job Name,${job.jobName}\n` +
        `Type,${job.discoveryType}\n` +
        `Target,${job.ipRange}\n` +
        `Profile,${job.profile}\n` +
        `Status,${job.status}\n` +
        `Started On,${job.startedOn}\n` +
        `Completed On,${job.completedOn}\n` +
        `Duration,${job.duration}\n` +
        `Total Devices Found,${job.totalDevices}\n` +
        `Matched Devices,${job.matchedCount}\n` +
        `New Devices,${job.newCount}\n` +
        `Requires Review,${job.reviewCount}\n`;

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `Discovery_Report_${job.id}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showNotification(`Report for ${job.id} downloaded successfully.`);
    }, 600);
  };

  // Status badge styling helper
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Completed
          </span>
        );
      case 'Running':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <RefreshCw className="w-3 h-3 text-blue-600 animate-spin" />
            Running
          </span>
        );
      case 'Failed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            Failed
          </span>
        );
      case 'Scheduled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            Scheduled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {actionMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 bg-slate-900 text-white text-sm rounded-xl shadow-2xl border border-slate-800 animate-in fade-in slide-in-from-top-4 duration-300">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionMessage}</span>
          <button onClick={() => setActionMessage(null)} className="text-slate-400 hover:text-white ml-2">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Header & New Job Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Discovery Jobs</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational workspace to configure, schedule, monitor, and audit network discovery scan jobs.
          </p>
        </div>
        <button
          onClick={() => setIsNewJobModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm hover:shadow transition-all duration-150 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>New Discovery Job</span>
        </button>
      </div>

      {/* Summary KPI Cards Row (5 Cards matching screenshot) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Total Jobs */}
        <div
          onClick={() => setActiveFilterStatus('All')}
          className={`cursor-pointer rounded-xl p-4 border transition-all duration-200 bg-white hover:shadow-md ${
            activeFilterStatus === 'All'
              ? 'border-blue-600 ring-2 ring-blue-100 shadow-sm'
              : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Total Jobs</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{stats.total}</span>
            <span className="text-xs text-slate-400 font-medium">configured</span>
          </div>
        </div>

        {/* Completed */}
        <div
          onClick={() => setActiveFilterStatus('Completed')}
          className={`cursor-pointer rounded-xl p-4 border transition-all duration-200 bg-white hover:shadow-md ${
            activeFilterStatus === 'Completed'
              ? 'border-emerald-600 ring-2 ring-emerald-100 shadow-sm'
              : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Completed</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{stats.completed}</span>
            <span className="text-xs text-emerald-600 font-medium">ready</span>
          </div>
        </div>

        {/* Running */}
        <div
          onClick={() => setActiveFilterStatus('Running')}
          className={`cursor-pointer rounded-xl p-4 border transition-all duration-200 bg-white hover:shadow-md ${
            activeFilterStatus === 'Running'
              ? 'border-blue-600 ring-2 ring-blue-100 shadow-sm'
              : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">Running</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
              <RefreshCw className="w-4 h-4 animate-spin" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{stats.running}</span>
            <span className="text-xs text-blue-600 font-medium">active sweeps</span>
          </div>
        </div>

        {/* Failed */}
        <div
          onClick={() => setActiveFilterStatus('Failed')}
          className={`cursor-pointer rounded-xl p-4 border transition-all duration-200 bg-white hover:shadow-md ${
            activeFilterStatus === 'Failed'
              ? 'border-rose-600 ring-2 ring-rose-100 shadow-sm'
              : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-700 uppercase tracking-wider">Failed</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{stats.failed}</span>
            <span className="text-xs text-rose-600 font-medium">requires action</span>
          </div>
        </div>

        {/* Scheduled */}
        <div
          onClick={() => setActiveFilterStatus('Scheduled')}
          className={`cursor-pointer rounded-xl p-4 border transition-all duration-200 bg-white hover:shadow-md ${
            activeFilterStatus === 'Scheduled'
              ? 'border-amber-600 ring-2 ring-amber-100 shadow-sm'
              : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Scheduled</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{stats.scheduled}</span>
            <span className="text-xs text-amber-600 font-medium">queued</span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 items-center">
          {/* Search Box */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search jobs by name, IP, profile..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50/50 hover:bg-white transition-colors"
            />
          </div>

          {/* Discovery Type */}
          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-2.5 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50 text-slate-700"
            >
              <option value="All">All Discovery Types</option>
              <option value="IP Range">IP Range Scan</option>
              <option value="Subnet Ping">Subnet Ping & SNMP</option>
              <option value="WMI">Agentless WMI</option>
              <option value="SNMP">SNMP Profile Scan</option>
              <option value="Cloud">Cloud VPC Connector</option>
              <option value="ARP">ARP & Ping Sweep</option>
              <option value="SSH">Linux SSH Probe</option>
            </select>
          </div>

          {/* Status Dropdown */}
          <div>
            <select
              value={activeFilterStatus}
              onChange={(e) => setActiveFilterStatus(e.target.value)}
              className="w-full px-2.5 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50 text-slate-700"
            >
              <option value="All">All Statuses</option>
              <option value="Completed">Completed</option>
              <option value="Running">Running</option>
              <option value="Failed">Failed</option>
              <option value="Scheduled">Scheduled</option>
            </select>
          </div>

          {/* Created By Dropdown */}
          <div>
            <select
              value={creatorFilter}
              onChange={(e) => setCreatorFilter(e.target.value)}
              className="w-full px-2.5 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50 text-slate-700"
            >
              <option value="All">All Creators</option>
              <option value="John Doe">John Doe</option>
              <option value="Admin User">Admin User</option>
              <option value="Sarah Connor">Sarah Connor</option>
              <option value="DevOps Team">DevOps Team</option>
              <option value="Security Ops">Security Ops</option>
            </select>
          </div>

          {/* Reset Filters */}
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => {
                setActiveFilterStatus('All');
                setSearchQuery('');
                setTypeFilter('All');
                setCreatorFilter('All');
                setFromDate('');
                setToDate('');
              }}
              className="w-full py-2 px-3 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors text-center"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Main Jobs Data Grid (Matching Screenshot) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto max-h-[480px]">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider sticky top-0 z-10">
              <tr>
                <th className="py-3 px-4">Job Name</th>
                <th className="py-3 px-3">Discovery Type</th>
                <th className="py-3 px-3">IP Range / Target</th>
                <th className="py-3 px-3">Profile</th>
                <th className="py-3 px-3">Schedule</th>
                <th className="py-3 px-3">Started On</th>
                <th className="py-3 px-3">Completed On</th>
                <th className="py-3 px-3 text-center">Devices Found</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3">Created By</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan="11" className="text-center py-12 text-slate-400">
                    No discovery jobs match your active filters.
                  </td>
                </tr>
              ) : (
                filteredJobs.map((job) => {
                  const isSelected = selectedJob?.id === job.id;
                  return (
                    <tr
                      key={job.id}
                      onClick={() => setSelectedJobId(job.id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-blue-50/70 border-l-4 border-l-blue-600 font-medium'
                          : 'hover:bg-slate-50/80'
                      }`}
                    >
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        <div className="flex items-center gap-2">
                          <Network className={`w-3.5 h-3.5 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                          <span>{job.jobName}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-slate-600">{job.discoveryType}</td>
                      <td className="py-3 px-3">
                        <span className="font-mono text-[11px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200">
                          {job.ipRange}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-600">{job.profile}</td>
                      <td className="py-3 px-3 text-slate-600">{job.schedule}</td>
                      <td className="py-3 px-3 text-slate-500 whitespace-nowrap">{job.startedOn || '--'}</td>
                      <td className="py-3 px-3 text-slate-500 whitespace-nowrap">{job.completedOn || '--'}</td>
                      <td className="py-3 px-3 text-center">
                        <span className="inline-flex items-center justify-center font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 text-[11px]">
                          {job.totalDevices}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        {getStatusBadge(job.status)}
                      </td>
                      <td className="py-3 px-3 text-slate-600">{job.createdBy}</td>
                      <td className="py-3 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            title="Re-run Job"
                            onClick={() => handleRerunJob(job.id)}
                            className="p-1 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>
                          <button
                            title="Clone Job"
                            onClick={() => handleCloneJob(job.id)}
                            className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            title="Delete Job"
                            onClick={() => handleDeleteJob(job.id)}
                            className="p-1 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom 3-Panel Split View (Matching Screenshot Exact Visual Layout) */}
      {selectedJob && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Panel 1: Job Details (4 cols) */}
          <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-sm">Job Details - {selectedJob.jobName}</h3>
              </div>
              {getStatusBadge(selectedJob.status)}
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Job ID</span>
                <span className="font-mono font-semibold text-slate-800">{selectedJob.id}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Job Name</span>
                <span className="font-medium text-slate-900">{selectedJob.jobName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Discovery Type</span>
                <span className="text-slate-800">{selectedJob.discoveryType}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">IP Range / Target</span>
                <span className="font-mono text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">{selectedJob.ipRange}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Discovery Profile</span>
                <span className="text-slate-800">{selectedJob.profile}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Schedule</span>
                <span className="text-slate-800">{selectedJob.schedule}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Created By</span>
                <span className="text-slate-800">{selectedJob.createdBy}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Created On</span>
                <span className="text-slate-800">{selectedJob.createdOn}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Started On</span>
                <span className="text-slate-800">{selectedJob.startedOn}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Completed On</span>
                <span className="text-slate-800">{selectedJob.completedOn}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Duration</span>
                <span className="font-semibold text-slate-800">{selectedJob.duration}</span>
              </div>
            </div>

            {/* Breakdown Mini-Cards */}
            <div className="pt-2 border-t border-slate-100">
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2.5">
                Discovery Results Summary
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-100">
                  <div className="text-[10px] text-slate-500 font-medium">Total Found</div>
                  <div className="text-base font-bold text-slate-900 mt-0.5">{selectedJob.totalDevices}</div>
                </div>
                <div className="bg-emerald-50/60 rounded-lg p-2.5 border border-emerald-100">
                  <div className="text-[10px] text-emerald-700 font-medium">Matched (81%)</div>
                  <div className="text-base font-bold text-emerald-700 mt-0.5">{selectedJob.matchedCount}</div>
                </div>
                <div className="bg-blue-50/60 rounded-lg p-2.5 border border-blue-100">
                  <div className="text-[10px] text-blue-700 font-medium">New (13%)</div>
                  <div className="text-base font-bold text-blue-700 mt-0.5">{selectedJob.newCount}</div>
                </div>
                <div className="bg-amber-50/60 rounded-lg p-2.5 border border-amber-100">
                  <div className="text-[10px] text-amber-700 font-medium">Requires Review</div>
                  <div className="text-base font-bold text-amber-700 mt-0.5">{selectedJob.reviewCount}</div>
                </div>
              </div>
            </div>

            {selectedJob.failureReason && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800">
                <div className="font-semibold flex items-center gap-1.5 mb-1 text-rose-900">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Failure Diagnostics
                </div>
                {selectedJob.failureReason}
              </div>
            )}
          </div>

          {/* Panel 2: Discovery Progress (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-sm">Discovery Progress</h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">6 Stages</span>
            </div>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {selectedJob.stages &&
                selectedJob.stages.map((stage, idx) => {
                  const isDone = stage.status === 'Completed';
                  const isRun = stage.status === 'Running';
                  const isFail = stage.status === 'Failed';
                  return (
                    <div key={idx} className="relative flex items-start justify-between gap-3 text-xs">
                      {/* Step Indicator Dot */}
                      <div
                        className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold ${
                          isDone
                            ? 'bg-emerald-500 ring-4 ring-emerald-50'
                            : isRun
                            ? 'bg-blue-600 ring-4 ring-blue-50 animate-pulse'
                            : isFail
                            ? 'bg-rose-500 ring-4 ring-rose-50'
                            : 'bg-slate-300 ring-4 ring-slate-50'
                        }`}
                      >
                        {isDone ? <Check className="w-3 h-3 text-white" /> : isFail ? <X className="w-3 h-3 text-white" /> : idx + 1}
                      </div>

                      <div className="flex-1">
                        <div className="font-semibold text-slate-900">{stage.name}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Stage {idx + 1} of 6 • {stage.status}
                        </div>
                      </div>

                      <div className="text-right">
                        <span
                          className={`font-mono text-[11px] px-2 py-0.5 rounded ${
                            isDone
                              ? 'bg-emerald-50 text-emerald-700 font-medium'
                              : isRun
                              ? 'bg-blue-50 text-blue-700 font-medium animate-pulse'
                              : isFail
                              ? 'bg-rose-50 text-rose-700 font-medium'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {stage.timestamp}
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Panel 3: Job Actions (3 cols) */}
          <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">Job Actions</h3>
              <p className="text-xs text-slate-400 mt-0.5">Operational tasks for {selectedJob.id}</p>
            </div>

            <div className="space-y-2 pt-1">
              {/* Primary CTA: View Discovered Devices */}
              <button
                onClick={() => {
                  if (onNavigateToDevices) {
                    onNavigateToDevices(selectedJob.jobName);
                  } else {
                    showNotification(`Opening discovered devices for job ${selectedJob.jobName}`);
                  }
                }}
                className="w-full flex items-center justify-between px-3.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg shadow-sm transition-all active:scale-95 group"
              >
                <div className="flex items-center gap-2">
                  <ExternalLink className="w-4 h-4 text-blue-200 group-hover:text-white" />
                  <span>View Discovered Devices</span>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-blue-200" />
              </button>

              {/* Download Report */}
              <button
                onClick={() => handleDownloadReport(selectedJob)}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors text-left"
              >
                <Download className="w-4 h-4 text-slate-500" />
                <span>Download Execution Report</span>
              </button>

              {/* Re-run Job */}
              <button
                disabled={isRerunning || selectedJob.status === 'Running'}
                onClick={() => handleRerunJob(selectedJob.id)}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold rounded-lg border transition-colors text-left ${
                  selectedJob.status === 'Running'
                    ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                    : 'text-slate-700 bg-slate-50 hover:bg-slate-100 border-slate-200'
                }`}
              >
                <RefreshCw className={`w-4 h-4 ${isRerunning ? 'animate-spin text-blue-600' : 'text-slate-500'}`} />
                <span>Re-run Discovery Job</span>
              </button>

              {/* Edit Job */}
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors text-left"
              >
                <Edit className="w-4 h-4 text-slate-500" />
                <span>Edit Job Configuration</span>
              </button>

              {/* Clone Job */}
              <button
                onClick={() => handleCloneJob(selectedJob.id)}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors text-left"
              >
                <Copy className="w-4 h-4 text-slate-500" />
                <span>Clone Discovery Job</span>
              </button>

              {/* Delete Job */}
              <button
                onClick={() => handleDeleteJob(selectedJob.id)}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-rose-600 bg-rose-50/50 hover:bg-rose-100/70 border border-rose-200 rounded-lg transition-colors text-left mt-2"
              >
                <Trash2 className="w-4 h-4 text-rose-500" />
                <span>Delete Discovery Job</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Discovery Job Modal */}
      {isNewJobModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <Plus className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-base">New Discovery Job</h3>
              </div>
              <button
                onClick={() => setIsNewJobModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateJobSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Job Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Head Office Floor 3 Subnet Sweep"
                  value={newJobForm.jobName}
                  onChange={(e) => setNewJobForm({ ...newJobForm, jobName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Discovery Method</label>
                  <select
                    value={newJobForm.discoveryType}
                    onChange={(e) => setNewJobForm({ ...newJobForm, discoveryType: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs bg-white"
                  >
                    <option value="IP Range Scan">IP Range Scan</option>
                    <option value="Subnet Ping & SNMP">Subnet Ping & SNMP</option>
                    <option value="Agentless WMI">Agentless WMI</option>
                    <option value="SNMP Profile Scan">SNMP Profile Scan</option>
                    <option value="Cloud VPC Connector">Cloud VPC Connector</option>
                    <option value="Active ARP / Ping">Active ARP / Ping</option>
                    <option value="Linux SSH Probe">Linux SSH Probe</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Discovery Profile</label>
                  <select
                    value={newJobForm.profile}
                    onChange={(e) => setNewJobForm({ ...newJobForm, profile: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs bg-white"
                  >
                    <option value="Default">Default (All Devices)</option>
                    <option value="Server Profile">Server Profile (WMI/SSH)</option>
                    <option value="Cisco & Server Profile">Cisco Catalyst & Switches</option>
                    <option value="Wireless AP Profile">Wireless Access Points</option>
                    <option value="IoT Devices Profile">IoT & Surveillance Profile</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target IP Range / Subnet *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 192.168.1.0/24 or 10.0.0.1 - 10.0.0.254"
                  value={newJobForm.ipRange}
                  onChange={(e) => setNewJobForm({ ...newJobForm, ipRange: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Schedule Frequency</label>
                <select
                  value={newJobForm.schedule}
                  onChange={(e) => setNewJobForm({ ...newJobForm, schedule: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs bg-white"
                >
                  <option value="Manual">Manual / On-Demand</option>
                  <option value="Daily at 02:00 AM">Daily at 02:00 AM</option>
                  <option value="Weekly (Sun 01:00 AM)">Weekly (Sun 01:00 AM)</option>
                  <option value="Monthly (1st of month)">Monthly (1st of month)</option>
                </select>
              </div>

              <div className="flex items-center gap-2.5 p-3 bg-blue-50/70 border border-blue-100 rounded-lg">
                <input
                  type="checkbox"
                  id="runNow"
                  checked={newJobForm.runImmediately}
                  onChange={(e) => setNewJobForm({ ...newJobForm, runImmediately: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
                <label htmlFor="runNow" className="text-xs font-semibold text-blue-900 cursor-pointer">
                  Execute scan immediately upon creation
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewJobModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  Create Discovery Job
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Job Modal */}
      {isEditModalOpen && selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <Edit className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-base">Edit Job: {selectedJob.id}</h3>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                showNotification(`Job ${selectedJob.id} configuration updated.`);
                setIsEditModalOpen(false);
              }}
              className="p-6 space-y-4 text-xs"
            >
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Job Name</label>
                <input
                  type="text"
                  defaultValue={selectedJob.jobName}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">IP Range / Target</label>
                <input
                  type="text"
                  defaultValue={selectedJob.ipRange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Schedule</label>
                <input
                  type="text"
                  defaultValue={selectedJob.schedule}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
