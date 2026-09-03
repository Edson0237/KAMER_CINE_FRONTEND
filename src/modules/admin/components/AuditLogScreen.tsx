import { useState } from 'react';
import { useAuditLog } from '../hooks/useAuditLog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ShieldAlert, Filter } from 'lucide-react';

const ACTION_COLORS: Record<string, string> = {
  CREATE: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
  UPDATE: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
  DELETE: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
  LOGIN: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
  LOGOUT: 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400',
};

export function AuditLogScreen() {
  const [page, setPage] = useState(0);
  const [entiteType, setEntiteType] = useState('');
  const [filterActive, setFilterActive] = useState(false);

  const { data, totalPages, loading, error } = useAuditLog({
    page,
    size: 20,
    entiteType: filterActive && entiteType ? entiteType : undefined,
  });

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 rounded-lg bg-kct-gold/10">
            <ShieldAlert className="h-5 w-5 text-kct-gold" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Journal d'audit</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Traçabilité des actions — Module M0</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Filtres:</span>
            </div>
            <select
              value={entiteType}
              onChange={(e) => setEntiteType(e.target.value)}
              className="h-9 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 text-sm text-gray-700 dark:text-gray-200"
            >
              <option value="">Tous les types</option>
              <option value="apprenant">Apprenant</option>
              <option value="encadreur">Encadreur</option>
              <option value="session">Session</option>
              <option value="commune">Commune</option>
              <option value="territoire">Territoire</option>
              <option value="utilisateur">Utilisateur</option>
              <option value="role">Rôle</option>
              <option value="parametre">Paramètre</option>
            </select>
            <button
              onClick={() => { setFilterActive(true); setPage(0); }}
              className="h-9 px-4 rounded-md bg-kct-gold text-white text-sm font-medium hover:bg-kct-gold/90 transition-colors"
            >
              Appliquer
            </button>
            {filterActive && (
              <button
                onClick={() => { setFilterActive(false); setEntiteType(''); setPage(0); }}
                className="h-9 px-4 rounded-md border border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Réinitialiser
              </button>
            )}
          </div>
        </CardContent>
      </Card>

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
        <>
          <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
            <CardHeader>
              <CardTitle className="text-lg text-gray-900 dark:text-gray-100">Entrées récentes</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">
                      <th className="text-left px-4 py-3 font-medium">Date</th>
                      <th className="text-left px-4 py-3 font-medium">Action</th>
                      <th className="text-left px-4 py-3 font-medium">Entité</th>
                      <th className="text-left px-4 py-3 font-medium">Utilisateur</th>
                      <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Détails</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-12 text-gray-400 dark:text-gray-500">
                          Aucune entrée d'audit
                        </td>
                      </tr>
                    ) : (
                      data.map((entry) => (
                        <tr
                          key={entry.id}
                          className="border-b border-gray-100 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                        >
                          <td className="px-4 py-3 text-gray-600 dark:text-gray-300 whitespace-nowrap">
                            {new Date(entry.date).toLocaleString('fr-FR')}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${ACTION_COLORS[entry.action] ?? 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
                              {entry.action}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-700 dark:text-gray-200">
                            <span className="font-medium">{entry.entiteType}</span>
                            <span className="text-gray-400 ml-1 text-xs">#{entry.entiteId.slice(0, 8)}</span>
                          </td>
                          <td className="px-4 py-3 text-gray-600 dark:text-gray-300 text-xs font-mono">
                            {entry.utilisateurId.slice(0, 8)}…
                          </td>
                          <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs hidden md:table-cell max-w-xs truncate">
                            {entry.details ? JSON.stringify(entry.details) : '—'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Page {page + 1} / {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0}
                  className="px-3 py-1.5 rounded-md border border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-300 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Précédent
                </button>
                <button
                  onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                  disabled={page >= totalPages - 1}
                  className="px-3 py-1.5 rounded-md border border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-300 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Suivant
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
