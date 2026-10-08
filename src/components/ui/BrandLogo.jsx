import React from 'react';
import { Link } from 'react-router-dom';

export function BrandLogo({ size = 'md', to = '/', showText = true, className = '' }) {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-8 h-8 sm:w-9 sm:h-9',
    lg: 'w-11 h-11',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl sm:text-2xl',
    lg: 'text-2xl sm:text-3xl',
  };

  const content = (
    <div className={`inline-flex items-center gap-2 select-none group cursor-pointer ${className}`}>
      {/* CMCart Logo Icon from project assets */}
      <img
        src="/logo.png"
        alt="CMCart Logo Icon"
        className={`${iconSizes[size] || iconSizes.md} object-contain transition-transform duration-200 group-hover:scale-105 drop-shadow-xs`}
      />
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
