import { useState, useEffect, useCallback } from 'react';
import { pilotageService } from '../services/pilotageService';
import type { CarteData } from '../types';

/**
 * Hook de chargement des données de la carte interactive (M2/M4).
 */
export function useCarte() {
  const [carteData, setCarteData] = useState<CarteData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await pilotageService.getCarteData();
      setCarteData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return { carteData, loading, error, reload: load };
}
