import { useState, useRef, useEffect } from 'react';
import { Bell, Check, Loader2, BellOff } from 'lucide-react';
import { useNotifications } from '@/modules/notification/hooks/useNotifications';
import { cn } from '@/lib/utils';

/**
 * Icône cloche avec compteur de notifications non lues et panneau
 * déroulant listant les notifications récentes.
 *
 * <p>Clique sur une notification non lue → la marque comme lue.
 * Le panneau se ferme au clic en dehors.</p>
 */
export function NotificationBell() {
  const { notifications, unreadCount, loading, markAsRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatDate = (iso: string | null) => {
    if (!iso) return '';
    const date = new Date(iso);
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        title="Notifications"
      >
        <Bell className="h-5 w-5 text-gray-500 dark:text-gray-400" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 flex items-center justify-center bg-kct-red text-white text-[10px] font-bold rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-lg z-50">
          <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-2.5 flex items-center justify-between">
            <span className="text-sm font-semibold text-kct-noir dark:text-gray-100">Notifications</span>
            {unreadCount > 0 && (
              <span className="text-xs text-kct-gold font-medium">{unreadCount} non lue{unreadCount > 1 ? 's' : ''}</span>
            )}
          </div>

          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-kct-gold" />
            </div>
          )}

          {!loading && notifications.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10 text-gray-400 dark:text-gray-500">
              <BellOff className="h-8 w-8 mb-2" />
              <p className="text-sm">Aucune notification</p>
            </div>
          )}

          {!loading && notifications.length > 0 && (
            <ul className="divide-y divide-gray-100 dark:divide-gray-800">
              {notifications.map((n) => {
                const unread = n.statut !== 'lue';
                return (
                  <li key={n.id}>
                    <button
                      onClick={() => unread && markAsRead(n.id)}
                      className={cn(
                        'w-full text-left px-4 py-3 flex items-start gap-2 transition-colors',
                        unread
                          ? 'bg-kct-gold/5 hover:bg-kct-gold/10 dark:bg-kct-gold/10 dark:hover:bg-kct-gold/15'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-800',
                      )}
                    >
                      <div className={cn(
                        'mt-1 h-2 w-2 rounded-full shrink-0',
                        unread ? 'bg-kct-gold' : 'bg-transparent',
                      )} />
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          'text-sm leading-snug',
                          unread ? 'text-kct-noir dark:text-gray-100 font-medium' : 'text-gray-500 dark:text-gray-400',
                        )}>
                          {n.contenuFinal}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          {formatDate(n.dateEnvoi)} · {n.canal}
                        </p>
                      </div>
                      {!unread && <Check className="h-4 w-4 text-green-500 shrink-0 mt-1" />}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
