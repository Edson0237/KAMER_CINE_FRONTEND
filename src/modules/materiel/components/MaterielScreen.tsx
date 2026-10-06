import { useMemo, useState } from 'react';
import { Loader2, PackageOpen, Plus } from 'lucide-react';
import { useAuthContext } from '@/shared/auth/AuthContext';
import { useAsyncList } from '@/shared/hooks/useAsyncList';
import { useTerritoires } from '@/modules/territoire/hooks/useTerritoires';
import { PageHeader, LoadingBlock, ErrorBlock, EmptyBlock, StatTile } from '@/components/ui/page-blocks';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { FormField, Input, Select } from '@/components/ui/input';
import { materielService } from '../services/materielService';
import { ETAT_CONFIG, EtatBadge, formatDate, formatXaf } from './materielUi';
import { MaterielDetailModal } from './MaterielDetailModal';
import type { AffectationMateriel, Materiel, MaterielEtat } from '../types';

/** Affectations en cours/terminées d'un territoire — l'API exige le territoire (GET /affectations-materiel?territoireId=). */
function AffectationsTab({ materiels }: { materiels: Materiel[] }) {
  const { user, hasPermission } = useAuthContext();
  const { territoires } = useTerritoires();
  const [territoireId, setTerritoireId] = useState(user?.territoireId ?? '');
  const [items, setItems] = useState<AffectationMateriel[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async (id: string) => {
    setTerritoireId(id);
    if (!id) return setItems(null);
    setLoading(true);
    setError(null);
    try {
      setItems(await materielService.listAffectationsParTerritoire(id));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const nom = (id: string) => {
    const m = materiels.find((x) => x.id === id);
    return m ? `${m.marque ?? ''} ${m.modele ?? ''}`.trim() || m.numeroSerie : id.slice(0, 8);
  };

  return (
    <div className="space-y-4">
      <FormField label="Territoire" className="max-w-xs">
        <Select value={territoireId} onChange={(e) => load(e.target.value)}>
          <option value="">Choisir un territoire…</option>
          {territoires.map((t) => <option key={t.id} value={t.id}>{t.nom} (N{t.niveau})</option>)}
        </Select>
      </FormField>
      {loading ? <LoadingBlock />
        : error ? <ErrorBlock message={error} />
        : items === null ? <EmptyBlock title="Choisissez un territoire" hint="Les affectations sont consultées territoire par territoire." icon={PackageOpen} />
        : items.length === 0 ? <EmptyBlock title="Aucune affectation" hint="Aucun matériel n'est affecté à ce territoire." icon={PackageOpen} />
        : (
          <div className="space-y-2">
            {items.map((a) => (
              <div key={a.id} className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-3">
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{nom(a.materielId)}</p>
                  <p className="text-xs text-gray-400">Depuis le {formatDate(a.dateAffectation)}{a.dateRetour ? ` · retour le ${formatDate(a.dateRetour)}` : ''}</p>
                </div>
                {a.statut === 'en_cours' && hasPermission('affectation_materiel:write') ? (
                  <Button size="sm" variant="outline" disabled={busyId === a.id}
                    onClick={async () => { setBusyId(a.id); try { await materielService.cloturerAffectation(a.id); await load(territoireId); } finally { setBusyId(null); } }}>
                    Clôturer
                  </Button>
                ) : <span className={`text-[10px] font-semibold ${a.statut === 'en_cours' ? 'text-kct-yellow' : 'text-gray-400'}`}>{a.statut === 'en_cours' ? 'En cours' : 'Terminée'}</span>}
              </div>
            ))}
          </div>
        )}
    </div>
  );
}

/** Parc de matériel (§6.16) : inventaire, états, affectations aux territoires, maintenances. */
export function MaterielScreen() {
  const { hasPermission } = useAuthContext();
  const types = useAsyncList(materielService.listTypes);
  const parc = useAsyncList<Materiel>(materielService.list);
  const [tab, setTab] = useState<'parc' | 'affectations'>('parc');
  const [etat, setEtat] = useState<'' | MaterielEtat>('');
  const [typeId, setTypeId] = useState('');
  const [q, setQ] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [open, setOpen] = useState(false);
  const [nTypeId, setNTypeId] = useState('');
  const [serie, setSerie] = useState('');
  const [marque, setMarque] = useState('');
  const [modele, setModele] = useState('');
  const [dateAcq, setDateAcq] = useState('');
  const [valeur, setValeur] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const typeNom = (id: string) => types.items.find((t) => t.id === id);
  const filtered = useMemo(
    () => parc.items.filter((m) => (!etat || m.etat === etat) && (!typeId || m.typeMaterielId === typeId) &&
      (!q || `${m.numeroSerie} ${m.marque ?? ''} ${m.modele ?? ''}`.toLowerCase().includes(q.toLowerCase()))),
    [parc.items, etat, typeId, q],
  );
  const selected = parc.items.find((m) => m.id === selectedId) ?? null;

  const save = async () => {
    if (!nTypeId || !serie.trim()) {
      setFormError('Le type et le numéro de série sont obligatoires.');
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      await materielService.create({
        typeMaterielId: nTypeId, numeroSerie: serie.trim(), marque: marque.trim() || undefined, modele: modele.trim() || undefined,
        dateAcquisition: dateAcq || undefined, valeurAcquisition: valeur ? Number(valeur) : undefined,
      });
      setOpen(false);
      setSerie('');
      setMarque('');
      setModele('');
      setValeur('');
      parc.reload();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Échec de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        icon={PackageOpen}
        title="Matériel"
        subtitle="Parc, état, affectations aux territoires et maintenances"
        actions={hasPermission('materiel:write') ? <Button onClick={() => setOpen(true)}><Plus className="mr-1.5 h-4 w-4" />Nouveau matériel</Button> : undefined}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatTile label="Équipements" value={parc.items.length} />
        <StatTile label="En bon état / neufs" value={parc.items.filter((m) => m.etat === 'neuf' || m.etat === 'bon').length} tone="green" />
        <StatTile label="Usés" value={parc.items.filter((m) => m.etat === 'use').length} tone="yellow" />
        <StatTile label="Hors service" value={parc.items.filter((m) => m.etat === 'hors_service').length} tone="red" />
      </div>

      {hasPermission('affectation_materiel:read') && (
        <div className="inline-flex rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-1">
          {([['parc', 'Parc'], ['affectations', 'Affectations par territoire']] as const).map(([k, label]) => (
            <button key={k} onClick={() => setTab(k)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${tab === k ? 'bg-kct-gold text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>{label}</button>
          ))}
        </div>
      )}

      {tab === 'affectations' ? <AffectationsTab materiels={parc.items} /> : (
        <>
          <div className="flex flex-wrap gap-2">
            <Input className="max-w-xs" placeholder="Rechercher (série, marque, modèle)…" value={q} onChange={(e) => setQ(e.target.value)} />
            <Select className="w-44" value={etat} onChange={(e) => setEtat(e.target.value as '' | MaterielEtat)}>
              <option value="">Tous les états</option>
              {(Object.keys(ETAT_CONFIG) as MaterielEtat[]).map((k) => <option key={k} value={k}>{ETAT_CONFIG[k].label}</option>)}
            </Select>
            <Select className="w-48" value={typeId} onChange={(e) => setTypeId(e.target.value)}>
              <option value="">Tous les types</option>
              {types.items.map((t) => <option key={t.id} value={t.id}>{t.libelle}</option>)}
            </Select>
          </div>
          {parc.loading && parc.items.length === 0 ? <LoadingBlock />
            : parc.error ? <ErrorBlock message={parc.error} />
            : filtered.length === 0 ? <EmptyBlock title="Aucun matériel" hint="Aucun équipement ne correspond à ces critères." icon={PackageOpen} />
            : (
              <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-800 text-left text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      <th className="px-4 py-3 font-medium">Équipement</th><th className="px-4 py-3 font-medium">Type</th><th className="px-4 py-3 font-medium">N° série</th>
                      <th className="px-4 py-3 font-medium">Acquisition</th><th className="px-4 py-3 text-right font-medium">Valeur</th><th className="px-4 py-3 font-medium">État</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((m) => (
                      <tr key={m.id} onClick={() => setSelectedId(m.id)} className="cursor-pointer border-b border-gray-100 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/40">
                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{`${m.marque ?? ''} ${m.modele ?? ''}`.trim() || '—'}</td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{typeNom(m.typeMaterielId)?.libelle ?? '—'}</td>
                        <td className="px-4 py-3 font-mono text-xs text-gray-500">{m.numeroSerie}</td>
                        <td className="px-4 py-3 text-gray-500">{formatDate(m.dateAcquisition)}</td>
                        <td className="px-4 py-3 text-right">{formatXaf(m.valeurAcquisition)}</td>
                        <td className="px-4 py-3"><EtatBadge etat={m.etat} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
        </>
      )}

      <MaterielDetailModal
        materiel={selected}
        type={selected ? typeNom(selected.typeMaterielId) : undefined}
        onClose={() => setSelectedId(null)}
        onChanged={(m) => parc.setItems((prev) => prev.map((x) => (x.id === m.id ? m : x)))}
      />

      <Modal open={open} onClose={() => setOpen(false)} title="Nouveau matériel"
        footer={<><Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button><Button onClick={save} disabled={saving}>{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Enregistrer</Button></>}>
        <div className="space-y-3">
          <FormField label="Type" required>
            <Select value={nTypeId} onChange={(e) => setNTypeId(e.target.value)}>
              <option value="">Sélectionner…</option>
              {types.items.map((t) => <option key={t.id} value={t.id}>{t.libelle}</option>)}
            </Select>
          </FormField>
          <FormField label="Numéro de série" required error={formError}><Input value={serie} onChange={(e) => setSerie(e.target.value)} /></FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Marque"><Input value={marque} onChange={(e) => setMarque(e.target.value)} /></FormField>
            <FormField label="Modèle"><Input value={modele} onChange={(e) => setModele(e.target.value)} /></FormField>
            <FormField label="Date d'acquisition"><Input type="date" value={dateAcq} onChange={(e) => setDateAcq(e.target.value)} /></FormField>
            <FormField label="Valeur (XAF)"><Input type="number" min="0" value={valeur} onChange={(e) => setValeur(e.target.value)} /></FormField>
          </div>
        </div>
      </Modal>
    </div>
  );
}
