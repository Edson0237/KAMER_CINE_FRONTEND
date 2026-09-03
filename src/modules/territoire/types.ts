/**
 * Types partagés du module Territoire (M2).
 *
 * <p>Définit les contrats d'échange avec l'API pour la hiérarchie
 * territoriale et les communes avec leur statut.</p>
 */

/** Territoire tel que retourné par l'API (table auto-référencée via parent_id). */
export interface Territoire {
  id: string;
  nom: string;
  niveau: number;
  parentId: string | null;
}

/** Commune avec statut de déploiement (M2/M4). */
export interface Commune {
  id: string;
  nom: string;
  territoireId: string;
  statutCommune: string;
  nombreApprenants: number;
  nombreEncadreurs: number;
  nombreSessions: number;
}

/** Données de couleur pour la carte interactive. */
export interface CommuneMapData {
  id: string;
  nom: string;
  statutCommune: string;
  couleur: string;
}
