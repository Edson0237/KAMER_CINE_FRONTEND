import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setDismissed(true);
  };

  if (!deferredPrompt || dismissed) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] bg-white dark:bg-gray-900 border border-kct-gold/30 rounded-xl shadow-xl p-4 max-w-xs animate-in slide-in-from-bottom-4">
      <div className="flex items-start gap-3">
        <div className="grid place-content-center w-10 h-10 rounded-lg bg-kct-gold/15 shrink-0">
          <Download className="h-5 w-5 text-kct-gold" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-kct-noir dark:text-gray-100">
            Installer l'application
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Accédez à KCT Manager plus rapidement depuis votre bureau.
          </p>
          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={handleInstall}
              className="text-xs font-semibold bg-kct-gold text-white px-3 py-1.5 rounded-md hover:bg-kct-yellow transition-colors"
            >
              Installer
            </button>
            <button
              onClick={handleDismiss}
              className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1.5 hover:text-kct-noir dark:hover:text-gray-200 transition-colors"
            >
              Plus tard
            </button>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="p-1 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors shrink-0"
          aria-label="Fermer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
