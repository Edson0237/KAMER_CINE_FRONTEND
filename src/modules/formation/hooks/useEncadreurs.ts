import { useState, useEffect, useCallback } from 'react';
import { formationService } from '../services/formationService';
import type { Encadreur, CreateEncadreurRequest } from '../types';

/**
 * Hook de gestion des encadreurs (CRUD).
 */
export function useEncadreurs() {
  const [encadreurs, setEncadreurs] = useState<Encadreur[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await formationService.listEncadreurs();
      setEncadreurs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const create = useCallback(async (req: CreateEncadreurRequest) => {
    await formationService.createEncadreur(req);
    await load();
  }, [load]);

  const remove = useCallback(async (id: string) => {
    await formationService.deleteEncadreur(id);
    await load();
  }, [load]);

  return { encadreurs, loading, error, create, remove, reload: load };
}
