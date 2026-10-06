import { useEffect, useState } from 'react';
import { Download, FileBarChart, FileSpreadsheet, FileText, Loader2, Plus } from 'lucide-react';
import { useAuthContext } from '@/shared/auth/AuthContext';
import { useAsyncList } from '@/shared/hooks/useAsyncList';
import { fichierService } from '@/shared/api/fichierService';
import { useTerritoires } from '@/modules/territoire/hooks/useTerritoires';
import { PageHeader, LoadingBlock, ErrorBlock, EmptyBlock } from '@/components/ui/page-blocks';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { FormField, Input, Select, Textarea } from '@/components/ui/input';
import { rapportService } from '../services/rapportService';
import type { RapportGenere, RapportTemplate, TypePerimetre } from '../types';

const PERIMETRE: Record<TypePerimetre, { label: string; niveau: number }> = {
  communal: { label: 'Communal', niveau: 5 },
  departemental: { label: 'Départemental', niveau: 3 },
  regional: { label: 'Régional', niveau: 2 },
  national: { label: 'National', niveau: 1 },
};

const fmt = (iso: string) => new Date(iso).toLocaleDateString('fr-FR');

/** Gestion des modèles — monté seulement avec rapport_template:write. */
function TemplatesPanel({ templates, reload }: { templates: RapportTemplate[]; reload: () => void }) {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState('');
  const [nom, setNom] = useState('');
  const [structure, setStructure] = useState('{\n  "sections": []\n}');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(structure);
    } catch {
      setError('La structure doit être un JSON valide.');
      return;
    }
    if (!code.trim() || !nom.trim()) {
      setError('Le code et le nom sont obligatoires.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await rapportService.createTemplate({ code: code.trim(), nom: nom.trim(), structure: parsed });
      setOpen(false);
      setCode('');
      setNom('');
      reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Échec de la création');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-end"><Button onClick={() => setOpen(true)}><Plus className="mr-1.5 h-4 w-4" />Nouveau modèle</Button></div>
      <div className="space-y-2">
        {templates.map((t) => (
          <div key={t.id} className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-3">
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">{t.nom}</p>
              <p className="font-mono text-xs text-gray-400">{t.code}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${t.actif ? 'bg-kct-green/15 text-kct-green' : 'bg-gray-100 text-gray-500 dark:bg-gray-800'}`}>{t.actif ? 'Actif' : 'Inactif'}</span>
              {t.actif && <button onClick={async () => { await rapportService.desactiverTemplate(t.id); reload(); }} className="text-xs text-kct-red hover:underline">Désactiver</button>}
            </div>
          </div>
        ))}
      </div>
      <Modal open={open} onClose={() => setOpen(false)} title="Nouveau modèle de rapport" wide
        footer={<><Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button><Button onClick={save} disabled={saving}>{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Créer</Button></>}>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Code" required><Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="rapport_trimestriel" /></FormField>
            <FormField label="Nom" required><Input value={nom} onChange={(e) => setNom(e.target.value)} /></FormField>
          </div>
          <FormField label="Structure (JSON)" hint="Sections et codes d'indicateurs — ajouter un type de rapport = un nouveau modèle, sans code." error={error}>
            <Textarea className="min-h-[160px] font-mono text-xs" value={structure} onChange={(e) => setStructure(e.target.value)} />
          </FormField>
        </div>
      </Modal>
    </div>
  );
}

/** Rapports (§6.20) : génération PDF/Excel par périmètre et période, historique par territoire, modèles (admin/N1). */
export function RapportsScreen() {
  const { user, hasPermission } = useAuthContext();
  const { territoires } = useTerritoires();
  const templates = useAsyncList<RapportTemplate>(rapportService.listTemplates);
  const canGenerate = hasPermission('rapport:generer');
  const canTemplates = hasPermission('rapport_template:write');
  const nomTerritoire = (id: string) => territoires.find((t) => t.id === id)?.nom ?? id.slice(0, 8);
  const nomTemplate = (id: string) => templates.items.find((t) => t.id === id)?.nom ?? '—';

  const [tab, setTab] = useState<'rapports' | 'modeles'>('rapports');
  const [historiqueId, setHistoriqueId] = useState(user?.territoireId ?? '');
  const [historique, setHistorique] = useState<RapportGenere[]>([]);
  const [hLoading, setHLoading] = useState(false);
  const [hError, setHError] = useState<string | null>(null);

  const [open, setOpen] = useState(false);
  const [templateId, setTemplateId] = useState('');
  const [perimetre, setPerimetre] = useState<TypePerimetre>('communal');
  const [territoireId, setTerritoireId] = useState(user?.territoireId ?? '');
  const [debut, setDebut] = useState('');
  const [fin, setFin] = useState('');
  const [format, setFormat] = useState<'pdf' | 'excel'>('pdf');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const loadHistorique = async (id: string) => {
    if (!id) return setHistorique([]);
    setHLoading(true);
    setHError(null);
    try {
      setHistorique(await rapportService.listParTerritoire(id));
    } catch (e) {
      setHError(e instanceof Error ? e.message : 'Erreur de chargement');
    } finally {
      setHLoading(false);
    }
  };

  useEffect(() => {
    loadHistorique(historiqueId);
  }, [historiqueId]);

  const generate = async () => {
    if (!templateId || !territoireId || !debut || !fin) {
      setFormError('Modèle, territoire et période sont obligatoires.');
      return;
    }
    if (new Date(fin) < new Date(debut)) {
      setFormError('La fin de période doit suivre le début.');
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      await rapportService.generer({ templateId, typePerimetre: perimetre, territoireId, periodeDebut: debut, periodeFin: fin, format });
      setOpen(false);
      setHistoriqueId(territoireId);
      await loadHistorique(territoireId);
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Échec de la génération');
    } finally {
      setSaving(false);
    }
  };

  const actifs = templates.items.filter((t) => t.actif);
  const territoiresPerimetre = territoires.filter((t) => t.niveau === PERIMETRE[perimetre].niveau);

  return (
    <div className="space-y-5">
      <PageHeader
        icon={FileBarChart}
        title="Rapports"
        subtitle="Exports PDF et Excel par périmètre et par période"
        actions={canGenerate ? <Button onClick={() => setOpen(true)}><Plus className="mr-1.5 h-4 w-4" />Générer un rapport</Button> : undefined}
      />

      {canTemplates && (
        <div className="inline-flex rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-1">
          {([['rapports', 'Rapports générés'], ['modeles', 'Modèles']] as const).map(([k, label]) => (
            <button key={k} onClick={() => setTab(k)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${tab === k ? 'bg-kct-gold text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>{label}</button>
          ))}
        </div>
      )}

      {tab === 'modeles' && canTemplates ? <TemplatesPanel templates={templates.items} reload={templates.reload} /> : (
        <>
          <FormField label="Historique du territoire" className="max-w-xs">
            <Select value={historiqueId} onChange={(e) => setHistoriqueId(e.target.value)}>
              <option value="">Choisir un territoire…</option>
              {territoires.map((t) => <option key={t.id} value={t.id}>{t.nom} (N{t.niveau})</option>)}
            </Select>
          </FormField>
          {hLoading ? <LoadingBlock />
            : hError ? <ErrorBlock message={hError} />
            : historique.length === 0 ? <EmptyBlock title="Aucun rapport" hint={historiqueId ? 'Aucun rapport n\'a encore été généré pour ce territoire.' : 'Choisissez un territoire pour voir ses rapports.'} icon={FileBarChart} />
            : (
              <div className="space-y-2">
                {[...historique].sort((a, b) => b.dateGeneration.localeCompare(a.dateGeneration)).map((r) => (
                  <div key={r.id} className="flex items-center gap-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-3">
                    <div className="rounded-lg bg-kct-gold/10 p-2">{r.format === 'pdf' ? <FileText className="h-5 w-5 text-kct-gold" /> : <FileSpreadsheet className="h-5 w-5 text-kct-gold" />}</div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-gray-900 dark:text-gray-100">{nomTemplate(r.templateId)} — {nomTerritoire(r.territoireId)}</p>
                      <p className="text-xs text-gray-400">{PERIMETRE[r.typePerimetre].label} · {fmt(r.periodeDebut)} → {fmt(r.periodeFin)} · généré le {fmt(r.dateGeneration)}</p>
                    </div>
                    {r.fichierUrl ? (
                      <Button size="sm" variant="outline" onClick={() => fichierService.open(r.fichierUrl!)}><Download className="mr-1.5 h-3.5 w-3.5" />Télécharger</Button>
                    ) : <span className="text-[10px] font-semibold text-kct-yellow">{r.statut}</span>}
                  </div>
                ))}
              </div>
            )}
        </>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Générer un rapport"
        footer={<><Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button><Button onClick={generate} disabled={saving}>{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Générer</Button></>}>
        <div className="space-y-3">
          <FormField label="Modèle" required>
            <Select value={templateId} onChange={(e) => setTemplateId(e.target.value)}>
              <option value="">Sélectionner…</option>
              {actifs.map((t) => <option key={t.id} value={t.id}>{t.nom}</option>)}
            </Select>
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Périmètre" required>
              <Select value={perimetre} onChange={(e) => { setPerimetre(e.target.value as TypePerimetre); setTerritoireId(''); }}>
                {(Object.keys(PERIMETRE) as TypePerimetre[]).map((p) => <option key={p} value={p}>{PERIMETRE[p].label}</option>)}
              </Select>
            </FormField>
            <FormField label="Territoire" required>
              <Select value={territoireId} onChange={(e) => setTerritoireId(e.target.value)}>
                <option value="">Sélectionner…</option>
                {territoiresPerimetre.map((t) => <option key={t.id} value={t.id}>{t.nom}</option>)}
              </Select>
            </FormField>
            <FormField label="Début de période" required><Input type="date" value={debut} onChange={(e) => setDebut(e.target.value)} /></FormField>
            <FormField label="Fin de période" required><Input type="date" value={fin} onChange={(e) => setFin(e.target.value)} /></FormField>
          </div>
          <FormField label="Format" error={formError}>
            <Select value={format} onChange={(e) => setFormat(e.target.value as 'pdf' | 'excel')}>
              <option value="pdf">PDF</option>
              <option value="excel">Excel</option>
            </Select>
          </FormField>
        </div>
      </Modal>
    </div>
  );
}
