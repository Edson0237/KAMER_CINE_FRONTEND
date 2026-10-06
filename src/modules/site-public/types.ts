export interface ActualitePublique {
  id: string;
  titre: string;
  contenu: string;
  imageUrl: string | null;
  datePublication: string;
  statut: 'publiee' | 'brouillon';
}

export interface FaqItem {
  id: string;
  question: string;
  reponse: string;
  categorie: string;
  ordre: number;
  actif: boolean;
}

export interface MembreEquipe {
  id: string;
  nom: string;
  poste: string;
  photoUrl: string | null;
  bio: string | null;
  ordre: number;
}

export interface Partenaire {
  id: string;
  nom: string;
  logoUrl: string | null;
  siteWeb: string | null;
  ordre: number;
}

export interface CandidaturePublique {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string | null;
  motivation: string | null;
  statut: 'en_attente' | 'acceptee' | 'refusee';
  dateSoumission: string;
  dateTraitement: string | null;
  communeId: string | null;
  traitePar: string | null;
}

export interface ContactMessage {
  id: string;
  nom: string;
  email: string;
  sujet: string;
  message: string;
  statut: 'non_traite' | 'traite';
  dateReception: string;
  dateTraitement: string | null;
}

export interface CandidatureAccepteeResult {
  candidatureId: string;
  apprenantId: string | null;
  utilisateurId: string | null;
  login: string | null;
  motDePasseTemporaire: string | null;
  canalTransmission: string | null;
}

export interface CreateActualiteRequest {
  titre: string;
  contenu: string;
  imageUrl?: string;
}

export interface CreateFaqItemRequest {
  question: string;
  reponse: string;
  categorie: string;
  ordre: number;
}

export interface CreateMembreEquipeRequest {
  nom: string;
  poste: string;
  photoUrl?: string;
  bio?: string;
  ordre: number;
}

export interface CreatePartenaireRequest {
  nom: string;
  logoUrl?: string;
  siteWeb?: string;
  ordre: number;
}

export interface TraiterCandidatureRequest {
  statut: 'acceptee' | 'refusee';
  communeId?: string;
}

export interface Evenement {
  id: string;
  titre: string;
  description: string | null;
  type: string;
  dateDebut: string;
  dateFin: string | null;
  lieu: string | null;
  adresse: string | null;
  communeId: string | null;
  imageUrl: string | null;
  capacite: number | null;
  statut: string;
}

export interface CreateEvenementRequest {
  titre: string;
  description?: string;
  type?: string;
  dateDebut: string;
  dateFin?: string;
  lieu?: string;
  adresse?: string;
  communeId?: string;
  imageUrl?: string;
  capacite?: number;
  statut?: string;
}
