import { useState, useEffect } from 'react';
import { WifiOff, X } from 'lucide-react';

export function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setDismissed(false);
    };
    const handleOffline = () => {
      setIsOnline(false);
      setDismissed(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline || dismissed) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-kct-red text-white px-4 py-2.5 flex items-center justify-between gap-3 shadow-lg">
      <div className="flex items-center gap-2 text-sm font-medium">
        <WifiOff className="h-4 w-4 shrink-0" />
        <span>Connexion perdue — vos saisies en cours ne sont pas sauvegardées. Contrairement à l'app mobile, le web ne conserve pas les formulaires hors-ligne.</span>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="p-1 rounded hover:bg-white/20 transition-colors shrink-0"
        aria-label="Fermer"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
