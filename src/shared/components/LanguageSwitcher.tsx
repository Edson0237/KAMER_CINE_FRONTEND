import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

const LANGS = [
  { code: 'fr', label: 'FR' },
  { code: 'en', label: 'EN' },
] as const;

/** Bascule FR / EN (§6.12) — le français reste la langue par défaut, le choix est mémorisé. */
export function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  const current = i18n.resolvedLanguage ?? 'fr';

  return (
    <div className="flex items-center rounded-md border border-gray-200 dark:border-gray-700 p-0.5" role="group" aria-label={t('layout.language')}>
      {LANGS.map((l) => (
        <button
          key={l.code}
          onClick={() => void i18n.changeLanguage(l.code)}
          className={cn(
            'rounded px-2 py-1 text-[11px] font-semibold transition-colors',
            current.startsWith(l.code) ? 'bg-kct-gold text-white' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800',
          )}
          aria-pressed={current.startsWith(l.code)}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
