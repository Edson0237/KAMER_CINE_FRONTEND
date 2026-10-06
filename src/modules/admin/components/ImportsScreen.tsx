import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronRight, Download, FileUp, Loader2, Upload } from 'lucide-react';
import { useAuthContext } from '@/shared/auth/AuthContext';
import { PageHeader, LoadingBlock, ErrorBlock, EmptyBlock } from '@/components/ui/page-blocks';
import { Button } from '@/components/ui/button';
import { importService, type ImportJob } from '../services/importService';

const CSV_MODELE = 'nom,prenom,territoireCode,dateNaissance,sexe,telephone\nMballa,Marie,OBALA,2004-03-12,F,677123456\n';

const POLL_MS = 3000;

function StatutBadge({ statut }: { statut: string }) {
  const style = statut === 'en_cours' ? 'bg-kct-yellow/15 text-kct-yellow' : statut === 'termine' || statut === 'termine_avec_erreurs' ? 'bg-kct-green/15 text-kct-green' : 'bg-kct-red/15 text-kct-red';
  return <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${style}`}>{statut}</span>;
}

/**
 * Import en masse d'apprenants (CSV). Le traitement est asynchrone côté API :
 * le job revient en « en_cours » et l'écran l'interroge jusqu'à sa
 * complétion. Une ligne hors périmètre ou invalide est comptée en erreur
 * sans bloquer les autres — le détail est consultable par job.
 */
export function ImportsScreen() {
  const { hasPermission } = useAuthContext();
  const canWrite = hasPermission('import:write');
  const fileRef = useRef<HTMLInputElement>(null);
  const [jobs, setJobs] = useState<ImportJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const load = useCallback(async () => {
    try {
      setJobs(await importService.list());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const enCours = jobs.some((j) => j.statut === 'en_cours');
  useEffect(() => {
    if (!enCours) return;
    const t = setInterval(load, POLL_MS);
    return () => clearInterval(t);
  }, [enCours, load]);

  const upload = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setUploadError('Seuls les fichiers .csv sont acceptés.');
      return;
    }
    setUploading(true);
    setUploadError(null);
    try {
      await importService.importerApprenants(file);
      await load();
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : 'Fichier refusé');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const downloadModele = () => {
    const url = URL.createObjectURL(new Blob([CSV_MODELE], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'modele-import-apprenants.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      <PageHeader icon={FileUp} title="Imports en masse" subtitle="Importer des apprenants depuis un fichier CSV"
        actions={<Button variant="outline" onClick={downloadModele}><Download className="mr-1.5 h-4 w-4" />Modèle CSV</Button>} />

      {canWrite && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files?.[0]; if (f) upload(f); }}
          className={`flex flex-col items-center gap-2 rounded-xl border-2 border-dashed p-8 text-center transition-colors ${dragging ? 'border-kct-gold bg-kct-gold/5' : 'border-gray-300 dark:border-gray-700'}`}
        >
          {uploading ? <Loader2 className="h-7 w-7 animate-spin text-kct-gold" /> : <Upload className="h-7 w-7 text-kct-gold" />}
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Glissez un fichier CSV ici ou</p>
          <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
          <Button size="sm" disabled={uploading} onClick={() => fileRef.current?.click()}>Choisir un fichier</Button>
          <p className="max-w-lg text-[11px] text-gray-400">
            Colonnes : nom, prenom, territoireCode, dateNaissance, sexe, telephone (les trois premières obligatoires). Une ligne hors de votre périmètre territorial est comptée en erreur sans bloquer les autres.
          </p>
          {uploadError && <p className="text-xs text-kct-red">{uploadError}</p>}
        </div>
      )}

      <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-400">Historique</h3>
      {loading ? <LoadingBlock />
        : error ? <ErrorBlock message={error} />
        : jobs.length === 0 ? <EmptyBlock title="Aucun import" hint="Les imports lancés apparaîtront ici avec leur résultat." icon={FileUp} />
        : (
          <div className="space-y-2">
            {[...jobs].sort((a, b) => b.date.localeCompare(a.date)).map((j) => {
              const open = expanded === j.id;
              const details = j.erreursDetail ?? [];
              return (
                <div key={j.id} className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                  <button className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left" onClick={() => setExpanded(open ? null : j.id)} disabled={details.length === 0}>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-gray-900 dark:text-gray-100">{j.fichierSource}</p>
                      <p className="text-xs text-gray-400">{new Date(j.date).toLocaleString('fr-FR')} · {j.nbLignesTraitees} ligne{j.nbLignesTraitees > 1 ? 's' : ''} traitée{j.nbLignesTraitees > 1 ? 's' : ''}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      {j.nbErreurs > 0 && <span className="text-xs font-semibold text-kct-red">{j.nbErreurs} erreur{j.nbErreurs > 1 ? 's' : ''}</span>}
                      {j.statut === 'en_cours' && <Loader2 className="h-4 w-4 animate-spin text-kct-yellow" />}
                      <StatutBadge statut={j.statut} />
                      {details.length > 0 && (open ? <ChevronDown className="h-4 w-4 text-gray-400" /> : <ChevronRight className="h-4 w-4 text-gray-400" />)}
                    </div>
                  </button>
                  {open && (
                    <ul className="max-h-60 space-y-1 overflow-y-auto border-t border-gray-100 dark:border-gray-800 px-4 py-3 text-xs text-kct-red">
                      {details.map((d, i) => <li key={i}>{d}</li>)}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        )}
    </div>
  );
}
