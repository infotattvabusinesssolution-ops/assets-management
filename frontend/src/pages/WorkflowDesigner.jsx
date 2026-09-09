import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../services/api';
import {
  GitPullRequest,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  Search,
  Filter,
  Plus,
  ShieldAlert,
  Users,
  Check,
  AlertCircle,
  ArrowRight,
  ChevronRight,
  Eye,
  Settings,
  DollarSign,
  Layers,
  Lock,
  FileText,
  Trash2,
  Power
} from 'lucide-react';

const TRANSACTION_TYPES = [
  'ASSET_REQUEST',
  'CAPITALIZATION',
  'TRANSFER',
  'INTER_COMPANY_TRANSFER',
  'DISPOSAL',
  'WRITE_OFF'
];

const AVAILABLE_ROLES = [
  { code: 'DEPT_HEAD', label: 'Department Head (DEPT_HEAD)' },
  { code: 'FINANCE_DIR', label: 'Finance Controller / Director (FINANCE_DIR)' },
  { code: 'CFO', label: 'Chief Financial Officer (CFO)' },
  { code: 'SITE_MANAGER', label: 'Site Facilities Manager (SITE_MANAGER)' },
  { code: 'ASSET_MANAGER', label: 'Asset Custody Manager (ASSET_MANAGER)' },
  { code: 'ADMIN', label: 'System Administrator (ADMIN)' }
];

export function WorkflowDesigner() {
  const [activeTab, setActiveTab] = useState('approvals'); // 'approvals' or 'definitions'
  
  // Data state
  const [pending, setPending] = useState([]);
  const [history, setHistory] = useState([]);
  const [definitions, setDefinitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('PENDING'); // PENDING, APPROVED, REJECTED, ALL

  // Active User Info (from localStorage or JWT)
  const currentUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('fams_user')) || {};
    } catch (e) { return {}; }
  }, []);

  // Modal States
  const [selectedInstance, setSelectedInstance] = useState(null); // Details Drawer
  const [actionModal, setActionModal] = useState(null); // { type: 'APPROVE' | 'REJECT', instance: obj }
  const [rejectionComment, setRejectionComment] = useState('');
  const [actionSubmitting, setActionSubmitting] = useState(false);

  // Definition Builder Form Modal State
  const [showDefModal, setShowDefModal] = useState(false);
  const [defForm, setDefForm] = useState({
    name: '',
    transactionType: 'DISPOSAL',
    valueThreshold: 10000,
    steps: [
      { stepNumber: 1, name: 'Department Head Approval', approverRoleCode: 'DEPT_HEAD', slaHours: 48 },
      { stepNumber: 2, name: 'Finance Controller Approval', approverRoleCode: 'FINANCE_DIR', slaHours: 48 },
      { stepNumber: 3, name: 'CFO Final Sign-Off', approverRoleCode: 'CFO', slaHours: 24 }
    ]
  });
  const [defSubmitting, setDefSubmitting] = useState(false);
  const [defError, setDefError] = useState('');

  // Fetch all workflow data
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [defsRes, pendingRes, histRes] = await Promise.all([
        api.get('/workflows/definitions').catch(() => ({ success: false })),
        api.get('/workflows/pending').catch(() => ({ success: false })),
        api.get('/workflows/history').catch(() => ({ success: false }))
      ]);

      if (defsRes.success && Array.isArray(defsRes.definitions)) {
        setDefinitions(defsRes.definitions);
      }
      if (pendingRes.success && Array.isArray(pendingRes.instances)) {
        setPending(pendingRes.instances);
      }
      if (histRes.success && Array.isArray(histRes.instances)) {
        setHistory(histRes.instances);
      }
    } catch (err) {
      setError('Failed to fetch approval workflow data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Calculate SLA Status for an instance
  const getSlaStatus = (instance) => {
    if (!instance || instance.status !== 'PENDING') return null;
    const currentStep = instance.workflowDefinitionId?.steps?.find(s => s.stepNumber === instance.currentStepNumber);
    const slaHours = currentStep?.slaHours || 48;
    const createdAt = new Date(instance.createdAt || Date.now());
    const hoursElapsed = (new Date() - createdAt) / (1000 * 60 * 60);
    const hoursRemaining = slaHours - hoursElapsed;

    if (hoursRemaining < 0) {
      return { label: `${Math.abs(Math.round(hoursRemaining))}h Overdue`, status: 'OVERDUE', color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' };
    } else if (hoursRemaining <= 12) {
      return { label: `${Math.round(hoursRemaining)}h Remaining`, status: 'DUE_SOON', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' };
    }
    return { label: `${Math.round(hoursRemaining)}h Remaining`, status: 'HEALTHY', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' };
  };

  // Process combined queue & history based on filters
  const allInstances = useMemo(() => {
    let combined = [];
    if (statusFilter === 'PENDING') combined = pending;
    else if (statusFilter === 'ALL') combined = [...pending, ...history];
    else combined = history.filter(h => h.status === statusFilter);

    return combined.filter(inst => {
      const matchType = typeFilter === 'ALL' || inst.workflowDefinitionId?.transactionType === typeFilter || inst.entityType === typeFilter;
      
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = q === '' ||
        (inst._id && inst._id.toLowerCase().includes(q)) ||
        (inst.workflowDefinitionId?.name && inst.workflowDefinitionId.name.toLowerCase().includes(q)) ||
        (inst.requestedBy?.username && inst.requestedBy.username.toLowerCase().includes(q)) ||
        (inst.entityDetails?.assetId && inst.entityDetails.assetId.toLowerCase().includes(q)) ||
        (inst.entityDetails?.description && inst.entityDetails.description.toLowerCase().includes(q));

      return matchType && matchSearch;
    });
  }, [pending, history, statusFilter, typeFilter, searchQuery]);

  // Derived KPI Counts
  const kpiStats = useMemo(() => {
    const totalPending = pending.length;
    const myPending = pending.filter(p => p.requestedBy?._id !== currentUser?._id).length;
    const approvedCount = history.filter(h => h.status === 'APPROVED').length;
    const rejectedCount = history.filter(h => h.status === 'REJECTED').length;
    const activeDefs = definitions.filter(d => d.active !== false).length;
    const slaOverdue = pending.filter(p => getSlaStatus(p)?.status === 'OVERDUE').length;

    return { totalPending, myPending, approvedCount, rejectedCount, activeDefs, slaOverdue };
  }, [pending, history, definitions, currentUser]);

  // Handle Approve / Reject Action Submission
  const handleExecuteAction = async () => {
    if (!actionModal) return;
    const { type, instance } = actionModal;

    if (type === 'REJECT' && !rejectionComment.trim()) {
      alert('Please enter a rejection comment explaining why this request is being rejected.');
      return;
    }

    setActionSubmitting(true);
    try {
      const res = await api.post(`/workflows/approve/${instance._id}`, {
        decision: type,
        comments: type === 'REJECT' ? rejectionComment : 'Approved via enterprise governance console.'
      });

      if (res.success) {
        setActionModal(null);
        setRejectionComment('');
        setSelectedInstance(null);
        fetchData();
      } else {
        alert(res.message || 'Unable to process approval.');
      }
    } catch (err) {
      alert(err?.message || 'Approval action failed. The workflow may have already been updated by another approver.');
    } finally {
      setActionSubmitting(false);
    }
  };

  // Definition Status Toggle
  const handleToggleDef = async (defId) => {
    try {
      const res = await api.patch(`/workflows/definitions/${defId}/toggle`);
      if (res.success) fetchData();
    } catch (err) { alert('Failed to toggle workflow definition status.'); }
  };

  // Definition Builder Form Handlers
  const handleAddStep = () => {
    const nextNum = defForm.steps.length + 1;
    setDefForm({
      ...defForm,
      steps: [
        ...defForm.steps,
        { stepNumber: nextNum, name: `Tier ${nextNum} Approval`, approverRoleCode: 'FINANCE_DIR', slaHours: 48 }
      ]
    });
  };

  const handleRemoveStep = (index) => {
    if (defForm.steps.length <= 1) {
      alert('A workflow definition must contain at least one approval step.');
      return;
    }
    const updated = defForm.steps.filter((_, i) => i !== index).map((s, idx) => ({ ...s, stepNumber: idx + 1 }));
    setDefForm({ ...defForm, steps: updated });
  };

  const handleSaveDefinition = async (e) => {
    e.preventDefault();
    setDefError('');

    if (!defForm.name.trim()) return setDefError('Workflow definition name is required.');
    if (!defForm.transactionType) return setDefError('Transaction type must be selected.');
    if (defForm.steps.length === 0) return setDefError('At least one approval step is required.');

    for (let i = 0; i < defForm.steps.length; i++) {
      const s = defForm.steps[i];
      if (!s.name.trim()) return setDefError(`Step ${i + 1} name is required.`);
      if (!s.approverRoleCode) return setDefError(`Step ${i + 1} role code is required.`);
      if (!s.slaHours || s.slaHours <= 0) return setDefError(`Step ${i + 1} SLA hours must be a positive number.`);
    }

    setDefSubmitting(true);
    try {
      const res = await api.post('/workflows/definitions', defForm);
      if (res.success) {
        setShowDefModal(false);
        fetchData();
      } else {
        setDefError(res.message || 'Failed to save workflow definition.');
      }
    } catch (err) {
      setDefError(err?.message || 'Error saving workflow definition.');
    } finally {
      setDefSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Section */}
      <div className="bg-white border-b border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-brand-50 text-brand-600 rounded-xl border border-brand-100">
              <GitPullRequest className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                Approval Workflows & Governance
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <ShieldAlert className="w-3.5 h-3.5" /> Enterprise RBAC Enforced
                </span>
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage multi-tier sequential approval definitions and resolve pending request queues.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium flex items-center gap-2 border border-slate-200 transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-brand-600' : ''}`} /> Refresh Queue
            </button>
            {activeTab === 'definitions' && (
              <button
                onClick={() => setShowDefModal(true)}
                className="bg-brand-600 hover:bg-brand-700 text-white px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4" /> New Definition
              </button>
            )}
          </div>
        </div>
      </div>

      {/* KPI Cards Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Pending My Role</div>
          <div className="text-xl font-bold text-amber-600 mt-1">{kpiStats.myPending}</div>
          <div className="text-[10px] text-slate-500 mt-1">Requires Action</div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Total Pending</div>
          <div className="text-xl font-bold text-slate-900 mt-1">{kpiStats.totalPending}</div>
          <div className="text-[10px] text-brand-600 font-medium mt-1">Active Workflows</div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Approved</div>
          <div className="text-xl font-bold text-emerald-600 mt-1">{kpiStats.approvedCount}</div>
          <div className="text-[10px] text-slate-500 mt-1">Completed History</div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Rejected</div>
          <div className="text-xl font-bold text-rose-600 mt-1">{kpiStats.rejectedCount}</div>
          <div className="text-[10px] text-slate-500 mt-1">Declined Requests</div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Active Definitions</div>
          <div className="text-xl font-bold text-cyan-600 mt-1">{kpiStats.activeDefs}</div>
          <div className="text-[10px] text-slate-500 mt-1">Rules Configured</div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
          <div className="text-xs text-slate-500 font-medium">SLA At Risk / Overdue</div>
          <div className="text-xl font-bold text-rose-600 mt-1">{kpiStats.slaOverdue}</div>
          <div className="text-[10px] text-rose-600 mt-1 font-medium">Urgent Action Required</div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center border-b border-slate-200 gap-2">
        <button
          onClick={() => setActiveTab('approvals')}
          className={`px-5 py-2.5 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'approvals'
              ? 'border-brand-600 text-brand-600 bg-brand-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4" /> My Approval Queue & History
          {kpiStats.totalPending > 0 && (
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 text-amber-800">
              {kpiStats.totalPending}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('definitions')}
          className={`px-5 py-2.5 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'definitions'
              ? 'border-brand-600 text-brand-600 bg-brand-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Settings className="w-4 h-4" /> Workflow Definitions & Rules ({definitions.length})
        </button>
      </div>

      {/* TAB 1: MY APPROVAL QUEUE & HISTORY */}
      {activeTab === 'approvals' && (
        <div className="space-y-4">
          {/* Queue Filter Controls */}
          <div className="bg-white border border-slate-200 p-4 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search asset, instance ID, requester..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <select
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none"
              >
                <option value="ALL">All Transaction Types</option>
                {TRANSACTION_TYPES.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none"
              >
                <option value="PENDING">Pending Requests</option>
                <option value="APPROVED">Approved History</option>
                <option value="REJECTED">Rejected History</option>
                <option value="ALL">All Workflow History</option>
              </select>
            </div>
          </div>

          {/* Queue Table */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            {loading ? (
              <div className="p-12 text-center text-slate-500 space-y-3">
                <RefreshCw className="w-8 h-8 text-brand-600 animate-spin mx-auto" />
                <div className="text-xs font-medium">Fetching active approval queue from server...</div>
              </div>
            ) : allInstances.length === 0 ? (
              <div className="p-12 text-center text-slate-400 space-y-3">
                <GitPullRequest className="w-10 h-10 text-slate-300 mx-auto" />
                <div className="text-sm font-medium text-slate-700">No approval workflow requests found</div>
                <p className="text-xs text-slate-500">There are currently no requests matching your filter criteria.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <tbody className="divide-y divide-slate-100">
                    <tr className="bg-slate-50 text-slate-600 uppercase text-[10px] font-semibold tracking-wider border-b border-slate-200">
                      <th className="px-4 py-3">Workflow ID / Entity</th>
                      <th className="px-4 py-3">Transaction Type</th>
                      <th className="px-4 py-3">Requested By</th>
                      <th className="px-4 py-3">Approval Step</th>
                      <th className="px-4 py-3">SLA Status</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>

                    {allInstances.map((inst) => {
                      const sla = getSlaStatus(inst);
                      const isSelf = inst.requestedBy?._id === currentUser?._id;
                      const maxSteps = inst.workflowDefinitionId?.steps?.length || 1;
                      const currentStepObj = inst.workflowDefinitionId?.steps?.find(s => s.stepNumber === inst.currentStepNumber);

                      return (
                        <tr key={inst._id} className="hover:bg-slate-50 transition-colors">
                          {/* Workflow & Asset Info */}
                          <td className="px-4 py-3">
                            <div className="font-semibold text-slate-900">{inst.workflowDefinitionId?.name || 'Approval Request'}</div>
                            <div className="text-[11px] font-mono text-brand-600 mt-0.5 flex items-center gap-1.5">
                              <span>ID: #{String(inst._id).slice(-6)}</span>
                              {inst.entityDetails?.assetId && (
                                <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200">
                                  Asset: {inst.entityDetails.assetId} ({inst.entityDetails.description})
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Transaction Type */}
                          <td className="px-4 py-3">
                            <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                              {inst.workflowDefinitionId?.transactionType || inst.entityType}
                            </span>
                          </td>

                          {/* Requested By */}
                          <td className="px-4 py-3">
                            <div className="font-medium text-slate-900">
                              {inst.requestedBy?.firstName
                                ? `${inst.requestedBy.firstName} ${inst.requestedBy.lastName || ''}`
                                : (inst.requestedBy?.username || 'System User')}
                            </div>
                            <div className="text-[10px] text-slate-500">
                              {inst.createdAt ? new Date(inst.createdAt).toLocaleDateString() : ''}
                            </div>
                          </td>

                          {/* Approval Step */}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5 font-medium text-slate-800">
                              <span>Step {inst.currentStepNumber} of {maxSteps}</span>
                            </div>
                            <div className="text-[10px] text-amber-700 font-mono mt-0.5 font-semibold">
                              Role: {currentStepObj?.approverRoleCode || 'APPROVER'}
                            </div>
                          </td>

                          {/* SLA Status */}
                          <td className="px-4 py-3">
                            {sla ? (
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium border ${sla.color}`}>
                                <Clock className="w-3 h-3" /> {sla.label}
                              </span>
                            ) : (
                              <span className="text-slate-400 text-[11px]">-</span>
                            )}
                          </td>

                          {/* Status Badge */}
                          <td className="px-4 py-3">
                            {inst.status === 'PENDING' && (
                              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                                PENDING
                              </span>
                            )}
                            {inst.status === 'APPROVED' && (
                              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                APPROVED
                              </span>
                            )}
                            {inst.status === 'REJECTED' && (
                              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                                REJECTED
                              </span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setSelectedInstance(inst)}
                                className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium flex items-center gap-1 border border-slate-200 transition-all"
                              >
                                <Eye className="w-3.5 h-3.5" /> Details
                              </button>

                              {inst.status === 'PENDING' && (
                                <>
                                  <button
                                    onClick={() => setActionModal({ type: 'REJECT', instance: inst })}
                                    disabled={isSelf}
                                    title={isSelf ? 'Self-approval restriction' : 'Reject Request'}
                                    className="px-2.5 py-1 rounded bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white text-xs font-medium border border-rose-200 transition-all disabled:opacity-40"
                                  >
                                    Reject
                                  </button>
                                  <button
                                    onClick={() => setActionModal({ type: 'APPROVE', instance: inst })}
                                    disabled={isSelf}
                                    title={isSelf ? 'Self-approval restriction' : 'Approve Request'}
                                    className="px-2.5 py-1 rounded bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition-all disabled:opacity-40 flex items-center gap-1 shadow-xs"
                                  >
                                    <Check className="w-3.5 h-3.5" /> Approve
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: WORKFLOW DEFINITIONS & RULES */}
      {activeTab === 'definitions' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {definitions.map((def) => (
              <div
                key={def._id}
                className="bg-white border border-slate-200 p-5 rounded-xl space-y-4 hover:border-brand-300 transition-all shadow-xs"
              >
                {/* Definition Header */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-semibold text-slate-900">{def.name}</h3>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-50 text-brand-700 border border-brand-200">
                        {def.transactionType}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Min Value Threshold: <span className="text-emerald-700 font-mono font-semibold">${Number(def.valueThreshold || 0).toLocaleString()}</span>
                    </p>
                  </div>

                  <button
                    onClick={() => handleToggleDef(def._id)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1 border transition-all ${
                      def.active !== false
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-slate-100 text-slate-500 border-slate-200'
                    }`}
                  >
                    <Power className="w-3 h-3" /> {def.active !== false ? 'Active' : 'Disabled'}
                  </button>
                </div>

                {/* Visual Sequential Stepper */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Sequential Approval Chain ({def.steps?.length || 0} Tiers)
                  </div>

                  <div className="space-y-2">
                    {def.steps?.map((step, idx) => (
                      <div key={idx} className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                        <div className="w-6 h-6 rounded-full bg-brand-100 border border-brand-200 text-brand-700 font-bold text-xs flex items-center justify-center shrink-0">
                          {step.stepNumber}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold text-slate-800 truncate">{step.name}</div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            Role: <span className="text-brand-700 font-semibold">{step.approverRoleCode}</span> • SLA: {step.slaHours || 48}h
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {definitions.length === 0 && !loading && (
            <div className="bg-white border border-slate-200 p-12 text-center text-slate-500 rounded-xl space-y-3 shadow-xs">
              <Settings className="w-10 h-10 text-slate-300 mx-auto" />
              <div className="text-sm font-medium text-slate-700">No workflow definitions configured</div>
              <p className="text-xs text-slate-500">Click "New Definition" to create your first multi-tier approval template.</p>
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: WORKFLOW DETAILS DRAWER */}
      {selectedInstance && (
        <div className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6 border border-slate-200 rounded-2xl shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  {selectedInstance.workflowDefinitionId?.name || 'Approval Request Details'}
                  {selectedInstance.status === 'PENDING' && <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">PENDING</span>}
                  {selectedInstance.status === 'APPROVED' && <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">APPROVED</span>}
                  {selectedInstance.status === 'REJECTED' && <span className="px-2 py-0.5 rounded text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">REJECTED</span>}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 font-mono">
                  Instance ID: #{selectedInstance._id}
                </p>
              </div>
              <button
                onClick={() => setSelectedInstance(null)}
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800"
              >
                ✕
              </button>
            </div>

            {/* Request Summary & Entity Information */}
            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-500 block">Transaction Type</span>
                <span className="font-semibold text-slate-900">{selectedInstance.workflowDefinitionId?.transactionType || selectedInstance.entityType}</span>
              </div>

              <div>
                <span className="text-slate-500 block">Requested By</span>
                <span className="font-semibold text-slate-900">
                  {selectedInstance.requestedBy?.firstName ? `${selectedInstance.requestedBy.firstName} ${selectedInstance.requestedBy.lastName || ''}` : selectedInstance.requestedBy?.username}
                </span>
              </div>

              {selectedInstance.entityDetails && (
                <>
                  <div>
                    <span className="text-slate-500 block">Target Asset ID</span>
                    <span className="font-mono font-bold text-brand-600">{selectedInstance.entityDetails.assetId}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Asset Description</span>
                    <span className="font-semibold text-slate-900">{selectedInstance.entityDetails.description}</span>
                  </div>
                </>
              )}
            </div>

            {/* Visual Step Progress Stepper */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Approval Progress Stepper</h4>
              <div className="space-y-2">
                {selectedInstance.workflowDefinitionId?.steps?.map((step) => {
                  const isCompleted = step.stepNumber < selectedInstance.currentStepNumber || selectedInstance.status === 'APPROVED';
                  const isCurrent = step.stepNumber === selectedInstance.currentStepNumber && selectedInstance.status === 'PENDING';
                  const isRejected = selectedInstance.status === 'REJECTED' && step.stepNumber === selectedInstance.currentStepNumber;

                  let stepColor = 'bg-slate-50 border-slate-200 text-slate-500';
                  if (isCompleted) stepColor = 'bg-emerald-50 border-emerald-200 text-emerald-800';
                  if (isCurrent) stepColor = 'bg-amber-50 border-amber-200 text-amber-800';
                  if (isRejected) stepColor = 'bg-rose-50 border-rose-200 text-rose-800';

                  return (
                    <div key={step.stepNumber} className={`p-3 rounded-lg border flex items-center justify-between text-xs ${stepColor}`}>
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs bg-slate-200 text-slate-700">
                          {isCompleted ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : step.stepNumber}
                        </div>
                        <div>
                          <div className="font-semibold">{step.name}</div>
                          <div className="text-[10px] opacity-80 font-mono">Role: {step.approverRoleCode} • SLA: {step.slaHours}h</div>
                        </div>
                      </div>

                      <span className="text-[11px] font-bold">
                        {isCompleted && '✓ Completed'}
                        {isCurrent && '● Active Step'}
                        {isRejected && '✕ Rejected'}
                        {!isCompleted && !isCurrent && !isRejected && '○ Pending'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Audit Trail Section */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Immutable Audit Trail (ApprovalAction)</h4>
              {selectedInstance.actions && selectedInstance.actions.length > 0 ? (
                <div className="space-y-2">
                  {selectedInstance.actions.map((act, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-900">
                          Step {act.stepNumber} • {act.approverId?.firstName ? `${act.approverId.firstName} ${act.approverId.lastName || ''}` : act.approverId?.username}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${act.decision === 'APPROVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                          {act.decision}
                        </span>
                      </div>
                      {act.comments && <p className="text-slate-600 text-[11px] italic">"{act.comments}"</p>}
                      <div className="text-[10px] text-slate-400">{new Date(act.timestamp).toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No approval actions logged yet.</p>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button onClick={() => setSelectedInstance(null)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium">
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: CONFIRM APPROVE / REJECT ACTION DIALOG */}
      {actionModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full p-6 space-y-4 border border-slate-200 rounded-2xl shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              {actionModal.type === 'APPROVE' ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-brand-600" /> Confirm Step Approval
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-rose-600" /> Reject Request
                </>
              )}
            </h3>

            <p className="text-xs text-slate-600 leading-relaxed">
              {actionModal.type === 'APPROVE'
                ? `Are you sure you want to approve Step ${actionModal.instance.currentStepNumber} for request #${String(actionModal.instance._id).slice(-6)}?`
                : `Are you sure you want to reject request #${String(actionModal.instance._id).slice(-6)}? This will halt the workflow.`}
            </p>

            {actionModal.type === 'REJECT' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Rejection Reason (Required)
                </label>
                <textarea
                  rows={3}
                  placeholder="Enter detailed reason for rejecting this request..."
                  value={rejectionComment}
                  onChange={e => setRejectionComment(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:border-rose-500"
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => { setActionModal(null); setRejectionComment(''); }}
                disabled={actionSubmitting}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteAction}
                disabled={actionSubmitting}
                className={`text-xs font-bold px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
                  actionModal.type === 'APPROVE' ? 'bg-brand-600 hover:bg-brand-700 text-white shadow-xs' : 'bg-rose-600 hover:bg-rose-700 text-white'
                }`}
              >
                {actionSubmitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                {actionModal.type === 'APPROVE' ? 'Confirm Approval' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: WORKFLOW DEFINITION BUILDER */}
      {showDefModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 border border-slate-200 rounded-2xl shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Settings className="w-5 h-5 text-brand-600" /> Create / Update Workflow Definition
              </h3>
              <button onClick={() => setShowDefModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            {defError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{defError}</span>
              </div>
            )}

            <form onSubmit={handleSaveDefinition} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Workflow Name</label>
                <input
                  type="text"
                  placeholder="e.g. Asset Disposal Approval Rule"
                  value={defForm.name}
                  onChange={e => setDefForm({ ...defForm, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Transaction Type</label>
                  <select
                    value={defForm.transactionType}
                    onChange={e => setDefForm({ ...defForm, transactionType: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none"
                  >
                    {TRANSACTION_TYPES.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Min Value Threshold ($ / ₹)</label>
                  <input
                    type="number"
                    placeholder="10000"
                    value={defForm.valueThreshold}
                    onChange={e => setDefForm({ ...defForm, valueThreshold: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none"
                  />
                </div>
              </div>

              {/* Sequential Steps Builder */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-700 uppercase tracking-wider text-[11px]">Approval Tiers Configuration</span>
                  <button
                    type="button"
                    onClick={handleAddStep}
                    className="text-brand-600 hover:text-brand-700 font-semibold text-xs flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Tier Step
                  </button>
                </div>

                <div className="space-y-3">
                  {defForm.steps.map((step, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-brand-600">Step {step.stepNumber}</span>
                        {defForm.steps.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveStep(idx)}
                            className="text-rose-600 hover:text-rose-700 text-xs font-semibold"
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div>
                          <label className="block text-[10px] text-slate-500 mb-0.5">Step Name</label>
                          <input
                            type="text"
                            value={step.name}
                            onChange={e => {
                              const updated = [...defForm.steps];
                              updated[idx].name = e.target.value;
                              setDefForm({ ...defForm, steps: updated });
                            }}
                            className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-slate-800"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] text-slate-500 mb-0.5">Required Approver Role</label>
                          <select
                            value={step.approverRoleCode}
                            onChange={e => {
                              const updated = [...defForm.steps];
                              updated[idx].approverRoleCode = e.target.value;
                              setDefForm({ ...defForm, steps: updated });
                            }}
                            className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-slate-800"
                          >
                            {AVAILABLE_ROLES.map(r => (
                              <option key={r.code} value={r.code}>{r.label}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] text-slate-500 mb-0.5">SLA Hours</label>
                          <input
                            type="number"
                            value={step.slaHours}
                            onChange={e => {
                              const updated = [...defForm.steps];
                              updated[idx].slaHours = Number(e.target.value);
                              setDefForm({ ...defForm, steps: updated });
                            }}
                            className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-slate-800"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setShowDefModal(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium">
                  Cancel
                </button>
                <button type="submit" disabled={defSubmitting} className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors">
                  {defSubmitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  Save Workflow Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
