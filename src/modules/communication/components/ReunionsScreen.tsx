import { useEffect, useState } from 'react';
import { CalendarClock, Check, ExternalLink, Loader2, MapPin, Plus, Video, X } from 'lucide-react';
import { useAuthContext } from '@/shared/auth/AuthContext';
import { useAsyncList } from '@/shared/hooks/useAsyncList';
import { useUsers } from '@/modules/admin/hooks/useAdmin';
import { PageHeader, LoadingBlock, ErrorBlock, EmptyBlock } from '@/components/ui/page-blocks';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { FormField, Input, Select } from '@/components/ui/input';
import { communicationService } from '../services/communicationService';
import { CiblageFields, EMPTY_CIBLAGE, ciblageError, ciblageToRequest, useCiblageLabel } from './CiblageFields';
import type { Ciblage, Reunion, ReunionParticipant, ReunionType, StatutPresence } from '../types';

const PRESENCE_STYLE: Record<StatutPresence, string> = {
  invite: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
  present: 'bg-kct-green/15 text-kct-green',
  absent: 'bg-kct-red/15 text-kct-red',
};
const PRESENCE_LABEL: Record<StatutPresence, string> = { invite: 'Invité', present: 'Présent', absent: 'Absent' };

const fmt = (iso: string) => new Date(iso).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' });

function ParticipantRows({ participants, nameOf }: { participants: ReunionParticipant[]; nameOf: (id: string) => string }) {
  if (participants.length === 0) return <p className="text-xs text-gray-400">Aucun participant.</p>;
  return (
    <ul className="space-y-1.5">
      {participants.map((p) => (
        <li key={p.id} className="flex items-center justify-between text-sm">
          <span className="text-gray-800 dark:text-gray-200">{nameOf(p.utilisateurId)}</span>
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${PRESENCE_STYLE[p.statutPresence]}`}>{PRESENCE_LABEL[p.statutPresence]}</span>
        </li>
      ))}
    </ul>
  );
}

/** Résout les noms avec un seul appel — monté seulement avec utilisateur:read. */
function NamedParticipants({ participants }: { participants: ReunionParticipant[] }) {
  const { users } = useUsers();
  return <ParticipantRows participants={participants} nameOf={(id) => users.find((u) => u.id === id)?.nom ?? id.slice(0, 8)} />;
}

/** Invitation d'un compte supplémentaire — monté seulement avec utilisateur:read. */
function InviteControl({ participants, busy, onInvite }: { participants: ReunionParticipant[]; busy: boolean; onInvite: (id: string) => Promise<void> }) {
  const { users } = useUsers();
  const [invitee, setInvitee] = useState('');
  return (
    <div className="flex items-end gap-2 border-t border-gray-200 dark:border-gray-800 pt-4">
      <FormField label="Inviter une personne supplémentaire" className="flex-1">
        <Select value={invitee} onChange={(e) => setInvitee(e.target.value)}>
          <option value="">Sélectionner…</option>
          {users.filter((u) => u.actif && !participants.some((p) => p.utilisateurId === u.id)).map((u) => <option key={u.id} value={u.id}>{u.nom}</option>)}
        </Select>
      </FormField>
      <Button size="sm" disabled={!invitee || busy} onClick={() => onInvite(invitee).then(() => setInvitee(''))}>Inviter</Button>
    </div>
  );
}

function ReunionDetail({ reunion, onClose }: { reunion: Reunion | null; onClose: () => void }) {
  const { user, hasPermission } = useAuthContext();
  const canWrite = hasPermission('reunion:write');
  const canSeeNames = hasPermission('utilisateur:read');
  const [participants, setParticipants] = useState<ReunionParticipant[]>([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mine = participants.find((p) => p.utilisateurId === user?.id);

  useEffect(() => {
    if (!reunion) return;
    setLoading(true);
    setError(null);
    communicationService.listParticipants(reunion.id).then(setParticipants).catch(() => setParticipants([])).finally(() => setLoading(false));
  }, [reunion?.id]);

  const run = async (fn: () => Promise<ReunionParticipant>) => {
    if (!reunion) return;
    setBusy(true);
    setError(null);
    try {
      await fn();
      setParticipants(await communicationService.listParticipants(reunion.id));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Action refusée');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open={!!reunion} onClose={onClose} title={reunion?.titre ?? ''} wide>
      {reunion && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
            <span className="flex items-center gap-1.5"><CalendarClock className="h-4 w-4 text-kct-gold" />{fmt(reunion.dateDebut)} → {fmt(reunion.dateFin)}</span>
            <span className="flex items-center gap-1.5">{reunion.type === 'visio' ? <Video className="h-4 w-4 text-kct-gold" /> : <MapPin className="h-4 w-4 text-kct-gold" />}{reunion.type === 'visio' ? 'Visioconférence' : 'Présentiel'}</span>
          </div>
          {reunion.lienVisio && (
            <a href={reunion.lienVisio} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-kct-gold hover:underline">
              <ExternalLink className="h-4 w-4" />Rejoindre la réunion
            </a>
          )}

          {mine && (
            <div className="flex items-center gap-2 rounded-lg bg-kct-gold/5 border border-kct-gold/20 p-3">
              <span className="text-sm text-gray-700 dark:text-gray-300">Votre présence :</span>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${PRESENCE_STYLE[mine.statutPresence]}`}>{PRESENCE_LABEL[mine.statutPresence]}</span>
              <Button size="sm" variant="outline" className="ml-auto" disabled={busy} onClick={() => run(() => communicationService.confirmerPresence(reunion.id, 'present'))}><Check className="mr-1 h-3.5 w-3.5" />Je viens</Button>
              <Button size="sm" variant="outline" disabled={busy} onClick={() => run(() => communicationService.confirmerPresence(reunion.id, 'absent'))}><X className="mr-1 h-3.5 w-3.5" />Absent</Button>
            </div>
          )}

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Participants ({participants.length})</p>
            {loading ? <Loader2 className="h-5 w-5 animate-spin text-kct-gold" />
              : canSeeNames ? <NamedParticipants participants={participants} />
              : <ParticipantRows participants={participants} nameOf={(id) => (id === user?.id ? 'Vous' : id.slice(0, 8))} />}
          </div>

          {canWrite && canSeeNames && (
            <InviteControl participants={participants} busy={busy} onInvite={(id) => run(() => communicationService.inviter(reunion.id, id))} />
          )}
          {error && <p className="text-xs text-kct-red">{error}</p>}
        </div>
      )}
    </Modal>
  );
}

/** Réunions et visioconférences (§3.10) — planification avec ciblage, invitations, confirmation de présence. */
export function ReunionsScreen() {
  const { hasPermission } = useAuthContext();
  const canWrite = hasPermission('reunion:write');
  const { items, loading, error, reload } = useAsyncList<Reunion>(communicationService.listReunions);
  const ciblageLabel = useCiblageLabel();
  const [selected, setSelected] = useState<Reunion | null>(null);

  const [open, setOpen] = useState(false);
  const [titre, setTitre] = useState('');
  const [type, setType] = useState<ReunionType>('presentiel');
  const [debut, setDebut] = useState('');
  const [fin, setFin] = useState('');
  const [lien, setLien] = useState('');
  const [ciblage, setCiblage] = useState<Ciblage>(EMPTY_CIBLAGE);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const save = async () => {
    const err = !titre.trim() || !debut || !fin ? 'Titre, début et fin sont obligatoires.'
      : new Date(fin) <= new Date(debut) ? 'La fin doit être postérieure au début.'
      : type === 'visio' && !lien.trim() ? 'Le lien de visioconférence est obligatoire (Jitsi, Meet, Zoom…).'
      : ciblageError(ciblage);
    if (err) {
      setFormError(err);
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      await communicationService.planifierReunion({
        titre: titre.trim(), type, dateDebut: new Date(debut).toISOString(), dateFin: new Date(fin).toISOString(),
        lienVisio: type === 'visio' ? lien.trim() : undefined, ...ciblageToRequest(ciblage),
      });
      setOpen(false);
      setTitre('');
      setLien('');
      setCiblage(EMPTY_CIBLAGE);
      reload();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Échec de la planification');
    } finally {
      setSaving(false);
    }
  };

  const sorted = [...items].sort((a, b) => b.dateDebut.localeCompare(a.dateDebut));
  const now = Date.now();

  return (
    <div className="space-y-5">
      <PageHeader
        icon={CalendarClock}
        title="Réunions"
        subtitle="Réunions en présentiel et visioconférences"
        actions={canWrite ? <Button onClick={() => setOpen(true)}><Plus className="mr-1.5 h-4 w-4" />Planifier une réunion</Button> : undefined}
      />

      {loading && items.length === 0 ? <LoadingBlock />
        : error ? <ErrorBlock message={error} />
        : sorted.length === 0 ? <EmptyBlock title="Aucune réunion" hint="Les réunions que vous organisez ou auxquelles vous êtes invité apparaîtront ici." icon={CalendarClock} />
        : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {sorted.map((r) => {
              const past = new Date(r.dateFin).getTime() < now;
              return (
                <button key={r.id} onClick={() => setSelected(r)}
                  className="text-left rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 hover:border-kct-gold/50 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-gray-900 dark:text-gray-100">{r.titre}</p>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${past ? 'bg-gray-100 text-gray-500 dark:bg-gray-800' : 'bg-kct-green/15 text-kct-green'}`}>{past ? 'Passée' : 'À venir'}</span>
                  </div>
                  <p className="mt-2 flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-300">
                    {r.type === 'visio' ? <Video className="h-4 w-4 text-kct-gold" /> : <MapPin className="h-4 w-4 text-kct-gold" />}{fmt(r.dateDebut)}
                  </p>
                  <p className="mt-1 text-[11px] text-gray-400">Invités : {ciblageLabel(r)}</p>
                </button>
              );
            })}
          </div>
        )}

      <ReunionDetail reunion={selected} onClose={() => setSelected(null)} />

      <Modal open={open} onClose={() => setOpen(false)} title="Planifier une réunion" wide
        footer={<><Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button><Button onClick={save} disabled={saving}>{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Planifier</Button></>}>
        <div className="space-y-3">
          <FormField label="Titre" required><Input value={titre} onChange={(e) => setTitre(e.target.value)} /></FormField>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <FormField label="Type" required>
              <Select value={type} onChange={(e) => setType(e.target.value as ReunionType)}>
                <option value="presentiel">Présentiel</option>
                <option value="visio">Visioconférence</option>
              </Select>
            </FormField>
            <FormField label="Début" required><Input type="datetime-local" value={debut} onChange={(e) => setDebut(e.target.value)} /></FormField>
            <FormField label="Fin" required><Input type="datetime-local" value={fin} onChange={(e) => setFin(e.target.value)} /></FormField>
          </div>
          {type === 'visio' && (
            <FormField label="Lien de visioconférence" required hint="Lien externe (Jitsi, Meet, Zoom…) — la plateforme n'en génère pas.">
              <Input value={lien} onChange={(e) => setLien(e.target.value)} placeholder="https://meet.jit.si/…" />
            </FormField>
          )}
          <CiblageFields value={ciblage} onChange={setCiblage} />
          {formError && <p className="text-xs text-kct-red">{formError}</p>}
        </div>
      </Modal>
    </div>
  );
}
