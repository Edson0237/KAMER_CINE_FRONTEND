import { useState } from 'react';
import { Calendar, Plus, Pencil, Trash2, X, MapPin, Clock, Users } from 'lucide-react';
import { useEvenements } from '../hooks/useEcosysteme';
import { ecosystemeService } from '../services/ecosystemeService';
import type { Evenement } from '../types';

const TYPES = ['projection', 'atelier', 'ceremonie', 'formation', 'autre'];
const STATUTS = ['programme', 'en_cours', 'termine', 'annule'];

export function EvenementManagementScreen() {
  const { data, loading, error, reload } = useEvenements();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Evenement | null>(null);
  const [form, setForm] = useState({
    titre: '', description: '', type: 'projection', dateDebut: '', dateFin: '',
    lieu: '', adresse: '', imageUrl: '', capacite: '', statut: 'programme',
  });
  const [submitting, setSubmitting] = useState(false);

  const openCreate = () => {
    setEditing(null);
    setForm({ titre: '', description: '', type: 'projection', dateDebut: '', dateFin: '', lieu: '', adresse: '', imageUrl: '', capacite: '', statut: 'programme' });
    setShowForm(true);
  };

  const openEdit = (item: Evenement) => {
    setEditing(item);
    setForm({
      titre: item.titre,
      description: item.description || '',
      type: item.type,
      dateDebut: item.dateDebut ? new Date(item.dateDebut).toISOString().slice(0, 16) : '',
      dateFin: item.dateFin ? new Date(item.dateFin).toISOString().slice(0, 16) : '',
      lieu: item.lieu || '',
      adresse: item.adresse || '',
      imageUrl: item.imageUrl || '',
      capacite: item.capacite?.toString() || '',
      statut: item.statut,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        titre: form.titre,
        description: form.description || undefined,
        type: form.type,
        dateDebut: new Date(form.dateDebut).toISOString(),
        dateFin: form.dateFin ? new Date(form.dateFin).toISOString() : undefined,
        lieu: form.lieu || undefined,
        adresse: form.adresse || undefined,
        imageUrl: form.imageUrl || undefined,
        capacite: form.capacite ? parseInt(form.capacite) : undefined,
        statut: form.statut,
      };
      if (editing) {
        await ecosystemeService.updateEvenement(editing.id, payload);
      } else {
        await ecosystemeService.createEvenement(payload);
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
    if (!confirm('Supprimer cet événement ?')) return;
    try {
      await ecosystemeService.deleteEvenement(id);
      reload();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur');
    }
  };

  const statutBadge = (statut: string) => {
    const styles: Record<string, string> = {
      programme: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      en_cours: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      termine: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
      annule: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };
    return styles[statut] || styles.programme;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Événements</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Gérer les événements affichés sur le site public</p>
        </div>
        <button onClick={openCreate} className="inline-flex items-center gap-2 rounded-lg bg-[#B8860B] px-4 py-2 text-sm font-medium text-white hover:bg-[#9a7309]">
          <Plus className="h-4 w-4" /> Nouvel événement
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
                  <Calendar className="h-4 w-4 text-[#B8860B] shrink-0" />
                  <h3 className="font-semibold text-gray-900 dark:text-white truncate">{item.titre}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${statutBadge(item.statut)}`}>{item.statut.replace('_', ' ')}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[#B8860B]/10 text-[#B8860B]">{item.type}</span>
                </div>
                {item.description && <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{item.description}</p>}
                <div className="flex items-center gap-4 text-xs text-gray-400 mt-2">
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {new Date(item.dateDebut).toLocaleDateString('fr-FR')}</span>
                  {item.lieu && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {item.lieu}</span>}
                  {item.capacite && <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {item.capacite} places</span>}
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
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
        {!loading && data.length === 0 && <p className="text-center text-gray-400 py-8">Aucun événement</p>}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowForm(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">{editing ? 'Modifier' : 'Nouvel'} événement</h2>
              <button onClick={() => setShowForm(false)} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Titre</label>
                <input type="text" required value={form.titre} onChange={(e) => setForm({ ...form, titre: e.target.value })} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-white" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-white">
                    {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Statut</label>
                  <select value={form.statut} onChange={(e) => setForm({ ...form, statut: e.target.value })} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-white">
                    {STATUTS.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date et heure de début</label>
                  <input type="datetime-local" required value={form.dateDebut} onChange={(e) => setForm({ ...form, dateDebut: e.target.value })} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date et heure de fin (optionnel)</label>
                  <input type="datetime-local" value={form.dateFin} onChange={(e) => setForm({ ...form, dateFin: e.target.value })} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-white" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Lieu</label>
                  <input type="text" value={form.lieu} onChange={(e) => setForm({ ...form, lieu: e.target.value })} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Adresse</label>
                  <input type="text" value={form.adresse} onChange={(e) => setForm({ ...form, adresse: e.target.value })} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-white" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">URL image (optionnel)</label>
                  <input type="url" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Capacité (optionnel)</label>
                  <input type="number" value={form.capacite} onChange={(e) => setForm({ ...form, capacite: e.target.value })} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-white" />
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
