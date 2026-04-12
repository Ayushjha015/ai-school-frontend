import { useQuery } from '@tanstack/react-query';
import { getExamLeaderboard, getResultDetail, getStudentDashboard, getStudentExamDetails, getStudentExams, getStudentResults, getStudentSummary } from '../api/studentService';

export function useStudentExamsQuery() {
  return useQuery({
    queryKey: ['student', 'exams'],
    queryFn: getStudentExams,
    refetchInterval: 30_000,
  });
}

export function useStudentExamDetailsQuery(examId: string) {
  return useQuery({
    queryKey: ['student', 'exam', examId],
    queryFn: () => getStudentExamDetails(examId),
    enabled: Boolean(examId),
  });
}

export function useStudentSummaryQuery(studentUserId?: string) {
  return useQuery({
    queryKey: ['student', 'summary', studentUserId],
    queryFn: () => getStudentSummary(studentUserId!),
    enabled: Boolean(studentUserId),
  });
}

export function useStudentDashboardQuery(filters?: { from?: string; to?: string }) {
  return useQuery({
    queryKey: ['student', 'analytics', filters?.from ?? 'all', filters?.to ?? 'all'],
    queryFn: () => getStudentDashboard(filters),
  });
}

export function useStudentResultsQuery(page: number, limit: number) {
  return useQuery({
    queryKey: ['student', 'results', page, limit],
    queryFn: () => getStudentResults(page, limit),
  });
}

export function useResultDetailQuery(attemptId: string) {
  return useQuery({
    queryKey: ['student', 'result', attemptId],
    queryFn: () => getResultDetail(attemptId),
    enabled: Boolean(attemptId),
  });
}

export function useLeaderboardQuery(examId: string) {
  return useQuery({
    queryKey: ['student', 'leaderboard', examId],
    queryFn: () => getExamLeaderboard(examId),
    enabled: Boolean(examId),
  });
}
