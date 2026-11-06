import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import clsx from 'clsx';

/**
 * Reusable hook for client-side pagination across master data tables.
 */
export function usePagination(items = [], initialPageSize = 10) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  // Reset to page 1 if current page exceeds total pages due to filtering/searching
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, currentPage, pageSize]);

  const startIndex = (currentPage - 1) * pageSize;

  return {
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalItems,
    totalPages,
    paginatedItems,
    startIndex
  };
}

/**
 * Reusable pagination bar component matching the enterprise UI theme.
 */
export function MasterDataPagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize = 10,
  onPageChange
}) {
  if (totalItems === 0) {
    return (
      <div className="p-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 bg-slate-50/20">
        <span className="font-medium text-slate-600">Showing 0 records</span>
      </div>
    );
  }

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(totalItems, currentPage * pageSize);

  // Generate page pills with ellipsis
  const getPageNumbers = () => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 3) {
      return [1, 2, 3, 4, '...', totalPages];
    }
    if (currentPage >= totalPages - 2) {
      return [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  };

  const pages = getPageNumbers();

  return (
    <div className="p-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs bg-slate-50/30">
      <div className="font-medium text-slate-600">
        Showing <span className="font-bold text-slate-800">{startItem}</span> to{' '}
        <span className="font-bold text-slate-800">{endItem}</span> of{' '}
        <span className="font-bold text-[#6C2BD9]">{totalItems}</span> records
      </div>

      <div className="flex items-center gap-1">
        {/* Previous Page Button */}
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className={clsx(
            'p-1.5 rounded-lg border transition-all flex items-center justify-center',
            currentPage === 1
              ? 'border-slate-200 text-slate-300 cursor-not-allowed bg-slate-50'
              : 'border-slate-200 bg-white text-slate-600 hover:text-[#6C2BD9] hover:border-purple-200 hover:bg-purple-50/60 shadow-2xs cursor-pointer'
          )}
          title="Previous Page"
          aria-label="Previous Page"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1 px-1">
          {pages.map((p, idx) => {
            if (p === '...') {
              return (
                <span key={`ellipsis-${idx}`} className="px-1.5 text-slate-400 select-none">
                  •••
                </span>
              );
            }
            const isActive = p === currentPage;
            return (
              <button
                key={`page-${p}`}
                type="button"
                onClick={() => onPageChange(p)}
                className={clsx(
                  'min-w-[28px] h-7 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center cursor-pointer',
                  isActive
                    ? 'bg-[#6C2BD9] text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-purple-50/60 hover:text-[#6C2BD9] hover:border-purple-200 shadow-2xs'
                )}
              >
                {p}
              </button>
            );
          })}
        </div>

        {/* Next Page Button */}
        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className={clsx(
            'p-1.5 rounded-lg border transition-all flex items-center justify-center',
            currentPage === totalPages
              ? 'border-slate-200 text-slate-300 cursor-not-allowed bg-slate-50'
              : 'border-slate-200 bg-white text-slate-600 hover:text-[#6C2BD9] hover:border-purple-200 hover:bg-purple-50/60 shadow-2xs cursor-pointer'
          )}
          title="Next Page"
          aria-label="Next Page"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

