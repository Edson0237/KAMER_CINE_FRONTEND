import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDepensesAValider } from '../hooks/useDepensesAValider';
import { formatDate } from '@/shared/i18n/format';
import { Loader2, CheckCircle2, Wallet, Check, X } from 'lucide-react';
import { formatXaf } from './depenseUi';

/**
 * File des dépenses en attente de validation à l'étape du niveau de
 * l'utilisateur courant (§2, §6.18) — pour N4 (première étape, dépenses
 * fraîchement soumises) et, le cas échéant, N3/N2/N1 aux étapes
 * suivantes de la cascade.
 */
export function DepensesAValider({ niveau }: { niveau: number }) {
  const { t } = useTranslation();
  const { depenses, loading, error, valider, rejeter } = useDepensesAValider(niveau);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [motifId, setMotifId] = useState<string | null>(null);
  const [motif, setMotif] = useState('');

  const handleValider = async (id: string) => {
    setProcessingId(id);
    try {
      await valider(id);
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejeter = async (id: string) => {
    if (!motif.trim()) return;
    setProcessingId(id);
    try {
      await rejeter(id, motif);
      setMotifId(null);
      setMotif('');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">{t('budget.aValider.title')}</h3>

      {loading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-kct-gold" />
        </div>
      )}

      {error && <p className="text-sm text-kct-red">{error}</p>}

      {!loading && !error && depenses.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <CheckCircle2 className="h-6 w-6 text-kct-green" />
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('budget.aValider.empty')}</p>
        </div>
      )}

      {!loading && !error && depenses.length > 0 && (
        <div className="space-y-2">
          {depenses.map((d) => (
            <div key={d.id} className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
              <div className="flex items-start gap-3">
                <div className="p-1.5 rounded-md bg-kct-gold/10 shrink-0">
                  <Wallet className="h-4 w-4 text-kct-gold" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{d.description}</p>
                    <span className="text-sm font-semibold text-kct-noir dark:text-gray-100 shrink-0">{formatXaf(d.montant)}</span>
                  </div>
                  {d.categorie && <p className="text-xs text-gray-500 dark:text-gray-400">{d.categorie}</p>}
                  <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
                    {t('budget.aValider.submittedOn', { date: formatDate(d.dateSoumission) })}
                  </p>
                </div>
              </div>

              {motifId === d.id ? (
                <div className="mt-2 flex items-center gap-2">
                  <input
                    autoFocus
                    value={motif}
                    onChange={(e) => setMotif(e.target.value)}
                    placeholder={t('budget.aValider.motifPlaceholder')}
                    className="flex-1 text-sm px-2 py-1.5 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  />
                  <button
                    onClick={() => handleRejeter(d.id)}
                    disabled={!motif.trim() || processingId === d.id}
                    className="text-xs font-medium text-kct-red hover:underline disabled:opacity-50"
                  >
                    {t('budget.aValider.confirm')}
                  </button>
                  <button onClick={() => { setMotifId(null); setMotif(''); }} className="text-xs text-gray-400 hover:underline">
                    {t('budget.aValider.cancel')}
                  </button>
                </div>
              ) : (
                <div className="mt-2 flex items-center gap-3">
                  <button
                    onClick={() => handleValider(d.id)}
                    disabled={processingId === d.id}
                    className="flex items-center gap-1 text-xs font-medium text-kct-green hover:underline disabled:opacity-50"
                  >
                    {processingId === d.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />} {t('budget.aValider.validate')}
                  </button>
                  <button
                    onClick={() => setMotifId(d.id)}
                    disabled={processingId === d.id}
                    className="flex items-center gap-1 text-xs font-medium text-kct-red hover:underline disabled:opacity-50"
                  >
                    <X className="h-3.5 w-3.5" /> {t('budget.aValider.reject')}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
