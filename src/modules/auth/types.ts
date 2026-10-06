/**
 * Types partagés du module Auth.
 *
 * <p>Définit les contrats d'échange avec l'API pour l'authentification
 * et les informations de l'utilisateur connecté. Alignés champ pour champ
 * sur les DTO réels de `com.kamercinetalents.manager.iam.dto` côté API —
 * voir AuthController.java pour le contrat vérifié.</p>
 */

/** Représente un utilisateur authentifié dans le système. */
export interface AuthUser {
  id: string;
  nom: string;
  email: string | null;
  telephone: string | null;
  actif: boolean;
  roleCode: string;
  niveau: number;
  territoireId: string | null;
  permissions: string[];
  mustChangePassword?: boolean;
}

/** Payload de requête pour le login — LoginRequest.java : identifiant = email OU téléphone. */
export interface LoginRequest {
  identifiant: string;
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
  email: string | null;
  roleCode: string;
  niveau: number;
  territoireId: string | null;
  permissions: string[];
  mustChangePassword: boolean;
}

/** Réponse de l'API quand une vérification OTP est requise après login (OtpRequiredResponse.java). */
export interface OtpRequiredResponse {
  otpRequired: true;
  userId: string;
  contexte: string;
}

/** Payload pour vérifier le code OTP (VerifyOtpRequest.java) — contexte obligatoire, renvoyé tel quel. */
export interface VerifyOtpRequest {
  userId: string;
  contexte: string;
  code: string;
}

/** Payload pour demander une réinitialisation de mot de passe (ForgotPasswordRequest.java). */
export interface ForgotPasswordRequest {
  identifiant: string;
}

/** Payload pour vérifier le code de réinitialisation (VerifyResetCodeRequest.java). */
export interface VerifyResetCodeRequest {
  identifiant: string;
  code: string;
}

/** Réponse contenant le jeton temporaire à usage unique (ResetTokenResponse.java). */
export interface ResetTokenResponse {
  resetToken: string;
  expiresInMinutes: number;
}

/** Payload pour changer le mot de passe à partir du jeton de réinitialisation (ResetPasswordWithTokenRequest.java). */
export interface ResetPasswordWithTokenRequest {
  resetToken: string;
  newPassword: string;
}

/** Payload pour rafraîchir le token d'accès (RefreshTokenRequest.java). */
export interface RefreshTokenRequest {
  refreshToken: string;
}
