import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { deleteNotification, markAllNotificationsRead, markNotificationRead } from '../../api/notificationService';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingScreen } from '../../components/common/LoadingScreen';
import { PaginationControls } from '../../components/common/PaginationControls';
import { SectionCard } from '../../components/common/SectionCard';
import { StatCard } from '../../components/common/StatCard';
import { ThemePreferencesCard } from '../../components/common/ThemePreferencesCard';
import { useNotificationsQuery } from '../../hooks/useNotificationQueries';
import { useAuthStore } from '../../store/authStore';
import type { NotificationResponse, PaginatedResponse, UnreadCountResponse } from '../../types/api';
import { formatDateTime, formatRoleLabel } from '../../utils/formatters';
import { resolveNotificationTarget } from '../../utils/resolveNotificationTarget';
import { getStatusAccent } from '../../utils/statusStyles';

export function ParentNotificationsPage() {
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
      toast.success('Notification deleted.');
      await queryClient.invalidateQueries({ queryKey: ['notifications'] });
      await queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    },
  });

  async function openNotification(notificationId: string, type?: string | null, relatedId?: string | null) {
    await markReadMutation.mutateAsync(notificationId);
    navigate(resolveNotificationTarget(type, relatedId));
  }

  if (isLoading) {
    return <LoadingScreen label="Loading notifications..." />;
  }

  if (isError || !data) {
    return <div className="rounded-[28px] border border-rose-200 bg-rose-50 p-8 text-rose-700">Notifications are unavailable right now.</div>;
  }

  return (
    <div className="space-y-6">
      <SectionCard title="Notifications" eyebrow="Parent inbox" action={<button type="button" onClick={() => markAllMutation.mutate()} className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white">Mark all read</button>}>
        <p className="max-w-2xl text-sm leading-7 text-slate-600">Exam updates and child progress alerts appear here.</p>
      </SectionCard>
      {data.items.length === 0 ? (
        <EmptyState title="No notifications yet" description="Updates about your linked children will appear here." />
      ) : (
        <div className="space-y-4">
          {data.items.map((item) => (
            <div key={item.id} className={`rounded-3xl border p-5 ${item.isRead ? 'border-slate-200 bg-white' : 'border-emerald-200 bg-emerald-50/60'}`}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-lg font-semibold text-slate-900">{item.title || item.type || 'Notification'}</p>
                  <p className="mt-2 text-sm text-slate-600">{item.message || 'Open this update to view the latest details.'}</p>
                  <p className="mt-3 text-xs font-medium uppercase tracking-[0.18em] text-slate-500">{formatDateTime(item.sentAt)}</p>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => openNotification(item.id, item.type, item.relatedId)} className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white">Open related</button>
                  <button type="button" onClick={() => deleteMutation.mutate(item.id)} className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">Delete</button>
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

export function ParentProfilePage() {
  const user = useAuthStore((state) => state.user);
  const showBranchCard = Boolean(user?.branchName || user?.branchId);

  return (
    <div className="space-y-6">
      <SectionCard title="Parent profile" eyebrow="Account overview">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Name" value={user?.name ?? 'Not available'} helper="Your display name for this account." accent="emerald" />
          <StatCard label="Role" value={formatRoleLabel(user?.role ?? 'parent')} helper="Your current access level in the portal." accent="blue" />
          <StatCard label="Email" value={user?.email ?? 'Not available'} helper="Your primary sign-in email." accent="amber" />
          <StatCard label="Status" value={user?.isActive ? 'Active' : 'Inactive'} helper="Shows whether this account is active." accent={getStatusAccent(user?.isActive ? 'active' : 'inactive')} />
        </div>
      </SectionCard>

      <SectionCard title="Profile details" eyebrow="Account information">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Organization</p>
            <p className="mt-3 break-words text-sm text-slate-700 [overflow-wrap:anywhere]">{user?.organizationName ?? 'Not provided'}</p>
          </div>
          {showBranchCard ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Branch</p>
              <p className="mt-3 break-words text-sm text-slate-700 [overflow-wrap:anywhere]">{user?.branchName ?? 'Not provided'}</p>
            </div>
          ) : null}
          <div className="rounded-3xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Phone</p>
            <p className="mt-3 break-words text-sm text-slate-700 [overflow-wrap:anywhere]">{user?.phone ?? 'Not provided'}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">User ID</p>
            <p className="mt-3 break-all text-sm text-slate-700">{user?.id ?? 'Not provided'}</p>
          </div>
        </div>
      </SectionCard>

      <ThemePreferencesCard />
    </div>
  );
}
