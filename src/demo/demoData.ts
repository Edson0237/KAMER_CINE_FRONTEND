/**
 * MODE DÉMO TEMPORAIRE — données fictives servant l'adaptateur axios de
 * {@link ./demoAdapter}. Actif uniquement avec `npm run dev:demo`
 * (vite --mode demo). À supprimer avec le dossier src/demo/ : voir les
 * 3 points d'accroche (apiClient.ts, App.tsx, package.json).
 */
import type { Territoire, Commune } from '@/modules/territoire/types';
import type { Incident } from '@/modules/incident/types';
import type { Depense } from '@/modules/budget/types';
import type {
  ModeMaintenance, IntegrationExterne, Sauvegarde, ParametreSysteme, FeatureFlag,
  AuditLogEntry, UtilisateurDto, RoleDto, PermissionDto,
} from '@/modules/admin/types';
import type { NotificationItem } from '@/modules/notification/types';
import type {
  ActualitePublique, FaqItem, MembreEquipe, Partenaire, CandidaturePublique, ContactMessage, Evenement,
} from '@/modules/site-public/types';
import type { LoginResponse } from '@/modules/auth/types';
import type { PartenaireFinancier, Subvention, Justificatif } from '@/modules/budget/types';
import type { Production, ProductionApprenant, Recompense } from '@/modules/production/types';
import type { RapportTemplate, RapportGenere } from '@/modules/rapport/types';
import type { ImportJob } from '@/modules/admin/services/importService';
import type { TypeMateriel, Materiel, AffectationMateriel, MaintenanceMateriel } from '@/modules/materiel/types';
import type { Diffusion, Circulaire, Reunion, ReunionParticipant, RessourceBibliotheque } from '@/modules/communication/types';

const HOUR = 3_600_000;
const now = Date.now();
export const isoIn = (hours: number) => new Date(now + hours * HOUR).toISOString();

// ==================== TERRITOIRES ====================

export const territoires: Territoire[] = [
  { id: 'nat', nom: 'Cameroun', niveau: 1, parentId: null },
  { id: 'reg-centre', nom: 'Centre', niveau: 2, parentId: 'nat' },
  { id: 'reg-littoral', nom: 'Littoral', niveau: 2, parentId: 'nat' },
  { id: 'reg-ouest', nom: 'Ouest', niveau: 2, parentId: 'nat' },
  { id: 'reg-nord', nom: 'Nord', niveau: 2, parentId: 'nat' },
  { id: 'dep-lekie', nom: 'Lékié', niveau: 3, parentId: 'reg-centre' },
  { id: 'dep-mfoundi', nom: 'Mfoundi', niveau: 3, parentId: 'reg-centre' },
  { id: 'dep-wouri', nom: 'Wouri', niveau: 3, parentId: 'reg-littoral' },
  { id: 'dep-mifi', nom: 'Mifi', niveau: 3, parentId: 'reg-ouest' },
  { id: 'dep-benoue', nom: 'Bénoué', niveau: 3, parentId: 'reg-nord' },
  { id: 'arr-obala', nom: 'Obala', niveau: 4, parentId: 'dep-lekie' },
  { id: 'arr-monatele', nom: 'Monatélé', niveau: 4, parentId: 'dep-lekie' },
  { id: 'arr-yde1', nom: 'Yaoundé 1er', niveau: 4, parentId: 'dep-mfoundi' },
  { id: 'arr-yde2', nom: 'Yaoundé 2e', niveau: 4, parentId: 'dep-mfoundi' },
  { id: 'arr-douala1', nom: 'Douala 1er', niveau: 4, parentId: 'dep-wouri' },
  { id: 'arr-douala3', nom: 'Douala 3e', niveau: 4, parentId: 'dep-wouri' },
  { id: 'arr-bafoussam1', nom: 'Bafoussam 1er', niveau: 4, parentId: 'dep-mifi' },
  { id: 'arr-garoua1', nom: 'Garoua 1er', niveau: 4, parentId: 'dep-benoue' },
  { id: 'com-obala', nom: 'Obala', niveau: 5, parentId: 'arr-obala' },
  { id: 'com-monatele', nom: 'Monatélé', niveau: 5, parentId: 'arr-monatele' },
  { id: 'com-yde1', nom: 'Yaoundé 1er', niveau: 5, parentId: 'arr-yde1' },
  { id: 'com-yde2', nom: 'Yaoundé 2e', niveau: 5, parentId: 'arr-yde2' },
  { id: 'com-douala1', nom: 'Douala 1er', niveau: 5, parentId: 'arr-douala1' },
  { id: 'com-douala3', nom: 'Douala 3e', niveau: 5, parentId: 'arr-douala3' },
  { id: 'com-bafoussam1', nom: 'Bafoussam 1er', niveau: 5, parentId: 'arr-bafoussam1' },
  { id: 'com-garoua1', nom: 'Garoua 1er', niveau: 5, parentId: 'arr-garoua1' },
];

const communeStats: Array<[string, string, number, number, number]> = [
  ['com-obala', 'en_cours', 48, 3, 2],
  ['com-monatele', 'terminee', 62, 4, 3],
  ['com-yde1', 'terminee', 120, 6, 5],
  ['com-yde2', 'en_cours', 85, 5, 4],
  ['com-douala1', 'en_cours', 97, 5, 4],
  ['com-douala3', 'suspendue', 30, 2, 1],
  ['com-bafoussam1', 'terminee', 74, 4, 3],
  ['com-garoua1', 'non_demarree', 0, 1, 0],
];

export const communes: Commune[] = communeStats.map(([id, statutCommune, nombreApprenants, nombreEncadreurs, nombreSessions]) => ({
  id,
  nom: territoires.find((t) => t.id === id)!.nom,
  territoireId: id,
  statutCommune,
  nombreApprenants,
  nombreEncadreurs,
  nombreSessions,
}));

/** Identifiants du territoire racine et de tous ses descendants (racine 'nat' ou null = tout). */
export function subtreeIds(rootId: string | null): Set<string> {
  if (!rootId || rootId === 'nat') return new Set(territoires.map((t) => t.id));
  const ids = new Set<string>([rootId]);
  let grew = true;
  while (grew) {
    grew = false;
    for (const t of territoires) {
      if (t.parentId && ids.has(t.parentId) && !ids.has(t.id)) {
        ids.add(t.id);
        grew = true;
      }
    }
  }
  return ids;
}

// ==================== FORMATION (générée) ====================

const NOMS = ['Ngono', 'Mballa', 'Essomba', 'Atangana', 'Fotso', 'Tchouamou', 'Kamga', 'Nkolo', 'Mvondo', 'Abena', 'Onana', 'Ateba', 'Manga', 'Talla', 'Nguele'];
const PRENOMS_M = ['Jean', 'Paul', 'Serge', 'Éric', 'Yves', 'Landry', 'Boris'];
const PRENOMS_F = ['Marie', 'Grâce', 'Estelle', 'Nadège', 'Carine', 'Sandrine', 'Flore'];
const SPECIALITES = ['Réalisation', 'Prise de vue', 'Scénario', 'Montage', 'Son', 'Jeu d\'acteur'];

export interface DemoApprenant {
  id: string; territoireId: string; nom: string; prenom: string; dateNaissance: string | null;
  sexe: string | null; telephone: string | null; photoUrl: string | null; syncStatus: string | null;
}

export function apprenantsOf(communeId: string): DemoApprenant[] {
  const c = communes.find((x) => x.id === communeId);
  if (!c) return [];
  return Array.from({ length: c.nombreApprenants }, (_, i) => {
    const sexe = i % 5 < 2 ? 'M' : 'F';
    const prenoms = sexe === 'M' ? PRENOMS_M : PRENOMS_F;
    return {
      id: `app-${communeId}-${i}`,
      territoireId: communeId,
      nom: NOMS[(i * 7 + communeId.length) % NOMS.length],
      prenom: prenoms[(i * 3) % prenoms.length],
      dateNaissance: `${1996 + (i % 9)}-0${1 + (i % 9)}-1${i % 9}`,
      sexe,
      telephone: `6${70 + (i % 9)} ${10 + (i % 80)} ${20 + (i % 70)} ${30 + (i % 60)}`,
      photoUrl: null,
      syncStatus: 'synced',
    };
  });
}

export function encadreursOf(communeId: string) {
  const c = communes.find((x) => x.id === communeId);
  if (!c) return [];
  return Array.from({ length: c.nombreEncadreurs }, (_, i) => ({
    id: `enc-${communeId}-${i}`,
    territoireId: communeId,
    nom: NOMS[(i * 5 + communeId.length) % NOMS.length],
    prenom: (i % 2 ? PRENOMS_F : PRENOMS_M)[i % 7],
    telephone: `65${i} 12 34 5${i}`,
    specialite: SPECIALITES[i % SPECIALITES.length],
    disponibilite: i % 3 === 0 ? 'Week-end' : 'Semaine',
    evaluationMoyenne: 3.5 + ((i * 3) % 15) / 10,
    photoUrl: null,
    syncStatus: 'synced',
  }));
}

export const sessionsCloturees = new Set<string>();
export interface DemoPresence { id: string; sessionId: string; apprenantId: string; date: string; statut: string; saisieParId: string }
export interface DemoResultat { id: string; sessionId: string; apprenantId: string; note: number; dateExamen: string }
export const presencesDemo: DemoPresence[] = [
  { id: 'pre-1', sessionId: 'ses-com-obala-0', apprenantId: 'app-com-obala-0', date: isoIn(-48).slice(0, 10), statut: 'present', saisieParId: 'u-n5' },
  { id: 'pre-2', sessionId: 'ses-com-obala-0', apprenantId: 'app-com-obala-1', date: isoIn(-48).slice(0, 10), statut: 'retard', saisieParId: 'u-n5' },
  { id: 'pre-3', sessionId: 'ses-com-obala-0', apprenantId: 'app-com-obala-2', date: isoIn(-48).slice(0, 10), statut: 'absent', saisieParId: 'u-n5' },
];
export const resultatsDemo: DemoResultat[] = [
  { id: 'rex-1', sessionId: 'ses-com-monatele-0', apprenantId: 'app-com-monatele-0', note: 15.5, dateExamen: '2026-06-20' },
  { id: 'rex-2', sessionId: 'ses-com-monatele-0', apprenantId: 'app-com-monatele-1', note: 8, dateExamen: '2026-06-20' },
  { id: 'rex-3', sessionId: 'ses-com-monatele-0', apprenantId: 'app-com-monatele-2', note: 12, dateExamen: '2026-06-20' },
];

export function sessionsOf(communeId: string) {
  const c = communes.find((x) => x.id === communeId);
  if (!c) return [];
  const programmes = ['Initiation à la réalisation', 'Prise de vue et lumière', 'Écriture de scénario', 'Montage numérique'];
  return Array.from({ length: c.nombreSessions }, (_, i) => ({
    id: `ses-${communeId}-${i}`,
    territoireId: communeId,
    encadreurId: `enc-${communeId}-${i % Math.max(1, c.nombreEncadreurs)}`,
    dateDebut: `2026-0${3 + (i % 5)}-0${1 + i}`,
    dateFin: `2026-0${4 + (i % 5)}-0${1 + i}`,
    lieu: `Centre KCT de ${c.nom}`,
    programme: programmes[i % programmes.length],
    filiereId: null as string | null,
    statut: c.statutCommune === 'terminee' || sessionsCloturees.has(`ses-${communeId}-${i}`) ? 'cloturee' : i === 0 ? 'en_cours' : 'planifiee',
  }));
}

// ==================== INCIDENTS / DÉPENSES ====================

export const incidents: Incident[] = [
  { id: 'inc-1', signalePar: 'u-enc1', territoireId: 'com-douala1', type: 'technique', gravite: 'critique', titre: 'Serveur de synchronisation injoignable à Douala 1er', description: 'Les tablettes des encadreurs ne synchronisent plus depuis 48 h.', pieceJointeCle: null, statut: 'nouveau', assigneA: null, creeLe: isoIn(-5), resoluLe: null },
  { id: 'inc-2', signalePar: 'u-enc2', territoireId: 'com-obala', type: 'materiel', gravite: 'moyenne', titre: 'Caméra hors service — session Obala', description: 'La caméra principale ne s\'allume plus, batterie gonflée.', pieceJointeCle: null, statut: 'en_cours', assigneA: 'u-n4', creeLe: isoIn(-30), resoluLe: null },
  { id: 'inc-3', signalePar: 'u-enc3', territoireId: 'com-monatele', type: 'formation', gravite: 'faible', titre: 'Encadreur absent deux séances', description: 'L\'encadreur de la session de scénario était indisponible.', pieceJointeCle: null, statut: 'nouveau', assigneA: null, creeLe: isoIn(-52), resoluLe: null },
  { id: 'inc-4', signalePar: 'u-enc4', territoireId: 'com-yde2', type: 'materiel', gravite: 'critique', titre: 'Vol de matériel à Yaoundé 2e', description: 'Deux trépieds et un micro ont disparu du local.', pieceJointeCle: null, statut: 'en_cours', assigneA: 'u-n3', creeLe: isoIn(-20), resoluLe: null },
  { id: 'inc-5', signalePar: 'u-enc5', territoireId: 'com-bafoussam1', type: 'technique', gravite: 'moyenne', titre: 'Application mobile bloquée à la synchronisation', description: 'Erreur récurrente au moment de l\'envoi des présences.', pieceJointeCle: null, statut: 'nouveau', assigneA: null, creeLe: isoIn(-9), resoluLe: null },
  { id: 'inc-6', signalePar: 'u-n5', territoireId: 'com-obala', type: 'autre', gravite: 'faible', titre: 'Salle de formation trop petite', description: 'Prévoir la salle des fêtes pour les séances de groupe.', pieceJointeCle: null, statut: 'resolu', assigneA: 'u-n4', creeLe: isoIn(-120), resoluLe: isoIn(-70) },
  { id: 'inc-7', signalePar: 'u-enc6', territoireId: 'com-garoua1', type: 'formation', gravite: 'moyenne', titre: 'Manque de supports pédagogiques', description: 'Les fiches de cours n\'ont pas été livrées.', pieceJointeCle: null, statut: 'nouveau', assigneA: null, creeLe: isoIn(-15), resoluLe: null },
];

const dep = (o: Partial<Depense> & Pick<Depense, 'id' | 'territoireId' | 'montant' | 'description' | 'categorie' | 'statut' | 'niveauFinalRequis'>): Depense => ({
  budgetId: null, soumisPar: 'u-n5', valideN4Par: null, valideN4Le: null, valideN3Par: null, valideN3Le: null,
  valideN2Par: null, valideN2Le: null, valideN1Par: null, valideN1Le: null, rejetePar: null, rejeteLe: null,
  motifRejet: null, dateSoumission: isoIn(-72), ...o,
});

export const depenses: Depense[] = [
  dep({ id: 'dep-1', territoireId: 'com-obala', montant: 45_000, description: 'Location de salle des fêtes', categorie: 'Logistique', statut: 'soumise', niveauFinalRequis: 4, dateSoumission: isoIn(-6) }),
  dep({ id: 'dep-2', territoireId: 'com-obala', montant: 78_000, description: 'Câbles et trépieds', categorie: 'Matériel', statut: 'soumise', niveauFinalRequis: 4, dateSoumission: isoIn(-26) }),
  dep({ id: 'dep-3', territoireId: 'com-monatele', montant: 320_000, description: 'Achat de 2 caméras', categorie: 'Matériel', statut: 'en_attente_n3', niveauFinalRequis: 3, soumisPar: 'u-n5b', valideN4Par: 'u-n4', valideN4Le: isoIn(-20) }),
  dep({ id: 'dep-4', territoireId: 'com-yde1', montant: 750_000, description: 'Équipement de studio de montage', categorie: 'Équipement', statut: 'en_attente_n2', niveauFinalRequis: 2, soumisPar: 'u-n5c', valideN4Par: 'u-n4', valideN4Le: isoIn(-60), valideN3Par: 'u-n3', valideN3Le: isoIn(-40) }),
  dep({ id: 'dep-5', territoireId: 'com-douala1', montant: 2_600_000, description: 'Camion de régie mobile', categorie: 'Transport', statut: 'en_attente_n1', niveauFinalRequis: 1, soumisPar: 'u-n5d', valideN4Par: 'u-n4', valideN4Le: isoIn(-100), valideN3Par: 'u-n3', valideN3Le: isoIn(-90), valideN2Par: 'u-n2', valideN2Le: isoIn(-50) }),
  dep({ id: 'dep-6', territoireId: 'com-obala', montant: 60_000, description: 'Restauration des participants', categorie: 'Logistique', statut: 'validee', niveauFinalRequis: 4, valideN4Par: 'u-n4', valideN4Le: isoIn(-200) }),
  dep({ id: 'dep-7', territoireId: 'com-bafoussam1', montant: 150_000, description: 'Transport des encadreurs', categorie: 'Transport', statut: 'rejetee', niveauFinalRequis: 3, soumisPar: 'u-n5e', rejetePar: 'u-n4', rejeteLe: isoIn(-80), motifRejet: 'Justificatif manquant' }),
  dep({ id: 'dep-8', territoireId: 'com-obala', montant: 30_000, description: 'Impressions de supports', categorie: 'Fournitures', statut: 'rejetee', niveauFinalRequis: 4, rejetePar: 'u-n4', rejeteLe: isoIn(-150), motifRejet: 'Montant non conforme au devis' }),
  dep({ id: 'dep-9', territoireId: 'com-monatele', montant: 1_200_000, description: 'Groupe électrogène', categorie: 'Équipement', statut: 'validee', niveauFinalRequis: 2, soumisPar: 'u-n5b', valideN4Par: 'u-n4', valideN4Le: isoIn(-400), valideN3Par: 'u-n3', valideN3Le: isoIn(-380), valideN2Par: 'u-n2', valideN2Le: isoIn(-360) }),
];

// ==================== COMPTES DÉMO / RBAC ====================

const FIN_READ = ['budget:read', 'subvention:read'];
const FIN_WRITE = ['budget:read', 'budget:write', 'subvention:read', 'subvention:write', 'partenaire_financier:read', 'partenaire_financier:write'];
const COMM_N1 = ['notification:diffuser', 'circulaire:read', 'circulaire:write', 'reunion:read', 'ressource_bibliotheque:read'];
const COMM_OTHERS = ['circulaire:read', 'reunion:read', 'reunion:write', 'ressource_bibliotheque:read'];
const MAT_ALL = ['materiel:read', 'materiel:write', 'affectation_materiel:read', 'affectation_materiel:write', 'maintenance_materiel:read', 'maintenance_materiel:write'];
const MAT_READ = ['materiel:read', 'affectation_materiel:read', 'maintenance_materiel:read'];
const MAT_FIELD = ['materiel:read', 'affectation_materiel:read', 'affectation_materiel:write', 'maintenance_materiel:read', 'maintenance_materiel:write'];
const PROD_N1 = ['production:read', 'production:publier', 'recompense:read'];
const PROD_READ = ['production:read', 'recompense:read'];
const PROD_N5 = ['production:read', 'production:write', 'recompense:read', 'recompense:write'];
const RAP_USER = ['rapport_template:read', 'rapport:read', 'rapport:generer'];
const FORM_WRITE = ['session:write', 'presence:write', 'resultat:write', 'attestation:write', 'apprenant:write', 'encadreur:write'];
const READ_COMMON = ['pilotage:read', 'territoire:read', 'apprenant:read', 'encadreur:read', 'session:read', 'presence:read', 'resultat:read', 'attestation:read'];

export const ROLE_PERMISSIONS: Record<string, string[]> = {
  ADMINISTRATEUR_SYSTEME: [
    ...READ_COMMON, 'audit:read', 'utilisateur:read', 'role:read', 'permission:override', 'incident:read', 'incident:write',
    'parametre:read', 'parametre:write', 'feature_flag:read', 'feature_flag:write', 'maintenance:read', 'maintenance:write',
    'integration:read', 'integration:write', 'sauvegarde:read', 'sauvegarde:trigger', 'site.content.manage', 'candidature:read', 'contact:read',
    'notification:diffuser', 'corps_metier:read', 'filiere:read', 'filiere:write', 'rapport_template:read', 'rapport_template:write', 'rapport:read', 'rapport:generer',
  ],
  N1_COMITE_CENTRAL: [...READ_COMMON, 'audit:read', 'utilisateur:read', 'role:read', 'permission:override', 'incident:read', 'site.content.manage', 'candidature:read', 'contact:read', 'depense:read', 'depense:valider_n1', ...FIN_WRITE, ...COMM_N1, ...MAT_ALL, 'import:read', 'import:write', 'corps_metier:read', 'filiere:read', 'filiere:write', ...PROD_N1, ...RAP_USER, 'rapport_template:write'],
  N2_COORDINATION_REG: [...READ_COMMON, 'incident:read', 'incident:write', 'depense:read', 'depense:valider_n2', ...FIN_READ, ...COMM_OTHERS, ...MAT_READ, ...PROD_READ, ...RAP_USER],
  N3_COORDINATION_DEPT: [...READ_COMMON, 'incident:read', 'incident:write', 'depense:read', 'depense:valider_n3', ...FIN_READ, ...COMM_OTHERS, ...MAT_READ, ...PROD_READ, ...RAP_USER],
  N4_COORDINATION_ARR: [...READ_COMMON, 'depense:read', 'depense:valider_n4', ...FIN_READ, ...COMM_OTHERS, ...MAT_FIELD, ...PROD_READ, ...RAP_USER, ...FORM_WRITE],
  N5_COMMUNE: [...READ_COMMON, 'depense:soumettre', 'budget:read', ...COMM_OTHERS, ...MAT_FIELD, ...PROD_N5, ...RAP_USER, ...FORM_WRITE],
  ENCADREUR: [...READ_COMMON, 'depense:soumettre'],
  APPRENANT: ['pilotage:read'],
};

export interface DemoAccount {
  key: string; label: string; id: string; nom: string; email: string;
  roleCode: string; niveau: number; territoireId: string | null;
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  { key: 'admin', label: 'Admin technique (N0)', id: 'u-admin', nom: 'Aristide Nkeng', email: 'admin@kct.demo', roleCode: 'ADMINISTRATEUR_SYSTEME', niveau: 0, territoireId: null },
  { key: 'n1', label: 'Comité Central (N1)', id: 'u-n1', nom: 'Solange Ebode', email: 'n1@kct.demo', roleCode: 'N1_COMITE_CENTRAL', niveau: 1, territoireId: 'nat' },
  { key: 'n2', label: 'Région Centre (N2)', id: 'u-n2', nom: 'Alain Mvondo', email: 'n2@kct.demo', roleCode: 'N2_COORDINATION_REG', niveau: 2, territoireId: 'reg-centre' },
  { key: 'n3', label: 'Département Lékié (N3)', id: 'u-n3', nom: 'Carine Owona', email: 'n3@kct.demo', roleCode: 'N3_COORDINATION_DEPT', niveau: 3, territoireId: 'dep-lekie' },
  { key: 'n4', label: 'Arrondissement Obala (N4)', id: 'u-n4', nom: 'Serge Atangana', email: 'n4@kct.demo', roleCode: 'N4_COORDINATION_ARR', niveau: 4, territoireId: 'arr-obala' },
  { key: 'n5', label: 'Commune Obala (N5)', id: 'u-n5', nom: 'Estelle Ngono', email: 'n5@kct.demo', roleCode: 'N5_COMMUNE', niveau: 5, territoireId: 'com-obala' },
];

export function loginResponseFor(a: DemoAccount): LoginResponse {
  return {
    accessToken: `demo-token-${a.key}`, refreshToken: `demo-refresh-${a.key}`, tokenType: 'Bearer',
    userId: a.id, nom: a.nom, email: a.email, roleCode: a.roleCode, niveau: a.niveau,
    territoireId: a.territoireId, permissions: ROLE_PERMISSIONS[a.roleCode] ?? [], mustChangePassword: false,
  };
}

export const utilisateurs: UtilisateurDto[] = [
  ...DEMO_ACCOUNTS.map((a) => ({ id: a.id, nom: a.nom, email: a.email, telephone: '677 00 00 0' + a.niveau, actif: true, roleCode: a.roleCode, niveau: a.niveau, territoireId: a.territoireId ?? '' })),
  { id: 'u-enc1', nom: 'Boris Tchouamou', email: 'boris@kct.demo', telephone: '655 11 22 33', actif: true, roleCode: 'ENCADREUR', niveau: 6, territoireId: 'com-douala1' },
  { id: 'u-enc2', nom: 'Nadège Kamga', email: 'nadege@kct.demo', telephone: '699 44 55 66', actif: true, roleCode: 'ENCADREUR', niveau: 6, territoireId: 'com-obala' },
  { id: 'u-enc3', nom: 'Landry Fotso', email: 'landry@kct.demo', telephone: '670 77 88 99', actif: false, roleCode: 'ENCADREUR', niveau: 6, territoireId: 'com-monatele' },
];

export const roles: RoleDto[] = [
  { id: 'r-ADMINISTRATEUR_SYSTEME', code: 'ADMINISTRATEUR_SYSTEME', libelle: 'Administrateur système', niveauHierarchique: 0 },
  { id: 'r-N1_COMITE_CENTRAL', code: 'N1_COMITE_CENTRAL', libelle: 'Comité Central National', niveauHierarchique: 1 },
  { id: 'r-N2_COORDINATION_REG', code: 'N2_COORDINATION_REG', libelle: 'Coordination Régionale', niveauHierarchique: 2 },
  { id: 'r-N3_COORDINATION_DEPT', code: 'N3_COORDINATION_DEPT', libelle: 'Coordination Départementale', niveauHierarchique: 3 },
  { id: 'r-N4_COORDINATION_ARR', code: 'N4_COORDINATION_ARR', libelle: "Coordination d'Arrondissement", niveauHierarchique: 4 },
  { id: 'r-N5_COMMUNE', code: 'N5_COMMUNE', libelle: 'Coordination Communale', niveauHierarchique: 5 },
  { id: 'r-ENCADREUR', code: 'ENCADREUR', libelle: 'Encadreur', niveauHierarchique: 6 },
];

export const permissions: PermissionDto[] = Array.from(new Set(Object.values(ROLE_PERMISSIONS).flat()))
  .concat(['depense:valider_n3', 'depense:valider_n4', 'depense:valider_n2', 'depense:valider_n1'])
  .filter((c, i, arr) => arr.indexOf(c) === i)
  .sort()
  .map((code) => ({ id: `p-${code}`, code, libelle: code.replace(/[:._]/g, ' ') }));

/** Permissions déléguées individuellement (user_permission_override) — un N5 a déjà reçu site.content.manage. */
export const overrides: Record<string, string[]> = { 'u-n5': ['site.content.manage'] };

// ==================== ADMINISTRATION ====================

export const parametres: ParametreSysteme[] = [
  { id: 'par-1', cle: 'budget.seuil_validation_n3', valeur: '100000', type: 'number', description: 'Montant (XAF) au-delà duquel N3 doit valider' },
  { id: 'par-2', cle: 'budget.seuil_validation_n2', valeur: '500000', type: 'number', description: 'Montant (XAF) au-delà duquel N2 doit valider' },
  { id: 'par-3', cle: 'budget.seuil_validation_n1', valeur: '2000000', type: 'number', description: 'Montant (XAF) au-delà duquel N1 doit valider' },
  { id: 'par-4', cle: 'incident.gravite_escalade_n1', valeur: 'critique', type: 'string', description: 'Gravité minimale déclenchant une alerte immédiate au Comité Central' },
  { id: 'par-5', cle: 'maintenance.fenetre_prealerte_heures_defaut', valeur: '24', type: 'number', description: 'Heures avant maintenance planifiée pour afficher la bannière' },
  { id: 'par-6', cle: 'auth.otp_duree_minutes', valeur: '10', type: 'number', description: 'Durée de validité d\'un code OTP' },
  { id: 'par-8', cle: 'formation.seuil_reussite', valeur: '10', type: 'number', description: 'Note minimale (sur 20) pour réussir un examen' },
  { id: 'par-7', cle: 'sync.intervalle_minutes', valeur: '15', type: 'number', description: 'Fréquence de synchronisation mobile' },
];

export const featureFlags: FeatureFlag[] = [
  { id: 'ff-1', code: 'chatbot_ia', libelle: 'Chatbot IA (assistant apprenant)', actif: true, versionCible: '1.0', territoireId: null },
  { id: 'ff-2', code: 'push_fcm', libelle: 'Notifications push mobile (FCM)', actif: false, versionCible: '1.1', territoireId: null },
  { id: 'ff-3', code: 'rapports_auto', libelle: 'Rapports automatiques mensuels', actif: true, versionCible: '1.0', territoireId: null },
  { id: 'ff-4', code: 'carte_geojson', libelle: 'Carte GeoJSON du Cameroun', actif: false, versionCible: '1.2', territoireId: null },
];

export const maintenance: ModeMaintenance[] = [
  { id: 'mnt-1', serviceCode: 'GLOBAL', statut: 'PLANIFIEE', message: 'Maintenance planifiée : mise à jour de la plateforme, brève interruption de la synchronisation.', dateDebutPrevue: isoIn(5), fenetrePrealerteHeures: 24, dateFinPrevue: isoIn(7), activePar: 'u-admin', dateActivation: null, dateDesactivation: null },
  { id: 'mnt-2', serviceCode: 'SYNC_API', statut: 'TERMINEE', message: 'Correctif de synchronisation appliqué.', dateDebutPrevue: null, fenetrePrealerteHeures: null, dateFinPrevue: null, activePar: 'u-admin', dateActivation: isoIn(-200), dateDesactivation: isoIn(-198) },
];

export const integrations: IntegrationExterne[] = [
  { id: 'int-1', code: 'sms_orange', config: { expediteur: 'KCT', apiUrl: 'https://api.orange.example/sms', quotaJournalier: 500 }, actif: true, derniereVerification: isoIn(-3) },
  { id: 'int-2', code: 'email_smtp', config: { hote: 'smtp.example.org', port: 587 }, actif: false, derniereVerification: null },
  { id: 'int-3', code: 'fcm', config: {}, actif: false, derniereVerification: null },
];

export const sauvegardes: Sauvegarde[] = [
  { id: 'sav-1', dateDeclenchement: isoIn(-6), type: 'automatique', statut: 'succes', tailleMo: 412.6, dateTestRestauration: null, declenchePar: null },
  { id: 'sav-2', dateDeclenchement: isoIn(-30), type: 'automatique', statut: 'succes', tailleMo: 410.2, dateTestRestauration: null, declenchePar: null },
  { id: 'sav-3', dateDeclenchement: isoIn(-80), type: 'manuel', statut: 'succes', tailleMo: 405.9, dateTestRestauration: isoIn(-60), declenchePar: 'u-admin' },
  { id: 'sav-4', dateDeclenchement: isoIn(-104), type: 'automatique', statut: 'echec', tailleMo: null, dateTestRestauration: null, declenchePar: null },
];

const actions: Array<[string, string, string]> = [
  ['login', 'session', 'u-n1'], ['create', 'apprenant', 'app-com-obala-3'], ['valider_n4', 'depense', 'dep-6'],
  ['set_statut_planifiee', 'mode_maintenance', 'mnt-1'], ['grant_override', 'user_permission_override', 'u-n5'],
  ['create', 'incident', 'inc-1'], ['update', 'incident', 'inc-2'], ['trigger', 'sauvegarde', 'sav-3'],
  ['rejeter', 'depense', 'dep-8'], ['create', 'session_formation', 'ses-com-obala-0'], ['toggle', 'feature_flag', 'ff-1'],
  ['soumettre', 'depense', 'dep-1'], ['update', 'parametre', 'par-3'], ['login', 'session', 'u-n2'],
];
export const auditLog: AuditLogEntry[] = actions.map(([action, entiteType, entiteId], i) => ({
  id: `aud-${i}`, utilisateurId: ['u-admin', 'u-n1', 'u-n4', 'u-n5'][i % 4], action, entiteType, entiteId,
  date: isoIn(-i * 7 - 1), details: null,
}));

export const notifications: NotificationItem[] = [
  { id: 'not-1', templateId: null, canal: 'in_app', contenuFinal: '[CRITIQUE] Serveur de synchronisation injoignable à Douala 1er', statut: 'envoyee', dateEnvoi: isoIn(-5), dateLecture: null },
  { id: 'not-2', templateId: null, canal: 'in_app', contenuFinal: 'Une dépense de 78 000 XAF attend votre validation', statut: 'envoyee', dateEnvoi: isoIn(-26), dateLecture: null },
  { id: 'not-3', templateId: null, canal: 'in_app', contenuFinal: 'La session « Initiation à la réalisation » à Monatélé est clôturée', statut: 'lue', dateEnvoi: isoIn(-90), dateLecture: isoIn(-88) },
];

// ==================== SITE PUBLIC ====================

export const actualites: ActualitePublique[] = [
  { id: 'act-1', titre: 'Lancement officiel de KCT à Obala le 24 octobre', contenu: 'La Place des Fêtes d\'Obala accueillera le lancement officiel du programme.', imageUrl: null, datePublication: isoIn(-48), statut: 'publiee' },
  { id: 'act-2', titre: 'Ouverture des inscriptions — session de novembre', contenu: 'Les candidatures sont ouvertes dans 8 communes pilotes.', imageUrl: null, datePublication: isoIn(-120), statut: 'publiee' },
  { id: 'act-3', titre: 'Nouveaux partenaires du programme', contenu: 'Trois partenaires rejoignent l\'aventure KCT.', imageUrl: null, datePublication: isoIn(-10), statut: 'brouillon' },
  { id: 'act-4', titre: 'Retour sur la première cohorte de Monatélé', contenu: '62 apprenants formés, 3 courts-métrages produits.', imageUrl: null, datePublication: isoIn(-300), statut: 'publiee' },
];

export const faq: FaqItem[] = [
  { id: 'faq-1', question: 'Qui peut candidater à KCT ?', reponse: 'Tout jeune camerounais motivé par le cinéma, sans prérequis de diplôme.', categorie: 'Candidature', ordre: 1, actif: true },
  { id: 'faq-2', question: 'La formation est-elle gratuite ?', reponse: 'Oui, la formation est prise en charge par le programme.', categorie: 'Formation', ordre: 2, actif: true },
  { id: 'faq-3', question: 'Où se déroulent les sessions ?', reponse: 'Dans les centres KCT de chaque commune partenaire.', categorie: 'Formation', ordre: 3, actif: true },
  { id: 'faq-4', question: 'Faut-il du matériel personnel ?', reponse: 'Non, le matériel est fourni sur place.', categorie: 'Matériel', ordre: 4, actif: true },
  { id: 'faq-5', question: 'Comment obtenir mon attestation ?', reponse: 'Elle est délivrée à la clôture de la session après l\'examen final.', categorie: 'Attestation', ordre: 5, actif: false },
];

export const equipe: MembreEquipe[] = [
  { id: 'eq-1', nom: 'Solange Ebode', poste: 'Coordinatrice nationale', photoUrl: null, bio: 'Pilote le Comité Central.', ordre: 1 },
  { id: 'eq-2', nom: 'Alain Mvondo', poste: 'Responsable région Centre', photoUrl: null, bio: null, ordre: 2 },
  { id: 'eq-3', nom: 'Estelle Ngono', poste: 'Coordinatrice communale d\'Obala', photoUrl: null, bio: null, ordre: 3 },
  { id: 'eq-4', nom: 'Aristide Nkeng', poste: 'Administrateur technique', photoUrl: null, bio: 'Plateforme, sécurité et sauvegardes.', ordre: 4 },
];

export const partenaires: Partenaire[] = [
  { id: 'par-a', nom: 'Ministère des Arts et de la Culture', logoUrl: null, siteWeb: 'https://example.org/minac', ordre: 1 },
  { id: 'par-b', nom: 'Orange Cameroun', logoUrl: null, siteWeb: 'https://example.org/orange', ordre: 2 },
  { id: 'par-c', nom: 'Commune d\'Obala', logoUrl: null, siteWeb: null, ordre: 3 },
  { id: 'par-d', nom: 'Institut Français du Cameroun', logoUrl: null, siteWeb: 'https://example.org/ifc', ordre: 4 },
];

export const evenements: Evenement[] = [
  { id: 'ev-1', titre: 'Lancement officiel KCT', description: 'Cérémonie de lancement du programme.', type: 'lancement', dateDebut: '2026-10-24T09:00:00Z', dateFin: '2026-10-24T17:00:00Z', lieu: 'Place des Fêtes d\'Obala', adresse: 'Obala, Lékié', communeId: 'com-obala', imageUrl: null, capacite: 1500, statut: 'a_venir' },
  { id: 'ev-2', titre: 'Projection des courts-métrages de Monatélé', description: null, type: 'projection', dateDebut: '2026-11-14T18:00:00Z', dateFin: null, lieu: 'Salle polyvalente', adresse: 'Monatélé', communeId: 'com-monatele', imageUrl: null, capacite: 300, statut: 'a_venir' },
  { id: 'ev-3', titre: 'Atelier de découverte — Yaoundé 1er', description: 'Atelier ouvert au public.', type: 'atelier', dateDebut: '2026-08-02T10:00:00Z', dateFin: null, lieu: 'Centre KCT', adresse: null, communeId: 'com-yde1', imageUrl: null, capacite: 80, statut: 'termine' },
];

export const candidatures: CandidaturePublique[] = [
  { id: 'cand-1', nom: 'Mbarga', prenom: 'Christelle', email: 'christelle@example.org', telephone: '677 12 12 12', motivation: 'Passionnée de cinéma depuis toujours.', statut: 'en_attente', dateSoumission: isoIn(-20), dateTraitement: null, communeId: 'com-obala', traitePar: null },
  { id: 'cand-2', nom: 'Njoya', prenom: 'Ibrahim', email: 'ibrahim@example.org', telephone: null, motivation: 'Je veux raconter les histoires de mon quartier.', statut: 'en_attente', dateSoumission: isoIn(-44), dateTraitement: null, communeId: 'com-douala1', traitePar: null },
  { id: 'cand-3', nom: 'Bella', prenom: 'Sylvie', email: 'sylvie@example.org', telephone: '699 33 33 33', motivation: null, statut: 'acceptee', dateSoumission: isoIn(-200), dateTraitement: isoIn(-190), communeId: 'com-monatele', traitePar: 'u-n1' },
  { id: 'cand-4', nom: 'Etoundi', prenom: 'Marc', email: 'marc@example.org', telephone: null, motivation: 'Candidature hors zone.', statut: 'refusee', dateSoumission: isoIn(-260), dateTraitement: isoIn(-250), communeId: null, traitePar: 'u-n1' },
];

export const contacts: ContactMessage[] = [
  { id: 'msg-1', nom: 'Fabrice T.', email: 'fabrice@example.org', sujet: 'Partenariat média', message: 'Nous souhaiterions couvrir le lancement du 24 octobre.', statut: 'non_traite', dateReception: isoIn(-8), dateTraitement: null },
  { id: 'msg-2', nom: 'Aïcha B.', email: 'aicha@example.org', sujet: 'Inscription tardive', message: 'Est-il encore possible de candidater à Garoua ?', statut: 'non_traite', dateReception: isoIn(-30), dateTraitement: null },
  { id: 'msg-3', nom: 'Directeur du lycée de Obala', email: 'lycee@example.org', sujet: 'Visite du centre', message: 'Peut-on organiser une visite pour nos élèves ?', statut: 'traite', dateReception: isoIn(-150), dateTraitement: isoIn(-140) },
];

// ==================== FINANCES ====================


export const budgetsBase: Array<{ id: string; territoireId: string; exercice: string; montantAlloue: number }> = [
  { id: 'bud-1', territoireId: 'com-obala', exercice: '2026', montantAlloue: 1_500_000 },
  { id: 'bud-2', territoireId: 'com-monatele', exercice: '2026', montantAlloue: 2_500_000 },
  { id: 'bud-3', territoireId: 'com-yde1', exercice: '2026', montantAlloue: 3_000_000 },
  { id: 'bud-4', territoireId: 'com-yde2', exercice: '2026', montantAlloue: 2_800_000 },
  { id: 'bud-5', territoireId: 'com-douala1', exercice: '2026', montantAlloue: 3_200_000 },
  { id: 'bud-6', territoireId: 'com-bafoussam1', exercice: '2026', montantAlloue: 2_000_000 },
  { id: 'bud-7', territoireId: 'com-garoua1', exercice: '2026', montantAlloue: 1_200_000 },
];

export const partenairesFinanciers: PartenaireFinancier[] = [
  { id: 'pf-1', nom: 'Ministère des Arts et de la Culture', type: 'ministere', contactEmail: 'contact@minac.example', contactTelephone: null, actif: true },
  { id: 'pf-2', nom: 'Fondation Horizon', type: 'bailleur', contactEmail: 'info@horizon.example', contactTelephone: '222 00 11 22', actif: true },
  { id: 'pf-3', nom: 'ONG Image et Jeunesse', type: 'ong', contactEmail: null, contactTelephone: '699 88 77 66', actif: true },
  { id: 'pf-4', nom: 'Banque Régionale (mécénat)', type: 'prive', contactEmail: 'mecenat@banque.example', contactTelephone: null, actif: false },
];

export const subventions: Subvention[] = [
  { id: 'sub-1', partenaireId: 'pf-1', territoireId: null, montant: 25_000_000, dateReception: '2026-02-10', type: 'subvention', statut: 'recue', enregistrePar: 'u-n1' },
  { id: 'sub-2', partenaireId: 'pf-2', territoireId: 'reg-centre', montant: 8_000_000, dateReception: '2026-04-22', type: 'subvention', statut: 'recue', enregistrePar: 'u-n1' },
  { id: 'sub-3', partenaireId: 'pf-3', territoireId: 'com-obala', montant: 500_000, dateReception: '2026-06-05', type: 'don', statut: 'recue', enregistrePar: 'u-n1' },
  { id: 'sub-4', partenaireId: 'pf-2', territoireId: null, montant: 12_000_000, dateReception: '2026-09-01', type: 'subvention', statut: 'promise', enregistrePar: 'u-n1' },
];

export const justificatifs: Justificatif[] = [
  { id: 'jus-1', depenseId: 'dep-2', fichierCle: 'demo/facture-cables.pdf', typeDocument: 'facture', dateUpload: isoIn(-25) },
  { id: 'jus-2', depenseId: 'dep-3', fichierCle: 'demo/devis-cameras.pdf', typeDocument: 'bon_commande', dateUpload: isoIn(-70) },
];
// ==================== COMMUNICATION ====================


export const diffusions: Diffusion[] = [
  { id: 'dif-1', emisPar: 'u-n1', titre: 'Rappel : lancement officiel le 24 octobre', corps: 'Tous les coordinateurs sont attendus à Obala dès le 23 octobre. Merci de confirmer votre présence.', canal: 'tous', cibleType: 'global', cibleNiveau: null, cibleTerritoireId: null, cibleUtilisateurId: null, nbDestinataires: 214, statut: 'terminee', dateCreation: isoIn(-40), dateCompletion: isoIn(-39) },
  { id: 'dif-2', emisPar: 'u-n1', titre: 'Clôture des budgets communaux', corps: 'Merci de soumettre vos dépenses avant le 30 du mois.', canal: 'in_app', cibleType: 'niveau', cibleNiveau: 5, cibleTerritoireId: null, cibleUtilisateurId: null, nbDestinataires: 9, statut: 'terminee', dateCreation: isoIn(-120), dateCompletion: isoIn(-120) },
  { id: 'dif-3', emisPar: 'u-n1', titre: 'Session de formation région Centre', corps: 'Nouveau calendrier des sessions pour la région Centre.', canal: 'sms', cibleType: 'territoire', cibleNiveau: null, cibleTerritoireId: 'reg-centre', cibleUtilisateurId: null, nbDestinataires: 37, statut: 'en_cours', dateCreation: isoIn(-1), dateCompletion: null },
];

export const circulaires: Circulaire[] = [
  { id: 'cir-1', titre: 'Circulaire n°1 — Organisation du lancement', contenu: 'Le lancement officiel du programme KCT aura lieu le 24 octobre 2026 à la Place des Fêtes d\'Obala.\nChaque coordination régionale mobilisera une délégation.', cibleType: 'global', cibleNiveau: null, cibleTerritoireId: null, cibleUtilisateurId: null, auteurId: 'u-n1', fichierJointUrl: 'demo/programme-lancement.pdf', datePublication: isoIn(-72), statut: 'publiee' },
  { id: 'cir-2', titre: 'Circulaire n°2 — Règles de validation des dépenses', contenu: 'Rappel des seuils de validation budgétaire et des justificatifs obligatoires.', cibleType: 'niveau', cibleNiveau: 5, cibleTerritoireId: null, cibleUtilisateurId: null, auteurId: 'u-n1', fichierJointUrl: null, datePublication: isoIn(-30), statut: 'publiee' },
  { id: 'cir-3', titre: 'Projet — Charte des encadreurs', contenu: 'Version de travail de la charte des encadreurs, à valider avant diffusion.', cibleType: 'niveau', cibleNiveau: 6, cibleTerritoireId: null, cibleUtilisateurId: null, auteurId: 'u-n1', fichierJointUrl: null, datePublication: null, statut: 'brouillon' },
];

export const reunions: Reunion[] = [
  { id: 'reu-1', titre: 'Point hebdomadaire des coordinations', type: 'visio', dateDebut: isoIn(20), dateFin: isoIn(21), lienVisio: 'https://meet.jit.si/kct-point-hebdo', organisateurId: 'u-n1', cibleType: 'niveau', cibleNiveau: 2, cibleTerritoireId: null, cibleUtilisateurId: null },
  { id: 'reu-2', titre: 'Préparation logistique — Obala', type: 'presentiel', dateDebut: isoIn(96), dateFin: isoIn(99), lienVisio: null, organisateurId: 'u-n4', cibleType: 'territoire', cibleNiveau: null, cibleTerritoireId: 'arr-obala', cibleUtilisateurId: null },
  { id: 'reu-3', titre: 'Bilan de la cohorte de Monatélé', type: 'visio', dateDebut: isoIn(-200), dateFin: isoIn(-198), lienVisio: 'https://meet.jit.si/kct-bilan', organisateurId: 'u-n3', cibleType: 'territoire', cibleNiveau: null, cibleTerritoireId: 'dep-lekie', cibleUtilisateurId: null },
];

export const participants: ReunionParticipant[] = [
  { id: 'par-r1', reunionId: 'reu-1', utilisateurId: 'u-n2', statutPresence: 'invite' },
  { id: 'par-r2', reunionId: 'reu-1', utilisateurId: 'u-n1', statutPresence: 'present' },
  { id: 'par-r3', reunionId: 'reu-2', utilisateurId: 'u-n4', statutPresence: 'present' },
  { id: 'par-r4', reunionId: 'reu-2', utilisateurId: 'u-n5', statutPresence: 'invite' },
  { id: 'par-r5', reunionId: 'reu-3', utilisateurId: 'u-n3', statutPresence: 'present' },
];

export const ressources: RessourceBibliotheque[] = [
  { id: 'res-1', titre: 'Introduction à la réalisation', type: 'cours_video', fichierUrl: 'https://example.org/cours-realisation', categorie: 'Formation', niveauAccesRoleId: null, dateAjout: isoIn(-500) },
  { id: 'res-2', titre: 'Règlement intérieur KCT', type: 'reglement', fichierUrl: 'demo/reglement.pdf', categorie: 'Administratif', niveauAccesRoleId: null, dateAjout: isoIn(-800) },
  { id: 'res-3', titre: 'Guide du coordinateur communal', type: 'guide', fichierUrl: 'demo/guide-n5.pdf', categorie: 'Administratif', niveauAccesRoleId: 'r-N5_COMMUNE', dateAjout: isoIn(-300) },
  { id: 'res-4', titre: 'Modèle de contrat d\'encadreur', type: 'contrat', fichierUrl: 'demo/contrat-encadreur.pdf', categorie: 'Administratif', niveauAccesRoleId: null, dateAjout: isoIn(-260) },
  { id: 'res-5', titre: 'Fiches de cours — Prise de vue', type: 'support', fichierUrl: 'demo/fiches-prise-de-vue.pdf', categorie: 'Formation', niveauAccesRoleId: null, dateAjout: isoIn(-120) },
];
// ==================== MATÉRIEL ====================

export const typesMateriel: TypeMateriel[] = [
  { id: 'tm-1', code: 'camera', libelle: 'Caméra' },
  { id: 'tm-2', code: 'trepied', libelle: 'Trépied' },
  { id: 'tm-3', code: 'micro', libelle: 'Microphone' },
  { id: 'tm-4', code: 'eclairage', libelle: 'Éclairage' },
  { id: 'tm-5', code: 'ordinateur', libelle: 'Poste de montage' },
];

export const corpsMetier = [
  { id: 'cm-1', code: 'realisation', nom: 'Réalisation et mise en scène', numero: 1 },
  { id: 'cm-2', code: 'image', nom: 'Image et photographie', numero: 2 },
  { id: 'cm-3', code: 'son', nom: 'Son et musique', numero: 3 },
  { id: 'cm-4', code: 'montage', nom: 'Montage et post-production', numero: 4 },
  { id: 'cm-5', code: 'ecriture', nom: 'Écriture et scénario', numero: 5 },
  { id: 'cm-6', code: 'jeu', nom: "Jeu d'acteur", numero: 6 },
  { id: 'cm-7', code: 'production', nom: 'Production et régie', numero: 7 },
];

export const filieres: Array<{ id: string; corpsMetierId: string; slug: string; nom: string; statut: 'ACTIVE' | 'A_VENIR' }> = [
  { id: 'fi-1', corpsMetierId: 'cm-1', slug: 'realisation-fiction', nom: 'Réalisation de fiction', statut: 'ACTIVE' },
  { id: 'fi-2', corpsMetierId: 'cm-1', slug: 'realisation-documentaire', nom: 'Réalisation documentaire', statut: 'A_VENIR' },
  { id: 'fi-3', corpsMetierId: 'cm-2', slug: 'prise-de-vue', nom: 'Prise de vue', statut: 'ACTIVE' },
  { id: 'fi-4', corpsMetierId: 'cm-2', slug: 'photographie-de-plateau', nom: 'Photographie de plateau', statut: 'A_VENIR' },
  { id: 'fi-5', corpsMetierId: 'cm-3', slug: 'prise-de-son', nom: 'Prise de son', statut: 'ACTIVE' },
  { id: 'fi-6', corpsMetierId: 'cm-3', slug: 'musique-de-film', nom: 'Musique de film', statut: 'A_VENIR' },
  { id: 'fi-7', corpsMetierId: 'cm-4', slug: 'montage-numerique', nom: 'Montage numérique', statut: 'ACTIVE' },
  { id: 'fi-8', corpsMetierId: 'cm-4', slug: 'etalonnage', nom: 'Étalonnage', statut: 'A_VENIR' },
  { id: 'fi-9', corpsMetierId: 'cm-5', slug: 'ecriture-de-scenario', nom: 'Écriture de scénario', statut: 'ACTIVE' },
  { id: 'fi-10', corpsMetierId: 'cm-6', slug: 'jeu-devant-la-camera', nom: 'Jeu devant la caméra', statut: 'ACTIVE' },
  { id: 'fi-11', corpsMetierId: 'cm-7', slug: 'regie-de-plateau', nom: 'Régie de plateau', statut: 'ACTIVE' },
  { id: 'fi-12', corpsMetierId: 'cm-7', slug: 'production-executive', nom: 'Production exécutive', statut: 'A_VENIR' },
];

export const materiels: Materiel[] = [
  { id: 'mat-1', typeMaterielId: 'tm-1', numeroSerie: 'CAM-2026-001', marque: 'Sony', modele: 'FX30', etat: 'bon', dateAcquisition: '2026-01-15', valeurAcquisition: 1_650_000 },
  { id: 'mat-2', typeMaterielId: 'tm-1', numeroSerie: 'CAM-2026-002', marque: 'Sony', modele: 'FX30', etat: 'hors_service', dateAcquisition: '2026-01-15', valeurAcquisition: 1_650_000 },
  { id: 'mat-3', typeMaterielId: 'tm-1', numeroSerie: 'CAM-2026-003', marque: 'Canon', modele: 'C70', etat: 'neuf', dateAcquisition: '2026-06-02', valeurAcquisition: 2_900_000 },
  { id: 'mat-4', typeMaterielId: 'tm-2', numeroSerie: 'TRP-2026-014', marque: 'Manfrotto', modele: '504X', etat: 'bon', dateAcquisition: '2026-02-20', valeurAcquisition: 320_000 },
  { id: 'mat-5', typeMaterielId: 'tm-2', numeroSerie: 'TRP-2026-015', marque: 'Manfrotto', modele: '504X', etat: 'use', dateAcquisition: '2025-11-10', valeurAcquisition: 320_000 },
  { id: 'mat-6', typeMaterielId: 'tm-3', numeroSerie: 'MIC-2026-007', marque: 'Rode', modele: 'NTG5', etat: 'bon', dateAcquisition: '2026-03-08', valeurAcquisition: 280_000 },
  { id: 'mat-7', typeMaterielId: 'tm-4', numeroSerie: 'ECL-2026-021', marque: 'Aputure', modele: '300D', etat: 'neuf', dateAcquisition: '2026-07-19', valeurAcquisition: 640_000 },
  { id: 'mat-8', typeMaterielId: 'tm-5', numeroSerie: 'PC-2026-003', marque: 'HP', modele: 'Z2 G9', etat: 'use', dateAcquisition: '2025-09-01', valeurAcquisition: 1_400_000 },
];

export const affectations: AffectationMateriel[] = [
  { id: 'aff-1', materielId: 'mat-1', territoireId: 'com-obala', responsableId: 'u-n5', dateAffectation: '2026-03-01', dateRetour: null, statut: 'en_cours' },
  { id: 'aff-2', materielId: 'mat-4', territoireId: 'com-obala', responsableId: 'u-n5', dateAffectation: '2026-03-01', dateRetour: null, statut: 'en_cours' },
  { id: 'aff-3', materielId: 'mat-2', territoireId: 'com-douala1', responsableId: 'u-enc1', dateAffectation: '2026-02-10', dateRetour: '2026-08-30', statut: 'termine' },
  { id: 'aff-4', materielId: 'mat-6', territoireId: 'com-monatele', responsableId: 'u-enc3', dateAffectation: '2026-04-05', dateRetour: null, statut: 'en_cours' },
  { id: 'aff-5', materielId: 'mat-3', territoireId: 'com-yde1', responsableId: 'u-n3', dateAffectation: '2026-06-10', dateRetour: null, statut: 'en_cours' },
];

export const maintenancesMateriel: MaintenanceMateriel[] = [
  { id: 'mnt-m1', materielId: 'mat-2', typeIntervention: 'corrective', description: 'Batterie gonflée, carte mère endommagée', dateIntervention: '2026-08-28', cout: 185_000, prestataire: 'AtelierVidéo Douala', prochaineMaintenance: null },
  { id: 'mnt-m2', materielId: 'mat-1', typeIntervention: 'preventive', description: 'Nettoyage capteur et mise à jour firmware', dateIntervention: '2026-07-15', cout: 25_000, prestataire: null, prochaineMaintenance: '2027-01-15' },
  { id: 'mnt-m3', materielId: 'mat-8', typeIntervention: 'preventive', description: 'Remplacement ventilateur', dateIntervention: '2026-05-04', cout: 45_000, prestataire: 'TechService', prochaineMaintenance: '2026-11-04' },
];
// ==================== PRODUCTIONS / RAPPORTS ====================

export const productions: Production[] = [
  { id: 'prod-1', territoireId: 'com-monatele', titre: 'Les Racines de Monatélé', type: 'court_metrage', description: 'Court-métrage sur la transmission entre générations, réalisé par la cohorte de Monatélé.', dateRealisation: '2026-07-12', fichierUrl: null, lienDiffusion: 'https://example.org/racines', statutPublic: 'visible_v4' },
  { id: 'prod-2', territoireId: 'com-yde1', titre: 'Carnet de Mfoundi', type: 'documentaire', description: 'Portrait de quartiers de Yaoundé.', dateRealisation: '2026-08-03', fichierUrl: null, lienDiffusion: null, statutPublic: 'prive' },
  { id: 'prod-3', territoireId: 'com-bafoussam1', titre: 'Le Marché des Hauts-Plateaux', type: 'court_metrage', description: null, dateRealisation: '2026-06-21', fichierUrl: null, lienDiffusion: null, statutPublic: 'visible_v4' },
  { id: 'prod-4', territoireId: 'com-obala', titre: 'Clip — Rythmes de la Lékié', type: 'clip', description: 'Clip musical tourné à Obala pendant la session de prise de vue.', dateRealisation: '2026-09-05', fichierUrl: null, lienDiffusion: null, statutPublic: 'prive' },
  { id: 'prod-5', territoireId: 'com-douala1', titre: 'Bande-annonce KCT 2026', type: 'bande_annonce', description: 'Bande-annonce du programme.', dateRealisation: '2026-09-10', fichierUrl: null, lienDiffusion: 'https://example.org/bande-annonce', statutPublic: 'prive' },
];

export const productionApprenants: ProductionApprenant[] = [
  { id: 'pa-1', productionId: 'prod-1', apprenantId: 'app-com-monatele-0', role: 'realisateur' },
  { id: 'pa-2', productionId: 'prod-1', apprenantId: 'app-com-monatele-1', role: 'acteur' },
  { id: 'pa-3', productionId: 'prod-1', apprenantId: 'app-com-monatele-2', role: 'technicien' },
  { id: 'pa-4', productionId: 'prod-4', apprenantId: 'app-com-obala-0', role: 'realisateur' },
];

export const recompenses: Recompense[] = [
  { id: 'rec-1', productionId: 'prod-1', nomFestival: 'Festival du court-métrage de Yaoundé', nomPrix: 'Prix du public', annee: 2026, niveau: 'national', dateObtention: '2026-09-15' },
];

export const rapportTemplates: RapportTemplate[] = [
  { id: 'rt-1', code: 'rapport_mensuel', nom: 'Rapport mensuel de périmètre', structure: { sections: ['effectifs', 'formation', 'budget'] }, actif: true },
  { id: 'rt-2', code: 'rapport_incidents', nom: 'Bilan des incidents', structure: { sections: ['incidents'] }, actif: true },
  { id: 'rt-3', code: 'rapport_ancien', nom: 'Ancien modèle trimestriel', structure: { sections: [] }, actif: false },
];

export const rapportsGeneres: RapportGenere[] = [
  { id: 'rg-1', templateId: 'rt-1', typePerimetre: 'communal', territoireId: 'com-obala', periodeDebut: '2026-08-01', periodeFin: '2026-08-31', format: 'pdf', fichierUrl: 'demo/rapport-obala-aout.pdf', dateGeneration: isoIn(-300), genereParId: 'u-n5', statut: 'genere' },
  { id: 'rg-2', templateId: 'rt-1', typePerimetre: 'communal', territoireId: 'com-obala', periodeDebut: '2026-07-01', periodeFin: '2026-07-31', format: 'excel', fichierUrl: 'demo/rapport-obala-juillet.xlsx', dateGeneration: isoIn(-1000), genereParId: 'u-n5', statut: 'genere' },
  { id: 'rg-3', templateId: 'rt-1', typePerimetre: 'regional', territoireId: 'reg-centre', periodeDebut: '2026-08-01', periodeFin: '2026-08-31', format: 'pdf', fichierUrl: 'demo/rapport-centre-aout.pdf', dateGeneration: isoIn(-280), genereParId: 'u-n2', statut: 'genere' },
];
export const importJobs: ImportJob[] = [
  { id: 'imp-1', typeEntite: 'apprenant', fichierSource: 'apprenants-obala-septembre.csv', statut: 'termine', nbLignesTraitees: 48, nbErreurs: 0, erreursDetail: [], utilisateurId: 'u-n1', date: isoIn(-200) },
  { id: 'imp-2', typeEntite: 'apprenant', fichierSource: 'apprenants-douala.csv', statut: 'termine_avec_erreurs', nbLignesTraitees: 97, nbErreurs: 3, erreursDetail: ['Ligne 14 : territoireCode inconnu « DLA9 »', 'Ligne 52 : nom manquant', 'Ligne 80 : hors du périmètre territorial de l\'émetteur'], utilisateurId: 'u-n1', date: isoIn(-90) },
];