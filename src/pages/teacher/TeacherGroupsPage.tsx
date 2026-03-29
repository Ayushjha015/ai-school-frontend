import { Link } from 'react-router-dom';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingScreen } from '../../components/common/LoadingScreen';
import { SectionCard } from '../../components/common/SectionCard';
import { useTeacherGroupsQuery } from '../../hooks/useTeacherQueries';
import { formatDateTime } from '../../utils/formatters';

export function TeacherGroupsPage() {
  const { data, isLoading, isError } = useTeacherGroupsQuery(1, 50);

  if (isLoading) {
    return <LoadingScreen label="Loading your classes..." />;
  }

  if (isError || !data) {
    return <div className="rounded-[28px] border border-rose-200 bg-rose-50 p-8 text-rose-700">We could not load your classes.</div>;
  }

  return (
    <SectionCard title="My classes" eyebrow="Classes assigned to you">
      {data.items.length === 0 ? (
        <EmptyState title="No classes assigned" description="Once classes are assigned to this teacher account, they will appear here." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.items.map((group) => (
            <Link key={group.id} to={`/teacher/groups/${group.id}`} className="rounded-3xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Class</p>
              <h2 className="mt-3 text-lg font-semibold text-slate-900">{group.name}</h2>
              <p className="mt-2 text-sm text-slate-600">Created {formatDateTime(group.createdAt)}</p>
              <p className="mt-4 text-sm font-semibold text-slate-700">View students and analytics</p>
            </Link>
          ))}
        </div>
      )}
    </SectionCard>
  );
}
