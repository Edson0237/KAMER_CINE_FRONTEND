/** Types du module Matériel (§6.16) — alignés sur `materiel.dto` côté kct-manager-api. */

export type MaterielEtat = 'neuf' | 'bon' | 'use' | 'hors_service';

export interface TypeMateriel {
  id: string;
  code: string;
  libelle: string;
}

export interface Materiel {
  id: string;
  typeMaterielId: string;
  numeroSerie: string;
  marque: string | null;
  modele: string | null;
  etat: MaterielEtat;
  dateAcquisition: string | null;
  valeurAcquisition: number | null;
}

export interface CreateMaterielRequest {
  typeMaterielId: string;
  numeroSerie: string;
  marque?: string;
  modele?: string;
  dateAcquisition?: string;
  valeurAcquisition?: number;
}

export interface AffectationMateriel {
  id: string;
  materielId: string;
  territoireId: string;
  responsableId: string;
  dateAffectation: string;
  dateRetour: string | null;
  statut: string;
}

export interface CreateAffectationRequest {
  materielId: string;
  territoireId: string;
  responsableId: string;
  dateAffectation: string;
}

export type MaintenanceType = 'preventive' | 'corrective';

export interface MaintenanceMateriel {
  id: string;
  materielId: string;
  typeIntervention: MaintenanceType;
  description: string | null;
  dateIntervention: string;
  cout: number | null;
  prestataire: string | null;
  prochaineMaintenance: string | null;
}

export interface CreateMaintenanceRequest {
  materielId: string;
  typeIntervention: MaintenanceType;
  description?: string;
  dateIntervention: string;
  cout?: number;
  prestataire?: string;
  prochaineMaintenance?: string;
}
