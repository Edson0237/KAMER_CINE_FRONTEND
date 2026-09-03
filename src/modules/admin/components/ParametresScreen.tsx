import { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import type { ParametreSysteme } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Settings, Save } from 'lucide-react';

export function ParametresScreen() {
  const [parametres, setParametres] = useState<ParametreSysteme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    adminService.getParametres()
      .then(setParametres)
      .catch(() => setError('Erreur lors du chargement des paramètres'))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (cle: string) => {
    setSaving(cle);
    try {
      const updated = await adminService.updateParametre(cle, editing[cle]);
      setParametres((prev) => prev.map((p) => (p.cle === cle ? updated : p)));
      setEditing((prev) => {
        const next = { ...prev };
        delete next[cle];
        return next;
      });
    } catch {
      setError('Erreur lors de la modification');
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-kct-gold/10">
          <Settings className="h-5 w-5 text-kct-gold" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Paramètres système</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Configuration globale de l'application</p>
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
              Paramètres ({parametres.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">
                    <th className="text-left px-4 py-3 font-medium">Clé</th>
                    <th className="text-left px-4 py-3 font-medium">Valeur</th>
                    <th className="text-left px-4 py-3 font-medium">Type</th>
                    <th className="text-left px-4 py-3 font-medium">Description</th>
                    <th className="text-right px-4 py-3 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {parametres.map((p) => (
                    <tr key={p.id} className="border-b border-gray-100 dark:border-gray-800/50">
                      <td className="px-4 py-3 font-mono text-xs text-gray-700 dark:text-gray-300">{p.cle}</td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={editing[p.cle] ?? p.valeur}
                          onChange={(e) => setEditing({ ...editing, [p.cle]: e.target.value })}
                          className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm text-gray-900 dark:text-gray-100 focus:border-kct-gold outline-none"
                        />
                      </td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{p.type}</td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{p.description ?? '—'}</td>
                      <td className="px-4 py-3 text-right">
                        {editing[p.cle] !== undefined && editing[p.cle] !== p.valeur && (
                          <button
                            onClick={() => handleSave(p.cle)}
                            disabled={saving === p.cle}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-kct-gold text-white text-xs font-medium hover:bg-kct-gold/90 disabled:opacity-50"
                          >
                            {saving === p.cle ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                            Enregistrer
                          </button>
                        )}
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
