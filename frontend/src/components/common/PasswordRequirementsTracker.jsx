import React, { useMemo, useEffect } from 'react';
import { CheckCircle2, XCircle, ShieldAlert, ShieldCheck } from 'lucide-react';

export const DEFAULT_FRONTEND_POLICY = {
  minLength: 8,
  maxLength: 32,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecialChar: true,
  preventSpaces: true
};

export function PasswordRequirementsTracker({
  password = '',
  policy = DEFAULT_FRONTEND_POLICY,
  onValidityChange,
  showSummaryBadge = true
}) {
  const currentPolicy = policy || DEFAULT_FRONTEND_POLICY;
  const pass = String(password || '');

  const rules = useMemo(() => {
    const min = Math.max(Number(currentPolicy.minLength) || 8, 4);
    const max = currentPolicy.maxLength ? Number(currentPolicy.maxLength) : 128;

    return [
      {
        id: 'min_length',
        label: `Minimum ${min} characters`,
        met: pass.length >= min,
        active: true
      },
      {
        id: 'max_length',
        label: `Maximum ${max} characters`,
        met: pass.length <= max,
        active: Boolean(currentPolicy.maxLength)
      },
      {
        id: 'require_uppercase',
        label: 'At least one uppercase letter (A–Z)',
        met: /[A-Z]/.test(pass),
        active: Boolean(currentPolicy.requireUppercase)
      },
      {
        id: 'require_lowercase',
        label: 'At least one lowercase letter (a–z)',
        met: /[a-z]/.test(pass),
        active: Boolean(currentPolicy.requireLowercase)
      },
      {
        id: 'require_number',
        label: 'At least one number (0–9)',
        met: /\d/.test(pass),
        active: Boolean(currentPolicy.requireNumber)
      },
      {
        id: 'require_special_char',
        label: 'At least one special character (!@#$%)',
        met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pass),
        active: Boolean(currentPolicy.requireSpecialChar)
      },
      {
        id: 'prevent_spaces',
        label: 'Prevent spaces',
        met: !/\s/.test(pass),
        active: Boolean(currentPolicy.preventSpaces)
      }
    ].filter(r => r.active);
  }, [pass, currentPolicy]);

  const activeRules = rules;
  const satisfiedCount = activeRules.filter(r => r.met).length;
  const isAllValid = activeRules.length > 0 && satisfiedCount === activeRules.length;

  useEffect(() => {
    if (typeof onValidityChange === 'function') {
      onValidityChange(isAllValid);
    }
  }, [isAllValid, onValidityChange]);

  if (!pass && !showSummaryBadge) {
    return null;
  }

  return (
    <div className="mt-2.5 p-3 bg-slate-50 border border-slate-200/90 rounded-xl space-y-2 text-xs transition-all">
      {showSummaryBadge && (
        <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
          <div className="flex items-center gap-1.5 font-bold text-slate-700 text-[11px]">
            {isAllValid ? (
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
            )}
            <span>Password Requirements</span>
          </div>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
              isAllValid
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                : pass
                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                : 'bg-slate-200 text-slate-600'
            }`}
          >
            {isAllValid ? 'Satisfied' : 'Not satisfied'}
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-0.5">
        {activeRules.map((rule) => {
          const isSatisfied = rule.met;
          return (
            <div
              key={rule.id}
              className={`flex items-center gap-2 py-0.5 px-1 rounded transition-colors ${
                isSatisfied
                  ? 'text-emerald-700 font-medium'
                  : pass
                  ? 'text-slate-500'
                  : 'text-slate-400'
              }`}
            >
              {isSatisfied ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              ) : (
                <XCircle className="w-3.5 h-3.5 text-slate-300 shrink-0" />
              )}
              <span className="text-[11px] leading-tight">{rule.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default PasswordRequirementsTracker;
