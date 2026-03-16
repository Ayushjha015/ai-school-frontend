import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingScreen } from '../../components/common/LoadingScreen';
import { SectionCard } from '../../components/common/SectionCard';
import { useStudentExamsQuery } from '../../hooks/useStudentQueries';
import type { StudentExamDetails } from '../../types/api';
import { formatRelativeWindow } from '../../utils/formatters';
import { getStudentExamStatusLabel, getStudentExamStatusTone, type StudentExamAvailability } from '../../utils/studentExamStatus';

const examTabs = [
  { key: 'live', label: 'Live' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'missed', label: 'Missed' },
  { key: 'given', label: 'Past' },
] as const;

type ExamTabKey = (typeof examTabs)[number]['key'];

function ExamGrid({ exams, emptyTitle, emptyDescription, status }: { exams: StudentExamDetails[]; emptyTitle: string; emptyDescription: string; status: StudentExamAvailability }) {
  if (exams.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  const ctaLabel = status === 'live' ? 'Start exam' : 'View details';

  return (
    <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
      {exams.map((exam) => (
        <Link key={exam.id} to={`/student/exams/${exam.id}`} className="rounded-3xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg">
          <div className="flex items-center justify-between gap-3">
            <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${getStudentExamStatusTone(status)}`}>
              {getStudentExamStatusLabel(status)}
            </span>
            <span className="text-xs font-medium text-slate-500">Pass {exam.passPercentage}%</span>
          </div>
          <h2 className="mt-4 text-lg font-semibold text-slate-900">{exam.title}</h2>
          <p className="mt-2 text-sm text-slate-600">{formatRelativeWindow(exam.startTime, exam.endTime)}</p>
          <div className="mt-4 flex items-center justify-between text-sm text-slate-700">
            <span>{exam.timeLimitMinutes ? `${exam.timeLimitMinutes} min` : 'Flexible'}</span>
            <span className="font-semibold">{ctaLabel}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}

export function StudentExamsPage() {
  const [activeTab, setActiveTab] = useState<ExamTabKey>('live');
  const { data, isLoading, isError } = useStudentExamsQuery();

  const activeExams = useMemo(() => data?.[activeTab] ?? [], [activeTab, data]);

  if (isLoading) {
    return <LoadingScreen label="Loading your assigned exams..." />;
  }

  if (isError || !data) {
    return <div className="rounded-[28px] border border-rose-200 bg-rose-50 p-8 text-rose-700">We could not load your exam list right now.</div>;
  }

  return (
    <div className="space-y-6">
      <SectionCard title="My exams" eyebrow="Exam schedule">
        <div className="flex flex-wrap gap-3">
          {examTabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                activeTab === tab.key ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {tab.label} ({data[tab.key].length})
            </button>
          ))}
        </div>
      </SectionCard>

      <ExamGrid
        exams={activeExams}
        status={activeTab}
        emptyTitle={`No ${activeTab} exams`}
        emptyDescription="Published exams will appear in the right category here as their schedule changes."
      />
    </div>
  );
}
