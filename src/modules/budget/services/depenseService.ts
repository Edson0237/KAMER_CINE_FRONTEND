import apiClient from '@/shared/api/apiClient';
import type { Depense, DepenseStatut, CreateDepenseRequest } from '../types';

/**
 * Service du module Budget (§2, §6.18) — appels API vérifiés contre
 * DepenseController.java. Chaque étape de validation est un endpoint
 * dédié (valider-n4/n3/n2/n1) gardé par sa propre permission côté
 * service ; le frontend ne décide jamais quelle étape appeler seul,
 * il affiche l'action correspondant au statut renvoyé par l'API.
 */
export const depenseService = {
  /** Soumet une dépense — nécessite depense:soumettre. */
  async soumettre(req: CreateDepenseRequest): Promise<Depense> {
    const { data } = await apiClient.post<Depense>('/depenses', req);
    return data;
  },

  /** Liste les dépenses dans le périmètre de l'appelant, filtrable par statut — nécessite depense:read. */
  async listAll(statut?: DepenseStatut): Promise<Depense[]> {
    const { data } = await apiClient.get<Depense[]>('/depenses', { params: statut ? { statut } : undefined });
    return data;
  },

  /** Dépenses soumises par l'utilisateur courant. */
  async getMesSoumissions(): Promise<Depense[]> {
    const { data } = await apiClient.get<Depense[]>('/depenses/mes-soumissions');
    return data;
  },

  async validerN4(id: string): Promise<Depense> {
    const { data } = await apiClient.post<Depense>(`/depenses/${id}/valider-n4`);
    return data;
  },
  async validerN3(id: string): Promise<Depense> {
    const { data } = await apiClient.post<Depense>(`/depenses/${id}/valider-n3`);
    return data;
  },
  async validerN2(id: string): Promise<Depense> {
    const { data } = await apiClient.post<Depense>(`/depenses/${id}/valider-n2`);
    return data;
  },
  async validerN1(id: string): Promise<Depense> {
    const { data } = await apiClient.post<Depense>(`/depenses/${id}/valider-n1`);
    return data;
  },

  /** Rejette une dépense à son étape actuelle — nécessite la permission de validation correspondante. */
  async rejeter(id: string, motif: string): Promise<Depense> {
    const { data } = await apiClient.post<Depense>(`/depenses/${id}/rejeter`, { motif });
    return data;
  },
};
