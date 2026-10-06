/**
 * Types du module Communication (§6.14, §6.17) — diffusion de notifications,
 * circulaires, réunions, bibliothèque numérique. Alignés sur les DTO de
 * `communication.dto` et `notification.dto` côté kct-manager-api.
 */

export type CibleType = 'individuel' | 'niveau' | 'territoire' | 'global';

/** Ciblage commun (identique pour diffusion, circulaire et réunion). */
export interface Ciblage {
  cibleType: CibleType;
  cibleNiveau: number | null;
  cibleTerritoireId: string | null;
  cibleUtilisateurId: string | null;
}

export type CanalDiffusion = 'in_app' | 'sms' | 'push' | 'email' | 'tous';

export interface Diffusion extends Ciblage {
  id: string;
  emisPar: string;
  titre: string;
  corps: string;
  canal: CanalDiffusion;
  nbDestinataires: number;
  statut: string;
  dateCreation: string;
  dateCompletion: string | null;
}

export interface CreateDiffusionRequest extends Partial<Ciblage> {
  titre: string;
  corps: string;
  canal: CanalDiffusion;
  cibleType: CibleType;
}

export interface Circulaire extends Ciblage {
  id: string;
  titre: string;
  contenu: string;
  auteurId: string;
  fichierJointUrl: string | null;
  datePublication: string | null;
  statut: 'brouillon' | 'publiee';
}

export interface CreateCirculaireRequest extends Partial<Ciblage> {
  titre: string;
  contenu: string;
  cibleType: CibleType;
  fichierJointUrl?: string;
}

export type ReunionType = 'presentiel' | 'visio';
export type StatutPresence = 'invite' | 'present' | 'absent';

export interface Reunion extends Ciblage {
  id: string;
  titre: string;
  type: ReunionType;
  dateDebut: string;
  dateFin: string;
  lienVisio: string | null;
  organisateurId: string;
}

export interface CreateReunionRequest extends Partial<Ciblage> {
  titre: string;
  type: ReunionType;
  dateDebut: string;
  dateFin: string;
  lienVisio?: string;
  cibleType: CibleType;
}

export interface ReunionParticipant {
  id: string;
  reunionId: string;
  utilisateurId: string;
  statutPresence: StatutPresence;
}

export type RessourceType = 'cours_video' | 'pdf' | 'reglement' | 'guide' | 'contrat' | 'support';

export interface RessourceBibliotheque {
  id: string;
  titre: string;
  type: RessourceType;
  fichierUrl: string;
  categorie: string | null;
  niveauAccesRoleId: string | null;
  dateAjout: string;
}

export interface CreateRessourceRequest {
  titre: string;
  type: RessourceType;
  fichierUrl: string;
  categorie?: string;
  niveauAccesRoleId?: string;
}
