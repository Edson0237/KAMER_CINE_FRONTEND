import { Wrench, GraduationCap, HelpCircle, PackageX } from 'lucide-react';
import type { IncidentGravite, IncidentStatut, IncidentType } from '../types';

export const TYPE_LABEL: Record<IncidentType, string> = {
  technique: 'Technique',
  materiel: 'Matériel',
  formation: 'Formation',
  autre: 'Autre',
};

export const TYPE_ICON: Record<IncidentType, typeof Wrench> = {
  technique: Wrench,
  materiel: PackageX,
  formation: GraduationCap,
  autre: HelpCircle,
};

export const STATUT_LABEL: Record<IncidentStatut, string> = {
  nouveau: 'Nouveau',
  en_cours: 'En cours',
  resolu: 'Résolu',
  ferme: 'Clôturé',
};

const GRAVITE_STYLE: Record<IncidentGravite, string> = {
  faible: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300',
  moyenne: 'bg-kct-yellow/15 text-kct-yellow',
  critique: 'bg-kct-red/15 text-kct-red',
};

const STATUT_STYLE: Record<IncidentStatut, string> = {
  nouveau: 'bg-kct-red/10 text-kct-red',
  en_cours: 'bg-kct-yellow/15 text-kct-yellow',
  resolu: 'bg-kct-green/15 text-kct-green',
  ferme: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
};

export function GraviteBadge({ gravite }: { gravite: IncidentGravite }) {
  return <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${GRAVITE_STYLE[gravite]}`}>{gravite}</span>;
}

export function IncidentStatutBadge({ statut }: { statut: IncidentStatut }) {
  return <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${STATUT_STYLE[statut]}`}>{STATUT_LABEL[statut]}</span>;
}
