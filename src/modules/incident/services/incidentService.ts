import apiClient from '@/shared/api/apiClient';
import type { Incident, IncidentSynthese, CreateIncidentRequest, UpdateIncidentRequest } from '../types';

/**
 * Service du module Incidents (M0, §6.15) — appels API vérifiés contre
 * IncidentController.java. La liste et la synthèse sont déjà scopées par
 * périmètre territorial côté service (IncidentService.dansLePerimetre) :
 * le frontend ne refiltre rien, il reflète ce que l'API renvoie.
 */
export const incidentService = {
  /** Signale un incident — ouvert à tout utilisateur authentifié, tout niveau. */
  async signaler(req: CreateIncidentRequest): Promise<Incident> {
    const { data } = await apiClient.post<Incident>('/incidents', req);
    return data;
  },

  /** Incidents signalés par l'utilisateur courant. */
  async getMesIncidents(): Promise<Incident[]> {
    const { data } = await apiClient.get<Incident[]>('/incidents/mes-incidents');
    return data;
  },

  /** Liste complète dans le périmètre de l'appelant — nécessite incident:read. */
  async listAll(): Promise<Incident[]> {
    const { data } = await apiClient.get<Incident[]>('/incidents');
    return data;
  },

  /** Synthèse (compteurs) dans le périmètre de l'appelant — nécessite incident:read. */
  async getSynthese(): Promise<IncidentSynthese> {
    const { data } = await apiClient.get<IncidentSynthese>('/incidents/synthese');
    return data;
  },

  /** Consulte un incident par id — nécessite incident:read. */
  async getById(id: string): Promise<Incident> {
    const { data } = await apiClient.get<Incident>(`/incidents/${id}`);
    return data;
  },

  /** Traite un incident (statut + assignation) — nécessite incident:write. */
  async updateStatut(id: string, req: UpdateIncidentRequest): Promise<Incident> {
    const { data } = await apiClient.put<Incident>(`/incidents/${id}/statut`, req);
    return data;
  },
};
