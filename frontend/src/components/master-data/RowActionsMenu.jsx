import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { MoreHorizontal } from 'lucide-react';
import clsx from 'clsx';

export function RowActionsMenu({
  isOpen,
  onToggle,
  onClose,
  children,
  className
}) {
  const buttonRef = useRef(null);
  const [coords, setCoords] = useState(null);

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const updatePosition = () => {
        if (!buttonRef.current) return;
        const rect = buttonRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        const openUpwards = spaceBelow < 220 && spaceAbove > 160;

        setCoords({
          openUpwards,
          top: openUpwards ? 'auto' : `${rect.bottom + 4}px`,
          bottom: openUpwards ? `${window.innerHeight - rect.top + 4}px` : 'auto',
          right: `${Math.max(8, window.innerWidth - rect.right)}px`
        });
      };

      updatePosition();

      const handleScrollOrResize = () => {
        if (onClose) onClose();
      };

      window.addEventListener('scroll', handleScrollOrResize, true);
      window.addEventListener('resize', handleScrollOrResize);

      return () => {
        window.removeEventListener('scroll', handleScrollOrResize, true);
        window.removeEventListener('resize', handleScrollOrResize);
      };
    }
  }, [isOpen, onClose]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        title="More Actions"
        className={className || "p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"}
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>

      {isOpen && coords && createPortal(
        <div
          style={{
            position: 'fixed',
            top: coords.top,
            bottom: coords.bottom,
            right: coords.right,
            zIndex: 9999
          }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-48 max-h-[calc(100vh-32px)] overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-xl p-1 text-left space-y-0.5 animate-in fade-in zoom-in-95 duration-100"
        >
          {children}
        </div>,
        document.body
      )}
    </>
  );
}
