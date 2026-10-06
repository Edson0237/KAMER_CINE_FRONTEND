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
 * Le frontend ne fait QUE refléter ce que l'API autorise. Chaque méthode
 * est vérifiée contre FormationController.java — l'API n'expose aucune
 * liste globale d'apprenants/encadreurs/sessions/présences/résultats sans
 * scope (territoireId ou sessionId) : il n'existe donc volontairement pas
 * de variante "liste tout" ici, seulement les variantes scopées réellement
 * supportées par le backend.</p>
 */
export const formationService = {
  // ==================== APPRENANTS ====================

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

  /** Récupère une session par id. */
  async getSession(id: string): Promise<SessionFormation> {
    const { data } = await apiClient.get<SessionFormation>(`/formation/sessions/${id}`);
    return data;
  },

  /** Inscrit un apprenant à une session (session:write). L'API n'expose pas de liste des inscrits. */
  async inscrire(sessionId: string, apprenantId: string): Promise<void> {
    await apiClient.post(`/formation/sessions/${sessionId}/inscriptions/${apprenantId}`);
  },

  /** Récupère le taux de réussite d'une session (service séparé, post-clôture). */
  async getTauxReussite(sessionId: string): Promise<TauxReussite> {
    const { data } = await apiClient.get<TauxReussite>(`/formation/sessions/${sessionId}/taux-reussite`);
    return data;
  },

  // ==================== PRÉSENCES ====================

  /**
   * Récupère les présences d'une session. L'API n'expose aucune liste
   * globale de présences (seulement par session) — un appel sans
   * `sessionId` échoue explicitement plutôt que d'appeler une URL
   * inexistante. `/presences` reste un écran autonome sans sélection de
   * session pour l'instant ; il faudra soit le rattacher à une session
   * (route `/sessions/:id/presences`), soit le retirer.
   */
  async listPresences(sessionId?: string): Promise<Presence[]> {
    if (!sessionId) {
      throw new Error('Sélectionnez une session pour consulter ses présences — aucune liste globale n\'existe côté API.');
    }
    const { data } = await apiClient.get<Presence[]>(`/formation/sessions/${sessionId}/presences`);
    return data;
  },

  /** Crée un enregistrement de présence. */
  async createPresence(req: CreatePresenceRequest): Promise<Presence> {
    const { data } = await apiClient.post<Presence>('/formation/presences', req);
    return data;
  },

  // ==================== RÉSULTATS ====================

  /**
   * Récupère les résultats d'examen d'une session. Même constat que
   * {@link listPresences} — aucune liste globale côté API.
   */
  async listResultats(sessionId?: string): Promise<ResultatExamen[]> {
    if (!sessionId) {
      throw new Error('Sélectionnez une session pour consulter ses résultats — aucune liste globale n\'existe côté API.');
    }
    const { data } = await apiClient.get<ResultatExamen[]>(`/formation/sessions/${sessionId}/resultats`);
    return data;
  },

  /** Crée un résultat d'examen. */
  async createResultat(req: CreateResultatRequest): Promise<ResultatExamen> {
    const { data } = await apiClient.post<ResultatExamen>('/formation/resultats', req);
    return data;
  },

  // ==================== ATTESTATIONS ====================

  /** Récupère une attestation par id (aucune liste globale côté API — GET /attestations/{id} uniquement). */
  async getAttestation(id: string): Promise<Attestation> {
    const { data } = await apiClient.get<Attestation>(`/formation/attestations/${id}`);
    return data;
  },

  /** Émet une attestation pour un apprenant — apprenantId/sessionId en query params (API : @RequestParam, pas de body). */
  async createAttestation(apprenantId: string, sessionId: string): Promise<Attestation> {
    const { data } = await apiClient.post<Attestation>('/formation/attestations', null, {
      params: { apprenantId, sessionId },
    });
    return data;
  },
};
