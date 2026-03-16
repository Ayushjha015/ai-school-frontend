import type {
  AttemptDetailResponse,
  AttemptStartResponse,
  ExamLeaderboardResponse,
  FullResultResponse,
  PaginatedResponse,
  ResultSummary,
  StudentExamDetails,
  StudentExamListResponse,
  StudentSummaryResponse,
  SubmitAttemptResponse,
  AnswerInput,
} from '../types/api';
import { api } from './baseClient';
import { unwrapApiResponse } from './helpers';

export async function getStudentExams() {
  const response = await api.get<StudentExamListResponse>('/exams/student');
  return unwrapApiResponse(response);
}

export async function getStudentExamDetails(examId: string) {
  const response = await api.get<StudentExamDetails>(`/exams/student/${examId}`);
  return unwrapApiResponse(response);
}

export async function startExamAttempt(examId: string) {
  const response = await api.post<AttemptStartResponse>('/exam-attempts/start', {
    examId,
    deviceInfo: navigator.platform,
    browser: navigator.userAgent,
  });
  return unwrapApiResponse(response);
}

export async function getAttemptDetail(attemptId: string) {
  const response = await api.get<AttemptDetailResponse>(`/exam-attempts/${attemptId}`);
  return unwrapApiResponse(response);
}

export async function submitAttempt(attemptId: string, answers: AnswerInput[]) {
  const response = await api.post<SubmitAttemptResponse>(`/exam-attempts/${attemptId}/submit`, { answers });
  return unwrapApiResponse(response);
}

export async function markTabSwitch(attemptId: string) {
  await api.patch(`/exam-attempts/${attemptId}/tab-switch`);
}

export async function getStudentResults(page = 1, limit = 10) {
  const response = await api.get<PaginatedResponse<ResultSummary>>('/results/student', {
    params: { page, limit },
  });
  return unwrapApiResponse(response);
}

export async function getResultDetail(attemptId: string) {
  const response = await api.get<FullResultResponse>(`/results/${attemptId}`);
  return unwrapApiResponse(response);
}

export async function getStudentSummary(studentUserId: string) {
  const response = await api.get<StudentSummaryResponse>(`/analytics/students/${studentUserId}/summary`);
  return unwrapApiResponse(response);
}

export async function getExamLeaderboard(examId: string) {
  const response = await api.get<ExamLeaderboardResponse>(`/analytics/exams/${examId}/leaderboard`);
  return unwrapApiResponse(response);
}
