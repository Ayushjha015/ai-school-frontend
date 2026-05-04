import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { deleteNotification, markAllNotificationsRead, markNotificationRead } from '../../api/notificationService';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingScreen } from '../../components/common/LoadingScreen';
import { PaginationFooter } from '../../components/common/PaginationFooter';
import { SectionCard } from '../../components/common/SectionCard';
import { BriefcaseBusiness, Building2, Hash, Mail, Phone, ShieldCheck, UserRound } from 'lucide-react';
import { ThemePreferencesCard } from '../../components/common/ThemePreferencesCard';
import { useNotificationsQuery } from '../../hooks/useNotificationQueries';
import { useAuthStore } from '../../store/authStore';
import type { NotificationResponse, PaginatedResponse, UnreadCountResponse } from '../../types/api';
import { formatDateTime, formatRoleLabel } from '../../utils/formatters';
import { resolveNotificationTarget } from '../../utils/resolveNotificationTarget';
import { getStatusAccent, type StatusAccent } from '../../utils/statusStyles';
import { IconLabel, appIcons } from '../../utils/appIcons';

const cardBg: Record<StatusAccent, string> = {
  emerald: 'from-white to-emerald-50 border-emerald-100 dark:from-emerald-500/18 dark:to-slate-900 dark:border-emerald-800/70',
  blue: 'from-white to-blue-50 border-blue-100 dark:from-blue-500/18 dark:to-slate-900 dark:border-blue-800/70',
  amber: 'from-white to-amber-50 border-amber-100 dark:from-amber-500/18 dark:to-slate-900 dark:border-amber-800/70',
  rose: 'from-white to-rose-50 border-rose-100 dark:from-rose-500/18 dark:to-slate-900 dark:border-rose-800/70',
  slate: 'from-white to-slate-50 border-slate-100 dark:from-slate-700/35 dark:to-slate-900 dark:border-slate-700',
};

const iconBg: Record<StatusAccent, string> = {
  emerald: 'bg-emerald-100 text-emerald-600 ring-1 ring-emerald-200 dark:bg-emerald-400/15 dark:text-emerald-200 dark:ring-emerald-400/20',
  blue: 'bg-blue-100 text-blue-600 ring-1 ring-blue-200 dark:bg-blue-400/15 dark:text-blue-200 dark:ring-blue-400/20',
  amber: 'bg-amber-100 text-amber-600 ring-1 ring-amber-200 dark:bg-amber-400/15 dark:text-amber-200 dark:ring-amber-400/20',
  rose: 'bg-rose-100 text-rose-600 ring-1 ring-rose-200 dark:bg-rose-400/15 dark:text-rose-200 dark:ring-rose-400/20',
  slate: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200 dark:bg-slate-400/10 dark:text-slate-200 dark:ring-slate-400/15',
};

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
      <SectionCard title="Notifications" eyebrow="Parent inbox" action={<button type="button" onClick={() => markAllMutation.mutate()} className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white"><IconLabel label="Mark all read" icon={appIcons.CheckCircle2} /></button>}>
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
                  <p className="mt-3 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-slate-500"><appIcons.CalendarClock className="h-4 w-4" aria-hidden />{formatDateTime(item.sentAt)}</p>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => openNotification(item.id, item.type, item.relatedId)} className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white"><IconLabel label="Open related" icon={appIcons.Eye} /></button>
                  <button type="button" onClick={() => deleteMutation.mutate(item.id)} className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"><IconLabel label="Delete" icon={appIcons.Trash2} /></button>
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

export function ParentProfilePage() {
  const user = useAuthStore((state) => state.user);
  const showBranchCard = Boolean(user?.branchName || user?.branchId);
  const statusAccent = getStatusAccent(user?.isActive ? 'active' : 'inactive');

  return (
    <div className="space-y-6">
      <SectionCard title="Parent profile" eyebrow="Account overview">
        <div className="grid gap-4 md:grid-cols-2">
          {/* Name */}
          <div className={`rounded-3xl border bg-gradient-to-br p-5 shadow-sm ${cardBg.emerald}`}>
            <div className="flex items-start justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Name</p>
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${iconBg.emerald}`}>
                <UserRound className="h-4 w-4" aria-hidden />
              </span>
            </div>
            <p className="mt-3 break-words text-xl font-semibold text-slate-900 dark:text-slate-100 [overflow-wrap:anywhere]">{user?.name ?? 'Not available'}</p>
            <p className="mt-1.5 text-sm leading-6 text-slate-600 dark:text-slate-400">Your display name for this account.</p>
          </div>

          {/* Role */}
          <div className={`rounded-3xl border bg-gradient-to-br p-5 shadow-sm ${cardBg.blue}`}>
            <div className="flex items-start justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Role</p>
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${iconBg.blue}`}>
                <BriefcaseBusiness className="h-4 w-4" aria-hidden />
              </span>
            </div>
            <p className="mt-3 break-words text-xl font-semibold text-slate-900 dark:text-slate-100 [overflow-wrap:anywhere]">{formatRoleLabel(user?.role ?? 'parent')}</p>
            <p className="mt-1.5 text-sm leading-6 text-slate-600 dark:text-slate-400">Your current access level in the portal.</p>
          </div>

          {/* Email */}
          <div className={`rounded-3xl border bg-gradient-to-br p-5 shadow-sm ${cardBg.amber}`}>
            <div className="flex items-start justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Email</p>
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${iconBg.amber}`}>
                <Mail className="h-4 w-4" aria-hidden />
              </span>
            </div>
            <p className="mt-3 break-words text-xl font-semibold text-slate-900 dark:text-slate-100 [overflow-wrap:anywhere]">{user?.email ?? 'Not available'}</p>
            <p className="mt-1.5 text-sm leading-6 text-slate-600 dark:text-slate-400">Your primary sign-in email.</p>
          </div>

          {/* Status */}
          <div className={`rounded-3xl border bg-gradient-to-br p-5 shadow-sm ${cardBg[statusAccent]}`}>
            <div className="flex items-start justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Status</p>
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${iconBg[statusAccent]}`}>
                <ShieldCheck className="h-4 w-4" aria-hidden />
              </span>
            </div>
            <p className="mt-3 break-words text-xl font-semibold text-slate-900 dark:text-slate-100 [overflow-wrap:anywhere]">{user?.isActive ? 'Active' : 'Inactive'}</p>
            <p className="mt-1.5 text-sm leading-6 text-slate-600 dark:text-slate-400">Shows whether this account is active.</p>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Profile details" eyebrow="Account information">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-950/70">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
                <Building2 className="h-3.5 w-3.5" aria-hidden />
              </span>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Organization</p>
            </div>
            <p className="mt-2.5 break-words text-sm font-medium text-slate-900 dark:text-slate-100 [overflow-wrap:anywhere]">{user?.organizationName ?? 'Not provided'}</p>
          </div>

          {showBranchCard ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-950/70">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400">
                  <Building2 className="h-3.5 w-3.5" aria-hidden />
                </span>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Branch</p>
              </div>
              <p className="mt-2.5 break-words text-sm font-medium text-slate-900 dark:text-slate-100 [overflow-wrap:anywhere]">{user?.branchName ?? 'Not provided'}</p>
            </div>
          ) : null}

          <div className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-950/70">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400">
                <Phone className="h-3.5 w-3.5" aria-hidden />
              </span>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Phone</p>
            </div>
            <p className="mt-2.5 break-words text-sm font-medium text-slate-900 dark:text-slate-100 [overflow-wrap:anywhere]">{user?.phone ?? 'Not provided'}</p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-950/70">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 dark:bg-slate-500/15 dark:text-slate-400">
                <Hash className="h-3.5 w-3.5" aria-hidden />
              </span>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">User ID</p>
            </div>
            <p className="mt-2.5 break-all text-sm font-medium text-slate-900 dark:text-slate-100">{user?.id ?? 'Not provided'}</p>
          </div>
        </div>
      </SectionCard>

      <ThemePreferencesCard />
    </div>
  );
}
