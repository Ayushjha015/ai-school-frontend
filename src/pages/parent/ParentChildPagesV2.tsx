import type { AxiosError } from 'axios';
import { Fragment, useEffect, useMemo, useState } from 'react';
import { Bar, CartesianGrid, Cell, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { EmptyState } from '../../components/common/EmptyState';
import { SectionCard } from '../../components/common/SectionCard';
import { useParentAnalyticsChildrenQuery, useParentChildDashboardQuery } from '../../hooks/useParentQueries';
import type { LinkedChildSummary, ProgressionPoint, StudentExamResult, StudentSubjectMastery, TopicPerformance, ValidationErrorResponse } from '../../types/api';
import { formatDateTime, formatPercentage } from '../../utils/formatters';
export { ParentChildExamsPage, ParentChildResultDetailPage, ParentChildResultsPage } from './ParentChildPages';

function buildNextSearchParams(
  current: URLSearchParams,
  updates: Record<string, string | null | undefined>,
) {
  const next = new URLSearchParams(current);

  Object.entries(updates).forEach(([key, value]) => {
    if (!value) {
      next.delete(key);
    } else {
      next.set(key, value);
    }
  });

  return next;
}

function toAnalyticsRangeDate(value?: string | null, endOfDay = false) {
  if (!value) {
    return undefined;
  }

  const clock = endOfDay ? 'T23:59:59' : 'T00:00:00';
  const date = new Date(`${value}${clock}`);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

function formatFilterDate(value?: string | null) {
  if (!value) {
    return 'All time';
  }

  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
}

function truncateLabel(value: string, max = 20) {
  return value.length > max ? `${value.slice(0, max - 1)}...` : value;
}

function getMasteryLevel(percentage: number) {
  if (percentage >= 85) {
    return 'Star' as const;
  }
  if (percentage >= 60) {
    return 'Achiever' as const;
  }
  return 'Learner' as const;
}

function getMasteryTone(level: 'Star' | 'Achiever' | 'Learner', faded = false) {
  const base = {
    Star: 'bg-amber-100 text-amber-800 border-amber-200',
    Achiever: 'bg-blue-100 text-blue-700 border-blue-200',
    Learner: 'bg-slate-100 text-slate-600 border-slate-200',
  }[level];

  return `${base} ${faded ? 'opacity-50' : ''}`;
}

function getMasteryIcon(level: 'Star' | 'Achiever' | 'Learner') {
  return {
    Star: '★',
    Achiever: '◎',
    Learner: '○',
  }[level];
}

function MasteryBadge({ level, faded = false }: { level: 'Star' | 'Achiever' | 'Learner'; faded?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${getMasteryTone(level, faded)}`}>
      <span>{getMasteryIcon(level)}</span>
      <span>{level}</span>
    </span>
  );
}

function getCompletionColor(rate: number) {
  if (rate >= 80) {
    return 'bg-emerald-500 text-emerald-600';
  }
  if (rate >= 50) {
    return 'bg-amber-400 text-amber-500';
  }
  return 'bg-rose-500 text-rose-500';
}

function getAccuracyColor(rate: number) {
  if (rate >= 75) {
    return '#10B981';
  }
  if (rate >= 50) {
    return '#F59E0B';
  }
  return '#EF4444';
}

function getProgressionBarColor(rate: number) {
  if (rate >= 85) {
    return '#F59E0B';
  }
  if (rate >= 60) {
    return '#3B82F6';
  }
  return '#9CA3AF';
}

function ParentAnalyticsDateRangeControls() {
  const [searchParams, setSearchParams] = useSearchParams();
  const from = searchParams.get('from') ?? '';
  const to = searchParams.get('to') ?? '';

  return (
    <div className="space-y-3 rounded-3xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-slate-900">Date range</p>
        <button
          type="button"
          onClick={() => setSearchParams(buildNextSearchParams(searchParams, { from: null, to: null }))}
          className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 transition hover:text-slate-900"
        >
          Clear
        </button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">From</span>
          <input
            type="date"
            value={from}
            onChange={(event) => setSearchParams(buildNextSearchParams(searchParams, { from: event.target.value || null }))}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3"
          />
        </label>
        <label className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">To</span>
          <input
            type="date"
            value={to}
            onChange={(event) => setSearchParams(buildNextSearchParams(searchParams, { to: event.target.value || null }))}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3"
          />
        </label>
      </div>
      <p className="text-xs text-slate-500">
        {from || to ? `${formatFilterDate(from)} to ${formatFilterDate(to)}` : 'All-time analytics'}
      </p>
    </div>
  );
}

function DashboardShellError({ title, description, onRetry }: { title: string; description: string; onRetry: () => void }) {
  return (
    <SectionCard title={title} eyebrow="Analytics status">
      <div className="rounded-3xl border border-rose-200 bg-rose-50 p-5 text-rose-700">
        {description}
        <button type="button" onClick={onRetry} className="ml-3 font-semibold underline">
          Retry
        </button>
      </div>
    </SectionCard>
  );
}

function AnalyticsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="rounded-[28px] border border-slate-200 bg-white p-6">
        <div className="h-8 w-48 rounded-full bg-slate-200" />
        <div className="mt-4 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="h-28 rounded-3xl bg-slate-100" />
          <div className="h-28 rounded-3xl bg-slate-100" />
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-44 rounded-3xl border border-slate-200 bg-white" />
        ))}
      </div>
      <div className="h-96 rounded-3xl border border-slate-200 bg-white" />
      <div className="h-64 rounded-3xl border border-slate-200 bg-white" />
      <div className="h-[28rem] rounded-3xl border border-slate-200 bg-white" />
    </div>
  );
}

function CompletionRateCard({
  totalAssigned,
  totalCompleted,
  completionRate,
}: {
  totalAssigned: number;
  totalCompleted: number;
  completionRate: number;
}) {
  if (totalAssigned === 0) {
    return (
      <SectionCard title="Completion Rate" eyebrow="Assigned exams">
        <EmptyState title="No exams assigned" description="No exams assigned to your child's class yet." />
      </SectionCard>
    );
  }

  const rounded = Math.round(completionRate);
  const tone = getCompletionColor(completionRate);
  const barClass = tone.split(' ')[0];
  const textClass = tone.split(' ')[1];

  return (
    <SectionCard title="Completion Rate" eyebrow="Assigned exams">
      <div className="space-y-4">
        <p className={`text-4xl font-bold ${textClass}`}>{rounded}%</p>
        <p className="text-sm text-slate-600">{totalCompleted} of {totalAssigned} exams completed</p>
        <div className="space-y-2">
          <div className="h-3 rounded-full bg-slate-200">
            <div className={`h-3 rounded-full ${barClass}`} style={{ width: `${Math.max(6, Math.min(100, rounded))}%` }} />
          </div>
          <p className="text-right text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{rounded}%</p>
        </div>
      </div>
    </SectionCard>
  );
}

function AverageScoreCard({ avgPercentage, totalExamsAttempted }: { avgPercentage: number; totalExamsAttempted: number }) {
  if (totalExamsAttempted === 0) {
    return (
      <SectionCard title="Avg Score" eyebrow="Completed exams">
        <EmptyState title="No completed exams" description="Complete your first exam to see your score." />
      </SectionCard>
    );
  }

  return (
    <SectionCard title="Avg Score" eyebrow="Completed exams">
      <div className="space-y-4">
        <p className="text-4xl font-bold text-slate-900">{formatPercentage(avgPercentage)}</p>
        <p className="text-sm text-slate-600">Across {totalExamsAttempted} exams</p>
        <MasteryBadge level={getMasteryLevel(avgPercentage)} />
      </div>
    </SectionCard>
  );
}

function RankCard({ rankInClass, classSize }: { rankInClass: number | null; classSize: number }) {
  return (
    <SectionCard title="Rank in Class" eyebrow="Current standing">
      <div className="space-y-4">
        <p className="text-4xl font-bold text-slate-900">
          {rankInClass === null ? '—' : rankInClass === 1 ? '👑 #1' : `#${rankInClass}`}
        </p>
        <p className="text-sm text-slate-600">
          {rankInClass === null ? 'No exam results yet' : `Out of ${classSize} students`}
        </p>
      </div>
    </SectionCard>
  );
}

function ClassSizeCard({ classSize }: { classSize: number }) {
  return (
    <SectionCard title="Class Size" eyebrow="Cohort">
      <div className="space-y-4">
        <p className="text-4xl font-bold text-slate-900">{classSize}</p>
        <p className="text-sm text-slate-600">Students in this class</p>
      </div>
    </SectionCard>
  );
}

function ProgressionTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: { examTitle: string; percentage: number; submittedAt: string | null } }>;
}) {
  if (!active || !payload?.length) {
    return null;
  }

  const { examTitle, percentage, submittedAt } = payload[0].payload;
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3 text-sm shadow-lg">
      <p className="font-semibold text-slate-900">{examTitle}</p>
      <p className="mt-1 text-slate-700">Score: {formatPercentage(percentage)}</p>
      <p className="mt-1 text-slate-500">Date: {submittedAt ? formatDateTime(submittedAt) : '—'}</p>
    </div>
  );
}

function ProgressionCard({ items }: { items: ProgressionPoint[] }) {
  if (items.length === 0) {
    return (
      <SectionCard title="Performance Progression" eyebrow="Chronological trend">
        <EmptyState title="No progression yet" description="Complete your first exam to see your progression." />
      </SectionCard>
    );
  }

  const chartData = items.map((item) => ({
    examId: item.examId,
    examTitle: item.examTitle,
    shortTitle: truncateLabel(item.examTitle),
    percentage: Number(item.percentage.toFixed(2)),
    submittedAt: item.submittedAt ?? null,
  }));

  return (
    <SectionCard title="Performance Progression" eyebrow="Exam-by-exam trend">
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 16, right: 24, bottom: 32, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
            <XAxis
              dataKey="shortTitle"
              tick={{ fontSize: 12, fill: '#64748b' }}
              angle={-30}
              textAnchor="end"
              interval={0}
              height={70}
            />
            <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} tick={{ fontSize: 12, fill: '#64748b' }} />
            <Tooltip content={<ProgressionTooltip />} />
            <Bar dataKey="percentage" radius={[6, 6, 0, 0]}>
              {chartData.map((point) => (
                <Cell key={point.examId} fill={getProgressionBarColor(point.percentage)} />
              ))}
            </Bar>
            {chartData.length >= 2 ? (
              <Line type="monotone" dataKey="percentage" stroke="#6366F1" strokeWidth={2} dot={false} />
            ) : null}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </SectionCard>
  );
}

function SubjectMasteryRow({ items }: { items: StudentSubjectMastery[] }) {
  return (
    <SectionCard title="Subject Mastery" eyebrow="Per-subject standing">
      {items.length === 0 ? (
        <EmptyState title="No subject data" description="No subjects with active exams found." />
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-1">
          {items.map((item) => {
            const noAttemptsYet = item.avgPercentage <= 0 && item.masteryLevel === 'Learner';
            return (
              <div key={item.subjectId} className={`min-w-[220px] rounded-3xl border p-5 ${getMasteryTone(item.masteryLevel, noAttemptsYet)}`}>
                <p className="text-sm font-semibold">{item.subjectName}</p>
                <p className="mt-3 text-2xl font-semibold">{noAttemptsYet ? '—' : formatPercentage(item.avgPercentage)}</p>
                <div className="mt-3">
                  <MasteryBadge level={item.masteryLevel} faded={noAttemptsYet} />
                </div>
                <p className="mt-3 text-sm">{noAttemptsYet ? 'No attempts yet' : 'Average in this subject'}</p>
              </div>
            );
          })}
        </div>
      )}
    </SectionCard>
  );
}

function TopicBreakdownBars({ items }: { items: TopicPerformance[] }) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={`${item.topic ?? 'uncategorised'}-${item.accuracy}`} className="flex items-center gap-3">
          <span className="w-32 truncate text-sm text-slate-600">{item.topic || 'Uncategorised'}</span>
          <div className="h-2 flex-1 rounded-full bg-slate-100">
            <div
              className="h-2 rounded-full"
              style={{ width: `${Math.max(4, Math.min(100, Math.round(item.accuracy)))}%`, background: getAccuracyColor(item.accuracy) }}
            />
          </div>
          <span className="w-12 text-right text-xs text-slate-500">{formatPercentage(item.accuracy)}</span>
        </div>
      ))}
    </div>
  );
}

function ExamHistoryTable({ items }: { items: StudentExamResult[] }) {
  const [showAll, setShowAll] = useState(false);
  const [openExamId, setOpenExamId] = useState<string | null>(null);

  if (items.length === 0) {
    return (
      <SectionCard title="Exam History" eyebrow="Detailed results">
        <EmptyState title="No exam history" description="You haven't completed any exams yet." />
      </SectionCard>
    );
  }

  const visibleItems = showAll ? items : items.slice(0, 10);

  return (
    <SectionCard
      title="Exam History"
      eyebrow="Detailed results"
      action={!showAll && items.length > 10 ? (
        <button
          type="button"
          onClick={() => setShowAll(true)}
          className="text-sm font-semibold text-slate-700 transition hover:text-slate-950"
        >
          Show all {items.length} results
        </button>
      ) : undefined}
    >
      <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white">
        <table className="min-w-[920px] divide-y divide-slate-200 text-left text-sm text-slate-700">
          <thead className="bg-slate-50 text-xs uppercase tracking-[0.18em] text-slate-500">
            <tr>
              <th className="px-4 py-4">Exam</th>
              <th className="px-4 py-4">Score</th>
              <th className="px-4 py-4">Percentage</th>
              <th className="px-4 py-4">Result</th>
              <th className="px-4 py-4">Date</th>
              <th className="px-4 py-4">Topics</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {visibleItems.map((item) => {
              const isOpen = openExamId === item.examId;
              return (
                <Fragment key={item.examId}>
                  <tr
                    className="cursor-pointer transition hover:bg-slate-50"
                    onClick={() => setOpenExamId((current) => (current === item.examId ? null : item.examId))}
                  >
                    <td className="px-4 py-4 font-semibold text-slate-900" title={item.examTitle}>
                      {truncateLabel(item.examTitle, 30)}
                    </td>
                    <td className="px-4 py-4">{item.score}</td>
                    <td className="px-4 py-4">{formatPercentage(item.percentage)}</td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${item.passed ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                        {item.passed ? 'Pass' : 'Fail'}
                      </span>
                    </td>
                    <td className="px-4 py-4">{item.submittedAt ? formatDateTime(item.submittedAt) : '—'}</td>
                    <td className="px-4 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                      {isOpen ? '▼ Hide' : '▶ View'}
                    </td>
                  </tr>
                  {isOpen ? (
                    <tr>
                      <td colSpan={6} className="bg-slate-50 px-4 py-4">
                        {(item.topicBreakdown ?? []).length > 0 ? (
                          <TopicBreakdownBars items={item.topicBreakdown ?? []} />
                        ) : (
                          <p className="text-sm text-slate-500">No topic breakdown available.</p>
                        )}
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}

function ChildSelector({
  children,
  selectedStudentUserId,
}: {
  children: LinkedChildSummary[];
  selectedStudentUserId: string;
}) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  if (children.length <= 1) {
    return null;
  }

  if (children.length <= 4) {
    return (
      <div className="flex flex-wrap gap-2">
        {children.map((child) => {
          const active = child.studentUserId === selectedStudentUserId;
          return (
            <button
              key={child.studentUserId}
              type="button"
              onClick={() => navigate(`/parent/children/${child.studentUserId}/analytics?${searchParams.toString()}`)}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${active ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:text-slate-950'}`}
            >
              {child.studentName}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <select
      value={selectedStudentUserId}
      onChange={(event) => navigate(`/parent/children/${event.target.value}/analytics?${searchParams.toString()}`)}
      className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-700"
    >
      {children.map((child) => (
        <option key={child.studentUserId} value={child.studentUserId}>
          {child.studentName}
        </option>
      ))}
    </select>
  );
}

export function ParentChildAnalyticsPage() {
  const { studentUserId = '' } = useParams();
  const [searchParams] = useSearchParams();
  const from = searchParams.get('from') ?? '';
  const to = searchParams.get('to') ?? '';

  const filters = useMemo(
    () => ({
      from: toAnalyticsRangeDate(from),
      to: toAnalyticsRangeDate(to, true),
    }),
    [from, to],
  );

  const childrenQuery = useParentAnalyticsChildrenQuery();
  const dashboardQuery = useParentChildDashboardQuery(studentUserId, filters);

  useEffect(() => {
    const statusCode = (dashboardQuery.error as AxiosError<ValidationErrorResponse> | null)?.response?.status;
    if (statusCode === 401) {
      window.location.assign('/login');
    }
  }, [dashboardQuery.error]);

  if (childrenQuery.isLoading || dashboardQuery.isLoading) {
    return <AnalyticsSkeleton />;
  }

  const linkedChildren = childrenQuery.data ?? [];
  const selectedChild = linkedChildren.find((child) => child.studentUserId === studentUserId) ?? null;
  const statusCode = (dashboardQuery.error as AxiosError<ValidationErrorResponse> | null)?.response?.status;

  if (statusCode === 404) {
    return (
      <SectionCard title="Child Analytics" eyebrow="Parent view">
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-700">
          Child not found.
          <Link to="/parent/children" className="ml-3 font-semibold underline">
            Back to My Children
          </Link>
        </div>
      </SectionCard>
    );
  }

  if (statusCode === 403) {
    return (
      <SectionCard title="Child Analytics" eyebrow="Parent view">
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-700">
          This child is not linked to your account.
          <Link to="/parent/children" className="ml-3 font-semibold underline">
            Back to My Children
          </Link>
        </div>
      </SectionCard>
    );
  }

  if (childrenQuery.isError || dashboardQuery.isError || !dashboardQuery.data) {
    return (
      <DashboardShellError
        title="Child Analytics"
        description="Failed to load this child's analytics dashboard right now."
        onRetry={() => {
          void childrenQuery.refetch();
          void dashboardQuery.refetch();
        }}
      />
    );
  }

  const dashboard = dashboardQuery.data;

  return (
    <div className="space-y-6">
      <SectionCard title="Child Analytics" eyebrow="Parent dashboard">
        <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <Link to="/parent/children" className="inline-flex rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-950">
              ← My Children
            </Link>
            <ChildSelector children={linkedChildren} selectedStudentUserId={studentUserId} />
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-slate-900">{dashboard.studentName}</h2>
              <p className={`text-sm ${selectedChild?.groupName ? 'text-slate-600' : 'text-slate-400'}`}>
                {selectedChild?.groupName ?? 'Class not assigned'}
              </p>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                {from || to ? `${formatFilterDate(from)} to ${formatFilterDate(to)}` : 'All-time analytics'}
              </p>
            </div>
          </div>
          <ParentAnalyticsDateRangeControls />
        </div>
      </SectionCard>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <CompletionRateCard {...dashboard.completionRate} />
        <AverageScoreCard {...dashboard.avgScore} />
        <RankCard rankInClass={dashboard.rankInClass} classSize={dashboard.classSize} />
        <ClassSizeCard classSize={dashboard.classSize} />
      </div>

      <ProgressionCard items={dashboard.progression.points} />
      <SubjectMasteryRow items={dashboard.heatmap.subjectMasteries} />
      <ExamHistoryTable items={dashboard.performanceTable} />
    </div>
  );
}
