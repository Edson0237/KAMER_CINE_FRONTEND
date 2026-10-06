import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '@/modules/auth/services/authService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Film, Loader2, User, KeyRound, ArrowLeft, CheckCircle2 } from 'lucide-react';

/**
 * Flux "mot de passe oublié" en 3 étapes distinctes (§6.3) :
 * 1. identifiant → code envoyé (POST /mot-de-passe-oublie)
 * 2. code → jeton temporaire à usage unique (POST /verifier-code-reinitialisation)
 * 3. jeton + nouveau mot de passe (POST /changer-mot-de-passe)
 * Le jeton (pas le code, pas le mot de passe actuel) est seul habilité à
 * autoriser l'étape 3 — jamais transmis ni affiché à l'utilisateur.
 */
type Step = 'identifiant' | 'code' | 'nouveau-mot-de-passe' | 'done';

export function ForgotPasswordScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('identifiant');
  const [identifiant, setIdentifiant] = useState('');
  const [code, setCode] = useState('');
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await authService.forgotPassword({ identifiant });
      setStep('code');
    } catch (err) {
      const message = err instanceof Error ? err.message : t('auth.forgotPassword.errors.sendCode');
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { resetToken: token } = await authService.verifyResetCode({ identifiant, code });
      setResetToken(token);
      setStep('nouveau-mot-de-passe');
    } catch (err) {
      const message = err instanceof Error ? err.message : t('auth.forgotPassword.errors.invalidCode');
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError(t('auth.forgotPassword.errors.mismatch'));
      return;
    }
    if (newPassword.length < 8) {
      setError(t('auth.forgotPassword.errors.tooShort'));
      return;
    }
    if (!resetToken) {
      setError(t('auth.forgotPassword.errors.missingToken'));
      setStep('identifiant');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await authService.resetPasswordWithToken({ resetToken, newPassword });
      setStep('done');
    } catch (err) {
      const message = err instanceof Error ? err.message : t('auth.forgotPassword.errors.invalidToken');
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
            <h1 className="text-white font-bold text-xl leading-tight">{t('auth.branding.appName')}</h1>
            <p className="text-kct-gold text-sm font-medium">{t('auth.branding.tagline')}</p>
          </div>
        </div>
        <div className="relative z-10 space-y-6">
          <h2 className="text-white text-4xl font-bold leading-tight whitespace-pre-line">
            {t('auth.forgotPassword.brandingTitle')}
          </h2>
          <p className="text-gray-300 text-lg max-w-md">
            {t('auth.forgotPassword.brandingSubtitle')}
          </p>
        </div>
        <div className="relative z-10 text-gray-500 text-sm">
          {t('auth.branding.copyright')}
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
              <h1 className="text-kct-noir font-bold text-lg leading-tight">{t('auth.branding.appName')}</h1>
              <p className="text-kct-gold text-sm font-medium">{t('auth.branding.tagline')}</p>
            </div>
          </div>

          {/* Étape 1/3 */}
          {step === 'identifiant' && (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-kct-noir">{t('auth.forgotPassword.step1.title')}</h2>
                <p className="text-gray-600 mt-1">{t('auth.forgotPassword.step1.subtitle')}</p>
              </div>
              <form onSubmit={handleSendCode} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="identifiant" className="text-kct-noir font-medium">{t('auth.forgotPassword.step1.label')}</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="identifiant"
                      type="text"
                      value={identifiant}
                      onChange={(e) => setIdentifiant(e.target.value)}
                      placeholder={t('auth.forgotPassword.step1.placeholder')}
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
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> {t('auth.forgotPassword.step1.submitting')}</>
                  ) : (
                    t('auth.forgotPassword.step1.submit')
                  )}
                </Button>
              </form>
            </>
          )}

          {/* Étape 2/3 */}
          {step === 'code' && (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-kct-noir">{t('auth.forgotPassword.step2.title')}</h2>
                <p className="text-gray-600 mt-1">
                  {t('auth.forgotPassword.step2.subtitlePrefix')} <span className="font-medium text-kct-noir">{identifiant}</span>.
                  {' '}{t('auth.forgotPassword.step2.subtitleSuffix')}
                </p>
              </div>
              <form onSubmit={handleVerifyCode} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="code" className="text-kct-noir font-medium">{t('auth.forgotPassword.step2.label')}</Label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="code"
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="123456"
                      maxLength={6}
                      required
                      className="pl-10 bg-white border-gray-300 text-center text-lg tracking-widest font-bold"
                    />
                  </div>
                </div>
                {error && (
                  <p className="text-sm text-kct-red bg-kct-red/10 p-3 rounded-md border border-kct-red/20">{error}</p>
                )}
                <Button type="submit" disabled={loading || code.length !== 6} className="w-full bg-kct-gold hover:bg-kct-yellow text-white font-semibold py-2 text-base">
                  {loading ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> {t('auth.forgotPassword.step2.submitting')}</>
                  ) : (
                    t('auth.forgotPassword.step2.submit')
                  )}
                </Button>
              </form>
            </>
          )}

          {/* Étape 3/3 */}
          {step === 'nouveau-mot-de-passe' && (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-kct-noir">{t('auth.forgotPassword.step3.title')}</h2>
                <p className="text-gray-600 mt-1">{t('auth.forgotPassword.step3.subtitle')}</p>
              </div>
              <form onSubmit={handleResetPassword} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-kct-noir font-medium">{t('auth.forgotPassword.step3.newPassword')}</Label>
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
                  <Label htmlFor="confirmPassword" className="text-kct-noir font-medium">{t('auth.forgotPassword.step3.confirmPassword')}</Label>
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
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> {t('auth.forgotPassword.step3.submitting')}</>
                  ) : (
                    t('auth.forgotPassword.step3.submit')
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
                <h2 className="text-2xl font-bold text-kct-noir">{t('auth.forgotPassword.done.title')}</h2>
                <p className="text-gray-600 mt-2">{t('auth.forgotPassword.done.message')}</p>
              </div>
              <Button onClick={() => navigate('/login')} className="w-full bg-kct-gold hover:bg-kct-yellow text-white font-semibold py-2 text-base">
                {t('auth.forgotPassword.done.backToLogin')}
              </Button>
            </div>
          )}

          {step !== 'done' && (
            <Link to="/login" className="flex items-center gap-2 text-sm text-kct-gold hover:underline font-medium mt-6 justify-center">
              <ArrowLeft className="h-4 w-4" /> {t('auth.forgotPassword.backToLogin')}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
