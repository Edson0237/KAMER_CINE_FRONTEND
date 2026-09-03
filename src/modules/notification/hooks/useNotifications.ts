import { useState, useEffect, useCallback, useRef } from 'react';
import { notificationService } from '../services/notificationService';
import type { NotificationItem } from '../types';

const POLL_INTERVAL_MS = 30000;

/**
 * Hook de gestion des notifications de l'utilisateur connecté.
 *
 * <p>Charge la liste et le compteur non lu, et rafraîchit périodiquement
 * (polling léger — pas de WebSocket en V1) pour refléter les nouvelles
 * notifications (ex. candidature acceptée, session clôturée).</p>
 */
export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [list, count] = await Promise.all([
        notificationService.listMine(),
        notificationService.countUnread(),
      ]);
      setNotifications(list);
      setUnreadCount(count);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement des notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    intervalRef.current = setInterval(load, POLL_INTERVAL_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [load]);

  const markAsRead = useCallback(async (id: string) => {
    await notificationService.markAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, statut: 'lue', dateLecture: new Date().toISOString() } : n)),
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  return { notifications, unreadCount, loading, error, reload: load, markAsRead };
}
