/**
 * Types partagés du module Auth.
 *
 * <p>Définit les contrats d'échange avec l'API pour l'authentification
 * et les informations de l'utilisateur connecté.</p>
 */

/** Représente un utilisateur authentifié dans le système. */
export interface AuthUser {
  id: string;
  nom: string;
  email: string;
  telephone: string | null;
  actif: boolean;
  roleCode: string;
  niveau: number;
  territoireId: string;
  permissions: string[];
  mustChangePassword?: boolean;
}

/** Payload de requête pour le login. */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Réponse de l'API après un login réussi (flat — correspond au DTO
 * AuthResponse côté backend Spring Boot).
 */
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  userId: string;
  nom: string;
  email: string;
  roleCode: string;
  niveau: number;
  territoireId: string;
  permissions: string[];
  mustChangePassword: boolean;
}

/** Réponse de l'API quand la 2FA est requise après login. */
export interface Login2FAResponse {
  twoFactorRequired: boolean;
  userId: string;
  email: string;
}

/** Payload pour vérifier le code 2FA. */
export interface Verify2FARequest {
  userId: string;
  code: string;
}

/** Payload pour demander un reset de mot de passe. */
export interface ForgotPasswordRequest {
  email: string;
}

/** Payload pour réinitialiser le mot de passe avec le code OTP. */
export interface ResetPasswordRequest {
  email: string;
  code: string;
  newPassword: string;
}
