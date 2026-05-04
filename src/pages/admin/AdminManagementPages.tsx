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
import { PaginationFooter } from '../../components/common/PaginationFooter';
import { SectionCard } from '../../components/common/SectionCard';
import { StatCard } from '../../components/common/StatCard';
import { TopicBarList } from '../../components/common/TopicBarList';
import {
  useAdminGroupPerformanceQuery,
  useAdminGroupQuery,
  useAdminGroupsQuery,
  useAdminGroupStudentsQuery,
  useAdminOrganizationBranchesQuery,
  useAdminStudentQuery,
  useAdminStudentResultsQuery,
  useAdminStudentSummaryQuery,
  useAdminStudentsQuery,
  useAdminSubjectsQuery,
  useAdminTeacherQuery,
  useAdminTeachersQuery,
} from '../../hooks/useAdminQueries';
import { useAuthStore } from '../../store/authStore';
import type { ValidationErrorResponse } from '../../types/api';
import { formatDateTime, formatPercentage, formatRoleLabel } from '../../utils/formatters';
import { parseValidationErrors } from '../../utils/parseValidationErrors';
import { getStatusAccent, getStatusTone } from '../../utils/statusStyles';
import { IconLabel, appIcons } from '../../utils/appIcons';

const teacherSchema = z.object({
  name: z.string().min(2, 'Enter the teacher name'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Use at least 8 characters'),
  groupIds: z.array(z.string()).min(1, 'Select at least one class'),
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
  groupId: z.string().min(1, 'Select a class'),
  rollNumber: z.string().trim().min(1, 'Enter the roll number'),
  parentEmail: z.string().trim().min(1, 'Enter the parent email').email('Enter a valid email'),
  parentPhone: z.string().trim().min(1, 'Enter the parent phone'),
  phone: z.string().optional(),
});

const groupSchema = z.object({
  name: z.string().min(2, 'Enter the class name'),
  branchId: z.string().min(1, 'Select a branch'),
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
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const { data, isLoading, isError } = useAdminTeachersQuery(page, limit, search.trim() || undefined);

  if (isLoading) return <LoadingScreen label="Loading teachers..." />;
  if (isError || !data) return <div className="rounded-[28px] border border-rose-200 bg-rose-50 p-8 text-rose-700">Teacher data is unavailable right now.</div>;

  return (
    <div className="space-y-6">
      <SectionCard title="Teachers" eyebrow="Organization faculty" action={<Link to="/admin/teachers/new" className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"><IconLabel label="Add teacher" /></Link>}>
        <input
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          placeholder="Search teachers by name or email"
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-100"
        />

        {data.items.length === 0 ? (
          <div className="mt-6">
            <EmptyState title="No teachers found" description="Adjust the search or create a teacher to populate the organization roster." actionLabel="Add teacher" actionTo="/admin/teachers/new" />
          </div>
        ) : (
          <>
          <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white/80 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-950/70">
            <div className="overflow-x-auto">
              <table className="min-w-[860px] w-full text-left text-sm">
                <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:bg-slate-900/80 dark:text-slate-400">
                  <tr>
                    <th className="px-5 py-4">S.No</th>
                    <th className="px-5 py-4">Teacher</th>
                    <th className="px-5 py-4">Email</th>
                    <th className="px-5 py-4">Branch</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">Created at</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {data.items.map((teacher, index) => (
                    <tr key={teacher.id} className="text-slate-700 transition hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-900/70">
                      <td className="px-5 py-4 text-xs font-semibold text-slate-400">{(page - 1) * data.size + index + 1}</td>
                      <td className="px-5 py-4">
                        <Link to={`/admin/teachers/${teacher.id}`} className="font-semibold text-slate-900 transition hover:text-emerald-600 dark:text-slate-100 dark:hover:text-emerald-300">{teacher.name}</Link>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{teacher.phone ?? 'Phone not provided'}</p>
                      </td>
                      <td className="px-5 py-4 break-words text-slate-600 dark:text-slate-400 [overflow-wrap:anywhere]">{teacher.email}</td>
                      <td className="px-5 py-4">{teacher.branchName ?? '—'}</td>
                      <td className="px-5 py-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${getStatusTone(teacher.isActive ? 'active' : 'inactive')}`}>{teacher.isActive ? 'Active' : 'Inactive'}</span>
                      </td>
                      <td className="px-5 py-4 text-slate-600 dark:text-slate-400">{formatDateTime(teacher.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <PaginationFooter
            page={page}
            total={data.total}
            size={data.size}
            pages={data.pages}
            limit={limit}
            onLimitChange={(nextLimit) => {
              setLimit(nextLimit);
              setPage(1);
            }}
            onPageChange={setPage}
          />
          </>
        )}
      </SectionCard>
    </div>
  );
}

export function AdminCreateTeacherPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const groupsQuery = useAdminGroupsQuery(1, 100);
  const form = useForm<TeacherForm>({
    resolver: zodResolver(teacherSchema),
    defaultValues: { name: '', email: '', password: '', groupIds: [], phone: '' },
  });
  const groups = groupsQuery.data?.items ?? [];
  const selectedGroupIds = form.watch('groupIds') ?? [];

  function toggleTeacherGroup(groupId: string) {
    const nextGroupIds = selectedGroupIds.includes(groupId)
      ? selectedGroupIds.filter((id) => id !== groupId)
      : [...selectedGroupIds, groupId];

    form.setValue('groupIds', nextGroupIds, { shouldDirty: true, shouldValidate: true });
  }

  const mutation = useMutation({
    mutationFn: createTeacher,
    onSuccess: async (teacher) => {
      toast.success('Teacher created.');
      await queryClient.invalidateQueries({ queryKey: ['admin', 'teachers'] });
      await queryClient.invalidateQueries({ queryKey: ['admin', 'groups'] });
      navigate(`/admin/teachers/${teacher.id}`);
    },
    onError: (error) => {
      if (applyFormValidationErrors<TeacherForm>(error, form.setError)) {
        return;
      }

      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 404) {
        form.setError('groupIds', { type: 'server', message: 'One or more selected classes were not found. Choose valid classes.' });
        toast.error('One or more selected classes were not found.');
        return;
      }

      toast.error('Unable to create the teacher right now.');
    },
  });

  return (
    <SectionCard title="Add teacher" eyebrow="Faculty onboarding">
      <form className="grid gap-4 md:max-w-2xl" onSubmit={form.handleSubmit((values) => mutation.mutate({ ...values, phone: values.phone || null }))}>
        <input {...form.register('name')} placeholder="Teacher name" className="rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-100" />
        {form.formState.errors.name ? <p className="-mt-2 text-sm text-rose-500">{form.formState.errors.name.message}</p> : null}
        <input {...form.register('email')} placeholder="Teacher email" className="rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-100" />
        {form.formState.errors.email ? <p className="-mt-2 text-sm text-rose-500">{form.formState.errors.email.message}</p> : null}
        <input type="password" {...form.register('password')} placeholder="Temporary password" className="rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-100" />
        {form.formState.errors.password ? <p className="-mt-2 text-sm text-rose-500">{form.formState.errors.password.message}</p> : null}
        <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700 dark:bg-slate-950/70">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Assign classes</span>
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{selectedGroupIds.length} selected</span>
          </div>
          <div className="mt-3 max-h-56 space-y-2 overflow-y-auto pr-1">
            {groupsQuery.isLoading ? <p className="text-sm text-slate-500 dark:text-slate-400">Loading classes...</p> : null}
            {groups.map((group) => {
              const checked = selectedGroupIds.includes(group.id);
              return (
                <label key={group.id} className={`flex items-center gap-3 rounded-xl border px-3 py-2 text-sm transition ${checked ? 'border-emerald-400 bg-emerald-50 text-emerald-900 dark:bg-emerald-500/10 dark:text-emerald-200' : 'border-slate-200 text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-600'}`}>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleTeacherGroup(group.id)}
                    disabled={groupsQuery.isLoading || groupsQuery.isError}
                    className="h-4 w-4 accent-emerald-500"
                  />
                  <span className="font-medium">{group.name}</span>
                </label>
              );
            })}
          </div>
        </div>
        {form.formState.errors.groupIds ? <p className="-mt-2 text-sm text-rose-500">{form.formState.errors.groupIds.message}</p> : null}
        {groupsQuery.isError ? <p className="-mt-2 text-sm text-rose-500">Unable to load classes. Try again before creating a teacher.</p> : null}
        {!groupsQuery.isLoading && !groupsQuery.isError && groups.length === 0 ? <p className="-mt-2 text-sm text-amber-500">Create a class before adding a teacher.</p> : null}
        <input {...form.register('phone')} placeholder="Phone (optional)" className="rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-100" />
        <button type="submit" disabled={mutation.isPending || groupsQuery.isLoading || groupsQuery.isError || groups.length === 0} className="w-full rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60 sm:w-auto">
          <IconLabel label={mutation.isPending ? 'Creating...' : 'Create teacher'} />
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
            <IconLabel label={updateMutation.isPending ? 'Saving...' : 'Save changes'} icon={appIcons.Save} />
          </button>
        </form>
      </SectionCard>
    </div>
  );
}

export function AdminStudentsPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [groupId, setGroupId] = useState('');
  const studentsQuery = useAdminStudentsQuery({ groupId: groupId || undefined, page, limit, search: search.trim() || undefined });
  const groupsQuery = useAdminGroupsQuery(1, 100);

  if (studentsQuery.isLoading || groupsQuery.isLoading) return <LoadingScreen label="Loading students..." />;
  if (studentsQuery.isError || groupsQuery.isError || !studentsQuery.data || !groupsQuery.data) {
    return <div className="rounded-[28px] border border-rose-200 bg-rose-50 p-8 text-rose-700">Student data is unavailable right now.</div>;
  }

  return (
    <div className="space-y-6">
      <SectionCard title="Students" eyebrow="Organization roster" action={<Link to="/admin/students/new" className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"><IconLabel label="Add student" /></Link>}>
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
            <option value="">All classes</option>
            {groupsQuery.data.items.map((group) => <option key={group.id} value={group.id}>{group.name}</option>)}
          </select>
        </div>

        {studentsQuery.data.items.length === 0 ? (
          <div className="mt-6">
            <EmptyState title="No students found" description="Adjust the search or class filter, or create a student." actionLabel="Add student" actionTo="/admin/students/new" />
          </div>
        ) : (
          <>
          <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white/80 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-950/70">
            <div className="overflow-x-auto">
              <table className="min-w-[920px] w-full text-left text-sm">
                <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:bg-slate-900/80 dark:text-slate-400">
                  <tr>
                    <th className="px-5 py-4">S.No</th>
                    <th className="px-5 py-4">Student</th>
                    <th className="px-5 py-4">Email</th>
                    <th className="px-5 py-4">Class</th>
                    <th className="px-5 py-4">Roll no</th>
                    <th className="px-5 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {studentsQuery.data.items.map((student, index) => (
                    <tr key={student.id} className="text-slate-700 transition hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-900/70">
                      <td className="px-5 py-4 text-xs font-semibold text-slate-400">{(page - 1) * studentsQuery.data.size + index + 1}</td>
                      <td className="px-5 py-4">
                        <Link to={`/admin/students/${student.id}`} className="font-semibold text-slate-900 transition hover:text-emerald-600 dark:text-slate-100 dark:hover:text-emerald-300">{student.name}</Link>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{student.branchName ?? 'Branch not assigned'}</p>
                      </td>
                      <td className="px-5 py-4 break-words text-slate-600 dark:text-slate-400 [overflow-wrap:anywhere]">{student.email}</td>
                      <td className="px-5 py-4 font-semibold">{student.groupName ?? 'Class not assigned'}</td>
                      <td className="px-5 py-4">{student.rollNumber ?? 'Not assigned'}</td>
                      <td className="px-5 py-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${getStatusTone(student.isActive ? 'active' : 'inactive')}`}>{student.isActive ? 'Active' : 'Inactive'}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <PaginationFooter
            page={page}
            total={studentsQuery.data.total}
            size={studentsQuery.data.size}
            pages={studentsQuery.data.pages}
            limit={limit}
            onLimitChange={(nextLimit) => {
              setLimit(nextLimit);
              setPage(1);
            }}
            onPageChange={setPage}
          />
          </>
        )}
      </SectionCard>
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
          <option value="">Select class</option>
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
          <IconLabel label={mutation.isPending ? 'Creating...' : 'Create student'} />
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
            <IconLabel label={deactivateMutation.isPending ? 'Updating...' : student.isActive ? 'Deactivate student' : 'Deactivate again'} icon={student.isActive ? appIcons.Trash2 : appIcons.CheckCircle2} />
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
            Required CSV columns: <span className="font-semibold text-slate-900 dark:text-slate-100">Name, Email, Roll Number, Class, Parent Email, Parent Phone</span>.
          </div>
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
            className="block w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-100"
          />
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={() => templateMutation.mutate()} disabled={templateMutation.isPending} className="w-full rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 disabled:opacity-60 dark:border-slate-600 dark:text-slate-200 sm:w-auto">
              <IconLabel label={templateMutation.isPending ? 'Downloading...' : 'Download CSV template'} icon={appIcons.Download} />
            </button>
            <button type="button" onClick={() => mutation.mutate()} disabled={!selectedFile || mutation.isPending} className="w-full rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60 sm:w-auto">
              <IconLabel label={mutation.isPending ? 'Uploading...' : 'Upload CSV'} icon={appIcons.Upload} />
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
  const [limit, setLimit] = useState(10);
  const { data, isLoading, isError } = useAdminGroupsQuery(page, limit);

  if (isLoading) return <LoadingScreen label="Loading classes..." />;
  if (isError || !data) return <div className="rounded-[28px] border border-rose-200 bg-rose-50 p-8 text-rose-700">Class data is unavailable right now.</div>;

  return (
    <div className="space-y-6">
      <SectionCard title="Classes" eyebrow="Academic structure" action={<Link to="/admin/groups/new" className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"><IconLabel label="Create class" /></Link>}>
        <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">Review the academic classes in your organization, then open a class to assign teachers, add students, and inspect roster performance.</p>

        {data.items.length === 0 ? (
          <div className="mt-6">
            <EmptyState title="No classes found" description="Create the first class to start organizing teachers and students." actionLabel="Create class" actionTo="/admin/groups/new" />
          </div>
        ) : (
          <>
          <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white/80 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-950/70">
            <div className="overflow-x-auto">
              <table className="min-w-[860px] w-full text-left text-sm">
                <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:bg-slate-900/80 dark:text-slate-400">
                  <tr>
                    <th className="px-5 py-4">S.No</th>
                    <th className="px-5 py-4">Class</th>
                    <th className="px-5 py-4">Branch</th>
                    <th className="px-5 py-4">Organization</th>
                    <th className="px-5 py-4">Created at</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {data.items.map((group, index) => (
                    <tr key={group.id} className="text-slate-700 transition hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-900/70">
                      <td className="px-5 py-4 text-xs font-semibold text-slate-400">{(page - 1) * data.size + index + 1}</td>
                      <td className="px-5 py-4">
                        <Link to={`/admin/groups/${group.id}`} className="font-semibold text-slate-900 transition hover:text-emerald-600 dark:text-slate-100 dark:hover:text-emerald-300">{group.name}</Link>
                      </td>
                      <td className="px-5 py-4">{group.branchName ?? '—'}</td>
                      <td className="px-5 py-4">{group.organizationName ?? '—'}</td>
                      <td className="px-5 py-4 text-slate-600 dark:text-slate-400">{formatDateTime(group.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <PaginationFooter
            page={page}
            total={data.total}
            size={data.size}
            pages={data.pages}
            limit={limit}
            onLimitChange={(nextLimit) => {
              setLimit(nextLimit);
              setPage(1);
            }}
            onPageChange={setPage}
          />
          </>
        )}
      </SectionCard>
    </div>
  );
}

export function AdminCreateGroupPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const branchesQuery = useAdminOrganizationBranchesQuery(user?.organizationId ?? '', 1, 100);
  const form = useForm<GroupForm>({
    resolver: zodResolver(groupSchema),
    defaultValues: { name: '', branchId: '' },
  });

  const mutation = useMutation({
    mutationFn: (values: GroupForm) => createGroup({ name: values.name, branchId: values.branchId }),
    onSuccess: async (group) => {
      toast.success('Class created.');
      await queryClient.invalidateQueries({ queryKey: ['admin', 'groups'] });
      navigate(`/admin/groups/${group.id}`);
    },
    onError: () => toast.error('Unable to create the class right now.'),
  });

  if (branchesQuery.isLoading) return <LoadingScreen label="Loading class form..." />;
  if (!user?.organizationId || branchesQuery.isError || !branchesQuery.data) return <div className="rounded-[28px] border border-rose-200 bg-rose-50 p-8 text-rose-700">Class form data is unavailable right now.</div>;

  return (
    <SectionCard title="Create class" eyebrow="Academic structure">
      <form className="grid gap-4 md:max-w-2xl" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
        <input {...form.register('name')} placeholder="Class name" className="rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-100" />
        {form.formState.errors.name ? <p className="-mt-2 text-sm text-rose-500">{form.formState.errors.name.message}</p> : null}
        <select {...form.register('branchId')} className="rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-100">
          <option value="">Select branch</option>
          {branchesQuery.data.items.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}
        </select>
        {form.formState.errors.branchId ? <p className="-mt-2 text-sm text-rose-500">{form.formState.errors.branchId.message}</p> : null}
        <button type="submit" disabled={mutation.isPending} className="w-full rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60 sm:w-auto">
          <IconLabel label={mutation.isPending ? 'Creating...' : 'Create class'} />
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
      toast.success('Students added to the class.');
      setSelectedStudentIds([]);
      await queryClient.invalidateQueries({ queryKey: ['admin', 'group-students', groupId] });
      await queryClient.invalidateQueries({ queryKey: ['admin', 'students'] });
    },
    onError: () => toast.error('Unable to add students to the class right now.'),
  });

  if (groupQuery.isLoading || studentsQuery.isLoading || teachersQuery.isLoading || unassignedStudentsQuery.isLoading || analyticsQuery.isLoading) {
    return <LoadingScreen label="Loading class detail..." />;
  }

  if (groupQuery.isError || studentsQuery.isError || teachersQuery.isError || unassignedStudentsQuery.isError || analyticsQuery.isError || !groupQuery.data || !studentsQuery.data || !teachersQuery.data || !unassignedStudentsQuery.data || !analyticsQuery.data) {
    return <div className="rounded-[28px] border border-rose-200 bg-rose-50 p-8 text-rose-700">Class detail is unavailable right now.</div>;
  }

  const currentStudentIds = new Set(studentsQuery.data.items.map((student) => student.id));
  const availableStudents = unassignedStudentsQuery.data.items.filter((student) => !currentStudentIds.has(student.id));

  return (
    <div className="space-y-6">
      <SectionCard title={groupQuery.data.name} eyebrow="Class detail">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Students" value={studentsQuery.data.items.length} helper="Students currently assigned to this class." accent="emerald" />
          <StatCard label="At-risk students" value={analyticsQuery.data.atRiskStudents.length} helper="Students currently below the configured threshold." accent="rose" />
          <StatCard label="Trend points" value={analyticsQuery.data.examTrend.length} helper="Performance snapshots captured for this class." accent="blue" />
          <StatCard label="Created" value={formatDateTime(groupQuery.data.createdAt)} helper="Class creation time." accent="slate" />
        </div>
      </SectionCard>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <SectionCard title="Students in class" eyebrow="Roster">
          {studentsQuery.data.items.length === 0 ? (
            <EmptyState title="No students assigned" description="Add students from the management panel to start tracking progress in this class." />
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
                <IconLabel label={assignTeacherMutation.isPending ? 'Assigning...' : 'Assign teacher'} />
              </button>
            </div>
          </SectionCard>

          <SectionCard title="Add students" eyebrow="Roster management">
            <div className="space-y-3">
              {availableStudents.length === 0 ? (
                <EmptyState title="No available students" description="All loaded students are already assigned to this class." />
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
                    <IconLabel label={addStudentsMutation.isPending ? 'Adding...' : 'Add selected students'} />
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
              <IconLabel label={mutation.isPending ? 'Creating...' : 'Create subject'} />
            </button>
          </form>
        </SectionCard>
      </div>
    </div>
  );
}
