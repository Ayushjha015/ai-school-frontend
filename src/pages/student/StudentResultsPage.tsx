import { useState } from 'react';
import { Link } from 'react-router-dom';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingScreen } from '../../components/common/LoadingScreen';
import { PaginationControls } from '../../components/common/PaginationControls';
import { SectionCard } from '../../components/common/SectionCard';
import { useStudentResultsQuery } from '../../hooks/useStudentQueries';
import { formatDateTime, formatPercentage } from '../../utils/formatters';

export function StudentResultsPage() {
  const [page, setPage] = useState(1);
  const limit = 8;
  const { data, isLoading, isError } = useStudentResultsQuery(page, limit);

  if (isLoading) {
    return <LoadingScreen label="Loading your results..." />;
  }

  if (isError || !data) {
    return <div className="rounded-[28px] border border-rose-200 bg-rose-50 p-8 text-rose-700">We could not load your result history.</div>;
  }

  return (
    <div className="space-y-6">
      <SectionCard title="My results" eyebrow="Result history">
        <p className="max-w-2xl text-sm leading-7 text-slate-600">Review every submitted attempt, revisit detailed breakdowns, and move into leaderboard pages for completed exams.</p>
      </SectionCard>

      {data.items.length === 0 ? (
        <EmptyState title="No results available" description="Results will appear here after you complete and submit an exam." />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {data.items.map((result) => (
            <Link key={result.attemptId} to={`/student/results/${result.attemptId}`} className="rounded-3xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-lg font-semibold text-slate-900">{result.examTitle || `Attempt ${result.attemptId.slice(0, 8)}`}</p>
                  <p className="mt-2 text-sm text-slate-600">Generated {formatDateTime(result.generatedAt)}</p>
                </div>
                <div className="rounded-2xl bg-slate-950 px-4 py-3 text-right text-white">
                  <p className="text-xl font-semibold">{formatPercentage(result.percentage)}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-300">{result.score} points</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <PaginationControls page={page} total={data.total} limit={data.limit} onPageChange={setPage} />
    </div>
  );
}
