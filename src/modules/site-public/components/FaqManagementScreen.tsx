import { useState } from 'react';
import { HelpCircle, Plus, Pencil, Trash2, X } from 'lucide-react';
import { useFaq } from '../hooks/useEcosysteme';
import { ecosystemeService } from '../services/ecosystemeService';
import type { FaqItem } from '../types';

export function FaqManagementScreen() {
  const { data, loading, error, reload } = useFaq();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<FaqItem | null>(null);
  const [form, setForm] = useState({ question: '', reponse: '', categorie: '', ordre: 0 });
  const [submitting, setSubmitting] = useState(false);

  const openCreate = () => {
    setEditing(null);
    setForm({ question: '', reponse: '', categorie: '', ordre: 0 });
    setShowForm(true);
  };

  const openEdit = (item: FaqItem) => {
    setEditing(item);
    setForm({ question: item.question, reponse: item.reponse, categorie: item.categorie, ordre: item.ordre });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editing) {
        await ecosystemeService.updateFaqItem(editing.id, form);
      } else {
        await ecosystemeService.createFaqItem(form);
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
    if (!confirm('Supprimer cette question ?')) return;
    try {
      await ecosystemeService.deleteFaqItem(id);
      reload();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur');
    }
  };

  const categories = [...new Set(data.map((d) => d.categorie))];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">FAQ du site</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Gérer les questions fréquentes</p>
        </div>
        <button onClick={openCreate} className="inline-flex items-center gap-2 rounded-lg bg-[#B8860B] px-4 py-2 text-sm font-medium text-white hover:bg-[#9a7309]">
          <Plus className="h-4 w-4" /> Nouvelle question
        </button>
      </div>

      {loading && <p className="text-gray-500">Chargement...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {categories.map((cat) => (
        <div key={cat} className="space-y-2">
          <h2 className="text-sm font-semibold text-[#B8860B] uppercase tracking-wide">{cat}</h2>
          {data.filter((d) => d.categorie === cat).map((item) => (
            <div key={item.id} className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <HelpCircle className="h-4 w-4 text-[#B8860B] shrink-0" />
                    <h3 className="font-medium text-gray-900 dark:text-white">{item.question}</h3>
                    {!item.actif && <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">Inactive</span>}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{item.reponse}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => openEdit(item)} className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"><Pencil className="h-4 w-4 text-blue-500" /></button>
                  <button onClick={() => handleDelete(item.id)} className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"><Trash2 className="h-4 w-4 text-red-500" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}
      {!loading && data.length === 0 && <p className="text-center text-gray-400 py-8">Aucune question FAQ</p>}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowForm(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">{editing ? 'Modifier' : 'Nouvelle'} question</h2>
              <button onClick={() => setShowForm(false)} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Question</label>
                <input type="text" required value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Réponse</label>
                <textarea required rows={4} value={form.reponse} onChange={(e) => setForm({ ...form, reponse: e.target.value })} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-white" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Catégorie</label>
                  <input type="text" required value={form.categorie} onChange={(e) => setForm({ ...form, categorie: e.target.value })} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ordre</label>
                  <input type="number" value={form.ordre} onChange={(e) => setForm({ ...form, ordre: parseInt(e.target.value) || 0 })} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-white" />
                </div>
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
