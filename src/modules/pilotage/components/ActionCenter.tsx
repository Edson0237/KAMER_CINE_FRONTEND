import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowRight, CalendarClock, Mail, PackageX, UserPlus, Wallet } from 'lucide-react';
import { useAuthContext } from '@/shared/auth/AuthContext';
import { incidentService } from '@/modules/incident/services/incidentService';
import { depenseService } from '@/modules/budget/services/depenseService';
import { etapeActionnable } from '@/modules/budget/components/depenseUi';
import { ecosystemeService } from '@/modules/site-public/services/ecosystemeService';
import { communicationService } from '@/modules/communication/services/communicationService';
import { materielService } from '@/modules/materiel/services/materielService';
import { REALTIME_EVENT } from '@/shared/realtime/RealtimeProvider';

type Tone = 'red' | 'yellow' | 'neutral';

interface ActionItem {
  key: string;
  label: string;
  hint?: string;
  count: number;
  tone: Tone;
  to: string;
  icon: typeof Wallet;
}

const TONE: Record<Tone, string> = {
  red: 'text-kct-red bg-kct-red/10',
  yellow: 'text-kct-yellow bg-kct-yellow/10',
  neutral: 'text-gray-500 bg-gray-100 dark:bg-gray-800',
};

/**
 * « À traiter » : ce qui attend l'utilisateur, limité à ce que ses
 * permissions lui donnent accès (incidents, dépenses à son étape,
 * candidatures, messages, réunions, matériel hors service). Chaque source
 * n'est interrogée que si la permission de lecture est détenue ; une
 * source qui échoue est simplement omise. Les comptes viennent de l'API.
 */
export function ActionCenter() {
  const { user, hasPermission } = useAuthContext();
  const navigate = useNavigate();
  const [items, setItems] = useState<ActionItem[] | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const bump = () => setTick((n) => n + 1);
    window.addEventListener(REALTIME_EVENT, bump);
    return () => window.removeEventListener(REALTIME_EVENT, bump);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const jobs: Array<Promise<ActionItem | null>> = [];

    if (hasPermission('incident:read')) {
      jobs.push(incidentService.getSynthese().then((s) => ({
        key: 'incidents', label: 'Incidents ouverts', count: s.ouvertsTotal, tone: s.ouvertsCritiques > 0 ? 'red' : s.ouvertsTotal > 0 ? 'yellow' : 'neutral',
        hint: s.ouvertsCritiques > 0 ? `dont ${s.ouvertsCritiques} critique${s.ouvertsCritiques > 1 ? 's' : ''}` : undefined, to: '/incidents', icon: AlertTriangle,
      } as ActionItem)));
    }
    const peutValider = ['depense:valider_n4', 'depense:valider_n3', 'depense:valider_n2', 'depense:valider_n1'].some(hasPermission);
    if (peutValider && hasPermission('depense:read')) {
      jobs.push(depenseService.listAll().then((list) => {
        const n = list.filter((d) => etapeActionnable(d, hasPermission) !== null).length;
        return { key: 'depenses', label: 'Dépenses à valider', count: n, tone: n > 0 ? 'yellow' : 'neutral', to: '/budget/depenses', icon: Wallet } as ActionItem;
      }));
    }
    if (hasPermission('candidature:read')) {
      jobs.push(ecosystemeService.listCandidatures().then((list) => {
        const n = list.filter((c) => c.statut === 'en_attente').length;
        return { key: 'candidatures', label: 'Candidatures en attente', count: n, tone: n > 0 ? 'yellow' : 'neutral', to: '/site/candidatures', icon: UserPlus } as ActionItem;
      }));
    }
    if (hasPermission('contact:read')) {
      jobs.push(ecosystemeService.listMessages().then((list) => {
        const n = list.filter((m) => m.statut === 'non_traite').length;
        return { key: 'messages', label: 'Messages non traités', count: n, tone: n > 0 ? 'yellow' : 'neutral', to: '/site/contact', icon: Mail } as ActionItem;
      }));
    }
    if (hasPermission('reunion:read')) {
      jobs.push(communicationService.listReunions().then((list) => {
        const n = list.filter((r) => new Date(r.dateFin).getTime() > Date.now()).length;
        return { key: 'reunions', label: 'Réunions à venir', count: n, tone: 'neutral', to: '/communication/reunions', icon: CalendarClock } as ActionItem;
      }));
    }
    if (hasPermission('materiel:read')) {
      jobs.push(materielService.list().then((list) => {
        const n = list.filter((m) => m.etat === 'hors_service').length;
        return { key: 'materiel', label: 'Matériel hors service', count: n, tone: n > 0 ? 'red' : 'neutral', to: '/materiel', icon: PackageX } as ActionItem;
      }));
    }

    Promise.allSettled(jobs).then((results) => {
      if (cancelled) return;
      setItems(results.flatMap((r) => (r.status === 'fulfilled' && r.value ? [r.value] : [])));
    });
    return () => {
      cancelled = true;
    };
  }, [user?.id, tick]);

  if (items === null || items.length === 0) return null;

  return (
    <section>
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400">À traiter</h3>
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {items.map((i) => (
          <button key={i.key} onClick={() => navigate(i.to)}
            className="group text-left rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 shadow-sm hover:border-kct-gold/50 hover:shadow-md transition-all">
            <div className="mb-3 flex items-center justify-between">
              <span className={`rounded-lg p-2 ${TONE[i.tone]}`}><i.icon className="h-4 w-4" /></span>
              <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-kct-gold transition-colors" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{i.count.toLocaleString('fr-FR')}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{i.label}</p>
            {i.hint && <p className="mt-0.5 text-[11px] font-medium text-kct-red">{i.hint}</p>}
          </button>
        ))}
      </div>
    </section>
  );
}
