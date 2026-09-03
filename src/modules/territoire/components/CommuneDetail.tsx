import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { territoireService } from '../services/territoireService';
import type { Commune } from '../types';
import { useAuthContext } from '@/shared/auth/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users, GraduationCap, CalendarCheck, Loader2, MapPin, ClipboardList, Award, FileCheck } from 'lucide-react';

/**
 * Fiche détaillée d'une commune (M2).
 *
 * <p>Affiche les informations complètes d'une commune : statut de déploiement,
 * nombre d'apprenants, d'encadreurs et de sessions. Les données sont
 * filtrées par le périmètre territorial côté API.</p>
 */
export function CommuneDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, hasPermission } = useAuthContext();
  const [commune, setCommune] = useState<Commune | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    territoireService.getCommune(id)
      .then((data) => setCommune(data))
      .catch((err) => setError(err instanceof Error ? err.message : 'Erreur de chargement'))
      .finally(() => setLoading(false));
  }, [id]);

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

  if (!commune) {
    return <p className="text-gray-500">Commune introuvable</p>;
  }

  const statutVariant = commune.statutCommune === 'active'
    ? 'success' as const
    : commune.statutCommune === 'en_cours'
      ? 'warning' as const
      : 'danger' as const;

  const isN5 = user?.niveau === 5;

  const quickActions = [
    { label: 'Apprenants', icon: Users, path: '/apprenants', permission: 'apprenant:read' },
    { label: 'Encadreurs', icon: GraduationCap, path: '/encadreurs', permission: 'encadreur:read' },
    { label: 'Sessions', icon: CalendarCheck, path: '/sessions', permission: 'session:read' },
    { label: 'Présences', icon: ClipboardList, path: '/presences', permission: 'presence:read' },
    { label: 'Résultats', icon: Award, path: '/resultats', permission: 'resultat:read' },
    { label: 'Attestations', icon: FileCheck, path: '/attestations', permission: 'attestation:read' },
  ].filter((a) => hasPermission(a.permission));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate(isN5 ? '/dashboard' : '/carte')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-kct-noir dark:text-gray-100">{commune.nom}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Fiche détaillée de la commune</p>
        </div>
      </div>

      <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-kct-gold" />
              <CardTitle className="text-lg text-kct-noir dark:text-gray-100">Informations générales</CardTitle>
            </div>
            <Badge variant={statutVariant}>{commune.statutCommune}</Badge>
          </div>
          <CardDescription>Statut de déploiement de la commune</CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <dt className="text-sm text-gray-500 dark:text-gray-400">Identifiant</dt>
              <dd className="text-sm font-medium text-kct-noir dark:text-gray-100">{commune.id}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500 dark:text-gray-400">Territoire</dt>
              <dd className="text-sm font-medium text-kct-noir dark:text-gray-100">{commune.territoireId}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Apprenants</CardTitle>
            <Users className="h-5 w-5 text-kct-gold" />
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold text-kct-noir dark:text-gray-100">{commune.nombreApprenants}</span>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Encadreurs</CardTitle>
            <GraduationCap className="h-5 w-5 text-kct-gold" />
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold text-kct-noir dark:text-gray-100">{commune.nombreEncadreurs}</span>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Sessions</CardTitle>
            <CalendarCheck className="h-5 w-5 text-kct-gold" />
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold text-kct-noir dark:text-gray-100">{commune.nombreSessions}</span>
          </CardContent>
        </Card>
      </div>

      {isN5 && quickActions.length > 0 && (
        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="text-lg text-kct-noir dark:text-gray-100">Actions rapides</CardTitle>
            <CardDescription>Gestion quotidienne du centre de formation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {quickActions.map((action) => (
                <button
                  key={action.path}
                  onClick={() => navigate(action.path)}
                  className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-kct-gold hover:bg-kct-gold/5 dark:hover:bg-kct-gold/10 transition-all duration-200 group"
                >
                  <action.icon className="h-6 w-6 text-gray-400 group-hover:text-kct-gold transition-colors" />
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-300 group-hover:text-kct-gold transition-colors">
                    {action.label}
                  </span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
