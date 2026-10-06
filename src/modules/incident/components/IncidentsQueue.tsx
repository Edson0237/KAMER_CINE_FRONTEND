import { useState } from 'react';
import { useIncidents } from '../hooks/useIncidents';
import { useAuthContext } from '@/shared/auth/AuthContext';
import { AlertTriangle, Wrench, GraduationCap, HelpCircle, Loader2, CheckCircle2, ArrowRight } from 'lucide-react';
import type { IncidentType, IncidentStatut } from '../types';

const TYPE_ICONS: Record<IncidentType, typeof Wrench> = {
  technique: Wrench,
  materiel: Wrench,
  formation: GraduationCap,
  autre: HelpCircle,
};

const GRAVITE_STYLE: Record<string, string> = {
  faible: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300',
  moyenne: 'bg-kct-yellow/15 text-kct-yellow',
  critique: 'bg-kct-red/15 text-kct-red',
};

const STATUT_SUIVANT: Record<IncidentStatut, IncidentStatut | null> = {
  nouveau: 'en_cours',
  en_cours: 'resolu',
  resolu: 'ferme',
  ferme: null,
};

const STATUT_LABEL: Record<IncidentStatut, string> = {
  nouveau: 'Prendre en charge',
  en_cours: 'Marquer résolu',
  resolu: 'Clôturer',
  ferme: 'Clôturé',
};

/**
 * File des incidents remontés à traiter (§6.15) — pour N2/N3/N4 et
 * ADMINISTRATEUR_SYSTEME, titulaires de incident:write par défaut.
 * N'affiche que les incidents ouverts (nouveau/en_cours) ; le traitement
 * fait avancer le statut d'une étape à la fois.
 */
export function IncidentsQueue() {
  const { hasPermission } = useAuthContext();
  const { incidents, synthese, loading, error, traiter } = useIncidents();
  const [processingId, setProcessingId] = useState<string | null>(null);
  const peutTraiter = hasPermission('incident:write');

  const ouverts = incidents.filter((i) => i.statut === 'nouveau' || i.statut === 'en_cours');

  const avancer = async (id: string, statutActuel: IncidentStatut, assigneA: string | null) => {
    const suivant = STATUT_SUIVANT[statutActuel];
    if (!suivant) return;
    setProcessingId(id);
    try {
      // L'API remet l'assignation à null si elle n'est pas renvoyée : on la conserve.
      await traiter(id, { statut: suivant, assigneA });
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Incidents à traiter</h3>
        {synthese && synthese.ouvertsCritiques > 0 && (
          <span className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full bg-kct-red/15 text-kct-red">
            <AlertTriangle className="h-3.5 w-3.5" /> {synthese.ouvertsCritiques} critique{synthese.ouvertsCritiques > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-kct-gold" />
        </div>
      )}

      {error && <p className="text-sm text-kct-red">{error}</p>}

      {!loading && !error && ouverts.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <CheckCircle2 className="h-6 w-6 text-kct-green" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Aucun incident ouvert dans votre périmètre</p>
        </div>
      )}

      {!loading && !error && ouverts.length > 0 && (
        <div className="space-y-2">
          {ouverts.map((inc) => {
            const Icon = TYPE_ICONS[inc.type] ?? HelpCircle;
            const suivant = STATUT_SUIVANT[inc.statut];
            return (
              <div key={inc.id} className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                <div className="p-1.5 rounded-md bg-kct-gold/10 shrink-0">
                  <Icon className="h-4 w-4 text-kct-gold" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{inc.titre}</p>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${GRAVITE_STYLE[inc.gravite]}`}>
                      {inc.gravite}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{inc.description}</p>
                  <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
                    {new Date(inc.creeLe).toLocaleString('fr-FR')}
                  </p>
                </div>
                {peutTraiter && suivant && (
                  <button
                    onClick={() => avancer(inc.id, inc.statut, inc.assigneA)}
                    disabled={processingId === inc.id}
                    className="shrink-0 flex items-center gap-1 text-xs font-medium text-kct-gold hover:underline disabled:opacity-50"
                  >
                    {processingId === inc.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <>
                        {STATUT_LABEL[inc.statut]} <ArrowRight className="h-3 w-3" />
                      </>
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
