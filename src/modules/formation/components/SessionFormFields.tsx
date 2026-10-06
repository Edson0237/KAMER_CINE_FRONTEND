import { useEffect, useState } from 'react';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/input';
import { formationService } from '../services/formationService';
import { catalogueService, type Filiere } from '../services/catalogueService';
import type { Encadreur } from '../types';

/** Choix de l'encadreur parmi ceux du territoire de la session (plus de saisie d'UUID à la main). */
export function EncadreurPicker({ territoireId, value, onChange }: { territoireId: string; value: string | undefined; onChange: (id: string | undefined) => void }) {
  const [encadreurs, setEncadreurs] = useState<Encadreur[]>([]);

  useEffect(() => {
    if (!territoireId) return;
    formationService.searchEncadreurs(territoireId, { size: 100 }).then((p) => setEncadreurs(p.content)).catch(() => setEncadreurs([]));
  }, [territoireId]);

  return (
    <div className="space-y-2">
      <Label htmlFor="sess-encadreur">Encadreur</Label>
      <Select id="sess-encadreur" value={value ?? ''} onChange={(e) => onChange(e.target.value || undefined)}>
        <option value="">Non assigné</option>
        {encadreurs.map((e) => <option key={e.id} value={e.id}>{e.prenom} {e.nom}{e.specialite ? ` — ${e.specialite}` : ''}</option>)}
      </Select>
    </div>
  );
}

/** Rattachement de la session à une filière du catalogue (§4bis) — optionnel. */
export function FilierePicker({ value, onChange }: { value: string | undefined; onChange: (id: string | undefined) => void }) {
  const [filieres, setFilieres] = useState<Filiere[]>([]);

  useEffect(() => {
    catalogueService.listFilieres().then(setFilieres).catch(() => setFilieres([]));
  }, []);

  return (
    <div className="space-y-2">
      <Label htmlFor="sess-filiere">Filière du catalogue</Label>
      <Select id="sess-filiere" value={value ?? ''} onChange={(e) => onChange(e.target.value || undefined)}>
        <option value="">Aucune</option>
        {filieres.map((f) => <option key={f.id} value={f.id}>{f.nom}{f.statut === 'A_VENIR' ? ' (à venir)' : ''}</option>)}
      </Select>
    </div>
  );
}
