import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { authService } from '@/modules/auth/services/authService';
import type { AuthUser, LoginRequest, Login2FAResponse, Verify2FARequest } from '@/modules/auth/types';

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  login: (request: LoginRequest) => Promise<AuthUser | Login2FAResponse>;
  verify2FA: (request: Verify2FARequest) => Promise<AuthUser>;
  logout: () => void;
  hasPermission: (code: string) => boolean;
  clearMustChangePassword: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Fournisseur de contexte d'authentification.
 *
 * <p>Expose l'utilisateur courant, les actions de login/logout, l'état de
 * chargement et un helper {@link hasPermission} à tous les composants enfants
 * via {@link useAuthContext}.</p>
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = localStorage.getItem('kct_user');
    return stored ? JSON.parse(stored) as AuthUser : null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (request: LoginRequest): Promise<AuthUser | Login2FAResponse> => {
    setLoading(true);
    setError(null);
    try {
      const result = await authService.login(request);
      if ('twoFactorRequired' in result) {
        return result;
      }
      localStorage.setItem('kct_token', result.token);
      localStorage.setItem('kct_user', JSON.stringify(result.user));
      setUser(result.user);
      return result.user;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur de connexion';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const verify2FA = useCallback(async (request: Verify2FARequest): Promise<AuthUser> => {
    setLoading(true);
    setError(null);
    try {
      const { token, user: authUser } = await authService.verify2FA(request);
      localStorage.setItem('kct_token', token);
      localStorage.setItem('kct_user', JSON.stringify(authUser));
      setUser(authUser);
      return authUser;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Code 2FA invalide';
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

  const hasPermission = useCallback(
    (code: string) => !!user?.permissions?.includes(code),
    [user],
  );

  const clearMustChangePassword = useCallback(() => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, mustChangePassword: false };
      localStorage.setItem('kct_user', JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, error, login, verify2FA, logout, hasPermission, clearMustChangePassword }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook de consommation du contexte d'authentification.
 *
 * @throws Error si utilisé hors d'un {@link AuthProvider}
 */
export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return ctx;
}
