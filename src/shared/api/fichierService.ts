import apiClient from './apiClient';

/**
 * Stockage générique de fichiers (POST/GET /api/fichiers). Le fichier est
 * téléversé d'abord ; seule la clé retournée est transmise ensuite dans le
 * champ concerné des autres endpoints (justificatif, pièce jointe, photo…).
 */
export const fichierService = {
  /** Téléverse un fichier pour un contexte logique donné (ex. incident_piece_jointe) et retourne sa clé. */
  async upload(fichier: File, contexte: string): Promise<string> {
    const form = new FormData();
    form.append('fichier', fichier);
    form.append('contexte', contexte);
    const { data } = await apiClient.post<{ cle: string }>('/fichiers', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.cle;
  },

  /** Récupère le contenu d'un fichier (l'appel est authentifié, d'où le blob plutôt qu'un simple lien). */
  async download(cle: string): Promise<Blob> {
    const { data } = await apiClient.get<Blob>('/fichiers', { params: { cle }, responseType: 'blob' });
    return data;
  },

  /** Ouvre un fichier dans un nouvel onglet. */
  async open(cle: string): Promise<void> {
    const url = URL.createObjectURL(await fichierService.download(cle));
    window.open(url, '_blank', 'noopener');
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  },
};
