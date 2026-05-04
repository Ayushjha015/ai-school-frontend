import { Link, useParams } from 'react-router-dom';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingScreen } from '../../components/common/LoadingScreen';
import { SectionCard } from '../../components/common/SectionCard';
import { StatCard } from '../../components/common/StatCard';
import { TagBadge } from '../../components/common/TagBadge';
import { TopicBarList } from '../../components/common/TopicBarList';
import { useResultDetailQuery } from '../../hooks/useStudentQueries';
import { formatDateTime, formatPercentage } from '../../utils/formatters';
import { IconLabel, appIcons } from '../../utils/appIcons';

export function ResultDetailPage() {
  const { attemptId = '' } = useParams();
  const { data, isLoading, isError } = useResultDetailQuery(attemptId);

  if (isLoading) {
    return <LoadingScreen label="Loading your result details..." />;
  }

  if (isError || !data) {
    return <div className="rounded-[28px] border border-rose-200 bg-rose-50 p-8 text-rose-700">We could not load this result detail.</div>;
  }

  return (
    <div className="space-y-6">
      <SectionCard
        title="Result detail"
        eyebrow="Completed exam"
        action={
          <Link className="text-sm font-semibold text-slate-700 hover:text-slate-950" to={`/student/exams/${data.examId}/leaderboard`}>
            <IconLabel label="View leaderboard" icon={appIcons.Eye} />
          </Link>
        }
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Score" value={data.score} helper={`${data.correctAnswers} correct / ${data.incorrectAnswers} incorrect`} accent="emerald" />
          <StatCard label="Percentage" value={formatPercentage(data.percentage)} helper="Final score across the exam." accent="blue" />
          <StatCard label="Total questions" value={data.totalQuestions} helper="Questions graded in this attempt." accent="amber" />
          <StatCard label="Generated" value={formatDateTime(data.generatedAt)} helper="When the result was produced." accent="slate" />
        </div>
      </SectionCard>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <SectionCard title="Topic breakdown" eyebrow="Accuracy by topic">
          <TopicBarList title="Performance" items={data.topicPerformance} emptyLabel="Topic performance is not available for this result." />
        </SectionCard>

        <SectionCard title="Answer review" eyebrow="Per question analysis">
          {data.answers.length === 0 ? (
            <EmptyState title="No answer details" description="Detailed answer review is not available for this result yet." />
          ) : (
            <div className="space-y-4">
              {data.answers.map((answer, index) => {
                const selectedText = answer.selectedOptionText ?? (answer.selectedOptionId ? answer.selectedOptionId : 'Not answered');
                const correctText = answer.correctOptionText ?? (answer.correctOptionId ? answer.correctOptionId : 'Not available');
                return (
                  <div key={`${answer.questionId}-${index}`} className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Question {index + 1}</p>
                        {answer.tags?.length ? (
                          <div className="flex flex-wrap gap-2">
                            {answer.tags.map((tag) => <TagBadge key={`${answer.questionId}-${tag.id}`} tag={tag} compact />)}
                          </div>
                        ) : null}
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${answer.isCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {answer.isCorrect ? 'Correct' : 'Review'}
                      </span>
                    </div>
                    <p className="mt-4 text-base font-medium text-slate-900">{answer.questionText}</p>
                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      <div className="rounded-2xl border border-slate-200 bg-white p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Your answer</p>
                        <p className="mt-2 text-sm text-slate-700">{selectedText}</p>
                      </div>
                      <div className="rounded-2xl border border-slate-200 bg-white p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Correct answer</p>
                        <p className="mt-2 text-sm text-slate-700">{correctText}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}

