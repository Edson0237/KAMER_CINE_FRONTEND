import { useEffect } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import AutoScroll from 'embla-carousel-auto-scroll';
import { useIndicateurs } from '../hooks/useIndicateurs';
import { useCarte } from '../hooks/useCarte';
import { useAuthContext } from '@/shared/auth/AuthContext';
import { getNiveauLabel } from '@/shared/auth/ProtectedRoute';
import { Badge } from '@/components/ui/badge';
import {
  Users, GraduationCap, CalendarCheck, MapPin, TrendingUp, Award,
  Loader2, Shield, Activity, BarChart3,
} from 'lucide-react';

const ICON_MAP: Record<string, typeof Users> = {
  'Communes actives': MapPin,
  'Apprenants': Users,
  'Encadreurs': GraduationCap,
  'Sessions': CalendarCheck,
  'Taux de réussite': TrendingUp,
  'Attestations émises': Award,
};

const COLOR_MAP: Record<string, { bg: string; text: string }> = {
  'Communes actives': { bg: 'bg-green-50 dark:bg-green-900/20', text: 'text-green-600 dark:text-green-400' },
  'Apprenants': { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400' },
  'Encadreurs': { bg: 'bg-purple-50 dark:bg-purple-900/20', text: 'text-purple-600 dark:text-purple-400' },
  'Sessions': { bg: 'bg-orange-50 dark:bg-orange-900/20', text: 'text-orange-600 dark:text-orange-400' },
  'Taux de réussite': { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-600 dark:text-emerald-400' },
  'Attestations émises': { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-600 dark:text-amber-400' },
};

/**
 * Tableau de bord national (M4) — affiche les indicateurs clés du périmètre.
 *
 * <p>Délègue toute la logique aux hooks {@link useIndicateurs} et {@link useCarte}.
 * Les indicateurs sont filtrés par le périmètre territorial côté API.
 * Le frontend ne fait QUE refléter ce que l'API autorise.</p>
 */
export function Dashboard() {
  const { user } = useAuthContext();
  const { indicateurs, loading, error } = useIndicateurs();
  const { carteData } = useCarte();

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'start' }, [AutoScroll({ playOnInit: true, stopOnInteraction: false })]);

  useEffect(() => {
    if (emblaApi && carteData?.communes.length) {
      emblaApi.reInit();
    }
  }, [emblaApi, carteData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-kct-gold" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-xl border border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10">
        <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
      </div>
    );
  }

  const totalCommunes = carteData?.communes.length ?? 0;
  const communes = carteData?.communes ?? [];
  const activeCommunes = communes.filter((c) => c.statutCommune === 'active').length;
  const enCoursCommunes = communes.filter((c) => c.statutCommune === 'en_cours').length;
  const inactiveCommunes = communes.filter((c) => c.statutCommune === 'inactive').length;
  const activePct = totalCommunes > 0 ? Math.round((activeCommunes / totalCommunes) * 100) : 0;
  const enCoursPct = totalCommunes > 0 ? Math.round((enCoursCommunes / totalCommunes) * 100) : 0;
  const inactivePct = totalCommunes > 0 ? Math.round((inactiveCommunes / totalCommunes) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-2xl font-bold text-kct-noir dark:text-gray-100">Tableau de bord</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Indicateurs clés du périmètre territorial</p>
        </div>
        {user && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-kct-gold/10 dark:bg-kct-gold/20 border border-kct-gold/30">
            <Shield className="h-4 w-4 text-kct-gold" />
            <span className="text-sm font-medium text-kct-gold">
              {getNiveauLabel(user.niveau)}
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {indicateurs.map((ind) => {
          const Icon = ICON_MAP[ind.label] ?? BarChart3;
          const colors = COLOR_MAP[ind.label] ?? { bg: 'bg-gray-50 dark:bg-gray-800', text: 'text-gray-600 dark:text-gray-400' };
          return (
            <div
              key={ind.label}
              className="p-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg ${colors.bg}`}>
                  <Icon className={`h-5 w-5 ${colors.text}`} />
                </div>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </div>
              <h3 className="font-medium text-gray-600 dark:text-gray-400 mb-1 text-sm">{ind.label}</h3>
              <div className="flex items-baseline gap-1">
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{ind.valeur}</p>
                <span className="text-sm text-gray-400 dark:text-gray-500">{ind.unite}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {communes.length > 0 && (
          <div className="lg:col-span-2">
            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Déploiement par commune</h3>
                <Activity className="h-5 w-5 text-gray-400" />
              </div>
              <div className="overflow-hidden" ref={emblaRef}>
                <div className="flex gap-3">
                  {communes.map((c) => (
                    <div
                      key={c.id}
                      className="flex-[0_0_240px] rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-gray-50/50 dark:bg-gray-800/50"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-medium text-gray-900 dark:text-gray-100 truncate">{c.nom}</span>
                        <Badge
                          variant={c.statutCommune === 'active' ? 'success' : c.statutCommune === 'en_cours' ? 'warning' : 'danger'}
                        >
                          {c.statutCommune}
                        </Badge>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                            <Users className="h-3 w-3" /> Apprenants
                          </span>
                          <span className="font-medium text-gray-900 dark:text-gray-100">{c.nombreApprenants}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                            <GraduationCap className="h-3 w-3" /> Encadreurs
                          </span>
                          <span className="font-medium text-gray-900 dark:text-gray-100">{c.nombreEncadreurs}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                            <CalendarCheck className="h-3 w-3" /> Sessions
                          </span>
                          <span className="font-medium text-gray-900 dark:text-gray-100">{c.nombreSessions}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {totalCommunes > 0 && (
          <div className="space-y-6">
            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Synthèse territoriale</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Communes actives</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{activeCommunes} ({activePct}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full transition-all duration-500" style={{ width: `${activePct}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600 dark:text-gray-400">En cours</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{enCoursCommunes} ({enCoursPct}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-amber-500 h-2 rounded-full transition-all duration-500" style={{ width: `${enCoursPct}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Inactives</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{inactiveCommunes} ({inactivePct}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-red-500 h-2 rounded-full transition-all duration-500" style={{ width: `${inactivePct}%` }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Total communes</h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{totalCommunes}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">dans votre périmètre</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
