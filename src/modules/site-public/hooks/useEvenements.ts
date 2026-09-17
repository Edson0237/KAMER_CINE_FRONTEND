import { useCallback, useEffect, useState } from 'react';
import { ecosystemeService } from '../services/ecosystemeService';
import type { CreateEvenementRequest, Evenement } from '../types';

export function useEvenements() {
  const [data, setData] = useState<Evenement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await ecosystemeService.listEvenements());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void reload(); }, [reload]);

  const create = useCallback(async (request: CreateEvenementRequest) => {
    await ecosystemeService.createEvenement(request);
    await reload();
  }, [reload]);

  const update = useCallback(async (id: string, request: CreateEvenementRequest) => {
    await ecosystemeService.updateEvenement(id, request);
    await reload();
  }, [reload]);

  const remove = useCallback(async (id: string) => {
    await ecosystemeService.deleteEvenement(id);
    await reload();
  }, [reload]);

  return { data, loading, error, reload, create, update, remove };
}