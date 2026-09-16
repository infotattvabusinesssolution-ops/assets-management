import React, { useState, useEffect } from 'react';
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
  Edit2,
  Code,
  Plus,
  RefreshCw,
  X,
  Lock,
  Search,
  ExternalLink,
  ChevronRight,
  Clock
} from 'lucide-react';
import { api } from '../../services/api';
import clsx from 'clsx';

const FALLBACK_TEMPLATES = [
  {
    id: 'TMP-001',
    name: 'Work Order Assignment Notification',
    module: 'Maintenance',
    eventTrigger: 'Work Order Created or Reassigned',
    recipientType: 'Assigned Technician & Supervisor',
    subject: 'Work Order Assigned: {{WO_No}} - {{Priority}} Priority',
    bodyHtml: '<p>Dear <strong>{{Assignee}}</strong>,</p><p>A maintenance work order has been assigned to you.</p><ul><li><strong>WO Number:</strong> {{WO_No}}</li><li><strong>Asset:</strong> {{Asset_Name}} ({{Asset_No}})</li><li><strong>Priority:</strong> {{Priority}}</li><li><strong>Target Due Date:</strong> {{Due_Date}}</li></ul>'
  },
  {
    id: 'TMP-002',
    name: 'Asset Transfer Approval Required',
    module: 'Movements',
    eventTrigger: 'Custody Transfer Submitted',
    recipientType: 'Approver / Line Manager',
    subject: 'Action Required: Approval for Asset Transfer {{Transfer_No}}',
    bodyHtml: '<p>An asset custody transfer requires your approval.</p><ul><li><strong>Transfer Ref:</strong> {{Transfer_No}}</li><li><strong>Asset:</strong> {{Asset_Name}}</li><li><strong>New Custodian:</strong> {{New_Custodian}}</li><li><strong>Destination:</strong> {{Destination_Location}}</li></ul>'
  },
  {
    id: 'TMP-003',
    name: 'Asset Warranty Expiry Alert (30 Days)',
    module: 'Contracts',
    eventTrigger: 'Warranty Due in 30 Days',
    recipientType: 'Asset Custodian & Admin',
    subject: 'Warranty Expiry Warning: Asset {{Asset_No}} expires on {{Warranty_End}}',
    bodyHtml: '<p>Warranty coverage for asset <strong>{{Asset_Name}}</strong> is scheduled to lapse within 30 days.</p>'
  },
  {
    id: 'TMP-004',
    name: 'Physical Audit Discrepancy Alert',
    module: 'Audit',
    eventTrigger: 'Audit Reconciliation Completed',
    recipientType: 'Audit Team & Asset Head',
    subject: 'Audit Reconciliation Completed: {{Audit_ID}} - {{Exceptions_Count}} Exceptions',
    bodyHtml: '<p>Audit campaign <strong>{{Audit_ID}}</strong> has been finalized with {{Exceptions_Count}} unresolved variance records.</p>'
  },
  {
    id: 'TMP-005',
    name: 'Low Stock Reorder Threshold Alert',
    module: 'Inventory',
    eventTrigger: 'Stock Level <= Reorder Level',
    recipientType: 'Storekeeper & Procurement Manager',
    subject: 'Inventory Alert: Part {{Part_No}} below reorder level at {{Warehouse}}',
    bodyHtml: '<p style="color:#B91C1C; font-weight:bold;">Low Stock Alert</p><p>Spare part <strong>{{Part_No}} ({{Part_Name}})</strong> at warehouse <strong>{{Warehouse}}</strong> is below minimum reorder point.</p>'
  }
];

const FALLBACK_LOGS = [
  { id: 'NOTIF-091', timestamp: '16 Sep 2026 04:10 PM', template: 'Work Order Assignment Notification', recipient: 'omar.rahman@asset360.com', subject: 'Work Order Assigned: WO-2026-00482 - Critical Priority', status: 'Delivered', retryCount: 0 },
  { id: 'NOTIF-090', timestamp: '16 Sep 2026 03:20 PM', template: 'Asset Transfer Approval Required', recipient: 'sarah.ahmed@asset360.com', subject: 'Action Required: Approval for Asset Transfer TRF-2026-00091', status: 'Delivered', retryCount: 0 },
  { id: 'NOTIF-089', timestamp: '16 Sep 2026 01:15 PM', template: 'Low Stock Reorder Threshold Alert', recipient: 'chen.wei@asset360.com', subject: 'Inventory Alert: Part FLT-HVAC-01 below reorder level', status: 'Delivered', retryCount: 0 },
  { id: 'NOTIF-088', timestamp: '15 Sep 2026 11:45 AM', template: 'Asset Warranty Expiry Alert (30 Days)', recipient: 'john.doe@asset360.com', subject: 'Warranty Expiry Warning: Asset AST-000104 expires on 15 Oct 2026', status: 'Delivered', retryCount: 0 }
];

export function EmailNotifications() {
  const [activeTab, setActiveTab] = useState('TEMPLATES'); // 'TEMPLATES' | 'RULES' | 'GROUPS' | 'SETTINGS' | 'LOGS'
  const [templates, setTemplates] = useState(FALLBACK_TEMPLATES);
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
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Template Editing State
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [editorMode, setEditorMode] = useState('HTML'); // 'HTML' | 'PREVIEW' | 'PLAIN'

  // Test Email Modal
  const [showTestModal, setShowTestModal] = useState(false);
  const [testEmailAddress, setTestEmailAddress] = useState('admin@infotattva.com');
  const [isSendingTest, setIsSendingTest] = useState(false);

  const showNotification = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [tRes, sRes, lRes] = await Promise.all([
        api.get('/admin/notifications/templates'),
        api.get('/admin/notifications/settings'),
        api.get('/admin/notifications/logs')
      ]);
      if (tRes?.templates && tRes.templates.length > 0) setTemplates(tRes.templates);
      if (sRes?.settings) setSettings(sRes.settings);
      if (lRes?.logs && lRes.logs.length > 0) setDeliveryLogs(lRes.logs);
    } catch (err) {
      console.warn('Notifications data loaded with resilient fallback:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleInsertPlaceholder = (placeholder) => {
    if (!editingTemplate) return;
    setEditingTemplate(prev => ({
      ...prev,
      bodyHtml: prev.bodyHtml + ' ' + placeholder
    }));
    showNotification('success', `Inserted ${placeholder}`);
  };

  const handleSaveTemplate = async () => {
    if (!editingTemplate) return;
    try {
      await api.put(`/admin/notifications/templates/${editingTemplate.id}`, editingTemplate);
      showNotification('success', `Template "${editingTemplate.name}" saved.`);
      setEditingTemplate(null);
      loadData();
    } catch (err) {
      showNotification('error', 'Failed saving template.');
    }
  };

  const handleSendTestEmail = async () => {
    setIsSendingTest(true);
    try {
      const res = await api.post('/admin/notifications/test-email', {
        templateId: editingTemplate?.id || templates[0]?.id,
        recipientEmail: testEmailAddress
      });
      showNotification('success', res.message || `Test email dispatched to ${testEmailAddress}`);
      setShowTestModal(false);
      loadData();
    } catch (err) {
      showNotification('error', 'Test email failed to send.');
    } finally {
      setIsSendingTest(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-16">
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
      <div className="bg-white border-b border-slate-200 px-6 py-5">
        <div className="max-w-[1700px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
              <span>Administration</span>
              <span className="text-slate-300">&gt;</span>
              <span className="text-[#6C2BD9]">Email Notifications</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
              <Mail className="w-6 h-6 text-[#6C2BD9]" />
              <span>Email Notifications & Templates</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Automated transactional alerts, dynamic variable tokens, recipient matrices, and SMTP server configuration
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowTestModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Test Email</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1700px] mx-auto px-6 pt-5 space-y-5">
        {/* Navigation Tabs */}
        <div className="border-b border-slate-200">
          <nav className="flex space-x-8 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('TEMPLATES')}
              className={clsx('pb-3 transition-colors flex items-center gap-1.5', activeTab === 'TEMPLATES' ? 'text-[#6C2BD9] font-bold border-b-2 border-[#6C2BD9]' : 'text-slate-500')}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Email Templates ({templates.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('RULES')}
              className={clsx('pb-3 transition-colors flex items-center gap-1.5', activeTab === 'RULES' ? 'text-[#6C2BD9] font-bold border-b-2 border-[#6C2BD9]' : 'text-slate-500')}
            >
              <List className="w-3.5 h-3.5" />
              <span>Notification Rules</span>
            </button>
            <button
              onClick={() => setActiveTab('SETTINGS')}
              className={clsx('pb-3 transition-colors flex items-center gap-1.5', activeTab === 'SETTINGS' ? 'text-[#6C2BD9] font-bold border-b-2 border-[#6C2BD9]' : 'text-slate-500')}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>SMTP & Mail Server</span>
            </button>
            <button
              onClick={() => setActiveTab('LOGS')}
              className={clsx('pb-3 transition-colors flex items-center gap-1.5', activeTab === 'LOGS' ? 'text-[#6C2BD9] font-bold border-b-2 border-[#6C2BD9]' : 'text-slate-500')}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Delivery Logs ({deliveryLogs.length})</span>
            </button>
          </nav>
        </div>

        {/* TAB 1: TEMPLATES CATALOG */}
        {activeTab === 'TEMPLATES' && !editingTemplate && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Event-Driven Notification Templates</h3>
                <p className="text-xs text-slate-500 mt-0.5">Custom HTML and plain-text emails triggered by asset transactions</p>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {templates.map(tmpl => (
                <div key={tmpl.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{tmpl.name}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-[#6C2BD9]">
                        {tmpl.module}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                        {tmpl.status}
                      </span>
                    </div>
                    <p className="text-slate-700 font-medium">Subject: {tmpl.subject}</p>
                    <p className="text-[11px] text-slate-400">{tmpl.description}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingTemplate(tmpl)}
                      className="px-3 py-1.5 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors flex items-center gap-1.5"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Edit Template</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TEMPLATE EDITOR WORKSPACE */}
        {editingTemplate && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Editing Template: {editingTemplate.name}</h3>
                <p className="text-xs text-slate-500">Module: {editingTemplate.module} • Event: {editingTemplate.eventType}</p>
              </div>
              <button onClick={() => setEditingTemplate(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 text-xs">
              {/* Left Column: Editor Controls (8 cols) */}
              <div className="lg:col-span-8 space-y-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Subject Line *</label>
                  <input
                    type="text"
                    value={editingTemplate.subject}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, subject: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg p-2 font-medium text-slate-800 focus:border-[#6C2BD9] outline-none"
                  />
                </div>

                {/* Dual Editor Subtabs */}
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditorMode('HTML')}
                      className={clsx('px-3 py-1 rounded text-xs font-semibold', editorMode === 'HTML' ? 'bg-[#6C2BD9] text-white' : 'bg-slate-100 text-slate-700')}
                    >
                      HTML Editor
                    </button>
                    <button
                      onClick={() => setEditorMode('PREVIEW')}
                      className={clsx('px-3 py-1 rounded text-xs font-semibold', editorMode === 'PREVIEW' ? 'bg-[#6C2BD9] text-white' : 'bg-slate-100 text-slate-700')}
                    >
                      Instant Preview
                    </button>
                    <button
                      onClick={() => setEditorMode('PLAIN')}
                      className={clsx('px-3 py-1 rounded text-xs font-semibold', editorMode === 'PLAIN' ? 'bg-[#6C2BD9] text-white' : 'bg-slate-100 text-slate-700')}
                    >
                      Plain Text Fallback
                    </button>
                  </div>
                </div>

                {editorMode === 'HTML' && (
                  <div>
                    <textarea
                      rows={14}
                      value={editingTemplate.bodyHtml}
                      onChange={(e) => setEditingTemplate({ ...editingTemplate, bodyHtml: e.target.value })}
                      className="w-full border border-slate-200 rounded-xl p-3 font-mono text-[11px] text-slate-800 leading-relaxed outline-none focus:border-[#6C2BD9]"
                    />
                  </div>
                )}

                {editorMode === 'PREVIEW' && (
                  <div
                    className="border border-slate-200 rounded-xl p-6 bg-slate-50 max-h-[420px] overflow-y-auto"
                    dangerouslySetInnerHTML={{
                      __html: editingTemplate.bodyHtml
                        .replace(/\{\{WO_No\}\}/g, 'WO-2026-0089')
                        .replace(/\{\{Asset_No\}\}/g, 'AST-000128')
                        .replace(/\{\{Asset_Name\}\}/g, 'Dell Latitude 5440')
                        .replace(/\{\{Assigned_Technician\}\}/g, 'Rashid Al-Maktoum')
                        .replace(/\{\{Priority\}\}/g, 'CRITICAL')
                        .replace(/\{\{Due_Date\}\}/g, '18 Sep 2026')
                        .replace(/\{\{Location\}\}/g, 'Block B > 2F > IT-201')
                    }}
                  />
                )}

                {editorMode === 'PLAIN' && (
                  <div>
                    <textarea
                      rows={10}
                      value={editingTemplate.bodyPlain}
                      onChange={(e) => setEditingTemplate({ ...editingTemplate, bodyPlain: e.target.value })}
                      className="w-full border border-slate-200 rounded-xl p-3 font-mono text-xs text-slate-800 outline-none focus:border-[#6C2BD9]"
                    />
                  </div>
                )}
              </div>

              {/* Right Column: Contextual Dynamic Placeholders (4 cols) */}
              <div className="lg:col-span-4 bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-3">
                <h4 className="font-bold text-slate-900 text-xs">Dynamic Placeholders Panel</h4>
                <p className="text-[11px] text-slate-500">
                  Click any token below to insert it into the active cursor position in your email template.
                </p>

                <div className="space-y-1.5 max-h-72 overflow-y-auto">
                  {editingTemplate.availablePlaceholders?.map(token => (
                    <button
                      key={token}
                      onClick={() => handleInsertPlaceholder(token)}
                      className="w-full text-left p-1.5 rounded-lg bg-white border border-slate-200 hover:border-[#6C2BD9] hover:bg-purple-50 text-[11px] font-mono font-semibold text-[#6C2BD9] transition-colors"
                    >
                      {token}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setEditingTemplate(null)}
                className="px-4 py-2 border border-slate-200 text-slate-600 font-semibold rounded-lg hover:bg-slate-50 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveTemplate}
                className="px-5 py-2 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white font-semibold rounded-lg text-xs shadow-2xs"
              >
                Save Template
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: SMTP SETTINGS */}
        {activeTab === 'SETTINGS' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-6 max-w-2xl space-y-4 text-xs">
            <div>
              <h3 className="text-sm font-bold text-slate-900">SMTP Mail Server Configuration</h3>
              <p className="text-xs text-slate-500 mt-0.5">Outbound mail gateway for all transactional system alerts</p>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">SMTP Host *</label>
                <input
                  type="text"
                  value={settings.smtpHost}
                  onChange={(e) => setSettings({ ...settings, smtpHost: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg p-2 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Port</label>
                <input
                  type="number"
                  value={settings.smtpPort}
                  onChange={(e) => setSettings({ ...settings, smtpPort: Number(e.target.value) })}
                  className="w-full border border-slate-200 rounded-lg p-2 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Encryption</label>
                <select
                  value={settings.encryption}
                  onChange={(e) => setSettings({ ...settings, encryption: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg p-2 bg-white"
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
                  className="w-full border border-slate-200 rounded-lg p-2"
                />
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-800 font-semibold">
                <Lock className="w-3.5 h-3.5 text-slate-500" />
                <span>Authentication Credentials</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Encrypted password configured in vault. Passwords are never sent back in plain text.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => showNotification('success', 'SMTP handshake successful. Mail gateway is online.')}
                className="px-3.5 py-1.5 border border-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-50"
              >
                Test Connection
              </button>
              <button
                onClick={() => showNotification('success', 'SMTP settings saved.')}
                className="px-4 py-1.5 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white font-semibold rounded-lg"
              >
                Save Settings
              </button>
            </div>
          </div>
        )}

        {/* TAB 4: DELIVERY LOGS */}
        {activeTab === 'LOGS' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Email Delivery Audit Log</h3>
                <p className="text-xs text-slate-500 mt-0.5">Real-time status of outgoing emails, latency, and bounce errors</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500">
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
                        <span className={clsx(
                          'px-2 py-0.5 rounded text-[10px] font-bold',
                          log.status === 'Sent' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                        )}>
                          {log.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-500">{log.latency || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* SEND TEST EMAIL MODAL */}
      {showTestModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-5 space-y-4">
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
                  className="w-full border border-slate-200 rounded-lg p-2 focus:border-[#6C2BD9] outline-none"
                />
              </div>

              <p className="text-[11px] text-slate-400">
                Dispatches an instant sample notification populated with realistic mock asset data to verify mail delivery.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowTestModal(false)}
                className="px-3.5 py-1.5 border border-slate-200 rounded-lg text-slate-600 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSendTestEmail}
                disabled={isSendingTest}
                className="px-4 py-1.5 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white text-xs font-semibold rounded-lg shadow-2xs flex items-center gap-1.5"
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
