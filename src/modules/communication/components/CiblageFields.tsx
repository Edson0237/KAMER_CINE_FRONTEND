import { useAuthContext } from '@/shared/auth/AuthContext';
import { getNiveauLabel } from '@/shared/auth/ProtectedRoute';
import { useTerritoires } from '@/modules/territoire/hooks/useTerritoires';
import { useUsers } from '@/modules/admin/hooks/useAdmin';
import { FormField, Select } from '@/components/ui/input';
import type { CibleType, Ciblage } from '../types';

export const EMPTY_CIBLAGE: Ciblage = { cibleType: 'global', cibleNiveau: null, cibleTerritoireId: null, cibleUtilisateurId: null };

const CIBLE_LABEL: Record<CibleType, string> = {
  global: 'Tout le monde (global)',
  niveau: 'Un niveau hiérarchique',
  territoire: 'Un territoire (et ses descendants)',
  individuel: 'Une personne',
};

/** Ne transmet que le champ de ciblage pertinent — l'API rejette un ciblage incohérent avec cibleType. */
export function ciblageToRequest(c: Ciblage): Ciblage {
  return {
    cibleType: c.cibleType,
    cibleNiveau: c.cibleType === 'niveau' ? c.cibleNiveau : null,
    cibleTerritoireId: c.cibleType === 'territoire' ? c.cibleTerritoireId : null,
    cibleUtilisateurId: c.cibleType === 'individuel' ? c.cibleUtilisateurId : null,
  };
}

/** Erreur de validation de ciblage (message affichable) ou null si complet. */
export function ciblageError(c: Ciblage): string | null {
  if (c.cibleType === 'niveau' && !c.cibleNiveau) return 'Choisissez le niveau ciblé.';
  if (c.cibleType === 'territoire' && !c.cibleTerritoireId) return 'Choisissez le territoire ciblé.';
  if (c.cibleType === 'individuel' && !c.cibleUtilisateurId) return 'Choisissez la personne ciblée.';
  return null;
}

/** Libellé lisible d'un ciblage pour les tableaux. */
export function useCiblageLabel() {
  const { territoires } = useTerritoires();
  return (c: Ciblage): string => {
    switch (c.cibleType) {
      case 'global': return 'Tout le monde';
      case 'niveau': return c.cibleNiveau ? getNiveauLabel(c.cibleNiveau) : 'Niveau';
      case 'territoire': return territoires.find((t) => t.id === c.cibleTerritoireId)?.nom ?? 'Territoire';
      case 'individuel': return 'Une personne';
    }
  };
}

function UserSelect({ value, onChange }: { value: string | null; onChange: (id: string | null) => void }) {
  const { users } = useUsers();
  return (
    <Select value={value ?? ''} onChange={(e) => onChange(e.target.value || null)}>
      <option value="">Sélectionner…</option>
      {users.filter((u) => u.actif).map((u) => <option key={u.id} value={u.id}>{u.nom} — {u.roleCode}</option>)}
    </Select>
  );
}

/**
 * Sélecteur de ciblage partagé (diffusion, circulaire, réunion) : global,
 * niveau, territoire ou individuel. Le choix « individuel » n'est proposé
 * qu'aux titulaires de utilisateur:read, seuls à pouvoir lister les comptes.
 */
export function CiblageFields({ value, onChange }: { value: Ciblage; onChange: (c: Ciblage) => void }) {
  const { hasPermission } = useAuthContext();
  const { territoires } = useTerritoires();
  const canPickUser = hasPermission('utilisateur:read');
  const types = (Object.keys(CIBLE_LABEL) as CibleType[]).filter((t) => t !== 'individuel' || canPickUser);

  return (
    <div className="space-y-3">
      <FormField label="Destinataires" required>
        <Select value={value.cibleType} onChange={(e) => onChange({ ...EMPTY_CIBLAGE, cibleType: e.target.value as CibleType })}>
          {types.map((t) => <option key={t} value={t}>{CIBLE_LABEL[t]}</option>)}
        </Select>
      </FormField>
      {value.cibleType === 'niveau' && (
        <FormField label="Niveau" required>
          <Select value={value.cibleNiveau ?? ''} onChange={(e) => onChange({ ...value, cibleNiveau: e.target.value ? Number(e.target.value) : null })}>
            <option value="">Sélectionner…</option>
            {[1, 2, 3, 4, 5, 6, 7].map((n) => <option key={n} value={n}>N{n} — {getNiveauLabel(n)}</option>)}
          </Select>
        </FormField>
      )}
      {value.cibleType === 'territoire' && (
        <FormField label="Territoire" required>
          <Select value={value.cibleTerritoireId ?? ''} onChange={(e) => onChange({ ...value, cibleTerritoireId: e.target.value || null })}>
            <option value="">Sélectionner…</option>
            {territoires.map((t) => <option key={t.id} value={t.id}>{t.nom} (N{t.niveau})</option>)}
          </Select>
        </FormField>
      )}
      {value.cibleType === 'individuel' && (
        <FormField label="Personne" required>
          <UserSelect value={value.cibleUtilisateurId} onChange={(id) => onChange({ ...value, cibleUtilisateurId: id })} />
        </FormField>
      )}
    </div>
  );
}
