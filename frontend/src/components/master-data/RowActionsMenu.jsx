import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { MoreHorizontal } from 'lucide-react';
import clsx from 'clsx';

export function RowActionsMenu({
  isOpen,
  onToggle,
  onClose,
  children,
  className,
  menuClassName,
  widthClass = "w-48"
}) {
  const buttonRef = useRef(null);
  const menuRef = useRef(null);
  const [coords, setCoords] = useState(null);

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const updatePosition = () => {
        if (!buttonRef.current) return;
        const rect = buttonRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        const openUpwards = spaceBelow < 320 && spaceAbove > spaceBelow;

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

      const handlePointerDown = (e) => {
        if (buttonRef.current && buttonRef.current.contains(e.target)) {
          return;
        }
        if (menuRef.current && menuRef.current.contains(e.target)) {
          return;
        }
        if (onClose) onClose();
      };

      const handleKeyDown = (e) => {
        if (e.key === 'Escape' && onClose) {
          onClose();
        }
      };

      window.addEventListener('scroll', handleScrollOrResize, true);
      window.addEventListener('resize', handleScrollOrResize);
      document.addEventListener('mousedown', handlePointerDown);
      document.addEventListener('touchstart', handlePointerDown);
      document.addEventListener('keydown', handleKeyDown);

      return () => {
        window.removeEventListener('scroll', handleScrollOrResize, true);
        window.removeEventListener('resize', handleScrollOrResize);
        document.removeEventListener('mousedown', handlePointerDown);
        document.removeEventListener('touchstart', handlePointerDown);
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, onClose]);

  // Count valid rendered action children (ignoring null, undefined, false, and standalone dividers)
  const childArray = React.Children.toArray(children).filter(Boolean);
  const actionChildren = childArray.filter((child) => {
    if (React.isValidElement(child)) {
      const cls = child.props?.className || '';
      if (cls.includes('h-px') || cls.includes('border-t')) return false;
      return true;
    }
    return Boolean(child);
  });

  if (actionChildren.length === 0) {
    return null;
  }

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
          ref={menuRef}
          style={{
            position: 'fixed',
            top: coords.top,
            bottom: coords.bottom,
            right: coords.right,
            zIndex: 9999
          }}
          onClick={(e) => e.stopPropagation()}
          className={clsx(
            "fixed max-h-[calc(100vh-32px)] overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-xl text-left animate-in fade-in zoom-in-95 duration-100",
            widthClass,
            menuClassName || "p-1 space-y-0.5"
          )}
        >
          {children}
        </div>,
        document.body
      )}
    </>
  );
}
