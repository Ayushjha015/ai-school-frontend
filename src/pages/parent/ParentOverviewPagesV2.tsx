import { Link } from 'react-router-dom';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingScreen } from '../../components/common/LoadingScreen';
import { SectionCard } from '../../components/common/SectionCard';
import { useParentAnalyticsChildrenQuery } from '../../hooks/useParentQueries';
export { ParentDashboardPage, ParentChildOverviewPage } from './ParentOverviewPages';

export function ParentChildrenPage() {
  const { data, isLoading, isError } = useParentAnalyticsChildrenQuery();

  if (isLoading) {
    return <LoadingScreen label="Loading linked children..." />;
  }

  if (isError || !data) {
    return <div className="rounded-[28px] border border-rose-200 bg-rose-50 p-8 text-rose-700">We could not load your linked children.</div>;
  }

  return (
    <SectionCard title="My Children" eyebrow="Linked children">
      {data.length === 0 ? (
        <EmptyState title="No children linked to your account" description="Contact your school administrator to link your child's account." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.map((child) => (
            <div key={child.studentUserId} className="rounded-3xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Child</p>
              <h2 className="mt-3 text-xl font-semibold text-slate-900">{child.studentName}</h2>
              <p className={`mt-2 text-sm ${child.groupName ? 'text-slate-600' : 'text-slate-400'}`}>
                {child.groupName ?? 'Class not assigned'}
              </p>
              <Link
                to={`/parent/children/${child.studentUserId}/analytics`}
                className="mt-5 inline-flex rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-950"
              >
                View Analytics →
              </Link>
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}
