import { useState } from 'react';
import { LoadingScreen } from '../../components/common/LoadingScreen';
import { PaginationFooter } from '../../components/common/PaginationFooter';
import { SectionCard } from '../../components/common/SectionCard';
import { StatCard } from '../../components/common/StatCard';
import { useTeacherStudentQuery, useTeacherStudentResultsQuery } from '../../hooks/useTeacherQueries';
import { useParams } from 'react-router-dom';
import { getStatusAccent } from '../../utils/statusStyles';

export function TeacherStudentDetailPage() {
  const { studentId = '' } = useParams();
  const [page, setPage] = useState(1);
  const studentQuery = useTeacherStudentQuery(studentId);
  const resultsQuery = useTeacherStudentResultsQuery(studentId, page, 10);

  if (studentQuery.isLoading || resultsQuery.isLoading) {
    return <LoadingScreen label="Loading student detail..." />;
  }

  if (studentQuery.isError || resultsQuery.isError || !studentQuery.data || !resultsQuery.data) {
    return <div className="rounded-[28px] border border-rose-200 bg-rose-50 p-8 text-rose-700">We could not load this student detail page.</div>;
  }

  const student = studentQuery.data;

  return (
    <div className="space-y-6">
      <SectionCard title={student.name} eyebrow="Student detail">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Email" value={student.email} helper="Student account email." accent="emerald" />
          <StatCard label="Roll number" value={student.rollNumber || 'Not set'} helper="Student identifier within the class." accent="blue" />
          <StatCard label="Class ID" value={student.groupId || 'Not assigned'} helper="Current class reference." accent="amber" />
          <StatCard label="Status" value={student.isActive ? 'Active' : 'Inactive'} helper="Current user activity flag." accent={getStatusAccent(student.isActive ? 'active' : 'inactive')} />
        </div>
      </SectionCard>

      <SectionCard title="Result history" eyebrow="Student attempts">
        {resultsQuery.data.items.length === 0 ? (
          <p className="text-sm text-slate-600">This student has not completed any exams yet.</p>
        ) : (
          <div className="space-y-4">
            {resultsQuery.data.items.map((result) => (
              <div key={result.attemptId} className="rounded-3xl border border-slate-200 bg-white p-5">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-base font-semibold text-slate-900">Attempt {result.attemptId.slice(0, 8)}</p>
                  <p className="text-sm font-semibold text-slate-700">{Math.round(result.percentage)}%</p>
                </div>
                <p className="mt-2 text-sm text-slate-600">Score {result.score}</p>
              </div>
            ))}
          </div>
        )}
        <PaginationFooter page={page} total={resultsQuery.data.total} size={resultsQuery.data.size} pages={resultsQuery.data.pages} limit={resultsQuery.data.size} onPageChange={setPage} />
      </SectionCard>
    </div>
  );
}
