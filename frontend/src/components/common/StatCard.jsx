import React from 'react';
import clsx from 'clsx';

const COLOR_THEMES = {
  emerald: {
    topBorder: 'border-t-2 border-t-emerald-500',
    iconBg: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
    stroke: '#00c88c',
    trendClass: 'text-emerald-400 bg-emerald-500/10'
  },
  purple: {
    topBorder: 'border-t-2 border-t-purple-500',
    iconBg: 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
    stroke: '#a855f7',
    trendClass: 'text-purple-400 bg-purple-500/10'
  },
  orange: {
    topBorder: 'border-t-2 border-t-orange-500',
    iconBg: 'bg-orange-500/20 text-orange-400 border border-orange-500/30',
    stroke: '#ff5c28',
    trendClass: 'text-orange-400 bg-orange-500/10'
  },
  cyan: {
    topBorder: 'border-t-2 border-t-cyan-500',
    iconBg: 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30',
    stroke: '#06b6d4',
    trendClass: 'text-cyan-400 bg-cyan-500/10'
  },
  pink: {
    topBorder: 'border-t-2 border-t-pink-500',
    iconBg: 'bg-pink-500/20 text-pink-400 border border-pink-500/30',
    stroke: '#ec4899',
    trendClass: 'text-pink-400 bg-pink-500/10'
  },
  indigo: {
    topBorder: 'border-t-2 border-t-emerald-500',
    iconBg: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
    stroke: '#00c88c',
    trendClass: 'text-emerald-400 bg-emerald-500/10'
  },
  coral: {
    topBorder: 'border-t-2 border-t-orange-500',
    iconBg: 'bg-orange-500/20 text-orange-400 border border-orange-500/30',
    stroke: '#ff5c28',
    trendClass: 'text-orange-400 bg-orange-500/10'
  }
};

export function StatCard({ title, value, icon: Icon, trend, color = 'emerald', subtext }) {
  const theme = COLOR_THEMES[color] || COLOR_THEMES.emerald;

  return (
    <div className={clsx('glass-card flex flex-col justify-between relative overflow-hidden transition-all duration-200 hover:scale-[1.01]', theme.topBorder)}>
      <div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{title}</span>
          {Icon && (
            <div className={clsx('p-2.5 rounded-full flex items-center justify-center shadow-xs', theme.iconBg)}>
              <Icon className="w-4 h-4" />
            </div>
          )}
        </div>

        <div className="mt-3 flex items-baseline justify-between gap-2">
          <div className="text-2xl font-black text-slate-900 tracking-tight">{value}</div>
          {trend && (
            <span className={clsx('text-[11px] font-bold px-2 py-0.5 rounded-full border border-current/20', theme.trendClass)}>
              {trend}
            </span>
          )}
        </div>
        {subtext && <p className="text-xs text-slate-500 font-medium mt-1">{subtext}</p>}
      </div>

      {/* Decorative Wave Sparkline */}
      <div className="mt-3 -mb-5 -mx-5 h-10 overflow-hidden opacity-80 pointer-events-none">
        <svg className="w-full h-full" viewBox="0 0 200 40" preserveAspectRatio="none" fill="none">
          <defs>
            <linearGradient id={`grad-${color}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={theme.stroke} stopOpacity="0.35" />
              <stop offset="100%" stopColor={theme.stroke} stopOpacity="0.0" />
            </linearGradient>
          </defs>
          <path
            d="M0 28 Q 30 8, 60 22 T 120 12 T 180 24 T 200 18 L 200 40 L 0 40 Z"
            fill={`url(#grad-${color})`}
          />
          <path
            d="M0 28 Q 30 8, 60 22 T 120 12 T 180 24 T 200 18"
            stroke={theme.stroke}
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </div>
  );
}
