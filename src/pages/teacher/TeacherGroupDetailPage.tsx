import { Link, useParams } from 'react-router-dom';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingScreen } from '../../components/common/LoadingScreen';
import { SectionCard } from '../../components/common/SectionCard';
import { StatCard } from '../../components/common/StatCard';
import { useTeacherGroupQuery, useTeacherGroupStudentsQuery } from '../../hooks/useTeacherQueries';
import { formatDateTime } from '../../utils/formatters';
import { getStatusTone } from '../../utils/statusStyles';

export function TeacherGroupDetailPage() {
  const { groupId = '' } = useParams();
  const groupQuery = useTeacherGroupQuery(groupId);
  const studentsQuery = useTeacherGroupStudentsQuery(groupId, 1, 100);

  if (groupQuery.isLoading || studentsQuery.isLoading) {
    return <LoadingScreen label="Loading class details..." />;
  }

  if (groupQuery.isError || studentsQuery.isError || !groupQuery.data || !studentsQuery.data) {
    return <div className="rounded-[28px] border border-rose-200 bg-rose-50 p-6 text-rose-700 sm:p-8">We could not load this class.</div>;
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <SectionCard
        title={groupQuery.data.name}
        eyebrow="Group detail"
        action={<Link to={`/teacher/analytics/groups/${groupId}`} className="text-sm font-semibold text-slate-700 hover:text-slate-950">View analytics</Link>}
      >
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard label="Students" value={studentsQuery.data.total} helper="Current roster size for this class." accent="emerald" />
          <StatCard label="Created" value={formatDateTime(groupQuery.data.createdAt)} helper="When this class was created." accent="blue" />
          <StatCard label="Group ID" value={groupQuery.data.id.slice(0, 8)} helper="Quick reference for this class." accent="slate" />
        </div>
      </SectionCard>

      <SectionCard title="Student roster" eyebrow="Class members">
        {studentsQuery.data.items.length === 0 ? (
          <EmptyState title="No students in this group" description="Students assigned to this class will appear here." />
        ) : (
          <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white">
            <table className="min-w-[640px] divide-y divide-slate-200 text-left text-sm text-slate-700">
              <thead className="bg-slate-50 text-xs uppercase tracking-[0.18em] text-slate-500">
                <tr>
                  <th className="px-4 py-4">Name</th>
                  <th className="px-4 py-4">Email</th>
                  <th className="px-4 py-4">Roll number</th>
                  <th className="px-4 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {studentsQuery.data.items.map((student) => (
                  <tr key={student.id}>
                    <td className="px-4 py-4 font-semibold text-slate-900"><Link to={`/teacher/students/${student.id}`}>{student.name}</Link></td>
                    <td className="px-4 py-4">{student.email}</td>
                    <td className="px-4 py-4">{student.rollNumber || 'Not set'}</td>
                    <td className="px-4 py-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${getStatusTone(student.isActive ? 'active' : 'inactive')}`}>
                        {student.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
