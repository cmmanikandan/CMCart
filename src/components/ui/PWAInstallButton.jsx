import React, { useState, useEffect } from 'react';
import { Smartphone } from 'lucide-react';

export function PWAInstallButton({ variant = 'outline', className = '' }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isStandaloneApp, setIsStandaloneApp] = useState(() => {
    if (typeof window === 'undefined') return false;
    return (
      (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
      window.navigator.standalone === true ||
      document.referrer.includes('android-app://') ||
      localStorage.getItem('cmcart_pwa_installed') === 'true'
    );
  });

  useEffect(() => {
    // Check if already in standalone PWA window
    const checkStandalone = () => {
      const isStandalone =
        (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
        window.navigator.standalone === true ||
        document.referrer.includes('android-app://') ||
        localStorage.getItem('cmcart_pwa_installed') === 'true';
      setIsStandaloneApp(isStandalone);
    };

    checkStandalone();

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstallable(false);
      setIsStandaloneApp(true);
      setDeferredPrompt(null);
      try {
        localStorage.setItem('cmcart_pwa_installed', 'true');
      } catch (e) {
        console.error(e);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // DO NOT show install button if app is already installed or running as standalone PWA
  if (isStandaloneApp) {
    return null;
  }

  // If browser does not support install prompt and is not installable, don't show
  if (!isInstallable && !deferredPrompt) {
    return null;
  }

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      alert('To install CMCart App: Tap your browser menu (⋮ or Share) and select "Add to Home Screen" or "Install CMCart".');
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstallable(false);
      setIsStandaloneApp(true);
      try {
        localStorage.setItem('cmcart_pwa_installed', 'true');
      } catch (e) {
        console.error(e);
      }
    }
    setDeferredPrompt(null);
  };

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
