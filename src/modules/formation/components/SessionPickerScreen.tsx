import { useNavigate } from 'react-router-dom';
import { Award, CalendarCheck, ClipboardList, FileCheck, Search } from 'lucide-react';
import { useAuthContext } from '@/shared/auth/AuthContext';
import { PageHeader, LoadingBlock, ErrorBlock, EmptyBlock } from '@/components/ui/page-blocks';
import { Input } from '@/components/ui/input';
import { PaginationControls } from '@/shared/components/PaginationControls';
import { useSessionsPage } from '../hooks/useSessionsPage';

const CONFIG = {
  presences: { title: 'Présences', subtitle: 'Choisissez une session pour saisir ou consulter ses présences', icon: ClipboardList },
  resultats: { title: 'Résultats', subtitle: 'Choisissez une session pour saisir ou consulter ses résultats d\'examen', icon: Award },
  attestations: { title: 'Attestations', subtitle: 'Choisissez une session pour émettre ses attestations', icon: FileCheck },
} as const;

/**
 * Point d'entrée des écrans Présences / Résultats / Attestations : l'API
 * n'expose ces données que session par session (aucune liste globale), on
 * choisit donc d'abord la session puis on ouvre l'onglet correspondant.
 */
export function SessionPickerScreen({ tab }: { tab: keyof typeof CONFIG }) {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const { sessions, loading, error, page, setPage, totalPages, totalElements, size, search, setSearch } = useSessionsPage(user?.territoireId ?? undefined);
  const cfg = CONFIG[tab];

  return (
    <div className="space-y-5">
      <PageHeader icon={cfg.icon} title={cfg.title} subtitle={cfg.subtitle} />
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input className="pl-9" placeholder="Rechercher par lieu ou programme…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>
      {loading && sessions.length === 0 ? <LoadingBlock />
        : error ? <ErrorBlock message={error} />
        : sessions.length === 0 ? <EmptyBlock title="Aucune session" hint="Aucune session dans votre périmètre." icon={CalendarCheck} />
        : (
          <div className="space-y-2">
            {sessions.map((s) => (
              <button key={s.id} onClick={() => navigate(`/sessions/${s.id}?tab=${tab}`)}
                className="flex w-full items-center justify-between gap-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-3 text-left hover:border-kct-gold/50 transition-colors">
                <div className="min-w-0">
                  <p className="truncate font-medium text-gray-900 dark:text-gray-100">{s.programme ?? 'Session de formation'}</p>
                  <p className="text-xs text-gray-400">{s.lieu ?? '—'} · {s.dateDebut ?? '—'}</p>
                </div>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${s.statut === 'cloturee' ? 'bg-kct-green/15 text-kct-green' : 'bg-kct-yellow/15 text-kct-yellow'}`}>{s.statut}</span>
              </button>
            ))}
          </div>
        )}
      <PaginationControls page={page} totalPages={totalPages} totalElements={totalElements} size={size} onPageChange={setPage} />
    </div>
  );
}
