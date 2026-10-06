/**
 * Types partagés du module Budget (§2, §6.18) — chaîne de validation en
 * cascade N4 → N3 → N2 → N1. Contrats alignés sur DepenseController.java /
 * DepenseDto côté kct-manager-api.
 */

export type DepenseStatut = 'soumise' | 'en_attente_n3' | 'en_attente_n2' | 'en_attente_n1' | 'validee' | 'rejetee';

export interface Depense {
  id: string;
  territoireId: string;
  budgetId: string | null;
  montant: number;
  description: string;
  categorie: string | null;
  soumisPar: string;
  niveauFinalRequis: number;
  statut: DepenseStatut;
  valideN4Par: string | null;
  valideN4Le: string | null;
  valideN3Par: string | null;
  valideN3Le: string | null;
  valideN2Par: string | null;
  valideN2Le: string | null;
  valideN1Par: string | null;
  valideN1Le: string | null;
  rejetePar: string | null;
  rejeteLe: string | null;
  motifRejet: string | null;
  dateSoumission: string;
}

export interface CreateDepenseRequest {
  territoireId: string;
  budgetId?: string;
  montant: number;
  description: string;
  categorie?: string;
}

export interface Justificatif {
  id: string;
  depenseId: string;
  fichierCle: string;
  typeDocument: 'facture' | 'recu' | 'bon_commande';
  dateUpload: string;
}

export interface Budget {
  id: string;
  territoireId: string;
  exercice: string;
  montantAlloue: number;
  montantUtilise: number;
  solde: number;
  devise: string;
  dateCreation: string;
}

export interface CreateBudgetRequest {
  territoireId: string;
  exercice: string;
  montantAlloue: number;
  devise?: string;
}

export type PartenaireFinancierType = 'ministere' | 'ong' | 'bailleur' | 'prive';

export interface PartenaireFinancier {
  id: string;
  nom: string;
  type: PartenaireFinancierType;
  contactEmail: string | null;
  contactTelephone: string | null;
  actif: boolean;
}

export interface CreatePartenaireFinancierRequest {
  nom: string;
  type: PartenaireFinancierType;
  contactEmail?: string;
  contactTelephone?: string;
}

export interface Subvention {
  id: string;
  partenaireId: string;
  territoireId: string | null;
  montant: number;
  dateReception: string;
  type: 'subvention' | 'don';
  statut: string;
  enregistrePar: string;
}

export interface CreateSubventionRequest {
  partenaireId: string;
  territoireId?: string;
  montant: number;
  dateReception: string;
  type: 'subvention' | 'don';
}