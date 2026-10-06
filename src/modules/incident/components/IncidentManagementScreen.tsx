import { useMemo, useState } from 'react';
import { AlertTriangle, Plus, Siren, UserCheck, UserX } from 'lucide-react';
import { useAuthContext } from '@/shared/auth/AuthContext';
import { useUsers } from '@/modules/admin/hooks/useAdmin';
import { PageHeader, LoadingBlock, ErrorBlock, EmptyBlock, StatTile } from '@/components/ui/page-blocks';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Input, Select } from '@/components/ui/input';
import { useIncidents } from '../hooks/useIncidents';
import { useMesIncidents } from '../hooks/useMesIncidents';
import { IncidentReportModal } from './IncidentReportModal';
import { GraviteBadge, IncidentStatutBadge, STATUT_LABEL, TYPE_ICON, TYPE_LABEL } from './incidentUi';
import type { Incident, IncidentGravite, IncidentStatut, IncidentType } from '../types';

const COLUMNS: IncidentStatut[] = ['nouveau', 'en_cours', 'resolu', 'ferme'];

interface Action { label: string; statut: IncidentStatut; assignerMoi?: boolean; variant?: 'default' | 'outline' }

function actionsFor(statut: IncidentStatut): Action[] {
  switch (statut) {
    case 'nouveau': return [{ label: 'Prendre en charge', statut: 'en_cours', assignerMoi: true }];
    case 'en_cours': return [{ label: 'Marquer résolu', statut: 'resolu' }];
    case 'resolu': return [{ label: 'Clôturer', statut: 'ferme' }, { label: 'Rouvrir', statut: 'en_cours', variant: 'outline' }];
    case 'ferme': return [{ label: 'Rouvrir', statut: 'en_cours', variant: 'outline' }];
  }
}

const shortId = (id: string | null) => (id ? id.slice(0, 8) : '—');

/** Sélecteur d'assignation — monté seulement si l'utilisateur peut lister les comptes (utilisateur:read). */
function AssigneeSelect({ value, disabled, onChange }: { value: string | null; disabled: boolean; onChange: (id: string | null) => void }) {
  const { users } = useUsers();
  return (
    <Select value={value ?? ''} disabled={disabled} onChange={(e) => onChange(e.target.value || null)}>
      <option value="">Non assigné</option>
      {users.filter((u) => u.actif).map((u) => <option key={u.id} value={u.id}>{u.nom} — {u.roleCode}</option>)}
    </Select>
  );
}

function IncidentCard({ incident, onOpen }: { incident: Incident; onOpen: () => void }) {
  const { user } = useAuthContext();
  const Icon = TYPE_ICON[incident.type];
  return (
    <button
      onClick={onOpen}
      className="w-full text-left rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3 shadow-sm hover:border-kct-gold/50 transition-colors"
    >
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <span className="flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400"><Icon className="h-3.5 w-3.5 text-kct-gold" />{TYPE_LABEL[incident.type]}</span>
        <GraviteBadge gravite={incident.gravite} />
      </div>
      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-2">{incident.titre}</p>
      <p className="mt-1 text-[11px] text-gray-400 dark:text-gray-500">
        {new Date(incident.creeLe).toLocaleDateString('fr-FR')} · {incident.assigneA ? (incident.assigneA === user?.id ? 'Assigné à vous' : `Assigné ${shortId(incident.assigneA)}`) : 'Non assigné'}
      </p>
    </button>
  );
}

function IncidentDetailModal({
  incident, canWrite, onClose, onUpdate,
}: {
  incident: Incident | null;
  canWrite: boolean;
  onClose: () => void;
  onUpdate: (id: string, statut: IncidentStatut, assigneA: string | null) => Promise<void>;
}) {
  const { user, hasPermission } = useAuthContext();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async (statut: IncidentStatut, assigneA: string | null) => {
    if (!incident) return;
    setBusy(true);
    setError(null);
    try {
      await onUpdate(incident.id, statut, assigneA);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Échec de la mise à jour');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open={!!incident} onClose={onClose} title={incident?.titre ?? ''} wide>
      {incident && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <IncidentStatutBadge statut={incident.statut} />
            <GraviteBadge gravite={incident.gravite} />
            <span className="text-xs text-gray-500 dark:text-gray-400">{TYPE_LABEL[incident.type]}</span>
          </div>
          <p className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">{incident.description}</p>
          <dl className="grid grid-cols-2 gap-3 text-xs">
            <div><dt className="text-gray-400">Signalé le</dt><dd className="text-gray-800 dark:text-gray-200">{new Date(incident.creeLe).toLocaleString('fr-FR')}</dd></div>
            <div><dt className="text-gray-400">Signalé par</dt><dd className="text-gray-800 dark:text-gray-200">{incident.signalePar === user?.id ? 'Vous' : shortId(incident.signalePar)}</dd></div>
            <div><dt className="text-gray-400">Résolu le</dt><dd className="text-gray-800 dark:text-gray-200">{incident.resoluLe ? new Date(incident.resoluLe).toLocaleString('fr-FR') : '—'}</dd></div>
            <div><dt className="text-gray-400">Assigné à</dt><dd className="text-gray-800 dark:text-gray-200">{incident.assigneA ? (incident.assigneA === user?.id ? 'Vous' : shortId(incident.assigneA)) : 'Personne'}</dd></div>
          </dl>

          {canWrite && (
            <div className="space-y-3 border-t border-gray-200 dark:border-gray-800 pt-4">
              <div className="flex flex-wrap gap-2">
                {actionsFor(incident.statut).map((a) => (
                  <Button key={a.label} size="sm" variant={a.variant ?? 'default'} disabled={busy}
                    onClick={() => run(a.statut, a.assignerMoi ? (user?.id ?? null) : incident.assigneA)}>
                    {a.label}
                  </Button>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {incident.assigneA !== user?.id && (
                  <Button size="sm" variant="outline" disabled={busy} onClick={() => run(incident.statut, user?.id ?? null)}>
                    <UserCheck className="mr-1.5 h-3.5 w-3.5" /> M'assigner
                  </Button>
                )}
                {incident.assigneA && (
                  <Button size="sm" variant="outline" disabled={busy} onClick={() => run(incident.statut, null)}>
                    <UserX className="mr-1.5 h-3.5 w-3.5" /> Désassigner
                  </Button>
                )}
              </div>
              {hasPermission('utilisateur:read') && (
                <div>
                  <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">Assigner à un autre compte</p>
                  <AssigneeSelect value={incident.assigneA} disabled={busy} onChange={(id) => run(incident.statut, id)} />
                </div>
              )}
              {error && <p className="text-xs text-kct-red">{error}</p>}
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}

function AllIncidents() {
  const { hasPermission } = useAuthContext();
  const { incidents, synthese, loading, error, traiter } = useIncidents();
  const canWrite = hasPermission('incident:write');
  const [statut, setStatut] = useState<'' | IncidentStatut>('');
  const [gravite, setGravite] = useState<'' | IncidentGravite>('');
  const [type, setType] = useState<'' | IncidentType>('');
  const [q, setQ] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);

  const filtered = useMemo(
    () => incidents.filter((i) =>
      (!statut || i.statut === statut) && (!gravite || i.gravite === gravite) && (!type || i.type === type) &&
      (!q || `${i.titre} ${i.description}`.toLowerCase().includes(q.toLowerCase())),
    ),
    [incidents, statut, gravite, type, q],
  );
  const opened = incidents.find((i) => i.id === openId) ?? null;

  if (loading && incidents.length === 0) return <LoadingBlock label="Chargement des incidents…" />;
  if (error) return <ErrorBlock message={error} />;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatTile label="Ouverts" value={synthese?.ouvertsTotal ?? 0} tone="yellow" />
        <StatTile label="Critiques ouverts" value={synthese?.ouvertsCritiques ?? 0} tone="red" />
        <StatTile label="Résolus" value={incidents.filter((i) => i.statut === 'resolu').length} tone="green" />
        <StatTile label="Total dans le périmètre" value={incidents.length} />
      </div>

      <div className="flex flex-wrap gap-2">
        <Input className="max-w-xs" placeholder="Rechercher…" value={q} onChange={(e) => setQ(e.target.value)} />
        <Select className="w-40" value={statut} onChange={(e) => setStatut(e.target.value as '' | IncidentStatut)}>
          <option value="">Tous statuts</option>
          {COLUMNS.map((s) => <option key={s} value={s}>{STATUT_LABEL[s]}</option>)}
        </Select>
        <Select className="w-40" value={gravite} onChange={(e) => setGravite(e.target.value as '' | IncidentGravite)}>
          <option value="">Toutes gravités</option>
          <option value="faible">Faible</option>
          <option value="moyenne">Moyenne</option>
          <option value="critique">Critique</option>
        </Select>
        <Select className="w-40" value={type} onChange={(e) => setType(e.target.value as '' | IncidentType)}>
          <option value="">Tous types</option>
          {(Object.keys(TYPE_LABEL) as IncidentType[]).map((t) => <option key={t} value={t}>{TYPE_LABEL[t]}</option>)}
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyBlock title="Aucun incident" hint="Aucun incident ne correspond à ces filtres dans votre périmètre." icon={Siren} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {COLUMNS.map((col) => {
            const items = filtered.filter((i) => i.statut === col);
            return (
              <div key={col} className="rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 p-3">
                <div className="mb-3 flex items-center justify-between">
                  <IncidentStatutBadge statut={col} />
                  <span className="text-xs text-gray-400">{items.length}</span>
                </div>
                <div className="space-y-2">
                  {items.map((i) => <IncidentCard key={i.id} incident={i} onOpen={() => setOpenId(i.id)} />)}
                  {items.length === 0 && <p className="py-4 text-center text-xs text-gray-400">—</p>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <IncidentDetailModal
        incident={opened}
        canWrite={canWrite}
        onClose={() => setOpenId(null)}
        onUpdate={async (id, s, assigneA) => { await traiter(id, { statut: s, assigneA }); }}
      />
    </div>
  );
}

function MyIncidents() {
  const { incidents, loading, error } = useMesIncidents();
  const [openId, setOpenId] = useState<string | null>(null);
  if (loading && incidents.length === 0) return <LoadingBlock />;
  if (error) return <ErrorBlock message={error} />;
  if (incidents.length === 0) return <EmptyBlock title="Aucun signalement" hint="Les incidents que vous signalez apparaîtront ici avec leur avancement." icon={Siren} />;
  const opened = incidents.find((i) => i.id === openId) ?? null;
  return (
    <>
      <div className="space-y-2">
        {incidents.map((i) => (
          <button key={i.id} onClick={() => setOpenId(i.id)}
            className="flex w-full items-center gap-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-3 text-left hover:border-kct-gold/50">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">{i.titre}</p>
              <p className="text-[11px] text-gray-400">{new Date(i.creeLe).toLocaleString('fr-FR')}</p>
            </div>
            <GraviteBadge gravite={i.gravite} />
            <IncidentStatutBadge statut={i.statut} />
          </button>
        ))}
      </div>
      <IncidentDetailModal incident={opened} canWrite={false} onClose={() => setOpenId(null)} onUpdate={async () => {}} />
    </>
  );
}

/**
 * Écran Incidents (§6.15) — supervision (Kanban filtrable, prise en charge,
 * assignation, clôture) pour les titulaires de incident:read/write, et
 * suivi de ses propres signalements pour tout utilisateur. Le périmètre
 * territorial est appliqué par l'API : l'écran affiche ce qu'elle renvoie.
 */
export function IncidentManagementScreen() {
  const { hasPermission } = useAuthContext();
  const canSupervise = hasPermission('incident:read');
  const [tab, setTab] = useState<'tous' | 'mes'>(canSupervise ? 'tous' : 'mes');
  const [reportOpen, setReportOpen] = useState(false);
  const [refresh, setRefresh] = useState(0);

  return (
    <div className="space-y-5">
      <PageHeader
        icon={AlertTriangle}
        title="Incidents"
        subtitle="Signalement, suivi et traitement des incidents"
        actions={<Button onClick={() => setReportOpen(true)}><Plus className="mr-1.5 h-4 w-4" />Signaler un incident</Button>}
      />

      {canSupervise && (
        <div className="inline-flex rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-1">
          {([['tous', 'Tous les incidents'], ['mes', 'Mes signalements']] as const).map(([k, label]) => (
            <button key={k} onClick={() => setTab(k)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${tab === k ? 'bg-kct-gold text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
              {label}
            </button>
          ))}
        </div>
      )}

      {tab === 'tous' && canSupervise ? <AllIncidents key={refresh} /> : <MyIncidents key={refresh} />}

      <IncidentReportModal open={reportOpen} onClose={() => setReportOpen(false)} onCreated={() => setRefresh((n) => n + 1)} />
    </div>
  );
}
