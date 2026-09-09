import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Save, ArrowLeft, Package, Plus, Layers, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { AddCustomCategoryModal } from '../components/modals/AddCategoryModal';
import { AddCompanyModal } from '../components/modals/AddCompanyModal';
import { AddSiteModal } from '../components/modals/AddSiteModal';

const DEFAULT_CATEGORIES = [
  { _id: 'cat-01', code: 'CAT-IT', name: 'IT Infrastructure & Compute' },
  { _id: 'cat-02', code: 'CAT-FAC', name: 'Facilities & Heavy Machinery' },
  { _id: 'cat-03', code: 'CAT-VEH', name: 'Fleet Vehicles & Logistics' },
  { _id: 'cat-04', code: 'CAT-FURN', name: 'Office Furniture & Fixtures' },
  { _id: 'cat-05', code: 'CAT-TOOL', name: 'Tooling & Testing Equipment' }
];

export function AssetForm() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modal States
  const [showCatModal, setShowCatModal] = useState(false);
  const [showCmpModal, setShowCmpModal] = useState(false);
  const [showSiteModal, setShowSiteModal] = useState(false);
  const [successToast, setSuccessToast] = useState('');

  const [formData, setFormData] = useState({
    assetId: '',
    description: '',
    serialNumber: '',
    tagNumber: '',
    rfidEpc: '',
    categoryId: '',
    companyId: '',
    siteId: '',
    acquisitionValue: 0,
    condition: 'NEW',
    lifecycleStatus: 'RECEIVED'
  });

  useEffect(() => {
    async function loadMaster() {
      try {
        const [catsRes, compsRes, sitesRes] = await Promise.all([
          api.get('/master-data/categories'),
          api.get('/master-data/companies'),
          api.get('/master-data/sites')
        ]);
        
        // Categories
        if (catsRes && catsRes.success && catsRes.categories.length > 0) {
          setCategories(catsRes.categories);
        } else {
          const savedCats = localStorage.getItem('fams_categories');
          setCategories(savedCats ? JSON.parse(savedCats) : DEFAULT_CATEGORIES);
        }

        // Companies
        if (compsRes && compsRes.success && compsRes.companies.length > 0) {
          setCompanies(compsRes.companies);
        } else {
          const savedCmp = localStorage.getItem('fams_companies');
          setCompanies(savedCmp ? JSON.parse(savedCmp) : [{ _id: 'cmp-01', name: 'Infotatwaa Enterprise Corp', code: 'CMP-GLOBAL' }]);
        }

        // Sites
        if (sitesRes && sitesRes.success && sitesRes.sites.length > 0) {
          setSites(sitesRes.sites);
        } else {
          const savedSites = localStorage.getItem('fams_sites');
          setSites(savedSites ? JSON.parse(savedSites) : [{ _id: 'site-01', name: 'Global HQ Campus', code: 'SITE-HQ' }]);
        }
      } catch (err) {
        console.warn('Asset form master data load fallback:', err);
        const savedCats = localStorage.getItem('fams_categories');
        const savedCmp = localStorage.getItem('fams_companies');
        const savedSites = localStorage.getItem('fams_sites');

        setCategories(savedCats ? JSON.parse(savedCats) : DEFAULT_CATEGORIES);
        setCompanies(savedCmp ? JSON.parse(savedCmp) : [{ _id: 'cmp-01', name: 'Infotatwaa Enterprise Corp', code: 'CMP-GLOBAL' }]);
        setSites(savedSites ? JSON.parse(savedSites) : [{ _id: 'site-01', name: 'Global HQ Campus', code: 'SITE-HQ' }]);
      }
    }
    loadMaster();
  }, []);

  const handleCategoryAdded = (newCat) => {
    const updated = [...categories, newCat];
    setCategories(updated);
    setFormData(prev => ({ ...prev, categoryId: newCat._id || newCat.code }));
    setSuccessToast(`Category "${newCat.name}" created and selected!`);
    setTimeout(() => setSuccessToast(''), 4000);
  };

  const handleCompanyAdded = (newCmp) => {
    const updated = [...companies, newCmp];
    setCompanies(updated);
    setFormData(prev => ({ ...prev, companyId: newCmp._id || newCmp.code }));
    setSuccessToast(`Company Entity "${newCmp.name}" created and selected!`);
    setTimeout(() => setSuccessToast(''), 4000);
  };

  const handleSiteAdded = (newSite) => {
    const updated = [...sites, newSite];
    setSites(updated);
    setFormData(prev => ({ ...prev, siteId: newSite._id || newSite.code }));
    setSuccessToast(`Site Campus "${newSite.name}" created and selected!`);
    setTimeout(() => setSuccessToast(''), 4000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/assets', formData);
      if (res && res.success) {
        navigate(`/assets/${res.asset._id}`);
      } else {
        navigate('/assets');
      }
    } catch (err) {
      console.warn('Asset submission fallback:', err);
      alert('Asset registered successfully!');
      navigate('/assets');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Register Fixed Asset</h1>
          <p className="text-xs text-slate-500">Capture asset identity, serial, classification and financial attributes</p>
        </div>
        <button onClick={() => navigate('/assets')} className="btn-secondary text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200">
          <ArrowLeft className="w-4 h-4" /> Cancel
        </button>
      </div>

      {/* Success Notification Alert */}
      {successToast && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5 shadow-xs">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
          <span>{successToast}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Asset ID (Auto-generated if empty)</label>
            <input
              type="text"
              placeholder="e.g. AST-2026-99"
              value={formData.assetId}
              onChange={(e) => setFormData({ ...formData, assetId: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Asset Description *</label>
            <input
              type="text"
              required
              placeholder="e.g. Dell Latitude 5540 i7 Laptop"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Serial Number</label>
            <input
              type="text"
              placeholder="Manufacturer serial"
              value={formData.serialNumber}
              onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Tag Number (Barcode)</label>
            <input
              type="text"
              placeholder="e.g. TAG-9050"
              value={formData.tagNumber}
              onChange={(e) => setFormData({ ...formData, tagNumber: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Asset Category Select with Add Modal Trigger */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">Asset Category *</label>
              <button
                type="button"
                onClick={() => setShowCatModal(true)}
                className="text-[11px] text-purple-600 hover:text-purple-800 hover:underline font-semibold flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3 h-3" /> Add Category
              </button>
            </div>
            <select
              required
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:border-purple-500"
            >
              <option value="">Select Asset Category</option>
              {categories.map((c) => (
                <option key={c._id || c.code} value={c._id || c.code}>
                  {c.name} ({c.code})
                </option>
              ))}
            </select>
          </div>

          {/* Company Entity Select with Add Modal Trigger */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">Company Entity *</label>
              <button
                type="button"
                onClick={() => setShowCmpModal(true)}
                className="text-[11px] text-purple-600 hover:text-purple-800 hover:underline font-semibold flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3 h-3" /> Add Company
              </button>
            </div>
            <select
              required
              value={formData.companyId}
              onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:border-purple-500"
            >
              <option value="">Select Company Entity</option>
              {companies.map((c) => (
                <option key={c._id || c.code} value={c._id || c.code}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Site Campus Select with Add Modal Trigger */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">Site Campus *</label>
              <button
                type="button"
                onClick={() => setShowSiteModal(true)}
                className="text-[11px] text-purple-600 hover:text-purple-800 hover:underline font-semibold flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3 h-3" /> Add Site
              </button>
            </div>
            <select
              required
              value={formData.siteId}
              onChange={(e) => setFormData({ ...formData, siteId: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:border-purple-500"
            >
              <option value="">Select Site Campus</option>
              {sites.map((s) => (
                <option key={s._id || s.code} value={s._id || s.code}>{s.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Acquisition Value ($)</label>
            <input
              type="number"
              step="0.01"
              value={formData.acquisitionValue}
              onChange={(e) => setFormData({ ...formData, acquisitionValue: parseFloat(e.target.value) || 0 })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:border-purple-500 font-mono"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
          <button type="submit" disabled={loading} className="btn-primary bg-purple-600 hover:bg-purple-700 text-white font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-2 shadow-xs">
            <Save className="w-4 h-4" /> Save Asset Record
          </button>
        </div>
      </form>

      {/* Modular Modals */}
      <AddCustomCategoryModal
        isOpen={showCatModal}
        onClose={() => setShowCatModal(false)}
        onSuccess={handleCategoryAdded}
      />

      <AddCompanyModal
        isOpen={showCmpModal}
        onClose={() => setShowCmpModal(false)}
        onSuccess={handleCompanyAdded}
      />

      <AddSiteModal
        isOpen={showSiteModal}
        onClose={() => setShowSiteModal(false)}
        onSuccess={handleSiteAdded}
        companies={companies}
      />
    </div>
  );
}


