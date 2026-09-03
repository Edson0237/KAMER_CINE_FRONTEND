import { useState, useEffect, useCallback } from 'react';
import { formationService } from '../services/formationService';
import type { SessionFormation, CreateSessionRequest } from '../types';

const PAGE_SIZE = 10;

/**
 * Hook de gestion paginée et recherchable des sessions d'un territoire.
 */
export function useSessionsPage(territoireId: string | undefined) {
  const [sessions, setSessions] = useState<SessionFormation[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!territoireId) return;
    setLoading(true);
    setError(null);
    try {
      const result = await formationService.searchSessions(territoireId, {
        recherche: search || undefined,
        page,
        size: PAGE_SIZE,
      });
      setSessions(result.content);
      setTotalPages(result.totalPages);
      setTotalElements(result.totalElements);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, [territoireId, search, page]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(0); }, [search]);

  const create = useCallback(async (req: CreateSessionRequest) => {
    await formationService.createSession(req);
    await load();
  }, [load]);

  const update = useCallback(async (id: string, req: CreateSessionRequest) => {
    await formationService.updateSession(id, req);
    await load();
  }, [load]);

  const cloturer = useCallback(async (id: string) => {
    await formationService.cloturerSession(id);
    await load();
  }, [load]);

  return {
    sessions, loading, error, page, setPage, totalPages, totalElements,
    size: PAGE_SIZE, search, setSearch, create, update, cloturer, reload: load,
  };
}
