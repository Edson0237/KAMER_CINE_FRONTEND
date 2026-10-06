import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuthContext } from '@/shared/auth/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Film, Loader2, ShieldCheck, ArrowLeft } from 'lucide-react';

export function TwoFactorScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyOtp, loading, error } = useAuthContext();
  const [code, setCode] = useState('');

  const state = location.state as { userId?: string; contexte?: string; identifiant?: string } | null;
  const userId = state?.userId;
  const contexte = state?.contexte;
  const identifiant = state?.identifiant;

  if (!userId || !contexte) {
    navigate('/login');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await verifyOtp({ userId, contexte, code });
      navigate('/dashboard');
    } catch {
      /* error géré par le contexte */
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
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-kct-gold/20 flex items-center justify-center">
              <ShieldCheck className="h-7 w-7 text-kct-gold" />
            </div>
            <h2 className="text-white text-4xl font-bold leading-tight whitespace-pre-line">
              {t('auth.twoFactor.brandingTitle')}
            </h2>
          </div>
          <p className="text-gray-300 text-lg max-w-md">
            {t('auth.twoFactor.brandingSubtitle')}
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

          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <ShieldCheck className="h-6 w-6 text-kct-gold" />
              <h2 className="text-2xl font-bold text-kct-noir">{t('auth.twoFactor.title')}</h2>
            </div>
            <p className="text-gray-600 mt-1">
              {identifiant ? t('auth.twoFactor.subtitleWithIdentifiant', { identifiant }) : t('auth.twoFactor.subtitleGeneric')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="code" className="text-kct-noir font-medium">{t('auth.twoFactor.codeLabel')}</Label>
              <Input
                id="code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="123456"
                maxLength={6}
                required
                className="bg-white border-gray-300 text-center text-2xl tracking-[0.5em] font-bold py-3"
              />
            </div>

            {error && (
              <p className="text-sm text-kct-red bg-kct-red/10 p-3 rounded-md border border-kct-red/20">{error}</p>
            )}

            <Button type="submit" disabled={loading || code.length !== 6} className="w-full bg-kct-gold hover:bg-kct-yellow text-white font-semibold py-2 text-base">
              {loading ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> {t('auth.twoFactor.submitting')}</>
              ) : (
                t('auth.twoFactor.submit')
              )}
            </Button>
          </form>

          <Link to="/login" className="flex items-center gap-2 text-sm text-kct-gold hover:underline font-medium mt-6 justify-center">
            <ArrowLeft className="h-4 w-4" /> {t('auth.twoFactor.backToLogin')}
          </Link>
        </div>
      </div>
    </div>
  );
}
