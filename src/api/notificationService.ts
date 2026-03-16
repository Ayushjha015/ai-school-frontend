import type { NotificationResponse, PaginatedResponse, UnreadCountResponse } from '../types/api';
import { api } from './baseClient';
import { unwrapApiResponse } from './helpers';

export async function getNotifications(page = 1, limit = 12) {
  const response = await api.get<PaginatedResponse<NotificationResponse>>('/notifications', {
    params: { page, limit },
  });
  return unwrapApiResponse(response);
}

export async function getUnreadCount() {
  const response = await api.get<UnreadCountResponse>('/notifications/unread-count');
  return unwrapApiResponse(response);
}

export async function markNotificationRead(notificationId: string) {
  const response = await api.patch<NotificationResponse>(`/notifications/${notificationId}/read`);
  return unwrapApiResponse(response);
}

export async function markAllNotificationsRead() {
  await api.patch('/notifications/read-all');
}

export async function deleteNotification(notificationId: string) {
  await api.delete(`/notifications/${notificationId}`);
}
