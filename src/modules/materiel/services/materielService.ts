import apiClient from '@/shared/api/apiClient';
import type {
  TypeMateriel, Materiel, MaterielEtat, CreateMaterielRequest,
  AffectationMateriel, CreateAffectationRequest, MaintenanceMateriel, CreateMaintenanceRequest,
} from '../types';

/** Matériel (§6.16) — vérifié contre MaterielController, AffectationMaterielController, MaintenanceMaterielController, TypeMaterielController. */
export const materielService = {
  async listTypes(): Promise<TypeMateriel[]> {
    const { data } = await apiClient.get<TypeMateriel[]>('/types-materiel');
    return data;
  },

  async list(): Promise<Materiel[]> {
    const { data } = await apiClient.get<Materiel[]>('/materiels');
    return data;
  },
  async create(req: CreateMaterielRequest): Promise<Materiel> {
    const { data } = await apiClient.post<Materiel>('/materiels', req);
    return data;
  },
  async changerEtat(id: string, etat: MaterielEtat): Promise<Materiel> {
    const { data } = await apiClient.patch<Materiel>(`/materiels/${id}/etat`, { etat });
    return data;
  },
  async listAffectations(materielId: string): Promise<AffectationMateriel[]> {
    const { data } = await apiClient.get<AffectationMateriel[]>(`/materiels/${materielId}/affectations`);
    return data;
  },
  async listMaintenances(materielId: string): Promise<MaintenanceMateriel[]> {
    const { data } = await apiClient.get<MaintenanceMateriel[]>(`/materiels/${materielId}/maintenances`);
    return data;
  },

  async affecter(req: CreateAffectationRequest): Promise<AffectationMateriel> {
    const { data } = await apiClient.post<AffectationMateriel>('/affectations-materiel', req);
    return data;
  },
  async cloturerAffectation(id: string): Promise<AffectationMateriel> {
    const { data } = await apiClient.post<AffectationMateriel>(`/affectations-materiel/${id}/cloturer`);
    return data;
  },
  async listAffectationsParTerritoire(territoireId: string): Promise<AffectationMateriel[]> {
    const { data } = await apiClient.get<AffectationMateriel[]>('/affectations-materiel', { params: { territoireId } });
    return data;
  },

  async declarerMaintenance(req: CreateMaintenanceRequest): Promise<MaintenanceMateriel> {
    const { data } = await apiClient.post<MaintenanceMateriel>('/maintenances-materiel', req);
    return data;
  },
};
