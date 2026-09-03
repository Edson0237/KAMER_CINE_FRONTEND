import { useState, useEffect, useCallback } from 'react';
import { formationService } from '../services/formationService';
import type { Presence, CreatePresenceRequest } from '../types';

/**
 * Hook de gestion des présences (CRUD).
 */
export function usePresences(sessionId?: string) {
  const [presences, setPresences] = useState<Presence[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await formationService.listPresences(sessionId);
      setPresences(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => { load(); }, [load]);

  const create = useCallback(async (req: CreatePresenceRequest) => {
    await formationService.createPresence(req);
    await load();
  }, [load]);

  return { presences, loading, error, create, reload: load };
}
