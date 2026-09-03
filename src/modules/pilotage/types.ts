/**
 * Types partagés du module Pilotage (M4).
 *
 * <p>Définit les contrats d'échange avec l'API pour les indicateurs
 * du tableau de bord et les données de la carte.</p>
 */

/** Indicateur clé du tableau de bord consolidé. */
export interface Indicateur {
  label: string;
  valeur: number;
  unite: string;
}

/** Données de la carte par commune (M2/M4). */
export interface CarteData {
  communes: Array<{
    id: string;
    nom: string;
    statutCommune: string;
    nombreApprenants: number;
    nombreEncadreurs: number;
    nombreSessions: number;
  }>;
}

/** Statut de commune avec sa couleur associée. */
export interface StatutCommuneInfo {
  statut: string;
  label: string;
  couleur: string;
}
