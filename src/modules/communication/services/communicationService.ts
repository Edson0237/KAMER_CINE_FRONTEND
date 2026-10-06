import apiClient from '@/shared/api/apiClient';
import type {
  Diffusion, CreateDiffusionRequest, Circulaire, CreateCirculaireRequest,
  Reunion, CreateReunionRequest, ReunionParticipant, StatutPresence,
  RessourceBibliotheque, CreateRessourceRequest,
} from '../types';

/**
 * Communication (§6.14/§6.17) — vérifié contre NotificationDiffusionController,
 * CirculaireController, ReunionController et RessourceBibliothequeController.
 * Le ciblage est résolu côté API (niveau, territoire et descendants…) : le
 * frontend n'envoie que le type de cible et son identifiant.
 */
export const communicationService = {
  // --- Diffusion de notifications ---
  async creerDiffusion(req: CreateDiffusionRequest): Promise<Diffusion> {
    const { data } = await apiClient.post<Diffusion>('/notifications/diffusions', req);
    return data;
  },
  async historiqueDiffusions(): Promise<Diffusion[]> {
    const { data } = await apiClient.get<Diffusion[]>('/notifications/diffusions/historique');
    return data;
  },

  // --- Circulaires ---
  async listCirculaires(): Promise<Circulaire[]> {
    const { data } = await apiClient.get<Circulaire[]>('/circulaires');
    return data;
  },
  async creerCirculaire(req: CreateCirculaireRequest): Promise<Circulaire> {
    const { data } = await apiClient.post<Circulaire>('/circulaires', req);
    return data;
  },
  async publierCirculaire(id: string): Promise<Circulaire> {
    const { data } = await apiClient.post<Circulaire>(`/circulaires/${id}/publier`);
    return data;
  },

  // --- Réunions ---
  async listReunions(): Promise<Reunion[]> {
    const { data } = await apiClient.get<Reunion[]>('/reunions');
    return data;
  },
  async planifierReunion(req: CreateReunionRequest): Promise<Reunion> {
    const { data } = await apiClient.post<Reunion>('/reunions', req);
    return data;
  },
  async listParticipants(reunionId: string): Promise<ReunionParticipant[]> {
    const { data } = await apiClient.get<ReunionParticipant[]>(`/reunions/${reunionId}/participants`);
    return data;
  },
  async inviter(reunionId: string, utilisateurId: string): Promise<ReunionParticipant> {
    const { data } = await apiClient.post<ReunionParticipant>(`/reunions/${reunionId}/participants`, { utilisateurId });
    return data;
  },
  async confirmerPresence(reunionId: string, statutPresence: Exclude<StatutPresence, 'invite'>): Promise<ReunionParticipant> {
    const { data } = await apiClient.post<ReunionParticipant>(`/reunions/${reunionId}/confirmer-presence`, { statutPresence });
    return data;
  },

  // --- Bibliothèque numérique ---
  async listRessources(): Promise<RessourceBibliotheque[]> {
    const { data } = await apiClient.get<RessourceBibliotheque[]>('/bibliotheque');
    return data;
  },
  async ajouterRessource(req: CreateRessourceRequest): Promise<RessourceBibliotheque> {
    const { data } = await apiClient.post<RessourceBibliotheque>('/bibliotheque', req);
    return data;
  },
};
