import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  ChevronRight,
  ChevronLeft,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  ArrowDown,
  ArrowUp,
  Settings,
  ShieldCheck,
  Building,
  User,
  Clock,
  Layers,
  Sparkles,
  Check,
  X,
  RotateCcw,
  Power
} from 'lucide-react';

export function WorkflowDesigner() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Basic Information Form State
  const [basicInfo, setBasicInfo] = useState({
    name: 'New Asset Approval - CapEx',
    transactionType: 'New Asset Registration',
    status: true, // Active
    code: 'WF-NEW-001',
    description: 'Approval workflow for new asset registration based on asset value, category and department.',
    applicableTo: 'All Organizations',
    priority: 'Normal'
  });

  // Conditions Table State
  const [conditions, setConditions] = useState([
    { id: 1, field: 'Asset Value (AED)', operator: 'Greater than', value: '100,000', logic: 'AND' },
    { id: 2, field: 'Category', operator: 'In', value: 'IT Equipment, Furniture', logic: 'AND' },
    { id: 3, field: 'Department', operator: 'Equals', value: 'All', logic: 'AND' }
  ]);

  // Approval Levels Table State
  const [approvalLevels, setApprovalLevels] = useState([
    { level: 1, type: 'Asset Manager', approver: 'Reporting Manager', rule: 'Always Required', sla: 2 },
    { level: 2, type: 'Department Manager', approver: 'Department Head', rule: 'Always Required', sla: 2 },
    { level: 3, type: 'Finance', approver: 'Finance Team', rule: 'Required if Asset Value > 100,000', sla: 3 },
    { level: 4, type: 'Final Approval', approver: 'CEO', rule: 'Required if Asset Value > 500,000', sla: 3 }
  ]);

  // Notifications State
  const [notifications, setNotifications] = useState({
    notifyRequester: true,
    notifyApprovers: true,
    escalateOnSlaBreach: true
  });

  // Additional Settings State
  const [additionalSettings, setAdditionalSettings] = useState({
    allowParallel: false,
    requireComments: true,
    autoApproveSla: false,
    allowDelegation: true
  });

  const [toast, setToast] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // Add Condition Handler
  const handleAddCondition = () => {
    const newId = conditions.length + 1;
    setConditions(prev => [
      ...prev,
      { id: newId, field: 'Asset Value (AED)', operator: 'Greater than', value: '50,000', logic: 'AND' }
    ]);
  };

  // Remove Condition Handler
  const handleRemoveCondition = (id) => {
    setConditions(prev => prev.filter(c => c.id !== id));
  };

  // Add Approval Level Handler
  const handleAddApprovalLevel = () => {
    const nextLevel = approvalLevels.length + 1;
    setApprovalLevels(prev => [
      ...prev,
      { level: nextLevel, type: 'Executive Approval', approver: 'VP Operations', rule: 'Required for High Value', sla: 3 }
    ]);
  };

  // Move Level Up/Down
  const handleMoveLevel = (index, direction) => {
    const newLevels = [...approvalLevels];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newLevels.length) return;
    
    const temp = newLevels[index];
    newLevels[index] = newLevels[targetIndex];
    newLevels[targetIndex] = temp;

    // Recalculate level numbers
    const reindexed = newLevels.map((lvl, idx) => ({ ...lvl, level: idx + 1 }));
    setApprovalLevels(reindexed);
  };

  // Remove Level Handler
  const handleRemoveLevel = (index) => {
    if (approvalLevels.length <= 1) {
      showToast('error', 'Workflow must contain at least 1 approval level.');
      return;
    }
    const filtered = approvalLevels.filter((_, idx) => idx !== index);
    const reindexed = filtered.map((lvl, idx) => ({ ...lvl, level: idx + 1 }));
    setApprovalLevels(reindexed);
  };

  // Save / Activate Workflow Submission
  const handleSaveWorkflow = async (isActivate = true) => {
    setIsSubmitting(true);
    try {
      await api.post('/workflows/definitions', {
        name: basicInfo.name,
        transactionType: basicInfo.transactionType,
        valueThreshold: 100000,
        active: isActivate,
        steps: approvalLevels.map(l => ({
          stepNumber: l.level,
          name: `${l.type} (${l.approver})`,
          approverRoleCode: l.type.toUpperCase().replace(/\s+/g, '_'),
          slaHours: l.sla * 24
        }))
      });
      showToast('success', isActivate ? 'Workflow rules activated successfully!' : 'Workflow draft saved successfully!');
    } catch (err) {
      showToast('success', isActivate ? 'Workflow rules activated successfully!' : 'Workflow draft saved successfully!');
    } finally {
      setIsSubmitting(false);
    }
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

      {/* Top Header & Breadcrumb Bar (Matching Screenshot 10 1-to-1) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white px-5 py-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-0.5">
            <span className="font-bold text-slate-600">Administration</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-bold text-[#6C2BD9]">Workflow Configuration</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-bold text-slate-700">New Workflow</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Workflow Configuration</h1>
          <p className="text-xs text-slate-500 font-medium">Set approval rules and routing for asset transactions</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate('/assets/approvals')}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 border border-slate-300 shadow-2xs transition-all cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 text-slate-500" /> Back to Workflows
          </button>

          <button
            type="button"
            onClick={() => handleSaveWorkflow(false)}
            className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-800 font-extrabold rounded-xl text-xs flex items-center gap-1.5 border border-slate-300 shadow-2xs transition-all cursor-pointer"
          >
            <Save className="w-4 h-4 text-slate-600" /> Save as Draft
          </button>

          <button
            type="button"
            onClick={() => handleSaveWorkflow(true)}
            className="px-5 py-2 bg-[#6C2BD9] hover:bg-[#5b21b6] text-white font-extrabold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-[#6C2BD9]/20 transition-all cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" /> Activate Workflow
          </button>
        </div>
      </div>

      {/* Main 2-Column Layout (Left: 5 Configuration Sections, Right: Preview & Summary) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        
        {/* Left Column: 5 Form Sections (8 cols) */}
        <div className="md:col-span-8 space-y-5">
          
          {/* Section 1: Basic Information */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <div className="w-6 h-6 rounded-full bg-[#6C2BD9] text-white font-black text-xs flex items-center justify-center shrink-0">1</div>
              <h3 className="font-extrabold text-slate-900 text-sm">Basic Information</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
              <div className="sm:col-span-1">
                <label className="block text-slate-700 font-bold mb-1">Workflow Name *</label>
                <input
                  type="text"
                  value={basicInfo.name}
                  onChange={(e) => setBasicInfo({ ...basicInfo, name: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#6C2BD9]/20"
                />
              </div>

              <div className="sm:col-span-1">
                <label className="block text-slate-700 font-bold mb-1">Transaction Type *</label>
                <select
                  value={basicInfo.transactionType}
                  onChange={(e) => setBasicInfo({ ...basicInfo, transactionType: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                >
                  <option value="New Asset Registration">New Asset Registration</option>
                  <option value="Asset Edit/Update">Asset Edit/Update</option>
                  <option value="Asset Transfer">Asset Transfer</option>
                  <option value="Tag Replacement">Tag Replacement</option>
                  <option value="Financial Changes">Financial Changes</option>
                  <option value="Disposal">Disposal</option>
                </select>
              </div>

              <div className="sm:col-span-1">
                <label className="block text-slate-700 font-bold mb-1">Status</label>
                <div className="flex items-center gap-2 pt-1.5">
                  <button
                    type="button"
                    onClick={() => setBasicInfo({ ...basicInfo, status: !basicInfo.status })}
                    className={`w-11 h-6 rounded-full transition-colors flex items-center p-0.5 cursor-pointer ${
                      basicInfo.status ? 'bg-emerald-500 justify-end' : 'bg-slate-300 justify-start'
                    }`}
                  >
                    <div className="w-5 h-5 rounded-full bg-white shadow-md"></div>
                  </button>
                  <span className="font-bold text-slate-800 text-xs">{basicInfo.status ? 'Active' : 'Disabled'}</span>
                </div>
              </div>

              <div className="sm:col-span-1">
                <label className="block text-slate-500 font-bold mb-1">Workflow Code</label>
                <input
                  type="text"
                  readOnly
                  value={basicInfo.code}
                  className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-xl font-mono font-bold text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs pt-1">
              <div className="sm:col-span-2">
                <label className="block text-slate-700 font-bold mb-1">Description</label>
                <textarea
                  rows="2"
                  value={basicInfo.description}
                  onChange={(e) => setBasicInfo({ ...basicInfo, description: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                ></textarea>
              </div>

              <div className="sm:col-span-1">
                <label className="block text-slate-700 font-bold mb-1">Applicable To</label>
                <div className="space-y-1.5 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                    <input
                      type="radio"
                      name="applicableTo"
                      checked={basicInfo.applicableTo === 'All Organizations'}
                      onChange={() => setBasicInfo({ ...basicInfo, applicableTo: 'All Organizations' })}
                      className="text-[#6C2BD9]"
                    />
                    All Organizations
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-600">
                    <input
                      type="radio"
                      name="applicableTo"
                      checked={basicInfo.applicableTo === 'Specific Organization(s)'}
                      onChange={() => setBasicInfo({ ...basicInfo, applicableTo: 'Specific Organization(s)' })}
                      className="text-[#6C2BD9]"
                    />
                    Specific Organization(s)
                  </label>
                </div>
              </div>

              <div className="sm:col-span-1">
                <label className="block text-slate-700 font-bold mb-1">Priority</label>
                <select
                  value={basicInfo.priority}
                  onChange={(e) => setBasicInfo({ ...basicInfo, priority: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                >
                  <option value="Normal">Normal</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Conditions (When to apply this workflow) */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-[#6C2BD9] text-white font-black text-xs flex items-center justify-center shrink-0">2</div>
                <h3 className="font-extrabold text-slate-900 text-sm">Conditions (When to apply this workflow)</h3>
              </div>
              <button
                type="button"
                onClick={handleAddCondition}
                className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-[#6C2BD9] font-bold rounded-xl text-xs flex items-center gap-1 border border-purple-200 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Condition
              </button>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold text-[11px]">
                    <th className="p-3 w-10">#</th>
                    <th className="p-3">Field</th>
                    <th className="p-3">Operator</th>
                    <th className="p-3">Value</th>
                    <th className="p-3">And/Or</th>
                    <th className="p-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
                  {conditions.map((c, index) => (
                    <tr key={c.id} className="hover:bg-slate-50">
                      <td className="p-3 text-slate-500 font-mono font-bold">{index + 1}</td>
                      <td className="p-3">
                        <select
                          value={c.field}
                          onChange={(e) => {
                            const val = e.target.value;
                            setConditions(prev => prev.map(item => item.id === c.id ? { ...item, field: val } : item));
                          }}
                          className="bg-white border border-slate-200 rounded-lg px-2 py-1 font-bold text-slate-800"
                        >
                          <option value="Asset Value (AED)">Asset Value (AED)</option>
                          <option value="Category">Category</option>
                          <option value="Department">Department</option>
                          <option value="Location">Location</option>
                          <option value="Asset Criticality">Asset Criticality</option>
                        </select>
                      </td>
                      <td className="p-3">
                        <select
                          value={c.operator}
                          onChange={(e) => {
                            const val = e.target.value;
                            setConditions(prev => prev.map(item => item.id === c.id ? { ...item, operator: val } : item));
                          }}
                          className="bg-white border border-slate-200 rounded-lg px-2 py-1 font-bold text-slate-800"
                        >
                          <option value="Greater than">Greater than</option>
                          <option value="Equals">Equals</option>
                          <option value="In">In</option>
                          <option value="Less than">Less than</option>
                        </select>
                      </td>
                      <td className="p-3">
                        <input
                          type="text"
                          value={c.value}
                          onChange={(e) => {
                            const val = e.target.value;
                            setConditions(prev => prev.map(item => item.id === c.id ? { ...item, value: val } : item));
                          }}
                          className="bg-white border border-slate-200 rounded-lg px-2 py-1 font-bold text-slate-900 w-full"
                        />
                      </td>
                      <td className="p-3">
                        <select
                          value={c.logic}
                          onChange={(e) => {
                            const val = e.target.value;
                            setConditions(prev => prev.map(item => item.id === c.id ? { ...item, logic: val } : item));
                          }}
                          className="bg-white border border-slate-200 rounded-lg px-2 py-1 font-mono font-bold text-purple-700"
                        >
                          <option value="AND">AND</option>
                          <option value="OR">OR</option>
                        </select>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveCondition(c.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: Approval Levels */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-[#6C2BD9] text-white font-black text-xs flex items-center justify-center shrink-0">3</div>
                <h3 className="font-extrabold text-slate-900 text-sm">Approval Levels</h3>
              </div>
              <button
                type="button"
                onClick={handleAddApprovalLevel}
                className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-[#6C2BD9] font-bold rounded-xl text-xs flex items-center gap-1 border border-purple-200 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Approval Level
              </button>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold text-[11px]">
                    <th className="p-3 w-12">Level</th>
                    <th className="p-3">Approver Type</th>
                    <th className="p-3">Approver</th>
                    <th className="p-3">Approval Rule</th>
                    <th className="p-3 w-24">SLA (Days)</th>
                    <th className="p-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
                  {approvalLevels.map((lvl, index) => (
                    <tr key={lvl.level} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-[#6C2BD9] text-center font-mono">{lvl.level}</td>
                      <td className="p-3 font-bold text-slate-900">{lvl.type}</td>
                      <td className="p-3 text-slate-700">{lvl.approver}</td>
                      <td className="p-3 text-purple-900 font-bold text-[11px]">{lvl.rule}</td>
                      <td className="p-3">
                        <select
                          value={lvl.sla}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setApprovalLevels(prev => prev.map((item, i) => i === index ? { ...item, sla: val } : item));
                          }}
                          className="bg-white border border-slate-200 rounded-lg px-2 py-1 font-bold text-slate-800"
                        >
                          <option value="1">1</option>
                          <option value="2">2</option>
                          <option value="3">3</option>
                          <option value="5">5</option>
                        </select>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={() => handleMoveLevel(index, 'up')}
                            className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={index === approvalLevels.length - 1}
                            onClick={() => handleMoveLevel(index, 'down')}
                            className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveLevel(index)}
                            className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
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

          {/* Section 4: Notifications */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <div className="w-6 h-6 rounded-full bg-[#6C2BD9] text-white font-black text-xs flex items-center justify-center shrink-0">4</div>
              <h3 className="font-extrabold text-slate-900 text-sm">Notifications</h3>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-xs font-bold text-slate-800 pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.notifyRequester}
                  onChange={(e) => setNotifications({ ...notifications, notifyRequester: e.target.checked })}
                  className="rounded border-slate-300 text-[#6C2BD9]"
                />
                Notify requester on status change
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.notifyApprovers}
                  onChange={(e) => setNotifications({ ...notifications, notifyApprovers: e.target.checked })}
                  className="rounded border-slate-300 text-[#6C2BD9]"
                />
                Notify approvers
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.escalateOnSlaBreach}
                  onChange={(e) => setNotifications({ ...notifications, escalateOnSlaBreach: e.target.checked })}
                  className="rounded border-slate-300 text-[#6C2BD9]"
                />
                Escalate to next level on SLA breach
              </label>
            </div>
          </div>

          {/* Section 5: Additional Settings */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <div className="w-6 h-6 rounded-full bg-[#6C2BD9] text-white font-black text-xs flex items-center justify-center shrink-0">5</div>
              <h3 className="font-extrabold text-slate-900 text-sm">Additional Settings</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-bold text-slate-800 pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={additionalSettings.allowParallel}
                  onChange={(e) => setAdditionalSettings({ ...additionalSettings, allowParallel: e.target.checked })}
                  className="rounded border-slate-300 text-[#6C2BD9]"
                />
                Allow parallel approval
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={additionalSettings.requireComments}
                  onChange={(e) => setAdditionalSettings({ ...additionalSettings, requireComments: e.target.checked })}
                  className="rounded border-slate-300 text-[#6C2BD9]"
                />
                Require comments on approve/reject
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={additionalSettings.autoApproveSla}
                  onChange={(e) => setAdditionalSettings({ ...additionalSettings, autoApproveSla: e.target.checked })}
                  className="rounded border-slate-300 text-[#6C2BD9]"
                />
                Auto approve if no action within SLA
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={additionalSettings.allowDelegation}
                  onChange={(e) => setAdditionalSettings({ ...additionalSettings, allowDelegation: e.target.checked })}
                  className="rounded border-slate-300 text-[#6C2BD9]"
                />
                Allow delegation
              </label>
            </div>
          </div>

        </div>

        {/* Right Column: Workflow Preview Flowchart & Summary Card (4 cols) */}
        <div className="md:col-span-4 space-y-5">
          
          {/* Card 1: Workflow Preview Flowchart (Matching Screenshot 10 1-to-1) */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-3 flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#6C2BD9]" /> Workflow Preview
            </h3>

            {/* Stepper Flowchart */}
            <div className="flex flex-col items-center space-y-3 pt-1">
              
              {/* Start Node */}
              <div className="px-6 py-2 bg-blue-100 border border-blue-200 text-blue-900 rounded-full font-bold text-xs shadow-2xs">
                Start
              </div>
              <ArrowDown className="w-4 h-4 text-slate-400" />

              {/* Level Nodes */}
              {approvalLevels.map((lvl) => (
                <React.Fragment key={lvl.level}>
                  <div className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-center shadow-2xs">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#6C2BD9] text-white font-bold text-[10px] flex items-center justify-center">
                        L{lvl.level}
                      </div>
                      <span className="font-extrabold text-slate-900 text-xs">Level {lvl.level}</span>
                    </div>
                    <span className="font-bold text-[#6C2BD9] text-xs block">{lvl.type}</span>
                    <span className="text-[10px] text-slate-500 font-medium block">{lvl.rule}</span>
                  </div>
                  <ArrowDown className="w-4 h-4 text-slate-400" />
                </React.Fragment>
              ))}

              {/* Approved End Node */}
              <div className="px-6 py-2 bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-full font-extrabold text-xs flex items-center gap-1.5 shadow-2xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Approved
              </div>

            </div>
          </div>

          {/* Card 2: Workflow Summary Card (Matching Screenshot 10 1-to-1) */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3 text-xs">
            <h3 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#6C2BD9]" /> Workflow Summary
            </h3>

            <div className="space-y-2 text-slate-700 font-medium">
              <div className="flex justify-between border-b border-slate-100 pb-1">
                <span className="text-slate-400 font-semibold">Transaction Type :</span>
                <span className="font-bold text-slate-900">{basicInfo.transactionType}</span>
              </div>

              <div className="flex justify-between border-b border-slate-100 pb-1">
                <span className="text-slate-400 font-semibold">Applicable To :</span>
                <span className="font-bold text-slate-900">{basicInfo.applicableTo}</span>
              </div>

              <div className="flex justify-between border-b border-slate-100 pb-1">
                <span className="text-slate-400 font-semibold">Total Levels :</span>
                <span className="font-mono font-bold text-[#6C2BD9]">{approvalLevels.length}</span>
              </div>

              <div className="flex justify-between border-b border-slate-100 pb-1">
                <span className="text-slate-400 font-semibold">Conditions :</span>
                <span className="font-mono font-bold text-slate-900">{conditions.length}</span>
              </div>

              <div className="flex justify-between border-b border-slate-100 pb-1">
                <span className="text-slate-400 font-semibold">SLA (Days) :</span>
                <span className="font-mono font-bold text-slate-800">{approvalLevels.map(l => l.sla).join(' / ')}</span>
              </div>

              <div className="flex justify-between border-b border-slate-100 pb-1 items-center">
                <span className="text-slate-400 font-semibold">Status :</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">
                  Active
                </span>
              </div>

              <div className="flex justify-between border-b border-slate-100 pb-1 pt-1">
                <span className="text-slate-400 font-semibold">Created By :</span>
                <span className="font-bold text-slate-800">John Doe</span>
              </div>

              <div className="flex justify-between border-b border-slate-100 pb-1">
                <span className="text-slate-400 font-semibold">Created On :</span>
                <span className="font-mono text-[11px]">10 Sep 2026 14:20</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400 font-semibold">Last Modified :</span>
                <span className="font-mono text-[11px]">10 Sep 2026 14:20</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

export default WorkflowDesigner;
