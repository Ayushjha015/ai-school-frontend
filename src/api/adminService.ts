import type {
  AdminDashboardStatsResponse,
  AssignTeacherResponse,
  BranchResponse,
  BulkUploadResponse,
  CreateStudentRequest,
  ExamLeaderboardResponse,
  ExamOverviewResponse,
  ExamResponse,
  ExamResultListItem,
  GroupPerformanceResponse,
  GroupResponse,
  OrganizationDetailResponse,
  OrganizationResponse,
  OrgAdminCreateRequest,
  OrgOverviewResponse,
  PaginatedResponse,
  ParentListResponse,
  StudentResponse,
  StudentSummaryResponse,
  SubjectOverviewResponse,
  SubjectResponse,
  TeacherExamListItem,
  TeacherUpdateRequest,
  UserResponse,
} from '../types/api';
import { api } from './baseClient';
import { unwrapApiResponse } from './helpers';

export async function getOrganizations(page = 1, limit = 20, search?: string) {
  const response = await api.get<PaginatedResponse<OrganizationResponse>>('/organizations', {
    params: { page, limit, search: search || undefined },
  });
  return unwrapApiResponse(response);
}

export async function createOrganization(payload: { name: string; code?: string | null }) {
  const response = await api.post<OrganizationResponse>('/organizations', payload);
  return unwrapApiResponse(response);
}

export async function getOrganization(orgId: string) {
  const response = await api.get<OrganizationDetailResponse>(`/organizations/${orgId}`);
  return unwrapApiResponse(response);
}

export async function getOrganizationBranches(orgId: string, page = 1, limit = 100) {
  const response = await api.get<PaginatedResponse<BranchResponse>>(`/organizations/${orgId}/branches`, {
    params: { page, limit },
  });
  return unwrapApiResponse(response);
}

export async function getOrganizationBranch(orgId: string, branchId: string) {
  const response = await api.get<BranchResponse>(`/organizations/${orgId}/branches/${branchId}`);
  return unwrapApiResponse(response);
}

export async function createBranch(orgId: string, payload: { name: string; city?: string | null; state?: string | null }) {
  const response = await api.post<BranchResponse>(`/organizations/${orgId}/branches`, payload);
  return unwrapApiResponse(response);
}

export async function createOrgAdmin(payload: OrgAdminCreateRequest) {
  const response = await api.post<UserResponse>('/users/org-admins', payload);
  return unwrapApiResponse(response);
}

export async function getTeachers(page = 1, limit = 20, search?: string) {
  const response = await api.get<PaginatedResponse<UserResponse>>('/users/teachers', {
    params: { page, limit, search: search || undefined },
  });
  return unwrapApiResponse(response);
}

export async function getTeacher(teacherId: string) {
  const response = await api.get<UserResponse>(`/users/teachers/${teacherId}`);
  return unwrapApiResponse(response);
}

export async function createTeacher(payload: { name: string; email: string; password: string; branchId?: string | null; phone?: string | null }) {
  const response = await api.post<UserResponse>('/users/teachers', payload);
  return unwrapApiResponse(response);
}

export async function updateTeacher(teacherId: string, payload: TeacherUpdateRequest) {
  const response = await api.patch<UserResponse>(`/users/teachers/${teacherId}`, payload);
  return unwrapApiResponse(response);
}

export async function getStudents(filters: { groupId?: string; page?: number; limit?: number; search?: string }) {
  const response = await api.get<PaginatedResponse<StudentResponse>>('/users/students', {
    params: {
      group_id: filters.groupId || undefined,
      page: filters.page ?? 1,
      limit: filters.limit ?? 20,
      search: filters.search || undefined,
    },
  });
  return unwrapApiResponse(response);
}

export async function getStudent(studentId: string) {
  const response = await api.get<StudentResponse>(`/users/students/${studentId}`);
  return unwrapApiResponse(response);
}

export async function createStudent(payload: CreateStudentRequest) {
  const response = await api.post<StudentResponse>('/users/students', payload);
  return unwrapApiResponse(response);
}

export async function bulkUploadStudents(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post<BulkUploadResponse>('/users/students/bulk-upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return unwrapApiResponse(response);
}

export async function downloadBulkUploadTemplate() {
  const response = await api.get<Blob>('/users/students/bulk-upload/template', {
    responseType: 'blob',
  });
  return response.data;
}

export async function getParents(page = 1, limit = 20) {
  const response = await api.get<ParentListResponse>('/users/parents', { params: { page, limit } });
  return unwrapApiResponse(response);
}

export async function deactivateUser(userId: string) {
  const response = await api.patch<UserResponse>(`/users/${userId}/deactivate`);
  return unwrapApiResponse(response);
}

export async function getGroups(page = 1, limit = 20) {
  const response = await api.get<PaginatedResponse<GroupResponse>>('/groups', { params: { page, limit } });
  return unwrapApiResponse(response);
}

export async function getGroup(groupId: string) {
  const response = await api.get<GroupResponse>(`/groups/${groupId}`);
  return unwrapApiResponse(response);
}

export async function createGroup(payload: { name: string; branchId?: string | null; teacherId?: string | null }) {
  const response = await api.post<GroupResponse>('/groups', payload);
  return unwrapApiResponse(response);
}

export async function assignTeacherToGroup(groupId: string, teacherId: string) {
  const response = await api.post<AssignTeacherResponse>(`/groups/${groupId}/assign-teacher`, { teacherId });
  return unwrapApiResponse(response);
}

export async function addStudentsToGroup(groupId: string, studentIds: string[]) {
  const response = await api.post<PaginatedResponse<StudentResponse> | { added: number }>(`/groups/${groupId}/students`, { studentIds });
  return unwrapApiResponse(response);
}

export async function getGroupStudents(groupId: string, page = 1, limit = 50) {
  const response = await api.get<PaginatedResponse<StudentResponse>>(`/groups/${groupId}/students`, { params: { page, limit } });
  return unwrapApiResponse(response);
}

export async function getSubjects(page = 1, limit = 100) {
  const response = await api.get<PaginatedResponse<SubjectResponse>>('/subjects', { params: { page, limit } });
  return unwrapApiResponse(response);
}

export async function getSubject(subjectId: string) {
  const response = await api.get<SubjectResponse>(`/subjects/${subjectId}`);
  return unwrapApiResponse(response);
}

export async function createSubject(payload: { name: string }) {
  const response = await api.post<SubjectResponse>('/subjects', payload);
  return unwrapApiResponse(response);
}

export async function getExams(page = 1, limit = 20, status?: string) {
  const response = await api.get<PaginatedResponse<TeacherExamListItem>>('/exams', {
    params: { page, limit, status: status || undefined },
  });
  return unwrapApiResponse(response);
}

export async function getExam(examId: string) {
  const response = await api.get<ExamResponse>(`/exams/${examId}`);
  return unwrapApiResponse(response);
}

export async function getExamResults(examId: string, page = 1, limit = 50) {
  const response = await api.get<PaginatedResponse<ExamResultListItem>>(`/results/exam/${examId}`, {
    params: { page, limit },
  });
  return unwrapApiResponse(response);
}

export async function getStudentResults(studentId: string, page = 1, limit = 20) {
  const response = await api.get<PaginatedResponse<ExamResultListItem>>(`/results/student/${studentId}`, {
    params: { page, limit },
  });
  return unwrapApiResponse(response);
}

export async function getExamOverview(examId: string) {
  const response = await api.get<ExamOverviewResponse>(`/analytics/exams/${examId}/overview`);
  return unwrapApiResponse(response);
}

export async function getExamLeaderboard(examId: string) {
  const response = await api.get<ExamLeaderboardResponse>(`/analytics/exams/${examId}/leaderboard`);
  return unwrapApiResponse(response);
}

export async function getGroupPerformance(groupId: string) {
  const response = await api.get<GroupPerformanceResponse>(`/analytics/groups/${groupId}/performance`);
  return unwrapApiResponse(response);
}

export async function getStudentSummary(studentId: string) {
  const response = await api.get<StudentSummaryResponse>(`/analytics/students/${studentId}/summary`);
  return unwrapApiResponse(response);
}

export async function getSubjectOverview(subjectId: string) {
  const response = await api.get<SubjectOverviewResponse>(`/analytics/subjects/${subjectId}/overview`);
  return unwrapApiResponse(response);
}

export async function getOrgOverview() {
  const response = await api.get<OrgOverviewResponse>('/analytics/org/overview');
  return unwrapApiResponse(response);
}

export async function getAdminDashboardStats() {
  const response = await api.get<AdminDashboardStatsResponse>('/analytics/admin/dashboard-stats');
  return unwrapApiResponse(response);
}

export async function updateOrganizationSettings(orgId: string, payload: { atRiskThreshold: number }) {
  const response = await api.patch<OrganizationResponse>(`/organizations/${orgId}/settings`, payload);
  return unwrapApiResponse(response);
}
