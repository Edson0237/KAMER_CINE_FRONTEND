import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { Client } from '@stomp/stompjs';
import { AlertTriangle, X } from 'lucide-react';
import { useAuthContext } from '@/shared/auth/AuthContext';

/** Événement DOM émis à chaque alerte — les écrans à données vivantes (notifications, dashboards) s'y abonnent pour se rafraîchir. */
export const REALTIME_EVENT = 'kct:realtime-alert';

export type RealtimeStatus = 'connecting' | 'connected' | 'offline';

/** Payload de /user/queue/alertes (AlerteTempsReelDto côté API). */
interface Alerte {
  titre: string;
  message: string;
  horodatage: string;
}

interface Toast extends Alerte {
  id: number;
}

const RealtimeContext = createContext<{ status: RealtimeStatus }>({ status: 'offline' });

export const useRealtime = () => useContext(RealtimeContext);

const TOAST_MS = 12_000;

/** URL WebSocket brute de l'endpoint STOMP (/ws, transport natif exposé par Spring sur /ws/websocket). */
function brokerUrl(): string {
  const api = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:8080/api';
  return api.replace(/\/api\/?$/, '').replace(/^http/, 'ws') + '/ws/websocket';
}

/**
 * Canal temps réel (§6.14) : alertes poussées par l'API sur
 * /user/queue/alertes (ex. incident critique escaladé à N1). L'authentification
 * se fait sur la trame STOMP CONNECT (en-tête Authorization), pas sur la
 * poignée de main HTTP. Repli propre : si la connexion échoue ou tombe,
 * l'application continue avec l'actualisation périodique existante
 * (notifications toutes les 30 s) ; la reconnexion est automatique.
 * Le temps réel s'ajoute à ces mécanismes, il ne les remplace pas.
 */
export function RealtimeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuthContext();
  const [status, setStatus] = useState<RealtimeStatus>('connecting');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const seq = useRef(0);

  const push = useCallback((a: Alerte) => {
    const id = ++seq.current;
    setToasts((prev) => [...prev, { ...a, id }]);
    window.dispatchEvent(new CustomEvent(REALTIME_EVENT, { detail: a }));
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), TOAST_MS);
  }, []);

  useEffect(() => {
    if (!user) return;

    // MODE DÉMO TEMPORAIRE : pas de backend, on simule la connexion et une alerte unique.
    if (import.meta.env.MODE === 'demo') {
      setStatus('connected');
      const t = setTimeout(() => push({ titre: 'Incident critique signalé', message: '[CRITIQUE] Serveur de synchronisation injoignable à Douala 1er', horodatage: new Date().toISOString() }), 25_000);
      return () => clearTimeout(t);
    }

    const token = localStorage.getItem('kct_token');
    if (!token) return;
    setStatus('connecting');
    const client = new Client({
      brokerURL: brokerUrl(),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      heartbeatIncoming: 20000,
      heartbeatOutgoing: 20000,
      onConnect: () => {
        setStatus('connected');
        client.subscribe('/user/queue/alertes', (frame) => {
          try {
            push(JSON.parse(frame.body) as Alerte);
          } catch {
            /* payload illisible : ignoré, jamais bloquant */
          }
        });
      },
      onWebSocketClose: () => setStatus('offline'),
      onStompError: () => setStatus('offline'),
    });
    client.activate();
    return () => {
      client.deactivate();
    };
  }, [user?.id, push]);

  return (
    <RealtimeContext.Provider value={{ status }}>
      {children}
      <div className="fixed bottom-4 left-4 z-[95] flex max-w-sm flex-col gap-2">
        {toasts.map((t) => (
          <div key={t.id} role="alert" className="flex items-start gap-3 rounded-xl border border-kct-red/30 bg-white dark:bg-gray-900 p-4 shadow-xl">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-kct-red" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{t.titre}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">{t.message}</p>
            </div>
            <button onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))} className="rounded p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800" aria-label="Fermer">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </RealtimeContext.Provider>
  );
}
