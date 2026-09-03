import apiClient from '@/shared/api/apiClient';
import type {
  AuditLogEntry,
  ParametreSysteme,
  FeatureFlag,
  UtilisateurDto,
  RoleDto,
  PermissionDto,
  CreateUtilisateurRequest,
} from '../types';

/**
 * Service du module M0 — Administration & Supervision.
 *
 * <p>Expose les appels API vers les endpoints d'administration :
 * journal d'audit, paramètres système, feature flags, gestion des
 * utilisateurs et RBAC. Réservé au Comité Central (N1).</p>
 */
export const adminService = {
  /** Récupère le journal d'audit avec filtres optionnels. */
  async getAuditLog(params?: {
    utilisateurId?: string;
    entiteType?: string;
    page?: number;
    size?: number;
  }): Promise<{ content: AuditLogEntry[]; totalElements: number; totalPages: number }> {
    const { data } = await apiClient.get('/admin/audit', { params });
    return data;
  },

  /** Liste les paramètres système. */
  async getParametres(): Promise<ParametreSysteme[]> {
    const { data } = await apiClient.get<ParametreSysteme[]>('/admin/parametres');
    return data;
  },

  /** Modifie un paramètre système. */
  async updateParametre(cle: string, valeur: string): Promise<ParametreSysteme> {
    const { data } = await apiClient.put<ParametreSysteme>(`/admin/parametres/${cle}`, { valeur });
    return data;
  },

  /** Liste les feature flags. */
  async getFeatureFlags(): Promise<FeatureFlag[]> {
    const { data } = await apiClient.get<FeatureFlag[]>('/admin/feature-flags');
    return data;
  },

  /** Active/désactive un feature flag. */
  async toggleFeatureFlag(code: string, actif: boolean): Promise<FeatureFlag> {
    const { data } = await apiClient.put<FeatureFlag>(`/admin/feature-flags/${code}/toggle`, { actif });
    return data;
  },

  /** Liste les utilisateurs du périmètre. */
  async listUsers(): Promise<UtilisateurDto[]> {
    const { data } = await apiClient.get<UtilisateurDto[]>('/iam/utilisateurs');
    return data;
  },

  /** Crée un utilisateur. */
  async createUser(req: CreateUtilisateurRequest): Promise<UtilisateurDto> {
    const { data } = await apiClient.post<UtilisateurDto>('/iam/utilisateurs', req);
    return data;
  },

  /** Liste les rôles. */
  async listRoles(): Promise<RoleDto[]> {
    const { data } = await apiClient.get<RoleDto[]>('/iam/roles');
    return data;
  },

  /** Liste les permissions. */
  async listPermissions(): Promise<PermissionDto[]> {
    const { data } = await apiClient.get<PermissionDto[]>('/iam/roles/permissions');
    return data;
  },

  /** Liste les permissions d'un rôle. */
  async getRolePermissions(roleId: string): Promise<string[]> {
    const { data } = await apiClient.get<string[]>(`/iam/roles/${roleId}/permissions`);
    return data;
  },

  /** Assigne une permission à un rôle. */
  async assignPermission(roleId: string, permissionId: string): Promise<void> {
    await apiClient.post(`/iam/roles/${roleId}/permissions/${permissionId}`);
  },

  /** Retire une permission d'un rôle. */
  async removePermission(roleId: string, permissionId: string): Promise<void> {
    await apiClient.delete(`/iam/roles/${roleId}/permissions/${permissionId}`);
  },
};
