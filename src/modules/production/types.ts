/** Types du module Productions audiovisuelles (§6.19) — alignés sur `production.dto` côté kct-manager-api. */

export type ProductionType = 'court_metrage' | 'documentaire' | 'clip' | 'film' | 'bande_annonce';
/** 'prive' par défaut ; 'visible_v4' après publication par N1 (production:publier), préparant le site public. */
export type StatutPublic = 'prive' | 'visible_v4';

export interface Production {
  id: string;
  territoireId: string;
  titre: string;
  type: ProductionType;
  description: string | null;
  dateRealisation: string | null;
  fichierUrl: string | null;
  lienDiffusion: string | null;
  statutPublic: StatutPublic;
}

export interface CreateProductionRequest {
  territoireId: string;
  titre: string;
  type: ProductionType;
  description?: string;
  dateRealisation?: string;
  fichierUrl?: string;
  lienDiffusion?: string;
}

export type ProductionRole = 'realisateur' | 'acteur' | 'technicien';

export interface ProductionApprenant {
  id: string;
  productionId: string;
  apprenantId: string;
  role: ProductionRole;
}

export interface Recompense {
  id: string;
  productionId: string;
  nomFestival: string;
  nomPrix: string;
  annee: number;
  niveau: 'national' | 'international';
  dateObtention: string | null;
}

export interface CreateRecompenseRequest {
  nomFestival: string;
  nomPrix: string;
  annee: number;
  niveau: 'national' | 'international';
  dateObtention?: string;
}
