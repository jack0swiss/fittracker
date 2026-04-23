import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(() =>
    localStorage.getItem('fittracker-install-dismissed') === '1',
  );

  useEffect(() => {
    function handler(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    }
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (!deferredPrompt || dismissed) return null;

  async function handleInstall() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === 'accepted') setDeferredPrompt(null);
  }

  function handleDismiss() {
    setDismissed(true);
    localStorage.setItem('fittracker-install-dismissed', '1');
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-primary/40 bg-primary/5 px-4 py-3 text-sm">
      <div className="flex items-center gap-3">
        <Download className="h-4 w-4 shrink-0 text-primary" />
        <div>
          <p className="font-medium">App installieren</p>
          <p className="text-xs text-muted-foreground">
            FitTracker als App speichern – offline verfügbar.
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          onClick={handleInstall}
          className="h-9 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground"
        >
          Installieren
        </button>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Schließen"
          className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-accent"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
