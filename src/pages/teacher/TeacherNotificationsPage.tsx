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

export function TeacherNotificationsPage() {
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
      <SectionCard title="Notifications" eyebrow="Teacher inbox" action={<button type="button" onClick={() => markAllMutation.mutate()} className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white"><IconLabel label="Mark all read" icon={appIcons.CheckCircle2} /></button>}>
        <p className="max-w-2xl text-sm leading-7 text-slate-600">Exam updates, publishing events, and workflow alerts appear here.</p>
      </SectionCard>
      {data.items.length === 0 ? (
        <EmptyState title="No notifications yet" description="Teacher alerts will appear here as new activity comes in." />
      ) : (
        <div className="space-y-4">
          {data.items.map((item) => (
            <div key={item.id} className={`rounded-3xl border p-5 ${item.isRead ? 'border-slate-200 bg-white' : 'border-emerald-200 bg-emerald-50/60'}`}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-lg font-semibold text-slate-900">{item.title || item.type || 'Notification'}</p>
                  <p className="mt-2 text-sm text-slate-600">{item.message || 'Open this update to view the latest details.'}</p>
                  <p className="mt-3 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-slate-500"><appIcons.CalendarClock className="h-4 w-4" aria-hidden />{formatDateTime(item.sentAt)}</p>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => openNotification(item.id, item.type, item.relatedId)} className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white"><IconLabel label="Open related" icon={appIcons.Eye} /></button>
                  <button type="button" onClick={() => deleteMutation.mutate(item.id)} className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 dark:border-slate-600 dark:text-slate-200"><IconLabel label="Delete" icon={appIcons.Trash2} /></button>
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
