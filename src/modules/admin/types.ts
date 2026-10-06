export interface AuditLogEntry {
  id: string;
  utilisateurId: string;
  action: string;
  entiteType: string;
  entiteId: string;
  date: string;
  details: Record<string, unknown> | null;
}

export interface ParametreSysteme {
  id: string;
  cle: string;
  valeur: string;
  type: string;
  description: string | null;
}

export interface FeatureFlag {
  id: string;
  code: string;
  libelle: string;
  actif: boolean;
  versionCible: string | null;
  territoireId: string | null;
}

export interface UtilisateurDto {
  id: string;
  nom: string;
  email: string;
  telephone: string | null;
  actif: boolean;
  roleCode: string;
  niveau: number;
  territoireId: string;
}

export interface RoleDto {
  id: string;
  code: string;
  libelle: string;
  niveauHierarchique: number;
}

export interface PermissionDto {
  id: string;
  code: string;
  libelle: string;
}

export interface CreateUtilisateurRequest {
  nom: string;
  email: string;
  password: string;
  roleCode: string;
  territoireId: string;
  telephone?: string;
}

export type MaintenanceStatut = 'PLANIFIEE' | 'ACTIVE' | 'TERMINEE';

export interface ModeMaintenance {
  id: string;
  serviceCode: string;
  statut: MaintenanceStatut;
  message: string;
  dateDebutPrevue: string | null;
  fenetrePrealerteHeures: number | null;
  dateFinPrevue: string | null;
  activePar: string | null;
  dateActivation: string | null;
  dateDesactivation: string | null;
}

export interface SetMaintenanceRequest {
  statut: MaintenanceStatut;
  message: string;
  dateDebutPrevue?: string;
  fenetrePrealerteHeures?: number;
  dateFinPrevue?: string;
}

export interface IntegrationExterne {
  id: string;
  code: string;
  config: Record<string, unknown>;
  actif: boolean;
  derniereVerification: string | null;
}

export interface Sauvegarde {
  id: string;
  dateDeclenchement: string;
  type: string;
  statut: string;
  tailleMo: number | null;
  dateTestRestauration: string | null;
  declenchePar: string | null;
}
