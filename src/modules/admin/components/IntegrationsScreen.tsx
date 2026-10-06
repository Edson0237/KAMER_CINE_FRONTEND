import { useState } from 'react';
import { useIntegrations } from '../hooks/useAdmin';
import { adminService } from '../services/adminService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plug, ToggleLeft, ToggleRight, Save } from 'lucide-react';

/**
 * Écran Admin technique — fournisseurs externes configurés (SMS, email...).
 *
 * <p>La configuration ({@code config}) est un objet JSON libre côté API
 * (clés/valeurs propres à chaque fournisseur) — édité ici comme texte
 * JSON brut plutôt qu'un formulaire par fournisseur, pour rester générique
 * sans présumer du schéma de chaque intégration.</p>
 */
export function IntegrationsScreen() {
  const { integrations, loading, error, reload } = useIntegrations();
  const [editingCode, setEditingCode] = useState<string | null>(null);
  const [configText, setConfigText] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [newCode, setNewCode] = useState('');

  const startEdit = (code: string, config: Record<string, unknown>) => {
    setEditingCode(code);
    setConfigText(JSON.stringify(config, null, 2));
    setJsonError(null);
  };

  const handleToggle = async (code: string, config: Record<string, unknown>, actif: boolean) => {
    setSaving(code);
    try {
      await adminService.setIntegration(code, config, !actif);
      await reload();
    } finally {
      setSaving(null);
    }
  };

  const handleSaveConfig = async (code: string, actif: boolean) => {
    let parsed: Record<string, unknown>;
    try {
      parsed = configText.trim() ? JSON.parse(configText) : {};
    } catch {
      setJsonError('JSON invalide');
      return;
    }
    setSaving(code);
    try {
      await adminService.setIntegration(code, parsed, actif);
      setEditingCode(null);
      await reload();
    } catch {
      setJsonError('Erreur lors de l\'enregistrement');
    } finally {
      setSaving(null);
    }
  };

  const handleCreate = async () => {
    if (!newCode.trim()) return;
    setSaving(newCode);
    try {
      await adminService.setIntegration(newCode.trim(), {}, false);
      setNewCode('');
      await reload();
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-kct-gold/10">
          <Plug className="h-5 w-5 text-kct-gold" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Intégrations externes</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Fournisseurs SMS, email et autres services tiers</p>
        </div>
      </div>

      <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <CardContent className="pt-6 flex items-end gap-2">
          <div className="flex-1">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">
              Nouveau code d'intégration (ex. sms_orange)
            </label>
            <input
              value={newCode}
              onChange={(e) => setNewCode(e.target.value)}
              className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm text-gray-900 dark:text-gray-100 focus:border-kct-gold outline-none"
            />
          </div>
          <button
            onClick={handleCreate}
            disabled={!newCode.trim() || saving === newCode}
            className="px-4 py-2 rounded-md bg-kct-gold text-white text-sm font-medium hover:bg-kct-gold/90 disabled:opacity-50"
          >
            Ajouter
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
        <div className="space-y-3">
          {integrations.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-8">Aucune intégration configurée</p>
          )}
          {integrations.map((i) => (
            <Card key={i.id} className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base text-gray-900 dark:text-gray-100 font-mono">{i.code}</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant={i.actif ? 'success' : 'outline'}>{i.actif ? 'Actif' : 'Inactif'}</Badge>
                  <button
                    onClick={() => handleToggle(i.code, i.config, i.actif)}
                    disabled={saving === i.code}
                    className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    {saving === i.code ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : i.actif ? (
                      <ToggleRight className="h-4 w-4 text-green-500" />
                    ) : (
                      <ToggleLeft className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                {editingCode === i.code ? (
                  <div className="space-y-2">
                    <textarea
                      value={configText}
                      onChange={(e) => setConfigText(e.target.value)}
                      rows={5}
                      className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-xs font-mono text-gray-900 dark:text-gray-100 focus:border-kct-gold outline-none"
                    />
                    {jsonError && <p className="text-xs text-kct-red">{jsonError}</p>}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleSaveConfig(i.code, i.actif)}
                        disabled={saving === i.code}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-kct-gold text-white text-xs font-medium hover:bg-kct-gold/90 disabled:opacity-50"
                      >
                        {saving === i.code ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                        Enregistrer
                      </button>
                      <button onClick={() => setEditingCode(null)} className="text-xs text-gray-400 hover:underline">
                        Annuler
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => startEdit(i.code, i.config)}
                    className="text-xs font-mono text-gray-500 dark:text-gray-400 hover:text-kct-gold text-left"
                  >
                    {Object.keys(i.config).length > 0 ? JSON.stringify(i.config) : 'Aucune configuration — cliquer pour éditer'}
                  </button>
                )}
                {i.derniereVerification && (
                  <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-2">
                    Dernière vérification : {new Date(i.derniereVerification).toLocaleString('fr-FR')}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
