import apiClient from '@/shared/api/apiClient';
import type { AuthUser, LoginRequest, LoginResponse, Login2FAResponse, Verify2FARequest, ForgotPasswordRequest, ResetPasswordRequest } from '../types';

/**
 * Service d'authentification — encapsule tous les appels API liés au module Auth.
 */
export const authService = {
  /**
   * Authentifie un utilisateur. Si la 2FA est activée, retourne { twoFactorRequired, userId, email }.
   * Sinon retourne { token, user }.
   */
  async login(request: LoginRequest): Promise<{ token: string; user: AuthUser } | Login2FAResponse> {
    const { data } = await apiClient.post<LoginResponse | Login2FAResponse>('/iam/auth/login', request);

    if ('twoFactorRequired' in data && data.twoFactorRequired) {
      return data as Login2FAResponse;
    }

    const loginData = data as LoginResponse;
    return {
      token: loginData.accessToken,
      user: {
        id: loginData.userId,
        nom: loginData.nom,
        email: loginData.email,
        telephone: null,
        actif: true,
        roleCode: loginData.roleCode,
        niveau: loginData.niveau,
        territoireId: loginData.territoireId,
        permissions: loginData.permissions,
        mustChangePassword: loginData.mustChangePassword,
      },
    };
  },

  /**
   * Vérifie le code 2FA et retourne les tokens JWT.
   */
  async verify2FA(request: Verify2FARequest): Promise<{ token: string; user: AuthUser }> {
    const { data } = await apiClient.post<LoginResponse>('/iam/auth/verify-2fa', request);
    return {
      token: data.accessToken,
      user: {
        id: data.userId,
        nom: data.nom,
        email: data.email,
        telephone: null,
        actif: true,
        roleCode: data.roleCode,
        niveau: data.niveau,
        territoireId: data.territoireId,
        permissions: data.permissions,
        mustChangePassword: data.mustChangePassword,
      },
    };
  },

  /**
   * Demande un code OTP de réinitialisation de mot de passe.
   */
  async forgotPassword(request: ForgotPasswordRequest): Promise<void> {
    await apiClient.post('/iam/auth/forgot-password', request);
  },

  /**
   * Réinitialise le mot de passe avec le code OTP.
   */
  async resetPassword(request: ResetPasswordRequest): Promise<void> {
    await apiClient.post('/iam/auth/reset-password', request);
  },

  /**
   * Déconnecte l'utilisateur courant (côté client uniquement — le JWT est stateless).
   */
  logout(): void {
    localStorage.removeItem('kct_token');
    localStorage.removeItem('kct_user');
  },
};
