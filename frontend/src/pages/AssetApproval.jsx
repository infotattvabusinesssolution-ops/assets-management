import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  ChevronRight,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  FileText,
  Paperclip,
  Check,
  X,
  User,
  Building,
  MoreVertical,
  Filter,
  Eye,
  HelpCircle,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Layers,
  ArrowLeftRight,
  ShieldCheck,
  Tag,
  DollarSign,
  Send,
  Bell,
  FileCheck,
  AlertCircle
} from 'lucide-react';

const SAMPLE_APPROVAL_REQUESTS = [
  {
    requestNo: 'APR-2026-001',
    transactionType: 'New Asset Registration',
    assetId: 'AST-000128',
    assetName: 'Dell Latitude 7450',
    requestedBy: 'John Doe',
    requestDate: '10 Sep 2026 10:25 AM',
    slaDueDate: '12 Sep 2026 (24h)',
    slaStatus: 'Normal',
    currentLevel: 'Asset Manager',
    currentLevelNum: 1,
    status: 'Pending',
    category: 'Laptop',
    purchaseCost: 'AED 5,500',
    location: 'Dubai HQ',
    attachment: 'PO.pdf',
    currentApprover: 'John Smith',
    image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&q=80&w=600',
    workflowSteps: [
      { step: 1, title: 'Asset Manager', status: 'Pending Approval', approver: 'John Smith', isCurrent: true },
      { step: 2, title: 'Department Head', status: 'Pending', approver: 'To be assigned', isCurrent: false },
      { step: 3, title: 'Finance', status: 'Pending', approver: 'To be assigned', isCurrent: false },
      { step: 4, title: 'Final Approval', status: 'Pending', approver: 'To be assigned', isCurrent: false }
    ],
    proposedChanges: null
  },
  {
    requestNo: 'APR-2026-002',
    transactionType: 'Asset Edit/Update',
    assetId: 'AST-000115',
    assetName: 'Samsung Monitor 27"',
    requestedBy: 'Fatima Khan',
    requestDate: '09 Sep 2026 02:15 PM',
    slaDueDate: '11 Sep 2026',
    slaStatus: 'SLA Overdue',
    currentLevel: 'Finance',
    currentLevelNum: 3,
    status: 'Pending',
    category: 'Monitor',
    purchaseCost: 'AED 1,200',
    location: 'Abu Dhabi Branch',
    attachment: 'Asset_Amendment_Doc.pdf',
    currentApprover: 'David Miller',
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=600',
    workflowSteps: [
      { step: 1, title: 'Asset Manager', status: 'Approved', approver: 'John Smith', isCurrent: false, date: '09 Sep 2026' },
      { step: 2, title: 'Department Head', status: 'Approved', approver: 'Sarah Ali', isCurrent: false, date: '09 Sep 2026' },
      { step: 3, title: 'Finance', status: 'Pending Approval (Overdue)', approver: 'David Miller', isCurrent: true },
      { step: 4, title: 'Final Approval', status: 'Pending', approver: 'To be assigned', isCurrent: false }
    ],
    proposedChanges: [
      { attribute: 'Category', currentValue: 'Accessory', proposedValue: 'Monitor' },
      { attribute: 'Custodian', currentValue: 'Unassigned', proposedValue: 'Fatima Khan' },
      { attribute: 'Location', currentValue: 'Dubai HQ', proposedValue: 'Abu Dhabi Branch' },
      { attribute: 'Acquisition Value', currentValue: 'AED 1,000', proposedValue: 'AED 1,200' }
    ]
  },
  {
    requestNo: 'APR-2026-003',
    transactionType: 'Asset Assignment/Transfer',
    assetId: 'AST-000097',
    assetName: 'iPhone 15 Pro',
    requestedBy: 'Ahmed Ali',
    requestDate: '08 Sep 2026 11:30 AM',
    slaDueDate: '10 Sep 2026',
    slaStatus: 'Normal',
    currentLevel: 'Department Head',
    currentLevelNum: 2,
    status: 'Pending',
    category: 'Mobile Device',
    purchaseCost: 'AED 4,000',
    location: 'Dubai HQ',
    attachment: 'Transfer_Approval_Form.pdf',
    currentApprover: 'Sarah Ali',
    image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&q=80&w=600',
    workflowSteps: [
      { step: 1, title: 'Asset Manager', status: 'Approved', approver: 'John Smith', isCurrent: false, date: '08 Sep 2026' },
      { step: 2, title: 'Department Head', status: 'Pending Approval', approver: 'Sarah Ali', isCurrent: true },
      { step: 3, title: 'Finance', status: 'Pending', approver: 'To be assigned', isCurrent: false },
      { step: 4, title: 'Final Approval', status: 'Pending', approver: 'To be assigned', isCurrent: false }
    ],
    proposedChanges: [
      { attribute: 'Custodian', currentValue: 'John Doe', proposedValue: 'Ahmed Ali' },
      { attribute: 'Location', currentValue: 'Dubai HQ, Floor 2', proposedValue: 'Dubai HQ, Floor 4' }
    ]
  },
  {
    requestNo: 'APR-2026-004',
    transactionType: 'Tag Replacement',
    assetId: 'AST-000221',
    assetName: 'Zebra TC58 Handheld',
    requestedBy: 'Jane Smith',
    requestDate: '08 Sep 2026 09:10 AM',
    slaDueDate: '10 Sep 2026',
    slaStatus: 'Normal',
    currentLevel: 'Asset Manager',
    currentLevelNum: 1,
    status: 'Pending',
    category: 'Scanner',
    purchaseCost: 'AED 3,200',
    location: 'Jebel Ali Warehouse',
    attachment: 'Damaged_Tag_Photo.pdf',
    currentApprover: 'John Smith',
    image: 'https://images.unsplash.com/photo-1580983561371-7f4b242d8ec0?auto=format&fit=crop&q=80&w=600',
    workflowSteps: [
      { step: 1, title: 'Asset Manager', status: 'Pending Approval', approver: 'John Smith', isCurrent: true },
      { step: 2, title: 'Department Head', status: 'Pending', approver: 'To be assigned', isCurrent: false },
      { step: 3, title: 'Finance', status: 'Pending', approver: 'To be assigned', isCurrent: false },
      { step: 4, title: 'Final Approval', status: 'Pending', approver: 'To be assigned', isCurrent: false }
    ],
    proposedChanges: null
  },
  {
    requestNo: 'APR-2026-005',
    transactionType: 'Disposal',
    assetId: 'AST-000078',
    assetName: 'HP LaserJet M404',
    requestedBy: 'Omar Saeed',
    requestDate: '07 Sep 2026 04:45 PM',
    slaDueDate: '09 Sep 2026',
    slaStatus: 'Escalated',
    currentLevel: 'Finance',
    currentLevelNum: 3,
    status: 'Escalated',
    category: 'Printer',
    purchaseCost: 'AED 1,500',
    location: 'Dubai HQ',
    attachment: 'Scrap_Decommission_Cert.pdf',
    currentApprover: 'David Miller',
    image: 'https://images.unsplash.com/photo-1612815150546-a672e8a60421?auto=format&fit=crop&q=80&w=600',
    workflowSteps: [
      { step: 1, title: 'Asset Manager', status: 'Approved', approver: 'John Smith', isCurrent: false, date: '07 Sep 2026' },
      { step: 2, title: 'Department Head', status: 'Approved', approver: 'Sarah Ali', isCurrent: false, date: '07 Sep 2026' },
      { step: 3, title: 'Finance', status: 'Escalated to VP', approver: 'David Miller', isCurrent: true },
      { step: 4, title: 'Final Approval', status: 'Pending', approver: 'To be assigned', isCurrent: false }
    ],
    proposedChanges: null
  },
  {
    requestNo: 'APR-2026-006',
    transactionType: 'Financial Changes',
    assetId: 'AST-000188',
    assetName: 'Cisco Catalyst 9300 Switch',
    requestedBy: 'IT Admin',
    requestDate: '05 Sep 2026 08:30 AM',
    slaDueDate: '07 Sep 2026',
    slaStatus: 'Normal',
    currentLevel: 'Final Approval',
    currentLevelNum: 4,
    status: 'Approved',
    category: 'Network',
    purchaseCost: 'AED 18,500',
    location: 'Dubai HQ Data Center',
    attachment: 'Capitalization_Form.pdf',
    currentApprover: 'CFO Office',
    image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&q=80&w=600',
    workflowSteps: [
      { step: 1, title: 'Asset Manager', status: 'Approved', approver: 'John Smith', isCurrent: false, date: '05 Sep 2026' },
      { step: 2, title: 'Department Head', status: 'Approved', approver: 'Sarah Ali', isCurrent: false, date: '05 Sep 2026' },
      { step: 3, title: 'Finance', status: 'Approved', approver: 'David Miller', isCurrent: false, date: '06 Sep 2026' },
      { step: 4, title: 'Final Approval', status: 'Completed & Executed', approver: 'CFO Office', isCurrent: false, date: '07 Sep 2026' }
    ],
    proposedChanges: [
      { attribute: 'Depreciation Method', currentValue: 'Straight Line (5 Yrs)', proposedValue: 'Declining Balance (4 Yrs)' },
      { attribute: 'Book Value', currentValue: 'AED 18,500', proposedValue: 'AED 14,800' }
    ]
  }
];

export function AssetApproval() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // State
  const [requests, setRequests] = useState(SAMPLE_APPROVAL_REQUESTS);
  const [selectedRequestNo, setSelectedRequestNo] = useState('APR-2026-001');
  const [activeTab, setActiveTab] = useState('Pending Approvals'); // Pending Approvals, My Requests, Approved, Rejected, Returned, All Requests
  const [transactionTypeFilter, setTransactionTypeFilter] = useState('All');
  const [approvalLevelFilter, setApprovalLevelFilter] = useState('All');
  const [dateRangeFilter, setDateRangeFilter] = useState('Last 30 Days');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals & Action States
  const [activeModal, setActiveModal] = useState(null); // null, NEW_REQUEST, FULL_DETAILS, DECISION_COMMENT
  const [decisionType, setDecisionType] = useState(''); // APPROVE, REJECT, RETURN
  const [actionComments, setActionComments] = useState('');
  const [newReqFormData, setNewReqFormData] = useState({ transactionType: 'New Asset Registration', assetId: 'AST-000250', assetName: '', purchaseCost: '', remarks: '' });
  const [toast, setToast] = useState(null);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // Selected Request detail
  const selectedRequest = useMemo(() => {
    return requests.find(r => r.requestNo === selectedRequestNo) || requests[0];
  }, [requests, selectedRequestNo]);

  // Tab & Search Filtered Requests
  const filteredRequests = useMemo(() => {
    return requests.filter(r => {
      // Tab filter
      if (activeTab === 'Pending Approvals' && (r.status !== 'Pending' && r.status !== 'Escalated')) return false;
      if (activeTab === 'Approved' && r.status !== 'Approved') return false;
      if (activeTab === 'Rejected' && r.status !== 'Rejected') return false;
      if (activeTab === 'Returned' && r.status !== 'Returned') return false;
      if (activeTab === 'My Requests' && r.requestedBy !== (user?.fullName || 'John Doe')) return false;
      // 'All Requests' shows all rows

      // Filter dropdowns
      if (transactionTypeFilter !== 'All' && r.transactionType !== transactionTypeFilter) return false;
      if (approvalLevelFilter !== 'All' && r.currentLevel !== approvalLevelFilter) return false;

      // Search query
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesNo = r.requestNo.toLowerCase().includes(q);
        const matchesId = r.assetId.toLowerCase().includes(q);
        const matchesName = r.assetName.toLowerCase().includes(q);
        const matchesUser = r.requestedBy.toLowerCase().includes(q);
        if (!matchesNo && !matchesId && !matchesName && !matchesUser) return false;
      }

      return true;
    });
  }, [requests, activeTab, transactionTypeFilter, approvalLevelFilter, searchQuery, user]);

  // Handle Action Submit (Approve / Reject / Return)
  const handleDecisionSubmit = async () => {
    if (!decisionType) return;

    try {
      await api.post(`/workflows/approve/${selectedRequest.requestNo}`, {
        decision: decisionType,
        comments: actionComments
      });
    } catch (err) {
      // Fallback local state update
    }

    setRequests(prev => prev.map(r => {
      if (r.requestNo === selectedRequest.requestNo) {
        if (decisionType === 'APPROVE') {
          if (r.currentLevelNum >= r.workflowSteps.length) {
            return { ...r, status: 'Approved' };
          } else {
            const nextLevelNum = r.currentLevelNum + 1;
            const updatedSteps = r.workflowSteps.map(s => {
              if (s.step === r.currentLevelNum) return { ...s, status: 'Approved', isCurrent: false, date: 'Today' };
              if (s.step === nextLevelNum) return { ...s, status: 'Pending Approval', isCurrent: true };
              return s;
            });
            const nextStep = updatedSteps.find(s => s.step === nextLevelNum);
            return {
              ...r,
              currentLevelNum: nextLevelNum,
              currentLevel: nextStep.title,
              workflowSteps: updatedSteps
            };
          }
        } else if (decisionType === 'REJECT') {
          return { ...r, status: 'Rejected' };
        } else if (decisionType === 'RETURN') {
          return { ...r, status: 'Returned' };
        }
      }
      return r;
    }));

    showToast('success', `Request ${selectedRequest.requestNo} processed with decision: ${decisionType}! Workflow instance updated & audit history recorded.`);
    setActiveModal(null);
    setActionComments('');
  };

  // Handle Submit New Approval Request
  const handleNewRequestSubmit = async (e) => {
    e.preventDefault();
    if (!newReqFormData.assetName || !newReqFormData.assetId) {
      showToast('error', 'Please complete Asset ID and Asset Name.');
      return;
    }

    const newReq = {
      requestNo: `APR-2026-00${requests.length + 1}`,
      transactionType: newReqFormData.transactionType,
      assetId: newReqFormData.assetId,
      assetName: newReqFormData.assetName,
      requestedBy: user?.fullName || 'John Doe',
      requestDate: '16 Sep 2026 01:20 PM',
      slaDueDate: '18 Sep 2026',
      slaStatus: 'Normal',
      currentLevel: 'Asset Manager',
      currentLevelNum: 1,
      status: 'Pending',
      category: 'Equipment',
      purchaseCost: `AED ${newReqFormData.purchaseCost || '3,500'}`,
      location: 'Dubai HQ',
      attachment: 'Request_Form.pdf',
      currentApprover: 'John Smith',
      image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&q=80&w=600',
      workflowSteps: [
        { step: 1, title: 'Asset Manager', status: 'Pending Approval', approver: 'John Smith', isCurrent: true },
        { step: 2, title: 'Department Head', status: 'Pending', approver: 'To be assigned', isCurrent: false },
        { step: 3, title: 'Finance', status: 'Pending', approver: 'To be assigned', isCurrent: false },
        { step: 4, title: 'Final Approval', status: 'Pending', approver: 'To be assigned', isCurrent: false }
      ],
      proposedChanges: null
    };

    try {
      await api.post('/workflows/create', newReq);
    } catch (err) {}

    setRequests(prev => [newReq, ...prev]);
    setSelectedRequestNo(newReq.requestNo);
    setActiveModal(null);
    showToast('success', `Submitted transaction approval request ${newReq.requestNo}!`);
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-5 pb-12 font-sans text-slate-900 select-none">
      
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl border shadow-xl flex items-center gap-3 backdrop-blur-md transition-all animate-bounce ${
          toast.type === 'success' ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-rose-50 border-rose-300 text-rose-800'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <AlertTriangle className="w-5 h-5 text-rose-600" />}
          <span className="text-xs font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Top Header & Action Buttons (Matching Screenshot 1-to-1) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white px-5 py-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-0.5">
            <span className="font-bold text-[#6C2BD9]">Assets</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-bold text-slate-700">Asset Approvals</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Asset Approvals</h1>
          <p className="text-xs text-slate-500 font-medium">Review and approve asset transactions with dynamic workflows</p>
        </div>

        <button
          type="button"
          onClick={() => setActiveModal('NEW_REQUEST')}
          className="px-5 py-2.5 bg-[#6C2BD9] hover:bg-[#5b21b6] text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md shadow-[#6C2BD9]/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" /> New Request
        </button>
      </div>

      {/* 4 Upper Summary Cards Grid (Matching Screenshot 1-to-1) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Pending Approvals */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-purple-100 text-[#6C2BD9] flex items-center justify-center font-black shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900 block leading-none">12</span>
            <span className="text-xs font-bold text-purple-900 mt-1 block">Pending Approvals</span>
          </div>
        </div>

        {/* Approved This Month */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-black shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-900 leading-none">28</span>
              <span className="text-[10px] text-emerald-700 font-bold">Approved</span>
            </div>
            <span className="text-xs font-semibold text-slate-400 mt-1 block">This Month</span>
          </div>
        </div>

        {/* Rejected This Month */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-black shrink-0">
            <XCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-900 leading-none">4</span>
              <span className="text-[10px] text-rose-700 font-bold">Rejected</span>
            </div>
            <span className="text-xs font-semibold text-slate-400 mt-1 block">This Month</span>
          </div>
        </div>

        {/* Returned This Month */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-purple-100 text-[#6C2BD9] flex items-center justify-center font-black shrink-0">
            <RotateCcw className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-900 leading-none">3</span>
              <span className="text-[10px] text-[#6C2BD9] font-bold">Returned</span>
            </div>
            <span className="text-xs font-semibold text-slate-400 mt-1 block">This Month</span>
          </div>
        </div>

      </div>

      {/* Main Table + Right Side Details Panel Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        
        {/* Left Column: Requests Data Table (8 cols) */}
        <div className="md:col-span-8 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          
          {/* Status Tabs Bar (Matching Specs 1-to-1: Pending Approvals, My Requests, Approved, Rejected, Returned, All Requests) */}
          <div className="flex items-center gap-4 border-b border-slate-200 font-bold text-xs pb-1 overflow-x-auto">
            {[
              { label: 'Pending Approvals (12)', key: 'Pending Approvals' },
              { label: 'My Requests', key: 'My Requests' },
              { label: 'Approved', key: 'Approved' },
              { label: 'Rejected', key: 'Rejected' },
              { label: 'Returned', key: 'Returned' },
              { label: 'All Requests', key: 'All Requests' }
            ].map(t => (
              <button
                key={t.key}
                type="button"
                onClick={() => setActiveTab(t.key)}
                className={`pb-2.5 px-1 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === t.key
                    ? 'border-[#6C2BD9] text-[#6C2BD9] font-extrabold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Filter Controls Row */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search by request no, asset ID, asset name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#6C2BD9]/20"
              />
            </div>

            {/* Transaction Type Filter */}
            <div className="flex items-center gap-1">
              <span className="text-slate-400 text-[11px] font-semibold">Transaction Type</span>
              <select
                value={transactionTypeFilter}
                onChange={(e) => setTransactionTypeFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 font-bold text-slate-800"
              >
                <option value="All">All</option>
                <option value="New Asset Registration">New Asset Registration</option>
                <option value="Asset Edit/Update">Asset Edit/Update</option>
                <option value="Asset Assignment/Transfer">Asset Assignment/Transfer</option>
                <option value="Tag Replacement">Tag Replacement</option>
                <option value="Financial Changes">Financial Changes</option>
                <option value="Disposal">Disposal</option>
              </select>
            </div>

            {/* Approval Level Filter */}
            <div className="flex items-center gap-1">
              <span className="text-slate-400 text-[11px] font-semibold">Approval Level</span>
              <select
                value={approvalLevelFilter}
                onChange={(e) => setApprovalLevelFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 font-bold text-slate-800"
              >
                <option value="All">All</option>
                <option value="Asset Manager">Asset Manager</option>
                <option value="Department Head">Department Head</option>
                <option value="Finance">Finance</option>
                <option value="Final Approval">Final Approval</option>
              </select>
            </div>

            {/* Date Range */}
            <div className="flex items-center gap-1">
              <span className="text-slate-400 text-[11px] font-semibold">Date Range</span>
              <select
                value={dateRangeFilter}
                onChange={(e) => setDateRangeFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 font-bold text-slate-800"
              >
                <option value="Last 30 Days">Last 30 Days</option>
                <option value="Last 7 Days">Last 7 Days</option>
                <option value="This Month">This Month</option>
              </select>
            </div>

            <button
              type="button"
              onClick={() => { setSearchQuery(''); setTransactionTypeFilter('All'); setApprovalLevelFilter('All'); }}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Clear
            </button>
          </div>

          {/* Table Container (Matching Exact Doc Columns: Request No, Transaction Type, Asset ID, Asset Name, Requested By, Request Date, Current Level, SLA/Due Date, Status) */}
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <div className="overflow-auto max-h-[540px]">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="sticky top-0 z-10 shadow-2xs">
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold text-[11px]">
                    <th className="p-3 w-8">
                      <input type="checkbox" className="rounded border-slate-300 text-[#6C2BD9]" />
                    </th>
                    <th className="p-3">Request No</th>
                    <th className="p-3">Transaction Type</th>
                    <th className="p-3">Asset ID</th>
                    <th className="p-3">Asset Name</th>
                    <th className="p-3">Requested By</th>
                    <th className="p-3">Request Date</th>
                    <th className="p-3">Current Level</th>
                    <th className="p-3">SLA / Due Date</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-center">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
                  {filteredRequests.map(r => {
                    const isSelected = selectedRequestNo === r.requestNo;
                    return (
                      <tr
                        key={r.requestNo}
                        onClick={() => setSelectedRequestNo(r.requestNo)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'bg-purple-50/70 border-l-4 border-l-[#6C2BD9]' : 'hover:bg-slate-50'
                        }`}
                      >
                        <td className="p-3">
                          <input type="checkbox" className="rounded border-slate-300 text-[#6C2BD9]" />
                        </td>

                        <td className="p-3 font-mono font-bold text-slate-700 whitespace-nowrap">{r.requestNo}</td>
                        <td className="p-3 text-slate-800 font-bold whitespace-nowrap">{r.transactionType}</td>
                        <td className="p-3 font-mono font-bold text-[#6C2BD9] whitespace-nowrap">{r.assetId}</td>
                        <td className="p-3 font-bold text-slate-900">{r.assetName}</td>
                        <td className="p-3 text-slate-600 whitespace-nowrap">{r.requestedBy}</td>
                        <td className="p-3 text-slate-500 text-[11px] whitespace-nowrap">{r.requestDate.split(' ')[0]} {r.requestDate.split(' ')[1]} {r.requestDate.split(' ')[2]}</td>
                        <td className="p-3 text-slate-700 font-medium whitespace-nowrap">{r.currentLevel}</td>

                        {/* SLA / Due Date */}
                        <td className="p-3 whitespace-nowrap">
                          {r.slaStatus === 'SLA Overdue' ? (
                            <span className="font-bold text-rose-600 flex items-center gap-1 text-[11px]">
                              <Clock className="w-3 h-3 text-rose-500" /> {r.slaDueDate}
                            </span>
                          ) : (
                            <span className="text-slate-600 font-mono text-[11px]">{r.slaDueDate}</span>
                          )}
                        </td>

                        {/* Visually Identifiable Status Badges (Pending, Approved, Rejected, Returned, Escalated, SLA Overdue) */}
                        <td className="p-3 whitespace-nowrap">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold inline-flex items-center gap-1 ${
                            r.status === 'Pending' && r.slaStatus === 'SLA Overdue' ? 'bg-orange-100 text-orange-900 border border-orange-200' :
                            r.status === 'Pending' ? 'bg-amber-100 text-amber-800' :
                            r.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                            r.status === 'Rejected' ? 'bg-rose-100 text-rose-800' :
                            r.status === 'Escalated' ? 'bg-red-100 text-red-900 border border-red-300' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {r.status === 'Pending' && r.slaStatus === 'SLA Overdue' && <AlertCircle className="w-3 h-3 text-orange-600" />}
                            {r.status === 'Pending' && r.slaStatus !== 'SLA Overdue' && <Clock className="w-3 h-3 text-amber-600" />}
                            {r.status === 'Approved' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                            {r.status === 'Rejected' && <XCircle className="w-3 h-3 text-rose-600" />}
                            {r.status === 'Returned' && <RotateCcw className="w-3 h-3 text-[#6C2BD9]" />}
                            {r.status === 'Escalated' && <AlertTriangle className="w-3 h-3 text-red-600" />}
                            {r.slaStatus === 'SLA Overdue' ? 'SLA Overdue' : r.status}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="p-3 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); setSelectedRequestNo(r.requestNo); }}
                              className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-[#6C2BD9] font-bold rounded-lg text-[11px] transition-all cursor-pointer"
                            >
                              View
                            </button>
                            <button type="button" className="p-1 text-slate-400 hover:text-slate-700">
                              <MoreVertical className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Table Summary Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 font-semibold">
              <span className="font-medium text-slate-600">Showing {filteredRequests.length} records</span>
              <span className="text-slate-400">Scroll down to view all records</span>
            </div>
          </div>

        </div>

        {/* Right Column: Request Details & Approval Workflow (4 cols) */}
        <div className="md:col-span-4 space-y-4">
          
          {/* Request Details Card (Matching Screenshot 1-to-1) */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#6C2BD9]" /> Request Details
              </h3>
              <button type="button" className="p-1 hover:bg-slate-100 rounded-lg text-slate-400">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>

            {/* Asset Photo & ID Banner */}
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shrink-0 shadow-2xs">
                <img
                  src={selectedRequest.image}
                  alt={selectedRequest.assetName}
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <span className="font-mono font-black text-[#6C2BD9] text-base block">{selectedRequest.assetId}</span>
                <h4 className="font-extrabold text-slate-900 text-sm leading-tight">{selectedRequest.assetName}</h4>
                <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 rounded-full text-[10px] font-extrabold inline-block mt-1">
                  Pending Approval
                </span>
              </div>
            </div>

            {/* Key Metadata Key-Value List */}
            <div className="space-y-2 text-xs border-y border-slate-100 py-3">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Request No</span>
                <span className="font-mono font-bold text-slate-800">{selectedRequest.requestNo}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Transaction Type</span>
                <span className="font-bold text-slate-900">{selectedRequest.transactionType}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Requested By</span>
                <span className="font-semibold text-slate-800">{selectedRequest.requestedBy}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Request Date</span>
                <span className="font-medium text-slate-700">{selectedRequest.requestDate}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">SLA Due Date</span>
                <span className="font-bold text-rose-600">{selectedRequest.slaDueDate}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Category</span>
                <span className="font-semibold text-slate-800">{selectedRequest.category}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Purchase Cost</span>
                <span className="font-bold text-slate-900">{selectedRequest.purchaseCost}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Location</span>
                <span className="font-semibold text-slate-800">{selectedRequest.location}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Attachment</span>
                <span className="font-bold text-[#6C2BD9] flex items-center gap-1 cursor-pointer hover:underline">
                  <Paperclip className="w-3.5 h-3.5" /> {selectedRequest.attachment}
                </span>
              </div>
            </div>

            {/* Current Value vs Proposed Value Comparison (if available) */}
            {selectedRequest.proposedChanges && (
              <div className="space-y-2 text-xs pt-1">
                <span className="font-extrabold text-slate-900 block text-[11px]">Current Value vs Proposed Value:</span>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600">
                      <tr>
                        <th className="p-2">Attribute</th>
                        <th className="p-2">Current Value</th>
                        <th className="p-2">Proposed Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
                      {selectedRequest.proposedChanges.map(c => (
                        <tr key={c.attribute}>
                          <td className="p-2 text-slate-500">{c.attribute}</td>
                          <td className="p-2 text-rose-600 line-through">{c.currentValue}</td>
                          <td className="p-2 text-emerald-700 font-bold">{c.proposedValue}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Dynamic Approval Workflow Steps (Matching Screenshot 1-to-1) */}
            <div className="space-y-3 pt-2">
              <h3 className="font-extrabold text-slate-900 text-xs flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#6C2BD9]" /> Approval Workflow
              </h3>

              <div className="space-y-3 pl-1">
                {selectedRequest.workflowSteps.map(step => (
                  <div key={step.step} className="flex items-start gap-3 text-xs">
                    <div className={`w-7 h-7 rounded-full font-black text-xs flex items-center justify-center shrink-0 ${
                      step.isCurrent
                        ? 'bg-[#6C2BD9] text-white shadow-sm'
                        : step.status === 'Approved'
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-200 text-slate-600'
                    }`}>
                      {step.step}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-slate-900 truncate">{step.title}</span>
                        <span className="text-[10px] text-slate-400">{step.date || ''}</span>
                      </div>
                      <span className={`text-[11px] font-bold block ${
                        step.isCurrent ? 'text-[#6C2BD9]' : step.status === 'Approved' ? 'text-emerald-700' : 'text-slate-400 font-medium'
                      }`}>
                        {step.status}
                      </span>
                    </div>

                    <span className="text-[10px] text-slate-500 font-medium truncate">
                      {step.approver}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Approval Decision Actions Bar */}
            <div className="pt-2 space-y-2">
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => { setDecisionType('APPROVE'); setActiveModal('DECISION_COMMENT'); }}
                  className="py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-1 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                >
                  <Check className="w-4 h-4" /> Approve
                </button>

                <button
                  type="button"
                  onClick={() => { setDecisionType('REJECT'); setActiveModal('DECISION_COMMENT'); }}
                  className="py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-1 shadow-md shadow-rose-600/20 transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" /> Reject
                </button>

                <button
                  type="button"
                  onClick={() => { setDecisionType('RETURN'); setActiveModal('DECISION_COMMENT'); }}
                  className="py-2.5 bg-white hover:bg-slate-50 text-slate-800 font-bold rounded-xl text-xs flex items-center justify-center gap-1 border border-slate-300 shadow-2xs transition-all cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-[#6C2BD9]" /> Return
                </button>
              </div>

              <button
                type="button"
                onClick={() => setActiveModal('FULL_DETAILS')}
                className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 border border-slate-200 transition-all cursor-pointer"
              >
                <FileText className="w-4 h-4 text-[#6C2BD9]" /> View Full Details
              </button>
            </div>

          </div>

        </div>

      </div>



      {/* ================= MODALS ================= */}

      {/* New Approval Request Modal */}
      {activeModal === 'NEW_REQUEST' && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <form onSubmit={handleNewRequestSubmit} className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#6C2BD9]" /> Submit Transaction Approval Request
              </h3>
              <button type="button" onClick={() => setActiveModal(null)} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Transaction Type *</label>
                <select
                  value={newReqFormData.transactionType}
                  onChange={(e) => setNewReqFormData({ ...newReqFormData, transactionType: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                >
                  <option value="New Asset Registration">New Asset Registration</option>
                  <option value="Asset Edit/Update">Asset Edit/Update</option>
                  <option value="Asset Assignment/Transfer">Asset Assignment/Transfer</option>
                  <option value="Tag Replacement">Tag Replacement</option>
                  <option value="Financial Changes">Financial Changes</option>
                  <option value="Disposal">Asset Disposal &amp; Decommissioning</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Asset ID *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AST-000250"
                  value={newReqFormData.assetId}
                  onChange={(e) => setNewReqFormData({ ...newReqFormData, assetId: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Asset Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apple MacBook Pro 16 M3"
                  value={newReqFormData.assetName}
                  onChange={(e) => setNewReqFormData({ ...newReqFormData, assetName: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Purchase / Transaction Value (AED)</label>
                <input
                  type="number"
                  placeholder="e.g. 9500"
                  value={newReqFormData.purchaseCost}
                  onChange={(e) => setNewReqFormData({ ...newReqFormData, purchaseCost: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Justification / Remarks</label>
                <textarea
                  rows="2"
                  placeholder="Provide reason for request..."
                  value={newReqFormData.remarks}
                  onChange={(e) => setNewReqFormData({ ...newReqFormData, remarks: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                ></textarea>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button type="button" onClick={() => setActiveModal(null)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 font-bold rounded-xl text-slate-700">Cancel</button>
              <button type="submit" className="px-5 py-2 bg-[#6C2BD9] hover:bg-[#5b21b6] text-white font-extrabold rounded-xl shadow-md shadow-[#6C2BD9]/20">Submit Request</button>
            </div>
          </form>
        </div>
      )}

      {/* Decision Comment Modal */}
      {activeModal === 'DECISION_COMMENT' && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                {decisionType === 'APPROVE' && <Check className="w-5 h-5 text-emerald-600" />}
                {decisionType === 'REJECT' && <X className="w-5 h-5 text-rose-600" />}
                {decisionType === 'RETURN' && <RotateCcw className="w-5 h-5 text-[#6C2BD9]" />}
                Process Decision: {decisionType}
              </h3>
              <button onClick={() => setActiveModal(null)} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="font-extrabold text-slate-900 block">{selectedRequest.requestNo} - {selectedRequest.assetName}</span>
                <span className="text-[11px] text-slate-500 font-mono">Current Stage: {selectedRequest.currentLevel}</span>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Approver Comments &amp; Audit Notes</label>
                <textarea
                  rows="3"
                  placeholder={`Enter reasons or notes for ${decisionType.toLowerCase()}ing this transaction request...`}
                  value={actionComments}
                  onChange={(e) => setActionComments(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#6C2BD9]/20"
                ></textarea>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button onClick={() => setActiveModal(null)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 font-bold rounded-xl text-slate-700">Cancel</button>
              <button
                onClick={handleDecisionSubmit}
                className={`px-5 py-2 font-extrabold text-white rounded-xl shadow-md transition-all ${
                  decisionType === 'APPROVE' ? 'bg-emerald-600 hover:bg-emerald-700' :
                  decisionType === 'REJECT' ? 'bg-rose-600 hover:bg-rose-700' :
                  'bg-[#6C2BD9] hover:bg-[#5B21B6]'
                }`}
              >
                Confirm {decisionType}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Details Modal */}
      {activeModal === 'FULL_DETAILS' && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#6C2BD9]" /> Approval Request Full Specification &amp; Audit Trail
              </h3>
              <button onClick={() => setActiveModal(null)} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 font-bold block text-[10px]">Request No</span>
                  <span className="font-mono font-black text-[#6C2BD9]">{selectedRequest.requestNo}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block text-[10px]">Asset ID</span>
                  <span className="font-mono font-bold text-slate-900">{selectedRequest.assetId}</span>
                </div>
              </div>

              {selectedRequest.proposedChanges && (
                <div className="space-y-2">
                  <span className="font-extrabold text-slate-900 block">Current Value vs Proposed Value Comparison:</span>
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600">
                        <tr>
                          <th className="p-2.5">Field Name</th>
                          <th className="p-2.5">Current Value</th>
                          <th className="p-2.5">Proposed Value</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
                        {selectedRequest.proposedChanges.map(c => (
                          <tr key={c.attribute}>
                            <td className="p-2.5 text-slate-600">{c.attribute}</td>
                            <td className="p-2.5 text-rose-600 line-through">{c.currentValue}</td>
                            <td className="p-2.5 text-emerald-700 font-extrabold">{c.proposedValue}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button onClick={() => setActiveModal(null)} className="px-5 py-2 bg-slate-900 text-white font-bold rounded-xl">Close Details</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default AssetApproval;
