import { useState, useEffect, useCallback } from 'react';
import { incidentService } from '../services/incidentService';
import type { Incident, IncidentSynthese, UpdateIncidentRequest } from '../types';
import { REALTIME_EVENT } from '@/shared/realtime/RealtimeProvider';

/**
 * Hook de chargement de la file des incidents (liste + synthèse) dans le
 * périmètre territorial de l'utilisateur courant.
 */
export function useIncidents() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [synthese, setSynthese] = useState<IncidentSynthese | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [liste, synth] = await Promise.all([
        incidentService.listAll(),
        incidentService.getSynthese(),
      ]);
      setIncidents(liste);
      setSynthese(synth);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    window.addEventListener(REALTIME_EVENT, load);
    return () => window.removeEventListener(REALTIME_EVENT, load);
  }, [load]);

  const traiter = useCallback(async (id: string, req: UpdateIncidentRequest) => {
    const updated = await incidentService.updateStatut(id, req);
    setIncidents((prev) => prev.map((i) => (i.id === id ? updated : i)));
    return updated;
  }, []);

  return { incidents, synthese, loading, error, reload: load, traiter };
}
