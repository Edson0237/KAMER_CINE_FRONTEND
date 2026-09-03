import apiClient from '@/shared/api/apiClient';
import type { Territoire, Commune } from '../types';

/**
 * Service du module Territoire (M2) — appels API liés à la hiérarchie
 * territoriale et aux communes.
 *
 * <p>Le territoire est auto-référencé (parent_id) et structuré en 7 niveaux
 * (N1 national → N7 apprenant). Ce service expose les opérations de lecture
 * utilisées par la carte interactive et les tableaux de bord.</p>
 */
export const territoireService = {
  /** Récupère tous les territoires du périmètre de l'utilisateur connecté. */
  async list(): Promise<Territoire[]> {
    const { data } = await apiClient.get<Territoire[]>('/territoires');
    return data;
  },

  /** Récupère les communes du périmètre avec leur statut de déploiement. */
  async listCommunes(): Promise<Commune[]> {
    const { data } = await apiClient.get<Commune[]>('/territoires/communes');
    return data;
  },

  /** Récupère le détail d'une commune (fiche détaillée M2). */
  async getCommune(id: string): Promise<Commune> {
    const { data } = await apiClient.get<Commune>(`/territoires/communes/${id}`);
    return data;
  },

  /** Récupère les territoires enfants directs d'un parent. */
  async getChildren(parentId: string): Promise<Territoire[]> {
    const { data } = await apiClient.get<Territoire[]>(`/territoires/${parentId}/children`);
    return data;
  },

  /** Récupère un territoire par son UUID. */
  async getById(id: string): Promise<Territoire> {
    const { data } = await apiClient.get<Territoire>(`/territoires/${id}`);
    return data;
  },
};
