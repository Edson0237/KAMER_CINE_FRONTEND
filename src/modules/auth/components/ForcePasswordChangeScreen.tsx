import { useNavigate } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { useAuthContext } from '@/shared/auth/AuthContext';
import { ChangePasswordForm } from './ChangePasswordForm';

/**
 * Écran forcé après connexion avec un mot de passe temporaire
 * (compte admin de seed ou compte apprenant créé après acceptation
 * de candidature). L'utilisateur ne peut naviguer ailleurs tant que
 * ce changement n'est pas effectué.
 */
export function ForcePasswordChangeScreen() {
  const { user, clearMustChangePassword } = useAuthContext();
  const navigate = useNavigate();

  const handleSuccess = () => {
    clearMustChangePassword();
    navigate('/dashboard', { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-kct-beige dark:bg-gray-950 p-6">
      <div className="w-full max-w-md rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-lg p-8">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="p-3 rounded-full bg-kct-gold/10 mb-3">
            <ShieldAlert className="h-8 w-8 text-kct-gold" />
          </div>
          <h1 className="text-xl font-bold text-kct-noir dark:text-gray-100">Changement de mot de passe requis</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Bonjour {user?.nom}. Votre compte utilise un mot de passe temporaire.
            Vous devez le changer avant de continuer.
          </p>
        </div>
        <ChangePasswordForm onSuccess={handleSuccess} />
      </div>
    </div>
  );
}
