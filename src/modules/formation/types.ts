/**
 * Types partagés du module Formation (M3).
 *
 * <p>Définit les contrats d'échange avec l'API pour les apprenants,
 * encadreurs, sessions, présences, résultats et attestations.</p>
 */

export interface Apprenant {
  id: string;
  territoireId: string;
  nom: string;
  prenom: string;
  dateNaissance: string | null;
  sexe: string | null;
  telephone: string | null;
  photoUrl: string | null;
  syncStatus: string | null;
}

export interface Encadreur {
  id: string;
  territoireId: string;
  nom: string;
  prenom: string;
  telephone: string | null;
  specialite: string | null;
  disponibilite: string | null;
  evaluationMoyenne: number | null;
  photoUrl: string | null;
  syncStatus: string | null;
}

export interface SessionFormation {
  id: string;
  territoireId: string;
  encadreurId: string;
  dateDebut: string;
  dateFin: string | null;
  lieu: string | null;
  programme: string | null;
  statut: string;
}

export interface Presence {
  id: string;
  sessionId: string;
  apprenantId: string;
  date: string;
  statut: string;
}

export interface ResultatExamen {
  id: string;
  sessionId: string;
  apprenantId: string;
  note: number;
  dateExamen: string;
}

export interface Attestation {
  id: string;
  apprenantId: string;
  sessionId: string;
  dateEmission: string;
  numeroAttestation: string;
  statut: string;
}

export interface TauxReussite {
  sessionId: string;
  totalApprenants: number;
  totalReussis: number;
  taux: number;
  cloturee: boolean;
}

export interface CreateApprenantRequest {
  id?: string;
  territoireId: string;
  nom: string;
  prenom: string;
  dateNaissance?: string;
  sexe?: string;
  telephone?: string;
  photoUrl?: string;
}

export interface CreateEncadreurRequest {
  id?: string;
  territoireId: string;
  nom: string;
  prenom: string;
  telephone?: string;
  specialite?: string;
  disponibilite?: string;
  photoUrl?: string;
}

export interface CreateSessionRequest {
  id?: string;
  territoireId: string;
  encadreurId: string;
  dateDebut: string;
  dateFin?: string;
  lieu?: string;
  programme?: string;
  statut?: string;
}

export interface CreatePresenceRequest {
  id?: string;
  sessionId: string;
  apprenantId: string;
  date: string;
  statut: string;
}

export interface CreateResultatRequest {
  id?: string;
  sessionId: string;
  apprenantId: string;
  note: number;
  dateExamen: string;
}

/** Enveloppe générique de réponse paginée (correspond au DTO PageResponseDto côté backend). */
export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
