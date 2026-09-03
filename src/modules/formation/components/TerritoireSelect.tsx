import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Lock, Loader2 } from 'lucide-react';
import { useUserTerritoires } from '../../territoire/hooks/useUserTerritoires';

/**
 * Champ de sélection de territoire verrouillé au périmètre de l'utilisateur.
 *
 * <p>Si l'utilisateur n'a qu'un seul territoire (ex. niveau commune N5),
 * le champ est pré-rempli et désactivé (verrouillé). S'il a plusieurs
 * territoires enfants (ex. niveau régional N2), un select propose
 * uniquement les territoires de son périmètre — jamais un champ libre.</p>
 *
 * @param value l'ID du territoire sélectionné
 * @param onChange callback appelé avec le nouvel ID
 */
export function TerritoireSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (id: string) => void;
}) {
  const { territoires, loading, isSingleTerritoire, userTerritoireId } = useUserTerritoires();

  if (loading) {
    return (
      <div className="space-y-2">
        <Label>Territoire</Label>
        <div className="flex items-center gap-2 h-10 px-3 rounded-md border border-gray-200 bg-gray-50">
          <Loader2 className="h-4 w-4 animate-spin text-kct-gold" />
          <span className="text-sm text-gray-500">Chargement des territoires…</span>
        </div>
      </div>
    );
  }

  if (isSingleTerritoire) {
    const territoire = territoires[0];
    return (
      <div className="space-y-2">
        <Label htmlFor="territoire">Territoire</Label>
        <div className="relative">
          <Input
            id="territoire"
            value={territoire?.nom ?? userTerritoireId}
            disabled
            className="bg-gray-50 pr-9"
          />
          <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="territoire">Territoire</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id="territoire">
          <SelectValue placeholder="Sélectionner un territoire" />
        </SelectTrigger>
        <SelectContent>
          {territoires.map((t) => (
            <SelectItem key={t.id} value={t.id}>
              {t.nom}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
