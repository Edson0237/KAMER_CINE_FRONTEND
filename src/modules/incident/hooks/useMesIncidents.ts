import { useState, useEffect, useCallback } from 'react';
import { incidentService } from '../services/incidentService';
import type { Incident } from '../types';

/** Incidents signalés par l'utilisateur courant — aucune permission requise. */
export function useMesIncidents() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setIncidents(await incidentService.getMesIncidents());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { incidents, loading, error, reload: load };
}
