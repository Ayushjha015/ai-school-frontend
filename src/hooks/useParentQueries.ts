import { useQuery } from '@tanstack/react-query';
import {
  getAnalyticsChildren,
  getChildExams,
  getParentChildDashboard,
  getChildResultDetail,
  getChildResults,
  getLinkedChildren,
} from '../api/parentService';

export function useLinkedChildrenQuery() {
  return useQuery({
    queryKey: ['parent', 'children'],
    queryFn: getLinkedChildren,
  });
}

export function useParentAnalyticsChildrenQuery() {
  return useQuery({
    queryKey: ['parent', 'analytics', 'children'],
    queryFn: getAnalyticsChildren,
  });
}

export function useParentChildDashboardQuery(studentUserId: string, filters?: { from?: string; to?: string }) {
  return useQuery({
    queryKey: ['parent', 'analytics', 'child-dashboard', studentUserId, filters?.from ?? 'all', filters?.to ?? 'all'],
    queryFn: () => getParentChildDashboard(studentUserId, filters),
    enabled: Boolean(studentUserId),
  });
}

export function useChildExamsQuery(studentUserId: string) {
  return useQuery({
    queryKey: ['parent', 'child-exams', studentUserId],
    queryFn: () => getChildExams(studentUserId),
    enabled: Boolean(studentUserId),
  });
}

export function useChildResultsQuery(studentUserId: string) {
  return useQuery({
    queryKey: ['parent', 'child-results', studentUserId],
    queryFn: () => getChildResults(studentUserId),
    enabled: Boolean(studentUserId),
  });
}

export function useChildResultDetailQuery(studentUserId: string, attemptId: string) {
  return useQuery({
    queryKey: ['parent', 'child-result', studentUserId, attemptId],
    queryFn: () => getChildResultDetail(studentUserId, attemptId),
    enabled: Boolean(studentUserId && attemptId),
  });
}
