import { useTranslation } from 'react-i18next';
import { CheckCircle2, Circle, XCircle, Clock } from 'lucide-react';
import { formatDateTime, formatNumber } from '@/shared/i18n/format';
import type { Depense, DepenseStatut } from '../types';

export const formatXaf = (montant: number) => `${formatNumber(montant)} XAF`;

export const STATUT_CONFIG: Record<DepenseStatut, { className: string }> = {
  soumise: { className: 'bg-kct-yellow/15 text-kct-yellow' },
  en_attente_n3: { className: 'bg-kct-yellow/15 text-kct-yellow' },
  en_attente_n2: { className: 'bg-kct-yellow/15 text-kct-yellow' },
  en_attente_n1: { className: 'bg-kct-yellow/15 text-kct-yellow' },
  validee: { className: 'bg-kct-green/15 text-kct-green' },
  rejetee: { className: 'bg-kct-red/15 text-kct-red' },
};

/** Clé i18n du libellé d'un statut de dépense — voir budget.depenseStatut.* dans common.json. */
export const depenseStatutKey = (statut: DepenseStatut) => `budget.depenseStatut.${statut}`;

/** Étape de la cascade (niveau 4 à 1) → statut attendu et permission requise pour agir. */
export const ETAPES: Record<number, { statut: DepenseStatut; permission: string }> = {
  4: { statut: 'soumise', permission: 'depense:valider_n4' },
  3: { statut: 'en_attente_n3', permission: 'depense:valider_n3' },
  2: { statut: 'en_attente_n2', permission: 'depense:valider_n2' },
  1: { statut: 'en_attente_n1', permission: 'depense:valider_n1' },
};

/** Clé i18n du libellé d'une étape de la cascade — voir budget.etapes.* dans common.json. */
export const etapeLabelKey = (niveau: number) => `budget.etapes.n${niveau}`;

/** Niveau d'étape (4 à 1) sur lequel l'utilisateur peut agir pour cette dépense, ou null. */
export function etapeActionnable(depense: Depense, hasPermission: (code: string) => boolean): number | null {
  const entry = Object.entries(ETAPES).find(([, e]) => e.statut === depense.statut);
  if (!entry) return null;
  return hasPermission(entry[1].permission) ? Number(entry[0]) : null;
}

export function DepenseStatutBadge({ statut }: { statut: DepenseStatut }) {
  const { t } = useTranslation();
  const c = STATUT_CONFIG[statut];
  return <span className={`whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-semibold ${c.className}`}>{t(depenseStatutKey(statut))}</span>;
}

type StepState = 'done' | 'current' | 'rejected' | 'future';

function validationOf(d: Depense, niveau: number): { par: string | null; le: string | null } {
  switch (niveau) {
    case 4: return { par: d.valideN4Par, le: d.valideN4Le };
    case 3: return { par: d.valideN3Par, le: d.valideN3Le };
    case 2: return { par: d.valideN2Par, le: d.valideN2Le };
    default: return { par: d.valideN1Par, le: d.valideN1Le };
  }
}

/**
 * Frise de la cascade de validation : uniquement les étapes que l'API a
 * jugées nécessaires (jusqu'à `niveauFinalRequis`, calculé côté serveur
 * selon le montant — jamais recalculé ici).
 */
export function CascadeTimeline({ depense }: { depense: Depense }) {
  const { t } = useTranslation();
  const niveaux = [4, 3, 2, 1].filter((n) => n >= depense.niveauFinalRequis);
  let rejectionPlaced = false;

  const states: Array<{ niveau: number; state: StepState }> = niveaux.map((niveau) => {
    if (validationOf(depense, niveau).le) return { niveau, state: 'done' as StepState };
    if (depense.statut === 'rejetee' && !rejectionPlaced) {
      rejectionPlaced = true;
      return { niveau, state: 'rejected' as StepState };
    }
    if (ETAPES[niveau].statut === depense.statut) return { niveau, state: 'current' as StepState };
    return { niveau, state: 'future' as StepState };
  });

  const icon = (s: StepState) => {
    if (s === 'done') return <CheckCircle2 className="h-5 w-5 text-kct-green" />;
    if (s === 'rejected') return <XCircle className="h-5 w-5 text-kct-red" />;
    if (s === 'current') return <Clock className="h-5 w-5 text-kct-yellow" />;
    return <Circle className="h-5 w-5 text-gray-300 dark:text-gray-600" />;
  };

  return (
    <ol className="space-y-3">
      {states.map(({ niveau, state }) => {
        const v = validationOf(depense, niveau);
        return (
          <li key={niveau} className="flex items-start gap-3">
            <span className="mt-0.5">{icon(state)}</span>
            <div className="min-w-0">
              <p className={`text-sm ${state === 'future' ? 'text-gray-400' : 'font-medium text-gray-800 dark:text-gray-200'}`}>{t(etapeLabelKey(niveau))}</p>
              {state === 'done' && v.le && <p className="text-[11px] text-gray-400">{t('budget.cascade.validatedOn', { date: formatDateTime(v.le) })}</p>}
              {state === 'current' && <p className="text-[11px] text-kct-yellow">{t('budget.cascade.pending')}</p>}
              {state === 'rejected' && (
                <p className="text-[11px] text-kct-red">
                  {depense.rejeteLe ? t('budget.cascade.rejectedOn', { date: formatDateTime(depense.rejeteLe) }) : t('budget.cascade.rejected')}
                  {depense.motifRejet ? ` — ${depense.motifRejet}` : ''}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
