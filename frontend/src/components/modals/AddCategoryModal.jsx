import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { api } from '../../services/api';
import { Layers, X, AlertCircle } from 'lucide-react';

export function AddCategoryModal({
  isOpen,
  onClose,
  onSuccess,
  title = "Add Asset Category",
  subtitle = "Create new classification category"
}) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [defaultUsefulLifeMonths, setDefaultUsefulLifeMonths] = useState(36);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Category Name is required');
      return;
    }
    setSubmitting(true);
    setErrorMsg('');

    const catCode = code.trim() ? code.toUpperCase().trim() : `CAT-${name.slice(0, 4).toUpperCase()}`;
    const newCategoryObj = {
      _id: `cat-${Date.now()}`,
      name: name.trim(),
      code: catCode,
      defaultUsefulLifeMonths: Number(defaultUsefulLifeMonths) || 36,
      description: description.trim()
    };

    try {
      const res = await api.post('/master-data/categories', newCategoryObj);
      const saved = (res && res.success && res.category) ? res.category : newCategoryObj;

      const existing = JSON.parse(localStorage.getItem('fams_categories') || '[]');
      const updated = [...existing, saved];
      localStorage.setItem('fams_categories', JSON.stringify(updated));

      if (onSuccess) onSuccess(saved);
      onClose();
    } catch (err) {
      console.warn('Category save fallback to local:', err);
      const existing = JSON.parse(localStorage.getItem('fams_categories') || '[]');
      const updated = [...existing, newCategoryObj];
      localStorage.setItem('fams_categories', JSON.stringify(updated));

      if (onSuccess) onSuccess(newCategoryObj);
      onClose();
    } finally {
      setSubmitting(false);
      setName('');
      setCode('');
      setDefaultUsefulLifeMonths(36);
      setDescription('');
    }
  };

  return createPortal(
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[10000] flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 max-w-md w-full rounded-2xl p-6 space-y-5 shadow-2xl relative">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-50 text-[#6c2bd9]">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">{title}</h3>
              <p className="text-xs text-slate-500">{subtitle}</p>
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
              Category Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Telecommunications & Networking"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
              autoFocus
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Category Code (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. CAT-NET"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="input-field font-mono"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Useful Life (Months) *
            </label>
            <input
              type="number"
              required
              min="1"
              max="600"
              value={defaultUsefulLifeMonths}
              onChange={(e) => setDefaultUsefulLifeMonths(e.target.value)}
              className="input-field"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Description (Optional)
            </label>
            <textarea
              rows="2"
              placeholder="Classification notes..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-field"
            ></textarea>
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
              {submitting ? 'Creating Category...' : 'Save & Publish Category'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

export function AddCustomCategoryModal(props) {
  return (
    <AddCategoryModal
      title="Add Custom Category"
      subtitle="Create custom category option for asset register"
      {...props}
    />
  );
}

