import React from 'react';
import clsx from 'clsx';

export function Asset360Logo({ size = 'md', showText = true, className = '' }) {
  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-7 h-7',
    lg: 'w-9 h-9'
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl'
  };

  return (
    <div className={clsx('flex items-center gap-2 select-none shrink-0', className)}>
      {/* Infinity Symbol Logo */}
      <div className={clsx('flex items-center justify-center shrink-0 text-[#6c2bd9]', iconSizes[size])}>
        <svg
          viewBox="0 0 36 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <path
            d="M9 15C6.23858 15 4 12.7614 4 10C4 7.23858 6.23858 5 9 5C12.2 5 15 8 18 10C21 12 23.8 15 27 15C29.7614 15 32 12.7614 32 10C32 7.23858 29.7614 5 27 5C23.8 5 21 8 18 10C15 12 12.2 15 9 15Z"
            stroke="url(#purpleGradient)"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <defs>
            <linearGradient id="purpleGradient" x1="0" y1="0" x2="36" y2="20" gradientUnits="userSpaceOnUse">
              <stop stopColor="#6c2bd9" />
              <stop offset="1" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {showText && (
        <div className="flex items-center tracking-tight font-extrabold leading-none whitespace-nowrap">
          <span className={clsx(textSizes[size], 'font-extrabold text-slate-900')}>Asset</span>
          <span className={clsx(textSizes[size], 'font-black text-[#6c2bd9] ml-1')}>360°</span>
        </div>
      )}
    </div>
  );
}
