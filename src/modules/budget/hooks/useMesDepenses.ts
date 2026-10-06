import { useState, useEffect, useCallback } from 'react';
import { depenseService } from '../services/depenseService';
import type { Depense } from '../types';

/** Hook des dépenses soumises par l'utilisateur courant (§6.18 — "mes dépenses soumises"). */
export function useMesDepenses() {
  const [depenses, setDepenses] = useState<Depense[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await depenseService.getMesSoumissions();
      setDepenses(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { depenses, loading, error, reload: load };
}
