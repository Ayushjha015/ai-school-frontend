import { Link } from 'react-router-dom';
import { EmptyState } from '../../components/common/EmptyState';
import { SectionCard } from '../../components/common/SectionCard';
import { StatCard } from '../../components/common/StatCard';
import { TopicBarList } from '../../components/common/TopicBarList';
import { LoadingScreen } from '../../components/common/LoadingScreen';
import { useStudentExamsQuery, useStudentSummaryQuery } from '../../hooks/useStudentQueries';
import { useAuthStore } from '../../store/authStore';
import { formatDateTime, formatPercentage, formatRelativeWindow } from '../../utils/formatters';
import { IconLabel, appIcons } from '../../utils/appIcons';

export function StudentDashboardPage() {
  const user = useAuthStore((state) => state.user);
  const liveExamsQuery = useStudentExamsQuery('live', 1, 4);
  const upcomingExamsQuery = useStudentExamsQuery('upcoming', 1, 4);
  const summaryQuery = useStudentSummaryQuery(user?.id);

  if (liveExamsQuery.isLoading || upcomingExamsQuery.isLoading || summaryQuery.isLoading) {
    return <LoadingScreen label="Loading your dashboard..." />;
  }

  if (liveExamsQuery.isError || upcomingExamsQuery.isError || summaryQuery.isError) {
    return (
      <div className="rounded-[28px] border border-rose-200 bg-rose-50 p-6 text-rose-700 sm:p-8">
        We could not load the dashboard right now. Please refresh or try again shortly.
      </div>
    );
  }

  const liveExams = liveExamsQuery.data?.items ?? [];
  const upcomingExams = upcomingExamsQuery.data?.items ?? [];
  const summary = summaryQuery.data;
  const recentResults = summary?.results.slice(0, 3) ?? [];

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Live exams" value={liveExamsQuery.data?.total ?? 0} helper="These can be started right now." accent="emerald" />
        <StatCard label="Upcoming exams" value={upcomingExamsQuery.data?.total ?? 0} helper="Scheduled and waiting for their start window." accent="blue" />
        <StatCard label="Total attempts" value={summary?.totalExamsAttempted ?? 0} helper="Historical submissions completed by you." accent="amber" />
        <StatCard label="Average score" value={summary?.avgPercentage ?? 0} helper="Calculated from your completed results." accent="slate" />
      </div>

      <div className="grid gap-4 sm:gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <SectionCard
          title="Live exams"
          eyebrow="Act now"
          action={<Link className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-slate-950" to="/student/exams"><appIcons.Eye className="h-4 w-4" aria-hidden />View all exams</Link>}
        >
          {liveExams.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {liveExams.map((exam) => (
                <Link key={exam.id} to={`/student/exams/${exam.id}`} className="rounded-3xl border border-emerald-200 bg-emerald-50/70 p-5 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-100">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span className="rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white">Live</span>
                    <span className="text-xs font-medium text-emerald-700">Pass mark {exam.passPercentage}%</span>
                  </div>
                  <h3 className="mt-4 text-xl font-semibold text-slate-900">{exam.title}</h3>
                  <p className="mt-1 text-sm font-semibold text-emerald-700">{exam.subjectName}</p>
                  <p className="mt-2 text-sm text-slate-600">{formatRelativeWindow(exam.startTime, exam.endTime)}</p>
                  <div className="mt-5 flex items-center justify-between gap-3 text-sm text-slate-700">
                    <span>{exam.timeLimitMinutes ? `${exam.timeLimitMinutes} min` : 'No time limit'}</span>
                    <span className="font-semibold"><IconLabel label="Start now" icon={appIcons.Send} /></span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState title="No live exams" description="You do not have an active exam window right now. Upcoming exams will appear below." />
          )}
        </SectionCard>

        <SectionCard title="Upcoming" eyebrow="Plan ahead">
          {upcomingExams.length > 0 ? (
            <div className="space-y-4">
              {upcomingExams.map((exam) => (
                <div key={exam.id} className="rounded-3xl border border-slate-200 bg-slate-50/70 p-4">
                  <p className="text-sm font-semibold text-slate-900">{exam.title}</p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{exam.subjectName}</p>
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
          action={<Link className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-slate-950" to="/student/results"><appIcons.Eye className="h-4 w-4" aria-hidden />Open result history</Link>}
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
                    <p className="mt-1 inline-flex items-center gap-2 text-sm text-slate-600"><appIcons.CalendarClock className="h-4 w-4" aria-hidden />Submitted {formatDateTime(result.submittedAt)}</p>
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
