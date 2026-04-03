import { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { LoadingScreen } from './components/common/LoadingScreen';
import { AuthGuard } from './components/guards/AuthGuard';
import { RoleGuard } from './components/guards/RoleGuard';
import { AdminLayout } from './layouts/AdminLayout';
import { ParentLayout } from './layouts/ParentLayout';
import { StudentLayout } from './layouts/StudentLayout';
import { SuperAdminLayout } from './layouts/SuperAdminLayout';
import { TeacherLayout } from './layouts/TeacherLayout';
import { AdminDashboardPage, AdminExamDetailPage, AdminExamsPage, AdminAnalyticsPage, AdminGroupAnalyticsPage, AdminSubjectAnalyticsPage } from './pages/admin/AdminExamsAnalyticsPages';
import { AdminCreateGroupPage, AdminCreateStudentPage, AdminCreateTeacherPage, AdminGroupDetailPage, AdminGroupsPage, AdminStudentDetailPage, AdminStudentsPage, AdminSubjectsPage, AdminTeacherDetailPage, AdminTeachersPage, AdminBulkUploadPage } from './pages/admin/AdminManagementPages';
import { AdminNotificationsPage, AdminSettingsPage } from './pages/admin/AdminSupportPages';
import { ParentChildAnalyticsPage, ParentChildExamsPage, ParentChildResultDetailPage, ParentChildResultsPage } from './pages/parent/ParentChildPages';
import { ParentDashboardPage, ParentChildrenPage, ParentChildOverviewPage } from './pages/parent/ParentOverviewPages';
import { ParentNotificationsPage, ParentProfilePage } from './pages/parent/ParentSupportPages';
import { HomePage } from './pages/public/HomePage';
import { LoginPage } from './pages/public/LoginPage';
import { NotFoundPage } from './pages/public/NotFoundPage';
import { RegisterOrgPage } from './pages/public/RegisterOrgPage';
import { UnauthorizedPage } from './pages/public/UnauthorizedPage';
import { ExamAttemptPage } from './pages/student/ExamAttemptPage';
import { ExamInstructionsPage } from './pages/student/ExamInstructionsPage';
import { LeaderboardPage } from './pages/student/LeaderboardPage';
import { ResultDetailPage } from './pages/student/ResultDetailPage';
import { StudentAnalyticsPage } from './pages/student/StudentAnalyticsPage';
import { StudentDashboardPage } from './pages/student/StudentDashboardPage';
import { StudentExamsPage } from './pages/student/StudentExamsPage';
import { StudentNotificationsPage } from './pages/student/StudentNotificationsPage';
import { StudentProfilePage } from './pages/student/StudentProfilePage';
import { StudentResultsPage } from './pages/student/StudentResultsPage';
import { AIGenerateQuestionsPage } from './pages/teacher/AIGenerateQuestionsPage';
import { CreateQuestionPage } from './pages/teacher/CreateQuestionPage';
import { TeacherAnalyticsPage, TeacherAnalyticsStudentPage } from './pages/teacher/TeacherAnalyticsPage';
import { TeacherDashboardPage } from './pages/teacher/TeacherDashboardPage';
import { CreateExamPage, TeacherExamAnalyticsPage, TeacherExamDetailPage, TeacherExamsPage } from './pages/teacher/TeacherExamsAndAnalyticsPages';
import { TeacherGroupDetailPage } from './pages/teacher/TeacherGroupDetailPage';
import { TeacherGroupsPage } from './pages/teacher/TeacherGroupsPage';
import { TeacherNotificationsPage } from './pages/teacher/TeacherNotificationsPage';
import { TeacherProfilePage } from './pages/teacher/TeacherProfilePage';
import { TeacherQuestionsPage } from './pages/teacher/TeacherQuestionsPage';
import { TeacherStudentDetailPage } from './pages/teacher/TeacherStudentDetailPage';
import { TeacherStudentsPage } from './pages/teacher/TeacherStudentsPage';
import { CreateBranchPage, CreateOrganizationPage, CreateOrgAdminPage, SuperAdminDashboardPage, SuperAdminOrganizationDetailPage, SuperAdminOrganizationsPage, SuperAdminSettingsPage } from './pages/super-admin/SuperAdminPages';
import { useAuthStore } from './store/authStore';

function App() {
  const bootstrapSession = useAuthStore((state) => state.bootstrapSession);
  const isBootstrapping = useAuthStore((state) => state.isBootstrapping);

  useEffect(() => {
    void bootstrapSession();
  }, [bootstrapSession]);

  if (isBootstrapping) {
    return <LoadingScreen label="Checking your session..." />;
  }

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register-org" element={<RegisterOrgPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route
        path="/super-admin/*"
        element={
          <AuthGuard>
            <RoleGuard allowedRoles={['super_admin']}>
              <SuperAdminLayout />
            </RoleGuard>
          </AuthGuard>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<SuperAdminDashboardPage />} />
        <Route path="organizations" element={<SuperAdminOrganizationsPage />} />
        <Route path="organizations/new" element={<CreateOrganizationPage />} />
        <Route path="organizations/:orgId" element={<SuperAdminOrganizationDetailPage />} />
        <Route path="organizations/:orgId/branches/new" element={<CreateBranchPage />} />
        <Route path="org-admins/new" element={<CreateOrgAdminPage />} />
        <Route path="settings" element={<SuperAdminSettingsPage />} />
      </Route>
      <Route
        path="/admin/*"
        element={
          <AuthGuard>
            <RoleGuard allowedRoles={['org_admin']}>
              <AdminLayout />
            </RoleGuard>
          </AuthGuard>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="teachers" element={<AdminTeachersPage />} />
        <Route path="teachers/new" element={<AdminCreateTeacherPage />} />
        <Route path="teachers/:teacherId" element={<AdminTeacherDetailPage />} />
        <Route path="students" element={<AdminStudentsPage />} />
        <Route path="students/new" element={<AdminCreateStudentPage />} />
        <Route path="students/:studentId" element={<AdminStudentDetailPage />} />
        <Route path="students/bulk-upload" element={<AdminBulkUploadPage />} />
        <Route path="groups" element={<AdminGroupsPage />} />
        <Route path="groups/new" element={<AdminCreateGroupPage />} />
        <Route path="groups/:groupId" element={<AdminGroupDetailPage />} />
        <Route path="subjects" element={<AdminSubjectsPage />} />
        <Route path="exams" element={<AdminExamsPage />} />
        <Route path="exams/:examId" element={<AdminExamDetailPage />} />
        <Route path="analytics" element={<AdminAnalyticsPage />} />
        <Route path="analytics/groups/:groupId" element={<AdminGroupAnalyticsPage />} />
        <Route path="analytics/subjects/:subjectId" element={<AdminSubjectAnalyticsPage />} />
        <Route path="notifications" element={<AdminNotificationsPage />} />
        <Route path="settings" element={<AdminSettingsPage />} />
      </Route>
      <Route
        path="/teacher"
        element={
          <AuthGuard>
            <RoleGuard allowedRoles={['teacher']}>
              <TeacherLayout />
            </RoleGuard>
          </AuthGuard>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<TeacherDashboardPage />} />
        <Route path="groups" element={<TeacherGroupsPage />} />
        <Route path="groups/:groupId" element={<TeacherGroupDetailPage />} />
        <Route path="students" element={<TeacherStudentsPage />} />
        <Route path="students/:studentId" element={<TeacherStudentDetailPage />} />
        <Route path="questions" element={<TeacherQuestionsPage />} />
        <Route path="questions/new" element={<CreateQuestionPage />} />
        <Route path="questions/ai-generate" element={<AIGenerateQuestionsPage />} />
        <Route path="exams" element={<TeacherExamsPage />} />
        <Route path="exams/new" element={<CreateExamPage />} />
        <Route path="exams/:examId" element={<TeacherExamDetailPage />} />
        <Route path="exams/:examId/analytics" element={<TeacherExamAnalyticsPage />} />
        <Route path="analytics" element={<TeacherAnalyticsPage />} />
        <Route path="analytics/students/:studentUserId" element={<TeacherAnalyticsStudentPage />} />
        <Route path="notifications" element={<TeacherNotificationsPage />} />
        <Route path="profile" element={<TeacherProfilePage />} />
      </Route>
      <Route
        path="/parent"
        element={
          <AuthGuard>
            <RoleGuard allowedRoles={['parent']}>
              <ParentLayout />
            </RoleGuard>
          </AuthGuard>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<ParentDashboardPage />} />
        <Route path="children" element={<ParentChildrenPage />} />
        <Route path="children/:studentUserId" element={<ParentChildOverviewPage />} />
        <Route path="children/:studentUserId/exams" element={<ParentChildExamsPage />} />
        <Route path="children/:studentUserId/results" element={<ParentChildResultsPage />} />
        <Route path="children/:studentUserId/results/:attemptId" element={<ParentChildResultDetailPage />} />
        <Route path="children/:studentUserId/analytics" element={<ParentChildAnalyticsPage />} />
        <Route path="notifications" element={<ParentNotificationsPage />} />
        <Route path="profile" element={<ParentProfilePage />} />
      </Route>
      <Route
        path="/student"
        element={
          <AuthGuard>
            <RoleGuard allowedRoles={['student']}>
              <StudentLayout />
            </RoleGuard>
          </AuthGuard>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<StudentDashboardPage />} />
        <Route path="exams" element={<StudentExamsPage />} />
        <Route path="exams/:examId" element={<ExamInstructionsPage />} />
        <Route path="exams/:examId/attempt" element={<ExamAttemptPage />} />
        <Route path="exams/:examId/leaderboard" element={<LeaderboardPage />} />
        <Route path="results" element={<StudentResultsPage />} />
        <Route path="results/:attemptId" element={<ResultDetailPage />} />
        <Route path="analytics" element={<StudentAnalyticsPage />} />
        <Route path="notifications" element={<StudentNotificationsPage />} />
        <Route path="profile" element={<StudentProfilePage />} />
      </Route>
      <Route path="/not-found" element={<NotFoundPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
