import apiClient from '@/shared/api/apiClient';
import type {
  AuthUser,
  LoginRequest,
  LoginResponse,
  OtpRequiredResponse,
  VerifyOtpRequest,
  ForgotPasswordRequest,
  VerifyResetCodeRequest,
  ResetTokenResponse,
  ResetPasswordWithTokenRequest,
  RefreshTokenRequest,
} from '../types';

function toAuthResult(data: LoginResponse): { token: string; refreshToken: string; user: AuthUser } {
  return {
    token: data.accessToken,
    refreshToken: data.refreshToken,
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
}

/**
 * Service d'authentification — encapsule tous les appels API liés au module Auth.
 *
 * <p>Chaque méthode correspond exactement à un endpoint de {@code AuthController}
 * (kct-manager-api, {@code com.kamercinetalents.manager.iam.controller}) — voir
 * la Javadoc de chaque endpoint pour le contrat détaillé.</p>
 */
export const authService = {
  /**
   * Authentifie un utilisateur. Si l'OTP est requis (première connexion ou
   * réverification périodique), retourne { otpRequired: true, userId, contexte }
   * — aucun token n'est émis avant vérification du code via {@link verifyOtp}.
   */
  async login(request: LoginRequest): Promise<{ token: string; refreshToken: string; user: AuthUser } | OtpRequiredResponse> {
    const { data } = await apiClient.post<LoginResponse | OtpRequiredResponse>('/iam/auth/login', request);

    if ('otpRequired' in data && data.otpRequired) {
      return data as OtpRequiredResponse;
    }

    return toAuthResult(data as LoginResponse);
  },

  /**
   * Vérifie le code OTP reçu lors du login et retourne les tokens JWT.
   * {@code contexte} doit être exactement celui reçu dans {@link OtpRequiredResponse}.
   */
  async verifyOtp(request: VerifyOtpRequest): Promise<{ token: string; refreshToken: string; user: AuthUser }> {
    const { data } = await apiClient.post<LoginResponse>('/iam/auth/verify-otp', request);
    return toAuthResult(data);
  },

  /**
   * Étape 1/3 du flux mot de passe oublié : envoie un code OTP à l'identifiant
   * (email ou téléphone) — aucune réponse ne permet de déduire si le compte existe.
   */
  async forgotPassword(request: ForgotPasswordRequest): Promise<void> {
    await apiClient.post('/iam/auth/mot-de-passe-oublie', request);
  },

  /**
   * Étape 2/3 : vérifie le code reçu et retourne un jeton temporaire à usage
   * unique, seul habilité à autoriser l'étape finale {@link resetPasswordWithToken}.
   */
  async verifyResetCode(request: VerifyResetCodeRequest): Promise<ResetTokenResponse> {
    const { data } = await apiClient.post<ResetTokenResponse>('/iam/auth/verifier-code-reinitialisation', request);
    return data;
  },

  /**
   * Étape 3/3 : change le mot de passe à partir du jeton temporaire — jamais
   * du mot de passe actuel, oublié par définition dans ce flux.
   */
  async resetPasswordWithToken(request: ResetPasswordWithTokenRequest): Promise<void> {
    await apiClient.post('/iam/auth/changer-mot-de-passe', request);
  },

  /**
   * Rafraîchit le token d'accès à partir du token de rafraîchissement stocké.
   */
  async refresh(request: RefreshTokenRequest): Promise<{ token: string; refreshToken: string; user: AuthUser }> {
    const { data } = await apiClient.post<LoginResponse>('/iam/auth/refresh', request);
    return toAuthResult(data);
  },

  /**
   * Déconnecte l'utilisateur — journalise côté serveur (audit_log) puis
   * nettoie le stockage local. Le nettoyage local a lieu même si l'appel
   * serveur échoue (token déjà expiré, hors-ligne...), pour ne jamais bloquer
   * une déconnexion voulue par l'utilisateur.
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post('/iam/auth/logout');
    } finally {
      localStorage.removeItem('kct_token');
      localStorage.removeItem('kct_refresh_token');
      localStorage.removeItem('kct_user');
    }
  },
};
