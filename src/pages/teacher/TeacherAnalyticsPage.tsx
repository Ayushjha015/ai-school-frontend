import type { AxiosError } from 'axios';
import { useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Area, Bar, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { AnalyticsHeatmap } from '../../components/common/AnalyticsHeatmap';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingScreen } from '../../components/common/LoadingScreen';
import { SectionCard } from '../../components/common/SectionCard';
import {
  useAssignedTeacherAnalyticsGroupsQuery,
  useTeacherAnalyticsGroupStudentsQuery,
  useTeacherClassDashboardQuery,
  useTeacherStudentDashboardQuery,
} from '../../hooks/useTeacherQueries';
import type {
  DetailedTableRow,
  StudentExamResult,
  StudentSubjectMastery,
  TopPerformerEntry,
  ValidationErrorResponse,
} from '../../types/api';
import { formatDateTime, formatPercentage } from '../../utils/formatters';

const performerLimits = [5, 10, 20] as const;

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
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
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
    return 'bg-emerald-500';
  }
  if (rate >= 50) {
    return 'bg-amber-400';
  }
  return 'bg-rose-500';
}

function DateRangeControls() {
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

function TopPerformersCard({
  entries,
  limit,
  onLimitChange,
}: {
  entries: TopPerformerEntry[];
  limit: number;
  onLimitChange: (limit: number) => void;
}) {
  const navigate = useNavigate();

  return (
    <SectionCard
      title="Top performers"
      eyebrow="Highest average percentages"
      action={
        <select
          value={limit}
          onChange={(event) => onLimitChange(Number(event.target.value))}
          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
        >
          {performerLimits.map((value) => (
            <option key={value} value={value}>
              Top {value}
            </option>
          ))}
        </select>
      }
    >
      {entries.length === 0 ? (
        <EmptyState title="No top performers yet" description="No exam results available for this class yet." />
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
            <button
              key={entry.studentUserId}
              type="button"
              onClick={() => navigate(`/teacher/analytics/students/${entry.studentUserId}`)}
              className="flex w-full items-center gap-4 rounded-3xl border border-slate-200 bg-white p-4 text-left transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-950 text-sm font-semibold text-white">
                {entry.studentName
                  .split(' ')
                  .map((chunk) => chunk[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-900">{entry.rank === 1 ? '👑 #1' : `#${entry.rank}`}</span>
                  <MasteryBadge level={entry.avgPercentage >= 85 ? 'Star' : entry.avgPercentage >= 60 ? 'Achiever' : 'Learner'} />
                </div>
                <p className="mt-2 truncate text-base font-semibold text-slate-900">{entry.studentName}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold text-slate-900">{formatPercentage(entry.avgPercentage)}</p>
                <p className="text-sm text-slate-500">Open</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </SectionCard>
  );
}

function CompletionCard({
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
      <SectionCard title="Class completion rate" eyebrow="Exam slot coverage">
        <EmptyState title="No assigned exams" description="No exams have been assigned to this class yet." />
      </SectionCard>
    );
  }

  const roundedRate = Math.round(completionRate);

  return (
    <SectionCard title="Class completion rate" eyebrow="Exam slot coverage">
      <div className="space-y-4">
        <p className="text-4xl font-bold text-slate-900">{roundedRate}%</p>
        <p className="text-sm text-slate-600">{totalCompleted} of {totalAssigned} exam slots filled</p>
        <div className="space-y-2">
          <div className="h-3 rounded-full bg-slate-200">
            <div className={`h-3 rounded-full ${getCompletionColor(completionRate)}`} style={{ width: `${Math.max(6, Math.min(100, roundedRate))}%` }} />
          </div>
          <p className="text-right text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{roundedRate}% complete</p>
        </div>
      </div>
    </SectionCard>
  );
}

function AverageScoreCard({ avgPercentage, totalExamsAttempted }: { avgPercentage: number; totalExamsAttempted: number }) {
  const masteryLevel = avgPercentage >= 85 ? 'Star' : avgPercentage >= 60 ? 'Achiever' : 'Learner';

  return (
    <SectionCard title="Class average score" eyebrow="Scored attempts">
      <div className="space-y-4">
        <p className="text-4xl font-bold text-slate-900">{formatPercentage(avgPercentage)}</p>
        <p className="text-sm text-slate-600">Across {totalExamsAttempted} attempts</p>
        <MasteryBadge level={masteryLevel} />
      </div>
    </SectionCard>
  );
}

function HeatmapCard({
  subjects,
  rows,
}: {
  subjects: string[];
  rows: Array<{ masteryLevel: 'Learner' | 'Achiever' | 'Star'; cells: number[] }>;
}) {
  return (
    <SectionCard title="Academic standards heatmap" eyebrow="Subject mastery counts">
      {subjects.length === 0 ? (
        <EmptyState title="No subjects available" description="No subjects with active exams found for this class." />
      ) : (
        <AnalyticsHeatmap
          xLabels={subjects}
          yLabels={rows.map((row) => row.masteryLevel)}
          rows={rows.map((row) => ({ label: row.masteryLevel, values: row.cells }))}
          tooltipFormatter={(cell) => ({
            title: `${cell.yLabel} • ${cell.xLabel}`,
            description: `${cell.value} students are at ${cell.yLabel} level in ${cell.xLabel}.`,
          })}
        />
      )}
    </SectionCard>
  );
}

function StudentPerformanceTable({ rows }: { rows: DetailedTableRow[] }) {
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useSearchParams();
  const currentSort = sortBy.get('studentSort') ?? 'avg-desc';

  const sortedRows = [...rows].sort((left, right) => {
    switch (currentSort) {
      case 'name-asc':
        return left.studentName.localeCompare(right.studentName);
      case 'completion-desc':
        return right.completionRate - left.completionRate;
      case 'completion-asc':
        return left.completionRate - right.completionRate;
      case 'avg-asc':
        return left.avgPercentage - right.avgPercentage;
      case 'avg-desc':
      default:
        return right.avgPercentage - left.avgPercentage;
    }
  });

  if (rows.length === 0) {
    return (
      <SectionCard title="Student performance table" eyebrow="Class roster outcomes">
        <EmptyState title="No students found" description="No students found in this class." />
      </SectionCard>
    );
  }

  return (
    <SectionCard
      title="Student performance table"
      eyebrow="Class roster outcomes"
      action={
        <select
          value={currentSort}
          onChange={(event) => setSortBy((current) => buildNextSearchParams(current, { studentSort: event.target.value }))}
          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
        >
          <option value="avg-desc">Highest average</option>
          <option value="avg-asc">Lowest average</option>
          <option value="completion-desc">Best completion</option>
          <option value="completion-asc">Lowest completion</option>
          <option value="name-asc">Name A-Z</option>
        </select>
      }
    >
      <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white">
        <table className="min-w-[760px] divide-y divide-slate-200 text-left text-sm text-slate-700">
          <thead className="bg-slate-50 text-xs uppercase tracking-[0.18em] text-slate-500">
            <tr>
              <th className="px-4 py-4">Student</th>
              <th className="px-4 py-4">Avg %</th>
              <th className="px-4 py-4">Completion</th>
              <th className="px-4 py-4">Mastery</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sortedRows.map((row) => (
              <tr
                key={row.studentUserId}
                className="cursor-pointer transition hover:bg-slate-50"
                onClick={() => navigate(`/teacher/analytics/students/${row.studentUserId}${window.location.search}`)}
              >
                <td className="px-4 py-4 font-semibold text-slate-900">{row.studentName}</td>
                <td className="px-4 py-4">{formatPercentage(row.avgPercentage)}</td>
                <td className="px-4 py-4">
                  <div className="max-w-40 space-y-1">
                    <div className="h-2 rounded-full bg-slate-200">
                      <div className={`h-2 rounded-full ${getCompletionColor(row.completionRate)}`} style={{ width: `${Math.max(6, Math.min(100, Math.round(row.completionRate)))}%` }} />
                    </div>
                    <p className="text-xs text-slate-500">{formatPercentage(row.completionRate)}</p>
                  </div>
                </td>
                <td className="px-4 py-4"><MasteryBadge level={row.masteryLevel} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}

function TeacherAnalyticsClassPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedGroupId = searchParams.get('group') ?? '';
  const selectedStudentId = searchParams.get('student') ?? '';
  const from = searchParams.get('from') ?? '';
  const to = searchParams.get('to') ?? '';
  const limitParam = Number(searchParams.get('limit') ?? '5');
  const limit = performerLimits.includes(limitParam as (typeof performerLimits)[number]) ? limitParam : 5;
  const groupsQuery = useAssignedTeacherAnalyticsGroupsQuery();
  const studentsQuery = useTeacherAnalyticsGroupStudentsQuery(selectedGroupId);
  const dashboardQuery = useTeacherClassDashboardQuery(selectedGroupId, {
    from: toAnalyticsRangeDate(from),
    to: toAnalyticsRangeDate(to, true),
    limit,
  });

  const groups = groupsQuery.data ?? [];
  const selectedGroup = groups.find((group) => group.groupId === selectedGroupId) ?? null;

  useEffect(() => {
    if (!groups.length) {
      return;
    }

    if (!selectedGroupId || !groups.some((group) => group.groupId === selectedGroupId)) {
      setSearchParams(buildNextSearchParams(searchParams, { group: groups[0].groupId, student: null }));
    }
  }, [groups, searchParams, selectedGroupId, setSearchParams]);

  if (groupsQuery.isLoading) {
    return <LoadingScreen label="Loading analytics..." />;
  }

  if (groupsQuery.isError) {
    return <div className="rounded-[28px] border border-rose-200 bg-rose-50 p-8 text-rose-700">We could not load your analytics classes.</div>;
  }

  if (groups.length === 0) {
    return (
      <SectionCard title="Analytics" eyebrow="Teacher analytics">
        <EmptyState title="No classes assigned" description="You have no assigned classes yet." />
      </SectionCard>
    );
  }

  return (
    <div className="space-y-6">
      <SectionCard title="Analytics" eyebrow="Teacher analytics dashboard">
        <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Class</span>
              <select
                value={selectedGroupId}
                onChange={(event) => setSearchParams(buildNextSearchParams(searchParams, { group: event.target.value, student: null }))}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-700"
              >
                {groups.map((group) => (
                  <option key={group.groupId} value={group.groupId}>
                    {group.groupName} ({group.studentCount} students)
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Student</span>
              <select
                value={selectedStudentId}
                onChange={(event) => {
                  const nextStudentId = event.target.value;
                  setSearchParams(buildNextSearchParams(searchParams, { student: nextStudentId || null }));
                  if (nextStudentId) {
                    navigate(`/teacher/analytics/students/${nextStudentId}?${buildNextSearchParams(searchParams, { student: nextStudentId }).toString()}`);
                  }
                }}
                disabled={!selectedGroupId || studentsQuery.isLoading || studentsQuery.isError}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <option value="">Select a student...</option>
                {(studentsQuery.data ?? []).map((student) => (
                  <option key={student.studentUserId} value={student.studentUserId}>
                    {student.studentName}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <DateRangeControls />
        </div>
      </SectionCard>

      {dashboardQuery.isLoading ? (
        <LoadingScreen label="Loading class dashboard..." />
      ) : dashboardQuery.isError || !dashboardQuery.data ? (
        <SectionCard title={selectedGroup?.groupName ?? 'Class dashboard'} eyebrow="Analytics status">
          <div className="rounded-3xl border border-rose-200 bg-rose-50 p-5 text-rose-700">
            {(dashboardQuery.error as AxiosError<ValidationErrorResponse> | null)?.response?.status === 403
              ? 'You are not assigned to this class.'
              : 'We could not load this class dashboard right now.'}
            <button
              type="button"
              onClick={() => dashboardQuery.refetch()}
              className="ml-3 font-semibold underline"
            >
              Retry
            </button>
          </div>
        </SectionCard>
      ) : (
        <>
          <div className="grid gap-6 lg:grid-cols-2">
            <CompletionCard {...dashboardQuery.data.completionRate} />
            <AverageScoreCard {...dashboardQuery.data.avgScore} />
          </div>

          <TopPerformersCard
            entries={dashboardQuery.data.topPerformers.entries}
            limit={limit}
            onLimitChange={(nextLimit) => setSearchParams(buildNextSearchParams(searchParams, { limit: String(nextLimit) }))}
          />

          <HeatmapCard subjects={dashboardQuery.data.heatmap.subjects} rows={dashboardQuery.data.heatmap.rows} />
          <StudentPerformanceTable rows={dashboardQuery.data.performanceTable.rows} />
        </>
      )}
    </div>
  );
}

function SubjectMasteryRow({ items }: { items: StudentSubjectMastery[] }) {
  return (
    <SectionCard title="Subject mastery" eyebrow="Per-subject standing">
      {items.length === 0 ? (
        <EmptyState title="No mastery data" description="No subject mastery data is available for this student yet." />
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-1">
          {items.map((item) => (
            <div key={item.subjectId} className="min-w-[220px] rounded-3xl border border-slate-200 bg-white p-5">
              <p className="text-sm font-semibold text-slate-900">{item.subjectName}</p>
              <p className="mt-3 text-2xl font-semibold text-slate-900">{formatPercentage(item.avgPercentage)}</p>
              <div className="mt-3">
                <MasteryBadge level={item.masteryLevel} faded={item.avgPercentage <= 0} />
              </div>
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}

function ProgressionCard({ items }: { items: StudentExamResult[] }) {
  const chartData = items.map((item) => ({
    examTitle: truncateLabel(item.examTitle),
    percentage: Math.round(item.percentage),
  }));

  return (
    <SectionCard title="Performance progression" eyebrow="Chronological exam trend">
      {items.length === 0 ? (
        <EmptyState title="No progression data" description="This student has no completed exam history in the selected range." />
      ) : (
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 16, right: 16, left: 0, bottom: 16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
              <XAxis dataKey="examTitle" tick={{ fontSize: 12, fill: '#64748b' }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#64748b' }} />
              <Tooltip />
              <Area type="monotone" dataKey="percentage" fill="#10b981" fillOpacity={0.08} stroke="none" />
              <Bar dataKey="percentage" fill="#34d399" radius={[8, 8, 0, 0]} maxBarSize={48} />
              <Line type="monotone" dataKey="percentage" stroke="#0f172a" strokeWidth={2} dot={{ r: 4, fill: '#0f172a' }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
    </SectionCard>
  );
}

function ExamHistoryTable({ items }: { items: StudentExamResult[] }) {
  return (
    <SectionCard title="Exam history" eyebrow="Detailed performance table">
      {items.length === 0 ? (
        <EmptyState title="No exam history" description="No exam history is available for this student in the selected range." />
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white">
          <table className="min-w-[820px] divide-y divide-slate-200 text-left text-sm text-slate-700">
            <thead className="bg-slate-50 text-xs uppercase tracking-[0.18em] text-slate-500">
              <tr>
                <th className="px-4 py-4">Exam</th>
                <th className="px-4 py-4">Score</th>
                <th className="px-4 py-4">Percentage</th>
                <th className="px-4 py-4">Submitted</th>
                <th className="px-4 py-4">Topics</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item) => (
                <tr key={item.examId}>
                  <td className="px-4 py-4 font-semibold text-slate-900">{item.examTitle}</td>
                  <td className="px-4 py-4">{item.score}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <span>{formatPercentage(item.percentage)}</span>
                      <MasteryBadge level={item.percentage >= 85 ? 'Star' : item.percentage >= 60 ? 'Achiever' : 'Learner'} />
                    </div>
                  </td>
                  <td className="px-4 py-4">{formatDateTime(item.submittedAt)}</td>
                  <td className="px-4 py-4">
                    <div className="space-y-1">
                      {(item.topicBreakdown ?? []).slice(0, 2).map((topic) => (
                        <div key={`${item.examId}-${topic.topic ?? 'uncategorised'}`} className="text-xs text-slate-500">
                          {topic.topic || 'Uncategorised'}: {formatPercentage(topic.accuracy)}
                        </div>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </SectionCard>
  );
}

function TeacherAnalyticsStudentDashboardPage() {
  const navigate = useNavigate();
  const { studentUserId = '' } = useParams();
  const [searchParams] = useSearchParams();
  const selectedGroupId = searchParams.get('group') ?? '';
  const from = searchParams.get('from') ?? '';
  const to = searchParams.get('to') ?? '';
  const limit = searchParams.get('limit') ?? '5';
  const groupsQuery = useAssignedTeacherAnalyticsGroupsQuery();
  const dashboardQuery = useTeacherStudentDashboardQuery(studentUserId, {
    from: toAnalyticsRangeDate(from),
    to: toAnalyticsRangeDate(to, true),
  });
  const selectedGroup = (groupsQuery.data ?? []).find((group) => group.groupId === selectedGroupId) ?? null;

  if (dashboardQuery.isLoading) {
    return <LoadingScreen label="Loading student analytics..." />;
  }

  if (dashboardQuery.isError) {
    const statusCode = (dashboardQuery.error as AxiosError<ValidationErrorResponse> | null)?.response?.status;
    const message = statusCode === 403
      ? 'This student does not belong to your assigned classes.'
      : statusCode === 404
        ? 'Student not found.'
        : 'We could not load this student dashboard.';

    return (
      <SectionCard title="Student analytics" eyebrow="Teacher drill-down">
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-5 text-rose-700">
          {message}
          <button
            type="button"
            onClick={() => navigate(`/teacher/analytics?${buildNextSearchParams(searchParams, { limit }).toString()}`)}
            className="ml-3 font-semibold underline"
          >
            Back to class analytics
          </button>
        </div>
      </SectionCard>
    );
  }

  if (!dashboardQuery.data) {
    return (
      <SectionCard title="Student analytics" eyebrow="Teacher drill-down">
        <EmptyState title="Student not found" description="Student not found." actionLabel="Back to class analytics" actionTo={`/teacher/analytics?${searchParams.toString()}`} />
      </SectionCard>
    );
  }

  const studentData = dashboardQuery.data;

  return (
    <div className="space-y-6">
      <SectionCard title={studentData.studentName} eyebrow="Teacher student analytics">
        <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => navigate(`/teacher/analytics?${searchParams.toString()}`)}
              className="inline-flex rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-950"
            >
              ← Back to {selectedGroup?.groupName ?? 'class analytics'}
            </button>
            <p className="text-sm text-slate-600">Review this student’s completion, progression, subject mastery, and exam history across the selected time range.</p>
          </div>
          <DateRangeControls />
        </div>
      </SectionCard>

      <div className="grid gap-6 lg:grid-cols-2">
        <CompletionCard {...studentData.completionRate} />
        <AverageScoreCard {...studentData.avgScore} />
      </div>

      <ProgressionCard items={studentData.performanceTable} />
      <SubjectMasteryRow items={studentData.heatmap.subjectMasteries} />
      <ExamHistoryTable items={studentData.performanceTable} />
    </div>
  );
}

export function TeacherAnalyticsPage() {
  return <TeacherAnalyticsClassPage />;
}

export function TeacherAnalyticsStudentPage() {
  return <TeacherAnalyticsStudentDashboardPage />;
}
