import { useParams } from 'react-router-dom';
import { LoadingScreen } from '../../components/common/LoadingScreen';
import { SectionCard } from '../../components/common/SectionCard';
import { useLeaderboardQuery } from '../../hooks/useStudentQueries';
import { formatDuration, formatPercentage } from '../../utils/formatters';

export function LeaderboardPage() {
  const { examId = '' } = useParams();
  const { data, isLoading, isError } = useLeaderboardQuery(examId);

  if (isLoading) {
    return <LoadingScreen label="Loading leaderboard..." />;
  }

  if (isError || !data) {
    return <div className="rounded-[28px] border border-rose-200 bg-rose-50 p-6 text-rose-700 sm:p-8">We could not load the leaderboard for this exam.</div>;
  }

  return (
    <SectionCard title={data.examTitle} eyebrow="Leaderboard">
      <div className="mb-6 grid gap-4 rounded-3xl bg-slate-950 p-5 text-sm text-slate-200 sm:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-300">Exam ID</p>
          <p className="mt-2 break-all text-base text-white">{data.examId}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-300">Pass threshold</p>
          <p className="mt-2 text-base text-white">{data.passPercentage}%</p>
        </div>
      </div>
      <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white">
        <table className="min-w-[720px] divide-y divide-slate-200 text-left text-sm text-slate-700">
          <thead className="bg-slate-50 text-xs uppercase tracking-[0.18em] text-slate-500">
            <tr>
              <th className="px-4 py-4">Rank</th>
              <th className="px-4 py-4">Student</th>
              <th className="px-4 py-4">Score</th>
              <th className="px-4 py-4">Percentage</th>
              <th className="px-4 py-4">Time taken</th>
              <th className="px-4 py-4">Tab switches</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.entries.map((entry) => (
              <tr key={`${entry.studentId}-${entry.rank}`}>
                <td className="px-4 py-4 font-semibold text-slate-900">#{entry.rank}</td>
                <td className="px-4 py-4">{entry.studentName}</td>
                <td className="px-4 py-4">{entry.score}</td>
                <td className="px-4 py-4">{formatPercentage(entry.percentage)}</td>
                <td className="px-4 py-4">{formatDuration(entry.timeTakenSeconds)}</td>
                <td className="px-4 py-4">{entry.tabSwitchCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}
