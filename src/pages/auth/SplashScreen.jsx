import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Sparkles } from 'lucide-react';

export function SplashScreen({ onFinish }) {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // If onFinish callback is provided (used as startup splash overlay in App)
    const timer = setTimeout(() => {
      if (onFinish) {
        onFinish();
      } else {
        const hasCompletedOnboarding = localStorage.getItem('cmcart_onboarded');
        if (!hasCompletedOnboarding) {
          navigate('/onboarding', { replace: true });
        } else if (user) {
          navigate('/home', { replace: true });
        } else {
          navigate('/home', { replace: true });
        }
      }
    }, 1800);

    return () => clearTimeout(timer);
  }, [navigate, user, onFinish]);

  return (
    <div className="fixed inset-0 z-50 bg-white dark:bg-[#111111] flex flex-col items-center justify-between select-none p-8 animate-in fade-in duration-300">
      {/* Top Tag */}
      <div className="w-full flex justify-end">
        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-200/60 dark:border-emerald-900/40">
          PRO COMMERCE
        </span>
      </div>

      {/* Center Brand Showcase */}
      <div className="flex flex-col items-center animate-in zoom-in-95 duration-700 text-center">
        {/* Glowing Logo Icon */}
        <div className="relative w-28 h-28 sm:w-36 sm:h-36 mb-5">
          <div className="absolute inset-0 bg-[#E63946]/25 rounded-full blur-2xl animate-pulse" />
          <img
            src="/logo.png"
            alt="CMCart Logo"
            className="w-full h-full object-contain relative z-10 drop-shadow-lg"
          />
        </div>

        {/* Brand Name */}
        <h1
          style={{ fontFamily: "'Outfit', 'Plus Jakarta Sans', sans-serif" }}
          className="text-4xl sm:text-5xl font-black tracking-tight text-neutral-900 dark:text-neutral-50 flex items-center"
        >
          <span>CM</span>
          <span className="text-[#E63946] ml-1">Cart</span>
        </h1>

        {/* Tagline */}
        <p className="text-xs sm:text-sm font-bold text-neutral-400 dark:text-neutral-500 mt-2 tracking-widest uppercase">
          India's Smart Commerce Destination
        </p>

        {/* Bouncing Loader Dots */}
        <div className="flex items-center gap-2 mt-8">
          <div className="w-2.5 h-2.5 rounded-full bg-[#E63946] animate-bounce [animation-delay:-0.3s]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#E63946] animate-bounce [animation-delay:-0.15s]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#E63946] animate-bounce" />
        </div>
      </div>

      {/* Footer Assurance */}
      <div className="text-center text-xs text-neutral-400 dark:text-neutral-500 flex items-center gap-1.5 font-medium">
        <Sparkles className="w-3.5 h-3.5 text-[#E63946]" />
        <span>100% Genuine • Fast Express Delivery • Easy 7-Day Returns</span>
      </div>
    </div>
  );
}
