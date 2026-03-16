import { useQuery } from '@tanstack/react-query';
import {
  getChildExams,
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
