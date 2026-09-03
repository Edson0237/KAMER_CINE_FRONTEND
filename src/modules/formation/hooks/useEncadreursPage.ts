import { useState, useEffect, useCallback } from 'react';
import { formationService } from '../services/formationService';
import type { Encadreur, CreateEncadreurRequest } from '../types';

const PAGE_SIZE = 10;

/**
 * Hook de gestion paginée et recherchable des encadreurs d'un territoire.
 */
export function useEncadreursPage(territoireId: string | undefined) {
  const [encadreurs, setEncadreurs] = useState<Encadreur[]>([]);
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
      const result = await formationService.searchEncadreurs(territoireId, {
        nom: search || undefined,
        page,
        size: PAGE_SIZE,
      });
      setEncadreurs(result.content);
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

  const create = useCallback(async (req: CreateEncadreurRequest) => {
    await formationService.createEncadreur(req);
    await load();
  }, [load]);

  const update = useCallback(async (id: string, req: CreateEncadreurRequest) => {
    await formationService.updateEncadreur(id, req);
    await load();
  }, [load]);

  const remove = useCallback(async (id: string) => {
    await formationService.deleteEncadreur(id);
    await load();
  }, [load]);

  return {
    encadreurs, loading, error, page, setPage, totalPages, totalElements,
    size: PAGE_SIZE, search, setSearch, create, update, remove, reload: load,
  };
}
