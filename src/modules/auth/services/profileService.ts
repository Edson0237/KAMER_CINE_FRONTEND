import apiClient from '@/shared/api/apiClient';

/** Profil détaillé de l'utilisateur connecté, tel que retourné par /iam/utilisateurs/me. */
export interface MyProfile {
  id: string;
  nom: string;
  email: string;
  telephone: string | null;
  actif: boolean;
  roleId: string;
  territoireId: string | null;
  roleCode: string | null;
  mustChangePassword: boolean;
}

/** Payload pour changer son propre mot de passe. */
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

/**
 * Service de gestion du profil de l'utilisateur connecté.
 *
 * <p>Distinct de {@code adminService} qui gère les utilisateurs d'un
 * périmètre territorial — ce service ne concerne que le compte
 * de l'utilisateur actuellement authentifié.</p>
 */
export const profileService = {
  /** Récupère le profil de l'utilisateur connecté. */
  async getMe(): Promise<MyProfile> {
    const { data } = await apiClient.get<MyProfile>('/iam/utilisateurs/me');
    return data;
  },

  /** Change le mot de passe du compte connecté (volontaire ou forcé). */
  async changePassword(request: ChangePasswordRequest): Promise<void> {
    await apiClient.put('/iam/utilisateurs/me/password', request);
  },
};
