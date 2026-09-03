import { Navigate, useLocation } from 'react-router-dom';
import { useAuthContext } from './AuthContext';
import type { ReactNode } from 'react';

const NIVEAU_LABELS: Record<number, string> = {
  1: 'Comité Central National',
  2: 'Coordination Régionale',
  3: 'Coordination Départementale',
  4: "Coordination d'Arrondissement",
  5: 'Coordination Communale',
  6: 'Encadreur',
  7: 'Apprenant',
};

export function getNiveauLabel(niveau: number): string {
  return NIVEAU_LABELS[niveau] ?? `Niveau ${niveau}`;
}

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user } = useAuthContext();
  const token = localStorage.getItem('kct_token');
  const location = useLocation();

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.mustChangePassword && location.pathname !== '/force-password-change') {
    return <Navigate to="/force-password-change" replace />;
  }

  // N0 (système) et N1 (Comité Central) → vue d'ensemble nationale
  if (location.pathname === '/dashboard' && (user.niveau === 0 || user.niveau === 1)) {
    return <Navigate to="/admin/overview" replace />;
  }

  // N5 (Commune) → détail de sa commune
  if (location.pathname === '/dashboard' && user.niveau === 5 && user.territoireId) {
    return <Navigate to={`/communes/${user.territoireId}`} replace />;
  }

  // N6 (Encadreur) → détail de sa commune d'affectation
  if (location.pathname === '/dashboard' && user.niveau === 6 && user.territoireId) {
    return <Navigate to={`/communes/${user.territoireId}`} replace />;
  }

  // N2/N3/N4 → dashboard filtré par périmètre (déjà géré côté API)
  // Pas de redirection spécifique, le dashboard s'adapte au périmètre

  return <>{children}</>;
}
