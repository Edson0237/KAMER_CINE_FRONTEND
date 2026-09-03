import { useState, useEffect, useCallback } from 'react';
import { formationService } from '../services/formationService';
import type { ResultatExamen, CreateResultatRequest } from '../types';

/**
 * Hook de gestion des résultats d'examen (CRUD).
 */
export function useResultats(sessionId?: string) {
  const [resultats, setResultats] = useState<ResultatExamen[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await formationService.listResultats(sessionId);
      setResultats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => { load(); }, [load]);

  const create = useCallback(async (req: CreateResultatRequest) => {
    await formationService.createResultat(req);
    await load();
  }, [load]);

  return { resultats, loading, error, create, reload: load };
}
