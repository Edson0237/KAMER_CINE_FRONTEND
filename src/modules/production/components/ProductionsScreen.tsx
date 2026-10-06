import { useMemo, useRef, useState } from 'react';
import { Clapperboard, Eye, Loader2, Paperclip, Plus } from 'lucide-react';
import { useAuthContext } from '@/shared/auth/AuthContext';
import { useAsyncList } from '@/shared/hooks/useAsyncList';
import { fichierService } from '@/shared/api/fichierService';
import { useTerritoires } from '@/modules/territoire/hooks/useTerritoires';
import { PageHeader, LoadingBlock, ErrorBlock, EmptyBlock, StatTile } from '@/components/ui/page-blocks';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { FormField, Input, Select, Textarea } from '@/components/ui/input';
import { productionService } from '../services/productionService';
import { ProductionDetailModal } from './ProductionDetailModal';
import { TYPE_LABEL } from './productionUi';
import type { Production, ProductionType, StatutPublic } from '../types';

/** Productions audiovisuelles (§6.19) : films produits par les apprenants, équipe, récompenses, publication sur le site public. */
export function ProductionsScreen() {
  const { user, hasPermission } = useAuthContext();
  const { territoires } = useTerritoires();
  const { items, setItems, loading, error, reload } = useAsyncList<Production>(productionService.list);
  const fileRef = useRef<HTMLInputElement>(null);
  const nom = (id: string) => territoires.find((t) => t.id === id)?.nom ?? id.slice(0, 8);

  const [type, setType] = useState<'' | ProductionType>('');
  const [statut, setStatut] = useState<'' | StatutPublic>('');
  const [q, setQ] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [open, setOpen] = useState(false);
  const [territoireId, setTerritoireId] = useState(user?.territoireId ?? '');
  const [titre, setTitre] = useState('');
  const [nType, setNType] = useState<ProductionType>('court_metrage');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [lien, setLien] = useState('');
  const [fichierCle, setFichierCle] = useState<string | null>(null);
  const [fichierNom, setFichierNom] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const filtered = useMemo(
    () => items.filter((p) => (!type || p.type === type) && (!statut || p.statutPublic === statut) && (!q || p.titre.toLowerCase().includes(q.toLowerCase()))),
    [items, type, statut, q],
  );
  const selected = items.find((p) => p.id === selectedId) ?? null;

  const attach = async (file: File) => {
    setSaving(true);
    try {
      setFichierCle(await fichierService.upload(file, 'production_fichier'));
      setFichierNom(file.name);
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Échec du téléversement');
    } finally {
      setSaving(false);
    }
  };

  const save = async () => {
    if (!territoireId || !titre.trim()) {
      setFormError('Le territoire et le titre sont obligatoires.');
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      await productionService.create({
        territoireId, titre: titre.trim(), type: nType, description: description.trim() || undefined,
        dateRealisation: date || undefined, fichierUrl: fichierCle ?? undefined, lienDiffusion: lien.trim() || undefined,
      });
      setOpen(false);
      setTitre('');
      setDescription('');
      setLien('');
      setFichierCle(null);
      setFichierNom('');
      reload();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Échec de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        icon={Clapperboard}
        title="Productions"
        subtitle="Films et réalisations des apprenants"
        actions={hasPermission('production:write') ? <Button onClick={() => setOpen(true)}><Plus className="mr-1.5 h-4 w-4" />Nouvelle production</Button> : undefined}
      />

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <StatTile label="Productions" value={items.length} />
        <StatTile label="Visibles sur le site public" value={items.filter((p) => p.statutPublic === 'visible_v4').length} tone="green" />
        <StatTile label="Privées" value={items.filter((p) => p.statutPublic === 'prive').length} />
      </div>

      <div className="flex flex-wrap gap-2">
        <Input className="max-w-xs" placeholder="Rechercher un titre…" value={q} onChange={(e) => setQ(e.target.value)} />
        <Select className="w-48" value={type} onChange={(e) => setType(e.target.value as '' | ProductionType)}>
          <option value="">Tous les types</option>
          {(Object.keys(TYPE_LABEL) as ProductionType[]).map((t) => <option key={t} value={t}>{TYPE_LABEL[t]}</option>)}
        </Select>
        <Select className="w-52" value={statut} onChange={(e) => setStatut(e.target.value as '' | StatutPublic)}>
          <option value="">Toute visibilité</option>
          <option value="prive">Privées</option>
          <option value="visible_v4">Visibles sur le site public</option>
        </Select>
      </div>

      {loading && items.length === 0 ? <LoadingBlock />
        : error ? <ErrorBlock message={error} />
        : filtered.length === 0 ? <EmptyBlock title="Aucune production" hint="Aucune production ne correspond à ces critères dans votre périmètre." icon={Clapperboard} />
        : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((p) => (
              <button key={p.id} onClick={() => setSelectedId(p.id)}
                className="text-left rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden hover:border-kct-gold/50 transition-colors">
                <div className="flex h-28 items-center justify-center bg-gradient-to-br from-kct-noir to-kct-noir/80">
                  <Clapperboard className="h-9 w-9 text-kct-gold" />
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-gray-900 dark:text-gray-100 line-clamp-2">{p.titre}</p>
                    {p.statutPublic === 'visible_v4' && <Eye className="h-4 w-4 shrink-0 text-kct-green" />}
                  </div>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{TYPE_LABEL[p.type]} · {nom(p.territoireId)}</p>
                  {p.dateRealisation && <p className="text-[11px] text-gray-400">{new Date(p.dateRealisation).toLocaleDateString('fr-FR')}</p>}
                </div>
              </button>
            ))}
          </div>
        )}

      <ProductionDetailModal
        production={selected}
        territoireNom={selected ? nom(selected.territoireId) : ''}
        onClose={() => setSelectedId(null)}
        onChanged={(p) => setItems((prev) => prev.map((x) => (x.id === p.id ? p : x)))}
      />

      <Modal open={open} onClose={() => setOpen(false)} title="Nouvelle production" wide
        footer={<><Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button><Button onClick={save} disabled={saving}>{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Enregistrer</Button></>}>
        <div className="space-y-3">
          <FormField label="Titre" required><Input value={titre} onChange={(e) => setTitre(e.target.value)} /></FormField>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <FormField label="Territoire" required>
              <Select value={territoireId} onChange={(e) => setTerritoireId(e.target.value)}>
                <option value="">Sélectionner…</option>
                {territoires.filter((t) => t.niveau === 5).map((t) => <option key={t.id} value={t.id}>{t.nom}</option>)}
              </Select>
            </FormField>
            <FormField label="Type" required>
              <Select value={nType} onChange={(e) => setNType(e.target.value as ProductionType)}>
                {(Object.keys(TYPE_LABEL) as ProductionType[]).map((t) => <option key={t} value={t}>{TYPE_LABEL[t]}</option>)}
              </Select>
            </FormField>
            <FormField label="Date de réalisation"><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></FormField>
          </div>
          <FormField label="Description"><Textarea value={description} onChange={(e) => setDescription(e.target.value)} /></FormField>
          <FormField label="Lien de diffusion" hint="YouTube, Vimeo… (optionnel)"><Input value={lien} onChange={(e) => setLien(e.target.value)} placeholder="https://" /></FormField>
          <div className="flex items-center gap-3">
            <input ref={fileRef} type="file" accept="video/*,image/*" className="hidden" onChange={(e) => e.target.files?.[0] && attach(e.target.files[0])} />
            <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={saving}><Paperclip className="mr-1.5 h-3.5 w-3.5" />Joindre un fichier</Button>
            {fichierNom && <span className="text-xs text-gray-500">{fichierNom}</span>}
          </div>
          {formError && <p className="text-xs text-kct-red">{formError}</p>}
        </div>
      </Modal>
    </div>
  );
}
