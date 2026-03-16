import { keepPreviousData, useQuery } from '@tanstack/react-query';
import {
  getExamOverview,
  getGroupPerformance,
  getQuestions,
  getSubjects,
  getTeacherExam,
  getTeacherExamLeaderboard,
  getTeacherExams,
  getTeacherGroup,
  getTeacherGroups,
  getTeacherGroupStudents,
  getTeacherStudent,
  getTeacherStudentResults,
  getTeacherStudents,
} from '../api/teacherService';

export function useTeacherGroupsQuery(page = 1, limit = 20) {
  return useQuery({
    queryKey: ['teacher', 'groups', page, limit],
    queryFn: () => getTeacherGroups(page, limit),
  });
}

export function useTeacherGroupQuery(groupId: string) {
  return useQuery({
    queryKey: ['teacher', 'group', groupId],
    queryFn: () => getTeacherGroup(groupId),
    enabled: Boolean(groupId),
  });
}

export function useTeacherGroupStudentsQuery(groupId: string, page = 1, limit = 50) {
  return useQuery({
    queryKey: ['teacher', 'group-students', groupId, page, limit],
    queryFn: () => getTeacherGroupStudents(groupId, page, limit),
    enabled: Boolean(groupId),
  });
}

export function useTeacherStudentsQuery(groupId?: string, page = 1, limit = 20) {
  return useQuery({
    queryKey: ['teacher', 'students', groupId ?? 'all', page, limit],
    queryFn: () => getTeacherStudents(groupId, page, limit),
  });
}

export function useTeacherStudentQuery(studentId: string) {
  return useQuery({
    queryKey: ['teacher', 'student', studentId],
    queryFn: () => getTeacherStudent(studentId),
    enabled: Boolean(studentId),
  });
}

export function useTeacherStudentResultsQuery(studentId: string, page = 1, limit = 20) {
  return useQuery({
    queryKey: ['teacher', 'student-results', studentId, page, limit],
    queryFn: () => getTeacherStudentResults(studentId, page, limit),
    enabled: Boolean(studentId),
  });
}

export function useSubjectsQuery(page = 1, limit = 100) {
  return useQuery({
    queryKey: ['teacher', 'subjects', page, limit],
    queryFn: () => getSubjects(page, limit),
  });
}

export function useTeacherQuestionsQuery(filters: { subjectId?: string; topic?: string; sortByCreatedAt?: 'desc' | 'asc'; page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['teacher', 'questions', filters.subjectId ?? 'all', filters.topic ?? 'all', filters.sortByCreatedAt ?? 'desc', filters.page ?? 1, filters.limit ?? 20],
    queryFn: () => getQuestions(filters),
    placeholderData: keepPreviousData,
  });
}

export function useTeacherExamsQuery(filters: { status?: string; subjectId?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['teacher', 'exams', filters.status ?? 'all', filters.subjectId ?? 'all', filters.page ?? 1, filters.limit ?? 20],
    queryFn: () => getTeacherExams(filters),
    placeholderData: keepPreviousData,
  });
}

export function useTeacherExamQuery(examId: string) {
  return useQuery({
    queryKey: ['teacher', 'exam', examId],
    queryFn: () => getTeacherExam(examId),
    enabled: Boolean(examId),
  });
}

export function useExamOverviewQuery(examId: string) {
  return useQuery({
    queryKey: ['teacher', 'exam-overview', examId],
    queryFn: () => getExamOverview(examId),
    enabled: Boolean(examId),
  });
}

export function useTeacherExamLeaderboardQuery(examId: string) {
  return useQuery({
    queryKey: ['teacher', 'exam-leaderboard', examId],
    queryFn: () => getTeacherExamLeaderboard(examId),
    enabled: Boolean(examId),
  });
}

export function useGroupPerformanceQuery(groupId: string) {
  return useQuery({
    queryKey: ['teacher', 'group-performance', groupId],
    queryFn: () => getGroupPerformance(groupId),
    enabled: Boolean(groupId),
  });
}
