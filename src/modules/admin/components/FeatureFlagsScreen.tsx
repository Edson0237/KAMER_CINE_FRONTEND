import { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import type { FeatureFlag } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Flag, ToggleLeft, ToggleRight } from 'lucide-react';

export function FeatureFlagsScreen() {
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);

  useEffect(() => {
    adminService.getFeatureFlags()
      .then(setFlags)
      .catch(() => setError('Erreur lors du chargement des feature flags'))
      .finally(() => setLoading(false));
  }, []);

  const handleToggle = async (code: string, currentActif: boolean) => {
    setToggling(code);
    try {
      const updated = await adminService.toggleFeatureFlag(code, !currentActif);
      setFlags((prev) => prev.map((f) => (f.code === code ? updated : f)));
    } catch {
      setError('Erreur lors du basculement');
    } finally {
      setToggling(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-kct-gold/10">
          <Flag className="h-5 w-5 text-kct-gold" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Feature Flags</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Activation/désactivation des fonctionnalités</p>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-kct-gold" />
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
            <CardTitle className="text-lg text-gray-900 dark:text-gray-100">
              Flags ({flags.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">
                    <th className="text-left px-4 py-3 font-medium">Code</th>
                    <th className="text-left px-4 py-3 font-medium">Libellé</th>
                    <th className="text-left px-4 py-3 font-medium">Version cible</th>
                    <th className="text-left px-4 py-3 font-medium">Statut</th>
                    <th className="text-right px-4 py-3 font-medium">Basculer</th>
                  </tr>
                </thead>
                <tbody>
                  {flags.map((f) => (
                    <tr key={f.id} className="border-b border-gray-100 dark:border-gray-800/50">
                      <td className="px-4 py-3 font-mono text-xs text-gray-700 dark:text-gray-300">{f.code}</td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{f.libelle}</td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{f.versionCible ?? '—'}</td>
                      <td className="px-4 py-3">
                        <Badge variant={f.actif ? 'success' : 'outline'}>
                          {f.actif ? 'Actif' : 'Inactif'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleToggle(f.code, f.actif)}
                          disabled={toggling === f.code}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
                        >
                          {toggling === f.code ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : f.actif ? (
                            <ToggleRight className="h-4 w-4 text-green-500" />
                          ) : (
                            <ToggleLeft className="h-4 w-4 text-gray-400" />
                          )}
                          {f.actif ? 'Désactiver' : 'Activer'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
