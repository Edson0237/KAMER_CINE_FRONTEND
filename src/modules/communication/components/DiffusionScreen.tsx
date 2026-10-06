import { useState } from 'react';
import { CheckCircle2, Loader2, Megaphone, Send } from 'lucide-react';
import { useAsyncList } from '@/shared/hooks/useAsyncList';
import { PageHeader, LoadingBlock, ErrorBlock, EmptyBlock } from '@/components/ui/page-blocks';
import { Button } from '@/components/ui/button';
import { FormField, Input, Select, Textarea } from '@/components/ui/input';
import { communicationService } from '../services/communicationService';
import { CiblageFields, EMPTY_CIBLAGE, ciblageError, ciblageToRequest, useCiblageLabel } from './CiblageFields';
import type { CanalDiffusion, Ciblage, Diffusion } from '../types';

const CANAUX: Array<{ value: CanalDiffusion; label: string }> = [
  { value: 'in_app', label: 'Dans l\'application' },
  { value: 'sms', label: 'SMS' },
  { value: 'email', label: 'Email' },
  { value: 'push', label: 'Push mobile' },
  { value: 'tous', label: 'Tous les canaux' },
];

/**
 * Diffusion de notifications (§6.17) — individuelle, par niveau, par
 * territoire ou globale. Les diffusions larges sont traitées de façon
 * asynchrone côté API : la réponse indique le nombre de destinataires déjà
 * résolu, l'historique montre la complétion.
 */
export function DiffusionScreen() {
  const { items, loading, error, reload } = useAsyncList<Diffusion>(communicationService.historiqueDiffusions);
  const ciblageLabel = useCiblageLabel();
  const [titre, setTitre] = useState('');
  const [corps, setCorps] = useState('');
  const [canal, setCanal] = useState<CanalDiffusion>('in_app');
  const [ciblage, setCiblage] = useState<Ciblage>(EMPTY_CIBLAGE);
  const [sending, setSending] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [sent, setSent] = useState<Diffusion | null>(null);

  const send = async () => {
    const err = !titre.trim() || !corps.trim() ? 'Le titre et le message sont obligatoires.' : ciblageError(ciblage);
    if (err) {
      setFormError(err);
      return;
    }
    setSending(true);
    setFormError(null);
    setSent(null);
    try {
      const created = await communicationService.creerDiffusion({ titre: titre.trim(), corps: corps.trim(), canal, ...ciblageToRequest(ciblage) });
      setSent(created);
      setTitre('');
      setCorps('');
      reload();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Échec de l\'envoi');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader icon={Megaphone} title="Diffusion de notifications" subtitle="Communiquer avec une personne, un niveau, un territoire ou tout le réseau" />

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <div className="xl:col-span-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 space-y-3 h-fit">
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Nouvelle diffusion</h3>
          <FormField label="Titre" required><Input value={titre} maxLength={200} onChange={(e) => setTitre(e.target.value)} /></FormField>
          <FormField label="Message" required><Textarea value={corps} onChange={(e) => setCorps(e.target.value)} /></FormField>
          <FormField label="Canal">
            <Select value={canal} onChange={(e) => setCanal(e.target.value as CanalDiffusion)}>
              {CANAUX.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </Select>
          </FormField>
          <CiblageFields value={ciblage} onChange={setCiblage} />
          {formError && <p className="text-xs text-kct-red">{formError}</p>}
          {sent && (
            <p className="flex items-start gap-2 rounded-lg bg-kct-green/10 p-3 text-xs text-kct-green">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              Diffusion lancée — {sent.nbDestinataires} destinataire{sent.nbDestinataires > 1 ? 's' : ''} ({sent.statut}).
            </p>
          )}
          <Button onClick={send} disabled={sending} className="w-full">
            {sending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}Envoyer
          </Button>
        </div>

        <div className="xl:col-span-3 space-y-3">
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Historique de mes diffusions</h3>
          {loading && items.length === 0 ? <LoadingBlock />
            : error ? <ErrorBlock message={error} />
            : items.length === 0 ? <EmptyBlock title="Aucune diffusion" hint="Vos communications envoyées apparaîtront ici." icon={Megaphone} />
            : (
              <div className="space-y-2">
                {items.map((d) => (
                  <div key={d.id} className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-medium text-gray-900 dark:text-gray-100">{d.titre}</p>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${d.statut === 'terminee' ? 'bg-kct-green/15 text-kct-green' : 'bg-kct-yellow/15 text-kct-yellow'}`}>{d.statut}</span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">{d.corps}</p>
                    <p className="mt-2 text-[11px] text-gray-400">
                      {ciblageLabel(d)} · {d.canal} · {d.nbDestinataires} destinataire{d.nbDestinataires > 1 ? 's' : ''} · {new Date(d.dateCreation).toLocaleString('fr-FR')}
                    </p>
                  </div>
                ))}
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
