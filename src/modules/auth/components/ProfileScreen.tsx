import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, UserCircle, Mail, Phone, MapPin, ShieldCheck } from 'lucide-react';
import { useAuthContext } from '@/shared/auth/AuthContext';
import { getNiveauLabel } from '@/shared/auth/ProtectedRoute';
import { profileService, type MyProfile } from '../services/profileService';
import { ChangePasswordForm } from './ChangePasswordForm';

/**
 * Écran de profil — permet à l'utilisateur connecté de consulter ses
 * propres informations et de changer volontairement son mot de passe
 * (indépendamment du forçage à la première connexion).
 */
export function ProfileScreen() {
  const { user } = useAuthContext();
  const [profile, setProfile] = useState<MyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    profileService.getMe()
      .then(setProfile)
      .catch((err) => setError(err instanceof Error ? err.message : 'Erreur de chargement du profil'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-kct-gold/10">
          <UserCircle className="h-5 w-5 text-kct-gold" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Mon profil</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Informations du compte et sécurité</p>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-kct-gold" />
        </div>
      )}

      {error && (
        <Card className="border-red-200 dark:border-red-800">
          <CardContent className="p-4 text-red-600 dark:text-red-400 text-sm">{error}</CardContent>
        </Card>
      )}

      {!loading && !error && profile && (
        <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <CardHeader>
            <CardTitle className="text-lg text-gray-900 dark:text-gray-100">Informations du compte</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-kct-gold/15 flex items-center justify-center text-kct-gold font-bold text-lg shrink-0">
                {profile.nom.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-gray-100">{profile.nom}</p>
                {profile.roleCode && (
                  <Badge variant="default">{profile.roleCode}{user ? ` — ${getNiveauLabel(user.niveau)}` : ''}</Badge>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Mail className="h-4 w-4 text-gray-400" />
                {profile.email}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Phone className="h-4 w-4 text-gray-400" />
                {profile.telephone ?? 'Non renseigné'}
              </div>
              {profile.territoireId && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  Territoire: {profile.territoireId}
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <ShieldCheck className="h-4 w-4 text-gray-400" />
                {profile.actif ? 'Compte actif' : 'Compte désactivé'}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <CardHeader>
          <CardTitle className="text-lg text-gray-900 dark:text-gray-100">Changer mon mot de passe</CardTitle>
        </CardHeader>
        <CardContent>
          <ChangePasswordForm />
        </CardContent>
      </Card>
    </div>
  );
}
