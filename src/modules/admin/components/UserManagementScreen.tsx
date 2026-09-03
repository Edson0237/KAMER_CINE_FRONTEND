import { useState } from 'react';
import { useUsers, useRoles } from '../hooks/useAdmin';
import { adminService } from '../services/adminService';
import { useTerritoires } from '@/modules/territoire/hooks/useTerritoires';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, UserPlus, Users as UsersIcon, X } from 'lucide-react';
import type { CreateUtilisateurRequest } from '../types';

const NIVEAU_LABELS: Record<number, string> = {
  0: 'Administrateur Système',
  1: 'N1 — Comité Central',
  2: 'N2 — Région',
  3: 'N3 — Département',
  4: 'N4 — Arrondissement',
  5: 'N5 — Commune',
  6: 'N6 — Encadreur',
  7: 'N7 — Apprenant',
};

export function UserManagementScreen() {
  const { users, loading, error, reload } = useUsers();
  const { roles } = useRoles();
  const { territoires } = useTerritoires();
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [form, setForm] = useState<CreateUtilisateurRequest>({
    nom: '',
    email: '',
    password: '',
    roleCode: '',
    territoireId: '',
    telephone: '',
  });

  const handleCreate = async () => {
    setCreating(true);
    setFormError(null);
    try {
      await adminService.createUser(form);
      setShowCreate(false);
      setForm({ nom: '', email: '', password: '', roleCode: '', territoireId: '', telephone: '' });
      reload();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Erreur lors de la création');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-kct-gold/10">
            <UsersIcon className="h-5 w-5 text-kct-gold" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Gestion des utilisateurs</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Module IAM — création et suivi des comptes</p>
          </div>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-kct-gold text-white text-sm font-medium hover:bg-kct-gold/90 transition-colors"
        >
          <UserPlus className="h-4 w-4" />
          Nouvel utilisateur
        </button>
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
              Utilisateurs du périmètre ({users.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">
                    <th className="text-left px-4 py-3 font-medium">Nom</th>
                    <th className="text-left px-4 py-3 font-medium">Email</th>
                    <th className="text-left px-4 py-3 font-medium">Rôle</th>
                    <th className="text-left px-4 py-3 font-medium">Niveau</th>
                    <th className="text-left px-4 py-3 font-medium">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-12 text-gray-400 dark:text-gray-500">
                        Aucun utilisateur
                      </td>
                    </tr>
                  ) : (
                    users.map((u) => (
                      <tr
                        key={u.id}
                        className="border-b border-gray-100 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                      >
                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{u.nom}</td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{u.email}</td>
                        <td className="px-4 py-3">
                          <Badge variant="default">{u.roleCode}</Badge>
                        </td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300 text-xs">
                          {NIVEAU_LABELS[u.niveau] ?? `N${u.niveau}`}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            u.actif
                              ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                              : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                          }`}>
                            {u.actif ? 'Actif' : 'Inactif'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create user modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <Card className="w-full max-w-lg border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg text-gray-900 dark:text-gray-100">Créer un utilisateur</CardTitle>
              <button onClick={() => setShowCreate(false)} className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </CardHeader>
            <CardContent className="space-y-4">
              {formError && (
                <div className="p-3 rounded-md bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
                  {formError}
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom complet</label>
                  <input
                    value={form.nom}
                    onChange={(e) => setForm({ ...form, nom: e.target.value })}
                    className="w-full h-9 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 text-sm text-gray-700 dark:text-gray-200"
                    placeholder="Jean Dupont"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                  <input
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full h-9 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 text-sm text-gray-700 dark:text-gray-200"
                    placeholder="jean@kct.cm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mot de passe</label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full h-9 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 text-sm text-gray-700 dark:text-gray-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Téléphone</label>
                  <input
                    value={form.telephone}
                    onChange={(e) => setForm({ ...form, telephone: e.target.value })}
                    className="w-full h-9 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 text-sm text-gray-700 dark:text-gray-200"
                    placeholder="+237..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rôle</label>
                  <select
                    value={form.roleCode}
                    onChange={(e) => setForm({ ...form, roleCode: e.target.value })}
                    className="w-full h-9 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 text-sm text-gray-700 dark:text-gray-200"
                  >
                    <option value="">Sélectionner...</option>
                    {roles.map((r) => (
                      <option key={r.id} value={r.code}>{r.libelle}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Territoire</label>
                  <select
                    value={form.territoireId}
                    onChange={(e) => setForm({ ...form, territoireId: e.target.value })}
                    className="w-full h-9 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 text-sm text-gray-700 dark:text-gray-200"
                  >
                    <option value="">Sélectionner...</option>
                    {territoires.map((t) => (
                      <option key={t.id} value={t.id}>{t.nom}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setShowCreate(false)}
                  className="px-4 py-2 rounded-md border border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleCreate}
                  disabled={creating || !form.nom || !form.email || !form.password || !form.roleCode || !form.territoireId}
                  className="px-4 py-2 rounded-md bg-kct-gold text-white text-sm font-medium hover:bg-kct-gold/90 disabled:opacity-50 transition-colors"
                >
                  {creating ? 'Création...' : 'Créer'}
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
