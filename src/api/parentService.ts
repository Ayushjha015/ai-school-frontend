import type {
  FullResultResponse,
  LinkedStudentResponse,
  StudentExamsResponse,
  StudentResultsResponse,
} from '../types/api';
import { api } from './baseClient';
import { unwrapApiResponse } from './helpers';

export async function getLinkedChildren() {
  const response = await api.get<LinkedStudentResponse[]>('/parent/students');
  return unwrapApiResponse(response);
}

export async function getChildExams(studentUserId: string) {
  const response = await api.get<StudentExamsResponse>(`/parent/students/${studentUserId}/exams`);
  return unwrapApiResponse(response);
}

export async function getChildResults(studentUserId: string) {
  const response = await api.get<StudentResultsResponse>(`/parent/students/${studentUserId}/results`);
  return unwrapApiResponse(response);
}

export async function getChildResultDetail(studentUserId: string, attemptId: string) {
  const response = await api.get<FullResultResponse>(`/parent/students/${studentUserId}/results/${attemptId}`);
  return unwrapApiResponse(response);
}
