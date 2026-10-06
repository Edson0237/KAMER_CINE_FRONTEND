import { useMemo, useRef, useState } from 'react';
import { BookOpen, FileText, Film, Loader2, Paperclip, Plus, ScrollText, FileSignature, Lightbulb, Layers } from 'lucide-react';
import { useAuthContext } from '@/shared/auth/AuthContext';
import { useAsyncList } from '@/shared/hooks/useAsyncList';
import { fichierService } from '@/shared/api/fichierService';
import { useRoles } from '@/modules/admin/hooks/useAdmin';
import { PageHeader, LoadingBlock, ErrorBlock, EmptyBlock } from '@/components/ui/page-blocks';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { FormField, Input, Select } from '@/components/ui/input';
import { communicationService } from '../services/communicationService';
import type { RessourceBibliotheque, RessourceType } from '../types';

const TYPE_CONFIG: Record<RessourceType, { label: string; icon: typeof FileText }> = {
  cours_video: { label: 'Cours vidéo', icon: Film },
  pdf: { label: 'PDF', icon: FileText },
  reglement: { label: 'Règlement', icon: ScrollText },
  guide: { label: 'Guide', icon: Lightbulb },
  contrat: { label: 'Contrat', icon: FileSignature },
  support: { label: 'Support', icon: Layers },
};

/** Sélecteur de rôle d'accès — monté seulement avec role:read (liste des rôles). */
function RoleSelect({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  const { roles } = useRoles();
  return (
    <Select value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">Tous les rôles</option>
      {roles.map((r) => <option key={r.id} value={r.id}>{r.libelle}</option>)}
    </Select>
  );
}

const openRessource = (url: string) => (/^https?:\/\//.test(url) ? window.open(url, '_blank', 'noopener') : fichierService.open(url));

/** Bibliothèque numérique (§3.10) : cours, règlements, guides, contrats, supports, filtrés par rôle côté API. */
export function BibliothequeScreen() {
  const { hasPermission } = useAuthContext();
  const canWrite = hasPermission('ressource_bibliotheque:write');
  const { items, loading, error, reload } = useAsyncList<RessourceBibliotheque>(communicationService.listRessources);
  const fileRef = useRef<HTMLInputElement>(null);

  const [type, setType] = useState<'' | RessourceType>('');
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [titre, setTitre] = useState('');
  const [nouveauType, setNouveauType] = useState<RessourceType>('pdf');
  const [categorie, setCategorie] = useState('');
  const [roleId, setRoleId] = useState('');
  const [fichierCle, setFichierCle] = useState<string | null>(null);
  const [fichierNom, setFichierNom] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const filtered = useMemo(
    () => items.filter((r) => (!type || r.type === type) && (!q || `${r.titre} ${r.categorie ?? ''}`.toLowerCase().includes(q.toLowerCase()))),
    [items, type, q],
  );
  const parCategorie = useMemo(() => {
    const map = new Map<string, RessourceBibliotheque[]>();
    for (const r of filtered) map.set(r.categorie ?? 'Sans catégorie', [...(map.get(r.categorie ?? 'Sans catégorie') ?? []), r]);
    return [...map.entries()];
  }, [filtered]);

  const attach = async (file: File) => {
    setSaving(true);
    try {
      setFichierCle(await fichierService.upload(file, 'bibliotheque_ressource'));
      setFichierNom(file.name);
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Échec du téléversement');
    } finally {
      setSaving(false);
    }
  };

  const save = async () => {
    if (!titre.trim() || !fichierCle) {
      setFormError('Le titre et un fichier sont obligatoires.');
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      await communicationService.ajouterRessource({ titre: titre.trim(), type: nouveauType, fichierUrl: fichierCle, categorie: categorie.trim() || undefined, niveauAccesRoleId: roleId || undefined });
      setOpen(false);
      setTitre('');
      setCategorie('');
      setFichierCle(null);
      setFichierNom('');
      reload();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Échec de l\'ajout');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        icon={BookOpen}
        title="Bibliothèque numérique"
        subtitle="Cours, règlements, guides et supports"
        actions={canWrite ? <Button onClick={() => setOpen(true)}><Plus className="mr-1.5 h-4 w-4" />Ajouter une ressource</Button> : undefined}
      />

      <div className="flex flex-wrap gap-2">
        <Input className="max-w-xs" placeholder="Rechercher…" value={q} onChange={(e) => setQ(e.target.value)} />
        <Select className="w-44" value={type} onChange={(e) => setType(e.target.value as '' | RessourceType)}>
          <option value="">Tous les types</option>
          {(Object.keys(TYPE_CONFIG) as RessourceType[]).map((t) => <option key={t} value={t}>{TYPE_CONFIG[t].label}</option>)}
        </Select>
      </div>

      {loading && items.length === 0 ? <LoadingBlock />
        : error ? <ErrorBlock message={error} />
        : parCategorie.length === 0 ? <EmptyBlock title="Aucune ressource" hint="Aucune ressource accessible à votre rôle pour ces critères." icon={BookOpen} />
        : parCategorie.map(([cat, list]) => (
          <section key={cat} className="space-y-2">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-400">{cat}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {list.map((r) => {
                const cfg = TYPE_CONFIG[r.type];
                return (
                  <button key={r.id} onClick={() => openRessource(r.fichierUrl)}
                    className="flex items-center gap-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 text-left hover:border-kct-gold/50 transition-colors">
                    <div className="rounded-lg bg-kct-gold/10 p-2.5"><cfg.icon className="h-5 w-5 text-kct-gold" /></div>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-gray-900 dark:text-gray-100">{r.titre}</p>
                      <p className="text-[11px] text-gray-400">{cfg.label} · ajouté le {new Date(r.dateAjout).toLocaleDateString('fr-FR')}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        ))}

      <Modal open={open} onClose={() => setOpen(false)} title="Ajouter une ressource"
        footer={<><Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button><Button onClick={save} disabled={saving}>{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Ajouter</Button></>}>
        <div className="space-y-3">
          <FormField label="Titre" required><Input value={titre} onChange={(e) => setTitre(e.target.value)} /></FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Type" required>
              <Select value={nouveauType} onChange={(e) => setNouveauType(e.target.value as RessourceType)}>
                {(Object.keys(TYPE_CONFIG) as RessourceType[]).map((t) => <option key={t} value={t}>{TYPE_CONFIG[t].label}</option>)}
              </Select>
            </FormField>
            <FormField label="Catégorie"><Input value={categorie} onChange={(e) => setCategorie(e.target.value)} placeholder="Ex. Réalisation" /></FormField>
          </div>
          {hasPermission('role:read') && (
            <FormField label="Accès réservé au rôle" hint="Par défaut, la ressource est visible par tous les rôles.">
              <RoleSelect value={roleId} onChange={setRoleId} />
            </FormField>
          )}
          <div className="flex items-center gap-3">
            <input ref={fileRef} type="file" className="hidden" onChange={(e) => e.target.files?.[0] && attach(e.target.files[0])} />
            <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={saving}><Paperclip className="mr-1.5 h-3.5 w-3.5" />Choisir le fichier</Button>
            {fichierNom && <span className="text-xs text-gray-500">{fichierNom}</span>}
          </div>
          {formError && <p className="text-xs text-kct-red">{formError}</p>}
        </div>
      </Modal>
    </div>
  );
}
