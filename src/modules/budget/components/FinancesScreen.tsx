import { useMemo, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Landmark, Loader2, Plus } from 'lucide-react';
import { useAuthContext } from '@/shared/auth/AuthContext';
import { useAsyncList } from '@/shared/hooks/useAsyncList';
import { useTerritoires } from '@/modules/territoire/hooks/useTerritoires';
import { formatDate } from '@/shared/i18n/format';
import { PageHeader, LoadingBlock, ErrorBlock, EmptyBlock, StatTile } from '@/components/ui/page-blocks';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { FormField, Input, Select } from '@/components/ui/input';
import { financeService } from '../services/financeService';
import { formatXaf } from './depenseUi';
import type { Budget, PartenaireFinancier, PartenaireFinancierType, Subvention } from '../types';

const PARTENAIRE_TYPES: PartenaireFinancierType[] = ['ministere', 'ong', 'bailleur', 'prive'];

type Tab = 'budgets' | 'subventions' | 'partenaires';

function Table({ heads, children }: { heads: Array<{ label: string; right?: boolean }>; children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-800 text-left text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
            {heads.map((h) => <th key={h.label} className={`px-4 py-3 font-medium ${h.right ? 'text-right' : ''}`}>{h.label}</th>)}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

const td = 'px-4 py-3 border-b border-gray-100 dark:border-gray-800/50';

// ==================== BUDGETS ====================

function BudgetsTab({ nom }: { nom: (id: string | null) => string }) {
  const { t } = useTranslation();
  const { hasPermission } = useAuthContext();
  const { territoires } = useTerritoires();
  const { items, loading, error, reload } = useAsyncList<Budget>(financeService.listBudgets);
  const [open, setOpen] = useState(false);
  const [territoireId, setTerritoireId] = useState('');
  const [exercice, setExercice] = useState(String(new Date().getFullYear()));
  const [montant, setMontant] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const save = async () => {
    if (!territoireId || !exercice.trim() || !(Number(montant) > 0)) {
      setFormError(t('budget.finances.budgets.requiredError'));
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      await financeService.createBudget({ territoireId, exercice: exercice.trim(), montantAlloue: Number(montant) });
      setOpen(false);
      setMontant('');
      reload();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : t('budget.finances.budgets.createError'));
    } finally {
      setSaving(false);
    }
  };

  if (loading && items.length === 0) return <LoadingBlock />;
  if (error) return <ErrorBlock message={error} />;

  const totalAlloue = items.reduce((s, b) => s + b.montantAlloue, 0);
  const totalUtilise = items.reduce((s, b) => s + b.montantUtilise, 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="grid flex-1 grid-cols-3 gap-3">
          <StatTile label={t('budget.finances.budgets.alloue')} value={formatXaf(totalAlloue)} />
          <StatTile label={t('budget.finances.budgets.utilise')} value={formatXaf(totalUtilise)} tone="yellow" />
          <StatTile label={t('budget.finances.budgets.solde')} value={formatXaf(totalAlloue - totalUtilise)} tone="green" />
        </div>
        {hasPermission('budget:write') && <Button onClick={() => setOpen(true)}><Plus className="mr-1.5 h-4 w-4" />{t('budget.finances.budgets.newBudget')}</Button>}
      </div>

      {items.length === 0 ? <EmptyBlock title={t('budget.finances.budgets.empty')} hint={t('budget.finances.budgets.emptyHint')} icon={Landmark} /> : (
        <Table heads={[{ label: t('budget.finances.budgets.colTerritoire') }, { label: t('budget.finances.budgets.colExercice') }, { label: t('budget.finances.budgets.colAlloue'), right: true }, { label: t('budget.finances.budgets.colUtilisation') }, { label: t('budget.finances.budgets.colSolde'), right: true }]}>
          {items.map((b) => {
            const pct = b.montantAlloue > 0 ? Math.min(100, Math.round((b.montantUtilise / b.montantAlloue) * 100)) : 0;
            return (
              <tr key={b.id}>
                <td className={`${td} font-medium text-gray-900 dark:text-gray-100`}>{nom(b.territoireId)}</td>
                <td className={td}>{b.exercice}</td>
                <td className={`${td} text-right`}>{formatXaf(b.montantAlloue)}</td>
                <td className={`${td} min-w-[160px]`}>
                  <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                    <div className={`h-2 rounded-full ${pct > 90 ? 'bg-kct-red' : pct > 70 ? 'bg-kct-yellow' : 'bg-kct-green'}`} style={{ width: `${pct}%` }} />
                  </div>
                  <p className="mt-1 text-[11px] text-gray-400">{formatXaf(b.montantUtilise)} · {pct}%</p>
                </td>
                <td className={`${td} text-right font-semibold`}>{formatXaf(b.solde)}</td>
              </tr>
            );
          })}
        </Table>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={t('budget.finances.budgets.modalTitle')}
        footer={<><Button variant="outline" onClick={() => setOpen(false)}>{t('common.cancel')}</Button><Button onClick={save} disabled={saving}>{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{t('common.create')}</Button></>}>
        <div className="space-y-3">
          <FormField label={t('budget.finances.budgets.colTerritoire')} required>
            <Select value={territoireId} onChange={(e) => setTerritoireId(e.target.value)}>
              <option value="">{t('budget.submitModal.territoire')}…</option>
              {territoires.map((t) => <option key={t.id} value={t.id}>{t.nom} (N{t.niveau})</option>)}
            </Select>
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label={t('budget.finances.budgets.exercice')} required><Input value={exercice} onChange={(e) => setExercice(e.target.value)} /></FormField>
            <FormField label={t('budget.finances.budgets.montant')} required error={formError}>
              <Input type="number" min="1" value={montant} onChange={(e) => setMontant(e.target.value)} />
            </FormField>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ==================== PARTENAIRES ====================

function PartenairesTab({ partenaires, loading, error, reload }: { partenaires: PartenaireFinancier[]; loading: boolean; error: string | null; reload: () => void }) {
  const { t } = useTranslation();
  const { hasPermission } = useAuthContext();
  const canWrite = hasPermission('partenaire_financier:write');
  const [editing, setEditing] = useState<PartenaireFinancier | 'new' | null>(null);
  const [nomP, setNomP] = useState('');
  const [type, setType] = useState<PartenaireFinancierType>('bailleur');
  const [email, setEmail] = useState('');
  const [tel, setTel] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const openForm = (p: PartenaireFinancier | 'new') => {
    setEditing(p);
    setNomP(p === 'new' ? '' : p.nom);
    setType(p === 'new' ? 'bailleur' : p.type);
    setEmail(p === 'new' ? '' : p.contactEmail ?? '');
    setTel(p === 'new' ? '' : p.contactTelephone ?? '');
    setFormError(null);
  };

  const save = async () => {
    if (!nomP.trim()) {
      setFormError(t('budget.finances.partenaires.requiredError'));
      return;
    }
    setSaving(true);
    try {
      const req = { nom: nomP.trim(), type, contactEmail: email.trim() || undefined, contactTelephone: tel.trim() || undefined };
      if (editing && editing !== 'new') await financeService.updatePartenaire(editing.id, req);
      else await financeService.createPartenaire(req);
      setEditing(null);
      reload();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : t('budget.finances.partenaires.saveError'));
    } finally {
      setSaving(false);
    }
  };

  const desactiver = async (p: PartenaireFinancier) => {
    await financeService.desactiverPartenaire(p.id);
    reload();
  };

  if (loading && partenaires.length === 0) return <LoadingBlock />;
  if (error) return <ErrorBlock message={error} />;

  return (
    <div className="space-y-4">
      {canWrite && <div className="flex justify-end"><Button onClick={() => openForm('new')}><Plus className="mr-1.5 h-4 w-4" />{t('budget.finances.partenaires.newPartenaire')}</Button></div>}
      {partenaires.length === 0 ? <EmptyBlock title={t('budget.finances.partenaires.empty')} icon={Landmark} /> : (
        <Table heads={[{ label: t('budget.finances.partenaires.colNom') }, { label: t('budget.finances.partenaires.colType') }, { label: t('budget.finances.partenaires.colContact') }, { label: t('budget.finances.partenaires.colStatut') }, { label: '' }]}>
          {partenaires.map((p) => (
            <tr key={p.id}>
              <td className={`${td} font-medium text-gray-900 dark:text-gray-100`}>{p.nom}</td>
              <td className={td}>{t(`budget.partenaireType.${p.type}`)}</td>
              <td className={`${td} text-xs text-gray-500 dark:text-gray-400`}>{[p.contactEmail, p.contactTelephone].filter(Boolean).join(' · ') || t('common.notProvided')}</td>
              <td className={td}>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${p.actif ? 'bg-kct-green/15 text-kct-green' : 'bg-gray-100 text-gray-500 dark:bg-gray-800'}`}>{p.actif ? t('common.active') : t('common.inactive')}</span>
              </td>
              <td className={`${td} text-right`}>
                {canWrite && (
                  <span className="inline-flex gap-3 text-xs">
                    <button onClick={() => openForm(p)} className="text-kct-gold hover:underline">{t('common.modify')}</button>
                    {p.actif && <button onClick={() => desactiver(p)} className="text-kct-red hover:underline">{t('common.deactivate')}</button>}
                  </span>
                )}
              </td>
            </tr>
          ))}
        </Table>
      )}

      <Modal open={editing !== null} onClose={() => setEditing(null)} title={editing === 'new' ? t('budget.finances.partenaires.modalTitleNew') : t('budget.finances.partenaires.modalTitleEdit')}
        footer={<><Button variant="outline" onClick={() => setEditing(null)}>{t('common.cancel')}</Button><Button onClick={save} disabled={saving}>{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{t('common.save')}</Button></>}>
        <div className="space-y-3">
          <FormField label={t('budget.finances.partenaires.nom')} required error={formError}><Input value={nomP} onChange={(e) => setNomP(e.target.value)} /></FormField>
          <FormField label={t('budget.finances.partenaires.type')} required>
            <Select value={type} onChange={(e) => setType(e.target.value as PartenaireFinancierType)}>
              {PARTENAIRE_TYPES.map((k) => <option key={k} value={k}>{t(`budget.partenaireType.${k}`)}</option>)}
            </Select>
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label={t('budget.finances.partenaires.email')}><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></FormField>
            <FormField label={t('budget.finances.partenaires.telephone')}><Input value={tel} onChange={(e) => setTel(e.target.value)} /></FormField>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ==================== SUBVENTIONS ====================

function SubventionsTab({ nom, partenaires }: { nom: (id: string | null) => string; partenaires: PartenaireFinancier[] }) {
  const { t } = useTranslation();
  const { hasPermission } = useAuthContext();
  const { territoires } = useTerritoires();
  const { items, loading, error, reload } = useAsyncList<Subvention>(financeService.listSubventions);
  const [open, setOpen] = useState(false);
  const [partenaireId, setPartenaireId] = useState('');
  const [territoireId, setTerritoireId] = useState('');
  const [montant, setMontant] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [type, setType] = useState<'subvention' | 'don'>('subvention');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const partenaireNom = (id: string) => partenaires.find((p) => p.id === id)?.nom ?? id.slice(0, 8);

  const save = async () => {
    if (!partenaireId || !(Number(montant) > 0) || !date) {
      setFormError(t('budget.finances.subventions.requiredError'));
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      await financeService.createSubvention({ partenaireId, territoireId: territoireId || undefined, montant: Number(montant), dateReception: date, type });
      setOpen(false);
      setMontant('');
      reload();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : t('budget.finances.subventions.saveError'));
    } finally {
      setSaving(false);
    }
  };

  if (loading && items.length === 0) return <LoadingBlock />;
  if (error) return <ErrorBlock message={error} />;

  return (
    <div className="space-y-4">
      {hasPermission('subvention:write') && <div className="flex justify-end"><Button onClick={() => setOpen(true)}><Plus className="mr-1.5 h-4 w-4" />{t('budget.finances.subventions.newSubvention')}</Button></div>}
      {items.length === 0 ? <EmptyBlock title={t('budget.finances.subventions.empty')} hint={t('budget.finances.subventions.emptyHint')} icon={Landmark} /> : (
        <Table heads={[{ label: t('budget.finances.subventions.colReception') }, { label: t('budget.finances.subventions.colPartenaire') }, { label: t('budget.finances.subventions.colType') }, { label: t('budget.finances.subventions.colTerritoire') }, { label: t('budget.finances.subventions.colMontant'), right: true }, { label: t('budget.finances.subventions.colStatut') }]}>
          {items.map((s) => (
            <tr key={s.id}>
              <td className={td}>{formatDate(s.dateReception)}</td>
              <td className={`${td} font-medium text-gray-900 dark:text-gray-100`}>{partenaireNom(s.partenaireId)}</td>
              <td className={td}>{s.type === 'don' ? t('budget.finances.subventions.typeDon') : t('budget.finances.subventions.typeSubvention')}</td>
              <td className={td}>{s.territoireId ? nom(s.territoireId) : t('common.national')}</td>
              <td className={`${td} text-right font-semibold`}>{formatXaf(s.montant)}</td>
              <td className={td}>{s.statut}</td>
            </tr>
          ))}
        </Table>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={t('budget.finances.subventions.modalTitle')}
        footer={<><Button variant="outline" onClick={() => setOpen(false)}>{t('common.cancel')}</Button><Button onClick={save} disabled={saving}>{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{t('common.save')}</Button></>}>
        <div className="space-y-3">
          <FormField label={t('budget.finances.subventions.partenaire')} required>
            <Select value={partenaireId} onChange={(e) => setPartenaireId(e.target.value)}>
              <option value="">{t('budget.submitModal.territoire')}…</option>
              {partenaires.filter((p) => p.actif).map((p) => <option key={p.id} value={p.id}>{p.nom}</option>)}
            </Select>
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label={t('budget.finances.subventions.type')} required>
              <Select value={type} onChange={(e) => setType(e.target.value as 'subvention' | 'don')}>
                <option value="subvention">{t('budget.finances.subventions.typeSubvention')}</option>
                <option value="don">{t('budget.finances.subventions.typeDon')}</option>
              </Select>
            </FormField>
            <FormField label={t('budget.finances.subventions.dateReception')} required><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></FormField>
          </div>
          <FormField label={t('budget.finances.subventions.territoireBeneficiaire')} hint={t('budget.finances.subventions.territoireHint')}>
            <Select value={territoireId} onChange={(e) => setTerritoireId(e.target.value)}>
              <option value="">{t('common.national')}</option>
              {territoires.map((t) => <option key={t.id} value={t.id}>{t.nom} (N{t.niveau})</option>)}
            </Select>
          </FormField>
          <FormField label={t('budget.finances.subventions.montant')} required error={formError}><Input type="number" min="1" value={montant} onChange={(e) => setMontant(e.target.value)} /></FormField>
        </div>
      </Modal>
    </div>
  );
}

/**
 * Écran Budgets & partenaires (§6.17) : budgets par territoire/exercice,
 * subventions et dons, partenaires financiers. Chaque onglet n'existe que
 * si l'utilisateur détient la permission de lecture correspondante.
 */
export function FinancesScreen() {
  const { t } = useTranslation();
  const { hasPermission } = useAuthContext();
  const { territoires } = useTerritoires();
  const nom = (id: string | null) => (id ? territoires.find((t) => t.id === id)?.nom ?? id.slice(0, 8) : t('common.notProvided'));

  const canPartenaires = hasPermission('partenaire_financier:read');
  const partenaires = useAsyncList<PartenaireFinancier>(financeService.listPartenaires, canPartenaires);

  const tabs = useMemo(() => {
    const list: Array<{ key: Tab; label: string }> = [];
    if (hasPermission('budget:read')) list.push({ key: 'budgets', label: t('budget.finances.tabBudgets') });
    if (hasPermission('subvention:read')) list.push({ key: 'subventions', label: t('budget.finances.tabSubventions') });
    if (canPartenaires) list.push({ key: 'partenaires', label: t('budget.finances.tabPartenaires') });
    return list;
  }, [hasPermission, canPartenaires, t]);
  const [tab, setTab] = useState<Tab>(tabs[0]?.key ?? 'budgets');

  return (
    <div className="space-y-5">
      <PageHeader icon={Landmark} title={t('budget.finances.title')} subtitle={t('budget.finances.subtitle')} />
      {tabs.length === 0 ? <EmptyBlock title={t('budget.finances.noAccess')} hint={t('budget.finances.noAccessHint')} /> : (
        <>
          <div className="inline-flex rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-1">
            {tabs.map((tb) => (
              <button key={tb.key} onClick={() => setTab(tb.key)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${tab === tb.key ? 'bg-kct-gold text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                {tb.label}
              </button>
            ))}
          </div>
          {tab === 'budgets' && <BudgetsTab nom={nom} />}
          {tab === 'subventions' && <SubventionsTab nom={nom} partenaires={partenaires.items} />}
          {tab === 'partenaires' && <PartenairesTab partenaires={partenaires.items} loading={partenaires.loading} error={partenaires.error} reload={partenaires.reload} />}
        </>
      )}
    </div>
  );
}
