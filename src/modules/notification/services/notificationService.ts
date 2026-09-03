import apiClient from '@/shared/api/apiClient';
import type { NotificationItem } from '../types';

/**
 * Service du module Notification (M6) — appels API pour les notifications
 * in_app/SMS de l'utilisateur connecté.
 */
export const notificationService = {
  /** Récupère les notifications de l'utilisateur connecté. */
  async listMine(): Promise<NotificationItem[]> {
    const { data } = await apiClient.get<NotificationItem[]>('/notifications');
    return data;
  },

  /** Compte les notifications non lues de l'utilisateur connecté. */
  async countUnread(): Promise<number> {
    const { data } = await apiClient.get<{ nonLues: number }>('/notifications/unread-count');
    return data.nonLues;
  },

  /** Marque une notification comme lue. */
  async markAsRead(id: string): Promise<void> {
    await apiClient.post(`/notifications/${id}/lue`);
  },
};
