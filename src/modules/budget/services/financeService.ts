import apiClient from '@/shared/api/apiClient';
import type {
  Budget, CreateBudgetRequest, Subvention, CreateSubventionRequest,
  PartenaireFinancier, CreatePartenaireFinancierRequest, Justificatif,
} from '../types';

/**
 * Budgets par territoire/exercice, subventions/dons et partenaires
 * financiers (§6.17) — vérifié contre BudgetController, SubventionController
 * et PartenaireFinancierController. Le montant utilisé et le solde d'un
 * budget sont calculés côté API (somme des dépenses validées) : jamais
 * recalculés ici.
 */
export const financeService = {
  async listBudgets(): Promise<Budget[]> {
    const { data } = await apiClient.get<Budget[]>('/budgets');
    return data;
  },
  async createBudget(req: CreateBudgetRequest): Promise<Budget> {
    const { data } = await apiClient.post<Budget>('/budgets', req);
    return data;
  },

  async listSubventions(): Promise<Subvention[]> {
    const { data } = await apiClient.get<Subvention[]>('/subventions');
    return data;
  },
  async createSubvention(req: CreateSubventionRequest): Promise<Subvention> {
    const { data } = await apiClient.post<Subvention>('/subventions', req);
    return data;
  },

  async listPartenaires(): Promise<PartenaireFinancier[]> {
    const { data } = await apiClient.get<PartenaireFinancier[]>('/partenaires-financiers');
    return data;
  },
  async createPartenaire(req: CreatePartenaireFinancierRequest): Promise<PartenaireFinancier> {
    const { data } = await apiClient.post<PartenaireFinancier>('/partenaires-financiers', req);
    return data;
  },
  async updatePartenaire(id: string, req: CreatePartenaireFinancierRequest): Promise<PartenaireFinancier> {
    const { data } = await apiClient.put<PartenaireFinancier>(`/partenaires-financiers/${id}`, req);
    return data;
  },
  async desactiverPartenaire(id: string): Promise<void> {
    await apiClient.delete(`/partenaires-financiers/${id}`);
  },

  async listJustificatifs(depenseId: string): Promise<Justificatif[]> {
    const { data } = await apiClient.get<Justificatif[]>(`/depenses/${depenseId}/justificatifs`);
    return data;
  },
  async addJustificatif(depenseId: string, fichierCle: string, typeDocument: Justificatif['typeDocument']): Promise<Justificatif> {
    const { data } = await apiClient.post<Justificatif>(`/depenses/${depenseId}/justificatifs`, { fichierCle, typeDocument });
    return data;
  },
};
