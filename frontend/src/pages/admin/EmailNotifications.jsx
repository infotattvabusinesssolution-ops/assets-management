import React, { useState, useEffect, useMemo } from 'react';
import {
  Mail,
  Send,
  Settings,
  List,
  Users,
  FileCode,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Eye,
  Copy,
  Plus,
  RefreshCw,
  X,
  Lock,
  Search,
  ExternalLink,
  ChevronRight,
  Clock,
  MoreHorizontal,
  Bold,
  Italic,
  Underline,
  ListOrdered,
  List as ListIcon,
  Link2,
  Image as ImageIcon,
  Code2,
  Sliders,
  ChevronDown,
  Info,
  Smartphone,
  Monitor,
  Check,
  Slash
} from 'lucide-react';
import { api } from '../../services/api';
import clsx from 'clsx';

// Pre-seeded 24 templates matching rows 1-12 of the wireframe screenshot and extended catalog
export const INITIAL_TEMPLATES = [
  {
    id: 'TMPL-001',
    name: 'Work Order Assignment',
    module: 'Maintenance',
    eventType: 'Work Order Created',
    status: 'Active',
    lastModified: '10 Sep 2026',
    subject: 'New Work Order Assigned - {{WO_No}}',
    description: 'Notification sent to the assigned technician when a new work order is created.',
    recipientsRule: 'Assigned Technician (To), Maintenance Supervisor (CC)',
    bodyText: 'Dear {{User_Name}},\n\nA new work order has been assigned to you.\n\nWork Order Number : {{WO_No}}\nAsset             : {{Asset_Name}}\nPriority          : {{Priority}}\nDue Date          : {{Due_Date}}\nLocation          : {{Location}}\n\nPlease login to Asset360 to view the details.\n\nRegards,\nAsset360 Team',
    bodyHtml: `<p>Dear {{User_Name}},</p>
<p>A new work order has been assigned to you.</p>
<table style="width:100%; border-collapse:collapse; margin:14px 0; font-size:13px; color:#1e293b;">
  <tr>
    <td style="width:170px; font-weight:600; color:#475569; padding:4px 0;">Work Order Number</td>
    <td style="color:#0f172a;">: {{WO_No}}</td>
  </tr>
  <tr>
    <td style="font-weight:600; color:#475569; padding:4px 0;">Asset</td>
    <td style="color:#0f172a;">: {{Asset_Name}}</td>
  </tr>
  <tr>
    <td style="font-weight:600; color:#475569; padding:4px 0;">Priority</td>
    <td style="color:#0f172a;">: {{Priority}}</td>
  </tr>
  <tr>
    <td style="font-weight:600; color:#475569; padding:4px 0;">Due Date</td>
    <td style="color:#0f172a;">: {{Due_Date}}</td>
  </tr>
  <tr>
    <td style="font-weight:600; color:#475569; padding:4px 0;">Location</td>
    <td style="color:#0f172a;">: {{Location}}</td>
  </tr>
</table>
<p style="margin-top:12px;">Please login to Asset360 to view the details.</p>
<p style="margin-top:20px; line-height:1.4;">Regards,<br/><strong>Asset360 Team</strong></p>`,
    availablePlaceholders: [
      '{{WO_No}}',
      '{{WO_Description}}',
      '{{Asset_Name}}',
      '{{Asset_No}}',
      '{{Priority}}',
      '{{Due_Date}}',
      '{{Location}}',
      '{{Assigned_To}}',
      '{{Created_By}}',
      '{{Company}}',
      '{{Link}}'
    ]
  },
  {
    id: 'TMPL-002',
    name: 'Work Order Completion',
    module: 'Maintenance',
    eventType: 'Work Order Completed',
    status: 'Active',
    lastModified: '10 Sep 2026',
    subject: 'Work Order Completed - {{WO_No}} ({{Asset_Name}})',
    description: 'Triggered when a work order is marked as resolved/completed by maintenance staff.',
    recipientsRule: 'Asset Custodian (To), Maintenance Manager (CC)',
    bodyText: 'Dear {{User_Name}},\n\nWork Order {{WO_No}} has been successfully completed.\n\nAsset: {{Asset_Name}} ({{Asset_No}})\nCompleted Date: {{Due_Date}}\n\nRegards,\nAsset360 Team',
    bodyHtml: `<p>Dear {{User_Name}},</p><p>Work Order <strong>{{WO_No}}</strong> for asset <strong>{{Asset_Name}}</strong> has been successfully completed.</p><table style="width:100%; border-collapse:collapse; margin:14px 0; font-size:13px;"><tr><td style="width:170px; font-weight:600; color:#475569; padding:4px 0;">Work Order Number</td><td>: {{WO_No}}</td></tr><tr><td style="font-weight:600; color:#475569; padding:4px 0;">Asset</td><td>: {{Asset_Name}} ({{Asset_No}})</td></tr><tr><td style="font-weight:600; color:#475569; padding:4px 0;">Completed Date</td><td>: {{Due_Date}}</td></tr></table><p>Please review and sign off in Asset360.</p><p style="margin-top:20px;">Regards,<br/><strong>Asset360 Team</strong></p>`,
    availablePlaceholders: ['{{WO_No}}', '{{Asset_Name}}', '{{Asset_No}}', '{{Due_Date}}', '{{Location}}', '{{Assigned_To}}']
  },
  {
    id: 'TMPL-003',
    name: 'PM Due Reminder',
    module: 'Maintenance',
    eventType: 'Preventive Maintenance Due',
    status: 'Active',
    lastModified: '09 Sep 2026',
    subject: 'Preventive Maintenance Due Reminder: {{Asset_Name}} ({{Asset_No}})',
    description: 'Advance notice dispatched 7 days prior to scheduled maintenance.',
    recipientsRule: 'Maintenance Planner & Assigned Crew (To)',
    bodyText: 'Dear Maintenance Team,\n\nScheduled preventive maintenance is due on {{Due_Date}} for {{Asset_Name}} ({{Asset_No}}).\n\nLocation: {{Location}}\n\nRegards,\nAsset360 Team',
    bodyHtml: `<p>Dear Maintenance Team,</p><p>Scheduled preventive maintenance is due for asset <strong>{{Asset_Name}}</strong> ({{Asset_No}}) on <strong>{{Due_Date}}</strong>.</p><table style="width:100%; margin:14px 0; font-size:13px;"><tr><td style="width:170px; font-weight:600; color:#475569; padding:4px 0;">Asset Name</td><td>: {{Asset_Name}}</td></tr><tr><td style="font-weight:600; color:#475569; padding:4px 0;">Due Date</td><td>: {{Due_Date}}</td></tr><tr><td style="font-weight:600; color:#475569; padding:4px 0;">Location</td><td>: {{Location}}</td></tr></table><p>Regards,<br/><strong>Asset360 Team</strong></p>`,
    availablePlaceholders: ['{{Asset_Name}}', '{{Asset_No}}', '{{Due_Date}}', '{{Location}}', '{{Link}}']
  },
  {
    id: 'TMPL-004',
    name: 'PM Overdue Alert',
    module: 'Maintenance',
    eventType: 'Preventive Maintenance Overdue',
    status: 'Active',
    lastModified: '09 Sep 2026',
    subject: 'URGENT: Preventive Maintenance Overdue for {{Asset_Name}} ({{Asset_No}})',
    description: 'High-priority escalation when preventive maintenance is past its designated schedule.',
    recipientsRule: 'Plant Operations Head & Maintenance Director (To)',
    bodyText: 'Attention,\n\nPreventive maintenance for {{Asset_Name}} ({{Asset_No}}) at {{Location}} is overdue past {{Due_Date}}.\n\nRegards,\nAsset360 Team',
    bodyHtml: `<p style="color:#dc2626; font-weight:bold;">ESCALATION: Preventive Maintenance Overdue</p><p>Asset <strong>{{Asset_Name}}</strong> ({{Asset_No}}) at <strong>{{Location}}</strong> is overdue past its scheduled target <strong>{{Due_Date}}</strong>.</p><p>Immediate inspection required.</p><p>Regards,<br/><strong>Asset360 Team</strong></p>`,
    availablePlaceholders: ['{{Asset_Name}}', '{{Asset_No}}', '{{Due_Date}}', '{{Location}}', '{{Priority}}']
  },
  {
    id: 'TMPL-005',
    name: 'Asset Transfer Approval',
    module: 'Assets',
    eventType: 'Transfer Approval Required',
    status: 'Active',
    lastModified: '08 Sep 2026',
    subject: 'Action Required: Custody Transfer Approval - {{Asset_Name}}',
    description: 'Sent to line managers when an asset transfer request is initiated.',
    recipientsRule: 'Department Head & Approver (To)',
    bodyText: 'Dear {{User_Name}},\n\nAn asset transfer request has been initiated for {{Asset_Name}} ({{Asset_No}}).\n\nLocation: {{Location}}\n\nPlease review and approve in Asset360.\n\nRegards,\nAsset360 Team',
    bodyHtml: `<p>Dear {{User_Name}},</p><p>An asset custody transfer request requires your authorization:</p><table style="width:100%; margin:14px 0; font-size:13px;"><tr><td style="width:170px; font-weight:600; color:#475569; padding:4px 0;">Asset</td><td>: {{Asset_Name}} ({{Asset_No}})</td></tr><tr><td style="font-weight:600; color:#475569; padding:4px 0;">Destination</td><td>: {{Location}}</td></tr><tr><td style="font-weight:600; color:#475569; padding:4px 0;">Requested By</td><td>: {{Created_By}}</td></tr></table><p>Please log in to Asset360 to approve or reject.</p><p>Regards,<br/><strong>Asset360 Team</strong></p>`,
    availablePlaceholders: ['{{Asset_Name}}', '{{Asset_No}}', '{{Location}}', '{{Created_By}}', '{{Link}}']
  },
  {
    id: 'TMPL-006',
    name: 'Asset Transfer Completed',
    module: 'Assets',
    eventType: 'Transfer Completed',
    status: 'Active',
    lastModified: '08 Sep 2026',
    subject: 'Asset Transfer Completed: {{Asset_Name}} ({{Asset_No}})',
    description: 'Confirmation sent once receiving custodian acknowledges delivery and inspection.',
    recipientsRule: 'Requester, Origin Custodian, Destination Custodian (To)',
    bodyText: 'Dear Team,\n\nTransfer for asset {{Asset_Name}} has been acknowledged and finalized.\n\nNew Location: {{Location}}\n\nRegards,\nAsset360 Team',
    bodyHtml: `<p>Dear Team,</p><p>Custody transfer for asset <strong>{{Asset_Name}}</strong> ({{Asset_No}}) is complete.</p><p>New registered location: <strong>{{Location}}</strong>.</p><p>Regards,<br/><strong>Asset360 Team</strong></p>`,
    availablePlaceholders: ['{{Asset_Name}}', '{{Asset_No}}', '{{Location}}', '{{Assigned_To}}']
  },
  {
    id: 'TMPL-007',
    name: 'Asset Custodian Change',
    module: 'Assets',
    eventType: 'Custodian Updated',
    status: 'Active',
    lastModified: '07 Sep 2026',
    subject: 'Asset Custodian Assignment Notification - {{Asset_No}}',
    description: 'Notifies employee of new primary responsibility for an assigned fixed asset.',
    recipientsRule: 'New Custodian (To), HR Department (CC)',
    bodyText: 'Dear {{User_Name}},\n\nYou have been assigned as primary custodian for {{Asset_Name}} ({{Asset_No}}).\n\nLocation: {{Location}}\n\nRegards,\nAsset360 Team',
    bodyHtml: `<p>Dear {{User_Name}},</p><p>You are officially designated as primary custodian for asset <strong>{{Asset_Name}}</strong> ({{Asset_No}}).</p><table style="width:100%; margin:14px 0; font-size:13px;"><tr><td style="width:170px; font-weight:600; color:#475569; padding:4px 0;">Asset No</td><td>: {{Asset_No}}</td></tr><tr><td style="font-weight:600; color:#475569; padding:4px 0;">Asset Name</td><td>: {{Asset_Name}}</td></tr><tr><td style="font-weight:600; color:#475569; padding:4px 0;">Location</td><td>: {{Location}}</td></tr></table><p>Regards,<br/><strong>Asset360 Team</strong></p>`,
    availablePlaceholders: ['{{User_Name}}', '{{Asset_Name}}', '{{Asset_No}}', '{{Location}}', '{{Company}}']
  },
  {
    id: 'TMPL-008',
    name: 'Low Stock Alert',
    module: 'Inventory',
    eventType: 'Reorder Level',
    status: 'Active',
    lastModified: '06 Sep 2026',
    subject: 'Inventory Reorder Alert: {{Asset_Name}} below minimum threshold',
    description: 'Alerts storekeepers when consumable or spare part balance drops below reorder point.',
    recipientsRule: 'Warehouse Storekeeper & Purchasing Officer (To)',
    bodyText: 'Attention,\n\nStock level for {{Asset_Name}} at warehouse {{Location}} has reached minimum threshold.\n\nRegards,\nAsset360 Team',
    bodyHtml: `<p style="color:#b45309; font-weight:bold;">Inventory Reorder Alert</p><p>Spare part / stock item <strong>{{Asset_Name}}</strong> at warehouse <strong>{{Location}}</strong> is below minimum point.</p><p>Please issue procurement requisition.</p><p>Regards,<br/><strong>Asset360 Team</strong></p>`,
    availablePlaceholders: ['{{Asset_Name}}', '{{Asset_No}}', '{{Location}}', '{{Link}}']
  },
  {
    id: 'TMPL-009',
    name: 'Stock Received',
    module: 'Inventory',
    eventType: 'Goods Receipt',
    status: 'Active',
    lastModified: '06 Sep 2026',
    subject: 'Goods Receipt Note Generated for Order - {{Asset_Name}}',
    description: 'Confirmation of verified delivery inward against purchase order.',
    recipientsRule: 'Procurement Manager & Warehouse Supervisor (To)',
    bodyText: 'Dear Team,\n\nGoods receipt inward has been verified for {{Asset_Name}} at warehouse {{Location}}.\n\nRegards,\nAsset360 Team',
    bodyHtml: `<p>Dear Team,</p><p>Goods receipt note inward has been verified and registered for <strong>{{Asset_Name}}</strong>.</p><p>Warehouse: {{Location}}</p><p>Regards,<br/><strong>Asset360 Team</strong></p>`,
    availablePlaceholders: ['{{Asset_Name}}', '{{Asset_No}}', '{{Location}}', '{{Created_By}}']
  },
  {
    id: 'TMPL-010',
    name: 'Asset Warranty Expiry',
    module: 'Assets',
    eventType: 'Warranty Expiry',
    status: 'Active',
    lastModified: '05 Sep 2026',
    subject: 'Warranty Expiry Warning (30 Days): Asset {{Asset_No}} ({{Asset_Name}})',
    description: 'Advance notice for OEM manufacturer warranty lapse.',
    recipientsRule: 'Asset Custodian & Procurement Team (To)',
    bodyText: 'Dear Custodian,\n\nThe warranty for {{Asset_Name}} ({{Asset_No}}) will expire on {{Due_Date}}.\n\nRegards,\nAsset360 Team',
    bodyHtml: `<p>Dear Custodian,</p><p>The manufacturer warranty for asset <strong>{{Asset_Name}}</strong> ({{Asset_No}}) expires on <strong>{{Due_Date}}</strong>.</p><p>Please verify if extended warranty or AMC is required.</p><p>Regards,<br/><strong>Asset360 Team</strong></p>`,
    availablePlaceholders: ['{{Asset_Name}}', '{{Asset_No}}', '{{Due_Date}}', '{{Company}}']
  },
  {
    id: 'TMPL-011',
    name: 'Contract / AMC Expiry',
    module: 'Maintenance',
    eventType: 'Contract Expiry',
    status: 'Active',
    lastModified: '05 Sep 2026',
    subject: 'Annual Maintenance Contract Renewal Due: {{Asset_Name}}',
    description: 'Sent 60 days before service agreement or vendor SLA lapses.',
    recipientsRule: 'Contracts Administrator & Legal Team (To)',
    bodyText: 'Dear Team,\n\nAMC service contract for {{Asset_Name}} expires on {{Due_Date}}.\n\nRegards,\nAsset360 Team',
    bodyHtml: `<p>Dear Team,</p><p>Annual maintenance contract for <strong>{{Asset_Name}}</strong> expires on <strong>{{Due_Date}}</strong>.</p><p>Regards,<br/><strong>Asset360 Team</strong></p>`,
    availablePlaceholders: ['{{Asset_Name}}', '{{Due_Date}}', '{{Company}}', '{{Link}}']
  },
  {
    id: 'TMPL-012',
    name: 'Asset Verification Assignment',
    module: 'Verification',
    eventType: 'Audit Assigned',
    status: 'Inactive',
    lastModified: '04 Sep 2026',
    subject: 'Physical Stocktake Assignment: Audit at {{Location}}',
    description: 'Notice dispatched to field auditor when an audit cycle is scheduled.',
    recipientsRule: 'Lead Auditor & Field Verification Team (To)',
    bodyText: 'Dear Auditor,\n\nYou have been assigned to conduct physical verification at location {{Location}}.\n\nRegards,\nAsset360 Team',
    bodyHtml: `<p>Dear Auditor,</p><p>You have been assigned to conduct physical verification audit at location <strong>{{Location}}</strong>.</p><p>Regards,<br/><strong>Asset360 Team</strong></p>`,
    availablePlaceholders: ['{{Location}}', '{{Due_Date}}', '{{Assigned_To}}', '{{Link}}']
  },
  {
    id: 'TMPL-013',
    name: 'Asset Verification Discrepancy',
    module: 'Verification',
    eventType: 'Audit Discrepancy Found',
    status: 'Active',
    lastModified: '04 Sep 2026',
    subject: 'Audit Discrepancy Alert: Exceptions Flagged at {{Location}}',
    description: 'Notifies internal audit and finance upon discovering missing or unverified assets.',
    recipientsRule: 'Internal Audit Head & Finance Director (To)',
    bodyText: 'Audit exceptions flagged for review at location {{Location}}.\n\nRegards,\nAsset360 Team',
    bodyHtml: `<p>Audit exceptions have been flagged during verification at <strong>{{Location}}</strong>.</p><p>Regards,<br/><strong>Asset360 Team</strong></p>`,
    availablePlaceholders: ['{{Location}}', '{{Link}}']
  },
  {
    id: 'TMPL-014',
    name: 'Asset Disposal Approval',
    module: 'Assets',
    eventType: 'Disposal Request Created',
    status: 'Active',
    lastModified: '03 Sep 2026',
    subject: 'Approval Needed: Asset Retirement & Disposal Request - {{Asset_Name}}',
    description: 'Disposal authorization workflow notification for end-of-life capital assets.',
    recipientsRule: 'Finance Controller & Asset Disposal Committee (To)',
    bodyText: 'Disposal request submitted for asset {{Asset_Name}} ({{Asset_No}}).\n\nRegards,\nAsset360 Team',
    bodyHtml: `<p>Disposal request submitted for asset <strong>{{Asset_Name}}</strong> ({{Asset_No}}).</p><p>Regards,<br/><strong>Asset360 Team</strong></p>`,
    availablePlaceholders: ['{{Asset_Name}}', '{{Asset_No}}', '{{Created_By}}']
  },
  {
    id: 'TMPL-015',
    name: 'Asset Disposal Completed',
    module: 'Assets',
    eventType: 'Disposal Certified',
    status: 'Active',
    lastModified: '03 Sep 2026',
    subject: 'Asset Deregistration & Disposal Certified: {{Asset_No}}',
    description: 'Official certificate dispatched upon certified scrap, sale, or recycling.',
    recipientsRule: 'Fixed Asset Accountant & Compliance Officer (To)',
    bodyText: 'Asset {{Asset_Name}} ({{Asset_No}}) has been written off and removed from active ledger.\n\nRegards,\nAsset360 Team',
    bodyHtml: `<p>Asset <strong>{{Asset_Name}}</strong> ({{Asset_No}}) has been written off and removed from ledger.</p><p>Regards,<br/><strong>Asset360 Team</strong></p>`,
    availablePlaceholders: ['{{Asset_Name}}', '{{Asset_No}}']
  },
  {
    id: 'TMPL-016',
    name: 'Asset Check-Out Alert',
    module: 'Assets',
    eventType: 'Asset Checked Out',
    status: 'Active',
    lastModified: '02 Sep 2026',
    subject: 'Tool / Equipment Check-Out: {{Asset_Name}} by {{User_Name}}',
    description: 'Temporary loan check-out confirmation to borrower and tool crib manager.',
    recipientsRule: 'Borrower (To), Tool Crib Supervisor (CC)',
    bodyText: 'Dear {{User_Name}},\n\nYou checked out {{Asset_Name}} ({{Asset_No}}). Expected return: {{Due_Date}}.\n\nRegards,\nAsset360 Team',
    bodyHtml: `<p>Dear {{User_Name}},</p><p>You checked out <strong>{{Asset_Name}}</strong> ({{Asset_No}}). Due back on <strong>{{Due_Date}}</strong>.</p><p>Regards,<br/><strong>Asset360 Team</strong></p>`,
    availablePlaceholders: ['{{User_Name}}', '{{Asset_Name}}', '{{Asset_No}}', '{{Due_Date}}']
  },
  {
    id: 'TMPL-017',
    name: 'Asset Check-In Confirmation',
    module: 'Assets',
    eventType: 'Asset Returned',
    status: 'Active',
    lastModified: '02 Sep 2026',
    subject: 'Tool / Equipment Returned: {{Asset_Name}} ({{Asset_No}})',
    description: 'Receipt given to user when borrowed tool is verified and returned in good condition.',
    recipientsRule: 'Borrower (To)',
    bodyText: 'Dear {{User_Name}},\n\nReturn acknowledged for {{Asset_Name}} ({{Asset_No}}).\n\nRegards,\nAsset360 Team',
    bodyHtml: `<p>Dear {{User_Name}},</p><p>Return acknowledged for <strong>{{Asset_Name}}</strong> ({{Asset_No}}).</p><p>Regards,<br/><strong>Asset360 Team</strong></p>`,
    availablePlaceholders: ['{{User_Name}}', '{{Asset_Name}}', '{{Asset_No}}']
  },
  {
    id: 'TMPL-018',
    name: 'Asset Maintenance Overdue',
    module: 'Maintenance',
    eventType: 'Maintenance Delayed',
    status: 'Active',
    lastModified: '01 Sep 2026',
    subject: 'SLA Breach Warning: Work Order {{WO_No}} Overdue',
    description: 'Corrective maintenance work order has exceeded allowed resolution timeframe.',
    recipientsRule: 'Maintenance Lead & Operations Manager (To)',
    bodyText: 'Warning:\n\nWO {{WO_No}} for {{Asset_Name}} is unresolved past target due date {{Due_Date}}.\n\nRegards,\nAsset360 Team',
    bodyHtml: `<p style="color:#b91c1c;">SLA Breach: Work Order <strong>{{WO_No}}</strong> is past due.</p><p>Regards,<br/>Asset360 Team</p>`,
    availablePlaceholders: ['{{WO_No}}', '{{Asset_Name}}', '{{Due_Date}}', '{{Assigned_To}}']
  },
  {
    id: 'TMPL-019',
    name: 'PO Approval Notification',
    module: 'Inventory',
    eventType: 'PO Pending Approval',
    status: 'Active',
    lastModified: '01 Sep 2026',
    subject: 'Purchase Order Approval Required for Asset Procurement',
    description: 'Sent to designated financial authority for purchase order release.',
    recipientsRule: 'Procurement Approver (To)',
    bodyText: 'Purchase order approval required in Asset360.\n\nRegards,\nAsset360 Team',
    bodyHtml: `<p>Purchase order approval required in Asset360.</p><p>Regards,<br/><strong>Asset360 Team</strong></p>`,
    availablePlaceholders: ['{{Created_By}}', '{{Company}}', '{{Link}}']
  },
  {
    id: 'TMPL-020',
    name: 'PO Goods Inward Receipt',
    module: 'Inventory',
    eventType: 'Goods Inspected',
    status: 'Active',
    lastModified: '31 Aug 2026',
    subject: 'Inspection Complete for Delivery at {{Location}}',
    description: 'Quality inspection passed for newly arrived asset batch.',
    recipientsRule: 'Receiving Team & Requester (To)',
    bodyText: 'Quality inspection passed for newly arrived batch.\n\nRegards,\nAsset360 Team',
    bodyHtml: `<p>Quality inspection passed for batch at <strong>{{Location}}</strong>.</p><p>Regards,<br/><strong>Asset360 Team</strong></p>`,
    availablePlaceholders: ['{{Location}}', '{{Link}}']
  },
  {
    id: 'TMPL-021',
    name: 'License Renewal Warning',
    module: 'Assets',
    eventType: 'Software License Expiring',
    status: 'Active',
    lastModified: '30 Aug 2026',
    subject: 'Software License Expiry in 15 Days: {{Asset_Name}}',
    description: 'Notifies IT software asset manager about approaching license seat expiration.',
    recipientsRule: 'IT Asset Manager & CIO Office (To)',
    bodyText: 'Software license for {{Asset_Name}} expires on {{Due_Date}}.\n\nRegards,\nAsset360 Team',
    bodyHtml: `<p>Software license for <strong>{{Asset_Name}}</strong> expires on <strong>{{Due_Date}}</strong>.</p><p>Regards,<br/><strong>Asset360 Team</strong></p>`,
    availablePlaceholders: ['{{Asset_Name}}', '{{Due_Date}}']
  },
  {
    id: 'TMPL-022',
    name: 'Insurance Policy Expiry',
    module: 'Assets',
    eventType: 'Policy Expiry Warning',
    status: 'Active',
    lastModified: '29 Aug 2026',
    subject: 'Asset Insurance Policy Expiration Alert for Fleet',
    description: 'Sent 45 days prior to fleet or facility insurance policy termination.',
    recipientsRule: 'Risk Management & Finance Director (To)',
    bodyText: 'Insurance policy renewal due on {{Due_Date}}.\n\nRegards,\nAsset360 Team',
    bodyHtml: `<p>Asset insurance policy renewal due on <strong>{{Due_Date}}</strong>.</p><p>Regards,<br/><strong>Asset360 Team</strong></p>`,
    availablePlaceholders: ['{{Due_Date}}', '{{Company}}']
  },
  {
    id: 'TMPL-023',
    name: 'Security Incident Alert',
    module: 'Administration',
    eventType: 'Failed Login Threshold',
    status: 'Inactive',
    lastModified: '28 Aug 2026',
    subject: 'Security Notice: Multiple Failed Sign-in Attempts for {{User_Name}}',
    description: 'Dispatched when abnormal credential failure triggers rate limit / lockout threshold.',
    recipientsRule: 'Security Operations & User (To)',
    bodyText: 'Security Notice: 5 consecutive failed logins detected for {{User_Name}}.\n\nRegards,\nAsset360 Team',
    bodyHtml: `<p style="color:#b91c1c;">Security Notice: Failed logins detected for {{User_Name}}.</p><p>Regards,<br/><strong>Asset360 Team</strong></p>`,
    availablePlaceholders: ['{{User_Name}}']
  },
  {
    id: 'TMPL-024',
    name: 'System Backup Alert',
    module: 'Administration',
    eventType: 'Scheduled Backup Completed',
    status: 'Active',
    lastModified: '27 Aug 2026',
    subject: 'Daily Database & Asset Archive Backup Completed Successfully',
    description: 'System health notification sent after nightly automated backup validation.',
    recipientsRule: 'System Administrators (To)',
    bodyText: 'System Notice: Nightly backup finished with 100% integrity verification.\n\nRegards,\nAsset360 Team',
    bodyHtml: `<p>System Notice: Nightly backup finished with 100% integrity verification.</p><p>Regards,<br/><strong>Asset360 Team</strong></p>`,
    availablePlaceholders: ['{{Company}}']
  }
];

const FALLBACK_LOGS = [
  { id: 'NOTIF-091', timestamp: '16 Sep 2026 04:10 PM', template: 'Work Order Assignment', recipient: 'omar.rahman@asset360.com', subject: 'New Work Order Assigned - WO-2026-00482', status: 'Delivered', latency: '342ms', retryCount: 0 },
  { id: 'NOTIF-090', timestamp: '16 Sep 2026 03:20 PM', template: 'Asset Transfer Approval', recipient: 'sarah.ahmed@asset360.com', subject: 'Action Required: Custody Transfer Approval - Dell Latitude 5440', status: 'Delivered', latency: '412ms', retryCount: 0 },
  { id: 'NOTIF-089', timestamp: '16 Sep 2026 01:15 PM', template: 'Low Stock Alert', recipient: 'chen.wei@asset360.com', subject: 'Inventory Reorder Alert: Air Filter HVAC-01 below minimum threshold', status: 'Delivered', latency: '280ms', retryCount: 0 },
  { id: 'NOTIF-088', timestamp: '15 Sep 2026 11:45 AM', template: 'Asset Warranty Expiry', recipient: 'john.doe@asset360.com', subject: 'Warranty Expiry Warning (30 Days): Asset AST-000104', status: 'Delivered', latency: '510ms', retryCount: 0 },
  { id: 'NOTIF-087', timestamp: '15 Sep 2026 09:30 AM', template: 'PM Due Reminder', recipient: 'maintenance-lead@asset360.com', subject: 'Preventive Maintenance Due Reminder: Chiller Unit #4', status: 'Delivered', latency: '315ms', retryCount: 0 },
  { id: 'NOTIF-086', timestamp: '14 Sep 2026 05:00 PM', template: 'Work Order Completion', recipient: 'fatima.almansoori@asset360.com', subject: 'Work Order Completed - WO-2026-00475 (Generator Set B)', status: 'Delivered', latency: '298ms', retryCount: 0 }
];

export function EmailNotifications() {
  // Top Navigation Tabs
  const [activeTab, setActiveTab] = useState('TEMPLATES'); // 'TEMPLATES' | 'RULES' | 'GROUPS' | 'SETTINGS' | 'LOGS'
  const [templates, setTemplates] = useState(INITIAL_TEMPLATES);
  const [selectedTemplateId, setSelectedTemplateId] = useState('TMPL-001');

  // Search and Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [moduleFilter, setModuleFilter] = useState('All Modules');
  const [eventTypeFilter, setEventTypeFilter] = useState('All Event Types');
  const [statusFilter, setStatusFilter] = useState('All Statuses');

  // Multi-select Checkboxes
  const [selectedRowIds, setSelectedRowIds] = useState(new Set());

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  // Right Panel Details Sub-Tab
  const [subTab, setSubTab] = useState('CONTENT'); // 'CONTENT' | 'RECIPIENTS' | 'SETTINGS' | 'AUDIT'
  const [editorMode, setEditorMode] = useState('HTML'); // 'HTML' | 'TEXT'

  // Editable Template Form State
  const [templateForm, setTemplateForm] = useState(INITIAL_TEMPLATES[0]);

  // Modals & Feedback
  const [toast, setToast] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewDevice, setPreviewDevice] = useState('desktop'); // 'desktop' | 'mobile'
  const [showTestModal, setShowTestModal] = useState(false);
  const [testEmailAddress, setTestEmailAddress] = useState('admin@infotattva.com');
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [placeholderSearch, setPlaceholderSearch] = useState('');

  // SMTP Settings State
  const [settings, setSettings] = useState({
    smtpHost: 'smtp.office365.com',
    smtpPort: 587,
    encryption: 'TLS',
    senderName: 'Asset360 Notifications',
    senderEmail: 'asset360-no-reply@infotattva.com',
    dailyLimit: 5000,
    sentToday: 142
  });
  const [deliveryLogs, setDeliveryLogs] = useState(FALLBACK_LOGS);

  const showNotification = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // Sync selected template into form
  useEffect(() => {
    const current = templates.find(t => t.id === selectedTemplateId) || templates[0];
    if (current) {
      setTemplateForm({ ...current });
    }
  }, [selectedTemplateId, templates]);

  // Load from API with fallback
  const loadData = async () => {
    try {
      const [tRes, sRes, lRes] = await Promise.all([
        api.get('/admin/notifications/templates'),
        api.get('/admin/notifications/settings'),
        api.get('/admin/notifications/logs')
      ]);
      if (tRes?.templates && tRes.templates.length > 0) {
        setTemplates(tRes.templates);
      }
      if (sRes?.settings) setSettings(sRes.settings);
      if (lRes?.logs && lRes.logs.length > 0) setDeliveryLogs(lRes.logs);
    } catch (err) {
      console.warn('Using local fallback templates:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter Templates
  const filteredTemplates = useMemo(() => {
    return templates.filter(t => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.eventType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.subject.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesModule = moduleFilter === 'All Modules' || t.module === moduleFilter;
      const matchesEvent = eventTypeFilter === 'All Event Types' || t.eventType === eventTypeFilter;
      const matchesStatus = statusFilter === 'All Statuses' || t.status === statusFilter;

      return matchesSearch && matchesModule && matchesEvent && matchesStatus;
    });
  }, [templates, searchQuery, moduleFilter, eventTypeFilter, statusFilter]);

  // Pagination calculation
  const totalRecords = filteredTemplates.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
  const currentPageSafe = Math.min(currentPage, totalPages);
  const startIdx = (currentPageSafe - 1) * pageSize;
  const endIdx = Math.min(startIdx + pageSize, totalRecords);
  const displayedTemplates = filteredTemplates.slice(startIdx, endIdx);

  // Checkbox handlers
  const isAllSelected = displayedTemplates.length > 0 && displayedTemplates.every(t => selectedRowIds.has(t.id));
  const toggleSelectAll = () => {
    if (isAllSelected) {
      const next = new Set(selectedRowIds);
      displayedTemplates.forEach(t => next.delete(t.id));
      setSelectedRowIds(next);
    } else {
      const next = new Set(selectedRowIds);
      displayedTemplates.forEach(t => next.add(t.id));
      setSelectedRowIds(next);
    }
  };

  const toggleSelectRow = (id, e) => {
    e.stopPropagation();
    const next = new Set(selectedRowIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedRowIds(next);
  };

  // Placeholder insertion & copying
  const handleInsertPlaceholder = (token) => {
    navigator.clipboard.writeText(token);
    setTemplateForm(prev => ({
      ...prev,
      bodyHtml: prev.bodyHtml + ` ${token} `
    }));
    showNotification('success', `Copied ${token} and appended to template`);
  };

  // Clone Template
  const handleCloneTemplate = () => {
    const newId = `TMPL-${String(templates.length + 1).padStart(3, '0')}`;
    const cloned = {
      ...templateForm,
      id: newId,
      name: `${templateForm.name} (Copy)`,
      lastModified: '16 Sep 2026'
    };
    setTemplates(prev => [cloned, ...prev]);
    setSelectedTemplateId(newId);
    showNotification('success', `Cloned template as "${cloned.name}"`);
  };

  // Toggle Active / Deactivate
  const handleToggleActive = () => {
    const nextStatus = templateForm.status === 'Active' ? 'Inactive' : 'Active';
    const updated = { ...templateForm, status: nextStatus };
    setTemplateForm(updated);
    setTemplates(prev => prev.map(t => (t.id === updated.id ? updated : t)));
    showNotification('success', `Template marked as ${nextStatus}`);
  };

  // Save changes
  const handleSaveChanges = async () => {
    try {
      await api.put(`/admin/notifications/templates/${templateForm.id}`, templateForm);
    } catch (err) {
      console.warn('Saved in local state:', err);
    }
    setTemplates(prev => prev.map(t => (t.id === templateForm.id ? templateForm : t)));
    showNotification('success', `Saved changes for "${templateForm.name}"`);
  };

  // Send Test Email
  const handleSendTestEmail = async () => {
    setIsSendingTest(true);
    try {
      await api.post('/admin/notifications/test-email', {
        templateId: templateForm.id,
        testEmail: testEmailAddress
      });
      const newLog = {
        id: `NOTIF-${String(deliveryLogs.length + 92).padStart(3, '0')}`,
        timestamp: 'Just now',
        template: templateForm.name,
        recipient: testEmailAddress,
        subject: `[TEST] ${templateForm.subject.replace('{{WO_No}}', 'WO-2026-999')}`,
        status: 'Delivered',
        latency: '310ms',
        retryCount: 0
      };
      setDeliveryLogs(prev => [newLog, ...prev]);
      showNotification('success', `Test email dispatched to ${testEmailAddress}`);
      setShowTestModal(false);
    } catch (err) {
      showNotification('error', 'Failed to send test email');
    } finally {
      setIsSendingTest(false);
    }
  };

  // Filtered available placeholders
  const currentPlaceholders = templateForm.availablePlaceholders || [
    '{{WO_No}}',
    '{{WO_Description}}',
    '{{Asset_Name}}',
    '{{Asset_No}}',
    '{{Priority}}',
    '{{Due_Date}}',
    '{{Location}}',
    '{{Assigned_To}}',
    '{{Created_By}}',
    '{{Company}}',
    '{{Link}}'
  ];

  const filteredPlaceholders = currentPlaceholders.filter(p =>
    placeholderSearch.trim() === '' || p.toLowerCase().includes(placeholderSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-16 font-sans text-slate-800">
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
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-[1780px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
              <span>Administration</span>
              <span className="text-slate-400">&gt;</span>
              <span className="font-semibold text-slate-800">Email Notifications</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Email Notifications</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Configure and manage email templates, recipient rules and notification settings for Asset360.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                const newId = `TMPL-${String(templates.length + 1).padStart(3, '0')}`;
                const newTmpl = {
                  id: newId,
                  name: 'New Custom Template',
                  module: 'Assets',
                  eventType: 'Custom Event',
                  status: 'Active',
                  lastModified: 'Today',
                  subject: 'Notice: {{Asset_Name}} Alert',
                  description: 'Custom email notification trigger.',
                  recipientsRule: 'Asset Custodian (To)',
                  bodyText: 'Dear {{User_Name}},\n\nCustom notification details.\n\nRegards,\nAsset360 Team',
                  bodyHtml: '<p>Dear {{User_Name}},</p><p>Custom notification details.</p><p>Regards,<br/><strong>Asset360 Team</strong></p>',
                  availablePlaceholders: ['{{User_Name}}', '{{Asset_Name}}', '{{Asset_No}}', '{{Location}}']
                };
                setTemplates(prev => [newTmpl, ...prev]);
                setSelectedTemplateId(newId);
                showNotification('success', 'Created new template draft');
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Template</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1780px] mx-auto px-6 pt-5 space-y-4">
        {/* Top 5 Horizontal Pill Navigation Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <button
            onClick={() => setActiveTab('TEMPLATES')}
            className={clsx(
              'flex items-center justify-center gap-2.5 px-4 py-3 rounded-lg text-xs font-medium transition-all cursor-pointer border',
              activeTab === 'TEMPLATES'
                ? 'bg-[#F5F0FF] border-[#6C2BD9] text-[#6C2BD9] font-bold shadow-xs'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            )}
          >
            <Mail className="w-4 h-4 text-[#6C2BD9]" />
            <span>Email Templates</span>
          </button>

          <button
            onClick={() => setActiveTab('RULES')}
            className={clsx(
              'flex items-center justify-center gap-2.5 px-4 py-3 rounded-lg text-xs font-medium transition-all cursor-pointer border',
              activeTab === 'RULES'
                ? 'bg-[#F5F0FF] border-[#6C2BD9] text-[#6C2BD9] font-bold shadow-xs'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            )}
          >
            <Settings className="w-4 h-4 text-[#6C2BD9]" />
            <span>Notification Rules</span>
          </button>

          <button
            onClick={() => setActiveTab('GROUPS')}
            className={clsx(
              'flex items-center justify-center gap-2.5 px-4 py-3 rounded-lg text-xs font-medium transition-all cursor-pointer border',
              activeTab === 'GROUPS'
                ? 'bg-[#F5F0FF] border-[#6C2BD9] text-[#6C2BD9] font-bold shadow-xs'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            )}
          >
            <Users className="w-4 h-4 text-[#6C2BD9]" />
            <span>Recipient Groups</span>
          </button>

          <button
            onClick={() => setActiveTab('SETTINGS')}
            className={clsx(
              'flex items-center justify-center gap-2.5 px-4 py-3 rounded-lg text-xs font-medium transition-all cursor-pointer border',
              activeTab === 'SETTINGS'
                ? 'bg-[#F5F0FF] border-[#6C2BD9] text-[#6C2BD9] font-bold shadow-xs'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            )}
          >
            <Sliders className="w-4 h-4 text-[#6C2BD9]" />
            <span>Email Settings</span>
          </button>

          <button
            onClick={() => setActiveTab('LOGS')}
            className={clsx(
              'flex items-center justify-center gap-2.5 px-4 py-3 rounded-lg text-xs font-medium transition-all cursor-pointer border',
              activeTab === 'LOGS'
                ? 'bg-[#F5F0FF] border-[#6C2BD9] text-[#6C2BD9] font-bold shadow-xs'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            )}
          >
            <ListIcon className="w-4 h-4 text-[#6C2BD9]" />
            <span>Delivery Logs</span>
          </button>
        </div>

        {/* TAB 1: EMAIL TEMPLATES (Split Dual-Pane Workspace) */}
        {activeTab === 'TEMPLATES' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* LEFT COLUMN: Templates Table Panel */}
            <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200 shadow-2xs p-4 flex flex-col space-y-4">
              {/* Header Title */}
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900">
                  Email Templates ({filteredTemplates.length})
                </h2>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search template name, description or event type..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#6C2BD9]"
                />
              </div>

              {/* 3 Dropdown Filters */}
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Module</label>
                  <select
                    value={moduleFilter}
                    onChange={(e) => {
                      setModuleFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none focus:border-[#6C2BD9]"
                  >
                    <option value="All Modules">All Modules</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Assets">Assets</option>
                    <option value="Inventory">Inventory</option>
                    <option value="Verification">Verification</option>
                    <option value="Administration">Administration</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Event Type</label>
                  <select
                    value={eventTypeFilter}
                    onChange={(e) => {
                      setEventTypeFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none focus:border-[#6C2BD9]"
                  >
                    <option value="All Event Types">All Event Types</option>
                    <option value="Work Order Created">Work Order Created</option>
                    <option value="Work Order Completed">Work Order Completed</option>
                    <option value="Preventive Maintenance Due">Preventive Maintenance Due</option>
                    <option value="Preventive Maintenance Overdue">Preventive Maintenance Overdue</option>
                    <option value="Transfer Approval Required">Transfer Approval Required</option>
                    <option value="Transfer Completed">Transfer Completed</option>
                    <option value="Custodian Updated">Custodian Updated</option>
                    <option value="Reorder Level">Reorder Level</option>
                    <option value="Goods Receipt">Goods Receipt</option>
                    <option value="Warranty Expiry">Warranty Expiry</option>
                    <option value="Contract Expiry">Contract Expiry</option>
                    <option value="Audit Assigned">Audit Assigned</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none focus:border-[#6C2BD9]"
                  >
                    <option value="All Statuses">All Statuses</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Templates Data Table */}
              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF8FF] border-b border-slate-200 text-[11px] font-semibold text-slate-600">
                    <tr>
                      <th className="py-2.5 px-3 w-8">
                        <input
                          type="checkbox"
                          checked={isAllSelected}
                          onChange={toggleSelectAll}
                          className="rounded border-slate-300 text-[#6C2BD9] focus:ring-[#6C2BD9] cursor-pointer"
                        />
                      </th>
                      <th className="py-2.5 px-2 w-7 text-center">#</th>
                      <th className="py-2.5 px-3">Template Name</th>
                      <th className="py-2.5 px-2.5">Module</th>
                      <th className="py-2.5 px-2.5">Event Type</th>
                      <th className="py-2.5 px-2.5 text-center">Status</th>
                      <th className="py-2.5 px-2.5">Last Modified</th>
                      <th className="py-2.5 px-2 text-center w-12">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {displayedTemplates.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-slate-400">
                          No matching email templates found.
                        </td>
                      </tr>
                    ) : (
                      displayedTemplates.map((tmpl, idx) => {
                        const rowNumber = startIdx + idx + 1;
                        const isSelected = tmpl.id === selectedTemplateId;
                        const isChecked = selectedRowIds.has(tmpl.id);

                        return (
                          <tr
                            key={tmpl.id}
                            onClick={() => setSelectedTemplateId(tmpl.id)}
                            className={clsx(
                              'cursor-pointer transition-colors text-slate-800',
                              isSelected
                                ? 'bg-[#F5F3FF] border-l-3 border-l-[#6C2BD9]'
                                : 'hover:bg-slate-50'
                            )}
                          >
                            <td className="py-2.5 px-3" onClick={(e) => e.stopPropagation()}>
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => toggleSelectRow(tmpl.id, e)}
                                className="rounded border-slate-300 text-[#6C2BD9] focus:ring-[#6C2BD9] cursor-pointer"
                              />
                            </td>
                            <td className="py-2.5 px-2 text-center text-slate-400 font-mono text-[11px]">
                              {rowNumber}
                            </td>
                            <td className="py-2.5 px-3 font-medium text-slate-900">
                              {tmpl.name}
                            </td>
                            <td className="py-2.5 px-2.5 text-slate-600">
                              {tmpl.module}
                            </td>
                            <td className="py-2.5 px-2.5 text-slate-600 text-[11px]">
                              {tmpl.eventType}
                            </td>
                            <td className="py-2.5 px-2.5 text-center">
                              <span
                                className={clsx(
                                  'inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold border',
                                  tmpl.status === 'Active'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : 'bg-slate-100 text-slate-600 border-slate-200'
                                )}
                              >
                                {tmpl.status}
                              </span>
                            </td>
                            <td className="py-2.5 px-2.5 text-slate-500 text-[11px] whitespace-nowrap">
                              {tmpl.lastModified}
                            </td>
                            <td className="py-2.5 px-2 text-center" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => {
                                  setSelectedTemplateId(tmpl.id);
                                  setShowPreviewModal(true);
                                }}
                                title="Actions"
                                className="p-1 border border-slate-200 rounded hover:bg-slate-100 text-[#6C2BD9] transition-colors"
                              >
                                <MoreHorizontal className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Footer */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 text-xs text-slate-500">
                <div>
                  Showing {totalRecords === 0 ? 0 : startIdx + 1} to {endIdx} of {totalRecords} records
                </div>

                <div className="flex items-center gap-1">
                  <button
                    disabled={currentPageSafe <= 1}
                    onClick={() => setCurrentPage(1)}
                    className="w-6 h-6 flex items-center justify-center border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed text-slate-600"
                  >
                    «
                  </button>
                  <button
                    disabled={currentPageSafe <= 1}
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    className="w-6 h-6 flex items-center justify-center border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed text-slate-600"
                  >
                    ‹
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={clsx(
                        'w-6 h-6 flex items-center justify-center rounded text-xs font-medium',
                        currentPageSafe === pageNum
                          ? 'bg-[#6C2BD9] text-white font-bold shadow-2xs'
                          : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
                      )}
                    >
                      {pageNum}
                    </button>
                  ))}

                  <button
                    disabled={currentPageSafe >= totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    className="w-6 h-6 flex items-center justify-center border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed text-slate-600"
                  >
                    ›
                  </button>
                  <button
                    disabled={currentPageSafe >= totalPages}
                    onClick={() => setCurrentPage(totalPages)}
                    className="w-6 h-6 flex items-center justify-center border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed text-slate-600"
                  >
                    »
                  </button>

                  <div className="ml-2">
                    <span className="border border-slate-200 rounded px-2 py-1 text-slate-600 bg-white">
                      12 / page ▾
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Template Details & Content Editor Panel */}
            <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
              {/* Header: Title + Active Badge + Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <h3 className="text-base font-bold text-slate-900">Template Details</h3>
                  <span
                    className={clsx(
                      'px-2.5 py-0.5 rounded-full text-[10px] font-semibold border',
                      templateForm.status === 'Active'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    )}
                  >
                    {templateForm.status}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCloneTemplate}
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 hover:border-purple-300 text-[#6C2BD9] text-xs font-semibold rounded-lg bg-white shadow-2xs hover:bg-purple-50/50 transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Clone</span>
                  </button>

                  <button
                    onClick={() => setShowPreviewModal(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 hover:border-purple-300 text-[#6C2BD9] text-xs font-semibold rounded-lg bg-white shadow-2xs hover:bg-purple-50/50 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Preview</span>
                  </button>

                  <button
                    onClick={handleToggleActive}
                    className={clsx(
                      'flex items-center gap-1.5 px-3 py-1.5 border text-xs font-semibold rounded-lg bg-white shadow-2xs transition-colors',
                      templateForm.status === 'Active'
                        ? 'border-rose-200 text-rose-600 hover:bg-rose-50'
                        : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                    )}
                  >
                    {templateForm.status === 'Active' ? (
                      <>
                        <Slash className="w-3.5 h-3.5" />
                        <span>Deactivate</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Activate</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Top Form Grid */}
              <div className="space-y-3 text-xs">
                {/* Row 1: Template Name, Module, Event Type */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                  <div className="md:col-span-6">
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Template Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={templateForm.name}
                      onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                      className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-[#6C2BD9]"
                    />
                  </div>

                  <div className="md:col-span-3">
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Module <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={templateForm.module}
                      onChange={(e) => setTemplateForm({ ...templateForm, module: e.target.value })}
                      className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 bg-white focus:outline-none focus:border-[#6C2BD9]"
                    >
                      <option value="Maintenance">Maintenance</option>
                      <option value="Assets">Assets</option>
                      <option value="Inventory">Inventory</option>
                      <option value="Verification">Verification</option>
                      <option value="Administration">Administration</option>
                    </select>
                  </div>

                  <div className="md:col-span-3">
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Event Type <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={templateForm.eventType}
                      onChange={(e) => setTemplateForm({ ...templateForm, eventType: e.target.value })}
                      className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 bg-white focus:outline-none focus:border-[#6C2BD9]"
                    >
                      <option value="Work Order Created">Work Order Created</option>
                      <option value="Work Order Completed">Work Order Completed</option>
                      <option value="Preventive Maintenance Due">Preventive Maintenance Due</option>
                      <option value="Preventive Maintenance Overdue">Preventive Maintenance Overdue</option>
                      <option value="Transfer Approval Required">Transfer Approval Required</option>
                      <option value="Transfer Completed">Transfer Completed</option>
                      <option value="Custodian Updated">Custodian Updated</option>
                      <option value="Reorder Level">Reorder Level</option>
                      <option value="Goods Receipt">Goods Receipt</option>
                      <option value="Warranty Expiry">Warranty Expiry</option>
                      <option value="Contract Expiry">Contract Expiry</option>
                      <option value="Audit Assigned">Audit Assigned</option>
                      <option value="Custom Event">Custom Event</option>
                    </select>
                  </div>
                </div>

                {/* Row 2: Subject */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Subject <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={templateForm.subject}
                    onChange={(e) => setTemplateForm({ ...templateForm, subject: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-[#6C2BD9]"
                  />
                </div>

                {/* Row 3: Description */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    value={templateForm.description || ''}
                    onChange={(e) => setTemplateForm({ ...templateForm, description: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-[#6C2BD9]"
                  />
                </div>
              </div>

              {/* Sub-Navigation Tabs */}
              <div className="border-b border-slate-200 pt-2">
                <div className="flex gap-8 text-xs">
                  <button
                    onClick={() => setSubTab('CONTENT')}
                    className={clsx(
                      'pb-2.5 font-semibold transition-colors cursor-pointer border-b-2',
                      subTab === 'CONTENT'
                        ? 'border-[#6C2BD9] text-[#6C2BD9] font-bold'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    )}
                  >
                    Email Content
                  </button>

                  <button
                    onClick={() => setSubTab('RECIPIENTS')}
                    className={clsx(
                      'pb-2.5 font-semibold transition-colors cursor-pointer border-b-2',
                      subTab === 'RECIPIENTS'
                        ? 'border-[#6C2BD9] text-[#6C2BD9] font-bold'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    )}
                  >
                    Recipients
                  </button>

                  <button
                    onClick={() => setSubTab('SETTINGS')}
                    className={clsx(
                      'pb-2.5 font-semibold transition-colors cursor-pointer border-b-2',
                      subTab === 'SETTINGS'
                        ? 'border-[#6C2BD9] text-[#6C2BD9] font-bold'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    )}
                  >
                    Advanced Settings
                  </button>

                  <button
                    onClick={() => setSubTab('AUDIT')}
                    className={clsx(
                      'pb-2.5 font-semibold transition-colors cursor-pointer border-b-2',
                      subTab === 'AUDIT'
                        ? 'border-[#6C2BD9] text-[#6C2BD9] font-bold'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    )}
                  >
                    Audit Trail
                  </button>
                </div>
              </div>

              {/* SUB-TAB 1: EMAIL CONTENT (WYSIWYG Editor + Placeholders Panel) */}
              {subTab === 'CONTENT' && (
                <div className="space-y-3">
                  {/* Formatting Toolbar + HTML/Text Switcher */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border border-slate-200 rounded-lg p-1.5 bg-slate-50/70 text-xs">
                    <div className="flex items-center gap-1.5">
                      <div className="flex bg-slate-200/70 p-0.5 rounded-md">
                        <button
                          onClick={() => setEditorMode('HTML')}
                          className={clsx(
                            'px-2.5 py-1 rounded text-[11px] font-semibold transition-colors',
                            editorMode === 'HTML'
                              ? 'bg-purple-100 text-[#6C2BD9] shadow-2xs font-bold'
                              : 'text-slate-600 hover:text-slate-900'
                          )}
                        >
                          HTML Editor
                        </button>
                        <button
                          onClick={() => setEditorMode('TEXT')}
                          className={clsx(
                            'px-2.5 py-1 rounded text-[11px] font-semibold transition-colors',
                            editorMode === 'TEXT'
                              ? 'bg-purple-100 text-[#6C2BD9] shadow-2xs font-bold'
                              : 'text-slate-600 hover:text-slate-900'
                          )}
                        >
                          Text Editor
                        </button>
                      </div>

                      <div className="h-4 w-px bg-slate-300 mx-1" />

                      <button className="px-2 py-1 bg-white border border-slate-200 rounded text-[11px] text-slate-700 flex items-center gap-1 font-medium">
                        <span>Paragraph</span>
                        <ChevronDown className="w-3 h-3 text-slate-400" />
                      </button>

                      <button
                        onClick={() => {
                          setTemplateForm(prev => ({ ...prev, bodyHtml: `<strong>${prev.bodyHtml}</strong>` }));
                        }}
                        title="Bold"
                        className="p-1 hover:bg-slate-200 rounded text-slate-700"
                      >
                        <Bold className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => {
                          setTemplateForm(prev => ({ ...prev, bodyHtml: `<em>${prev.bodyHtml}</em>` }));
                        }}
                        title="Italic"
                        className="p-1 hover:bg-slate-200 rounded text-slate-700"
                      >
                        <Italic className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => {
                          setTemplateForm(prev => ({ ...prev, bodyHtml: `<u>${prev.bodyHtml}</u>` }));
                        }}
                        title="Underline"
                        className="p-1 hover:bg-slate-200 rounded text-slate-700"
                      >
                        <Underline className="w-3.5 h-3.5" />
                      </button>

                      <button title="Bullet List" className="p-1 hover:bg-slate-200 rounded text-slate-700">
                        <ListIcon className="w-3.5 h-3.5" />
                      </button>

                      <button title="Numbered List" className="p-1 hover:bg-slate-200 rounded text-slate-700">
                        <ListOrdered className="w-3.5 h-3.5" />
                      </button>

                      <button title="Insert Link" className="p-1 hover:bg-slate-200 rounded text-slate-700">
                        <Link2 className="w-3.5 h-3.5" />
                      </button>

                      <button title="Insert Image" className="p-1 hover:bg-slate-200 rounded text-slate-700">
                        <ImageIcon className="w-3.5 h-3.5" />
                      </button>

                      <button title="View Code" className="p-1 hover:bg-slate-200 rounded text-slate-700">
                        <Code2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Dual Panel: Left Editor Canvas & Right Available Placeholders */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                    {/* LEFT CANVAS: Visual Preview & Editor (~70%) */}
                    <div className="md:col-span-8 border border-slate-200 rounded-lg p-4 bg-white min-h-[340px] flex flex-col justify-between shadow-xs">
                      {editorMode === 'HTML' ? (
                        <div className="space-y-4 text-xs text-slate-800">
                          {/* Branded Header */}
                          <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
                            {/* Purple Infinity Logo */}
                            <div className="w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center text-[#6C2BD9]">
                              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                                <path d="M18.6 6.62c-1.44 0-2.8.56-3.77 1.5l-2.83 2.76-2.83-2.76c-.97-.94-2.33-1.5-3.77-1.5-2.98 0-5.4 2.42-5.4 5.38 0 2.97 2.42 5.38 5.4 5.38 1.44 0 2.8-.56 3.77-1.5l2.83-2.76 2.83 2.76c.97.94 2.33 1.5 3.77 1.5 2.98 0 5.4-2.41 5.4-5.38 0-2.96-2.42-5.38-5.4-5.38zm-13.2 8.76c-1.87 0-3.4-1.52-3.4-3.38 0-1.87 1.53-3.38 3.4-3.38 1.05 0 1.98.47 2.6 1.21l2.22 2.17-2.22 2.17c-.62.75-1.55 1.21-2.6 1.21zm13.2 0c-1.05 0-1.98-.46-2.6-1.21l-2.22-2.17 2.22-2.17c.62-.74 1.55-1.21 2.6-1.21 1.87 0 3.4 1.51 3.4 3.38 0 1.86-1.53 3.38-3.4 3.38z" />
                              </svg>
                            </div>
                            <div>
                              <span className="text-sm font-black tracking-tight text-slate-900">Asset360</span>
                              <span className="block text-[10px] text-slate-500 font-medium">Asset Management System</span>
                            </div>
                          </div>

                          {/* Editable HTML Content Area */}
                          <div
                            className="outline-none leading-relaxed text-slate-700"
                            dangerouslySetInnerHTML={{ __html: templateForm.bodyHtml }}
                          />
                        </div>
                      ) : (
                        <textarea
                          rows={14}
                          value={templateForm.bodyText}
                          onChange={(e) => setTemplateForm({ ...templateForm, bodyText: e.target.value })}
                          className="w-full border-none outline-none font-mono text-xs text-slate-800 leading-relaxed resize-none"
                        />
                      )}
                    </div>

                    {/* RIGHT SIDEBAR: Available Placeholders (~30%) */}
                    <div className="md:col-span-4 border border-slate-200 rounded-lg p-3 bg-slate-50/60 flex flex-col space-y-2.5">
                      <div className="flex items-center gap-1.5 text-slate-800 font-semibold text-xs">
                        <Info className="w-3.5 h-3.5 text-slate-400" />
                        <span>Available Placeholders</span>
                      </div>

                      <div className="relative">
                        <Search className="w-3 h-3 text-slate-400 absolute left-2 top-2" />
                        <input
                          type="text"
                          placeholder="Search placeholders..."
                          value={placeholderSearch}
                          onChange={(e) => setPlaceholderSearch(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded px-2 pl-6 py-1 text-[11px] text-slate-700 focus:outline-none focus:border-[#6C2BD9]"
                        />
                      </div>

                      {/* Chips / Pills List */}
                      <div className="flex-1 overflow-y-auto max-h-60 space-y-1.5 pr-1">
                        {filteredPlaceholders.map((token) => (
                          <button
                            key={token}
                            onClick={() => handleInsertPlaceholder(token)}
                            className="w-full text-left px-2.5 py-1.5 bg-white border border-slate-200 hover:border-purple-300 hover:bg-purple-50 text-[11px] font-mono text-slate-700 rounded transition-all flex items-center justify-between group cursor-pointer"
                          >
                            <span>{token}</span>
                            <Plus className="w-3 h-3 text-slate-300 group-hover:text-[#6C2BD9]" />
                          </button>
                        ))}
                      </div>

                      <p className="text-[10px] text-slate-400 leading-tight pt-1 border-t border-slate-200">
                        Clicking copies token and appends it to your email body.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* SUB-TAB 2: RECIPIENTS */}
              {subTab === 'RECIPIENTS' && (
                <div className="space-y-4 text-xs">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                    <h4 className="font-semibold text-slate-800">Dynamic Assignment Rules</h4>
                    <p className="text-[11px] text-slate-500">
                      Configure dynamic roles that automatically receive this email when triggered.
                    </p>
                    <div className="space-y-2 pt-1">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" defaultChecked className="rounded text-[#6C2BD9]" />
                        <span>Send to Assigned Technician / Custodian (To)</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" defaultChecked className="rounded text-[#6C2BD9]" />
                        <span>Send to Direct Reporting Line Manager (CC)</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="rounded text-[#6C2BD9]" />
                        <span>Send to Department Head / Asset Controller (CC)</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Additional Fixed CC Recipients</label>
                    <input
                      type="text"
                      defaultValue="maintenance-leads@asset360.com, ops-manager@asset360.com"
                      className="w-full border border-slate-200 rounded-lg p-2 font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Compliance BCC</label>
                    <input
                      type="text"
                      defaultValue="audit-compliance@infotattva.com"
                      className="w-full border border-slate-200 rounded-lg p-2 font-mono text-xs"
                    />
                  </div>
                </div>
              )}

              {/* SUB-TAB 3: ADVANCED SETTINGS */}
              {subTab === 'SETTINGS' && (
                <div className="space-y-3.5 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Notification Priority</label>
                      <select className="w-full border border-slate-200 rounded-lg p-2 bg-white">
                        <option value="NORMAL">Normal Priority</option>
                        <option value="HIGH">High Priority (Urgent)</option>
                        <option value="LOW">Low Priority (Digest)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Retry Attempts on Failure</label>
                      <select className="w-full border border-slate-200 rounded-lg p-2 bg-white">
                        <option value="3">3 Attempts with Exponential Backoff</option>
                        <option value="5">5 Attempts</option>
                        <option value="1">1 Attempt (No Retry)</option>
                      </select>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                    <h4 className="font-semibold text-slate-800">Engagement & Delivery Tracking</h4>
                    <div className="space-y-1.5">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" defaultChecked className="rounded text-[#6C2BD9]" />
                        <span>Enable Open Tracking (1x1 Transparent Pixel)</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" defaultChecked className="rounded text-[#6C2BD9]" />
                        <span>Enable Click Tracking for Action Links</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* SUB-TAB 4: AUDIT TRAIL */}
              {subTab === 'AUDIT' && (
                <div className="space-y-3 text-xs">
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-600">
                        <tr>
                          <th className="py-2 px-3">Version</th>
                          <th className="py-2 px-3">Modified By</th>
                          <th className="py-2 px-3">Date & Time</th>
                          <th className="py-2 px-3">Summary of Changes</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        <tr>
                          <td className="py-2.5 px-3 font-semibold text-[#6C2BD9]">v2.1</td>
                          <td className="py-2.5 px-3">John Doe (Admin)</td>
                          <td className="py-2.5 px-3 text-slate-500">10 Sep 2026 14:20</td>
                          <td className="py-2.5 px-3 text-slate-700">Aligned layout table with branding header</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-3 font-semibold text-slate-600">v2.0</td>
                          <td className="py-2.5 px-3">Sarah Ahmed</td>
                          <td className="py-2.5 px-3 text-slate-500">01 Sep 2026 09:45</td>
                          <td className="py-2.5 px-3 text-slate-700">Initial production template release</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Bottom Action Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                <button
                  onClick={() => setShowTestModal(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Test Email</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const current = templates.find(t => t.id === selectedTemplateId);
                      if (current) setTemplateForm({ ...current });
                      showNotification('info', 'Changes reverted');
                    }}
                    className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleSaveChanges}
                    className="px-4 py-2 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: NOTIFICATION RULES */}
        {activeTab === 'RULES' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Event-Driven Notification Rules Matrix</h3>
                <p className="text-xs text-slate-500 mt-0.5">Automated condition evaluations that trigger email dispatch</p>
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF8FF] border-b border-slate-200 text-[11px] font-semibold text-slate-600">
                  <tr>
                    <th className="py-2.5 px-3">Rule ID</th>
                    <th className="py-2.5 px-3">Module</th>
                    <th className="py-2.5 px-3">Event Trigger</th>
                    <th className="py-2.5 px-3">Condition</th>
                    <th className="py-2.5 px-3">Assigned Template</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-700">RUL-001</td>
                    <td className="py-2.5 px-3">Maintenance</td>
                    <td className="py-2.5 px-3">Work Order Created</td>
                    <td className="py-2.5 px-3 text-slate-600 font-mono text-[11px]">Priority in ['Critical', 'High']</td>
                    <td className="py-2.5 px-3 font-semibold text-[#6C2BD9]">Work Order Assignment</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">Active</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-700">RUL-002</td>
                    <td className="py-2.5 px-3">Assets</td>
                    <td className="py-2.5 px-3">Transfer Approval Required</td>
                    <td className="py-2.5 px-3 text-slate-600 font-mono text-[11px]">Asset_Value &gt;= 5000</td>
                    <td className="py-2.5 px-3 font-semibold text-[#6C2BD9]">Asset Transfer Approval</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">Active</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-700">RUL-003</td>
                    <td className="py-2.5 px-3">Inventory</td>
                    <td className="py-2.5 px-3">Reorder Level</td>
                    <td className="py-2.5 px-3 text-slate-600 font-mono text-[11px]">Current_Stock &lt;= Minimum_Threshold</td>
                    <td className="py-2.5 px-3 font-semibold text-[#6C2BD9]">Low Stock Alert</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">Active</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: RECIPIENT GROUPS */}
        {activeTab === 'GROUPS' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Configured Recipient Groups</h3>
                <p className="text-xs text-slate-500 mt-0.5">Distribution groups for broadcast operational broadcasts</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">Maintenance Technicians</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-50 text-[#6C2BD9]">14 Members</span>
                </div>
                <p className="text-slate-500 text-[11px]">Field service staff responsible for mechanical and electrical repairs.</p>
              </div>

              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">Asset Verification Auditors</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-50 text-[#6C2BD9]">8 Members</span>
                </div>
                <p className="text-slate-500 text-[11px]">Field scanning team for annual and quarterly physical audit campaigns.</p>
              </div>

              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">Executive Compliance Team</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-50 text-[#6C2BD9]">4 Members</span>
                </div>
                <p className="text-slate-500 text-[11px]">Internal auditors, finance controllers, and asset disposal committee members.</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SMTP EMAIL SETTINGS */}
        {activeTab === 'SETTINGS' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-6 max-w-3xl space-y-4 text-xs">
            <div>
              <h3 className="text-sm font-bold text-slate-900">SMTP Mail Server Configuration</h3>
              <p className="text-xs text-slate-500 mt-0.5">Outbound mail gateway credentials and transmission rate parameters</p>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">SMTP Host *</label>
                <input
                  type="text"
                  value={settings.smtpHost}
                  onChange={(e) => setSettings({ ...settings, smtpHost: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg p-2 font-mono text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Port</label>
                <input
                  type="number"
                  value={settings.smtpPort}
                  onChange={(e) => setSettings({ ...settings, smtpPort: Number(e.target.value) })}
                  className="w-full border border-slate-200 rounded-lg p-2 font-mono text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Encryption Protocol</label>
                <select
                  value={settings.encryption}
                  onChange={(e) => setSettings({ ...settings, encryption: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg p-2 bg-white text-slate-900"
                >
                  <option value="TLS">STARTTLS (Port 587)</option>
                  <option value="SSL">SSL/TLS (Port 465)</option>
                  <option value="None">None (Port 25)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Sender Email</label>
                <input
                  type="email"
                  value={settings.senderEmail}
                  onChange={(e) => setSettings({ ...settings, senderEmail: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg p-2 text-slate-900"
                />
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-800 font-semibold">
                <Lock className="w-3.5 h-3.5 text-slate-500" />
                <span>Encrypted Vault Credentials</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Outbound authentication secrets are stored inside enterprise encrypted vault.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => showNotification('success', 'SMTP handshake successful. Gateway is online.')}
                className="px-3.5 py-1.5 border border-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-50"
              >
                Test Connection
              </button>
              <button
                onClick={() => showNotification('success', 'SMTP settings saved successfully.')}
                className="px-4 py-1.5 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white font-semibold rounded-lg"
              >
                Save Settings
              </button>
            </div>
          </div>
        )}

        {/* TAB 5: DELIVERY LOGS */}
        {activeTab === 'LOGS' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Email Delivery Audit Log</h3>
                <p className="text-xs text-slate-500 mt-0.5">Real-time status of outgoing transactional messages, latency, and delivery reports</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF8FF] border-b border-slate-200 text-[11px] font-semibold text-slate-600">
                  <tr>
                    <th className="py-2.5 px-4">Message ID</th>
                    <th className="py-2.5 px-4">Timestamp</th>
                    <th className="py-2.5 px-4">Recipient</th>
                    <th className="py-2.5 px-4">Subject</th>
                    <th className="py-2.5 px-4">Template</th>
                    <th className="py-2.5 px-4 text-center">Status</th>
                    <th className="py-2.5 px-4 text-right">Latency</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {deliveryLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/80">
                      <td className="py-3 px-4 font-mono font-bold text-slate-700">{log.id}</td>
                      <td className="py-3 px-4 text-slate-500">{log.timestamp}</td>
                      <td className="py-3 px-4 font-semibold text-slate-900">{log.recipient}</td>
                      <td className="py-3 px-4 text-slate-700 max-w-xs truncate">{log.subject}</td>
                      <td className="py-3 px-4 text-[#6C2BD9] font-medium">{log.template}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                          {log.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-500">{log.latency || '310ms'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* PREVIEW TEMPLATE MODAL */}
      {showPreviewModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <Eye className="w-5 h-5 text-[#6C2BD9]" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Email Preview: {templateForm.name}</h3>
                  <p className="text-[11px] text-slate-500">Rendered with sample asset transaction context</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex bg-slate-100 p-0.5 rounded-lg">
                  <button
                    onClick={() => setPreviewDevice('desktop')}
                    className={clsx(
                      'p-1.5 rounded text-xs transition-colors',
                      previewDevice === 'desktop' ? 'bg-white shadow-2xs text-[#6C2BD9]' : 'text-slate-500'
                    )}
                  >
                    <Monitor className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setPreviewDevice('mobile')}
                    className={clsx(
                      'p-1.5 rounded text-xs transition-colors',
                      previewDevice === 'mobile' ? 'bg-white shadow-2xs text-[#6C2BD9]' : 'text-slate-500'
                    )}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button onClick={() => setShowPreviewModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Email Header Preview */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs space-y-1">
              <div>
                <span className="font-semibold text-slate-500">From: </span>
                <span className="text-slate-800">Asset360 Notifications &lt;asset360-no-reply@infotattva.com&gt;</span>
              </div>
              <div>
                <span className="font-semibold text-slate-500">To: </span>
                <span className="text-slate-800">rashid.technician@asset360.com</span>
              </div>
              <div>
                <span className="font-semibold text-slate-500">Subject: </span>
                <span className="font-bold text-slate-900">
                  {templateForm.subject.replace('{{WO_No}}', 'WO-2026-00482').replace('{{Asset_Name}}', 'Chiller Unit #4')}
                </span>
              </div>
            </div>

            {/* Rendered Email Body */}
            <div
              className={clsx(
                'mx-auto border border-slate-200 rounded-xl p-6 bg-white max-h-[380px] overflow-y-auto text-xs text-slate-800 shadow-inner',
                previewDevice === 'mobile' ? 'max-w-xs text-[11px]' : 'w-full'
              )}
            >
              {/* Asset360 Logo Header */}
              <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-200">
                <div className="w-6 h-6 rounded-lg bg-purple-50 flex items-center justify-center text-[#6C2BD9]">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M18.6 6.62c-1.44 0-2.8.56-3.77 1.5l-2.83 2.76-2.83-2.76c-.97-.94-2.33-1.5-3.77-1.5-2.98 0-5.4 2.42-5.4 5.38 0 2.97 2.42 5.38 5.4 5.38 1.44 0 2.8-.56 3.77-1.5l2.83-2.76 2.83 2.76c.97.94 2.33 1.5 3.77 1.5 2.98 0 5.4-2.41 5.4-5.38 0-2.96-2.42-5.38-5.4-5.38zm-13.2 8.76c-1.87 0-3.4-1.52-3.4-3.38 0-1.87 1.53-3.38 3.4-3.38 1.05 0 1.98.47 2.6 1.21l2.22 2.17-2.22 2.17c-.62.75-1.55 1.21-2.6 1.21zm13.2 0c-1.05 0-1.98-.46-2.6-1.21l-2.22-2.17 2.22-2.17c.62-.74 1.55-1.21 2.6-1.21 1.87 0 3.4 1.51 3.4 3.38 0 1.86-1.53 3.38-3.4 3.38z" />
                  </svg>
                </div>
                <div>
                  <span className="text-xs font-black tracking-tight text-slate-900">Asset360</span>
                  <span className="block text-[9px] text-slate-400">Asset Management System</span>
                </div>
              </div>

              <div
                dangerouslySetInnerHTML={{
                  __html: templateForm.bodyHtml
                    .replace(/\{\{User_Name\}\}/g, 'Rashid Al-Maktoum')
                    .replace(/\{\{WO_No\}\}/g, 'WO-2026-00482')
                    .replace(/\{\{Asset_Name\}\}/g, 'HVAC Chiller Unit 4B')
                    .replace(/\{\{Asset_No\}\}/g, 'AST-000104')
                    .replace(/\{\{Priority\}\}/g, 'Critical')
                    .replace(/\{\{Due_Date\}\}/g, '20 Sep 2026')
                    .replace(/\{\{Location\}\}/g, 'Dubai HQ > Plant Room 02')
                    .replace(/\{\{Created_By\}\}/g, 'John Doe')
                    .replace(/\{\{Company\}\}/g, 'Infotattva Solutions')
                }}
              />
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowPreviewModal(false)}
                className="px-4 py-2 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white text-xs font-semibold rounded-lg shadow-2xs cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SEND TEST EMAIL MODAL */}
      {showTestModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Send className="w-4 h-4 text-[#6C2BD9]" />
                <span>Send Test Email</span>
              </h3>
              <button onClick={() => setShowTestModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Recipient Email Address *</label>
                <input
                  type="email"
                  value={testEmailAddress}
                  onChange={(e) => setTestEmailAddress(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2 focus:border-[#6C2BD9] outline-none text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Template</label>
                <input
                  type="text"
                  readOnly
                  value={`${templateForm.name} (${templateForm.id})`}
                  className="w-full border border-slate-200 rounded-lg p-2 bg-slate-50 text-slate-600 font-medium"
                />
              </div>

              <p className="text-[11px] text-slate-400">
                Dispatches a test notification populated with sample asset data through the active SMTP mail server gateway.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowTestModal(false)}
                className="px-3.5 py-1.5 border border-slate-200 rounded-lg text-slate-600 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSendTestEmail}
                disabled={isSendingTest}
                className="px-4 py-1.5 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white text-xs font-semibold rounded-lg shadow-2xs flex items-center gap-1.5 cursor-pointer"
              >
                {isSendingTest ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
                <span>Send Now</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EmailNotifications;
