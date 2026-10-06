import { useState } from 'react';
import { useMaintenance } from '../hooks/useAdmin';
import { adminService } from '../services/adminService';
import type { MaintenanceStatut } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Wrench, Save } from 'lucide-react';

const STATUT_VARIANT: Record<MaintenanceStatut, 'success' | 'outline' | 'danger'> = {
  ACTIVE: 'danger',
  PLANIFIEE: 'outline',
  TERMINEE: 'success',
};

/**
 * Écran Admin technique (§6.5) — planifier, activer ou terminer la
 * maintenance d'un service (ou 'GLOBAL' pour tous). PLANIFIEE ne bloque
 * rien immédiatement : seule sa fenêtre de pré-alerte affiche une
 * bannière (voir {@link MaintenanceBanner}) avant la bascule automatique
 * vers ACTIVE à l'heure prévue, qui déclenche le blocage réel côté API.
 */
export function MaintenanceScreen() {
  const { services, loading, error, reload } = useMaintenance();
  const [serviceCode, setServiceCode] = useState('GLOBAL');
  const [statut, setStatut] = useState<MaintenanceStatut>('PLANIFIEE');
  const [message, setMessage] = useState('');
  const [dateDebutPrevue, setDateDebutPrevue] = useState('');
  const [fenetrePrealerteHeures, setFenetrePrealerteHeures] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setFormError(null);
    if (!message.trim()) {
      setFormError('Le message est obligatoire (affiché aux utilisateurs).');
      return;
    }
    if (statut === 'PLANIFIEE' && !dateDebutPrevue) {
      setFormError('La date de début prévue est requise pour planifier une maintenance.');
      return;
    }
    setSaving(true);
    try {
      await adminService.setMaintenance(serviceCode, {
        statut,
        message,
        dateDebutPrevue: dateDebutPrevue ? new Date(dateDebutPrevue).toISOString() : undefined,
        fenetrePrealerteHeures: fenetrePrealerteHeures ? Number(fenetrePrealerteHeures) : undefined,
      });
      setMessage('');
      setDateDebutPrevue('');
      setFenetrePrealerteHeures('');
      await reload();
    } catch {
      setFormError('Erreur lors de la mise à jour.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-kct-gold/10">
          <Wrench className="h-5 w-5 text-kct-gold" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Mode maintenance</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Sur mobile, seule la synchronisation est mise en pause — jamais la saisie locale hors-ligne.
          </p>
        </div>
      </div>

      <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <CardHeader>
          <CardTitle className="text-lg text-gray-900 dark:text-gray-100">Planifier / activer / terminer</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">
                Service ('GLOBAL' pour tous)
              </label>
              <input
                value={serviceCode}
                onChange={(e) => setServiceCode(e.target.value)}
                className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm text-gray-900 dark:text-gray-100 focus:border-kct-gold outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Statut</label>
              <select
                value={statut}
                onChange={(e) => setStatut(e.target.value as MaintenanceStatut)}
                className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm text-gray-900 dark:text-gray-100 focus:border-kct-gold outline-none"
              >
                <option value="PLANIFIEE">Planifiée</option>
                <option value="ACTIVE">Active (bloque immédiatement)</option>
                <option value="TERMINEE">Terminée</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">
              Message (affiché aux utilisateurs)
            </label>
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ex. Maintenance planifiée dimanche 2h-4h pour mise à jour serveur"
              className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm text-gray-900 dark:text-gray-100 focus:border-kct-gold outline-none"
            />
          </div>

          {statut === 'PLANIFIEE' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">
                  Date de début prévue
                </label>
                <input
                  type="datetime-local"
                  value={dateDebutPrevue}
                  onChange={(e) => setDateDebutPrevue(e.target.value)}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm text-gray-900 dark:text-gray-100 focus:border-kct-gold outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">
                  Fenêtre de pré-alerte (heures, optionnel)
                </label>
                <input
                  type="number"
                  min="1"
                  value={fenetrePrealerteHeures}
                  onChange={(e) => setFenetrePrealerteHeures(e.target.value)}
                  placeholder="24 par défaut"
                  className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm text-gray-900 dark:text-gray-100 focus:border-kct-gold outline-none"
                />
              </div>
            </div>
          )}

          {formError && <p className="text-xs text-kct-red">{formError}</p>}

          <button
            onClick={handleSubmit}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-kct-gold text-white text-sm font-medium hover:bg-kct-gold/90 disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Enregistrer
          </button>
        </CardContent>
      </Card>

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
            <CardTitle className="text-lg text-gray-900 dark:text-gray-100">Services ({services.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {services.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">Aucun service configuré</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">
                      <th className="text-left px-4 py-3 font-medium">Service</th>
                      <th className="text-left px-4 py-3 font-medium">Statut</th>
                      <th className="text-left px-4 py-3 font-medium">Message</th>
                      <th className="text-left px-4 py-3 font-medium">Début prévu</th>
                    </tr>
                  </thead>
                  <tbody>
                    {services.map((s) => (
                      <tr key={s.id} className="border-b border-gray-100 dark:border-gray-800/50">
                        <td className="px-4 py-3 font-mono text-xs text-gray-700 dark:text-gray-300">{s.serviceCode}</td>
                        <td className="px-4 py-3">
                          <Badge variant={STATUT_VARIANT[s.statut]}>{s.statut}</Badge>
                        </td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400 max-w-xs truncate">{s.message}</td>
                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                          {s.dateDebutPrevue ? new Date(s.dateDebutPrevue).toLocaleString('fr-FR') : '—'}
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
