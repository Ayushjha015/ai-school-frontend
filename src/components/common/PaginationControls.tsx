import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationControlsProps {
  page: number;
  total: number;
  size: number;
  pages: number;
  onPageChange: (page: number) => void;
}

function getVisiblePages(page: number, totalPages: number) {
  const pages = new Set<number>([1, totalPages, page, page - 1, page + 1]);

  if (page <= 4) {
    [2, 3, 4, 5].forEach((item) => pages.add(item));
  }

  if (page >= totalPages - 3) {
    [totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1].forEach((item) => pages.add(item));
  }

  return [...pages]
    .filter((item) => item >= 1 && item <= totalPages)
    .sort((a, b) => a - b);
}

export function PaginationControls({ page, total, size, pages, onPageChange }: PaginationControlsProps) {
  const totalPages = Math.max(1, pages || Math.ceil(total / size));
  const visiblePages = getVisiblePages(page, totalPages);
  const shownCount = total === 0 ? 0 : Math.min(total, page * size);

  return (
    <div className="flex flex-wrap items-center justify-end gap-3 text-sm text-slate-600 dark:text-slate-400">
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="inline-flex items-center gap-1.5 rounded-full px-2 py-1.5 font-medium transition hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:text-slate-100"
      >
        <ChevronLeft className="h-4 w-4 shrink-0" aria-hidden />
        Previous
      </button>
      <div className="flex items-center gap-1.5">
        {visiblePages.map((pageNumber, index) => (
          <div key={pageNumber} className="flex items-center gap-1.5">
            {index > 0 && pageNumber - visiblePages[index - 1] > 1 ? <span className="px-1 text-slate-400">...</span> : null}
            <button
              type="button"
              onClick={() => onPageChange(pageNumber)}
              aria-current={pageNumber === page ? 'page' : undefined}
              className={`inline-flex h-8 min-w-8 items-center justify-center rounded-full px-2 text-sm font-semibold transition ${
                pageNumber === page
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100'
              }`}
            >
              {pageNumber}
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="inline-flex items-center gap-1.5 rounded-full px-2 py-1.5 font-medium transition hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:text-slate-100"
      >
        Next
        <ChevronRight className="h-4 w-4 shrink-0" aria-hidden />
      </button>
      <span className="ml-2 font-medium text-slate-600 dark:text-slate-400">
        Showing {shownCount} of {total} results
      </span>
    </div>
  );
}
