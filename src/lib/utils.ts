import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Fusionne les classes Tailwind en résolvant les conflits.
 *
 * @param inputs les classes à fusionner
 * @returns la chaîne de classes fusionnée
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
