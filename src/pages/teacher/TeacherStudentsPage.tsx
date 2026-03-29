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
import { PaginationControls } from '../../components/common/PaginationControls';
import { SectionCard } from '../../components/common/SectionCard';
import { useTeacherGroupsQuery, useTeacherStudentsQuery } from '../../hooks/useTeacherQueries';
import type { ValidationErrorResponse } from '../../types/api';
import { parseValidationErrors } from '../../utils/parseValidationErrors';
import { getStatusTone } from '../../utils/statusStyles';

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
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const queryClient = useQueryClient();
  const groupsQuery = useTeacherGroupsQuery(1, 100);
  const studentsQuery = useTeacherStudentsQuery(selectedGroupId || undefined, page, 12);
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

      <div className="grid gap-4 sm:gap-6 xl:grid-cols-[1.15fr_0.85fr] xl:items-start">
        <SectionCard title="Student list" eyebrow="Roster">
          {studentsQuery.data.items.length === 0 ? (
            <EmptyState title="No students found" description="Try a different class filter or create a new student using the form." />
          ) : (
            <div className="space-y-4">
              {studentsQuery.data.items.map((student) => (
                <div key={student.id} className="rounded-3xl border border-slate-200 bg-white p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h2 className="text-lg font-semibold text-slate-900"><Link to={`/teacher/students/${student.id}`}>{student.name}</Link></h2>
                      <p className="mt-1 break-words text-sm text-slate-600 [overflow-wrap:anywhere]">{student.email}</p>
                      <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Roll number: {student.rollNumber || 'Not set'}</p>
                    </div>
                    <div className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${getStatusTone(student.isActive ? 'active' : 'inactive')}`}>
                      {student.isActive ? 'Active' : 'Inactive'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="mt-6">
            <PaginationControls page={page} total={studentsQuery.data.total} limit={studentsQuery.data.limit} onPageChange={setPage} />
          </div>
        </SectionCard>

        <div className="xl:sticky xl:top-6 xl:self-start">
          <SectionCard title="Add student" eyebrow="Manual creation">
            <form className="space-y-4 xl:max-h-[calc(100vh-11rem)] xl:overflow-y-auto xl:pr-2" onSubmit={form.handleSubmit((values) => createMutation.mutate({ ...values, rollNumber: values.rollNumber, parentEmail: values.parentEmail, parentPhone: values.parentPhone, phone: values.phone || null }))}>
              <input {...form.register('name')} placeholder="Student name" className="w-full rounded-2xl border border-slate-200 px-4 py-3" />
              {form.formState.errors.name ? <p className="-mt-2 text-sm text-rose-500">{form.formState.errors.name.message}</p> : null}
              <input {...form.register('email')} placeholder="Student email" className="w-full rounded-2xl border border-slate-200 px-4 py-3" />
              {form.formState.errors.email ? <p className="-mt-2 text-sm text-rose-500">{form.formState.errors.email.message}</p> : null}
              <input type="password" {...form.register('password')} placeholder="Temporary password" className="w-full rounded-2xl border border-slate-200 px-4 py-3" />
              {form.formState.errors.password ? <p className="-mt-2 text-sm text-rose-500">{form.formState.errors.password.message}</p> : null}
              <select {...form.register('groupId')} className="w-full rounded-2xl border border-slate-200 px-4 py-3">
                <option value="">Select class</option>
                {availableGroups.map((group) => <option key={group.id} value={group.id}>{group.name}</option>)}
              </select>
              {form.formState.errors.groupId ? <p className="-mt-2 text-sm text-rose-500">{form.formState.errors.groupId.message}</p> : null}
              <input {...form.register('rollNumber')} placeholder="Roll number" className="w-full rounded-2xl border border-slate-200 px-4 py-3" />
              {form.formState.errors.rollNumber ? <p className="-mt-2 text-sm text-rose-500">{form.formState.errors.rollNumber.message}</p> : null}
              <input {...form.register('parentEmail')} placeholder="Parent email" className="w-full rounded-2xl border border-slate-200 px-4 py-3" />
              {form.formState.errors.parentEmail ? <p className="-mt-2 text-sm text-rose-500">{form.formState.errors.parentEmail.message}</p> : null}
              <input {...form.register('parentPhone')} placeholder="Parent phone" className="w-full rounded-2xl border border-slate-200 px-4 py-3" />
              {form.formState.errors.parentPhone ? <p className="-mt-2 text-sm text-rose-500">{form.formState.errors.parentPhone.message}</p> : null}
              <input {...form.register('phone')} placeholder="Phone (optional)" className="w-full rounded-2xl border border-slate-200 px-4 py-3" />
              <button type="submit" disabled={createMutation.isPending} className="w-full rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60">
                {createMutation.isPending ? 'Creating...' : 'Create student'}
              </button>
            </form>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
