import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { api } from '../../services/api';
import { X, Building2, Tag, Users, Grid, Plus, CheckCircle2, AlertCircle } from 'lucide-react';

export function AddGenericMasterRecordModal({ isOpen, onClose, onSuccess, entityType = 'category', entityTitle = 'Record' }) {
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    fullName: '',
    email: '',
    employeeCode: '',
    modelNumber: '',
    description: '',
    label: '',
    fieldType: 'STRING'
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      let endpoint = '';
      let payload = { ...formData };

      if (entityType === 'company') endpoint = '/master-data/companies';
      else if (entityType === 'site') endpoint = '/master-data/sites';
      else if (entityType === 'category') endpoint = '/master-data/categories';
      else if (entityType === 'manufacturer') endpoint = '/master-data/manufacturers';
      else if (entityType === 'model') endpoint = '/master-data/models';
      else if (entityType === 'department') endpoint = '/master-data/departments';
      else if (entityType === 'cost_center') endpoint = '/master-data/cost-centers';
      else if (entityType === 'employee') endpoint = '/master-data/employees';
      else if (entityType === 'custom_field') endpoint = '/master-data/custom-fields';
      else endpoint = `/master-data/${entityType}s`;

      // Code auto-generation if omitted
      if (!payload.code && (payload.name || payload.fullName)) {
        payload.code = (payload.name || payload.fullName).toUpperCase().replace(/[^A-Z0-9]/g, '_').slice(0, 10);
      }
      if (entityType === 'employee' && !payload.employeeCode) {
        payload.employeeCode = `EMP-${Date.now().toString().slice(-6)}`;
      }

      const res = await api.post(endpoint, payload);
      if (res && res.success) {
        const createdItem = res.company || res.site || res.category || res.manufacturer || res.model || res.department || res.costCenter || res.employee || res.field || res;
        onSuccess(createdItem);
        onClose();
        setFormData({ code: '', name: '', fullName: '', email: '', employeeCode: '', modelNumber: '', description: '', label: '', fieldType: 'STRING' });
      }
    } catch (err) {
      setErrorMsg(err?.message || 'Failed to save master data record. Check code uniqueness and required fields.');
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[10000] overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden relative">

        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#6c2bd9] text-white flex items-center justify-center font-bold shadow-md shadow-brand-500/20">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Add New {entityTitle}</h3>
              <p className="text-xs text-slate-500 mt-0.5">Define reference data for system-wide configuration</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {entityType === 'employee' ? (
            <>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Employee Full Name *</label>
                <input
                  type="text"
                  name="fullName"
                  required
                  placeholder="e.g. Sarah Jenkins"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="input-primary w-full"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Corporate Email Address *</label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="s.jenkins@company.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="input-primary w-full"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Employee Code</label>
                <input
                  type="text"
                  name="employeeCode"
                  placeholder="EMP-10492 (Auto-generated if blank)"
                  value={formData.employeeCode}
                  onChange={handleChange}
                  className="input-primary w-full font-mono"
                />
              </div>
            </>
          ) : entityType === 'custom_field' ? (
            <>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Field Label *</label>
                <input
                  type="text"
                  name="label"
                  required
                  placeholder="e.g. Security Compliance Badge"
                  value={formData.label}
                  onChange={handleChange}
                  className="input-primary w-full"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Data Type</label>
                <select
                  name="fieldType"
                  value={formData.fieldType}
                  onChange={handleChange}
                  className="input-primary w-full"
                >
                  <option value="STRING">Text String</option>
                  <option value="NUMBER">Number</option>
                  <option value="DATE">Date</option>
                  <option value="BOOLEAN">Boolean (Yes/No)</option>
                </select>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block font-bold text-slate-700 mb-1">{entityTitle} Name *</label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder={`Enter ${entityTitle} Name`}
                  value={formData.name}
                  onChange={handleChange}
                  className="input-primary w-full"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Identifier Code</label>
                <input
                  type="text"
                  name="code"
                  placeholder="AUTO_GENERATED (e.g. IT_DEPT)"
                  value={formData.code}
                  onChange={handleChange}
                  className="input-primary w-full font-mono"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  name="description"
                  rows="3"
                  placeholder="Add details or administrative scope..."
                  value={formData.description}
                  onChange={handleChange}
                  className="input-primary w-full"
                />
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary text-xs px-4 py-2 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary text-xs px-5 py-2 font-bold shadow-md shadow-brand-500/20"
            >
              {loading ? 'Saving...' : `Save ${entityTitle}`}
            </button>
          </div>
        </form>

      </div>
    </div>,
    document.body
  );
}

