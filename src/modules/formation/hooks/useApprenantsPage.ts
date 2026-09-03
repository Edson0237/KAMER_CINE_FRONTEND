import { useState, useEffect, useCallback } from 'react';
import { formationService } from '../services/formationService';
import type { Apprenant, CreateApprenantRequest } from '../types';

const PAGE_SIZE = 10;

/**
 * Hook de gestion paginée et recherchable des apprenants d'un territoire.
 *
 * <p>Remplace un chargement complet non paginé par une recherche
 * serveur avec page/size — nécessaire avec 360 communes à terme.</p>
 */
export function useApprenantsPage(territoireId: string | undefined) {
  const [apprenants, setApprenants] = useState<Apprenant[]>([]);
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
      const result = await formationService.searchApprenants(territoireId, {
        nom: search || undefined,
        page,
        size: PAGE_SIZE,
      });
      setApprenants(result.content);
      setTotalPages(result.totalPages);
      setTotalElements(result.totalElements);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, [territoireId, search, page]);

  useEffect(() => { load(); }, [load]);

  // Revenir à la première page à chaque nouvelle recherche
  useEffect(() => { setPage(0); }, [search]);

  const create = useCallback(async (req: CreateApprenantRequest) => {
    await formationService.createApprenant(req);
    await load();
  }, [load]);

  const update = useCallback(async (id: string, req: CreateApprenantRequest) => {
    await formationService.updateApprenant(id, req);
    await load();
  }, [load]);

  const remove = useCallback(async (id: string) => {
    await formationService.deleteApprenant(id);
    await load();
  }, [load]);

  return {
    apprenants, loading, error, page, setPage, totalPages, totalElements,
    size: PAGE_SIZE, search, setSearch, create, update, remove, reload: load,
  };
}
