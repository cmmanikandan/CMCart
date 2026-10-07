import React from 'react';

export function Price({
  currentPrice,
  originalPrice,
  discountPercentage,
  size = 'md', // 'sm' | 'md' | 'lg' | 'xl'
  showDiscount = true,
  className = '',
}) {
  const currentFormatted = `₹${Number(currentPrice || 0).toLocaleString('en-IN')}`;
  const originalFormatted = originalPrice ? `₹${Number(originalPrice).toLocaleString('en-IN')}` : null;

  const calculatedDiscount =
    discountPercentage ||
    (originalPrice && currentPrice && originalPrice > currentPrice
      ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
      : null);

  const sizeStyles = {
    sm: {
      current: 'text-sm font-bold text-neutral-900 dark:text-neutral-100',
      original: 'text-xs text-neutral-500 dark:text-neutral-400 line-through',
      discount: 'text-[11px] font-semibold text-[#16A34A]',
    },
    md: {
      current: 'text-base sm:text-lg font-bold text-neutral-900 dark:text-neutral-100',
      original: 'text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 line-through',
      discount: 'text-xs sm:text-sm font-semibold text-[#16A34A]',
    },
    lg: {
      current: 'text-xl sm:text-2xl font-extrabold text-neutral-900 dark:text-neutral-100',
      original: 'text-sm sm:text-base text-neutral-500 dark:text-neutral-400 line-through',
      discount: 'text-sm sm:text-base font-bold text-[#16A34A]',
    },
    xl: {
      current: 'text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-neutral-100',
      original: 'text-base sm:text-lg text-neutral-500 dark:text-neutral-400 line-through',
      discount: 'text-base sm:text-lg font-bold text-[#16A34A]',
    },
  };

  const currentSize = sizeStyles[size] || sizeStyles.md;

  return (
    <div className={`flex flex-wrap items-baseline gap-1.5 sm:gap-2 select-none ${className}`}>
      <span className={currentSize.current}>{currentFormatted}</span>
      {originalFormatted && Number(originalPrice) > Number(currentPrice) && (
        <span className={currentSize.original}>{originalFormatted}</span>
      )}
      {showDiscount && calculatedDiscount > 0 && (
        <span className={currentSize.discount}>{calculatedDiscount}% OFF</span>
      )}
    </div>
  );
}
