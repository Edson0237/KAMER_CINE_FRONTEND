import { useNavigate } from 'react-router-dom';
import { useIndicateurs } from '@/modules/pilotage/hooks/useIndicateurs';
import { useCarte } from '@/modules/pilotage/hooks/useCarte';
import { useTerritoires } from '@/modules/territoire/hooks/useTerritoires';
import { useUsers } from '../hooks/useAdmin';
import { useAuditLog } from '../hooks/useAuditLog';
import {
  Loader2, Globe, MapPin, ShieldAlert, KeyRound, UserCog,
  TrendingUp, Building2, Map as MapIcon, ArrowRight,
} from 'lucide-react';

const NIVEAU_ICONS: Record<number, typeof Globe> = {
  1: Globe, 2: MapIcon, 3: Building2, 4: MapPin, 5: MapPin,
};
const NIVEAU_LABELS: Record<number, string> = {
  1: 'National', 2: 'Régions', 3: 'Départements', 4: 'Arrondissements', 5: 'Communes',
};

export function NationalOverview() {
  const navigate = useNavigate();
  const { indicateurs, loading: indLoading } = useIndicateurs();
  const { carteData, loading: carteLoading } = useCarte();
  const { territoires, loading: terrLoading } = useTerritoires();
  const { users } = useUsers();
  const { data: auditEntries } = useAuditLog({ page: 0, size: 5 });

  const loading = indLoading || carteLoading || terrLoading;
  const communes = carteData?.communes ?? [];
  const activeC = communes.filter((c) => c.statutCommune === 'active').length;
  const enCoursC = communes.filter((c) => c.statutCommune === 'en_cours').length;
  const inactiveC = communes.length - activeC - enCoursC;
  const terrByN = territoires.reduce<Record<number, number>>((a, t) => {
    a[t.niveau] = (a[t.niveau] ?? 0) + 1; return a;
  }, {});
  const activeUsers = users.filter((u) => u.actif).length;
  const activePct = communes.length > 0 ? Math.round((activeC / communes.length) * 100) : 0;

  const links = [
    { to: '/admin/audit', label: "Journal d'audit", icon: ShieldAlert, desc: 'Traçabilité' },
    { to: '/admin/users', label: 'Utilisateurs', icon: UserCog, desc: `${users.length} comptes, ${activeUsers} actifs` },
    { to: '/admin/roles', label: 'Rôles & permissions', icon: KeyRound, desc: 'RBAC' },
    { to: '/territoires', label: 'Territoires', icon: MapPin, desc: `${territoires.length} entités` },
    { to: '/carte', label: 'Carte', icon: MapIcon, desc: `${communes.length} communes` },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-kct-gold" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-kct-gold/10">
          <Globe className="h-5 w-5 text-kct-gold" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Vue d'ensemble nationale</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Comité Central — pilotage global</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {indicateurs.slice(0, 4).map((ind) => (
          <div key={ind.label} className="p-5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-xs text-gray-400">{ind.unite}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{ind.valeur}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{ind.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Répartition territoriale</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[1, 2, 3, 4, 5].map((n) => {
                const Icon = NIVEAU_ICONS[n] ?? MapPin;
                return (
                  <div key={n} className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 rounded-md bg-kct-gold/10">
                        <Icon className="h-4 w-4 text-kct-gold" />
                      </div>
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{NIVEAU_LABELS[n]}</span>
                    </div>
                    <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{terrByN[n] ?? 0}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Déploiement des communes</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-lg bg-green-50 dark:bg-green-900/20">
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{activeC}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Actives</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20">
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{enCoursC}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">En cours</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-gray-100 dark:bg-gray-800">
                <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">{inactiveC}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Inactives</p>
              </div>
            </div>
            {communes.length > 0 && (
              <div className="mt-4 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full transition-all duration-500" style={{ width: `${activePct}%` }} />
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Accès rapide</h3>
            <div className="space-y-2">
              {links.map((l) => (
                <button
                  key={l.to}
                  onClick={() => navigate(l.to)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
                >
                  <div className="p-2 rounded-md bg-kct-gold/10">
                    <l.icon className="h-4 w-4 text-kct-gold" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{l.label}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{l.desc}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400 shrink-0" />
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Activité récente</h3>
            <div className="space-y-3">
              {auditEntries?.slice(0, 5).map((e) => (
                <div key={e.id} className="flex items-start gap-3 text-sm">
                  <div className="p-1.5 rounded-md bg-gray-100 dark:bg-gray-800 shrink-0">
                    <ShieldAlert className="h-3.5 w-3.5 text-gray-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-gray-900 dark:text-gray-100 truncate">
                      <span className="font-medium">{e.action}</span> — {e.entiteType}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {e.utilisateurId} · {new Date(e.date).toLocaleString('fr-FR')}
                    </p>
                  </div>
                </div>
              )) ?? (
                <p className="text-sm text-gray-500 dark:text-gray-400">Aucune activité récente</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
