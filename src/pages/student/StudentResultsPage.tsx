import { useState } from 'react';
import { Link } from 'react-router-dom';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingScreen } from '../../components/common/LoadingScreen';
import { PaginationFooter } from '../../components/common/PaginationFooter';
import { SectionCard } from '../../components/common/SectionCard';
import { useStudentResultsQuery } from '../../hooks/useStudentQueries';
import { formatDateTime, formatPercentage } from '../../utils/formatters';
import { IconLabel, appIcons } from '../../utils/appIcons';

export function StudentResultsPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
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
        <p className="max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300">Review every submitted attempt, revisit detailed breakdowns, and move into leaderboard pages for completed exams.</p>

        {data.items.length === 0 ? (
          <div className="mt-6">
            <EmptyState title="No results available" description="Results will appear here after you complete and submit an exam." />
          </div>
        ) : (
          <>
            <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white/80 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-950/70">
              <div className="overflow-x-auto">
                <table className="min-w-[860px] w-full text-left text-sm">
                <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:bg-slate-900/80 dark:text-slate-400">
                  <tr>
                    <th className="px-5 py-4">S.No</th>
                    <th className="px-5 py-4">Exam</th>
                    <th className="px-5 py-4">Subject</th>
                    <th className="px-5 py-4">Score</th>
                    <th className="px-5 py-4">Percentage</th>
                    <th className="px-5 py-4">Generated at</th>
                    <th className="px-5 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {data.items.map((result, index) => {
                    const examLabel = result.examName ?? result.examTitle ?? `Attempt ${result.attemptId.slice(0, 8)}`;

                    return (
                      <tr key={result.attemptId} className="text-slate-700 transition hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-900/70">
                        <td className="px-5 py-4 text-xs font-semibold text-slate-400">{(page - 1) * data.size + index + 1}</td>
                        <td className="px-5 py-4">
                          <Link to={`/student/results/${result.attemptId}`} className="font-semibold text-slate-900 transition hover:text-emerald-600 dark:text-slate-100 dark:hover:text-emerald-300">{examLabel}</Link>
                        </td>
                        <td className="px-5 py-4">{result.subjectName ?? '—'}</td>
                        <td className="px-5 py-4 font-semibold">{result.score}</td>
                        <td className="px-5 py-4 font-semibold">{formatPercentage(result.percentage)}</td>
                        <td className="px-5 py-4 text-slate-600 dark:text-slate-400">{formatDateTime(result.generatedAt)}</td>
                        <td className="px-5 py-4 text-right">
                          <Link
                            to={`/student/results/${result.attemptId}`}
                            className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 dark:border-slate-700 dark:text-slate-200 dark:hover:border-slate-500"
                          >
                            <IconLabel label="View detail" icon={appIcons.Eye} />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                </table>
              </div>
            </div>
            <PaginationFooter
              page={page}
              total={data.total}
              size={data.size}
              pages={data.pages}
              limit={limit}
              onLimitChange={(nextLimit) => {
                setLimit(nextLimit);
                setPage(1);
              }}
              onPageChange={setPage}
            />
          </>
        )}
      </SectionCard>
    </div>
  );
}
