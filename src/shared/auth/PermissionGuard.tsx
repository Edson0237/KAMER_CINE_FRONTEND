import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuthContext } from './AuthContext';

type PermissionGuardProps = {
  children: ReactNode;
  /** Une seule permission requise. */
  permission?: string;
  /** Au moins une de ces permissions suffit. */
  anyOf?: string[];
  fallback?: string;
};

/**
 * Garde de route basée sur une permission (pas un niveau hiérarchique
 * codé en dur) — nécessaire pour toute route dont l'accès doit rester
 * déléguable via `user_permission_override` (§3), comme
 * `site.content.manage` : accordée par défaut à N1 et ADMINISTRATEUR_SYSTEME,
 * mais un tiers peut la détenir sans détenir le reste des droits N1.
 * {@link NiveauGuard} reste approprié pour les routes réellement liées au
 * niveau hiérarchique (ex. RBAC/config technique, réservés structurellement).
 * Sans `permission` ni `anyOf`, toute session authentifiée est admise.
 */
export function PermissionGuard({ children, permission, anyOf, fallback = '/dashboard' }: PermissionGuardProps) {
  const { hasPermission } = useAuthContext();

  const allowed = permission ? hasPermission(permission) : anyOf ? anyOf.some(hasPermission) : true;
  if (!allowed) {
    return <Navigate to={fallback} replace />;
  }

  return <>{children}</>;
}
