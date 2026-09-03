import { useState, useEffect, useCallback } from 'react';
import { pilotageService } from '../services/pilotageService';
import type { Indicateur } from '../types';

/**
 * Hook de chargement des indicateurs du tableau de bord.
 */
export function useIndicateurs() {
  const [indicateurs, setIndicateurs] = useState<Indicateur[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await pilotageService.getIndicateurs();
      setIndicateurs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { indicateurs, loading, error, reload: load };
}
