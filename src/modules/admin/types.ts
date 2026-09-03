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
