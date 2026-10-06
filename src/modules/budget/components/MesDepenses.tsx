import { useTranslation } from 'react-i18next';
import { useMesDepenses } from '../hooks/useMesDepenses';
import { Loader2, Wallet } from 'lucide-react';
import { depenseStatutKey, formatXaf, STATUT_CONFIG } from './depenseUi';

/** Dépenses soumises par l'utilisateur courant, avec leur avancement dans la cascade (§6.18). */
export function MesDepenses() {
  const { t } = useTranslation();
  const { depenses, loading, error } = useMesDepenses();

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">{t('budget.mesDepenses.title')}</h3>

      {loading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-kct-gold" />
        </div>
      )}

      {error && <p className="text-sm text-kct-red">{error}</p>}

      {!loading && !error && depenses.length === 0 && (
        <p className="text-sm text-gray-500 dark:text-gray-400 py-4 text-center">{t('budget.mesDepenses.empty')}</p>
      )}

      {!loading && !error && depenses.length > 0 && (
        <div className="space-y-2">
          {depenses.map((d) => (
            <div key={d.id} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
              <div className="p-1.5 rounded-md bg-kct-gold/10 shrink-0">
                <Wallet className="h-4 w-4 text-kct-gold" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{d.description}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{formatXaf(d.montant)}</p>
                {d.statut === 'rejetee' && d.motifRejet && (
                  <p className="text-xs text-kct-red mt-0.5">{t('budget.mesDepenses.motif', { motif: d.motifRejet })}</p>
                )}
              </div>
              <span className={`text-[10px] font-semibold px-2 py-1 rounded-full shrink-0 ${STATUT_CONFIG[d.statut].className}`}>
                {d.statut === 'soumise' ? t('budget.mesDepenses.statutSoumise') : t(depenseStatutKey(d.statut))}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
