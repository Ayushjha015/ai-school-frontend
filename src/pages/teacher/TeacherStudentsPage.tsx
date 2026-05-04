import { useState } from 'react';
import { Link } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import type { AxiosError } from 'axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { z } from 'zod';
import { createTeacherStudent } from '../../api/teacherService';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingScreen } from '../../components/common/LoadingScreen';
import { PaginationFooter } from '../../components/common/PaginationFooter';
import { SectionCard } from '../../components/common/SectionCard';
import { useTeacherGroupsQuery, useTeacherStudentsQuery } from '../../hooks/useTeacherQueries';
import type { ValidationErrorResponse } from '../../types/api';
import { parseValidationErrors } from '../../utils/parseValidationErrors';
import { getStatusTone } from '../../utils/statusStyles';
import { IconLabel } from '../../utils/appIcons';

const createStudentSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  groupId: z.string().min(1),
  rollNumber: z.string().trim().min(1, 'Roll number is required'),
  parentEmail: z.string().trim().min(1, 'Parent email is required').email('Enter a valid parent email'),
  parentPhone: z.string().trim().min(1, 'Parent phone is required'),
  phone: z.string().optional(),
});

type CreateStudentForm = z.infer<typeof createStudentSchema>;

function applyFormValidationErrors(
  error: unknown,
  setError: ReturnType<typeof useForm<CreateStudentForm>>['setError'],
) {
  const axiosError = error as AxiosError<ValidationErrorResponse>;
  if (axiosError.response?.status !== 422) {
    return false;
  }

  const fieldErrors = parseValidationErrors(axiosError.response.data);
  Object.entries(fieldErrors).forEach(([field, message]) => {
    setError(field as keyof CreateStudentForm, { type: 'server', message });
  });
  return true;
}

export function TeacherStudentsPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const queryClient = useQueryClient();
  const groupsQuery = useTeacherGroupsQuery(1, 100);
  const studentsQuery = useTeacherStudentsQuery(selectedGroupId || undefined, page, limit);
  const form = useForm<CreateStudentForm>({
    resolver: zodResolver(createStudentSchema),
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

  const createMutation = useMutation({
    mutationFn: createTeacherStudent,
    onSuccess: async () => {
      toast.success('Student created successfully.');
      form.reset();
      setIsCreateOpen(false);
      await queryClient.invalidateQueries({ queryKey: ['teacher', 'students'] });
    },
    onError: (error) => {
      if (applyFormValidationErrors(error, form.setError)) {
        toast.error('Please fix the highlighted student fields.');
        return;
      }
      toast.error('Unable to create student right now.');
    },
  });

  if (groupsQuery.isLoading || studentsQuery.isLoading) {
    return <LoadingScreen label="Loading students..." />;
  }

  if (groupsQuery.isError || studentsQuery.isError || !groupsQuery.data || !studentsQuery.data) {
    return <div className="rounded-[28px] border border-rose-200 bg-rose-50 p-6 text-rose-700 sm:p-8">We could not load the student workspace.</div>;
  }

  const availableGroups = groupsQuery.data.items;

  return (
    <div className="space-y-4 sm:space-y-6">
      <SectionCard title="Students" eyebrow="Teacher-managed students">
        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Filter by class</label>
            <select
              value={selectedGroupId}
              onChange={(event) => {
                setSelectedGroupId(event.target.value);
                setPage(1);
              }}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900"
            >
              <option value="">All classes</option>
              {availableGroups.map((group) => (
                <option key={group.id} value={group.id}>{group.name}</option>
              ))}
            </select>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5 text-sm leading-6 text-slate-600">
            Create students directly from the teacher module. Parent email and parent phone are now required so linked family access can be created reliably.
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="Student list"
        eyebrow="Roster"
        action={
          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-slate-50 dark:text-slate-950 dark:hover:bg-white"
          >
            <IconLabel label="Create student" />
          </button>
        }
      >
          {studentsQuery.data.items.length === 0 ? (
            <EmptyState title="No students found" description="Try a different class filter or create a new student using the form." />
          ) : (
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white/80 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-950/70">
              <div className="overflow-x-auto">
                <table className="min-w-[760px] w-full text-left text-sm">
                  <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:bg-slate-900/80 dark:text-slate-400">
                    <tr>
                      <th className="px-5 py-4">S.No</th>
                      <th className="px-5 py-4">Student</th>
                      <th className="px-5 py-4">Email</th>
                      <th className="px-5 py-4">Roll no</th>
                      <th className="px-5 py-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {studentsQuery.data.items.map((student, index) => (
                      <tr key={student.id} className="text-slate-700 transition hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-900/70">
                        <td className="px-5 py-4 text-xs font-semibold text-slate-400">{(page - 1) * studentsQuery.data.size + index + 1}</td>
                        <td className="px-5 py-4">
                          <Link to={`/teacher/students/${student.id}`} className="font-semibold text-slate-900 transition hover:text-emerald-600 dark:text-slate-100 dark:hover:text-emerald-300">{student.name}</Link>
                          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{student.groupName ?? 'Class not assigned'}</p>
                        </td>
                        <td className="px-5 py-4 break-words text-slate-600 dark:text-slate-400 [overflow-wrap:anywhere]">{student.email}</td>
                        <td className="px-5 py-4">{student.rollNumber || 'Not set'}</td>
                        <td className="px-5 py-4">
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${getStatusTone(student.isActive ? 'active' : 'inactive')}`}>{student.isActive ? 'Active' : 'Inactive'}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
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
      </SectionCard>

      {isCreateOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-[32px] border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-950">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Manual creation</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">Add student</h2>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 dark:border-slate-700 dark:text-slate-200"
              >
                Close
              </button>
            </div>
            <form className="mt-6 grid max-h-[70vh] gap-4 overflow-y-auto pr-1 sm:grid-cols-2" onSubmit={form.handleSubmit((values) => createMutation.mutate({ ...values, rollNumber: values.rollNumber, parentEmail: values.parentEmail, parentPhone: values.parentPhone, phone: values.phone || null }))}>
              <label className="space-y-2">
                <input {...form.register('name')} placeholder="Student name" className="w-full rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" />
                {form.formState.errors.name ? <p className="text-sm text-rose-500">{form.formState.errors.name.message}</p> : null}
              </label>
              <label className="space-y-2">
                <input {...form.register('email')} placeholder="Student email" className="w-full rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" />
                {form.formState.errors.email ? <p className="text-sm text-rose-500">{form.formState.errors.email.message}</p> : null}
              </label>
              <label className="space-y-2">
                <input type="password" {...form.register('password')} placeholder="Temporary password" className="w-full rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" />
                {form.formState.errors.password ? <p className="text-sm text-rose-500">{form.formState.errors.password.message}</p> : null}
              </label>
              <label className="space-y-2">
                <select {...form.register('groupId')} className="w-full rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
                  <option value="">Select class</option>
                  {availableGroups.map((group) => <option key={group.id} value={group.id}>{group.name}</option>)}
                </select>
                {form.formState.errors.groupId ? <p className="text-sm text-rose-500">{form.formState.errors.groupId.message}</p> : null}
              </label>
              <label className="space-y-2">
                <input {...form.register('rollNumber')} placeholder="Roll number" className="w-full rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" />
                {form.formState.errors.rollNumber ? <p className="text-sm text-rose-500">{form.formState.errors.rollNumber.message}</p> : null}
              </label>
              <label className="space-y-2">
                <input {...form.register('parentEmail')} placeholder="Parent email" className="w-full rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" />
                {form.formState.errors.parentEmail ? <p className="text-sm text-rose-500">{form.formState.errors.parentEmail.message}</p> : null}
              </label>
              <label className="space-y-2">
                <input {...form.register('parentPhone')} placeholder="Parent phone" className="w-full rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" />
                {form.formState.errors.parentPhone ? <p className="text-sm text-rose-500">{form.formState.errors.parentPhone.message}</p> : null}
              </label>
              <input {...form.register('phone')} placeholder="Phone (optional)" className="w-full rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" />
              <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:justify-end">
                <button type="button" onClick={() => setIsCreateOpen(false)} className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 dark:border-slate-700 dark:text-slate-200">Cancel</button>
                <button type="submit" disabled={createMutation.isPending} className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60 dark:bg-slate-50 dark:text-slate-950">
                  <IconLabel label={createMutation.isPending ? 'Creating...' : 'Create student'} />
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
