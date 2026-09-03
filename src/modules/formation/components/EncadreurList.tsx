import { useState } from 'react';
import { useEncadreursPage } from '../hooks/useEncadreursPage';
import { useAuthContext } from '@/shared/auth/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2, Pencil, Loader2, GraduationCap, Search } from 'lucide-react';
import type { Encadreur, CreateEncadreurRequest } from '../types';
import { TerritoireSelect } from './TerritoireSelect';
import { PaginationControls } from '@/shared/components/PaginationControls';

const EMPTY_FORM = (territoireId: string): CreateEncadreurRequest => ({
  territoireId, nom: '', prenom: '',
});

/**
 * Écran CRUD des encadreurs (M3).
 */
export function EncadreurList() {
  const { user } = useAuthContext();
  const {
    encadreurs, loading, error, page, setPage, totalPages, totalElements, size,
    search, setSearch, create, update, remove,
  } = useEncadreursPage(user?.territoireId);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Encadreur | null>(null);
  const [form, setForm] = useState<CreateEncadreurRequest>(EMPTY_FORM(user?.territoireId ?? ''));

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM(user?.territoireId ?? ''));
    setDialogOpen(true);
  };

  const openEdit = (enc: Encadreur) => {
    setEditing(enc);
    setForm({
      territoireId: enc.territoireId,
      nom: enc.nom,
      prenom: enc.prenom,
      telephone: enc.telephone ?? undefined,
      specialite: enc.specialite ?? undefined,
      disponibilite: enc.disponibilite ?? undefined,
      photoUrl: enc.photoUrl ?? undefined,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (editing) {
      await update(editing.id, form);
    } else {
      await create(form);
    }
    setDialogOpen(false);
  };

  if (loading && encadreurs.length === 0 && !search) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-kct-gold" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-kct-noir">Encadreurs</h2>
          <p className="text-sm text-gray-500">Gestion CRUD des encadreurs du périmètre</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Nouvel encadreur
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? 'Modifier l\u2019encadreur' : 'Créer un encadreur'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <TerritoireSelect
                value={form.territoireId}
                onChange={(id) => setForm({ ...form, territoireId: id })}
              />
              <div className="space-y-2">
                <Label htmlFor="enc-nom">Nom</Label>
                <Input id="enc-nom" value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="enc-prenom">Prénom</Label>
                <Input id="enc-prenom" value={form.prenom} onChange={(e) => setForm({ ...form, prenom: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="enc-tel">Téléphone</Label>
                <Input id="enc-tel" value={form.telephone ?? ''} onChange={(e) => setForm({ ...form, telephone: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="enc-spec">Spécialité</Label>
                <Input id="enc-spec" value={form.specialite ?? ''} onChange={(e) => setForm({ ...form, specialite: e.target.value })} />
              </div>
              <Button onClick={handleSubmit} className="w-full">{editing ? 'Enregistrer' : 'Créer'}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Rechercher par nom ou prénom..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {error && <p className="text-kct-red bg-kct-red/10 p-2 rounded-md">{error}</p>}

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Prénom</TableHead>
                <TableHead>Spécialité</TableHead>
                <TableHead>Téléphone</TableHead>
                <TableHead>Évaluation</TableHead>
                <TableHead>Sync</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {encadreurs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-gray-500">
                    <GraduationCap className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    {search ? 'Aucun résultat pour cette recherche' : 'Aucun encadreur dans votre périmètre'}
                  </TableCell>
                </TableRow>
              ) : (
                encadreurs.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="font-medium">{e.nom}</TableCell>
                    <TableCell>{e.prenom}</TableCell>
                    <TableCell>{e.specialite ?? '—'}</TableCell>
                    <TableCell>{e.telephone ?? '—'}</TableCell>
                    <TableCell>{e.evaluationMoyenne != null ? `${e.evaluationMoyenne.toFixed(1)}/5` : '—'}</TableCell>
                    <TableCell>
                      {e.syncStatus && (
                        <Badge variant={e.syncStatus === 'synced' ? 'success' : 'warning'}>{e.syncStatus}</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(e)}>
                        <Pencil className="h-4 w-4 text-gray-500" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => remove(e.id)}>
                        <Trash2 className="h-4 w-4 text-kct-red" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <PaginationControls
            page={page}
            totalPages={totalPages}
            totalElements={totalElements}
            size={size}
            onPageChange={setPage}
          />
        </CardContent>
      </Card>
    </div>
  );
}
