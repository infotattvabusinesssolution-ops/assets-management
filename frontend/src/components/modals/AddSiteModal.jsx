import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { api } from '../../services/api';
import { MapPin, X, AlertCircle } from 'lucide-react';

export function AddSiteModal({ isOpen, onClose, onSuccess, companies = [] }) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('USA');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Site Campus Name is required');
      return;
    }
    setSubmitting(true);
    setErrorMsg('');

    const siteCode = code.trim() ? code.toUpperCase().trim() : `SITE-${name.slice(0, 4).toUpperCase()}`;
    const newSiteObj = {
      _id: `site-${Date.now()}`,
      name: name.trim(),
      code: siteCode,
      companyId: companyId || undefined,
      city: city.trim(),
      country: country.trim() || 'USA'
    };

    try {
      const res = await api.post('/master-data/sites', newSiteObj);
      const saved = (res && res.success && res.site) ? res.site : newSiteObj;

      const existing = JSON.parse(localStorage.getItem('fams_sites') || '[]');
      const updated = [...existing, saved];
      localStorage.setItem('fams_sites', JSON.stringify(updated));

      if (onSuccess) onSuccess(saved);
      onClose();
    } catch (err) {
      console.warn('Site save fallback to local:', err);
      const existing = JSON.parse(localStorage.getItem('fams_sites') || '[]');
      const updated = [...existing, newSiteObj];
      localStorage.setItem('fams_sites', JSON.stringify(updated));

      if (onSuccess) onSuccess(newSiteObj);
      onClose();
    } finally {
      setSubmitting(false);
      setName('');
      setCode('');
      setCity('');
      setCountry('USA');
    }
  };

  return createPortal(
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[10000] flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 max-w-md w-full rounded-2xl p-6 space-y-5 shadow-2xl relative">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-50 text-[#6c2bd9]">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Add Site Campus</h3>
              <p className="text-xs text-slate-500">Register new physical site location</p>
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
              Site Campus Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Bangalore Tech Park Site"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
              autoFocus
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Site Code (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. SITE-BLR"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="input-field font-mono"
            />
          </div>

          {companies.length > 0 && (
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Parent Company Entity
              </label>
              <select
                value={companyId}
                onChange={(e) => setCompanyId(e.target.value)}
                className="input-field"
              >
                <option value="">Select Company Entity</option>
                {companies.map(c => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                City
              </label>
              <input
                type="text"
                placeholder="e.g. Bangalore"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="input-field"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Country
              </label>
              <input
                type="text"
                placeholder="e.g. India"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
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
              {submitting ? 'Creating Site...' : 'Save Site Campus'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
