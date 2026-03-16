interface PaginationControlsProps {
  page: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
}

export function PaginationControls({ page, total, limit, onPageChange }: PaginationControlsProps) {
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
      <span>
        Page {page} of {totalPages}
      </span>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="rounded-full border border-slate-300 px-4 py-2 font-medium text-slate-700 transition hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Previous
        </button>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="rounded-full border border-slate-300 px-4 py-2 font-medium text-slate-700 transition hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}
