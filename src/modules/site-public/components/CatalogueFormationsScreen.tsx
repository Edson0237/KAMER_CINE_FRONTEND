import { useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, GraduationCap } from 'lucide-react';
import { useAuthContext } from '@/shared/auth/AuthContext';
import { useAsyncList } from '@/shared/hooks/useAsyncList';
import { PageHeader, LoadingBlock, ErrorBlock, EmptyBlock, StatTile } from '@/components/ui/page-blocks';
import { Input } from '@/components/ui/input';
import { catalogueService, type Filiere, type FiliereStatut } from '@/modules/formation/services/catalogueService';

/**
 * Catalogue des formations (§4bis) : corps de métier et filières. Le statut
 * ACTIVE / A_VENIR d'une filière pilote son affichage sur le site public ;
 * le basculer exige la permission filiere:write. L'édition bilingue FR/EN
 * des fiches reste prévue en phase W5 (voir le document de référence).
 */
export function CatalogueFormationsScreen() {
  const { hasPermission } = useAuthContext();
  const canWrite = hasPermission('filiere:write');
  const corps = useAsyncList(catalogueService.listCorpsMetier);
  const filieres = useAsyncList<Filiere>(() => catalogueService.listFilieres());
  const [open, setOpen] = useState<Set<string>>(new Set());
  const [q, setQ] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const parCorps = useMemo(() => {
    const map = new Map<string, Filiere[]>();
    for (const f of filieres.items) {
      if (q && !f.nom.toLowerCase().includes(q.toLowerCase())) continue;
      map.set(f.corpsMetierId, [...(map.get(f.corpsMetierId) ?? []), f]);
    }
    return map;
  }, [filieres.items, q]);

  const toggle = async (f: Filiere) => {
    const next: FiliereStatut = f.statut === 'ACTIVE' ? 'A_VENIR' : 'ACTIVE';
    setBusyId(f.id);
    setError(null);
    try {
      const updated = await catalogueService.updateStatut(f.id, next);
      filieres.setItems((prev) => prev.map((x) => (x.id === f.id ? updated : x)));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Modification refusée');
    } finally {
      setBusyId(null);
    }
  };

  const actives = filieres.items.filter((f) => f.statut === 'ACTIVE').length;
  const loading = (corps.loading && corps.items.length === 0) || (filieres.loading && filieres.items.length === 0);

  return (
    <div className="space-y-5">
      <PageHeader icon={GraduationCap} title="Catalogue des formations" subtitle="Corps de métier et filières affichés sur le site public" />

      <div className="grid grid-cols-3 gap-3">
        <StatTile label="Corps de métier" value={corps.items.length} />
        <StatTile label="Filières actives" value={actives} tone="green" />
        <StatTile label="Filières à venir" value={filieres.items.length - actives} tone="yellow" />
      </div>

      <Input className="max-w-xs" placeholder="Rechercher une filière…" value={q} onChange={(e) => setQ(e.target.value)} />
      {error && <ErrorBlock message={error} />}

      {loading ? <LoadingBlock />
        : corps.error || filieres.error ? <ErrorBlock message={(corps.error ?? filieres.error)!} />
        : corps.items.length === 0 ? <EmptyBlock title="Catalogue vide" icon={GraduationCap} />
        : (
          <div className="space-y-2">
            {[...corps.items].sort((a, b) => a.numero - b.numero).map((c) => {
              const list = parCorps.get(c.id) ?? [];
              if (q && list.length === 0) return null;
              const isOpen = open.has(c.id) || !!q;
              return (
                <div key={c.id} className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                  <button className="flex w-full items-center justify-between px-4 py-3 text-left"
                    onClick={() => { const next = new Set(open); if (next.has(c.id)) next.delete(c.id); else next.add(c.id); setOpen(next); }}>
                    <span className="flex items-center gap-2 font-medium text-gray-900 dark:text-gray-100">
                      {isOpen ? <ChevronDown className="h-4 w-4 text-gray-400" /> : <ChevronRight className="h-4 w-4 text-gray-400" />}
                      <span className="text-xs text-kct-gold">{String(c.numero).padStart(2, '0')}</span>{c.nom}
                    </span>
                    <span className="text-xs text-gray-400">{list.filter((f) => f.statut === 'ACTIVE').length} / {list.length} actives</span>
                  </button>
                  {isOpen && (
                    <ul className="divide-y divide-gray-100 dark:divide-gray-800 border-t border-gray-100 dark:border-gray-800">
                      {list.map((f) => (
                        <li key={f.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                          <span className="text-sm text-gray-800 dark:text-gray-200">{f.nom}</span>
                          <div className="flex items-center gap-3">
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${f.statut === 'ACTIVE' ? 'bg-kct-green/15 text-kct-green' : 'bg-kct-yellow/15 text-kct-yellow'}`}>{f.statut === 'ACTIVE' ? 'Active' : 'À venir'}</span>
                            {canWrite && (
                              <button disabled={busyId === f.id} onClick={() => toggle(f)} className="text-xs text-kct-gold hover:underline disabled:opacity-50">
                                {f.statut === 'ACTIVE' ? 'Passer à venir' : 'Activer'}
                              </button>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        )}
    </div>
  );
}
