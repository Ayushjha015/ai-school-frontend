import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { z } from 'zod';
import { deleteNotification, markAllNotificationsRead, markNotificationRead } from '../../api/notificationService';
import { updateOrganizationSettings } from '../../api/adminService';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingScreen } from '../../components/common/LoadingScreen';
import { PaginationControls } from '../../components/common/PaginationControls';
import { SectionCard } from '../../components/common/SectionCard';
import { StatCard } from '../../components/common/StatCard';
import { ThemePreferencesCard } from '../../components/common/ThemePreferencesCard';
import { useNotificationsQuery } from '../../hooks/useNotificationQueries';
import { useAdminOrgOverviewQuery } from '../../hooks/useAdminQueries';
import { useAuthStore } from '../../store/authStore';
import type { NotificationResponse, PaginatedResponse, UnreadCountResponse } from '../../types/api';
import { formatDateTime, formatRoleLabel } from '../../utils/formatters';
import { getStatusAccent } from '../../utils/statusStyles';

const settingsSchema = z.object({
  atRiskThreshold: z.number().min(0).max(100),
});

function resolveAdminNotificationTarget(title?: string | null, type?: string | null, relatedId?: string | null) {
  const normalizedType = (type ?? '').toLowerCase();
  const normalizedTitle = (title ?? '').toLowerCase();

  if (normalizedType === 'exam_published' || normalizedType === 'exam_ending_soon') {
    return relatedId ? `/admin/exams/${relatedId}` : '/admin/exams';
  }
  if (normalizedType === 'result_ready' || normalizedType === 'exam_auto_submitted') {
    return '/admin/exams';
  }
  if (normalizedType === 'user_added') {
    if (normalizedTitle.includes('teacher')) {
      return relatedId ? `/admin/teachers/${relatedId}` : '/admin/teachers';
    }
    if (normalizedTitle.includes('student')) {
      return relatedId ? `/admin/students/${relatedId}` : '/admin/students';
    }
  }
  if (normalizedType.includes('group')) {
    return relatedId ? `/admin/groups/${relatedId}` : '/admin/groups';
  }
  if (normalizedType.includes('student')) {
    return relatedId ? `/admin/students/${relatedId}` : '/admin/students';
  }
  return '/admin/notifications';
}

export function AdminNotificationsPage() {
  const [page, setPage] = useState(1);
  const limit = 10;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useNotificationsQuery(page, limit);

  const markReadMutation = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['notifications'] });
      await queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    },
  });

  const markAllMutation = useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['notifications'] });
      await queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
      toast.success('All notifications marked as read.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteNotification,
    onMutate: async (notificationId) => {
      await queryClient.cancelQueries({ queryKey: ['notifications', page, limit] });
      await queryClient.cancelQueries({ queryKey: ['notifications', 'unread-count'] });

      const previousPage = queryClient.getQueryData<PaginatedResponse<NotificationResponse>>(['notifications', page, limit]);
      const previousUnread = queryClient.getQueryData<UnreadCountResponse>(['notifications', 'unread-count']);
      const target = previousPage?.items.find((item) => item.id === notificationId);

      if (previousPage) {
        queryClient.setQueryData<PaginatedResponse<NotificationResponse>>(['notifications', page, limit], {
          ...previousPage,
          total: Math.max(previousPage.total - 1, 0),
          items: previousPage.items.filter((item) => item.id !== notificationId),
        });
      }

      if (target && !target.isRead && previousUnread) {
        queryClient.setQueryData<UnreadCountResponse>(['notifications', 'unread-count'], {
          count: Math.max(previousUnread.count - 1, 0),
        });
      }

      return { previousPage, previousUnread };
    },
    onError: (_error, _notificationId, context) => {
      if (context?.previousPage) {
        queryClient.setQueryData(['notifications', page, limit], context.previousPage);
      }
      if (context?.previousUnread) {
        queryClient.setQueryData(['notifications', 'unread-count'], context.previousUnread);
      }
      toast.error('Unable to delete the notification right now.');
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['notifications'] });
      await queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
      toast.success('Notification deleted.');
    },
  });

  async function openNotification(notificationId: string, title?: string | null, type?: string | null, relatedId?: string | null) {
    await markReadMutation.mutateAsync(notificationId);
    navigate(resolveAdminNotificationTarget(title, type, relatedId));
  }

  if (isLoading) return <LoadingScreen label="Loading notifications..." />;
  if (isError || !data) return <div className="rounded-[28px] border border-rose-200 bg-rose-50 p-8 text-rose-700">Notifications are unavailable right now.</div>;

  return (
    <div className="space-y-6">
      <SectionCard title="Notifications" eyebrow="Org admin inbox" action={<button type="button" onClick={() => markAllMutation.mutate()} className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white">Mark all read</button>}>
        <p className="max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300">Review system alerts, exam activity, and management events for your organization here.</p>
      </SectionCard>
      {data.items.length === 0 ? (
        <EmptyState title="No notifications yet" description="Organization alerts will appear here as new activity arrives." />
      ) : (
        <div className="space-y-4">
          {data.items.map((item) => (
            <div key={item.id} className={`rounded-3xl border p-5 ${item.isRead ? 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-950/70' : 'border-emerald-200 bg-emerald-50/60 dark:border-emerald-700/60 dark:bg-emerald-500/10'}`}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">{item.title || item.type || 'Notification'}</p>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{item.message || 'Open this update to view the latest details.'}</p>
                  <p className="mt-3 text-xs font-medium uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{formatDateTime(item.sentAt)}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => openNotification(item.id, item.title, item.type, item.relatedId)} className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white">Open related</button>
                  <button type="button" onClick={() => deleteMutation.mutate(item.id)} className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 dark:border-slate-600 dark:text-slate-200">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <PaginationControls page={page} total={data.total} limit={data.limit} onPageChange={setPage} />
    </div>
  );
}

export function AdminSettingsPage() {
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  const overviewQuery = useAdminOrgOverviewQuery();
  const form = useForm<z.infer<typeof settingsSchema>>({
    resolver: zodResolver(settingsSchema),
    values: { atRiskThreshold: overviewQuery.data?.atRiskThreshold ?? 0 },
  });

  const mutation = useMutation({
    mutationFn: (values: z.infer<typeof settingsSchema>) => updateOrganizationSettings(user?.organizationId ?? '', values),
    onSuccess: async () => {
      toast.success('Organization settings updated.');
      await queryClient.invalidateQueries({ queryKey: ['admin', 'org-overview'] });
    },
    onError: () => toast.error('Unable to update the organization settings right now.'),
  });

  if (overviewQuery.isLoading) return <LoadingScreen label="Loading settings..." />;
  if (overviewQuery.isError || !overviewQuery.data) return <div className="rounded-[28px] border border-rose-200 bg-rose-50 p-8 text-rose-700">Settings are unavailable right now.</div>;

  return (
    <div className="space-y-6">
      <SectionCard title="Admin settings" eyebrow="Account overview">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Name" value={user?.name ?? 'Not available'} helper="Your display name for the organization workspace." accent="emerald" />
          <StatCard label="Role" value={formatRoleLabel(user?.role ?? 'org_admin')} helper="Your current access level in Parishkan AI." accent="blue" />
          <StatCard label="Email" value={user?.email ?? 'Not available'} helper="Your primary sign-in email." accent="amber" />
          <StatCard label="Status" value={user?.isActive ? 'Active' : 'Inactive'} helper="Shows whether this account is active." accent={getStatusAccent(user?.isActive ? 'active' : 'inactive')} />
        </div>
      </SectionCard>

      <SectionCard title="Organization settings" eyebrow="Risk controls">
        <form className="grid gap-4 md:max-w-xl" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">At-risk threshold</label>
            <input type="number" {...form.register('atRiskThreshold', { valueAsNumber: true })} className="w-full rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-100" />
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Students below this percentage are flagged across analytics and dashboards.</p>
          </div>
          <button type="submit" disabled={mutation.isPending || !user?.organizationId} className="w-full rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60 sm:w-auto">
            {mutation.isPending ? 'Saving...' : 'Save threshold'}
          </button>
        </form>
      </SectionCard>

      <SectionCard title="Profile details" eyebrow="Account information">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-950/70">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Organization</p>
            <p className="mt-3 break-words text-sm text-slate-700 dark:text-slate-300 [overflow-wrap:anywhere]">{user?.organizationName ?? 'Not provided'}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-950/70">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Branch</p>
            <p className="mt-3 break-words text-sm text-slate-700 dark:text-slate-300 [overflow-wrap:anywhere]">{user?.branchName ?? 'Not assigned'}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-950/70">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Phone</p>
            <p className="mt-3 break-words text-sm text-slate-700 dark:text-slate-300 [overflow-wrap:anywhere]">{user?.phone ?? 'Not provided'}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-950/70">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">User ID</p>
            <p className="mt-3 break-all text-sm text-slate-700 dark:text-slate-300">{user?.id ?? 'Not available'}</p>
          </div>
        </div>
      </SectionCard>

      <ThemePreferencesCard />
    </div>
  );
}
