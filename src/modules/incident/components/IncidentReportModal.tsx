import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { FormField, Input, Select, Textarea } from '@/components/ui/input';
import { incidentService } from '../services/incidentService';
import { TYPE_LABEL } from './incidentUi';
import type { IncidentGravite, IncidentType } from '../types';

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

/** Signalement d'incident — ouvert à tout utilisateur authentifié, quel que soit son niveau (§6.15). */
export function IncidentReportModal({ open, onClose, onCreated }: Props) {
  const [type, setType] = useState<IncidentType>('technique');
  const [gravite, setGravite] = useState<IncidentGravite>('faible');
  const [titre, setTitre] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!titre.trim() || !description.trim()) {
      setError('Le titre et la description sont obligatoires.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await incidentService.signaler({ type, gravite, titre: titre.trim(), description: description.trim() });
      setTitre('');
      setDescription('');
      setGravite('faible');
      onCreated();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Échec du signalement');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Signaler un incident"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Annuler</Button>
          <Button onClick={submit} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Signaler
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Type" required>
            <Select value={type} onChange={(e) => setType(e.target.value as IncidentType)}>
              {(Object.keys(TYPE_LABEL) as IncidentType[]).map((t) => <option key={t} value={t}>{TYPE_LABEL[t]}</option>)}
            </Select>
          </FormField>
          <FormField label="Gravité" hint="Une gravité critique alerte immédiatement le Comité Central.">
            <Select value={gravite} onChange={(e) => setGravite(e.target.value as IncidentGravite)}>
              <option value="faible">Faible</option>
              <option value="moyenne">Moyenne</option>
              <option value="critique">Critique</option>
            </Select>
          </FormField>
        </div>
        <FormField label="Titre" required>
          <Input value={titre} maxLength={200} onChange={(e) => setTitre(e.target.value)} placeholder="Ex. Caméra hors service" />
        </FormField>
        <FormField label="Description" required error={error}>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Que s'est-il passé ? Où ? Depuis quand ?" />
        </FormField>
      </div>
    </Modal>
  );
}
