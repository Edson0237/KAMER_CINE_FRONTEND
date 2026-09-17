import apiClient from '@/shared/api/apiClient';
import type {
  ActualitePublique,
  FaqItem,
  MembreEquipe,
  Partenaire,
  CandidaturePublique,
  ContactMessage,
  CandidatureAccepteeResult,
  CreateActualiteRequest,
  CreateFaqItemRequest,
  CreateMembreEquipeRequest,
  CreatePartenaireRequest,
  TraiterCandidatureRequest,
  Evenement,
  CreateEvenementRequest,
} from '../types';

export const ecosystemeService = {
  // ==================== ACTUALITÉS ====================

  async listActualites(): Promise<ActualitePublique[]> {
    const { data } = await apiClient.get<ActualitePublique[]>('/ecosysteme/actualites');
    return data;
  },

  async createActualite(req: CreateActualiteRequest): Promise<ActualitePublique> {
    const { data } = await apiClient.post<ActualitePublique>('/ecosysteme/actualites', req);
    return data;
  },

  async updateActualite(id: string, req: CreateActualiteRequest): Promise<ActualitePublique> {
    const { data } = await apiClient.put<ActualitePublique>(`/ecosysteme/actualites/${id}`, req);
    return data;
  },

  async togglePublishActualite(id: string): Promise<ActualitePublique> {
    const { data } = await apiClient.put<ActualitePublique>(`/ecosysteme/actualites/${id}/toggle-publish`);
    return data;
  },

  async deleteActualite(id: string): Promise<void> {
    await apiClient.delete(`/ecosysteme/actualites/${id}`);
  },

  // ==================== FAQ ====================

  async listFaq(): Promise<FaqItem[]> {
    const { data } = await apiClient.get<FaqItem[]>('/ecosysteme/faq');
    return data;
  },

  async createFaqItem(req: CreateFaqItemRequest): Promise<FaqItem> {
    const { data } = await apiClient.post<FaqItem>('/ecosysteme/faq', req);
    return data;
  },

  async updateFaqItem(id: string, req: CreateFaqItemRequest): Promise<FaqItem> {
    const { data } = await apiClient.put<FaqItem>(`/ecosysteme/faq/${id}`, req);
    return data;
  },

  async deleteFaqItem(id: string): Promise<void> {
    await apiClient.delete(`/ecosysteme/faq/${id}`);
  },

  // ==================== MEMBRES ÉQUIPE ====================

  async listMembres(): Promise<MembreEquipe[]> {
    const { data } = await apiClient.get<MembreEquipe[]>('/ecosysteme/equipe');
    return data;
  },

  async createMembre(req: CreateMembreEquipeRequest): Promise<MembreEquipe> {
    const { data } = await apiClient.post<MembreEquipe>('/ecosysteme/equipe', req);
    return data;
  },

  async updateMembre(id: string, req: CreateMembreEquipeRequest): Promise<MembreEquipe> {
    const { data } = await apiClient.put<MembreEquipe>(`/ecosysteme/equipe/${id}`, req);
    return data;
  },

  async deleteMembre(id: string): Promise<void> {
    await apiClient.delete(`/ecosysteme/equipe/${id}`);
  },

  // ==================== PARTENAIRES ====================

  async listPartenaires(): Promise<Partenaire[]> {
    const { data } = await apiClient.get<Partenaire[]>('/ecosysteme/partenaires');
    return data;
  },

  async createPartenaire(req: CreatePartenaireRequest): Promise<Partenaire> {
    const { data } = await apiClient.post<Partenaire>('/ecosysteme/partenaires', req);
    return data;
  },

  async updatePartenaire(id: string, req: CreatePartenaireRequest): Promise<Partenaire> {
    const { data } = await apiClient.put<Partenaire>(`/ecosysteme/partenaires/${id}`, req);
    return data;
  },

  async deletePartenaire(id: string): Promise<void> {
    await apiClient.delete(`/ecosysteme/partenaires/${id}`);
  },

  // ==================== CANDIDATURES ====================

  async listCandidatures(): Promise<CandidaturePublique[]> {
    const { data } = await apiClient.get<CandidaturePublique[]>('/ecosysteme/candidatures');
    return data;
  },

  async traiterCandidature(id: string, req: TraiterCandidatureRequest): Promise<CandidatureAccepteeResult> {
    const { data } = await apiClient.put<CandidatureAccepteeResult>(`/ecosysteme/candidatures/${id}/traiter`, req);
    return data;
  },

  // ==================== MESSAGES DE CONTACT ====================

  async listMessages(): Promise<ContactMessage[]> {
    const { data } = await apiClient.get<ContactMessage[]>('/ecosysteme/contact');
    return data;
  },

  async marquerMessageTraite(id: string): Promise<ContactMessage> {
    const { data } = await apiClient.put<ContactMessage>(`/ecosysteme/contact/${id}/traiter`);
    return data;
  },

  // ==================== ÉVÉNEMENTS ====================

  async listEvenements(): Promise<Evenement[]> {
    const { data } = await apiClient.get<Evenement[]>('/ecosysteme/evenements');
    return data;
  },

  async createEvenement(req: CreateEvenementRequest): Promise<Evenement> {
    const { data } = await apiClient.post<Evenement>('/ecosysteme/evenements', req);
    return data;
  },

  async updateEvenement(id: string, req: CreateEvenementRequest): Promise<Evenement> {
    const { data } = await apiClient.put<Evenement>(`/ecosysteme/evenements/${id}`, req);
    return data;
  },

  async deleteEvenement(id: string): Promise<void> {
    await apiClient.delete(`/ecosysteme/evenements/${id}`);
  },
};
