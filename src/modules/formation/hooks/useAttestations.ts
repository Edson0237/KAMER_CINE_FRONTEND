import { useState, useEffect, useCallback } from 'react';
import { formationService } from '../services/formationService';
import type { Attestation } from '../types';

/**
 * Hook de gestion des attestations (lecture + émission).
 *
 * <p>L'émission d'attestations est réservée aux niveaux N1-N5.
 * Le frontend ne fait QUE refléter ce que l'API autorise.</p>
 */
export function useAttestations() {
  const [attestations, setAttestations] = useState<Attestation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await formationService.listAttestations();
      setAttestations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const create = useCallback(async (apprenantId: string, sessionId: string) => {
    await formationService.createAttestation(apprenantId, sessionId);
    await load();
  }, [load]);

  return { attestations, loading, error, create, reload: load };
}
