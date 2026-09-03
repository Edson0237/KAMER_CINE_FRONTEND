import { Mail, CheckCircle, Clock } from 'lucide-react';
import { useContactMessages } from '../hooks/useEcosysteme';
import { ecosystemeService } from '../services/ecosystemeService';

export function ContactManagementScreen() {
  const { data, loading, error, reload } = useContactMessages();

  const handleMarkTraite = async (id: string) => {
    try {
      await ecosystemeService.marquerMessageTraite(id);
      reload();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Messages de contact</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Messages reçus depuis le formulaire de contact public</p>
      </div>

      {loading && <p className="text-gray-500">Chargement...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <div className="space-y-3">
        {data.map((m) => (
          <div key={m.id} className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Mail className="h-4 w-4 text-[#B8860B] shrink-0" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">{m.sujet}</h3>
                  {m.statut === 'non_traite' ? (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 flex items-center gap-1">
                      <Clock className="h-3 w-3" /> Non traité
                    </span>
                  ) : (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" /> Traité
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">De : {m.nom} ({m.email})</p>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">{m.message}</p>
                <p className="text-xs text-gray-400 mt-1">Reçu le {new Date(m.dateReception).toLocaleString('fr-FR')}</p>
              </div>
              {m.statut === 'non_traite' && (
                <button onClick={() => handleMarkTraite(m.id)} className="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-600 text-white text-sm hover:bg-green-700">
                  <CheckCircle className="h-4 w-4" /> Marquer traité
                </button>
              )}
            </div>
          </div>
        ))}
        {!loading && data.length === 0 && <p className="text-center text-gray-400 py-8">Aucun message</p>}
      </div>
    </div>
  );
}
