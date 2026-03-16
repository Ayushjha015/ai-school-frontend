import { SectionCard } from '../../components/common/SectionCard';
import { StatCard } from '../../components/common/StatCard';
import { TopicBarList } from '../../components/common/TopicBarList';
import { LoadingScreen } from '../../components/common/LoadingScreen';
import { useStudentSummaryQuery } from '../../hooks/useStudentQueries';
import { useAuthStore } from '../../store/authStore';
import { formatPercentage } from '../../utils/formatters';

export function StudentAnalyticsPage() {
  const user = useAuthStore((state) => state.user);
  const { data, isLoading, isError } = useStudentSummaryQuery(user?.id);

  if (isLoading) {
    return <LoadingScreen label="Loading analytics..." />;
  }

  if (isError || !data) {
    return <div className="rounded-[28px] border border-rose-200 bg-rose-50 p-8 text-rose-700">Analytics are unavailable right now.</div>;
  }

  return (
    <div className="space-y-6">
      <SectionCard title="My analytics" eyebrow="Performance summary">
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard label="Average percentage" value={formatPercentage(data.avgPercentage)} helper="Across graded attempts." accent="emerald" />
          <StatCard label="Total attempts" value={data.totalExamsAttempted} helper="Completed exams on record." accent="blue" />
          <StatCard label="Student" value={data.studentName} helper="A snapshot of your current learning progress." accent="slate" />
        </div>
      </SectionCard>
      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard title="Strongest topics" eyebrow="Where you're doing best">
          <TopicBarList title="Strongest" items={data.strongestTopics} emptyLabel="Complete more exams to unlock topic strengths." />
        </SectionCard>
        <SectionCard title="Weakest topics" eyebrow="Where to focus next">
          <TopicBarList title="Weakest" items={data.weakestTopics} emptyLabel="No weak-topic signal yet." />
        </SectionCard>
      </div>
    </div>
  );
}

