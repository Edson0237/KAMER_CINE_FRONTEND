import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Lock, CheckCircle } from 'lucide-react';
import { profileService } from '../services/profileService';

/**
 * Formulaire de changement de mot de passe, réutilisé pour :
 * - le changement forcé à la première connexion (mot de passe temporaire)
 * - le changement volontaire depuis l'écran de profil
 */
export function ChangePasswordForm({ onSuccess }: { onSuccess?: () => void }) {
  const { t } = useTranslation();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 8) {
      setError(t('auth.changePassword.errors.tooShort'));
      return;
    }
    if (newPassword !== confirmPassword) {
      setError(t('auth.changePassword.errors.mismatch'));
      return;
    }

    setLoading(true);
    try {
      await profileService.changePassword({ currentPassword, newPassword });
      setSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('auth.changePassword.errors.generic'));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center text-center gap-3 py-6">
        <CheckCircle className="h-10 w-10 text-green-500" />
        <p className="text-sm font-medium text-kct-noir dark:text-gray-100">{t('auth.changePassword.success')}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="currentPassword">{t('auth.changePassword.currentPassword')}</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            id="currentPassword"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            className="pl-10"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="newPassword">{t('auth.changePassword.newPassword')}</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            id="newPassword"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={8}
            className="pl-10"
          />
        </div>
        <p className="text-xs text-gray-400">{t('auth.changePassword.hint')}</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">{t('auth.changePassword.confirmPassword')}</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={8}
            className="pl-10"
          />
        </div>
      </div>

      {error && (
        <p className="text-sm text-kct-red bg-kct-red/10 p-3 rounded-md border border-kct-red/20">{error}</p>
      )}

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            {t('auth.changePassword.submitting')}
          </>
        ) : (
          t('auth.changePassword.submit')
        )}
      </Button>
    </form>
  );
}
