import { useState, useEffect } from 'react';
import { territoireService } from '../services/territoireService';
import { useAuthContext } from '@/shared/auth/AuthContext';
import type { Territoire } from '../types';

/**
 * Hook de chargement des territoires du périmètre de l'utilisateur connecté.
 *
 * <p>L'API filtre déjà les territoires selon le périmètre territorial de
 * l'utilisateur (niveau N1 → N7). Ce hook expose la liste des territoires
 * accessibles pour pré-remplir et verrouiller le champ territoireId dans
 * les formulaires de création (apprenant, encadreur, session).</p>
 *
 * <p>Si l'utilisateur n'a qu'un seul territoire (ex. niveau commune N5),
 * le formulaire doit verrouiller ce champ. S'il en a plusieurs (ex. niveau
 * régional N2), le formulaire propose un select limité à ces territoires.</p>
 */
export function useUserTerritoires() {
  const { user } = useAuthContext();
  const [territoires, setTerritoires] = useState<Territoire[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    territoireService
      .list()
      .then((data) => {
        if (!cancelled) setTerritoires(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Erreur de chargement');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const userTerritoireId = user?.territoireId ?? '';
  const isSingleTerritoire = territoires.length <= 1;

  return { territoires, loading, error, userTerritoireId, isSingleTerritoire };
}
