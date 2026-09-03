import apiClient from '@/shared/api/apiClient';
import type { Indicateur, CarteData } from '../types';

/**
 * Service du module Pilotage (M4) — appels API liés au tableau de bord
 * et à la carte interactive.
 *
 * <p>Le tableau de bord consolide les indicateurs clés (communes actives,
 * apprenants, encadreurs, taux de réussite) pour le périmètre de l'utilisateur.</p>
 */
export const pilotageService = {
  /** Récupère les indicateurs clés du périmètre de l'utilisateur connecté. */
  async getIndicateurs(): Promise<Indicateur[]> {
    const { data } = await apiClient.get<Indicateur[]>('/pilotage/indicateurs');
    return data;
  },

  /** Récupère les données de la carte (communes + statut + compteurs). */
  async getCarteData(): Promise<CarteData> {
    const { data } = await apiClient.get<CarteData>('/pilotage/carte');
    return data;
  },
};
