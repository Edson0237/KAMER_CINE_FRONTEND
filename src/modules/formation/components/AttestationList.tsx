import { useState } from 'react';
import { useAttestations } from '../hooks/useAttestations';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Loader2, Award } from 'lucide-react';

/**
 * Écran de gestion des attestations (M3).
 *
 * <p>L'émission d'attestations est réservée aux niveaux N1-N5.
 * Le frontend ne fait QUE refléter ce que l'API autorise.</p>
 */
export function AttestationList() {
  const { attestations, loading, error, create } = useAttestations();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [apprenantId, setApprenantId] = useState('');
  const [sessionId, setSessionId] = useState('');

  const handleCreate = async () => {
    await create(apprenantId, sessionId);
    setDialogOpen(false);
    setApprenantId('');
    setSessionId('');
  };

  if (loading && attestations.length === 0) {
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
          <h2 className="text-2xl font-bold text-kct-noir">Attestations</h2>
          <p className="text-sm text-gray-500">Attestations émises dans votre périmètre</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Émettre une attestation
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Émettre une attestation</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="att-apprenant">Apprenant ID</Label>
                <Input id="att-apprenant" value={apprenantId} onChange={(e) => setApprenantId(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="att-session">Session ID</Label>
                <Input id="att-session" value={sessionId} onChange={(e) => setSessionId(e.target.value)} />
              </div>
              <Button onClick={handleCreate} className="w-full">Émettre</Button>
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
                <TableHead>Numéro</TableHead>
                <TableHead>Apprenant</TableHead>
                <TableHead>Session</TableHead>
                <TableHead>Date d'émission</TableHead>
                <TableHead>Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attestations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-gray-500">
                    <Award className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    Aucune attestation émise
                  </TableCell>
                </TableRow>
              ) : (
                attestations.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-mono text-xs">{a.numeroAttestation}</TableCell>
                    <TableCell className="font-mono text-xs">{a.apprenantId.slice(0, 8)}...</TableCell>
                    <TableCell className="font-mono text-xs">{a.sessionId.slice(0, 8)}...</TableCell>
                    <TableCell>{a.dateEmission}</TableCell>
                    <TableCell>
                      <Badge variant={a.statut === 'emise' ? 'success' : 'warning'}>{a.statut}</Badge>
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
