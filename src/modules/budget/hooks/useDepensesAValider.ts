import { useState, useEffect, useCallback } from 'react';
import { depenseService } from '../services/depenseService';
import type { Depense, DepenseStatut } from '../types';

const STATUT_EN_ATTENTE: Record<number, DepenseStatut> = {
  4: 'soumise',
  3: 'en_attente_n3',
  2: 'en_attente_n2',
  1: 'en_attente_n1',
};

const VALIDER_FN: Record<number, (id: string) => Promise<Depense>> = {
  4: depenseService.validerN4,
  3: depenseService.validerN3,
  2: depenseService.validerN2,
  1: depenseService.validerN1,
};

/**
 * Hook de la file de dépenses en attente de validation à l'étape du
 * niveau donné (§2, §6.18 — cascade N4 → N3 → N2 → N1). Le statut
 * "en attente à mon étape" dépend du niveau de l'utilisateur courant :
 * N4 valide les dépenses fraîchement soumises, N3/N2/N1 celles déjà
 * montées jusqu'à eux dans la cascade.
 */
export function useDepensesAValider(niveau: number) {
  const [depenses, setDepenses] = useState<Depense[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const statutAttendu = STATUT_EN_ATTENTE[niveau];

  const load = useCallback(async () => {
    if (!statutAttendu) return;
    setLoading(true);
    setError(null);
    try {
      const data = await depenseService.listAll(statutAttendu);
      setDepenses(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, [statutAttendu]);

  useEffect(() => {
    load();
  }, [load]);

  const valider = useCallback(async (id: string) => {
    const fn = VALIDER_FN[niveau];
    if (!fn) throw new Error(`Aucune étape de validation pour le niveau ${niveau}`);
    await fn(id);
    setDepenses((prev) => prev.filter((d) => d.id !== id));
  }, [niveau]);

  const rejeter = useCallback(async (id: string, motif: string) => {
    await depenseService.rejeter(id, motif);
    setDepenses((prev) => prev.filter((d) => d.id !== id));
  }, []);

  return { depenses, loading, error, reload: load, valider, rejeter };
}
