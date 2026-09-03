import { useState, useEffect, useCallback } from 'react';
import { territoireService } from '../services/territoireService';
import type { Territoire, Commune } from '../types';

/**
 * Hook de chargement des territoires et communes.
 *
 * <p>Expose la hiérarchie territoriale et les communes avec leur statut
 * de déploiement. Les données sont filtrées par le périmètre côté API.</p>
 */
export function useTerritoires() {
  const [territoires, setTerritoires] = useState<Territoire[]>([]);
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [territoireData, communeData] = await Promise.all([
        territoireService.list(),
        territoireService.listCommunes(),
      ]);
      setTerritoires(territoireData);
      setCommunes(communeData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { territoires, communes, loading, error, reload: load };
}
