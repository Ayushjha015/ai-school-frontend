import { Link, useParams } from 'react-router-dom';
import { useState } from 'react';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingScreen } from '../../components/common/LoadingScreen';
import { SectionCard } from '../../components/common/SectionCard';
import { StatCard } from '../../components/common/StatCard';
import { TagBadge } from '../../components/common/TagBadge';
import { TopicBarList } from '../../components/common/TopicBarList';
import { useChildExamsQuery, useChildResultDetailQuery, useChildResultsQuery } from '../../hooks/useParentQueries';
import type { StudentExamSummary } from '../../types/api';
import { formatDateTime, formatPercentage, formatRelativeWindow } from '../../utils/formatters';
import { getStatusTone } from '../../utils/statusStyles';

function ParentExamTable({ exams, emptyTitle, searchTerm }: { exams: StudentExamSummary[]; emptyTitle: string; searchTerm: string }) {
  const visibleExams = searchTerm
    ? exams.filter((exam) => [exam.title, exam.studentStatus, exam.examStatus].some((value) => value.toLowerCase().includes(searchTerm)))
    : exams;

  if (visibleExams.length === 0) {
    return <EmptyState title={exams.length === 0 ? emptyTitle : 'No matching exams'} description={exams.length === 0 ? 'Nothing to show in this category yet.' : 'Clear the search or check another category.'} />;
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white/80 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-950/70">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:bg-slate-900/80 dark:text-slate-400">
            <tr>
              <th className="px-5 py-4">S.No</th>
              <th className="px-5 py-4">Title</th>
              <th className="px-5 py-4">Schedule</th>
              <th className="px-5 py-4">Exam status</th>
              <th className="px-5 py-4">Student status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {visibleExams.map((exam, index) => (
              <tr key={exam.examId} className="text-slate-700 transition hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-900/70">
                <td className="px-5 py-4 text-xs font-semibold text-slate-400">{index + 1}</td>
                <td className="px-5 py-4 font-semibold text-slate-900 dark:text-slate-100">{exam.title}</td>
                <td className="px-5 py-4 text-slate-600 dark:text-slate-400">{formatRelativeWindow(exam.startTime, exam.endTime)}</td>
                <td className="px-5 py-4">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${getStatusTone(exam.examStatus)}`}>{exam.examStatus}</span>
                </td>
                <td className="px-5 py-4">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${getStatusTone(exam.studentStatus)}`}>{exam.studentStatus}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function ParentChildExamsPage() {
  const { studentUserId = '' } = useParams();
  const [search, setSearch] = useState('');
  const { data, isLoading, isError } = useChildExamsQuery(studentUserId);

  if (isLoading) {
    return <LoadingScreen label="Loading child exams..." />;
  }

  if (isError || !data) {
    return <div className="rounded-[28px] border border-rose-200 bg-rose-50 p-8 text-rose-700">We could not load this child’s exams.</div>;
  }

  const sections = [
    { title: 'Upcoming', items: data.upcoming },
    { title: 'Completed', items: data.completed },
    { title: 'Missed', items: data.missed },
  ];
  const searchTerm = search.trim().toLowerCase();

  return (
    <div className="space-y-6">
      <SectionCard title={`${data.fullName} • Exams`} eyebrow="Child exam status">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <p className="text-sm text-slate-600 dark:text-slate-300">Grouped into upcoming, completed, and missed exam states for this linked child.</p>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search child exams..."
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-300 dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-100 lg:w-80"
          />
        </div>
      </SectionCard>
      {sections.map((section) => (
        <SectionCard key={section.title} title={section.title} eyebrow="Exam list">
          <ParentExamTable exams={section.items} emptyTitle={`No ${section.title.toLowerCase()} exams`} searchTerm={searchTerm} />
        </SectionCard>
      ))}
    </div>
  );
}

export function ParentChildResultsPage() {
  const { studentUserId = '' } = useParams();
  const { data, isLoading, isError } = useChildResultsQuery(studentUserId);

  if (isLoading) {
    return <LoadingScreen label="Loading child results..." />;
  }

  if (isError || !data) {
    return <div className="rounded-[28px] border border-rose-200 bg-rose-50 p-8 text-rose-700">We could not load this child’s results.</div>;
  }

  return (
    <div className="space-y-6">
      <SectionCard title={`${data.fullName} • Results`} eyebrow="Child result history">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <StatCard label="Average percentage" value={formatPercentage(data.averagePercentage)} helper="Across all completed exams." accent="emerald" />
          <StatCard label="Total attempts" value={data.totalExamsAttempted} helper="Completed child attempts." accent="blue" />
          <StatCard label="Results" value={data.results.length} helper="Recent result history for this child." accent="amber" />
        </div>
      </SectionCard>
      {data.results.length === 0 ? (
        <EmptyState title="No result history" description="This child has not completed any exams yet." />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {data.results.map((result) => (
            <Link key={result.attemptId} to={`/parent/children/${studentUserId}/results/${result.attemptId}`} className="rounded-3xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg">
              <h2 className="text-lg font-semibold text-slate-900">{result.examTitle}</h2>
              <p className="mt-2 text-sm text-slate-600">Generated {formatDateTime(result.generatedAt)}</p>
              <p className="mt-4 text-sm font-semibold text-slate-700">{formatPercentage(result.percentage)} • Score {result.score}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function ParentChildResultDetailPage() {
  const { studentUserId = '', attemptId = '' } = useParams();
  const { data, isLoading, isError } = useChildResultDetailQuery(studentUserId, attemptId);

  if (isLoading) {
    return <LoadingScreen label="Loading result detail..." />;
  }

  if (isError || !data) {
    return <div className="rounded-[28px] border border-rose-200 bg-rose-50 p-8 text-rose-700">We could not load this result detail.</div>;
  }

  return (
    <div className="space-y-6">
      <SectionCard title="Child result detail" eyebrow="Read-only review">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Score" value={data.score} helper={`${data.correctAnswers} correct / ${data.incorrectAnswers} incorrect`} accent="emerald" />
          <StatCard label="Percentage" value={formatPercentage(data.percentage)} helper="Final graded percentage." accent="blue" />
          <StatCard label="Questions" value={data.totalQuestions} helper="Questions graded in this attempt." accent="amber" />
          <StatCard label="Generated" value={formatDateTime(data.generatedAt)} helper="Result generation time." accent="slate" />
        </div>
      </SectionCard>
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <SectionCard title="Topic breakdown" eyebrow="Accuracy by topic">
          <TopicBarList title="Topics" items={data.topicPerformance} emptyLabel="No topic breakdown available." />
        </SectionCard>
        <SectionCard title="Answer review" eyebrow="Question outcomes">
          {data.answers.length === 0 ? (
            <EmptyState title="No answer review" description="Detailed answer review is not available for this result yet." />
          ) : (
            <div className="space-y-4">
              {data.answers.map((answer, index) => (
                <div key={`${answer.questionId}-${index}`} className="rounded-3xl border border-slate-200 bg-white p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Question {index + 1}</p>
                      {answer.tags?.length ? (
                        <div className="flex flex-wrap gap-2">
                          {answer.tags.map((tag) => <TagBadge key={`${answer.questionId}-${tag.id}`} tag={tag} compact />)}
                        </div>
                      ) : null}
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${getStatusTone(answer.isCorrect ? 'correct' : 'review')}`}>
                      {answer.isCorrect ? 'Correct' : 'Review'}
                    </span>
                  </div>
                  <p className="mt-3 text-sm font-medium text-slate-900">{answer.questionText}</p>
                  <p className="mt-2 text-sm text-slate-600">Marks obtained: {answer.marksObtained}</p>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}

export function ParentChildAnalyticsPage() {
  const { studentUserId = '' } = useParams();
  const examsQuery = useChildExamsQuery(studentUserId);
  const resultsQuery = useChildResultsQuery(studentUserId);

  if (examsQuery.isLoading || resultsQuery.isLoading) {
    return <LoadingScreen label="Loading child analytics..." />;
  }

  if (examsQuery.isError || resultsQuery.isError || !examsQuery.data || !resultsQuery.data) {
    return <div className="rounded-[28px] border border-rose-200 bg-rose-50 p-8 text-rose-700">We could not load child analytics.</div>;
  }

  const strongest = resultsQuery.data.results.slice(0, 3).map((result) => ({ topic: result.examTitle, accuracy: result.percentage, correct: result.score, incorrect: 0 }));
  const weakest = examsQuery.data.missed.slice(0, 3).map((exam) => ({ topic: exam.title, accuracy: 0, correct: 0, incorrect: 1 }));

  return (
    <div className="space-y-6">
      <SectionCard title={`${resultsQuery.data.fullName} • Analytics`} eyebrow="Parent summary view">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Average percentage" value={formatPercentage(resultsQuery.data.averagePercentage)} helper="Average across completed exams." accent="emerald" />
          <StatCard label="Completed exams" value={examsQuery.data.completed.length} helper="Completed child exams on record." accent="blue" />
          <StatCard label="Upcoming exams" value={examsQuery.data.upcoming.length} helper="Upcoming child schedule." accent="amber" />
          <StatCard label="Missed exams" value={examsQuery.data.missed.length} helper="Missed exam count." accent="rose" />
        </div>
      </SectionCard>
      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard title="Best recent outcomes" eyebrow="Derived from result history">
          <TopicBarList title="Recent strong results" items={strongest} emptyLabel="No completed results yet." />
        </SectionCard>
        <SectionCard title="Missed opportunities" eyebrow="Needs attention">
          <TopicBarList title="Missed exams" items={weakest} emptyLabel="No missed exams recorded." />
        </SectionCard>
      </div>
    </div>
  );
}
