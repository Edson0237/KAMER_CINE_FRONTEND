import { useState, useEffect, useCallback } from 'react';
import { formationService } from '../services/formationService';
import type { Apprenant, CreateApprenantRequest } from '../types';

/**
 * Hook de gestion des apprenants (CRUD).
 */
export function useApprenants() {
  const [apprenants, setApprenants] = useState<Apprenant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await formationService.listApprenants();
      setApprenants(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const create = useCallback(async (req: CreateApprenantRequest) => {
    await formationService.createApprenant(req);
    await load();
  }, [load]);

  const remove = useCallback(async (id: string) => {
    await formationService.deleteApprenant(id);
    await load();
  }, [load]);

  return { apprenants, loading, error, create, remove, reload: load };
}
