import { useState } from 'react';
import { useResultats } from '../hooks/useResultats';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Loader2, Award } from 'lucide-react';
import type { CreateResultatRequest } from '../types';

/**
 * Écran CRUD des résultats d'examen (M3).
 */
export function ResultatList() {
  const { resultats, loading, error, create } = useResultats();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<CreateResultatRequest>({
    sessionId: '',
    apprenantId: '',
    note: 0,
    dateExamen: new Date().toISOString().split('T')[0],
  });

  const handleCreate = async () => {
    await create(form);
    setDialogOpen(false);
    setForm({ sessionId: '', apprenantId: '', note: 0, dateExamen: new Date().toISOString().split('T')[0] });
  };

  if (loading && resultats.length === 0) {
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
          <h2 className="text-2xl font-bold text-kct-noir">Résultats</h2>
          <p className="text-sm text-gray-500">Résultats d'examen des apprenants</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau résultat
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Enregistrer un résultat</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="res-session">Session ID</Label>
                <Input id="res-session" value={form.sessionId} onChange={(e) => setForm({ ...form, sessionId: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="res-apprenant">Apprenant ID</Label>
                <Input id="res-apprenant" value={form.apprenantId} onChange={(e) => setForm({ ...form, apprenantId: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="res-note">Note /20</Label>
                <Input id="res-note" type="number" min="0" max="20" step="0.5" value={form.note} onChange={(e) => setForm({ ...form, note: parseFloat(e.target.value) })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="res-date">Date d'examen</Label>
                <Input id="res-date" type="date" value={form.dateExamen} onChange={(e) => setForm({ ...form, dateExamen: e.target.value })} />
              </div>
              <Button onClick={handleCreate} className="w-full">Enregistrer</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {error && <p className="text-kct-red bg-kct-red/10 p-2 rounded-md">{error}</p>}

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Session</TableHead>
                <TableHead>Apprenant</TableHead>
                <TableHead>Note</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {resultats.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-gray-500">
                    <Award className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    Aucun résultat enregistré
                  </TableCell>
                </TableRow>
              ) : (
                resultats.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-mono text-xs">{r.sessionId.slice(0, 8)}...</TableCell>
                    <TableCell className="font-mono text-xs">{r.apprenantId.slice(0, 8)}...</TableCell>
                    <TableCell className="font-bold">{r.note}/20</TableCell>
                    <TableCell>{r.dateExamen}</TableCell>
                    <TableCell>
                      <Badge variant={r.note >= 10 ? 'success' : 'danger'}>
                        {r.note >= 10 ? 'Réussi' : 'Échec'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
