import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { api } from '../../services/api';
import { Building, X, AlertCircle } from 'lucide-react';

export function AddCompanyModal({ isOpen, onClose, onSuccess }) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [taxId, setTaxId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Company Entity Name is required');
      return;
    }
    setSubmitting(true);
    setErrorMsg('');

    const cmpCode = code.trim() ? code.toUpperCase().trim() : `CMP-${name.slice(0, 4).toUpperCase()}`;
    const newCompanyObj = {
      _id: `cmp-${Date.now()}`,
      name: name.trim(),
      code: cmpCode,
      currency: currency || 'USD',
      taxId: taxId.trim()
    };

    try {
      const res = await api.post('/master-data/companies', newCompanyObj);
      const saved = (res && res.success && res.company) ? res.company : newCompanyObj;

      const existing = JSON.parse(localStorage.getItem('fams_companies') || '[]');
      const updated = [...existing, saved];
      localStorage.setItem('fams_companies', JSON.stringify(updated));

      if (onSuccess) onSuccess(saved);
      onClose();
    } catch (err) {
      console.warn('Company save fallback to local:', err);
      const existing = JSON.parse(localStorage.getItem('fams_companies') || '[]');
      const updated = [...existing, newCompanyObj];
      localStorage.setItem('fams_companies', JSON.stringify(updated));

      if (onSuccess) onSuccess(newCompanyObj);
      onClose();
    } finally {
      setSubmitting(false);
      setName('');
      setCode('');
      setCurrency('USD');
      setTaxId('');
    }
  };

  return createPortal(
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[10000] flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 max-w-md w-full rounded-2xl p-6 space-y-5 shadow-2xl relative">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-50 text-[#6c2bd9]">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Add Company Entity</h3>
              <p className="text-xs text-slate-500">Register new legal corporate entity</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Company Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Infotatwaa Enterprise India Ltd"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
              autoFocus
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Company Code (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. CMP-INDIA"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="input-field font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="input-field"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="INR">INR (₹)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Tax Registration ID
              </label>
              <input
                type="text"
                placeholder="Tax ID / VAT"
                value={taxId}
                onChange={(e) => setTaxId(e.target.value)}
                className="input-field"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary"
            >
              {submitting ? 'Creating Entity...' : 'Save Company Entity'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
