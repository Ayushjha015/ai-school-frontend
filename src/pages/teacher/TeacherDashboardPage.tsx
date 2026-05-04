import { Link } from 'react-router-dom';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingScreen } from '../../components/common/LoadingScreen';
import { SectionCard } from '../../components/common/SectionCard';
import { StatCard } from '../../components/common/StatCard';
import { useTeacherExamsQuery, useTeacherGroupsQuery, useTeacherStudentsQuery } from '../../hooks/useTeacherQueries';
import { formatDateTime } from '../../utils/formatters';
import { getStatusTone } from '../../utils/statusStyles';
import { IconLabel, appIcons } from '../../utils/appIcons';

export function TeacherDashboardPage() {
  const groupsQuery = useTeacherGroupsQuery(1, 6);
  const studentsQuery = useTeacherStudentsQuery(undefined, 1, 6);
  const examsQuery = useTeacherExamsQuery({ page: 1, limit: 6 });

  if (groupsQuery.isLoading || studentsQuery.isLoading || examsQuery.isLoading) {
    return <LoadingScreen label="Loading your teacher workspace..." />;
  }

  if (groupsQuery.isError || studentsQuery.isError || examsQuery.isError) {
    return <div className="rounded-[28px] border border-rose-200 bg-rose-50 p-6 text-rose-700 sm:p-8">We could not load your teacher dashboard right now.</div>;
  }

  const draftCount = examsQuery.data?.items.filter((exam) => exam.status === 'draft').length ?? 0;
  const publishedCount = examsQuery.data?.items.filter((exam) => exam.status === 'published').length ?? 0;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="My classes" value={groupsQuery.data?.items.length ?? 0} helper="Classes currently visible to this teacher." accent="emerald" />
        <StatCard label="Students" value={studentsQuery.data?.total ?? 0} helper="Students you can manage or review." accent="blue" />
        <StatCard label="Draft exams" value={draftCount} helper="Drafts waiting to be published." accent="amber" />
        <StatCard label="Published exams" value={publishedCount} helper="Exams currently visible to students." accent="emerald" />
      </div>

      <div className="grid gap-4 sm:gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <SectionCard title="My classes" eyebrow="Classes" action={<Link to="/teacher/groups" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-slate-950"><appIcons.Eye className="h-4 w-4" aria-hidden />View all</Link>}>
          {groupsQuery.data && groupsQuery.data.items.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {groupsQuery.data.items.map((group) => (
                <Link key={group.id} to={`/teacher/groups/${group.id}`} className="rounded-3xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg">
                  <h2 className="text-lg font-semibold text-slate-900">{group.name}</h2>
                  <p className="mt-2 inline-flex items-center gap-2 text-sm text-slate-600"><appIcons.CalendarClock className="h-4 w-4" aria-hidden />Created {formatDateTime(group.createdAt)}</p>
                  <p className="mt-4 text-sm font-semibold text-slate-700"><IconLabel label="Open class roster" /></p>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState title="No classes yet" description="Assigned classes will appear here once they are linked to your teacher account." />
          )}
        </SectionCard>

        <SectionCard title="Quick navigation" eyebrow="Actions">
          <div className="grid gap-3">
            <Link to="/teacher/exams/new" className="flex items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-4 text-sm font-semibold text-slate-800 transition hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-emerald-50/70 hover:text-emerald-800 hover:shadow-md">
              <IconLabel label="Create exam" />
              <appIcons.ChevronRight className="h-4 w-4 shrink-0" aria-hidden />
            </Link>
            <Link to="/teacher/questions/new" className="flex items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-4 text-sm font-semibold text-slate-800 transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50/70 hover:text-blue-800 hover:shadow-md">
              <IconLabel label="Create question" />
              <appIcons.ChevronRight className="h-4 w-4 shrink-0" aria-hidden />
            </Link>
            <Link to="/teacher/analytics" className="flex items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-4 text-sm font-semibold text-slate-800 transition hover:-translate-y-0.5 hover:border-amber-200 hover:bg-amber-50/70 hover:text-amber-800 hover:shadow-md">
              <IconLabel label="Analytics" />
              <appIcons.ChevronRight className="h-4 w-4 shrink-0" aria-hidden />
            </Link>
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Recent exams" eyebrow="Exam management" action={<Link to="/teacher/exams" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-slate-950"><appIcons.Eye className="h-4 w-4" aria-hidden />Manage exams</Link>}>
        {examsQuery.data && examsQuery.data.items.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {examsQuery.data.items.map((exam) => (
              <Link key={exam.id} to={`/teacher/exams/${exam.id}`} className="rounded-3xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${getStatusTone(exam.status)}`}>{exam.status}</span>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${getStatusTone(exam.approvalStatus)}`}>{exam.approvalStatus}</span>
                </div>
                <h2 className="mt-4 text-lg font-semibold text-slate-900">{exam.title}</h2>
                <p className="mt-2 inline-flex items-center gap-2 text-sm text-slate-600"><appIcons.CalendarClock className="h-4 w-4" aria-hidden />Created {formatDateTime(exam.createdAt)}</p>
                <p className="mt-4 text-sm font-semibold text-slate-700">{exam.questionCount ?? 0} questions</p>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState title="No exams yet" description="Create a draft exam from the question bank to get started." actionLabel="Build exam" actionTo="/teacher/exams/new" />
        )}
      </SectionCard>
    </div>
  );
}
