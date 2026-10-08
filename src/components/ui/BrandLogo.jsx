import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';

export function BrandLogo({ size = 'md', to = '/', showText = true, className = '' }) {
  const [imageError, setImageError] = useState(false);

  const iconSizes = {
    sm: 'w-8 h-8 sm:w-9 sm:h-9',
    md: 'w-10 h-10 sm:w-12 sm:h-12',
    lg: 'w-14 h-14 sm:w-16 sm:h-16',
    xl: 'w-20 h-20 sm:w-24 sm:h-24'
  };

  const textSizes = {
    sm: 'text-xl sm:text-2xl',
    md: 'text-2xl sm:text-3xl',
    lg: 'text-3xl sm:text-4xl',
    xl: 'text-4xl sm:text-5xl'
  };

  const content = (
    <div className={`inline-flex items-center gap-2.5 select-none group cursor-pointer ${className}`}>
      {/* CMCart Logo Icon from project assets or fallback badge */}
      {!imageError ? (
        <img
          src="/logo.png"
          alt="CMCart Logo"
          onError={() => setImageError(true)}
          className={`${iconSizes[size] || iconSizes.md} object-contain shrink-0 transition-transform duration-200 group-hover:scale-105 drop-shadow-sm`}
        />
      ) : (
        <div
          className={`${iconSizes[size] || iconSizes.md} rounded-2xl bg-gradient-to-tr from-[#E63946] to-rose-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-red-500/20`}
        >
          <ShoppingBag className="w-6 h-6 stroke-[2.5]" />
        </div>
      )}

      {showText && (
        <span
          style={{ fontFamily: "'Outfit', 'Plus Jakarta Sans', sans-serif" }}
          className={`font-black tracking-tight ${textSizes[size] || textSizes.md} flex items-center leading-none text-neutral-900 dark:text-white`}
        >
          <span className="tracking-tight">CM</span>
          <span className="text-[#E63946] tracking-tight ml-0.5">Cart</span>
        </span>
      )}
    </div>
  );

  if (to) {
    return <Link to={to}>{content}</Link>;
  }

  return content;
}
