import { useState } from 'react';
import { Newspaper, Plus, Pencil, Trash2, Eye, EyeOff, X } from 'lucide-react';
import { useActualites } from '../hooks/useEcosysteme';
import { ecosystemeService } from '../services/ecosystemeService';
import type { ActualitePublique } from '../types';

export function ActualiteManagementScreen() {
  const { data, loading, error, reload } = useActualites();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ActualitePublique | null>(null);
  const [form, setForm] = useState({ titre: '', contenu: '', imageUrl: '' });
  const [submitting, setSubmitting] = useState(false);

  const openCreate = () => {
    setEditing(null);
    setForm({ titre: '', contenu: '', imageUrl: '' });
    setShowForm(true);
  };

  const openEdit = (item: ActualitePublique) => {
    setEditing(item);
    setForm({ titre: item.titre, contenu: item.contenu, imageUrl: item.imageUrl || '' });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editing) {
        await ecosystemeService.updateActualite(editing.id, form);
      } else {
        await ecosystemeService.createActualite(form);
      }
      setShowForm(false);
      reload();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTogglePublish = async (id: string) => {
    try {
      await ecosystemeService.togglePublishActualite(id);
      reload();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette actualité ?')) return;
    try {
      await ecosystemeService.deleteActualite(id);
      reload();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Actualités du site</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Gérer le contenu publié sur le site public</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-[#B8860B] px-4 py-2 text-sm font-medium text-white hover:bg-[#9a7309]"
        >
          <Plus className="h-4 w-4" /> Nouvelle actualité
        </button>
      </div>

      {loading && <p className="text-gray-500">Chargement...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <div className="space-y-3">
        {data.map((item) => (
          <div key={item.id} className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Newspaper className="h-4 w-4 text-[#B8860B] shrink-0" />
                  <h3 className="font-semibold text-gray-900 dark:text-white truncate">{item.titre}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${item.statut === 'publiee' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}>
                    {item.statut === 'publiee' ? 'Publiée' : 'Brouillon'}
                  </span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{item.contenu}</p>
                <p className="text-xs text-gray-400 mt-1">{new Date(item.datePublication).toLocaleDateString('fr-FR')}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => handleTogglePublish(item.id)} title={item.statut === 'publiee' ? 'Dépublier' : 'Publier'} className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                  {item.statut === 'publiee' ? <EyeOff className="h-4 w-4 text-gray-500" /> : <Eye className="h-4 w-4 text-green-600" />}
                </button>
                <button onClick={() => openEdit(item)} title="Modifier" className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                  <Pencil className="h-4 w-4 text-blue-500" />
                </button>
                <button onClick={() => handleDelete(item.id)} title="Supprimer" className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                  <Trash2 className="h-4 w-4 text-red-500" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {!loading && data.length === 0 && <p className="text-center text-gray-400 py-8">Aucune actualité</p>}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowForm(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">{editing ? 'Modifier' : 'Nouvelle'} actualité</h2>
              <button onClick={() => setShowForm(false)} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Titre</label>
                <input type="text" required value={form.titre} onChange={(e) => setForm({ ...form, titre: e.target.value })} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contenu</label>
                <textarea required rows={8} value={form.contenu} onChange={(e) => setForm({ ...form, contenu: e.target.value })} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">URL de l'image (optionnel)</label>
                <input type="url" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-white" />
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">Annuler</button>
                <button type="submit" disabled={submitting} className="px-4 py-2 rounded-lg bg-[#B8860B] text-white hover:bg-[#9a7309] disabled:opacity-50">{submitting ? 'Enregistrement...' : 'Enregistrer'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
