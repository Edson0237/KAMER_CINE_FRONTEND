import { useState } from 'react';
import { useSauvegardes } from '../hooks/useAdmin';
import { adminService } from '../services/adminService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Database, PlayCircle, Info } from 'lucide-react';

/**
 * Écran Admin technique (§6.8) — historique des sauvegardes et
 * déclenchement manuel.
 *
 * <p>Honnêteté délibérée (voir la note V1 de {@code SauvegardeService}
 * côté API) : ce module trace l'historique et permet un déclenchement
 * manuel, mais n'exécute aucun pg_dump/snapshot réel — exécuter une
 * vraie sauvegarde depuis le code applicatif dépasse le périmètre sûr
 * d'un changement automatisé sans validation infrastructure explicite.
 * Le déclenchement manuel crée un enregistrement simulé ; la tâche cron
 * réelle reste un travail d'infrastructure séparé (V2). L'écran
 * l'affiche clairement plutôt que de laisser croire à une sauvegarde
 * réellement exécutée.</p>
 */
export function SauvegardesScreen() {
  const { sauvegardes, loading, error, reload } = useSauvegardes();
  const [triggering, setTriggering] = useState(false);

  const handleDeclencher = async () => {
    setTriggering(true);
    try {
      await adminService.declencherSauvegarde();
      await reload();
    } finally {
      setTriggering(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-kct-gold/10">
          <Database className="h-5 w-5 text-kct-gold" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Sauvegardes</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Historique et déclenchement manuel</p>
        </div>
      </div>

      <div className="flex items-start gap-3 p-4 rounded-lg border border-kct-yellow/30 bg-kct-yellow/5">
        <Info className="h-4 w-4 text-kct-yellow shrink-0 mt-0.5" />
        <p className="text-xs text-gray-600 dark:text-gray-400">
          Ce module trace l'historique des sauvegardes mais n'exécute aucun snapshot réel pour l'instant
          (V1) — le déclenchement manuel crée un enregistrement simulé. L'exécution effective (pg_dump
          quotidien automatique et tests de restauration) reste un travail d'infrastructure séparé (V2).
        </p>
      </div>

      <button
        onClick={handleDeclencher}
        disabled={triggering}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-kct-gold text-white text-sm font-medium hover:bg-kct-gold/90 disabled:opacity-50"
      >
        {triggering ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlayCircle className="h-4 w-4" />}
        Déclencher une sauvegarde manuelle
      </button>

      {loading && (
        <div className="flex items-center justify-center h-32">
          <Loader2 className="h-6 w-6 animate-spin text-kct-gold" />
        </div>
      )}

      {error && (
        <Card className="border-red-200 dark:border-red-800">
          <CardContent className="p-4 text-red-600 dark:text-red-400 text-sm">{error}</CardContent>
        </Card>
      )}

      {!loading && !error && (
        <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <CardHeader>
            <CardTitle className="text-lg text-gray-900 dark:text-gray-100">Historique ({sauvegardes.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {sauvegardes.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">Aucune sauvegarde enregistrée</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">
                      <th className="text-left px-4 py-3 font-medium">Date</th>
                      <th className="text-left px-4 py-3 font-medium">Type</th>
                      <th className="text-left px-4 py-3 font-medium">Statut</th>
                      <th className="text-left px-4 py-3 font-medium">Test de restauration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sauvegardes.map((s) => (
                      <tr key={s.id} className="border-b border-gray-100 dark:border-gray-800/50">
                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                          {new Date(s.dateDeclenchement).toLocaleString('fr-FR')}
                        </td>
                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400 capitalize">{s.type}</td>
                        <td className="px-4 py-3">
                          <Badge variant={s.statut === 'succes' ? 'success' : 'danger'}>{s.statut}</Badge>
                        </td>
                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                          {s.dateTestRestauration ? new Date(s.dateTestRestauration).toLocaleDateString('fr-FR') : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
