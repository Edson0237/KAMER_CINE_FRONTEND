import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { authService } from '@/modules/auth/services/authService';
import type { AuthUser, LoginRequest, OtpRequiredResponse, VerifyOtpRequest } from '@/modules/auth/types';

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  login: (request: LoginRequest) => Promise<AuthUser | OtpRequiredResponse>;
  verifyOtp: (request: VerifyOtpRequest) => Promise<AuthUser>;
  logout: () => Promise<void>;
  hasPermission: (code: string) => boolean;
  clearMustChangePassword: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function persistSession(token: string, refreshToken: string, user: AuthUser) {
  localStorage.setItem('kct_token', token);
  localStorage.setItem('kct_refresh_token', refreshToken);
  localStorage.setItem('kct_user', JSON.stringify(user));
}

/**
 * Fournisseur de contexte d'authentification.
 *
 * <p>Expose l'utilisateur courant, les actions de login/logout, l'état de
 * chargement et un helper {@link hasPermission} à tous les composants enfants
 * via {@link useAuthContext}. {@code hasPermission} se contente de lire la
 * liste `permissions` reçue de l'API — aucune décision de droits n'est prise
 * côté client (§3, "affiche/masque, ne décide jamais seul").</p>
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = localStorage.getItem('kct_user');
    return stored ? JSON.parse(stored) as AuthUser : null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (request: LoginRequest): Promise<AuthUser | OtpRequiredResponse> => {
    setLoading(true);
    setError(null);
    try {
      const result = await authService.login(request);
      if ('otpRequired' in result) {
        return result;
      }
      persistSession(result.token, result.refreshToken, result.user);
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

  const verifyOtp = useCallback(async (request: VerifyOtpRequest): Promise<AuthUser> => {
    setLoading(true);
    setError(null);
    try {
      const result = await authService.verifyOtp(request);
      persistSession(result.token, result.refreshToken, result.user);
      setUser(result.user);
      return result.user;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Code invalide ou expiré';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
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
      value={{ user, loading, error, login, verifyOtp, logout, hasPermission, clearMustChangePassword }}
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
