import {
  LayoutDashboard, Map, MapPin, Users, GraduationCap, CalendarCheck,
  ClipboardList, Award, ShieldAlert, KeyRound, UserCog, Globe,
  Newspaper, HelpCircle, Handshake, UserPlus, Mail, Settings, Flag, Calendar,
  ServerCog, Wrench, Plug, Database, AlertTriangle, Wallet, Landmark,
  Megaphone, ScrollText, CalendarClock, BookOpen, PackageOpen, Clapperboard, FileBarChart, FileUp,
} from 'lucide-react';

/**
 * Navigation du back-office. Un item est affiché selon les permissions
 * effectives renvoyées par l'API : `permission` (une seule requise),
 * `anyOf` (au moins une), ou aucune des deux (tout utilisateur authentifié).
 * Le frontend affiche/masque, il ne décide jamais des droits (§3).
 */
export type NavItem = {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  permission?: string;
  anyOf?: string[];
};

export type NavGroup = {
  heading: string;
  items: NavItem[];
};

export function isNavItemVisible(item: NavItem, hasPermission: (code: string) => boolean): boolean {
  if (item.permission) return hasPermission(item.permission);
  if (item.anyOf) return item.anyOf.some(hasPermission);
  return true;
}

/** Clés i18n des titres d'écrans absents du menu (accès par lien, cloche, profil…). */
export const EXTRA_PAGE_TITLES: Array<[prefix: string, key: string]> = [
  ['/notifications', 'layout.pageTitles.notifications'],
  ['/profile', 'layout.pageTitles.profile'],
  ['/communes', 'layout.pageTitles.communes'],
  ['/sessions/', 'layout.pageTitles.session'],
];

/** Clé i18n d'un item de menu : '/admin/feature-flags' -> 'admin_feature_flags'. */
export const navKey = (to: string) => to.replace(/^\//, '').replace(/[\/-]+/g, '_');

/** Clé i18n d'un titre de groupe : 'Production & suivi' -> 'production_suivi'. */
export const groupKey = (heading: string) =>
  heading.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');

export const NAV_GROUPS: NavGroup[] = [
  {
    heading: 'Pilotage',
    items: [
      { to: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard, permission: 'pilotage:read' },
      { to: '/carte', label: 'Carte du Cameroun', icon: Map, permission: 'territoire:read' },
      { to: '/incidents', label: 'Incidents', icon: AlertTriangle },
    ],
  },
  {
    heading: 'Territoire',
    items: [
      { to: '/territoires', label: 'Territoires', icon: MapPin, permission: 'territoire:read' },
    ],
  },
  {
    heading: 'Formation',
    items: [
      { to: '/apprenants', label: 'Apprenants', icon: Users, permission: 'apprenant:read' },
      { to: '/encadreurs', label: 'Encadreurs', icon: GraduationCap, permission: 'encadreur:read' },
      { to: '/sessions', label: 'Sessions', icon: CalendarCheck, permission: 'session:read' },
      { to: '/presences', label: 'Présences', icon: ClipboardList, permission: 'presence:read' },
      { to: '/resultats', label: 'Résultats', icon: Award, permission: 'resultat:read' },
      { to: '/attestations', label: 'Attestations', icon: Award, permission: 'attestation:read' },
    ],
  },
  {
    heading: 'Finances',
    items: [
      {
        to: '/budget/depenses', label: 'Dépenses', icon: Wallet,
        anyOf: ['depense:read', 'depense:soumettre', 'depense:valider_n4', 'depense:valider_n3', 'depense:valider_n2', 'depense:valider_n1'],
      },
      {
        to: '/budget/finances', label: 'Budgets & partenaires', icon: Landmark,
        anyOf: ['budget:read', 'subvention:read', 'partenaire_financier:read'],
      },
    ],
  },
  {
    heading: 'Production & suivi',
    items: [
      { to: '/productions', label: 'Productions', icon: Clapperboard, permission: 'production:read' },
      { to: '/rapports', label: 'Rapports', icon: FileBarChart, anyOf: ['rapport:read', 'rapport:generer'] },
    ],
  },
  {
    heading: 'Logistique',
    items: [
      { to: '/materiel', label: 'Matériel', icon: PackageOpen, permission: 'materiel:read' },
    ],
  },
  {
    heading: 'Communication',
    items: [
      { to: '/communication/diffusion', label: 'Diffuser une notification', icon: Megaphone, permission: 'notification:diffuser' },
      { to: '/communication/circulaires', label: 'Circulaires', icon: ScrollText, permission: 'circulaire:read' },
      { to: '/communication/reunions', label: 'Réunions', icon: CalendarClock, permission: 'reunion:read' },
      { to: '/communication/bibliotheque', label: 'Bibliothèque', icon: BookOpen, permission: 'ressource_bibliotheque:read' },
    ],
  },
  {
    heading: 'Administration',
    items: [
      { to: '/admin/overview', label: "Vue d'ensemble", icon: Globe, permission: 'audit:read' },
      { to: '/admin/audit', label: "Journal d'audit", icon: ShieldAlert, permission: 'audit:read' },
      { to: '/admin/users', label: 'Utilisateurs', icon: UserCog, permission: 'utilisateur:read' },
      { to: '/admin/roles', label: 'Rôles & permissions', icon: KeyRound, permission: 'role:read' },
      { to: '/admin/imports', label: 'Imports en masse', icon: FileUp, permission: 'import:read' },
    ],
  },
  {
    heading: 'Administration système',
    items: [
      { to: '/admin/technique', label: 'Vue technique', icon: ServerCog, permission: 'parametre:read' },
      { to: '/admin/parametres', label: 'Paramètres système', icon: Settings, permission: 'parametre:read' },
      { to: '/admin/feature-flags', label: 'Feature flags', icon: Flag, permission: 'feature_flag:read' },
      { to: '/admin/maintenance', label: 'Mode maintenance', icon: Wrench, permission: 'maintenance:read' },
      { to: '/admin/integrations', label: 'Intégrations externes', icon: Plug, permission: 'integration:read' },
      { to: '/admin/sauvegardes', label: 'Sauvegardes', icon: Database, permission: 'sauvegarde:read' },
    ],
  },
  {
    // Toute cette section (hors candidatures/messages) est gardée par la permission
    // déléguable site.content.manage (§3), jamais par un niveau — accordée par défaut
    // à N1 et ADMINISTRATEUR_SYSTEME, mais un tiers peut la détenir seule via délégation.
    heading: 'Site',
    items: [
      { to: '/site/actualites', label: 'Actualités', icon: Newspaper, permission: 'site.content.manage' },
      { to: '/site/faq', label: 'FAQ', icon: HelpCircle, permission: 'site.content.manage' },
      { to: '/site/equipe', label: 'Équipe', icon: Users, permission: 'site.content.manage' },
      { to: '/site/partenaires', label: 'Partenaires', icon: Handshake, permission: 'site.content.manage' },
      { to: '/site/evenements', label: 'Événements', icon: Calendar, permission: 'site.content.manage' },
      { to: '/site/catalogue-formations', label: 'Catalogue des formations', icon: GraduationCap, permission: 'site.content.manage' },
      { to: '/site/candidatures', label: 'Candidatures', icon: UserPlus, permission: 'candidature:read' },
      { to: '/site/contact', label: 'Messages', icon: Mail, permission: 'contact:read' },
    ],
  },
];
