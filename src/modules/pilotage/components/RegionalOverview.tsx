import { useNavigate } from 'react-router-dom';
import { useIndicateurs } from '../hooks/useIndicateurs';
import { useCarte } from '../hooks/useCarte';
import { useAuthContext } from '@/shared/auth/AuthContext';
import { getNiveauLabel } from '@/shared/auth/ProtectedRoute';
import { StatusBadge } from '@/components/ui/status-badge';
import { IncidentsQueue } from '@/modules/incident/components/IncidentsQueue';
import { ActionCenter } from './ActionCenter';
import {
  Loader2, Shield, MapPin, Users, GraduationCap, CalendarCheck,
  TrendingUp, Award, ArrowRight, Map as MapIcon,
} from 'lucide-react';

const INDICATEUR_ICONS: Record<string, typeof Users> = {
  'Communes actives': MapPin,
  'Centres ouverts': MapPin,
  'Apprenants': Users,
  'Apprenants (Hommes)': Users,
  'Apprenants (Femmes)': Users,
  'Encadreurs': GraduationCap,
  'Sessions': CalendarCheck,
  'Taux de réussite': TrendingUp,
  'Attestations émises': Award,
};

/**
 * Dashboard N2/N3 (§6.18) — vue consolidée régionale/départementale.
 *
 * <p>Les indicateurs et la carte sont déjà scopés au périmètre territorial
 * de l'appelant côté API (TerritoireAccessService) : ce composant affiche
 * exactement ce que l'API renvoie, sans reproduire la logique de portée.
 * S'y ajoute la file des incidents remontés à traiter, propre à ce niveau
 * (le Comité Central N1 n'a qu'une synthèse, pas cette file opérationnelle).</p>
 */
export function RegionalOverview() {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { indicateurs, loading: indLoading } = useIndicateurs();
  const { carteData, loading: carteLoading } = useCarte();

  const loading = indLoading || carteLoading;
  const communes = carteData?.communes ?? [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-kct-gold" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-2xl font-bold text-kct-noir dark:text-gray-100">Vue consolidée</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Indicateurs et communes de votre périmètre</p>
        </div>
        {user && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-kct-gold/10 dark:bg-kct-gold/20 border border-kct-gold/30">
            <Shield className="h-4 w-4 text-kct-gold" />
            <span className="text-sm font-medium text-kct-gold">{getNiveauLabel(user.niveau)}</span>
          </div>
        )}
      </div>

      <ActionCenter />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {indicateurs
          .filter((ind) => !['Régions actives', 'Départements actifs', 'Budget alloué', 'Budget utilisé', 'Budget restant'].includes(ind.label))
          .map((ind) => {
            const Icon = INDICATEUR_ICONS[ind.label] ?? TrendingUp;
            return (
              <div key={ind.label} className="p-5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
                <Icon className="h-4 w-4 text-kct-gold mb-3" />
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {ind.valeur.toLocaleString('fr-FR')}{ind.unite && ` ${ind.unite}`}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{ind.label}</p>
              </div>
            );
          })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Communes de votre périmètre</h3>
              <button
                onClick={() => navigate('/carte')}
                className="text-sm text-kct-gold hover:underline font-medium flex items-center gap-1"
              >
                <MapIcon className="h-3.5 w-3.5" /> Carte <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
            {communes.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">Aucune commune dans ce périmètre</p>
            ) : (
              <div className="space-y-2">
                {communes.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => navigate(`/communes/${c.id}`)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
                  >
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100 flex-1 truncate">{c.nom}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 hidden sm:inline">
                      {c.nombreApprenants} apprenants · {c.nombreEncadreurs} encadreurs
                    </span>
                    <StatusBadge statut={c.statutCommune} />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <IncidentsQueue />
        </div>
      </div>
    </div>
  );
}
