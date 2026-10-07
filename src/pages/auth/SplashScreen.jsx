import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export function SplashScreen() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // Elegant automatic transition after 1.6s
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
    <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center select-none p-6">
      <div className="flex flex-col items-center animate-in fade-in zoom-in-95 duration-700">
        {/* Centered CMCart Logo Icon from project assets */}
        <div className="w-28 h-28 sm:w-36 sm:h-36 mb-6">
          <img
            src="/logo.png"
            alt="CMCart"
            className="w-full h-full object-contain"
          />
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-neutral-900">
          CM<span className="text-[#E63946]">Cart</span>
        </h1>
        <p className="text-xs sm:text-sm font-medium text-neutral-400 mt-2 tracking-wide uppercase">
          Mass-Market E-Commerce
        </p>
      </div>

      <div className="absolute bottom-10 text-center text-xs text-neutral-400">
        <span>Fast • Reliable • Authentic</span>
      </div>
    </div>
  );
}
