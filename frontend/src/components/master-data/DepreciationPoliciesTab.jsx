import React, { useEffect, useState, useMemo } from 'react';
import {
  Lock,
  Search,
  CheckCircle2,
  AlertCircle,
  TrendingDown,
  Calculator,
  ShieldCheck,
  Info,
  Layers,
  Sparkles
} from 'lucide-react';
import { api } from '../../services/api';

const DEPRECIATION_METHODS = [
  { value: 'STRAIGHT_LINE', label: 'Straight Line Method (SLM)', short: 'SLM', desc: 'Equal depreciation amount over asset useful life' },
  { value: 'WDV', label: 'Written Down Value (WDV)', short: 'WDV', desc: 'Higher depreciation in early years on net carrying book value' },
  { value: 'DDB', label: 'Double Declining Balance (DDB)', short: 'DDB', desc: 'Accelerated depreciation at 2x straight line rate' },
  { value: 'SUM_OF_YEARS', label: 'Sum of the Years’ Digits (SYD)', short: 'SYD', desc: 'Accelerated depreciation based on remaining useful life ratio' },
  { value: 'UNITS_OF_PRODUCTION', label: 'Units of Production', short: 'UOP', desc: 'Depreciation allocated based on operational usage or output' }
];

export function DepreciationPoliciesTab() {
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [selectedSubCatId, setSelectedSubCatId] = useState('');
  const [method, setMethod] = useState('STRAIGHT_LINE');
  const [rate, setRate] = useState('');
  const [residual, setResidual] = useState('0');
  const [lifeInMonths, setLifeInMonths] = useState(60);
  const [totalSalvageValue, setTotalSalvageValue] = useState('');
  const [minCapitalizationValue, setMinCapitalizationValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const result = await api.get('/master-data/depreciation-policies');
      if (!result?.success) throw new Error(result?.message || 'Could not load depreciation policies.');
      setCategories(result.categories || []);
      setSubCategories(result.subCategories || []);
      setSelectedId(previous => previous || result.categories?.[0]?.id || '');
      setMessage(null);
    } catch (error) {
      setMessage({ error: true, text: error.message || 'Could not load depreciation policies.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const selectedCategory = useMemo(() => {
    return categories.find(category => category.id === selectedId);
  }, [categories, selectedId]);

  // Subcategories linked or belonging to selected category
  const categorySubCategories = useMemo(() => {
    if (!selectedCategory) return [];
    const directMatches = subCategories.filter(sc =>
      sc.categoryId === selectedCategory.id ||
      (sc.categoryName && sc.categoryName.toLowerCase() === selectedCategory.name.toLowerCase())
    );
    return directMatches.length > 0 ? directMatches : subCategories;
  }, [subCategories, selectedCategory]);

  useEffect(() => {
    if (!selectedCategory) return;
    setMethod(selectedCategory.depreciationMethod || 'STRAIGHT_LINE');
    setRate(selectedCategory.annualDepreciationRatePercent == null ? '' : String(selectedCategory.annualDepreciationRatePercent));
    setResidual(String(selectedCategory.defaultResidualValuePercent ?? 0));
    setTotalSalvageValue(selectedCategory.totalSalvageValue ? String(selectedCategory.totalSalvageValue) : '');
    setMinCapitalizationValue(selectedCategory.minCapitalizationValue ? String(selectedCategory.minCapitalizationValue) : '');

    // Resolve initial sub category
    let matchedSub = null;
    if (selectedCategory.subCategoryId) {
      matchedSub = subCategories.find(sc => sc.id === selectedCategory.subCategoryId || sc.code === selectedCategory.subCategoryId);
    }
    if (!matchedSub && categorySubCategories.length > 0) {
      matchedSub = categorySubCategories[0];
    }

    if (matchedSub) {
      setSelectedSubCatId(matchedSub.id);
      const months = matchedSub.lifeInMonths !== undefined && matchedSub.lifeInMonths !== null ? Number(matchedSub.lifeInMonths) : 60;
      setLifeInMonths(months);
      if (!selectedCategory.annualDepreciationRatePercent && months > 0) {
        setRate((1200 / months).toFixed(2));
      }
    } else {
      setSelectedSubCatId('');
      setLifeInMonths(selectedCategory.defaultUsefulLifeMonths || 60);
    }
  }, [selectedId, categories, subCategories]);

  const handleSubCategoryChange = (subCatId) => {
    setSelectedSubCatId(subCatId);
    const found = subCategories.find(sc => sc.id === subCatId);
    if (found) {
      const months = found.lifeInMonths !== undefined && found.lifeInMonths !== null ? Number(found.lifeInMonths) : 60;
      setLifeInMonths(months);
      if (months > 0) {
        setRate((1200 / months).toFixed(2));
      }
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    const annualRate = Number(rate);
    const residualPercent = Number(residual);
    if (!Number.isFinite(annualRate) || annualRate < 1 || annualRate > 100 ||
        !Number.isFinite(residualPercent) || residualPercent < 0 || residualPercent >= 100) {
      setMessage({ error: true, text: 'Enter an annual rate from 1% to 100% and a residual percentage below 100%.' });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        depreciationMethod: method,
        annualDepreciationRatePercent: annualRate,
        defaultUsefulLifeMonths: Number(lifeInMonths) || 60,
        defaultResidualValuePercent: residualPercent,
        totalSalvageValue: totalSalvageValue !== '' ? Number(totalSalvageValue) : 0,
        minCapitalizationValue: minCapitalizationValue !== '' ? Number(minCapitalizationValue) : 0,
        subCategoryId: selectedSubCatId || ''
      };
      const result = await api.put(`/master-data/depreciation-policies/${encodeURIComponent(selectedId)}`, payload);
      if (!result?.success) throw new Error(result?.message || 'Could not save depreciation policy.');
      setCategories(previous => previous.map(category => category.id === selectedId ? result.category : category));
      setMessage({
        error: false,
        text: `${result.category.name} depreciation policy saved. ${result.booksUpdated ?? 0} unlocked asset books updated for future depreciation runs.`
      });
    } catch (error) {
      setMessage({ error: true, text: error.message || 'Could not save depreciation policy.' });
    } finally {
      setSaving(false);
    }
  };

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    const q = searchQuery.toLowerCase();
    return categories.filter(c =>
      (c.name && c.name.toLowerCase().includes(q)) ||
      (c.code && c.code.toLowerCase().includes(q))
    );
  }, [categories, searchQuery]);

  return (
    <div className="grid gap-5 lg:grid-cols-3">
      {/* Left 2 Cols: Form */}
      <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-[#6C2BD9]">
              <TrendingDown className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Category Depreciation Configuration</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Set depreciation methods, scrap salvage values, capitalization thresholds, and predefined useful life linked to sub-categories.
              </p>
            </div>
          </div>
        </div>

        {message && (
          <div className={`rounded-xl p-3.5 text-xs font-semibold flex items-center gap-2 ${
            message.error ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
          }`}>
            {message.error ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
            <span>{message.text}</span>
          </div>
        )}

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-500 flex flex-col items-center gap-2">
            <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
            Loading depreciation policies…
          </div>
        ) : categories.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500">
            No categories are registered yet. Add a category in the Categories tab before setting its depreciation policies.
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4 text-xs">
            {/* Top row: Category & Sub Category */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Asset Category *
                </label>
                <select
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 font-semibold text-slate-800 focus:border-[#6C2BD9] focus:outline-none"
                  value={selectedId}
                  onChange={event => {
                    setSelectedId(event.target.value);
                    setMessage(null);
                  }}
                >
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name} ({category.code})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1">Select the main asset category to configure.</p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Linked Sub Category
                </label>
                <select
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 font-semibold text-slate-800 focus:border-[#6C2BD9] focus:outline-none"
                  value={selectedSubCatId}
                  onChange={event => handleSubCategoryChange(event.target.value)}
                >
                  <option value="">-- None / Select Sub Category --</option>
                  {categorySubCategories.map(sc => (
                    <option key={sc.id} value={sc.id}>
                      {sc.name} ({sc.code}{sc.prefix ? ` · Prefix: ${sc.prefix}` : ''} · {sc.lifeInMonths || 60} mos)
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1">Supplies predefined useful life for this category.</p>
              </div>
            </div>

            {/* Row 2: Depreciation Method & Life in Months (Read-Only) */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Depreciation Method *
                </label>
                <select
                  value={method}
                  onChange={event => setMethod(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 font-semibold text-slate-800 focus:border-[#6C2BD9] focus:outline-none"
                >
                  {DEPRECIATION_METHODS.map(m => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  {DEPRECIATION_METHODS.find(m => m.value === method)?.desc || 'Depreciation accounting method'}
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-amber-600" />
                    Life in Months (Useful Life) *
                  </label>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                    🔒 Sub Category (Read-Only)
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    readOnly
                    disabled
                    value={lifeInMonths}
                    className="w-full rounded-xl border border-slate-200 bg-slate-100/80 px-3.5 py-2.5 font-bold text-slate-700 cursor-not-allowed select-none focus:outline-none"
                  />
                  <span className="absolute right-3.5 top-2.5 text-xs font-semibold text-slate-500">
                    {lifeInMonths ? `${lifeInMonths} mos (${(lifeInMonths / 12).toFixed(1)} yrs)` : '0 mos'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Predefined from Sub Category Master. Cannot be directly edited here.
                </p>
              </div>
            </div>

            {/* Row 3: Annual Depreciation Rate (%) & Residual Value (%) */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Annual Depreciation Rate (%) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0.01"
                    max="100"
                    step="0.01"
                    required
                    value={rate}
                    onChange={event => setRate(event.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 font-bold text-slate-800 focus:border-[#6C2BD9] focus:outline-none"
                    placeholder="e.g. 20.00"
                  />
                  <span className="absolute right-3.5 top-2.5 text-xs font-bold text-slate-400">%</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Annual rate applied for depreciation schedules (e.g. 20% for 5-year life).
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Residual Value (%) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="99.99"
                    step="0.01"
                    required
                    value={residual}
                    onChange={event => setResidual(event.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 font-bold text-slate-800 focus:border-[#6C2BD9] focus:outline-none"
                    placeholder="0"
                  />
                  <span className="absolute right-3.5 top-2.5 text-xs font-bold text-slate-400">%</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Default residual salvage percentage of purchase cost.
                </p>
              </div>
            </div>

            {/* Row 4: Total Salvage Value & Minimum Capitalization Value */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Total Salvage Value
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">Amt</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={totalSalvageValue}
                    onChange={event => setTotalSalvageValue(event.target.value)}
                    className="w-full pl-11 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-800 text-xs focus:border-[#6C2BD9] focus:outline-none"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Estimated fixed scrap / salvage recovery value at the end of asset useful life.
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700">
                    Minimum Capitalization Value
                  </label>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-50 text-[#6C2BD9] border border-purple-200">
                    Upcoming Phase
                  </span>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">Amt</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00 (e.g. 5000)"
                    value={minCapitalizationValue}
                    onChange={event => setMinCapitalizationValue(event.target.value)}
                    className="w-full pl-11 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-800 text-xs focus:border-[#6C2BD9] focus:outline-none"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Threshold below which asset purchases are expensed immediately rather than capitalized.
                </p>
              </div>
            </div>

            {/* Summary preview card */}
            <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-3.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-2">
                <Calculator className="w-3.5 h-3.5 text-[#6C2BD9]" />
                <span>Policy Summary Preview</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                <div className="bg-white p-2 rounded-lg border border-slate-100">
                  <span className="text-slate-400 block text-[10px]">Method</span>
                  <span className="font-bold text-slate-800">
                    {DEPRECIATION_METHODS.find(m => m.value === method)?.short || 'SLM'}
                  </span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-100">
                  <span className="text-slate-400 block text-[10px]">Predefined Life</span>
                  <span className="font-bold text-slate-800">
                    {lifeInMonths} mos ({((Number(lifeInMonths) || 60) / 12).toFixed(1)} yrs)
                  </span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-100">
                  <span className="text-slate-400 block text-[10px]">Depreciation Rate</span>
                  <span className="font-bold text-purple-700">{rate || '0'}% / yr</span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-100">
                  <span className="text-slate-400 block text-[10px]">Salvage / Min Cap</span>
                  <span className="font-bold text-slate-800">
                    {totalSalvageValue ? Number(totalSalvageValue).toLocaleString() : '0.00'} / {minCapitalizationValue ? Number(minCapitalizationValue).toLocaleString() : '0.00'}
                  </span>
                </div>
              </div>
            </div>

            {/* Submit button */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-[#6C2BD9] hover:bg-[#5821B0] px-6 py-2.5 font-bold text-white shadow-xs disabled:opacity-50 transition-colors flex items-center gap-2 cursor-pointer"
              >
                {saving ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Saving Policy…</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Save Configuration</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Right 1 Col: Configured Categories */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-3 text-xs flex flex-col h-full">
        <div>
          <h3 className="font-extrabold text-slate-900 text-sm">Configured Categories</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Click a category to view or update its policy.</p>
        </div>

        {/* Search filter */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search category name or code…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:border-[#6C2BD9] focus:outline-none"
          />
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[600px]">
          {filteredCategories.length === 0 ? (
            <div className="py-6 text-center text-slate-400 text-xs">
              No categories match your search.
            </div>
          ) : (
            filteredCategories.map(category => {
              const isSelected = selectedId === category.id;
              const methodObj = DEPRECIATION_METHODS.find(m => m.value === category.depreciationMethod);
              const methodBadge = methodObj ? methodObj.short : 'SLM';
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => {
                    setSelectedId(category.id);
                    setMessage(null);
                  }}
                  className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-purple-50/70 border-purple-300 ring-2 ring-purple-100 shadow-2xs'
                      : 'bg-white hover:bg-slate-50 border-slate-200/70'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="font-bold text-slate-900 truncate">
                      {category.name}
                    </span>
                    <span className="px-1.5 py-0.5 rounded font-mono font-bold text-[10px] bg-slate-100 text-slate-600">
                      {category.code}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                    <span className="px-2 py-0.5 rounded font-bold bg-purple-100/70 text-[#6C2BD9]">
                      {methodBadge}
                    </span>
                    <span className="px-2 py-0.5 rounded font-bold bg-slate-100 text-slate-700">
                      {category.annualDepreciationRatePercent != null ? `${category.annualDepreciationRatePercent}% / yr` : 'Rate unset'}
                    </span>
                    <span className="px-2 py-0.5 rounded font-medium bg-amber-50 text-amber-800 border border-amber-200/60">
                      {category.defaultUsefulLifeMonths || 60} mos
                    </span>
                  </div>

                  {(category.totalSalvageValue > 0 || category.minCapitalizationValue > 0) && (
                    <div className="flex items-center gap-2 mt-2 pt-1.5 border-t border-slate-100 text-[10px] text-slate-500 font-medium">
                      {category.totalSalvageValue > 0 && (
                        <span>Salvage: {Number(category.totalSalvageValue).toLocaleString()}</span>
                      )}
                      {category.minCapitalizationValue > 0 && (
                        <span>Min Cap: {Number(category.minCapitalizationValue).toLocaleString()}</span>
                      )}
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
