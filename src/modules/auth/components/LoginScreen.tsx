import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthContext } from '@/shared/auth/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Mail, Lock } from 'lucide-react';
import type { Login2FAResponse } from '@/modules/auth/types';

export function LoginScreen() {
  const { login, loading, error } = useAuthContext();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await login({ email, password });
      if (result && typeof result === 'object' && 'twoFactorRequired' in result) {
        const twoFA = result as Login2FAResponse;
        navigate('/verify-2fa', { state: { userId: twoFA.userId, email: twoFA.email } });
        return;
      }
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
          <img src="/kamer_cine_talents.jpg" alt="KAMER CINÉ TALENTS" className="w-14 h-14 rounded-xl object-cover shadow-lg" />
          <div>
            <h1 className="text-white font-bold text-xl leading-tight">KAMER CINÉ TALENTS</h1>
            <p className="text-kct-gold text-sm font-medium">Manager Web</p>
          </div>
        </div>

        <div className="relative z-10 space-y-6">
          <h2 className="text-white text-4xl font-bold leading-tight">
            Pilotage national de la<br />formation aux métiers<br />du cinéma
          </h2>
          <p className="text-gray-300 text-lg max-w-md">
            360 communes, 7 niveaux hiérarchiques, un seul outil pour
            orchestrer tout le programme de formation.
          </p>
          <div className="flex gap-8 pt-4">
            <div>
              <div className="text-3xl font-bold text-kct-gold">360</div>
              <div className="text-gray-400 text-sm">Communes</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-kct-gold">7</div>
              <div className="text-gray-400 text-sm">Niveaux</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-kct-gold">10</div>
              <div className="text-gray-400 text-sm">Régions</div>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-gray-500 text-sm">
          © 2026 KAMER CINÉ TALENTS — Tous droits réservés
        </div>
      </div>

      {/* Colonne droite — formulaire */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-kct-beige">
        <div className="w-full max-w-md">
          {/* Logo mobile */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <img src="/kamer_cine_talents.jpg" alt="KAMER CINÉ TALENTS" className="w-12 h-12 rounded-xl object-cover shadow-lg" />
            <div>
              <h1 className="text-kct-noir font-bold text-lg leading-tight">KAMER CINÉ TALENTS</h1>
              <p className="text-kct-gold text-sm font-medium">Manager Web</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-kct-noir">Connexion</h2>
            <p className="text-gray-600 mt-1">Accédez à votre espace de pilotage</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
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

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-kct-noir font-medium">Mot de passe</Label>
                <Link to="/forgot-password" className="text-sm text-kct-gold hover:underline font-medium">
                  Mot de passe oublié ?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
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
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Connexion...
                </>
              ) : (
                'Se connecter'
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Pas encore de compte ? Contactez l'administrateur de votre région.
          </p>
        </div>
      </div>
    </div>
  );
}
