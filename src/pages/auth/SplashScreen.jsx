import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Sparkles } from 'lucide-react';

export function SplashScreen() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // If the user already visited or refreshed the page in this session, skip splash immediately
    const hasSeenSplash = sessionStorage.getItem('cmcart_splash_seen');
    if (hasSeenSplash) {
      const hasCompletedOnboarding = localStorage.getItem('cmcart_onboarded');
      if (!hasCompletedOnboarding) {
        navigate('/onboarding', { replace: true });
      } else if (user) {
        navigate('/home', { replace: true });
      } else {
        navigate('/home', { replace: true });
      }
      return;
    }

    // Mark as seen for this session so refresh does not show splash again
    sessionStorage.setItem('cmcart_splash_seen', 'true');

    // Smooth transition after 1.6s on first fresh launch
    const timer = setTimeout(() => {
      const hasCompletedOnboarding = localStorage.getItem('cmcart_onboarded');
      if (!hasCompletedOnboarding) {
        navigate('/onboarding');
      } else if (user) {
        navigate('/home');
      } else {
        navigate('/login');
      }
    }, 1600);

    return () => clearTimeout(timer);
  }, [navigate, user]);

  return (
    <div className="fixed inset-0 z-50 bg-white dark:bg-[#111111] flex flex-col items-center justify-between select-none p-8">
      <div className="w-full flex justify-end">
        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full">
          v2.0 PRO
        </span>
      </div>

      <div className="flex flex-col items-center animate-in fade-in zoom-in-95 duration-700 text-center">
        {/* Glowing Logo Icon */}
        <div className="relative w-28 h-28 sm:w-36 sm:h-36 mb-6">
          <div className="absolute inset-0 bg-[#E63946]/20 rounded-full blur-xl animate-pulse" />
          <img
            src="/logo.png"
            alt="CMCart"
            className="w-full h-full object-contain relative z-10 drop-shadow-md"
          />
        </div>

        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-neutral-900 dark:text-neutral-100">
          CM<span className="text-[#E63946]">Cart</span>
        </h1>
        <p className="text-xs sm:text-sm font-bold text-neutral-400 dark:text-neutral-500 mt-2 tracking-widest uppercase">
          India's Smart Commerce Destination
        </p>

        {/* Loading Spinner Dots */}
        <div className="flex items-center gap-1.5 mt-6">
          <div className="w-2 h-2 rounded-full bg-[#E63946] animate-bounce [animation-delay:-0.3s]" />
          <div className="w-2 h-2 rounded-full bg-[#E63946] animate-bounce [animation-delay:-0.15s]" />
          <div className="w-2 h-2 rounded-full bg-[#E63946] animate-bounce" />
        </div>
      </div>

      <div className="text-center text-xs text-neutral-400 dark:text-neutral-600 flex items-center gap-1.5">
        <Sparkles className="w-3.5 h-3.5 text-[#E63946]" />
        <span>100% Genuine • 24hr Express Delivery • Easy Returns</span>
      </div>
    </div>
  );
}
