import { useState } from 'react';
import { useApprenantsPage } from '../hooks/useApprenantsPage';
import { useAuthContext } from '@/shared/auth/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2, Pencil, Loader2, Users, Search } from 'lucide-react';
import type { Apprenant, CreateApprenantRequest } from '../types';
import { TerritoireSelect } from './TerritoireSelect';
import { PaginationControls } from '@/shared/components/PaginationControls';

const EMPTY_FORM = (territoireId: string): CreateApprenantRequest => ({
  territoireId, nom: '', prenom: '',
});

/**
 * Écran CRUD des apprenants (M3).
 *
 * <p>Liste, création et suppression des apprenants du périmètre.
 * Le territoireId est automatiquement renseigné depuis l'utilisateur connecté.
 * Aucune logique métier dans le composant — tout est délégué au hook.</p>
 */
export function ApprenantList() {
  const { user } = useAuthContext();
  const {
    apprenants, loading, error, page, setPage, totalPages, totalElements, size,
    search, setSearch, create, update, remove,
  } = useApprenantsPage(user?.territoireId);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Apprenant | null>(null);
  const [form, setForm] = useState<CreateApprenantRequest>(EMPTY_FORM(user?.territoireId ?? ''));

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM(user?.territoireId ?? ''));
    setDialogOpen(true);
  };

  const openEdit = (a: Apprenant) => {
    setEditing(a);
    setForm({
      territoireId: a.territoireId,
      nom: a.nom,
      prenom: a.prenom,
      dateNaissance: a.dateNaissance ?? undefined,
      sexe: a.sexe ?? undefined,
      telephone: a.telephone ?? undefined,
      photoUrl: a.photoUrl ?? undefined,
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

  if (loading && apprenants.length === 0 && !search) {
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
          <h2 className="text-2xl font-bold text-kct-noir">Apprenants</h2>
          <p className="text-sm text-gray-500">Gestion CRUD des apprenants du périmètre</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Nouvel apprenant
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? 'Modifier l\u2019apprenant' : 'Créer un apprenant'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <TerritoireSelect
                value={form.territoireId}
                onChange={(id) => setForm({ ...form, territoireId: id })}
              />
              <div className="space-y-2">
                <Label htmlFor="nom">Nom</Label>
                <Input id="nom" value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prenom">Prénom</Label>
                <Input id="prenom" value={form.prenom} onChange={(e) => setForm({ ...form, prenom: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sexe">Sexe</Label>
                <Input id="sexe" placeholder="M / F" value={form.sexe ?? ''} onChange={(e) => setForm({ ...form, sexe: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telephone">Téléphone</Label>
                <Input id="telephone" value={form.telephone ?? ''} onChange={(e) => setForm({ ...form, telephone: e.target.value })} />
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
                <TableHead>Sexe</TableHead>
                <TableHead>Téléphone</TableHead>
                <TableHead>Sync</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {apprenants.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-500">
                    <Users className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    {search ? 'Aucun résultat pour cette recherche' : 'Aucun apprenant dans votre périmètre'}
                  </TableCell>
                </TableRow>
              ) : (
                apprenants.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">{a.nom}</TableCell>
                    <TableCell>{a.prenom}</TableCell>
                    <TableCell>{a.sexe ?? '—'}</TableCell>
                    <TableCell>{a.telephone ?? '—'}</TableCell>
                    <TableCell>
                      {a.syncStatus && (
                        <Badge variant={a.syncStatus === 'synced' ? 'success' : 'warning'}>
                          {a.syncStatus}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(a)}>
                        <Pencil className="h-4 w-4 text-gray-500" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => remove(a.id)}>
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
