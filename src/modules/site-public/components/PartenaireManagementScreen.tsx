import { useState } from 'react';
import { Handshake, Plus, Pencil, Trash2, X, ExternalLink } from 'lucide-react';
import { usePartenaires } from '../hooks/useEcosysteme';
import { ecosystemeService } from '../services/ecosystemeService';
import type { Partenaire } from '../types';

export function PartenaireManagementScreen() {
  const { data, loading, error, reload } = usePartenaires();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Partenaire | null>(null);
  const [form, setForm] = useState({ nom: '', logoUrl: '', siteWeb: '', ordre: 0 });
  const [submitting, setSubmitting] = useState(false);

  const openCreate = () => {
    setEditing(null);
    setForm({ nom: '', logoUrl: '', siteWeb: '', ordre: 0 });
    setShowForm(true);
  };

  const openEdit = (item: Partenaire) => {
    setEditing(item);
    setForm({ nom: item.nom, logoUrl: item.logoUrl || '', siteWeb: item.siteWeb || '', ordre: item.ordre });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editing) {
        await ecosystemeService.updatePartenaire(editing.id, form);
      } else {
        await ecosystemeService.createPartenaire(form);
      }
      setShowForm(false);
      reload();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce partenaire ?')) return;
    try {
      await ecosystemeService.deletePartenaire(id);
      reload();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Partenaires</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Logos et liens affichés sur le site public</p>
        </div>
        <button onClick={openCreate} className="inline-flex items-center gap-2 rounded-lg bg-[#B8860B] px-4 py-2 text-sm font-medium text-white hover:bg-[#9a7309]">
          <Plus className="h-4 w-4" /> Nouveau partenaire
        </button>
      </div>

      {loading && <p className="text-gray-500">Chargement...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {data.map((item) => (
          <div key={item.id} className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
            <div className="flex flex-col items-center text-center">
              {item.logoUrl ? (
                <img src={item.logoUrl} alt={item.nom} className="h-16 w-16 object-contain mb-2" />
              ) : (
                <div className="h-16 w-16 rounded bg-[#B8860B]/20 flex items-center justify-center mb-2">
                  <Handshake className="h-7 w-7 text-[#B8860B]" />
                </div>
              )}
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{item.nom}</h3>
              {item.siteWeb && (
                <a href={item.siteWeb} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline flex items-center gap-1 mt-1">
                  <ExternalLink className="h-3 w-3" /> Site web
                </a>
              )}
            </div>
            <div className="flex justify-end gap-1 mt-3">
              <button onClick={() => openEdit(item)} className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"><Pencil className="h-4 w-4 text-blue-500" /></button>
              <button onClick={() => handleDelete(item.id)} className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"><Trash2 className="h-4 w-4 text-red-500" /></button>
            </div>
          </div>
        ))}
        {!loading && data.length === 0 && <p className="col-span-full text-center text-gray-400 py-8">Aucun partenaire</p>}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowForm(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">{editing ? 'Modifier' : 'Nouveau'} partenaire</h2>
              <button onClick={() => setShowForm(false)} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom</label>
                <input type="text" required value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">URL du logo (optionnel)</label>
                <input type="url" value={form.logoUrl} onChange={(e) => setForm({ ...form, logoUrl: e.target.value })} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Site web (optionnel)</label>
                <input type="url" value={form.siteWeb} onChange={(e) => setForm({ ...form, siteWeb: e.target.value })} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ordre d'affichage</label>
                <input type="number" value={form.ordre} onChange={(e) => setForm({ ...form, ordre: parseInt(e.target.value) || 0 })} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-white" />
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
