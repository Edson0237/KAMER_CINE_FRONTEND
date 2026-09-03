import { useState } from 'react';
import { useSessionsPage } from '../hooks/useSessionsPage';
import { useAuthContext } from '@/shared/auth/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Lock, Pencil, Loader2, CalendarCheck, Search } from 'lucide-react';
import type { SessionFormation, CreateSessionRequest } from '../types';
import { TerritoireSelect } from './TerritoireSelect';
import { PaginationControls } from '@/shared/components/PaginationControls';

const EMPTY_FORM = (territoireId: string): CreateSessionRequest => ({
  territoireId, encadreurId: '', dateDebut: new Date().toISOString().split('T')[0], statut: 'planifiee',
});

/**
 * Écran CRUD des sessions de formation (M3).
 *
 * <p>Liste, création, modification et clôture des sessions. La clôture
 * déclenche le calcul du taux de réussite côté serveur.</p>
 */
export function SessionList() {
  const { user } = useAuthContext();
  const {
    sessions, loading, error, page, setPage, totalPages, totalElements, size,
    search, setSearch, create, update, cloturer,
  } = useSessionsPage(user?.territoireId);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<SessionFormation | null>(null);
  const [form, setForm] = useState<CreateSessionRequest>(EMPTY_FORM(user?.territoireId ?? ''));

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM(user?.territoireId ?? ''));
    setDialogOpen(true);
  };

  const openEdit = (s: SessionFormation) => {
    setEditing(s);
    setForm({
      territoireId: s.territoireId,
      encadreurId: s.encadreurId,
      dateDebut: s.dateDebut,
      dateFin: s.dateFin ?? undefined,
      lieu: s.lieu ?? undefined,
      programme: s.programme ?? undefined,
      statut: s.statut,
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

  if (loading && sessions.length === 0 && !search) {
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
          <h2 className="text-2xl font-bold text-kct-noir">Sessions</h2>
          <p className="text-sm text-gray-500">Gestion CRUD des sessions de formation</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle session
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? 'Modifier la session' : 'Créer une session'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <TerritoireSelect
                value={form.territoireId}
                onChange={(id) => setForm({ ...form, territoireId: id })}
              />
              <div className="space-y-2">
                <Label htmlFor="sess-encadreur">Encadreur ID</Label>
                <Input id="sess-encadreur" value={form.encadreurId} onChange={(e) => setForm({ ...form, encadreurId: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sess-debut">Date de début</Label>
                <Input id="sess-debut" type="date" value={form.dateDebut} onChange={(e) => setForm({ ...form, dateDebut: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sess-fin">Date de fin</Label>
                <Input id="sess-fin" type="date" value={form.dateFin ?? ''} onChange={(e) => setForm({ ...form, dateFin: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sess-lieu">Lieu</Label>
                <Input id="sess-lieu" value={form.lieu ?? ''} onChange={(e) => setForm({ ...form, lieu: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sess-programme">Programme</Label>
                <Input id="sess-programme" value={form.programme ?? ''} onChange={(e) => setForm({ ...form, programme: e.target.value })} />
              </div>
              <Button onClick={handleSubmit} className="w-full">{editing ? 'Enregistrer' : 'Créer'}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Rechercher par lieu ou programme..."
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
                <TableHead>Lieu</TableHead>
                <TableHead>Programme</TableHead>
                <TableHead>Début</TableHead>
                <TableHead>Fin</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-500">
                    <CalendarCheck className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    {search ? 'Aucun résultat pour cette recherche' : 'Aucune session dans votre périmètre'}
                  </TableCell>
                </TableRow>
              ) : (
                sessions.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.lieu ?? '—'}</TableCell>
                    <TableCell>{s.programme ?? '—'}</TableCell>
                    <TableCell>{s.dateDebut}</TableCell>
                    <TableCell>{s.dateFin ?? '—'}</TableCell>
                    <TableCell>
                      <Badge variant={s.statut === 'cloturee' ? 'success' : s.statut === 'en_cours' ? 'warning' : 'outline'}>
                        {s.statut}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(s)}>
                        <Pencil className="h-4 w-4 text-gray-500" />
                      </Button>
                      {s.statut !== 'cloturee' && (
                        <Button variant="ghost" size="sm" onClick={() => cloturer(s.id)}>
                          <Lock className="h-4 w-4 mr-1" />
                          Clôturer
                        </Button>
                      )}
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
