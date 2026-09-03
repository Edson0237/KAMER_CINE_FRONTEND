import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuthContext } from './AuthContext';

type NiveauGuardProps = {
  children: ReactNode;
  niveaux: number[];
  fallback?: string;
};

export function NiveauGuard({ children, niveaux, fallback = '/dashboard' }: NiveauGuardProps) {
  const { user } = useAuthContext();

  if (!user || !niveaux.includes(user.niveau)) {
    return <Navigate to={fallback} replace />;
  }

  return <>{children}</>;
}
