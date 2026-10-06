import { Navigate } from 'react-router-dom';
import { useAuthContext } from '@/shared/auth/AuthContext';
import { Dashboard } from './Dashboard';
import { RegionalOverview } from './RegionalOverview';

/**
 * Point d'entrée de la route /dashboard — dispatche vers le contenu
 * réellement pertinent au niveau de l'utilisateur (§6.18) : "chaque
 * dashboard affiche exactement ce qui est pertinent à ce niveau, pas une
 * déclinaison du même écran avec des couleurs différentes."
 *
 * <ul>
 *   <li>N1 : la vue nationale consolidée existe déjà comme écran dédié
 *       ({@code /admin/overview}, {@link NationalOverview}) — redirection
 *       plutôt que doublon, pour ne pas avoir deux entrées de navigation
 *       identiques ("Tableau de bord" et "Vue d'ensemble").</li>
 *   <li>ADMINISTRATEUR_SYSTEME (niveau 0) : écran technique séparé de N1
 *       ({@code /admin/technique}, {@link AdminTechniqueOverview}) — même
 *       logique de redirection.</li>
 *   <li>N2/N3 : {@link RegionalOverview} — vue consolidée régionale/
 *       départementale + file des incidents à traiter.</li>
 *   <li>N4/N5 : {@link Dashboard} — vue opérationnelle du périmètre.</li>
 * </ul>
 */
export function DashboardRouter() {
  const { user } = useAuthContext();

  if (user?.niveau === 1) {
    return <Navigate to="/admin/overview" replace />;
  }
  if (user?.niveau === 0) {
    return <Navigate to="/admin/technique" replace />;
  }
  if (user?.niveau === 2 || user?.niveau === 3) {
    return <RegionalOverview />;
  }
  return <Dashboard />;
}
