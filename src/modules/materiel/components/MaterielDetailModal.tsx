import { useCallback, useEffect, useState } from 'react';
import { Loader2, Plus, Wrench } from 'lucide-react';
import { useAuthContext } from '@/shared/auth/AuthContext';
import { useTerritoires } from '@/modules/territoire/hooks/useTerritoires';
import { useUsers } from '@/modules/admin/hooks/useAdmin';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { FormField, Input, Select } from '@/components/ui/input';
import { materielService } from '../services/materielService';
import { ETAT_CONFIG, EtatBadge, formatDate, formatXaf } from './materielUi';
import type { AffectationMateriel, MaintenanceMateriel, MaintenanceType, Materiel, MaterielEtat, TypeMateriel } from '../types';

/** Choix du responsable — monté seulement avec utilisateur:read (liste des comptes). */
function ResponsableSelect({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  const { users } = useUsers();
  return (
    <Select value={value} onChange={(e) => onChange(e.target.value)}>
      {users.filter((u) => u.actif).map((u) => <option key={u.id} value={u.id}>{u.nom}</option>)}
    </Select>
  );
}

interface Props {
  materiel: Materiel | null;
  type: TypeMateriel | undefined;
  onClose: () => void;
  onChanged: (m: Materiel) => void;
}

/** Fiche d'un matériel : état, affectations (avec clôture) et maintenances (préventive/corrective). */
export function MaterielDetailModal({ materiel, type, onClose, onChanged }: Props) {
  const { user, hasPermission } = useAuthContext();
  const { territoires } = useTerritoires();
  const [affectations, setAffectations] = useState<AffectationMateriel[]>([]);
  const [maintenances, setMaintenances] = useState<MaintenanceMateriel[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showAffect, setShowAffect] = useState(false);
  const [aTerritoire, setATerritoire] = useState('');
  const [aResponsable, setAResponsable] = useState(user?.id ?? '');
  const [aDate, setADate] = useState(new Date().toISOString().slice(0, 10));

  const [showMaint, setShowMaint] = useState(false);
  const [mType, setMType] = useState<MaintenanceType>('preventive');
  const [mDate, setMDate] = useState(new Date().toISOString().slice(0, 10));
  const [mDescription, setMDescription] = useState('');
  const [mCout, setMCout] = useState('');
  const [mPrestataire, setMPrestataire] = useState('');
  const [mProchaine, setMProchaine] = useState('');

  const load = useCallback(async () => {
    if (!materiel) return;
    if (hasPermission('affectation_materiel:read')) setAffectations(await materielService.listAffectations(materiel.id).catch(() => []));
    if (hasPermission('maintenance_materiel:read')) setMaintenances(await materielService.listMaintenances(materiel.id).catch(() => []));
  }, [materiel, hasPermission]);

  useEffect(() => {
    setError(null);
    setShowAffect(false);
    setShowMaint(false);
    setAffectations([]);
    setMaintenances([]);
    load();
  }, [materiel?.id]);

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

  const territoireNom = (id: string) => territoires.find((t) => t.id === id)?.nom ?? id.slice(0, 8);

  return (
    <Modal open={!!materiel} onClose={onClose} title={materiel ? `${materiel.marque ?? ''} ${materiel.modele ?? ''}`.trim() || materiel.numeroSerie : ''} wide>
      {materiel && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs text-gray-400">{type?.libelle ?? 'Matériel'} · N° {materiel.numeroSerie}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Acquis le {formatDate(materiel.dateAcquisition)} · {formatXaf(materiel.valeurAcquisition)}</p>
            </div>
            {hasPermission('materiel:write') ? (
              <Select className="w-44" value={materiel.etat} disabled={busy}
                onChange={(e) => guard(async () => onChanged(await materielService.changerEtat(materiel.id, e.target.value as MaterielEtat)))}>
                {(Object.keys(ETAT_CONFIG) as MaterielEtat[]).map((k) => <option key={k} value={k}>{ETAT_CONFIG[k].label}</option>)}
              </Select>
            ) : <EtatBadge etat={materiel.etat} />}
          </div>

          {hasPermission('affectation_materiel:read') && (
            <section>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Affectations</p>
                {hasPermission('affectation_materiel:write') && <Button size="sm" variant="outline" onClick={() => setShowAffect(!showAffect)}><Plus className="mr-1 h-3.5 w-3.5" />Affecter</Button>}
              </div>
              {showAffect && (
                <div className="mb-3 grid grid-cols-1 sm:grid-cols-3 gap-2 rounded-lg border border-gray-200 dark:border-gray-800 p-3">
                  <FormField label="Territoire">
                    <Select value={aTerritoire} onChange={(e) => setATerritoire(e.target.value)}>
                      <option value="">Sélectionner…</option>
                      {territoires.filter((t) => t.niveau === 5).map((t) => <option key={t.id} value={t.id}>{t.nom}</option>)}
                    </Select>
                  </FormField>
                  <FormField label="Responsable">
                    {hasPermission('utilisateur:read') ? <ResponsableSelect value={aResponsable} onChange={setAResponsable} /> : <Input value="Vous" disabled />}
                  </FormField>
                  <FormField label="Date"><Input type="date" value={aDate} onChange={(e) => setADate(e.target.value)} /></FormField>
                  <div className="sm:col-span-3 flex justify-end">
                    <Button size="sm" disabled={busy || !aTerritoire || !aResponsable}
                      onClick={() => guard(async () => { await materielService.affecter({ materielId: materiel.id, territoireId: aTerritoire, responsableId: aResponsable, dateAffectation: aDate }); setShowAffect(false); })}>
                      {busy && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}Confirmer
                    </Button>
                  </div>
                </div>
              )}
              {affectations.length === 0 ? <p className="text-xs text-gray-400">Aucune affectation.</p> : (
                <ul className="space-y-1.5">
                  {affectations.map((a) => (
                    <li key={a.id} className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-800 px-3 py-2 text-sm">
                      <span className="text-gray-800 dark:text-gray-200">{territoireNom(a.territoireId)} <span className="text-xs text-gray-400">depuis le {formatDate(a.dateAffectation)}{a.dateRetour ? ` · retour le ${formatDate(a.dateRetour)}` : ''}</span></span>
                      {a.statut === 'en_cours' ? (
                        hasPermission('affectation_materiel:write')
                          ? <Button size="sm" variant="outline" disabled={busy} onClick={() => guard(() => materielService.cloturerAffectation(a.id))}>Clôturer</Button>
                          : <span className="text-[10px] font-semibold text-kct-yellow">En cours</span>
                      ) : <span className="text-[10px] font-semibold text-gray-400">Terminée</span>}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}

          {hasPermission('maintenance_materiel:read') && (
            <section>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Maintenances</p>
                {hasPermission('maintenance_materiel:write') && <Button size="sm" variant="outline" onClick={() => setShowMaint(!showMaint)}><Wrench className="mr-1 h-3.5 w-3.5" />Déclarer</Button>}
              </div>
              {showMaint && (
                <div className="mb-3 grid grid-cols-1 sm:grid-cols-2 gap-2 rounded-lg border border-gray-200 dark:border-gray-800 p-3">
                  <FormField label="Type">
                    <Select value={mType} onChange={(e) => setMType(e.target.value as MaintenanceType)}>
                      <option value="preventive">Préventive</option>
                      <option value="corrective">Corrective</option>
                    </Select>
                  </FormField>
                  <FormField label="Date d'intervention"><Input type="date" value={mDate} onChange={(e) => setMDate(e.target.value)} /></FormField>
                  <FormField label="Description" className="sm:col-span-2"><Input value={mDescription} onChange={(e) => setMDescription(e.target.value)} /></FormField>
                  <FormField label="Coût (XAF)"><Input type="number" min="0" value={mCout} onChange={(e) => setMCout(e.target.value)} /></FormField>
                  <FormField label="Prestataire"><Input value={mPrestataire} onChange={(e) => setMPrestataire(e.target.value)} /></FormField>
                  <FormField label="Prochaine maintenance"><Input type="date" value={mProchaine} onChange={(e) => setMProchaine(e.target.value)} /></FormField>
                  <div className="flex items-end justify-end">
                    <Button size="sm" disabled={busy || !mDate}
                      onClick={() => guard(async () => {
                        await materielService.declarerMaintenance({
                          materielId: materiel.id, typeIntervention: mType, dateIntervention: mDate, description: mDescription || undefined,
                          cout: mCout ? Number(mCout) : undefined, prestataire: mPrestataire || undefined, prochaineMaintenance: mProchaine || undefined,
                        });
                        setShowMaint(false);
                        setMDescription('');
                        setMCout('');
                      })}>
                      {busy && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}Enregistrer
                    </Button>
                  </div>
                </div>
              )}
              {maintenances.length === 0 ? <p className="text-xs text-gray-400">Aucune maintenance enregistrée.</p> : (
                <ul className="space-y-1.5">
                  {maintenances.map((m) => (
                    <li key={m.id} className="rounded-lg border border-gray-200 dark:border-gray-800 px-3 py-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-800 dark:text-gray-200">{m.typeIntervention === 'preventive' ? 'Préventive' : 'Corrective'} · {formatDate(m.dateIntervention)}</span>
                        <span className="text-xs text-gray-500">{formatXaf(m.cout)}</span>
                      </div>
                      <p className="text-xs text-gray-400">{[m.description, m.prestataire, m.prochaineMaintenance ? `prochaine : ${formatDate(m.prochaineMaintenance)}` : null].filter(Boolean).join(' · ')}</p>
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
