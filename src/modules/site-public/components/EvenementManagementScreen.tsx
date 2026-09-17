import { useState } from 'react';
import { CalendarDays, Pencil, Plus, Trash2, X } from 'lucide-react';
import { useEvenements } from '../hooks/useEvenements';
import { ecosystemeService } from '../services/ecosystemeService';
import type { CreateEvenementRequest, Evenement } from '../types';

const emptyForm: CreateEvenementRequest = {
  titre: '', type: 'autre', dateDebut: '', statut: 'programme',
};

function toInputDate(value: string | null): string {
  return value ? value.slice(0, 16) : '';
}

function toApiDate(value: string | undefined): string | undefined {
  return value ? new Date(value).toISOString() : undefined;
}

export function EvenementManagementScreen() {
  const { data, loading, error, reload } = useEvenements();
  const [form, setForm] = useState<CreateEvenementRequest>(emptyForm);
  const [editing, setEditing] = useState<Evenement | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (event: Evenement) => {
    setEditing(event);
    setForm({
      titre: event.titre, description: event.description ?? '', type: event.type,
      dateDebut: toInputDate(event.dateDebut), dateFin: toInputDate(event.dateFin),
      lieu: event.lieu ?? '', adresse: event.adresse ?? '', communeId: event.communeId ?? '',
      imageUrl: event.imageUrl ?? '', capacite: event.capacite ?? undefined, statut: event.statut,
    });
    setShowForm(true);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const request: CreateEvenementRequest = {
        ...form,
        dateDebut: toApiDate(form.dateDebut) ?? form.dateDebut,
        dateFin: toApiDate(form.dateFin),
      };
      if (editing) await ecosystemeService.updateEvenement(editing.id, request);
      else await ecosystemeService.createEvenement(request);
      setShowForm(false);
      await reload();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur lors de l’enregistrement');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cet événement ?')) return;
    try { await ecosystemeService.deleteEvenement(id); await reload(); }
    catch (err) { alert(err instanceof Error ? err.message : 'Erreur lors de la suppression'); }
  };

  const setField = (field: keyof CreateEvenementRequest, value: string | number | undefined) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Événements</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Programmation affichée sur le site public</p>
        </div>
        <button onClick={openCreate} className="inline-flex items-center gap-2 rounded-lg bg-[#B8860B] px-4 py-2 text-sm font-medium text-white hover:bg-[#9a7309]">
          <Plus className="h-4 w-4" /> Nouvel événement
        </button>
      </div>

      {loading && <p className="text-gray-500">Chargement...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-gray-200 dark:border-gray-700 text-left text-gray-500">
            <th className="px-4 py-3">Titre</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">Début</th><th className="px-4 py-3">Statut</th><th className="px-4 py-3">Actions</th>
          </tr></thead>
          <tbody>
            {data.map((event) => <tr key={event.id} className="border-b border-gray-100 dark:border-gray-700 last:border-0">
              <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{event.titre}</td>
              <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{event.type}</td>
              <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{new Date(event.dateDebut).toLocaleString('fr-FR')}</td>
              <td className="px-4 py-3">{event.statut}</td>
              <td className="px-4 py-3"><div className="flex gap-1"><button title="Modifier" onClick={() => openEdit(event)} className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"><Pencil className="h-4 w-4 text-blue-500" /></button><button title="Supprimer" onClick={() => handleDelete(event.id)} className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"><Trash2 className="h-4 w-4 text-red-500" /></button></div></td>
            </tr>)}
            {!loading && data.length === 0 && <tr><td colSpan={5} className="px-4 py-10 text-center text-gray-400"><CalendarDays className="mx-auto mb-2 h-8 w-8" />Aucun événement</td></tr>}
          </tbody>
        </table>
      </div>

      {showForm && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowForm(false)}>
        <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 dark:bg-gray-800" onClick={(event) => event.stopPropagation()}>
          <div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-bold text-gray-900 dark:text-white">{editing ? 'Modifier' : 'Nouvel'} événement</h2><button title="Fermer" onClick={() => setShowForm(false)}><X className="h-5 w-5" /></button></div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="sm:col-span-2">Titre<input required value={form.titre} onChange={(e) => setField('titre', e.target.value)} className="mt-1 w-full rounded border px-3 py-2" /></label>
            <label>Type<select value={form.type} onChange={(e) => setField('type', e.target.value)} className="mt-1 w-full rounded border px-3 py-2"><option>projection</option><option>atelier</option><option>cérémonie</option><option>formation</option><option>autre</option></select></label>
            <label>Statut<select value={form.statut} onChange={(e) => setField('statut', e.target.value)} className="mt-1 w-full rounded border px-3 py-2"><option>programme</option><option>en_cours</option><option>termine</option><option>annule</option></select></label>
            <label>Date de début<input required type="datetime-local" value={form.dateDebut} onChange={(e) => setField('dateDebut', e.target.value)} className="mt-1 w-full rounded border px-3 py-2" /></label>
            <label>Date de fin<input type="datetime-local" value={form.dateFin ?? ''} onChange={(e) => setField('dateFin', e.target.value)} className="mt-1 w-full rounded border px-3 py-2" /></label>
            <label>Lieu<input value={form.lieu ?? ''} onChange={(e) => setField('lieu', e.target.value)} className="mt-1 w-full rounded border px-3 py-2" /></label>
            <label>Capacité<input type="number" min="0" value={form.capacite ?? ''} onChange={(e) => setField('capacite', e.target.value ? Number(e.target.value) : undefined)} className="mt-1 w-full rounded border px-3 py-2" /></label>
            <label className="sm:col-span-2">Adresse<input value={form.adresse ?? ''} onChange={(e) => setField('adresse', e.target.value)} className="mt-1 w-full rounded border px-3 py-2" /></label>
            <label className="sm:col-span-2">Description<textarea value={form.description ?? ''} onChange={(e) => setField('description', e.target.value)} className="mt-1 w-full rounded border px-3 py-2" rows={3} /></label>
            <label className="sm:col-span-2">URL de l’image<input type="url" value={form.imageUrl ?? ''} onChange={(e) => setField('imageUrl', e.target.value)} className="mt-1 w-full rounded border px-3 py-2" /></label>
            <div className="flex justify-end gap-2 sm:col-span-2"><button type="button" onClick={() => setShowForm(false)} className="rounded border px-4 py-2">Annuler</button><button type="submit" disabled={submitting} className="rounded bg-[#B8860B] px-4 py-2 text-white disabled:opacity-50">{submitting ? 'Enregistrement...' : 'Enregistrer'}</button></div>
          </form>
        </div>
      </div>}
    </div>
  );
}