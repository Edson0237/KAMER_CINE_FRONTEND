/** Types du module Rapports (§6.20) — alignés sur `rapport.dto` côté kct-manager-api. */

export interface RapportTemplate {
  id: string;
  code: string;
  nom: string;
  /** Sections et codes d'indicateurs (JSON libre défini par l'API). */
  structure: Record<string, unknown>;
  actif: boolean;
}

export interface CreateRapportTemplateRequest {
  code: string;
  nom: string;
  structure: Record<string, unknown>;
}

export type TypePerimetre = 'communal' | 'departemental' | 'regional' | 'national';

export interface RapportGenere {
  id: string;
  templateId: string;
  typePerimetre: TypePerimetre;
  territoireId: string;
  periodeDebut: string;
  periodeFin: string;
  format: 'pdf' | 'excel';
  fichierUrl: string | null;
  dateGeneration: string;
  genereParId: string;
  statut: string;
}

export interface GenererRapportRequest {
  templateId: string;
  typePerimetre: TypePerimetre;
  territoireId: string;
  periodeDebut: string;
  periodeFin: string;
  format: 'pdf' | 'excel';
}
