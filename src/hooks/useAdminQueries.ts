import { keepPreviousData, useQuery } from '@tanstack/react-query';
import {
  getAdminDashboardStats,
  getExam,
  getExamLeaderboard,
  getExamOverview,
  getExamResults,
  getExams,
  getGroup,
  getGroupPerformance,
  getGroups,
  getGroupStudents,
  getOrgOverview,
  getOrganization,
  getOrganizationBranches,
  getOrganizations,
  getParents,
  getStudent,
  getStudentResults,
  getStudentSummary,
  getStudents,
  getSubjectOverview,
  getSubjects,
  getTeacher,
  getTeachers,
} from '../api/adminService';

export function useOrganizationsQuery(page = 1, limit = 20, search?: string) {
  return useQuery({
    queryKey: ['admin', 'organizations', page, limit, search ?? 'all'],
    queryFn: () => getOrganizations(page, limit, search),
    placeholderData: keepPreviousData,
  });
}

export function useOrganizationQuery(orgId: string) {
  return useQuery({
    queryKey: ['admin', 'organization', orgId],
    queryFn: () => getOrganization(orgId),
    enabled: Boolean(orgId),
  });
}

export function useOrganizationBranchesQuery(orgId: string, page = 1, limit = 100) {
  return useQuery({
    queryKey: ['admin', 'organization-branches', orgId, page, limit],
    queryFn: () => getOrganizationBranches(orgId, page, limit),
    enabled: Boolean(orgId),
  });
}

export function useOrgOverviewQuery() {
  return useQuery({
    queryKey: ['admin', 'org-overview'],
    queryFn: getOrgOverview,
  });
}

export const useAdminOrgOverviewQuery = useOrgOverviewQuery;

export function useAdminDashboardStatsQuery() {
  return useQuery({
    queryKey: ['admin', 'dashboard-stats'],
    queryFn: getAdminDashboardStats,
  });
}

export function useAdminTeachersQuery(page = 1, limit = 20, search?: string) {
  return useQuery({
    queryKey: ['admin', 'teachers', page, limit, search ?? 'all'],
    queryFn: () => getTeachers(page, limit, search),
    placeholderData: keepPreviousData,
  });
}

export function useAdminTeacherQuery(teacherId: string) {
  return useQuery({
    queryKey: ['admin', 'teacher', teacherId],
    queryFn: () => getTeacher(teacherId),
    enabled: Boolean(teacherId),
  });
}

export function useAdminStudentsQuery(filters: { groupId?: string; page?: number; limit?: number; search?: string }) {
  return useQuery({
    queryKey: ['admin', 'students', filters.groupId ?? 'all', filters.page ?? 1, filters.limit ?? 20, filters.search ?? 'all'],
    queryFn: () => getStudents(filters),
    placeholderData: keepPreviousData,
  });
}

export function useAdminStudentQuery(studentId: string) {
  return useQuery({
    queryKey: ['admin', 'student', studentId],
    queryFn: () => getStudent(studentId),
    enabled: Boolean(studentId),
  });
}

export function useAdminStudentResultsQuery(studentId: string, page = 1, limit = 20) {
  return useQuery({
    queryKey: ['admin', 'student-results', studentId, page, limit],
    queryFn: () => getStudentResults(studentId, page, limit),
    enabled: Boolean(studentId),
    placeholderData: keepPreviousData,
  });
}

export function useAdminStudentSummaryQuery(studentId: string) {
  return useQuery({
    queryKey: ['admin', 'student-summary', studentId],
    queryFn: () => getStudentSummary(studentId),
    enabled: Boolean(studentId),
  });
}

export function useAdminParentsQuery(page = 1, limit = 20) {
  return useQuery({
    queryKey: ['admin', 'parents', page, limit],
    queryFn: () => getParents(page, limit),
    placeholderData: keepPreviousData,
  });
}

export function useAdminGroupsQuery(page = 1, limit = 20) {
  return useQuery({
    queryKey: ['admin', 'groups', page, limit],
    queryFn: () => getGroups(page, limit),
    placeholderData: keepPreviousData,
  });
}

export function useAdminGroupQuery(groupId: string) {
  return useQuery({
    queryKey: ['admin', 'group', groupId],
    queryFn: () => getGroup(groupId),
    enabled: Boolean(groupId),
  });
}

export function useAdminGroupStudentsQuery(groupId: string, page = 1, limit = 50) {
  return useQuery({
    queryKey: ['admin', 'group-students', groupId, page, limit],
    queryFn: () => getGroupStudents(groupId, page, limit),
    enabled: Boolean(groupId),
    placeholderData: keepPreviousData,
  });
}

export function useAdminSubjectsQuery(page = 1, limit = 100) {
  return useQuery({
    queryKey: ['admin', 'subjects', page, limit],
    queryFn: () => getSubjects(page, limit),
    placeholderData: keepPreviousData,
  });
}

export function useAdminExamsQuery(page = 1, limit = 20, status?: string) {
  return useQuery({
    queryKey: ['admin', 'exams', page, limit, status ?? 'all'],
    queryFn: () => getExams(page, limit, status),
    placeholderData: keepPreviousData,
  });
}

export function useAdminExamQuery(examId: string) {
  return useQuery({
    queryKey: ['admin', 'exam', examId],
    queryFn: () => getExam(examId),
    enabled: Boolean(examId),
  });
}

export function useAdminExamResultsQuery(examId: string, page = 1, limit = 50) {
  return useQuery({
    queryKey: ['admin', 'exam-results', examId, page, limit],
    queryFn: () => getExamResults(examId, page, limit),
    enabled: Boolean(examId),
    placeholderData: keepPreviousData,
  });
}

export function useAdminExamOverviewQuery(examId: string) {
  return useQuery({
    queryKey: ['admin', 'exam-overview', examId],
    queryFn: () => getExamOverview(examId),
    enabled: Boolean(examId),
  });
}

export function useAdminExamLeaderboardQuery(examId: string) {
  return useQuery({
    queryKey: ['admin', 'exam-leaderboard', examId],
    queryFn: () => getExamLeaderboard(examId),
    enabled: Boolean(examId),
  });
}

export function useAdminGroupPerformanceQuery(groupId: string) {
  return useQuery({
    queryKey: ['admin', 'group-performance', groupId],
    queryFn: () => getGroupPerformance(groupId),
    enabled: Boolean(groupId),
  });
}

export function useAdminSubjectOverviewQuery(subjectId: string) {
  return useQuery({
    queryKey: ['admin', 'subject-overview', subjectId],
    queryFn: () => getSubjectOverview(subjectId),
    enabled: Boolean(subjectId),
  });
}
