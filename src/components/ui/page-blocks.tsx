import type { ReactNode } from 'react';
import { Loader2, Inbox, AlertCircle } from 'lucide-react';
import { formatNumber } from '@/shared/i18n/format';

interface PageHeaderProps {
  icon: typeof Inbox;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

/** En-tête standard d'un écran : pastille d'icône or, titre, sous-titre, actions à droite. */
export function PageHeader({ icon: Icon, title, subtitle, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-kct-gold/10">
          <Icon className="h-5 w-5 text-kct-gold" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{title}</h2>
          {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export function LoadingBlock({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16">
      <Loader2 className="h-7 w-7 animate-spin text-kct-gold" />
      {label && <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>}
    </div>
  );
}

export function ErrorBlock({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-kct-red/30 bg-kct-red/5 p-4 text-sm text-kct-red">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

export function EmptyBlock({ title, hint, icon: Icon = Inbox }: { title: string; hint?: string; icon?: typeof Inbox }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 py-12 text-center">
      <div className="p-3 rounded-full bg-kct-gold/10">
        <Icon className="h-5 w-5 text-kct-gold" />
      </div>
      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{title}</p>
      {hint && <p className="max-w-sm text-xs text-gray-500 dark:text-gray-400">{hint}</p>}
    </div>
  );
}

/** Tuile KPI : valeur en grand, libellé dessous, teinte optionnelle. */
export function StatTile({ label, value, tone = 'default' }: { label: string; value: string | number; tone?: 'default' | 'red' | 'green' | 'yellow' }) {
  const color = { default: 'text-gray-900 dark:text-gray-100', red: 'text-kct-red', green: 'text-kct-green', yellow: 'text-kct-yellow' }[tone];
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 shadow-sm">
      <p className={`text-2xl font-bold ${color}`}>{typeof value === 'number' ? formatNumber(value) : value}</p>
      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{label}</p>
    </div>
  );
}
