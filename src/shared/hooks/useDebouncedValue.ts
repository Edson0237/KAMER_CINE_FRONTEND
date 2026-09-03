import { useEffect, useState } from 'react';

/**
 * Retourne une version débouncée de la valeur fournie, utile pour les
 * champs de recherche afin d'éviter un appel API à chaque frappe.
 *
 * @param value le valeur source (ex. texte tapé dans un champ de recherche)
 * @param delayMs le délai de debounce en millisecondes (défaut 400ms)
 */
export function useDebouncedValue<T>(value: T, delayMs = 400): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timeout);
  }, [value, delayMs]);

  return debounced;
}
