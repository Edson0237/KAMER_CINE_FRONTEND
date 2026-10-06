import { useRef, useState } from 'react';
import { FileText, Loader2, Paperclip, Plus, ScrollText, Send } from 'lucide-react';
import { useAuthContext } from '@/shared/auth/AuthContext';
import { useAsyncList } from '@/shared/hooks/useAsyncList';
import { fichierService } from '@/shared/api/fichierService';
import { PageHeader, LoadingBlock, ErrorBlock, EmptyBlock } from '@/components/ui/page-blocks';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { FormField, Input, Textarea } from '@/components/ui/input';
import { communicationService } from '../services/communicationService';
import { CiblageFields, EMPTY_CIBLAGE, ciblageError, ciblageToRequest, useCiblageLabel } from './CiblageFields';
import type { Ciblage, Circulaire } from '../types';

/**
 * Circulaires (§3.10) : brouillon → publiée. Rédigées et publiées par les
 * titulaires de circulaire:write (N1 par défaut) ; lues par les autres selon
 * le ciblage résolu côté API.
 */
export function CirculairesScreen() {
  const { hasPermission } = useAuthContext();
  const canWrite = hasPermission('circulaire:write');
  const { items, loading, error, reload } = useAsyncList<Circulaire>(communicationService.listCirculaires);
  const ciblageLabel = useCiblageLabel();
  const fileRef = useRef<HTMLInputElement>(null);

  const [open, setOpen] = useState(false);
  const [titre, setTitre] = useState('');
  const [contenu, setContenu] = useState('');
  const [ciblage, setCiblage] = useState<Ciblage>(EMPTY_CIBLAGE);
  const [fichierCle, setFichierCle] = useState<string | null>(null);
  const [fichierNom, setFichierNom] = useState('');
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const attach = async (file: File) => {
    setSaving(true);
    try {
      setFichierCle(await fichierService.upload(file, 'circulaire_piece_jointe'));
      setFichierNom(file.name);
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Échec du téléversement');
    } finally {
      setSaving(false);
    }
  };

  const save = async () => {
    const err = !titre.trim() || !contenu.trim() ? 'Le titre et le contenu sont obligatoires.' : ciblageError(ciblage);
    if (err) {
      setFormError(err);
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      await communicationService.creerCirculaire({ titre: titre.trim(), contenu: contenu.trim(), fichierJointUrl: fichierCle ?? undefined, ...ciblageToRequest(ciblage) });
      setOpen(false);
      setTitre('');
      setContenu('');
      setFichierCle(null);
      setFichierNom('');
      setCiblage(EMPTY_CIBLAGE);
      reload();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Échec de la création');
    } finally {
      setSaving(false);
    }
  };

  const publier = async (id: string) => {
    setBusyId(id);
    try {
      await communicationService.publierCirculaire(id);
      reload();
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        icon={ScrollText}
        title="Circulaires"
        subtitle="Communications officielles du réseau"
        actions={canWrite ? <Button onClick={() => setOpen(true)}><Plus className="mr-1.5 h-4 w-4" />Nouvelle circulaire</Button> : undefined}
      />

      {loading && items.length === 0 ? <LoadingBlock />
        : error ? <ErrorBlock message={error} />
        : items.length === 0 ? <EmptyBlock title="Aucune circulaire" hint="Les circulaires qui vous concernent apparaîtront ici." icon={ScrollText} />
        : (
          <div className="space-y-3">
            {items.map((c) => (
              <article key={c.id} className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">{c.titre}</h3>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${c.statut === 'publiee' ? 'bg-kct-green/15 text-kct-green' : 'bg-kct-yellow/15 text-kct-yellow'}`}>
                    {c.statut === 'publiee' ? 'Publiée' : 'Brouillon'}
                  </span>
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">{c.contenu}</p>
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-gray-400">
                  <span>Destinataires : {ciblageLabel(c)}</span>
                  {c.datePublication && <span>Publiée le {new Date(c.datePublication).toLocaleDateString('fr-FR')}</span>}
                  {c.fichierJointUrl && (
                    <button onClick={() => fichierService.open(c.fichierJointUrl!)} className="flex items-center gap-1 text-kct-gold hover:underline">
                      <FileText className="h-3.5 w-3.5" />Pièce jointe
                    </button>
                  )}
                  {canWrite && c.statut === 'brouillon' && (
                    <Button size="sm" className="ml-auto" disabled={busyId === c.id} onClick={() => publier(c.id)}>
                      {busyId === c.id ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Send className="mr-1.5 h-3.5 w-3.5" />}Publier
                    </Button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}

      <Modal open={open} onClose={() => setOpen(false)} title="Nouvelle circulaire" wide
        footer={<><Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button><Button onClick={save} disabled={saving}>{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Enregistrer en brouillon</Button></>}>
        <div className="space-y-3">
          <FormField label="Titre" required><Input value={titre} onChange={(e) => setTitre(e.target.value)} /></FormField>
          <FormField label="Contenu" required><Textarea className="min-h-[140px]" value={contenu} onChange={(e) => setContenu(e.target.value)} /></FormField>
          <CiblageFields value={ciblage} onChange={setCiblage} />
          <div className="flex items-center gap-3">
            <input ref={fileRef} type="file" className="hidden" onChange={(e) => e.target.files?.[0] && attach(e.target.files[0])} />
            <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={saving}><Paperclip className="mr-1.5 h-3.5 w-3.5" />Joindre un fichier</Button>
            {fichierNom && <span className="text-xs text-gray-500">{fichierNom}</span>}
          </div>
          {formError && <p className="text-xs text-kct-red">{formError}</p>}
        </div>
      </Modal>
    </div>
  );
}
