import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';

export interface PaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  itemLabel?: string;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
  itemLabel = 'data',
  className = ''
}) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);

  const startItem = totalItems === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const endItem = Math.min(safePage * pageSize, totalItems);

  // Generate page numbers with ellipses for long lists
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (safePage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (safePage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', safePage - 1, safePage, safePage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  const handlePageClick = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== safePage) {
      onPageChange(page);
    }
  };

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 select-none ${className}`}
    >
      {/* Left side: Item count summary & Page Size Selector */}
      <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
        <div className="text-slate-500 dark:text-slate-400">
          Menampilkan{' '}
          <span className="font-bold text-slate-800 dark:text-slate-200">
            {totalItems === 0 ? '0' : `${startItem}–${endItem}`}
          </span>{' '}
          dari{' '}
          <span className="font-bold text-slate-800 dark:text-slate-200">
            {totalItems.toLocaleString('id-ID')}
          </span>{' '}
          {itemLabel}
        </div>

        {onPageSizeChange && (
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-400">Tampilkan:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                const newSize = Number(e.target.value);
                onPageSizeChange(newSize);
                onPageChange(1); // Reset to page 1 on page size change
              }}
              className="px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer text-xs"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt} / hal
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Right side: Navigation buttons */}
      <div className="flex items-center gap-1">
        {/* First Page */}
        <button
          onClick={() => handlePageClick(1)}
          disabled={safePage <= 1}
          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          title="Halaman Pertama"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>

        {/* Previous Page */}
        <button
          onClick={() => handlePageClick(safePage - 1)}
          disabled={safePage <= 1}
          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          title="Halaman Sebelumnya"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Numeric page buttons */}
        <div className="hidden sm:flex items-center gap-1">
          {getPageNumbers().map((item, idx) => {
            if (typeof item === 'string') {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="px-2 py-1 text-slate-400 select-none font-bold"
                >
                  •••
                </span>
              );
            }

            const isCurrent = item === safePage;
            return (
              <button
                key={`page-${item}`}
                onClick={() => handlePageClick(item)}
                className={`min-w-[32px] h-8 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {item}
              </button>
            );
          })}
        </div>

        {/* Mobile Page indicator */}
        <div className="sm:hidden px-2 text-xs font-bold text-slate-700 dark:text-slate-300">
          Hal. {safePage} / {totalPages}
        </div>

        {/* Next Page */}
        <button
          onClick={() => handlePageClick(safePage + 1)}
          disabled={safePage >= totalPages}
          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          title="Halaman Selanjutnya"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Last Page */}
        <button
          onClick={() => handlePageClick(totalPages)}
          disabled={safePage >= totalPages}
          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          title="Halaman Terakhir"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
