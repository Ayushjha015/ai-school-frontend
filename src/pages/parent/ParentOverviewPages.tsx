import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { getChildExams, getChildResults, getLinkedChildren } from '../../api/parentService';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingScreen } from '../../components/common/LoadingScreen';
import { SectionCard } from '../../components/common/SectionCard';
import { StatCard } from '../../components/common/StatCard';
import { useChildExamsQuery, useChildResultsQuery, useLinkedChildrenQuery } from '../../hooks/useParentQueries';
import { formatPercentage } from '../../utils/formatters';

function ChildSummaryCard({ childId, name, averagePercentage, upcomingCount, completedCount }: { childId: string; name: string; averagePercentage: number; upcomingCount: number; completedCount: number }) {
  return (
    <Link to={`/parent/children/${childId}`} className="rounded-3xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Child overview</p>
      <h2 className="mt-3 text-xl font-semibold text-slate-900">{name}</h2>
      <div className="mt-5 grid grid-cols-3 gap-3 text-center text-sm">
        <div className="rounded-2xl bg-slate-50 p-3">
          <p className="font-semibold text-slate-900">{formatPercentage(averagePercentage)}</p>
          <p className="mt-1 text-slate-500">Average</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-3">
          <p className="font-semibold text-slate-900">{upcomingCount}</p>
          <p className="mt-1 text-slate-500">Upcoming</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-3">
          <p className="font-semibold text-slate-900">{completedCount}</p>
          <p className="mt-1 text-slate-500">Completed</p>
        </div>
      </div>
    </Link>
  );
}

export function ParentDashboardPage() {
  const summaryQuery = useQuery({
    queryKey: ['parent', 'dashboard-summary'],
    queryFn: async () => {
      const children = await getLinkedChildren();
      const summaries = await Promise.all(
        children.map(async (child) => {
          const [exams, results] = await Promise.all([getChildExams(child.userId), getChildResults(child.userId)]);
          return {
            child,
            exams,
            results,
          };
        }),
      );
      return summaries;
    },
  });

  if (summaryQuery.isLoading) {
    return <LoadingScreen label="Loading parent dashboard..." />;
  }

  if (summaryQuery.isError || !summaryQuery.data) {
    return <div className="rounded-[28px] border border-rose-200 bg-rose-50 p-8 text-rose-700">We could not load the parent dashboard right now.</div>;
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] border border-white/70 bg-slate-950 px-6 py-7 text-white shadow-2xl shadow-slate-900/15 sm:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-300">Parent dashboard</p>
        <h1 className="mt-4 text-3xl font-semibold sm:text-4xl">Track every linked child’s exam schedule, results, and progress.</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">This dashboard gives you a quick snapshot of all linked children, then lets you drill into each child’s exams, results, and analytics without changing the student workspace.</p>
      </section>

      <SectionCard title="Children overview" eyebrow="Linked students">
        {summaryQuery.data.length === 0 ? (
          <EmptyState title="No linked children" description="A linked student profile is required before parent pages can show progress data." />
        ) : (
          <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {summaryQuery.data.map(({ child, exams, results }) => (
              <ChildSummaryCard
                key={child.userId}
                childId={child.userId}
                name={child.fullName}
                averagePercentage={results.averagePercentage}
                upcomingCount={exams.upcoming.length}
                completedCount={exams.completed.length}
              />
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}

export function ParentChildrenPage() {
  const { data, isLoading, isError } = useLinkedChildrenQuery();

  if (isLoading) {
    return <LoadingScreen label="Loading linked children..." />;
  }

  if (isError || !data) {
    return <div className="rounded-[28px] border border-rose-200 bg-rose-50 p-8 text-rose-700">We could not load your linked children.</div>;
  }

  return (
    <SectionCard title="My children" eyebrow="Linked student roster">
      {data.length === 0 ? (
        <EmptyState title="No children linked" description="Linked student records will appear here once a child account is connected." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.map((child) => (
            <Link key={child.userId} to={`/parent/children/${child.userId}`} className="rounded-3xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg">
              <h2 className="text-lg font-semibold text-slate-900">{child.fullName}</h2>
              <p className="mt-2 text-sm text-slate-600">{child.email}</p>
              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Roll number: {child.rollNumber || 'Not set'}</p>
            </Link>
          ))}
        </div>
      )}
    </SectionCard>
  );
}

export function ParentChildOverviewPage() {
  const { studentUserId = '' } = useParams();
  const examsQuery = useChildExamsQuery(studentUserId);
  const resultsQuery = useChildResultsQuery(studentUserId);

  if (examsQuery.isLoading || resultsQuery.isLoading) {
    return <LoadingScreen label="Loading child overview..." />;
  }

  if (examsQuery.isError || resultsQuery.isError || !examsQuery.data || !resultsQuery.data) {
    return <div className="rounded-[28px] border border-rose-200 bg-rose-50 p-8 text-rose-700">We could not load this child overview.</div>;
  }

  return (
    <div className="space-y-6">
      <SectionCard title={resultsQuery.data.fullName} eyebrow="Child overview">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Average percentage" value={formatPercentage(resultsQuery.data.averagePercentage)} helper="Across completed exams." accent="emerald" />
          <StatCard label="Total attempts" value={resultsQuery.data.totalExamsAttempted} helper="Completed attempts on record." accent="blue" />
          <StatCard label="Upcoming exams" value={examsQuery.data.upcoming.length} helper="Scheduled and not yet taken." accent="amber" />
          <StatCard label="Missed exams" value={examsQuery.data.missed.length} helper="Expired without completion." accent="slate" />
        </div>
      </SectionCard>

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard title="Exam status" eyebrow="Quick drill-in">
          <div className="space-y-3 text-sm text-slate-700">
            <Link to={`/parent/children/${studentUserId}/exams`} className="block rounded-3xl border border-slate-200 bg-white p-4">Open child exams</Link>
            <Link to={`/parent/children/${studentUserId}/results`} className="block rounded-3xl border border-slate-200 bg-white p-4">Open child results</Link>
            <Link to={`/parent/children/${studentUserId}/analytics`} className="block rounded-3xl border border-slate-200 bg-white p-4">Open child analytics</Link>
          </div>
        </SectionCard>
        <SectionCard title="Recent results" eyebrow="Latest outcomes">
          {resultsQuery.data.results.length === 0 ? (
            <EmptyState title="No results yet" description="Completed child results will appear here." />
          ) : (
            <div className="space-y-3">
              {resultsQuery.data.results.slice(0, 4).map((result) => (
                <Link key={result.attemptId} to={`/parent/children/${studentUserId}/results/${result.attemptId}`} className="block rounded-3xl border border-slate-200 bg-white p-4">
                  <p className="text-base font-semibold text-slate-900">{result.examTitle}</p>
                  <p className="mt-1 text-sm text-slate-600">{formatPercentage(result.percentage)} • Score {result.score}</p>
                </Link>
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}

