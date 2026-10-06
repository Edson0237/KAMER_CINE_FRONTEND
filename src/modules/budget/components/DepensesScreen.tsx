import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Wallet } from 'lucide-react';
import { useAuthContext } from '@/shared/auth/AuthContext';
import { useTerritoires } from '@/modules/territoire/hooks/useTerritoires';
import { formatDate } from '@/shared/i18n/format';
import { PageHeader, LoadingBlock, ErrorBlock, EmptyBlock, StatTile } from '@/components/ui/page-blocks';
import { Button } from '@/components/ui/button';
import { Input, Select } from '@/components/ui/input';
import { depenseService } from '../services/depenseService';
import { DepenseDetailModal } from './DepenseDetailModal';
import { DepenseSubmitModal } from './DepenseSubmitModal';
import { DepenseStatutBadge, STATUT_CONFIG, depenseStatutKey, etapeActionnable, formatXaf } from './depenseUi';
import type { Depense, DepenseStatut } from '../types';

type Tab = 'a_valider' | 'toutes' | 'mes';

function useDepenseList(source: 'all' | 'mine', enabled = true) {
  const [depenses, setDepenses] = useState<Depense[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setDepenses(source === 'all' ? await depenseService.listAll() : await depenseService.getMesSoumissions());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, [source, enabled]);

  useEffect(() => {
    load();
  }, [load]);

  return { depenses, loading, error, reload: load };
}

function DepenseTable({ rows, nomTerritoire, onOpen }: { rows: Depense[]; nomTerritoire: (id: string) => string; onOpen: (d: Depense) => void }) {
  const { t } = useTranslation();
  if (rows.length === 0) return <EmptyBlock title={t('budget.screen.empty')} hint={t('budget.screen.emptyHint')} icon={Wallet} />;
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-800 text-left text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
            <th className="px-4 py-3 font-medium">{t('budget.screen.colDate')}</th>
            <th className="px-4 py-3 font-medium">{t('budget.screen.colDescription')}</th>
            <th className="px-4 py-3 font-medium">{t('budget.screen.colTerritoire')}</th>
            <th className="px-4 py-3 text-right font-medium">{t('budget.screen.colMontant')}</th>
            <th className="px-4 py-3 font-medium">{t('budget.screen.colStatut')}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((d) => (
            <tr key={d.id} onClick={() => onOpen(d)} className="cursor-pointer border-b border-gray-100 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/40">
              <td className="whitespace-nowrap px-4 py-3 text-gray-500 dark:text-gray-400">{formatDate(d.dateSoumission)}</td>
              <td className="px-4 py-3">
                <p className="font-medium text-gray-900 dark:text-gray-100">{d.description}</p>
                {d.categorie && <p className="text-xs text-gray-400">{d.categorie}</p>}
              </td>
              <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{nomTerritoire(d.territoireId)}</td>
              <td className="whitespace-nowrap px-4 py-3 text-right font-semibold text-gray-900 dark:text-gray-100">{formatXaf(d.montant)}</td>
              <td className="px-4 py-3"><DepenseStatutBadge statut={d.statut} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Écran Dépenses (§2, §6.18) — cascade de validation N4 → N3 → N2 → N1.
 *
 * <p>« À valider » = les dépenses dont l'étape courante correspond à une
 * permission de validation détenue par l'utilisateur (par défaut son
 * niveau, mais une délégation change le résultat sans modifier ce code).
 * « Toutes » = le périmètre renvoyé par l'API (depense:read) ; « Mes
 * soumissions » = ce que l'utilisateur a soumis, sans permission requise.</p>
 */
export function DepensesScreen() {
  const { t } = useTranslation();
  const { hasPermission } = useAuthContext();
  const canRead = hasPermission('depense:read');
  const canSubmit = hasPermission('depense:soumettre');
  const { territoires } = useTerritoires();
  const nomTerritoire = useCallback((id: string) => territoires.find((t) => t.id === id)?.nom ?? id.slice(0, 8), [territoires]);

  const all = useDepenseList('all', canRead);
  const mine = useDepenseList('mine');

  const canValidate = ['depense:valider_n4', 'depense:valider_n3', 'depense:valider_n2', 'depense:valider_n1'].some(hasPermission);
  const tabs = useMemo(() => {
    const list: Array<{ key: Tab; label: string }> = [];
    if (canValidate && canRead) list.push({ key: 'a_valider', label: t('budget.screen.tabAValider') });
    if (canRead) list.push({ key: 'toutes', label: t('budget.screen.tabToutes') });
    list.push({ key: 'mes', label: t('budget.screen.tabMes') });
    return list;
  }, [canValidate, canRead, t]);

  const [tab, setTab] = useState<Tab>(tabs[0].key);
  const [statut, setStatut] = useState<'' | DepenseStatut>('');
  const [q, setQ] = useState('');
  const [selected, setSelected] = useState<Depense | null>(null);
  const [submitOpen, setSubmitOpen] = useState(false);

  const source = tab === 'mes' ? mine : all;
  const aValider = all.depenses.filter((d) => etapeActionnable(d, hasPermission) !== null);

  const rows = (tab === 'a_valider' ? aValider : source.depenses).filter(
    (d) => (!statut || d.statut === statut) && (!q || `${d.description} ${d.categorie ?? ''}`.toLowerCase().includes(q.toLowerCase())),
  );

  const reloadAll = () => {
    all.reload();
    mine.reload();
  };

  return (
    <div className="space-y-5">
      <PageHeader
        icon={Wallet}
        title={t('budget.screen.title')}
        subtitle={t('budget.screen.subtitle')}
        actions={canSubmit ? <Button onClick={() => setSubmitOpen(true)}><Plus className="mr-1.5 h-4 w-4" />{t('budget.screen.submitButton')}</Button> : undefined}
      />

      {canRead && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatTile label={t('budget.screen.statAValiderVous')} value={aValider.length} tone="yellow" />
          <StatTile label={t('budget.screen.statValidees')} value={all.depenses.filter((d) => d.statut === 'validee').length} tone="green" />
          <StatTile label={t('budget.screen.statRejetees')} value={all.depenses.filter((d) => d.statut === 'rejetee').length} tone="red" />
          <StatTile label={t('budget.screen.statTotal')} value={all.depenses.length} />
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-1">
          {tabs.map((tb) => (
            <button key={tb.key} onClick={() => setTab(tb.key)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${tab === tb.key ? 'bg-kct-gold text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
              {tb.label}
              {tb.key === 'a_valider' && aValider.length > 0 && <span className="ml-1.5 rounded-full bg-white/25 px-1.5 text-[10px]">{aValider.length}</span>}
            </button>
          ))}
        </div>
        {tab !== 'a_valider' && (
          <Select className="w-44" value={statut} onChange={(e) => setStatut(e.target.value as '' | DepenseStatut)}>
            <option value="">{t('budget.screen.allStatuts')}</option>
            {(Object.keys(STATUT_CONFIG) as DepenseStatut[]).map((s) => <option key={s} value={s}>{t(depenseStatutKey(s))}</option>)}
          </Select>
        )}
        <Input className="max-w-xs" placeholder={t('common.search')} value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      {source.loading && source.depenses.length === 0 ? <LoadingBlock label={t('budget.screen.loading')} />
        : source.error ? <ErrorBlock message={source.error} />
        : <DepenseTable rows={rows} nomTerritoire={nomTerritoire} onOpen={setSelected} />}

      <DepenseDetailModal
        depense={selected}
        territoireNom={selected ? nomTerritoire(selected.territoireId) : ''}
        onClose={() => setSelected(null)}
        onChanged={(updated) => {
          if (updated) setSelected(updated);
          reloadAll();
        }}
      />
      <DepenseSubmitModal open={submitOpen} onClose={() => setSubmitOpen(false)} onSubmitted={reloadAll} />
    </div>
  );
}
