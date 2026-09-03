import { useState } from 'react';
import { UserPlus, Check, X, Mail, Phone, X as XIcon } from 'lucide-react';
import { useCandidatures } from '../hooks/useEcosysteme';
import { ecosystemeService } from '../services/ecosystemeService';
import type { CandidaturePublique, CandidatureAccepteeResult } from '../types';

export function CandidatureManagementScreen() {
  const { data, loading, error, reload } = useCandidatures();
  const [showAccept, setShowAccept] = useState(false);
  const [selected, setSelected] = useState<CandidaturePublique | null>(null);
  const [communeId, setCommuneId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<CandidatureAccepteeResult | null>(null);

  const handleAcceptClick = (c: CandidaturePublique) => {
    setSelected(c);
    setCommuneId('');
    setResult(null);
    setShowAccept(true);
  };

  const handleAccept = async () => {
    if (!selected || !communeId) return;
    setSubmitting(true);
    try {
      const res = await ecosystemeService.traiterCandidature(selected.id, { statut: 'acceptee', communeId });
      setResult(res);
      reload();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm('Refuser cette candidature ?')) return;
    try {
      await ecosystemeService.traiterCandidature(id, { statut: 'refusee' });
      reload();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur');
    }
  };

  const statutBadge = (statut: string) => {
    const styles: Record<string, string> = {
      en_attente: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      acceptee: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      refusee: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };
    return styles[statut] || styles.en_attente;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Candidatures publiques</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Inscriptions reçues depuis le site public</p>
      </div>

      {loading && <p className="text-gray-500">Chargement...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <div className="space-y-3">
        {data.map((c) => (
          <div key={c.id} className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <UserPlus className="h-4 w-4 text-[#B8860B] shrink-0" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">{c.prenom} {c.nom}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${statutBadge(c.statut)}`}>{c.statut.replace('_', ' ')}</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {c.email}</span>
                  {c.telephone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {c.telephone}</span>}
                </div>
                {c.motivation && <p className="text-sm text-gray-400 mt-1 line-clamp-2">{c.motivation}</p>}
                <p className="text-xs text-gray-400 mt-1">Soumise le {new Date(c.dateSoumission).toLocaleDateString('fr-FR')}</p>
              </div>
              {c.statut === 'en_attente' && (
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => handleAcceptClick(c)} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-600 text-white text-sm hover:bg-green-700">
                    <Check className="h-4 w-4" /> Accepter
                  </button>
                  <button onClick={() => handleReject(c.id)} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-600 text-white text-sm hover:bg-red-700">
                    <X className="h-4 w-4" /> Refuser
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        {!loading && data.length === 0 && <p className="text-center text-gray-400 py-8">Aucune candidature</p>}
      </div>

      {showAccept && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowAccept(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Accepter la candidature de {selected.prenom} {selected.nom}</h2>
              <button onClick={() => setShowAccept(false)} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"><XIcon className="h-5 w-5" /></button>
            </div>

            {!result ? (
              <div className="space-y-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">Un compte apprenant (N7) sera créé avec un mot de passe temporaire. Veuillez spécifier la commune de rattachement.</p>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">UUID de la commune</label>
                  <input type="text" required placeholder="ex: 123e4567-e89b-12d3-a456-426614174000" value={communeId} onChange={(e) => setCommuneId(e.target.value)} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-white" />
                </div>
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setShowAccept(false)} className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">Annuler</button>
                  <button onClick={handleAccept} disabled={!communeId || submitting} className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50">{submitting ? 'Traitement...' : 'Accepter et créer le compte'}</button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-lg bg-green-50 dark:bg-green-900/20 p-4 border border-green-200 dark:border-green-800">
                  <p className="font-semibold text-green-700 dark:text-green-400 mb-2">Compte apprenant créé avec succès !</p>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-gray-500">Login :</span> <span className="font-mono font-bold text-gray-900 dark:text-white">{result.login}</span></p>
                    <p><span className="text-gray-500">Mot de passe temporaire :</span> <span className="font-mono font-bold text-gray-900 dark:text-white">{result.motDePasseTemporaire}</span></p>
                    <p><span className="text-gray-500">Canal de transmission :</span> <span className="font-medium">{result.canalTransmission}</span></p>
                  </div>
                </div>
                <p className="text-xs text-gray-400">Transmettez ces identifiants à l'apprenant via le canal indiqué. Il devra changer son mot de passe à la première connexion.</p>
                <div className="flex justify-end">
                  <button onClick={() => setShowAccept(false)} className="px-4 py-2 rounded-lg bg-[#B8860B] text-white hover:bg-[#9a7309]">Fermer</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
