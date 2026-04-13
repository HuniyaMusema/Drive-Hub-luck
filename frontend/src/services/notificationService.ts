import { apiFetch } from './api';

export type NotificationType =
  | 'registration'
  | 'payment_pending'
  | 'payment_approved'
  | 'payment_rejected'
  | 'ticket_assigned'
  | 'lottery_result'
  | 'reminder'
  | 'system_update';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  is_read: boolean;
  created_at: string;
}

export const getNotifications = async (): Promise<Notification[]> => {
  return apiFetch('/notifications');
};

export const markAsRead = async (id: string): Promise<void> => {
  return apiFetch(`/notifications/${id}/read`, { method: 'PUT' });
};

export const markAllAsRead = async (): Promise<void> => {
  return apiFetch('/notifications/read-all', { method: 'PUT' });
};

export const deleteNotification = async (id: string): Promise<void> => {
  return apiFetch(`/notifications/${id}`, { method: 'DELETE' });
};
