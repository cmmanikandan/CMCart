import React, { useState, useEffect } from 'react';
import { Download, Smartphone } from 'lucide-react';

export function PWAInstallButton({ variant = 'outline', className = '' }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstallable(false);
      setInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // Fallback instruction for browsers without direct prompt
      alert('To install CMCart App: tap your browser menu (⋮ or Share) and select "Add to Home Screen" or "Install CMCart".');
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstallable(false);
    }
    setDeferredPrompt(null);
  };

  if (installed) return null;

  return (
    <button
      onClick={handleInstallClick}
      title="Download CMCart App (PWA)"
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer select-none ${
        variant === 'primary'
          ? 'bg-[#E63946] text-white hover:bg-[#d62839] shadow-xs'
          : 'bg-white dark:bg-[#181818] border border-neutral-200 dark:border-neutral-700 hover:border-[#E63946] text-neutral-800 dark:text-neutral-200 hover:text-[#E63946]'
      } ${className}`}
    >
      <Smartphone className="w-3.5 h-3.5 text-[#E63946]" />
      <span>Install App</span>
    </button>
  );
}
