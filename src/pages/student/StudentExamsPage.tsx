import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingScreen } from '../../components/common/LoadingScreen';
import { PaginationFooter } from '../../components/common/PaginationFooter';
import { SectionCard } from '../../components/common/SectionCard';
import { useStudentExamsQuery } from '../../hooks/useStudentQueries';
import type { StudentExamCategory, StudentExamDetails } from '../../types/api';
import { formatRelativeWindow } from '../../utils/formatters';
import { IconLabel, appIcons } from '../../utils/appIcons';

const examTabs: Array<{ key: StudentExamCategory; label: string }> = [
  { key: 'live', label: 'Live' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'missed', label: 'Missed' },
  { key: 'given', label: 'Past' },
];

const initialPages: Record<StudentExamCategory, number> = {
  live: 1,
  upcoming: 1,
  missed: 1,
  given: 1,
};

const pageSizeOptions = [10, 20, 50];

function ExamTable({
  exams,
  emptyTitle,
  emptyDescription,
  page,
  size,
  total,
  pages,
  limit,
  onLimitChange,
  onPageChange,
}: {
  exams: StudentExamDetails[];
  emptyTitle: string;
  emptyDescription: string;
  page: number;
  size: number;
  total: number;
  pages: number;
  limit: number;
  onLimitChange: (limit: number) => void;
  onPageChange: (page: number) => void;
}) {
  if (exams.length === 0) {
    return (
      <div className="mt-6">
        <EmptyState title={emptyTitle} description={emptyDescription} />
      </div>
    );
  }

  const rowOffset = (page - 1) * size;

  return (
    <>
      <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white/80 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-950/70">
        <div className="overflow-x-auto">
          <table className="min-w-[860px] w-full text-left text-sm">
          <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:bg-slate-900/80 dark:text-slate-400">
            <tr>
              <th className="px-5 py-4">S.No</th>
              <th className="px-5 py-4">Title</th>
              <th className="px-5 py-4">Subject</th>
              <th className="px-5 py-4">Topic</th>
              <th className="px-5 py-4">Time limit</th>
              <th className="px-5 py-4">Pass %</th>
              <th className="px-5 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {exams.map((exam, index) => {
              const isLive = exam.availabilityStatus === 'live';
              const ctaLabel = isLive ? 'Start exam' : 'View details';

              return (
                <tr key={exam.id} className="text-slate-700 transition hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-900/70">
                  <td className="px-5 py-4 text-xs font-semibold text-slate-400">{rowOffset + index + 1}</td>
                  <td className="px-5 py-4">
                    <div>
                      <Link to={`/student/exams/${exam.id}`} className="font-semibold text-slate-900 transition hover:text-emerald-600 dark:text-slate-100 dark:hover:text-emerald-300">
                        {exam.title}
                      </Link>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{formatRelativeWindow(exam.startTime, exam.endTime)}</p>
                    </div>
                  </td>
                  <td className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-200">{exam.subjectName}</td>
                  <td className="px-5 py-4 text-slate-600 dark:text-slate-400">{exam.topic || '—'}</td>
                  <td className="px-5 py-4">{exam.timeLimitMinutes ? `${exam.timeLimitMinutes} min` : 'Flexible'}</td>
                  <td className="px-5 py-4 font-semibold">{exam.passPercentage}%</td>
                  <td className="px-5 py-4 text-right">
                    <Link
                      to={`/student/exams/${exam.id}`}
                      className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${isLive ? 'bg-emerald-500 text-white hover:bg-emerald-600' : 'border border-slate-300 text-slate-700 hover:border-slate-400 dark:border-slate-700 dark:text-slate-200 dark:hover:border-slate-500'}`}
                    >
                      <IconLabel label={ctaLabel} icon={isLive ? appIcons.Send : appIcons.Eye} />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
          </table>
        </div>
      </div>
      <PaginationFooter
        page={page}
        total={total}
        size={size}
        pages={pages}
        limit={limit}
        options={pageSizeOptions}
        onLimitChange={onLimitChange}
        onPageChange={onPageChange}
      />
    </>
  );
}

export function StudentExamsPage() {
  const [activeTab, setActiveTab] = useState<StudentExamCategory>('live');
  const [search, setSearch] = useState('');
  const [pages, setPages] = useState<Record<StudentExamCategory, number>>(initialPages);
  const [limit, setLimit] = useState(10);

  const liveQuery = useStudentExamsQuery('live', pages.live, limit);
  const upcomingQuery = useStudentExamsQuery('upcoming', pages.upcoming, limit);
  const missedQuery = useStudentExamsQuery('missed', pages.missed, limit);
  const givenQuery = useStudentExamsQuery('given', pages.given, limit);

  const examQueries = {
    live: liveQuery,
    upcoming: upcomingQuery,
    missed: missedQuery,
    given: givenQuery,
  };
  const activeQuery = examQueries[activeTab];
  const activeData = activeQuery.data;
  const activeExams = activeData?.items ?? [];
  const searchTerm = search.trim().toLowerCase();
  const visibleExams = useMemo(() => {
    if (!searchTerm) {
      return activeExams;
    }

    return activeExams.filter((exam) => {
      return [exam.title, exam.subjectName, exam.topic ?? '']
        .some((value) => value.toLowerCase().includes(searchTerm));
    });
  }, [activeExams, searchTerm]);

  function setTabPage(category: StudentExamCategory, nextPage: number) {
    setPages((current) => ({ ...current, [category]: nextPage }));
  }

  function handleLimitChange(nextLimit: number) {
    setLimit(nextLimit);
    setPages(initialPages);
  }

  if (activeQuery.isLoading && !activeData) {
    return <LoadingScreen label="Loading your assigned exams..." />;
  }

  if (activeQuery.isError) {
    return <div className="rounded-[28px] border border-rose-200 bg-rose-50 p-8 text-rose-700">We could not load your exam list right now.</div>;
  }

  return (
    <div className="space-y-6">
      <SectionCard title="Exams" eyebrow="Exam schedule">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search exams by title, subject, or topic..."
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-300 dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-100"
          />
          <div className="flex rounded-full border border-slate-200 bg-slate-100 p-1 dark:border-slate-700 dark:bg-slate-950/70">
            {examTabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  activeTab === tab.key ? 'bg-slate-950 text-white shadow-sm dark:bg-slate-50 dark:text-slate-950' : 'text-slate-600 hover:text-slate-950 dark:text-slate-400 dark:hover:text-slate-100'
                }`}
              >
                {tab.label} ({examQueries[tab.key].data?.total ?? 0})
              </button>
            ))}
          </div>
        </div>

        <ExamTable
          exams={visibleExams}
          page={activeData?.page ?? pages[activeTab]}
          size={activeData?.size ?? limit}
          total={activeData?.total ?? 0}
          pages={activeData?.pages ?? 1}
          limit={limit}
          onLimitChange={handleLimitChange}
          onPageChange={(nextPage) => setTabPage(activeTab, nextPage)}
          emptyTitle={activeExams.length === 0 ? `No ${activeTab} exams` : 'No matching exams'}
          emptyDescription={activeExams.length === 0 ? 'Published exams will appear in the right category here as their schedule changes.' : 'Clear the search or switch exam category.'}
        />
      </SectionCard>
    </div>
  );
}
