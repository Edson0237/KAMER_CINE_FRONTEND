import { useState } from 'react';
import { usePresences } from '../hooks/usePresences';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Loader2, ClipboardList } from 'lucide-react';
import type { CreatePresenceRequest } from '../types';

/**
 * Écran CRUD des présences (M3).
 */
export function PresenceList() {
  const { presences, loading, error, create } = usePresences();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<CreatePresenceRequest>({
    sessionId: '',
    apprenantId: '',
    date: new Date().toISOString().split('T')[0],
    statut: 'present',
  });

  const handleCreate = async () => {
    await create(form);
    setDialogOpen(false);
    setForm({ sessionId: '', apprenantId: '', date: new Date().toISOString().split('T')[0], statut: 'present' });
  };

  if (loading && presences.length === 0) {
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
          <h2 className="text-2xl font-bold text-kct-noir">Présences</h2>
          <p className="text-sm text-gray-500">Suivi des présences aux sessions</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle présence
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Enregistrer une présence</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pres-session">Session ID</Label>
                <Input id="pres-session" value={form.sessionId} onChange={(e) => setForm({ ...form, sessionId: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pres-apprenant">Apprenant ID</Label>
                <Input id="pres-apprenant" value={form.apprenantId} onChange={(e) => setForm({ ...form, apprenantId: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pres-date">Date</Label>
                <Input id="pres-date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pres-statut">Statut</Label>
                <Input id="pres-statut" placeholder="present / absent / retard" value={form.statut} onChange={(e) => setForm({ ...form, statut: e.target.value })} />
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
                <TableHead>Date</TableHead>
                <TableHead>Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {presences.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-gray-500">
                    <ClipboardList className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    Aucune présence enregistrée
                  </TableCell>
                </TableRow>
              ) : (
                presences.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono text-xs">{p.sessionId.slice(0, 8)}...</TableCell>
                    <TableCell className="font-mono text-xs">{p.apprenantId.slice(0, 8)}...</TableCell>
                    <TableCell>{p.date}</TableCell>
                    <TableCell>
                      <Badge variant={p.statut === 'present' ? 'success' : p.statut === 'absent' ? 'danger' : 'warning'}>
                        {p.statut}
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
