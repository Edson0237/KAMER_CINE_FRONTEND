/**
 * MODE DÉMO TEMPORAIRE — faux backend : un adaptateur axios qui répond à
 * chaque endpoint utilisé par l'application avec des données fictives
 * (voir ./demoData). L'état vit en mémoire : les actions (valider une
 * dépense, traiter un incident, basculer un flag...) fonctionnent
 * jusqu'au rechargement de la page. Supprimer src/demo/ pour retirer.
 */
import { AxiosError, type AxiosAdapter, type InternalAxiosRequestConfig } from 'axios';
import type { Depense } from '@/modules/budget/types';
import type { Incident } from '@/modules/incident/types';
import type { ModeMaintenance } from '@/modules/admin/types';
import * as d from './demoData';

class DemoHttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

interface CurrentUser { id: string; niveau: number; territoireId: string | null; roleCode: string; nom: string; email: string | null }
type Body = Record<string, unknown>;
interface Ctx { m: RegExpMatchArray; params: Record<string, unknown>; body: Body; user: CurrentUser | null }
type Handler = (c: Ctx) => unknown;
type Route = [string, RegExp, Handler];

function currentUser(): CurrentUser | null {
  try {
    const raw = localStorage.getItem('kct_user');
    return raw ? (JSON.parse(raw) as CurrentUser) : null;
  } catch {
    return null;
  }
}

const scopeOf = (u: CurrentUser | null) => d.subtreeIds(u && u.niveau >= 1 ? u.territoireId : null);
const communesOf = (u: CurrentUser | null) => d.communes.filter((c) => scopeOf(u).has(c.id));
const str = (v: unknown) => (typeof v === 'string' ? v : '');
const num = (v: unknown, def: number) => (v === undefined || v === '' || Number.isNaN(Number(v)) ? def : Number(v));
const now = () => new Date().toISOString();
const uid = () => crypto.randomUUID();

function page<T>(items: T[], params: Record<string, unknown>) {
  const size = num(params.size, 20);
  const p = num(params.page, 0);
  return {
    content: items.slice(p * size, p * size + size),
    page: p, number: p, size,
    totalElements: items.length,
    totalPages: Math.max(1, Math.ceil(items.length / size)),
  };
}

function communesForList(params: Record<string, unknown>, u: CurrentUser | null) {
  const requested = str(params.territoireId) ? d.subtreeIds(str(params.territoireId)) : null;
  return communesOf(u).filter((c) => !requested || requested.has(c.id));
}

// ==================== INDICATEURS ====================

function countAncestors(communeIds: string[], niveau: number): number {
  const byId = new Map(d.territoires.map((t) => [t.id, t]));
  const found = new Set<string>();
  for (const id of communeIds) {
    let cur = byId.get(id);
    let guard = 0;
    while (cur && guard++ < 10) {
      if (cur.niveau === niveau) { found.add(cur.id); break; }
      cur = cur.parentId ? byId.get(cur.parentId) : undefined;
    }
  }
  return found.size;
}

/** Même règle que l'API : notes du périmètre comparées au paramètre formation.seuil_reussite (notes sur 20). */
function tauxReussite(apprenantIds: Set<string>): number {
  const seuilP = Number(d.parametres.find((p) => p.cle === 'formation.seuil_reussite')?.valeur ?? 10);
  const res = d.resultatsDemo.filter((r) => apprenantIds.has(r.apprenantId));
  return res.length ? Math.round((res.filter((r) => r.note >= seuilP).length * 100) / res.length) : 0;
}

function indicateurs(u: CurrentUser | null) {
  const cs = communesOf(u);
  const ids = new Set(cs.map((c) => c.id));
  const actives = cs.filter((c) => c.statutCommune === 'terminee' || c.statutCommune === 'en_cours').length;
  const avecActivite = cs.filter((c) => c.nombreSessions > 0).map((c) => c.id);
  const apprenants = cs.flatMap((c) => d.apprenantsOf(c.id));
  const totalSessions = cs.reduce((s, c) => s + c.nombreSessions, 0);
  const alloue = d.budgetsBase.filter((b) => ids.has(b.territoireId)).reduce((s, b) => s + b.montantAlloue, 0);
  const utilise = d.depenses.filter((x) => x.statut === 'validee' && ids.has(x.territoireId)).reduce((s, x) => s + x.montant, 0);
  return [
    { label: 'Communes actives', valeur: actives, unite: '' },
    { label: 'Centres ouverts', valeur: avecActivite.length, unite: '' },
    { label: 'Régions actives', valeur: countAncestors(avecActivite, 2), unite: '' },
    { label: 'Départements actifs', valeur: countAncestors(avecActivite, 3), unite: '' },
    { label: 'Apprenants', valeur: apprenants.length, unite: '' },
    { label: 'Apprenants (Hommes)', valeur: apprenants.filter((a) => a.sexe === 'M').length, unite: '' },
    { label: 'Apprenants (Femmes)', valeur: apprenants.filter((a) => a.sexe === 'F').length, unite: '' },
    { label: 'Encadreurs', valeur: cs.reduce((s, c) => s + c.nombreEncadreurs, 0), unite: '' },
    { label: 'Sessions', valeur: totalSessions, unite: '' },
    { label: 'Taux de réussite', valeur: tauxReussite(new Set(apprenants.map((a) => a.id))), unite: '%' },
    { label: 'Attestations émises', valeur: Math.floor(apprenants.length * 0.45), unite: '' },
    { label: 'Films produits', valeur: Math.round(totalSessions * 1.5), unite: '' },
    { label: 'Budget alloué', valeur: alloue, unite: 'XAF' },
    { label: 'Budget utilisé', valeur: utilise, unite: 'XAF' },
    { label: 'Budget restant', valeur: alloue - utilise, unite: 'XAF' },
  ];
}

// ==================== BUDGET / INCIDENTS ====================

const depensesOf = (u: CurrentUser | null) => {
  const ids = scopeOf(u);
  return d.depenses.filter((x) => ids.has(x.territoireId));
};
const incidentsOf = (u: CurrentUser | null) => {
  const ids = scopeOf(u);
  return d.incidents.filter((i) => !i.territoireId || ids.has(i.territoireId));
};

const ETAPES: Record<number, { attendu: string; suivant: string }> = {
  4: { attendu: 'soumise', suivant: 'en_attente_n3' },
  3: { attendu: 'en_attente_n3', suivant: 'en_attente_n2' },
  2: { attendu: 'en_attente_n2', suivant: 'en_attente_n1' },
  1: { attendu: 'en_attente_n1', suivant: 'validee' },
};

function findDepense(id: string): Depense {
  const x = d.depenses.find((e) => e.id === id);
  if (!x) throw new DemoHttpError(404, 'Dépense introuvable');
  return x;
}

function valider(id: string, niveau: number, u: CurrentUser | null): Depense {
  const x = findDepense(id);
  const etape = ETAPES[niveau];
  if (x.statut !== etape.attendu) throw new DemoHttpError(400, `Cette dépense n'est pas en attente à ce niveau (statut : ${x.statut})`);
  const par = u?.id ?? 'u-demo';
  const le = now();
  if (niveau === 4) { x.valideN4Par = par; x.valideN4Le = le; }
  if (niveau === 3) { x.valideN3Par = par; x.valideN3Le = le; }
  if (niveau === 2) { x.valideN2Par = par; x.valideN2Le = le; }
  if (niveau === 1) { x.valideN1Par = par; x.valideN1Le = le; }
  x.statut = (niveau <= x.niveauFinalRequis ? 'validee' : etape.suivant) as Depense['statut'];
  return x;
}

const importFin = new Map<string, number>();
const seuilReussite = () => seuil('formation.seuil_reussite', 10);

function seuil(cle: string, def: number) {
  const p = d.parametres.find((x) => x.cle === cle);
  return p ? Number(p.valeur) : def;
}

// ==================== MAINTENANCE ====================

function bannieres(): ModeMaintenance[] {
  const fenetreDefaut = seuil('maintenance.fenetre_prealerte_heures_defaut', 24);
  const t = Date.now();
  return d.maintenance.filter((m) => {
    if (m.statut === 'ACTIVE') return true;
    if (m.statut !== 'PLANIFIEE' || !m.dateDebutPrevue) return false;
    const fenetre = m.fenetrePrealerteHeures ?? fenetreDefaut;
    return t >= new Date(m.dateDebutPrevue).getTime() - fenetre * 3_600_000;
  });
}

// ==================== CRUD GÉNÉRIQUE (site public) ====================

function crud<T extends { id: string }>(segment: string, list: T[], defaults: () => Partial<T>): Route[] {
  const base = new RegExp(`^/ecosysteme/${segment}$`);
  const one = new RegExp(`^/ecosysteme/${segment}/([^/]+)$`);
  const find = (id: string) => {
    const item = list.find((x) => x.id === id);
    if (!item) throw new DemoHttpError(404, 'Élément introuvable');
    return item;
  };
  return [
    ['GET', base, () => list],
    ['POST', base, (c) => { const item = { id: uid(), ...defaults(), ...c.body } as unknown as T; list.unshift(item); return item; }],
    ['PUT', one, (c) => Object.assign(find(c.m[1]), c.body)],
    ['DELETE', one, (c) => { const i = list.indexOf(find(c.m[1])); list.splice(i, 1); return null; }],
  ];
}

// ==================== TABLE DE ROUTES ====================

const routes: Route[] = [
  // --- Auth ---
  ['POST', /^\/iam\/auth\/login$/, (c) => {
    const ident = str(c.body.identifiant).trim().toLowerCase();
    const acc = d.DEMO_ACCOUNTS.find((a) => a.key === ident || a.email === ident);
    if (!acc) throw new DemoHttpError(400, 'Identifiant inconnu — en démo : admin, n1, n2, n3, n4 ou n5');
    return d.loginResponseFor(acc);
  }],
  ['POST', /^\/iam\/auth\/verify-otp$/, () => d.loginResponseFor(d.DEMO_ACCOUNTS[1])],
  ['POST', /^\/iam\/auth\/mot-de-passe-oublie$/, () => null],
  ['POST', /^\/iam\/auth\/verifier-code-reinitialisation$/, () => ({ resetToken: 'demo-reset', expiresInMinutes: 10 })],
  ['POST', /^\/iam\/auth\/changer-mot-de-passe$/, () => null],
  ['POST', /^\/iam\/auth\/refresh$/, (c) => d.loginResponseFor(d.DEMO_ACCOUNTS.find((a) => a.id === c.user?.id) ?? d.DEMO_ACCOUNTS[1])],
  ['POST', /^\/iam\/auth\/logout$/, () => null],
  ['GET', /^\/iam\/utilisateurs\/me$/, (c) => {
    const acc = d.DEMO_ACCOUNTS.find((a) => a.id === c.user?.id) ?? d.DEMO_ACCOUNTS[1];
    return { id: acc.id, nom: acc.nom, email: acc.email, telephone: '677 00 00 00', actif: true, roleId: `r-${acc.roleCode}`, territoireId: acc.territoireId, roleCode: acc.roleCode, mustChangePassword: false };
  }],
  ['PUT', /^\/iam\/utilisateurs\/me\/password$/, () => null],

  // --- IAM / RBAC ---
  ['GET', /^\/iam\/utilisateurs$/, () => d.utilisateurs],
  ['POST', /^\/iam\/utilisateurs$/, (c) => {
    const role = d.roles.find((r) => r.code === c.body.roleCode);
    const u = { id: uid(), nom: str(c.body.nom), email: str(c.body.email), telephone: str(c.body.telephone) || null, actif: true, roleCode: str(c.body.roleCode), niveau: role?.niveauHierarchique ?? 6, territoireId: str(c.body.territoireId) };
    d.utilisateurs.push(u);
    return u;
  }],
  ['GET', /^\/iam\/roles$/, () => d.roles],
  ['GET', /^\/iam\/roles\/permissions$/, () => d.permissions],
  ['GET', /^\/iam\/roles\/utilisateurs\/([^/]+)\/permissions$/, (c) => d.overrides[c.m[1]] ?? []],
  ['POST', /^\/iam\/roles\/utilisateurs\/([^/]+)\/permissions\/([^/]+)$/, (c) => {
    const code = c.m[2].slice(2);
    d.overrides[c.m[1]] = Array.from(new Set([...(d.overrides[c.m[1]] ?? []), code]));
    return null;
  }],
  ['DELETE', /^\/iam\/roles\/utilisateurs\/([^/]+)\/permissions\/([^/]+)$/, (c) => {
    d.overrides[c.m[1]] = (d.overrides[c.m[1]] ?? []).filter((x) => x !== c.m[2].slice(2));
    return null;
  }],
  ['GET', /^\/iam\/roles\/([^/]+)\/permissions$/, (c) => d.ROLE_PERMISSIONS[c.m[1].slice(2)] ?? []],
  ['POST', /^\/iam\/roles\/([^/]+)\/permissions\/([^/]+)$/, (c) => {
    const role = c.m[1].slice(2);
    d.ROLE_PERMISSIONS[role] = Array.from(new Set([...(d.ROLE_PERMISSIONS[role] ?? []), c.m[2].slice(2)]));
    return null;
  }],
  ['DELETE', /^\/iam\/roles\/([^/]+)\/permissions\/([^/]+)$/, (c) => {
    const role = c.m[1].slice(2);
    d.ROLE_PERMISSIONS[role] = (d.ROLE_PERMISSIONS[role] ?? []).filter((x) => x !== c.m[2].slice(2));
    return null;
  }],

  // --- Administration ---
  ['GET', /^\/admin\/audit$/, (c) => {
    const uidF = str(c.params.utilisateurId);
    const ent = str(c.params.entiteType);
    return page(d.auditLog.filter((e) => (!uidF || e.utilisateurId === uidF) && (!ent || e.entiteType === ent)), c.params);
  }],
  ['GET', /^\/admin\/parametres$/, () => d.parametres],
  ['PUT', /^\/admin\/parametres\/([^/]+)$/, (c) => {
    const p = d.parametres.find((x) => x.cle === c.m[1]);
    if (!p) throw new DemoHttpError(404, 'Paramètre introuvable');
    p.valeur = str(c.body.valeur);
    return p;
  }],
  ['GET', /^\/admin\/feature-flags$/, () => d.featureFlags],
  ['PUT', /^\/admin\/feature-flags\/([^/]+)\/toggle$/, (c) => {
    const f = d.featureFlags.find((x) => x.code === c.m[1]);
    if (!f) throw new DemoHttpError(404, 'Feature flag introuvable');
    f.actif = Boolean(c.body.actif);
    return f;
  }],
  ['GET', /^\/admin\/maintenance$/, () => d.maintenance],
  ['PUT', /^\/admin\/maintenance\/([^/]+)$/, (c) => {
    if (c.body.statut === 'PLANIFIEE' && !c.body.dateDebutPrevue) throw new DemoHttpError(400, 'dateDebutPrevue requis');
    let m = d.maintenance.find((x) => x.serviceCode === c.m[1]);
    if (!m) {
      m = { id: uid(), serviceCode: c.m[1], statut: 'TERMINEE', message: '', dateDebutPrevue: null, fenetrePrealerteHeures: null, dateFinPrevue: null, activePar: null, dateActivation: null, dateDesactivation: null };
      d.maintenance.push(m);
    }
    m.statut = c.body.statut as ModeMaintenance['statut'];
    m.message = str(c.body.message);
    m.dateDebutPrevue = str(c.body.dateDebutPrevue) || null;
    m.fenetrePrealerteHeures = c.body.fenetrePrealerteHeures === undefined ? null : Number(c.body.fenetrePrealerteHeures);
    m.dateFinPrevue = str(c.body.dateFinPrevue) || null;
    m.activePar = c.user?.id ?? null;
    if (m.statut === 'ACTIVE') m.dateActivation = now();
    return m;
  }],
  ['GET', /^\/maintenance\/bannieres$/, () => bannieres()],
  ['GET', /^\/admin\/integrations$/, () => d.integrations],
  ['PUT', /^\/admin\/integrations\/([^/]+)$/, (c) => {
    let i = d.integrations.find((x) => x.code === c.m[1]);
    if (!i) {
      i = { id: uid(), code: c.m[1], config: {}, actif: false, derniereVerification: null };
      d.integrations.push(i);
    }
    i.config = (c.body.config as Record<string, unknown>) ?? {};
    i.actif = Boolean(c.body.actif);
    i.derniereVerification = now();
    return i;
  }],
  ['GET', /^\/admin\/sauvegardes$/, () => [...d.sauvegardes].sort((a, b) => b.dateDeclenchement.localeCompare(a.dateDeclenchement))],
  ['POST', /^\/admin\/sauvegardes\/declencher$/, (c) => {
    const s = { id: uid(), dateDeclenchement: now(), type: 'manuel', statut: 'succes', tailleMo: 414.1, dateTestRestauration: null, declenchePar: c.user?.id ?? null };
    d.sauvegardes.push(s);
    return s;
  }],

  // --- Pilotage / territoires ---
  ['GET', /^\/pilotage\/indicateurs$/, (c) => indicateurs(c.user)],
  ['GET', /^\/pilotage\/carte$/, (c) => ({ communes: communesOf(c.user).map(({ id, nom, statutCommune, nombreApprenants, nombreEncadreurs, nombreSessions }) => ({ id, nom, statutCommune, nombreApprenants, nombreEncadreurs, nombreSessions })) })],
  ['GET', /^\/territoires$/, (c) => d.territoires.filter((t) => scopeOf(c.user).has(t.id))],
  ['GET', /^\/territoires\/communes$/, (c) => communesOf(c.user)],
  ['GET', /^\/territoires\/communes\/([^/]+)$/, (c) => {
    const x = d.communes.find((k) => k.id === c.m[1]);
    if (!x) throw new DemoHttpError(404, 'Commune introuvable');
    return x;
  }],
  ['GET', /^\/territoires\/([^/]+)\/children$/, (c) => d.territoires.filter((t) => t.parentId === c.m[1])],
  ['GET', /^\/territoires\/([^/]+)$/, (c) => {
    const x = d.territoires.find((t) => t.id === c.m[1]);
    if (!x) throw new DemoHttpError(404, 'Territoire introuvable');
    return x;
  }],

  // --- Formation ---
  ['GET', /^\/formation\/apprenants\/page$/, (c) => {
    const nom = str(c.params.nom).toLowerCase();
    const all = communesForList(c.params, c.user).flatMap((k) => d.apprenantsOf(k.id))
      .filter((a) => !nom || `${a.nom} ${a.prenom}`.toLowerCase().includes(nom));
    return page(all, c.params);
  }],
  ['GET', /^\/formation\/encadreurs\/page$/, (c) => {
    const nom = str(c.params.nom).toLowerCase();
    const all = communesForList(c.params, c.user).flatMap((k) => d.encadreursOf(k.id))
      .filter((a) => !nom || `${a.nom} ${a.prenom}`.toLowerCase().includes(nom));
    return page(all, c.params);
  }],
  ['GET', /^\/formation\/sessions\/page$/, (c) => {
    const q = str(c.params.recherche).toLowerCase();
    const all = communesForList(c.params, c.user).flatMap((k) => d.sessionsOf(k.id))
      .filter((s) => !q || `${s.lieu} ${s.programme}`.toLowerCase().includes(q));
    return page(all, c.params);
  }],
  ['POST', /^\/formation\/presences$/, (c) => {
    const p = { id: uid(), sessionId: str(c.body.sessionId), apprenantId: str(c.body.apprenantId), date: str(c.body.date), statut: str(c.body.statut), saisieParId: c.user?.id ?? 'u-demo' };
    d.presencesDemo.push(p);
    return p;
  }],
  ['POST', /^\/formation\/resultats$/, (c) => {
    const note = num(c.body.note, -1);
    if (note < 0 || note > 20) throw new DemoHttpError(400, 'La note doit être comprise entre 0 et 20');
    const r = { id: uid(), sessionId: str(c.body.sessionId), apprenantId: str(c.body.apprenantId), note, dateExamen: str(c.body.dateExamen) || now().slice(0, 10) };
    d.resultatsDemo.push(r);
    return r;
  }],
  ['GET', /^\/formation\/sessions\/([^/]+)$/, (c) => {
    const s = d.communes.flatMap((k) => d.sessionsOf(k.id)).find((x) => x.id === c.m[1]);
    if (!s) throw new DemoHttpError(404, 'Session introuvable');
    return s;
  }],
  ['POST', /^\/formation\/sessions\/([^/]+)\/inscriptions\/([^/]+)$/, () => null],
  ['GET', /^\/formation\/catalogue\/corps-metier$/, () => d.corpsMetier],
  ['GET', /^\/formation\/catalogue\/filieres$/, (c) => d.filieres.filter((f) => !str(c.params.corpsMetierId) || f.corpsMetierId === str(c.params.corpsMetierId))],
  ['PATCH', /^\/formation\/catalogue\/filieres\/([^/]+)\/statut$/, (c) => {
    const f = d.filieres.find((x) => x.id === c.m[1]);
    if (!f) throw new DemoHttpError(404, 'Filière introuvable');
    f.statut = c.body.statut as 'ACTIVE' | 'A_VENIR';
    return f;
  }],
  ['POST', /^\/formation\/(apprenants|encadreurs|sessions)$/, (c) => ({ id: uid(), syncStatus: 'synced', statut: 'planifiee', ...c.body })],
  ['PUT', /^\/formation\/(apprenants|encadreurs|sessions)\/([^/]+)$/, (c) => ({ id: c.m[2], ...c.body })],
  ['DELETE', /^\/formation\/(apprenants|encadreurs)\/([^/]+)$/, () => null],
  ['POST', /^\/formation\/sessions\/([^/]+)\/cloturer$/, (c) => {
    d.sessionsCloturees.add(c.m[1]);
    return d.communes.flatMap((k) => d.sessionsOf(k.id)).find((s) => s.id === c.m[1]);
  }],
  ['GET', /^\/formation\/sessions\/([^/]+)\/taux-reussite$/, (c) => {
    const seuil = seuilReussite();
    const res = d.resultatsDemo.filter((r) => r.sessionId === c.m[1]);
    const reussis = res.filter((r) => r.note >= seuil).length;
    return { sessionId: c.m[1], totalApprenants: res.length, totalReussis: reussis, tauxReussite: res.length ? Math.round((reussis * 1000) / res.length) / 10 : 0, sessionCloturee: true };
  }],
  ['GET', /^\/formation\/sessions\/([^/]+)\/presences$/, (c) => d.presencesDemo.filter((p) => p.sessionId === c.m[1])],
  ['GET', /^\/formation\/sessions\/([^/]+)\/resultats$/, (c) => d.resultatsDemo.filter((r) => r.sessionId === c.m[1])],
  ['POST', /^\/formation\/attestations$/, (c) => ({ id: uid(), apprenantId: str(c.params.apprenantId), sessionId: str(c.params.sessionId), numero: 'ATT-2026-' + uid().slice(0, 8).toUpperCase(), dateDelivrance: now().slice(0, 10), fichierUrl: null })],

  // --- Budget ---
  ['GET', /^\/depenses$/, (c) => {
    const statut = str(c.params.statut);
    return depensesOf(c.user).filter((x) => !statut || x.statut === statut).sort((a, b) => b.dateSoumission.localeCompare(a.dateSoumission));
  }],
  ['GET', /^\/depenses\/mes-soumissions$/, (c) => d.depenses.filter((x) => x.soumisPar === c.user?.id)],
  ['POST', /^\/depenses$/, (c) => {
    const montant = num(c.body.montant, 0);
    const niveauFinalRequis = montant > seuil('budget.seuil_validation_n1', 2_000_000) ? 1 : montant > seuil('budget.seuil_validation_n2', 500_000) ? 2 : montant > seuil('budget.seuil_validation_n3', 100_000) ? 3 : 4;
    const x: Depense = {
      id: uid(), territoireId: str(c.body.territoireId), budgetId: null, montant, description: str(c.body.description),
      categorie: str(c.body.categorie) || null, soumisPar: c.user?.id ?? 'u-demo', niveauFinalRequis, statut: 'soumise',
      valideN4Par: null, valideN4Le: null, valideN3Par: null, valideN3Le: null, valideN2Par: null, valideN2Le: null,
      valideN1Par: null, valideN1Le: null, rejetePar: null, rejeteLe: null, motifRejet: null, dateSoumission: now(),
    };
    d.depenses.unshift(x);
    return x;
  }],
  ['POST', /^\/depenses\/([^/]+)\/valider-n([1-4])$/, (c) => valider(c.m[1], Number(c.m[2]), c.user)],
  ['POST', /^\/depenses\/([^/]+)\/rejeter$/, (c) => {
    const x = findDepense(c.m[1]);
    x.statut = 'rejetee'; x.rejetePar = c.user?.id ?? null; x.rejeteLe = now(); x.motifRejet = str(c.body.motif);
    return x;
  }],

  ['GET', /^\/depenses\/([^/]+)\/justificatifs$/, (c) => d.justificatifs.filter((j) => j.depenseId === c.m[1])],
  ['POST', /^\/depenses\/([^/]+)\/justificatifs$/, (c) => {
    const j = { id: uid(), depenseId: c.m[1], fichierCle: str(c.body.fichierCle), typeDocument: c.body.typeDocument as 'facture' | 'recu' | 'bon_commande', dateUpload: now() };
    d.justificatifs.push(j);
    return j;
  }],

  // --- Finances ---
  ['GET', /^\/budgets$/, (c) => {
    const ids = scopeOf(c.user);
    return d.budgetsBase.filter((b) => ids.has(b.territoireId)).map((b) => {
      const utilise = d.depenses.filter((x) => x.statut === 'validee' && x.territoireId === b.territoireId).reduce((s, x) => s + x.montant, 0);
      return { ...b, montantUtilise: utilise, solde: b.montantAlloue - utilise, devise: 'XAF', dateCreation: now() };
    });
  }],
  ['POST', /^\/budgets$/, (c) => {
    const b = { id: uid(), territoireId: str(c.body.territoireId), exercice: str(c.body.exercice), montantAlloue: num(c.body.montantAlloue, 0) };
    d.budgetsBase.push(b);
    return { ...b, montantUtilise: 0, solde: b.montantAlloue, devise: 'XAF', dateCreation: now() };
  }],
  ['GET', /^\/subventions$/, (c) => {
    const ids = scopeOf(c.user);
    return d.subventions.filter((s) => !s.territoireId || ids.has(s.territoireId));
  }],
  ['POST', /^\/subventions$/, (c) => {
    const s = { id: uid(), partenaireId: str(c.body.partenaireId), territoireId: str(c.body.territoireId) || null, montant: num(c.body.montant, 0), dateReception: str(c.body.dateReception), type: c.body.type as 'subvention' | 'don', statut: 'recue', enregistrePar: c.user?.id ?? 'u-demo' };
    d.subventions.unshift(s);
    return s;
  }],
  ['GET', /^\/partenaires-financiers$/, () => d.partenairesFinanciers],
  ['POST', /^\/partenaires-financiers$/, (c) => {
    const p = { id: uid(), nom: str(c.body.nom), type: c.body.type as 'ministere' | 'ong' | 'bailleur' | 'prive', contactEmail: str(c.body.contactEmail) || null, contactTelephone: str(c.body.contactTelephone) || null, actif: true };
    d.partenairesFinanciers.push(p);
    return p;
  }],
  ['PUT', /^\/partenaires-financiers\/([^/]+)$/, (c) => {
    const p = d.partenairesFinanciers.find((x) => x.id === c.m[1]);
    if (!p) throw new DemoHttpError(404, 'Partenaire introuvable');
    Object.assign(p, { nom: str(c.body.nom), type: c.body.type, contactEmail: str(c.body.contactEmail) || null, contactTelephone: str(c.body.contactTelephone) || null });
    return p;
  }],
  ['DELETE', /^\/partenaires-financiers\/([^/]+)$/, (c) => {
    const p = d.partenairesFinanciers.find((x) => x.id === c.m[1]);
    if (p) p.actif = false;
    return null;
  }],
  ['POST', /^\/fichiers$/, () => ({ cle: `demo/fichier-${Date.now()}` })],
  ['GET', /^\/fichiers$/, () => new Blob(['Document de démonstration — aucun fichier réel en mode démo.'], { type: 'text/plain' })],

  // --- Communication ---
  ['GET', /^\/notifications\/diffusions\/historique$/, () => [...d.diffusions].sort((a, b) => b.dateCreation.localeCompare(a.dateCreation))],
  ['POST', /^\/notifications\/diffusions$/, (c) => {
    const cibles: Record<string, number> = { global: 214, niveau: 9, territoire: 37, individuel: 1 };
    const x = {
      id: uid(), emisPar: c.user?.id ?? 'u-demo', titre: str(c.body.titre), corps: str(c.body.corps), canal: c.body.canal as 'in_app',
      cibleType: c.body.cibleType as 'global', cibleNiveau: (c.body.cibleNiveau as number | null) ?? null,
      cibleTerritoireId: (c.body.cibleTerritoireId as string | null) ?? null, cibleUtilisateurId: (c.body.cibleUtilisateurId as string | null) ?? null,
      nbDestinataires: cibles[str(c.body.cibleType)] ?? 1, statut: str(c.body.cibleType) === 'individuel' ? 'terminee' : 'en_cours', dateCreation: now(), dateCompletion: null,
    };
    d.diffusions.unshift(x);
    return x;
  }],
  ['GET', /^\/circulaires$/, (c) => d.circulaires.filter((x) => x.statut === 'publiee' || x.auteurId === c.user?.id || (c.user?.niveau ?? 9) <= 1)],
  ['POST', /^\/circulaires$/, (c) => {
    const x = {
      id: uid(), titre: str(c.body.titre), contenu: str(c.body.contenu), cibleType: c.body.cibleType as 'global',
      cibleNiveau: (c.body.cibleNiveau as number | null) ?? null, cibleTerritoireId: (c.body.cibleTerritoireId as string | null) ?? null,
      cibleUtilisateurId: (c.body.cibleUtilisateurId as string | null) ?? null, auteurId: c.user?.id ?? 'u-demo',
      fichierJointUrl: str(c.body.fichierJointUrl) || null, datePublication: null, statut: 'brouillon' as const,
    };
    d.circulaires.unshift(x);
    return x;
  }],
  ['POST', /^\/circulaires\/([^/]+)\/publier$/, (c) => {
    const x = d.circulaires.find((k) => k.id === c.m[1]);
    if (!x) throw new DemoHttpError(404, 'Circulaire introuvable');
    x.statut = 'publiee';
    x.datePublication = now();
    return x;
  }],
  ['GET', /^\/reunions$/, () => d.reunions],
  ['POST', /^\/reunions$/, (c) => {
    const x = {
      id: uid(), titre: str(c.body.titre), type: c.body.type as 'visio', dateDebut: str(c.body.dateDebut), dateFin: str(c.body.dateFin),
      lienVisio: str(c.body.lienVisio) || null, organisateurId: c.user?.id ?? 'u-demo', cibleType: c.body.cibleType as 'global',
      cibleNiveau: (c.body.cibleNiveau as number | null) ?? null, cibleTerritoireId: (c.body.cibleTerritoireId as string | null) ?? null,
      cibleUtilisateurId: (c.body.cibleUtilisateurId as string | null) ?? null,
    };
    d.reunions.unshift(x);
    d.participants.push({ id: uid(), reunionId: x.id, utilisateurId: c.user?.id ?? 'u-demo', statutPresence: 'present' });
    return x;
  }],
  ['GET', /^\/reunions\/([^/]+)\/participants$/, (c) => d.participants.filter((p) => p.reunionId === c.m[1])],
  ['POST', /^\/reunions\/([^/]+)\/participants$/, (c) => {
    const p = { id: uid(), reunionId: c.m[1], utilisateurId: str(c.body.utilisateurId), statutPresence: 'invite' as const };
    d.participants.push(p);
    return p;
  }],
  ['POST', /^\/reunions\/([^/]+)\/confirmer-presence$/, (c) => {
    const p = d.participants.find((x) => x.reunionId === c.m[1] && x.utilisateurId === c.user?.id);
    if (!p) throw new DemoHttpError(400, 'Vous n\'êtes pas invité à cette réunion');
    p.statutPresence = c.body.statutPresence as 'present' | 'absent';
    return p;
  }],
  ['GET', /^\/bibliotheque$/, (c) => {
    const roleId = c.user ? `r-${c.user.roleCode}` : '';
    return d.ressources.filter((r) => !r.niveauAccesRoleId || r.niveauAccesRoleId === roleId);
  }],
  ['POST', /^\/bibliotheque$/, (c) => {
    const r = { id: uid(), titre: str(c.body.titre), type: c.body.type as 'pdf', fichierUrl: str(c.body.fichierUrl), categorie: str(c.body.categorie) || null, niveauAccesRoleId: str(c.body.niveauAccesRoleId) || null, dateAjout: now() };
    d.ressources.unshift(r);
    return r;
  }],

  // --- Imports en masse ---
  ['GET', /^\/admin\/imports$/, () => {
    for (const j of d.importJobs) {
      const fin = importFin.get(j.id);
      if (j.statut === 'en_cours' && fin && Date.now() > fin) {
        j.statut = 'termine_avec_erreurs';
        j.nbLignesTraitees = 12;
        j.nbErreurs = 2;
        j.erreursDetail = ['Ligne 4 : sexe invalide', 'Ligne 9 : territoireCode manquant'];
      }
    }
    return d.importJobs;
  }],
  ['POST', /^\/admin\/imports\/apprenants$/, (c) => {
    const file = (c.body as unknown as FormData).get?.('fichier') as File | null;
    const j = { id: uid(), typeEntite: 'apprenant', fichierSource: file?.name ?? 'import.csv', statut: 'en_cours', nbLignesTraitees: 0, nbErreurs: 0, erreursDetail: [] as string[], utilisateurId: c.user?.id ?? 'u-demo', date: now() };
    d.importJobs.unshift(j);
    importFin.set(j.id, Date.now() + 6000);
    return j;
  }],

  // --- Matériel ---
  ['GET', /^\/types-materiel$/, () => d.typesMateriel],
  ['GET', /^\/materiels$/, () => d.materiels],
  ['POST', /^\/materiels$/, (c) => {
    const m = { id: uid(), typeMaterielId: str(c.body.typeMaterielId), numeroSerie: str(c.body.numeroSerie), marque: str(c.body.marque) || null, modele: str(c.body.modele) || null, etat: 'neuf' as const, dateAcquisition: str(c.body.dateAcquisition) || null, valeurAcquisition: c.body.valeurAcquisition === undefined ? null : Number(c.body.valeurAcquisition) };
    d.materiels.unshift(m);
    return m;
  }],
  ['PATCH', /^\/materiels\/([^/]+)\/etat$/, (c) => {
    const m = d.materiels.find((x) => x.id === c.m[1]);
    if (!m) throw new DemoHttpError(404, 'Matériel introuvable');
    m.etat = c.body.etat as typeof m.etat;
    return m;
  }],
  ['GET', /^\/materiels\/([^/]+)\/affectations$/, (c) => d.affectations.filter((a) => a.materielId === c.m[1])],
  ['GET', /^\/materiels\/([^/]+)\/maintenances$/, (c) => d.maintenancesMateriel.filter((x) => x.materielId === c.m[1])],
  ['POST', /^\/affectations-materiel$/, (c) => {
    const a = { id: uid(), materielId: str(c.body.materielId), territoireId: str(c.body.territoireId), responsableId: str(c.body.responsableId), dateAffectation: str(c.body.dateAffectation), dateRetour: null, statut: 'en_cours' };
    d.affectations.unshift(a);
    return a;
  }],
  ['POST', /^\/affectations-materiel\/([^/]+)\/cloturer$/, (c) => {
    const a = d.affectations.find((x) => x.id === c.m[1]);
    if (!a) throw new DemoHttpError(404, 'Affectation introuvable');
    if (a.statut !== 'en_cours') throw new DemoHttpError(400, "Cette affectation n'est plus en cours (statut: " + a.statut + ")");
    a.statut = 'termine';
    a.dateRetour = now().slice(0, 10);
    return a;
  }],
  ['GET', /^\/affectations-materiel$/, (c) => {
    const ids = d.subtreeIds(str(c.params.territoireId));
    return d.affectations.filter((a) => ids.has(a.territoireId));
  }],
  ['POST', /^\/maintenances-materiel$/, (c) => {
    const x = { id: uid(), materielId: str(c.body.materielId), typeIntervention: c.body.typeIntervention as 'preventive', description: str(c.body.description) || null, dateIntervention: str(c.body.dateIntervention), cout: c.body.cout === undefined ? null : Number(c.body.cout), prestataire: str(c.body.prestataire) || null, prochaineMaintenance: str(c.body.prochaineMaintenance) || null };
    d.maintenancesMateriel.unshift(x);
    return x;
  }],

  // --- Productions ---
  ['GET', /^\/productions$/, (c) => {
    const ids = scopeOf(c.user);
    return d.productions.filter((p) => ids.has(p.territoireId));
  }],
  ['POST', /^\/productions$/, (c) => {
    const p = { id: uid(), territoireId: str(c.body.territoireId), titre: str(c.body.titre), type: c.body.type as 'film', description: str(c.body.description) || null, dateRealisation: str(c.body.dateRealisation) || null, fichierUrl: str(c.body.fichierUrl) || null, lienDiffusion: str(c.body.lienDiffusion) || null, statutPublic: 'prive' as const };
    d.productions.unshift(p);
    return p;
  }],
  ['POST', /^\/productions\/([^/]+)\/publier$/, (c) => {
    const p = d.productions.find((x) => x.id === c.m[1]);
    if (!p) throw new DemoHttpError(404, 'Production introuvable');
    p.statutPublic = 'visible_v4';
    return p;
  }],
  ['GET', /^\/productions\/([^/]+)\/apprenants$/, (c) => d.productionApprenants.filter((x) => x.productionId === c.m[1])],
  ['POST', /^\/productions\/([^/]+)\/apprenants$/, (c) => {
    const x = { id: uid(), productionId: c.m[1], apprenantId: str(c.body.apprenantId), role: c.body.role as 'acteur' };
    d.productionApprenants.push(x);
    return x;
  }],
  ['GET', /^\/productions\/([^/]+)\/recompenses$/, (c) => d.recompenses.filter((x) => x.productionId === c.m[1])],
  ['POST', /^\/productions\/([^/]+)\/recompenses$/, (c) => {
    const x = { id: uid(), productionId: c.m[1], nomFestival: str(c.body.nomFestival), nomPrix: str(c.body.nomPrix), annee: num(c.body.annee, 2026), niveau: c.body.niveau as 'national', dateObtention: str(c.body.dateObtention) || null };
    d.recompenses.push(x);
    return x;
  }],

  // --- Rapports ---
  ['GET', /^\/rapports-templates$/, () => d.rapportTemplates],
  ['POST', /^\/rapports-templates$/, (c) => {
    const t = { id: uid(), code: str(c.body.code), nom: str(c.body.nom), structure: (c.body.structure as Record<string, unknown>) ?? {}, actif: true };
    d.rapportTemplates.push(t);
    return t;
  }],
  ['PUT', /^\/rapports-templates\/([^/]+)$/, (c) => {
    const t = d.rapportTemplates.find((x) => x.id === c.m[1]);
    if (!t) throw new DemoHttpError(404, 'Modèle introuvable');
    Object.assign(t, { code: str(c.body.code), nom: str(c.body.nom), structure: c.body.structure });
    return t;
  }],
  ['DELETE', /^\/rapports-templates\/([^/]+)$/, (c) => {
    const t = d.rapportTemplates.find((x) => x.id === c.m[1]);
    if (t) t.actif = false;
    return null;
  }],
  ['GET', /^\/rapports$/, (c) => {
    const ids = d.subtreeIds(str(c.params.territoireId));
    return d.rapportsGeneres.filter((r) => ids.has(r.territoireId));
  }],
  ['POST', /^\/rapports$/, (c) => {
    const r = { id: uid(), templateId: str(c.body.templateId), typePerimetre: c.body.typePerimetre as 'communal', territoireId: str(c.body.territoireId), periodeDebut: str(c.body.periodeDebut), periodeFin: str(c.body.periodeFin), format: c.body.format as 'pdf', fichierUrl: 'demo/rapport-genere', dateGeneration: now(), genereParId: c.user?.id ?? 'u-demo', statut: 'genere' };
    d.rapportsGeneres.unshift(r);
    return r;
  }],

  // --- Incidents ---
  ['GET', /^\/incidents\/mes-incidents$/, (c) => d.incidents.filter((i) => i.signalePar === c.user?.id)],
  ['GET', /^\/incidents\/synthese$/, (c) => {
    const ouverts = incidentsOf(c.user).filter((i) => i.statut === 'nouveau' || i.statut === 'en_cours');
    return { ouvertsCritiques: ouverts.filter((i) => i.gravite === 'critique').length, ouvertsTotal: ouverts.length };
  }],
  ['GET', /^\/incidents$/, (c) => incidentsOf(c.user)],
  ['POST', /^\/incidents$/, (c) => {
    const i: Incident = {
      id: uid(), signalePar: c.user?.id ?? 'u-demo', territoireId: c.user?.territoireId ?? null, type: c.body.type as Incident['type'],
      gravite: (c.body.gravite as Incident['gravite']) ?? 'faible', titre: str(c.body.titre), description: str(c.body.description),
      pieceJointeCle: null, statut: 'nouveau', assigneA: null, creeLe: now(), resoluLe: null,
    };
    d.incidents.unshift(i);
    return i;
  }],
  ['GET', /^\/incidents\/([^/]+)$/, (c) => {
    const i = d.incidents.find((x) => x.id === c.m[1]);
    if (!i) throw new DemoHttpError(404, 'Incident introuvable');
    return i;
  }],
  ['PUT', /^\/incidents\/([^/]+)\/statut$/, (c) => {
    const i = d.incidents.find((x) => x.id === c.m[1]);
    if (!i) throw new DemoHttpError(404, 'Incident introuvable');
    i.statut = c.body.statut as Incident['statut'];
    i.assigneA = (c.body.assigneA as string | null | undefined) ?? i.assigneA;
    if ((i.statut === 'resolu' || i.statut === 'ferme') && !i.resoluLe) i.resoluLe = now();
    return i;
  }],

  // --- Notifications ---
  ['GET', /^\/notifications$/, () => d.notifications],
  ['GET', /^\/notifications\/unread-count$/, () => ({ nonLues: d.notifications.filter((n) => n.statut !== 'lue').length })],
  ['POST', /^\/notifications\/([^/]+)\/lue$/, (c) => {
    const n = d.notifications.find((x) => x.id === c.m[1]);
    if (n) { n.statut = 'lue'; n.dateLecture = now(); }
    return null;
  }],

  // --- Site public ---
  ...crud('actualites', d.actualites, () => ({ datePublication: now(), statut: 'brouillon' as const })),
  ['PUT', /^\/ecosysteme\/actualites\/([^/]+)\/toggle-publish$/, (c) => {
    const a = d.actualites.find((x) => x.id === c.m[1]);
    if (!a) throw new DemoHttpError(404, 'Actualité introuvable');
    a.statut = a.statut === 'publiee' ? 'brouillon' : 'publiee';
    return a;
  }],
  ...crud('faq', d.faq, () => ({ actif: true })),
  ...crud('equipe', d.equipe, () => ({})),
  ...crud('partenaires', d.partenaires, () => ({})),
  ...crud('evenements', d.evenements, () => ({ statut: 'a_venir' })),
  ['GET', /^\/ecosysteme\/candidatures$/, () => d.candidatures],
  ['PUT', /^\/ecosysteme\/candidatures\/([^/]+)\/traiter$/, (c) => {
    const cand = d.candidatures.find((x) => x.id === c.m[1]);
    if (!cand) throw new DemoHttpError(404, 'Candidature introuvable');
    cand.statut = c.body.statut as typeof cand.statut;
    cand.dateTraitement = now();
    cand.traitePar = c.user?.id ?? null;
    const acceptee = cand.statut === 'acceptee';
    return {
      candidatureId: cand.id, apprenantId: acceptee ? uid() : null, utilisateurId: acceptee ? uid() : null,
      login: acceptee ? cand.email : null, motDePasseTemporaire: acceptee ? 'Kct-2026-Demo' : null, canalTransmission: acceptee ? 'sms' : null,
    };
  }],
  ['GET', /^\/ecosysteme\/contact$/, () => d.contacts],
  ['PUT', /^\/ecosysteme\/contact\/([^/]+)\/traiter$/, (c) => {
    const m = d.contacts.find((x) => x.id === c.m[1]);
    if (!m) throw new DemoHttpError(404, 'Message introuvable');
    m.statut = 'traite'; m.dateTraitement = now();
    return m;
  }],
];

// ==================== ADAPTATEUR ====================

function respond(config: InternalAxiosRequestConfig, data: unknown) {
  return { data, status: 200, statusText: 'OK', headers: {}, config, request: {} };
}

export const demoAdapter: AxiosAdapter = async (config) => {
  await new Promise((r) => setTimeout(r, 120 + Math.random() * 180));
  const method = (config.method ?? 'get').toUpperCase();
  const path = (config.url ?? '').split('?')[0];
  const body: Body = typeof config.data === 'string' && config.data ? (JSON.parse(config.data) as Body) : ((config.data as Body) ?? {});

  try {
    for (const [m, re, handler] of routes) {
      if (m !== method) continue;
      const match = path.match(re);
      if (!match) continue;
      return respond(config, handler({ m: match, params: (config.params as Record<string, unknown>) ?? {}, body, user: currentUser() }) ?? null);
    }
    throw new DemoHttpError(404, `[démo] endpoint non simulé : ${method} ${path}`);
  } catch (e) {
    if (e instanceof DemoHttpError) {
      const response = { data: { message: e.message }, status: e.status, statusText: '', headers: {}, config, request: {} };
      throw new AxiosError(e.message, String(e.status), config, {}, response);
    }
    throw e;
  }
};
