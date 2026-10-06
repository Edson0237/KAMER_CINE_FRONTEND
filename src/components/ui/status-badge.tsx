import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

/**
 * Statuts de commune réels (`statut_commune.code`, V2__seed_reference_data.sql,
 * kct-manager-api) — source de vérité unique pour ce composant. Ne pas
 * inventer d'autres codes (`active`/`inactive`/`planifiee` n'existent pas
 * en base et ne doivent jamais apparaître côté frontend).
 */
export type StatutCommune = 'terminee' | 'en_cours' | 'non_demarree' | 'suspendue';

const STATUT_CONFIG: Record<StatutCommune, { label: string; className: string }> = {
  terminee: { label: 'Formation terminée', className: 'bg-kct-green text-white' },
  en_cours: { label: 'Formation en cours', className: 'bg-kct-yellow text-white' },
  non_demarree: { label: 'Non démarrée', className: 'bg-kct-gold text-white' },
  suspendue: { label: 'Suspendue', className: 'bg-kct-red text-white' },
};

interface StatusBadgeProps {
  statut: string;
  className?: string;
}

/**
 * Badge unique pour les 4 statuts de commune — remplace la logique
 * dupliquée (et incomplète, jamais 4 branches) trouvée précédemment dans
 * TerritoireList/CommuneDetail/CarteCameroun/Dashboard. Un statut inconnu
 * (donnée corrompue ou nouveau code non encore géré ici) s'affiche tel
 * quel en gris neutre plutôt que de planter ou de mentir sur son sens.
 */
export function StatusBadge({ statut, className }: StatusBadgeProps) {
  const config = STATUT_CONFIG[statut as StatutCommune];
  if (!config) {
    return (
      <Badge className={cn('bg-gray-400 text-white', className)}>
        {statut}
      </Badge>
    );
  }
  return <Badge className={cn(config.className, className)}>{config.label}</Badge>;
}

/** Couleur brute d'un statut (pour la carte Leaflet, qui a besoin d'un hex, pas d'une classe Tailwind). */
export const STATUT_COMMUNE_COLORS: Record<StatutCommune, string> = {
  terminee: '#3F9142',
  en_cours: '#C9A227',
  non_demarree: '#B8860B',
  suspendue: '#C0392B',
};

export function couleurStatutCommune(statut: string): string {
  return STATUT_COMMUNE_COLORS[statut as StatutCommune] ?? '#9CA3AF';
}
