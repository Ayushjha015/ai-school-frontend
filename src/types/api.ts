export type RoleName = 'super_admin' | 'org_admin' | 'teacher' | 'student' | 'parent';
export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated';
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface ApiEnvelope<T> {
  status: string;
  code: number;
  data: T;
}

export interface ValidationErrorDetail {
  loc: Array<string | number>;
  msg: string;
  type: string;
}

export interface ValidationErrorResponse {
  status: string;
  code: number;
  message?: {
    detail?: ValidationErrorDetail[];
  };
}

export interface RoleResponse {
  id: number;
  name: RoleName;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
  role: RoleResponse;
}

export interface UserMe {
  id: string;
  name: string;
  email: string;
  role: RoleName;
  organizationId?: string | null;
  organizationName?: string | null;
  branchId?: string | null;
  branchName?: string | null;
  phone?: string | null;
  isActive: boolean;
}

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  role: RoleName | string;
  organizationId?: string | null;
  branchId?: string | null;
  phone?: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface StudentResponse extends UserResponse {
  groupId?: string | null;
  rollNumber?: string | null;
  parentEmail?: string | null;
  parentPhone?: string | null;
}

export interface QuestionOption {
  id?: string;
  optionText: string;
  isCorrect: boolean;
}

export interface SubjectResponse {
  id: string;
  name: string;
  organizationId?: string | null;
}

export interface GroupResponse {
  id: string;
  name: string;
  organizationId?: string | null;
  branchId?: string | null;
  createdBy?: string | null;
  createdAt: string;
}

export interface TagResponse {
  id: string;
  name: string;
  createdAt: string;
}

export interface QuestionTagResponse {
  id: string;
  name: string;
}

export interface TagListResponse {
  total: number;
  items: TagResponse[];
}

export interface TopicPerformance {
  topic?: string | null;
  correct: number;
  incorrect: number;
  accuracy: number;
}

export interface CompletionRateResponse {
  totalAssigned: number;
  totalCompleted: number;
  completionRate: number;
}

export interface AvgScoreResponse {
  avgPercentage: number;
  totalExamsAttempted: number;
}

export interface ProgressionPoint {
  examId: string;
  examTitle: string;
  percentage: number;
  submittedAt: string | null;
}

export interface ProgressionResponse {
  points: ProgressionPoint[];
}

export interface StudentSubjectMastery {
  subjectId: string;
  subjectName: string;
  avgPercentage: number;
  masteryLevel: 'Star' | 'Achiever' | 'Learner';
}

export interface StudentHeatmapResponse {
  subjectMasteries: StudentSubjectMastery[];
}

export interface ClassHeatmapRow {
  masteryLevel: 'Learner' | 'Achiever' | 'Star';
  cells: number[];
}

export interface ClassHeatmapResponse {
  subjects: string[];
  rows: ClassHeatmapRow[];
}

export interface TopPerformerEntry {
  rank: number;
  studentId: string;
  studentUserId: string;
  studentName: string;
  avgPercentage: number;
}

export interface TopPerformersResponse {
  entries: TopPerformerEntry[];
}

export interface DetailedTableRow {
  studentId: string;
  studentUserId: string;
  studentName: string;
  groupName: string;
  avgPercentage: number;
  completionRate: number;
  masteryLevel: 'Star' | 'Achiever' | 'Learner';
}

export interface DetailedTableResponse {
  rows: DetailedTableRow[];
}

export interface AssignedGroupSummary {
  groupId: string;
  groupName: string;
  studentCount: number;
}

export interface StudentInGroupSummary {
  studentUserId: string;
  studentName: string;
}

export interface TeacherClassDashboardResponse {
  groupId: string;
  groupName: string;
  completionRate: CompletionRateResponse;
  avgScore: AvgScoreResponse;
  topPerformers: TopPerformersResponse;
  heatmap: ClassHeatmapResponse;
  performanceTable: DetailedTableResponse;
}

export interface TeacherStudentDashboardResponse {
  studentUserId: string;
  studentName: string;
  completionRate: CompletionRateResponse;
  avgScore: AvgScoreResponse;
  progression: ProgressionResponse;
  heatmap: StudentHeatmapResponse;
  performanceTable: StudentExamResult[];
}

export interface QuestionResponse {
  id: string;
  subjectId: string;
  createdBy: string;
  questionText: string;
  topic?: string | null;
  difficulty?: string | null;
  options: QuestionOption[];
  tags: QuestionTagResponse[];
  createdAt: string;
}

export interface ExamQuestionResponse {
  id: string;
  questionText: string;
  topic?: string | null;
  difficulty?: string | null;
  marks: number;
  questionBankId?: string | null;
  options: QuestionOption[];
}

export interface TeacherExamListItem {
  id: string;
  title: string;
  subjectId: string;
  topic?: string | null;
  timeLimitMinutes?: number | null;
  startTime?: string | null;
  endTime?: string | null;
  status: string;
  approvalStatus: string;
  createdBy: string;
  createdAt: string;
  questionCount?: number | null;
}

export interface ExamResponse {
  id: string;
  title: string;
  subjectId: string;
  topic?: string | null;
  timeLimitMinutes?: number | null;
  startTime?: string | null;
  endTime?: string | null;
  status: string;
  approvalStatus: string;
  createdBy: string;
  createdAt: string;
  questions: ExamQuestionResponse[];
}

export interface StudentExamDetails {
  id: string;
  title: string;
  subjectId: string;
  topic?: string | null;
  timeLimitMinutes?: number | null;
  startTime?: string | null;
  endTime?: string | null;
  passPercentage: number;
}

export interface StudentExamListResponse {
  live: StudentExamDetails[];
  upcoming: StudentExamDetails[];
  missed: StudentExamDetails[];
  given: StudentExamDetails[];
}

export interface StudentExamSummary {
  examId: string;
  title: string;
  subjectId: string;
  topic?: string | null;
  timeLimitMinutes?: number | null;
  startTime?: string | null;
  endTime?: string | null;
  examStatus: string;
  studentStatus: string;
}

export interface StudentExamsResponse {
  studentProfileId: string;
  fullName: string;
  upcoming: StudentExamSummary[];
  completed: StudentExamSummary[];
  missed: StudentExamSummary[];
}

export interface StudentExamResult {
  examId: string;
  examTitle: string;
  score: number;
  percentage: number;
  passed: boolean;
  submittedAt?: string | null;
  topicBreakdown?: TopicPerformance[];
}

export interface StudentSummaryResponse {
  studentId: string;
  studentName: string;
  totalExamsAttempted: number;
  avgPercentage: number;
  strongestTopics: TopicPerformance[];
  weakestTopics: TopicPerformance[];
  results: StudentExamResult[];
}

export interface ResultSummary {
  attemptId: string;
  examId?: string;
  examTitle?: string;
  studentId?: string;
  score: number;
  percentage: number;
  generatedAt: string;
}

export interface StudentResultSummary {
  attemptId: string;
  examId: string;
  examTitle: string;
  score: number;
  percentage: number;
  generatedAt: string;
}

export interface StudentResultsResponse {
  studentProfileId: string;
  fullName: string;
  totalExamsAttempted: number;
  averagePercentage: number;
  results: StudentResultSummary[];
}

export interface PaginatedResponse<T> {
  total: number;
  page: number;
  limit: number;
  items: T[];
}

export interface AttemptQuestion {
  id: string;
  questionText: string;
  topic?: string | null;
  difficulty?: string | null;
  marks: number;
  options: QuestionOption[];
}

export interface AttemptStartResponse {
  attemptId: string;
  examId: string;
  startedAt: string;
  timeLimitMinutes?: number | null;
  questions: AttemptQuestion[];
}

export interface AnswerInput {
  questionId: string;
  selectedOptionId: string | null;
}

export interface AnswerResult {
  questionId: string;
  questionText: string;
  tags?: QuestionTagResponse[];
  selectedOptionId?: string | null;
  isCorrect?: boolean | null;
  marksObtained: number;
  correctOptionId?: string | null;
}

export interface AttemptDetailResponse {
  attemptId: string;
  examId: string;
  status: string;
  startedAt?: string | null;
  submittedAt?: string | null;
  tabSwitchCount: number;
  answers: AnswerResult[];
}

export interface SubmitAttemptResponse {
  attemptId: string;
  examId: string;
  submittedAt: string;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  score: number;
  percentage: number;
  topicPerformance: TopicPerformance[];
  answerDetails?: AnswerResult[];
}

export interface FullResultResponse {
  attemptId: string;
  examId: string;
  studentId: string;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  score: number;
  percentage: number;
  generatedAt: string;
  topicPerformance: TopicPerformance[];
  answers: AnswerResult[];
}

export interface LeaderboardEntry {
  rank: number;
  studentId: string;
  studentName: string;
  score: number;
  percentage: number;
  timeTakenSeconds?: number | null;
  tabSwitchCount: number;
}

export interface ExamLeaderboardResponse {
  examId: string;
  examTitle: string;
  passPercentage: number;
  entries: LeaderboardEntry[];
}

export interface ExamOverviewResponse {
  examId: string;
  examTitle: string;
  totalAssigned: number;
  totalAttempted: number;
  totalMissed: number;
  avgScore: number;
  highestScore: number;
  lowestScore: number;
  avgPercentage: number;
  passRate: number;
  passPercentage: number;
  topicBreakdown: TopicPerformance[];
}

export interface GroupTrendPoint {
  examId?: string;
  examTitle?: string;
  avgPercentage?: number;
  attempted?: number;
  missed?: number;
}

export interface AtRiskStudent {
  studentId: string;
  studentName: string;
  avgPercentage: number;
}

export interface GroupPerformanceResponse {
  groupId: string;
  groupName: string;
  atRiskThreshold: number;
  examTrend: GroupTrendPoint[];
  weakestTopics: TopicPerformance[];
  atRiskStudents: AtRiskStudent[];
}

export interface OrganizationResponse {
  id: string;
  name: string;
  code?: string | null;
  atRiskThreshold?: number | null;
  createdAt: string;
}

export interface BranchResponse {
  id: string;
  organizationId: string;
  name: string;
  city?: string | null;
  state?: string | null;
  createdAt: string;
}

export interface OrganizationDetailResponse extends OrganizationResponse {
  branches?: BranchResponse[];
  orgAdmins?: UserResponse[];
}

export interface OrgAdminCreateRequest {
  name: string;
  email: string;
  password: string;
  organizationId: string;
  branchId?: string | null;
  phone?: string | null;
}

export interface TeacherUpdateRequest {
  name?: string | null;
  phone?: string | null;
  isActive?: boolean | null;
}

export interface BulkUploadResponse {
  created: number;
  errors: string[];
}

export interface ClassGroupStrength {
  groupId: string;
  groupName: string;
  studentCount: number;
}

export interface AdminDashboardStatsResponse {
  totalTeachers: number;
  totalClasses: number;
  totalStudents: number;
  classStrengths: ClassGroupStrength[];
}

export interface CreateStudentRequest {
  name: string;
  email: string;
  password: string;
  groupId: string;
  rollNumber: string;
  parentEmail: string;
  parentPhone: string;
  phone?: string | null;
}

export interface ParentListResponse extends PaginatedResponse<UserResponse> {}

export interface AssignTeacherResponse {
  groupId: string;
  teacherId: string;
  assignedAt: string;
}

export interface OrgOverviewResponse {
  organizationId: string;
  organizationName: string;
  atRiskThreshold: number;
  totalExams: number;
  totalAttempts: number;
  avgPercentage: number;
  atRiskStudents: AtRiskStudent[];
}

export interface SubjectOverviewExam {
  examId?: string | null;
  examTitle?: string | null;
  avgPercentage?: number | null;
  totalAttempts?: number | null;
}

export interface SubjectOverviewResponse {
  subjectId: string;
  subjectName: string;
  totalExams: number;
  exams: SubjectOverviewExam[];
  weakestTopics: TopicPerformance[];
}

export interface ExamResultListItem {
  attemptId: string;
  studentId: string;
  studentName?: string | null;
  score: number;
  percentage: number;
  generatedAt: string;
  submittedAt?: string | null;
}

export interface NotificationResponse {
  id: string;
  title?: string | null;
  message?: string | null;
  type?: string | null;
  isRead: boolean;
  relatedId?: string | null;
  sentAt: string;
}

export interface UnreadCountResponse {
  count: number;
}

export interface AttemptSessionSnapshot {
  attemptId: string;
  examId: string;
  startedAt: string;
  clientStartedAtMs: number;
  timeLimitMinutes?: number | null;
  resolvedDeadlineMs?: number;
  questions: AttemptQuestion[];
  answers: Record<string, string | null>;
}

export interface LinkedStudentResponse {
  studentProfileId: string;
  userId: string;
  fullName: string;
  email: string;
  rollNumber?: string | null;
  groupId: string;
}

export interface GenerateQuestionsRequest {
  subjectId: string;
  topic: string;
  difficulty: Difficulty;
  count: number;
  customInstructions?: string | null;
}

export interface GeneratedQuestionPreview {
  questionText: string;
  topic?: string | null;
  difficulty?: string | null;
  options: QuestionOption[];
  tags: QuestionTagResponse[];
}

export interface GenerateQuestionsResponse {
  subjectId: string;
  generatedCount: number;
  questions: GeneratedQuestionPreview[];
}

export interface SavedQuestionsResponse {
  savedCount: number;
  questionIds: string[];
}

export interface CreateExamQuestionInput {
  questionId: string;
  marks: number;
}

export interface CreateExamRequest {
  title: string;
  subjectId: string;
  topic?: string | null;
  timeLimitMinutes?: number | null;
  startTime?: string | null;
  endTime?: string | null;
  questions: CreateExamQuestionInput[];
}
