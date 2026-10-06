import type { MaterielEtat } from '../types';

export const ETAT_CONFIG: Record<MaterielEtat, { label: string; className: string }> = {
  neuf: { label: 'Neuf', className: 'bg-kct-green/15 text-kct-green' },
  bon: { label: 'Bon état', className: 'bg-kct-green/15 text-kct-green' },
  use: { label: 'Usé', className: 'bg-kct-yellow/15 text-kct-yellow' },
  hors_service: { label: 'Hors service', className: 'bg-kct-red/15 text-kct-red' },
};

export function EtatBadge({ etat }: { etat: MaterielEtat }) {
  const c = ETAT_CONFIG[etat];
  return <span className={`whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-semibold ${c.className}`}>{c.label}</span>;
}

export const formatDate = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString('fr-FR') : '—');
export const formatXaf = (v: number | null) => (v === null ? '—' : `${v.toLocaleString('fr-FR')} XAF`);
