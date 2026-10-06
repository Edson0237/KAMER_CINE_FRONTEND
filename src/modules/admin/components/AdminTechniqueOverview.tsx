import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/shared/auth/AuthContext';
import { useMaintenance, useSauvegardes } from '../hooks/useAdmin';
import { ActionCenter } from '@/modules/pilotage/components/ActionCenter';
import { IncidentsQueue } from '@/modules/incident/components/IncidentsQueue';
import {
  Settings, Flag, Plug, Database, Wrench, KeyRound, UserCog, ShieldAlert,
  ArrowRight, ServerCog, AlertTriangle,
} from 'lucide-react';

type ConfigCard = { to: string; label: string; desc: string; icon: typeof Settings; permission: string };

const CONFIG_CARDS: ConfigCard[] = [
  { to: '/admin/parametres', label: 'Paramètres système', desc: 'Valeurs configurables — seuils, fenêtres, textes', icon: Settings, permission: 'parametre:read' },
  { to: '/admin/feature-flags', label: 'Feature flags', desc: 'Activation progressive de fonctionnalités', icon: Flag, permission: 'feature_flag:read' },
  { to: '/admin/maintenance', label: 'Mode maintenance', desc: 'Planifier, activer ou terminer une coupure de service', icon: Wrench, permission: 'maintenance:read' },
  { to: '/admin/integrations', label: 'Intégrations externes', desc: 'Fournisseurs SMS, email et autres services tiers', icon: Plug, permission: 'integration:read' },
  { to: '/admin/sauvegardes', label: 'Sauvegardes', desc: 'Historique et déclenchement manuel', icon: Database, permission: 'sauvegarde:read' },
  { to: '/admin/roles', label: 'Rôles & permissions', desc: 'RBAC dynamique et délégation individuelle', icon: KeyRound, permission: 'role:read' },
  { to: '/admin/users', label: 'Utilisateurs', desc: 'Comptes, activation, rattachement territorial', icon: UserCog, permission: 'utilisateur:read' },
  { to: '/admin/audit', label: "Journal d'audit", desc: 'Traçabilité de toutes les actions sensibles', icon: ShieldAlert, permission: 'audit:read' },
];

/**
 * Dashboard ADMINISTRATEUR_SYSTEME (§6.18) — écran séparé de la vue
 * nationale N1 (voir {@link NationalOverview}) : ici la préoccupation est
 * purement technique (configuration plateforme, intégrations,
 * sauvegardes, maintenance, RBAC), pas le pilotage du programme. Un
 * utilisateur cumulant les deux rôles verra les deux écrans distincts
 * dans sa navigation, chacun avec son propre contenu.
 */
export function AdminTechniqueOverview() {
  const navigate = useNavigate();
  const { hasPermission } = useAuthContext();
  const { services } = useMaintenance();
  const { sauvegardes } = useSauvegardes();

  const maintenancesActives = services.filter((s) => s.statut === 'ACTIVE');
  const derniereSauvegarde = sauvegardes[0];
  const visibleCards = CONFIG_CARDS.filter((c) => hasPermission(c.permission));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-kct-gold/10">
          <ServerCog className="h-5 w-5 text-kct-gold" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Administration technique</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Configuration plateforme, intégrations, sauvegardes, RBAC</p>
        </div>
      </div>

      {maintenancesActives.length > 0 && (
        <div className="flex items-center gap-3 p-4 rounded-lg border border-kct-red/30 bg-kct-red/5">
          <AlertTriangle className="h-4 w-4 text-kct-red shrink-0" />
          <p className="text-sm text-kct-red">
            {maintenancesActives.length} service{maintenancesActives.length > 1 ? 's' : ''} actuellement en maintenance active
            ({maintenancesActives.map((s) => s.serviceCode).join(', ')})
          </p>
        </div>
      )}

      <ActionCenter />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {visibleCards.map((c) => (
          <button
            key={c.to}
            onClick={() => navigate(c.to)}
            className="text-left p-5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md hover:border-kct-gold/40 transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-kct-gold/10">
                <c.icon className="h-4 w-4 text-kct-gold" />
              </div>
              <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-kct-gold transition-colors" />
            </div>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{c.label}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{c.desc}</p>
          </button>
        ))}
      </div>

      {hasPermission('incident:read') && <IncidentsQueue />}

      {derniereSauvegarde && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Dernière sauvegarde</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {new Date(derniereSauvegarde.dateDeclenchement).toLocaleString('fr-FR')} — {derniereSauvegarde.type} — statut {derniereSauvegarde.statut}
          </p>
        </div>
      )}
    </div>
  );
}
