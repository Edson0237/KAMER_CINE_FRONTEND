import { useState, useCallback } from 'react';
import { authService } from '../services/authService';
import type { AuthUser, LoginRequest } from '../types';

/**
 * Hook de gestion de l'authentification.
 *
 * <p>Centralise l'état d'authentification (utilisateur courant, loading, erreur)
 * et expose les actions de login/logout aux composants. Aucune logique métier
 * ne vit dans les composants — ils consomment ce hook.</p>
 */
export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (request: LoginRequest) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.login(request);
      if ('twoFactorRequired' in response) {
        return response;
      }
      localStorage.setItem('kct_token', response.token);
      localStorage.setItem('kct_user', JSON.stringify(response.user));
      setUser(response.user);
      return response.user;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur de connexion';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
  }, []);

  return { user, loading, error, login, logout };
}
