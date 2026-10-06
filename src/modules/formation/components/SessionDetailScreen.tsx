import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Award, CalendarCheck, ClipboardList, FileCheck, Loader2, Lock, UserPlus } from 'lucide-react';
import { useAuthContext } from '@/shared/auth/AuthContext';
import { fichierService } from '@/shared/api/fichierService';
import { LoadingBlock, ErrorBlock, EmptyBlock, StatTile } from '@/components/ui/page-blocks';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { formationService } from '../services/formationService';
import type { Apprenant, Attestation, Presence, ResultatExamen, SessionFormation, StatutPresence, TauxReussite } from '../types';

type Tab = 'presences' | 'resultats' | 'attestations';

const PRESENCE_OPTIONS: Array<{ value: StatutPresence; label: string; active: string }> = [
  { value: 'present', label: 'Présent', active: 'bg-kct-green text-white border-kct-green' },
  { value: 'retard', label: 'Retard', active: 'bg-kct-yellow text-white border-kct-yellow' },
  { value: 'absent', label: 'Absent', active: 'bg-kct-red text-white border-kct-red' },
];

const today = () => new Date().toISOString().slice(0, 10);
const nomComplet = (a: Apprenant) => `${a.prenom} ${a.nom}`;

/**
 * Détail d'une session (§6.9) : présences par date, résultats d'examen
 * (notes sur 20) et attestations. L'API n'expose aucune liste globale de
 * présences/résultats/attestations — tout se consulte session par session,
 * d'où cet écran. Le taux de réussite est calculé par l'API à la clôture
 * (seuil configurable) : il est affiché tel quel, jamais recalculé ici.
 */
export function SessionDetailScreen() {
  const { id } = useParams<{ id: string }>();
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuthContext();

  const [session, setSession] = useState<SessionFormation | null>(null);
  const [apprenants, setApprenants] = useState<Apprenant[]>([]);
  const [presences, setPresences] = useState<Presence[]>([]);
  const [resultats, setResultats] = useState<ResultatExamen[]>([]);
  const [taux, setTaux] = useState<TauxReussite | null>(null);
  const [attestations, setAttestations] = useState<Record<string, Attestation>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const [date, setDate] = useState(today());
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [inscrireOpen, setInscrireOpen] = useState(false);
  const [selection, setSelection] = useState<Set<string>>(new Set());

  const canPresences = hasPermission('presence:read');
  const canResultats = hasPermission('resultat:read');
  const canAttestations = hasPermission('attestation:read') || hasPermission('attestation:write');
  const tabs = useMemo(() => {
    const t: Array<{ key: Tab; label: string; icon: typeof Award }> = [];
    if (canPresences) t.push({ key: 'presences', label: 'Présences', icon: ClipboardList });
    if (canResultats) t.push({ key: 'resultats', label: 'Résultats', icon: Award });
    if (canAttestations) t.push({ key: 'attestations', label: 'Attestations', icon: FileCheck });
    return t;
  }, [canPresences, canResultats, canAttestations]);
  const requested = params.get('tab') as Tab | null;
  const tab: Tab | undefined = tabs.find((t) => t.key === requested)?.key ?? tabs[0]?.key;

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const s = await formationService.getSession(id);
      setSession(s);
      const [page, pres, res] = await Promise.all([
        hasPermission('apprenant:read') ? formationService.searchApprenants(s.territoireId, { size: 200 }) : Promise.resolve(null),
        canPresences ? formationService.listPresences(id).catch(() => []) : Promise.resolve([]),
        canResultats ? formationService.listResultats(id).catch(() => []) : Promise.resolve([]),
      ]);
      setApprenants(page?.content ?? []);
      setPresences(pres);
      setResultats(res);
      setTaux(s.statut === 'cloturee' ? await formationService.getTauxReussite(id).catch(() => null) : null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Session introuvable');
    } finally {
      setLoading(false);
    }
  }, [id, canPresences, canResultats, hasPermission]);

  useEffect(() => {
    load();
  }, [load]);

  const guard = async (key: string, fn: () => Promise<unknown>) => {
    setBusy(key);
    setActionError(null);
    try {
      await fn();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Action refusée');
    } finally {
      setBusy(null);
    }
  };

  const presenceDuJour = (apprenantId: string) => [...presences].reverse().find((p) => p.apprenantId === apprenantId && p.date === date);
  const resultatDe = (apprenantId: string) => [...resultats].reverse().find((r) => r.apprenantId === apprenantId);
  const datesSaisies = useMemo(() => [...new Set(presences.map((p) => p.date))].sort().reverse(), [presences]);
  const cloturee = session?.statut === 'cloturee';

  if (loading) return <LoadingBlock label="Chargement de la session…" />;
  if (error || !session || !id) return <ErrorBlock message={error ?? 'Session introuvable'} />;

  const compte = (statut: string) => apprenants.filter((a) => presenceDuJour(a.id)?.statut === statut).length;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <Button variant="outline" size="icon" onClick={() => navigate('/sessions')}><ArrowLeft className="h-4 w-4" /></Button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{session.programme ?? 'Session de formation'}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {session.lieu ?? '—'} · {session.dateDebut ?? '—'}{session.dateFin ? ` → ${session.dateFin}` : ''}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${cloturee ? 'bg-kct-green/15 text-kct-green' : 'bg-kct-yellow/15 text-kct-yellow'}`}>{cloturee ? 'Clôturée' : session.statut}</span>
          {hasPermission('session:write') && !cloturee && (
            <>
              <Button variant="outline" size="sm" onClick={() => { setSelection(new Set()); setInscrireOpen(true); }}><UserPlus className="mr-1.5 h-4 w-4" />Inscrire</Button>
              <Button size="sm" disabled={busy === 'cloture'} onClick={() => guard('cloture', async () => { await formationService.cloturerSession(id); await load(); })}>
                {busy === 'cloture' ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Lock className="mr-1.5 h-4 w-4" />}Clôturer
              </Button>
            </>
          )}
        </div>
      </div>

      {taux && (
        <div className="grid grid-cols-3 gap-3">
          <StatTile label="Taux de réussite" value={`${Math.round(taux.tauxReussite)} %`} tone="green" />
          <StatTile label="Réussis" value={taux.totalReussis} />
          <StatTile label="Inscrits évalués" value={taux.totalApprenants} />
        </div>
      )}

      {tabs.length === 0 ? <EmptyBlock title="Accès non autorisé" hint="Votre profil ne permet de consulter ni les présences, ni les résultats." /> : (
        <div className="inline-flex rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-1">
          {tabs.map((t) => (
            <button key={t.key} onClick={() => setParams({ tab: t.key })}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${tab === t.key ? 'bg-kct-gold text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
              <t.icon className="h-4 w-4" />{t.label}
            </button>
          ))}
        </div>
      )}

      {actionError && <ErrorBlock message={actionError} />}

      {apprenants.length === 0 && tab ? (
        <EmptyBlock title="Aucun apprenant" hint="Aucun apprenant n'est rattaché au territoire de cette session." icon={CalendarCheck} />
      ) : tab === 'presences' ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-end gap-4">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
              Date de la séance
              <Input className="mt-1 w-48" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </label>
            <div className="flex gap-4 text-xs text-gray-500">
              <span><strong className="text-kct-green">{compte('present')}</strong> présents</span>
              <span><strong className="text-kct-yellow">{compte('retard')}</strong> en retard</span>
              <span><strong className="text-kct-red">{compte('absent')}</strong> absents</span>
            </div>
          </div>
          {datesSaisies.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {datesSaisies.map((d) => (
                <button key={d} onClick={() => setDate(d)} className={`rounded-full border px-2.5 py-0.5 text-[11px] ${d === date ? 'border-kct-gold bg-kct-gold/10 text-kct-gold' : 'border-gray-200 dark:border-gray-700 text-gray-500'}`}>{d}</button>
              ))}
            </div>
          )}
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800">
            {apprenants.map((a) => {
              const current = presenceDuJour(a.id);
              return (
                <div key={a.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5">
                  <span className="text-sm text-gray-900 dark:text-gray-100">{nomComplet(a)}</span>
                  <div className="flex gap-1.5">
                    {PRESENCE_OPTIONS.map((o) => (
                      <button key={o.value} disabled={!hasPermission('presence:write') || busy === a.id}
                        onClick={() => guard(a.id, async () => { await formationService.createPresence({ sessionId: id, apprenantId: a.id, date, statut: o.value }); setPresences(await formationService.listPresences(id)); })}
                        className={`rounded-md border px-2.5 py-1 text-xs font-medium transition-colors disabled:opacity-60 ${current?.statut === o.value ? o.active : 'border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                        {o.label}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : tab === 'resultats' ? (
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800">
          <p className="px-4 py-2 text-[11px] text-gray-400">Notes sur 20. Le seuil de réussite est configuré côté plateforme et appliqué à la clôture.</p>
          {apprenants.map((a) => {
            const r = resultatDe(a.id);
            const value = notes[a.id] ?? '';
            return (
              <div key={a.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5">
                <span className="text-sm text-gray-900 dark:text-gray-100">{nomComplet(a)}</span>
                <div className="flex items-center gap-2">
                  {r && <span className="rounded-full bg-gray-100 dark:bg-gray-800 px-2.5 py-0.5 text-xs font-semibold text-gray-700 dark:text-gray-200">{Number(r.note).toLocaleString('fr-FR')} / 20</span>}
                  {hasPermission('resultat:write') && (
                    <>
                      <Input className="w-24" type="number" min="0" max="20" step="0.25" placeholder="Note" value={value} onChange={(e) => setNotes({ ...notes, [a.id]: e.target.value })} />
                      <Button size="sm" variant="outline" disabled={value === '' || busy === a.id || Number(value) < 0 || Number(value) > 20}
                        onClick={() => guard(a.id, async () => { await formationService.createResultat({ sessionId: id, apprenantId: a.id, note: Number(value), dateExamen: today() }); setResultats(await formationService.listResultats(id)); setNotes({ ...notes, [a.id]: '' }); })}>
                        {busy === a.id ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Enregistrer'}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : tab === 'attestations' ? (
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800">
          <p className="px-4 py-2 text-[11px] text-gray-400">L'API contrôle l'éligibilité à l'émission ; l'attestation émise porte un numéro unique.</p>
          {apprenants.map((a) => {
            const att = attestations[a.id];
            return (
              <div key={a.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5">
                <span className="text-sm text-gray-900 dark:text-gray-100">{nomComplet(a)}
                  {resultatDe(a.id) && <span className="ml-2 text-xs text-gray-400">note {Number(resultatDe(a.id)!.note)} / 20</span>}
                </span>
                {att ? (
                  <span className="flex items-center gap-3 text-xs">
                    <span className="font-mono text-kct-green">{att.numero}</span>
                    {att.fichierUrl && <button onClick={() => fichierService.open(att.fichierUrl!)} className="text-kct-gold hover:underline">Ouvrir</button>}
                  </span>
                ) : hasPermission('attestation:write') ? (
                  <Button size="sm" variant="outline" disabled={busy === a.id}
                    onClick={() => guard(a.id, async () => { const created = await formationService.createAttestation(a.id, id); setAttestations({ ...attestations, [a.id]: created }); })}>
                    {busy === a.id ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Émettre l\'attestation'}
                  </Button>
                ) : null}
              </div>
            );
          })}
        </div>
      ) : null}

      <Modal open={inscrireOpen} onClose={() => setInscrireOpen(false)} title="Inscrire des apprenants"
        footer={
          <>
            <Button variant="outline" onClick={() => setInscrireOpen(false)}>Annuler</Button>
            <Button disabled={selection.size === 0 || busy === 'inscrire'}
              onClick={() => guard('inscrire', async () => { for (const aid of selection) await formationService.inscrire(id, aid); setInscrireOpen(false); })}>
              {busy === 'inscrire' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Inscrire ({selection.size})
            </Button>
          </>
        }>
        <div className="max-h-72 space-y-1 overflow-y-auto">
          {apprenants.map((a) => (
            <label key={a.id} className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-800">
              <input type="checkbox" checked={selection.has(a.id)}
                onChange={(e) => { const next = new Set(selection); if (e.target.checked) next.add(a.id); else next.delete(a.id); setSelection(next); }} />
              {nomComplet(a)}
            </label>
          ))}
        </div>
      </Modal>
      <p className="text-[11px] text-gray-400"><Link to="/sessions" className="hover:underline">← Retour aux sessions</Link></p>
    </div>
  );
}
