import { useState } from 'react';
import { DEMO_ACCOUNTS, loginResponseFor } from './demoData';

/**
 * MODE DÉMO TEMPORAIRE — pastille flottante permettant de basculer d'un
 * rôle à l'autre (N0 à N5) sans passer par l'écran de connexion. Écrit
 * directement la session en localStorage puis recharge sur /dashboard.
 */
export function DemoSwitcher() {
  const [open, setOpen] = useState(false);
  const currentId = (() => {
    try {
      return (JSON.parse(localStorage.getItem('kct_user') ?? 'null') as { id?: string } | null)?.id;
    } catch {
      return undefined;
    }
  })();
  const current = DEMO_ACCOUNTS.find((a) => a.id === currentId);

  const switchTo = (key: string) => {
    const acc = DEMO_ACCOUNTS.find((a) => a.key === key)!;
    const r = loginResponseFor(acc);
    localStorage.setItem('kct_token', r.accessToken);
    localStorage.setItem('kct_refresh_token', r.refreshToken);
    localStorage.setItem('kct_user', JSON.stringify({
      id: r.userId, nom: r.nom, email: r.email, telephone: null, actif: true, roleCode: r.roleCode,
      niveau: r.niveau, territoireId: r.territoireId, permissions: r.permissions, mustChangePassword: false,
    }));
    window.location.href = '/dashboard';
  };

  return (
    <div className="fixed bottom-4 right-4 z-[200] text-sm">
      {open && (
        <div className="mb-2 w-64 rounded-xl border border-kct-gold/40 bg-white dark:bg-gray-900 shadow-xl p-2">
          <p className="px-2 pt-1 pb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">Voir en tant que…</p>
          {DEMO_ACCOUNTS.map((a) => (
            <button
              key={a.key}
              onClick={() => switchTo(a.key)}
              className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                a.id === currentId ? 'bg-kct-gold/10 text-kct-gold font-medium' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              {a.label}
            </button>
          ))}
        </div>
      )}
      <button
        onClick={() => setOpen(!open)}
        className="ml-auto flex items-center gap-2 rounded-full bg-kct-noir text-white pl-3 pr-4 py-2 shadow-lg hover:bg-kct-noir/90"
      >
        <span className="rounded bg-kct-gold px-1.5 py-0.5 text-[10px] font-bold text-white">DÉMO</span>
        <span>{current ? current.label : 'Choisir un rôle'}</span>
      </button>
    </div>
  );
}
