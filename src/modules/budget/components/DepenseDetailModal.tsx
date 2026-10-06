import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, FileText, Loader2, Paperclip, X } from 'lucide-react';
import { useAuthContext } from '@/shared/auth/AuthContext';
import { fichierService } from '@/shared/api/fichierService';
import { formatDateTime } from '@/shared/i18n/format';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { FormField, Input, Select } from '@/components/ui/input';
import { depenseService } from '../services/depenseService';
import { financeService } from '../services/financeService';
import { CascadeTimeline, DepenseStatutBadge, etapeActionnable, etapeLabelKey, formatXaf } from './depenseUi';
import type { Depense, Justificatif } from '../types';

const DOC_TYPES: Justificatif['typeDocument'][] = ['facture', 'recu', 'bon_commande'];

interface Props {
  depense: Depense | null;
  territoireNom: string;
  onClose: () => void;
  onChanged: (updated?: Depense) => void;
}

/** Détail d'une dépense : frise de cascade, justificatifs, validation/rejet à l'étape courante. */
export function DepenseDetailModal({ depense, territoireNom, onClose, onChanged }: Props) {
  const { t } = useTranslation();
  const { hasPermission } = useAuthContext();
  const fileRef = useRef<HTMLInputElement>(null);
  const [justificatifs, setJustificatifs] = useState<Justificatif[]>([]);
  const [docType, setDocType] = useState<Justificatif['typeDocument']>('facture');
  const [busy, setBusy] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [motif, setMotif] = useState('');
  const [error, setError] = useState<string | null>(null);
  const canRead = hasPermission('depense:read');

  useEffect(() => {
    setRejecting(false);
    setMotif('');
    setError(null);
    setJustificatifs([]);
    if (depense && canRead) {
      financeService.listJustificatifs(depense.id).then(setJustificatifs).catch(() => setJustificatifs([]));
    }
  }, [depense?.id, canRead]);

  const step = depense ? etapeActionnable(depense, hasPermission) : null;

  const run = async (fn: () => Promise<Depense>) => {
    setBusy(true);
    setError(null);
    try {
      const updated = await fn();
      onChanged(updated);
      setRejecting(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : t('budget.detailModal.actionError'));
    } finally {
      setBusy(false);
    }
  };

  const validate = () => {
    if (!depense || step === null) return;
    const fn = { 4: depenseService.validerN4, 3: depenseService.validerN3, 2: depenseService.validerN2, 1: depenseService.validerN1 }[step]!;
    return run(() => fn(depense.id));
  };

  const upload = async (file: File) => {
    if (!depense) return;
    setBusy(true);
    setError(null);
    try {
      const cle = await fichierService.upload(file, 'depense_justificatif');
      const j = await financeService.addJustificatif(depense.id, cle, docType);
      setJustificatifs((prev) => [...prev, j]);
    } catch (e) {
      setError(e instanceof Error ? e.message : t('budget.detailModal.uploadError'));
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <Modal open={!!depense} onClose={onClose} title={depense?.description ?? ''} wide>
      {depense && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{formatXaf(depense.montant)}</p>
            <DepenseStatutBadge statut={depense.statut} />
          </div>
          <dl className="grid grid-cols-2 gap-3 text-xs">
            <div><dt className="text-gray-400">{t('budget.detailModal.territoire')}</dt><dd className="text-gray-800 dark:text-gray-200">{territoireNom}</dd></div>
            <div><dt className="text-gray-400">{t('budget.detailModal.categorie')}</dt><dd className="text-gray-800 dark:text-gray-200">{depense.categorie ?? t('common.notProvided')}</dd></div>
            <div><dt className="text-gray-400">{t('budget.detailModal.submittedOn')}</dt><dd className="text-gray-800 dark:text-gray-200">{formatDateTime(depense.dateSoumission)}</dd></div>
            <div><dt className="text-gray-400">{t('budget.detailModal.requiredUntil')}</dt><dd className="text-gray-800 dark:text-gray-200">{t(etapeLabelKey(depense.niveauFinalRequis))}</dd></div>
          </dl>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">{t('budget.detailModal.cascadeTitle')}</p>
            <CascadeTimeline depense={depense} />
          </div>

          {canRead && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">{t('budget.detailModal.justificatifsTitle')}</p>
              {justificatifs.length === 0 && <p className="text-xs text-gray-400">{t('budget.detailModal.noJustificatif')}</p>}
              <ul className="space-y-1">
                {justificatifs.map((j) => (
                  <li key={j.id}>
                    <button onClick={() => fichierService.open(j.fichierCle)} className="flex items-center gap-2 text-sm text-kct-gold hover:underline">
                      <FileText className="h-4 w-4" />{t(`budget.docType.${j.typeDocument}`)} · {formatDateTime(j.dateUpload)}
                    </button>
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex flex-wrap items-end gap-2">
                <FormField label={t('budget.detailModal.docTypeLabel')} className="w-44">
                  <Select value={docType} onChange={(e) => setDocType(e.target.value as Justificatif['typeDocument'])}>
                    {DOC_TYPES.map((k) => <option key={k} value={k}>{t(`budget.docType.${k}`)}</option>)}
                  </Select>
                </FormField>
                <input ref={fileRef} type="file" className="hidden" accept="image/*,application/pdf"
                  onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
                <Button variant="outline" size="sm" disabled={busy} onClick={() => fileRef.current?.click()}>
                  <Paperclip className="mr-1.5 h-3.5 w-3.5" />{t('budget.detailModal.attachButton')}
                </Button>
              </div>
            </div>
          )}

          {step !== null && (
            <div className="space-y-3 border-t border-gray-200 dark:border-gray-800 pt-4">
              <p className="text-xs text-gray-500 dark:text-gray-400">{t('budget.detailModal.waitingValidation', { etape: t(etapeLabelKey(step)) })}</p>
              {rejecting ? (
                <div className="flex flex-wrap items-center gap-2">
                  <Input className="min-w-[200px] flex-1" autoFocus placeholder={t('budget.detailModal.rejectMotifPlaceholder')} value={motif} onChange={(e) => setMotif(e.target.value)} />
                  <Button variant="destructive" size="sm" disabled={busy || !motif.trim()} onClick={() => run(() => depenseService.rejeter(depense.id, motif.trim()))}>
                    {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : t('budget.detailModal.confirmReject')}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setRejecting(false)}>{t('common.cancel')}</Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Button size="sm" disabled={busy} onClick={validate}>
                    {busy ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Check className="mr-1.5 h-4 w-4" />}{t('budget.detailModal.validate')}
                  </Button>
                  <Button size="sm" variant="outline" disabled={busy} onClick={() => setRejecting(true)}>
                    <X className="mr-1.5 h-4 w-4" />{t('budget.detailModal.reject')}
                  </Button>
                </div>
              )}
            </div>
          )}
          {error && <p className="text-xs text-kct-red">{error}</p>}
        </div>
      )}
    </Modal>
  );
}
