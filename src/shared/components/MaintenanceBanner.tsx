import { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, Construction, X } from 'lucide-react';
import { adminService } from '@/modules/admin/services/adminService';
import type { ModeMaintenance } from '@/modules/admin/types';

const POLL_INTERVAL_MS = 60_000;

/**
 * Bannières de maintenance (§6.5) — visibles par tout utilisateur
 * authentifié, pas seulement l'administration : maintenances ACTIVE
 * (blocage en cours) ou PLANIFIEE dans leur fenêtre de pré-alerte.
 * Interroge GET /api/maintenance/bannieres, ouvert sans permission
 * spécifique. Placée dans le flux normal de la mise en page (pas fixed
 * plein écran comme {@link OfflineBanner}) pour ne pas entrer en
 * conflit avec elle si les deux sont pertinentes en même temps.
 */
export function MaintenanceBanner() {
  const [bannieres, setBannieres] = useState<ModeMaintenance[]>([]);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  const load = useCallback(() => {
    adminService.getBannieresMaintenance().then(setBannieres).catch(() => {});
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [load]);

  const visibles = bannieres.filter((b) => !dismissedIds.has(b.id));
  if (visibles.length === 0) return null;

  return (
    <div className="flex flex-col gap-1 px-4 pt-3">
      {visibles.map((b) => {
        const active = b.statut === 'ACTIVE';
        return (
          <div
            key={b.id}
            className={`flex items-center justify-between gap-3 rounded-lg px-4 py-2.5 text-sm font-medium ${
              active ? 'bg-kct-red/10 text-kct-red border border-kct-red/30' : 'bg-kct-yellow/10 text-kct-yellow border border-kct-yellow/30'
            }`}
          >
            <div className="flex items-center gap-2">
              {active ? <AlertTriangle className="h-4 w-4 shrink-0" /> : <Construction className="h-4 w-4 shrink-0" />}
              <span>
                {b.serviceCode !== 'GLOBAL' && <span className="font-mono text-xs mr-1.5">[{b.serviceCode}]</span>}
                {b.message}
                {!active && b.dateDebutPrevue && (
                  <span className="opacity-80"> — prévue le {new Date(b.dateDebutPrevue).toLocaleString('fr-FR')}</span>
                )}
              </span>
            </div>
            <button
              onClick={() => setDismissedIds((prev) => new Set(prev).add(b.id))}
              className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors shrink-0"
              aria-label="Fermer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
