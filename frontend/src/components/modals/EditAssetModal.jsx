import React, { useState, useEffect } from 'react';
import { X, Edit3, CheckCircle2 } from 'lucide-react';

export function EditAssetModal({ isOpen, onClose, asset, onSaveAsset }) {
  const [formData, setFormData] = useState({
    serialNumber: '',
    assetName: '',
    category: '',
    model: '',
    condition: 'New',
    tagNumber: ''
  });

  useEffect(() => {
    if (asset) {
      setFormData({
        serialNumber: asset.serialNumber || '',
        assetName: asset.assetName || '',
        category: asset.category || '',
        model: asset.model || '',
        condition: asset.condition || 'New',
        tagNumber: asset.tagNumber === '-' ? '' : (asset.tagNumber || '')
      });
    }
  }, [asset]);

  if (!isOpen || !asset) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const updated = {
      ...asset,
      serialNumber: formData.serialNumber.trim(),
      assetName: formData.assetName.trim(),
      category: formData.category,
      model: formData.model,
      condition: formData.condition,
      tagNumber: formData.tagNumber.trim() || '-',
      status: formData.tagNumber.trim() && formData.tagNumber.trim() !== '-' ? 'Tagged' : 'Pending'
    };
    onSaveAsset(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/60">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Edit3 className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Edit Received Asset</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Serial Number</label>
            <input
              type="text"
              value={formData.serialNumber}
              onChange={e => setFormData({ ...formData, serialNumber: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Asset Name</label>
            <input
              type="text"
              value={formData.assetName}
              onChange={e => setFormData({ ...formData, assetName: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Category</label>
              <input
                type="text"
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Model</label>
              <input
                type="text"
                value={formData.model}
                onChange={e => setFormData({ ...formData, model: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Condition</label>
              <select
                value={formData.condition}
                onChange={e => setFormData({ ...formData, condition: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
              >
                <option value="New">New</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Refurbished">Refurbished</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tag Number</label>
              <input
                type="text"
                value={formData.tagNumber}
                onChange={e => setFormData({ ...formData, tagNumber: e.target.value })}
                placeholder="Leave blank for Pending"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
              />
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
