import apiClient from '@/shared/api/apiClient';
import type {
  Production, CreateProductionRequest, ProductionApprenant, ProductionRole, Recompense, CreateRecompenseRequest,
} from '../types';

/** Productions (§6.19) — vérifié contre ProductionController. La publication (statutPublic) n'est modifiable que via `publier`. */
export const productionService = {
  async list(): Promise<Production[]> {
    const { data } = await apiClient.get<Production[]>('/productions');
    return data;
  },
  async create(req: CreateProductionRequest): Promise<Production> {
    const { data } = await apiClient.post<Production>('/productions', req);
    return data;
  },
  async publier(id: string): Promise<Production> {
    const { data } = await apiClient.post<Production>(`/productions/${id}/publier`);
    return data;
  },
  async listApprenants(id: string): Promise<ProductionApprenant[]> {
    const { data } = await apiClient.get<ProductionApprenant[]>(`/productions/${id}/apprenants`);
    return data;
  },
  async associerApprenant(id: string, apprenantId: string, role: ProductionRole): Promise<ProductionApprenant> {
    const { data } = await apiClient.post<ProductionApprenant>(`/productions/${id}/apprenants`, { apprenantId, role });
    return data;
  },
  async listRecompenses(id: string): Promise<Recompense[]> {
    const { data } = await apiClient.get<Recompense[]>(`/productions/${id}/recompenses`);
    return data;
  },
  async enregistrerRecompense(id: string, req: CreateRecompenseRequest): Promise<Recompense> {
    const { data } = await apiClient.post<Recompense>(`/productions/${id}/recompenses`, req);
    return data;
  },
};
