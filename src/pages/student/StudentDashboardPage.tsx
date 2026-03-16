import { Link } from 'react-router-dom';
import { EmptyState } from '../../components/common/EmptyState';
import { SectionCard } from '../../components/common/SectionCard';
import { StatCard } from '../../components/common/StatCard';
import { TopicBarList } from '../../components/common/TopicBarList';
import { LoadingScreen } from '../../components/common/LoadingScreen';
import { useStudentExamsQuery, useStudentSummaryQuery } from '../../hooks/useStudentQueries';
import { useAuthStore } from '../../store/authStore';
import { formatDateTime, formatPercentage, formatRelativeWindow } from '../../utils/formatters';

export function StudentDashboardPage() {
  const user = useAuthStore((state) => state.user);
  const examsQuery = useStudentExamsQuery();
  const summaryQuery = useStudentSummaryQuery(user?.id);

  if (examsQuery.isLoading || summaryQuery.isLoading) {
    return <LoadingScreen label="Loading your dashboard..." />;
  }

  if (examsQuery.isError || summaryQuery.isError) {
    return (
      <div className="rounded-[28px] border border-rose-200 bg-rose-50 p-6 text-rose-700 sm:p-8">
        We could not load the dashboard right now. Please refresh or try again shortly.
      </div>
    );
  }

  const exams = examsQuery.data;
  const summary = summaryQuery.data;
  const recentResults = summary?.results.slice(0, 3) ?? [];

  return (
    <div className="space-y-4 sm:space-y-6">
      <section className="rounded-[28px] border border-white/70 bg-slate-950 px-5 py-6 text-white shadow-2xl shadow-slate-900/15 sm:rounded-[32px] sm:px-8 sm:py-7">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-300">Student dashboard</p>
        <div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <h1 className="text-2xl font-semibold leading-tight sm:text-4xl">Stay on top of every exam window, result, and alert.</h1>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              Your dashboard is polling for live exams, tracking recent performance, and surfacing the topics that need attention.
            </p>
          </div>
          <div className="max-w-full rounded-3xl bg-white/8 px-5 py-4 text-sm text-slate-200">
            <p className="font-semibold text-white">Signed in as</p>
            <p className="mt-1">{user?.name}</p>
            <p className="break-words text-slate-400 [overflow-wrap:anywhere]">{user?.email}</p>
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Live exams" value={exams?.live.length ?? 0} helper="These can be started right now." accent="emerald" />
        <StatCard label="Upcoming exams" value={exams?.upcoming.length ?? 0} helper="Scheduled and waiting for their start window." accent="blue" />
        <StatCard label="Total attempts" value={summary?.totalExamsAttempted ?? 0} helper="Historical submissions completed by you." accent="amber" />
        <StatCard label="Average score" value={summary?.avgPercentage ?? 0} helper="Calculated from your completed results." accent="slate" />
      </div>

      <div className="grid gap-4 sm:gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <SectionCard
          title="Live exams"
          eyebrow="Act now"
          action={<Link className="text-sm font-semibold text-slate-700 hover:text-slate-950" to="/student/exams">View all exams</Link>}
        >
          {exams && exams.live.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {exams.live.map((exam) => (
                <Link key={exam.id} to={`/student/exams/${exam.id}`} className="rounded-3xl border border-emerald-200 bg-emerald-50/70 p-5 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-100">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span className="rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white">Live</span>
                    <span className="text-xs font-medium text-emerald-700">Pass mark {exam.passPercentage}%</span>
                  </div>
                  <h3 className="mt-4 text-xl font-semibold text-slate-900">{exam.title}</h3>
                  <p className="mt-2 text-sm text-slate-600">{formatRelativeWindow(exam.startTime, exam.endTime)}</p>
                  <div className="mt-5 flex items-center justify-between gap-3 text-sm text-slate-700">
                    <span>{exam.timeLimitMinutes ? `${exam.timeLimitMinutes} min` : 'No time limit'}</span>
                    <span className="font-semibold">Start now</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState title="No live exams" description="You do not have an active exam window right now. Upcoming exams will appear below." />
          )}
        </SectionCard>

        <SectionCard title="Upcoming" eyebrow="Plan ahead">
          {exams && exams.upcoming.length > 0 ? (
            <div className="space-y-4">
              {exams.upcoming.slice(0, 4).map((exam) => (
                <div key={exam.id} className="rounded-3xl border border-slate-200 bg-slate-50/70 p-4">
                  <p className="text-sm font-semibold text-slate-900">{exam.title}</p>
                  <p className="mt-1 text-sm text-slate-600">{formatRelativeWindow(exam.startTime, exam.endTime)}</p>
                  <p className="mt-3 text-xs font-medium uppercase tracking-[0.18em] text-slate-500">{exam.timeLimitMinutes ? `${exam.timeLimitMinutes} minutes` : 'Flexible timing'}</p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No upcoming exams" description="You are fully caught up right now." />
          )}
        </SectionCard>
      </div>

      <div className="grid gap-4 sm:gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <SectionCard
          title="Recent results"
          eyebrow="Performance"
          action={<Link className="text-sm font-semibold text-slate-700 hover:text-slate-950" to="/student/results">Open result history</Link>}
        >
          {recentResults.length > 0 ? (
            <div className="space-y-4">
              {recentResults.map((result) => (
                <Link
                  key={`${result.examId}-${result.submittedAt ?? result.examTitle}`}
                  to={`/student/exams/${result.examId}/leaderboard`}
                  className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-4 transition hover:border-slate-300 hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-base font-semibold text-slate-900">{result.examTitle}</p>
                    <p className="mt-1 text-sm text-slate-600">Submitted {formatDateTime(result.submittedAt)}</p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-2xl font-semibold text-slate-900">{formatPercentage(result.percentage)}</p>
                    <p className={`mt-1 text-sm font-medium ${result.passed ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {result.passed ? 'Passed' : 'Needs improvement'}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState title="No results yet" description="Once you complete an exam, your score and topic breakdown will appear here." />
          )}
        </SectionCard>

        <SectionCard title="Topic trends" eyebrow="Analytics snapshot">
          <div className="space-y-5">
            <TopicBarList title="Strongest topics" items={summary?.strongestTopics ?? []} emptyLabel="No topic strengths yet. Finish an exam to unlock this view." />
            <TopicBarList title="Weakest topics" items={summary?.weakestTopics ?? []} emptyLabel="No weak-topic analysis yet. We'll surface it after a graded attempt." />
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
