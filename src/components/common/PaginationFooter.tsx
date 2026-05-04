import { PaginationControls } from './PaginationControls';

interface PaginationFooterProps {
  page: number;
  total: number;
  size: number;
  pages: number;
  limit: number;
  options?: readonly number[];
  onLimitChange?: (limit: number) => void;
  onPageChange: (page: number) => void;
}

const defaultOptions = [10, 20, 50] as const;

export function PaginationFooter({
  page,
  total,
  size,
  pages,
  limit,
  options = defaultOptions,
  onLimitChange,
  onPageChange,
}: PaginationFooterProps) {
  return (
    <div className="mt-6 flex flex-col gap-3 border-t border-slate-200 pt-5 dark:border-slate-800 lg:flex-row lg:items-center lg:justify-between">
      {onLimitChange ? (
        <label className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
          Rows per page:
          <select
            value={limit}
            onChange={(event) => onLimitChange(Number(event.target.value))}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          >
            {options.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </label>
      ) : (
        <span />
      )}
      <div className="lg:min-w-0">
        <PaginationControls page={page} total={total} size={size} pages={pages} onPageChange={onPageChange} />
      </div>
    </div>
  );
}
