import React, { useState, useEffect } from 'react';
import { getCachedPrefix, fetchCodePrefixes, subscribePrefixes } from '../../services/codePrefixService';

/**
 * MasterCodeInput
 * Displays a fixed prefix add-on box (e.g. [ DEP- ] or [ DSP- ]) directly attached to the input.
 * - If user types a suffix (e.g. 101), onChange returns the full code (e.g. DSP-101).
 * - If user leaves it blank (or clears it), onChange returns '' so backend autogenerates the next number.
 * - Strips duplicate prefix if typed or pasted.
 * - Reacts reactively to prefix configuration changes in real time.
 */
export function MasterCodeInput({
  entityKey,
  prefix: propPrefix,
  value = '',
  onChange,
  disabled = false,
  placeholder = 'e.g. 001',
  className = '',
  required = false
}) {
  const [activePrefix, setActivePrefix] = useState(() => propPrefix || getCachedPrefix(entityKey));

  useEffect(() => {
    if (propPrefix) {
      setActivePrefix(propPrefix);
      return;
    }

    // Immediately sync with currently cached/stored prefix
    setActivePrefix(getCachedPrefix(entityKey));

    // Ensure backend prefixes are fetched/refreshed
    fetchCodePrefixes().then(() => {
      setActivePrefix(getCachedPrefix(entityKey));
    });

    const unsubscribe = subscribePrefixes(() => {
      setActivePrefix(getCachedPrefix(entityKey));
    });

    const handleCustomEvent = () => {
      setActivePrefix(getCachedPrefix(entityKey));
    };

    window.addEventListener('fams_master_prefixes_changed', handleCustomEvent);
    window.addEventListener('storage', handleCustomEvent);

    return () => {
      unsubscribe();
      window.removeEventListener('fams_master_prefixes_changed', handleCustomEvent);
      window.removeEventListener('storage', handleCustomEvent);
    };
  }, [entityKey, propPrefix]);

  const prefix = activePrefix || 'CODE-';
  const rawValue = String(value || '');

  // For disabled existing records, reflect the record's existing prefix convention if present
  let effectivePrefix = prefix;
  let displayValue = rawValue;

  if (disabled && rawValue) {
    const hyphenIdx = rawValue.lastIndexOf('-');
    if (hyphenIdx > 0) {
      effectivePrefix = rawValue.slice(0, hyphenIdx + 1);
      displayValue = rawValue.slice(hyphenIdx + 1);
    }
  } else {
    displayValue = rawValue.toUpperCase().startsWith(prefix.toUpperCase())
      ? rawValue.slice(prefix.length)
      : rawValue;
  }

  const handleInputChange = (e) => {
    if (!onChange) return;
    const typed = e.target.value.toUpperCase().replace(/\s+/g, '');
    if (!typed) {
      onChange('');
    } else {
      // Strip prefix if user accidentally typed or pasted it
      const cleanSuffix = typed.startsWith(prefix.toUpperCase())
        ? typed.slice(prefix.length)
        : typed;
      onChange(cleanSuffix ? `${prefix}${cleanSuffix}` : '');
    }
  };

  return (
    <div
      className={`flex items-stretch rounded-xl border border-slate-200 overflow-hidden transition-all shadow-2xs ${className} ${
        disabled
          ? 'bg-slate-100 border-slate-200 cursor-not-allowed opacity-80'
          : 'focus-within:border-[#6C2BD9] focus-within:ring-2 focus-within:ring-[#6C2BD9]/20 bg-white'
      }`}
    >
      {/* Fixed Prefix Add-on */}
      <div
        className={`px-3 py-2 text-xs font-mono font-bold flex items-center select-none border-r border-slate-200 shrink-0 ${
          disabled ? 'bg-slate-200 text-slate-500' : 'bg-purple-50 text-[#6C2BD9]'
        }`}
        title={`Prefix: ${effectivePrefix}`}
      >
        {effectivePrefix}
      </div>

      {/* Custom Suffix Input */}
      <input
        type="text"
        disabled={disabled}
        value={displayValue}
        onChange={handleInputChange}
        placeholder={disabled ? '' : placeholder}
        required={required}
        className={`w-full px-3 py-2 font-mono text-xs focus:outline-none uppercase ${
          disabled
            ? 'bg-slate-100 text-slate-500 cursor-not-allowed'
            : 'bg-transparent text-slate-900 placeholder:text-slate-400'
        }`}
      />
    </div>
  );
}

export default MasterCodeInput;
