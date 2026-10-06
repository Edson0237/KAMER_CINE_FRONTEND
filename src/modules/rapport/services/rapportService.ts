import apiClient from '@/shared/api/apiClient';
import type { RapportTemplate, CreateRapportTemplateRequest, RapportGenere, GenererRapportRequest } from '../types';

/**
 * Rapports (§6.20) — vérifié contre RapportGenereController et
 * RapportTemplateController. Les indicateurs du rapport sont résolus côté
 * API à partir du modèle : le frontend ne calcule rien.
 */
export const rapportService = {
  async listTemplates(): Promise<RapportTemplate[]> {
    const { data } = await apiClient.get<RapportTemplate[]>('/rapports-templates');
    return data;
  },
  async createTemplate(req: CreateRapportTemplateRequest): Promise<RapportTemplate> {
    const { data } = await apiClient.post<RapportTemplate>('/rapports-templates', req);
    return data;
  },
  async updateTemplate(id: string, req: CreateRapportTemplateRequest): Promise<RapportTemplate> {
    const { data } = await apiClient.put<RapportTemplate>(`/rapports-templates/${id}`, req);
    return data;
  },
  async desactiverTemplate(id: string): Promise<void> {
    await apiClient.delete(`/rapports-templates/${id}`);
  },

  async generer(req: GenererRapportRequest): Promise<RapportGenere> {
    const { data } = await apiClient.post<RapportGenere>('/rapports', req);
    return data;
  },
  async listParTerritoire(territoireId: string): Promise<RapportGenere[]> {
    const { data } = await apiClient.get<RapportGenere[]>('/rapports', { params: { territoireId } });
    return data;
  },
};
