import { useQuery } from '@tanstack/react-query';
import { getNotifications, getUnreadCount } from '../api/notificationService';

export function useNotificationsQuery(page: number, limit: number) {
  return useQuery({
    queryKey: ['notifications', page, limit],
    queryFn: () => getNotifications(page, limit),
  });
}

export function useUnreadCountQuery(enabled = true) {
  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: getUnreadCount,
    enabled,
    refetchInterval: 20_000,
  });
}
