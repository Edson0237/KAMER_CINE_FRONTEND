import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Chargement d'une liste depuis l'API : items, état de chargement, erreur,
 * rechargement. `enabled=false` évite l'appel (ex. permission de lecture
 * absente : pas de requête vouée à un 403). Le fetcher n'a pas besoin
 * d'être stable — seule sa dernière version est appelée.
 */
export function useAsyncList<T>(fetcher: () => Promise<T[]>, enabled = true) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const reload = useCallback(async () => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setItems(await fetcherRef.current());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { items, setItems, loading, error, reload };
}
