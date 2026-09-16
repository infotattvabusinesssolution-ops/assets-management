import React, { useState, useEffect } from 'react';
import { X, Plus, AlertCircle, CheckCircle2, Laptop } from 'lucide-react';
import { api } from '../../services/api';

export function ManualAssetModal({ isOpen, onClose, onAddAsset, defaultValues = {}, existingItems = [] }) {
  const [formData, setFormData] = useState({
    serialNumber: '',
    assetName: '',
    category: 'Laptop',
    subCategory: 'Business Laptop',
    manufacturer: 'Dell',
    model: 'Latitude 7450',
    condition: 'New',
    warrantyMonths: 36,
    tagNumber: ''
  });

  const [validating, setValidating] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [isSerialValid, setIsSerialValid] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        serialNumber: '',
        assetName: `${defaultValues.manufacturer || 'Dell'} ${defaultValues.model || 'Latitude 7450'}`.trim(),
        category: defaultValues.category || 'Laptop',
        subCategory: defaultValues.subCategory || 'Business Laptop',
        manufacturer: defaultValues.manufacturer || 'Dell',
        model: defaultValues.model || 'Latitude 7450',
        condition: defaultValues.condition || 'New',
        warrantyMonths: defaultValues.warrantyMonths || 36,
        tagNumber: ''
      });
      setValidationError('');
      setIsSerialValid(null);
    }
  }, [isOpen, defaultValues]);

  if (!isOpen) return null;

  const handleSerialChange = async (e) => {
    const val = e.target.value;
    setFormData(prev => ({ ...prev, serialNumber: val }));
    setValidationError('');
    setIsSerialValid(null);

    if (!val.trim()) return;

    // Local check against existing batch items
    const duplicateInBatch = existingItems.some(
      item => item.serialNumber?.trim().toLowerCase() === val.trim().toLowerCase()
    );

    if (duplicateInBatch) {
      setValidationError(`Serial Number '${val}' is already present in this receiving batch.`);
      setIsSerialValid(false);
      return;
    }

    // Debounced backend check
    setValidating(true);
    try {
      const res = await api.post('/receiving/validate-serial', { serialNumber: val.trim() });
      if (res && res.valid === false) {
        setValidationError(res.message || 'Serial number already exists in Asset360.');
        setIsSerialValid(false);
      } else {
        setIsSerialValid(true);
      }
    } catch (err) {
      // Offline fallback: keep valid if unique in batch
      setIsSerialValid(true);
    } finally {
      setValidating(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.serialNumber.trim()) {
      setValidationError('Serial Number is required.');
      return;
    }

    if (isSerialValid === false || validationError) {
      return;
    }

    const newAsset = {
      id: `AST-TEMP-${Date.now()}`,
      serialNumber: formData.serialNumber.trim(),
      assetName: formData.assetName.trim() || `${formData.manufacturer} ${formData.model}`,
      category: formData.category,
      subCategory: formData.subCategory,
      manufacturer: formData.manufacturer,
      model: formData.model,
      condition: formData.condition,
      warrantyMonths: formData.warrantyMonths,
      tagNumber: formData.tagNumber.trim() || '-',
      status: formData.tagNumber.trim() && formData.tagNumber.trim() !== '-' ? 'Tagged' : 'Pending',
      imageUrl: '/laptop.png',
      addedAt: new Date().toISOString()
    };

    onAddAsset(newAsset);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Laptop className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Add Asset Manually</h3>
              <p className="text-xs text-slate-500">Capture single asset details with unique serial validation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {validationError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{validationError}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {/* Serial Number */}
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Serial Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.serialNumber}
                  onChange={handleSerialChange}
                  placeholder="e.g. DL7450-004"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  required
                />
                {validating && (
                  <span className="absolute right-3 top-2.5 text-[10px] text-slate-400">Checking...</span>
                )}
                {!validating && isSerialValid === true && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 absolute right-3 top-2.5" />
                )}
              </div>
            </div>

            {/* Asset Name */}
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Asset Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.assetName}
                onChange={e => setFormData({ ...formData, assetName: e.target.value })}
                placeholder="e.g. Dell Latitude 7450"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                required
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
              <input
                type="text"
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50"
              />
            </div>

            {/* Sub Category */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Subcategory</label>
              <input
                type="text"
                value={formData.subCategory}
                onChange={e => setFormData({ ...formData, subCategory: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50"
              />
            </div>

            {/* Manufacturer */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Manufacturer</label>
              <input
                type="text"
                value={formData.manufacturer}
                onChange={e => setFormData({ ...formData, manufacturer: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50"
              />
            </div>

            {/* Model */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Model</label>
              <input
                type="text"
                value={formData.model}
                onChange={e => setFormData({ ...formData, model: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50"
              />
            </div>

            {/* Condition */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Condition</label>
              <select
                value={formData.condition}
                onChange={e => setFormData({ ...formData, condition: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
              >
                <option value="New">New</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Refurbished">Refurbished</option>
              </select>
            </div>

            {/* Tag Number (Optional) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tag Number (Optional)</label>
              <input
                type="text"
                value={formData.tagNumber}
                onChange={e => setFormData({ ...formData, tagNumber: e.target.value })}
                placeholder="Leave blank for Pending"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 flex items-center justify-end gap-2.5 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSerialValid === false || !formData.serialNumber.trim()}
              className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Add to Received Assets
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
