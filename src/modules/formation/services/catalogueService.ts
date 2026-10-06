import apiClient from '@/shared/api/apiClient';

/** Catalogue des formations (§4bis) — vérifié contre CatalogueFormationController. */
export interface CorpsMetier {
  id: string;
  code: string;
  nom: string;
  numero: number;
}

export type FiliereStatut = 'ACTIVE' | 'A_VENIR';

export interface Filiere {
  id: string;
  corpsMetierId: string;
  slug: string;
  nom: string;
  statut: FiliereStatut;
}

export const catalogueService = {
  async listCorpsMetier(): Promise<CorpsMetier[]> {
    const { data } = await apiClient.get<CorpsMetier[]>('/formation/catalogue/corps-metier');
    return data;
  },
  async listFilieres(corpsMetierId?: string): Promise<Filiere[]> {
    const { data } = await apiClient.get<Filiere[]>('/formation/catalogue/filieres', { params: corpsMetierId ? { corpsMetierId } : undefined });
    return data;
  },
  /** Bascule une filière entre ACTIVE et A_VENIR — c'est ce statut qui pilote son affichage sur le site public. */
  async updateStatut(id: string, statut: FiliereStatut): Promise<Filiere> {
    const { data } = await apiClient.patch<Filiere>(`/formation/catalogue/filieres/${id}/statut`, { statut });
    return data;
  },
};
