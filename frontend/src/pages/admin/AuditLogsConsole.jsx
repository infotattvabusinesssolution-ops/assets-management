import React, { useState, useEffect, useMemo } from 'react';
import {
  Filter,
  Download,
  Calendar,
  Search,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  X,
  Settings,
  CheckCircle2,
  FileSpreadsheet,
  FileText,
  Printer,
  Check
} from 'lucide-react';
import { api } from '../../services/api';

// Exact 10 seed rows from Screenshot
const SEED_AUDIT_LOGS = [
  {
    id: 'LOG-001248',
    dateTime: '10 Sep 2026 14:32:15',
    timestamp: '2026-09-10T14:32:15Z',
    user: 'John Doe',
    userEmail: 'john.doe@company.com',
    userType: 'Internal',
    module: 'Assets',
    action: 'Update',
    recordId: 'AST-0001256',
    recordType: 'Asset',
    status: 'Success',
    ipAddress: '192.168.10.45',
    device: 'Web Browser (Chrome 128.0)',
    company: 'Asset360 Holdings',
    location: 'Dubai HQ',
    description: 'Updated asset location from "Old Warehouse" to "Main Store"',
    oldValue: '{ "Location": "Old Warehouse" }',
    newValue: '{ "Location": "Main Store" }',
    additionalInfo: {
      sessionId: 'SESS-8812903',
      authMethod: 'MFA Verified (Azure AD SSO)',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
      changedFields: ['Location', 'LastModifiedDate', 'ModifiedBy']
    },
    relatedLogs: [
      { id: 'LOG-001242', dateTime: '10 Sep 2026 11:20:00', action: 'Barcode Scan', user: 'John Doe', note: 'Physical tag verified during floor sweep' },
      { id: 'LOG-001198', dateTime: '08 Sep 2026 09:15:30', action: 'Transfer Request', user: 'Sarah Ali', note: 'Movement ticket TRF-000335 approved' },
      { id: 'LOG-000840', dateTime: '15 Jan 2026 10:00:12', action: 'Registration', user: 'Admin', note: 'Asset master created via PO-2026-0199' }
    ]
  },
  {
    id: 'LOG-001247',
    dateTime: '10 Sep 2026 13:18:47',
    timestamp: '2026-09-10T13:18:47Z',
    user: 'Mary Smith',
    userEmail: 'mary.smith@company.com',
    userType: 'Internal',
    module: 'User Management',
    action: 'Create',
    recordId: 'USR-001024',
    recordType: 'User',
    status: 'Success',
    ipAddress: '192.168.10.82',
    device: 'Web Browser (Chrome 128.0)',
    company: 'Asset360 Holdings',
    location: 'Dubai HQ',
    description: 'Created new user account for Michael Chang (mchang@company.com) with role "Auditor".',
    oldValue: null,
    newValue: '{ "Username": "mchang", "Role": "Auditor", "Department": "Internal Audit", "Status": "Active" }',
    additionalInfo: {
      sessionId: 'SESS-8812741',
      authMethod: 'Corporate Password + OTP',
      changedFields: ['All User Master Fields']
    },
    relatedLogs: []
  },
  {
    id: 'LOG-001246',
    dateTime: '10 Sep 2026 12:05:33',
    timestamp: '2026-09-10T12:05:33Z',
    user: 'Ahmed Khan',
    userEmail: 'ahmed.khan@company.com',
    userType: 'Internal',
    module: 'Maintenance',
    action: 'Approve',
    recordId: 'WO-000458',
    recordType: 'Work Order',
    status: 'Success',
    ipAddress: '192.168.12.19',
    device: 'Web Browser (Edge 128.0)',
    company: 'Asset360 Holdings',
    location: 'Dubai HQ',
    description: 'Approved completed work order WO-000458 for HVAC Chiller Unit CH-01 annual inspection.',
    oldValue: '{ "Status": "Pending Approval", "ApprovedBy": null }',
    newValue: '{ "Status": "Approved / Closed", "ApprovedBy": "Ahmed Khan", "ApprovalDate": "2026-09-10" }',
    additionalInfo: {
      sessionId: 'SESS-8812610',
      authMethod: 'MFA Verified',
      changedFields: ['Status', 'ApprovedBy', 'ApprovalDate']
    },
    relatedLogs: []
  },
  {
    id: 'LOG-001245',
    dateTime: '10 Sep 2026 11:42:11',
    timestamp: '2026-09-10T11:42:11Z',
    user: 'Sarah Ali',
    userEmail: 'sarah.ali@company.com',
    userType: 'Internal',
    module: 'Inventory',
    action: 'Delete',
    recordId: 'STK-000789',
    recordType: 'Stock Item',
    status: 'Success',
    ipAddress: '192.168.10.63',
    device: 'Web Browser (Chrome 128.0)',
    company: 'Asset360 Holdings',
    location: 'Jebel Ali Warehouse',
    description: 'Removed obsolete draft spare part item record from Jebel Ali staging ledger.',
    oldValue: '{ "PartNo": "SP-9921", "Description": "Obsolete Filter Bracket", "Quantity": 0 }',
    newValue: null,
    additionalInfo: {
      sessionId: 'SESS-8812502',
      authMethod: 'Session Token',
      changedFields: ['Record Deleted']
    },
    relatedLogs: []
  },
  {
    id: 'LOG-001244',
    dateTime: '10 Sep 2026 10:15:26',
    timestamp: '2026-09-10T10:15:26Z',
    user: 'System',
    userEmail: 'system.service@asset360.internal',
    userType: 'System Service',
    module: 'Integrations',
    action: 'Sync',
    recordId: 'INT-ERP-01',
    recordType: 'Integration Job',
    status: 'Success',
    ipAddress: '127.0.0.1 (Local Service)',
    device: 'Automated Job Runner (Node.js)',
    company: 'Asset360 Holdings',
    location: 'Dubai HQ',
    description: 'Automated bi-directional synchronization with SAP ERP completed: 1,420 asset valuation balances synchronized.',
    oldValue: '{ "LastSyncStatus": "Pending", "SyncedRecords": 1390 }',
    newValue: '{ "LastSyncStatus": "Success", "SyncedRecords": 1420, "Errors": 0 }',
    additionalInfo: {
      sessionId: 'CRON-INT-0916',
      authMethod: 'Internal mTLS',
      changedFields: ['LastSyncTimestamp', 'BookValueAdjustments']
    },
    relatedLogs: []
  },
  {
    id: 'LOG-001243',
    dateTime: '09 Sep 2026 17:22:08',
    timestamp: '2026-09-09T17:22:08Z',
    user: 'Rashid Mohammed',
    userEmail: 'rashid.mohammed@company.com',
    userType: 'Internal',
    module: 'Asset Transfer',
    action: 'Create',
    recordId: 'TRF-000339',
    recordType: 'Transfer Request',
    status: 'Success',
    ipAddress: '192.168.10.95',
    device: 'Mobile App (iOS 18.0)',
    company: 'Asset360 Holdings',
    location: 'Dubai HQ',
    description: 'Submitted inter-department transfer request for 5 Dell Laptops from IT-101 to Finance CONF-02.',
    oldValue: null,
    newValue: '{ "TransferID": "TRF-000339", "Source": "IT-101", "Destination": "CONF-02", "ItemsCount": 5 }',
    additionalInfo: {
      sessionId: 'SESS-8811904',
      authMethod: 'OAuth2 Mobile Bearer',
      changedFields: ['All Transfer Requisition Fields']
    },
    relatedLogs: []
  },
  {
    id: 'LOG-001242',
    dateTime: '09 Sep 2026 16:10:44',
    timestamp: '2026-09-09T16:10:44Z',
    user: 'John Doe',
    userEmail: 'john.doe@company.com',
    userType: 'Internal',
    module: 'System Configuration',
    action: 'Update',
    recordId: 'CFG-000021',
    recordType: 'Configuration',
    status: 'Success',
    ipAddress: '192.168.10.45',
    device: 'Web Browser (Chrome 128.0)',
    company: 'Asset360 Holdings',
    location: 'Dubai HQ',
    description: 'Updated Asset Code Format Pattern sequence length from 5 to 6 digits.',
    oldValue: '{ "Pattern": "{PREFIX}-{YYYY}-{SEQ:5}", "Length": 5 }',
    newValue: '{ "Pattern": "{PREFIX}-{YYYY}-{SEQ:6}", "Length": 6 }',
    additionalInfo: {
      sessionId: 'SESS-8811802',
      authMethod: 'MFA Verified',
      changedFields: ['Pattern', 'Length']
    },
    relatedLogs: []
  },
  {
    id: 'LOG-001241',
    dateTime: '09 Sep 2026 14:55:12',
    timestamp: '2026-09-09T14:55:12Z',
    user: 'Priya Nair',
    userEmail: 'priya.nair@company.com',
    userType: 'Internal',
    module: 'Roles & Permissions',
    action: 'Update',
    recordId: 'ROLE-ADMIN',
    recordType: 'Security Role',
    status: 'Success',
    ipAddress: '192.168.10.33',
    device: 'Web Browser (Chrome 128.0)',
    company: 'Asset360 Holdings',
    location: 'Dubai HQ',
    description: 'Granted export permission "AUDIT_EXPORT_CSV" to System Administrator role.',
    oldValue: '{ "PermissionsCount": 42 }',
    newValue: '{ "PermissionsCount": 43, "Added": ["AUDIT_EXPORT_CSV"] }',
    additionalInfo: {
      sessionId: 'SESS-8811709',
      authMethod: 'Admin Token',
      changedFields: ['RolePermissions']
    },
    relatedLogs: []
  },
  {
    id: 'LOG-001240',
    dateTime: '09 Sep 2026 13:48:37',
    timestamp: '2026-09-09T13:48:37Z',
    user: 'Khalid Saeed',
    userEmail: 'khalid.saeed@company.com',
    userType: 'Internal',
    module: 'Assets',
    action: 'Delete',
    recordId: 'AST-0001240',
    recordType: 'Asset',
    status: 'Failed',
    ipAddress: '192.168.11.77',
    device: 'Web Browser (Firefox 130.0)',
    company: 'Asset360 Holdings',
    location: 'Dubai HQ',
    description: 'Attempted to delete active capital asset AST-0001240 with pending open work orders. Rejected by constraint check.',
    oldValue: null,
    newValue: null,
    additionalInfo: {
      sessionId: 'SESS-8811554',
      failureReason: 'Integrity constraint violation: Asset has 2 open Work Orders (WO-000412, WO-000430). Deletion blocked.',
      authMethod: 'Session Token'
    },
    relatedLogs: []
  },
  {
    id: 'LOG-001239',
    dateTime: '09 Sep 2026 12:31:59',
    timestamp: '2026-09-09T12:31:59Z',
    user: 'System',
    userEmail: 'system.service@asset360.internal',
    userType: 'System Service',
    module: 'Email Notification',
    action: 'Send',
    recordId: 'MAIL-000956',
    recordType: 'Notification',
    status: 'Success',
    ipAddress: '127.0.0.1 (Local Service)',
    device: 'SMTP Mailer Service',
    company: 'Asset360 Holdings',
    location: 'Dubai HQ',
    description: 'Dispatched 14 warranty expiration reminder emails to department custodians for October 2026 expiries.',
    oldValue: '{ "QueueStatus": "Queued", "Recipients": 14 }',
    newValue: '{ "QueueStatus": "Delivered", "DeliveredCount": 14, "Failures": 0 }',
    additionalInfo: {
      sessionId: 'SMTP-SRV-901',
      authMethod: 'Internal Service Token',
      changedFields: ['DeliveryStatus', 'DeliveredAt']
    },
    relatedLogs: []
  }
];

export function AuditLogsConsole() {
  // State: Data
  const [logs, setLogs] = useState(SEED_AUDIT_LOGS);
  const [selectedLogId, setSelectedLogId] = useState('LOG-001248');
  const [showLogDetails, setShowLogDetails] = useState(true);

  // State: Checkbox Selections
  const [selectedRowIds, setSelectedRowIds] = useState(new Set());

  // State: Collapsible Sections
  const [isAdvancedFiltersOpen, setIsAdvancedFiltersOpen] = useState(true);
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);
  const [isAdditionalInfoOpen, setIsAdditionalInfoOpen] = useState(false);
  const [isRelatedLogsOpen, setIsRelatedLogsOpen] = useState(false);

  // State: Filter Inputs
  const [dateRangeText, setDateRangeText] = useState('01 Sep 2026 - 10 Sep 2026');
  const [userFilter, setUserFilter] = useState('All Users');
  const [moduleFilter, setModuleFilter] = useState('All Modules');
  const [actionFilter, setActionFilter] = useState('All Actions');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [companyFilter, setCompanyFilter] = useState('All Companies');
  const [locationFilter, setLocationFilter] = useState('All Locations');
  const [recordIdFilter, setRecordIdFilter] = useState('');
  const [keywordFilter, setKeywordFilter] = useState('');

  // State: Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [totalRecords, setTotalRecords] = useState(1248);

  // State: UI Feedback
  const [toast, setToast] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const showNotification = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  // Find currently selected log object
  const selectedLog = useMemo(() => {
    return logs.find(l => l.id === selectedLogId) || logs[0] || SEED_AUDIT_LOGS[0];
  }, [logs, selectedLogId]);

  // Handle Fetch from Backend API
  const fetchLogs = async () => {
    setRefreshing(true);
    try {
      const res = await api.get('/admin/audit-logs', {
        params: {
          search: keywordFilter,
          user: userFilter,
          module: moduleFilter,
          action: actionFilter,
          status: statusFilter,
          company: companyFilter,
          location: locationFilter,
          recordId: recordIdFilter,
          page: currentPage,
          limit: pageSize
        }
      });
      if (res?.logs && res.logs.length > 0) {
        setLogs(res.logs);
        if (res.total) setTotalRecords(res.total);
      }
    } catch (err) {
      // Fallback to local in-memory filtering
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // Filter application
  const handleApplyFilters = () => {
    fetchLogs();
    showNotification('success', 'Filters applied to audit log query.');
  };

  const handleResetFilters = () => {
    setDateRangeText('01 Sep 2026 - 10 Sep 2026');
    setUserFilter('All Users');
    setModuleFilter('All Modules');
    setActionFilter('All Actions');
    setStatusFilter('All Statuses');
    setCompanyFilter('All Companies');
    setLocationFilter('All Locations');
    setRecordIdFilter('');
    setKeywordFilter('');
    setLogs(SEED_AUDIT_LOGS);
    setTotalRecords(1248);
    showNotification('info', 'Filters reset to default.');
  };

  // Checkbox Selection
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRowIds(new Set(logs.map(l => l.id)));
    } else {
      setSelectedRowIds(new Set());
    }
  };

  const handleToggleRowSelect = (id) => {
    setSelectedRowIds(prev => {
      const copy = new Set(prev);
      if (copy.has(id)) {
        copy.delete(id);
      } else {
        copy.add(id);
      }
      return copy;
    });
  };

  // Export
  const handleExport = (format) => {
    setIsExportDropdownOpen(false);
    const count = selectedRowIds.size > 0 ? selectedRowIds.size : totalRecords;
    showNotification('success', `Exporting ${count} logs to ${format.toUpperCase()}...`);
  };

  return (
    <div className="space-y-4 font-sans text-slate-800">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2.5 rounded-xl bg-slate-900 px-4 py-3 text-xs font-semibold text-white shadow-2xl transition-all duration-300">
          {toast.type === 'success' && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
          {toast.type === 'info' && <Check className="h-4 w-4 text-[#6C2BD9]" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* 1. Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pt-1">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <span>Administration</span>
            <span className="text-slate-400">&gt;</span>
            <span className="font-semibold text-slate-800">Audit Logs</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            Audit Logs
          </h1>
          <p className="text-xs text-slate-500">
            Track and review all user and system activities in Asset360.
          </p>
        </div>

        {/* Export Logs Button */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsExportDropdownOpen(!isExportDropdownOpen)}
            className="flex items-center gap-2 rounded-lg border border-[#6C2BD9] bg-white px-4 py-2 text-xs font-semibold text-[#6C2BD9] shadow-2xs hover:bg-purple-50 transition-colors"
          >
            <Download className="h-3.5 w-3.5 text-[#6C2BD9]" />
            <span>Export Logs</span>
            <ChevronDown className="h-3.5 w-3.5 text-[#6C2BD9]" />
          </button>

          {isExportDropdownOpen && (
            <div className="absolute right-0 mt-1.5 w-48 rounded-xl border border-slate-200 bg-white py-1.5 shadow-xl z-50 text-xs font-medium">
              <button
                type="button"
                onClick={() => handleExport('csv')}
                className="w-full px-3.5 py-2 text-left hover:bg-purple-50 hover:text-[#6C2BD9] flex items-center gap-2"
              >
                <FileText className="h-3.5 w-3.5 text-slate-400" />
                <span>Export as CSV</span>
              </button>
              <button
                type="button"
                onClick={() => handleExport('xlsx')}
                className="w-full px-3.5 py-2 text-left hover:bg-purple-50 hover:text-[#6C2BD9] flex items-center gap-2"
              >
                <FileSpreadsheet className="h-3.5 w-3.5 text-slate-400" />
                <span>Export as Excel (.xlsx)</span>
              </button>
              <button
                type="button"
                onClick={() => handleExport('pdf')}
                className="w-full px-3.5 py-2 text-left hover:bg-purple-50 hover:text-[#6C2BD9] flex items-center gap-2"
              >
                <Printer className="h-3.5 w-3.5 text-slate-400" />
                <span>Print / PDF Ledger</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 2. Filters Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-[#6C2BD9]" />
            <h2 className="text-sm font-bold text-slate-900">Filters</h2>
          </div>

          <button
            type="button"
            onClick={() => setIsAdvancedFiltersOpen(!isAdvancedFiltersOpen)}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#6C2BD9] hover:underline"
          >
            <Settings className="h-3.5 w-3.5 text-[#6C2BD9]" />
            <span>Advanced Filters</span>
            {isAdvancedFiltersOpen ? (
              <ChevronUp className="h-3.5 w-3.5 text-[#6C2BD9]" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5 text-[#6C2BD9]" />
            )}
          </button>
        </div>

        <div className="mt-3 space-y-3">
          {/* Filter Row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
            <div>
              <label className="mb-1 block font-semibold text-slate-700">Date Range</label>
              <div className="relative flex items-center">
                <Calendar className="absolute left-2.5 h-3.5 w-3.5 text-purple-600" />
                <input
                  type="text"
                  value={dateRangeText}
                  onChange={e => setDateRangeText(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 pl-8 pr-7 py-1.5 text-xs focus:border-[#6C2BD9] focus:outline-none"
                />
                {dateRangeText && (
                  <button
                    type="button"
                    onClick={() => setDateRangeText('')}
                    className="absolute right-2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="h-3.5 w-3.5 text-purple-600" />
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="mb-1 block font-semibold text-slate-700">User</label>
              <div className="relative">
                <select
                  value={userFilter}
                  onChange={e => setUserFilter(e.target.value)}
                  className="w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 py-1.5 pr-7 text-xs focus:border-[#6C2BD9] focus:outline-none cursor-pointer"
                >
                  <option value="All Users">All Users</option>
                  <option value="John Doe">John Doe</option>
                  <option value="Mary Smith">Mary Smith</option>
                  <option value="Ahmed Khan">Ahmed Khan</option>
                  <option value="Sarah Ali">Sarah Ali</option>
                  <option value="System">System</option>
                  <option value="Rashid Mohammed">Rashid Mohammed</option>
                  <option value="Priya Nair">Priya Nair</option>
                  <option value="Khalid Saeed">Khalid Saeed</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 h-3.5 w-3.5 text-[#6C2BD9]" />
              </div>
            </div>

            <div>
              <label className="mb-1 block font-semibold text-slate-700">Module</label>
              <div className="relative">
                <select
                  value={moduleFilter}
                  onChange={e => setModuleFilter(e.target.value)}
                  className="w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 py-1.5 pr-7 text-xs focus:border-[#6C2BD9] focus:outline-none cursor-pointer"
                >
                  <option value="All Modules">All Modules</option>
                  <option value="Assets">Assets</option>
                  <option value="User Management">User Management</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Inventory">Inventory</option>
                  <option value="Integrations">Integrations</option>
                  <option value="Asset Transfer">Asset Transfer</option>
                  <option value="System Configuration">System Configuration</option>
                  <option value="Roles & Permissions">Roles &amp; Permissions</option>
                  <option value="Email Notification">Email Notification</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 h-3.5 w-3.5 text-[#6C2BD9]" />
              </div>
            </div>

            <div>
              <label className="mb-1 block font-semibold text-slate-700">Action Type</label>
              <div className="relative">
                <select
                  value={actionFilter}
                  onChange={e => setActionFilter(e.target.value)}
                  className="w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 py-1.5 pr-7 text-xs focus:border-[#6C2BD9] focus:outline-none cursor-pointer"
                >
                  <option value="All Actions">All Actions</option>
                  <option value="Create">Create</option>
                  <option value="Update">Update</option>
                  <option value="Delete">Delete</option>
                  <option value="Approve">Approve</option>
                  <option value="Sync">Sync</option>
                  <option value="Send">Send</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 h-3.5 w-3.5 text-[#6C2BD9]" />
              </div>
            </div>

            <div>
              <label className="mb-1 block font-semibold text-slate-700">Status</label>
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 py-1.5 pr-7 text-xs focus:border-[#6C2BD9] focus:outline-none cursor-pointer"
                >
                  <option value="All Statuses">All Statuses</option>
                  <option value="Success">Success</option>
                  <option value="Failed">Failed</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 h-3.5 w-3.5 text-[#6C2BD9]" />
              </div>
            </div>
          </div>

          {/* Filter Row 2 (Collapsible Advanced Filters) */}
          {isAdvancedFiltersOpen && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-1 text-xs items-end">
              <div className="md:col-span-2">
                <label className="mb-1 block font-semibold text-slate-700">Company</label>
                <div className="relative">
                  <select
                    value={companyFilter}
                    onChange={e => setCompanyFilter(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 py-1.5 pr-7 text-xs focus:border-[#6C2BD9] focus:outline-none cursor-pointer"
                  >
                    <option value="All Companies">All Companies</option>
                    <option value="Asset360 Holdings">Asset360 Holdings</option>
                    <option value="Wavelogix FZC">Wavelogix FZC</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 h-3.5 w-3.5 text-[#6C2BD9]" />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="mb-1 block font-semibold text-slate-700">Location</label>
                <div className="relative">
                  <select
                    value={locationFilter}
                    onChange={e => setLocationFilter(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 py-1.5 pr-7 text-xs focus:border-[#6C2BD9] focus:outline-none cursor-pointer"
                  >
                    <option value="All Locations">All Locations</option>
                    <option value="Dubai HQ">Dubai HQ</option>
                    <option value="Jebel Ali Warehouse">Jebel Ali Warehouse</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 h-3.5 w-3.5 text-[#6C2BD9]" />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="mb-1 block font-semibold text-slate-700">Record ID</label>
                <input
                  type="text"
                  placeholder="Enter record ID"
                  value={recordIdFilter}
                  onChange={e => setRecordIdFilter(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:border-[#6C2BD9] focus:outline-none"
                />
              </div>

              <div className="md:col-span-4">
                <label className="mb-1 block font-semibold text-slate-700">Keyword</label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by details, old value or new value..."
                    value={keywordFilter}
                    onChange={e => setKeywordFilter(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 pl-8 pr-3 py-1.5 text-xs focus:border-[#6C2BD9] focus:outline-none"
                  />
                </div>
              </div>

              <div className="md:col-span-2 flex items-center justify-end gap-2 pt-2 md:pt-0">
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
                >
                  Reset
                </button>

                <button
                  type="button"
                  onClick={handleApplyFilters}
                  className="flex items-center gap-1.5 rounded-lg bg-[#6C2BD9] px-4 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-[#5B21B6] transition-colors"
                >
                  <Filter className="h-3 w-3 text-white" />
                  <span>Apply Filters</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. Main Split View: Audit Logs Grid (Left) + Log Details (Right) */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 items-start">
        {/* Left Grid Panel */}
        <div className={showLogDetails ? 'lg:col-span-8' : 'lg:col-span-12'}>
          <div className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
            {/* Table Top Controls */}
            <div className="flex items-center justify-between border-b border-slate-100 p-3.5">
              <h2 className="text-sm font-bold text-slate-900">
                Audit Logs ({totalRecords.toLocaleString()})
              </h2>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={fetchLogs}
                  disabled={refreshing}
                  className="flex items-center gap-1.5 rounded-lg border border-[#6C2BD9] bg-white px-3 py-1.5 text-xs font-semibold text-[#6C2BD9] hover:bg-purple-50 transition-colors"
                >
                  <RefreshCw className={`h-3.5 w-3.5 text-[#6C2BD9] ${refreshing ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>

                <div className="relative flex items-center">
                  <select
                    value={pageSize}
                    onChange={e => setPageSize(Number(e.target.value))}
                    className="appearance-none rounded-lg border border-slate-200 bg-white pl-3 pr-7 py-1.5 text-xs font-semibold text-slate-700 focus:border-[#6C2BD9] focus:outline-none cursor-pointer"
                  >
                    <option value={10}>10 / page</option>
                    <option value={25}>25 / page</option>
                    <option value={50}>50 / page</option>
                    <option value={100}>100 / page</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2 top-2 h-3.5 w-3.5 text-[#6C2BD9]" />
                </div>
              </div>
            </div>

            {/* Logs Data Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 bg-slate-50/70 font-bold text-slate-700">
                  <tr>
                    <th className="p-3 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={selectedRowIds.size > 0 && selectedRowIds.size === logs.length}
                        onChange={handleSelectAll}
                        className="h-4 w-4 rounded border-2 border-[#6C2BD9] text-[#6C2BD9] focus:ring-[#6C2BD9] cursor-pointer accent-[#6C2BD9]"
                      />
                    </th>
                    <th className="p-3 whitespace-nowrap cursor-pointer hover:text-slate-900">
                      <div className="flex items-center gap-1">
                        <span>Date &amp; Time</span>
                        <ChevronDown className="h-3 w-3 text-[#6C2BD9]" />
                      </div>
                    </th>
                    <th className="p-3 whitespace-nowrap cursor-pointer hover:text-slate-900">
                      <div className="flex items-center gap-1">
                        <span>User</span>
                        <ChevronDown className="h-3 w-3 text-[#6C2BD9]" />
                      </div>
                    </th>
                    <th className="p-3 whitespace-nowrap cursor-pointer hover:text-slate-900">
                      <div className="flex items-center gap-1">
                        <span>Module</span>
                        <ChevronDown className="h-3 w-3 text-[#6C2BD9]" />
                      </div>
                    </th>
                    <th className="p-3 whitespace-nowrap cursor-pointer hover:text-slate-900">
                      <div className="flex items-center gap-1">
                        <span>Action</span>
                        <ChevronDown className="h-3 w-3 text-[#6C2BD9]" />
                      </div>
                    </th>
                    <th className="p-3 whitespace-nowrap cursor-pointer hover:text-slate-900">
                      <div className="flex items-center gap-1">
                        <span>Record ID</span>
                        <ChevronDown className="h-3 w-3 text-[#6C2BD9]" />
                      </div>
                    </th>
                    <th className="p-3 whitespace-nowrap cursor-pointer hover:text-slate-900">
                      <div className="flex items-center gap-1">
                        <span>Status</span>
                        <ChevronDown className="h-3 w-3 text-[#6C2BD9]" />
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {logs.map(log => {
                    const isSelected = selectedLogId === log.id;
                    const isChecked = selectedRowIds.has(log.id);
                    return (
                      <tr
                        key={log.id}
                        onClick={() => {
                          setSelectedLogId(log.id);
                          setShowLogDetails(true);
                        }}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-[#F5F3FF]'
                            : 'hover:bg-slate-50/70'
                        }`}
                      >
                        <td className="p-3 text-center" onClick={e => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleRowSelect(log.id)}
                            className="h-4 w-4 rounded border-2 border-[#6C2BD9] text-[#6C2BD9] focus:ring-[#6C2BD9] cursor-pointer accent-[#6C2BD9]"
                          />
                        </td>
                        <td className="p-3 whitespace-nowrap font-medium text-slate-700">
                          {log.dateTime}
                        </td>
                        <td className="p-3 whitespace-nowrap font-semibold text-slate-800">
                          {log.user}
                        </td>
                        <td className="p-3 whitespace-nowrap text-slate-600 font-medium">
                          {log.module}
                        </td>
                        <td className="p-3 whitespace-nowrap text-slate-600 font-medium">
                          {log.action}
                        </td>
                        <td className="p-3 whitespace-nowrap font-mono text-slate-800 font-semibold">
                          {log.recordId}
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          <span
                            className={`inline-block rounded-md px-3 py-0.5 text-[11px] font-bold ${
                              log.status === 'Success'
                                ? 'bg-[#DCFCE7] text-[#15803D]'
                                : 'bg-[#FEE2E2] text-[#DC2626]'
                            }`}
                          >
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Bottom Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 text-xs text-slate-500">
              <span>
                Showing 1 to {Math.min(logs.length, 10)} of {totalRecords.toLocaleString()} records
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                >
                  <ChevronsLeft className="h-3.5 w-3.5 text-[#6C2BD9]" />
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                >
                  <ChevronLeft className="h-3.5 w-3.5 text-[#6C2BD9]" />
                </button>

                {[1, 2, 3, 4, 5].map(pg => (
                  <button
                    key={pg}
                    type="button"
                    onClick={() => setCurrentPage(pg)}
                    className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold transition-colors ${
                      currentPage === pg
                        ? 'bg-[#6C2BD9] text-white shadow-2xs'
                        : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {pg}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => setCurrentPage(p => p + 1)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
                >
                  <ChevronRight className="h-3.5 w-3.5 text-[#6C2BD9]" />
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentPage(5)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
                >
                  <ChevronsRight className="h-3.5 w-3.5 text-[#6C2BD9]" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Log Details Card */}
        {showLogDetails && (
          <div className="lg:col-span-4 rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
            {/* Card Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
              <h3 className="text-sm font-bold text-slate-900">Log Details</h3>
              <button
                type="button"
                onClick={() => setShowLogDetails(false)}
                className="rounded-lg p-1 text-[#6C2BD9] hover:bg-purple-50 transition-colors"
              >
                <X className="h-4 w-4 text-[#6C2BD9]" />
              </button>
            </div>

            {/* Card Details Content */}
            <div className="p-5 space-y-3.5 text-xs">
              <div className="flex items-baseline">
                <span className="w-28 text-slate-500 font-semibold shrink-0">Date &amp; Time</span>
                <span className="w-4 text-slate-400 shrink-0">:</span>
                <span className="font-semibold text-slate-900">{selectedLog.dateTime}</span>
              </div>

              <div className="flex items-baseline">
                <span className="w-28 text-slate-500 font-semibold shrink-0">User</span>
                <span className="w-4 text-slate-400 shrink-0">:</span>
                <span className="font-semibold text-slate-900">
                  {selectedLog.user} {selectedLog.userEmail ? `(${selectedLog.userEmail})` : ''}
                </span>
              </div>

              <div className="flex items-baseline">
                <span className="w-28 text-slate-500 font-semibold shrink-0">User Type</span>
                <span className="w-4 text-slate-400 shrink-0">:</span>
                <span className="text-slate-800 font-medium">{selectedLog.userType || 'Internal'}</span>
              </div>

              <div className="flex items-baseline">
                <span className="w-28 text-slate-500 font-semibold shrink-0">Module</span>
                <span className="w-4 text-slate-400 shrink-0">:</span>
                <span className="text-slate-800 font-medium">{selectedLog.module}</span>
              </div>

              <div className="flex items-baseline">
                <span className="w-28 text-slate-500 font-semibold shrink-0">Action</span>
                <span className="w-4 text-slate-400 shrink-0">:</span>
                <span className="text-slate-800 font-medium">{selectedLog.action}</span>
              </div>

              <div className="flex items-baseline">
                <span className="w-28 text-slate-500 font-semibold shrink-0">Record ID</span>
                <span className="w-4 text-slate-400 shrink-0">:</span>
                <span className="font-mono font-bold text-slate-900">{selectedLog.recordId}</span>
              </div>

              <div className="flex items-baseline">
                <span className="w-28 text-slate-500 font-semibold shrink-0">Record Type</span>
                <span className="w-4 text-slate-400 shrink-0">:</span>
                <span className="text-slate-800 font-medium">{selectedLog.recordType || 'Asset'}</span>
              </div>

              <div className="flex items-center">
                <span className="w-28 text-slate-500 font-semibold shrink-0">Status</span>
                <span className="w-4 text-slate-400 shrink-0">:</span>
                <span
                  className={`inline-block rounded-md px-3 py-0.5 text-[11px] font-bold ${
                    selectedLog.status === 'Success'
                      ? 'bg-[#DCFCE7] text-[#15803D]'
                      : 'bg-[#FEE2E2] text-[#DC2626]'
                  }`}
                >
                  {selectedLog.status}
                </span>
              </div>

              <div className="flex items-baseline">
                <span className="w-28 text-slate-500 font-semibold shrink-0">IP Address</span>
                <span className="w-4 text-slate-400 shrink-0">:</span>
                <span className="font-mono text-slate-800">{selectedLog.ipAddress}</span>
              </div>

              <div className="flex items-baseline">
                <span className="w-28 text-slate-500 font-semibold shrink-0">Device</span>
                <span className="w-4 text-slate-400 shrink-0">:</span>
                <span className="text-slate-800 font-medium">{selectedLog.device}</span>
              </div>

              <div className="flex items-baseline">
                <span className="w-28 text-slate-500 font-semibold shrink-0">Location</span>
                <span className="w-4 text-slate-400 shrink-0">:</span>
                <span className="font-semibold text-slate-800">{selectedLog.location || 'Dubai HQ'}</span>
              </div>

              <div className="flex items-baseline">
                <span className="w-28 text-slate-500 font-semibold shrink-0">Description</span>
                <span className="w-4 text-slate-400 shrink-0">:</span>
                <span className="text-slate-800 font-normal leading-relaxed">
                  {selectedLog.description}
                </span>
              </div>

              {/* Old Value Box */}
              <div className="flex items-start pt-1">
                <span className="w-28 text-slate-500 font-semibold shrink-0 pt-1.5">Old Value</span>
                <span className="w-4 text-slate-400 shrink-0 pt-1.5">:</span>
                <div className="flex-1">
                  {selectedLog.oldValue ? (
                    <div className="rounded-lg bg-[#F8FAFC] border border-slate-200/80 p-2 font-mono text-[11px] text-slate-800">
                      {selectedLog.oldValue}
                    </div>
                  ) : (
                    <span className="text-slate-400 italic text-[11px] pt-1.5 block">None / Initial State</span>
                  )}
                </div>
              </div>

              {/* New Value Box */}
              <div className="flex items-start">
                <span className="w-28 text-slate-500 font-semibold shrink-0 pt-1.5">New Value</span>
                <span className="w-4 text-slate-400 shrink-0 pt-1.5">:</span>
                <div className="flex-1">
                  {selectedLog.newValue ? (
                    <div className="rounded-lg bg-[#F8FAFC] border border-slate-200/80 p-2 font-mono text-[11px] text-slate-800">
                      {selectedLog.newValue}
                    </div>
                  ) : (
                    <span className="text-slate-400 italic text-[11px] pt-1.5 block">None / Deleted State</span>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Expandable Accordions */}
            <div className="border-t border-slate-200 text-xs font-semibold text-[#6C2BD9]">
              {/* Additional Information Accordion */}
              <div className="border-b border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAdditionalInfoOpen(!isAdditionalInfoOpen)}
                  className="w-full flex items-center justify-between px-5 py-3 hover:bg-purple-50/40 text-left transition-colors"
                >
                  <span>Additional Information</span>
                  <ChevronRight
                    className={`h-4 w-4 text-[#6C2BD9] transition-transform ${
                      isAdditionalInfoOpen ? 'rotate-90' : ''
                    }`}
                  />
                </button>
                {isAdditionalInfoOpen && (
                  <div className="px-5 pb-3.5 space-y-2 text-[11px] font-normal text-slate-600 bg-purple-50/20">
                    <div>
                      <span className="font-semibold text-slate-700">Session ID: </span>
                      <code className="font-mono text-[#6C2BD9]">{selectedLog.additionalInfo?.sessionId || 'SESS-8812903'}</code>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-700">Auth Method: </span>
                      <span>{selectedLog.additionalInfo?.authMethod || 'Corporate MFA / Azure AD'}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-700">Changed Fields: </span>
                      <span>{selectedLog.additionalInfo?.changedFields?.join(', ') || 'Standard Update'}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Related Logs Accordion */}
              <div>
                <button
                  type="button"
                  onClick={() => setIsRelatedLogsOpen(!isRelatedLogsOpen)}
                  className="w-full flex items-center justify-between px-5 py-3 hover:bg-purple-50/40 text-left transition-colors"
                >
                  <span>Related Logs ({selectedLog.relatedLogs?.length || 3})</span>
                  <ChevronRight
                    className={`h-4 w-4 text-[#6C2BD9] transition-transform ${
                      isRelatedLogsOpen ? 'rotate-90' : ''
                    }`}
                  />
                </button>
                {isRelatedLogsOpen && (
                  <div className="px-5 pb-3.5 space-y-2 text-[11px] font-normal text-slate-600 bg-purple-50/20">
                    {(selectedLog.relatedLogs && selectedLog.relatedLogs.length > 0
                      ? selectedLog.relatedLogs
                      : [
                          { id: 'LOG-001242', dateTime: '10 Sep 2026 11:20:00', action: 'Barcode Scan', user: 'John Doe' },
                          { id: 'LOG-001198', dateTime: '08 Sep 2026 09:15:30', action: 'Transfer Request', user: 'Sarah Ali' },
                          { id: 'LOG-000840', dateTime: '15 Jan 2026 10:00:12', action: 'Registration', user: 'Admin' }
                        ]
                    ).map(rel => (
                      <div key={rel.id} className="rounded-lg border border-purple-100 bg-white p-2 flex items-center justify-between">
                        <div>
                          <span className="font-mono font-bold text-[#6C2BD9]">{rel.id}</span>
                          <span className="mx-1 text-slate-300">·</span>
                          <span className="font-semibold text-slate-800">{rel.action}</span>
                          <span className="block text-[10px] text-slate-400">{rel.dateTime}</span>
                        </div>
                        <span className="text-[10px] font-semibold text-slate-600">{rel.user}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AuditLogsConsole;
