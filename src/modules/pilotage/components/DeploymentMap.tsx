import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useTerritoires } from '@/modules/territoire/hooks/useTerritoires';
import { STATUT_COMMUNE_COLORS, couleurStatutCommune, type StatutCommune } from '@/components/ui/status-badge';
import type { Commune, Territoire } from '@/modules/territoire/types';

const STATUT_LABEL: Record<StatutCommune, string> = {
  terminee: 'Terminée',
  en_cours: 'En cours',
  non_demarree: 'Non démarrée',
  suspendue: 'Suspendue',
};

const NIVEAU_NOM: Record<number, string> = { 1: 'National', 2: 'Région', 3: 'Département', 4: 'Arrondissement' };

interface Node {
  territoire: Territoire;
  children: Node[];
  communes: Commune[];
}

function statusCounts(node: Node): Record<string, number> {
  const counts: Record<string, number> = {};
  const walk = (n: Node) => {
    for (const c of n.communes) counts[c.statutCommune] = (counts[c.statutCommune] ?? 0) + 1;
    n.children.forEach(walk);
  };
  walk(node);
  return counts;
}

function CommuneChip({ commune }: { commune: Commune }) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(`/communes/${commune.id}`)}
      title={`${commune.nom} — ${STATUT_LABEL[commune.statutCommune as StatutCommune] ?? commune.statutCommune} · ${commune.nombreApprenants} apprenants · ${commune.nombreEncadreurs} encadreurs · ${commune.nombreSessions} sessions`}
      className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-2.5 py-1 text-xs text-gray-700 dark:text-gray-200 hover:border-kct-gold hover:shadow-sm transition"
    >
      <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: couleurStatutCommune(commune.statutCommune) }} />
      {commune.nom}
    </button>
  );
}

function StatusDots({ counts }: { counts: Record<string, number> }) {
  return (
    <span className="flex items-center gap-2">
      {(Object.keys(STATUT_COMMUNE_COLORS) as StatutCommune[]).filter((s) => counts[s]).map((s) => (
        <span key={s} className="flex items-center gap-1 text-[11px] text-gray-500 dark:text-gray-400" title={STATUT_LABEL[s]}>
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: STATUT_COMMUNE_COLORS[s] }} />{counts[s]}
        </span>
      ))}
    </span>
  );
}

function BranchView({ node, depth }: { node: Node; depth: number }) {
  const counts = useMemo(() => statusCounts(node), [node]);
  return (
    <div className={depth === 0 ? 'rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4' : 'mt-3 border-l-2 border-gray-200 dark:border-gray-700 pl-3'}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className={depth === 0 ? 'font-semibold text-gray-900 dark:text-gray-100' : 'text-sm font-medium text-gray-700 dark:text-gray-300'}>
          {node.territoire.nom}
          <span className="ml-2 text-[10px] font-normal uppercase tracking-wide text-gray-400">{NIVEAU_NOM[node.territoire.niveau] ?? ''}</span>
        </p>
        <StatusDots counts={counts} />
      </div>
      {node.communes.length > 0 && <div className="mt-2 flex flex-wrap gap-1.5">{node.communes.map((c) => <CommuneChip key={c.id} commune={c} />)}</div>}
      {node.children.map((child) => <BranchView key={child.territoire.id} node={child} depth={depth + 1} />)}
    </div>
  );
}

/**
 * Carte de déploiement schématique : régions → départements →
 * arrondissements → communes, chaque commune colorée par son statut réel
 * (terminée / en cours / non démarrée / suspendue). Ce n'est PAS une carte
 * géographique : l'API ne fournit ni coordonnées ni tracé (GeoJSON) — cette
 * vue en tient lieu sans inventer de géographie, et reste exacte pour tout
 * périmètre (l'API ne renvoie déjà que les territoires accessibles).
 */
export function DeploymentMap() {
  const { territoires, communes, loading } = useTerritoires();

  const roots = useMemo(() => {
    const nodes = new Map<string, Node>();
    for (const t of territoires.filter((x) => x.niveau <= 4)) nodes.set(t.id, { territoire: t, children: [], communes: [] });

    const byTerritoire = new Map<string, Territoire>(territoires.map((t) => [t.id, t]));
    const orphans: Commune[] = [];
    for (const c of communes) {
      const parentId = byTerritoire.get(c.territoireId)?.parentId ?? byTerritoire.get(c.id)?.parentId ?? null;
      const parent = parentId ? nodes.get(parentId) : undefined;
      if (parent) parent.communes.push(c);
      else orphans.push(c);
    }

    const tops: Node[] = [];
    for (const n of nodes.values()) {
      const parent = n.territoire.parentId ? nodes.get(n.territoire.parentId) : undefined;
      if (parent) parent.children.push(n);
      else tops.push(n);
    }
    // Racine nationale : on présente directement ses régions.
    const flat = tops.flatMap((n) => (n.territoire.niveau === 1 ? n.children : [n]));
    if (orphans.length > 0) flat.push({ territoire: { id: 'orphelines', nom: 'Autres communes', niveau: 5, parentId: null }, children: [], communes: orphans });
    return flat.filter((n) => n.communes.length > 0 || n.children.length > 0);
  }, [territoires, communes]);

  const total = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const c of communes) counts[c.statutCommune] = (counts[c.statutCommune] ?? 0) + 1;
    return counts;
  }, [communes]);

  if (loading && communes.length === 0) {
    return <div className="flex justify-center py-12"><Loader2 className="h-7 w-7 animate-spin text-kct-gold" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        {(Object.keys(STATUT_COMMUNE_COLORS) as StatutCommune[]).map((s) => (
          <div key={s} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <span className="h-3.5 w-3.5 rounded" style={{ backgroundColor: STATUT_COMMUNE_COLORS[s] }} />
            {STATUT_LABEL[s]} <span className="font-semibold text-gray-900 dark:text-gray-100">{total[s] ?? 0}</span>
          </div>
        ))}
      </div>
      {roots.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">Aucune commune dans votre périmètre.</p>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {roots.map((n) => <BranchView key={n.territoire.id} node={n} depth={0} />)}
        </div>
      )}
      <p className="text-[11px] text-gray-400">Vue schématique — le tracé géographique des communes sera affiché dès que le GeoJSON sera disponible.</p>
    </div>
  );
}
