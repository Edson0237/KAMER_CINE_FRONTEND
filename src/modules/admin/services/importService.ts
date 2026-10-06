import apiClient from '@/shared/api/apiClient';

/** Import en masse (§6.10) — vérifié contre ImportController (POST /admin/imports/apprenants, GET /admin/imports). */
export interface ImportJob {
  id: string;
  typeEntite: string;
  fichierSource: string;
  /** 'en_cours' pendant le traitement en tâche de fond, puis l'état final décidé par l'API. */
  statut: string;
  nbLignesTraitees: number;
  nbErreurs: number;
  erreursDetail: string[] | null;
  utilisateurId: string;
  date: string;
}

export const importService = {
  async importerApprenants(fichier: File): Promise<ImportJob> {
    const form = new FormData();
    form.append('fichier', fichier);
    const { data } = await apiClient.post<ImportJob>('/admin/imports/apprenants', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
  async list(): Promise<ImportJob[]> {
    const { data } = await apiClient.get<ImportJob[]>('/admin/imports');
    return data;
  },
  async getById(id: string): Promise<ImportJob> {
    const { data } = await apiClient.get<ImportJob>(`/admin/imports/${id}`);
    return data;
  },
};
