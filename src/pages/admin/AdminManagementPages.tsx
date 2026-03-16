import { zodResolver } from '@hookform/resolvers/zod';
import type { AxiosError } from 'axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { z } from 'zod';
import {
  addStudentsToGroup,
  assignTeacherToGroup,
  bulkUploadStudents,
  createGroup,
  createStudent,
  createSubject,
  createTeacher,
  downloadBulkUploadTemplate,
  deactivateUser,
  updateTeacher,
} from '../../api/adminService';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingScreen } from '../../components/common/LoadingScreen';
import { PaginationControls } from '../../components/common/PaginationControls';
import { SectionCard } from '../../components/common/SectionCard';
import { StatCard } from '../../components/common/StatCard';
import { TopicBarList } from '../../components/common/TopicBarList';
import {
  useAdminGroupPerformanceQuery,
  useAdminGroupQuery,
  useAdminGroupsQuery,
  useAdminGroupStudentsQuery,
  useAdminStudentQuery,
  useAdminStudentResultsQuery,
  useAdminStudentSummaryQuery,
  useAdminStudentsQuery,
  useAdminSubjectsQuery,
  useAdminTeacherQuery,
  useAdminTeachersQuery,
} from '../../hooks/useAdminQueries';
import type { ValidationErrorResponse } from '../../types/api';
import { formatDateTime, formatPercentage, formatRoleLabel } from '../../utils/formatters';
import { parseValidationErrors } from '../../utils/parseValidationErrors';
import { getStatusAccent, getStatusTone } from '../../utils/statusStyles';

const teacherSchema = z.object({
  name: z.string().min(2, 'Enter the teacher name'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Use at least 8 characters'),
  phone: z.string().optional(),
});

const teacherUpdateSchema = z.object({
  name: z.string().min(2, 'Enter the teacher name'),
  phone: z.string().optional(),
  isActive: z.boolean(),
});

const studentSchema = z.object({
  name: z.string().min(2, 'Enter the student name'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Use at least 8 characters'),
  groupId: z.string().min(1, 'Select a group'),
  rollNumber: z.string().trim().min(1, 'Enter the roll number'),
  parentEmail: z.string().trim().min(1, 'Enter the parent email').email('Enter a valid email'),
  parentPhone: z.string().trim().min(1, 'Enter the parent phone'),
  phone: z.string().optional(),
});

const groupSchema = z.object({
  name: z.string().min(2, 'Enter the group name'),
  teacherId: z.string().optional(),
});

const subjectSchema = z.object({
  name: z.string().min(2, 'Enter the subject name'),
});

type TeacherForm = z.infer<typeof teacherSchema>;
type TeacherUpdateForm = z.infer<typeof teacherUpdateSchema>;
type StudentForm = z.infer<typeof studentSchema>;
type GroupForm = z.infer<typeof groupSchema>;
type SubjectForm = z.infer<typeof subjectSchema>;

function applyFormValidationErrors<FormValues extends Record<string, unknown>>(
  error: unknown,
  setError: (name: keyof FormValues, error: { type: string; message?: string }) => void,
) {
  const axiosError = error as AxiosError<ValidationErrorResponse>;
  if (axiosError.response?.status !== 422) {
    return false;
  }

  const fieldErrors = parseValidationErrors(axiosError.response.data);
  Object.entries(fieldErrors).forEach(([field, message]) => {
    setError(field as keyof FormValues, { type: 'server', message });
  });
  return true;
}

export function AdminTeachersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const { data, isLoading, isError } = useAdminTeachersQuery(page, 12, search.trim() || undefined);

  if (isLoading) return <LoadingScreen label="Loading teachers..." />;
  if (isError || !data) return <div className="rounded-[28px] border border-rose-200 bg-rose-50 p-8 text-rose-700">Teacher data is unavailable right now.</div>;

  return (
    <div className="space-y-6">
      <SectionCard title="Teachers" eyebrow="Organization faculty" action={<Link to="/admin/teachers/new" className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">Add teacher</Link>}>
        <input
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          placeholder="Search teachers by name or email"
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-100"
        />
      </SectionCard>

      {data.items.length === 0 ? (
        <EmptyState title="No teachers found" description="Adjust the search or create a teacher to populate the organization roster." actionLabel="Add teacher" actionTo="/admin/teachers/new" />
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {data.items.map((teacher) => (
            <Link key={teacher.id} to={`/admin/teachers/${teacher.id}`} className="rounded-3xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg dark:border-slate-700 dark:bg-slate-950/70 dark:hover:border-slate-600">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{teacher.name}</h3>
                  <p className="mt-2 break-words text-sm text-slate-600 dark:text-slate-400 [overflow-wrap:anywhere]">{teacher.email}</p>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{teacher.phone ?? 'Phone not provided'}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${getStatusTone(teacher.isActive ? 'active' : 'inactive')}`}>
                  {teacher.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      <PaginationControls page={page} total={data.total} limit={data.limit} onPageChange={setPage} />
    </div>
  );
}

export function AdminCreateTeacherPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const form = useForm<TeacherForm>({
    resolver: zodResolver(teacherSchema),
    defaultValues: { name: '', email: '', password: '', phone: '' },
  });

  const mutation = useMutation({
    mutationFn: createTeacher,
    onSuccess: async (teacher) => {
      toast.success('Teacher created.');
      await queryClient.invalidateQueries({ queryKey: ['admin', 'teachers'] });
      navigate(`/admin/teachers/${teacher.id}`);
    },
    onError: () => toast.error('Unable to create the teacher right now.'),
  });

  return (
    <SectionCard title="Add teacher" eyebrow="Faculty onboarding">
      <form className="grid gap-4 md:max-w-2xl" onSubmit={form.handleSubmit((values) => mutation.mutate({ ...values, phone: values.phone || null }))}>
        <input {...form.register('name')} placeholder="Teacher name" className="rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-100" />
        <input {...form.register('email')} placeholder="Teacher email" className="rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-100" />
        <input type="password" {...form.register('password')} placeholder="Temporary password" className="rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-100" />
        <input {...form.register('phone')} placeholder="Phone (optional)" className="rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-100" />
        <button type="submit" disabled={mutation.isPending} className="w-full rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60 sm:w-auto">
          {mutation.isPending ? 'Creating...' : 'Create teacher'}
        </button>
      </form>
    </SectionCard>
  );
}

export function AdminTeacherDetailPage() {
  const { teacherId = '' } = useParams();
  const queryClient = useQueryClient();
  const teacherQuery = useAdminTeacherQuery(teacherId);
  const form = useForm<TeacherUpdateForm>();

  const updateMutation = useMutation({
    mutationFn: (values: TeacherUpdateForm) => updateTeacher(teacherId, values),
    onSuccess: async () => {
      toast.success('Teacher updated.');
      await queryClient.invalidateQueries({ queryKey: ['admin', 'teacher', teacherId] });
      await queryClient.invalidateQueries({ queryKey: ['admin', 'teachers'] });
    },
    onError: () => toast.error('Unable to update the teacher right now.'),
  });

  if (teacherQuery.isLoading) return <LoadingScreen label="Loading teacher details..." />;
  if (teacherQuery.isError || !teacherQuery.data) return <div className="rounded-[28px] border border-rose-200 bg-rose-50 p-8 text-rose-700">Teacher details are unavailable right now.</div>;

  const teacher = teacherQuery.data;
  if (!form.formState.isDirty && form.getValues('name') !== teacher.name) {
    form.reset({ name: teacher.name, phone: teacher.phone ?? '', isActive: teacher.isActive });
  }

  return (
    <div className="space-y-6">
      <SectionCard title={teacher.name} eyebrow="Teacher detail">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Role" value={formatRoleLabel(teacher.role)} helper="Current access level." accent="blue" />
          <StatCard label="Email" value={teacher.email} helper="Primary sign-in email." accent="amber" />
          <StatCard label="Status" value={teacher.isActive ? 'Active' : 'Inactive'} helper="Current teacher access status." accent={getStatusAccent(teacher.isActive ? 'active' : 'inactive')} />
          <StatCard label="Created" value={formatDateTime(teacher.createdAt)} helper="Account creation time." accent="slate" />
        </div>
      </SectionCard>

      <SectionCard title="Edit teacher" eyebrow="Account management">
        <form className="grid gap-4 md:max-w-2xl" onSubmit={form.handleSubmit((values) => updateMutation.mutate(values))}>
          <input {...form.register('name')} placeholder="Teacher name" className="rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-100" />
          <input {...form.register('phone')} placeholder="Phone (optional)" className="rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-100" />
          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-200">
            <input type="checkbox" {...form.register('isActive')} />
            Teacher account is active
          </label>
          <button type="submit" disabled={updateMutation.isPending} className="w-full rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60 sm:w-auto">
            {updateMutation.isPending ? 'Saving...' : 'Save changes'}
          </button>
        </form>
      </SectionCard>
    </div>
  );
}

export function AdminStudentsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [groupId, setGroupId] = useState('');
  const studentsQuery = useAdminStudentsQuery({ groupId: groupId || undefined, page, limit: 12, search: search.trim() || undefined });
  const groupsQuery = useAdminGroupsQuery(1, 100);

  if (studentsQuery.isLoading || groupsQuery.isLoading) return <LoadingScreen label="Loading students..." />;
  if (studentsQuery.isError || groupsQuery.isError || !studentsQuery.data || !groupsQuery.data) {
    return <div className="rounded-[28px] border border-rose-200 bg-rose-50 p-8 text-rose-700">Student data is unavailable right now.</div>;
  }

  return (
    <div className="space-y-6">
      <SectionCard title="Students" eyebrow="Organization roster" action={<Link to="/admin/students/new" className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">Add student</Link>}>
        <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search students by name or email"
            className="rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-100"
          />
          <select
            value={groupId}
            onChange={(event) => {
              setGroupId(event.target.value);
              setPage(1);
            }}
            className="rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-100"
          >
            <option value="">All groups</option>
            {groupsQuery.data.items.map((group) => <option key={group.id} value={group.id}>{group.name}</option>)}
          </select>
        </div>
      </SectionCard>

      {studentsQuery.data.items.length === 0 ? (
        <EmptyState title="No students found" description="Adjust the search or group filter, or create a student." actionLabel="Add student" actionTo="/admin/students/new" />
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {studentsQuery.data.items.map((student) => (
            <Link key={student.id} to={`/admin/students/${student.id}`} className="rounded-3xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg dark:border-slate-700 dark:bg-slate-950/70 dark:hover:border-slate-600">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{student.name}</h3>
                  <p className="mt-2 break-words text-sm text-slate-600 dark:text-slate-400 [overflow-wrap:anywhere]">{student.email}</p>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Roll number: {student.rollNumber ?? 'Not assigned'}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${getStatusTone(student.isActive ? 'active' : 'inactive')}`}>
                  {student.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      <PaginationControls page={page} total={studentsQuery.data.total} limit={studentsQuery.data.limit} onPageChange={setPage} />
    </div>
  );
}

export function AdminCreateStudentPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const groupsQuery = useAdminGroupsQuery(1, 100);
  const form = useForm<StudentForm>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      groupId: '',
      rollNumber: '',
      parentEmail: '',
      parentPhone: '',
      phone: '',
    },
  });

  const mutation = useMutation({
    mutationFn: createStudent,
    onSuccess: async (student) => {
      toast.success('Student created.');
      await queryClient.invalidateQueries({ queryKey: ['admin', 'students'] });
      navigate(`/admin/students/${student.id}`);
    },
    onError: (error) => {
      if (applyFormValidationErrors<StudentForm>(error, form.setError)) {
        toast.error('Please fix the highlighted student fields.');
        return;
      }
      toast.error('Unable to create the student right now.');
    },
  });

  if (groupsQuery.isLoading) return <LoadingScreen label="Loading student form..." />;
  if (groupsQuery.isError || !groupsQuery.data) return <div className="rounded-[28px] border border-rose-200 bg-rose-50 p-8 text-rose-700">Student form data is unavailable right now.</div>;

  return (
    <SectionCard title="Add student" eyebrow="Student onboarding">
      <form
        className="grid gap-4 md:max-w-2xl"
        onSubmit={form.handleSubmit((values) =>
          mutation.mutate({
            ...values,
            rollNumber: values.rollNumber,
            parentEmail: values.parentEmail,
            parentPhone: values.parentPhone,
            phone: values.phone || null,
          }),
        )}
      >
        <input {...form.register('name')} placeholder="Student name" className="rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-100" />
        {form.formState.errors.name ? <p className="-mt-2 text-sm text-rose-500">{form.formState.errors.name.message}</p> : null}
        <input {...form.register('email')} placeholder="Student email" className="rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-100" />
        {form.formState.errors.email ? <p className="-mt-2 text-sm text-rose-500">{form.formState.errors.email.message}</p> : null}
        <input type="password" {...form.register('password')} placeholder="Temporary password" className="rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-100" />
        {form.formState.errors.password ? <p className="-mt-2 text-sm text-rose-500">{form.formState.errors.password.message}</p> : null}
        <select {...form.register('groupId')} className="rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-100">
          <option value="">Select group</option>
          {groupsQuery.data.items.map((group) => <option key={group.id} value={group.id}>{group.name}</option>)}
        </select>
        {form.formState.errors.groupId ? <p className="-mt-2 text-sm text-rose-500">{form.formState.errors.groupId.message}</p> : null}
        <input {...form.register('rollNumber')} placeholder="Roll number" className="rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-100" />
        {form.formState.errors.rollNumber ? <p className="-mt-2 text-sm text-rose-500">{form.formState.errors.rollNumber.message}</p> : null}
        <input {...form.register('parentEmail')} placeholder="Parent email" className="rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-100" />
        {form.formState.errors.parentEmail ? <p className="-mt-2 text-sm text-rose-500">{form.formState.errors.parentEmail.message}</p> : null}
        <input {...form.register('parentPhone')} placeholder="Parent phone" className="rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-100" />
        {form.formState.errors.parentPhone ? <p className="-mt-2 text-sm text-rose-500">{form.formState.errors.parentPhone.message}</p> : null}
        <input {...form.register('phone')} placeholder="Phone (optional)" className="rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-100" />
        <button type="submit" disabled={mutation.isPending} className="w-full rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60 sm:w-auto">
          {mutation.isPending ? 'Creating...' : 'Create student'}
        </button>
      </form>
    </SectionCard>
  );
}

export function AdminStudentDetailPage() {
  const { studentId = '' } = useParams();
  const queryClient = useQueryClient();
  const studentQuery = useAdminStudentQuery(studentId);
  const resultsQuery = useAdminStudentResultsQuery(studentId, 1, 10);
  const summaryQuery = useAdminStudentSummaryQuery(studentId);

  const deactivateMutation = useMutation({
    mutationFn: () => deactivateUser(studentId),
    onSuccess: async () => {
      toast.success('Student access updated.');
      await queryClient.invalidateQueries({ queryKey: ['admin', 'student', studentId] });
      await queryClient.invalidateQueries({ queryKey: ['admin', 'students'] });
    },
    onError: () => toast.error('Unable to change the student status right now.'),
  });

  if (studentQuery.isLoading || resultsQuery.isLoading || summaryQuery.isLoading) return <LoadingScreen label="Loading student details..." />;
  if (studentQuery.isError || resultsQuery.isError || summaryQuery.isError || !studentQuery.data || !resultsQuery.data || !summaryQuery.data) {
    return <div className="rounded-[28px] border border-rose-200 bg-rose-50 p-8 text-rose-700">Student details are unavailable right now.</div>;
  }

  const student = studentQuery.data;
  const summary = summaryQuery.data;

  return (
    <div className="space-y-6">
      <SectionCard
        title={student.name}
        eyebrow="Student detail"
        action={
          <button type="button" onClick={() => deactivateMutation.mutate()} disabled={deactivateMutation.isPending} className="rounded-full border border-rose-300 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:border-rose-400 disabled:opacity-60">
            {deactivateMutation.isPending ? 'Updating...' : student.isActive ? 'Deactivate student' : 'Deactivate again'}
          </button>
        }
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Email" value={student.email} helper="Primary student sign-in email." accent="amber" />
          <StatCard label="Roll number" value={student.rollNumber ?? 'Not assigned'} helper="Current roll number for this student." accent="blue" />
          <StatCard label="Average" value={formatPercentage(summary.avgPercentage)} helper="Average performance across attempted exams." accent="emerald" />
          <StatCard label="Status" value={student.isActive ? 'Active' : 'Inactive'} helper="Current account access state." accent={getStatusAccent(student.isActive ? 'active' : 'inactive')} />
        </div>
      </SectionCard>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <SectionCard title="Recent results" eyebrow="Performance history">
          {resultsQuery.data.items.length === 0 ? (
            <EmptyState title="No results yet" description="This student has not completed any exam attempts yet." />
          ) : (
            <div className="space-y-4">
              {resultsQuery.data.items.map((result) => (
                <div key={result.attemptId} className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-950/70">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{result.studentName ?? student.name}</h3>
                      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Score: {result.score} • {formatPercentage(result.percentage)}</p>
                    </div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{formatDateTime(result.generatedAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard title="Topic trends" eyebrow="Student analytics">
          <TopicBarList title="Strongest topics" items={summary.strongestTopics} emptyLabel="No topic data available yet." />
        </SectionCard>
      </div>
    </div>
  );
}

export function AdminBulkUploadPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [latestResult, setLatestResult] = useState<{ created: number; errors: string[] } | null>(null);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!selectedFile) {
        throw new Error('Select a CSV file first.');
      }

      return bulkUploadStudents(selectedFile);
    },
    onSuccess: (result) => {
      setLatestResult(result);
      toast.success('Bulk upload completed.');
    },
    onError: () => toast.error('Unable to process the CSV right now.'),
  });

  const templateMutation = useMutation({
    mutationFn: downloadBulkUploadTemplate,
    onSuccess: (blob) => {
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'student-bulk-upload-template.csv';
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      toast.success('CSV template downloaded.');
    },
    onError: () => toast.error('Unable to download the CSV template right now.'),
  });

  return (
    <div className="space-y-6">
      <SectionCard title="Bulk upload students" eyebrow="CSV import">
        <div className="space-y-4 md:max-w-2xl">
          <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5 text-sm leading-7 text-slate-600 dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-300">
            Required CSV columns: <span className="font-semibold text-slate-900 dark:text-slate-100">Name, Email, Roll Number, Group, Parent Email, Parent Phone</span>.
          </div>
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
            className="block w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-100"
          />
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={() => templateMutation.mutate()} disabled={templateMutation.isPending} className="w-full rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 disabled:opacity-60 dark:border-slate-600 dark:text-slate-200 sm:w-auto">
              {templateMutation.isPending ? 'Downloading...' : 'Download CSV template'}
            </button>
            <button type="button" onClick={() => mutation.mutate()} disabled={!selectedFile || mutation.isPending} className="w-full rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60 sm:w-auto">
              {mutation.isPending ? 'Uploading...' : 'Upload CSV'}
            </button>
          </div>
        </div>
      </SectionCard>

      {latestResult ? (
        <SectionCard title="Upload summary" eyebrow="Import result">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <StatCard label="Created" value={latestResult.created} helper="Students successfully created from the CSV." accent="emerald" />
            <StatCard label="Errors" value={latestResult.errors.length} helper="Rows that could not be imported." accent="rose" />
          </div>
          {latestResult.errors.length > 0 ? (
            <div className="mt-6 space-y-2 rounded-3xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
              {latestResult.errors.map((error, index) => <p key={`${error}-${index}`}>Row issue: {error}</p>)}
            </div>
          ) : null}
        </SectionCard>
      ) : null}
    </div>
  );
}

export function AdminGroupsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useAdminGroupsQuery(page, 12);

  if (isLoading) return <LoadingScreen label="Loading groups..." />;
  if (isError || !data) return <div className="rounded-[28px] border border-rose-200 bg-rose-50 p-8 text-rose-700">Group data is unavailable right now.</div>;

  return (
    <div className="space-y-6">
      <SectionCard title="Groups" eyebrow="Academic structure" action={<Link to="/admin/groups/new" className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">Create group</Link>}>
        <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">Review the academic groups in your organization, then open a group to assign teachers, add students, and inspect roster performance.</p>
      </SectionCard>

      {data.items.length === 0 ? (
        <EmptyState title="No groups found" description="Create the first group to start organizing teachers and students." actionLabel="Create group" actionTo="/admin/groups/new" />
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {data.items.map((group) => (
            <Link key={group.id} to={`/admin/groups/${group.id}`} className="rounded-3xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg dark:border-slate-700 dark:bg-slate-950/70 dark:hover:border-slate-600">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{group.name}</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Created {formatDateTime(group.createdAt)}</p>
            </Link>
          ))}
        </div>
      )}

      <PaginationControls page={page} total={data.total} limit={data.limit} onPageChange={setPage} />
    </div>
  );
}

export function AdminCreateGroupPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const teachersQuery = useAdminTeachersQuery(1, 100);
  const form = useForm<GroupForm>({
    resolver: zodResolver(groupSchema),
    defaultValues: { name: '', teacherId: '' },
  });

  const mutation = useMutation({
    mutationFn: (values: GroupForm) => createGroup({ name: values.name, teacherId: values.teacherId || null }),
    onSuccess: async (group) => {
      toast.success('Group created.');
      await queryClient.invalidateQueries({ queryKey: ['admin', 'groups'] });
      navigate(`/admin/groups/${group.id}`);
    },
    onError: () => toast.error('Unable to create the group right now.'),
  });

  if (teachersQuery.isLoading) return <LoadingScreen label="Loading group form..." />;
  if (teachersQuery.isError || !teachersQuery.data) return <div className="rounded-[28px] border border-rose-200 bg-rose-50 p-8 text-rose-700">Group form data is unavailable right now.</div>;

  return (
    <SectionCard title="Create group" eyebrow="Academic structure">
      <form className="grid gap-4 md:max-w-2xl" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
        <input {...form.register('name')} placeholder="Group name" className="rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-100" />
        <select {...form.register('teacherId')} className="rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-100">
          <option value="">Assign teacher later</option>
          {teachersQuery.data.items.map((teacher) => <option key={teacher.id} value={teacher.id}>{teacher.name}</option>)}
        </select>
        <button type="submit" disabled={mutation.isPending} className="w-full rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60 sm:w-auto">
          {mutation.isPending ? 'Creating...' : 'Create group'}
        </button>
      </form>
    </SectionCard>
  );
}

export function AdminGroupDetailPage() {
  const { groupId = '' } = useParams();
  const queryClient = useQueryClient();
  const groupQuery = useAdminGroupQuery(groupId);
  const studentsQuery = useAdminGroupStudentsQuery(groupId, 1, 100);
  const teachersQuery = useAdminTeachersQuery(1, 100);
  const unassignedStudentsQuery = useAdminStudentsQuery({ page: 1, limit: 100 });
  const analyticsQuery = useAdminGroupPerformanceQuery(groupId);
  const [teacherId, setTeacherId] = useState('');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

  const assignTeacherMutation = useMutation({
    mutationFn: () => assignTeacherToGroup(groupId, teacherId),
    onSuccess: async () => {
      toast.success('Teacher assigned.');
      await queryClient.invalidateQueries({ queryKey: ['admin', 'group', groupId] });
    },
    onError: () => toast.error('Unable to assign the teacher right now.'),
  });

  const addStudentsMutation = useMutation({
    mutationFn: () => addStudentsToGroup(groupId, selectedStudentIds),
    onSuccess: async () => {
      toast.success('Students added to the group.');
      setSelectedStudentIds([]);
      await queryClient.invalidateQueries({ queryKey: ['admin', 'group-students', groupId] });
      await queryClient.invalidateQueries({ queryKey: ['admin', 'students'] });
    },
    onError: () => toast.error('Unable to add students to the group right now.'),
  });

  if (groupQuery.isLoading || studentsQuery.isLoading || teachersQuery.isLoading || unassignedStudentsQuery.isLoading || analyticsQuery.isLoading) {
    return <LoadingScreen label="Loading group detail..." />;
  }

  if (groupQuery.isError || studentsQuery.isError || teachersQuery.isError || unassignedStudentsQuery.isError || analyticsQuery.isError || !groupQuery.data || !studentsQuery.data || !teachersQuery.data || !unassignedStudentsQuery.data || !analyticsQuery.data) {
    return <div className="rounded-[28px] border border-rose-200 bg-rose-50 p-8 text-rose-700">Group detail is unavailable right now.</div>;
  }

  const currentStudentIds = new Set(studentsQuery.data.items.map((student) => student.id));
  const availableStudents = unassignedStudentsQuery.data.items.filter((student) => !currentStudentIds.has(student.id));

  return (
    <div className="space-y-6">
      <SectionCard title={groupQuery.data.name} eyebrow="Group detail">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Students" value={studentsQuery.data.items.length} helper="Students currently assigned to this group." accent="emerald" />
          <StatCard label="At-risk students" value={analyticsQuery.data.atRiskStudents.length} helper="Students currently below the configured threshold." accent="rose" />
          <StatCard label="Trend points" value={analyticsQuery.data.examTrend.length} helper="Performance snapshots captured for this group." accent="blue" />
          <StatCard label="Created" value={formatDateTime(groupQuery.data.createdAt)} helper="Group creation time." accent="slate" />
        </div>
      </SectionCard>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <SectionCard title="Students in group" eyebrow="Roster">
          {studentsQuery.data.items.length === 0 ? (
            <EmptyState title="No students assigned" description="Add students from the management panel to start tracking progress in this group." />
          ) : (
            <div className="space-y-4">
              {studentsQuery.data.items.map((student) => (
                <Link key={student.id} to={`/admin/students/${student.id}`} className="block rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-950/70">
                  <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{student.name}</h3>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Roll number: {student.rollNumber ?? 'Not assigned'}</p>
                </Link>
              ))}
            </div>
          )}
        </SectionCard>

        <div className="space-y-6">
          <SectionCard title="Assign teacher" eyebrow="Teaching ownership">
            <div className="space-y-4">
              <select value={teacherId} onChange={(event) => setTeacherId(event.target.value)} className="w-full rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-100">
                <option value="">Select teacher</option>
                {teachersQuery.data.items.map((teacher) => <option key={teacher.id} value={teacher.id}>{teacher.name}</option>)}
              </select>
              <button type="button" onClick={() => assignTeacherMutation.mutate()} disabled={!teacherId || assignTeacherMutation.isPending} className="w-full rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60">
                {assignTeacherMutation.isPending ? 'Assigning...' : 'Assign teacher'}
              </button>
            </div>
          </SectionCard>

          <SectionCard title="Add students" eyebrow="Roster management">
            <div className="space-y-3">
              {availableStudents.length === 0 ? (
                <EmptyState title="No available students" description="All loaded students are already assigned to this group." />
              ) : (
                <>
                  <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                    {availableStudents.map((student) => {
                      const checked = selectedStudentIds.includes(student.id);
                      return (
                        <label key={student.id} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-200">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => setSelectedStudentIds((current) => (checked ? current.filter((id) => id !== student.id) : [...current, student.id]))}
                          />
                          <span>{student.name}</span>
                        </label>
                      );
                    })}
                  </div>
                  <button type="button" onClick={() => addStudentsMutation.mutate()} disabled={selectedStudentIds.length === 0 || addStudentsMutation.isPending} className="w-full rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60">
                    {addStudentsMutation.isPending ? 'Adding...' : 'Add selected students'}
                  </button>
                </>
              )}
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}

export function AdminSubjectsPage() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useAdminSubjectsQuery(1, 100);
  const form = useForm<SubjectForm>({
    resolver: zodResolver(subjectSchema),
    defaultValues: { name: '' },
  });

  const mutation = useMutation({
    mutationFn: (values: SubjectForm) => createSubject(values),
    onSuccess: async () => {
      toast.success('Subject created.');
      form.reset();
      await queryClient.invalidateQueries({ queryKey: ['admin', 'subjects'] });
    },
    onError: () => toast.error('Unable to create the subject right now.'),
  });

  if (isLoading) return <LoadingScreen label="Loading subjects..." />;
  if (isError || !data) return <div className="rounded-[28px] border border-rose-200 bg-rose-50 p-8 text-rose-700">Subject data is unavailable right now.</div>;

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <SectionCard title="Subjects" eyebrow="Curriculum setup">
          {data.items.length === 0 ? (
            <EmptyState title="No subjects yet" description="Create the first subject to support exams and analytics." />
          ) : (
            <div className="space-y-4">
              {data.items.map((subject) => (
                <div key={subject.id} className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-950/70">
                  <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{subject.name}</h3>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{subject.id}</p>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard title="Create subject" eyebrow="Manual creation">
          <form className="space-y-4" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
            <input {...form.register('name')} placeholder="Subject name" className="w-full rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-100" />
            <button type="submit" disabled={mutation.isPending} className="w-full rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60">
              {mutation.isPending ? 'Creating...' : 'Create subject'}
            </button>
          </form>
        </SectionCard>
      </div>
    </div>
  );
}
