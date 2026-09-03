import { useState, useEffect, useCallback } from 'react';
import { formationService } from '../services/formationService';
import type { SessionFormation, CreateSessionRequest, TauxReussite } from '../types';

/**
 * Hook de gestion des sessions de formation (CRUD + clôture + taux de réussite).
 */
export function useSessions() {
  const [sessions, setSessions] = useState<SessionFormation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await formationService.listSessions();
      setSessions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const create = useCallback(async (req: CreateSessionRequest) => {
    await formationService.createSession(req);
    await load();
  }, [load]);

  const cloturer = useCallback(async (id: string) => {
    await formationService.cloturerSession(id);
    await load();
  }, [load]);

  const getTauxReussite = useCallback(async (sessionId: string): Promise<TauxReussite> => {
    return formationService.getTauxReussite(sessionId);
  }, []);

  return { sessions, loading, error, create, cloturer, getTauxReussite, reload: load };
}
