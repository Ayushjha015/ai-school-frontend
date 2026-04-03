import type {
  CreateExamRequest,
  CreateStudentRequest,
  ExamLeaderboardResponse,
  ExamOverviewResponse,
  ExamResponse,
  GenerateQuestionsRequest,
  GenerateQuestionsResponse,
  GroupPerformanceResponse,
  GroupResponse,
  PaginatedResponse,
  QuestionResponse,
  SavedQuestionsResponse,
  StudentResponse,
  SubjectResponse,
  TeacherExamListItem,
  UserResponse,
} from '../types/api';
import { api } from './baseClient';
import { unwrapApiResponse } from './helpers';

export async function getTeacherGroups(page = 1, limit = 20) {
  const response = await api.get<PaginatedResponse<GroupResponse>>('/groups', { params: { page, limit } });
  return unwrapApiResponse(response);
}

export async function getTeacherGroup(groupId: string) {
  const response = await api.get<GroupResponse>(`/groups/${groupId}`);
  return unwrapApiResponse(response);
}

export async function getTeacherGroupStudents(groupId: string, page = 1, limit = 50) {
  const response = await api.get<PaginatedResponse<StudentResponse>>(`/groups/${groupId}/students`, { params: { page, limit } });
  return unwrapApiResponse(response);
}

export async function getTeacherStudents(groupId?: string, page = 1, limit = 20) {
  const response = await api.get<PaginatedResponse<StudentResponse>>('/users/students', {
    params: { group_id: groupId || undefined, page, limit },
  });
  return unwrapApiResponse(response);
}

export async function getTeacherStudent(studentId: string) {
  const response = await api.get<StudentResponse>(`/users/students/${studentId}`);
  return unwrapApiResponse(response);
}

export async function getTeacherStudentResults(studentId: string, page = 1, limit = 20) {
  const response = await api.get<PaginatedResponse<{ attemptId: string; score: number; percentage: number; generatedAt: string; studentId?: string }>>(`/results/student/${studentId}`, {
    params: { page, limit },
  });
  return unwrapApiResponse(response);
}

export async function createTeacherStudent(payload: CreateStudentRequest) {
  const response = await api.post<StudentResponse>('/users/students', payload);
  return unwrapApiResponse(response);
}

export async function getSubjects(page = 1, limit = 100) {
  const response = await api.get<PaginatedResponse<SubjectResponse>>('/subjects', { params: { page, limit } });
  return unwrapApiResponse(response);
}

export async function getQuestions(filters: { subjectId?: string; topic?: string; sortByCreatedAt?: 'desc' | 'asc'; page?: number; limit?: number }) {
  const response = await api.get<PaginatedResponse<QuestionResponse>>('/questions', {
    params: {
      subject_id: filters.subjectId || undefined,
      topic: filters.topic || undefined,
      page: filters.page ?? 1,
      limit: filters.limit ?? 20,
    },
  });
  return unwrapApiResponse(response);
}

export async function createQuestion(payload: {
  subjectId: string;
  questionText: string;
  topic?: string | null;
  difficulty?: string | null;
  options: Array<{ optionText: string; isCorrect: boolean }>;
  tagIds?: string[] | null;
}) {
  const response = await api.post<QuestionResponse>('/questions', payload);
  return unwrapApiResponse(response);
}

export async function updateQuestion(questionId: string, payload: {
  questionText?: string | null;
  topic?: string | null;
  difficulty?: string | null;
  options?: Array<{ optionText: string; isCorrect: boolean }> | null;
  tagIds?: string[] | null;
}) {
  const response = await api.put<QuestionResponse>(`/questions/${questionId}`, payload);
  return unwrapApiResponse(response);
}

export async function deleteQuestion(questionId: string) {
  await api.delete(`/questions/${questionId}`);
}

export async function generateQuestions(payload: GenerateQuestionsRequest) {
  const response = await api.post<GenerateQuestionsResponse>('/ai/generate-questions', payload);
  return unwrapApiResponse(response);
}

export async function saveGeneratedQuestions(payload: {
  subjectId: string;
  questions: Array<{
    questionText: string;
    topic?: string | null;
    difficulty?: string | null;
    options: Array<{ optionText: string; isCorrect: boolean }>;
    tagIds?: string[] | null;
  }>;
}) {
  const response = await api.post<SavedQuestionsResponse>('/ai/save-generated-questions', payload);
  return unwrapApiResponse(response);
}

export async function getTeacherExams(filters: { status?: string; subjectId?: string; page?: number; limit?: number }) {
  const response = await api.get<PaginatedResponse<TeacherExamListItem>>('/exams', {
    params: {
      status: filters.status || undefined,
      subject_id: filters.subjectId || undefined,
      page: filters.page ?? 1,
      limit: filters.limit ?? 20,
    },
  });
  return unwrapApiResponse(response);
}

export async function createExam(payload: CreateExamRequest) {
  const response = await api.post<ExamResponse>('/exams', payload);
  return unwrapApiResponse(response);
}

export async function getTeacherExam(examId: string) {
  const response = await api.get<ExamResponse>(`/exams/${examId}`);
  return unwrapApiResponse(response);
}

export async function publishExam(examId: string, groupIds: string[]) {
  const response = await api.put<ExamResponse>(`/exams/${examId}/publish`, { groupIds });
  return unwrapApiResponse(response);
}

export async function endExam(examId: string) {
  const response = await api.put<ExamResponse>(`/exams/${examId}/end`);
  return unwrapApiResponse(response);
}

export async function deleteExam(examId: string) {
  await api.delete(`/exams/${examId}`);
}

export async function getExamOverview(examId: string) {
  const response = await api.get<ExamOverviewResponse>(`/analytics/exams/${examId}/overview`);
  return unwrapApiResponse(response);
}

export async function getTeacherExamLeaderboard(examId: string) {
  const response = await api.get<ExamLeaderboardResponse>(`/analytics/exams/${examId}/leaderboard`);
  return unwrapApiResponse(response);
}

export async function getGroupPerformance(groupId: string) {
  const response = await api.get<GroupPerformanceResponse>(`/analytics/groups/${groupId}/performance`);
  return unwrapApiResponse(response);
}

export async function getTeachers(page = 1, limit = 20) {
  const response = await api.get<PaginatedResponse<UserResponse>>('/users/teachers', { params: { page, limit } });
  return unwrapApiResponse(response);
}
