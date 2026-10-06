import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';
import { useAuthContext } from '@/shared/auth/AuthContext';
import { useUserTerritoires } from '@/modules/territoire/hooks/useUserTerritoires';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { FormField, Input, Select, Textarea } from '@/components/ui/input';
import { depenseService } from '../services/depenseService';
import { etapeLabelKey, formatXaf } from './depenseUi';
import type { Depense } from '../types';

const CATEGORIES = ['logistique', 'materiel', 'transport', 'equipement', 'fournitures', 'restauration', 'autre'] as const;

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmitted: () => void;
}

/**
 * Soumission d'une dépense. Le niveau de validation requis est calculé par
 * l'API selon le montant (seuils dans parametre_systeme) : il est affiché
 * après soumission, jamais pré-calculé ici.
 */
export function DepenseSubmitModal({ open, onClose, onSubmitted }: Props) {
  const { t } = useTranslation();
  const { user } = useAuthContext();
  const { territoires } = useUserTerritoires();
  const communes = territoires.filter((t) => t.niveau === 5);
  const choix = communes.length > 0 ? communes : territoires;

  const [territoireId, setTerritoireId] = useState('');
  const [montant, setMontant] = useState('');
  const [description, setDescription] = useState('');
  const [categorie, setCategorie] = useState<typeof CATEGORIES[number]>(CATEGORIES[0]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Depense | null>(null);

  useEffect(() => {
    if (!territoireId) {
      const own = choix.find((t) => t.id === user?.territoireId);
      setTerritoireId(own?.id ?? choix[0]?.id ?? '');
    }
  }, [choix, territoireId, user?.territoireId]);

  const close = () => {
    setResult(null);
    setError(null);
    onClose();
  };

  const submit = async () => {
    const value = Number(montant);
    if (!territoireId || !description.trim() || !(value > 0)) {
      setError(t('budget.submitModal.requiredError'));
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const created = await depenseService.soumettre({ territoireId, montant: value, description: description.trim(), categorie: t(`budget.categories.${categorie}`) });
      setResult(created);
      setMontant('');
      setDescription('');
      onSubmitted();
    } catch (e) {
      setError(e instanceof Error ? e.message : t('budget.submitModal.title'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={close}
      title={t('budget.submitModal.title')}
      footer={
        result ? (
          <Button onClick={close}>{t('budget.submitModal.close')}</Button>
        ) : (
          <>
            <Button variant="outline" onClick={close}>{t('common.cancel')}</Button>
            <Button onClick={submit} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{t('budget.submitModal.submit')}
            </Button>
          </>
        )
      }
    >
      {result ? (
        <div className="space-y-2 text-sm">
          <p className="font-medium text-kct-green">{t('budget.submitModal.submitted')}</p>
          <p className="text-gray-600 dark:text-gray-300">
            {t('budget.submitModal.submittedDetail', { montant: formatXaf(result.montant), etape: t(etapeLabelKey(result.niveauFinalRequis)) })}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <FormField label={t('budget.submitModal.territoire')} required hint={choix.length <= 1 ? t('budget.submitModal.territoireLocked') : undefined}>
            <Select value={territoireId} disabled={choix.length <= 1} onChange={(e) => setTerritoireId(e.target.value)}>
              {choix.map((t) => <option key={t.id} value={t.id}>{t.nom}</option>)}
            </Select>
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label={t('budget.submitModal.montant')} required>
              <Input type="number" min="1" inputMode="numeric" value={montant} onChange={(e) => setMontant(e.target.value)} />
            </FormField>
            <FormField label={t('budget.submitModal.categorie')}>
              <Select value={categorie} onChange={(e) => setCategorie(e.target.value as typeof CATEGORIES[number])}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{t(`budget.categories.${c}`)}</option>)}
              </Select>
            </FormField>
          </div>
          <FormField label={t('budget.submitModal.description')} required error={error}>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t('budget.submitModal.descriptionPlaceholder')} />
          </FormField>
        </div>
      )}
    </Modal>
  );
}
