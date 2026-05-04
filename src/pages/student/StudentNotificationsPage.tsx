import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { deleteNotification, markAllNotificationsRead, markNotificationRead } from '../../api/notificationService';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingScreen } from '../../components/common/LoadingScreen';
import { PaginationFooter } from '../../components/common/PaginationFooter';
import { SectionCard } from '../../components/common/SectionCard';
import { useNotificationsQuery } from '../../hooks/useNotificationQueries';
import type { NotificationResponse, PaginatedResponse, UnreadCountResponse } from '../../types/api';
import { formatDateTime } from '../../utils/formatters';
import { resolveNotificationTarget } from '../../utils/resolveNotificationTarget';
import { IconLabel, appIcons } from '../../utils/appIcons';

export function StudentNotificationsPage() {
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
      <SectionCard
        title="Notifications"
        eyebrow="Unread first"
        action={
          <button
            type="button"
            onClick={() => markAllMutation.mutate()}
            disabled={markAllMutation.isPending}
            className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <IconLabel label="Mark all read" icon={appIcons.CheckCircle2} />
          </button>
        }
      >
        <p className="max-w-2xl text-sm leading-7 text-slate-600">Stay on top of newly published exams, result updates, and other student-facing alerts. Opening a notification marks it as read first.</p>
      </SectionCard>

      {data.items.length === 0 ? (
        <EmptyState title="No notifications yet" description="You'll see exam updates and result alerts here once they arrive." />
      ) : (
        <div className="space-y-4">
          {data.items.map((item) => (
            <div key={item.id} className={`rounded-3xl border p-5 shadow-sm transition ${item.isRead ? 'border-slate-200 bg-white' : 'border-emerald-200 bg-emerald-50/60'}`}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="max-w-3xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white">{item.type || 'Notification'}</span>
                    {!item.isRead ? <span className="rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white">Unread</span> : null}
                  </div>
                  <h2 className="mt-4 text-lg font-semibold text-slate-900">{item.title || 'Student update'}</h2>
                  <p className="mt-2 text-sm leading-7 text-slate-600">{item.message || 'Open this update to view the latest details.'}</p>
                  <p className="mt-3 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-slate-500"><appIcons.CalendarClock className="h-4 w-4" aria-hidden />{formatDateTime(item.sentAt)}</p>
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => openNotification(item.id, item.type, item.relatedId)}
                    className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    <IconLabel label="Open related" icon={appIcons.Eye} />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteMutation.mutate(item.id)}
                    className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
                  >
                    <IconLabel label="Delete" icon={appIcons.Trash2} />
                  </button>
                  {!item.isRead ? (
                    <button
                      type="button"
                      onClick={() => markReadMutation.mutate(item.id)}
                      className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
                    >
                      <IconLabel label="Mark read" icon={appIcons.CheckCircle2} />
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <PaginationFooter page={page} total={data.total} size={data.size} pages={data.pages} limit={data.size} onPageChange={setPage} />
    </div>
  );
}

