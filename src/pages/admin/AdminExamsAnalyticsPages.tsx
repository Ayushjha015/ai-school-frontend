import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingScreen } from '../../components/common/LoadingScreen';
import { PaginationFooter } from '../../components/common/PaginationFooter';
import { SectionCard } from '../../components/common/SectionCard';
import { StatCard } from '../../components/common/StatCard';
import { TopicBarList } from '../../components/common/TopicBarList';
import {
  useAdminDashboardStatsQuery,
  useAdminExamOverviewQuery,
  useAdminExamQuery,
  useAdminExamResultsQuery,
  useAdminExamsQuery,
  useAdminGroupPerformanceQuery,
  useAdminGroupsQuery,
  useAdminOrgOverviewQuery,
  useAdminSubjectOverviewQuery,
  useAdminSubjectsQuery,
} from '../../hooks/useAdminQueries';
import { formatDateTime, formatPercentage, formatRelativeWindow } from '../../utils/formatters';
import { getStatusTone } from '../../utils/statusStyles';
import { IconLabel } from '../../utils/appIcons';

const examFilters = ['all', 'draft', 'published', 'ended'] as const;
const examPageSizeOptions = [10, 20, 50] as const;

function formatExamListLabel(value: string) {
  return value
    .split('_')
    .filter(Boolean)
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(' ');
}

export function AdminDashboardPage() {
  const dashboardStatsQuery = useAdminDashboardStatsQuery();
  const overviewQuery = useAdminOrgOverviewQuery();

  if (overviewQuery.isLoading) return <LoadingScreen label="Loading admin dashboard..." />;
  if (overviewQuery.isError || !overviewQuery.data) return <div className="rounded-[28px] border border-rose-200 bg-rose-50 p-8 text-rose-700">Admin dashboard data is unavailable right now.</div>;

  const overview = overviewQuery.data;

  return (
    <div className="space-y-6">
      <SectionCard title="Admin operations snapshot" eyebrow="Dashboard stats">
        {dashboardStatsQuery.isLoading ? (
          <LoadingScreen label="Loading dashboard stats..." />
        ) : dashboardStatsQuery.isError || !dashboardStatsQuery.data ? (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
            <p>Dashboard stats are unavailable right now.</p>
            <button
              type="button"
              onClick={() => dashboardStatsQuery.refetch()}
              className="mt-4 rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-500"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <StatCard label="Total teachers" value={dashboardStatsQuery.data.totalTeachers} helper="Teachers currently active in the organization." accent="blue" />
              <StatCard label="Total classes" value={dashboardStatsQuery.data.totalClasses} helper="Classes configured for this organization." accent="amber" />
              <StatCard label="Total students" value={dashboardStatsQuery.data.totalStudents} helper="Students currently enrolled across classes." accent="emerald" />
              <StatCard label="Class strength rows" value={dashboardStatsQuery.data.classStrengths.length} helper="Classes returned in the latest strength snapshot." accent="slate" />
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Class strength</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">Student count by class</h2>
              </div>
              {dashboardStatsQuery.data.classStrengths.length === 0 ? (
                <EmptyState title="No class strength data yet" description="Class strength will appear here once classes and students are available." />
              ) : (
                <div className="grid gap-4 xl:grid-cols-2">
                  {dashboardStatsQuery.data.classStrengths.map((group) => (
                    <div key={group.groupId} className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-950/70">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{group.groupName}</h3>
                          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{group.studentCount} students</p>
                        </div>
                        <Link
                          to={`/admin/groups/${group.groupId}`}
                          className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 dark:border-slate-600 dark:text-slate-200"
                        >
                          View class
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </SectionCard>

      <SectionCard title={overview.organizationName} eyebrow="Org admin dashboard">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total exams" value={overview.totalExams} helper="Exams created within this organization." accent="blue" />
          <StatCard label="Total attempts" value={overview.totalAttempts} helper="Student attempts recorded so far." accent="emerald" />
          <StatCard label="Average percentage" value={formatPercentage(overview.avgPercentage)} helper="Overall organization performance." accent="amber" />
          <StatCard label="At-risk students" value={overview.atRiskStudents.length} helper="Students currently below the configured threshold." accent="rose" />
        </div>
      </SectionCard>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <SectionCard title="At-risk students" eyebrow="Needs attention">
          {overview.atRiskStudents.length === 0 ? (
            <EmptyState title="No at-risk students" description="No students currently fall below the organization threshold." />
          ) : (
            <div className="space-y-4">
              {overview.atRiskStudents.map((student) => (
                <Link key={student.studentId} to={`/admin/students/${student.studentId}`} className="block rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-950/70">
                  <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{student.studentName}</h3>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Average percentage: {formatPercentage(student.avgPercentage)}</p>
                </Link>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard title="Quick access" eyebrow="Navigation">
          <div className="grid gap-3">
            <Link to="/admin/groups" className="rounded-3xl border border-slate-200 bg-white px-5 py-4 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-950 dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:text-white"><IconLabel label="Manage classes" /></Link>
            <Link to="/admin/students" className="rounded-3xl border border-slate-200 bg-white px-5 py-4 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-950 dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:text-white"><IconLabel label="Review students" /></Link>
            <Link to="/admin/exams" className="rounded-3xl border border-slate-200 bg-white px-5 py-4 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-950 dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:text-white"><IconLabel label="Monitor exams" /></Link>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

export function AdminExamsPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState<(typeof examPageSizeOptions)[number]>(10);
  const [status, setStatus] = useState<(typeof examFilters)[number]>('all');
  const [search, setSearch] = useState('');
  const { data, isLoading, isError } = useAdminExamsQuery(page, limit, status === 'all' ? undefined : status);
  const searchTerm = search.trim().toLowerCase();
  const visibleExams = useMemo(() => {
    if (!data) {
      return [];
    }

    if (!searchTerm) {
      return data.items;
    }

    return data.items.filter((exam) => {
      return [exam.title, exam.status, exam.approvalStatus]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(searchTerm));
    });
  }, [data, searchTerm]);

  if (isLoading) return <LoadingScreen label="Loading exams..." />;
  if (isError || !data) return <div className="rounded-[28px] border border-rose-200 bg-rose-50 p-8 text-rose-700">Exam data is unavailable right now.</div>;

  return (
    <div className="space-y-6">
      <SectionCard title="Exams" eyebrow="Organization exam list">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search by title, status, or approval..."
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-300 dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-100"
          />
          <div className="flex rounded-full border border-slate-200 bg-slate-100 p-1 dark:border-slate-700 dark:bg-slate-950/70">
            {examFilters.map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => {
                  setStatus(filter);
                  setPage(1);
                }}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${status === filter ? 'bg-slate-950 text-white shadow-sm dark:bg-slate-50 dark:text-slate-950' : 'text-slate-600 hover:text-slate-950 dark:text-slate-400 dark:hover:text-slate-100'}`}
              >
                {formatExamListLabel(filter)}
              </button>
            ))}
          </div>
        </div>

        {visibleExams.length === 0 ? (
          <div className="mt-6">
            <EmptyState
              title={data.items.length === 0 ? 'No exams found' : 'No matching exams'}
              description={data.items.length === 0 ? 'Switch the filter or wait for teachers to create and publish exams.' : 'Clear the search or try a different status filter.'}
            />
          </div>
        ) : (
          <>
          <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white/80 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-950/70">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] text-left text-sm">
                <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:bg-slate-900/80 dark:text-slate-400">
                  <tr>
                    <th className="px-5 py-4">S.No</th>
                    <th className="px-5 py-4">Title</th>
                    <th className="px-5 py-4">Question count</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">Approval status</th>
                    <th className="px-5 py-4">Created at</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {visibleExams.map((exam, index) => (
                    <tr
                      key={exam.id}
                      tabIndex={0}
                      onClick={() => navigate(`/admin/exams/${exam.id}`)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          navigate(`/admin/exams/${exam.id}`);
                        }
                      }}
                      className="cursor-pointer text-slate-700 transition hover:bg-slate-50 focus:bg-slate-50 focus:outline-none dark:text-slate-300 dark:hover:bg-slate-900/70 dark:focus:bg-slate-900/70"
                    >
                      <td className="px-5 py-4 text-xs font-semibold text-slate-400">{(page - 1) * limit + index + 1}</td>
                      <td className="px-5 py-4">
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-slate-100">{exam.title}</p>
                          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{formatRelativeWindow(exam.startTime, exam.endTime)}</p>
                        </div>
                      </td>
                      <td className="px-5 py-4 font-semibold">{exam.questionCount ?? 0}</td>
                      <td className="px-5 py-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${getStatusTone(exam.status)}`}>{formatExamListLabel(exam.status)}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${getStatusTone(exam.approvalStatus)}`}>{formatExamListLabel(exam.approvalStatus)}</span>
                      </td>
                      <td className="px-5 py-4 text-slate-600 dark:text-slate-400">{formatDateTime(exam.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <PaginationFooter
            page={page}
            total={data.total}
            size={data.size}
            pages={data.pages}
            limit={limit}
            options={examPageSizeOptions}
            onLimitChange={(nextLimit) => {
              setLimit(nextLimit as (typeof examPageSizeOptions)[number]);
              setPage(1);
            }}
            onPageChange={setPage}
          />
          </>
        )}
      </SectionCard>
    </div>
  );
}

export function AdminExamDetailPage() {
  const { examId = '' } = useParams();
  const examQuery = useAdminExamQuery(examId);
  const resultsQuery = useAdminExamResultsQuery(examId, 1, 50);
  const overviewQuery = useAdminExamOverviewQuery(examId);

  if (examQuery.isLoading || resultsQuery.isLoading || overviewQuery.isLoading) return <LoadingScreen label="Loading exam detail..." />;
  if (examQuery.isError || resultsQuery.isError || overviewQuery.isError || !examQuery.data || !resultsQuery.data || !overviewQuery.data) {
    return <div className="rounded-[28px] border border-rose-200 bg-rose-50 p-8 text-rose-700">Exam detail is unavailable right now.</div>;
  }

  const exam = examQuery.data;
  const overview = overviewQuery.data;

  return (
    <div className="space-y-6">
      <SectionCard title={exam.title} eyebrow="Exam detail">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Status" value={exam.status} helper="Current exam lifecycle stage." accent="slate" />
          <StatCard label="Assigned" value={overview.totalAssigned} helper="Students assigned to this exam." accent="blue" />
          <StatCard label="Attempted" value={overview.totalAttempted} helper="Students who completed the exam." accent="emerald" />
          <StatCard label="Pass rate" value={formatPercentage(overview.passRate)} helper="Overall pass rate across attempts." accent="amber" />
        </div>
      </SectionCard>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <SectionCard title="Topic breakdown" eyebrow="Exam analytics">
          <TopicBarList title="Topics" items={overview.topicBreakdown} emptyLabel="No topic performance data available yet." />
        </SectionCard>

        <SectionCard title="Student results" eyebrow="Attempt list">
          {resultsQuery.data.items.length === 0 ? (
            <EmptyState title="No attempts yet" description="Student attempts will appear here once the exam has been taken." />
          ) : (
            <div className="space-y-4">
              {resultsQuery.data.items.map((result) => (
                <div key={result.attemptId} className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-950/70">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{result.studentName ?? 'Student'}</h3>
                      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Score: {result.score} • {formatPercentage(result.percentage)}</p>
                    </div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{formatDateTime(result.generatedAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}

export function AdminAnalyticsPage() {
  const overviewQuery = useAdminOrgOverviewQuery();
  const groupsQuery = useAdminGroupsQuery(1, 100);
  const subjectsQuery = useAdminSubjectsQuery(1, 100);

  if (overviewQuery.isLoading || groupsQuery.isLoading || subjectsQuery.isLoading) return <LoadingScreen label="Loading analytics..." />;
  if (overviewQuery.isError || groupsQuery.isError || subjectsQuery.isError || !overviewQuery.data || !groupsQuery.data || !subjectsQuery.data) {
    return <div className="rounded-[28px] border border-rose-200 bg-rose-50 p-8 text-rose-700">Analytics data is unavailable right now.</div>;
  }

  return (
    <div className="space-y-6">
      <SectionCard title={overviewQuery.data.organizationName} eyebrow="Organization analytics">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total exams" value={overviewQuery.data.totalExams} helper="Exams included in this overview." accent="blue" />
          <StatCard label="Total attempts" value={overviewQuery.data.totalAttempts} helper="Attempts recorded across the organization." accent="emerald" />
          <StatCard label="Average percentage" value={formatPercentage(overviewQuery.data.avgPercentage)} helper="Organization-wide average score." accent="amber" />
          <StatCard label="Threshold" value={overviewQuery.data.atRiskThreshold} helper="Configured at-risk threshold for this organization." accent="rose" />
        </div>
      </SectionCard>

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard title="Class analytics" eyebrow="Performance drill-down">
          <div className="grid gap-3">
            {groupsQuery.data.items.map((group) => (
              <Link key={group.id} to={`/admin/analytics/groups/${group.id}`} className="rounded-3xl border border-slate-200 bg-white px-5 py-4 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-950 dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:text-white">
                {group.name}
              </Link>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Subject analytics" eyebrow="Curriculum drill-down">
          <div className="grid gap-3">
            {subjectsQuery.data.items.map((subject) => (
              <Link key={subject.id} to={`/admin/analytics/subjects/${subject.id}`} className="rounded-3xl border border-slate-200 bg-white px-5 py-4 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-950 dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:text-white">
                {subject.name}
              </Link>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

export function AdminGroupAnalyticsPage() {
  const { groupId = '' } = useParams();
  const { data, isLoading, isError } = useAdminGroupPerformanceQuery(groupId);

  if (isLoading) return <LoadingScreen label="Loading class analytics..." />;
  if (isError || !data) return <div className="rounded-[28px] border border-rose-200 bg-rose-50 p-8 text-rose-700">Class analytics are unavailable right now.</div>;

  return (
    <div className="space-y-6">
      <SectionCard title={data.groupName} eyebrow="Class analytics">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <StatCard label="At-risk threshold" value={data.atRiskThreshold} helper="Configured threshold for class alerts." accent="amber" />
          <StatCard label="Trend points" value={data.examTrend.length} helper="Exam snapshots included in this trend view." accent="blue" />
          <StatCard label="At-risk students" value={data.atRiskStudents.length} helper="Students currently below the threshold." accent="rose" />
        </div>
      </SectionCard>

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard title="Weakest topics" eyebrow="Learning gaps">
          <TopicBarList title="Weakest topics" items={data.weakestTopics} emptyLabel="No weakest-topic data available yet." />
        </SectionCard>
        <SectionCard title="At-risk students" eyebrow="Needs attention">
          {data.atRiskStudents.length === 0 ? (
            <EmptyState title="No at-risk students" description="This class is currently above the configured threshold." />
          ) : (
            <div className="space-y-4">
              {data.atRiskStudents.map((student) => (
                <Link key={student.studentId} to={`/admin/students/${student.studentId}`} className="block rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-950/70">
                  <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{student.studentName}</h3>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Average percentage: {formatPercentage(student.avgPercentage)}</p>
                </Link>
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}

export function AdminSubjectAnalyticsPage() {
  const { subjectId = '' } = useParams();
  const { data, isLoading, isError } = useAdminSubjectOverviewQuery(subjectId);

  if (isLoading) return <LoadingScreen label="Loading subject analytics..." />;
  if (isError || !data) return <div className="rounded-[28px] border border-rose-200 bg-rose-50 p-8 text-rose-700">Subject analytics are unavailable right now.</div>;

  return (
    <div className="space-y-6">
      <SectionCard title={data.subjectName} eyebrow="Subject analytics">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <StatCard label="Total exams" value={data.totalExams} helper="Exams included for this subject." accent="blue" />
          <StatCard label="Weakest topics" value={data.weakestTopics.length} helper="Topics needing attention in this subject." accent="rose" />
          <StatCard label="Exam rows" value={data.exams.length} helper="Exam analytics rows returned for this subject." accent="emerald" />
        </div>
      </SectionCard>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <SectionCard title="Weakest topics" eyebrow="Topic performance">
          <TopicBarList title="Weakest topics" items={data.weakestTopics} emptyLabel="No topic data available for this subject." />
        </SectionCard>
        <SectionCard title="Exam overview" eyebrow="Subject exam list">
          {data.exams.length === 0 ? (
            <EmptyState title="No subject exams yet" description="Exam analytics will appear here once this subject is used in exams." />
          ) : (
            <div className="space-y-4">
              {data.exams.map((exam, index) => (
                <div key={`${exam.examId ?? 'exam'}-${index}`} className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-950/70">
                  <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{exam.examTitle ?? 'Exam'}</h3>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Average percentage: {formatPercentage(exam.avgPercentage ?? 0)}</p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Attempts: {exam.totalAttempts ?? 0}</p>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
