import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import {
  ClipboardCheck,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Clock,
  Play,
  CheckSquare,
  FileText,
  Users,
  Layers,
  Calendar,
  Building,
  ShieldCheck,
  AlertTriangle,
  Printer,
  ChevronRight,
  Download,
  X,
  ExternalLink,
  Edit,
  RotateCcw,
  RefreshCw
} from 'lucide-react';

export default function AuditManagement() {
  const navigate = useNavigate();

  // State
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAudit, setSelectedAudit] = useState(null);
  const [activeLowerTab, setActiveLowerTab] = useState('SCOPE'); // 'SCOPE' | 'USERS' | 'EXPECTED' | 'SCHEDULE' | 'APPROVALS' | 'EXCEPTIONS' | 'ATTACHMENTS' | 'NOTES'
  const [toast, setToast] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [companyFilter, setCompanyFilter] = useState('ALL');

  // Modals
  const [showReportModal, setShowReportModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    fetchAudits();
  }, []);

  const fetchAudits = async () => {
    try {
      setLoading(true);
      const res = await api.get('/stocktakes/audits');
      if (res.success && res.audits) {
        setAudits(res.audits);
        if (!selectedAudit && res.audits.length > 0) {
          // Select AUD-2026-0008 or the first one
          const defaultSelect = res.audits.find(a => a.auditId === 'AUD-2026-0008') || res.audits[0];
          setSelectedAudit(defaultSelect);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch audits:', err);
    } finally {
      setLoading(false);
    }
  };

  // Status Action Handler
  const handleAuditAction = async (action, params = {}) => {
    if (!selectedAudit) return;
    try {
      setActionLoading(true);
      const res = await api.put(`/stocktakes/audits/${selectedAudit.id}/status`, {
        action,
        ...params
      });
      showToast(`Audit status transitioned to ${res.audit.status}`);
      setSelectedAudit(res.audit);
      fetchAudits();
    } catch (err) {
      showToast(err.message || 'Status action failed.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Filtered List
  const filteredAudits = audits.filter(a => {
    const matchesSearch = !search ||
      a.auditId.toLowerCase().includes(search.toLowerCase()) ||
      a.auditName.toLowerCase().includes(search.toLowerCase()) ||
      a.description?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || a.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesType = typeFilter === 'ALL' || a.auditType.toLowerCase() === typeFilter.toLowerCase();
    const matchesCompany = companyFilter === 'ALL' || a.company.toLowerCase() === companyFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesType && matchesCompany;
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-16 text-slate-800">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-xl border flex items-center gap-3 transition-all ${
          toast.type === 'error' ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
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
              <span>Verification & Audit</span>
              <span>›</span>
              <span className="text-gray-800 font-semibold">Audit Management</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Audit Management</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Plan, schedule, scope, approve and monitor physical asset verification campaigns
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/stocktakes/execution')}
              className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-1.5 transition-colors"
            >
              <ClipboardCheck className="w-3.5 h-3.5 text-[#6C2BD9]" /> Go to Audit Execution
            </button>
            <button
              onClick={() => navigate('/stocktakes/create')}
              className="px-4 py-2 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white rounded-lg text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" /> Create Audit
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1700px] mx-auto px-6 py-6 space-y-6">
        
        {/* Top Filters & Search Bar */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            <div className="relative min-w-[260px]">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by Audit ID, Name, Ref..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-[#6C2BD9]"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg p-2 text-xs outline-none bg-white font-medium"
            >
              <option value="ALL">All Statuses</option>
              <option value="Draft">Draft</option>
              <option value="Pending Approval">Pending Approval</option>
              <option value="Approved">Approved</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Closed">Closed</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="border border-gray-300 rounded-lg p-2 text-xs outline-none bg-white font-medium"
            >
              <option value="ALL">All Audit Types</option>
              <option value="Physical Verification">Physical Verification</option>
              <option value="Full Census">Full Census</option>
              <option value="Cycle Count">Cycle Count</option>
              <option value="Sample Count">Sample Count</option>
            </select>

            <select
              value={companyFilter}
              onChange={(e) => setCompanyFilter(e.target.value)}
              className="border border-gray-300 rounded-lg p-2 text-xs outline-none bg-white font-medium"
            >
              <option value="ALL">All Companies/Entities</option>
              <option value="Dubai HQ">Dubai HQ</option>
              <option value="Abu Dhabi Branch">Abu Dhabi Branch</option>
            </select>
          </div>

          <button
            onClick={fetchAudits}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600"
            title="Refresh list"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Middle Section: Main Audit List Table (70%) + Audit Details Panel (30%) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Main Audit List Table */}
          <div className="lg:col-span-8 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-sm font-bold text-gray-900">
                Verification Campaigns ({filteredAudits.length})
              </h2>
              <span className="text-[11px] text-gray-400">Click any row to view complete scope and controls</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#FAF5FF] border-b border-purple-100 text-gray-700">
                    <th className="p-3 font-semibold">Audit ID</th>
                    <th className="p-3 font-semibold">Audit Name</th>
                    <th className="p-3 font-semibold">Type</th>
                    <th className="p-3 font-semibold">Entity</th>
                    <th className="p-3 font-semibold">Location</th>
                    <th className="p-3 font-semibold">Timeline</th>
                    <th className="p-3 font-semibold">Status</th>
                    <th className="p-3 font-semibold">Progress</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-600">
                  {filteredAudits.map((a) => {
                    const isSelected = selectedAudit?.id === a.id;
                    return (
                      <tr
                        key={a.id}
                        onClick={() => setSelectedAudit(a)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'bg-purple-50/70 border-l-4 border-l-[#6C2BD9]' : 'hover:bg-gray-50'
                        }`}
                      >
                        <td className="p-3 font-mono font-bold text-[#6C2BD9]">{a.auditId}</td>
                        <td className="p-3 font-semibold text-gray-900">{a.auditName}</td>
                        <td className="p-3 text-gray-500">{a.auditType}</td>
                        <td className="p-3">{a.company}</td>
                        <td className="p-3 text-gray-700">
                          {a.scopeCriteria?.selectedLocations?.map(l => l.name).join(', ') || 'All Locations'}
                        </td>
                        <td className="p-3 text-gray-500 text-[11px] whitespace-nowrap">
                          {a.formattedStartDate} - {a.formattedEndDate}
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            a.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                            a.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                            a.status === 'Pending Approval' ? 'bg-amber-100 text-amber-800' :
                            a.status === 'Closed' ? 'bg-gray-200 text-gray-800' :
                            'bg-purple-100 text-[#6C2BD9]'
                          }`}>
                            {a.status}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                              <div
                                className="bg-[#6C2BD9] h-full rounded-full"
                                style={{ width: `${a.progress}%` }}
                              />
                            </div>
                            <span className="text-[10px] font-bold text-gray-700">{a.progress}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right-Side Audit Details Drawer */}
          {selectedAudit && (
            <div className="lg:col-span-4 bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
              <div className="flex justify-between items-start pb-3 border-b border-gray-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#6C2BD9]">{selectedAudit.auditId}</span>
                    <span className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${
                      selectedAudit.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                      selectedAudit.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                      selectedAudit.status === 'Pending Approval' ? 'bg-amber-100 text-amber-800' :
                      selectedAudit.status === 'Closed' ? 'bg-gray-200 text-gray-800' :
                      'bg-purple-100 text-[#6C2BD9]'
                    }`}>
                      {selectedAudit.status}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 mt-1">{selectedAudit.auditName}</h3>
                  <p className="text-[11px] text-gray-500 mt-0.5">{selectedAudit.description}</p>
                </div>
              </div>

              {/* Progress & Census Stats */}
              <div className="grid grid-cols-3 gap-2 bg-gray-50 p-3 rounded-lg text-center text-xs">
                <div>
                  <span className="text-gray-400 block text-[10px]">Expected</span>
                  <span className="font-bold text-gray-800 text-sm">{selectedAudit.totalExpected}</span>
                </div>
                <div>
                  <span className="text-emerald-600 block text-[10px] font-bold">Verified</span>
                  <span className="font-bold text-emerald-700 text-sm">{selectedAudit.totalVerified}</span>
                </div>
                <div>
                  <span className="text-rose-600 block text-[10px] font-bold">Exceptions</span>
                  <span className="font-bold text-rose-700 text-sm">{selectedAudit.totalExceptions}</span>
                </div>
              </div>

              {/* Campaign Attributes */}
              <div className="space-y-1.5 text-xs text-gray-600">
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-400">Company / Entity</span>
                  <span className="font-semibold text-gray-800">{selectedAudit.company}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-400">Audit Type</span>
                  <span className="font-semibold text-gray-800">{selectedAudit.auditType}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-400">Sampling</span>
                  <span className="font-semibold text-gray-800">{selectedAudit.samplingMethod}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-400">Planned Start</span>
                  <span className="font-semibold text-gray-800">{selectedAudit.formattedStartDate}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-400">Planned End</span>
                  <span className="font-semibold text-gray-800">{selectedAudit.formattedEndDate}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-gray-400">Lead Auditor</span>
                  <span className="font-semibold text-gray-800">
                    {selectedAudit.assignedUsers?.[0]?.name || 'John Doe'}
                  </span>
                </div>
              </div>

              {/* Context-Sensitive Actions */}
              <div className="pt-3 border-t border-gray-100 space-y-2">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-2">
                  Campaign Actions
                </span>

                {selectedAudit.status === 'Draft' && (
                  <button
                    disabled={actionLoading}
                    onClick={() => handleAuditAction('SUBMIT_APPROVAL')}
                    className="w-full py-2 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white rounded-lg text-xs font-semibold shadow-sm flex items-center justify-center gap-1.5"
                  >
                    <CheckSquare className="w-3.5 h-3.5" /> Submit for Approval
                  </button>
                )}

                {selectedAudit.status === 'Pending Approval' && (
                  <div className="flex gap-2">
                    <button
                      disabled={actionLoading}
                      onClick={() => handleAuditAction('APPROVE')}
                      className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm flex items-center justify-center gap-1"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" /> Approve Audit
                    </button>
                    <button
                      disabled={actionLoading}
                      onClick={() => handleAuditAction('REJECT', { comments: 'Scope needs revision' })}
                      className="px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold"
                    >
                      Reject
                    </button>
                  </div>
                )}

                {selectedAudit.status === 'Approved' && (
                  <button
                    disabled={actionLoading}
                    onClick={() => handleAuditAction('START_AUDIT')}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm flex items-center justify-center gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5" /> Start Audit & Freeze Baseline
                  </button>
                )}

                {selectedAudit.status === 'In Progress' && (
                  <div className="space-y-2">
                    <button
                      onClick={() => navigate(`/stocktakes/execution/${selectedAudit?.id || 'AUD-2026-0008'}`)}
                      className="w-full py-2 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white rounded-lg text-xs font-semibold shadow-sm flex items-center justify-center gap-1.5"
                    >
                      <ClipboardCheck className="w-3.5 h-3.5" /> Execute Asset Verifications
                    </button>
                    <button
                      disabled={actionLoading}
                      onClick={() => handleAuditAction('CLOSE_AUDIT', { forceClose: true })}
                      className="w-full py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Close Audit & Generate Report
                    </button>
                  </div>
                )}

                {(selectedAudit.status === 'Closed' || selectedAudit.status === 'Completed') && (
                  <div className="space-y-2">
                    <button
                      onClick={() => navigate(`/stocktakes/reports?auditId=${selectedAudit.id}`)}
                      className="w-full py-2 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white rounded-lg text-xs font-semibold shadow-sm flex items-center justify-center gap-1.5"
                    >
                      <FileText className="w-3.5 h-3.5" /> View Audit Report & Analytics
                    </button>
                    <button
                      onClick={() => setShowReportModal(true)}
                      className="w-full py-2 bg-purple-50 text-[#6C2BD9] border border-purple-200 hover:bg-purple-100 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5"
                    >
                      <Printer className="w-3.5 h-3.5" /> View Signed Reconciliation Certificate
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Lower Section Tabs: Scope, Assigned Users, Expected Assets, Schedule, Approvals, Exceptions, Attachments */}
        {selectedAudit && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
            {/* Tab Headers */}
            <div className="flex items-center gap-2 border-b border-gray-200 overflow-x-auto text-xs font-semibold">
              {[
                { id: 'SCOPE', label: 'Audit Scope', icon: Building },
                { id: 'USERS', label: 'Assigned Users', icon: Users },
                { id: 'EXPECTED', label: 'Expected Assets (Frozen Snapshot)', icon: Layers },
                { id: 'SCHEDULE', label: 'Audit Schedule', icon: Calendar },
                { id: 'APPROVALS', label: 'Approvals', icon: ShieldCheck },
                { id: 'EXCEPTIONS', label: 'Exceptions & Discrepancies', icon: AlertTriangle },
                { id: 'ATTACHMENTS', label: 'Attachments & Notes', icon: FileText }
              ].map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    onClick={() => setActiveLowerTab(t.id)}
                    className={`pb-3 px-3 flex items-center gap-1.5 whitespace-nowrap transition-colors border-b-2 ${
                      activeLowerTab === t.id
                        ? 'border-[#6C2BD9] text-[#6C2BD9] font-bold'
                        : 'border-transparent text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    <Icon className="w-4 h-4" /> {t.label}
                  </button>
                );
              })}
            </div>

            {/* TAB CONTENT: SCOPE */}
            {activeLowerTab === 'SCOPE' && (
              <div className="space-y-4 text-xs pt-2">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div>
                    <span className="text-gray-400 block text-[11px]">Scoping Method</span>
                    <span className="font-bold text-gray-800">{selectedAudit.scopeType}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[11px]">Asset Group</span>
                    <span className="font-bold text-gray-800">{selectedAudit.scopeCriteria?.assetGroup || 'All Groups'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[11px]">Asset Category</span>
                    <span className="font-bold text-gray-800">{selectedAudit.scopeCriteria?.assetCategory || 'All Categories'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[11px]">Include Sub Locations</span>
                    <span className="font-bold text-gray-800">{selectedAudit.scopeCriteria?.includeSubLocations ? 'Yes' : 'No'}</span>
                  </div>
                </div>

                <div>
                  <span className="font-bold text-gray-700 block mb-2">Scoped Geographic Hierarchy</span>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="p-2.5 font-semibold">Location Code</th>
                          <th className="p-2.5 font-semibold">Location Name</th>
                          <th className="p-2.5 font-semibold">Hierarchy Level</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {(selectedAudit.scopeCriteria?.selectedLocations || []).map((l, idx) => (
                          <tr key={idx}>
                            <td className="p-2.5 font-mono font-bold text-[#6C2BD9]">{l.code}</td>
                            <td className="p-2.5">{l.name}</td>
                            <td className="p-2.5 text-gray-500">{l.type}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: ASSIGNED USERS */}
            {activeLowerTab === 'USERS' && (
              <div className="space-y-3 text-xs pt-2">
                <p className="text-gray-500">Authorized auditors assigned to verify assets in this campaign:</p>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="p-2.5 font-semibold">Auditor Name</th>
                        <th className="p-2.5 font-semibold">Assignment Role</th>
                        <th className="p-2.5 font-semibold">Assigned Location Scope</th>
                        <th className="p-2.5 font-semibold">Execution Access</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {(selectedAudit.assignedUsers || []).map((u, i) => (
                        <tr key={i}>
                          <td className="p-2.5 font-bold text-gray-800">{u.name}</td>
                          <td className="p-2.5 text-purple-700 font-semibold">{u.role}</td>
                          <td className="p-2.5 text-gray-600">{u.locationScope}</td>
                          <td className="p-2.5">
                            <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold">
                              Mobile & Web Authorized
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB CONTENT: EXPECTED ASSETS (SNAPSHOT) */}
            {activeLowerTab === 'EXPECTED' && (
              <div className="space-y-3 text-xs pt-2">
                <div className="flex justify-between items-center bg-purple-50 p-3 rounded-lg border border-purple-200">
                  <div>
                    <span className="font-bold text-[#6C2BD9] block">
                      Frozen Census Baseline ({selectedAudit.totalExpected} Assets)
                    </span>
                    <span className="text-[11px] text-gray-500">
                      Baseline snapshotted at campaign start. Asset Master changes will not overwrite this original population.
                    </span>
                  </div>
                  <button
                    onClick={() => navigate(`/stocktakes/execution/${selectedAudit?.id || 'AUD-2026-0008'}`)}
                    className="px-3 py-1.5 bg-[#6C2BD9] text-white rounded text-xs font-semibold"
                  >
                    Open Verification Grid
                  </button>
                </div>

                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="p-2.5 font-semibold">Asset No</th>
                        <th className="p-2.5 font-semibold">Asset Name</th>
                        <th className="p-2.5 font-semibold">Expected Location</th>
                        <th className="p-2.5 font-semibold">Expected Custodian</th>
                        <th className="p-2.5 font-semibold">Verification Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {[
                        { no: 'AS-000123', name: 'Laptop - Dell 5440', loc: 'Block B > 1F > IT-101', cust: 'Sara Ali', st: 'Verified' },
                        { no: 'AS-000124', name: 'Monitor - Samsung', loc: 'Block B > 1F > IT-101', cust: 'Sara Ali', st: 'Moved' },
                        { no: 'AS-000125', name: 'Printer - HP', loc: 'Block B > 2F > IT-201', cust: 'Layla Hassan', st: 'Verified' },
                        { no: 'AS-000126', name: 'Access Point - Cisco', loc: 'Block B > 2F > IT-201', cust: 'IT Team', st: 'Pending' }
                      ].map((item, idx) => (
                        <tr key={idx}>
                          <td className="p-2.5 font-mono font-bold text-[#6C2BD9]">{item.no}</td>
                          <td className="p-2.5 font-medium text-gray-800">{item.name}</td>
                          <td className="p-2.5 text-gray-600">{item.loc}</td>
                          <td className="p-2.5">{item.cust}</td>
                          <td className="p-2.5">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              item.st === 'Verified' ? 'bg-emerald-100 text-emerald-800' :
                              item.st === 'Moved' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-600'
                            }`}>
                              {item.st}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB CONTENT: SCHEDULE */}
            {activeLowerTab === 'SCHEDULE' && (
              <div className="space-y-3 text-xs pt-2">
                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl">
                  <div>
                    <span className="text-gray-400 block text-[11px]">Planned Start Date</span>
                    <span className="font-bold text-gray-900 text-sm">{selectedAudit.formattedStartDate}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[11px]">Planned End Date</span>
                    <span className="font-bold text-gray-900 text-sm">{selectedAudit.formattedEndDate}</span>
                  </div>
                  <div className="col-span-2 border-t pt-2 mt-1">
                    <span className="text-gray-400 block text-[11px]">Special Instructions</span>
                    <span className="text-gray-700">{selectedAudit.auditInstructions}</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: APPROVALS */}
            {activeLowerTab === 'APPROVALS' && (
              <div className="space-y-3 text-xs pt-2">
                <span className="font-bold text-gray-700 block">Approval Workflow Hierarchy</span>
                <div className="border rounded-lg overflow-hidden divide-y">
                  {(selectedAudit.approvals || []).map((app, idx) => (
                    <div key={idx} className="p-3 flex items-center justify-between bg-white">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-purple-100 text-[#6C2BD9] font-bold flex items-center justify-center text-xs">
                          {app.step}
                        </span>
                        <div>
                          <span className="font-bold text-gray-900 block">{app.role}</span>
                          <span className="text-gray-500 text-[11px]">{app.approver}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          app.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                          app.status === 'Pending' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {app.status}
                        </span>
                        {app.date && <span className="block text-[10px] text-gray-400 mt-0.5">{app.date}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB CONTENT: EXCEPTIONS */}
            {activeLowerTab === 'EXCEPTIONS' && (
              <div className="space-y-3 text-xs pt-2">
                <div className="flex justify-between items-center bg-rose-50 p-3 rounded-lg border border-rose-200">
                  <div>
                    <span className="font-bold text-rose-800 block">
                      Discrepancies & Exceptions ({selectedAudit.totalExceptions})
                    </span>
                    <span className="text-[11px] text-rose-600">
                      Governance rule: All exceptions must be reconciled or approved before final campaign closure.
                    </span>
                  </div>
                </div>

                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="p-2.5 font-semibold">Asset No</th>
                        <th className="p-2.5 font-semibold">Discrepancy Type</th>
                        <th className="p-2.5 font-semibold">System Location</th>
                        <th className="p-2.5 font-semibold">Observed Location</th>
                        <th className="p-2.5 font-semibold">Resolution Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      <tr className="hover:bg-gray-50">
                        <td className="p-2.5 font-bold text-[#6C2BD9]">AS-000124</td>
                        <td className="p-2.5 text-amber-700 font-semibold">Location Variance (Moved)</td>
                        <td className="p-2.5">Block B &gt; 1F &gt; IT-101</td>
                        <td className="p-2.5 font-bold">Block B &gt; 2F &gt; IT-201</td>
                        <td className="p-2.5">
                          <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-[10px] font-bold">
                            Pending Reconciliation
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB CONTENT: ATTACHMENTS & NOTES */}
            {activeLowerTab === 'ATTACHMENTS' && (
              <div className="space-y-3 text-xs pt-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="font-bold text-gray-700 block mb-2">Supporting Documents & Checklists</span>
                    <div className="space-y-2">
                      {(selectedAudit.attachments || []).map((att) => (
                        <div key={att.id} className="p-2.5 rounded-lg border bg-gray-50 flex items-center justify-between">
                          <div className="flex items-center gap-2 truncate">
                            <FileText className="w-4 h-4 text-[#6C2BD9]" />
                            <span className="font-medium text-gray-800">{att.name}</span>
                          </div>
                          <span className="text-gray-400 text-[10px]">{att.size}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="font-bold text-gray-700 block mb-2">Campaign Audit Notes</span>
                    <div className="p-3 bg-gray-50 rounded-lg border text-gray-600 text-xs">
                      {selectedAudit.notes || 'No notes added.'}
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

      </div>

      {/* RECONCILIATION REPORT MODAL */}
      {showReportModal && selectedAudit && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-[#6C2BD9]" />
                <h3 className="text-sm font-bold text-gray-900">Signed Audit Reconciliation Certificate</h3>
              </div>
              <button onClick={() => setShowReportModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 border rounded-xl bg-gray-50/60 space-y-4 text-xs">
              <div className="flex justify-between border-b pb-2">
                <div>
                  <span className="font-bold text-sm text-gray-900">Asset360 Enterprise</span>
                  <p className="text-[11px] text-gray-500">Official Asset Census Reconciliation Certificate</p>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-[#6C2BD9]">{selectedAudit.auditId}</span>
                  <p className="text-[10px] text-gray-400">Closed: {selectedAudit.formattedEndDate}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-[11px]">
                <div>
                  <span className="text-gray-400 block">Campaign:</span>
                  <span className="font-semibold text-gray-800">{selectedAudit.auditName}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Entity:</span>
                  <span className="font-semibold text-gray-800">{selectedAudit.company}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Total Baseline Population:</span>
                  <span className="font-semibold text-gray-800">{selectedAudit.totalExpected} Assets</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Verified & Reconciled:</span>
                  <span className="font-semibold text-emerald-700">100% Complete</span>
                </div>
              </div>

              <div className="border-t pt-2">
                <span className="font-bold text-gray-700 block mb-1">Executive Compliance Statement</span>
                <p className="text-[11px] text-gray-600">
                  This physical verification campaign was conducted in accordance with Asset360 FSD statutory guidelines. All assets within the scoped boundaries were inventoried via authorized scanning, and all recorded variances have been resolved with authorized adjustments committed to the Asset Master.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-8 pt-6 border-t text-[11px] text-gray-500 text-center">
                <div className="border-t border-dashed pt-1">
                  <span>Lead Auditor Signature</span>
                </div>
                <div className="border-t border-dashed pt-1">
                  <span>Chief Audit Executive Sign-Off</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-[#6C2BD9] text-white text-xs font-semibold rounded-lg hover:bg-[#5B21B6] flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" /> Print Certificate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
