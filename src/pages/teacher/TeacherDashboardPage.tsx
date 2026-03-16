import { Link } from 'react-router-dom';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingScreen } from '../../components/common/LoadingScreen';
import { SectionCard } from '../../components/common/SectionCard';
import { StatCard } from '../../components/common/StatCard';
import { useNotificationsQuery } from '../../hooks/useNotificationQueries';
import { useTeacherExamsQuery, useTeacherGroupsQuery, useTeacherStudentsQuery } from '../../hooks/useTeacherQueries';
import { formatDateTime } from '../../utils/formatters';
import { getStatusTone } from '../../utils/statusStyles';

export function TeacherDashboardPage() {
  const groupsQuery = useTeacherGroupsQuery(1, 6);
  const studentsQuery = useTeacherStudentsQuery(undefined, 1, 6);
  const examsQuery = useTeacherExamsQuery({ page: 1, limit: 6 });
  const notificationsQuery = useNotificationsQuery(1, 5);

  if (groupsQuery.isLoading || studentsQuery.isLoading || examsQuery.isLoading || notificationsQuery.isLoading) {
    return <LoadingScreen label="Loading your teacher workspace..." />;
  }

  if (groupsQuery.isError || studentsQuery.isError || examsQuery.isError || notificationsQuery.isError) {
    return <div className="rounded-[28px] border border-rose-200 bg-rose-50 p-6 text-rose-700 sm:p-8">We could not load your teacher dashboard right now.</div>;
  }

  const draftCount = examsQuery.data?.items.filter((exam) => exam.status === 'draft').length ?? 0;
  const publishedCount = examsQuery.data?.items.filter((exam) => exam.status === 'published').length ?? 0;

  return (
    <div className="space-y-4 sm:space-y-6">
      <section className="rounded-[28px] border border-white/70 bg-slate-950 px-5 py-6 text-white shadow-2xl shadow-slate-900/15 sm:rounded-[32px] sm:px-8 sm:py-7">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-300">Teacher dashboard</p>
        <div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <h1 className="text-2xl font-semibold leading-tight sm:text-4xl">Create questions, publish exams, and monitor class performance.</h1>
            <p className="mt-3 text-sm leading-7 text-slate-300">This workspace keeps your classes, students, question bank, drafts, and exam analytics in one place.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link to="/teacher/questions/new" className="rounded-full bg-emerald-500 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-emerald-600">Create question</Link>
            <Link to="/teacher/exams/new" className="rounded-full border border-white/20 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/10">Build exam</Link>
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="My classes" value={groupsQuery.data?.items.length ?? 0} helper="Groups currently visible to this teacher." accent="emerald" />
        <StatCard label="Students" value={studentsQuery.data?.total ?? 0} helper="Students you can manage or review." accent="blue" />
        <StatCard label="Draft exams" value={draftCount} helper="Drafts waiting to be published." accent="amber" />
        <StatCard label="Published exams" value={publishedCount} helper="Exams currently visible to students." accent="emerald" />
      </div>

      <div className="grid gap-4 sm:gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <SectionCard title="My classes" eyebrow="Groups" action={<Link to="/teacher/groups" className="text-sm font-semibold text-slate-700 hover:text-slate-950">View all</Link>}>
          {groupsQuery.data && groupsQuery.data.items.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {groupsQuery.data.items.map((group) => (
                <Link key={group.id} to={`/teacher/groups/${group.id}`} className="rounded-3xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg">
                  <h2 className="text-lg font-semibold text-slate-900">{group.name}</h2>
                  <p className="mt-2 text-sm text-slate-600">Created {formatDateTime(group.createdAt)}</p>
                  <p className="mt-4 text-sm font-semibold text-slate-700">Open class roster</p>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState title="No groups yet" description="Assigned classes will appear here once they are linked to your teacher account." />
          )}
        </SectionCard>

        <SectionCard title="Recent notifications" eyebrow="Unread first" action={<Link to="/teacher/notifications" className="text-sm font-semibold text-slate-700 hover:text-slate-950">Open inbox</Link>}>
          {notificationsQuery.data && notificationsQuery.data.items.length > 0 ? (
            <div className="space-y-3">
              {notificationsQuery.data.items.slice(0, 4).map((item) => (
                <div key={item.id} className={`rounded-3xl border p-4 ${item.isRead ? 'border-slate-200 bg-white' : 'border-emerald-200 bg-emerald-50/60'}`}>
                  <p className="text-sm font-semibold text-slate-900">{item.title || item.type || 'Notification'}</p>
                  <p className="mt-1 text-sm text-slate-600">{item.message || 'Open this update to view the latest details.'}</p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No notifications" description="Exam updates and system alerts will appear here." />
          )}
        </SectionCard>
      </div>

      <SectionCard title="Recent exams" eyebrow="Exam management" action={<Link to="/teacher/exams" className="text-sm font-semibold text-slate-700 hover:text-slate-950">Manage exams</Link>}>
        {examsQuery.data && examsQuery.data.items.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {examsQuery.data.items.map((exam) => (
              <Link key={exam.id} to={`/teacher/exams/${exam.id}`} className="rounded-3xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${getStatusTone(exam.status)}`}>{exam.status}</span>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${getStatusTone(exam.approvalStatus)}`}>{exam.approvalStatus}</span>
                </div>
                <h2 className="mt-4 text-lg font-semibold text-slate-900">{exam.title}</h2>
                <p className="mt-2 text-sm text-slate-600">Created {formatDateTime(exam.createdAt)}</p>
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
