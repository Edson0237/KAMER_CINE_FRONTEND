import i18n from './i18n';

/** Locale BCP-47 associée à chaque langue supportée par l'application. */
const LOCALE_BY_LANG: Record<string, string> = {
  fr: 'fr-FR',
  en: 'en-US',
};

/**
 * Locale BCP-47 courante (§6.12) — dérivée de la langue active, jamais
 * codée en dur. Ajouter une langue ne demande qu'une entrée dans
 * {@link LOCALE_BY_LANG} et dans `i18n.ts`, ici et dans
 * {@link LanguageSwitcher} — pas une recherche de `'fr-FR'` dans tout le
 * code.
 */
export function currentLocale(): string {
  const lang = i18n.resolvedLanguage ?? i18n.language ?? 'fr';
  return LOCALE_BY_LANG[lang] ?? LOCALE_BY_LANG.fr;
}

export function formatDate(value: string | Date | null | undefined, options?: Intl.DateTimeFormatOptions): string {
  if (!value) return '—';
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString(currentLocale(), options);
}

export function formatDateTime(value: string | Date | null | undefined): string {
  if (!value) return '—';
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString(currentLocale());
}

export function formatNumber(value: number, options?: Intl.NumberFormatOptions): string {
  return value.toLocaleString(currentLocale(), options);
}

/** Montant en devise (§4ter) — XAF par défaut, jamais un symbole codé en dur mêlé au texte traduit. */
export function formatCurrency(value: number, devise = 'XAF'): string {
  return `${formatNumber(value)} ${devise}`;
}
