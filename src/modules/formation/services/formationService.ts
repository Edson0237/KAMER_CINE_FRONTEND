import apiClient from '@/shared/api/apiClient';
import type {
  Apprenant, Encadreur, SessionFormation, Presence, ResultatExamen, Attestation, TauxReussite,
  CreateApprenantRequest, CreateEncadreurRequest, CreateSessionRequest,
  CreatePresenceRequest, CreateResultatRequest, PageResponse,
} from '../types';

/**
 * Service du module Formation (M3) — appels API pour les apprenants,
 * encadreurs, sessions, présences, résultats et attestations.
 *
 * <p>Tous les endpoints respectent le périmètre territorial côté API.
 * Le frontend ne fait QUE refléter ce que l'API autorise.</p>
 */
export const formationService = {
  // ==================== APPRENANTS ====================

  /** Récupère les apprenants du périmètre de l'utilisateur connecté. */
  async listApprenants(): Promise<Apprenant[]> {
    const { data } = await apiClient.get<Apprenant[]>('/formation/apprenants');
    return data;
  },

  /** Crée un apprenant (UUID généré côté client ou serveur). */
  async createApprenant(req: CreateApprenantRequest): Promise<Apprenant> {
    const { data } = await apiClient.post<Apprenant>('/formation/apprenants', req);
    return data;
  },

  /** Modifie un apprenant existant. */
  async updateApprenant(id: string, req: CreateApprenantRequest): Promise<Apprenant> {
    const { data } = await apiClient.put<Apprenant>(`/formation/apprenants/${id}`, req);
    return data;
  },

  /** Supprime un apprenant (suppression douce — deleted_at). */
  async deleteApprenant(id: string): Promise<void> {
    await apiClient.delete(`/formation/apprenants/${id}`);
  },

  /** Recherche paginée des apprenants d'un territoire, filtrée par nom/prénom. */
  async searchApprenants(territoireId: string, params: { nom?: string; page?: number; size?: number }): Promise<PageResponse<Apprenant>> {
    const { data } = await apiClient.get<PageResponse<Apprenant>>('/formation/apprenants/page', {
      params: { territoireId, ...params },
    });
    return data;
  },

  // ==================== ENCADREURS ====================

  /** Récupère les encadreurs du périmètre. */
  async listEncadreurs(): Promise<Encadreur[]> {
    const { data } = await apiClient.get<Encadreur[]>('/formation/encadreurs');
    return data;
  },

  /** Crée un encadreur. */
  async createEncadreur(req: CreateEncadreurRequest): Promise<Encadreur> {
    const { data } = await apiClient.post<Encadreur>('/formation/encadreurs', req);
    return data;
  },

  /** Modifie un encadreur existant. */
  async updateEncadreur(id: string, req: CreateEncadreurRequest): Promise<Encadreur> {
    const { data } = await apiClient.put<Encadreur>(`/formation/encadreurs/${id}`, req);
    return data;
  },

  /** Supprime un encadreur (suppression douce). */
  async deleteEncadreur(id: string): Promise<void> {
    await apiClient.delete(`/formation/encadreurs/${id}`);
  },

  /** Recherche paginée des encadreurs d'un territoire, filtrée par nom/prénom. */
  async searchEncadreurs(territoireId: string, params: { nom?: string; page?: number; size?: number }): Promise<PageResponse<Encadreur>> {
    const { data } = await apiClient.get<PageResponse<Encadreur>>('/formation/encadreurs/page', {
      params: { territoireId, ...params },
    });
    return data;
  },

  // ==================== SESSIONS ====================

  /** Récupère les sessions du périmètre. */
  async listSessions(): Promise<SessionFormation[]> {
    const { data } = await apiClient.get<SessionFormation[]>('/formation/sessions');
    return data;
  },

  /** Crée une session de formation. */
  async createSession(req: CreateSessionRequest): Promise<SessionFormation> {
    const { data } = await apiClient.post<SessionFormation>('/formation/sessions', req);
    return data;
  },

  /** Modifie une session existante. */
  async updateSession(id: string, req: CreateSessionRequest): Promise<SessionFormation> {
    const { data } = await apiClient.put<SessionFormation>(`/formation/sessions/${id}`, req);
    return data;
  },

  /** Clôture une session (déclenche le calcul du taux de réussite côté serveur). */
  async cloturerSession(id: string): Promise<SessionFormation> {
    const { data } = await apiClient.post<SessionFormation>(`/formation/sessions/${id}/cloturer`);
    return data;
  },

  /** Recherche paginée des sessions d'un territoire, filtrée par lieu/programme. */
  async searchSessions(territoireId: string, params: { recherche?: string; page?: number; size?: number }): Promise<PageResponse<SessionFormation>> {
    const { data } = await apiClient.get<PageResponse<SessionFormation>>('/formation/sessions/page', {
      params: { territoireId, ...params },
    });
    return data;
  },

  /** Récupère le taux de réussite d'une session (service séparé, post-clôture). */
  async getTauxReussite(sessionId: string): Promise<TauxReussite> {
    const { data } = await apiClient.get<TauxReussite>(`/formation/sessions/${sessionId}/taux-reussite`);
    return data;
  },

  // ==================== PRÉSENCES ====================

  /** Récupère les présences d'une session. */
  async listPresences(sessionId?: string): Promise<Presence[]> {
    const url = sessionId
      ? `/formation/sessions/${sessionId}/presences`
      : '/formation/presences';
    const { data } = await apiClient.get<Presence[]>(url);
    return data;
  },

  /** Crée un enregistrement de présence. */
  async createPresence(req: CreatePresenceRequest): Promise<Presence> {
    const { data } = await apiClient.post<Presence>('/formation/presences', req);
    return data;
  },

  // ==================== RÉSULTATS ====================

  /** Récupère les résultats d'examen d'une session. */
  async listResultats(sessionId?: string): Promise<ResultatExamen[]> {
    const url = sessionId
      ? `/formation/sessions/${sessionId}/resultats`
      : '/formation/resultats';
    const { data } = await apiClient.get<ResultatExamen[]>(url);
    return data;
  },

  /** Crée un résultat d'examen. */
  async createResultat(req: CreateResultatRequest): Promise<ResultatExamen> {
    const { data } = await apiClient.post<ResultatExamen>('/formation/resultats', req);
    return data;
  },

  // ==================== ATTESTATIONS ====================

  /** Récupère les attestations du périmètre (réservé N1-N5). */
  async listAttestations(): Promise<Attestation[]> {
    const { data } = await apiClient.get<Attestation[]>('/formation/attestations');
    return data;
  },

  /** Émet une attestation pour un apprenant (endpoint serveur dédié, réservé N1-N5). */
  async createAttestation(apprenantId: string, sessionId: string): Promise<Attestation> {
    const { data } = await apiClient.post<Attestation>('/formation/attestations', {
      apprenantId,
      sessionId,
    });
    return data;
  },
};
