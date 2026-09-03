import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '@/modules/auth/services/authService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Film, Loader2, Mail, KeyRound, ArrowLeft, CheckCircle2 } from 'lucide-react';

type Step = 'email' | 'code' | 'done';

export function ForgotPasswordScreen() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await authService.forgotPassword({ email });
      setStep('code');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de l\'envoi du code';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    if (newPassword.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await authService.resetPassword({ email, code, newPassword });
      setStep('done');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Code invalide ou expiré';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-kct-noir">
      {/* Colonne gauche — branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-kct-noir via-kct-noir to-kct-gold/30 flex-col justify-between p-12">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: "radial-gradient(circle at 20% 50%, #B8860B 0%, transparent 50%), radial-gradient(circle at 80% 80%, #3F9142 0%, transparent 40%)"
        }} />
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-kct-gold flex items-center justify-center shadow-lg">
            <Film className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-xl leading-tight">KAMER CINÉ TALENTS</h1>
            <p className="text-kct-gold text-sm font-medium">Manager Web</p>
          </div>
        </div>
        <div className="relative z-10 space-y-6">
          <h2 className="text-white text-4xl font-bold leading-tight">
            Récupération<br />de mot de passe
          </h2>
          <p className="text-gray-300 text-lg max-w-md">
            Saisissez votre email pour recevoir un code de vérification
            et réinitialiser votre mot de passe.
          </p>
        </div>
        <div className="relative z-10 text-gray-500 text-sm">
          © 2026 KAMER CINÉ TALENTS — Tous droits réservés
        </div>
      </div>

      {/* Colonne droite — formulaire */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-kct-beige">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-kct-gold flex items-center justify-center shadow-lg">
              <Film className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-kct-noir font-bold text-lg leading-tight">KAMER CINÉ TALENTS</h1>
              <p className="text-kct-gold text-sm font-medium">Manager Web</p>
            </div>
          </div>

          {step === 'email' && (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-kct-noir">Mot de passe oublié</h2>
                <p className="text-gray-600 mt-1">Entrez votre email pour recevoir un code</p>
              </div>
              <form onSubmit={handleSendCode} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-kct-noir font-medium">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="exemple@kamer-cinetalents.cm"
                      required
                      className="pl-10 bg-white border-gray-300"
                    />
                  </div>
                </div>
                {error && (
                  <p className="text-sm text-kct-red bg-kct-red/10 p-3 rounded-md border border-kct-red/20">{error}</p>
                )}
                <Button type="submit" disabled={loading} className="w-full bg-kct-gold hover:bg-kct-yellow text-white font-semibold py-2 text-base">
                  {loading ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Envoi...</>
                  ) : (
                    'Envoyer le code'
                  )}
                </Button>
              </form>
            </>
          )}

          {step === 'code' && (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-kct-noir">Vérification</h2>
                <p className="text-gray-600 mt-1">
                  Un code a été envoyé à <span className="font-medium text-kct-noir">{email}</span>.
                  Vérifiez les logs du serveur (V1).
                </p>
              </div>
              <form onSubmit={handleResetPassword} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="code" className="text-kct-noir font-medium">Code de vérification</Label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="code"
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="123456"
                      maxLength={6}
                      required
                      className="pl-10 bg-white border-gray-300 text-center text-lg tracking-widest font-bold"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-kct-noir font-medium">Nouveau mot de passe</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="bg-white border-gray-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-kct-noir font-medium">Confirmer le mot de passe</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="bg-white border-gray-300"
                  />
                </div>
                {error && (
                  <p className="text-sm text-kct-red bg-kct-red/10 p-3 rounded-md border border-kct-red/20">{error}</p>
                )}
                <Button type="submit" disabled={loading} className="w-full bg-kct-gold hover:bg-kct-yellow text-white font-semibold py-2 text-base">
                  {loading ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Vérification...</>
                  ) : (
                    'Réinitialiser'
                  )}
                </Button>
              </form>
            </>
          )}

          {step === 'done' && (
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-kct-green/20 flex items-center justify-center">
                  <CheckCircle2 className="h-8 w-8 text-kct-green" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-kct-noir">Mot de passe réinitialisé</h2>
                <p className="text-gray-600 mt-2">Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.</p>
              </div>
              <Button onClick={() => navigate('/login')} className="w-full bg-kct-gold hover:bg-kct-yellow text-white font-semibold py-2 text-base">
                Retour à la connexion
              </Button>
            </div>
          )}

          {step !== 'done' && (
            <Link to="/login" className="flex items-center gap-2 text-sm text-kct-gold hover:underline font-medium mt-6 justify-center">
              <ArrowLeft className="h-4 w-4" /> Retour à la connexion
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
