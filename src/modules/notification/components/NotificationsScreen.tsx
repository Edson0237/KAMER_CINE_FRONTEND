import { useState } from 'react';
import { Bell, BellOff, Check, CheckCheck, Loader2 } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';
import { useRealtime } from '@/shared/realtime/RealtimeProvider';
import { PageHeader, LoadingBlock, ErrorBlock, EmptyBlock } from '@/components/ui/page-blocks';
import { Button } from '@/components/ui/button';

const CANAL_LABEL: Record<string, string> = { in_app: 'Application', sms: 'SMS', email: 'Email', push: 'Push', tous: 'Tous canaux' };

/** Centre de notifications : historique complet de l'utilisateur, filtre non lues, marquage comme lu. */
export function NotificationsScreen() {
  const { notifications, unreadCount, loading, error, markAsRead } = useNotifications();
  const { status } = useRealtime();
  const [onlyUnread, setOnlyUnread] = useState(false);
  const [busy, setBusy] = useState(false);

  const shown = notifications.filter((n) => !onlyUnread || n.statut !== 'lue');

  const markAll = async () => {
    setBusy(true);
    try {
      for (const n of notifications.filter((x) => x.statut !== 'lue')) await markAsRead(n.id);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        icon={Bell}
        title="Notifications"
        subtitle={status === 'connected' ? 'Temps réel actif' : 'Temps réel indisponible — actualisation toutes les 30 s'}
        actions={unreadCount > 0 ? (
          <Button variant="outline" onClick={markAll} disabled={busy}>
            {busy ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <CheckCheck className="mr-1.5 h-4 w-4" />}Tout marquer comme lu
          </Button>
        ) : undefined}
      />

      <div className="inline-flex rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-1">
        {([[false, 'Toutes'], [true, `Non lues${unreadCount ? ` (${unreadCount})` : ''}`]] as const).map(([flag, label]) => (
          <button key={label} onClick={() => setOnlyUnread(flag)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${onlyUnread === flag ? 'bg-kct-gold text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>{label}</button>
        ))}
      </div>

      {loading && notifications.length === 0 ? <LoadingBlock />
        : error ? <ErrorBlock message={error} />
        : shown.length === 0 ? <EmptyBlock title={onlyUnread ? 'Tout est lu' : 'Aucune notification'} hint="Les notifications que vous recevez apparaissent ici." icon={BellOff} />
        : (
          <ul className="divide-y divide-gray-100 dark:divide-gray-800 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
            {shown.map((n) => {
              const unread = n.statut !== 'lue';
              return (
                <li key={n.id} className={`flex items-start gap-3 px-4 py-3 ${unread ? 'bg-kct-gold/5' : ''}`}>
                  <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${unread ? 'bg-kct-gold' : 'bg-transparent'}`} />
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm ${unread ? 'font-medium text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'}`}>{n.contenuFinal}</p>
                    <p className="mt-1 text-[11px] text-gray-400">
                      {n.dateEnvoi ? new Date(n.dateEnvoi).toLocaleString('fr-FR') : '—'} · {CANAL_LABEL[n.canal] ?? n.canal}
                    </p>
                  </div>
                  {unread ? (
                    <button onClick={() => markAsRead(n.id)} className="shrink-0 text-xs text-kct-gold hover:underline">Marquer comme lu</button>
                  ) : <Check className="mt-0.5 h-4 w-4 shrink-0 text-kct-green" />}
                </li>
              );
            })}
          </ul>
        )}
    </div>
  );
}
