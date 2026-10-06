/**
 * Types partagés du module Incidents (M0, §6.15).
 *
 * <p>Contrats alignés sur IncidentController.java / les DTO du package
 * {@code incident.dto} côté kct-manager-api.</p>
 */

export type IncidentType = 'technique' | 'materiel' | 'formation' | 'autre';
export type IncidentGravite = 'faible' | 'moyenne' | 'critique';
export type IncidentStatut = 'nouveau' | 'en_cours' | 'resolu' | 'ferme';

export interface Incident {
  id: string;
  signalePar: string;
  territoireId: string | null;
  type: IncidentType;
  gravite: IncidentGravite;
  titre: string;
  description: string;
  pieceJointeCle: string | null;
  statut: IncidentStatut;
  assigneA: string | null;
  creeLe: string;
  resoluLe: string | null;
}

export interface CreateIncidentRequest {
  type: IncidentType;
  gravite?: IncidentGravite;
  titre: string;
  description: string;
  pieceJointeCle?: string;
}

export interface UpdateIncidentRequest {
  statut: IncidentStatut;
  assigneA?: string | null;
}

/** Vue synthétique (§6.15) — compteurs, pas le détail opérationnel complet. */
export interface IncidentSynthese {
  ouvertsCritiques: number;
  ouvertsTotal: number;
}
