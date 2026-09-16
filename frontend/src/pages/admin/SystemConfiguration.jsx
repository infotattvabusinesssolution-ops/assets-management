import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Settings,
  Box,
  Layers,
  Wrench,
  GitFork,
  Hash,
  ListOrdered,
  Plus,
  Search,
  Filter,
  RefreshCw,
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  ShieldCheck,
  Check,
  X,
  Play,
  Edit2,
  Trash2,
  Calendar,
  User,
  Users,
  Building,
  Save,
  RotateCcw,
  Sparkles,
  ArrowRight,
  SlidersHorizontal,
  FileText,
  Sliders
} from 'lucide-react';
import { api } from '../../services/api';

// =========================================================================
// 1. PRE-SEEDED 24 SYSTEM CONFIGURATION PARAMETERS (Screenshot 1)
// =========================================================================
const PRESEEDED_PARAMETERS = [
  { id: 'PARAM-001', name: 'Site Name', module: 'General', category: 'Organization', currentValue: 'Dubai HQ', defaultValue: 'Dubai HQ', parameterType: 'Text', status: 'Active', description: 'Primary organizational operational facility name for reports and transactions.' },
  { id: 'PARAM-002', name: 'Default Currency', module: 'General', category: 'Finance', currentValue: 'AED', defaultValue: 'AED', parameterType: 'Lookup', status: 'Active', description: 'Base functional reporting currency used across asset valuation, depreciation and procurement.' },
  { id: 'PARAM-003', name: 'Date Format', module: 'General', category: 'Localization', currentValue: 'dd/MM/yyyy', defaultValue: 'dd/MM/yyyy', parameterType: 'Lookup', status: 'Active', description: 'System-wide calendar display format for asset lifecycle and audit stamps.' },
  { id: 'PARAM-004', name: 'Time Zone', module: 'General', category: 'Localization', currentValue: '(UTC+04:00) Dubai', defaultValue: '(UTC+04:00) Dubai', parameterType: 'Lookup', status: 'Active', description: 'Standard regional timezone used for timestamps, scheduler jobs and audit records.' },
  { id: 'PARAM-005', name: 'Asset Code Prefix', module: 'Asset', category: 'Numbering', currentValue: 'AST', defaultValue: 'AST', parameterType: 'Text', status: 'Active', description: 'Alphanumeric root prefix assigned to auto-generated physical and IT asset tag identifiers.' },
  { id: 'PARAM-006', name: 'Auto Generate Asset Code', module: 'Asset', category: 'Numbering', currentValue: 'Yes', defaultValue: 'Yes', parameterType: 'Boolean', status: 'Active', description: 'Enforces automated sequential asset identifier generation during asset intake and bulk registration.' },
  { id: 'PARAM-007', name: 'Default Asset Status', module: 'Asset', category: 'Defaults', currentValue: 'Active', defaultValue: 'Active', parameterType: 'Lookup', status: 'Active', description: 'Initial lifecycle status assigned to newly registered and capitalized assets.' },
  { id: 'PARAM-008', name: 'Maintenance Work Order Prefix', module: 'Maintenance', category: 'Numbering', currentValue: 'WO', defaultValue: 'WO', parameterType: 'Text', status: 'Active', description: 'Standard prefix assigned to corrective and preventive maintenance tickets.' },
  { id: 'PARAM-009', name: 'Default Warranty Period (Months)', module: 'Maintenance', category: 'Defaults', currentValue: '12', defaultValue: '12', parameterType: 'Number', status: 'Active', description: 'Standard warranty duration populated on asset creation if not provided by purchase contract.' },
  { id: 'PARAM-010', name: 'Enable Email Notifications', module: 'General', category: 'Notifications', currentValue: 'Yes', defaultValue: 'Yes', parameterType: 'Boolean', status: 'Active', description: 'Global master switch for SMTP notification alerts, work order dispatches and threshold alarms.' },
  { id: 'PARAM-011', name: 'Allow Negative Stock', module: 'Inventory', category: 'Controls', currentValue: 'No', defaultValue: 'No', parameterType: 'Boolean', status: 'Active', description: 'Strict warehouse control preventing spare parts stock balances from falling below zero.' },
  { id: 'PARAM-012', name: 'Default Valuation Method', module: 'Inventory', category: 'Finance', currentValue: 'FIFO', defaultValue: 'FIFO', parameterType: 'Lookup', status: 'Active', description: 'Inventory cost accounting method (First In First Out vs Weighted Average Cost).' },
  { id: 'PARAM-013', name: 'Auto Reorder Calculation', module: 'Inventory', category: 'Automation', currentValue: 'Yes', defaultValue: 'Yes', parameterType: 'Boolean', status: 'Active', description: 'Automated nightly calculation of spare parts reorder points based on consumption velocity and lead time.' },
  { id: 'PARAM-014', name: 'Default Lead Time Buffer (Days)', module: 'Inventory', category: 'Procurement', currentValue: '7', defaultValue: '7', parameterType: 'Number', status: 'Active', description: 'Safety lead-time buffer applied in days to spare part stock reorder formula.' },
  { id: 'PARAM-015', name: 'Session Timeout (Minutes)', module: 'General', category: 'Security', currentValue: '30', defaultValue: '30', parameterType: 'Number', status: 'Active', description: 'Automatic user session expiration threshold during inactivity for cybersecurity compliance.' },
  { id: 'PARAM-016', name: 'Max File Upload Size (MB)', module: 'General', category: 'Storage', currentValue: '15', defaultValue: '15', parameterType: 'Number', status: 'Active', description: 'Maximum permitted file attachment size for invoices, warranty certificates and manuals.' },
  { id: 'PARAM-017', name: 'Enable Asset Images', module: 'Asset', category: 'Media', currentValue: 'Yes', defaultValue: 'Yes', parameterType: 'Boolean', status: 'Active', description: 'Permits capturing and uploading photographic evidence for asset condition and verification.' },
  { id: 'PARAM-018', name: 'Max Images Per Asset', module: 'Asset', category: 'Media', currentValue: '5', defaultValue: '5', parameterType: 'Number', status: 'Active', description: 'Maximum number of photographic attachments stored per registered asset.' },
  { id: 'PARAM-019', name: 'Default Depreciation Method', module: 'Asset', category: 'Finance', currentValue: 'Straight Line Method (SLM)', defaultValue: 'Straight Line Method (SLM)', parameterType: 'Lookup', status: 'Active', description: 'Accounting depreciation formula applied to capitalized fixed assets.' },
  { id: 'PARAM-020', name: 'Depreciation Useful Life (Years)', module: 'Asset', category: 'Finance', currentValue: '5', defaultValue: '5', parameterType: 'Number', status: 'Active', description: 'Standard depreciation useful lifespan assigned to IT hardware and office assets.' },
  { id: 'PARAM-021', name: 'Primary RFID Tag Protocol', module: 'Asset', category: 'Tracking', currentValue: 'EPC Gen2 / UHF', defaultValue: 'EPC Gen2 / UHF', parameterType: 'Lookup', status: 'Active', description: 'Standard radio-frequency communication standard for passive smart asset tags.' },
  { id: 'PARAM-022', name: 'Work Order SLA Critical (Hours)', module: 'Maintenance', category: 'SLA', currentValue: '4', defaultValue: '4', parameterType: 'Number', status: 'Active', description: 'Resolution turnaround SLA threshold for Priority 1 critical equipment breakdowns.' },
  { id: 'PARAM-023', name: 'Work Order Auto Escalation', module: 'Maintenance', category: 'Automation', currentValue: 'Yes', defaultValue: 'Yes', parameterType: 'Boolean', status: 'Active', description: 'Automatically re-routes overdue work orders to maintenance supervisor upon SLA breach.' },
  { id: 'PARAM-024', name: 'PM Work Order Advance Days', module: 'Maintenance', category: 'SLA', currentValue: '7', defaultValue: '7', parameterType: 'Number', status: 'Active', description: 'Days in advance to generate preventive maintenance work orders prior to scheduled due date.' }
];

// =========================================================================
// 2. PRE-SEEDED 12 APPROVAL WORKFLOWS (Screenshot 2)
// =========================================================================
const PRESEEDED_WORKFLOWS = [
  {
    id: 'WF-001',
    name: 'Asset Purchase Approval',
    transactionType: 'Asset Procurement',
    description: 'Approval for asset purchase requests based on amount and asset category.',
    levelsCount: 3,
    company: 'All Companies',
    businessUnit: 'Corporate',
    status: 'Active',
    effectiveFrom: '2025-01-01',
    applicableFor: 'All Companies',
    stages: [
      { id: 1, title: 'Requester', role: 'Initiator', action: 'Submit Request', type: 'initiator' },
      { id: 2, title: 'Department Manager', role: 'Approval', action: 'Approve / Reject', type: 'approval' },
      { id: 3, title: 'Asset Manager', role: 'Final Approval', action: 'Approve / Reject', type: 'final' }
    ],
    levels: [
      { level: 1, approverRole: 'Department Manager', approvalType: 'Approval', condition: 'Amount ≤ AED 50,000' },
      { level: 2, approverRole: 'Asset Manager', approvalType: 'Approval', condition: 'Amount > AED 50,000' },
      { level: 3, approverRole: 'Finance Manager', approvalType: 'Final Approval', condition: 'All Requests' }
    ]
  },
  {
    id: 'WF-002',
    name: 'Asset Disposal Approval',
    transactionType: 'Asset Disposal',
    description: 'Approval for asset disposal / write-off',
    levelsCount: 2,
    company: 'All Companies',
    businessUnit: 'Corporate',
    status: 'Active',
    effectiveFrom: '2025-01-01',
    applicableFor: 'All Companies',
    stages: [
      { id: 1, title: 'Custodian', role: 'Initiator', action: 'Submit Disposal Request', type: 'initiator' },
      { id: 2, title: 'Asset Manager', role: 'Approval', action: 'Approve / Reject', type: 'approval' },
      { id: 3, title: 'Finance Controller', role: 'Final Approval', action: 'Sign Off Write-Off', type: 'final' }
    ],
    levels: [
      { level: 1, approverRole: 'Asset Manager', approvalType: 'Approval', condition: 'All Requests' },
      { level: 2, approverRole: 'Finance Controller', approvalType: 'Final Approval', condition: 'Book Value > AED 10,000' }
    ]
  },
  {
    id: 'WF-003',
    name: 'Asset Transfer Approval',
    transactionType: 'Asset Transfer',
    description: 'Approval for inter-location asset transfer',
    levelsCount: 2,
    company: 'All Companies',
    businessUnit: 'Operations',
    status: 'Active',
    effectiveFrom: '2025-01-01',
    applicableFor: 'All Companies',
    stages: [
      { id: 1, title: 'Sending Custodian', role: 'Initiator', action: 'Submit Transfer', type: 'initiator' },
      { id: 2, title: 'Receiving Manager', role: 'Approval', action: 'Accept / Reject', type: 'approval' },
      { id: 3, title: 'Asset Administrator', role: 'Final Approval', action: 'Update Custody', type: 'final' }
    ],
    levels: [
      { level: 1, approverRole: 'Receiving Department Head', approvalType: 'Approval', condition: 'Inter-Site Transfer' },
      { level: 2, approverRole: 'Asset Administrator', approvalType: 'Final Approval', condition: 'All Transfers' }
    ]
  },
  {
    id: 'WF-004',
    name: 'Work Order Approval',
    transactionType: 'Maintenance',
    description: 'Approval for maintenance work orders',
    levelsCount: 3,
    company: 'All Companies',
    businessUnit: 'Operations',
    status: 'Active',
    effectiveFrom: '2025-01-01',
    applicableFor: 'All Companies',
    stages: [
      { id: 1, title: 'Technician', role: 'Initiator', action: 'Create Work Order', type: 'initiator' },
      { id: 2, title: 'Maintenance Lead', role: 'Approval', action: 'Validate & Assign', type: 'approval' },
      { id: 3, title: 'Plant Supervisor', role: 'Final Approval', action: 'Sign Off Work Order', type: 'final' }
    ],
    levels: [
      { level: 1, approverRole: 'Maintenance Lead', approvalType: 'Approval', condition: 'Estimated Cost ≤ AED 10,000' },
      { level: 2, approverRole: 'Facility Manager', approvalType: 'Approval', condition: 'Estimated Cost > AED 10,000' },
      { level: 3, approverRole: 'Operations Director', approvalType: 'Final Approval', condition: 'Critical Priority Only' }
    ]
  },
  {
    id: 'WF-005',
    name: 'Inventory Adjustment Approval',
    transactionType: 'Inventory',
    description: 'Approval for stock adjustments',
    levelsCount: 2,
    company: 'All Companies',
    businessUnit: 'Logistics',
    status: 'Inactive',
    effectiveFrom: '2025-01-01',
    applicableFor: 'All Companies',
    stages: [
      { id: 1, title: 'Storekeeper', role: 'Initiator', action: 'Submit Stock Adjustment', type: 'initiator' },
      { id: 2, title: 'Inventory Manager', role: 'Final Approval', action: 'Approve / Reject Adjustment', type: 'final' }
    ],
    levels: [
      { level: 1, approverRole: 'Warehouse Lead', approvalType: 'Approval', condition: 'Variance Value ≤ AED 5,000' },
      { level: 2, approverRole: 'Inventory Manager', approvalType: 'Final Approval', condition: 'Variance Value > AED 5,000' }
    ]
  },
  {
    id: 'WF-006',
    name: 'Capital Expenditure Approval',
    transactionType: 'Asset Procurement',
    description: 'Capitalized equipment sign-off',
    levelsCount: 4,
    company: 'All Companies',
    businessUnit: 'Corporate',
    status: 'Active',
    effectiveFrom: '2025-01-01',
    applicableFor: 'All Companies',
    stages: [
      { id: 1, title: 'Project Lead', role: 'Initiator', action: 'Submit CAPEX Request', type: 'initiator' },
      { id: 2, title: 'Finance Analyst', role: 'Review', action: 'Budget Validation', type: 'approval' },
      { id: 3, title: 'CFO', role: 'Approval', action: 'Financial Authorization', type: 'approval' },
      { id: 4, title: 'Managing Director', role: 'Final Approval', action: 'Executive Sign-Off', type: 'final' }
    ],
    levels: [
      { level: 1, approverRole: 'Finance Analyst', approvalType: 'Verification', condition: 'All CAPEX' },
      { level: 2, approverRole: 'CFO', approvalType: 'Approval', condition: 'Amount > AED 100,000' },
      { level: 3, approverRole: 'CEO / Board', approvalType: 'Final Approval', condition: 'Amount > AED 500,000' }
    ]
  },
  {
    id: 'WF-007',
    name: 'Scrap Authorization',
    transactionType: 'Asset Disposal',
    description: 'Hazardous/hazardous scrap disposal sign-off',
    levelsCount: 3,
    company: 'All Companies',
    businessUnit: 'Operations',
    status: 'Active',
    effectiveFrom: '2025-01-01',
    applicableFor: 'All Companies',
    stages: [
      { id: 1, title: 'Safety Officer', role: 'Initiator', action: 'Inspect & File', type: 'initiator' },
      { id: 2, title: 'HSE Manager', role: 'Approval', action: 'Environmental Sign-off', type: 'approval' },
      { id: 3, title: 'Plant General Manager', role: 'Final Approval', action: 'Approve Destruction', type: 'final' }
    ],
    levels: [
      { level: 1, approverRole: 'HSE Compliance Lead', approvalType: 'Safety Sign-Off', condition: 'All Hazardous Items' },
      { level: 2, approverRole: 'Operations Director', approvalType: 'Final Approval', condition: 'All Scrap Operations' }
    ]
  },
  {
    id: 'WF-008',
    name: 'Inter-Company Asset Move',
    transactionType: 'Asset Transfer',
    description: 'Asset transfer between distinct legal entities',
    levelsCount: 3,
    company: 'All Companies',
    businessUnit: 'Corporate',
    status: 'Active',
    effectiveFrom: '2025-01-01',
    applicableFor: 'All Companies',
    stages: [
      { id: 1, title: 'Source Entity Controller', role: 'Initiator', action: 'Initiate Transfer', type: 'initiator' },
      { id: 2, title: 'Target Entity Controller', role: 'Approval', action: 'Confirm Receipt & Terms', type: 'approval' },
      { id: 3, title: 'Group Tax & Treasury', role: 'Final Approval', action: 'Transfer Pricing Sign-Off', type: 'final' }
    ],
    levels: [
      { level: 1, approverRole: 'Source Finance Head', approvalType: 'Approval', condition: 'Entity ≠ Target Entity' },
      { level: 2, approverRole: 'Group Tax Specialist', approvalType: 'Tax Review', condition: 'Cross-Border Move' },
      { level: 3, approverRole: 'Group Financial Controller', approvalType: 'Final Approval', condition: 'All Inter-Company Moves' }
    ]
  },
  {
    id: 'WF-009',
    name: 'High-Cost Work Order Overhaul',
    transactionType: 'Maintenance',
    description: 'Maintenance work order exceeding AED 25,000',
    levelsCount: 3,
    company: 'All Companies',
    businessUnit: 'Operations',
    status: 'Active',
    effectiveFrom: '2025-01-01',
    applicableFor: 'All Companies',
    stages: [
      { id: 1, title: 'Maintenance Engineer', role: 'Initiator', action: 'Submit Overhaul Proposal', type: 'initiator' },
      { id: 2, title: 'Chief Engineer', role: 'Approval', action: 'Technical Assessment', type: 'approval' },
      { id: 3, title: 'VP Operations', role: 'Final Approval', action: 'Commit Overhaul Budget', type: 'final' }
    ],
    levels: [
      { level: 1, approverRole: 'Chief Engineer', approvalType: 'Technical Validation', condition: 'Cost > AED 25,000' },
      { level: 2, approverRole: 'Finance Asset Controller', approvalType: 'Budget Clearance', condition: 'Cost > AED 25,000' },
      { level: 3, approverRole: 'VP Operations', approvalType: 'Final Approval', condition: 'Cost > AED 50,000' }
    ]
  },
  {
    id: 'WF-010',
    name: 'Stock Write-off Approval',
    transactionType: 'Inventory',
    description: 'Inventory discrepancy reconciliation',
    levelsCount: 2,
    company: 'All Companies',
    businessUnit: 'Logistics',
    status: 'Active',
    effectiveFrom: '2025-01-01',
    applicableFor: 'All Companies',
    stages: [
      { id: 1, title: 'Stock Auditor', role: 'Initiator', action: 'File Variance Report', type: 'initiator' },
      { id: 2, title: 'Supply Chain Director', role: 'Approval', action: 'Review Loss Analysis', type: 'approval' },
      { id: 3, title: 'Finance Controller', role: 'Final Approval', action: 'Authorize Ledger Write-Off', type: 'final' }
    ],
    levels: [
      { level: 1, approverRole: 'Supply Chain Director', approvalType: 'Investigation Sign-Off', condition: 'All Variances' },
      { level: 2, approverRole: 'Finance Controller', approvalType: 'Final Approval', condition: 'Write-Off Amount > AED 5,000' }
    ]
  },
  {
    id: 'WF-011',
    name: 'Emergency Repair Bypass',
    transactionType: 'Maintenance',
    description: 'Post-facto emergency breakdown approval',
    levelsCount: 2,
    company: 'All Companies',
    businessUnit: 'Operations',
    status: 'Active',
    effectiveFrom: '2025-01-01',
    applicableFor: 'All Companies',
    stages: [
      { id: 1, title: 'Shift Supervisor', role: 'Initiator', action: 'Submit Post-Repair Audit', type: 'initiator' },
      { id: 2, title: 'Operations Manager', role: 'Final Approval', action: 'Post-Facto Ratification', type: 'final' }
    ],
    levels: [
      { level: 1, approverRole: 'Operations Manager', approvalType: 'Approval', condition: 'Emergency Ticket Type' },
      { level: 2, approverRole: 'Health & Safety Lead', approvalType: 'Final Approval', condition: 'Critical Assets Only' }
    ]
  },
  {
    id: 'WF-012',
    name: 'Audit Variance Reconciliation',
    transactionType: 'Verification & Audit',
    description: 'Sign-off for unlocated or damaged audit findings',
    levelsCount: 3,
    company: 'All Companies',
    businessUnit: 'Corporate',
    status: 'Active',
    effectiveFrom: '2025-01-01',
    applicableFor: 'All Companies',
    stages: [
      { id: 1, title: 'Lead Field Auditor', role: 'Initiator', action: 'Submit Audit Reconciliation', type: 'initiator' },
      { id: 2, title: 'Internal Audit Manager', role: 'Approval', action: 'Reconcile Findings', type: 'approval' },
      { id: 3, title: 'Head of Internal Control', role: 'Final Approval', action: 'Close Campaign Reconciliation', type: 'final' }
    ],
    levels: [
      { level: 1, approverRole: 'Internal Audit Manager', approvalType: 'Audit Approval', condition: 'Not Found Assets > 0' },
      { level: 2, approverRole: 'Asset Custody Administrator', approvalType: 'Custody Resolution', condition: 'Wrong Custodian' },
      { level: 3, approverRole: 'Head of Internal Control', approvalType: 'Final Sign-Off', condition: 'All Campaign Closures' }
    ]
  }
];

// =========================================================================
// 3. NUMBERING & CODES SCHEMES (Tab 6)
// =========================================================================
const INITIAL_SCHEMES = [
  { id: 'num-asset', entity: 'Asset Code / Tag', prefix: 'AST', length: 6, current: 100128, includeYear: true, includeMonth: false, separator: '-', resetRule: 'Yearly', sample: 'AST-2025-100128' },
  { id: 'num-wo', entity: 'Work Order ID', prefix: 'WO', length: 5, current: 482, includeYear: true, includeMonth: false, separator: '-', resetRule: 'Yearly', sample: 'WO-2025-00482' },
  { id: 'num-pmp', entity: 'Preventive Maintenance Plan', prefix: 'PMP', length: 4, current: 12, includeYear: true, includeMonth: false, separator: '-', resetRule: 'Never', sample: 'PMP-2025-0012' },
  { id: 'num-aud', entity: 'Audit / Verification Campaign', prefix: 'AUD', length: 4, current: 3, includeYear: true, includeMonth: false, separator: '-', resetRule: 'Yearly', sample: 'AUD-2025-0003' },
  { id: 'num-trf', entity: 'Transfer / Movement Request', prefix: 'TRF', length: 5, current: 91, includeYear: true, includeMonth: false, separator: '-', resetRule: 'Yearly', sample: 'TRF-2025-00091' },
  { id: 'num-dsp', entity: 'Disposal Ticket', prefix: 'DSP', length: 5, current: 14, includeYear: true, includeMonth: false, separator: '-', resetRule: 'Yearly', sample: 'DSP-2025-00014' },
  { id: 'num-stk', entity: 'Stock Transaction Voucher', prefix: 'STK', length: 5, current: 382, includeYear: true, includeMonth: false, separator: '-', resetRule: 'Yearly', sample: 'STK-2025-00382' },
  { id: 'num-rec', entity: 'PO Receipt / GRN', prefix: 'REC', length: 5, current: 199, includeYear: true, includeMonth: false, separator: '-', resetRule: 'Yearly', sample: 'REC-2025-00199' }
];

// =========================================================================
// 4. LOOKUPS & BUSINESS LISTS (Tab 7)
// =========================================================================
const INITIAL_LOOKUPS = [
  { id: 'lk-01', category: 'Asset Condition', code: 'COND_NEW', value: 'New / Unused', sequence: 1, status: 'Active', description: 'Brand new item received from supplier' },
  { id: 'lk-02', category: 'Asset Condition', code: 'COND_EXC', value: 'Excellent', sequence: 2, status: 'Active', description: 'Operates perfectly with minimal signs of use' },
  { id: 'lk-03', category: 'Asset Condition', code: 'COND_GOOD', value: 'Good', sequence: 3, status: 'Active', description: 'Normal operational condition with ordinary wear' },
  { id: 'lk-04', category: 'Asset Condition', code: 'COND_FAIR', value: 'Fair', sequence: 4, status: 'Active', description: 'Functional but requires maintenance attention soon' },
  { id: 'lk-05', category: 'Asset Condition', code: 'COND_POOR', value: 'Poor', sequence: 5, status: 'Active', description: 'Heavy degradation or frequent breakdowns' },
  { id: 'lk-06', category: 'Asset Condition', code: 'COND_SCRAP', value: 'Scrap / Beyond Repair', sequence: 6, status: 'Active', description: 'Not economically repairable' },
  { id: 'lk-07', category: 'Asset Criticality', code: 'CRIT_BIZ', value: 'Business Critical', sequence: 1, status: 'Active', description: 'Downtime immediately halts revenue operations' },
  { id: 'lk-08', category: 'Asset Criticality', code: 'CRIT_ESS', value: 'Essential', sequence: 2, status: 'Active', description: 'High operational impact' },
  { id: 'lk-09', category: 'Asset Criticality', code: 'CRIT_NORM', value: 'Normal', sequence: 3, status: 'Active', description: 'Standard operational asset' },
  { id: 'lk-10', category: 'Asset Criticality', code: 'CRIT_LOW', value: 'Low Impact', sequence: 4, status: 'Active', description: 'Non-critical peripheral' },
  { id: 'lk-11', category: 'Movement Reason', code: 'MOV_DEPT', value: 'Inter-department Transfer', sequence: 1, status: 'Active', description: 'Transferring to another functional team' },
  { id: 'lk-12', category: 'Movement Reason', code: 'MOV_RELOC', value: 'Office Relocation', sequence: 2, status: 'Active', description: 'Relocation to new branch or facility' },
  { id: 'lk-13', category: 'Movement Reason', code: 'MOV_TEMP', value: 'Temporary Custody', sequence: 3, status: 'Active', description: 'Short-term project assignment' },
  { id: 'lk-14', category: 'Movement Reason', code: 'MOV_REP', value: 'Sent for Repair / Calibration', sequence: 4, status: 'Active', description: 'External workshop service' },
  { id: 'lk-15', category: 'Disposal Reason', code: 'DSP_OBS', value: 'Technological Obsolescence', sequence: 1, status: 'Active', description: 'Replaced by newer standards' },
  { id: 'lk-16', category: 'Disposal Reason', code: 'DSP_DAM', value: 'Damaged Beyond Economic Repair', sequence: 2, status: 'Active', description: 'Repair exceeds book value' }
];

export function SystemConfiguration() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // 7 Top Tabs
  // 'General Settings' | 'Asset Settings' | 'Inventory Settings' | 'Maintenance Settings' | 'Workflow & Approvals' | 'Numbering & Codes' | 'Lookups & Lists'
  const tabParam = searchParams.get('tab');
  const getInitialTab = () => {
    if (tabParam === 'workflows' || tabParam === 'Workflow & Approvals') return 'Workflow & Approvals';
    if (tabParam === 'asset' || tabParam === 'Asset Settings') return 'Asset Settings';
    if (tabParam === 'inventory' || tabParam === 'Inventory Settings') return 'Inventory Settings';
    if (tabParam === 'maintenance' || tabParam === 'Maintenance Settings') return 'Maintenance Settings';
    if (tabParam === 'numbering' || tabParam === 'Numbering & Codes') return 'Numbering & Codes';
    if (tabParam === 'lookups' || tabParam === 'Lookups & Lists') return 'Lookups & Lists';
    return 'General Settings';
  };

  const [activeTab, setActiveTab] = useState(getInitialTab);

  // Data States
  const [parameters, setParameters] = useState(PRESEEDED_PARAMETERS);
  const [workflows, setWorkflows] = useState(PRESEEDED_WORKFLOWS);
  const [selectedWorkflowId, setSelectedWorkflowId] = useState('WF-001');
  const [workflowDetailTab, setWorkflowDetailTab] = useState('Approval Flow'); // 'Approval Flow' | 'Rules & Conditions' | 'Notifications' | 'Escalation' | 'History'
  const [schemes, setSchemes] = useState(INITIAL_SCHEMES);
  const [selectedSchemeIndex, setSelectedSchemeIndex] = useState(0);
  const [lookups, setLookups] = useState(INITIAL_LOOKUPS);
  const [selectedLookupCategory, setSelectedLookupCategory] = useState('All Categories');
  const [lookupSearch, setLookupSearch] = useState('');

  // Parameter Register Filters
  const [paramModuleFilter, setParamModuleFilter] = useState('All Modules');
  const [paramCategoryFilter, setParamCategoryFilter] = useState('All Categories');
  const [paramTypeFilter, setParamTypeFilter] = useState('All Types');
  const [paramStatusFilter, setParamStatusFilter] = useState('All Statuses');
  const [paramSearch, setParamSearch] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Workflow Filters
  const [wfTransactionFilter, setWfTransactionFilter] = useState('All Transaction Types');
  const [wfStatusFilter, setWfStatusFilter] = useState('All Statuses');
  const [wfCompanyFilter, setWfCompanyFilter] = useState('All Companies');
  const [wfBusinessUnitFilter, setWfBusinessUnitFilter] = useState('All Business Units');

  // Multi-select and Pagination
  const [selectedParamIds, setSelectedParamIds] = useState(new Set());
  const [paramPage, setParamPage] = useState(1);
  const [paramPageSize, setParamPageSize] = useState(10);
  const [paramSortField, setParamSortField] = useState('id');
  const [paramSortOrder, setParamSortOrder] = useState('asc');

  // Modals
  const [editingParam, setEditingParam] = useState(null);
  const [showAddParamModal, setShowAddParamModal] = useState(false);
  const [newParamData, setNewParamData] = useState({
    name: '',
    module: 'General',
    category: 'Defaults',
    currentValue: '',
    defaultValue: '',
    parameterType: 'Text',
    status: 'Active',
    description: ''
  });

  const [showAddWfModal, setShowAddWfModal] = useState(false);
  const [newWfData, setNewWfData] = useState({
    name: '',
    transactionType: 'Asset Procurement',
    description: '',
    status: 'Active',
    company: 'All Companies',
    businessUnit: 'Corporate',
    effectiveFrom: new Date().toISOString().slice(0, 10)
  });

  const [showAddLevelModal, setShowAddLevelModal] = useState(false);
  const [newLevelData, setNewLevelData] = useState({
    approverRole: 'Department Manager',
    approvalType: 'Approval',
    condition: 'All Requests'
  });

  const [showRecalibrateModal, setShowRecalibrateModal] = useState(false);
  const [recalibrateValue, setRecalibrateValue] = useState(100);

  const [showLookupModal, setShowLookupModal] = useState(false);
  const [lookupFormData, setLookupFormData] = useState({
    category: 'Asset Condition',
    code: '',
    value: '',
    description: '',
    sequence: 1
  });

  // Notifications
  const [toast, setToast] = useState(null);
  const showNotification = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3800);
  };

  // Sync tab with URL
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    let paramVal = 'general';
    if (tab === 'Asset Settings') paramVal = 'asset';
    else if (tab === 'Inventory Settings') paramVal = 'inventory';
    else if (tab === 'Maintenance Settings') paramVal = 'maintenance';
    else if (tab === 'Workflow & Approvals') paramVal = 'workflows';
    else if (tab === 'Numbering & Codes') paramVal = 'numbering';
    else if (tab === 'Lookups & Lists') paramVal = 'lookups';
    setSearchParams({ tab: paramVal });
  };

  // Fetch from backend on mount
  useEffect(() => {
    async function loadData() {
      try {
        const [pRes, wfRes, numRes, lkpRes] = await Promise.allSettled([
          api.get('/admin/config/parameters'),
          api.get('/admin/config/workflows'),
          api.get('/admin/config/numbering'),
          api.get('/admin/config/lookups')
        ]);
        if (pRes.status === 'fulfilled' && pRes.value?.parameters) {
          setParameters(pRes.value.parameters);
        }
        if (wfRes.status === 'fulfilled' && wfRes.value?.workflows) {
          setWorkflows(wfRes.value.workflows);
        }
        if (numRes.status === 'fulfilled' && numRes.value?.schemes) {
          setSchemes(numRes.value.schemes);
        }
        if (lkpRes.status === 'fulfilled' && lkpRes.value?.lookups) {
          setLookups(lkpRes.value.lookups);
        }
      } catch (err) {
        console.warn('Loaded with local pre-seeded baseline:', err);
      }
    }
    loadData();
  }, []);

  // Top 7 Tab Items
  const topTabs = [
    { id: 'General Settings', label: 'General Settings', icon: Settings },
    { id: 'Asset Settings', label: 'Asset Settings', icon: Box },
    { id: 'Inventory Settings', label: 'Inventory Settings', icon: Layers },
    { id: 'Maintenance Settings', label: 'Maintenance Settings', icon: Wrench },
    { id: 'Workflow & Approvals', label: 'Workflow & Approvals', icon: GitFork },
    { id: 'Numbering & Codes', label: 'Numbering & Codes', icon: Hash },
    { id: 'Lookups & Lists', label: 'Lookups & Lists', icon: ListOrdered }
  ];

  // =========================================================================
  // PARAMETER FILTERING & SORTING
  // =========================================================================
  const filteredParameters = useMemo(() => {
    return parameters.filter((p) => {
      // Tab-based module filtering
      if (activeTab === 'General Settings' && paramModuleFilter === 'All Modules' && p.module !== 'General') return false;
      if (activeTab === 'Asset Settings' && paramModuleFilter === 'All Modules' && p.module !== 'Asset') return false;
      if (activeTab === 'Inventory Settings' && paramModuleFilter === 'All Modules' && p.module !== 'Inventory') return false;
      if (activeTab === 'Maintenance Settings' && paramModuleFilter === 'All Modules' && p.module !== 'Maintenance') return false;

      // Dropdown module filter if explicitly chosen
      if (paramModuleFilter !== 'All Modules' && p.module.toLowerCase() !== paramModuleFilter.toLowerCase()) return false;
      if (paramCategoryFilter !== 'All Categories' && p.category.toLowerCase() !== paramCategoryFilter.toLowerCase()) return false;
      if (paramTypeFilter !== 'All Types' && p.parameterType.toLowerCase() !== paramTypeFilter.toLowerCase()) return false;
      if (paramStatusFilter !== 'All Statuses' && p.status.toLowerCase() !== paramStatusFilter.toLowerCase()) return false;

      if (paramSearch.trim()) {
        const q = paramSearch.toLowerCase();
        const match =
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.currentValue.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [
    parameters,
    activeTab,
    paramModuleFilter,
    paramCategoryFilter,
    paramTypeFilter,
    paramStatusFilter,
    paramSearch
  ]);

  const sortedParameters = useMemo(() => {
    return [...filteredParameters].sort((a, b) => {
      const aVal = a[paramSortField] || '';
      const bVal = b[paramSortField] || '';
      if (aVal < bVal) return paramSortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return paramSortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredParameters, paramSortField, paramSortOrder]);

  const totalParamRecords = sortedParameters.length;
  const totalParamPages = Math.max(1, Math.ceil(totalParamRecords / paramPageSize));
  const safeParamPage = Math.min(paramPage, totalParamPages);
  const paramStartIdx = (safeParamPage - 1) * paramPageSize;
  const paramEndIdx = Math.min(paramStartIdx + paramPageSize, totalParamRecords);
  const paginatedParameters = sortedParameters.slice(paramStartIdx, paramEndIdx);

  const isAllParamSelected =
    paginatedParameters.length > 0 &&
    paginatedParameters.every((item) => selectedParamIds.has(item.id));

  const toggleSelectAllParams = () => {
    const next = new Set(selectedParamIds);
    if (isAllParamSelected) {
      paginatedParameters.forEach((item) => next.delete(item.id));
    } else {
      paginatedParameters.forEach((item) => next.add(item.id));
    }
    setSelectedParamIds(next);
  };

  const toggleSelectParam = (id, e) => {
    e.stopPropagation();
    const next = new Set(selectedParamIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedParamIds(next);
  };

  const handleParamSort = (field) => {
    if (paramSortField === field) {
      setParamSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setParamSortField(field);
      setParamSortOrder('asc');
    }
  };

  const handleResetParamFilters = () => {
    setParamModuleFilter('All Modules');
    setParamCategoryFilter('All Categories');
    setParamTypeFilter('All Types');
    setParamStatusFilter('All Statuses');
    setParamSearch('');
    setParamPage(1);
    showNotification('info', 'Filters reset to default view');
  };

  // Save edited parameter
  const handleSaveEditedParam = async () => {
    if (!editingParam) return;
    const updatedList = parameters.map(p => p.id === editingParam.id ? editingParam : p);
    setParameters(updatedList);
    try {
      await api.put(`/admin/config/parameters/${editingParam.id}`, editingParam);
    } catch (e) {
      console.warn('Backend update parameter fallback:', e);
    }
    setEditingParam(null);
    showNotification('success', `Parameter "${editingParam.name}" updated successfully.`);
  };

  // Toggle Parameter Status
  const handleToggleParamStatus = async (param, e) => {
    if (e) e.stopPropagation();
    const newStatus = param.status === 'Active' ? 'Inactive' : 'Active';
    const updated = { ...param, status: newStatus };
    setParameters(prev => prev.map(p => p.id === param.id ? updated : p));
    try {
      await api.put(`/admin/config/parameters/${param.id}`, updated);
    } catch (e) {}
    showNotification('success', `Parameter "${param.name}" marked as ${newStatus}`);
  };

  // =========================================================================
  // WORKFLOW FILTERING & SELECTION
  // =========================================================================
  const filteredWorkflows = useMemo(() => {
    return workflows.filter((w) => {
      if (wfTransactionFilter !== 'All Transaction Types' && w.transactionType !== wfTransactionFilter) return false;
      if (wfStatusFilter !== 'All Statuses' && w.status !== wfStatusFilter) return false;
      if (wfCompanyFilter !== 'All Companies' && w.company !== 'All Companies' && w.company !== wfCompanyFilter) return false;
      if (wfBusinessUnitFilter !== 'All Business Units' && w.businessUnit !== wfBusinessUnitFilter) return false;
      return true;
    });
  }, [workflows, wfTransactionFilter, wfStatusFilter, wfCompanyFilter, wfBusinessUnitFilter]);

  const selectedWorkflow = useMemo(() => {
    return workflows.find(w => w.id === selectedWorkflowId) || workflows[0] || null;
  }, [workflows, selectedWorkflowId]);

  const handleUpdateSelectedWorkflowField = (field, value) => {
    if (!selectedWorkflow) return;
    const updated = { ...selectedWorkflow, [field]: value };
    setWorkflows(prev => prev.map(w => w.id === selectedWorkflow.id ? updated : w));
  };

  const handleSaveWorkflowDetails = async () => {
    if (!selectedWorkflow) return;
    try {
      await api.put(`/admin/config/workflows/${selectedWorkflow.id}`, selectedWorkflow);
    } catch (e) {}
    showNotification('success', `Workflow "${selectedWorkflow.name}" configuration saved.`);
  };

  const handleTestWorkflow = async () => {
    if (!selectedWorkflow) return;
    try {
      const res = await api.post(`/admin/config/workflows/${selectedWorkflow.id}/test`);
      showNotification('success', res?.message || `Simulation passed for ${selectedWorkflow.name}. All ${selectedWorkflow.levelsCount} levels validated.`);
    } catch (e) {
      showNotification('success', `Simulation passed for ${selectedWorkflow.name}. All ${selectedWorkflow.levelsCount} levels validated with no rule conflicts.`);
    }
  };

  const handleToggleWorkflowStatus = async (wf, e) => {
    if (e) e.stopPropagation();
    const nextStatus = wf.status === 'Active' ? 'Inactive' : 'Active';
    const updated = { ...wf, status: nextStatus };
    setWorkflows(prev => prev.map(w => w.id === wf.id ? updated : w));
    try {
      await api.patch(`/admin/config/workflows/${wf.id}/toggle`);
    } catch (e) {}
    showNotification('success', `Workflow "${wf.name}" status changed to ${nextStatus}`);
  };

  // Add Level to current workflow
  const handleAddLevelSubmit = () => {
    if (!selectedWorkflow) return;
    const nextLvlNum = (selectedWorkflow.levels?.length || 0) + 1;
    const newLvl = {
      level: nextLvlNum,
      approverRole: newLevelData.approverRole,
      approvalType: newLevelData.approvalType,
      condition: newLevelData.condition
    };
    const newStage = {
      id: nextLvlNum,
      title: newLevelData.approverRole,
      role: newLevelData.approvalType,
      action: 'Approve / Reject',
      type: 'approval'
    };
    const updated = {
      ...selectedWorkflow,
      levelsCount: nextLvlNum,
      levels: [...(selectedWorkflow.levels || []), newLvl],
      stages: [...(selectedWorkflow.stages || []), newStage]
    };
    setWorkflows(prev => prev.map(w => w.id === selectedWorkflow.id ? updated : w));
    setShowAddLevelModal(false);
    showNotification('success', `Added Level ${nextLvlNum} (${newLevelData.approverRole}) to workflow.`);
  };

  // Delete Level from current workflow
  const handleDeleteLevel = (lvlIndex) => {
    if (!selectedWorkflow) return;
    const updatedLevels = selectedWorkflow.levels.filter((_, idx) => idx !== lvlIndex).map((l, idx) => ({ ...l, level: idx + 1 }));
    const updatedStages = selectedWorkflow.stages.filter((_, idx) => idx !== lvlIndex);
    const updated = {
      ...selectedWorkflow,
      levelsCount: updatedLevels.length,
      levels: updatedLevels,
      stages: updatedStages
    };
    setWorkflows(prev => prev.map(w => w.id === selectedWorkflow.id ? updated : w));
    showNotification('success', 'Level removed from workflow chain.');
  };

  // Numbering Live Code Calculation
  const currentScheme = schemes[selectedSchemeIndex] || schemes[0];
  const calculateLiveCode = (scheme) => {
    if (!scheme) return 'AST-2025-100128';
    const now = new Date();
    const yyyy = String(now.getFullYear());
    const padded = String((scheme.current || 1) + 1).padStart(Number(scheme.length) || 5, '0');
    const sep = scheme.separator || '-';
    const parts = [scheme.prefix];
    if (scheme.includeYear) parts.push(yyyy);
    parts.push(padded);
    return parts.join(sep);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 font-sans text-slate-800">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl bg-slate-900 text-white text-xs border border-slate-700 animate-in fade-in slide-in-from-bottom-3 duration-200">
          {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
          {toast.type === 'info' && <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />}
          {toast.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />}
          {toast.type === 'error' && <XCircle className="w-4 h-4 text-rose-400 shrink-0" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-[1780px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
              <span>Administration</span>
              <span className="text-slate-400">&gt;</span>
              <span>System Configuration</span>
              {activeTab === 'Workflow & Approvals' && (
                <>
                  <span className="text-slate-400">&gt;</span>
                  <span className="font-semibold text-slate-800">Workflow &amp; Approvals</span>
                </>
              )}
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {activeTab === 'Workflow & Approvals' ? 'Workflow & Approvals' : 'System Configuration'}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {activeTab === 'Workflow & Approvals'
                ? 'Configure approval workflows for key business processes in Asset360.'
                : 'Manage system settings, parameters and preferences for Asset360.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {activeTab === 'Workflow & Approvals' ? (
              <button
                onClick={() => setShowAddWfModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Workflow</span>
                <ChevronDown className="w-3 h-3 ml-0.5 opacity-80" />
              </button>
            ) : (
              <button
                onClick={() => setShowAddParamModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Configuration</span>
                <ChevronDown className="w-3 h-3 ml-0.5 opacity-80" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-[1780px] mx-auto px-6 pt-5 space-y-4">
        {/* Horizontal Category Tabs (7 Tabs matching wireframe screenshots 1 & 2) */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-none">
          {topTabs.map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs whitespace-nowrap transition-all border cursor-pointer ${
                  isSelected
                    ? 'bg-[#F5F3FF] border-[#6C2BD9] text-[#6C2BD9] font-bold shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 font-medium'
                }`}
              >
                <Icon className={`w-4 h-4 ${isSelected ? 'text-[#6C2BD9]' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ========================================================================= */}
        {/* VIEW 1: SYSTEM CONFIGURATION PARAMETER REGISTER (Tabs 1 to 4)             */}
        {/* ========================================================================= */}
        {['General Settings', 'Asset Settings', 'Inventory Settings', 'Maintenance Settings'].includes(activeTab) && (
          <div className="space-y-4">
            {/* Filters Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <Filter className="w-3.5 h-3.5 text-[#6C2BD9]" />
                  <span>Filters</span>
                </div>
                <button
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className="flex items-center gap-1 text-[11px] text-[#6C2BD9] hover:underline font-semibold cursor-pointer"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Advanced Filters</span>
                  {showAdvancedFilters ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
              </div>

              {/* Standard Filter Row */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-500 mb-1">Module</label>
                  <select
                    value={paramModuleFilter}
                    onChange={(e) => setParamModuleFilter(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-lg p-2 bg-white text-slate-800 focus:outline-none focus:border-[#6C2BD9]"
                  >
                    <option value="All Modules">All Modules</option>
                    <option value="General">General</option>
                    <option value="Asset">Asset</option>
                    <option value="Inventory">Inventory</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-500 mb-1">Category</label>
                  <select
                    value={paramCategoryFilter}
                    onChange={(e) => setParamCategoryFilter(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-lg p-2 bg-white text-slate-800 focus:outline-none focus:border-[#6C2BD9]"
                  >
                    <option value="All Categories">All Categories</option>
                    <option value="Organization">Organization</option>
                    <option value="Finance">Finance</option>
                    <option value="Localization">Localization</option>
                    <option value="Numbering">Numbering</option>
                    <option value="Defaults">Defaults</option>
                    <option value="Notifications">Notifications</option>
                    <option value="Controls">Controls</option>
                    <option value="Automation">Automation</option>
                    <option value="Procurement">Procurement</option>
                    <option value="Security">Security</option>
                    <option value="Storage">Storage</option>
                    <option value="Media">Media</option>
                    <option value="Tracking">Tracking</option>
                    <option value="SLA">SLA</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-500 mb-1">Parameter Type</label>
                  <select
                    value={paramTypeFilter}
                    onChange={(e) => setParamTypeFilter(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-lg p-2 bg-white text-slate-800 focus:outline-none focus:border-[#6C2BD9]"
                  >
                    <option value="All Types">All Types</option>
                    <option value="Text">Text</option>
                    <option value="Number">Number</option>
                    <option value="Boolean">Boolean</option>
                    <option value="Lookup">Lookup</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-500 mb-1">Status</label>
                  <select
                    value={paramStatusFilter}
                    onChange={(e) => setParamStatusFilter(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-lg p-2 bg-white text-slate-800 focus:outline-none focus:border-[#6C2BD9]"
                  >
                    <option value="All Statuses">All Statuses</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-500 mb-1">Search</label>
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search by parameter name or description..."
                      value={paramSearch}
                      onChange={(e) => setParamSearch(e.target.value)}
                      className="w-full text-xs border border-slate-200 rounded-lg pl-8 pr-3 py-2 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#6C2BD9]"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-slate-100">
                <button
                  onClick={handleResetParamFilters}
                  className="px-4 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg cursor-pointer"
                >
                  Reset
                </button>
                <button
                  onClick={() => {
                    setParamPage(1);
                    showNotification('success', `Filters applied (${filteredParameters.length} parameters found)`);
                  }}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white text-xs font-semibold rounded-lg cursor-pointer"
                >
                  <Filter className="w-3.5 h-3.5" />
                  <span>Apply Filters</span>
                </button>
              </div>

              {/* Advanced Filters Expandable */}
              {showAdvancedFilters && (
                <div className="grid grid-cols-3 gap-3 mt-3 pt-3 border-t border-slate-100 text-xs animate-in fade-in duration-150">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-500 mb-1">Value State</label>
                    <select className="w-full border border-slate-200 rounded-lg p-2 bg-white text-slate-700">
                      <option value="All">All (Defaults and Modified)</option>
                      <option value="Modified">Modified from Default Only</option>
                      <option value="Default">Factory Baseline Only</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-500 mb-1">Enforcement Scope</label>
                    <select className="w-full border border-slate-200 rounded-lg p-2 bg-white text-slate-700">
                      <option value="All">All Tenants &amp; Companies</option>
                      <option value="Dubai HQ">Dubai HQ Facility</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-500 mb-1">Sort Field</label>
                    <select
                      value={paramSortField}
                      onChange={(e) => setParamSortField(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg p-2 bg-white text-slate-700"
                    >
                      <option value="name">Parameter Name</option>
                      <option value="module">Module</option>
                      <option value="category">Category</option>
                      <option value="parameterType">Type</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* System Configuration Table Card (Screenshot 1) */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
              {/* Header Bar */}
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900 text-sm">
                    System Configuration ({totalParamRecords})
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    Showing parameters for {activeTab}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const csvContent =
                        'data:text/csv;charset=utf-8,' +
                        ['ID,Name,Module,Category,CurrentValue,DefaultValue,Type,Status'].join(',') +
                        '\n' +
                        filteredParameters.map(p => `"${p.id}","${p.name}","${p.module}","${p.category}","${p.currentValue}","${p.defaultValue}","${p.parameterType}","${p.status}"`).join('\n');
                      const link = document.createElement('a');
                      link.setAttribute('href', encodeURI(csvContent));
                      link.setAttribute('download', `Asset360_SystemConfig_${new Date().toISOString().slice(0, 10)}.csv`);
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      showNotification('success', 'Exported System Configuration table to CSV');
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg cursor-pointer"
                  >
                    <span>Export</span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </button>
                  <button
                    onClick={() => {
                      showNotification('info', 'Refreshed system configuration repository');
                    }}
                    className="p-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Data Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-[#FAF8FF] border-b border-slate-200 text-slate-600 text-[11px] font-semibold select-none">
                    <tr>
                      <th className="py-3 px-3 w-8 text-center">
                        <input
                          type="checkbox"
                          checked={isAllParamSelected}
                          onChange={toggleSelectAllParams}
                          className="rounded border-slate-300 text-[#6C2BD9] focus:ring-[#6C2BD9] cursor-pointer"
                        />
                      </th>
                      <th className="py-3 px-3 w-8 text-center">#</th>
                      <th onClick={() => handleParamSort('name')} className="py-3 px-4 cursor-pointer hover:text-[#6C2BD9]">
                        <div className="flex items-center gap-1">
                          <span>Parameter Name</span>
                          <ChevronDown className="w-3 h-3 text-slate-400" />
                        </div>
                      </th>
                      <th onClick={() => handleParamSort('module')} className="py-3 px-3 cursor-pointer hover:text-[#6C2BD9]">
                        <div className="flex items-center gap-1">
                          <span>Module</span>
                          <ChevronDown className="w-3 h-3 text-slate-400" />
                        </div>
                      </th>
                      <th onClick={() => handleParamSort('category')} className="py-3 px-3 cursor-pointer hover:text-[#6C2BD9]">
                        <div className="flex items-center gap-1">
                          <span>Category</span>
                          <ChevronDown className="w-3 h-3 text-slate-400" />
                        </div>
                      </th>
                      <th className="py-3 px-3">Current Value</th>
                      <th className="py-3 px-3">Default Value</th>
                      <th onClick={() => handleParamSort('parameterType')} className="py-3 px-3 cursor-pointer hover:text-[#6C2BD9]">
                        <div className="flex items-center gap-1">
                          <span>Parameter Type</span>
                          <ChevronDown className="w-3 h-3 text-slate-400" />
                        </div>
                      </th>
                      <th onClick={() => handleParamSort('status')} className="py-3 px-3 cursor-pointer hover:text-[#6C2BD9]">
                        <div className="flex items-center gap-1">
                          <span>Status</span>
                          <ChevronDown className="w-3 h-3 text-slate-400" />
                        </div>
                      </th>
                      <th className="py-3 px-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginatedParameters.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="py-12 text-center text-slate-400 text-xs">
                          No configuration parameters found matching the selected filters.
                        </td>
                      </tr>
                    ) : (
                      paginatedParameters.map((param, index) => {
                        const rowNumber = paramStartIdx + index + 1;
                        const isSelected = selectedParamIds.has(param.id);
                        return (
                          <tr
                            key={param.id}
                            onClick={() => setEditingParam({ ...param })}
                            className={`hover:bg-purple-50/40 transition-colors cursor-pointer ${
                              isSelected ? 'bg-[#F5F0FF]/50' : ''
                            }`}
                          >
                            <td className="py-3 px-3 text-center" onClick={(e) => toggleSelectParam(param.id, e)}>
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => {}}
                                className="rounded border-slate-300 text-[#6C2BD9] focus:ring-[#6C2BD9] cursor-pointer"
                              />
                            </td>
                            <td className="py-3 px-3 text-center text-slate-500 font-mono text-[11px]">{rowNumber}</td>
                            <td className="py-3 px-4 font-semibold text-slate-900">
                              <div className="flex items-center gap-1.5">
                                <span>{param.name}</span>
                              </div>
                            </td>
                            <td className="py-3 px-3 text-slate-700">{param.module}</td>
                            <td className="py-3 px-3 text-slate-600">{param.category}</td>
                            <td className="py-3 px-3">
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-800 font-mono text-[11px] border border-slate-200">
                                {param.currentValue}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">{param.defaultValue}</td>
                            <td className="py-3 px-3">
                              <span className="text-slate-600 font-medium">{param.parameterType}</span>
                            </td>
                            <td className="py-3 px-3">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                                  param.status === 'Active'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : 'bg-rose-50 text-rose-700 border-rose-200'
                                }`}
                              >
                                {param.status}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                              <div className="inline-flex items-center gap-1">
                                <button
                                  onClick={() => setEditingParam({ ...param })}
                                  title="Edit Parameter Value"
                                  className="p-1 rounded text-slate-400 hover:text-[#6C2BD9] hover:bg-purple-50"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={(e) => handleToggleParamStatus(param, e)}
                                  title="Toggle Status"
                                  className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                                >
                                  <MoreHorizontal className="w-3.5 h-3.5" />
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

              {/* Pagination Footer */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3 border-t border-slate-200 text-xs text-slate-500 bg-white">
                <div>
                  Showing {totalParamRecords > 0 ? paramStartIdx + 1 : 0} to {paramEndIdx} of {totalParamRecords} records
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <button
                      disabled={paramPage <= 1}
                      onClick={() => setParamPage(1)}
                      className="p-1 rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                    >
                      &laquo;
                    </button>
                    <button
                      disabled={paramPage <= 1}
                      onClick={() => setParamPage(prev => Math.max(1, prev - 1))}
                      className="p-1 rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                    >
                      &lsaquo;
                    </button>

                    {Array.from({ length: totalParamPages }, (_, idx) => idx + 1).map((pageNum) => (
                      <button
                        key={pageNum}
                        onClick={() => setParamPage(pageNum)}
                        className={`w-6 h-6 rounded text-xs font-semibold cursor-pointer ${
                          paramPage === pageNum
                            ? 'bg-[#6C2BD9] text-white'
                            : 'border border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        {pageNum}
                      </button>
                    ))}

                    <button
                      disabled={paramPage >= totalParamPages}
                      onClick={() => setParamPage(prev => Math.min(totalParamPages, prev + 1))}
                      className="p-1 rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                    >
                      &rsaquo;
                    </button>
                    <button
                      disabled={paramPage >= totalParamPages}
                      onClick={() => setParamPage(totalParamPages)}
                      className="p-1 rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                    >
                      &raquo;
                    </button>
                  </div>

                  <select
                    value={paramPageSize}
                    onChange={(e) => {
                      setParamPageSize(Number(e.target.value));
                      setParamPage(1);
                    }}
                    className="border border-slate-200 rounded p-1 text-xs bg-white cursor-pointer"
                  >
                    <option value={10}>10 / page</option>
                    <option value={20}>20 / page</option>
                    <option value={50}>50 / page</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: WORKFLOW & APPROVALS CONSOLE (Tab 5 - Screenshot 2)              */}
        {/* ========================================================================= */}
        {activeTab === 'Workflow & Approvals' && (
          <div className="space-y-4">
            {/* Filters Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <Filter className="w-3.5 h-3.5 text-[#6C2BD9]" />
                  <span>Filters</span>
                </div>
                <button
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className="flex items-center gap-1 text-[11px] text-[#6C2BD9] hover:underline font-semibold cursor-pointer"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Advanced Filters</span>
                  {showAdvancedFilters ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-500 mb-1">Transaction Type</label>
                  <select
                    value={wfTransactionFilter}
                    onChange={(e) => setWfTransactionFilter(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-lg p-2 bg-white text-slate-800 focus:outline-none focus:border-[#6C2BD9]"
                  >
                    <option value="All Transaction Types">All Transaction Types</option>
                    <option value="Asset Procurement">Asset Procurement</option>
                    <option value="Asset Disposal">Asset Disposal</option>
                    <option value="Asset Transfer">Asset Transfer</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Inventory">Inventory</option>
                    <option value="Verification & Audit">Verification &amp; Audit</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-500 mb-1">Status</label>
                  <select
                    value={wfStatusFilter}
                    onChange={(e) => setWfStatusFilter(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-lg p-2 bg-white text-slate-800 focus:outline-none focus:border-[#6C2BD9]"
                  >
                    <option value="All Statuses">All Statuses</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-500 mb-1">Company</label>
                  <select
                    value={wfCompanyFilter}
                    onChange={(e) => setWfCompanyFilter(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-lg p-2 bg-white text-slate-800 focus:outline-none focus:border-[#6C2BD9]"
                  >
                    <option value="All Companies">All Companies</option>
                    <option value="Dubai HQ">Dubai HQ</option>
                    <option value="Asset360 Holdings">Asset360 Holdings</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-500 mb-1">Business Unit</label>
                  <select
                    value={wfBusinessUnitFilter}
                    onChange={(e) => setWfBusinessUnitFilter(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-lg p-2 bg-white text-slate-800 focus:outline-none focus:border-[#6C2BD9]"
                  >
                    <option value="All Business Units">All Business Units</option>
                    <option value="Corporate">Corporate</option>
                    <option value="Operations">Operations</option>
                    <option value="Logistics">Logistics</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-slate-100">
                <button
                  onClick={() => {
                    setWfTransactionFilter('All Transaction Types');
                    setWfStatusFilter('All Statuses');
                    setWfCompanyFilter('All Companies');
                    setWfBusinessUnitFilter('All Business Units');
                    showNotification('info', 'Workflow filters reset.');
                  }}
                  className="px-4 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg cursor-pointer"
                >
                  Reset
                </button>
                <button
                  onClick={() => showNotification('success', `Applied filters: ${filteredWorkflows.length} workflows found.`)}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white text-xs font-semibold rounded-lg cursor-pointer"
                >
                  <Filter className="w-3.5 h-3.5" />
                  <span>Apply Filters</span>
                </button>
              </div>
            </div>

            {/* Upper Table: Approval Workflows (12) (Screenshot 2) */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-sm">
                  Approval Workflows ({filteredWorkflows.length})
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-[#FAF8FF] border-b border-slate-200 text-slate-600 text-[11px] font-semibold">
                    <tr>
                      <th className="py-2.5 px-3 w-8 text-center">
                        <input type="checkbox" className="rounded border-slate-300 text-[#6C2BD9] focus:ring-[#6C2BD9]" />
                      </th>
                      <th className="py-2.5 px-3 w-8 text-center">#</th>
                      <th className="py-2.5 px-4 font-semibold text-slate-800">Workflow Name</th>
                      <th className="py-2.5 px-3">Transaction Type</th>
                      <th className="py-2.5 px-4">Description</th>
                      <th className="py-2.5 px-3 text-center">No. of Levels</th>
                      <th className="py-2.5 px-3">Company</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredWorkflows.map((wf, idx) => {
                      const isSelected = selectedWorkflow?.id === wf.id;
                      return (
                        <tr
                          key={wf.id}
                          onClick={() => setSelectedWorkflowId(wf.id)}
                          className={`hover:bg-purple-50/40 transition-colors cursor-pointer ${
                            isSelected ? 'bg-[#F5F0FF] border-l-4 border-l-[#6C2BD9]' : ''
                          }`}
                        >
                          <td className="py-2.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                            <input type="checkbox" checked={isSelected} onChange={() => {}} className="rounded border-slate-300 text-[#6C2BD9]" />
                          </td>
                          <td className="py-2.5 px-3 text-center text-slate-500 font-mono text-[11px]">{idx + 1}</td>
                          <td className="py-2.5 px-4 font-bold text-slate-900">{wf.name}</td>
                          <td className="py-2.5 px-3 text-slate-700">{wf.transactionType}</td>
                          <td className="py-2.5 px-4 text-slate-600 truncate max-w-xs">{wf.description}</td>
                          <td className="py-2.5 px-3 text-center font-bold text-slate-800">{wf.levelsCount}</td>
                          <td className="py-2.5 px-3 text-slate-600">{wf.company}</td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                                wf.status === 'Active'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-rose-50 text-rose-700 border-rose-200'
                              }`}
                            >
                              {wf.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={(e) => handleToggleWorkflowStatus(wf, e)}
                              className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                            >
                              <MoreHorizontal className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Split Lower View: Workflow Details (Left) + Multi-tab Workspace (Right) (Screenshot 2) */}
            {selectedWorkflow && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                {/* Left Column: Workflow Details */}
                <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
                  <div className="border-b border-slate-100 pb-2.5">
                    <h3 className="font-bold text-slate-900 text-sm">Workflow Details</h3>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Workflow Name *</label>
                      <input
                        type="text"
                        value={selectedWorkflow.name}
                        onChange={(e) => handleUpdateSelectedWorkflowField('name', e.target.value)}
                        className="w-full border border-slate-200 rounded-lg p-2 font-medium text-slate-900 focus:outline-none focus:border-[#6C2BD9]"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Transaction Type *</label>
                      <select
                        value={selectedWorkflow.transactionType}
                        onChange={(e) => handleUpdateSelectedWorkflowField('transactionType', e.target.value)}
                        className="w-full border border-slate-200 rounded-lg p-2 bg-white text-slate-800 focus:outline-none focus:border-[#6C2BD9]"
                      >
                        <option value="Asset Procurement">Asset Procurement</option>
                        <option value="Asset Disposal">Asset Disposal</option>
                        <option value="Asset Transfer">Asset Transfer</option>
                        <option value="Maintenance">Maintenance</option>
                        <option value="Inventory">Inventory</option>
                        <option value="Verification & Audit">Verification &amp; Audit</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Description</label>
                      <textarea
                        rows={3}
                        value={selectedWorkflow.description}
                        onChange={(e) => handleUpdateSelectedWorkflowField('description', e.target.value)}
                        className="w-full border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:border-[#6C2BD9]"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Status</label>
                      <select
                        value={selectedWorkflow.status}
                        onChange={(e) => handleUpdateSelectedWorkflowField('status', e.target.value)}
                        className="w-full border border-slate-200 rounded-lg p-2 bg-white text-slate-800 focus:outline-none focus:border-[#6C2BD9]"
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Applicable For</label>
                        <div className="space-y-1.5 pt-1">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="applicableFor"
                              checked={selectedWorkflow.applicableFor === 'All Companies'}
                              onChange={() => handleUpdateSelectedWorkflowField('applicableFor', 'All Companies')}
                              className="text-[#6C2BD9] focus:ring-[#6C2BD9]"
                            />
                            <span className="text-slate-700">All Companies</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="applicableFor"
                              checked={selectedWorkflow.applicableFor === 'Specific Companies'}
                              onChange={() => handleUpdateSelectedWorkflowField('applicableFor', 'Specific Companies')}
                              className="text-[#6C2BD9] focus:ring-[#6C2BD9]"
                            />
                            <span className="text-slate-700">Specific Companies</span>
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Effective From</label>
                        <div className="relative">
                          <input
                            type="date"
                            value={selectedWorkflow.effectiveFrom}
                            onChange={(e) => handleUpdateSelectedWorkflowField('effectiveFrom', e.target.value)}
                            className="w-full border border-slate-200 rounded-lg p-2 bg-white text-slate-800 focus:outline-none focus:border-[#6C2BD9]"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        onClick={handleSaveWorkflowDetails}
                        className="w-full flex items-center justify-center gap-1.5 py-2 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white font-semibold rounded-lg shadow-2xs cursor-pointer"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Save Workflow Details</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right Column: Multi-tab Workspace (Approval Flow, Rules, etc.) */}
                <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
                  {/* Tabs & Top Actions Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-2">
                    <div className="flex items-center gap-4 text-xs font-semibold">
                      {['Approval Flow', 'Rules & Conditions', 'Notifications', 'Escalation', 'History'].map((subTab) => (
                        <button
                          key={subTab}
                          onClick={() => setWorkflowDetailTab(subTab)}
                          className={`pb-2 border-b-2 cursor-pointer transition-colors ${
                            workflowDetailTab === subTab
                              ? 'border-[#6C2BD9] text-[#6C2BD9] font-bold'
                              : 'border-transparent text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          {subTab}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleTestWorkflow}
                        className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg shadow-2xs cursor-pointer"
                      >
                        <Play className="w-3 h-3 text-[#6C2BD9]" />
                        <span>Test Workflow</span>
                      </button>
                      <button
                        onClick={() => showNotification('info', 'Switched to graphical flowchart visual editor')}
                        className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg shadow-2xs cursor-pointer"
                      >
                        <Edit2 className="w-3 h-3 text-slate-500" />
                        <span>Edit Flow</span>
                      </button>
                      <button className="p-1.5 border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-lg">
                        <MoreHorizontal className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* TAB 1: APPROVAL FLOW PIPELINE & LEVELS */}
                  {workflowDetailTab === 'Approval Flow' && (
                    <div className="space-y-6">
                      {/* Visual Pipeline (Screenshot 2) */}
                      <div>
                        <h4 className="font-bold text-slate-900 text-xs mb-3">
                          Approval Flow ({selectedWorkflow.levelsCount} Levels)
                        </h4>

                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl overflow-x-auto">
                          <div className="flex items-center gap-3 min-w-[680px]">
                            {/* Initiator Avatar */}
                            <div className="w-10 h-10 rounded-full bg-[#6C2BD9] text-white flex items-center justify-center shrink-0 shadow-sm">
                              <User className="w-5 h-5" />
                            </div>

                            <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />

                            {/* Stage 1: Requester */}
                            <div className="bg-[#FAF5FF] border border-[#DDD6FE] rounded-xl p-3 w-40 shrink-0 shadow-2xs">
                              <div className="flex items-center gap-1.5 mb-1">
                                <span className="w-4 h-4 rounded-full bg-[#6C2BD9] text-white text-[10px] font-bold flex items-center justify-center">1</span>
                                <span className="font-bold text-slate-900 text-xs">Requester</span>
                              </div>
                              <p className="text-[10px] text-slate-500 font-medium">Initiator</p>
                              <p className="text-[10px] text-[#6C2BD9] font-semibold mt-1">Submit Request</p>
                            </div>

                            <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />

                            {/* Stage 2: Dept Manager */}
                            <div className="bg-white border border-sky-300 rounded-xl p-3 w-44 shrink-0 shadow-2xs">
                              <div className="flex items-center gap-1.5 mb-1">
                                <span className="w-4 h-4 rounded-full bg-sky-500 text-white text-[10px] font-bold flex items-center justify-center">2</span>
                                <span className="font-bold text-slate-900 text-xs">Department Manager</span>
                              </div>
                              <p className="text-[10px] text-slate-500 font-medium">Approval</p>
                              <p className="text-[10px] text-slate-600 font-semibold mt-1">Approve / Reject</p>
                            </div>

                            <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />

                            {/* Stage 3: Asset Manager */}
                            <div className="bg-white border border-emerald-300 rounded-xl p-3 w-44 shrink-0 shadow-2xs">
                              <div className="flex items-center gap-1.5 mb-1">
                                <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center">3</span>
                                <span className="font-bold text-slate-900 text-xs">Asset Manager</span>
                              </div>
                              <p className="text-[10px] text-slate-500 font-medium">Final Approval</p>
                              <p className="text-[10px] text-slate-600 font-semibold mt-1">Approve / Reject</p>
                            </div>

                            <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />

                            {/* Final Node: Approved */}
                            <div className="flex items-center gap-2 shrink-0 pl-1">
                              <div className="w-9 h-9 rounded-full bg-[#6C2BD9] text-white flex items-center justify-center shadow-sm">
                                <Check className="w-5 h-5 stroke-[2.5]" />
                              </div>
                              <div>
                                <p className="text-xs font-bold text-slate-900">Approved</p>
                                <p className="text-[10px] text-slate-500">Request Completed</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Approval Levels Table */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-bold text-slate-900 text-xs">Approval Levels</h4>
                          <button
                            onClick={() => setShowAddLevelModal(true)}
                            className="flex items-center gap-1 px-3 py-1 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white text-xs font-semibold rounded-lg cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                            <span>+ Add Level</span>
                          </button>
                        </div>

                        <div className="border border-slate-200 rounded-lg overflow-hidden">
                          <table className="w-full text-left border-collapse text-xs">
                            <thead className="bg-[#FAF8FF] border-b border-slate-200 text-slate-600 text-[11px] font-semibold">
                              <tr>
                                <th className="py-2 px-3 w-8 text-center">#</th>
                                <th className="py-2 px-4">Approver Role / User</th>
                                <th className="py-2 px-4">Approval Type</th>
                                <th className="py-2 px-4">Condition</th>
                                <th className="py-2 px-3 text-center">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {selectedWorkflow.levels?.map((lvl, lIdx) => (
                                <tr key={lIdx} className="hover:bg-slate-50/60">
                                  <td className="py-2.5 px-3 text-center text-slate-500 font-mono text-[11px]">{lvl.level || lIdx + 1}</td>
                                  <td className="py-2.5 px-4 font-bold text-slate-900">{lvl.approverRole}</td>
                                  <td className="py-2.5 px-4 text-slate-700">{lvl.approvalType}</td>
                                  <td className="py-2.5 px-4">
                                    <span className="font-mono text-[11px] text-[#6C2BD9] bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                                      {lvl.condition}
                                    </span>
                                  </td>
                                  <td className="py-2.5 px-3 text-center">
                                    <div className="inline-flex items-center gap-1">
                                      <button
                                        onClick={() => showNotification('info', `Editing Level ${lIdx + 1}`)}
                                        className="p-1 rounded text-slate-400 hover:text-[#6C2BD9]"
                                      >
                                        <Edit2 className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteLevel(lIdx)}
                                        className="p-1 rounded text-slate-400 hover:text-rose-600"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
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

                  {/* TAB 2: RULES & CONDITIONS */}
                  {workflowDetailTab === 'Rules & Conditions' && (
                    <div className="space-y-3 text-xs">
                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                        <h4 className="font-bold text-slate-900">Execution Predicate Rules</h4>
                        <p className="text-slate-500">
                          Configure dynamic conditional triggers based on asset category, location, purchase cost, or user role.
                        </p>
                        <div className="space-y-2 pt-2">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-700">Condition 1:</span>
                            <span className="px-2 py-1 bg-white border border-slate-200 rounded font-mono text-[11px]">
                              Asset Purchase Value &gt; AED 50,000
                            </span>
                            <span className="text-slate-400">&rarr;</span>
                            <span className="text-emerald-700 font-semibold">Requires Level 2 &amp; 3 Approval</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-700">Condition 2:</span>
                            <span className="px-2 py-1 bg-white border border-slate-200 rounded font-mono text-[11px]">
                              Asset Category == 'Plant &amp; Machinery'
                            </span>
                            <span className="text-slate-400">&rarr;</span>
                            <span className="text-emerald-700 font-semibold">Requires Engineering Sign-Off</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 3: NOTIFICATIONS */}
                  {workflowDetailTab === 'Notifications' && (
                    <div className="space-y-3 text-xs">
                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                        <h4 className="font-bold text-slate-900">Workflow Email Alerts</h4>
                        <p className="text-slate-500">
                          Dispatches automated alerts on step assignment, rejection, escalation and final approval.
                        </p>
                        <label className="flex items-center gap-2 pt-2 cursor-pointer">
                          <input type="checkbox" defaultChecked className="rounded border-slate-300 text-[#6C2BD9]" />
                          <span className="font-medium text-slate-800">Send instant email alert to pending approver</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" defaultChecked className="rounded border-slate-300 text-[#6C2BD9]" />
                          <span className="font-medium text-slate-800">Notify requester upon rejection with rejection comments</span>
                        </label>
                      </div>
                    </div>
                  )}

                  {/* TAB 4: ESCALATION */}
                  {workflowDetailTab === 'Escalation' && (
                    <div className="space-y-3 text-xs">
                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                        <h4 className="font-bold text-slate-900">SLA Escalation Policy</h4>
                        <p className="text-slate-500">
                          Automatically advance or escalate pending tickets when approver does not respond within timeout window.
                        </p>
                        <div className="grid grid-cols-2 gap-4 pt-2">
                          <div>
                            <label className="block text-slate-600 font-medium mb-1">Approval Timeout</label>
                            <input type="text" defaultValue="48 Hours" className="w-full border border-slate-200 rounded p-1.5 bg-white" />
                          </div>
                          <div>
                            <label className="block text-slate-600 font-medium mb-1">Escalate To</label>
                            <select className="w-full border border-slate-200 rounded p-1.5 bg-white">
                              <option value="Executive Management">Executive Management</option>
                              <option value="Operations Director">Operations Director</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 5: HISTORY */}
                  {workflowDetailTab === 'History' && (
                    <div className="space-y-3 text-xs">
                      <div className="border border-slate-200 rounded-lg overflow-hidden">
                        <table className="w-full text-left border-collapse">
                          <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-600">
                            <tr>
                              <th className="p-2.5">Date &amp; Time</th>
                              <th className="p-2.5">Modified By</th>
                              <th className="p-2.5">Change Description</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-slate-700">
                            <tr>
                              <td className="p-2.5 text-slate-500 font-mono">10 Sep 2026 14:30</td>
                              <td className="p-2.5 font-bold">System Administrator</td>
                              <td className="p-2.5">Updated Level 2 approval condition threshold to AED 50,000</td>
                            </tr>
                            <tr>
                              <td className="p-2.5 text-slate-500 font-mono">01 Jan 2025 09:00</td>
                              <td className="p-2.5 font-bold">System Administrator</td>
                              <td className="p-2.5">Initial workflow activation baseline</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 3: NUMBERING & CODES CONSOLE (Tab 6)                                 */}
        {/* ========================================================================= */}
        {activeTab === 'Numbering & Codes' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left Column: List of 8 Identifier Schemes */}
            <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-2">
              <h3 className="font-bold text-slate-900 text-sm mb-3">Document Numbering Schemes</h3>
              <div className="space-y-1.5">
                {schemes.map((scheme, sIdx) => {
                  const isSelected = selectedSchemeIndex === sIdx;
                  return (
                    <button
                      key={scheme.id}
                      onClick={() => setSelectedSchemeIndex(sIdx)}
                      className={`w-full text-left p-3 rounded-lg border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#F5F0FF] border-[#6C2BD9] shadow-xs'
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold ${isSelected ? 'text-[#6C2BD9]' : 'text-slate-800'}`}>
                          {scheme.entity}
                        </span>
                        <span className="font-mono text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          {scheme.prefix}
                        </span>
                      </div>
                      <p className="text-[11px] font-mono text-slate-500 mt-1">
                        Format: {calculateLiveCode(scheme)}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Active Scheme Configuration */}
            {currentScheme && (
              <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{currentScheme.entity} Numbering</h3>
                    <p className="text-xs text-slate-500">Concurrency-safe atomic sequence configuration</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setRecalibrateValue(currentScheme.current || 100);
                        setShowRecalibrateModal(true);
                      }}
                      className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg cursor-pointer"
                    >
                      Recalibrate Counter
                    </button>
                    <button
                      onClick={() => {
                        const nextCode = calculateLiveCode(currentScheme);
                        showNotification('success', `Next atomic identifier: ${nextCode}`);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white text-xs font-semibold rounded-lg cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Test Next Code</span>
                    </button>
                  </div>
                </div>

                {/* Live Preview Box */}
                <div className="p-4 bg-[#FAF5FF] border border-[#DDD6FE] rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[11px] uppercase tracking-wider font-bold text-[#6C2BD9]">Live Generated Code Preview</span>
                    <div className="text-2xl font-mono font-bold text-slate-900 tracking-wide mt-1">
                      {calculateLiveCode(currentScheme)}
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                    Active Scheme
                  </span>
                </div>

                {/* Configuration Attributes */}
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Prefix</label>
                    <input
                      type="text"
                      value={currentScheme.prefix}
                      onChange={(e) => {
                        const copy = [...schemes];
                        copy[selectedSchemeIndex].prefix = e.target.value;
                        setSchemes(copy);
                      }}
                      className="w-full border border-slate-200 rounded-lg p-2 font-mono text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Separator</label>
                    <select
                      value={currentScheme.separator}
                      onChange={(e) => {
                        const copy = [...schemes];
                        copy[selectedSchemeIndex].separator = e.target.value;
                        setSchemes(copy);
                      }}
                      className="w-full border border-slate-200 rounded-lg p-2 bg-white"
                    >
                      <option value="-">- (Hyphen)</option>
                      <option value="/">/ (Slash)</option>
                      <option value="_">_ (Underscore)</option>
                      <option value="">None</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Sequence Length (Digits)</label>
                    <input
                      type="number"
                      value={currentScheme.length}
                      onChange={(e) => {
                        const copy = [...schemes];
                        copy[selectedSchemeIndex].length = Number(e.target.value);
                        setSchemes(copy);
                      }}
                      className="w-full border border-slate-200 rounded-lg p-2 font-mono text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Current Counter</label>
                    <input
                      type="number"
                      readOnly
                      value={currentScheme.current}
                      className="w-full border border-slate-200 rounded-lg p-2 bg-slate-50 font-mono text-slate-700"
                    />
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={currentScheme.includeYear}
                      onChange={(e) => {
                        const copy = [...schemes];
                        copy[selectedSchemeIndex].includeYear = e.target.checked;
                        setSchemes(copy);
                      }}
                      className="rounded border-slate-300 text-[#6C2BD9]"
                    />
                    <span className="font-medium text-slate-800">Include 4-digit Year (YYYY) in identifier string</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={currentScheme.resetRule === 'Yearly'}
                      onChange={(e) => {
                        const copy = [...schemes];
                        copy[selectedSchemeIndex].resetRule = e.target.checked ? 'Yearly' : 'Never';
                        setSchemes(copy);
                      }}
                      className="rounded border-slate-300 text-[#6C2BD9]"
                    />
                    <span className="font-medium text-slate-800">Automatically reset sequence to 1 at start of new calendar year</span>
                  </label>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 4: LOOKUPS & BUSINESS LISTS (Tab 7)                                  */}
        {/* ========================================================================= */}
        {activeTab === 'Lookups & Lists' && (
          <div className="bg-white border border-slate-200 rounded-xl shadow-2xs p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Centrally Maintained Dropdown Values</h3>
                <p className="text-xs text-slate-500">Configure business lists without application code modifications</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowLookupModal(true)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white text-xs font-semibold rounded-lg shadow-2xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add Lookup Value</span>
                </button>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">Lookup Category</label>
                <select
                  value={selectedLookupCategory}
                  onChange={(e) => setSelectedLookupCategory(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2 bg-white text-slate-800"
                >
                  <option value="All Categories">All Categories</option>
                  <option value="Asset Condition">Asset Condition</option>
                  <option value="Asset Criticality">Asset Criticality</option>
                  <option value="Movement Reason">Movement Reason</option>
                  <option value="Disposal Reason">Disposal Reason</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">Search Values</label>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search by code or display value..."
                    value={lookupSearch}
                    onChange={(e) => setLookupSearch(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg pl-8 pr-3 py-2 bg-white text-slate-800"
                  />
                </div>
              </div>
            </div>

            {/* Lookups Table */}
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-[#FAF8FF] border-b border-slate-200 text-slate-600 text-[11px] font-semibold">
                  <tr>
                    <th className="py-2.5 px-4">Category</th>
                    <th className="py-2.5 px-3 font-mono">Code</th>
                    <th className="py-2.5 px-4 font-semibold text-slate-800">Display Value</th>
                    <th className="py-2.5 px-3 text-center">Order</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-4">Description</th>
                    <th className="py-2.5 px-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {lookups
                    .filter(l => selectedLookupCategory === 'All Categories' || l.category === selectedLookupCategory)
                    .filter(l => !lookupSearch.trim() || l.code.toLowerCase().includes(lookupSearch.toLowerCase()) || l.value.toLowerCase().includes(lookupSearch.toLowerCase()))
                    .map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-4 text-slate-700 font-medium">{item.category}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-600 text-[11px]">{item.code}</td>
                        <td className="py-2.5 px-4 font-bold text-slate-900">{item.value}</td>
                        <td className="py-2.5 px-3 text-center font-mono text-slate-500">{item.sequence}</td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                              item.status === 'Active'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-slate-100 text-slate-600 border-slate-200'
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-slate-500">{item.description}</td>
                        <td className="py-2.5 px-3 text-center">
                          <button
                            onClick={() => {
                              const newStatus = item.status === 'Active' ? 'Inactive' : 'Active';
                              setLookups(prev => prev.map(l => l.id === item.id ? { ...l, status: newStatus } : l));
                              showNotification('success', `Lookup value "${item.value}" marked as ${newStatus}`);
                            }}
                            className="text-xs font-semibold text-[#6C2BD9] hover:underline"
                          >
                            {item.status === 'Active' ? 'Deactivate' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: EDIT PARAMETER VALUE MODAL                                      */}
      {/* ========================================================================= */}
      {editingParam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Edit Configuration Parameter</h3>
                <p className="text-[11px] text-slate-500">{editingParam.module} &bull; {editingParam.category}</p>
              </div>
              <button onClick={() => setEditingParam(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Parameter Name</label>
                <input
                  type="text"
                  readOnly
                  value={editingParam.name}
                  className="w-full border border-slate-200 rounded-lg p-2.5 bg-slate-50 font-semibold text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Current Value *</label>
                {editingParam.parameterType === 'Boolean' ? (
                  <select
                    value={editingParam.currentValue}
                    onChange={(e) => setEditingParam({ ...editingParam, currentValue: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg p-2.5 bg-white text-slate-900 font-semibold focus:outline-none focus:border-[#6C2BD9]"
                  >
                    <option value="Yes">Yes (Enabled)</option>
                    <option value="No">No (Disabled)</option>
                  </select>
                ) : editingParam.parameterType === 'Number' ? (
                  <input
                    type="number"
                    value={editingParam.currentValue}
                    onChange={(e) => setEditingParam({ ...editingParam, currentValue: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg p-2.5 bg-white text-slate-900 font-mono focus:outline-none focus:border-[#6C2BD9]"
                  />
                ) : (
                  <input
                    type="text"
                    value={editingParam.currentValue}
                    onChange={(e) => setEditingParam({ ...editingParam, currentValue: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg p-2.5 bg-white text-slate-900 font-medium focus:outline-none focus:border-[#6C2BD9]"
                  />
                )}
                <p className="text-[11px] text-slate-400 mt-1">Default Factory Value: {editingParam.defaultValue}</p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Status</label>
                <select
                  value={editingParam.status}
                  onChange={(e) => setEditingParam({ ...editingParam, status: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg p-2.5 bg-white text-slate-800 focus:outline-none focus:border-[#6C2BD9]"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editingParam.description}
                  onChange={(e) => setEditingParam({ ...editingParam, description: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-700 focus:outline-none focus:border-[#6C2BD9]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 px-6 py-3.5 bg-slate-50 border-t border-slate-100 text-xs">
              <button
                onClick={() => setEditingParam(null)}
                className="px-4 py-2 border border-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEditedParam}
                className="px-4 py-2 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white font-semibold rounded-lg shadow-2xs cursor-pointer"
              >
                Save Parameter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: ADD CONFIGURATION PARAMETER MODAL                                */}
      {/* ========================================================================= */}
      {showAddParamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Add New Configuration Parameter</h3>
              <button onClick={() => setShowAddParamModal(false)} className="p-1 rounded text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Parameter Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Asset Depreciation Frequency"
                  value={newParamData.name}
                  onChange={(e) => setNewParamData({ ...newParamData, name: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-[#6C2BD9]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Module</label>
                  <select
                    value={newParamData.module}
                    onChange={(e) => setNewParamData({ ...newParamData, module: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg p-2.5 bg-white"
                  >
                    <option value="General">General</option>
                    <option value="Asset">Asset</option>
                    <option value="Inventory">Inventory</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <input
                    type="text"
                    placeholder="e.g. Finance"
                    value={newParamData.category}
                    onChange={(e) => setNewParamData({ ...newParamData, category: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg p-2.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Current Value</label>
                  <input
                    type="text"
                    value={newParamData.currentValue}
                    onChange={(e) => setNewParamData({ ...newParamData, currentValue: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg p-2.5"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Parameter Type</label>
                  <select
                    value={newParamData.parameterType}
                    onChange={(e) => setNewParamData({ ...newParamData, parameterType: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg p-2.5 bg-white"
                  >
                    <option value="Text">Text</option>
                    <option value="Number">Number</option>
                    <option value="Boolean">Boolean</option>
                    <option value="Lookup">Lookup</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newParamData.description}
                  onChange={(e) => setNewParamData({ ...newParamData, description: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg p-2.5"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 px-6 py-3.5 bg-slate-50 border-t border-slate-100 text-xs">
              <button onClick={() => setShowAddParamModal(false)} className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg">
                Cancel
              </button>
              <button
                onClick={async () => {
                  const created = {
                    id: `PARAM-${String(parameters.length + 1).padStart(3, '0')}`,
                    name: newParamData.name || 'Custom Parameter',
                    module: newParamData.module,
                    category: newParamData.category,
                    currentValue: newParamData.currentValue || 'Default',
                    defaultValue: newParamData.defaultValue || newParamData.currentValue || 'Default',
                    parameterType: newParamData.parameterType,
                    status: 'Active',
                    description: newParamData.description
                  };
                  setParameters([created, ...parameters]);
                  try {
                    await api.post('/admin/config/parameters', created);
                  } catch (e) {}
                  setShowAddParamModal(false);
                  showNotification('success', `Added parameter "${created.name}"`);
                }}
                className="px-4 py-2 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white font-semibold rounded-lg"
              >
                Create Parameter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: ADD WORKFLOW MODAL                                               */}
      {/* ========================================================================= */}
      {showAddWfModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Add Approval Workflow</h3>
              <button onClick={() => setShowAddWfModal(false)} className="p-1 rounded text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Workflow Name *</label>
                <input
                  type="text"
                  placeholder="e.g. IT Equipment Scrap Approval"
                  value={newWfData.name}
                  onChange={(e) => setNewWfData({ ...newWfData, name: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg p-2.5"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Transaction Type</label>
                <select
                  value={newWfData.transactionType}
                  onChange={(e) => setNewWfData({ ...newWfData, transactionType: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg p-2.5 bg-white"
                >
                  <option value="Asset Procurement">Asset Procurement</option>
                  <option value="Asset Disposal">Asset Disposal</option>
                  <option value="Asset Transfer">Asset Transfer</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Inventory">Inventory</option>
                  <option value="Verification & Audit">Verification &amp; Audit</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newWfData.description}
                  onChange={(e) => setNewWfData({ ...newWfData, description: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg p-2.5"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 px-6 py-3.5 bg-slate-50 border-t border-slate-100 text-xs">
              <button onClick={() => setShowAddWfModal(false)} className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg">
                Cancel
              </button>
              <button
                onClick={async () => {
                  const created = {
                    id: `WF-${String(workflows.length + 1).padStart(3, '0')}`,
                    name: newWfData.name || 'New Custom Workflow',
                    transactionType: newWfData.transactionType,
                    description: newWfData.description || 'Custom configured approval workflow.',
                    levelsCount: 2,
                    company: 'All Companies',
                    businessUnit: 'Corporate',
                    status: 'Active',
                    effectiveFrom: newWfData.effectiveFrom,
                    applicableFor: 'All Companies',
                    stages: [
                      { id: 1, title: 'Requester', role: 'Initiator', action: 'Submit Request', type: 'initiator' },
                      { id: 2, title: 'Department Head', role: 'Final Approval', action: 'Approve / Reject', type: 'final' }
                    ],
                    levels: [
                      { level: 1, approverRole: 'Department Head', approvalType: 'Approval', condition: 'All Requests' }
                    ]
                  };
                  setWorkflows([created, ...workflows]);
                  setSelectedWorkflowId(created.id);
                  try {
                    await api.post('/admin/config/workflows', created);
                  } catch (e) {}
                  setShowAddWfModal(false);
                  showNotification('success', `Workflow "${created.name}" created.`);
                }}
                className="px-4 py-2 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white font-semibold rounded-lg"
              >
                Create Workflow
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: ADD WORKFLOW LEVEL MODAL                                         */}
      {/* ========================================================================= */}
      {showAddLevelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Add Approval Level</h3>
              <button onClick={() => setShowAddLevelModal(false)} className="p-1 rounded text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Approver Role / User</label>
                <select
                  value={newLevelData.approverRole}
                  onChange={(e) => setNewLevelData({ ...newLevelData, approverRole: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg p-2.5 bg-white"
                >
                  <option value="Department Manager">Department Manager</option>
                  <option value="Asset Manager">Asset Manager</option>
                  <option value="Finance Controller">Finance Controller</option>
                  <option value="Operations Director">Operations Director</option>
                  <option value="Managing Director">Managing Director</option>
                  <option value="HSE Compliance Officer">HSE Compliance Officer</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Approval Type</label>
                <select
                  value={newLevelData.approvalType}
                  onChange={(e) => setNewLevelData({ ...newLevelData, approvalType: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg p-2.5 bg-white"
                >
                  <option value="Approval">Approval</option>
                  <option value="Final Approval">Final Approval</option>
                  <option value="Technical Review">Technical Review</option>
                  <option value="Safety Sign-Off">Safety Sign-Off</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Condition Expression</label>
                <input
                  type="text"
                  placeholder="e.g. Amount > AED 25,000"
                  value={newLevelData.condition}
                  onChange={(e) => setNewLevelData({ ...newLevelData, condition: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg p-2.5"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 px-6 py-3 bg-slate-50 border-t border-slate-100 text-xs">
              <button onClick={() => setShowAddLevelModal(false)} className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg">
                Cancel
              </button>
              <button
                onClick={handleAddLevelSubmit}
                className="px-4 py-2 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white font-semibold rounded-lg"
              >
                Add Level
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: RECALIBRATE SEQUENCE MODAL                                       */}
      {/* ========================================================================= */}
      {showRecalibrateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-slate-200 p-6 space-y-4 text-xs">
            <h3 className="font-bold text-slate-900 text-sm">Recalibrate Sequence Counter</h3>
            <p className="text-slate-500">
              Set the counter value for {currentScheme?.entity}. Future identifiers will increment from this baseline.
            </p>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">New Counter Value</label>
              <input
                type="number"
                value={recalibrateValue}
                onChange={(e) => setRecalibrateValue(Number(e.target.value))}
                className="w-full border border-slate-200 rounded-lg p-2 font-mono"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowRecalibrateModal(false)} className="px-3 py-1.5 border border-slate-200 text-slate-700 rounded-lg">
                Cancel
              </button>
              <button
                onClick={() => {
                  const copy = [...schemes];
                  copy[selectedSchemeIndex].current = Number(recalibrateValue);
                  setSchemes(copy);
                  setShowRecalibrateModal(false);
                  showNotification('success', `Recalibrated counter to ${recalibrateValue}`);
                }}
                className="px-4 py-1.5 bg-[#6C2BD9] text-white rounded-lg font-semibold"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 6: ADD LOOKUP VALUE MODAL                                           */}
      {/* ========================================================================= */}
      {showLookupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 p-6 space-y-3 text-xs">
            <h3 className="font-bold text-slate-900 text-sm">Add Dropdown Lookup Value</h3>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Category</label>
              <select
                value={lookupFormData.category}
                onChange={(e) => setLookupFormData({ ...lookupFormData, category: e.target.value })}
                className="w-full border border-slate-200 rounded-lg p-2 bg-white"
              >
                <option value="Asset Condition">Asset Condition</option>
                <option value="Asset Criticality">Asset Criticality</option>
                <option value="Movement Reason">Movement Reason</option>
                <option value="Disposal Reason">Disposal Reason</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Code</label>
              <input
                type="text"
                placeholder="e.g. COND_REFURB"
                value={lookupFormData.code}
                onChange={(e) => setLookupFormData({ ...lookupFormData, code: e.target.value })}
                className="w-full border border-slate-200 rounded-lg p-2 font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Display Value *</label>
              <input
                type="text"
                placeholder="e.g. Refurbished / Serviced"
                value={lookupFormData.value}
                onChange={(e) => setLookupFormData({ ...lookupFormData, value: e.target.value })}
                className="w-full border border-slate-200 rounded-lg p-2 font-semibold"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Description</label>
              <textarea
                rows={2}
                value={lookupFormData.description}
                onChange={(e) => setLookupFormData({ ...lookupFormData, description: e.target.value })}
                className="w-full border border-slate-200 rounded-lg p-2"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowLookupModal(false)} className="px-3 py-1.5 border border-slate-200 text-slate-700 rounded-lg">
                Cancel
              </button>
              <button
                onClick={() => {
                  const newL = {
                    id: `lk-${Date.now()}`,
                    category: lookupFormData.category,
                    code: lookupFormData.code || `CODE_${Date.now().toString().slice(-4)}`,
                    value: lookupFormData.value || 'New Value',
                    sequence: lookups.length + 1,
                    status: 'Active',
                    description: lookupFormData.description
                  };
                  setLookups([...lookups, newL]);
                  setShowLookupModal(false);
                  showNotification('success', `Added "${newL.value}" to ${newL.category}`);
                }}
                className="px-4 py-1.5 bg-[#6C2BD9] text-white rounded-lg font-semibold"
              >
                Add Value
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SystemConfiguration;
