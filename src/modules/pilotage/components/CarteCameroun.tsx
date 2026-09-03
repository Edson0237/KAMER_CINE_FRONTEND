import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import { useCarte } from '../hooks/useCarte';
import { useTerritoires } from '@/modules/territoire/hooks/useTerritoires';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

const STATUT_COLORS: Record<string, string> = {
  'active': '#3F9142',
  'en_cours': '#C9A227',
  'inactive': '#C0392B',
  'planifiee': '#B8860B',
};

/**
 * Carte interactive du Cameroun (M2/M4) — affiche les communes colorées
 * selon leur statut_commune.
 *
 * <p>Utilise react-leaflet avec un GeoJSON du Cameroun par commune.
 * Chaque commune est cliquable et redirige vers la fiche détaillée.
 * Les données sont filtrées par le périmètre côté API.</p>
 */
export function CarteCameroun() {
  const { carteData, loading, error } = useCarte();
  const { communes } = useTerritoires();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-kct-gold" />
      </div>
    );
  }

  if (error) {
    return <p className="text-kct-red">{error}</p>;
  }

  const communeMap = new Map(
    (carteData?.communes ?? []).map((c) => [c.nom, c]),
  );

  const style = (feature?: GeoJSON.Feature) => {
    const communeName = feature?.properties?.['NAME_3'] ?? feature?.properties?.['name'] ?? '';
    const commune = communeMap.get(communeName);
    const statut = commune?.statutCommune ?? 'inactive';
    return {
      fillColor: STATUT_COLORS[statut] ?? '#C0392B',
      weight: 1,
      opacity: 1,
      color: '#1A1A1A',
      fillOpacity: 0.6,
    };
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Carte du Cameroun</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Communes colorées selon leur statut de déploiement</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {Object.entries(STATUT_COLORS).map(([statut, couleur]) => (
          <div key={statut} className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: couleur }} />
            <span className="text-sm text-gray-900 dark:text-gray-100 capitalize">{statut.replace(/_/g, ' ')}</span>
          </div>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          <MapContainer
            center={[7.3697, 12.3543]}
            zoom={6}
            style={{ height: '600px', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap contributors'
            />
            <GeoJSON
              data={communeGeoJsonPlaceholder}
              style={style}
              onEachFeature={(feature, layer) => {
                const communeName = feature.properties?.['NAME_3'] ?? feature.properties?.['name'] ?? '';
                const commune = communeMap.get(communeName);
                if (commune) {
                  layer.bindPopup(`
                    <strong>${commune.nom}</strong><br/>
                    Statut: ${commune.statutCommune}<br/>
                    Apprenants: ${commune.nombreApprenants}<br/>
                    Encadreurs: ${commune.nombreEncadreurs}<br/>
                    Sessions: ${commune.nombreSessions}
                  `);
                  layer.on('click', () => {
                    navigate(`/communes/${commune.id}`);
                  });
                }
              }}
            />
          </MapContainer>
        </CardContent>
      </Card>

      {communes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-gray-900 dark:text-gray-100">Liste des communes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {communes.map((c) => (
                <button
                  key={c.id}
                  onClick={() => navigate(`/communes/${c.id}`)}
                  className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
                >
                  <span className="text-sm text-gray-900 dark:text-gray-100">{c.nom}</span>
                  <Badge
                    variant={c.statutCommune === 'active' ? 'success' : c.statutCommune === 'en_cours' ? 'warning' : 'danger'}
                  >
                    {c.statutCommune}
                  </Badge>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

const communeGeoJsonPlaceholder: GeoJSON.FeatureCollection = {
  type: 'FeatureCollection',
  features: [],
};
