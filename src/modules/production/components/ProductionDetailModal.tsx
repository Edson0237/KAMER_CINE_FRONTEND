import { useCallback, useEffect, useState } from 'react';
import { Award, ExternalLink, Eye, EyeOff, FileVideo, Loader2, Plus, Trophy } from 'lucide-react';
import { useAuthContext } from '@/shared/auth/AuthContext';
import { fichierService } from '@/shared/api/fichierService';
import { formationService } from '@/modules/formation/services/formationService';
import type { Apprenant } from '@/modules/formation/types';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { FormField, Input, Select } from '@/components/ui/input';
import { productionService } from '../services/productionService';
import type { Production, ProductionApprenant, ProductionRole, Recompense } from '../types';
import { TYPE_LABEL } from './productionUi';

const ROLE_LABEL: Record<ProductionRole, string> = { realisateur: 'Réalisateur', acteur: 'Acteur', technicien: 'Technicien' };

interface Props {
  production: Production | null;
  territoireNom: string;
  onClose: () => void;
  onChanged: (p: Production) => void;
}

/** Fiche d'une production : équipe (apprenants associés), récompenses, publication (N1). */
export function ProductionDetailModal({ production, territoireNom, onClose, onChanged }: Props) {
  const { hasPermission } = useAuthContext();
  const [equipe, setEquipe] = useState<ProductionApprenant[]>([]);
  const [recompenses, setRecompenses] = useState<Recompense[]>([]);
  const [apprenants, setApprenants] = useState<Apprenant[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [aId, setAId] = useState('');
  const [aRole, setARole] = useState<ProductionRole>('acteur');
  const [showPrix, setShowPrix] = useState(false);
  const [festival, setFestival] = useState('');
  const [prix, setPrix] = useState('');
  const [annee, setAnnee] = useState(String(new Date().getFullYear()));
  const [niveau, setNiveau] = useState<'national' | 'international'>('national');

  const load = useCallback(async () => {
    if (!production) return;
    setEquipe(await productionService.listApprenants(production.id).catch(() => []));
    if (hasPermission('recompense:read')) setRecompenses(await productionService.listRecompenses(production.id).catch(() => []));
    if (hasPermission('apprenant:read')) {
      const page = await formationService.searchApprenants(production.territoireId, { size: 200 }).catch(() => null);
      setApprenants(page?.content ?? []);
    }
  }, [production, hasPermission]);

  useEffect(() => {
    setError(null);
    setShowPrix(false);
    setEquipe([]);
    setRecompenses([]);
    setApprenants([]);
    load();
  }, [production?.id]);

  const guard = async (fn: () => Promise<unknown>) => {
    setBusy(true);
    setError(null);
    try {
      await fn();
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Action refusée');
    } finally {
      setBusy(false);
    }
  };

  const nomApprenant = (id: string) => {
    const a = apprenants.find((x) => x.id === id);
    return a ? `${a.prenom} ${a.nom}` : id.slice(0, 8);
  };
  const canWrite = hasPermission('production:write');

  return (
    <Modal open={!!production} onClose={onClose} title={production?.titre ?? ''} wide>
      {production && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-kct-gold/10 px-2 py-0.5 text-[10px] font-semibold text-kct-gold">{TYPE_LABEL[production.type]}</span>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${production.statutPublic === 'visible_v4' ? 'bg-kct-green/15 text-kct-green' : 'bg-gray-100 text-gray-500 dark:bg-gray-800'}`}>
              {production.statutPublic === 'visible_v4' ? 'Visible sur le site public' : 'Privée'}
            </span>
            <span className="text-xs text-gray-400">{territoireNom}{production.dateRealisation ? ` · réalisée le ${new Date(production.dateRealisation).toLocaleDateString('fr-FR')}` : ''}</span>
          </div>
          {production.description && <p className="text-sm text-gray-700 dark:text-gray-300">{production.description}</p>}
          <div className="flex flex-wrap gap-4 text-sm">
            {production.fichierUrl && <button onClick={() => fichierService.open(production.fichierUrl!)} className="flex items-center gap-1.5 text-kct-gold hover:underline"><FileVideo className="h-4 w-4" />Voir le fichier</button>}
            {production.lienDiffusion && <a href={production.lienDiffusion} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-kct-gold hover:underline"><ExternalLink className="h-4 w-4" />Lien de diffusion</a>}
          </div>

          {hasPermission('production:publier') && production.statutPublic === 'prive' && (
            <Button size="sm" disabled={busy} onClick={() => guard(async () => onChanged(await productionService.publier(production.id)))}>
              <Eye className="mr-1.5 h-4 w-4" />Publier sur le site public
            </Button>
          )}
          {production.statutPublic === 'visible_v4' && <p className="flex items-center gap-1.5 text-xs text-gray-400"><EyeOff className="h-3.5 w-3.5" />La dépublication n'est pas prévue par l'API.</p>}

          <section>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Équipe ({equipe.length})</p>
            {equipe.length === 0 ? <p className="text-xs text-gray-400">Aucun apprenant associé.</p> : (
              <ul className="space-y-1.5">
                {equipe.map((e) => (
                  <li key={e.id} className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-800 px-3 py-2 text-sm">
                    <span className="text-gray-800 dark:text-gray-200">{nomApprenant(e.apprenantId)}</span>
                    <span className="text-xs text-gray-500">{ROLE_LABEL[e.role]}</span>
                  </li>
                ))}
              </ul>
            )}
            {canWrite && apprenants.length > 0 && (
              <div className="mt-3 flex flex-wrap items-end gap-2">
                <FormField label="Associer un apprenant" className="min-w-[200px] flex-1">
                  <Select value={aId} onChange={(e) => setAId(e.target.value)}>
                    <option value="">Sélectionner…</option>
                    {apprenants.filter((a) => !equipe.some((e) => e.apprenantId === a.id)).map((a) => <option key={a.id} value={a.id}>{a.prenom} {a.nom}</option>)}
                  </Select>
                </FormField>
                <FormField label="Rôle" className="w-40">
                  <Select value={aRole} onChange={(e) => setARole(e.target.value as ProductionRole)}>
                    {(Object.keys(ROLE_LABEL) as ProductionRole[]).map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
                  </Select>
                </FormField>
                <Button size="sm" disabled={!aId || busy} onClick={() => guard(async () => { await productionService.associerApprenant(production.id, aId, aRole); setAId(''); })}>
                  <Plus className="mr-1 h-3.5 w-3.5" />Associer
                </Button>
              </div>
            )}
          </section>

          {hasPermission('recompense:read') && (
            <section>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Récompenses ({recompenses.length})</p>
                {hasPermission('recompense:write') && <Button size="sm" variant="outline" onClick={() => setShowPrix(!showPrix)}><Trophy className="mr-1 h-3.5 w-3.5" />Enregistrer</Button>}
              </div>
              {showPrix && (
                <div className="mb-3 grid grid-cols-1 sm:grid-cols-2 gap-2 rounded-lg border border-gray-200 dark:border-gray-800 p-3">
                  <FormField label="Festival"><Input value={festival} onChange={(e) => setFestival(e.target.value)} /></FormField>
                  <FormField label="Prix"><Input value={prix} onChange={(e) => setPrix(e.target.value)} /></FormField>
                  <FormField label="Année"><Input type="number" value={annee} onChange={(e) => setAnnee(e.target.value)} /></FormField>
                  <FormField label="Portée">
                    <Select value={niveau} onChange={(e) => setNiveau(e.target.value as 'national' | 'international')}>
                      <option value="national">National</option>
                      <option value="international">International</option>
                    </Select>
                  </FormField>
                  <div className="sm:col-span-2 flex justify-end">
                    <Button size="sm" disabled={busy || !festival.trim() || !prix.trim()}
                      onClick={() => guard(async () => { await productionService.enregistrerRecompense(production.id, { nomFestival: festival.trim(), nomPrix: prix.trim(), annee: Number(annee), niveau }); setShowPrix(false); setFestival(''); setPrix(''); })}>
                      {busy && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}Enregistrer
                    </Button>
                  </div>
                </div>
              )}
              {recompenses.length === 0 ? <p className="text-xs text-gray-400">Aucune récompense.</p> : (
                <ul className="space-y-1.5">
                  {recompenses.map((r) => (
                    <li key={r.id} className="flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-800 px-3 py-2 text-sm">
                      <Award className="h-4 w-4 text-kct-gold" />
                      <span className="text-gray-800 dark:text-gray-200">{r.nomPrix} — {r.nomFestival} ({r.annee})</span>
                      <span className="ml-auto text-[10px] font-semibold uppercase text-gray-400">{r.niveau}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}
          {error && <p className="text-xs text-kct-red">{error}</p>}
        </div>
      )}
    </Modal>
  );
}
